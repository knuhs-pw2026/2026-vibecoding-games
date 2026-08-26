/* ==========================================================================
   School Mystery Detective Game - Climax Deduction Engine
   ========================================================================== */

import { DEDUCTION_PHASES, ENDINGS } from '../data/story.js';
import { audio } from './audio.js';
import { dialogue } from './dialogue.js';

class DeductionEngine {
  constructor() {
    this.modalEl = null;
    this.stepBadgeEl = null;
    this.questionTextEl = null;
    this.optionsListEl = null;
    this.currentStepIndex = 0;
    this.onEndingCallback = null;
  }

  init() {
    this.modalEl = document.getElementById("deduction-modal");
    this.stepBadgeEl = document.getElementById("deduction-step-badge");
    this.questionTextEl = document.getElementById("deduction-question-text");
    this.optionsListEl = document.getElementById("deduction-options-list");

    const closeBtn = document.getElementById("btn-close-deduction");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }
  }

  start(onEnding = null) {
    this.onEndingCallback = onEnding;
    this.currentStepIndex = 0;
    audio.playObjection();
    this.triggerObjectionBanner("진실을 밝힐 시간이다!");

    setTimeout(() => {
      if (this.modalEl) {
        this.modalEl.classList.add("active");
        this.renderStep();
      }
    }, 1000);
  }

  close() {
    audio.playClick();
    if (this.modalEl) {
      this.modalEl.classList.remove("active");
    }
  }

  renderStep() {
    const phase = DEDUCTION_PHASES[this.currentStepIndex];
    if (!phase) return;

    if (this.stepBadgeEl) {
      this.stepBadgeEl.textContent = `PHASE ${phase.step} / 3 - ${phase.title}`;
    }
    if (this.questionTextEl) {
      this.questionTextEl.textContent = phase.question;
    }

    if (!this.optionsListEl) return;
    this.optionsListEl.innerHTML = "";

    phase.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = "deduction-option-btn";
      btn.innerHTML = `
        <span class="option-num-badge">${idx + 1}</span>
        <span>${opt.text}</span>
      `;

      btn.onclick = () => {
        this.handleSelection(opt);
      };

      this.optionsListEl.appendChild(btn);
    });
  }

  handleSelection(option) {
    audio.playClick();

    if (this.currentStepIndex < 2) {
      // Step 1 or 2
      if (option.isCorrect) {
        audio.playSuccess();
        this.triggerObjectionBanner("정답입니다!");
        this.currentStepIndex++;
        setTimeout(() => this.renderStep(), 1000);
      } else {
        audio.playFail();
        alert(`❌ 논리적 오류: ${option.feedback}`);
      }
    } else {
      // Final Step 3: Suspect Accusation
      this.close();
      const endingKey = option.endingType || (option.isCorrect ? "true_ending" : "bad_minwoo");
      const endingData = ENDINGS[endingKey] || ENDINGS.true_ending;

      if (option.isCorrect) {
        audio.playObjection();
        this.triggerObjectionBanner("범인은 바로 당신이야!");
      } else {
        audio.playFail();
      }

      setTimeout(() => {
        this.showEndingScreen(endingData);
      }, 1200);
    }
  }

  triggerObjectionBanner(text = "이의 있음!") {
    const banner = document.getElementById("objection-banner");
    const container = document.querySelector(".game-container");

    if (banner) {
      banner.textContent = text;
      banner.classList.add("active");
      if (container) container.classList.add("shake-screen");

      setTimeout(() => {
        banner.classList.remove("active");
        if (container) container.classList.remove("shake-screen");
      }, 1200);
    }
  }

  showEndingScreen(endingData) {
    const endingScreen = document.getElementById("ending-screen");
    const endingBadge = document.getElementById("ending-badge");
    const endingTitle = document.getElementById("ending-title");
    const endingStory = document.getElementById("ending-story-text");

    if (endingBadge) {
      endingBadge.textContent = endingData.badge;
      endingBadge.style.color = endingData.type === "SUCCESS" ? "var(--accent-gold)" : "var(--accent-crimson)";
    }
    if (endingTitle) endingTitle.textContent = endingData.title;
    if (endingStory) {
      endingStory.innerHTML = endingData.story.trim().replace(/\n/g, "<br><br>");
    }

    if (endingScreen) {
      endingScreen.classList.remove("hidden");
    }

    if (this.onEndingCallback) {
      this.onEndingCallback(endingData);
    }
  }
}

export const deduction = new DeductionEngine();
