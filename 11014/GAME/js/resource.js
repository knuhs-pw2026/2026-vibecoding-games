/**
 * LORDZ RAID: Resource Nodes, Trees, Rocks, Chests & Built Gold Mines
 * Handles Harvestable Trees (나무), Stone Rocks (돌), Gold Veins, Mana Crystals, and Chests.
 */

class ResourceNode {
  constructor(x, y, type = 'tree') {
    this.x = x;
    this.y = y;
    this.type = type; // 'tree' | 'rock' | 'gold_vein' | 'mana_crystal' | 'chest'
    
    // Type specific sizes and HP
    if (type === 'tree') {
      this.radius = 32;
      this.maxHp = 80;
    } else if (type === 'rock') {
      this.radius = 26;
      this.maxHp = 100;
    } else if (type === 'gold_vein') {
      this.radius = 28;
      this.maxHp = 140;
    } else if (type === 'mana_crystal') {
      this.radius = 26;
      this.maxHp = 110;
    } else if (type === 'chest') {
      this.radius = 24;
      this.maxHp = 60;
    }

    this.hp = this.maxHp;
    this.dead = false;
    this.respawnTimer = 0;
    this.maxRespawn = type === 'chest' ? 12.0 : 7.0;
    this.hitShake = 0;
    this.swayAngle = Math.random() * Math.PI * 2;
    this.variant = Math.floor(Math.random() * 3);
  }

  takeDamage(amount, isCritOrGame = false, maybeGame = null) {
    if (this.dead) return;
    
    // Resolve game instance safely
    let game = null;
    if (isCritOrGame && typeof isCritOrGame === 'object' && isCritOrGame.addGold) {
      game = isCritOrGame;
    } else if (maybeGame && typeof maybeGame === 'object' && maybeGame.addGold) {
      game = maybeGame;
    }

    this.hp -= amount;
    this.hitShake = 0.22;

    if (this.type === 'tree') {
      if (window.audio) window.audio.playTreeChop();
      if (game) {
        const reward = Math.round(amount * 0.35 + 2);
        game.addGold(reward, this.x, this.y);
        // Random fruit drop (heals lord or squad)
        if (Math.random() < 0.25 && game.lord) {
          game.lord.heal(15);
        }
      }
      if (window.particles) {
        window.particles.spawnBurst(this.x, this.y - 15, '#22c55e', 5, 3, 3, 'circle', 0.4);
      }
    } else if (this.type === 'rock') {
      if (window.audio) window.audio.playMineHit();
      if (game) {
        const reward = Math.round(amount * 0.4 + 3);
        game.addGold(reward, this.x, this.y);
      }
      if (window.particles) {
        window.particles.spawnBurst(this.x, this.y, '#94a3b8', 5, 4, 2.5, 'spark', 0.35);
      }
    } else if (this.type === 'gold_vein') {
      if (window.audio) window.audio.playMineHit();
      if (game) {
        const reward = Math.round(amount * 0.6 + 4);
        game.addGold(reward, this.x, this.y);
      }
      if (window.particles) {
        window.particles.spawnGoldSparks(this.x, this.y, 4);
      }
    } else if (this.type === 'mana_crystal') {
      if (window.audio) window.audio.playMineHit();
      if (game) {
        const reward = Math.max(1, Math.round(amount * 0.2 + 1));
        game.addMana(reward, this.x, this.y);
      }
      if (window.particles) {
        window.particles.spawnManaSparks(this.x, this.y, 4);
      }
    } else if (this.type === 'chest') {
      if (window.audio) window.audio.playMineHit();
      if (game) {
        const reward = Math.round(amount * 0.8 + 6);
        game.addGold(reward, this.x, this.y);
      }
      if (window.particles) {
        window.particles.spawnGoldSparks(this.x, this.y, 6);
      }
    }

    // Node Depletion / Breaking Bonus
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
      this.respawnTimer = this.maxRespawn;

      if (game) {
        if (this.type === 'tree') {
          game.addGold(40, this.x, this.y);
          if (window.particles) {
            window.particles.spawnBurst(this.x, this.y, '#16a34a', 20, 6, 4, 'circle', 0.6);
            window.particles.spawnBurst(this.x, this.y, '#854d0e', 10, 4, 3, 'spark', 0.5);
          }
        } else if (this.type === 'rock') {
          game.addGold(60, this.x, this.y);
          if (window.particles) {
            window.particles.spawnBurst(this.x, this.y, '#64748b', 16, 6, 3, 'spark', 0.5);
          }
        } else if (this.type === 'gold_vein') {
          game.addGold(100, this.x, this.y);
          if (window.particles) {
            window.particles.spawnBurst(this.x, this.y, '#fbbf24', 22, 7, 4.5, 'star', 0.7);
          }
        } else if (this.type === 'mana_crystal') {
          game.addMana(20, this.x, this.y);
          if (window.particles) {
            window.particles.spawnBurst(this.x, this.y, '#38bdf8', 20, 7, 4.5, 'star', 0.7);
          }
        } else if (this.type === 'chest') {
          game.addGold(200, this.x, this.y);
          game.addMana(25, this.x, this.y);
          if (window.particles) {
            window.particles.spawnBurst(this.x, this.y, '#fbbf24', 30, 9, 5, 'star', 0.9);
          }
        }
      }
    }
  }

  update(dt) {
    if (this.hitShake > 0) {
      this.hitShake -= dt;
    }
    this.swayAngle += dt * 1.5;

    if (this.dead) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.dead = false;
        this.hp = this.maxHp;
      }
    }
  }

  draw(ctx) {
    if (this.dead) {
      // Draw small stump or rubble
      ctx.save();
      ctx.fillStyle = this.type === 'tree' ? '#78350f' : '#475569';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.radius * 0.45, this.radius * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.save();
    let shakeX = 0;
    let shakeY = 0;
    if (this.hitShake > 0) {
      shakeX = (Math.random() * 6 - 3);
      shakeY = (Math.random() * 6 - 3);
    }
    ctx.translate(this.x + shakeX, this.y + shakeY);

    if (this.type === 'tree') {
      // 1. Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 10, this.radius * 1.1, this.radius * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Trunk
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-6, -4, 12, 18);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(-4, -4, 4, 18);

      // 3. Foliage Canopies (Lush green layers)
      const sway = Math.sin(this.swayAngle) * 2;

      // Bottom layer
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(sway * 0.5, -8, this.radius * 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Middle layer
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(-sway * 0.5, -20, this.radius * 0.75, 0, Math.PI * 2);
      ctx.fill();

      // Top highlight layer
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(0, -30, this.radius * 0.55, 0, Math.PI * 2);
      ctx.fill();

      // Red fruit / Apple dots
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-10, -16, 3, 0, Math.PI * 2);
      ctx.arc(12, -22, 3, 0, Math.PI * 2);
      ctx.arc(2, -34, 2.5, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'rock') {
      // 1. Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 6, this.radius * 1.1, this.radius * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Boulder Body
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(-this.radius * 0.9, 4);
      ctx.lineTo(-this.radius * 0.7, -this.radius * 0.7);
      ctx.lineTo(this.radius * 0.4, -this.radius * 0.85);
      ctx.lineTo(this.radius * 0.95, -this.radius * 0.1);
      ctx.lineTo(this.radius * 0.6, this.radius * 0.6);
      ctx.lineTo(-this.radius * 0.5, this.radius * 0.5);
      ctx.closePath();
      ctx.fill();

      // Highlights & Cracks
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(-this.radius * 0.5, -this.radius * 0.6);
      ctx.lineTo(this.radius * 0.2, -this.radius * 0.75);
      ctx.lineTo(this.radius * 0.6, -this.radius * 0.2);
      ctx.lineTo(0, -this.radius * 0.1);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-4, -6);
      ctx.lineTo(4, 2);
      ctx.lineTo(8, 8);
      ctx.stroke();

    } else if (this.type === 'gold_vein') {
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 8, this.radius * 1.1, this.radius * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Golden Ore Rock
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // Golden veins / nuggets
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(-8, -6, 9, 0, Math.PI * 2);
      ctx.arc(8, 6, 8, 0, Math.PI * 2);
      ctx.arc(6, -8, 6, 0, Math.PI * 2);
      ctx.arc(-6, 8, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(-8, -6, 4, 0, Math.PI * 2);
      ctx.arc(8, 6, 3, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'mana_crystal') {
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 8, this.radius * 0.9, this.radius * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Ancient Mana Crystal
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(0, -this.radius);
      ctx.lineTo(this.radius * 0.8, 0);
      ctx.lineTo(0, this.radius);
      ctx.lineTo(-this.radius * 0.8, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.moveTo(0, -this.radius * 0.6);
      ctx.lineTo(this.radius * 0.4, 0);
      ctx.lineTo(0, this.radius * 0.6);
      ctx.lineTo(-this.radius * 0.4, 0);
      ctx.closePath();
      ctx.fill();

    } else if (this.type === 'chest') {
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 8, this.radius * 1.0, this.radius * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Treasure Chest
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(-this.radius * 0.8, -this.radius * 0.6, this.radius * 1.6, this.radius * 1.2);

      // Gold trims
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-this.radius * 0.8, -this.radius * 0.6, 6, this.radius * 1.2);
      ctx.fillRect(this.radius * 0.8 - 6, -this.radius * 0.6, 6, this.radius * 1.2);
      ctx.fillRect(-this.radius * 0.8, -3, this.radius * 1.6, 6);

      // Keyhole
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Health Bar
    if (this.hp < this.maxHp) {
      const barWidth = 36;
      const barHeight = 4;
      const pct = Math.max(0, this.hp / this.maxHp);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(-barWidth / 2, -this.radius - 12, barWidth, barHeight);
      ctx.fillStyle = this.type === 'tree' ? '#22c55e' : this.type === 'mana_crystal' ? '#38bdf8' : '#fbbf24';
      ctx.fillRect(-barWidth / 2, -this.radius - 12, barWidth * pct, barHeight);
    }

    ctx.restore();
  }
}

/**
 * Built Gold Mine Structure
 */
class GoldMineBuilding {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 32;
    this.goldPerSec = 15;
    this.timer = 0;
    this.pulseAnim = 0;
  }

  update(dt, game) {
    this.timer += dt;
    this.pulseAnim += dt * 3;
    if (this.timer >= 1.0) {
      this.timer -= 1.0;
      if (game && game.addGold) {
        game.addGold(this.goldPerSec, this.x, this.y - 20, false);
      }
      if (window.particles) window.particles.spawnGoldSparks(this.x, this.y, 2);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Stone base
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Mine cart graphic
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-14, -14, 28, 28);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 16px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⛏️', 0, 0);

    // Pulsing aura
    const pulseScale = 1 + Math.sin(this.pulseAnim) * 0.08;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * pulseScale, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Income tag
    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 10px Outfit';
    ctx.fillText('+15g/s', 0, -this.radius - 8);

    ctx.restore();
  }
}
