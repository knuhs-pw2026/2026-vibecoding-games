/* ==========================================================================
   School Mystery Detective Game - Dialogue Engine
   ========================================================================== */

import { CHARACTERS } from '../data/story.js';
import { audio } from './audio.js';

class DialogueEngine {
  constructor() {
    this.speakerEl = null;
    this.roleEl = null;
    this.avatarEl = null;
    this.textEl = null;
    this.cursorEl = null;
    this.choicesContainer = null;
    this.actionButtons = null;

    this.typewriterTimer = null;
    this.isTyping = false;
    this.currentText = "";
    this.onCompleteCallback = null;
    this.queue = [];
  }

  init() {
    this.speakerEl = document.getElementById("speaker-name");
    this.roleEl = document.getElementById("speaker-role");
    this.avatarEl = document.getElementById("speaker-avatar");
    this.textEl = document.getElementById("dialogue-text");
    this.cursorEl = document.getElementById("dialogue-cursor");
    this.choicesContainer = document.getElementById("dialogue-choices");
    this.actionButtons = document.getElementById("action-buttons");
  }

  setSpeaker(characterId) {
    const char = CHARACTERS[characterId] || {
      name: "안내",
      role: "시스템",
      avatar: "📢",
      color: "#94a3b8"
    };

    if (this.speakerEl) this.speakerEl.textContent = char.name;
    if (this.roleEl) this.roleEl.textContent = char.role;
    if (this.avatarEl) {
      this.avatarEl.textContent = char.avatar;
      this.avatarEl.style.borderColor = char.color;
      this.avatarEl.style.boxShadow = `0 0 15px ${char.color}40`;
    }
  }

  playDialogue(speakerId, text, choices = [], onComplete = null) {
    this.setSpeaker(speakerId);
    this.currentText = text;
    this.onCompleteCallback = onComplete;
    this.clearChoices();

    if (this.typewriterTimer) clearInterval(this.typewriterTimer);
    if (this.textEl) this.textEl.textContent = "";
    if (this.cursorEl) this.cursorEl.style.display = "inline-block";

    this.isTyping = true;
    let charIndex = 0;

    this.typewriterTimer = setInterval(() => {
      if (charIndex < text.length) {
        this.textEl.textContent += text.charAt(charIndex);
        if (charIndex % 3 === 0) {
          audio.playTypewriter();
        }
        charIndex++;
      } else {
        this.finishTyping(choices);
      }
    }, 28);
  }

  skipTyping() {
    if (this.isTyping) {
      clearInterval(this.typewriterTimer);
      if (this.textEl) this.textEl.textContent = this.currentText;
      this.finishTyping();
    }
  }

  finishTyping(choices = []) {
    this.isTyping = false;
    clearInterval(this.typewriterTimer);
    if (this.cursorEl) this.cursorEl.style.display = "none";
    if (choices && choices.length > 0) {
      this.renderChoices(choices);
    }
    if (this.onCompleteCallback) {
      const cb = this.onCompleteCallback;
      this.onCompleteCallback = null;
      cb();
    }
  }

  renderChoices(choices) {
    this.clearChoices();
    if (!this.choicesContainer) return;

    choices.forEach(choice => {
      const btn = document.createElement("button");
      btn.className = `btn-choice ${choice.isHighlight ? 'highlight' : ''}`;
      btn.innerHTML = `${choice.icon ? choice.icon + ' ' : ''}${choice.text}`;
      btn.onclick = () => {
        audio.playClick();
        if (choice.onClick) choice.onClick();
      };
      this.choicesContainer.appendChild(btn);
    });
  }

  clearChoices() {
    if (this.choicesContainer) {
      this.choicesContainer.innerHTML = "";
    }
  }

  playQueue(dialogueList, onAllFinished) {
    if (!dialogueList || dialogueList.length === 0) {
      if (onAllFinished) onAllFinished();
      return;
    }

    let currentIndex = 0;

    const showNext = () => {
      if (currentIndex >= dialogueList.length) {
        if (onAllFinished) onAllFinished();
        return;
      }

      const item = dialogueList[currentIndex];
      const isLast = currentIndex === dialogueList.length - 1;

      const choices = isLast ? [] : [{
        text: "다음 ▶",
        icon: "⏩",
        onClick: () => {
          currentIndex++;
          showNext();
        }
      }];

      this.playDialogue(item.speaker, item.text, choices, () => {
        if (isLast && onAllFinished) {
          onAllFinished();
        }
      });
    };

    showNext();
  }
}

export const dialogue = new DialogueEngine();
