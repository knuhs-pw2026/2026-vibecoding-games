// ============================================================================
// NEON SURVIVOR: OVERDRIVE - Enemy System, AI, and Boss Overlord
// ============================================================================

class Enemy {
    constructor(x, y, config = {}) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.type = config.type || 'drone';
        this.hp = config.hp || 30;
        this.maxHp = this.hp;
        this.speed = config.speed || 2.2;
        this.baseSpeed = this.speed;
        this.radius = config.radius || 12;
        this.color = config.color || '#ff0055';
        this.damage = config.damage || 10;
        this.xpValue = config.xpValue || 2;
        this.isBoss = config.isBoss || false;
        this.isElite = config.isElite || false;

        this.flashTimer = 0;
        this.freezeTimer = 0;
        this.isFrozen = false;
        this.angle = 0;
    }

    takeDamage(dmg, isCrit = false, color = '#ffffff') {
        this.hp -= dmg;
        this.flashTimer = 0.1;
        window.particleSystem.spawnDamageText(this.x, this.y, Math.round(dmg), isCrit, color);

        if (this.hp <= 0) {
            this.die();
        }
    }

    freeze(duration = 2.0) {
        this.isFrozen = true;
        this.freezeTimer = duration;
    }

    die() {
        this.hp = 0;
        // Spawn XP
        window.particleSystem.spawnXpGem(this.x, this.y, this.xpValue);

        // Powerup drop chance
        const dropRoll = Math.random();
        if (this.isBoss) {
            window.particleSystem.spawnPickup(this.x, this.y, 'magnet');
            window.particleSystem.spawnPickup(this.x + 25, this.y, 'heal');
        } else if (this.isElite) {
            if (dropRoll < 0.5) window.particleSystem.spawnPickup(this.x, this.y, 'heal');
            else window.particleSystem.spawnPickup(this.x, this.y, 'bomb');
        } else if (dropRoll < 0.035) {
            const types = ['heal', 'bomb', 'magnet'];
            window.particleSystem.spawnPickup(this.x, this.y, types[Math.floor(Math.random() * types.length)]);
        }

        // Explosion visual & audio
        const scale = this.isBoss ? 3.5 : (this.isElite ? 1.8 : 0.8);
        window.particleSystem.spawnExplosion(this.x, this.y, this.color, scale);
        if (window.soundEngine) {
            window.soundEngine.playExplosion(scale);
        }

        if (window.gameInstance) {
            window.gameInstance.onEnemyKilled(this);
        }
    }

    update(dt, player, enemies) {
        // Freeze logic
        if (this.freezeTimer > 0) {
            this.freezeTimer -= dt;
            if (this.freezeTimer <= 0) {
                this.isFrozen = false;
            } else {
                return; // frozen, don't move or act
            }
        }

        if (this.flashTimer > 0) {
            this.flashTimer -= dt;
        }

        // Angle to player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);
        this.angle = Math.atan2(dy, dx);

        // Movement toward player
        if (dist > 1) {
            this.vx = (dx / dist) * this.speed;
            this.vy = (dy / dist) * this.speed;
        }

        // Separation from other enemies
        for (let i = 0; i < enemies.length; i++) {
            const other = enemies[i];
            if (other === this) continue;
            const ex = this.x - other.x;
            const ey = this.y - other.y;
            const eDist = Math.hypot(ex, ey);
            const minDist = this.radius + other.radius;
            if (eDist < minDist && eDist > 0) {
                const push = (minDist - eDist) / minDist * 1.5;
                this.vx += (ex / eDist) * push;
                this.vy += (ey / eDist) * push;
            }
        }

        this.x += this.vx * dt * 60;
        this.y += this.vy * dt * 60;

        // Player collision
        if (dist < this.radius + player.radius) {
            player.takeDamage(this.damage * dt * 4); // Continuous contact damage
        }
    }

    draw(ctx, camera) {
        const sx = this.x - camera.x;
        const sy = this.y - camera.y;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(this.angle);

        if (this.flashTimer > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 15;
        } else if (this.isFrozen) {
            ctx.fillStyle = '#70d6ff';
            ctx.shadowColor = '#70d6ff';
            ctx.shadowBlur = 12;
        } else {
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
        }

        this.renderShape(ctx);

        ctx.restore();

        // Draw Health Bar for Elites
        if (this.isElite && this.hp < this.maxHp) {
            this.drawHpBar(ctx, sx, sy - this.radius - 8, this.radius * 2, 4);
        }
    }

    renderShape(ctx) {
        // Default Triangle Drone
        ctx.beginPath();
        ctx.moveTo(this.radius * 1.2, 0);
        ctx.lineTo(-this.radius, -this.radius * 0.8);
        ctx.lineTo(-this.radius * 0.5, 0);
        ctx.lineTo(-this.radius, this.radius * 0.8);
        ctx.closePath();
        ctx.fill();
    }

    drawHpBar(ctx, sx, sy, width, height) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(sx - width / 2, sy, width, height);
        const hpPercent = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(sx - width / 2, sy, width * hpPercent, height);
        ctx.restore();
    }
}

// 1. Swarmer Bug (Fast, frail)
class CyberSwarmer extends Enemy {
    constructor(x, y, multiplier = 1) {
        super(x, y, {
            type: 'swarmer',
            hp: 20 * multiplier,
            speed: 3.2,
            radius: 9,
            color: '#ff0077',
            damage: 8 * multiplier,
            xpValue: 1
        });
    }

    renderShape(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.radius * 1.3, 0);
        ctx.lineTo(-this.radius, -this.radius * 0.7);
        ctx.lineTo(-this.radius, this.radius * 0.7);
        ctx.closePath();
        ctx.fill();
    }
}

// 2. Shielded Heavy Mech (High HP, frontal shield)
class ShieldMech extends Enemy {
    constructor(x, y, multiplier = 1) {
        super(x, y, {
            type: 'shield_mech',
            hp: 95 * multiplier,
            speed: 1.4,
            radius: 18,
            color: '#00d2ff',
            damage: 18 * multiplier,
            xpValue: 6
        });
    }

    renderShape(ctx) {
        // Heavy square body
        ctx.fillRect(-this.radius * 0.8, -this.radius * 0.8, this.radius * 1.6, this.radius * 1.6);
        // Energy shield arc
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 1.2, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();
    }
}

// 3. Kamikaze Drone (Rushes, blinks, explodes)
class KamikazeDrone extends Enemy {
    constructor(x, y, multiplier = 1) {
        super(x, y, {
            type: 'kamikaze',
            hp: 35 * multiplier,
            speed: 4.0,
            radius: 11,
            color: '#ff3300',
            damage: 30 * multiplier,
            xpValue: 4
        });
        this.detonateTimer = 0;
        this.isPrimed = false;
    }

    update(dt, player, enemies) {
        super.update(dt, player, enemies);
        const dist = Math.hypot(player.x - this.x, player.y - this.y);

        if (dist < 80 && !this.isPrimed) {
            this.isPrimed = true;
            this.detonateTimer = 1.0; // 1s fuse
        }

        if (this.isPrimed) {
            this.detonateTimer -= dt;
            this.color = Math.sin(Date.now() * 0.03) > 0 ? '#ffffff' : '#ff0000';
            if (this.detonateTimer <= 0) {
                // Detonate
                const pDist = Math.hypot(player.x - this.x, player.y - this.y);
                if (pDist < 100) {
                    player.takeDamage(this.damage);
                }
                this.die();
            }
        }
    }

    renderShape(ctx) {
        // Octagonal spike drone
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// 4. Sniper Drone (Keeps distance, aims telegraph laser, fires)
class SniperDrone extends Enemy {
    constructor(x, y, multiplier = 1) {
        super(x, y, {
            type: 'sniper',
            hp: 45 * multiplier,
            speed: 1.8,
            radius: 14,
            color: '#a855f7',
            damage: 25 * multiplier,
            xpValue: 8
        });
        this.aimTimer = 2.0;
        this.chargeTimer = 0;
        this.isAiming = false;
        this.aimTarget = { x: 0, y: 0 };
    }

    update(dt, player, enemies) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);

        // Maintain distance (around 300px)
        if (dist < 260) {
            this.speed = -1.8; // back away
        } else if (dist > 380) {
            this.speed = 2.0; // move closer
        } else {
            this.speed = 0.5;
        }

        super.update(dt, player, enemies);

        // Firing logic
        this.aimTimer -= dt;
        if (this.aimTimer <= 0 && !this.isAiming) {
            this.isAiming = true;
            this.chargeTimer = 1.2;
            this.aimTarget = { x: player.x, y: player.y };
        }

        if (this.isAiming) {
            this.chargeTimer -= dt;
            if (this.chargeTimer <= 0) {
                this.fireLaser(player);
                this.isAiming = false;
                this.aimTimer = 3.0;
            }
        }
    }

    fireLaser(player) {
        const angle = Math.atan2(this.aimTarget.y - this.y, this.aimTarget.x - this.x);
        const beamLength = 600;
        const lx = this.x + Math.cos(angle) * beamLength;
        const ly = this.y + Math.sin(angle) * beamLength;

        // Check player collision with laser line
        const dx = lx - this.x;
        const dy = ly - this.y;
        const lenSq = dx * dx + dy * dy;
        const t = Math.max(0, Math.min(1, ((player.x - this.x) * dx + (player.y - this.y) * dy) / lenSq));
        const projX = this.x + t * dx;
        const projY = this.y + t * dy;

        if (Math.hypot(player.x - projX, player.y - projY) <= player.radius + 8) {
            player.takeDamage(this.damage);
        }

        window.particleSystem.spawnShockwave(this.x, this.y, '#a855f7', 30, 0.2);
        if (window.soundEngine) window.soundEngine.playLaser(1.4);
    }

    draw(ctx, camera) {
        super.draw(ctx, camera);

        // Draw telegraph aiming laser
        if (this.isAiming) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 0, 85, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            ctx.moveTo(this.x - camera.x, this.y - camera.y);
            ctx.lineTo(this.aimTarget.x - camera.x, this.aimTarget.y - camera.y);
            ctx.stroke();
            ctx.restore();
        }
    }

    renderShape(ctx) {
        // Sleek triangular stealth chassis
        ctx.beginPath();
        ctx.moveTo(this.radius * 1.5, 0);
        ctx.lineTo(-this.radius, -this.radius * 0.9);
        ctx.lineTo(-this.radius * 0.4, 0);
        ctx.lineTo(-this.radius, this.radius * 0.9);
        ctx.closePath();
        ctx.fill();
    }
}

// 5. Elite Goliath (Mini-boss with projectile barrage)
class EliteGoliath extends Enemy {
    constructor(x, y, multiplier = 1) {
        super(x, y, {
            type: 'elite_goliath',
            hp: 400 * multiplier,
            speed: 1.6,
            radius: 28,
            color: '#ffd700',
            damage: 25 * multiplier,
            xpValue: 35,
            isElite: true
        });
        this.bulletTimer = 2.0;
    }

    update(dt, player, enemies) {
        super.update(dt, player, enemies);

        this.bulletTimer -= dt;
        if (this.bulletTimer <= 0) {
            this.bulletTimer = 3.0;
            this.fireRing();
        }
    }

    fireRing() {
        const ringCount = 10;
        for (let i = 0; i < ringCount; i++) {
            const angle = (i * Math.PI * 2) / ringCount;
            const speed = 4;
            window.gameInstance.enemyProjectiles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 6,
                color: '#ffd700',
                damage: this.damage * 0.8,
                life: 3.5
            });
        }
        if (window.soundEngine) window.soundEngine.playPlasma(0.8);
    }

    renderShape(ctx) {
        // Heavy Hexagon Titan
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI) / 3;
            const px = Math.cos(a) * this.radius;
            const py = Math.sin(a) * this.radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}

// 6. STAGE OVERLORD BOSS: 'CYBER TITAN OVERLORD'
class BossOverlord extends Enemy {
    constructor(x, y) {
        super(x, y, {
            type: 'boss_overlord',
            hp: 2500,
            speed: 1.8,
            radius: 55,
            color: '#ff0033',
            damage: 40,
            xpValue: 200,
            isBoss: true
        });
        this.phase = 1; // 1: Barrage, 2: Laser Sweep, 3: Enrage
        this.attackTimer = 2.0;
        this.laserAngle = 0;
        this.isFiringMegaLaser = false;
        this.megaLaserDuration = 0;
        this.subMinionTimer = 5.0;

        if (window.soundEngine) {
            window.soundEngine.playBossSiren();
            window.soundEngine.intensity = 3;
        }
    }

    update(dt, player, enemies) {
        // Determine phase based on HP %
        const hpPct = this.hp / this.maxHp;
        if (hpPct <= 0.3) {
            this.phase = 3;
            this.speed = 2.8;
        } else if (hpPct <= 0.65) {
            this.phase = 2;
            this.speed = 2.0;
        }

        super.update(dt, player, enemies);

        // Boss Attack Routines
        this.attackTimer -= dt;
        this.subMinionTimer -= dt;

        if (this.subMinionTimer <= 0) {
            this.subMinionTimer = 6.0;
            // Spawn swarmers
            for (let i = 0; i < 4; i++) {
                const ang = (i * Math.PI * 2) / 4;
                const minion = new CyberSwarmer(this.x + Math.cos(ang) * 70, this.y + Math.sin(ang) * 70, 1.2);
                window.gameInstance.enemies.push(minion);
            }
        }

        if (this.attackTimer <= 0) {
            if (this.phase === 1) {
                this.attackSpiralBurst();
                this.attackTimer = 1.8;
            } else if (this.phase === 2) {
                if (Math.random() < 0.5) {
                    this.startMegaLaserSweep();
                    this.attackTimer = 5.5;
                } else {
                    this.attackSpiralBurst();
                    this.attackTimer = 1.5;
                }
            } else {
                // Phase 3: Enrage
                this.attackSpiralBurst(16);
                this.attackTimer = 1.2;
                window.particleSystem.spawnShockwave(this.x, this.y, '#ff0033', 180, 0.4, 6);
            }
        }

        // Handle Mega Laser
        if (this.isFiringMegaLaser) {
            this.megaLaserDuration -= dt;
            this.laserAngle += dt * 1.2;
            this.checkMegaLaserHit(player);
            if (this.megaLaserDuration <= 0) {
                this.isFiringMegaLaser = false;
            }
        }
    }

    attackSpiralBurst(count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = (i * Math.PI * 2) / count + this.angle;
            const speed = 4.5;
            window.gameInstance.enemyProjectiles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 7,
                color: '#ff0055',
                damage: 20,
                life: 4.0
            });
        }
        if (window.soundEngine) window.soundEngine.playPlasma(0.6);
    }

    startMegaLaserSweep() {
        this.isFiringMegaLaser = true;
        this.megaLaserDuration = 3.5;
        this.laserAngle = this.angle - Math.PI / 3;
        if (window.soundEngine) window.soundEngine.playLaser(0.4);
    }

    checkMegaLaserHit(player) {
        const beamLength = 800;
        const lx = this.x + Math.cos(this.laserAngle) * beamLength;
        const ly = this.y + Math.sin(this.laserAngle) * beamLength;

        const dx = lx - this.x;
        const dy = ly - this.y;
        const lenSq = dx * dx + dy * dy;
        const t = Math.max(0, Math.min(1, ((player.x - this.x) * dx + (player.y - this.y) * dy) / lenSq));
        const projX = this.x + t * dx;
        const projY = this.y + t * dy;

        if (Math.hypot(player.x - projX, player.y - projY) <= player.radius + 20) {
            player.takeDamage(45 * 0.05); // Rapid laser beam burn
        }
    }

    draw(ctx, camera) {
        super.draw(ctx, camera);

        // Draw Mega Laser Beam if active
        if (this.isFiringMegaLaser) {
            const sx = this.x - camera.x;
            const sy = this.y - camera.y;
            const beamLength = 800;
            const ex = sx + Math.cos(this.laserAngle) * beamLength;
            const ey = sy + Math.sin(this.laserAngle) * beamLength;

            ctx.save();
            ctx.strokeStyle = 'rgba(255, 0, 50, 0.4)';
            ctx.lineWidth = 36;
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#ff0033';
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.stroke();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.stroke();
            ctx.restore();
        }
    }

    renderShape(ctx) {
        // Giant Cybernetic Overlord Fortress Shape
        const spikes = 8;
        ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
            const a = (i * Math.PI * 2) / spikes;
            const r = (i % 2 === 0) ? this.radius : this.radius * 0.7;
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Glowing core eye
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
    }
}

window.CyberSwarmer = CyberSwarmer;
window.ShieldMech = ShieldMech;
window.KamikazeDrone = KamikazeDrone;
window.SniperDrone = SniperDrone;
window.EliteGoliath = EliteGoliath;
window.BossOverlord = BossOverlord;
