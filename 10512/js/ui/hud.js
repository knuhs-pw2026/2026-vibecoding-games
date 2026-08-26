// js/ui/hud.js - 2D Canvas 레이더, HUD 상태바, 킬피드, 스코어보드 매니저

import { soundEngine } from '../engine/audio.js';

export class HUDManager {
    constructor() {
        // DOM 요소 캐싱
        this.hpVal = document.getElementById('hp-val');
        this.hpBar = document.getElementById('hp-bar');
        this.shieldVal = document.getElementById('shield-val');
        this.shieldBar = document.getElementById('shield-bar');

        this.weaponCurrentName = document.getElementById('weapon-current-name');
        this.ammoClip = document.getElementById('ammo-clip');
        this.ammoReserve = document.getElementById('ammo-reserve');
        this.reloadIndicator = document.getElementById('reload-indicator');
        this.reloadProgressContainer = document.getElementById('reload-progress-container');
        this.reloadProgressBar = document.getElementById('reload-progress-bar');
        this.weaponSlots = document.querySelectorAll('.weapon-slot');

        this.matchTimer = document.getElementById('match-timer');
        this.playerScore = document.getElementById('player-score');
        this.leaderScore = document.getElementById('leader-score');

        this.killFeed = document.getElementById('kill-feed');
        this.announcementTitle = document.getElementById('announcement-title');
        this.announcementSubtitle = document.getElementById('announcement-subtitle');

        this.hitmarker = document.getElementById('hitmarker');
        this.damageIndicator = document.getElementById('damage-indicator-text');
        this.damageVignette = document.getElementById('damage-vignette');
        this.healVignette = document.getElementById('heal-vignette');
        this.interactionPrompt = document.getElementById('interaction-prompt');

        this.scoreboardModal = document.getElementById('scoreboard-modal');
        this.scoreboardBody = document.getElementById('scoreboard-body');

        // 레이더 캔버스
        this.radarCanvas = document.getElementById('radar-canvas');
        this.radarCtx = this.radarCanvas.getContext('2d');

        this.hitmarkerTimeout = null;
        this.announcementTimeout = null;
        this.interactionTimeout = null;

        window.hudManager = this;
    }

    // 1. 체력 및 쉴드 업데이트
    updateVitals(player) {
        const hpPercent = Math.max(0, (player.hp / player.maxHp) * 100);
        const shieldPercent = Math.max(0, (player.shield / player.maxShield) * 100);

        this.hpVal.textContent = Math.ceil(player.hp);
        this.hpBar.style.width = `${hpPercent}%`;
        if (player.hp <= 30) this.hpBar.classList.add('low');
        else this.hpBar.classList.remove('low');

        this.shieldVal.textContent = Math.ceil(player.shield);
        this.shieldBar.style.width = `${shieldPercent}%`;
    }

    // 2. 무기 및 탄약 상태 업데이트
    updateWeaponState(player) {
        const weapon = player.currentWeapon;
        if (!weapon) return;

        this.weaponCurrentName.textContent = weapon.name;
        this.ammoClip.textContent = weapon.currentClip;
        this.ammoReserve.textContent = weapon.reserveAmmo;

        if (weapon.currentClip <= Math.ceil(weapon.clipSize * 0.25)) {
            this.ammoClip.classList.add('low');
            this.reloadIndicator.classList.add('show');
        } else {
            this.ammoClip.classList.remove('low');
            this.reloadIndicator.classList.remove('show');
        }

        // 재장전 프로그레스
        if (weapon.isReloading) {
            this.reloadProgressContainer.classList.add('active');
            const progress = (1 - weapon.reloadTimer / weapon.reloadTime) * 100;
            this.reloadProgressBar.style.width = `${progress}%`;
        } else {
            this.reloadProgressContainer.classList.remove('active');
        }

        // 무기 슬롯 활성화 상태
        this.weaponSlots.forEach((slot, idx) => {
            if (idx === player.currentWeaponIndex) slot.classList.add('active');
            else slot.classList.remove('active');
        });
    }

    // 3. 2D 미니맵 레이더 렌더링
    drawRadar(player, bots, pickupItems = []) {
        const ctx = this.radarCtx;
        const w = this.radarCanvas.width;
        const h = this.radarCanvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const range = 45; // 레이더 감지 반경

        ctx.clearRect(0, 0, w, h);

        // 배경 그리드 & 동심원
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx.arc(cx, cy, 60, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
        ctx.moveTo(0, cy); ctx.lineTo(w, cy);
        ctx.stroke();

        // 픽업 아이템 렌더링 (파란/초록/노란 점)
        pickupItems.forEach(item => {
            if (!item.active) return;
            const dx = item.group.position.x - player.position.x;
            const dz = item.group.position.z - player.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < range) {
                const rx = cx + (dx / range) * (w / 2 - 8);
                const ry = cy + (dz / range) * (h / 2 - 8);
                ctx.fillStyle = item.type === 'health' ? '#00ff66' : (item.type === 'shield' ? '#00c3ff' : '#ffe600');
                ctx.beginPath();
                ctx.arc(rx, ry, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // 봇 (적) 렌더링 (붉은 점)
        bots.forEach(bot => {
            if (!bot.isAlive) return;
            const dx = bot.position.x - player.position.x;
            const dz = bot.position.z - player.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < range) {
                const rx = cx + (dx / range) * (w / 2 - 8);
                const ry = cy + (dz / range) * (h / 2 - 8);

                ctx.fillStyle = '#ff0055';
                ctx.shadowColor = '#ff0055';
                ctx.shadowBlur = 4;
                ctx.beginPath();
                ctx.arc(rx, ry, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });

        // 중앙 플레이어 (시야각 부채꼴 & 시안 삼각 화살표)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-player.yaw);

        // 시야각(FOV) 부채꼴
        ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 35, -Math.PI / 4 - Math.PI / 2, Math.PI / 4 - Math.PI / 2);
        ctx.closePath();
        ctx.fill();

        // 플레이어 화살표
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(4, 5);
        ctx.lineTo(-4, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // 4. 히트마커 및 대미지 표시
    showHitmarker(isHeadshot = false) {
        this.hitmarker.className = isHeadshot ? 'show headshot' : 'show';
        if (this.hitmarkerTimeout) clearTimeout(this.hitmarkerTimeout);
        this.hitmarkerTimeout = setTimeout(() => {
            this.hitmarker.className = '';
        }, 120);
    }

    showDamageNumber(amount) {
        this.damageIndicator.textContent = `-${amount}`;
        this.damageIndicator.classList.add('show');
        setTimeout(() => {
            this.damageIndicator.classList.remove('show');
        }, 250);
    }

    triggerDamageVignette(isCritical = false) {
        this.damageVignette.className = isCritical ? 'hit critical' : 'hit';
        setTimeout(() => {
            if (!isCritical) this.damageVignette.className = '';
        }, 200);
    }

    triggerHealVignette() {
        this.healVignette.classList.add('active');
        setTimeout(() => {
            this.healVignette.classList.remove('active');
        }, 300);
    }

    // 5. 킬 피드 알림 추가
    addKillFeed(killer, victim, weaponName, isHeadshot) {
        const item = document.createElement('div');
        const isPlayerKiller = killer.name === 'AGENT (YOU)';
        const isPlayerVictim = victim.name === 'AGENT (YOU)';

        item.className = `kill-feed-item ${isPlayerKiller ? 'player-kill' : (isPlayerVictim ? 'player-death' : '')}`;

        item.innerHTML = `
            <span class="killer ${isPlayerKiller ? 'player' : ''}">${killer.name}</span>
            <span class="weapon-icon">[${weaponName}]</span>
            ${isHeadshot ? '<span class="headshot-badge">🎯 HEADSHOT</span>' : ''}
            <span class="victim ${isPlayerVictim ? 'player' : ''}">${victim.name}</span>
        `;

        this.killFeed.prepend(item);
        if (this.killFeed.children.length > 5) {
            this.killFeed.removeChild(this.killFeed.lastChild);
        }

        setTimeout(() => {
            if (item.parentNode) item.parentNode.removeChild(item);
        }, 5000);
    }

    // 6. 킬 스트릭 / 아나운서 알림
    showAnnouncement(title, subtitle = '') {
        this.announcementTitle.textContent = title;
        this.announcementSubtitle.textContent = subtitle;
        this.announcementTitle.classList.add('show');
        this.announcementSubtitle.classList.add('show');

        if (this.announcementTimeout) clearTimeout(this.announcementTimeout);
        this.announcementTimeout = setTimeout(() => {
            this.announcementTitle.classList.remove('show');
            this.announcementSubtitle.classList.remove('show');
        }, 2200);
    }

    showInteractionMessage(msg) {
        this.interactionPrompt.textContent = msg;
        this.interactionPrompt.classList.add('show');
        if (this.interactionTimeout) clearTimeout(this.interactionTimeout);
        this.interactionTimeout = setTimeout(() => {
            this.interactionPrompt.classList.remove('show');
        }, 1500);
    }

    // 7. 스코어보드 (TAB)
    toggleScoreboard(show) {
        if (show) this.scoreboardModal.classList.remove('hidden');
        else this.scoreboardModal.classList.add('hidden');
    }

    updateScoreboard(allParticipants) {
        // 점수/킬 기준 내림차순 정렬
        const sorted = [...allParticipants].sort((a, b) => b.kills - a.kills || b.score - a.score);

        this.scoreboardBody.innerHTML = '';
        sorted.forEach((p, idx) => {
            const isPlayer = p.name === 'AGENT (YOU)';
            const kd = p.deaths > 0 ? (p.kills / p.deaths).toFixed(1) : p.kills.toFixed(1);
            const tr = document.createElement('tr');
            tr.className = `scoreboard-row ${isPlayer ? 'is-player' : ''}`;
            tr.innerHTML = `
                <td>#${idx + 1}</td>
                <td>${p.name}</td>
                <td style="color: #00f0ff;">${p.kills}</td>
                <td style="color: #ff0055;">${p.deaths}</td>
                <td>${kd}</td>
                <td style="color: #ffe600; font-weight: bold;">${p.kills * 100}</td>
                <td>${p.isAlive ? '<span style="color: #00ff66;">ALIVE</span>' : '<span style="color: #8faec5;">RESPAWNING</span>'}</td>
            `;
            this.scoreboardBody.appendChild(tr);
        });

        // 상단 헤더 점수판 갱신
        const topLeader = sorted[0];
        if (topLeader) {
            this.leaderScore.textContent = `${topLeader.name} (${topLeader.kills}/25)`;
        }
    }
}
