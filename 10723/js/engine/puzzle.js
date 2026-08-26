/* ==========================================================================
   School Mystery Detective Game - Keypad & Mini-game Puzzle Engine
   ========================================================================== */

import { audio } from './audio.js';
import { dialogue } from './dialogue.js';
import { notebook } from './notebook.js';

class PuzzleEngine {
  constructor() {
    this.modalEl = null;
    this.displayEl = null;
    this.currentCode = "";
    this.targetCode = "0140"; // (6 + 8) * 10 = 140 -> 0140
    this.isSolved = false;
    this.onSolveCallback = null;
  }

  init() {
    this.modalEl = document.getElementById("puzzle-modal");
    this.displayEl = document.getElementById("keypad-display");

    const closeBtn = document.getElementById("btn-close-puzzle");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    // Keypad number buttons
    document.querySelectorAll(".keypad-num").forEach(btn => {
      btn.addEventListener("click", () => {
        const val = btn.dataset.val;
        this.addDigit(val);
      });
    });

    // Clear and Submit
    const clearBtn = document.getElementById("btn-keypad-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        audio.playClick();
        this.currentCode = "";
        this.updateDisplay();
      });
    }

    const submitBtn = document.getElementById("btn-keypad-submit");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => this.checkCode());
    }
  }

  open(onSolve = null) {
    this.onSolveCallback = onSolve;
    this.currentCode = "";
    this.updateDisplay();
    audio.playClick();
    if (this.modalEl) {
      this.modalEl.classList.add("active");
    }
  }

  close() {
    audio.playClick();
    if (this.modalEl) {
      this.modalEl.classList.remove("active");
    }
  }

  addDigit(digit) {
    if (this.currentCode.length >= 4) return;
    audio.playClick();
    this.currentCode += digit;
    this.updateDisplay();

    if (this.currentCode.length === 4) {
      setTimeout(() => this.checkCode(), 200);
    }
  }

  updateDisplay() {
    if (this.displayEl) {
      this.displayEl.textContent = this.currentCode.padEnd(4, "-");
    }
  }

  checkCode() {
    if (this.currentCode === this.targetCode) {
      audio.playSuccess();
      this.isSolved = true;
      this.close();

      notebook.addClue("clue_safe_lock");

      dialogue.playDialogue(
        "detective",
        "철컥! [0140]을 입력하자 금고의 보조 잠금장치가 해제되었다! 탄소(6)와 산소(8)를 이용한 수학 퀴즈 암호가 맞았다.",
        [{
          text: "단서 확인하기",
          icon: "🔍",
          onClick: () => {
            if (this.onSolveCallback) this.onSolveCallback();
          }
        }]
      );
    } else {
      audio.playFail();
      if (this.displayEl) {
        this.displayEl.style.borderColor = "var(--accent-crimson)";
        this.displayEl.classList.add("shake-screen");
        setTimeout(() => {
          this.displayEl.style.borderColor = "var(--accent-blue)";
          this.displayEl.classList.remove("shake-screen");
          this.currentCode = "";
          this.updateDisplay();
        }, 600);
      }
    }
  }
}

export const puzzle = new PuzzleEngine();
