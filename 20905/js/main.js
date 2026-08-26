// main.js - Master Game Loop, Stage Management & UI Integration
import { CONFIG } from './config.js';
import { SpriteManager } from './gfx/sprites.js';
import { AudioManager } from './engine/audio.js';
import { InputManager } from './engine/input.js';
import { ParticleManager } from './engine/particle.js';
import { CanvasEngine } from './engine/canvas.js';
import { MapGenerator } from './world/maps.js';
import { Player } from './entities/player.js';
import { Zombie } from './entities/zombie.js';
import { BossZombie } from './entities/boss.js';
import { Item } from './entities/item.js';

class Game {
  constructor() {
    this.state = 'TITLE'; // 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY'
    this.currentStageId = 1;

    // Core Systems
    this.canvasEngine = new CanvasEngine('gameCanvas');
    this.sprites = new SpriteManager();
    this.audio = new AudioManager();
    this.input = new InputManager();
    this.particles = new ParticleManager();

    // Minimap Canvas
    this.minimapCanvas = document.getElementById('minimapCanvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;

    // Entities
    this.player = null;
    this.tilemap = null;
    this.zombies = [];
    this.boss = null;
    this.arrows = [];
    this.enemyProjectiles = [];
    this.items = [];
    this.stageObjective = null;

    // Timing
    this.lastTime = 0;
    this.stageKills = 0;
    this.gameStartTime = 0;
    this.totalKills = 0;

    this.initUI();
    this.bindControls();
    this.setupStage(1);

    // Start requestAnimationFrame loop
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  initUI() {
    // 1. Title Screen -> Story Prologue
    document.getElementById('btnStart')?.addEventListener('click', () => {
      this.audio.ensureContext();
      this.showStoryPrologue();
    });

    // 2. Story Prologue -> Back to Title
    document.getElementById('btnBackToTitle')?.addEventListener('click', () => {
      document.getElementById('storyScreen')?.classList.add('hidden');
      document.getElementById('titleScreen')?.classList.remove('hidden');
    });

    // 3. Story Prologue -> Begin Adventure
    document.getElementById('btnBeginAdventure')?.addEventListener('click', () => {
      this.startGame();
    });

    // 4. Game Over & Victory Restart
    document.getElementById('btnRestart')?.addEventListener('click', () => this.restartGame());
    document.getElementById('btnVictoryRestart')?.addEventListener('click', () => this.restartGame());

    // 5. Sound Toggle
    document.getElementById('btnSound')?.addEventListener('click', (e) => {
      const muted = this.audio.toggleMute();
      e.target.innerText = muted ? '🔇 음소거 해제' : '🔊 사운드 ON';
    });

    // 6. Dismiss In-Game Radio Popup
    document.getElementById('btnDismissRadio')?.addEventListener('click', () => {
      document.getElementById('radioTransmission')?.classList.add('hidden');
    });

    // 7. Stage Warp Dropdown
    const stageSelect = document.getElementById('stageSelect');
    if (stageSelect) {
      stageSelect.addEventListener('change', (e) => {
        const stageNum = parseInt(e.target.value, 10);
        if (stageNum >= 1 && stageNum <= 7) {
          this.setupStage(stageNum);
          if (this.state === 'TITLE') this.state = 'PLAYING';
          document.getElementById('titleScreen')?.classList.add('hidden');
          document.getElementById('storyScreen')?.classList.add('hidden');
        }
      });
    }

    // 8. Touch Virtual Controls
    this.input.bindVirtualControls({
      btnUp: document.getElementById('touchUp'),
      btnDown: document.getElementById('touchDown'),
      btnLeft: document.getElementById('touchLeft'),
      btnRight: document.getElementById('touchRight'),
      btnShoot: document.getElementById('touchShoot'),
      btnJump: document.getElementById('touchJump')
    });
  }

  showStoryPrologue() {
    document.getElementById('titleScreen')?.classList.add('hidden');
    document.getElementById('storyScreen')?.classList.remove('hidden');
  }

  bindControls() {
    window.addEventListener('resize', () => this.canvasEngine.resize());
  }

  startGame() {
    this.state = 'PLAYING';
    document.getElementById('titleScreen')?.classList.add('hidden');
    document.getElementById('storyScreen')?.classList.add('hidden');
    document.getElementById('gameOverScreen')?.classList.add('hidden');
    document.getElementById('victoryScreen')?.classList.add('hidden');

    this.audio.ensureContext();
    this.audio.startBGM(this.currentStageId);
    this.gameStartTime = Date.now();

    // Trigger initial radio dialogue
    this.triggerRadioTransmission(
      `"레온! 들리나? 자네 집 밖 마을에 좀비 떼가 몰려왔네. 활을 챙겨 밖으로 나가 탈출구를 열게!"`,
      'DR. IAN (닥터 이안)'
    );
  }

  restartGame() {
    this.currentStageId = 1;
    this.totalKills = 0;
    this.setupStage(1);
    this.startGame();
  }

  triggerRadioTransmission(message, sender = 'DR. IAN (닥터 이안)') {
    const radioElem = document.getElementById('radioTransmission');
    const msgElem = document.getElementById('radioMessage');
    if (radioElem && msgElem) {
      msgElem.innerText = message;
      radioElem.classList.remove('hidden');
      if (this.audio) this.audio.playPotion(); // subtle radio beep

      // Auto dismiss after 7.5 seconds
      if (this.radioTimer) clearTimeout(this.radioTimer);
      this.radioTimer = setTimeout(() => {
        radioElem.classList.add('hidden');
      }, 7500);
    }
  }

  setupStage(stageId) {
    this.currentStageId = stageId;
    this.particles.clear();
    this.arrows = [];
    this.enemyProjectiles = [];
    this.stageKills = 0;

    // Load Stage Data
    const stageData = MapGenerator.createStage(stageId);
    this.tilemap = stageData.tilemap;
    this.stageObjective = stageData.objective;

    // Trigger Stage Radio Transmission
    const stageTransmissions = {
      1: `"레온, 집 앞마당을 가로질러 마을로 향하는 통로를 확보하게!"`,
      2: `"마을 중심부에 고립되었군! 일반 좀비 50마리를 처치해 탈출 경로를 확보하게!"`,
      3: `"고속도로를 거대한 뮤턴트 좀비가 막고 있네! 주먹과 도약 공격의 붉은 경고 범위를 피하게!"`,
      4: `"대도시 광장에 도달했군! 지하 진입로 전력을 복구하려면 3곳의 비상 발전기를 가동해야 하네!"`,
      5: `"비밀 연구지역 진입 완료! 본동 격리문을 열기 위해 보안 데이터 칩 3개를 회수하게!"`,
      6: `"연구실 최심부 오염 구역일세! 3개의 격리 밸브를 모두 차단해 최종 보스 챔버 에어로크를 열게!"`,
      7: `"최종 보스 챔버일세! 10x10 크기의 바이러스 변이 모체 보스를 쓰러뜨리고 [기적의 백신]을 탈환하게!"`
    };

    if (stageTransmissions[stageId]) {
      this.triggerRadioTransmission(stageTransmissions[stageId]);
    }

    // Spawn Player
    if (!this.player) {
      this.player = new Player(stageData.playerStart.x, stageData.playerStart.y);
    } else {
      this.player.x = stageData.playerStart.x;
      this.player.y = stageData.playerStart.y;
      this.player.hp = Math.max(50, this.player.hp); // Refill some HP on stage transition
      this.player.isDead = false;
    }

    // Spawn Zombies
    this.zombies = [];
    if (stageData.zombieSpawns) {
      stageData.zombieSpawns.forEach(zData => {
        const z = new Zombie(zData.x, zData.y, zData.type);
        if (zData.isTarget) z.isStageTarget = true;
        this.zombies.push(z);
      });
    }

    // Spawn Boss if Stage 7
    if (stageData.isBossStage) {
      this.boss = new BossZombie(stageData.bossStart.x, stageData.bossStart.y);
      this.boss.initPhase1(this.zombies, this.particles, this.audio);
    } else {
      this.boss = null;
    }

    // Spawn Items
    this.items = [];
    if (stageData.items) {
      stageData.items.forEach(iData => {
        this.items.push(new Item(iData));
      });
    }

    // Update UI Elements
    this.updateStageUI();
    this.audio.startBGM(stageId);

    // Update Stage selector dropdown
    const stageSelect = document.getElementById('stageSelect');
    if (stageSelect) stageSelect.value = stageId;

    // Notification toast
    const meta = CONFIG.STAGES.find(s => s.id === stageId);
    if (meta) {
      this.particles.addFloatingText(`STAGE ${stageId}: ${meta.name}`, this.player.x, this.player.y - 40, '#38bdf8', 18);
    }
  }

  checkStageProgression() {
    if (!this.tilemap || !this.player) return;

    // 1. Check Objective Completion
    if (this.stageObjective) {
      if (this.stageObjective.type === 'kill_count') {
        if (this.stageKills >= this.stageObjective.targetKills) {
          this.tilemap.isExitOpen = true;
        }
      } else if (this.stageObjective.type === 'kill_mutant') {
        const targetMutantAlive = this.zombies.some(z => z.type === 'MUTANT' && z.isStageTarget && !z.isDead);
        if (!targetMutantAlive) {
          this.tilemap.isExitOpen = true;
        }
      } else if (this.stageObjective.type === 'collect_items') {
        if (this.stageObjective.currentCount >= this.stageObjective.requiredCount) {
          this.tilemap.isExitOpen = true;
        }
      }
    }

    // 2. Check Player Touching Exit Portal
    if (this.tilemap.exitTile && this.tilemap.isExitOpen) {
      const exitPx = (this.tilemap.exitTile.x + 0.5) * CONFIG.TILE_SIZE;
      const exitPy = (this.tilemap.exitTile.y + 0.5) * CONFIG.TILE_SIZE;
      const dist = Math.hypot(this.player.x - exitPx, this.player.y - exitPy);

      if (dist < 24) {
        // Advance to next stage!
        this.audio.playStageClear();
        if (this.currentStageId < 7) {
          this.setupStage(this.currentStageId + 1);
        }
      }
    }
  }

  gameLoop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = Math.min(0.06, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;

    // Handle Pause
    if (this.input.consumePause()) {
      if (this.state === 'PLAYING') {
        this.state = 'PAUSED';
        document.getElementById('pauseOverlay')?.classList.remove('hidden');
      } else if (this.state === 'PAUSED') {
        this.state = 'PLAYING';
        document.getElementById('pauseOverlay')?.classList.add('hidden');
      }
    }

    // Handle Digit stage warp shortcuts (1-7)
    const digit = this.input.consumeDigit();
    if (digit && digit >= 1 && digit <= 7) {
      this.setupStage(digit);
      if (this.state === 'TITLE') this.state = 'PLAYING';
    }

    if (this.state === 'PLAYING') {
      this.update(dt);
    }

    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    // 1. Update Player
    this.player.update(dt, this.input, this.tilemap, this.audio, this.particles, this.arrows);

    // Check Game Over
    if (this.player.isDead) {
      this.state = 'GAMEOVER';
      document.getElementById('gameOverScreen')?.classList.remove('hidden');
      return;
    }

    // 2. Update Arrows (Player Projectiles)
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const arrow = this.arrows[i];
      arrow.update(dt, this.tilemap, this.particles);

      if (!arrow.active) {
        this.arrows.splice(i, 1);
        continue;
      }

      // Check collision with Boss
      if (this.boss && !this.boss.isDead) {
        const distToBoss = Math.hypot(arrow.x - this.boss.x, arrow.y - this.boss.y);
        if (distToBoss < this.boss.radius) {
          arrow.active = false;
          this.boss.takeHit(1, this.zombies, this.items, this.audio, this.particles);
          this.arrows.splice(i, 1);
          continue;
        }
      }

      // Check collision with Boss Phase 2 Homing Balls (can be shot down by 2 arrows!)
      if (this.boss && this.boss.homingBalls) {
        for (let b = 0; b < this.boss.homingBalls.length; b++) {
          const ball = this.boss.homingBalls[b];
          if (ball.active && Math.hypot(arrow.x - ball.x, arrow.y - ball.y) < ball.radius + 10) {
            arrow.active = false;
            ball.takeHit(1, this.particles);
            break;
          }
        }
        if (!arrow.active) {
          this.arrows.splice(i, 1);
          continue;
        }
      }

      // Check collision with Zombies
      for (let z = 0; z < this.zombies.length; z++) {
        const zombie = this.zombies[z];
        if (zombie.isDead || zombie.isAirborne) continue;

        const dist = Math.hypot(arrow.x - zombie.x, arrow.y - zombie.y);
        if (dist < zombie.radius + 10) {
          arrow.active = false;
          zombie.takeHit(1, this.zombies, this.player, this.audio, this.particles);

          if (zombie.isDead) {
            this.stageKills++;
            this.totalKills++;
            this.player.kills++;
          }
          break;
        }
      }

      if (!arrow.active) {
        this.arrows.splice(i, 1);
      }
    }

    // 3. Update Enemy Projectiles (Shooting zombie balls)
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const proj = this.enemyProjectiles[i];
      proj.update(dt, this.tilemap, this.player, this.audio, this.particles);
      if (!proj.active) {
        this.enemyProjectiles.splice(i, 1);
      }
    }

    // 4. Update Zombies
    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const zombie = this.zombies[i];
      zombie.update(dt, this.player, this.tilemap, this.zombies, this.enemyProjectiles, this.audio, this.particles);
      // Clean up dead normal/shooting zombies after a moment
      if (zombie.isDead && zombie.type !== 'MUTANT') {
        this.zombies.splice(i, 1);
      }
    }

    // 5. Update Boss if active
    if (this.boss) {
      this.boss.update(dt, this.player, this.zombies, this.items, this.audio, this.particles);
    }

    // 6. Update Items (Potions, Vaccine, Keycards)
    this.items.forEach(item => {
      item.update(dt, this.player, this.stageObjective, this.audio, this.particles, () => this.handleGameWin());
    });

    // 7. Update Particles, Telegraphs & Screen Shake
    this.particles.update(dt);

    // 8. Stage Progression Checks
    this.checkStageProgression();

    // 9. Update UI HUD
    this.updateHUD();
  }

  handleGameWin() {
    this.state = 'VICTORY';
    this.audio.stopBGM();
    document.getElementById('victoryScreen')?.classList.remove('hidden');

    // Display Stats
    const elapsedSec = Math.floor((Date.now() - this.gameStartTime) / 1000);
    const min = Math.floor(elapsedSec / 60);
    const sec = elapsedSec % 60;
    const timeStr = `${min}분 ${sec}초`;

    document.getElementById('statTime').innerText = timeStr;
    document.getElementById('statKills').innerText = `${this.totalKills} 마리`;
    document.getElementById('statArrows').innerText = `${this.player.arrowsShot} 발`;
  }

  updateHUD() {
    if (!this.player) return;

    // HP Bar (100 HP = 10 blocks)
    const hp = Math.max(0, this.player.hp);
    const hpPercentage = (hp / this.player.maxHp) * 100;
    const hpBarFill = document.getElementById('hpBarFill');
    const hpText = document.getElementById('hpText');
    if (hpBarFill) hpBarFill.style.width = `${hpPercentage}%`;
    if (hpText) hpText.innerText = `${hp} / 100 HP (${Math.ceil(hp / 10)} 칸)`;

    // Jump Ready indicator
    const jumpCheck = this.tilemap ? this.tilemap.canJumpOver(this.player.x, this.player.y, this.player.dir) : { canJump: false };
    const jumpBadge = document.getElementById('jumpBadge');
    if (jumpBadge) {
      if (jumpCheck.canJump) {
        jumpBadge.className = 'badge ready';
        jumpBadge.innerText = 'SPACE: 점프 가능!';
      } else {
        jumpBadge.className = 'badge disabled';
        jumpBadge.innerText = 'SPACE: 장애물 필요';
      }
    }

    // Bow Ready indicator
    const bowBadge = document.getElementById('bowBadge');
    if (bowBadge) {
      if (this.player.shootCooldown <= 0) {
        bowBadge.className = 'badge ready';
        bowBadge.innerText = 'R: 활 발사 준비';
      } else {
        bowBadge.className = 'badge disabled';
        bowBadge.innerText = 'R: 장전 중...';
      }
    }

    // Objective Text with Nearest Quest Target Compass
    const objectiveElem = document.getElementById('objectiveText');
    if (objectiveElem && this.stageObjective) {
      if (this.stageObjective.type === 'kill_count') {
        objectiveElem.innerHTML = `목표: 일반 좀비 처치 <b>${this.stageKills} / ${this.stageObjective.targetKills}</b> ${this.tilemap.isExitOpen ? '👉 <span class="text-green">[탈출구 개방됨!]</span>' : ''}`;
      } else if (this.stageObjective.type === 'kill_mutant') {
        objectiveElem.innerHTML = `목표: 거대 뮤턴트 좀비 처치 ${this.tilemap.isExitOpen ? '👉 <span class="text-green">[톨게이트 개방됨!]</span>' : '<span class="text-red">[진행 중]</span>'}`;
      } else if (this.stageObjective.type === 'collect_items') {
        if (this.tilemap.isExitOpen) {
          objectiveElem.innerHTML = `목표: 모든 퀘스트 아이템 확보 완료! 👉 <span class="text-green">[진입로 개방됨!]</span>`;
        } else {
          // Find nearest uncollected quest item
          let nearest = null;
          let minDist = Infinity;
          this.items.forEach(it => {
            if (!it.collected && it.type !== 'potion') {
              const d = Math.hypot(it.x - this.player.x, it.y - this.player.y);
              if (d < minDist) {
                minDist = d;
                nearest = it;
              }
            }
          });

          const distMeters = Math.round(minDist / CONFIG.TILE_SIZE);
          let dirArrow = '📍';
          if (nearest) {
            const dx = nearest.x - this.player.x;
            const dy = nearest.y - this.player.y;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            if (angle >= -22.5 && angle < 22.5) dirArrow = '➡ 동쪽';
            else if (angle >= 22.5 && angle < 67.5) dirArrow = '⬊ 남동쪽';
            else if (angle >= 67.5 && angle < 112.5) dirArrow = '⬇ 남쪽';
            else if (angle >= 112.5 && angle < 157.5) dirArrow = '⬋ 남서쪽';
            else if (angle >= 157.5 || angle < -157.5) dirArrow = '⬅ 서쪽';
            else if (angle >= -157.5 && angle < -112.5) dirArrow = '⬉ 북서쪽';
            else if (angle >= -112.5 && angle < -67.5) dirArrow = '⬆ 북쪽';
            else if (angle >= -67.5 && angle < -22.5) dirArrow = '⬈ 북동쪽';
          }

          const guideStr = nearest ? ` <span class="text-blue">[${nearest.name}: ${dirArrow} ${distMeters}m]</span>` : '';
          objectiveElem.innerHTML = `목표: 퀘스트 아이템 <b>${this.stageObjective.currentCount} / ${this.stageObjective.requiredCount}</b>${guideStr}`;
        }
      } else if (this.stageObjective.type === 'defeat_boss') {
        objectiveElem.innerHTML = `목표: 보스 좀비 처치 & 백신 획득 ${this.boss ? `<span class="text-red">[Phase ${this.boss.phase}]</span>` : ''}`;
      } else {
        objectiveElem.innerText = this.stageObjective.text;
      }
    }
  }

  updateStageUI() {
    const meta = CONFIG.STAGES.find(s => s.id === this.currentStageId);
    if (!meta) return;

    const stageTitle = document.getElementById('stageTitle');
    const stageDesc = document.getElementById('stageDesc');
    if (stageTitle) stageTitle.innerText = `STAGE ${meta.id}: ${meta.name}`;
    if (stageDesc) stageDesc.innerText = meta.description;
  }

  render() {
    this.canvasEngine.clear();

    if (!this.tilemap || !this.player) return;

    // Update Camera
    const worldW = this.tilemap.width * CONFIG.TILE_SIZE;
    const worldH = this.tilemap.height * CONFIG.TILE_SIZE;
    const shake = this.particles.getScreenShakeOffset();
    this.canvasEngine.updateCamera(this.player, worldW, worldH, shake);

    const ctx = this.canvasEngine.ctx;
    const camera = this.canvasEngine.camera;

    // 1. Render World Tiles & Obstacles
    this.tilemap.render(ctx, this.sprites, camera);

    // 2. Render Items (Potions, Generators, Keycards, Valves, Vaccine)
    this.items.forEach(item => item.render(ctx, this.sprites, camera));

    // 3. Render Particles & Danger Telegraphs (Red Warning Zones)
    this.particles.render(ctx, camera);

    // 4. Render Entities sorted by Y coordinate for 2.5D depth
    const renderList = [];

    // Player
    renderList.push({ y: this.player.y, render: () => this.player.render(ctx, this.sprites, camera) });

    // Zombies
    this.zombies.forEach(z => {
      renderList.push({ y: z.y, render: () => z.render(ctx, this.sprites, camera) });
    });

    // Boss
    if (this.boss) {
      renderList.push({ y: this.boss.y, render: () => this.boss.render(ctx, this.sprites, camera) });
    }

    // Sort by Y and render
    renderList.sort((a, b) => a.y - b.y);
    renderList.forEach(item => item.render());

    // 5. Render Projectiles on top
    this.arrows.forEach(a => a.render(ctx, this.sprites, camera));
    this.enemyProjectiles.forEach(p => p.render(ctx, this.sprites, camera));

    // 6. Draw Atmospheric Vignette / Darkness
    this.canvasEngine.drawVignette(this.currentStageId);

    // 7. Draw Quest Off-Screen Direction Arrow if quest items are active
    this.drawQuestOffscreenGuides(ctx, camera);

    // 8. Draw Minimap
    this.canvasEngine.drawMinimap(
      this.minimapCtx,
      this.player,
      this.zombies,
      this.boss,
      this.items,
      this.tilemap,
      this.tilemap.exitTile
    );
  }

  // Draw off-screen quest indicator on canvas border
  drawQuestOffscreenGuides(ctx, camera) {
    if (!this.stageObjective || this.stageObjective.type !== 'collect_items' || this.tilemap.isExitOpen) return;

    this.items.forEach(it => {
      if (it.collected || it.type === 'potion') return;

      const screenX = it.x - camera.x;
      const screenY = it.y - camera.y;

      // Check if off-screen
      const margin = 24;
      const isOffScreen = screenX < margin || screenX > CONFIG.CANVAS_WIDTH - margin ||
                          screenY < margin || screenY > CONFIG.CANVAS_HEIGHT - margin;

      if (isOffScreen) {
        const cx = CONFIG.CANVAS_WIDTH / 2;
        const cy = CONFIG.CANVAS_HEIGHT / 2;
        const angle = Math.atan2(screenY - cy, screenX - cx);

        const edgeX = Math.max(margin, Math.min(CONFIG.CANVAS_WIDTH - margin, cx + Math.cos(angle) * (cx - margin)));
        const edgeY = Math.max(margin, Math.min(CONFIG.CANVAS_HEIGHT - margin, cy + Math.sin(angle) * (cy - margin)));

        ctx.save();
        ctx.fillStyle = '#06b6d4';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(edgeX, edgeY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🎯', edgeX, edgeY + 3);
        ctx.restore();
      }
    });
  }
}

// Instantiate Game on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
