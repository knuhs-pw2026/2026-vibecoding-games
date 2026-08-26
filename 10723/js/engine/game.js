/* ==========================================================================
   School Mystery Detective Game - Master Orchestrator Engine
   ========================================================================== */

import { STORY_EVENTS } from '../data/story.js';
import { audio } from './audio.js';
import { dialogue } from './dialogue.js';
import { notebook } from './notebook.js';
import { investigation } from './investigation.js';
import { puzzle } from './puzzle.js';
import { deduction } from './deduction.js';

class GameMaster {
  constructor() {
    this.remainingMinutes = 15;
    this.timerInterval = null;
    this.rainCanvas = null;
    this.rainCtx = null;
    this.raindrops = [];
  }

  init() {
    // Initialize all sub-engines
    dialogue.init();
    notebook.init();
    puzzle.init();
    deduction.init();
    investigation.init();

    this.initRainCanvas();
    this.setupGlobalEvents();
  }

  initRainCanvas() {
    this.rainCanvas = document.getElementById("rain-canvas");
    if (!this.rainCanvas) return;

    this.rainCtx = this.rainCanvas.getContext("2d");

    const resizeCanvas = () => {
      this.rainCanvas.width = window.innerWidth;
      this.rainCanvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Generate raindrops
    for (let i = 0; i < 120; i++) {
      this.raindrops.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 8 + 6,
        opacity: Math.random() * 0.4 + 0.1
      });
    }

    const animateRain = () => {
      if (this.rainCtx) {
        this.rainCtx.clearRect(0, 0, this.rainCanvas.width, this.rainCanvas.height);
        this.rainCtx.strokeStyle = "rgba(148, 163, 184, 0.4)";
        this.rainCtx.lineWidth = 1.2;

        this.raindrops.forEach(drop => {
          this.rainCtx.beginPath();
          this.rainCtx.moveTo(drop.x, drop.y);
          this.rainCtx.lineTo(drop.x - 2, drop.y + drop.length);
          this.rainCtx.stroke();

          drop.y += drop.speed;
          drop.x -= 1;

          if (drop.y > this.rainCanvas.height) {
            drop.y = -drop.length;
            drop.x = Math.random() * this.rainCanvas.width;
          }
        });
      }
      requestAnimationFrame(animateRain);
    };

    animateRain();
  }

  setupGlobalEvents() {
    // Start Game Button
    const startBtn = document.getElementById("btn-start-game");
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        audio.playClick();
        audio.startMysteryBGM();
        document.getElementById("start-screen").classList.add("hidden");
        this.startIntro();
      });
    }

    // Restart Game from Ending
    const restartBtn = document.getElementById("btn-restart-game");
    if (restartBtn) {
      restartBtn.addEventListener("click", () => {
        location.reload();
      });
    }

    // Notebook Button in Header
    const notebookBtn = document.getElementById("btn-open-notebook");
    if (notebookBtn) {
      notebookBtn.addEventListener("click", () => notebook.open());
    }

    // Climax Deduction Button in Header
    const deductionBtn = document.getElementById("btn-start-deduction");
    if (deductionBtn) {
      deductionBtn.addEventListener("click", () => deduction.start());
    }

    // Audio Mute Toggle
    const muteBtn = document.getElementById("btn-toggle-sound");
    if (muteBtn) {
      muteBtn.addEventListener("click", () => {
        const isMuted = audio.toggleMute();
        muteBtn.textContent = isMuted ? "🔇" : "🔊";
      });
    }

    // Guide Modal
    const guideBtn = document.getElementById("btn-guide");
    const guideModal = document.getElementById("guide-modal");
    const closeGuideBtn = document.getElementById("btn-close-guide");
    if (guideBtn && guideModal) {
      guideBtn.addEventListener("click", () => {
        audio.playClick();
        guideModal.classList.add("active");
      });
    }
    if (closeGuideBtn && guideModal) {
      closeGuideBtn.addEventListener("click", () => {
        audio.playClick();
        guideModal.classList.remove("active");
      });
    }

    // Start Timer countdown
    this.startCountdownTimer();
  }

  startCountdownTimer() {
    const timerDisplay = document.getElementById("header-timer");
    let secondsLeft = 30 * 60; // 30 minutes

    this.timerInterval = setInterval(() => {
      if (secondsLeft > 0) {
        secondsLeft--;
        const mins = Math.floor(secondsLeft / 60);
        const secs = secondsLeft % 60;
        if (timerDisplay) {
          const currentMinute = 30 + Math.floor((30 * 60 - secondsLeft) / 60);
          timerDisplay.textContent = `21:${String(currentMinute).padStart(2, '0')} (남은 시간: ${mins}분 ${String(secs).padStart(2, '0')}초)`;
        }
      }
    }, 1000);
  }

  startIntro() {
    dialogue.playQueue(STORY_EVENTS.intro, () => {
      dialogue.playDialogue(
        "detective",
        "자, 먼저 2층 교무실과 다른 장소들을 샅샅이 조사하여 사건의 단서를 모으자!",
        [{
          text: "수사 개시! 🔍",
          icon: "🚀",
          onClick: () => {
            investigation.loadLocation("loc_teachers_room");
          }
        }]
      );
    });
  }
}

// Instantiate and start on load
window.addEventListener("DOMContentLoaded", () => {
  const game = new GameMaster();
  game.init();
});
