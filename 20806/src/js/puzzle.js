/**
 * [방탈출 / 텍스트 어드벤처] 퍼즐 & 기믹 엔진
 */

class PuzzleManager {
  constructor(game) {
    this.game = game;
    this.currentPuzzle = null;
    this.enteredCode = "";
    this.wireSequence = [];
    this.setupEventListeners();
  }

  setupEventListeners() {
    // 키패드 번호 버튼 클릭 이벤트
    const keypadButtons = document.querySelectorAll(".keypad-btn[data-num]");
    keypadButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.appendDigit(btn.dataset.num);
      });
    });

    // 키패드 클리어 버튼
    const clearBtn = document.getElementById("keypad-btn-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.clearCode();
      });
    }

    // 키패드 제출 버튼
    const submitBtn = document.getElementById("keypad-btn-submit");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        this.submitKeypad();
      });
    }

    // 물리 키보드 숫자 입력 지원
    window.addEventListener("keydown", (e) => {
      const modal = document.getElementById("keypad-modal");
      if (modal && modal.classList.contains("active")) {
        if (/^[0-9]$/.test(e.key)) {
          this.appendDigit(e.key);
        } else if (e.key === "Backspace" || e.key === "Delete") {
          this.popDigit();
        } else if (e.key === "Enter") {
          this.submitKeypad();
        } else if (e.key === "Escape") {
          this.closeKeypad();
        }
      }
    });

    // 전선 퍼즐 슬롯 초기화
    const wireButtons = document.querySelectorAll(".wire-source");
    wireButtons.forEach((wire) => {
      wire.addEventListener("click", () => {
        this.handleWireClick(wire.dataset.color);
      });
    });

    const wireResetBtn = document.getElementById("wire-reset-btn");
    if (wireResetBtn) {
      wireResetBtn.addEventListener("click", () => {
        this.resetWirePuzzle();
      });
    }
  }

  // --------------------------------------------------------------------------
  // 1. 키패드 퍼즐 (Keypad)
  // --------------------------------------------------------------------------
  openKeypad(puzzleId) {
    const puzzle = window.STORY_DATA.puzzles[puzzleId];
    if (!puzzle) return;

    this.currentPuzzle = puzzle;
    this.enteredCode = "";

    const modal = document.getElementById("keypad-modal");
    document.getElementById("keypad-title").textContent = puzzle.title;
    document.getElementById("keypad-subtitle").textContent = puzzle.subtitle;
    
    this.updateKeypadDisplay();
    modal.classList.add("active");

    if (window.soundEngine) window.soundEngine.playClick();
  }

  closeKeypad() {
    const modal = document.getElementById("keypad-modal");
    if (modal) modal.classList.remove("active");
    this.currentPuzzle = null;
    this.enteredCode = "";
  }

  appendDigit(digit) {
    if (!this.currentPuzzle) return;
    if (this.enteredCode.length < this.currentPuzzle.length) {
      this.enteredCode += digit;
      if (window.soundEngine) window.soundEngine.playKeypad(digit);
      this.updateKeypadDisplay();
    }
  }

  popDigit() {
    if (this.enteredCode.length > 0) {
      this.enteredCode = this.enteredCode.slice(0, -1);
      if (window.soundEngine) window.soundEngine.playClick();
      this.updateKeypadDisplay();
    }
  }

  clearCode() {
    this.enteredCode = "";
    if (window.soundEngine) window.soundEngine.playClick();
    this.updateKeypadDisplay();
  }

  updateKeypadDisplay() {
    const display = document.getElementById("keypad-display-text");
    if (!display || !this.currentPuzzle) return;

    let displayStr = "";
    for (let i = 0; i < this.currentPuzzle.length; i++) {
      if (i < this.enteredCode.length) {
        displayStr += this.enteredCode[i] + " ";
      } else {
        displayStr += "_ ";
      }
    }
    display.textContent = displayStr.trim();
  }

  submitKeypad() {
    if (!this.currentPuzzle) return;

    const display = document.getElementById("keypad-display");
    const isCorrect =
      this.enteredCode === this.currentPuzzle.correctAnswer ||
      (this.currentPuzzle.alternateAnswers &&
        this.currentPuzzle.alternateAnswers.includes(this.enteredCode));

    if (isCorrect) {
      if (window.soundEngine) window.soundEngine.playUnlock();
      display.classList.add("success");
      setTimeout(() => {
        display.classList.remove("success");
        const puzzle = this.currentPuzzle;
        this.closeKeypad();
        if (puzzle.onSuccess) {
          puzzle.onSuccess(this.game);
        }
      }, 700);
    } else {
      if (window.soundEngine) window.soundEngine.playError();
      display.classList.add("shake-error");
      setTimeout(() => {
        display.classList.remove("shake-error");
        this.clearCode();
      }, 500);
    }
  }

  // --------------------------------------------------------------------------
  // 2. 전선 배선 퍼즐 (Wire Fuse Box)
  // --------------------------------------------------------------------------
  openWirePuzzle(puzzleId = "wire_puzzle") {
    const puzzle = window.STORY_DATA.puzzles[puzzleId];
    if (!puzzle) return;

    this.currentPuzzle = puzzle;
    this.wireSequence = [];

    const modal = document.getElementById("wire-puzzle-modal");
    document.getElementById("wire-puzzle-title").textContent = puzzle.title;
    document.getElementById("wire-puzzle-subtitle").textContent = puzzle.subtitle;

    this.renderWirePuzzleState();
    modal.classList.add("active");
    if (window.soundEngine) window.soundEngine.playClick();
  }

  closeWirePuzzle() {
    const modal = document.getElementById("wire-puzzle-modal");
    if (modal) modal.classList.remove("active");
    this.currentPuzzle = null;
    this.wireSequence = [];
  }

  handleWireClick(color) {
    if (!this.currentPuzzle || this.currentPuzzle.type !== "wire") return;

    if (this.wireSequence.includes(color)) {
      this.game.showToast("이미 연결된 전선입니다. 초기화 후 다시 시도하세요.");
      if (window.soundEngine) window.soundEngine.playClick();
      return;
    }

    this.wireSequence.push(color);
    if (window.soundEngine) window.soundEngine.playClick();
    this.renderWirePuzzleState();

    // 4개 전선이 모두 연결되었을 때 검증
    if (this.wireSequence.length === 4) {
      const correct = this.currentPuzzle.correctOrder;
      const isMatch = this.wireSequence.every((val, index) => val === correct[index]);

      const board = document.getElementById("wire-board");
      if (isMatch) {
        if (window.soundEngine) window.soundEngine.playUnlock();
        board.classList.add("wire-success");
        setTimeout(() => {
          board.classList.remove("wire-success");
          const puzzle = this.currentPuzzle;
          this.closeWirePuzzle();
          if (puzzle.onSuccess) {
            puzzle.onSuccess(this.game);
          }
        }, 800);
      } else {
        if (window.soundEngine) window.soundEngine.playError();
        board.classList.add("shake-error");
        this.game.showToast("⚡ 전선 연결 순서가 잘못되어 스파크가 튀었습니다! (순서를 확인하세요)");
        setTimeout(() => {
          board.classList.remove("shake-error");
          this.resetWirePuzzle();
        }, 700);
      }
    }
  }

  resetWirePuzzle() {
    this.wireSequence = [];
    if (window.soundEngine) window.soundEngine.playClick();
    this.renderWirePuzzleState();
  }

  renderWirePuzzleState() {
    const colorNames = {
      red: "🔴 빨간색(R)",
      yellow: "🟡 노란색(Y)",
      blue: "🔵 파란색(B)",
      green: "🟢 초록색(G)"
    };

    const slots = document.querySelectorAll(".wire-target-slot");
    slots.forEach((slot, index) => {
      if (index < this.wireSequence.length) {
        const c = this.wireSequence[index];
        slot.textContent = colorNames[c];
        slot.className = `wire-target-slot connected wire-${c}`;
      } else {
        slot.textContent = `[${index + 1}단계 빈 단자]`;
        slot.className = "wire-target-slot empty";
      }
    });

    const sources = document.querySelectorAll(".wire-source");
    sources.forEach((src) => {
      const color = src.dataset.color;
      if (this.wireSequence.includes(color)) {
        src.classList.add("used");
      } else {
        src.classList.remove("used");
      }
    });
  }
}

window.PuzzleManager = PuzzleManager;
