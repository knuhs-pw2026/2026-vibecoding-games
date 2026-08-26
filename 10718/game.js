/**
 * TUG OF WAR: HYPER CLASH
 * High-speed 2-Player Keyboard Rapid Mash Game
 */

const GameState = {
    MENU: 'MENU',
    COUNTDOWN: 'COUNTDOWN',
    PLAYING: 'PLAYING',
    ROUND_OVER: 'ROUND_OVER',
    GAME_OVER: 'GAME_OVER'
};

class TugOfWarGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = GameState.MENU;

        // Configuration & Mode
        this.mode = '2P'; // '2P' or 'AI'
        this.aiDifficulty = 'NORMAL'; // EASY, NORMAL, HARD, INSANE
        this.bestOf = 1; // 1판 1선승제 (기본값)
        this.targetWins = 1;

        // Score
        this.p1Wins = 0;
        this.p2Wins = 0;
        this.currentRound = 1;

        // 15-Second Match Timer
        this.matchDuration = 15.0;
        this.timeRemaining = 15.0;
        this.lastWarnInteger = 5;

        // Physics & Rope
        this.ropePos = 0; // -1.0 (P1 Wins) to +1.0 (P2 Wins)
        this.ropeVelocity = 0;
        this.ropeTension = 0;
        this.friction = 0.92;
        this.pullPower = 0.0035;
        this.winThreshold = 0.82;

        // Tap & CPS Trackers
        this.p1Taps = [];
        this.p2Taps = [];
        this.p1TotalTaps = 0;
        this.p2TotalTaps = 0;
        this.p1CurrentCPS = 0;
        this.p2CurrentCPS = 0;
        this.p1PeakCPS = 0;
        this.p2PeakCPS = 0;

        // Fever Mode
        this.p1Fever = false;
        this.p2Fever = false;
        this.p1FeverTimer = 0;
        this.p2FeverTimer = 0;

        // AI Settings
        this.aiNextTapTime = 0;
        this.aiTapInterval = 120; // ms

        // Visuals & FX
        this.particles = [];
        this.confetti = [];
        this.screenShake = 0;
        this.timeScale = 1.0;
        this.matchStartTime = 0;
        this.roundStartTime = 0;

        // DOM Elements
        this.cacheDOM();
        this.initEvents();
        this.resize();

        // Animation Loop
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    cacheDOM() {
        this.container = document.getElementById('game-container');
        this.p1CPSDisplay = document.getElementById('p1-cps');
        this.p2CPSDisplay = document.getElementById('p2-cps');
        this.p1PeakDisplay = document.getElementById('p1-peak');
        this.p2PeakDisplay = document.getElementById('p2-peak');
        this.p1FeverBadge = document.getElementById('p1-fever');
        this.p2FeverBadge = document.getElementById('p2-fever');
        this.tensionMarker = document.getElementById('tension-marker');
        this.p1Fill = document.getElementById('tension-fill-p1');
        this.p2Fill = document.getElementById('tension-fill-p2');
        this.p1Stars = document.getElementById('p1-stars');
        this.p2Stars = document.getElementById('p2-stars');
        this.countdownOverlay = document.getElementById('countdown-overlay');
        this.countdownText = document.getElementById('countdown-text');
        this.startModal = document.getElementById('start-modal');
        this.victoryModal = document.getElementById('victory-modal');
        this.victoryTitle = document.getElementById('victory-title');
        this.soundBtn = document.getElementById('sound-btn');
        this.timerDisplay = document.getElementById('match-timer');
    }

    initEvents() {
        window.addEventListener('resize', () => this.resize());

        // Keyboard Inputs (Anti-cheat: ignore auto-repeat)
        window.addEventListener('keydown', (e) => {
            if (e.repeat) return; // Prevent holding key down
            window.soundEngine.resume();

            if (this.state !== GameState.PLAYING) return;

            const code = e.code;
            // Player 1 Keys: A, W, S, D, Q, E
            if (['KeyA', 'KeyW', 'KeyS', 'KeyD', 'KeyQ', 'KeyE'].includes(code)) {
                this.registerTap(1);
            }

            // Player 2 Keys: L, I, O, P, K, Enter
            if (this.mode === '2P') {
                if (['KeyL', 'KeyI', 'KeyO', 'KeyP', 'KeyK', 'Enter', 'NumpadEnter'].includes(code)) {
                    this.registerTap(2);
                }
            }
        });

        // Touch buttons
        const leftTouch = document.getElementById('touch-left');
        const rightTouch = document.getElementById('touch-right');

        const handleTouchP1 = (e) => {
            e.preventDefault();
            window.soundEngine.resume();
            if (this.state === GameState.PLAYING) this.registerTap(1);
        };

        const handleTouchP2 = (e) => {
            e.preventDefault();
            window.soundEngine.resume();
            if (this.state === GameState.PLAYING && this.mode === '2P') this.registerTap(2);
        };

        leftTouch.addEventListener('touchstart', handleTouchP1, { passive: false });
        leftTouch.addEventListener('mousedown', handleTouchP1);

        rightTouch.addEventListener('touchstart', handleTouchP2, { passive: false });
        rightTouch.addEventListener('mousedown', handleTouchP2);

        // Sound Toggle
        this.soundBtn.addEventListener('click', () => {
            window.soundEngine.resume();
            const muted = window.soundEngine.toggleMute();
            this.soundBtn.innerHTML = muted ? '🔇 SOUND: OFF' : '🔊 SOUND: ON';
        });

        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                const target = e.currentTarget;
                target.classList.add('active');
                this.mode = target.dataset.mode;
                const diffGroup = document.getElementById('diff-selector');
                diffGroup.style.display = this.mode === 'AI' ? 'flex' : 'none';
                document.getElementById('p2-tag-name').innerText = this.mode === 'AI' ? 'BOT' : 'PLAYER 2';
            });
        });

        // Difficulty selection
        document.querySelectorAll('#diff-selector .diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#diff-selector .diff-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.aiDifficulty = e.currentTarget.dataset.diff;
            });
        });

        // Round format selection (1판 1선승, 3판 2선승, 5판 3선승)
        document.querySelectorAll('#round-selector .diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#round-selector .diff-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.bestOf = parseInt(e.currentTarget.dataset.rounds, 10);
                this.targetWins = Math.ceil(this.bestOf / 2);
            });
        });

        // Start Button
        document.getElementById('start-btn').addEventListener('click', () => {
            window.soundEngine.resume();
            this.startNewMatch();
        });

        // Rematch Button
        document.getElementById('rematch-btn').addEventListener('click', () => {
            this.victoryModal.classList.add('hidden');
            this.startNewMatch();
        });
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    registerTap(player) {
        const now = performance.now();
        if (player === 1) {
            this.p1Taps.push(now);
            this.p1TotalTaps++;
            const feverBonus = this.p1Fever ? 1.4 : 1.0;
            this.ropeVelocity -= this.pullPower * feverBonus;
            window.soundEngine.playTap(1, this.p1CurrentCPS);
            this.addPullParticles(1);
        } else {
            this.p2Taps.push(now);
            this.p2TotalTaps++;
            const feverBonus = this.p2Fever ? 1.4 : 1.0;
            this.ropeVelocity += this.pullPower * feverBonus;
            window.soundEngine.playTap(2, this.p2CurrentCPS);
            this.addPullParticles(2);
        }

        // Screen shake pulse
        this.screenShake = Math.min(this.screenShake + 1.2, 8);
    }

    startNewMatch() {
        this.p1Wins = 0;
        this.p2Wins = 0;
        this.currentRound = 1;
        this.p1PeakCPS = 0;
        this.p2PeakCPS = 0;
        this.p1TotalTaps = 0;
        this.p2TotalTaps = 0;
        this.confetti = [];
        this.updateStarUI();

        this.startModal.classList.add('hidden');
        this.victoryModal.classList.add('hidden');
        window.soundEngine.startBGM();

        this.startCountdown();
    }

    startCountdown() {
        this.state = GameState.COUNTDOWN;
        this.ropePos = 0;
        this.ropeVelocity = 0;
        this.p1Taps = [];
        this.p2Taps = [];
        this.p1Fever = false;
        this.p2Fever = false;
        this.timeScale = 1.0;
        this.timeRemaining = this.matchDuration;
        this.lastWarnInteger = 5;

        if (this.timerDisplay) {
            this.timerDisplay.innerText = `⏱️ ${this.matchDuration.toFixed(1)}s`;
            this.timerDisplay.classList.remove('urgent');
        }

        this.countdownOverlay.style.display = 'flex';
        let count = 3;
        this.countdownText.innerText = count;
        this.countdownText.style.color = '#ffd700';
        window.soundEngine.playCountdown(false);

        const timer = setInterval(() => {
            count--;
            if (count > 0) {
                this.countdownText.innerText = count;
                this.countdownText.style.color = count === 2 ? '#00f0ff' : '#ff2a5f';
                window.soundEngine.playCountdown(false);
            } else if (count === 0) {
                this.countdownText.innerText = 'PULL!';
                this.countdownText.style.color = '#00ff88';
                window.soundEngine.playCountdown(true);
            } else {
                clearInterval(timer);
                this.countdownOverlay.style.display = 'none';
                this.state = GameState.PLAYING;
                this.roundStartTime = performance.now();
            }
        }, 750);
    }

    updateAI(now, dt) {
        if (this.mode !== 'AI' || this.state !== GameState.PLAYING) return;

        // Target CPS based on difficulty
        let targetCPS = 5;
        let variance = 1.5;

        switch (this.aiDifficulty) {
            case 'EASY':
                targetCPS = 4.8;
                variance = 1.8;
                break;
            case 'NORMAL':
                targetCPS = 7.5;
                variance = 2.0;
                break;
            case 'HARD':
                targetCPS = 11.5;
                variance = 2.2;
                break;
            case 'INSANE':
                targetCPS = 15.5;
                variance = 3.0;
                break;
        }

        // Catch-up surge if losing
        if (this.ropePos < -0.3) {
            targetCPS += (this.aiDifficulty === 'INSANE' ? 4 : 2);
        }

        if (now >= this.aiNextTapTime) {
            this.registerTap(2);
            // Calculate next tap delay with randomized rhythm
            const dynamicCPS = targetCPS + (Math.random() * variance * 2 - variance);
            const interval = Math.max(45, 1000 / dynamicCPS);
            this.aiNextTapTime = now + interval;
        }
    }

    updateCPS(now) {
        const windowMs = 800; // 0.8s sliding window
        this.p1Taps = this.p1Taps.filter(t => now - t <= windowMs);
        this.p2Taps = this.p2Taps.filter(t => now - t <= windowMs);

        this.p1CurrentCPS = Math.round((this.p1Taps.length / (windowMs / 1000)) * 10) / 10;
        this.p2CurrentCPS = Math.round((this.p2Taps.length / (windowMs / 1000)) * 10) / 10;

        if (this.p1CurrentCPS > this.p1PeakCPS) this.p1PeakCPS = this.p1CurrentCPS;
        if (this.p2CurrentCPS > this.p2PeakCPS) this.p2PeakCPS = this.p2CurrentCPS;

        // Fever detection (> 7.5 CPS for Player)
        if (this.p1CurrentCPS >= 7.5) {
            if (!this.p1Fever) {
                this.p1Fever = true;
                window.soundEngine.playFever();
            }
        } else {
            this.p1Fever = false;
        }

        if (this.p2CurrentCPS >= 7.5) {
            if (!this.p2Fever) {
                this.p2Fever = true;
                window.soundEngine.playFever();
            }
        } else {
            this.p2Fever = false;
        }

        // Update HUD
        this.p1CPSDisplay.innerText = this.p1CurrentCPS.toFixed(1);
        this.p2CPSDisplay.innerText = this.p2CurrentCPS.toFixed(1);
        this.p1PeakDisplay.innerText = `PEAK: ${this.p1PeakCPS.toFixed(1)}`;
        this.p2PeakDisplay.innerText = `PEAK: ${this.p2PeakCPS.toFixed(1)}`;

        this.p1FeverBadge.style.display = this.p1Fever ? 'block' : 'none';
        this.p2FeverBadge.style.display = this.p2Fever ? 'block' : 'none';
    }

    updatePhysics(dt) {
        if (this.state !== GameState.PLAYING) return;

        // 15-Second Match Countdown
        this.timeRemaining = Math.max(0, this.timeRemaining - dt);
        if (this.timerDisplay) {
            this.timerDisplay.innerText = `⏱️ ${this.timeRemaining.toFixed(1)}s`;
            if (this.timeRemaining <= 5.0 && this.timeRemaining > 0) {
                this.timerDisplay.classList.add('urgent');
                const secFloor = Math.ceil(this.timeRemaining);
                if (secFloor <= this.lastWarnInteger && secFloor > 0) {
                    window.soundEngine.playTimeWarning();
                    this.lastWarnInteger = secFloor - 1;
                }
            }
        }

        if (this.timeRemaining <= 0) {
            this.handleTimeUp();
            return;
        }

        // Elastic center pull (gentle resistance)
        this.ropeVelocity -= this.ropePos * 0.0008;

        // Apply velocity & friction
        this.ropePos += this.ropeVelocity * this.timeScale;
        this.ropeVelocity *= Math.pow(this.friction, dt * 60);

        // Clamp
        this.ropePos = Math.max(-1.0, Math.min(1.0, this.ropePos));

        // Tension bar UI update
        const percent = ((this.ropePos + 1) / 2) * 100;
        this.tensionMarker.style.left = `${percent}%`;
        this.p1Fill.style.width = `${Math.max(0, 50 - (this.ropePos * 50))}%`;
        this.p2Fill.style.width = `${Math.max(0, 50 + (this.ropePos * 50))}%`;

        // Slow motion near win threshold
        if (Math.abs(this.ropePos) >= 0.7) {
            this.timeScale = 0.45;
        } else {
            this.timeScale = 1.0;
        }

        // Check Round Win (Instant KO)
        if (this.ropePos <= -this.winThreshold) {
            this.handleRoundWin(1, false);
        } else if (this.ropePos >= this.winThreshold) {
            this.handleRoundWin(2, false);
        }
    }

    handleTimeUp() {
        this.state = GameState.ROUND_OVER;
        window.soundEngine.playTimeUp();
        this.screenShake = 12;

        // Determine winner by rope advantage
        let winner = 1;
        if (this.ropePos > 0.001) {
            winner = 2;
        } else if (this.ropePos < -0.001) {
            winner = 1;
        } else {
            // Absolute tie: compare total taps
            winner = this.p1TotalTaps >= this.p2TotalTaps ? 1 : 2;
        }

        // Display TIME'S UP overlay
        this.countdownOverlay.style.display = 'flex';
        this.countdownText.innerText = "TIME'S UP!";
        this.countdownText.style.color = '#ff8c00';

        setTimeout(() => {
            this.countdownOverlay.style.display = 'none';
            this.handleRoundWin(winner, true);
        }, 1300);
    }

    handleRoundWin(winner, isTimeUp = false) {
        this.state = GameState.ROUND_OVER;
        window.soundEngine.playVictory();
        this.addConfetti();

        if (winner === 1) {
            this.p1Wins++;
        } else {
            this.p2Wins++;
        }

        this.updateStarUI();

        setTimeout(() => {
            if (this.p1Wins >= this.targetWins || this.p2Wins >= this.targetWins) {
                this.handleMatchGameOver(winner, isTimeUp);
            } else {
                this.currentRound++;
                this.startCountdown();
            }
        }, 1500);
    }

    handleMatchGameOver(winner, isTimeUp = false) {
        this.state = GameState.GAME_OVER;
        window.soundEngine.stopBGM();

        const winnerName = winner === 1 ? 'PLAYER 1' : (this.mode === 'AI' ? 'BOT' : 'PLAYER 2');
        const winnerColor = winner === 1 ? 'var(--p1-color)' : 'var(--p2-color)';

        const winType = isTimeUp ? '(15초 타임오버 판정승)' : '(KO 완승!)';
        this.victoryTitle.innerText = `🏆 ${winnerName} WINS!`;
        this.victoryTitle.style.color = winnerColor;

        const subTitle = document.querySelector('#victory-modal .modal-subtitle');
        if (subTitle) subTitle.innerText = `${winType} 경기 통계 및 연타 기록`;

        document.getElementById('stat-p1-taps').innerText = this.p1TotalTaps;
        document.getElementById('stat-p2-taps').innerText = this.p2TotalTaps;
        document.getElementById('stat-p1-peak').innerText = `${this.p1PeakCPS.toFixed(1)} CPS`;
        document.getElementById('stat-p2-peak').innerText = `${this.p2PeakCPS.toFixed(1)} CPS`;

        this.victoryModal.classList.remove('hidden');
    }

    updateStarUI() {
        this.p1Stars.innerHTML = '';
        this.p2Stars.innerHTML = '';

        for (let i = 0; i < this.targetWins; i++) {
            const s1 = document.createElement('div');
            s1.className = `star ${i < this.p1Wins ? 'active-p1' : ''}`;
            this.p1Stars.appendChild(s1);

            const s2 = document.createElement('div');
            s2.className = `star ${i < this.p2Wins ? 'active-p2' : ''}`;
            this.p2Stars.appendChild(s2);
        }
    }

    addPullParticles(player) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const charX = player === 1 ? w * 0.22 : w * 0.78;
        const charY = h * 0.65;

        // Foot friction sparks & dust
        for (let i = 0; i < 4; i++) {
            this.particles.push({
                x: charX + (Math.random() * 40 - 20),
                y: charY + 50,
                vx: (player === 1 ? -1 : 1) * (Math.random() * 4 + 2),
                vy: (Math.random() * -3) - 1,
                size: Math.random() * 5 + 2,
                color: player === 1 ? '#ff2a5f' : '#00f0ff',
                life: 1.0,
                decay: 0.04
            });
        }

        // Center knot tension spark
        const centerX = (w / 2) + (this.ropePos * (w * 0.3));
        const centerY = h * 0.6;
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: (Math.random() * 6 - 3),
                vy: (Math.random() * 6 - 3),
                size: Math.random() * 4 + 2,
                color: '#ffd700',
                life: 1.0,
                decay: 0.06
            });
        }
    }

    addConfetti() {
        const w = this.canvas.width;
        const colors = ['#ff2a5f', '#00f0ff', '#ffd700', '#00ff88', '#b000ff', '#ffffff'];
        for (let i = 0; i < 150; i++) {
            this.confetti.push({
                x: Math.random() * w,
                y: -20 - Math.random() * 100,
                vx: Math.random() * 6 - 3,
                vy: Math.random() * 5 + 3,
                size: Math.random() * 8 + 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotSpeed: Math.random() * 10 - 5,
                life: 1.0,
                decay: 0.005
            });
        }
    }

    // DRAWING & RENDERING
    render(now) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const ctx = this.ctx;

        ctx.save();
        // Screen shake
        if (this.screenShake > 0) {
            const shakeX = (Math.random() * 2 - 1) * this.screenShake;
            const shakeY = (Math.random() * 2 - 1) * this.screenShake;
            ctx.translate(shakeX, shakeY);
            this.screenShake *= 0.88;
            if (this.screenShake < 0.1) this.screenShake = 0;
        }

        ctx.clearRect(0, 0, w, h);

        // 1. Background Arena Grid & Lights
        this.renderArenaBackground(ctx, w, h, now);

        // 2. Win Boundary Danger Zones
        this.renderBoundaryZones(ctx, w, h);

        // 3. Characters & Rope
        this.renderRopeAndCharacters(ctx, w, h, now);

        // 4. Particles & Confetti
        this.renderParticles(ctx);

        ctx.restore();
    }

    renderArenaBackground(ctx, w, h, now) {
        // Dark metallic gradient floor
        const floorGrad = ctx.createLinearGradient(0, h * 0.45, 0, h);
        floorGrad.addColorStop(0, '#0c1020');
        floorGrad.addColorStop(1, '#05070e');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, h * 0.45, w, h * 0.55);

        // Grid lines on floor
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.lineWidth = 1.5;
        const gridSpacing = 45;
        for (let x = 0; x < w; x += gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(x, h * 0.45);
            ctx.lineTo(x + (x - w / 2) * 0.5, h);
            ctx.stroke();
        }

        // Stadium Spotlight Cones
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        
        // P1 Spot
        const spotP1 = ctx.createRadialGradient(w * 0.15, h * 0.2, 10, w * 0.25, h * 0.65, 350);
        spotP1.addColorStop(0, 'rgba(255, 42, 95, 0.18)');
        spotP1.addColorStop(1, 'transparent');
        ctx.fillStyle = spotP1;
        ctx.fillRect(0, 0, w / 2, h);

        // P2 Spot
        const spotP2 = ctx.createRadialGradient(w * 0.85, h * 0.2, 10, w * 0.75, h * 0.65, 350);
        spotP2.addColorStop(0, 'rgba(0, 240, 255, 0.18)');
        spotP2.addColorStop(1, 'transparent');
        ctx.fillStyle = spotP2;
        ctx.fillRect(w / 2, 0, w / 2, h);
        ctx.restore();
    }

    renderBoundaryZones(ctx, w, h) {
        const baseY = h * 0.68;

        // Center Marker Line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(w / 2, baseY - 60);
        ctx.lineTo(w / 2, baseY + 60);
        ctx.stroke();
        ctx.setLineDash([]);

        // P1 Win Zone (Left Line)
        const leftWinX = (w / 2) - (w * 0.3 * this.winThreshold);
        ctx.strokeStyle = 'rgba(255, 42, 95, 0.6)';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#ff2a5f';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(leftWinX, baseY - 70);
        ctx.lineTo(leftWinX, baseY + 70);
        ctx.stroke();

        // P2 Win Zone (Right Line)
        const rightWinX = (w / 2) + (w * 0.3 * this.winThreshold);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(rightWinX, baseY - 70);
        ctx.lineTo(rightWinX, baseY + 70);
        ctx.stroke();

        ctx.shadowBlur = 0; // Reset
    }

    renderRopeAndCharacters(ctx, w, h, now) {
        const p1AnchorX = w * 0.24;
        const p2AnchorX = w * 0.76;
        const ropeY = h * 0.61;

        // Center knot position
        const centerKnotX = (w / 2) + (this.ropePos * (w * 0.3));

        // Vibration jitter when high CPS
        const totalCPS = this.p1CurrentCPS + this.p2CurrentCPS;
        const jitterY = (Math.random() * 2 - 1) * Math.min(totalCPS * 0.4, 6);

        // --- DRAW CHARACTERS FIRST ---
        // Player 1 (Crimson Cyber Brawler - Left)
        const p1Lean = -20 - (this.p1CurrentCPS * 1.5) + (this.ropePos * 10);
        this.drawBrawler(ctx, p1AnchorX, ropeY, 1, p1Lean, this.p1Fever, now);

        // Player 2 (Azure Mech Titan - Right)
        const p2Lean = 20 + (this.p2CurrentCPS * 1.5) + (this.ropePos * 10);
        this.drawBrawler(ctx, p2AnchorX, ropeY, 2, p2Lean, this.p2Fever, now);

        // --- DRAW ROPE ---
        ctx.save();
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Outer glow
        ctx.strokeStyle = '#2e1c14';
        ctx.beginPath();
        ctx.moveTo(p1AnchorX, ropeY);
        ctx.quadraticCurveTo(centerKnotX, ropeY + 20 + jitterY, p2AnchorX, ropeY);
        ctx.stroke();

        // Inner braided texture
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#d4a373';
        ctx.stroke();

        // High tension energy core line
        ctx.lineWidth = 3;
        ctx.strokeStyle = this.ropePos < 0 ? 'var(--p1-color)' : 'var(--p2-color)';
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();

        // --- CENTER KNOT & RIBBON ---
        ctx.save();
        ctx.translate(centerKnotX, ropeY + 10 + jitterY);

        // Glowing center core orb
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        // Hanging red/cyan victory ribbons
        ctx.fillStyle = this.ropePos < 0 ? '#ff2a5f' : '#00f0ff';
        ctx.shadowColor = ctx.fillStyle;
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(5, 0);
        ctx.lineTo(8, 35 + Math.sin(now * 0.01) * 6);
        ctx.lineTo(0, 25);
        ctx.lineTo(-8, 35 + Math.sin(now * 0.01) * 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    drawBrawler(ctx, x, y, player, leanAngleDeg, isFever, now) {
        ctx.save();
        ctx.translate(x, y);

        const color = player === 1 ? '#ff2a5f' : '#00f0ff';
        const auraColor = player === 1 ? 'rgba(255, 42, 95, 0.4)' : 'rgba(0, 240, 255, 0.4)';
        const dir = player === 1 ? -1 : 1;

        // Fever Aura Flames
        if (isFever) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = auraColor;
            ctx.shadowColor = color;
            ctx.shadowBlur = 25;
            ctx.beginPath();
            ctx.arc(0, -10, 50 + Math.sin(now * 0.02) * 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Shadow under feet
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.ellipse(0, 50, 35, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body rotation according to exertion lean
        ctx.rotate((leanAngleDeg * Math.PI) / 180);

        // Legs (Stance bracing against floor)
        ctx.strokeStyle = '#182035';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';

        // Back leg
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(dir * 25, 48);
        ctx.stroke();

        // Front leg
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(dir * -20, 48);
        ctx.stroke();

        // Torso
        ctx.fillStyle = '#0f1424';
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.roundRect(-16, -35, 32, 45, 8);
        ctx.fill();
        ctx.stroke();

        // Glowing Armor Core / Symbol
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, -15, 6, 0, Math.PI * 2);
        ctx.fill();

        // Head / Helmet
        ctx.fillStyle = '#161c2e';
        ctx.beginPath();
        ctx.arc(0, -50, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Glowing Visor
        ctx.fillStyle = color;
        ctx.fillRect(-dir * 2 - 8, -54, 16, 5);

        // Arms gripping rope
        ctx.strokeStyle = '#1d273e';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(0, -25);
        ctx.lineTo(dir * -28, 0);
        ctx.stroke();

        // Glowing Gauntlet / Fist
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(dir * -28, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    renderParticles(ctx) {
        // Regular particles (sparks, dust)
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Confetti
        for (let i = this.confetti.length - 1; i >= 0; i--) {
            const c = this.confetti[i];
            c.x += c.vx;
            c.y += c.vy;
            c.rotation += c.rotSpeed;
            c.life -= c.decay;

            if (c.life <= 0 || c.y > this.canvas.height + 50) {
                this.confetti.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = c.life;
            ctx.translate(c.x, c.y);
            ctx.rotate((c.rotation * Math.PI) / 180);
            ctx.fillStyle = c.color;
            ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
            ctx.restore();
        }
    }

    // MAIN GAME LOOP
    loop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        this.updateAI(timestamp, dt);
        this.updateCPS(timestamp);
        this.updatePhysics(dt);
        this.render(timestamp);

        requestAnimationFrame((t) => this.loop(t));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new TugOfWarGame();
});
