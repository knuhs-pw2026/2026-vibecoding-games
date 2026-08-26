/* ==========================================================================
   School Mystery Detective Game - Detective Notebook Engine
   ========================================================================== */

import { CLUES } from '../data/clues.js';
import { CHARACTERS } from '../data/story.js';
import { audio } from './audio.js';

class NotebookEngine {
  constructor() {
    this.modalEl = null;
    this.cluesGridEl = null;
    this.suspectsGridEl = null;
    this.timelineContainerEl = null;
    this.badgeCountEl = null;
    this.currentTab = "clues";
    this.selectedClueId = null;
    this.onPresentClueCallback = null;
  }

  init() {
    this.modalEl = document.getElementById("notebook-modal");
    this.cluesGridEl = document.getElementById("notebook-clues-grid");
    this.suspectsGridEl = document.getElementById("notebook-suspects-grid");
    this.timelineContainerEl = document.getElementById("notebook-timeline-content");
    this.badgeCountEl = document.getElementById("clue-badge-count");

    // Setup tab switching
    document.querySelectorAll(".notebook-tab").forEach(tab => {
      tab.addEventListener("click", (e) => {
        audio.playClick();
        document.querySelectorAll(".notebook-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        this.switchTab(tab.dataset.tab);
      });
    });

    // Close button
    const closeBtn = document.getElementById("btn-close-notebook");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    this.updateBadge();
  }

  open(onPresentCallback = null) {
    this.onPresentClueCallback = onPresentCallback;
    audio.playClick();
    this.switchTab(this.currentTab);
    if (this.modalEl) {
      this.modalEl.classList.add("active");
    }
  }

  close() {
    audio.playClick();
    if (this.modalEl) {
      this.modalEl.classList.remove("active");
    }
    this.onPresentClueCallback = null;
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    const views = {
      clues: document.getElementById("tab-view-clues"),
      suspects: document.getElementById("tab-view-suspects"),
      timeline: document.getElementById("tab-view-timeline")
    };

    Object.keys(views).forEach(k => {
      if (views[k]) views[k].style.display = (k === tabName) ? "block" : "none";
    });

    if (tabName === "clues") this.renderClues();
    if (tabName === "suspects") this.renderSuspects();
    if (tabName === "timeline") this.renderTimeline();
  }

  addClue(clueId) {
    if (CLUES[clueId] && !CLUES[clueId].discovered) {
      CLUES[clueId].discovered = true;
      this.updateBadge();
      this.showClueToast(CLUES[clueId]);
      audio.playClueFound();
    }
  }

  getDiscoveredCluesCount() {
    return Object.values(CLUES).filter(c => c.discovered).length;
  }

  updateBadge() {
    const count = this.getDiscoveredCluesCount();
    if (this.badgeCountEl) {
      this.badgeCountEl.textContent = count;
    }
  }

  showClueToast(clue) {
    const banner = document.getElementById("clue-banner");
    const bannerIcon = document.getElementById("clue-banner-icon");
    const bannerName = document.getElementById("clue-banner-name");

    if (banner && bannerIcon && bannerName) {
      bannerIcon.textContent = clue.icon;
      bannerName.textContent = clue.name;
      banner.classList.add("active");

      setTimeout(() => {
        banner.classList.remove("active");
      }, 2500);
    }
  }

  renderClues() {
    if (!this.cluesGridEl) return;
    this.cluesGridEl.innerHTML = "";

    const discoveredClues = Object.values(CLUES).filter(c => c.discovered);

    if (discoveredClues.length === 0) {
      this.cluesGridEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-dim); padding: 40px;">
          아직 발견된 단서가 없습니다. 교내 핫스팟을 조사해보세요!
        </div>
      `;
      return;
    }

    discoveredClues.forEach(clue => {
      const card = document.createElement("div");
      card.className = `clue-card ${this.selectedClueId === clue.id ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="clue-card-header">
          <div class="clue-icon-box">${clue.icon}</div>
          <div>
            <div class="clue-title">${clue.name}</div>
            <div style="font-size: 0.72rem; color: var(--text-dim);">발견 장소: ${clue.location}</div>
          </div>
        </div>
        <div class="clue-description">${clue.detailDesc}</div>
        <div class="clue-tag">${clue.category}</div>
        ${this.onPresentClueCallback ? `
          <button class="btn-present-clue" style="margin-top: 8px; width: 100%;">
            👉 이 증거 제시하기
          </button>
        ` : ''}
      `;

      card.onclick = () => {
        this.selectedClueId = clue.id;
        document.querySelectorAll(".clue-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
      };

      if (this.onPresentClueCallback) {
        const presentBtn = card.querySelector(".btn-present-clue");
        if (presentBtn) {
          presentBtn.onclick = (e) => {
            e.stopPropagation();
            const callback = this.onPresentClueCallback;
            this.close();
            callback(clue);
          };
        }
      }

      this.cluesGridEl.appendChild(card);
    });
  }

  renderSuspects() {
    if (!this.suspectsGridEl) return;
    this.suspectsGridEl.innerHTML = "";

    const suspectIds = ["minwoo", "haeun", "doyoon", "seojun"];

    suspectIds.forEach(id => {
      const char = CHARACTERS[id];
      const card = document.createElement("div");
      card.className = "suspect-card";
      card.innerHTML = `
        <div class="suspect-card-avatar" style="border-color: ${char.color};">
          ${char.avatar}
        </div>
        <div class="suspect-card-info">
          <div class="suspect-card-name">${char.name}</div>
          <div class="suspect-card-role">${char.role}</div>
          <div class="suspect-card-alibi">
            <strong>진술:</strong> "${char.introDialogue}"
          </div>
        </div>
      `;
      this.suspectsGridEl.appendChild(card);
    });
  }

  renderTimeline() {
    if (!this.timelineContainerEl) return;
    this.timelineContainerEl.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px; font-size: 0.9rem;">
        <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border-left: 4px solid var(--accent-blue);">
          <strong>🕒 21:00</strong> - 야간 자율학습 종료 및 교사들 퇴근 준비
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border-left: 4px solid var(--accent-purple);">
          <strong>🕒 21:15</strong> - 야간 비 쏟아짐 시작, 4명의 학생 각자의 장소에 잔류
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border-left: 4px solid var(--accent-crimson);">
          <strong>🕒 21:25</strong> - ⚠️ <strong>사건 발생 추정 시간</strong>: 복도에서 급한 발소리와 가방 쇠붙이 소음 발생
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border-left: 4px solid var(--accent-gold);">
          <strong>🕒 21:30</strong> - 교무실 수학 시험지 금고 도난 확인
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
          <strong>🕒 22:00</strong> - 🚪 <strong>학교 정문 폐쇄 예정 (제한 시간)</strong>
        </div>
      </div>
    `;
  }
}

export const notebook = new NotebookEngine();
