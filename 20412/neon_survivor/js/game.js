// ============================================================================
// NEON SURVIVOR: OVERDRIVE - Main Game Loop & State Manager
// ============================================================================

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.state = 'TITLE'; // TITLE, PLAYING, PAUSED, LEVEL_UP, GAME_OVER, VICTORY
        this.lastTime = performance.now();

        this.player = new Player(0, 0);
        this.enemies = [];
        this.projectiles = [];
        this.enemyProjectiles = [];

        this.camera = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };

        // Input state
        this.input = {
            keys: {},
            mouseX: 0,
            mouseY: 0,
            isMouseDown: false,
            dashRequested: false,
            joystickActive: false,
            joystickX: 0,
            joystickY: 0
        };

        // Game Progress & Director
        this.gameTime = 0;
        this.spawnTimer = 0;
        this.spawnInterval = 1.0;
        this.wave = 1;
        this.bossSpawned = false;
        this.activeBoss = null;

        // Visual Polish
        this.screenShake = { intensity: 0, duration: 0, timer: 0 };
        this.screenNukeFlash = 0;
        this.screenShakeEnabled = true;

        // Statistics
        this.highScore = parseInt(localStorage.getItem('neon_high_score') || '0', 10);
        this.bestSurviveTime = parseFloat(localStorage.getItem('neon_best_time') || '0');

        this.init();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.bindEvents();
        this.updateHUDStats();

        // Start animation loop
        requestAnimationFrame((t) => this.loop(t));
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.width = window.innerWidth;
        this.camera.height = window.innerHeight;
    }

    bindEvents() {
        // Keyboard inputs
        window.addEventListener('keydown', (e) => {
            this.input.keys[e.code] = true;

            if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                if (this.state === 'PLAYING') {
                    this.input.dashRequested = true;
                }
            }

            if (e.code === 'Escape' || e.code === 'KeyP') {
                if (this.state === 'PLAYING') {
                    this.pauseGame();
                } else if (this.state === 'PAUSED') {
                    this.resumeGame();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            this.input.keys[e.code] = false;
        });

        // Mouse inputs
        window.addEventListener('mousemove', (e) => {
            this.input.mouseX = e.clientX;
            this.input.mouseY = e.clientY;
        });

        window.addEventListener('mousedown', (e) => {
            this.input.isMouseDown = true;
            if (this.state === 'PLAYING' && e.button === 2) {
                // Right click dash
                this.input.dashRequested = true;
            }
        });

        window.addEventListener('mouseup', () => {
            this.input.isMouseDown = false;
        });

        window.addEventListener('contextmenu', (e) => e.preventDefault());

        // Setup UI button handlers
        document.getElementById('start-btn')?.addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn')?.addEventListener('click', () => this.startGame());
        document.getElementById('victory-restart-btn')?.addEventListener('click', () => this.startGame());
        document.getElementById('resume-btn')?.addEventListener('click', () => this.resumeGame());
        document.getElementById('quit-btn')?.addEventListener('click', () => this.quitToTitle());
        document.getElementById('settings-btn')?.addEventListener('click', () => this.openSettings());
        document.getElementById('close-settings-btn')?.addEventListener('click', () => this.closeSettings());
        document.getElementById('reroll-btn')?.addEventListener('click', () => this.rerollLevelUpCards());

        // Audio controls
        const muteBtn = document.getElementById('mute-toggle-btn');
        muteBtn?.addEventListener('click', () => {
            if (window.soundEngine) {
                window.soundEngine.isMuted = !window.soundEngine.isMuted;
                muteBtn.textContent = window.soundEngine.isMuted ? '🔇' : '🔊';
            }
        });

        // Volume sliders
        document.getElementById('sfx-slider')?.addEventListener('input', (e) => {
            if (window.soundEngine) window.soundEngine.sfxVolume = parseFloat(e.target.value);
        });
        document.getElementById('bgm-slider')?.addEventListener('input', (e) => {
            if (window.soundEngine) window.soundEngine.bgmVolume = parseFloat(e.target.value);
        });
        document.getElementById('shake-toggle')?.addEventListener('change', (e) => {
            this.screenShakeEnabled = e.target.checked;
        });
    }

    startGame() {
        if (window.soundEngine) {
            window.soundEngine.resume();
            window.soundEngine.intensity = 1;
            window.soundEngine.startBGM();
        }

        this.player.reset(0, 0);
        this.enemies = [];
        this.projectiles = [];
        this.enemyProjectiles = [];
        window.particleSystem.reset();
        window.upgradeManager.reset();

        this.gameTime = 0;
        this.spawnTimer = 0;
        this.spawnInterval = 1.0;
        this.wave = 1;
        this.bossSpawned = false;
        this.activeBoss = null;

        this.hideAllModals();
        document.getElementById('title-screen').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        document.getElementById('boss-hud').classList.add('hidden');

        this.state = 'PLAYING';
        this.lastTime = performance.now();
    }

    pauseGame() {
        if (this.state !== 'PLAYING') return;
        this.state = 'PAUSED';
        document.getElementById('pause-modal').classList.remove('hidden');
    }

    resumeGame() {
        if (this.state !== 'PAUSED') return;
        this.hideAllModals();
        this.state = 'PLAYING';
        this.lastTime = performance.now();
    }

    quitToTitle() {
        this.hideAllModals();
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('title-screen').classList.remove('hidden');
        this.state = 'TITLE';
        if (window.soundEngine) {
            window.soundEngine.stopBGM();
        }
    }

    openSettings() {
        document.getElementById('settings-modal').classList.remove('hidden');
    }

    closeSettings() {
        document.getElementById('settings-modal').classList.add('hidden');
    }

    hideAllModals() {
        document.getElementById('pause-modal').classList.add('hidden');
        document.getElementById('settings-modal').classList.add('hidden');
        document.getElementById('level-up-modal').classList.add('hidden');
        document.getElementById('game-over-modal').classList.add('hidden');
        document.getElementById('victory-modal').classList.add('hidden');
    }

    triggerScreenShake(intensity = 6, duration = 0.25) {
        if (!this.screenShakeEnabled) return;
        this.screenShake = {
            intensity,
            duration,
            timer: duration
        };
    }

    triggerScreenNuke() {
        this.screenNukeFlash = 0.5;
        this.triggerScreenShake(12, 0.4);
        if (window.soundEngine) {
            window.soundEngine.playExplosion(3);
            window.soundEngine.playEMP();
        }

        // Damage / Destroy all non-boss enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            if (!e.isBoss) {
                e.takeDamage(999, true, '#ff0055');
            } else {
                e.takeDamage(250, true, '#ff0055');
            }
        }
    }

    onLevelUp() {
        this.state = 'LEVEL_UP';
        this.presentLevelUpCards();
    }

    presentLevelUpCards() {
        const modal = document.getElementById('level-up-modal');
        const container = document.getElementById('cards-container');
        container.innerHTML = '';

        const choices = window.upgradeManager.generateChoices(this.player, 3);
        const rerollBtn = document.getElementById('reroll-btn');
        if (rerollBtn) {
            rerollBtn.textContent = `리롤 (남음: ${window.upgradeManager.rerollsRemaining})`;
            rerollBtn.disabled = window.upgradeManager.rerollsRemaining <= 0;
        }

        choices.forEach((choice) => {
            const card = document.createElement('div');
            card.className = `upgrade-card rarity-${choice.rarity}`;

            card.innerHTML = `
                <div class="card-badge" style="background:${choice.color}22; color:${choice.color}; border:1px solid ${choice.color}">${choice.badge}</div>
                <div class="card-icon" style="text-shadow: 0 0 15px ${choice.color}">${choice.icon}</div>
                <div class="card-title" style="color:${choice.color}">${choice.name}</div>
                <div class="card-eng-name">${choice.engName}</div>
                <div class="card-desc">${choice.description}</div>
            `;

            card.addEventListener('click', () => {
                window.upgradeManager.applyChoice(this.player, choice);
                this.hideAllModals();
                this.updateHUDInventory();
                this.state = 'PLAYING';
                this.lastTime = performance.now();
            });

            container.appendChild(card);
        });

        modal.classList.remove('hidden');
    }

    rerollLevelUpCards() {
        if (window.upgradeManager.rerollsRemaining > 0) {
            window.upgradeManager.rerollsRemaining--;
            if (window.soundEngine) window.soundEngine.playPowerup();
            this.presentLevelUpCards();
        }
    }

    onEnemyKilled(enemy) {
        this.player.kills++;
        this.player.score += enemy.isBoss ? 5000 : (enemy.isElite ? 800 : 100);

        if (enemy.isBoss) {
            this.onBossDefeated();
        }
    }

    onPlayerDeath() {
        this.state = 'GAME_OVER';
        this.saveStats();

        document.getElementById('final-score').textContent = Math.floor(this.player.score).toLocaleString();
        document.getElementById('final-time').textContent = this.formatTime(this.gameTime);
        document.getElementById('final-kills').textContent = this.player.kills.toLocaleString();
        document.getElementById('final-level').textContent = this.player.level;

        document.getElementById('game-over-modal').classList.remove('hidden');
    }

    onBossDefeated() {
        this.activeBoss = null;
        document.getElementById('boss-hud').classList.add('hidden');
        window.particleSystem.spawnShockwave(this.player.x, this.player.y, '#ffd700', 300, 1.2, 10);

        setTimeout(() => {
            this.state = 'VICTORY';
            this.saveStats();
            document.getElementById('victory-score').textContent = Math.floor(this.player.score).toLocaleString();
            document.getElementById('victory-time').textContent = this.formatTime(this.gameTime);
            document.getElementById('victory-kills').textContent = this.player.kills.toLocaleString();
            document.getElementById('victory-modal').classList.remove('hidden');
        }, 1500);
    }

    saveStats() {
        if (this.player.score > this.highScore) {
            this.highScore = Math.floor(this.player.score);
            localStorage.setItem('neon_high_score', this.highScore.toString());
        }
        if (this.gameTime > this.bestSurviveTime) {
            this.bestSurviveTime = this.gameTime;
            localStorage.setItem('neon_best_time', this.bestSurviveTime.toString());
        }
        this.updateHUDStats();
    }

    updateHUDStats() {
        const hsEl = document.getElementById('hud-high-score');
        if (hsEl) hsEl.textContent = this.highScore.toLocaleString();
    }

    formatTime(sec) {
        const mins = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    // --- Enemy Director & Spawner ---
    updateDirector(dt) {
        this.gameTime += dt;
        this.spawnTimer -= dt;

        // Dynamic difficulty progression
        const minutes = this.gameTime / 60;
        const difficultyScale = 1 + minutes * 0.45;

        // Sound intensity adaptation
        if (window.soundEngine && !this.activeBoss) {
            window.soundEngine.intensity = minutes > 2.5 ? 2 : 1;
        }

        // Boss Spawn Check at 4:00 (240s) or for testing scaling
        if (this.gameTime >= 240 && !this.bossSpawned) {
            this.bossSpawned = true;
            this.spawnBoss();
        }

        // Periodic Spawn Rate
        const currentInterval = Math.max(0.2, 1.2 - minutes * 0.2);
        if (this.spawnTimer <= 0 && !this.activeBoss) {
            this.spawnTimer = currentInterval;
            this.spawnWave(difficultyScale);
        }
    }

    spawnBoss() {
        const angle = Math.random() * Math.PI * 2;
        const dist = 500;
        const bx = this.player.x + Math.cos(angle) * dist;
        const by = this.player.y + Math.sin(angle) * dist;

        this.activeBoss = new BossOverlord(bx, by);
        this.enemies.push(this.activeBoss);

        document.getElementById('boss-hud').classList.remove('hidden');
        document.getElementById('boss-name').textContent = 'CYBER TITAN OVERLORD';
    }

    spawnWave(difficultyScale) {
        const spawnDist = 650;
        const count = Math.min(25, Math.floor(4 + (this.gameTime / 20)));

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const sx = this.player.x + Math.cos(angle) * (spawnDist + Math.random() * 150);
            const sy = this.player.y + Math.sin(angle) * (spawnDist + Math.random() * 150);

            // Determine enemy type by minute
            const roll = Math.random();
            if (this.gameTime > 180 && roll < 0.08) {
                this.enemies.push(new EliteGoliath(sx, sy, difficultyScale));
            } else if (this.gameTime > 120 && roll < 0.25) {
                this.enemies.push(new SniperDrone(sx, sy, difficultyScale));
            } else if (this.gameTime > 60 && roll < 0.45) {
                this.enemies.push(new KamikazeDrone(sx, sy, difficultyScale));
            } else if (this.gameTime > 30 && roll < 0.65) {
                this.enemies.push(new ShieldMech(sx, sy, difficultyScale));
            } else {
                this.enemies.push(new CyberSwarmer(sx, sy, difficultyScale));
            }
        }
    }

    // --- Main Game Loop ---
    loop(currentTime) {
        const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
        this.lastTime = currentTime;

        if (this.state === 'PLAYING') {
            this.update(dt);
        }

        this.render();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        // Screen Shake update
        if (this.screenShake.timer > 0) {
            this.screenShake.timer -= dt;
        }

        if (this.screenNukeFlash > 0) {
            this.screenNukeFlash -= dt;
        }

        // Director
        this.updateDirector(dt);

        // Player
        this.player.update(dt, this.input, this.enemies);

        // Camera follow (smooth lerp)
        const targetCamX = this.player.x - this.camera.width / 2;
        const targetCamY = this.player.y - this.camera.height / 2;
        this.camera.x += (targetCamX - this.camera.x) * 0.12;
        this.camera.y += (targetCamY - this.camera.y) * 0.12;

        // Update Projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            const alive = p.update(dt, this.enemies);
            if (!alive) {
                this.projectiles.splice(i, 1);
                continue;
            }

            // Projectile vs Enemy collisions
            for (let j = 0; j < this.enemies.length; j++) {
                const e = this.enemies[j];
                if (p.hitEnemies.has(e)) continue;

                const dist = Math.hypot(p.x - e.x, p.y - e.y);
                if (dist < p.radius + e.radius) {
                    p.hitEnemies.add(e);
                    e.takeDamage(p.damage, p.isCrit, p.color);
                    window.particleSystem.spawnSparks(p.x, p.y, p.color, 4, 3, 2, 0.2);

                    // Area splash damage
                    if (p.splashRadius > 0) {
                        window.particleSystem.spawnExplosion(p.x, p.y, p.color, 1.2);
                        for (const other of this.enemies) {
                            if (other === e) continue;
                            const sDist = Math.hypot(p.x - other.x, p.y - other.y);
                            if (sDist < p.splashRadius) {
                                other.takeDamage(p.damage * 0.7, p.isCrit, p.color);
                            }
                        }
                    }

                    p.pierce--;
                    if (p.pierce <= 0) {
                        this.projectiles.splice(i, 1);
                        break;
                    }
                }
            }
        }

        // Update Enemy Projectiles
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const ep = this.enemyProjectiles[i];
            ep.x += ep.vx * dt * 60;
            ep.y += ep.vy * dt * 60;
            ep.life -= dt;

            if (ep.life <= 0) {
                this.enemyProjectiles.splice(i, 1);
                continue;
            }

            // Hit player
            const pDist = Math.hypot(ep.x - this.player.x, ep.y - this.player.y);
            if (pDist < ep.radius + this.player.radius) {
                this.player.takeDamage(ep.damage);
                window.particleSystem.spawnSparks(ep.x, ep.y, ep.color, 4, 3, 2, 0.2);
                this.enemyProjectiles.splice(i, 1);
            }
        }

        // Update Enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            if (e.hp <= 0) {
                this.enemies.splice(i, 1);
                continue;
            }
            e.update(dt, this.player, this.enemies);
        }

        // Update Particles, Gems, Pickups
        window.particleSystem.update(dt, this.player);

        // Update HUD
        this.updateHUD();
    }

    updateHUD() {
        // Health Bar & Shield Bar
        const hpBar = document.getElementById('hud-hp-fill');
        const hpText = document.getElementById('hud-hp-text');
        const shieldBar = document.getElementById('hud-shield-fill');
        const dashBar = document.getElementById('hud-dash-fill');
        const expBar = document.getElementById('hud-exp-fill');
        const levelEl = document.getElementById('hud-level');
        const scoreEl = document.getElementById('hud-score');
        const killsEl = document.getElementById('hud-kills');
        const timeEl = document.getElementById('hud-time');

        if (hpBar) {
            const hpPct = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
            hpBar.style.width = `${hpPct}%`;
        }
        if (hpText) {
            hpText.textContent = `${Math.ceil(this.player.hp)} / ${this.player.maxHp}`;
        }
        if (shieldBar) {
            const sPct = this.player.maxShield > 0 ? (this.player.shield / this.player.maxShield) * 100 : 0;
            shieldBar.style.width = `${sPct}%`;
        }
        if (dashBar) {
            const dCooldown = this.player.dashCooldown * this.player.dashCooldownMultiplier;
            const dPct = this.player.dashCooldownTimer > 0
                ? ((dCooldown - this.player.dashCooldownTimer) / dCooldown) * 100
                : 100;
            dashBar.style.width = `${dPct}%`;
        }
        if (expBar) {
            const expPct = (this.player.exp / this.player.expToNext) * 100;
            expBar.style.width = `${expPct}%`;
        }
        if (levelEl) levelEl.textContent = `LV.${this.player.level}`;
        if (scoreEl) scoreEl.textContent = Math.floor(this.player.score).toLocaleString();
        if (killsEl) killsEl.textContent = this.player.kills.toLocaleString();
        if (timeEl) timeEl.textContent = this.formatTime(this.gameTime);

        // Boss HUD
        if (this.activeBoss) {
            const bossFill = document.getElementById('boss-hp-fill');
            if (bossFill) {
                const bPct = Math.max(0, (this.activeBoss.hp / this.activeBoss.maxHp) * 100);
                bossFill.style.width = `${bPct}%`;
            }
        }
    }

    updateHUDInventory() {
        const wepContainer = document.getElementById('hud-weapons-container');
        const pasContainer = document.getElementById('hud-passives-container');

        if (wepContainer) {
            wepContainer.innerHTML = '';
            for (const [id, w] of this.player.weapons.entries()) {
                const icon = document.createElement('div');
                icon.className = `inv-slot ${w.isEvolved ? 'evolved' : ''}`;
                icon.innerHTML = `<span class="inv-emoji">${w.icon}</span><span class="inv-level">${w.isEvolved ? 'MAX' : 'L' + w.level}</span>`;
                wepContainer.appendChild(icon);
            }
        }

        if (pasContainer) {
            pasContainer.innerHTML = '';
            for (const [id, lvl] of this.player.passives.entries()) {
                const pInfo = window.PASSIVE_ITEMS[id];
                if (!pInfo) continue;
                const icon = document.createElement('div');
                icon.className = 'inv-slot';
                icon.innerHTML = `<span class="inv-emoji">${pInfo.icon}</span><span class="inv-level">L${lvl}</span>`;
                pasContainer.appendChild(icon);
            }
        }
    }

    // --- Rendering Engine ---
    render() {
        this.ctx.save();

        // Apply screen shake
        if (this.screenShake.timer > 0) {
            const progress = this.screenShake.timer / this.screenShake.duration;
            const offset = progress * this.screenShake.intensity;
            this.ctx.translate((Math.random() - 0.5) * offset * 2, (Math.random() - 0.5) * offset * 2);
        }

        // 1. Draw Deep Cyberpunk Background
        this.ctx.fillStyle = '#080914';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 2. Draw Scrolling Neon Arena Grid
        this.drawArenaGrid();

        // 3. Draw Arena Boundaries
        this.drawArenaBounds();

        // 4. Draw Particles, Pickups & XP Gems
        window.particleSystem.draw(this.ctx, this.camera);

        // 5. Draw Projectiles
        for (const p of this.projectiles) {
            p.draw(this.ctx, this.camera);
        }

        // 6. Draw Enemy Projectiles
        for (const ep of this.enemyProjectiles) {
            const sx = ep.x - this.camera.x;
            const sy = ep.y - this.camera.y;
            this.ctx.save();
            this.ctx.fillStyle = ep.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = ep.color;
            this.ctx.beginPath();
            this.ctx.arc(sx, sy, ep.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        // 7. Draw Enemies
        for (const e of this.enemies) {
            e.draw(this.ctx, this.camera);
        }

        // 8. Draw Player
        if (this.state === 'PLAYING' || this.state === 'LEVEL_UP' || this.state === 'PAUSED') {
            this.player.draw(this.ctx, this.camera);
        }

        // 9. Draw Screen Nuke Flash
        if (this.screenNukeFlash > 0) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${this.screenNukeFlash})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.ctx.restore();
    }

    drawArenaGrid() {
        const gridSize = 80;
        const offsetX = -this.camera.x % gridSize;
        const offsetY = -this.camera.y % gridSize;

        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(0, 229, 255, 0.07)';
        this.ctx.lineWidth = 1;

        this.ctx.beginPath();
        for (let x = offsetX; x < this.canvas.width; x += gridSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
        }
        for (let y = offsetY; y < this.canvas.height; y += gridSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
        }
        this.ctx.stroke();

        // High-tech subtle crosshairs at grid junctions
        this.ctx.fillStyle = 'rgba(0, 229, 255, 0.18)';
        for (let x = offsetX; x < this.canvas.width; x += gridSize * 2) {
            for (let y = offsetY; y < this.canvas.height; y += gridSize * 2) {
                this.ctx.fillRect(x - 2, y - 2, 4, 4);
            }
        }
        this.ctx.restore();
    }

    drawArenaBounds() {
        const arenaSize = 2400;
        const bx = -arenaSize - this.camera.x;
        const by = -arenaSize - this.camera.y;
        const bw = arenaSize * 2;
        const bh = arenaSize * 2;

        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 0, 85, 0.6)';
        this.ctx.lineWidth = 4;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#ff0055';
        this.ctx.strokeRect(bx, by, bw, bh);
        this.ctx.restore();
    }
}

// Global initialization on DOM ready
window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new Game();
});
