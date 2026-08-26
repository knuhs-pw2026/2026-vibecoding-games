// js/main.js - 게임 메인 컨트롤러 및 라이프사이클 관리

import { soundEngine } from './engine/audio.js';
import { gameRenderer } from './engine/renderer.js';
import { ArenaMap } from './world/map.js';
import { PickupManager } from './world/pickups.js';
import { ProjectileManager } from './entities/projectiles.js';
import { Player } from './entities/player.js';
import { Bot } from './entities/bot.js';
import { HUDManager } from './ui/hud.js';

class GameManager {
    constructor() {
        this.renderer = gameRenderer;
        this.scene = this.renderer.scene;
        this.camera = this.renderer.camera;

        this.hud = new HUDManager();
        this.map = new ArenaMap(this.scene);
        this.pickups = new PickupManager(this.scene);
        this.projectileManager = new ProjectileManager(this.scene);

        this.player = null;
        this.bots = [];
        this.allParticipants = [];

        this.targetKills = 25; // 25킬 도달 시 매치 종료
        this.matchTime = 600;  // 10분 (600초)
        this.gameState = 'MENU'; // 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'

        this.lastTime = performance.now();
        this.botNames = ['VEX-01', 'KAI-88', 'RAZOR', 'NOVA', 'GHOST', 'TITAN', 'ECHO', 'VIPER', 'CIPHER', 'NEXUS'];

        this.setupUIEvents();
    }

    setupUIEvents() {
        const startBtn = document.getElementById('btn-start-game');
        const resumeBtn = document.getElementById('btn-resume-game');
        const restartBtn = document.getElementById('btn-restart-game');
        const playAgainBtn = document.getElementById('btn-play-again');

        const startScreen = document.getElementById('start-screen');
        const pauseScreen = document.getElementById('pause-screen');
        const gameOverScreen = document.getElementById('game-over-screen');

        startBtn.addEventListener('click', () => {
            soundEngine.init();
            soundEngine.startCyberBGM();
            const botCount = parseInt(document.getElementById('bot-count-select').value, 10) || 6;
            const botDiff = document.getElementById('bot-diff-select').value || 'normal';
            this.startMatch(botCount, botDiff);
            startScreen.classList.add('hidden');
            this.lockPointer();
        });

        resumeBtn.addEventListener('click', () => {
            pauseScreen.classList.add('hidden');
            this.gameState = 'PLAYING';
            this.lockPointer();
        });

        restartBtn.addEventListener('click', () => {
            pauseScreen.classList.add('hidden');
            const botCount = parseInt(document.getElementById('bot-count-select').value, 10) || 6;
            const botDiff = document.getElementById('bot-diff-select').value || 'normal';
            this.startMatch(botCount, botDiff);
            this.lockPointer();
        });

        playAgainBtn.addEventListener('click', () => {
            gameOverScreen.classList.add('hidden');
            const botCount = parseInt(document.getElementById('bot-count-select').value, 10) || 6;
            const botDiff = document.getElementById('bot-diff-select').value || 'normal';
            this.startMatch(botCount, botDiff);
            this.lockPointer();
        });

        // 포인터 락 상태 변경 감지
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement !== document.body) {
                if (this.gameState === 'PLAYING') {
                    this.gameState = 'PAUSED';
                    pauseScreen.classList.remove('hidden');
                }
            }
        });
    }

    lockPointer() {
        document.body.requestPointerLock();
    }

    startMatch(botCount, botDiff) {
        // 기존 봇 정리
        this.bots.forEach(b => {
            if (b.mesh) this.scene.remove(b.mesh);
        });
        this.bots = [];

        // 맵 및 픽업 아이템 생성 (첫 시작 시)
        if (!this.mapInitialized) {
            this.map.build();
            this.pickups.init();
            this.mapInitialized = true;
        }

        // 플레이어 생성
        if (!this.player) {
            this.player = new Player(this.camera, this.scene);
        }
        this.player.kills = 0;
        this.player.deaths = 0;
        this.player.score = 0;
        this.player.shotsFired = 0;
        this.player.shotsHit = 0;
        this.player.respawn(this.map.getRandomSpawnPoint());

        // 봇 생성
        for (let i = 0; i < botCount; i++) {
            const botName = this.botNames[i % this.botNames.length];
            const bot = new Bot(i + 1, botName, this.scene, botDiff);
            bot.respawn(this.map.getRandomSpawnPoint());
            this.bots.push(bot);
        }

        this.allParticipants = [this.player, ...this.bots];
        this.matchTime = 600;
        this.gameState = 'PLAYING';

        this.hud.showAnnouncement('MATCH COMMENCED', 'TARGET: 25 KILLS');
    }

    // 킬 이벤트 콜백
    onKill(killer, victim, weaponName, isHeadshot) {
        killer.kills++;
        killer.score += isHeadshot ? 150 : 100;

        // 킬 피드 알림
        this.hud.addKillFeed(killer, victim, weaponName, isHeadshot);

        // 플레이어가 킬했을 때의 쾌감 피드백
        if (killer === this.player) {
            this.player.killStreak++;
            this.player.shotsHit++;
            soundEngine.playKillSound();

            const streak = this.player.killStreak;
            if (streak === 2) this.hud.showAnnouncement('DOUBLE KILL!', 'EXCELLENT SHOT');
            else if (streak === 3) this.hud.showAnnouncement('TRIPLE KILL!', 'RAMPAGE ACTIVE');
            else if (streak === 4) this.hud.showAnnouncement('DOMINATING!', 'UNSTOPPABLE FORCE');
            else if (streak >= 5) this.hud.showAnnouncement('GODLIKE KILLSTREAK!', `${streak} KILLS IN A ROW`);
            else {
                if (isHeadshot) this.hud.showAnnouncement('HEADSHOT!', '+150 PTS');
            }
        }

        // 승리 조건 검사
        if (killer.kills >= this.targetKills) {
            this.endMatch(killer);
        }
    }

    endMatch(winner) {
        this.gameState = 'GAMEOVER';
        document.exitPointerLock();

        const gameOverScreen = document.getElementById('game-over-screen');
        const resTitle = document.getElementById('result-title');
        const resSubtitle = document.getElementById('result-subtitle');

        const isPlayerWin = winner === this.player;
        resTitle.textContent = isPlayerWin ? 'VICTORY' : 'DEFEAT';
        resTitle.className = isPlayerWin ? 'victory-text' : 'defeat-text';
        resSubtitle.textContent = isPlayerWin ?
            `YOU DOMINATED THE ARENA WITH ${this.player.kills} KILLS!` :
            `${winner.name} WON THE MATCH WITH ${winner.kills} KILLS.`;

        // 플레이어 전적
        document.getElementById('res-kills').textContent = this.player.kills;
        document.getElementById('res-deaths').textContent = this.player.deaths;
        const kd = this.player.deaths > 0 ? (this.player.kills / this.player.deaths).toFixed(2) : this.player.kills.toFixed(2);
        document.getElementById('res-kd').textContent = kd;
        const acc = this.player.shotsFired > 0 ? Math.round((this.player.shotsHit / this.player.shotsFired) * 100) : 0;
        document.getElementById('res-accuracy').textContent = `${acc}%`;

        gameOverScreen.classList.remove('hidden');
    }

    // 메인 게임 루프
    run() {
        const now = performance.now();
        const dt = Math.min((now - this.lastTime) / 1000, 0.1); // 최대 0.1s delta 고정
        this.lastTime = now;

        if (this.gameState === 'PLAYING') {
            // 1. 경기 시간 업데이트
            this.matchTime -= dt;
            if (this.matchTime <= 0) {
                // 시간 초과 시 최다 킬러 승리
                const sorted = [...this.allParticipants].sort((a, b) => b.kills - a.kills);
                this.endMatch(sorted[0]);
            }
            const mins = Math.floor(Math.max(0, this.matchTime) / 60);
            const secs = Math.floor(Math.max(0, this.matchTime) % 60);
            this.hud.matchTimer.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

            // 2. 플레이어 업데이트 & 리스폰
            if (this.player.isAlive) {
                this.player.update(dt, this.projectileManager, this.bots, (k, v, w, h) => this.onKill(k, v, w, h));
            } else if (this.player.respawnTimer <= 0) {
                this.player.respawn(this.map.getRandomSpawnPoint());
            } else {
                this.player.update(dt, this.projectileManager, this.bots, null);
            }

            // 3. 봇 AI 업데이트 & 리스폰
            this.bots.forEach(bot => {
                if (bot.isAlive) {
                    bot.update(dt, this.player, this.bots, this.map, this.projectileManager, (k, v, w, h) => this.onKill(k, v, w, h));
                } else if (bot.respawnTimer <= 0) {
                    bot.respawn(this.map.getRandomSpawnPoint());
                } else {
                    bot.update(dt, this.player, this.bots, this.map, this.projectileManager, null);
                }
            });

            // 4. 투사체 및 파티클 업데이트
            this.projectileManager.update(dt, this.player, this.bots, (k, v, w, h) => this.onKill(k, v, w, h));
            this.pickups.update(dt, this.player, this.bots);
            this.renderer.updateParticles(dt);

            // 5. HUD 갱신
            this.hud.updateVitals(this.player);
            this.hud.updateWeaponState(this.player);
            this.hud.drawRadar(this.player, this.bots, this.pickups.items);
            this.hud.playerScore.textContent = `${this.player.kills}`;
            this.hud.updateScoreboard(this.allParticipants);
        }

        // Three.js 렌더링
        this.renderer.render();
        requestAnimationFrame(() => this.run());
    }
}

// 게임 인스턴스 초기화 및 루프 시작
window.addEventListener('DOMContentLoaded', () => {
    const game = new GameManager();
    game.run();
});
