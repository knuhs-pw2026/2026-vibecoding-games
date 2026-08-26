/**
 * 네온 서바이벌 (NEON SURVIVORS) 메인 게임 루프 및 통합 제어기
 */

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // 게임 상태: 'TITLE' | 'PLAYING' | 'LEVEL_UP' | 'PAUSED' | 'GAME_OVER'
    this.state = 'TITLE';
    this.lastTime = 0;
    this.gameTime = 0;

    // 카메라
    this.camera = { x: 0, y: 0, width: 0, height: 0 };

    // 서브시스템 인스턴스
    this.player = new Player((level) => this.onPlayerLevelUp(level));
    this.weaponSystem = new WeaponSystem(this.player);
    this.enemyManager = new EnemyManager(this.player);
    this.upgradeManager = new UpgradeManager(this.player, this.weaponSystem);

    // 최고 기록 관리
    this.bestTime = parseInt(localStorage.getItem('neon_best_time') || '0', 10);
    this.bestKills = parseInt(localStorage.getItem('neon_best_kills') || '0', 10);
    this.bestLevel = parseInt(localStorage.getItem('neon_best_level') || '1', 10);

    // DOM 요소 캐싱
    this.initDOM();

    // 이벤트 리스너 등록
    this.bindEvents();

    // 캔버스 크기 초기화
    this.resizeCanvas();

    // 메인 루프 시작
    requestAnimationFrame((t) => this.loop(t));
  }

  initDOM() {
    this.dom = {
      startScreen: document.getElementById('start-screen'),
      hud: document.getElementById('hud'),
      levelupModal: document.getElementById('levelup-modal'),
      pauseModal: document.getElementById('pause-modal'),
      gameoverModal: document.getElementById('gameover-modal'),
      
      titleBestTime: document.getElementById('title-best-time'),
      titleBestKills: document.getElementById('title-best-kills'),
      titleBestLevel: document.getElementById('title-best-level'),

      hudLevel: document.getElementById('hud-level'),
      hudXpFill: document.getElementById('hud-xp-fill'),
      hudXpCur: document.getElementById('hud-xp-cur'),
      hudXpMax: document.getElementById('hud-xp-max'),
      hudHpFill: document.getElementById('hud-hp-fill'),
      hudShieldFill: document.getElementById('hud-shield-fill'),
      hudHpCur: document.getElementById('hud-hp-cur'),
      hudHpMax: document.getElementById('hud-hp-max'),
      hudDashFill: document.getElementById('hud-dash-fill'),
      hudTimer: document.getElementById('hud-timer'),
      hudWaveTag: document.getElementById('hud-wave-tag'),
      hudKills: document.getElementById('hud-kills'),
      hudGems: document.getElementById('hud-gems'),
      hudWeaponsList: document.getElementById('hud-weapons-list'),

      upgradeCards: document.getElementById('upgrade-cards'),
      btnReroll: document.getElementById('btn-reroll'),
      rerollCount: document.getElementById('reroll-count'),

      pauseTime: document.getElementById('pause-time'),
      pauseKills: document.getElementById('pause-kills'),
      pauseLevel: document.getElementById('pause-level'),

      resultTime: document.getElementById('result-time'),
      resultKills: document.getElementById('result-kills'),
      resultLevel: document.getElementById('result-level'),
      resultDamage: document.getElementById('result-damage'),
      resultBestTime: document.getElementById('result-best-time'),
      resultBestKills: document.getElementById('result-best-kills'),
      resultBestLevel: document.getElementById('result-best-level'),
      newRecordBanner: document.getElementById('new-record-banner'),

      bossHpContainer: document.getElementById('boss-hp-container'),
      bossNameText: document.getElementById('boss-name-text'),
      bossHpFill: document.getElementById('boss-hp-fill'),
      bossHpCur: document.getElementById('boss-hp-cur'),
      bossHpMax: document.getElementById('boss-hp-max'),
      hudSynergiesList: document.getElementById('hud-synergies-list'),

      btnStart: document.getElementById('btn-start'),
      btnAudioToggle: document.getElementById('btn-audio-toggle'),
      btnPause: document.getElementById('btn-pause'),
      btnResume: document.getElementById('btn-resume'),
      btnRestartPause: document.getElementById('btn-restart-pause'),
      btnRestart: document.getElementById('btn-restart'),
      btnTitle: document.getElementById('btn-title'),

      volumeBgm: document.getElementById('volume-bgm'),
      volumeSfx: document.getElementById('volume-sfx'),
      toggleScreenshake: document.getElementById('toggle-screenshake'),
      toggleDamagetext: document.getElementById('toggle-damagetext'),

      joystickZone: document.getElementById('joystick-zone'),
      joystickThumb: document.getElementById('joystick-thumb'),
      btnTouchDash: document.getElementById('btn-touch-dash')
    };

    this.updateTitleRecords();
  }

  updateTitleRecords() {
    this.dom.titleBestTime.innerText = this.formatTime(this.bestTime);
    this.dom.titleBestKills.innerText = this.bestKills.toLocaleString();
    if (this.dom.titleBestLevel) {
      this.dom.titleBestLevel.innerText = 'LV.' + this.bestLevel;
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    // 키보드 입력
    window.addEventListener('keydown', (e) => {
      if (this.state === 'PLAYING') {
        if (e.code === 'Space') {
          e.preventDefault();
          this.player.dash();
        } else if (e.code === 'Escape' || e.code === 'KeyP') {
          this.pauseGame();
        }
      } else if (this.state === 'PAUSED') {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          this.resumeGame();
        }
      }
      this.player.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.player.keys[e.code] = false;
    });

    // UI 버튼 이벤트
    this.dom.btnStart.addEventListener('click', () => {
      window.soundManager.init();
      window.soundManager.playClick();
      this.startGame();
    });

    this.dom.btnAudioToggle.addEventListener('click', () => {
      const isMuted = !window.soundManager.toggleMute();
      this.dom.btnAudioToggle.innerText = isMuted ? '🔇' : '🔊';
    });

    this.dom.btnPause.addEventListener('click', () => this.pauseGame());
    this.dom.btnResume.addEventListener('click', () => this.resumeGame());
    this.dom.btnRestartPause.addEventListener('click', () => {
      this.dom.pauseModal.classList.add('hidden');
      this.startGame();
    });
    this.dom.btnRestart.addEventListener('click', () => {
      this.dom.gameoverModal.classList.add('hidden');
      this.startGame();
    });
    this.dom.btnTitle.addEventListener('click', () => {
      this.dom.gameoverModal.classList.add('hidden');
      this.showTitleScreen();
    });

    // 설정 슬라이더
    this.dom.volumeBgm.addEventListener('input', (e) => {
      window.soundManager.setBgmVolume(e.target.value / 100);
    });
    this.dom.volumeSfx.addEventListener('input', (e) => {
      window.soundManager.setSfxVolume(e.target.value / 100);
    });
    this.dom.toggleScreenshake.addEventListener('change', (e) => {
      window.particleSystem.enableScreenShake = e.target.checked;
    });
    this.dom.toggleDamagetext.addEventListener('change', (e) => {
      window.particleSystem.enableDamageText = e.target.checked;
    });

    // 리롤 버튼
    this.dom.btnReroll.addEventListener('click', () => {
      if (this.upgradeManager.rerolls > 0) {
        this.upgradeManager.rerolls--;
        this.renderUpgradeCards();
      }
    });

    // 모바일 터치 조이스틱
    this.bindTouchControls();
  }

  bindTouchControls() {
    let touchId = null;
    let startX = 0;
    let startY = 0;
    const maxRadius = 45;

    const handleTouchStart = (e) => {
      if (touchId !== null) return;
      const touch = e.changedTouches[0];
      touchId = touch.identifier;
      const rect = this.dom.joystickZone.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    };

    const handleTouchMove = (e) => {
      if (touchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchId) {
          const dx = touch.clientX - startX;
          const dy = touch.clientY - startY;
          const dist = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx);
          const clampedDist = Math.min(dist, maxRadius);

          const thumbX = Math.cos(angle) * clampedDist;
          const thumbY = Math.sin(angle) * clampedDist;
          this.dom.joystickThumb.style.transform = `translate(${thumbX}px, ${thumbY}px)`;

          if (dist > 8) {
            this.player.touchVector = {
              x: Math.cos(angle) * (clampedDist / maxRadius),
              y: Math.sin(angle) * (clampedDist / maxRadius)
            };
          } else {
            this.player.touchVector = { x: 0, y: 0 };
          }
          break;
        }
      }
    };

    const handleTouchEnd = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          touchId = null;
          this.dom.joystickThumb.style.transform = 'translate(0px, 0px)';
          this.player.touchVector = { x: 0, y: 0 };
          break;
        }
      }
    };

    this.dom.joystickZone.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    this.dom.btnTouchDash.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.player.dash();
    });
  }

  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.camera.width = window.innerWidth;
    this.camera.height = window.innerHeight;
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
  }

  // --- 게임 상태 전이 ---

  startGame() {
    this.state = 'PLAYING';
    this.gameTime = 0;

    this.player.reset();
    this.weaponSystem.clear();
    this.enemyManager.clear();
    this.upgradeManager.reset();
    window.particleSystem.clear();

    this.dom.startScreen.classList.remove('active');
    this.dom.hud.classList.remove('hidden');
    this.dom.levelupModal.classList.add('hidden');
    this.dom.pauseModal.classList.add('hidden');
    this.dom.gameoverModal.classList.add('hidden');

    this.updateHUDWeapons();
    window.soundManager.startBGM();
  }

  pauseGame() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    window.soundManager.playClick();

    this.dom.pauseTime.innerText = this.formatTime(this.gameTime);
    this.dom.pauseKills.innerText = this.enemyManager.totalKills.toLocaleString();
    this.dom.pauseLevel.innerText = this.player.level;
    this.dom.pauseModal.classList.remove('hidden');
  }

  resumeGame() {
    if (this.state !== 'PAUSED') return;
    window.soundManager.playClick();
    this.dom.pauseModal.classList.add('hidden');
    this.state = 'PLAYING';
  }

  showTitleScreen() {
    this.state = 'TITLE';
    window.soundManager.stopBGM();
    this.dom.hud.classList.add('hidden');
    this.dom.startScreen.classList.add('active');
    this.updateTitleRecords();
  }

  gameOver() {
    this.state = 'GAME_OVER';
    window.soundManager.stopBGM();
    window.soundManager.playGameOver();

    // 최고 기록 갱신 체크 (생존시간, 킬수, 레벨)
    const isNewRecord = this.gameTime > this.bestTime || 
                        this.enemyManager.totalKills > this.bestKills || 
                        this.player.level > this.bestLevel;

    if (this.gameTime > this.bestTime) {
      this.bestTime = Math.floor(this.gameTime);
      localStorage.setItem('neon_best_time', this.bestTime.toString());
    }
    if (this.enemyManager.totalKills > this.bestKills) {
      this.bestKills = this.enemyManager.totalKills;
      localStorage.setItem('neon_best_kills', this.bestKills.toString());
    }
    if (this.player.level > this.bestLevel) {
      this.bestLevel = this.player.level;
      localStorage.setItem('neon_best_level', this.bestLevel.toString());
    }

    // 이번 게임 결과 표시
    this.dom.resultTime.innerText = this.formatTime(this.gameTime);
    this.dom.resultKills.innerText = this.enemyManager.totalKills.toLocaleString();
    this.dom.resultLevel.innerText = this.player.level;
    this.dom.resultDamage.innerText = Math.round(this.enemyManager.totalDamageDealt).toLocaleString();

    // 역대 최고 기록 표시
    if (this.dom.resultBestTime) this.dom.resultBestTime.innerText = this.formatTime(this.bestTime);
    if (this.dom.resultBestKills) this.dom.resultBestKills.innerText = this.bestKills.toLocaleString();
    if (this.dom.resultBestLevel) this.dom.resultBestLevel.innerText = 'LV.' + this.bestLevel;

    if (isNewRecord) {
      this.dom.newRecordBanner.classList.remove('hidden');
    } else {
      this.dom.newRecordBanner.classList.add('hidden');
    }

    this.dom.gameoverModal.classList.remove('hidden');
  }

  // --- 레벨업 모달 처리 ---

  onPlayerLevelUp(level) {
    this.state = 'LEVEL_UP';
    this.renderUpgradeCards();
    this.dom.levelupModal.classList.remove('hidden');
  }

  renderUpgradeCards() {
    const choices = this.upgradeManager.getRandomChoices(3);
    this.dom.upgradeCards.innerHTML = '';

    this.dom.rerollCount.innerText = this.upgradeManager.rerolls;
    this.dom.btnReroll.disabled = this.upgradeManager.rerolls <= 0;

    choices.forEach((choice) => {
      const card = document.createElement('div');
      const isEvo = choice.isEvolution;
      card.className = `upgrade-card type-${choice.type} ${isEvo ? 'type-evolved' : ''}`;
      
      let typeLabel = choice.type === 'weapon' ? 'WEAPON' : 'PASSIVE';
      if (isEvo) typeLabel = '👑 FINAL EVOLUTION';

      let levelLabel = '';
      if (choice.currentLevel === 0) {
        levelLabel = '✨ NEW!';
      } else if (isEvo) {
        levelLabel = '👑 LV.5 ➜ 🔥 FINAL EVOLVE';
      } else {
        levelLabel = `LV.${choice.currentLevel} ➜ LV.${choice.nextLevel}`;
      }

      card.innerHTML = `
        <div class="upgrade-type-tag">${typeLabel}</div>
        <div class="upgrade-icon">${choice.icon}</div>
        <div class="upgrade-name">${choice.name}</div>
        <div class="upgrade-level-label ${isEvo ? 'evolved-label' : ''}">${levelLabel}</div>
        <div class="upgrade-desc">${choice.desc}</div>
      `;

      card.addEventListener('click', () => {
        if (isEvo) {
          window.soundManager.playLevelUp();
          window.particleSystem.triggerShake(14, 0.45);
          window.particleSystem.emitShockwave(this.player.x, this.player.y, 140, '#ffff00', 0.5);
          window.particleSystem.emit(this.player.x, this.player.y, 35, '#ff00ff', 200, 5, 0.6);
        } else {
          window.soundManager.playClick();
        }

        this.upgradeManager.selectUpgrade(choice);
        this.dom.levelupModal.classList.add('hidden');
        this.updateHUDWeapons();
        this.updateHUDSynergies();
        this.state = 'PLAYING';
      });

      this.dom.upgradeCards.appendChild(card);
    });
  }

  updateHUDWeapons() {
    const list = this.upgradeManager.getActiveList();
    this.dom.hudWeaponsList.innerHTML = '';

    list.forEach((item) => {
      const badge = document.createElement('div');
      badge.className = `weapon-slot-badge ${item.isEvolved ? 'evolved-slot' : ''}`;
      badge.title = item.name;
      badge.innerHTML = `
        <span>${item.icon}</span>
        <div class="weapon-level-badge ${item.isEvolved ? 'evolved-badge' : ''}">${item.level}</div>
      `;
      this.dom.hudWeaponsList.appendChild(badge);
    });
  }

  updateHUDSynergies() {
    const list = this.upgradeManager.getActiveSynergies();
    this.dom.hudSynergiesList.innerHTML = '';

    list.forEach((syn) => {
      const badge = document.createElement('div');
      badge.className = 'synergy-badge';
      badge.title = syn.desc;
      badge.innerHTML = `
        <span>⚡ ${syn.name}</span>
      `;
      this.dom.hudSynergiesList.appendChild(badge);
    });
  }

  // --- 메인 루프 ---

  loop(currentTime) {
    if (!this.lastTime) this.lastTime = currentTime;
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1); // 최대 0.1s 델타타임 캡
    this.lastTime = currentTime;

    if (this.state === 'PLAYING') {
      this.update(dt);
    }

    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    this.gameTime += dt;

    // 플레이어 갱신
    this.player.update(dt);

    // 무기 및 투사체 갱신
    this.weaponSystem.update(dt, this.enemyManager);

    // 적 군단 및 젬 갱신
    this.enemyManager.update(dt, this.gameTime);

    // 파티클 & 화면 효과 갱신
    window.particleSystem.update(dt);

    // 카메라 추적 (부드러운 러프)
    const targetCamX = this.player.x - this.camera.width / 2;
    const targetCamY = this.player.y - this.camera.height / 2;
    this.camera.x += (targetCamX - this.camera.x) * 0.15;
    this.camera.y += (targetCamY - this.camera.y) * 0.15;

    // HUD 동기화
    this.updateHUD();

    // 사망 체크
    if (this.player.hp <= 0) {
      this.gameOver();
    }
  }

  updateHUD() {
    // 1. 타이머 & 웨이브
    this.dom.hudTimer.innerText = this.formatTime(this.gameTime);
    this.dom.hudWaveTag.innerText = `웨이브 ${this.enemyManager.waveNumber}`;

    // 2. 처치 수 & 젬
    this.dom.hudKills.innerText = this.enemyManager.totalKills.toLocaleString();
    this.dom.hudGems.innerText = this.player.totalGemsCollected.toLocaleString();

    // 3. 레벨 & XP 바
    this.dom.hudLevel.innerText = this.player.level;
    const xpPercent = Math.min(100, (this.player.xp / this.player.maxXp) * 100);
    this.dom.hudXpFill.style.width = `${xpPercent}%`;
    this.dom.hudXpCur.innerText = this.player.xp;
    this.dom.hudXpMax.innerText = this.player.maxXp;

    // 4. HP & 쉴드 바
    const hpPercent = Math.max(0, Math.min(100, (this.player.hp / this.player.maxHp) * 100));
    this.dom.hudHpFill.style.width = `${hpPercent}%`;
    this.dom.hudHpCur.innerText = Math.ceil(this.player.hp);
    this.dom.hudHpMax.innerText = this.player.maxHp;

    if (this.player.maxShield > 0) {
      const shieldPercent = Math.min(100, (this.player.shield / this.player.maxShield) * 100);
      this.dom.hudShieldFill.style.width = `${shieldPercent}%`;
    } else {
      this.dom.hudShieldFill.style.width = '0%';
    }

    // 5. 대시 쿨다운 게이지
    const actualDashCd = this.player.dashCooldown * this.player.stats.cooldownMult;
    const dashRatio = this.player.dashTimer <= 0 ? 1 : (1 - this.player.dashTimer / actualDashCd);
    this.dom.hudDashFill.style.width = `${dashRatio * 100}%`;

    // 6. 상단 거대 엘리트 보스 HP 바 갱신
    const boss = this.enemyManager.activeBoss;
    if (boss && boss.hp > 0) {
      this.dom.bossHpContainer.classList.remove('hidden');
      this.dom.bossNameText.innerText = boss.name;
      const bossHpRatio = Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100));
      this.dom.bossHpFill.style.width = `${bossHpRatio}%`;
      this.dom.bossHpCur.innerText = Math.ceil(boss.hp).toLocaleString();
      this.dom.bossHpMax.innerText = boss.maxHp.toLocaleString();
    } else {
      this.dom.bossHpContainer.classList.add('hidden');
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // --- 렌더링 ---

  render() {
    const ctx = this.ctx;
    const w = this.camera.width;
    const h = this.camera.height;

    // 캔버스 클리어
    ctx.fillStyle = '#060813';
    ctx.fillRect(0, 0, w, h);

    // 화면 흔들림 오프셋 합성 카메라
    const renderCam = {
      x: this.camera.x + window.particleSystem.shakeOffsetX,
      y: this.camera.y + window.particleSystem.shakeOffsetY
    };

    // 1. 사이버펑크 무한 배경 그리드 드로잉
    this.renderGrid(ctx, renderCam);

    // 2. 적 군단 & 드롭 젬 렌더링
    this.enemyManager.render(ctx, renderCam);

    // 3. 무기 & 투사체 & 레이저 렌더링
    this.weaponSystem.render(ctx, renderCam);

    // 4. 플레이어 렌더링
    this.player.render(ctx, renderCam);

    // 5. 파티클 및 플로팅 대미지 텍스트 렌더링
    window.particleSystem.render(ctx, renderCam);
  }

  renderGrid(ctx, camera) {
    const gridSize = 60;
    const startX = -((camera.x % gridSize) + gridSize);
    const startY = -((camera.y % gridSize) + gridSize);

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.045)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let x = startX; x < this.camera.width + gridSize; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.camera.height);
    }
    for (let y = startY; y < this.camera.height + gridSize; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.camera.width, y);
    }
    ctx.stroke();

    // 주요 그리드 교차점 라이트 포인트 (180px 주기)
    const majorGrid = 180;
    const mStartX = Math.floor(camera.x / majorGrid) * majorGrid;
    const mStartY = Math.floor(camera.y / majorGrid) * majorGrid;

    ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    for (let gx = mStartX; gx < camera.x + this.camera.width + majorGrid; gx += majorGrid) {
      for (let gy = mStartY; gy < camera.y + this.camera.height + majorGrid; gy += majorGrid) {
        const sx = gx - camera.x;
        const sy = gy - camera.y;
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}

// 브라우저 로드 시 게임 인스턴스 초기화
function initNeonGame() {
  if (!window.game) {
    window.game = new Game();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNeonGame);
} else {
  initNeonGame();
}

