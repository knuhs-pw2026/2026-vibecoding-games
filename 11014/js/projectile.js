/**
 * ANCIENT CASTLE GUARDIANS: PROJECTILES & SKILL EFFECTS ENGINE
 * Handles hero arrows, magic spells, meteor strikes, chain lightning,
 * blade beams, scythe slashes, railcannon lasers, and splash collisions.
 */

class Projectile {
  constructor(config) {
    this.type = config.type || 'arrow';
    this.x = config.x;
    this.y = config.y;
    this.startX = config.x;
    this.startY = config.y;
    this.targetX = config.targetX;
    this.targetY = config.targetY;
    this.target = config.target || null;
    this.damage = config.damage || 50;
    this.element = config.element || 'physical';
    this.speed = config.speed || 800;
    this.radius = config.radius || 6;
    this.color = config.color || '#fbbf24';
    this.splashRadius = config.splashRadius || 0;
    this.piercing = config.piercing || false;
    this.pierceCount = config.pierceCount || (this.piercing ? 5 : 1);
    this.hitEnemies = new Set();
    this.source = config.source || 'hero';
    this.specialEffect = config.specialEffect || null;

    // Calculate angle & velocity
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    this.vx = (dx / dist) * this.speed;
    this.vy = (dy / dist) * this.speed;
    this.angle = Math.atan2(dy, dx);
    this.totalDistance = dist;
    this.traveledDistance = 0;

    this.isDead = false;
    this.lifeTime = 0;
    this.maxLifeTime = config.maxLifeTime || 4.0;
  }

  update(dt, game) {
    this.lifeTime += dt;
    if (this.lifeTime > this.maxLifeTime) {
      this.isDead = true;
      return;
    }

    // Homing logic for magic missiles
    if (this.type === 'arcane_missile' && this.target && !this.target.isDead) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const angle = Math.atan2(dy, dx);
      this.vx = Math.cos(angle) * this.speed;
      this.vy = Math.sin(angle) * this.speed;
      this.angle = angle;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.traveledDistance += this.speed * dt;

    // Check collision with enemies
    if (this.source === 'hero' || this.source === 'turret') {
      for (let enemy of game.enemies) {
        if (enemy.isDead || this.hitEnemies.has(enemy.id)) continue;

        const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
        if (dist <= this.radius + enemy.radius) {
          this.hitEnemy(enemy, game);
          this.hitEnemies.add(enemy.id);

          if (!this.piercing || this.hitEnemies.size >= this.pierceCount) {
            this.isDead = true;
            break;
          }
        }
      }
    }

    // Out of bounds check
    if (this.x > 1300 || this.x < -100 || this.y < -100 || this.y > 900) {
      this.isDead = true;
    }
  }

  hitEnemy(enemy, game) {
    // Splash Damage
    if (this.splashRadius > 0) {
      for (let e of game.enemies) {
        if (e.isDead) continue;
        const dist = Math.hypot(e.x - this.x, e.y - this.y);
        if (dist <= this.splashRadius) {
          const falloff = 1 - (dist / this.splashRadius) * 0.4;
          e.takeDamage(this.damage * falloff, this.element);
          if (this.specialEffect === 'burn') e.applyBurn(4, this.damage * 0.2);
          if (this.specialEffect === 'freeze') e.applyFreeze(3);
        }
      }
      if (game.particles) {
        game.particles.spawnExplosion(this.x, this.y, this.color, this.splashRadius);
      }
    } else {
      enemy.takeDamage(this.damage, this.element);
      if (this.specialEffect === 'burn') enemy.applyBurn(4, this.damage * 0.2);
      if (this.specialEffect === 'freeze') enemy.applyFreeze(3);
      if (this.specialEffect === 'stun') enemy.applyStun(2);
      if (game.particles) {
        game.particles.spawnHitSparks(this.x, this.y, this.color);
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    if (this.type === 'arrow' || this.type === 'ballista_bolt') {
      ctx.fillStyle = this.color;
      ctx.fillRect(-14, -2, 28, 4);
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(14, -4);
      ctx.lineTo(20, 0);
      ctx.lineTo(14, 4);
      ctx.closePath();
      ctx.fill();
    } else if (this.type === 'meteor') {
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'holy_blade') {
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'soul_scythe') {
      ctx.fillStyle = '#a855f7';
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI);
      ctx.fill();
    } else {
      // Default Glowing Magic Orb / Cannon ball
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
