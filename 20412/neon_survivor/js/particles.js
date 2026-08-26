// ============================================================================
// NEON SURVIVOR: OVERDRIVE - Particle & Visual Effects Engine
// ============================================================================

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.damageTexts = [];
        this.shockwaves = [];
        this.xpGems = [];
        this.pickups = []; // Health stims, screen nuke, super magnet
        this.maxParticles = 600;
        this.particleDensity = 1.0; // modified by settings
    }

    reset() {
        this.particles = [];
        this.damageTexts = [];
        this.shockwaves = [];
        this.xpGems = [];
        this.pickups = [];
    }

    // --- Sparks and Debris ---
    spawnSparks(x, y, color, count = 8, speed = 4, size = 3, life = 0.5) {
        const adjustedCount = Math.floor(count * this.particleDensity);
        for (let i = 0; i < adjustedCount; i++) {
            if (this.particles.length >= this.maxParticles) break;
            const angle = Math.random() * Math.PI * 2;
            const spd = (Math.random() * 0.7 + 0.3) * speed;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                color,
                size: Math.random() * size + 1.5,
                alpha: 1,
                life: life * (Math.random() * 0.5 + 0.75),
                maxLife: life,
                drag: 0.94,
                shape: 'spark'
            });
        }
    }

    spawnExplosion(x, y, color = '#ff0055', scale = 1) {
        this.spawnSparks(x, y, color, 24 * scale, 7 * scale, 4 * scale, 0.6);
        this.spawnSparks(x, y, '#ffffff', 12 * scale, 9 * scale, 2 * scale, 0.4);
        this.spawnShockwave(x, y, color, 45 * scale, 0.4);
    }

    // --- Shockwaves ---
    spawnShockwave(x, y, color = '#00ffff', maxRadius = 50, duration = 0.4, lineWidth = 4) {
        this.shockwaves.push({
            x, y,
            radius: 5,
            maxRadius,
            color,
            lineWidth,
            alpha: 1,
            life: duration,
            maxLife: duration
        });
    }

    // --- Floating Damage Text ---
    spawnDamageText(x, y, text, isCrit = false, color = '#ffffff') {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
        const speed = isCrit ? 3.5 : 2.2;
        this.damageTexts.push({
            x: x + (Math.random() - 0.5) * 15,
            y: y - 10,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            text: isCrit ? `${text}!` : text,
            isCrit,
            color: isCrit ? '#ffea00' : color,
            alpha: 1,
            scale: isCrit ? 1.6 : 1.0,
            life: 0.65,
            maxLife: 0.65
        });
    }

    // --- XP Gems ---
    spawnXpGem(x, y, value = 1) {
        let color = '#00ffff'; // Tier 1: Cyan
        let size = 4;
        if (value >= 50) {
            color = '#ff0055'; // Tier 4: Red/Ruby
            size = 8;
        } else if (value >= 15) {
            color = '#bd00ff'; // Tier 3: Purple/Amethyst
            size = 6.5;
        } else if (value >= 5) {
            color = '#00ff66'; // Tier 2: Emerald
            size = 5;
        }

        this.xpGems.push({
            x, y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            value,
            color,
            size,
            pulse: Math.random() * Math.PI * 2,
            isMagnetized: false,
            speed: 0
        });
    }

    // --- World Pickups ---
    spawnPickup(x, y, type) {
        // types: 'heal', 'bomb', 'magnet'
        let color = '#00ff66';
        let label = '+HP';
        if (type === 'bomb') {
            color = '#ff3300';
            label = 'NUKE';
        } else if (type === 'magnet') {
            color = '#00e5ff';
            label = 'MAG';
        }

        this.pickups.push({
            x, y,
            type,
            color,
            label,
            size: 14,
            pulse: 0,
            life: 30 // lasts 30 seconds
        });
    }

    update(dt, player) {
        // 1. Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= p.drag;
            p.vy *= p.drag;
            p.alpha = Math.max(0, p.life / p.maxLife);
        }

        // 2. Update shockwaves
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.life -= dt;
            if (sw.life <= 0) {
                this.shockwaves.splice(i, 1);
                continue;
            }
            const progress = 1 - (sw.life / sw.maxLife);
            sw.radius = 5 + (sw.maxRadius - 5) * Math.sqrt(progress);
            sw.alpha = 1 - progress;
        }

        // 3. Update Damage Texts
        for (let i = this.damageTexts.length - 1; i >= 0; i--) {
            const dtText = this.damageTexts[i];
            dtText.life -= dt;
            if (dtText.life <= 0) {
                this.damageTexts.splice(i, 1);
                continue;
            }
            dtText.x += dtText.vx;
            dtText.y += dtText.vy;
            dtText.vy += 2.5 * dt; // slight gravity
            dtText.alpha = Math.max(0, dtText.life / dtText.maxLife);
        }

        // 4. Update Pickups
        for (let i = this.pickups.length - 1; i >= 0; i--) {
            const item = this.pickups[i];
            item.pulse += dt * 4;
            item.life -= dt;
            if (item.life <= 0) {
                this.pickups.splice(i, 1);
                continue;
            }

            // Check collision with player
            const dx = player.x - item.x;
            const dy = player.y - item.y;
            const dist = Math.hypot(dx, dy);
            if (dist < player.radius + item.size) {
                // Collect pickup
                if (item.type === 'heal') {
                    player.heal(player.maxHp * 0.4);
                    if (window.soundEngine) window.soundEngine.playPowerup();
                    this.spawnDamageText(player.x, player.y, `+${Math.round(player.maxHp * 0.4)} HP`, true, '#00ff88');
                } else if (item.type === 'bomb') {
                    if (window.gameInstance) window.gameInstance.triggerScreenNuke();
                } else if (item.type === 'magnet') {
                    // Magnetize all gems on screen
                    this.magnetizeAllGems();
                    if (window.soundEngine) window.soundEngine.playPowerup();
                    this.spawnDamageText(player.x, player.y, 'SUPER MAGNET!', true, '#00ffff');
                }
                this.spawnShockwave(item.x, item.y, item.color, 40, 0.3);
                this.pickups.splice(i, 1);
            }
        }

        // 5. Update XP Gems
        const magnetDist = player.getMagnetRadius();
        for (let i = this.xpGems.length - 1; i >= 0; i--) {
            const gem = this.xpGems[i];
            gem.pulse += dt * 3;

            const dx = player.x - gem.x;
            const dy = player.y - gem.y;
            const dist = Math.hypot(dx, dy);

            // Gem is within magnet range
            if (dist < magnetDist || gem.isMagnetized) {
                gem.isMagnetized = true;
                gem.speed = Math.min(22, (gem.speed || 3) + 25 * dt);
                const moveAngle = Math.atan2(dy, dx);
                gem.x += Math.cos(moveAngle) * gem.speed;
                gem.y += Math.sin(moveAngle) * gem.speed;
            } else {
                gem.x += gem.vx;
                gem.y += gem.vy;
                gem.vx *= 0.92;
                gem.vy *= 0.92;
            }

            // Collection Check
            if (dist < player.radius + gem.size + 4) {
                player.addExp(gem.value);
                if (window.soundEngine) window.soundEngine.playXpPickup();
                this.spawnSparks(gem.x, gem.y, gem.color, 4, 3, 2, 0.3);
                this.xpGems.splice(i, 1);
            }
        }
    }

    magnetizeAllGems() {
        for (const gem of this.xpGems) {
            gem.isMagnetized = true;
        }
    }

    draw(ctx, camera) {
        // --- Draw XP Gems ---
        for (const gem of this.xpGems) {
            const sx = gem.x - camera.x;
            const sy = gem.y - camera.y;
            const pScale = 1 + Math.sin(gem.pulse) * 0.2;

            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = gem.color;
            ctx.fillStyle = gem.color;
            ctx.beginPath();
            // Diamond shape
            ctx.moveTo(sx, sy - gem.size * pScale);
            ctx.lineTo(sx + gem.size * pScale, sy);
            ctx.lineTo(sx, sy + gem.size * pScale);
            ctx.lineTo(sx - gem.size * pScale, sy);
            ctx.closePath();
            ctx.fill();

            // Core highlight
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(sx, sy, gem.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // --- Draw Pickups ---
        for (const item of this.pickups) {
            const sx = item.x - camera.x;
            const sy = item.y - camera.y;
            const glow = 10 + Math.sin(item.pulse) * 5;

            ctx.save();
            ctx.shadowBlur = glow;
            ctx.shadowColor = item.color;
            ctx.strokeStyle = item.color;
            ctx.lineWidth = 2.5;
            ctx.fillStyle = 'rgba(10, 15, 30, 0.85)';

            // Draw glowing octagon or box
            ctx.beginPath();
            ctx.arc(sx, sy, item.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Icon label
            ctx.fillStyle = item.color;
            ctx.font = 'bold 9px "Orbitron", "Courier New", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.label, sx, sy);
            ctx.restore();
        }

        // --- Draw Shockwaves ---
        for (const sw of this.shockwaves) {
            ctx.save();
            ctx.globalAlpha = sw.alpha;
            ctx.strokeStyle = sw.color;
            ctx.lineWidth = sw.lineWidth;
            ctx.shadowBlur = 12;
            ctx.shadowColor = sw.color;
            ctx.beginPath();
            ctx.arc(sw.x - camera.x, sw.y - camera.y, sw.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // --- Draw Sparks ---
        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x - camera.x, p.y - camera.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // --- Draw Damage Text ---
        for (const dtText of this.damageTexts) {
            ctx.save();
            ctx.globalAlpha = dtText.alpha;
            ctx.font = dtText.isCrit
                ? `900 ${Math.floor(18 * dtText.scale)}px "Orbitron", sans-serif`
                : `bold ${Math.floor(13 * dtText.scale)}px "Orbitron", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = dtText.color;
            ctx.shadowBlur = dtText.isCrit ? 14 : 6;
            ctx.shadowColor = dtText.color;
            ctx.fillText(dtText.text, dtText.x - camera.x, dtText.y - camera.y);
            ctx.restore();
        }
    }
}

window.particleSystem = new ParticleSystem();
