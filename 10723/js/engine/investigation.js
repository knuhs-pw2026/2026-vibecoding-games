/* ==========================================================================
   School Mystery Detective Game - Investigation & Scene Renderer Engine
   ========================================================================== */

import { LOCATIONS } from '../data/locations.js';
import { CHARACTERS } from '../data/story.js';
import { audio } from './audio.js';
import { dialogue } from './dialogue.js';
import { notebook } from './notebook.js';
import { puzzle } from './puzzle.js';

class InvestigationEngine {
  constructor() {
    this.currentLocationId = "loc_teachers_room";
    this.viewportEl = null;
    this.hotspotsLayerEl = null;
    this.locationTitleEl = null;
    this.locationListEl = null;
    this.standeeEl = null;
    this.inspectedHotspots = new Set();
  }

  init() {
    this.viewportEl = document.getElementById("scene-canvas-wrapper");
    this.hotspotsLayerEl = document.getElementById("hotspots-layer");
    this.locationTitleEl = document.getElementById("header-location-name");
    this.locationListEl = document.getElementById("map-location-list");
    this.standeeEl = document.getElementById("character-standee");

    this.renderLocationList();
    this.loadLocation(this.currentLocationId);
  }

  renderLocationList() {
    if (!this.locationListEl) return;
    this.locationListEl.innerHTML = "";

    Object.values(LOCATIONS).forEach(loc => {
      const card = document.createElement("div");
      card.className = `location-card ${loc.id === this.currentLocationId ? 'active' : ''}`;
      card.dataset.locId = loc.id;

      const suspectNames = loc.suspects.map(sid => CHARACTERS[sid]?.name).filter(Boolean);

      card.innerHTML = `
        <div class="location-card-top">
          <span class="location-name">${loc.name}</span>
          <span class="location-badge">${loc.floor}</span>
        </div>
        <div class="location-desc">${loc.description.slice(0, 32)}...</div>
        ${suspectNames.length > 0 ? `
          <div class="location-suspect-tags">
            ${suspectNames.map(name => `<span class="suspect-tag">👤 ${name}</span>`).join('')}
          </div>
        ` : ''}
      `;

      card.onclick = () => {
        if (this.currentLocationId !== loc.id) {
          audio.playClick();
          this.loadLocation(loc.id);
        }
      };

      this.locationListEl.appendChild(card);
    });
  }

  loadLocation(locId) {
    const loc = LOCATIONS[locId];
    if (!loc) return;

    this.currentLocationId = locId;

    // Update Header
    if (this.locationTitleEl) {
      this.locationTitleEl.textContent = `${loc.name} (${loc.floor})`;
    }

    // Update Sidebar Active state
    document.querySelectorAll(".location-card").forEach(c => {
      c.classList.toggle("active", c.dataset.locId === locId);
    });

    // Render Scene SVG Background
    this.renderSceneSvg(loc.bgSvgType, loc.themeColor);

    // Render Hotspots
    this.renderHotspots(loc.hotspots);

    // Render Character Standee if present
    this.renderCharacter(loc.suspects[0] || null);

    // Opening scene dialogue
    const suspectId = loc.suspects[0];
    if (suspectId && CHARACTERS[suspectId]) {
      const char = CHARACTERS[suspectId];
      dialogue.playDialogue(
        suspectId,
        char.introDialogue,
        [
          {
            text: "💬 질문하기",
            icon: "❓",
            onClick: () => this.talkToSuspect(suspectId)
          },
          {
            text: "📋 증거 제시",
            icon: "👉",
            onClick: () => this.presentEvidenceToSuspect(suspectId)
          }
        ]
      );
    } else {
      dialogue.playDialogue(
        "detective",
        loc.description,
        [{
          text: "🔍 현장 조사하기",
          icon: "🔎",
          onClick: () => dialogue.finishTyping()
        }]
      );
    }
  }

  renderCharacter(suspectId) {
    if (!this.standeeEl) return;

    if (!suspectId || !CHARACTERS[suspectId]) {
      this.standeeEl.style.display = "none";
      return;
    }

    const char = CHARACTERS[suspectId];
    this.standeeEl.style.display = "flex";
    this.standeeEl.style.alignItems = "flex-end";
    this.standeeEl.innerHTML = `
      <div style="text-align: center; animation: fadeIn 0.4s ease;">
        <div style="font-size: 8rem; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.8));">
          ${char.avatar}
        </div>
        <div style="background: rgba(15,23,42,0.85); padding: 4px 12px; border-radius: 99px; border: 1px solid ${char.color}; font-size: 0.85rem; font-weight: 700; color: ${char.color};">
          ${char.name} (${char.role})
        </div>
      </div>
    `;
  }

  talkToSuspect(suspectId) {
    const char = CHARACTERS[suspectId];
    if (!char) return;

    let responseText = "";
    if (suspectId === "minwoo") {
      responseText = "학생회 축제 공문과 기말고사 일정 조율 때문에 바빴어. 컴퓨터실 로그를 확인해보면 알겠지만 난 줄곧 컴퓨터 앞에 있었어.";
    } else if (suspectId === "haeun") {
      responseText = "9시 25분쯤 복도에서 다급하게 뛰어가는 소리와 짤랑거리는 쇠 소리를 들었어요! 누군가 무거운 가방을 메고 뛰는 느낌이었죠.";
    } else if (suspectId === "doyoon") {
      responseText = "과학실에서 비커가 깨져서 에탄올 걸레질을 하느라 옷에 냄새가 밴 것뿐이야. 교무실 쪽엔 간 적도 없어.";
    } else if (suspectId === "seojun") {
      responseText = "미술실에서 유화 마감 작업을 계속했어. 손에 묻은 파란 물감도 캔버스 작업 때문이고... 날 의심하는 거야?";
    }

    dialogue.playDialogue(
      suspectId,
      responseText,
      [
        {
          text: "📋 증거 제시하기",
          icon: "👉",
          onClick: () => this.presentEvidenceToSuspect(suspectId)
        },
        {
          text: "돌아가기",
          icon: "↩️",
          onClick: () => this.loadLocation(this.currentLocationId)
        }
      ]
    );
  }

  presentEvidenceToSuspect(suspectId) {
    notebook.open((presentedClue) => {
      const char = CHARACTERS[suspectId];
      if (!char) return;

      const reaction = char.clueReactions[presentedClue.id] || char.clueReactions.default;

      // Special reaction fx for critical clues
      if (
        (suspectId === "seojun" && presentedClue.id === "clue_master_key_trace") ||
        (suspectId === "minwoo" && presentedClue.id === "clue_security_log")
      ) {
        audio.playObjection();
        this.triggerObjectionBanner();
      }

      dialogue.playDialogue(
        suspectId,
        `[${presentedClue.name}을(를) 제시했다]\n\n"${reaction}"`,
        [
          {
            text: "다른 질문하기",
            icon: "💬",
            onClick: () => this.talkToSuspect(suspectId)
          },
          {
            text: "수색 계속하기",
            icon: "🔍",
            onClick: () => this.loadLocation(this.currentLocationId)
          }
        ]
      );
    });
  }

  triggerObjectionBanner() {
    const banner = document.getElementById("objection-banner");
    const container = document.querySelector(".game-container");

    if (banner) {
      banner.classList.add("active");
      if (container) container.classList.add("shake-screen");

      setTimeout(() => {
        banner.classList.remove("active");
        if (container) container.classList.remove("shake-screen");
      }, 1200);
    }
  }

  renderHotspots(hotspots) {
    if (!this.hotspotsLayerEl) return;
    this.hotspotsLayerEl.innerHTML = "";

    hotspots.forEach(hs => {
      const btn = document.createElement("button");
      const isInspected = this.inspectedHotspots.has(hs.id);
      btn.className = `hotspot-btn ${isInspected ? 'inspected' : ''}`;
      btn.style.left = `${hs.x}%`;
      btn.style.top = `${hs.y}%`;

      btn.innerHTML = `
        <span class="hotspot-icon">${hs.icon}</span>
        <span>${hs.name}</span>
      `;

      btn.onclick = () => {
        this.inspectedHotspots.add(hs.id);
        btn.classList.add("inspected");

        if (hs.clueId) {
          notebook.addClue(hs.clueId);
        }

        // Special Puzzle Hotspot Trigger
        if (hs.id === "hs_safe" && !puzzle.isSolved) {
          dialogue.playDialogue(
            "detective",
            "금고에 4자리 전자 비밀번호 키패드가 연결되어 있다. 암호를 입력해 볼까?",
            [
              {
                text: "🔢 암호 입력하기",
                icon: "🔑",
                isHighlight: true,
                onClick: () => puzzle.open()
              },
              {
                text: "주변 더 둘러보기",
                icon: "↩️",
                onClick: () => dialogue.finishTyping()
              }
            ]
          );
          return;
        }

        audio.playClick();
        dialogue.playDialogue(
          "detective",
          hs.message,
          [{
            text: "확인",
            icon: "✅",
            onClick: () => dialogue.finishTyping()
          }]
        );
      };

      this.hotspotsLayerEl.appendChild(btn);
    });
  }

  renderSceneSvg(bgType, themeColor) {
    if (!this.viewportEl) return;

    let svgContent = "";

    if (bgType === "teachers_room") {
      svgContent = `
        <svg viewBox="0 0 1000 600" class="scene-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wall-tr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0f172a"/>
              <stop offset="100%" stop-color="#1e293b"/>
            </linearGradient>
            <linearGradient id="floor-tr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#1e293b"/>
              <stop offset="100%" stop-color="#0f172a"/>
            </linearGradient>
          </defs>
          <!-- Room Wall & Floor -->
          <rect width="1000" height="420" fill="url(#wall-tr)"/>
          <polygon points="0,420 1000,420 1000,600 0,600" fill="url(#floor-tr)"/>
          <!-- Windows with night rain -->
          <rect x="100" y="80" width="220" height="200" fill="#030712" stroke="#334155" stroke-width="6" rx="4"/>
          <line x1="210" y1="80" x2="210" y2="280" stroke="#334155" stroke-width="4"/>
          <line x1="100" y1="180" x2="320" y2="180" stroke="#334155" stroke-width="4"/>
          <!-- Teacher Desks -->
          <rect x="180" y="380" width="280" height="120" fill="#334155" stroke="#475569" stroke-width="3" rx="6"/>
          <rect x="200" y="360" width="80" height="50" fill="#1e293b" stroke="#64748b" stroke-width="2" rx="4"/>
          <!-- Safe Box Area -->
          <rect x="440" y="240" width="160" height="200" fill="#1e293b" stroke="#f59e0b" stroke-width="4" rx="8"/>
          <circle cx="520" cy="330" r="30" fill="#334155" stroke="#fcd34d" stroke-width="3"/>
          <rect x="490" y="325" width="60" height="10" fill="#fcd34d" rx="3"/>
          <!-- Bookshelves -->
          <rect x="700" y="100" width="220" height="340" fill="#1e293b" stroke="#475569" stroke-width="4" rx="4"/>
          <line x1="700" y1="180" x2="920" y2="180" stroke="#475569" stroke-width="4"/>
          <line x1="700" y1="260" x2="920" y2="260" stroke="#475569" stroke-width="4"/>
          <line x1="700" y1="340" x2="920" y2="340" stroke="#475569" stroke-width="4"/>
        </svg>
      `;
    } else if (bgType === "science_lab") {
      svgContent = `
        <svg viewBox="0 0 1000 600" class="scene-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wall-sci" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#064e3b"/>
              <stop offset="100%" stop-color="#022c22"/>
            </linearGradient>
          </defs>
          <rect width="1000" height="420" fill="url(#wall-sci)"/>
          <polygon points="0,420 1000,420 1000,600 0,600" fill="#0f172a"/>
          <!-- Blackboard with chemical formula -->
          <rect x="150" y="60" width="400" height="180" fill="#065f46" stroke="#047857" stroke-width="6" rx="6"/>
          <text x="180" y="130" fill="#a7f3d0" font-size="24" font-family="monospace">C(6) + O(8) × 10 = ?</text>
          <text x="180" y="180" fill="#6ee7b7" font-size="18" font-family="monospace">CH3CH2OH (Ethanol Lab)</text>
          <!-- Chemical Rack -->
          <rect x="650" y="120" width="260" height="300" fill="#134e4a" stroke="#14b8a6" stroke-width="3" rx="6"/>
          <!-- Lab Desk -->
          <rect x="350" y="380" width="380" height="140" fill="#1e293b" stroke="#10b981" stroke-width="3" rx="6"/>
          <polygon points="460,350 490,380 430,380" fill="rgba(16, 185, 129, 0.4)" stroke="#10b981" stroke-width="2"/>
        </svg>
      `;
    } else if (bgType === "broadcast_room") {
      svgContent = `
        <svg viewBox="0 0 1000 600" class="scene-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wall-bc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#2e1065"/>
              <stop offset="100%" stop-color="#0f172a"/>
            </linearGradient>
          </defs>
          <rect width="1000" height="420" fill="url(#wall-bc)"/>
          <polygon points="0,420 1000,420 1000,600 0,600" fill="#090d16"/>
          <!-- Soundproofing acoustic foam grid -->
          <rect x="80" y="50" width="840" height="200" fill="none" stroke="#581c87" stroke-width="2" stroke-dasharray="20,20"/>
          <!-- On Air Light -->
          <rect x="420" y="30" width="160" height="45" fill="#ef4444" rx="6" filter="drop-shadow(0 0 15px #ef4444)"/>
          <text x="460" y="60" fill="#fff" font-size="20" font-weight="bold" font-family="sans-serif">ON AIR</text>
          <!-- Audio Console Desk -->
          <rect x="250" y="360" width="500" height="150" fill="#1e1b4b" stroke="#8b5cf6" stroke-width="3" rx="8"/>
          <!-- Microphone Stand -->
          <line x1="400" y1="360" x2="400" y2="280" stroke="#c084fc" stroke-width="6"/>
          <circle cx="400" cy="270" r="16" fill="#c084fc"/>
        </svg>
      `;
    } else if (bgType === "art_room") {
      svgContent = `
        <svg viewBox="0 0 1000 600" class="scene-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wall-art" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#451a03"/>
              <stop offset="100%" stop-color="#0f172a"/>
            </linearGradient>
          </defs>
          <rect width="1000" height="420" fill="url(#wall-art)"/>
          <polygon points="0,420 1000,420 1000,600 0,600" fill="#18181b"/>
          <!-- Easel & Canvas -->
          <polygon points="600,200 550,460 650,460" fill="none" stroke="#d97706" stroke-width="6"/>
          <rect x="520" y="240" width="160" height="180" fill="#1e3a8a" stroke="#3b82f6" stroke-width="4" rx="4"/>
          <!-- Plaster Bust Pedestal -->
          <rect x="220" y="300" width="120" height="180" fill="#3f3f46" stroke="#71717a" stroke-width="3" rx="4"/>
          <circle cx="280" cy="260" r="32" fill="#e4e4e7" stroke="#a1a1aa" stroke-width="3"/>
          <!-- Palette Desk -->
          <rect x="740" y="380" width="200" height="140" fill="#27272a" stroke="#f59e0b" stroke-width="3" rx="6"/>
          <circle cx="800" cy="430" r="24" fill="#2563eb"/>
        </svg>
      `;
    } else if (bgType === "computer_lab") {
      svgContent = `
        <svg viewBox="0 0 1000 600" class="scene-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wall-pc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#083344"/>
              <stop offset="100%" stop-color="#0f172a"/>
            </linearGradient>
          </defs>
          <rect width="1000" height="420" fill="url(#wall-pc)"/>
          <polygon points="0,420 1000,420 1000,600 0,600" fill="#0f172a"/>
          <!-- Computer rows -->
          <rect x="120" y="340" width="760" height="160" fill="#164e63" stroke="#06b6d4" stroke-width="3" rx="8"/>
          <!-- Server Rack with blinking lights -->
          <rect x="420" y="160" width="160" height="220" fill="#0e7490" stroke="#22d3ee" stroke-width="4" rx="6"/>
          <circle cx="450" cy="200" r="6" fill="#4ade80"/>
          <circle cx="470" cy="200" r="6" fill="#f87171"/>
          <circle cx="490" cy="200" r="6" fill="#38bdf8"/>
        </svg>
      `;
    }

    this.viewportEl.innerHTML = svgContent;
  }
}

export const investigation = new InvestigationEngine();
