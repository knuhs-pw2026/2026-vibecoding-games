// ============================================================================
// NEON SURVIVOR: OVERDRIVE - Player Character & Controls
// ============================================================================

class Player {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = 16;
        this.facingAngle = 0;

        // Core Base Stats
        this.baseSpeed = 4.2;
        this.moveSpeedMultiplier = 1.0;
        this.maxHp = 100;
        this.hp = 100;
        this.hpRegen = 0; // hp per second
        this.maxShield = 0;
        this.shield = 0;
        this.shieldRegenRate = 5;
        this.shieldRegenTimer = 0;

        // Offensive Modifiers
        this.damageMultiplier = 1.0;
        this.cooldownMultiplier = 1.0;
        this.areaMultiplier = 1.0;
        this.critChance = 0.08; // 8% base
        this.critMultiplier = 1.5;
        this.bonusProjectiles = 0;

        // Utility Modifiers
        this.magnetRadius = 90;
        this.magnetMultiplier = 1.0;
        this.dashCooldownMultiplier = 1.0;

        // Dash / Hyperdrive
        this.isDashing = false;
        this.dashTimer = 0;
        this.dashDuration = 0.22;
        this.dashCooldown = 2.4;
        this.dashCooldownTimer = 0;
        this.dashSpeed = 16;
        this.dashDir = { x: 1, y: 0 };
        this.invulnerableTimer = 0;
        this.dashGhosts = [];

        // Progression & Leveling
        this.level = 1;
        this.exp = 0;
        this.expToNext = 10;
        this.score = 0;
        this.kills = 0;

        // Inventory
        this.weapons = new Map(); // weaponId -> Weapon instance
        this.passives = new Map(); // passiveId -> level

        // Visual effects
        this.thrustTimer = 0;
        this.hitFlashTimer = 0;
    }

    initStartingWeapon() {
        // Start with Plasma Blaster
        const starter = new window.WEAPON_CLASSES.plasma_blaster(this);
        this.weapons.set('plasma_blaster', starter);
    }

    reset(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.maxHp = 100;
        this.hp = 100;
        this.maxShield = 0;
        this.shield = 0;
        this.hpRegen = 0;
        this.moveSpeedMultiplier = 1.0;
        this.damageMultiplier = 1.0;
        this.cooldownMultiplier = 1.0;
        this.areaMultiplier = 1.0;
        this.critChance = 0.08;
        this.critMultiplier = 1.5;
        this.bonusProjectiles = 0;
        this.magnetMultiplier = 1.0;
        this.dashCooldownMultiplier = 1.0;

        this.level = 1;
        this.exp = 0;
        this.expToNext = 10;
        this.score = 0;
        this.kills = 0;
        this.dashCooldownTimer = 0;
        this.isDashing = false;
        this.invulnerableTimer = 0;

        this.weapons.clear();
        this.passives.clear();
        this.initStartingWeapon();
    }

    getEffectiveSpeed() {
        return this.baseSpeed * this.moveSpeedMultiplier;
    }

    getCooldownMultiplier() {
        return this.cooldownMultiplier;
    }

    getAreaMultiplier() {
        return this.areaMultiplier;
    }

    getMagnetRadius() {
        return this.magnetRadius * this.magnetMultiplier;
    }

    rollCrit() {
        return Math.random() < this.critChance;
    }

    calcDamage(baseDmg, isCrit = false) {
        let dmg = baseDmg * this.damageMultiplier;
        if (isCrit) dmg *= this.critMultiplier;
        return dmg;
    }

    takeDamage(amount) {
        if (this.invulnerableTimer > 0 || this.isDashing) return;

        this.hitFlashTimer = 0.12;

        // Shield absorption
        if (this.shield > 0) {
            if (this.shield >= amount) {
                this.shield -= amount;
                amount = 0;
            } else {
                amount -= this.shield;
                this.shield = 0;
            }
        }

        if (amount > 0) {
            this.hp -= amount;
            if (window.soundEngine) window.soundEngine.playHit();
            window.gameInstance.triggerScreenShake(4, 0.15);
        }

        if (this.hp <= 0) {
            this.hp = 0;
            window.gameInstance.onPlayerDeath();
        }
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    addExp(amount) {
        this.exp += amount;
        this.score += amount * 25;

        while (this.exp >= this.expToNext) {
            this.exp -= this.expToNext;
            this.level++;
            this.expToNext = Math.floor(10 + Math.pow(this.level, 1.45) * 6);
            if (window.soundEngine) window.soundEngine.playLevelUp();
            window.gameInstance.onLevelUp();
        }
    }

    dash(dirX, dirY) {
        if (this.dashCooldownTimer > 0 || this.isDashing) return;

        let len = Math.hypot(dirX, dirY);
        if (len === 0) {
            len = 1;
            dirX = Math.cos(this.facingAngle);
            dirY = Math.sin(this.facingAngle);
        } else {
            dirX /= len;
            dirY /= len;
        }

        this.isDashing = true;
        this.dashTimer = this.dashDuration;
        this.dashCooldownTimer = this.dashCooldown * this.dashCooldownMultiplier;
        this.invulnerableTimer = this.dashDuration + 0.08;
        this.dashDir = { x: dirX, y: dirY };

        if (window.soundEngine) window.soundEngine.playDash();
        window.particleSystem.spawnShockwave(this.x, this.y, '#00ffff', 60, 0.3);
    }

    update(dt, input, enemies) {
        if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;
        if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;
        if (this.dashCooldownTimer > 0) this.dashCooldownTimer -= dt;

        // Health Regeneration
        if (this.hpRegen > 0 && this.hp < this.maxHp) {
            this.hp = Math.min(this.maxHp, this.hp + this.hpRegen * dt);
        }

        // Shield Regeneration
        if (this.maxShield > 0 && this.shield < this.maxShield) {
            this.shield = Math.min(this.maxShield, this.shield + this.shieldRegenRate * dt);
        }

        // Dash Update
        if (this.isDashing) {
            this.dashTimer -= dt;
            this.x += this.dashDir.x * this.dashSpeed;
            this.y += this.dashDir.y * this.dashSpeed;

            // Spawn Dash Ghost
            this.dashGhosts.push({
                x: this.x,
                y: this.y,
                angle: this.facingAngle,
                alpha: 0.8
            });

            if (this.dashTimer <= 0) {
                this.isDashing = false;
            }
        } else {
            // Normal Movement
            let moveX = 0;
            let moveY = 0;

            if (input.keys['KeyW'] || input.keys['ArrowUp']) moveY -= 1;
            if (input.keys['KeyS'] || input.keys['ArrowDown']) moveY += 1;
            if (input.keys['KeyA'] || input.keys['ArrowLeft']) moveX -= 1;
            if (input.keys['KeyD'] || input.keys['ArrowRight']) moveX += 1;

            // Virtual Joystick / Touch support
            if (input.joystickActive) {
                moveX = input.joystickX;
                moveY = input.joystickY;
            }

            const moveLen = Math.hypot(moveX, moveY);
            if (moveLen > 0) {
                const spd = this.getEffectiveSpeed();
                this.vx = (moveX / moveLen) * spd;
                this.vy = (moveY / moveLen) * spd;
                this.facingAngle = Math.atan2(this.vy, this.vx);

                // Engine thrust particles
                this.thrustTimer += dt;
                if (this.thrustTimer > 0.04) {
                    this.thrustTimer = 0;
                    const backAngle = this.facingAngle + Math.PI;
                    const tx = this.x + Math.cos(backAngle) * 14;
                    const ty = this.y + Math.sin(backAngle) * 14;
                    window.particleSystem.spawnSparks(tx, ty, '#00ffff', 2, 2, 2, 0.2);
                }
            } else {
                this.vx *= 0.8;
                this.vy *= 0.8;
            }

            this.x += this.vx * dt * 60;
            this.y += this.vy * dt * 60;

            // Check Dash Input
            if (input.dashRequested) {
                this.dash(moveX, moveY);
                input.dashRequested = false;
            }
        }

        // Clamp inside arena bounds
        const arenaSize = 2400;
        this.x = Math.max(-arenaSize, Math.min(arenaSize, this.x));
        this.y = Math.max(-arenaSize, Math.min(arenaSize, this.y));

        // Update Dash Ghosts
        for (let i = this.dashGhosts.length - 1; i >= 0; i--) {
            const g = this.dashGhosts[i];
            g.alpha -= dt * 4;
            if (g.alpha <= 0) {
                this.dashGhosts.splice(i, 1);
            }
        }

        // Update Weapons
        for (const weapon of this.weapons.values()) {
            weapon.update(dt, enemies);
        }
    }

    draw(ctx, camera) {
        const sx = this.x - camera.x;
        const sy = this.y - camera.y;

        // Draw Dash Ghosts
        for (const g of this.dashGhosts) {
            ctx.save();
            ctx.globalAlpha = g.alpha;
            ctx.translate(g.x - camera.x, g.y - camera.y);
            ctx.rotate(g.angle);
            ctx.fillStyle = '#00e5ff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00ffff';
            this.renderShipBody(ctx);
            ctx.restore();
        }

        // Draw Player Weapons visuals (e.g. Orbital blades, beams)
        for (const weapon of this.weapons.values()) {
            weapon.draw(ctx, camera);
        }

        // Draw Shield Aura if active
        if (this.shield > 0) {
            ctx.save();
            ctx.strokeStyle = '#00d2ff';
            ctx.lineWidth = 2.5;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00d2ff';
            ctx.beginPath();
            ctx.arc(sx, sy, this.radius * 1.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Draw Player Ship
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(this.facingAngle);

        if (this.hitFlashTimer > 0) {
            ctx.fillStyle = '#ff0055';
            ctx.shadowColor = '#ff0055';
            ctx.shadowBlur = 20;
        } else if (this.invulnerableTimer > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 20;
        } else {
            ctx.fillStyle = '#00ffff';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 14;
        }

        this.renderShipBody(ctx);
        ctx.restore();
    }

    renderShipBody(ctx) {
        // Futuristic Cyber Interceptor Shape
        ctx.beginPath();
        ctx.moveTo(this.radius * 1.4, 0); // nose
        ctx.lineTo(-this.radius * 0.9, -this.radius * 0.9); // left wing
        ctx.lineTo(-this.radius * 0.4, -this.radius * 0.3); // left intake
        ctx.lineTo(-this.radius * 0.9, 0); // rear engine
        ctx.lineTo(-this.radius * 0.4, this.radius * 0.3); // right intake
        ctx.lineTo(-this.radius * 0.9, this.radius * 0.9); // right wing
        ctx.closePath();
        ctx.fill();

        // Cockpit canopy glow
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.radius * 0.2, 0, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

window.Player = Player;
