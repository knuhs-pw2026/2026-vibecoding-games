// ============================================================================
// NEON SURVIVOR: OVERDRIVE - Weapon System & Projectiles
// ============================================================================

class Projectile {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.vx = config.vx || 0;
        this.vy = config.vy || 0;
        this.radius = config.radius || 5;
        this.color = config.color || '#00ffff';
        this.damage = config.damage || 10;
        this.isCrit = config.isCrit || false;
        this.pierce = config.pierce !== undefined ? config.pierce : 1;
        this.life = config.life || 2.0;
        this.maxLife = config.life || 2.0;
        this.type = config.type || 'plasma';
        this.homing = config.homing || false;
        this.homingTarget = null;
        this.splashRadius = config.splashRadius || 0;
        this.trailTimer = 0;
        this.hitEnemies = new Set();
    }

    update(dt, enemies) {
        this.life -= dt;
        if (this.life <= 0) return false;

        // Homing logic for missiles
        if (this.homing) {
            if (!this.homingTarget || this.homingTarget.hp <= 0) {
                // Find new nearest target
                let closest = null;
                let minDist = 600;
                for (const e of enemies) {
                    const dist = Math.hypot(e.x - this.x, e.y - this.y);
                    if (dist < minDist) {
                        minDist = dist;
                        closest = e;
                    }
                }
                this.homingTarget = closest;
            }

            if (this.homingTarget) {
                const angle = Math.atan2(this.homingTarget.y - this.y, this.homingTarget.x - this.x);
                const curAngle = Math.atan2(this.vy, this.vx);
                const turnSpeed = 8.0 * dt;
                let diff = angle - curAngle;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;
                const newAngle = curAngle + Math.sign(diff) * Math.min(Math.abs(diff), turnSpeed);
                const spd = Math.hypot(this.vx, this.vy);
                this.vx = Math.cos(newAngle) * spd;
                this.vy = Math.sin(newAngle) * spd;
            }
        }

        this.x += this.vx * dt * 60;
        this.y += this.vy * dt * 60;

        // Trail particles
        this.trailTimer += dt;
        if (this.trailTimer > 0.03) {
            this.trailTimer = 0;
            if (this.type === 'missile' || this.type === 'nuke') {
                window.particleSystem.spawnSparks(this.x, this.y, '#ff6600', 1, 1, 2, 0.2);
            } else if (this.type === 'plasma') {
                window.particleSystem.spawnSparks(this.x, this.y, this.color, 1, 0.5, 1.5, 0.15);
            }
        }

        return true;
    }

    draw(ctx, camera) {
        const sx = this.x - camera.x;
        const sy = this.y - camera.y;

        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;

        if (this.type === 'missile' || this.type === 'nuke') {
            const angle = Math.atan2(this.vy, this.vx);
            ctx.translate(sx, sy);
            ctx.rotate(angle);
            ctx.fillStyle = this.type === 'nuke' ? '#ff0055' : '#ffaa00';
            ctx.fillRect(-this.radius * 1.5, -this.radius * 0.6, this.radius * 3, this.radius * 1.2);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.radius * 0.5, -this.radius * 0.4, this.radius, this.radius * 0.8);
        } else {
            ctx.beginPath();
            ctx.arc(sx, sy, this.radius, 0, Math.PI * 2);
            ctx.fill();
            // Core white glow
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(sx, sy, this.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

// --- Base Weapon ---
class BaseWeapon {
    constructor(player, config) {
        this.player = player;
        this.id = config.id;
        this.name = config.name;
        this.koreanName = config.koreanName;
        this.description = config.description;
        this.icon = config.icon;
        this.color = config.color || '#00ffff';
        this.level = 1;
        this.maxLevel = 8;
        this.isEvolved = false;
        this.evolvedName = config.evolvedName;
        this.evolvedKoreanName = config.evolvedKoreanName;
        this.evolvedDescription = config.evolvedDescription;
        this.requiredPassive = config.requiredPassive; // Passive id required to evolve

        this.cooldown = config.baseCooldown || 1.0;
        this.timer = 0;
        this.damage = config.baseDamage || 15;
        this.projectiles = [];
    }

    upgrade() {
        if (this.level < this.maxLevel) {
            this.level++;
            this.applyLevelStats();
        }
    }

    evolve() {
        this.isEvolved = true;
        this.level = this.maxLevel;
        this.name = this.evolvedName;
        this.koreanName = this.evolvedKoreanName;
        this.description = this.evolvedDescription;
        this.applyEvolutionStats();
        if (window.soundEngine) window.soundEngine.playLevelUp();
        window.particleSystem.spawnShockwave(this.player.x, this.player.y, '#ffd700', 120, 0.8, 8);
        window.particleSystem.spawnDamageText(this.player.x, this.player.y - 40, `EVOLVED: ${this.evolvedKoreanName}!`, true, '#ffd700');
    }

    applyLevelStats() {}
    applyEvolutionStats() {}
    update(dt, enemies) {}
    draw(ctx, camera) {}
}

// 1. Plasma Blaster -> Quantum Annihilator
class PlasmaBlaster extends BaseWeapon {
    constructor(player) {
        super(player, {
            id: 'plasma_blaster',
            name: 'Plasma Blaster',
            koreanName: '플라즈마 블래스터',
            description: '가장 가까운 적을 향해 고속 플라즈마 탄환을 발사합니다.',
            icon: '⚡',
            color: '#00ffff',
            baseCooldown: 0.65,
            baseDamage: 22,
            evolvedName: 'Quantum Annihilator',
            evolvedKoreanName: '양자 소멸 광선기',
            evolvedDescription: '상시 회전하는 초고출력 양자 레이저로 화면 전체를 궤멸시킵니다.',
            requiredPassive: 'overcharge_core'
        });
        this.shotCount = 1;
        this.pierce = 1;
        this.laserAngle = 0;
    }

    applyLevelStats() {
        this.damage = 22 + (this.level - 1) * 9;
        this.cooldown = Math.max(0.2, 0.65 - (this.level - 1) * 0.05);
        if (this.level >= 3) this.shotCount = 2;
        if (this.level >= 5) this.shotCount = 3;
        if (this.level >= 7) this.shotCount = 4;
        if (this.level >= 4) this.pierce = 2;
    }

    applyEvolutionStats() {
        this.damage = 75;
        this.cooldown = 0.05; // continuous tick
    }

    update(dt, enemies) {
        this.timer -= dt;

        if (this.isEvolved) {
            // Evolved: Continuous spinning twin quantum laser beams
            this.laserAngle += dt * 2.2;
            if (this.timer <= 0) {
                this.timer = 0.1; // tick interval
                const beamLength = 450;
                const angles = [this.laserAngle, this.laserAngle + Math.PI, this.laserAngle + Math.PI * 0.5, this.laserAngle + Math.PI * 1.5];

                for (const ang of angles) {
                    const lx = this.player.x + Math.cos(ang) * beamLength;
                    const ly = this.player.y + Math.sin(ang) * beamLength;

                    for (const e of enemies) {
                        // Line vs Circle collision
                        if (this.checkLineCircle(this.player.x, this.player.y, lx, ly, e.x, e.y, e.radius + 15)) {
                            const crit = this.player.rollCrit();
                            const dmg = this.player.calcDamage(this.damage, crit);
                            e.takeDamage(dmg, crit, '#00ffff');
                            window.particleSystem.spawnSparks(e.x, e.y, '#00ffff', 2, 3, 2, 0.2);
                        }
                    }
                }
            }
            return;
        }

        // Standard Weapon logic
        if (this.timer <= 0 && enemies.length > 0) {
            this.timer = this.cooldown * this.player.getCooldownMultiplier();
            this.fire(enemies);
        }
    }

    checkLineCircle(x1, y1, x2, y2, cx, cy, r) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lenSq = dx * dx + dy * dy;
        const t = Math.max(0, Math.min(1, ((cx - x1) * dx + (cy - y1) * dy) / lenSq));
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;
        return Math.hypot(cx - projX, cy - projY) <= r;
    }

    fire(enemies) {
        // Find nearest enemies
        const sorted = [...enemies].sort((a, b) => {
            return Math.hypot(a.x - this.player.x, a.y - this.player.y) - Math.hypot(b.x - this.player.x, b.y - this.player.y);
        });

        const target = sorted[0];
        if (!target) return;

        const baseAngle = Math.atan2(target.y - this.player.y, target.x - this.player.x);
        const count = this.shotCount + this.player.bonusProjectiles;

        for (let i = 0; i < count; i++) {
            const spread = (i - (count - 1) / 2) * 0.16;
            const angle = baseAngle + spread;
            const speed = 12;
            const crit = this.player.rollCrit();
            const dmg = this.player.calcDamage(this.damage, crit);

            window.gameInstance.projectiles.push(new Projectile({
                x: this.player.x,
                y: this.player.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 6,
                color: '#00ffff',
                damage: dmg,
                isCrit: crit,
                pierce: this.pierce,
                life: 1.8,
                type: 'plasma'
            }));
        }

        if (window.soundEngine) window.soundEngine.playPlasma();
    }

    draw(ctx, camera) {
        if (!this.isEvolved) return;

        // Draw quantum beams
        const sx = this.player.x - camera.x;
        const sy = this.player.y - camera.y;
        const beamLength = 450;
        const angles = [this.laserAngle, this.laserAngle + Math.PI, this.laserAngle + Math.PI * 0.5, this.laserAngle + Math.PI * 1.5];

        ctx.save();
        for (const ang of angles) {
            const ex = sx + Math.cos(ang) * beamLength;
            const ey = sy + Math.sin(ang) * beamLength;

            // Outer glow
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
            ctx.lineWidth = 14;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00ffff';
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.stroke();

            // Inner core
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.stroke();
        }
        ctx.restore();
    }
}

// 2. Orbital Saber Drones -> Sunstrike Aegis
class OrbitalSaber extends BaseWeapon {
    constructor(player) {
        super(player, {
            id: 'orbital_saber',
            name: 'Orbital Saber Drones',
            koreanName: '오비탈 세이버 드론',
            description: '플레이어 주변을 빠르게 회전하는 에너지 블레이드를 전개합니다.',
            icon: '🌀',
            color: '#bd00ff',
            baseCooldown: 0.1,
            baseDamage: 18,
            evolvedName: 'Sunstrike Aegis',
            evolvedKoreanName: '태양폭풍 이지스 실드',
            evolvedDescription: '거대한 태양 에너지 방패가 주변을 둘러싸고 적들을 분쇄합니다.',
            requiredPassive: 'repulsor_field'
        });
        this.bladeCount = 2;
        this.orbitRadius = 70;
        this.angle = 0;
        this.hitCooldowns = new Map();
    }

    applyLevelStats() {
        this.damage = 18 + (this.level - 1) * 8;
        this.bladeCount = 2 + Math.floor((this.level - 1) / 2);
        this.orbitRadius = 70 + (this.level - 1) * 6;
    }

    applyEvolutionStats() {
        this.bladeCount = 6;
        this.orbitRadius = 110;
        this.damage = 60;
    }

    update(dt, enemies) {
        this.angle += dt * (this.isEvolved ? 4.5 : 3.2);

        // Update hit cooldowns
        for (const [enemy, timer] of this.hitCooldowns.entries()) {
            if (timer <= 0) {
                this.hitCooldowns.delete(enemy);
            } else {
                this.hitCooldowns.set(enemy, timer - dt);
            }
        }

        const totalBlades = this.bladeCount + (this.isEvolved ? 0 : this.player.bonusProjectiles);
        const radius = this.orbitRadius * this.player.getAreaMultiplier();

        for (let i = 0; i < totalBlades; i++) {
            const bladeAngle = this.angle + (i * Math.PI * 2) / totalBlades;
            const bx = this.player.x + Math.cos(bladeAngle) * radius;
            const by = this.player.y + Math.sin(bladeAngle) * radius;
            const bladeHitRadius = this.isEvolved ? 24 : 14;

            for (const e of enemies) {
                if (this.hitCooldowns.has(e)) continue;
                const dist = Math.hypot(e.x - bx, e.y - by);
                if (dist < e.radius + bladeHitRadius) {
                    const crit = this.player.rollCrit();
                    const dmg = this.player.calcDamage(this.damage, crit);
                    e.takeDamage(dmg, crit, this.color);
                    this.hitCooldowns.set(e, 0.25); // hit rate limiter
                    window.particleSystem.spawnSparks(bx, by, this.color, 4, 4, 2, 0.2);
                    if (window.soundEngine && Math.random() < 0.3) window.soundEngine.playHit();
                }
            }
        }
    }

    draw(ctx, camera) {
        const totalBlades = this.bladeCount + (this.isEvolved ? 0 : this.player.bonusProjectiles);
        const radius = this.orbitRadius * this.player.getAreaMultiplier();

        for (let i = 0; i < totalBlades; i++) {
            const bladeAngle = this.angle + (i * Math.PI * 2) / totalBlades;
            const bx = this.player.x + Math.cos(bladeAngle) * radius - camera.x;
            const by = this.player.y + Math.sin(bladeAngle) * radius - camera.y;

            ctx.save();
            ctx.shadowBlur = this.isEvolved ? 20 : 12;
            ctx.shadowColor = this.isEvolved ? '#ffaa00' : this.color;
            ctx.fillStyle = this.isEvolved ? '#ffcc00' : this.color;

            ctx.translate(bx, by);
            ctx.rotate(bladeAngle + Math.PI / 2);

            const bladeW = this.isEvolved ? 20 : 10;
            const bladeH = this.isEvolved ? 44 : 26;

            ctx.beginPath();
            ctx.ellipse(0, 0, bladeW, bladeH, 0, 0, Math.PI * 2);
            ctx.fill();

            // Core highlight
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(0, 0, bladeW * 0.4, bladeH * 0.7, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }
}

// 3. Thunder Arc -> Zeus Judgement
class ThunderArc extends BaseWeapon {
    constructor(player) {
        super(player, {
            id: 'thunder_arc',
            name: 'Thunder Arc',
            koreanName: '연쇄 뇌전 코어',
            description: '적들 사이를 번갯불처럼 연쇄 타격하는 고전압 전기를 방출합니다.',
            icon: '⚡',
            color: '#ffea00',
            baseCooldown: 1.2,
            baseDamage: 30,
            evolvedName: 'Zeus Judgement',
            evolvedKoreanName: '제우스의 궤도 심판',
            evolvedDescription: '초거대 궤도 뇌우 폭격을 소환하여 화면 전역을 초토화합니다.',
            requiredPassive: 'flux_capacitors'
        });
        this.chains = 3;
        this.strikeCount = 1;
        this.activeLightning = [];
    }

    applyLevelStats() {
        this.damage = 30 + (this.level - 1) * 14;
        this.cooldown = Math.max(0.4, 1.2 - (this.level - 1) * 0.08);
        this.chains = 3 + (this.level - 1);
        if (this.level >= 4) this.strikeCount = 2;
        if (this.level >= 7) this.strikeCount = 3;
    }

    applyEvolutionStats() {
        this.strikeCount = 6;
        this.chains = 8;
        this.damage = 110;
        this.cooldown = 0.55;
    }

    update(dt, enemies) {
        this.timer -= dt;

        // Clean up lightning visuals
        for (let i = this.activeLightning.length - 1; i >= 0; i--) {
            this.activeLightning[i].life -= dt;
            if (this.activeLightning[i].life <= 0) {
                this.activeLightning.splice(i, 1);
            }
        }

        if (this.timer <= 0 && enemies.length > 0) {
            this.timer = this.cooldown * this.player.getCooldownMultiplier();
            this.fire(enemies);
        }
    }

    fire(enemies) {
        const strikes = this.strikeCount + (this.isEvolved ? 0 : this.player.bonusProjectiles);

        for (let s = 0; s < strikes; s++) {
            if (enemies.length === 0) break;
            const startTarget = enemies[Math.floor(Math.random() * enemies.length)];
            const hitList = [startTarget];
            let current = startTarget;

            // Deal initial damage
            const crit = this.player.rollCrit();
            const dmg = this.player.calcDamage(this.damage, crit);
            current.takeDamage(dmg, crit, this.color);
            window.particleSystem.spawnSparks(current.x, current.y, this.color, 6, 5, 2.5, 0.3);

            if (this.isEvolved) {
                window.particleSystem.spawnShockwave(current.x, current.y, '#ffea00', 80, 0.4, 6);
            }

            const points = [{ x: this.player.x, y: this.player.y }, { x: current.x, y: current.y }];

            // Chain to nearby enemies
            for (let c = 0; c < this.chains; c++) {
                let nextTarget = null;
                let minDist = 220;
                for (const e of enemies) {
                    if (hitList.includes(e)) continue;
                    const dist = Math.hypot(e.x - current.x, e.y - current.y);
                    if (dist < minDist) {
                        minDist = dist;
                        nextTarget = e;
                    }
                }

                if (!nextTarget) break;
                hitList.push(nextTarget);
                points.push({ x: nextTarget.x, y: nextTarget.y });

                const chainDmg = this.player.calcDamage(this.damage * 0.85, crit);
                nextTarget.takeDamage(chainDmg, crit, this.color);
                window.particleSystem.spawnSparks(nextTarget.x, nextTarget.y, this.color, 4, 4, 2, 0.2);
                current = nextTarget;
            }

            this.activeLightning.push({
                points,
                life: 0.15,
                maxLife: 0.15,
                color: this.isEvolved ? '#ffffff' : this.color
            });
        }

        if (window.soundEngine) window.soundEngine.playLightning();
    }

    draw(ctx, camera) {
        for (const l of this.activeLightning) {
            if (l.points.length < 2) continue;
            ctx.save();
            ctx.strokeStyle = l.color;
            ctx.lineWidth = this.isEvolved ? 6 : 3.5;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ffea00';
            ctx.globalAlpha = Math.max(0, l.life / l.maxLife);

            ctx.beginPath();
            ctx.moveTo(l.points[0].x - camera.x, l.points[0].y - camera.y);

            for (let i = 1; i < l.points.length; i++) {
                const p1 = l.points[i - 1];
                const p2 = l.points[i];
                // Jagged lightning segment
                const midX = (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 20;
                const midY = (p1.y + p2.y) / 2 + (Math.random() - 0.5) * 20;
                ctx.lineTo(midX - camera.x, midY - camera.y);
                ctx.lineTo(p2.x - camera.x, p2.y - camera.y);
            }
            ctx.stroke();
            ctx.restore();
        }
    }
}

// 4. Cluster Missiles -> Nuclear Swarm
class ClusterMissiles extends BaseWeapon {
    constructor(player) {
        super(player, {
            id: 'cluster_missiles',
            name: 'Cluster Missiles',
            koreanName: '유도 미사일 포대',
            description: '적을 추적하여 폭발하는 유도 마이크로 미사일을 발사합니다.',
            icon: '🚀',
            color: '#ff6600',
            baseCooldown: 1.4,
            baseDamage: 35,
            evolvedName: 'Nuclear Swarm',
            evolvedKoreanName: '전술 핵폭격 편대',
            evolvedDescription: '화면을 뒤덮는 무한 유도 전술 핵미사일 폭격을 쏟아붓습니다.',
            requiredPassive: 'turbo_thrusters'
        });
        this.missileCount = 2;
        this.splashRadius = 45;
    }

    applyLevelStats() {
        this.damage = 35 + (this.level - 1) * 16;
        this.cooldown = Math.max(0.4, 1.4 - (this.level - 1) * 0.1);
        this.missileCount = 2 + (this.level - 1);
        this.splashRadius = 45 + (this.level - 1) * 8;
    }

    applyEvolutionStats() {
        this.missileCount = 10;
        this.damage = 90;
        this.cooldown = 0.7;
        this.splashRadius = 120;
    }

    update(dt, enemies) {
        this.timer -= dt;
        if (this.timer <= 0 && enemies.length > 0) {
            this.timer = this.cooldown * this.player.getCooldownMultiplier();
            this.fire(enemies);
        }
    }

    fire(enemies) {
        const count = this.missileCount + (this.isEvolved ? 0 : this.player.bonusProjectiles);

        for (let i = 0; i < count; i++) {
            const angle = (i * Math.PI * 2) / count + (Math.random() - 0.5) * 0.5;
            const speed = 7 + Math.random() * 3;
            const crit = this.player.rollCrit();
            const dmg = this.player.calcDamage(this.damage, crit);

            window.gameInstance.projectiles.push(new Projectile({
                x: this.player.x,
                y: this.player.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: this.isEvolved ? 8 : 5,
                color: this.isEvolved ? '#ff0055' : '#ffaa00',
                damage: dmg,
                isCrit: crit,
                pierce: 0,
                life: 3.5,
                type: this.isEvolved ? 'nuke' : 'missile',
                homing: true,
                splashRadius: this.splashRadius * this.player.getAreaMultiplier()
            }));
        }

        if (window.soundEngine) window.soundEngine.playLaser(0.6);
    }
}

// 5. Vortex Singularity -> Event Horizon
class VortexSingularity extends BaseWeapon {
    constructor(player) {
        super(player, {
            id: 'vortex_singularity',
            name: 'Vortex Singularity',
            koreanName: '블랙홀 중력장',
            description: '적들을 끌어당겨 분쇄하는 중력 특이점을 생성합니다.',
            icon: '⚫',
            color: '#a855f7',
            baseCooldown: 2.5,
            baseDamage: 12,
            evolvedName: 'Event Horizon',
            evolvedKoreanName: '사건의 지평선',
            evolvedDescription: '맵 전체의 적을 집어삼키는 초질량 블랙홀을 생성하고 폭발시킵니다.',
            requiredPassive: 'nanite_repair'
        });
        this.vortices = [];
        this.duration = 3.0;
        this.pullRadius = 140;
    }

    applyLevelStats() {
        this.damage = 12 + (this.level - 1) * 5;
        this.duration = 3.0 + (this.level - 1) * 0.4;
        this.cooldown = Math.max(1.0, 2.5 - (this.level - 1) * 0.15);
        this.pullRadius = 140 + (this.level - 1) * 15;
    }

    applyEvolutionStats() {
        this.duration = 5.0;
        this.pullRadius = 320;
        this.damage = 40;
        this.cooldown = 2.2;
    }

    update(dt, enemies) {
        this.timer -= dt;

        // Spawn new vortex
        if (this.timer <= 0 && enemies.length > 0) {
            this.timer = this.cooldown * this.player.getCooldownMultiplier();
            const target = enemies[Math.floor(Math.random() * enemies.length)];
            this.vortices.push({
                x: target.x,
                y: target.y,
                life: this.duration,
                maxLife: this.duration,
                radius: this.pullRadius * this.player.getAreaMultiplier(),
                tickTimer: 0,
                angle: 0
            });
        }

        // Update active vortices
        for (let i = this.vortices.length - 1; i >= 0; i--) {
            const v = this.vortices[i];
            v.life -= dt;
            v.tickTimer -= dt;
            v.angle += dt * 5;

            if (v.life <= 0) {
                // Final collapse explosion
                if (this.isEvolved) {
                    window.particleSystem.spawnExplosion(v.x, v.y, '#bd00ff', 2.5);
                    for (const e of enemies) {
                        const dist = Math.hypot(e.x - v.x, e.y - v.y);
                        if (dist < v.radius * 1.2) {
                            const crit = this.player.rollCrit();
                            e.takeDamage(this.damage * 4, crit, '#bd00ff');
                        }
                    }
                }
                this.vortices.splice(i, 1);
                continue;
            }

            // Pull and damage enemies
            for (const e of enemies) {
                const dx = v.x - e.x;
                const dy = v.y - e.y;
                const dist = Math.hypot(dx, dy);
                if (dist < v.radius && dist > 10) {
                    // Gravitational pull
                    const pullStrength = (1 - dist / v.radius) * 8.0;
                    e.x += (dx / dist) * pullStrength;
                    e.y += (dy / dist) * pullStrength;
                }
            }

            // Tick damage
            if (v.tickTimer <= 0) {
                v.tickTimer = 0.25;
                for (const e of enemies) {
                    const dist = Math.hypot(e.x - v.x, e.y - v.y);
                    if (dist < v.radius) {
                        const crit = this.player.rollCrit();
                        const dmg = this.player.calcDamage(this.damage, crit);
                        e.takeDamage(dmg, crit, '#a855f7');
                    }
                }
            }
        }
    }

    draw(ctx, camera) {
        for (const v of this.vortices) {
            const sx = v.x - camera.x;
            const sy = v.y - camera.y;

            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(v.angle);

            // Gravitational distortion rings
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#bd00ff';
            ctx.strokeStyle = 'rgba(189, 0, 255, 0.6)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, v.radius * 0.7, 0, Math.PI * 2);
            ctx.stroke();

            // Swirling spiral arms
            for (let arm = 0; arm < 4; arm++) {
                ctx.strokeStyle = 'rgba(230, 100, 255, 0.7)';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(0, 0, v.radius * 0.45, arm * (Math.PI / 2), arm * (Math.PI / 2) + Math.PI / 2);
                ctx.stroke();
            }

            // Black Hole core
            ctx.fillStyle = '#050210';
            ctx.beginPath();
            ctx.arc(0, 0, 18, 0, Math.PI * 2);
            ctx.fill();

            // Event horizon ring
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            ctx.restore();
        }
    }
}

// 6. EMP Nova Pulse -> Absolute Zero Field
class EmpNova extends BaseWeapon {
    constructor(player) {
        super(player, {
            id: 'emp_nova',
            name: 'EMP Nova Pulse',
            koreanName: '전자기 펄스 방출기',
            description: '주기적으로 충격파를 방출하여 적들을 밀쳐내고 마비시킵니다.',
            icon: '💥',
            color: '#00e5ff',
            baseCooldown: 3.5,
            baseDamage: 40,
            evolvedName: 'Absolute Zero Field',
            evolvedKoreanName: '절대 영도 빙결장',
            evolvedDescription: '적들을 완전히 얼려 부숴버리는 극저온 충격파를 방출합니다.',
            requiredPassive: 'chrono_matrix'
        });
        this.pulseRadius = 180;
    }

    applyLevelStats() {
        this.damage = 40 + (this.level - 1) * 18;
        this.cooldown = Math.max(1.5, 3.5 - (this.level - 1) * 0.25);
        this.pulseRadius = 180 + (this.level - 1) * 25;
    }

    applyEvolutionStats() {
        this.pulseRadius = 400;
        this.damage = 120;
        this.cooldown = 2.0;
    }

    update(dt, enemies) {
        this.timer -= dt;
        if (this.timer <= 0) {
            this.timer = this.cooldown * this.player.getCooldownMultiplier();
            this.fire(enemies);
        }
    }

    fire(enemies) {
        const radius = this.pulseRadius * this.player.getAreaMultiplier();
        window.particleSystem.spawnShockwave(this.player.x, this.player.y, this.isEvolved ? '#70d6ff' : '#00e5ff', radius, 0.5, 8);
        if (window.soundEngine) window.soundEngine.playEMP();

        for (const e of enemies) {
            const dx = e.x - this.player.x;
            const dy = e.y - this.player.y;
            const dist = Math.hypot(dx, dy);

            if (dist < radius) {
                const crit = this.player.rollCrit();
                const dmg = this.player.calcDamage(this.damage, crit);
                e.takeDamage(dmg, crit, '#00e5ff');

                // Pushback force
                const force = (1 - dist / radius) * 20;
                e.x += (dx / Math.max(1, dist)) * force;
                e.y += (dy / Math.max(1, dist)) * force;

                // Freeze / Stun
                if (this.isEvolved) {
                    e.freeze(2.5); // Freeze enemy for 2.5s
                }
            }
        }
    }
}

window.WEAPON_CLASSES = {
    plasma_blaster: PlasmaBlaster,
    orbital_saber: OrbitalSaber,
    thunder_arc: ThunderArc,
    cluster_missiles: ClusterMissiles,
    vortex_singularity: VortexSingularity,
    emp_nova: EmpNova
};
