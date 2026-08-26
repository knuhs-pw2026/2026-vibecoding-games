/**
 * [방탈출 / 텍스트 어드벤처] 메인 게임 엔진 (Game Engine)
 */

class EscapeGame {
  constructor() {
    this.storyData = window.STORY_DATA;
    this.sound = window.soundEngine;
    this.inventory = new window.InventoryManager(this);
    this.puzzle = new window.PuzzleManager(this);

    this.currentSceneId = "classroom_start";
    this.flags = {};
    this.timeRemaining = 1800; // 30분
    this.tension = 20;
    this.timerInterval = null;
    this.historyLog = [];

    // 타이핑 엔진 상태
    this.typingSpeed = 22; // ms per char
    this.isTyping = false;
    this.typewriterTimeout = null;
    this.fullTextToDisplay = "";

    // 설정 상태
    this.settings = {
      crtEffect: true,
      soundEnabled: true,
      volume: 60,
      typingSpeed: "normal" // fast: 10, normal: 22, instant: 0
    };

    this.init();
  }

  init() {
    this.loadSettings();
    this.resetState();
    this.setupEventListeners();
    this.startTimer();
    this.loadScene("classroom_start", false);
  }

  // 상태 초기화
  resetState() {
    const init = this.storyData.initialState;
    this.currentSceneId = init.currentSceneId;
    this.timeRemaining = init.timeRemaining;
    this.tension = init.tension;
    this.flags = JSON.parse(JSON.stringify(init.flags));
    this.inventory.items = [];
    this.inventory.selectedItem = null;
    this.historyLog = [];
    this.inventory.render();
  }

  // 프록시 메서드
  addItem(itemId) {
    return this.inventory.addItem(itemId);
  }

  removeItem(itemId) {
    return this.inventory.removeItem(itemId);
  }

  hasItem(itemId) {
    return this.inventory.hasItem(itemId);
  }

  // --------------------------------------------------------------------------
  // 1. 씬 로드 및 화면 렌더링
  // --------------------------------------------------------------------------
  loadScene(sceneId, isHistorical = false) {
    const scene = this.storyData.scenes[sceneId];
    if (!scene) {
      console.error(`[Game] 존재하지 않는 씬 ID: ${sceneId}`);
      return;
    }

    this.currentSceneId = sceneId;

    // 방문한 방 목록 업데이트
    if (!this.flags.visitedRooms.includes(sceneId)) {
      this.flags.visitedRooms.push(sceneId);
    }

    // 1. 위치 헤더 갱신
    const locElem = document.getElementById("hud-location-name");
    const floorElem = document.getElementById("hud-floor-name");
    if (locElem) locElem.textContent = scene.locationName;
    if (floorElem) floorElem.textContent = scene.floor;

    // 2. 배경 이미지 갱신
    const bgElem = document.getElementById("scene-background");
    if (bgElem && scene.backgroundImage) {
      bgElem.style.opacity = "0.2";
      setTimeout(() => {
        bgElem.src = scene.backgroundImage;
        bgElem.style.opacity = "1";
      }, 150);
    }

    // 3. 핫스팟(상호작용 핀) 렌더링
    this.renderHotspots(scene.hotspots || []);

    // 4. 화자 및 대사 텍스트 렌더링 (타이핑)
    const speakerElem = document.getElementById("dialogue-speaker");
    if (speakerElem) {
      speakerElem.textContent = scene.speaker || "독백";
    }

    let textContent = typeof scene.text === "function" ? scene.text(this) : scene.text;
    this.startTypewriter(textContent);

    // 5. 히스토리 로그 기록
    if (!isHistorical) {
      this.historyLog.push({
        sceneId: scene.id,
        location: scene.locationName,
        speaker: scene.speaker,
        text: textContent,
        timestamp: new Date().toLocaleTimeString()
      });
    }

    // 6. 선택지 버튼 렌더링
    this.renderChoices(scene.choices || []);

    // 7. 엔딩 처리
    if (scene.isEnding) {
      this.handleEnding(scene);
    }

    // 8. 오토세이브
    this.saveGame("autosave");
  }

  // 핫스팟 핀 렌더링
  renderHotspots(hotspots) {
    const container = document.getElementById("scene-hotspots-layer");
    if (!container) return;

    container.innerHTML = "";
    hotspots.forEach((hs) => {
      const pin = document.createElement("button");
      pin.className = "hotspot-pin pulse-animation";
      pin.style.left = `${hs.x}%`;
      pin.style.top = `${hs.y}%`;
      pin.innerHTML = `
        <span class="hotspot-icon">🔍</span>
        <span class="hotspot-tooltip">${hs.label}</span>
      `;

      pin.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.sound) this.sound.playClick();
        if (hs.targetScene) {
          this.loadScene(hs.targetScene);
        }
      });

      pin.addEventListener("mouseenter", () => {
        if (this.sound) this.sound.playHover();
      });

      container.appendChild(pin);
    });
  }

  // 타이핑 효과 엔진
  startTypewriter(rawText) {
    const textElem = document.getElementById("dialogue-text");
    if (!textElem) return;

    if (this.typewriterTimeout) {
      clearTimeout(this.typewriterTimeout);
    }

    this.fullTextToDisplay = rawText;
    textElem.innerHTML = "";
    this.isTyping = true;

    // 즉시 표시 모드인 경우
    if (this.typingSpeed === 0) {
      textElem.innerHTML = this.formatMarkup(rawText);
      this.isTyping = false;
      return;
    }

    let charIndex = 0;
    const formattedHtml = this.formatMarkup(rawText);

    // 마크업 태그가 포함되어 있으므로 안전한 텍스트 스트리밍
    const typeStep = () => {
      if (charIndex < rawText.length) {
        charIndex += 1;
        const currentSlice = rawText.slice(0, charIndex);
        textElem.innerHTML = this.formatMarkup(currentSlice) + `<span class="typing-cursor">▌</span>`;

        // 타건 사운드 (4글자마다 1번씩 출력하여 쾌적화)
        if (charIndex % 3 === 0 && this.sound) {
          this.sound.playTypewriter();
        }

        const nextDelay = rawText[charIndex - 1] === "\n" || rawText[charIndex - 1] === "." ? this.typingSpeed * 2.5 : this.typingSpeed;
        this.typewriterTimeout = setTimeout(typeStep, nextDelay);
      } else {
        textElem.innerHTML = formattedHtml;
        this.isTyping = false;
      }
    };

    typeStep();
  }

  // 타이핑 스킵 (클릭 시 전체 대사 즉시 출력)
  skipTypewriter() {
    if (this.isTyping) {
      if (this.typewriterTimeout) clearTimeout(this.typewriterTimeout);
      const textElem = document.getElementById("dialogue-text");
      if (textElem) {
        textElem.innerHTML = this.formatMarkup(this.fullTextToDisplay);
      }
      this.isTyping = false;
    }
  }

  // 텍스트 서식 변환 (볼드, 단서, 위험, 아이템 강조)
  formatMarkup(str) {
    return str
      .replace(/\n/g, "<br>")
      .replace(/\*\*(.*?)\*\*/g, '<strong class="highlight-gold">$1</strong>')
      .replace(/\[(.*?)\]/g, '<span class="highlight-tag">[$1]</span>');
  }

  // 선택지 렌더링
  renderChoices(choices) {
    const container = document.getElementById("dialogue-choices-container");
    if (!container) return;

    container.innerHTML = "";
    choices.forEach((choice, index) => {
      // 조건 검사
      let isVisible = true;
      let isDisabled = false;

      if (choice.condition) {
        isVisible = choice.condition(this);
      }

      if (!isVisible) return; // 조건 미충족 시 선택지 숨김

      const btn = document.createElement("button");
      btn.className = "choice-button";
      btn.innerHTML = `<span class="choice-num">${index + 1}</span> <span class="choice-label">${choice.text}</span>`;

      btn.addEventListener("click", () => {
        if (this.sound) this.sound.playClick();
        
        // 1. 커스텀 액션 실행 (플래그 변경 등)
        if (choice.action) {
          choice.action(this);
        }

        // 2. 퍼즐 트리거
        if (choice.triggerPuzzle) {
          if (choice.triggerPuzzle === "wire_puzzle") {
            this.puzzle.openWirePuzzle(choice.triggerPuzzle);
          } else {
            this.puzzle.openKeypad(choice.triggerPuzzle);
          }
          return;
        }

        // 3. 씬 이동
        if (choice.targetScene) {
          this.loadScene(choice.targetScene);
        }
      });

      btn.addEventListener("mouseenter", () => {
        if (this.sound) this.sound.playHover();
      });

      container.appendChild(btn);
    });
  }

  // --------------------------------------------------------------------------
  // 2. 엔딩 및 연출
  // --------------------------------------------------------------------------
  handleEnding(scene) {
    const endingModal = document.getElementById("ending-modal");
    if (!endingModal) return;

    document.getElementById("ending-title").textContent = scene.endingTitle || "탈출 완료";
    document.getElementById("ending-desc").innerHTML = this.formatMarkup(scene.text);

    const typeBadge = document.getElementById("ending-type-badge");
    if (typeBadge) {
      typeBadge.textContent = (scene.endingType || "normal").toUpperCase() + " ENDING";
      typeBadge.className = `ending-badge ending-${scene.endingType || "normal"}`;
    }

    // 소요 시간 및 수집률 계산
    const timeUsed = 1800 - this.timeRemaining;
    const minutes = Math.floor(timeUsed / 60);
    const seconds = timeUsed % 60;
    document.getElementById("ending-stat-time").textContent = `${minutes}분 ${seconds}초`;
    document.getElementById("ending-stat-items").textContent = `${this.inventory.items.length}개`;
    document.getElementById("ending-stat-clues").textContent = `${this.flags.truthDocumentFound ? "완료 (100%)" : "일반 (60%)"}`;

    setTimeout(() => {
      endingModal.classList.add("active");
      if (this.sound) this.sound.playUnlock();
    }, 1000);
  }

  // --------------------------------------------------------------------------
  // 3. 타이머 & 긴장도 관리
  // --------------------------------------------------------------------------
  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining -= 1;
        this.updateHUDTimer();

        // 5분 이하 남았을 때 심박수 긴장 사운드
        if (this.timeRemaining <= 300 && this.timeRemaining % 10 === 0 && this.sound) {
          this.sound.playHeartbeat();
        }

        // 시간 초과 시 배드엔딩
        if (this.timeRemaining === 0) {
          this.showToast("⏰ 시간 초과! 아침 순찰 경비원에게 발각되었습니다.");
          this.loadScene("bad_ending_darkness");
        }
      }
    }, 1000);
  }

  updateHUDTimer() {
    const timerElem = document.getElementById("hud-timer-display");
    if (!timerElem) return;

    const m = Math.floor(this.timeRemaining / 60);
    const s = this.timeRemaining % 60;
    const formatted = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    timerElem.textContent = formatted;

    if (this.timeRemaining < 300) {
      timerElem.classList.add("timer-urgent");
    } else {
      timerElem.classList.remove("timer-urgent");
    }
  }

  // --------------------------------------------------------------------------
  // 4. 토스트 알림 및 시각 효과
  // --------------------------------------------------------------------------
  showToast(message) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast-message slide-in";
    toast.innerHTML = `<span class="toast-bell">🔔</span> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  shakeScreen() {
    const app = document.getElementById("game-container");
    if (app) {
      app.classList.add("shake-effect");
      setTimeout(() => app.classList.remove("shake-effect"), 500);
    }
  }

  // --------------------------------------------------------------------------
  // 5. 세이브 & 로드 (LocalStorage)
  // --------------------------------------------------------------------------
  saveGame(slotName = "slot1") {
    const saveData = {
      currentSceneId: this.currentSceneId,
      timeRemaining: this.timeRemaining,
      tension: this.tension,
      flags: this.flags,
      items: this.inventory.items,
      savedAt: new Date().toLocaleString(),
      locationName: this.storyData.scenes[this.currentSceneId]?.locationName || "알 수 없는 장소"
    };

    localStorage.setItem(`school_escape_${slotName}`, JSON.stringify(saveData));
    if (slotName !== "autosave") {
      this.showToast(`💾 게임이 저장되었습니다. [${saveData.locationName}]`);
      if (this.sound) this.sound.playClick();
    }
  }

  loadGame(slotName = "slot1") {
    const raw = localStorage.getItem(`school_escape_${slotName}`);
    if (!raw) {
      this.showToast("❌ 저장된 데이터가 없습니다.");
      if (this.sound) this.sound.playError();
      return false;
    }

    try {
      const data = JSON.parse(raw);
      this.currentSceneId = data.currentSceneId;
      this.timeRemaining = data.timeRemaining;
      this.tension = data.tension || 20;
      this.flags = data.flags || {};
      this.inventory.items = data.items || [];
      this.inventory.selectedItem = null;
      this.inventory.render();

      this.loadScene(this.currentSceneId, false);
      this.showToast(`📂 데이터를 불러왔습니다: ${data.locationName}`);
      if (this.sound) this.sound.playUnlock();
      return true;
    } catch (e) {
      console.error(e);
      this.showToast("저장 파일이 손상되었습니다.");
      return false;
    }
  }

  restart() {
    // 엔딩 모달 닫기
    const endingModal = document.getElementById("ending-modal");
    if (endingModal) endingModal.classList.remove("active");

    this.resetState();
    this.startTimer();
    this.loadScene("classroom_start");
    this.showToast("🔄 게임을 처음부터 다시 시작합니다.");
  }

  // --------------------------------------------------------------------------
  // 6. UI 모달 & 이벤트 리스너
  // --------------------------------------------------------------------------
  setupEventListeners() {
    // 대화 박스 클릭 시 타이핑 스킵
    const dialogueBox = document.getElementById("dialogue-box");
    if (dialogueBox) {
      dialogueBox.addEventListener("click", () => {
        this.skipTypewriter();
      });
    }

    // 오디오 컨텍스트 첫 클릭 활성화 & 배경음 재생
    window.addEventListener("click", () => {
      if (this.sound && !this.sound.isAmbientPlaying) {
        this.sound.startAmbientDrone();
      }
    }, { once: true });

    // 상단 HUD 버튼들
    this.bindModalTrigger("btn-open-inventory", "inventory-modal");
    this.bindModalTrigger("btn-open-map", "map-modal");
    this.bindModalTrigger("btn-open-log", "log-modal", () => this.renderLogModal());
    this.bindModalTrigger("btn-open-save", "saveload-modal", () => this.renderSaveLoadModal());
    this.bindModalTrigger("btn-open-settings", "settings-modal");
    this.bindModalTrigger("btn-open-guide", "guide-modal");

    // 모든 모달 닫기 버튼 공통 바인딩
    document.querySelectorAll(".modal-close-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const modal = e.target.closest(".game-modal");
        if (modal) modal.classList.remove("active");
        if (this.sound) this.sound.playClick();
      });
    });

    // 모달 배경 클릭 시 닫기
    document.querySelectorAll(".game-modal").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("active");
        }
      });
    });

    // 사운드 음소거 토글
    const muteToggle = document.getElementById("setting-mute-toggle");
    if (muteToggle) {
      muteToggle.addEventListener("change", (e) => {
        this.settings.soundEnabled = !e.target.checked;
        if (this.sound) this.sound.setMute(e.target.checked);
        this.saveSettings();
      });
    }

    // 볼륨 슬라이더
    const volSlider = document.getElementById("setting-volume-slider");
    if (volSlider) {
      volSlider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10) / 100;
        this.settings.volume = parseInt(e.target.value, 10);
        if (this.sound) this.sound.setVolume(val);
        this.saveSettings();
      });
    }

    // CRT 필터 토글
    const crtToggle = document.getElementById("setting-crt-toggle");
    if (crtToggle) {
      crtToggle.addEventListener("change", (e) => {
        this.settings.crtEffect = e.target.checked;
        const crtOverlay = document.getElementById("crt-screen-overlay");
        if (crtOverlay) {
          crtOverlay.style.display = e.target.checked ? "block" : "none";
        }
        this.saveSettings();
      });
    }

    // 타이핑 속도 선택
    const speedSelect = document.getElementById("setting-speed-select");
    if (speedSelect) {
      speedSelect.addEventListener("change", (e) => {
        this.settings.typingSpeed = e.target.value;
        if (e.target.value === "fast") this.typingSpeed = 10;
        else if (e.target.value === "normal") this.typingSpeed = 22;
        else if (e.target.value === "instant") this.typingSpeed = 0;
        this.saveSettings();
      });
    }
  }

  bindModalTrigger(btnId, modalId, onOpenCallback) {
    const btn = document.getElementById(btnId);
    const modal = document.getElementById(modalId);
    if (btn && modal) {
      btn.addEventListener("click", () => {
        if (onOpenCallback) onOpenCallback();
        modal.classList.add("active");
        if (this.sound) this.sound.playClick();
      });
    }
  }

  // 대화 기록(Log) 모달 렌더링
  renderLogModal() {
    const logList = document.getElementById("log-modal-content");
    if (!logList) return;

    logList.innerHTML = "";
    if (this.historyLog.length === 0) {
      logList.innerHTML = "<p>기록된 대화가 없습니다.</p>";
      return;
    }

    this.historyLog.forEach((item) => {
      const entry = document.createElement("div");
      entry.className = "log-entry";
      entry.innerHTML = `
        <div class="log-meta">
          <span class="log-location">📍 ${item.location}</span>
          <span class="log-speaker">[${item.speaker}]</span>
          <span class="log-time">${item.timestamp}</span>
        </div>
        <div class="log-text">${this.formatMarkup(item.text)}</div>
      `;
      logList.appendChild(entry);
    });

    logList.scrollTop = logList.scrollHeight;
  }

  // 세이브/로드 모달 렌더링
  renderSaveLoadModal() {
    ["slot1", "slot2", "slot3"].forEach((slot) => {
      const slotElem = document.getElementById(`save-${slot}-info`);
      const raw = localStorage.getItem(`school_escape_${slot}`);
      if (slotElem) {
        if (raw) {
          const data = JSON.parse(raw);
          slotElem.innerHTML = `
            <div class="slot-title">${data.locationName}</div>
            <div class="slot-date">🕒 ${data.savedAt}</div>
          `;
        } else {
          slotElem.innerHTML = `<div class="slot-empty">빈 슬롯 (저장 없음)</div>`;
        }
      }

      const saveBtn = document.getElementById(`btn-save-${slot}`);
      const loadBtn = document.getElementById(`btn-load-${slot}`);
      if (saveBtn) {
        saveBtn.onclick = () => {
          this.saveGame(slot);
          this.renderSaveLoadModal();
        };
      }
      if (loadBtn) {
        loadBtn.onclick = () => {
          if (this.loadGame(slot)) {
            const modal = document.getElementById("saveload-modal");
            if (modal) modal.classList.remove("active");
          }
        };
      }
    });
  }

  // 설정 저장 및 로드
  saveSettings() {
    localStorage.setItem("school_escape_settings", JSON.stringify(this.settings));
  }

  loadSettings() {
    const raw = localStorage.getItem("school_escape_settings");
    if (raw) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(raw) };
      } catch (e) {}
    }
  }
}

// 게임 시작
window.addEventListener("DOMContentLoaded", () => {
  window.game = new EscapeGame();
});
