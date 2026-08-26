/**
 * game.js - 경북대사대부고 《검은 그늘 속에서》 코어 게임 인터랙션 엔진
 */

class GameEngine {
    constructor() {
        this.state = {
            currentScene: "prologue",
            checkpointScene: "classroom_start",
            contamination: 0,
            inventory: [],
            visitedScenes: [],
            hasRulebook: false,
            startTime: Date.now(),
            playerName: "경북대사대부고 학생",
            isTyping: false,
            currentFullText: ""
        };

        this.typingTimer = null;
        this.itemNames = {
            flashlight: "🔦 소형 손전등",
            rulesheet: "📜 찢어진 수칙서",
            uniform: "👔 사대부고 교복 (위장)",
            fountainpen: "🖋️ 2학년 만년필",
            studentcard: "🪪 사대부고 학생증",
            calming_pill: "💊 안정제",
            charm: "🧿 호신 부적(護)"
        };
    }

    init() {
        this.bindEvents();
        this.goToScene("prologue");
    }

    bindEvents() {
        // 사운드 토글
        const soundBtn = document.getElementById("btn-sound");
        if (soundBtn) {
            soundBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                window.soundEngine.init();
                const isMuted = window.soundEngine.toggleMute();
                soundBtn.innerHTML = isMuted ? "🔇 소리 OFF" : "🔊 소리 ON";
            });
        }

        // 수칙서 열기/닫기
        const ruleBtn = document.getElementById("btn-open-rules");
        const ruleModal = document.getElementById("rule-modal");
        const closeRuleBtn = document.getElementById("btn-close-rules");

        if (ruleBtn && ruleModal) {
            ruleBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.openRulebook();
            });
        }

        if (closeRuleBtn && ruleModal) {
            closeRuleBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                ruleModal.classList.remove("active");
            });
        }

        // 인증서 닫기
        const closeCertBtn = document.getElementById("btn-close-cert");
        const certModal = document.getElementById("cert-modal");
        if (closeCertBtn && certModal) {
            closeCertBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                certModal.classList.remove("active");
            });
        }

        // 스토리 카드 클릭/터치 시 스마트 진행 (스킵 또는 다음 씬 직행)
        const storyCard = document.getElementById("story-card");
        if (storyCard) {
            storyCard.addEventListener("click", (e) => {
                this.handleCardClick();
            });
        }

        // 키보드 Space/Enter 키로도 동일하게 진행
        window.addEventListener("keydown", (e) => {
            if (e.code === "Space" || e.code === "Enter") {
                this.handleCardClick();
            }
        });

        // 최초 유저 인터랙션 시 오디오 엔진 초기화
        document.body.addEventListener("click", () => {
            window.soundEngine.init();
        }, { once: true });
    }

    // 스토리 카드 클릭 시 인터랙션 (타이핑 스킵 or 다음 씬 자동 진행)
    handleCardClick() {
        const scene = STORY_DATA.scenes[this.state.currentScene];
        if (!scene) return;

        // 1. 아직 타이핑 중인 경우 -> 즉시 전체 텍스트 출력
        if (this.state.isTyping) {
            this.skipTyping();
            return;
        }

        // 2. 타이핑이 끝났고, 선택지가 1개만 있는 단일 분기 씬인 경우 -> 텍스트 클릭만으로 바로 다음 씬 진행!
        if (scene.choices && scene.choices.length === 1) {
            const singleChoice = scene.choices[0];
            this.triggerChoice(singleChoice, scene);
            return;
        }

        // 3. 다중 선택지가 있는 경우 -> 선택지 버튼 영역을 흔들어 선택을 유도
        const choicesContainer = document.getElementById("choices-container");
        if (choicesContainer) {
            choicesContainer.classList.remove("shake");
            void choicesContainer.offsetWidth; // Reflow 트리거
            choicesContainer.classList.add("shake");
        }
    }

    // 마크다운 볼드(**text**)를 HTML <strong>으로 변환
    formatText(raw) {
        if (!raw) return "";
        return raw.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #ff4d6d; font-weight: 800;">$1</strong>');
    }

    // 씬 전환 로직
    goToScene(sceneId) {
        const scene = STORY_DATA.scenes[sceneId];
        if (!scene) {
            console.error(`Scene not found: ${sceneId}`);
            return;
        }

        // 리다이렉트 조건 씬 처리
        if (typeof scene.redirect === 'function') {
            const nextSceneId = scene.redirect(this.state);
            this.goToScene(nextSceneId);
            return;
        }

        // 체크포인트 갱신
        if (scene.isCheckpoint) {
            this.state.checkpointScene = sceneId;
        }

        this.state.currentScene = sceneId;
        if (!this.state.visitedScenes.includes(sceneId)) {
            this.state.visitedScenes.push(sceneId);
        }

        // 씬 진입 트리거 실행
        if (typeof scene.onEnter === 'function') {
            scene.onEnter(this.state);
        }

        // UI 및 상태 갱신
        this.updateStatusUI(scene);
        this.renderTextAndChoices(scene);
    }

    // 상태 UI 업데이트
    updateStatusUI(scene) {
        // 위치명
        const locationEl = document.getElementById("location-name");
        if (locationEl) {
            locationEl.textContent = scene.location || "알 수 없는 구역";
        }

        // 오염도 수치 및 게이지
        const contamValEl = document.getElementById("contamination-val");
        const contamFillEl = document.getElementById("progress-fill");
        
        // 오염도 범위 제한 (0 ~ 100)
        this.state.contamination = Math.max(0, Math.min(100, this.state.contamination));

        if (contamValEl) {
            contamValEl.textContent = `${this.state.contamination}%`;
        }
        if (contamFillEl) {
            contamFillEl.style.width = `${this.state.contamination}%`;
        }

        // 오염도 비주얼 비네팅 효과 & 심장소리 연동
        this.updateEffects();

        // 인벤토리 목록 렌더링
        this.renderInventory();

        // 수칙서 버튼 활성화 여부
        const ruleBtn = document.getElementById("btn-open-rules");
        if (ruleBtn) {
            ruleBtn.style.display = (this.state.hasRulebook || this.state.inventory.includes("rulesheet")) ? "flex" : "none";
        }
    }

    // 시각 및 청각 효과 업데이트
    updateEffects() {
        const vignette = document.getElementById("vignette-layer");
        if (vignette) {
            vignette.className = "";
            if (this.state.contamination >= 85) {
                vignette.classList.add("vignette-critical");
            } else if (this.state.contamination >= 50) {
                vignette.classList.add("vignette-danger");
            } else if (this.state.contamination >= 25) {
                vignette.classList.add("vignette-warn");
            }
        }

        // 오디오 심장박동 갱신
        window.soundEngine.updateContaminationState(this.state.contamination);
    }

    // 인벤토리 렌더링
    renderInventory() {
        const invContainer = document.getElementById("inventory-container");
        if (!invContainer) return;

        invContainer.innerHTML = "";
        
        if (this.state.inventory.length === 0) {
            const emptySlot = document.createElement("div");
            emptySlot.className = "item-slot";
            emptySlot.textContent = "비어 있음";
            invContainer.appendChild(emptySlot);
            return;
        }

        this.state.inventory.forEach(itemId => {
            const slot = document.createElement("div");
            slot.className = "item-slot acquired";
            slot.textContent = this.itemNames[itemId] || itemId;
            invContainer.appendChild(slot);
        });
    }

    // 텍스트 타이핑 및 선택지 렌더링
    renderTextAndChoices(scene) {
        const storyTextEl = document.getElementById("story-text");
        const choicesContainer = document.getElementById("choices-container");
        const skipHintEl = document.getElementById("skip-hint");
        if (!storyTextEl || !choicesContainer) return;

        // 선택지 영역 초기화 및 숨김
        choicesContainer.innerHTML = "";
        choicesContainer.style.opacity = "0";

        if (skipHintEl) {
            skipHintEl.textContent = "💡 화면을 터치하면 텍스트가 즉시 완성됩니다.";
        }

        this.state.currentFullText = scene.text;
        this.state.isTyping = true;

        let charIndex = 0;
        storyTextEl.innerHTML = "";

        if (this.typingTimer) {
            clearInterval(this.typingTimer);
        }

        // 타자기 효과 (빠른 12ms)
        this.typingTimer = setInterval(() => {
            if (charIndex < this.state.currentFullText.length) {
                charIndex++;
                const currentSlice = this.state.currentFullText.substring(0, charIndex);
                storyTextEl.innerHTML = this.formatText(currentSlice);
                
                if (charIndex % 3 === 0) {
                    window.soundEngine.playTypewriter();
                }
            } else {
                this.finishTyping(scene);
            }
        }, 12);
    }

    // 타이핑 스킵
    skipTyping() {
        if (this.typingTimer) {
            clearInterval(this.typingTimer);
            this.typingTimer = null;
        }
        const storyTextEl = document.getElementById("story-text");
        const scene = STORY_DATA.scenes[this.state.currentScene];
        if (storyTextEl && scene) {
            storyTextEl.innerHTML = this.formatText(scene.text);
            this.finishTyping(scene);
        }
    }

    // 타이핑 완료 후 선택지 표시
    finishTyping(scene) {
        if (this.typingTimer) {
            clearInterval(this.typingTimer);
            this.typingTimer = null;
        }
        this.state.isTyping = false;
        
        const storyTextEl = document.getElementById("story-text");
        const skipHintEl = document.getElementById("skip-hint");
        if (storyTextEl && scene) {
            storyTextEl.innerHTML = this.formatText(scene.text);
        }

        // 하단 안내 힌트 갱신
        if (skipHintEl) {
            if (scene.choices && scene.choices.length === 1) {
                skipHintEl.innerHTML = "<span style='color: #2dd4bf; font-weight: 700;'>👉 화면 또는 아래 버튼을 터치하여 다음으로 진행</span>";
            } else {
                skipHintEl.textContent = "👇 아래 선택지 중 하나를 선택하세요.";
            }
        }

        const choicesContainer = document.getElementById("choices-container");
        if (!choicesContainer) return;

        choicesContainer.innerHTML = "";
        choicesContainer.style.opacity = "1";
        choicesContainer.classList.add("fade-in");

        if (scene.choices && scene.choices.length > 0) {
            scene.choices.forEach(choice => {
                // 선택지 조건 검증
                let isAvailable = true;
                if (typeof choice.condition === 'function') {
                    isAvailable = choice.condition(this.state);
                }

                if (!isAvailable) return;

                const btn = document.createElement("button");
                btn.className = `btn-choice ${choice.danger ? "danger" : ""}`;
                btn.innerHTML = `<span>${choice.text}</span><span class="choice-arrow">›</span>`;

                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    this.triggerChoice(choice, scene);
                });

                choicesContainer.appendChild(btn);
            });
        }
    }

    // 선택지 실행 처리 함수
    triggerChoice(choice, scene) {
        window.soundEngine.playSelect();
        
        // 커스텀 액션 실행 (예: 효과음, 체크포인트 로드 등)
        if (typeof choice.action === 'function') {
            choice.action(this);
        }

        // 인증서 모달 타겟 처리
        if (choice.target === "certificate_modal") {
            this.openCertificate(scene.endingType, scene.title);
            return;
        }

        // 리셋 처리
        if (choice.reset) {
            this.restartGame();
            return;
        }

        // 대상 씬으로 이동
        if (choice.target) {
            this.goToScene(choice.target);
        }
    }

    // 체크포인트 복구 (배드엔딩 후 재도전)
    loadCheckpoint() {
        this.state.contamination = Math.min(this.state.contamination, 30); // 재도전 시 오염도 30%로 완화
        this.goToScene(this.state.checkpointScene || "classroom_start");
    }

    // 완전 처음부터 재시작
    restartGame() {
        this.state.contamination = 0;
        this.state.inventory = [];
        this.state.visitedScenes = [];
        this.state.hasRulebook = false;
        this.state.startTime = Date.now();
        this.goToScene("prologue");
    }

    // 수칙서 모달 열람
    openRulebook() {
        const ruleModal = document.getElementById("rule-modal");
        const ruleListEl = document.getElementById("rule-list");
        if (!ruleModal || !ruleListEl) return;

        ruleListEl.innerHTML = "";
        STORY_DATA.rulebook.rules.forEach(rule => {
            const card = document.createElement("div");
            card.className = "rule-card";
            card.innerHTML = `
                <div class="rule-tag">${rule.num}</div>
                <div class="rule-desc">${rule.content}</div>
            `;
            ruleListEl.appendChild(card);
        });

        ruleModal.classList.add("active");
        window.soundEngine.playItemGet();
    }

    // 축제 탈출 성공 디지털 인증서 발급
    openCertificate(endingType, title) {
        const certModal = document.getElementById("cert-modal");
        if (!certModal) return;

        const isSecret = endingType === "secret";
        const elapsedSec = Math.floor((Date.now() - this.state.startTime) / 1000);
        const minutes = Math.floor(elapsedSec / 60);
        const seconds = elapsedSec % 60;
        const timeFormatted = `${minutes}분 ${seconds < 10 ? '0' : ''}${seconds}초`;
        
        // 6자리 위조 방지 랜덤 코드 생성
        const randomCode = "KNU-" + Math.floor(100000 + Math.random() * 900000);

        document.getElementById("cert-rank").textContent = isSecret ? "SPECIAL (전설)" : "GRADE 1 (성공)";
        document.getElementById("cert-title-text").textContent = isSecret ? "전설의 탈출왕 인증서" : "학교 축제 탈출 성공 증명서";
        document.getElementById("cert-badge-text").textContent = isSecret ? "👑 LEGENDARY ESCAPER" : "🏆 SURVIVOR";
        document.getElementById("cert-time").textContent = timeFormatted;
        document.getElementById("cert-contam").textContent = `${this.state.contamination}%`;
        document.getElementById("cert-code").textContent = randomCode;

        certModal.classList.add("active");
        window.soundEngine.playVictory();
    }
}

// 전역 인스턴스 생성 및 실행
window.addEventListener("DOMContentLoaded", () => {
    window.game = new GameEngine();
    window.game.init();
});
