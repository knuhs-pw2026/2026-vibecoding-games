/**
 * NEON PUZZLE - 8x8 Block Puzzle Game
 * Featuring: (N)x CLEAR! Combo System, All-Clear Dynamic Theme Switcher,
 * 6 Neon Cyberpunk Background Themes, and Precision Drag Engine
 */

(function () {
  'use strict';

  // --- Neon Cyber Themes ---
  const THEMES = [
    { id: 'theme-cyber', name: 'CYBER NEON' },
    { id: 'theme-synthwave', name: 'SYNTHWAVE 80S' },
    { id: 'theme-matrix', name: 'MATRIX EMERALD' },
    { id: 'theme-solar', name: 'SOLAR AMBER' },
    { id: 'theme-crimson', name: 'CRIMSON ABYSS' },
    { id: 'theme-aurora', name: 'AURORA ARCTIC' }
  ];

  // --- Web Audio Synth Engine ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.isMuted = false;
      this.scale = [
        261.63, 293.66, 329.63, 392.00, 440.00, // C4, D4, E4, G4, A4
        523.25, 587.33, 659.25, 783.99, 880.00, // C5, D5, E5, G5, A5
        1046.50, 1174.66, 1318.51, 1567.98, 1760.00, 2093.00 // C6 - C7
      ];
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      return this.isMuted;
    }

    playTone(freq, type, startTime, duration, vol = 0.2) {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      } catch (e) {}
    }

    playPickup() {
      this.init();
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;
      this.playTone(523.25, 'sine', now, 0.08, 0.18);
    }

    playSnap() {
      this.init();
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;
      this.playTone(261.63, 'triangle', now, 0.1, 0.28);
      this.playTone(523.25, 'sine', now, 0.06, 0.2);
    }

    playClear(linesCount, comboStreak) {
      this.init();
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;

      // Base note climbs with combo streak
      const noteOffset = Math.min((comboStreak - 1) * 2 + (linesCount - 1), this.scale.length - 6);
      const chord = [
        this.scale[noteOffset],
        this.scale[noteOffset + 2],
        this.scale[noteOffset + 4],
        this.scale[Math.min(noteOffset + 6, this.scale.length - 1)]
      ];

      chord.forEach((freq, idx) => {
        this.playTone(freq, 'triangle', now + idx * 0.045, 0.38, 0.25 + Math.min(comboStreak * 0.03, 0.15));
        this.playTone(freq * 1.5, 'sine', now + idx * 0.045, 0.25, 0.12);
      });

      // High octave crystal bell sparkle on high combos
      if (comboStreak >= 3) {
        this.playTone(1567.98, 'sine', now + 0.18, 0.45, 0.2);
        this.playTone(2093.00, 'triangle', now + 0.22, 0.5, 0.15);
      }
    }

    playAllClear() {
      this.init();
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;

      // Grand Triumphant Arpeggio Fanfare
      const fanfare = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
      fanfare.forEach((freq, idx) => {
        this.playTone(freq, 'triangle', now + idx * 0.08, 0.5, 0.25);
        this.playTone(freq * 0.5, 'sawtooth', now + idx * 0.08, 0.4, 0.15);
      });

      // Final lingering golden chord
      setTimeout(() => {
        if (!this.ctx) return;
        const chordTime = this.ctx.currentTime;
        [523.25, 783.99, 1046.50, 1567.98, 2093.00].forEach(f => {
          this.playTone(f, 'sine', chordTime, 1.2, 0.2);
        });
      }, 600);
    }

    playGameOver() {
      this.init();
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [392.00, 349.23, 311.13, 261.63];
      notes.forEach((freq, idx) => {
        this.playTone(freq, 'sawtooth', now + idx * 0.12, 0.5, 0.18);
      });
    }
  }

  // --- 2D Canvas Particle Effects ---
  class ParticleEngine {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.loop();
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    burst(x, y, colorHex, count = 20) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.5 + Math.random() * 7;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          color: colorHex,
          size: 4 + Math.random() * 5,
          alpha: 1,
          decay: 0.02 + Math.random() * 0.02,
          gravity: 0.16
        });
      }
    }

    fireworks() {
      const colors = ['#00f2fe', '#ffd700', '#f72585', '#06d6a0', '#9d4edd', '#ffffff'];
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;

      for (let burstIdx = 0; burstIdx < 5; burstIdx++) {
        setTimeout(() => {
          const bx = cx + (Math.random() - 0.5) * 300;
          const by = cy + (Math.random() - 0.5) * 200;
          const color = colors[Math.floor(Math.random() * colors.length)];
          this.burst(bx, by, color, 40);
        }, burstIdx * 120);
      }
    }

    loop() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, p.alpha);
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }

      requestAnimationFrame(() => this.loop());
    }
  }

  // --- Polyomino Shape Definitions ---
  const SHAPES = [
    // 1x1 Dot
    { matrix: [[1]], color: 'cyan', hex: '#00f2fe' },

    // 2-Blocks Lines
    { matrix: [[1, 1]], color: 'sky', hex: '#4cc9f0' },
    { matrix: [[1], [1]], color: 'sky', hex: '#4cc9f0' },

    // 3-Blocks Lines
    { matrix: [[1, 1, 1]], color: 'emerald', hex: '#06d6a0' },
    { matrix: [[1], [1], [1]], color: 'emerald', hex: '#06d6a0' },

    // 4-Blocks Lines
    { matrix: [[1, 1, 1, 1]], color: 'magenta', hex: '#f72585' },
    { matrix: [[1], [1], [1], [1]], color: 'magenta', hex: '#f72585' },

    // 5-Blocks Lines
    { matrix: [[1, 1, 1, 1, 1]], color: 'gold', hex: '#ffb703' },
    { matrix: [[1], [1], [1], [1], [1]], color: 'gold', hex: '#ffb703' },

    // 2x2 Square
    { matrix: [[1, 1], [1, 1]], color: 'gold', hex: '#ffb703' },

    // 3x3 Square
    { matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], color: 'orange', hex: '#ff7b00' },

    // Mini Corners / L (2x2)
    { matrix: [[1, 0], [1, 1]], color: 'violet', hex: '#9d4edd' },
    { matrix: [[0, 1], [1, 1]], color: 'violet', hex: '#9d4edd' },
    { matrix: [[1, 1], [1, 0]], color: 'violet', hex: '#9d4edd' },
    { matrix: [[1, 1], [0, 1]], color: 'violet', hex: '#9d4edd' },

    // 3x3 Big L
    { matrix: [[1, 0, 0], [1, 0, 0], [1, 1, 1]], color: 'rose', hex: '#ff0055' },
    { matrix: [[0, 0, 1], [0, 0, 1], [1, 1, 1]], color: 'rose', hex: '#ff0055' },
    { matrix: [[1, 1, 1], [1, 0, 0], [1, 0, 0]], color: 'rose', hex: '#ff0055' },
    { matrix: [[1, 1, 1], [0, 0, 1], [0, 0, 1]], color: 'rose', hex: '#ff0055' },

    // 2x3 L
    { matrix: [[1, 0], [1, 0], [1, 1]], color: 'cyan', hex: '#00f2fe' },
    { matrix: [[0, 1], [0, 1], [1, 1]], color: 'cyan', hex: '#00f2fe' },
    { matrix: [[1, 1, 1], [1, 0, 0]], color: 'cyan', hex: '#00f2fe' },
    { matrix: [[1, 1, 1], [0, 0, 1]], color: 'cyan', hex: '#00f2fe' },

    // T-Shapes
    { matrix: [[1, 1, 1], [0, 1, 0]], color: 'sky', hex: '#4cc9f0' },
    { matrix: [[0, 1, 0], [1, 1, 1]], color: 'sky', hex: '#4cc9f0' },
    { matrix: [[1, 0], [1, 1], [1, 0]], color: 'sky', hex: '#4cc9f0' },
    { matrix: [[0, 1], [1, 1], [0, 1]], color: 'sky', hex: '#4cc9f0' },

    // S / Z Shapes
    { matrix: [[1, 1, 0], [0, 1, 1]], color: 'emerald', hex: '#06d6a0' },
    { matrix: [[0, 1, 1], [1, 1, 0]], color: 'emerald', hex: '#06d6a0' },

    // Plus Shape
    { matrix: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], color: 'orange', hex: '#ff7b00' }
  ];

  // --- Main Game Controller ---
  class NeonPuzzleGame {
    constructor() {
      // DOM Elements
      this.boardEl = document.getElementById('board-container');
      this.dockSlots = [
        document.getElementById('slot-0'),
        document.getElementById('slot-1'),
        document.getElementById('slot-2')
      ];
      this.scoreDisplay = document.getElementById('score-display');
      this.highScoreDisplay = document.getElementById('high-score-display');
      this.themeBadge = document.getElementById('theme-badge');
      this.comboMeter = document.getElementById('combo-meter');
      this.comboCountText = document.getElementById('combo-count-text');
      this.comboDots = document.getElementById('combo-dots');
      this.comboMultiplierText = document.getElementById('combo-multiplier-text');
      this.comboPopup = document.getElementById('combo-popup');
      this.allClearBanner = document.getElementById('all-clear-banner');
      this.modalOverlay = document.getElementById('modal-overlay');
      this.modalScore = document.getElementById('modal-score');
      this.modalBest = document.getElementById('modal-best');
      this.modalLines = document.getElementById('modal-lines');
      this.modalCombos = document.getElementById('modal-combos');
      this.btnRestart = document.getElementById('btn-restart');
      this.btnHeaderRestart = document.getElementById('btn-header-restart');
      this.btnTheme = document.getElementById('btn-theme');
      this.btnMute = document.getElementById('btn-mute');
      this.soundIcon = document.getElementById('sound-icon');
      this.particleCanvas = document.getElementById('particle-canvas');

      // Engines
      this.sound = new SoundEngine();
      this.particles = new ParticleEngine(this.particleCanvas);

      // State
      this.GRID_SIZE = 8;
      this.board = Array(8).fill(null).map(() => Array(8).fill(null));
      this.cellElements = [];
      this.dock = [null, null, null];
      this.score = 0;
      this.highScore = parseInt(localStorage.getItem('neon_puzzle_high_score') || '0', 10);
      this.highScoreDisplay.innerText = this.highScore;
      
      // Themes State
      this.currentThemeIndex = 0;

      // Combo State (3-Move Grace Window)
      this.MAX_COMBO_GRACE = 3;
      this.comboStreak = 0;
      this.comboGraceMoves = 0;
      this.maxCombo = 0;
      this.totalLinesCleared = 0;
      this.isGameOver = false;

      // Drag / Selection State
      this.dragState = null;
      this.selectedSlotIndex = null;

      this.createBoardGrid();
      this.bindEvents();
      this.applyTheme(0);
      this.startNewGame();
    }

    applyTheme(themeIdx) {
      this.currentThemeIndex = themeIdx % THEMES.length;
      const theme = THEMES[this.currentThemeIndex];
      document.body.className = theme.id;
      if (this.themeBadge) {
        this.themeBadge.innerText = `THEME: ${theme.name}`;
      }
    }

    nextTheme() {
      const nextIdx = (this.currentThemeIndex + 1) % THEMES.length;
      this.applyTheme(nextIdx);
    }

    createBoardGrid() {
      this.boardEl.innerHTML = '';
      this.cellElements = [];

      for (let r = 0; r < this.GRID_SIZE; r++) {
        const row = [];
        for (let c = 0; c < this.GRID_SIZE; c++) {
          const cell = document.createElement('div');
          cell.className = 'cell';
          cell.dataset.row = r;
          cell.dataset.col = c;
          this.boardEl.appendChild(cell);
          row.push(cell);
        }
        this.cellElements.push(row);
      }
    }

    startNewGame() {
      this.sound.init();
      this.isGameOver = false;
      this.score = 0;
      this.comboStreak = 0;
      this.comboGraceMoves = 0;
      this.maxCombo = 0;
      this.totalLinesCleared = 0;
      this.selectedSlotIndex = null;
      this.scoreDisplay.innerText = '0';
      this.hideComboMeter();
      this.comboPopup.classList.remove('show', 'mega');
      this.allClearBanner.classList.remove('show');
      this.modalOverlay.classList.add('hidden');

      // Reset Board matrix & DOM
      for (let r = 0; r < this.GRID_SIZE; r++) {
        for (let c = 0; c < this.GRID_SIZE; c++) {
          this.board[r][c] = null;
          this.cellElements[r][c].className = 'cell';
        }
      }

      this.dealDock();
    }

    wouldPlaceClearLine(matrix, startR, startC) {
      if (!this.canPlace(matrix, startR, startC)) return false;

      const rows = matrix.length;
      const cols = matrix[0].length;

      // 가로 행(Row) 중 하나라도 꽉 차게 되는지 검사
      for (let r = 0; r < this.GRID_SIZE; r++) {
        let full = true;
        for (let c = 0; c < this.GRID_SIZE; c++) {
          const isOccupied = this.board[r][c] !== null;
          const isSimulated = (r >= startR && r < startR + rows && c >= startC && c < startC + cols && matrix[r - startR][c - startC] === 1);
          if (!isOccupied && !isSimulated) {
            full = false;
            break;
          }
        }
        if (full) return true;
      }

      // 세로 열(Column) 중 하나라도 꽉 차게 되는지 검사
      for (let c = 0; c < this.GRID_SIZE; c++) {
        let full = true;
        for (let r = 0; r < this.GRID_SIZE; r++) {
          const isOccupied = this.board[r][c] !== null;
          const isSimulated = (r >= startR && r < startR + rows && c >= startC && c < startC + cols && matrix[r - startR][c - startC] === 1);
          if (!isOccupied && !isSimulated) {
            full = false;
            break;
          }
        }
        if (full) return true;
      }

      return false;
    }

    findClearingShapes() {
      const candidates = [];
      for (const shape of SHAPES) {
        let canClear = false;
        for (let r = 0; r <= this.GRID_SIZE - shape.matrix.length; r++) {
          for (let c = 0; c <= this.GRID_SIZE - shape.matrix[0].length; c++) {
            if (this.wouldPlaceClearLine(shape.matrix, r, c)) {
              canClear = true;
              break;
            }
          }
          if (canClear) break;
        }
        if (canClear) {
          candidates.push(shape);
        }
      }
      return candidates;
    }

    findPlayableShapes() {
      return SHAPES.filter(shape => this.canShapeFitAnywhere(shape.matrix));
    }

    dealDock() {
      const clearingShapes = this.findClearingShapes();
      const playableShapes = this.findPlayableShapes();

      const newDock = [];

      // 1. [보장] 현재 보드에서 즉시 줄을 터뜨릴 수 있는 블록 1개 무조건 보충!
      if (clearingShapes.length > 0) {
        const chosenClearer = clearingShapes[Math.floor(Math.random() * clearingShapes.length)];
        newDock.push(JSON.parse(JSON.stringify(chosenClearer)));
      } else {
        // 보드가 비어있거나 즉시 클리어 각이 안 나오는 경우, 1x1 도트 등 유연하게 배치 가능한 작은 블록 제공
        const smallShapes = SHAPES.filter(s => s.matrix.length <= 2 && s.matrix[0].length <= 2 && this.canShapeFitAnywhere(s.matrix));
        const pool = smallShapes.length > 0 ? smallShapes : (playableShapes.length > 0 ? playableShapes : SHAPES);
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        newDock.push(JSON.parse(JSON.stringify(chosen)));
      }

      // 2. 나머지 2개 슬롯도 현재 보드에 합법적으로 배치 가능한 블록들로 채움
      const pool = playableShapes.length > 0 ? playableShapes : SHAPES;
      while (newDock.length < 3) {
        const randomShape = pool[Math.floor(Math.random() * pool.length)];
        newDock.push(JSON.parse(JSON.stringify(randomShape)));
      }

      // 3. 클리어 보장 블록이 항상 1번 슬롯에만 고정되지 않도록 3개 슬롯 랜덤 셔플
      for (let i = newDock.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDock[i], newDock[j]] = [newDock[j], newDock[i]];
      }

      this.dock = newDock;
      this.renderDock();
      this.updateDockState();
    }

    renderDock() {
      this.dockSlots.forEach((slot, idx) => {
        slot.innerHTML = '';
        slot.classList.remove('selected', 'disabled');
        slot.style.opacity = '1';
        const shape = this.dock[idx];

        if (shape) {
          const shapeGrid = document.createElement('div');
          shapeGrid.className = 'shape-grid';
          const rows = shape.matrix.length;
          const cols = shape.matrix[0].length;

          shapeGrid.style.gridTemplateRows = `repeat(${rows}, 18px)`;
          shapeGrid.style.gridTemplateColumns = `repeat(${cols}, 18px)`;

          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const cell = document.createElement('div');
              if (shape.matrix[r][c]) {
                cell.className = `shape-cell color-${shape.color}`;
              }
              shapeGrid.appendChild(cell);
            }
          }
          slot.appendChild(shapeGrid);
        }
      });
    }

    canPlace(matrix, startR, startC) {
      const rows = matrix.length;
      const cols = matrix[0].length;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (matrix[r][c]) {
            const targetR = startR + r;
            const targetC = startC + c;

            // Out of bounds
            if (targetR < 0 || targetR >= this.GRID_SIZE || targetC < 0 || targetC >= this.GRID_SIZE) {
              return false;
            }
            // Already occupied
            if (this.board[targetR][targetC] !== null) {
              return false;
            }
          }
        }
      }
      return true;
    }

    canShapeFitAnywhere(matrix) {
      const rows = matrix.length;
      const cols = matrix[0].length;

      for (let r = 0; r <= this.GRID_SIZE - rows; r++) {
        for (let c = 0; c <= this.GRID_SIZE - cols; c++) {
          if (this.canPlace(matrix, r, c)) {
            return true;
          }
        }
      }
      return false;
    }

    updateDockState() {
      let anyCanFit = false;

      this.dockSlots.forEach((slot, idx) => {
        const shape = this.dock[idx];
        if (shape) {
          const fits = this.canShapeFitAnywhere(shape.matrix);
          if (fits) {
            slot.classList.remove('disabled');
            anyCanFit = true;
          } else {
            slot.classList.add('disabled');
          }
        }
      });

      // Check if all remaining non-null shapes are unusable
      const remainingShapes = this.dock.filter(s => s !== null);
      if (remainingShapes.length > 0 && !anyCanFit) {
        this.triggerGameOver();
      }
    }

    executePlacement(slotIndex, startR, startC) {
      const shape = this.dock[slotIndex];
      if (!shape || !this.canPlace(shape.matrix, startR, startC)) return false;

      // 1. Remove from dock immediately
      this.dock[slotIndex] = null;
      this.dockSlots[slotIndex].classList.remove('selected');
      this.dockSlots[slotIndex].style.opacity = '1';
      this.renderDock();

      // 2. Place on board matrix and update styles
      const rows = shape.matrix.length;
      const cols = shape.matrix[0].length;
      let blockCount = 0;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (shape.matrix[r][c]) {
            const tr = startR + r;
            const tc = startC + c;
            this.board[tr][tc] = shape.color;
            this.cellElements[tr][tc].className = `cell filled color-${shape.color}`;
            blockCount++;
          }
        }
      }

      this.sound.playSnap();
      this.score += blockCount * 10;
      this.updateScoreUI();

      // 3. Clear lines & deal new dock if empty
      this.checkAndClearLines();
      return true;
    }

    checkAndClearLines() {
      const fullRows = [];
      const fullCols = [];

      // Check rows
      for (let r = 0; r < this.GRID_SIZE; r++) {
        let isFull = true;
        for (let c = 0; c < this.GRID_SIZE; c++) {
          if (this.board[r][c] === null) {
            isFull = false;
            break;
          }
        }
        if (isFull) fullRows.push(r);
      }

      // Check columns
      for (let c = 0; c < this.GRID_SIZE; c++) {
        let isFull = true;
        for (let r = 0; r < this.GRID_SIZE; r++) {
          if (this.board[r][c] === null) {
            isFull = false;
            break;
          }
        }
        if (isFull) fullCols.push(c);
      }

      const totalLines = fullRows.length + fullCols.length;

      if (totalLines > 0) {
        // Increment combo streak & reset grace window to 3 moves!
        this.comboStreak++;
        this.comboGraceMoves = this.MAX_COMBO_GRACE;
        if (this.comboStreak > this.maxCombo) this.maxCombo = this.comboStreak;
        this.totalLinesCleared += totalLines;

        // Multiplier based on combo streak & multi-lines
        const multiplier = 1 + (this.comboStreak - 1) * 0.75 + (totalLines - 1) * 0.75;
        const linePoints = Math.round(totalLines * 120 * multiplier);
        this.score += linePoints;
        this.updateScoreUI();

        // Visual & Audio Celebrations with "(N)x CLEAR!" format
        this.showComboFeedback(this.comboStreak, totalLines, multiplier);
        this.updateComboGraceUI();
        this.sound.playClear(totalLines, this.comboStreak);

        // 라인 클리어 및 콤보 발생 시 배경화면 네온 테마 즉시 자동 전환!
        this.nextTheme();

        // Screen Shake for Combos / Multi-lines
        if (this.comboStreak >= 2 || totalLines >= 2) {
          this.boardEl.classList.remove('shake');
          void this.boardEl.offsetWidth;
          this.boardEl.classList.add('shake');
        }

        // Animate and clear cells
        const clearedCoords = new Set();
        fullRows.forEach(r => {
          for (let c = 0; c < this.GRID_SIZE; c++) clearedCoords.add(`${r},${c}`);
        });
        fullCols.forEach(c => {
          for (let r = 0; r < this.GRID_SIZE; r++) clearedCoords.add(`${r},${c}`);
        });

        clearedCoords.forEach(coord => {
          const [r, c] = coord.split(',').map(Number);
          const cell = this.cellElements[r][c];
          cell.classList.add('clearing');

          // Particle burst
          const rect = cell.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          this.particles.burst(cx, cy, '#00f2fe', 12);

          // Clear board memory & cell DOM after animation
          setTimeout(() => {
            this.board[r][c] = null;
            cell.className = 'cell';
          }, 320);
        });

        // 4. Check for ALL CLEAR (올클리어)
        let remainingBlocksAfterClear = 0;
        for (let r = 0; r < this.GRID_SIZE; r++) {
          for (let c = 0; c < this.GRID_SIZE; c++) {
            if (this.board[r][c] !== null && !clearedCoords.has(`${r},${c}`)) {
              remainingBlocksAfterClear++;
            }
          }
        }

        if (remainingBlocksAfterClear === 0) {
          setTimeout(() => {
            this.triggerAllClear();
          }, 340);
        }
      } else {
        // 줄을 클리어하지 못한 턴 -> 남은 콤보 유지 기회 1회 차감 (최대 3번의 기회)
        if (this.comboStreak > 0) {
          this.comboGraceMoves--;
          if (this.comboGraceMoves > 0) {
            this.updateComboGraceUI();
          } else {
            // 3번 연속 줄을 못 터뜨리면 콤보 종료
            this.comboStreak = 0;
            this.comboGraceMoves = 0;
            this.hideComboMeter();
          }
        }
      }

      // If dock is empty, deal new 3 shapes!
      const remaining = this.dock.filter(s => s !== null);
      if (remaining.length === 0) {
        setTimeout(() => this.dealDock(), totalLines > 0 ? 340 : 150);
      } else {
        if (totalLines > 0) {
          setTimeout(() => this.updateDockState(), 360);
        } else {
          this.updateDockState();
        }
      }
    }

    triggerAllClear() {
      // 1. Award All Clear Bonus (+1000 pts)
      const ALL_CLEAR_BONUS = 1000;
      this.score += ALL_CLEAR_BONUS;
      this.updateScoreUI();

      // 2. Play All-Clear fanfare & fireworks
      this.sound.playAllClear();
      this.particles.fireworks();

      // 3. Switch to Next Background Theme!
      this.nextTheme();

      // 4. Show All Clear Banner
      this.allClearBanner.classList.remove('show');
      void this.allClearBanner.offsetWidth;
      this.allClearBanner.classList.add('show');

      clearTimeout(this.allClearTimer);
      this.allClearTimer = setTimeout(() => {
        this.allClearBanner.classList.remove('show');
      }, 2400);
    }

    updateComboGraceUI() {
      if (this.comboStreak <= 0 || this.comboGraceMoves <= 0) {
        this.hideComboMeter();
        return;
      }

      this.comboMeter.classList.remove('hidden');
      this.comboMeter.classList.toggle('urgent', this.comboGraceMoves === 1);
      this.comboCountText.innerText = `${this.comboStreak}x CLEAR!`;

      const multiplier = 1 + (this.comboStreak - 1) * 0.75;
      this.comboMultiplierText.innerText = `+${Math.round((multiplier - 1) * 100)}% PTS`;

      if (this.comboDots) {
        let dotsHtml = '';
        for (let i = 1; i <= this.MAX_COMBO_GRACE; i++) {
          if (i <= this.comboGraceMoves) {
            dotsHtml += '<span class="dot">●</span>';
          } else {
            dotsHtml += '<span class="dot empty">○</span>';
          }
        }
        this.comboDots.innerHTML = dotsHtml;
      }
    }

    showComboFeedback(combo, lines, multiplier) {
      // 1. Update Top Combo Meter Pill: "(N)x CLEAR!"
      this.updateComboGraceUI();

      // 2. Floating Popup Text
      let text = `${combo}x CLEAR!`;
      let isMega = false;

      if (combo >= 4 || lines >= 3) {
        isMega = true;
        text = lines >= 3 ? `🔥 ${combo}x CLEAR! (MEGA BLAST) 🔥` : `⚡ ${combo}x CLEAR! (UNSTOPPABLE) ⚡`;
      } else if (lines === 2) {
        text = `💥 ${combo}x CLEAR! (DOUBLE) 💥`;
      } else {
        text = `✨ ${combo}x CLEAR! ✨`;
      }

      this.comboPopup.innerText = text;
      this.comboPopup.classList.toggle('mega', isMega);
      this.comboPopup.classList.remove('show');
      void this.comboPopup.offsetWidth;
      this.comboPopup.classList.add('show');

      clearTimeout(this.comboTimer);
      this.comboTimer = setTimeout(() => {
        this.comboPopup.classList.remove('show');
      }, 1000);
    }

    hideComboMeter() {
      this.comboMeter.classList.add('hidden');
      this.comboPopup.classList.remove('show');
    }

    updateScoreUI() {
      this.scoreDisplay.innerText = this.score;
      this.scoreDisplay.classList.remove('pop');
      void this.scoreDisplay.offsetWidth;
      this.scoreDisplay.classList.add('pop');

      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.highScoreDisplay.innerText = this.highScore;
        localStorage.setItem('neon_puzzle_high_score', this.highScore.toString());
      }
    }

    triggerGameOver() {
      this.isGameOver = true;
      this.sound.playGameOver();
      this.hideComboMeter();

      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.highScoreDisplay.innerText = this.highScore;
        localStorage.setItem('neon_puzzle_high_score', this.highScore.toString());
      }

      this.modalScore.innerText = this.score;
      this.modalBest.innerText = this.highScore;
      this.modalLines.innerText = this.totalLinesCleared;
      this.modalCombos.innerText = `${this.maxCombo}x CLEAR`;

      setTimeout(() => {
        this.modalOverlay.classList.remove('hidden');
      }, 500);
    }

    clearGhost() {
      for (let r = 0; r < this.GRID_SIZE; r++) {
        for (let c = 0; c < this.GRID_SIZE; c++) {
          if (this.board[r][c] === null) {
            this.cellElements[r][c].className = 'cell';
          }
        }
      }
    }

    showGhost(matrix, color, startR, startC) {
      this.clearGhost();
      const rows = matrix.length;
      const cols = matrix[0].length;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (matrix[r][c]) {
            const tr = startR + r;
            const tc = startC + c;
            if (tr >= 0 && tr < this.GRID_SIZE && tc >= 0 && tc < this.GRID_SIZE) {
              if (this.board[tr][tc] === null) {
                this.cellElements[tr][tc].className = `cell ghost color-${color}`;
              }
            }
          }
        }
      }
    }

    /**
     * Exact pixel-level grid calculation matching the rendered preview proxy
     */
    getGridCellFromProxy(proxyCenterX, proxyCenterY, shapeMatrix, cellSize, gap) {
      const shapeRows = shapeMatrix.length;
      const shapeCols = shapeMatrix[0].length;

      const proxyWidth = shapeCols * cellSize + (shapeCols - 1) * gap;
      const proxyHeight = shapeRows * cellSize + (shapeRows - 1) * gap;

      const proxyTopLeftX = proxyCenterX - proxyWidth / 2;
      const proxyTopLeftY = proxyCenterY - proxyHeight / 2;

      const firstCellRect = this.cellElements[0][0].getBoundingClientRect();
      const cellStep = cellSize + gap;

      // Find the row and col index where top-left tile of shape aligns with board
      const col = Math.round((proxyTopLeftX - firstCellRect.left) / cellStep);
      const row = Math.round((proxyTopLeftY - firstCellRect.top) / cellStep);

      return { row, col };
    }

    // --- Drag and Drop & Interaction Handling ---
    bindEvents() {
      // 1. Pointer Down on Dock Slots
      this.dockSlots.forEach((slot, slotIndex) => {
        slot.addEventListener('pointerdown', (e) => {
          if (this.isGameOver || !this.dock[slotIndex]) return;
          if (slot.classList.contains('disabled')) return;

          e.preventDefault();
          this.sound.playPickup();

          // Deselect any click-selected slot
          if (this.selectedSlotIndex !== null) {
            this.dockSlots[this.selectedSlotIndex].classList.remove('selected');
            this.selectedSlotIndex = null;
          }

          const shape = this.dock[slotIndex];
          const isTouch = e.pointerType === 'touch';
          const touchOffsetY = isTouch ? -65 : 0; // Natural touch offset so thumb doesn't cover piece

          // Measure current board cell size and gap exactly
          const firstCellRect = this.cellElements[0][0].getBoundingClientRect();
          const secondCellRect = this.cellElements[0][1].getBoundingClientRect();
          const cellSize = firstCellRect.width;
          const gap = secondCellRect.left - firstCellRect.right;

          // Create Drag Proxy
          const proxy = document.createElement('div');
          proxy.className = 'drag-proxy';
          proxy.style.setProperty('--proxy-cell-size', `${cellSize}px`);
          proxy.style.gap = `${gap}px`;

          const rows = shape.matrix.length;
          const cols = shape.matrix[0].length;

          proxy.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
          proxy.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;

          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const cell = document.createElement('div');
              if (shape.matrix[r][c]) {
                cell.className = `shape-cell color-${shape.color}`;
              }
              proxy.appendChild(cell);
            }
          }

          document.body.appendChild(proxy);
          proxy.style.left = `${e.clientX}px`;
          proxy.style.top = `${e.clientY + touchOffsetY}px`;

          slot.style.opacity = '0.25';

          this.dragState = {
            slotIndex: slotIndex,
            shape: shape,
            proxy: proxy,
            cellSize: cellSize,
            gap: gap,
            touchOffsetY: touchOffsetY,
            pointerId: e.pointerId
          };

          // Window-level move and end listeners to never lose drag tracking
          const onPointerMove = (moveEvt) => {
            if (!this.dragState || this.dragState.pointerId !== moveEvt.pointerId) return;

            const posX = moveEvt.clientX;
            const posY = moveEvt.clientY + this.dragState.touchOffsetY;

            this.dragState.proxy.style.left = `${posX}px`;
            this.dragState.proxy.style.top = `${posY}px`;

            const { row, col } = this.getGridCellFromProxy(
              posX,
              posY,
              this.dragState.shape.matrix,
              this.dragState.cellSize,
              this.dragState.gap
            );

            if (this.canPlace(this.dragState.shape.matrix, row, col)) {
              this.showGhost(this.dragState.shape.matrix, this.dragState.shape.color, row, col);
            } else {
              this.clearGhost();
            }
          };

          const onPointerEnd = (endEvt) => {
            if (!this.dragState || this.dragState.pointerId !== endEvt.pointerId) return;

            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerEnd);
            window.removeEventListener('pointercancel', onPointerEnd);

            const posX = endEvt.clientX;
            const posY = endEvt.clientY + this.dragState.touchOffsetY;

            const { row, col } = this.getGridCellFromProxy(
              posX,
              posY,
              this.dragState.shape.matrix,
              this.dragState.cellSize,
              this.dragState.gap
            );

            if (this.canPlace(this.dragState.shape.matrix, row, col)) {
              this.executePlacement(this.dragState.slotIndex, row, col);
            } else {
              slot.style.opacity = '1';
            }

            this.clearGhost();
            if (this.dragState.proxy && this.dragState.proxy.parentNode) {
              this.dragState.proxy.parentNode.removeChild(this.dragState.proxy);
            }

            this.dragState = null;
          };

          window.addEventListener('pointermove', onPointerMove);
          window.addEventListener('pointerup', onPointerEnd);
          window.addEventListener('pointercancel', onPointerEnd);
        });
      });

      // 2. Click-to-Place Alternative Support
      this.dockSlots.forEach((slot, slotIndex) => {
        slot.addEventListener('click', (e) => {
          if (this.isGameOver || !this.dock[slotIndex] || slot.classList.contains('disabled')) return;

          if (this.selectedSlotIndex === slotIndex) {
            this.selectedSlotIndex = null;
            slot.classList.remove('selected');
            this.clearGhost();
          } else {
            this.dockSlots.forEach(s => s.classList.remove('selected'));
            this.selectedSlotIndex = slotIndex;
            slot.classList.add('selected');
            this.sound.playPickup();
          }
        });
      });

      // Board Cell Clicks (when a piece is selected)
      for (let r = 0; r < this.GRID_SIZE; r++) {
        for (let c = 0; c < this.GRID_SIZE; c++) {
          const cell = this.cellElements[r][c];
          cell.addEventListener('click', () => {
            if (this.selectedSlotIndex === null || this.isGameOver) return;

            const slotIndex = this.selectedSlotIndex;
            const shape = this.dock[slotIndex];
            if (shape && this.canPlace(shape.matrix, r, c)) {
              this.selectedSlotIndex = null;
              this.executePlacement(slotIndex, r, c);
            }
          });

          cell.addEventListener('pointerenter', () => {
            if (this.selectedSlotIndex === null || this.isGameOver) return;
            const shape = this.dock[this.selectedSlotIndex];
            if (shape && this.canPlace(shape.matrix, r, c)) {
              this.showGhost(shape.matrix, shape.color, r, c);
            } else {
              this.clearGhost();
            }
          });
        }
      }

      this.boardEl.addEventListener('pointerleave', () => {
        if (!this.dragState) {
          this.clearGhost();
        }
      });

      // 3. UI Buttons
      this.btnRestart.addEventListener('click', () => this.startNewGame());
      this.btnHeaderRestart.addEventListener('click', () => this.startNewGame());
      
      if (this.btnTheme) {
        this.btnTheme.addEventListener('click', () => {
          this.nextTheme();
          this.sound.playPickup();
        });
      }

      this.btnMute.addEventListener('click', () => {
        const muted = this.sound.toggleMute();
        this.soundIcon.innerHTML = muted
          ? `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`
          : `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`;
      });
    }
  }

  // Initialize Game on Load
  window.addEventListener('DOMContentLoaded', () => {
    window.neonPuzzleGame = new NeonPuzzleGame();
  });
})();
