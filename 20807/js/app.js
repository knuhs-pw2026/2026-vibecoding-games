// app.js - 군성제 주간(낮) 라이브 전광판 메인 컨트롤러

const App = {
  currentSort: "latest",
  searchQuery: "",
  billboardIndex: 0,
  billboardInterval: null,
  isBillboardPaused: false,

  init() {
    // 1. 하위 시스템 초기화
    StorageManager.init();
    AdminManager.init();
    FestivalEffects.init();

    // 2. 랜덤 닉네임 기본 생성
    this.generateRandomNickname();

    // 3. 메인 전광판 & 슬라이더 초기화
    this.initMainBillboard();

    // 4. 이벤트 리스너 등록
    this.setupEventListeners();

    // 5. 하단 피드 렌더링 및 통계
    this.renderMessages();
    this.updateStats();

    // 6. 백업 상태 알림
    this.updateBackupBadge();
    window.addEventListener("fest_data_changed", () => {
      this.updateStats();
      this.updateBackupBadge();
      this.updateMainBillboard();
    });
  },

  initMainBillboard() {
    this.updateMainBillboard();
    this.startBillboardAutoPlay();
  },

  startBillboardAutoPlay() {
    if (this.billboardInterval) clearInterval(this.billboardInterval);
    this.billboardInterval = setInterval(() => {
      if (!this.isBillboardPaused) {
        this.nextBillboardSlide(false);
      }
    }, 5500);
  },

  // 메인 전광판 카드 렌더링
  updateMainBillboard() {
    const container = document.getElementById("mainBillboardCard");
    const messages = StorageManager.getMessages();
    if (!container) return;

    if (messages.length === 0) {
      container.innerHTML = `
        <div class="billboard-empty">
          <div class="empty-emoji">☀️</div>
          <h3>아직 등록된 군성제 방명록이 없습니다</h3>
          <p>아래 입력창에서 첫 번째 메시지를 전광판에 띄워보세요!</p>
        </div>
      `;
      const ticker = document.getElementById("mainBillboardTicker");
      if (ticker) {
        ticker.textContent = "군성제 익명 방명록에 남겨진 메시지들이 실시간으로 전광판을 통해 무대에 송출됩니다 ✨";
      }
      return;
    }

    if (this.billboardIndex >= messages.length) {
      this.billboardIndex = 0;
    }

    const msg = messages[this.billboardIndex];
    const stickerObj = CONFIG.STICKERS.find(s => s.id === msg.sticker) || CONFIG.STICKERS[0];

    container.innerHTML = `
      <div class="stage-card ${msg.theme || 'theme-sunny-lemon'} ${msg.font || 'font-sans'}">
        <!-- 스티커 -->
        <div class="stage-card-sticker">${stickerObj.icon}</div>

        <!-- 상단 헤더 -->
        <div class="stage-card-header">
          <div class="stage-author-info">
            <span class="stage-avatar">🎪</span>
            <div>
              <div class="stage-author">${this.escapeHtml(msg.nickname)}</div>
              <div class="stage-meta">
                <span class="stage-time">${this.formatTimeAgo(msg.createdAt)}</span>
                ${msg.isPinned ? '<span class="pinned-tag">📌 고정</span>' : ''}
              </div>
            </div>
          </div>

          <!-- 관리자 즉시 삭제 버튼 -->
          <div class="stage-actions">
            ${AdminManager.isLoggedIn ? `
              <button class="btn btn-sm btn-danger" onclick="AdminManager.confirmAndDeleteMessage('${msg.id}')" title="관리자 삭제">
                🗑️ 전광판에서 즉시 삭제
              </button>
            ` : ''}
          </div>
        </div>

        <!-- 전광판 본문 텍스트 -->
        <div class="stage-card-body">
          <p class="stage-card-text">"${this.escapeHtml(msg.content)}"</p>
        </div>

        <!-- 전광판 하단 인디케이터 -->
        <div class="stage-card-footer">
          <div class="stage-hint">
            <span>☀️ 2026 군성제 실시간 라이브</span>
          </div>

          <div class="stage-slide-counter">
            <span class="current-idx">${this.billboardIndex + 1}</span> / <span>${messages.length}</span>
          </div>
        </div>
      </div>
    `;

    // 하단 롤링 전광판 티커 업데이트
    const ticker = document.getElementById("mainBillboardTicker");
    if (ticker) {
      ticker.textContent = messages.slice(0, 15).map(m => `[${m.nickname}] ${m.content}`).join("   ✨   ");
    }
  },

  nextBillboardSlide(manual = true) {
    const messages = StorageManager.getMessages();
    if (messages.length === 0) return;
    this.billboardIndex = (this.billboardIndex + 1) % messages.length;
    this.updateMainBillboard();
    if (manual) this.pauseTemporarily();
  },

  prevBillboardSlide() {
    const messages = StorageManager.getMessages();
    if (messages.length === 0) return;
    this.billboardIndex = (this.billboardIndex - 1 + messages.length) % messages.length;
    this.updateMainBillboard();
    this.pauseTemporarily();
  },

  pauseTemporarily() {
    this.isBillboardPaused = true;
    if (this.pauseTimer) clearTimeout(this.pauseTimer);
    this.pauseTimer = setTimeout(() => {
      this.isBillboardPaused = false;
    }, 8000);
  },

  togglePlayPause() {
    this.isBillboardPaused = !this.isBillboardPaused;
    const btn = document.getElementById("playPauseBtn");
    if (btn) {
      btn.innerHTML = this.isBillboardPaused ? "▶️ 재생" : "⏸️ 일시정지";
    }
    showToastMessage(this.isBillboardPaused ? "⏸️ 전광판 자동 슬라이드가 일시정지되었습니다." : "▶️ 전광판 자동 슬라이드가 재개되었습니다.");
  },

  // ==================== ✍️ 심플 전광판 퀵 입력 바 (닉네임 + 할말) ====================

  generateRandomNickname() {
    const adjs = CONFIG.NICKNAME_DATA.adjectives;
    const nouns = CONFIG.NICKNAME_DATA.nouns;
    const adj = adjs[Math.floor(Math.random() * adjs.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const full = `${adj} ${noun}`;

    const input = document.getElementById("quickNickname");
    if (input) {
      input.value = full;
    }
  },

  handleQuickInput(text) {
    const charCount = document.getElementById("quickCharCount");
    if (charCount) {
      charCount.textContent = `${text.length}/150`;
    }
  },

  handleQuickSubmit(e) {
    if (e) e.preventDefault();

    const nickInput = document.getElementById("quickNickname");
    const contentInput = document.getElementById("quickContent");

    if (!contentInput || !contentInput.value.trim()) {
      alert("전광판에 띄울 메시지를 입력해주세요!");
      contentInput?.focus();
      return;
    }

    const themes = ["theme-sunny-lemon", "theme-sky-blue", "theme-blossom-pink", "theme-fresh-mint", "theme-lavender-violet", "theme-pure-white"];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];

    const stickers = ["sticker-sparkle", "sticker-sun", "sticker-guitar", "sticker-heart", "sticker-balloon", "sticker-party", "sticker-clover"];
    const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];

    // 방명록 등록
    const newMessage = StorageManager.addMessage({
      nickname: nickInput?.value?.trim() || "익명의 군성인",
      content: contentInput.value.trim(),
      theme: randomTheme,
      font: "font-sans",
      sticker: randomSticker
    });

    // 입력창 비우기 및 랜덤 닉네임 새로 생성
    contentInput.value = "";
    this.generateRandomNickname();

    showToastMessage("✨ 군성제 전광판에 메시지가 송출되었습니다! (JSON 자동 백업 완료)");

    // 전광판을 방금 등록한 최신 메시지로 즉각 변경
    this.billboardIndex = 0;
    this.updateMainBillboard();
    this.renderMessages();
    this.updateStats();
    this.updateBackupBadge();
  },

  // ==================== 피드 & 검색/정렬 ====================
  setSort(sortType) {
    this.currentSort = sortType;
    document.querySelectorAll(".sort-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.sort === sortType);
    });
    this.renderMessages();
  },

  handleSearch(query) {
    this.searchQuery = (query || "").trim().toLowerCase();
    this.renderMessages();
  },

  updateStats() {
    const messages = StorageManager.getMessages();
    const elMsg = document.getElementById("statTotalMessages");
    if (elMsg) elMsg.textContent = messages.length.toLocaleString();
  },

  updateBackupBadge() {
    const badge = document.getElementById("headerBackupBadge");
    if (badge) {
      badge.innerHTML = `<span class="pulse-dot"></span> JSON 자동 백업 활성 (${new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })})`;
      badge.classList.add("saved-highlight");
      setTimeout(() => badge.classList.remove("saved-highlight"), 1500);
    }
  },

  // 하단 피드 목록 렌더링
  renderMessages() {
    const container = document.getElementById("guestbookFeed");
    if (!container) return;

    let messages = StorageManager.getMessages();

    // 검색어 필터링
    if (this.searchQuery) {
      messages = messages.filter(m => 
        (m.nickname && m.nickname.toLowerCase().includes(this.searchQuery)) ||
        (m.content && m.content.toLowerCase().includes(this.searchQuery))
      );
    }

    // 정렬 적용
    messages.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    if (messages.length === 0) {
      container.innerHTML = `
        <div class="empty-feed-state">
          <div class="empty-emoji">☀️</div>
          <h3>등록된 메시지가 없습니다</h3>
          <p>위 입력창에서 군성제 전광판에 첫 메시지를 띄워보세요!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = messages.map(msg => {
      const stickerObj = CONFIG.STICKERS.find(s => s.id === msg.sticker) || CONFIG.STICKERS[0];
      const timeAgo = this.formatTimeAgo(msg.createdAt);

      return `
        <div class="guest-card ${msg.theme || 'theme-sunny-lemon'} ${msg.font || 'font-sans'} ${msg.isPinned ? 'is-pinned' : ''}" 
             id="card_${msg.id}">
          
          <div class="card-sticker" title="${stickerObj.label}">${stickerObj.icon}</div>

          <div class="card-header">
            <div class="card-author-wrap">
              <span class="card-avatar">🎪</span>
              <div>
                <div class="card-author">${this.escapeHtml(msg.nickname)}</div>
                <div class="card-meta">
                  <span class="card-time">${timeAgo}</span>
                  ${msg.isPinned ? '<span class="pinned-tag">📌 고정</span>' : ''}
                </div>
              </div>
            </div>

            <div class="card-top-actions">
              ${AdminManager.isLoggedIn ? `
                <button class="btn-admin-action delete" onclick="AdminManager.confirmAndDeleteMessage('${msg.id}')" title="관리자 삭제">
                  🗑️ 삭제
                </button>
                <button class="btn-admin-action pin" onclick="AdminManager.togglePinMessage('${msg.id}')" title="상단 고정">
                  📌
                </button>
              ` : ''}
            </div>
          </div>

          <div class="card-body">
            <p class="card-text">${this.escapeHtml(msg.content)}</p>
          </div>

          <div class="card-footer">
            <span class="card-time-sub">${new Date(msg.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
            <button class="btn-footer-save" onclick="App.saveCardAsImage('${msg.id}')" title="카드 이미지 저장">
              <span>📸 카드 저장</span>
            </button>
          </div>

        </div>
      `;
    }).join("");
  },

  openBackupModal() {
    const modal = document.getElementById("backupModal");
    if (!modal) return;
    this.renderBackupSnapshotsList();
    modal.classList.add("active");
  },

  closeBackupModal() {
    const modal = document.getElementById("backupModal");
    if (modal) modal.classList.remove("active");
  },

  renderBackupSnapshotsList() {
    const container = document.getElementById("backupSnapshotsList");
    if (!container) return;

    const snapshots = StorageManager.getSnapshots();
    if (snapshots.length === 0) {
      container.innerHTML = `<p class="text-muted text-center py-2">보관된 자동 복원 지점이 없습니다.</p>`;
      return;
    }

    container.innerHTML = snapshots.map((s, i) => `
      <div class="snapshot-row">
        <div>
          <span class="badge-mini">${i === 0 ? '최신' : `#${i + 1}`}</span>
          <strong>${s.formattedTime}</strong>
          <span class="snapshot-detail">(${s.reason} · ${s.messageCount}건)</span>
        </div>
        <button class="btn btn-sm btn-outline-warning" onclick="App.handleRollbackFromUser('${s.id}')">
          ↩️ 복구
        </button>
      </div>
    `).join("");
  },

  handleRollbackFromUser(snapshotId) {
    if (confirm("이 시점으로 데이터를 복원하시겠습니까?")) {
      const res = StorageManager.rollbackSnapshot(snapshotId);
      if (res.success) {
        showToastMessage(`↩️ [${res.timestamp}] 상태로 데이터가 복원되었습니다.`);
        this.renderBackupSnapshotsList();
        this.renderMessages();
        this.updateStats();
        this.updateMainBillboard();
      } else {
        alert(res.msg);
      }
    }
  },

  handleFileImport(file, mode = "replace") {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const jsonContent = e.target.result;
      const res = StorageManager.importJSON(jsonContent, mode);
      if (res.success) {
        showToastMessage(`✔️ 백업 파일이 성공적으로 복원되었습니다. (${res.count}건 적용)`);
        this.closeBackupModal();
        this.renderMessages();
        this.updateStats();
        this.updateMainBillboard();
      } else {
        alert("백업 파일 복구 실패: " + res.msg);
      }
    };
    reader.readAsText(file);
  },

  saveCardAsImage(messageId) {
    const messages = StorageManager.getMessages();
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;

    const stickerObj = CONFIG.STICKERS.find(s => s.id === msg.sticker) || CONFIG.STICKERS[0];

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const width = 800;
    const height = 900;
    canvas.width = width;
    canvas.height = height;

    // 화사하고 청량한 주간 하늘 그라데이션 배경
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#bae6fd");
    bgGrad.addColorStop(0.5, "#e0f2fe");
    bgGrad.addColorStop(1, "#fdf4ff");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 3;
    ctx.roundRect(40, 40, width - 80, height - 80, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#0369a1";
    ctx.font = "bold 28px 'Pretendard', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("☀️ 2026 군성제 익명 방명록 ☀️", width / 2, 100);

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.strokeStyle = "rgba(14, 165, 233, 0.4)";
    ctx.lineWidth = 2;
    ctx.roundRect(70, 140, width - 140, height - 240, 20);
    ctx.fill();
    ctx.stroke();

    ctx.font = "55px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(stickerObj.icon, width - 100, 210);

    ctx.textAlign = "left";
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 32px 'Pretendard', sans-serif";
    ctx.fillText(`🎭 ${msg.nickname}`, 105, 205);

    ctx.fillStyle = "#0284c7";
    ctx.font = "bold 20px 'Pretendard', sans-serif";
    ctx.fillText(`${new Date(msg.createdAt).toLocaleDateString('ko-KR')}`, 105, 240);

    ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(105, 270);
    ctx.lineTo(width - 105, 270);
    ctx.stroke();

    ctx.fillStyle = "#1e293b";
    ctx.font = "26px 'Pretendard', sans-serif";
    this.wrapCanvasText(ctx, msg.content, 105, 330, width - 210, 42);

    ctx.fillStyle = "#64748b";
    ctx.font = "18px 'Pretendard', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("군성제의 소중한 순간을 함께 나누다 ✨", width / 2, height - 60);

    const imgUri = canvas.toDataURL("image/png");
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = imgUri;
    downloadAnchor.download = `군성제_방명록_${msg.nickname}_${Date.now()}.png`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToastMessage("📸 방명록 카드가 이미지(PNG)로 저장되었습니다!");
  },

  wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split("");
    let line = "";

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n];
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n];
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  },

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  },

  setupEventListeners() {
    const quickInput = document.getElementById("quickContent");
    if (quickInput) {
      quickInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.handleQuickSubmit();
        }
      });
    }

    const dropzone = document.getElementById("backupDropzone");
    const fileInput = document.getElementById("backupFileInput");

    if (dropzone && fileInput) {
      dropzone.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          const mode = document.querySelector("input[name='importMode']:checked")?.value || "replace";
          this.handleFileImport(e.target.files[0], mode);
        }
      });

      dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("drag-hover");
      });
      dropzone.addEventListener("dragleave", () => dropzone.classList.remove("drag-hover"));
      dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("drag-hover");
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          const mode = document.querySelector("input[name='importMode']:checked")?.value || "replace";
          this.handleFileImport(e.dataTransfer.files[0], mode);
        }
      });
    }

    const adminForm = document.getElementById("adminLoginForm");
    if (adminForm) {
      adminForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const pwd = document.getElementById("adminPasswordInput")?.value || "";
        const res = AdminManager.login(pwd);
        if (res.success) {
          document.getElementById("adminLoginModal")?.classList.remove("active");
          AdminManager.openDashboard();
        } else {
          alert(res.msg);
        }
      });
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-backdrop.active").forEach(m => m.classList.remove("active"));
      }
      if (e.altKey && (e.key === "a" || e.key === "A" || e.key === "ㅁ")) {
        e.preventDefault();
        if (AdminManager.isLoggedIn) {
          AdminManager.openDashboard();
        } else {
          AdminManager.showLoginModal();
        }
      }
    });
  },

  formatTimeAgo(isoString) {
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return new Date(isoString).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  },

  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};

function showToastMessage(msg) {
  const toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = "toast-bubble";
  toast.innerHTML = msg;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

if (typeof window !== "undefined") {
  window.App = App;
  window.showToastMessage = showToastMessage;
}
