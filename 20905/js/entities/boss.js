// boss.js - 10x10 Boss Zombie (3 Phases & Vaccine Drop)
import { CONFIG } from '../config.js';
import { Zombie } from './zombie.js';

export class BossHomingBall {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.hp = CONFIG.ZOMBIE.BOSS.PHASE2_HOMING_HP; // 2 hits to destroy
    this.maxHp = CONFIG.ZOMBIE.BOSS.PHASE2_HOMING_HP;
    this.speed = CONFIG.ZOMBIE.BOSS.PHASE2_HOMING_SPEED;
    this.radius = 16;
    this.damage = CONFIG.ZOMBIE.BOSS.PHASE2_HOMING_DAMAGE;
    this.active = true;
    this.life = 25.0; // Life before disappearing
  }

  update(dt, player, audio, particles) {
    if (!this.active) return;
    this.life -= dt;
    if (this.life <= 0) {
      this.active = false;
      return;
    }

    // Slowly track/home towards player
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    this.x += Math.cos(angle) * this.speed * (dt * 60);
    this.y += Math.sin(angle) * this.speed * (dt * 60);

    // Collision with Player
    const dist = Math.hypot(this.x - player.x, this.y - player.y);
    if (dist < this.radius + player.radius) {
      this.active = false;
      player.takeDamage(this.damage, audio, particles);
      particles.addExplosion(this.x, this.y, 30);
    }
  }

  takeHit(dmg, particles) {
    this.hp -= dmg;
    particles.addBlood(this.x, this.y, 4, '#c026d3');
    if (this.hp <= 0) {
      this.active = false;
      particles.addExplosion(this.x, this.y, 35);
      particles.addFloatingText('SHOT DOWN!', this.x, this.y - 15, '#c026d3', 12);
    }
  }

  render(ctx, sprites, camera) {
    if (!this.active) return;
    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    const sprite = sprites.get('projectile_boss_homing');
    if (sprite) {
      ctx.drawImage(sprite, screenX - 18, screenY - 18);
    } else {
      ctx.fillStyle = '#c026d3';
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export class BossMegaBall {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = 20;
    this.damage = CONFIG.ZOMBIE.BOSS.PHASE1_BALL_DAMAGE;
    this.active = true;
    this.life = 6.0;
  }

  update(dt, player, allZombies, audio, particles) {
    if (!this.active) return;
    this.life -= dt;
    if (this.life <= 0) {
      this.active = false;
      return;
    }

    this.x += this.vx * (dt * 60);
    this.y += this.vy * (dt * 60);

    // Collision with Player
    const dist = Math.hypot(this.x - player.x, this.y - player.y);
    if (dist < this.radius + player.radius) {
      this.active = false;
      player.takeDamage(this.damage, audio, particles);
      particles.addExplosion(this.x, this.y, 45);
    }

    // Crushes small zombies
    allZombies.forEach(z => {
      if (z.isDead) return;
      const d = Math.hypot(z.x - this.x, z.y - this.y);
      if (d < this.radius + z.radius) {
        if (z.type === 'EXPLODING') {
          z.triggerAoEExplosion(player, allZombies, audio, particles);
        } else if (z.type === 'NORMAL' || z.type === 'SHOOTING') {
          z.hp = 0;
          z.isDead = true;
          particles.addBlood(z.x, z.y, 8);
        }
      }
    });
  }

  render(ctx, sprites, camera) {
    if (!this.active) return;
    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    const sprite = sprites.get('projectile_boss_mega');
    if (sprite) {
      ctx.drawImage(sprite, screenX - 24, screenY - 24);
    } else {
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export class BossZombie {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = CONFIG.ZOMBIE.BOSS.WIDTH_TILES * CONFIG.TILE_SIZE;   // 320 px (10 tiles)
    this.height = CONFIG.ZOMBIE.BOSS.HEIGHT_TILES * CONFIG.TILE_SIZE; // 320 px (10 tiles)
    this.radius = 140; // Collision radius

    this.phase = 1; // 1 | 2 | 3
    this.hp = CONFIG.ZOMBIE.BOSS.PHASE1_HP;
    this.maxHp = CONFIG.ZOMBIE.BOSS.PHASE1_HP;
    this.isDead = false;

    // Cooldowns
    this.phase1BallCooldown = 5.0; // Stagger initial attack
    this.phase2BallCooldown = 5.0;
    this.phase3LaserCooldown = 15.0;
    this.phase3ShockwaveCooldown = 30.0;

    // Phase 3 Shockwave active state
    this.isShockwaveActive = false;
    this.shockwaveDurationTimer = 0;
    this.shockwaveTickTimer = 0;

    // Phase 3 Active Laser Beams
    this.activeLasers = [];

    // Projectile collections
    this.megaBalls = [];
    this.homingBalls = [];

    this.animFrame = 0;
    this.animTimer = 0;
    this.hasDroppedVaccine = false;
  }

  initPhase1(allZombies, particles, audio) {
    this.phase = 1;
    this.hp = CONFIG.ZOMBIE.BOSS.PHASE1_HP;
    this.maxHp = CONFIG.ZOMBIE.BOSS.PHASE1_HP;

    audio.playBossRoar();
    particles.shake(0.8, 16);
    particles.addFloatingText('=== BOSS PHASE 1 ===', this.x, this.y - 170, '#f43f5e', 22);

    // Summon 10 normal, 2 exploding, 2 shooting zombies around the arena
    const T = CONFIG.TILE_SIZE;
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      allZombies.push(new Zombie(this.x + Math.cos(angle) * 180, this.y + Math.sin(angle) * 180, 'NORMAL'));
    }
    for (let i = 0; i < 2; i++) {
      allZombies.push(new Zombie(this.x - 200 + i * 400, this.y - 150, 'EXPLODING'));
    }
    for (let i = 0; i < 2; i++) {
      allZombies.push(new Zombie(this.x - 200 + i * 400, this.y + 150, 'SHOOTING'));
    }
  }

  transitionToPhase2(allZombies, particles, audio) {
    this.phase = 2;
    this.hp = CONFIG.ZOMBIE.BOSS.PHASE2_HP;
    this.maxHp = CONFIG.ZOMBIE.BOSS.PHASE2_HP;

    audio.playBossRoar();
    particles.shake(1.0, 20);
    particles.addExplosion(this.x, this.y, 160);
    particles.addFloatingText('=== BOSS PHASE 2 ===', this.x, this.y - 170, '#d946ef', 24);

    // Summon 2 Mutant Zombies!
    allZombies.push(
      new Zombie(this.x - 220, this.y, 'MUTANT'),
      new Zombie(this.x + 220, this.y, 'MUTANT')
    );
  }

  transitionToPhase3(particles, audio) {
    this.phase = 3;
    this.hp = CONFIG.ZOMBIE.BOSS.PHASE3_HP;
    this.maxHp = CONFIG.ZOMBIE.BOSS.PHASE3_HP;
    this.phase3LaserCooldown = 1.5;
    this.phase3ShockwaveCooldown = 4.0;

    audio.playBossRoar();
    particles.shake(1.5, 24);
    particles.addExplosion(this.x, this.y, 220);
    particles.addFloatingText('=== FINAL PHASE 3: BERSERK ===', this.x, this.y - 170, '#ef4444', 26);
  }

  update(dt, player, allZombies, items, audio, particles) {
    if (this.isDead) return;

    this.animTimer += dt * 4;
    this.animFrame = Math.floor(this.animTimer) % 4;

    // Update Mega Balls
    for (let i = this.megaBalls.length - 1; i >= 0; i--) {
      const ball = this.megaBalls[i];
      ball.update(dt, player, allZombies, audio, particles);
      if (!ball.active) this.megaBalls.splice(i, 1);
    }

    // Update Homing Balls
    for (let i = this.homingBalls.length - 1; i >= 0; i--) {
      const ball = this.homingBalls[i];
      ball.update(dt, player, audio, particles);
      if (!ball.active) this.homingBalls.splice(i, 1);
    }

    // Update Active Laser Beams in Phase 3
    for (let i = this.activeLasers.length - 1; i >= 0; i--) {
      const laser = this.activeLasers[i];
      laser.duration -= dt;
      if (laser.duration <= 0) {
        this.activeLasers.splice(i, 1);
        continue;
      }
      // Check laser damage on player
      if (player.x >= laser.x && player.x <= laser.x + laser.width &&
          player.y >= laser.y && player.y <= laser.y + laser.height) {
        player.takeDamage(CONFIG.ZOMBIE.BOSS.PHASE3_LASER_DAMAGE, audio, particles);
      }
    }

    // 1. PHASE 1 LOGIC
    if (this.phase === 1) {
      this.phase1BallCooldown -= dt;
      if (this.phase1BallCooldown <= 0) {
        this.firePhase1Balls(player, audio);
      }
    }

    // 2. PHASE 2 LOGIC
    else if (this.phase === 2) {
      this.phase2BallCooldown -= dt;
      if (this.phase2BallCooldown <= 0) {
        this.firePhase2HomingBalls(audio);
      }
    }

    // 3. PHASE 3 LOGIC (Lasers & Shockwave)
    else if (this.phase === 3) {
      this.phase3LaserCooldown -= dt;
      this.phase3ShockwaveCooldown -= dt;

      // Laser Attack Trigger (60s Cooldown)
      if (this.phase3LaserCooldown <= 0) {
        this.startPhase3LaserAttack(particles, audio);
      }

      // Shockwave Trigger (120s Cooldown)
      if (this.phase3ShockwaveCooldown <= 0 && !this.isShockwaveActive) {
        this.startPhase3ShockwaveCharge(particles, audio);
      }

      // Handling Active Shockwave
      if (this.isShockwaveActive) {
        this.shockwaveDurationTimer -= dt;
        this.shockwaveTickTimer += dt;
        particles.shake(0.2, 10); // Screen shakes continuously!

        const shockRadiusPx = CONFIG.ZOMBIE.BOSS.PHASE3_SHOCKWAVE_RADIUS * CONFIG.TILE_SIZE;
        const dist = Math.hypot(player.x - this.x, player.y - this.y);

        if (this.shockwaveTickTimer >= 0.8) {
          this.shockwaveTickTimer = 0;
          if (dist <= shockRadiusPx) {
            player.takeDamage(CONFIG.ZOMBIE.BOSS.PHASE3_SHOCKWAVE_TICK_DMG, audio, particles);
          }
        }

        if (this.shockwaveDurationTimer <= 0) {
          this.isShockwaveActive = false;
        }
      }
    }
  }

  // Phase 1: 3 Giant Straight Balls (30s Cooldown)
  firePhase1Balls(player, audio) {
    this.phase1BallCooldown = CONFIG.ZOMBIE.BOSS.PHASE1_BALL_CD;
    audio.playAcidSpit();

    const baseAngle = Math.atan2(player.y - this.y, player.x - this.x);
    const speed = CONFIG.ZOMBIE.BOSS.PHASE1_BALL_SPEED;

    [-0.35, 0, 0.35].forEach(offset => {
      const angle = baseAngle + offset;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      this.megaBalls.push(new BossMegaBall(this.x, this.y, vx, vy));
    });
  }

  // Phase 2: 6 Homing Tracking Balls (30s Cooldown)
  firePhase2HomingBalls(audio) {
    this.phase2BallCooldown = CONFIG.ZOMBIE.BOSS.PHASE2_BALL_CD;
    audio.playAcidSpit();

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const spawnX = this.x + Math.cos(angle) * 80;
      const spawnY = this.y + Math.sin(angle) * 80;
      this.homingBalls.push(new BossHomingBall(spawnX, spawnY));
    }
  }

  // Phase 3: Laser Attack (4 lasers: two 6x2 horizontal, two 2x6 vertical, 10s red warning)
  startPhase3LaserAttack(particles, audio) {
    this.phase3LaserCooldown = CONFIG.ZOMBIE.BOSS.PHASE3_LASER_CD;
    const T = CONFIG.TILE_SIZE;

    // 4 Laser Definitions around the arena room (100x100 room)
    const lasers = [
      // Horizontal 6x2 lasers
      { x: (30 + Math.floor(Math.random() * 35)) * T, y: (25 + Math.floor(Math.random() * 45)) * T, width: 6 * T, height: 2 * T },
      { x: (30 + Math.floor(Math.random() * 35)) * T, y: (25 + Math.floor(Math.random() * 45)) * T, width: 6 * T, height: 2 * T },
      // Vertical 2x6 lasers
      { x: (25 + Math.floor(Math.random() * 45)) * T, y: (30 + Math.floor(Math.random() * 35)) * T, width: 2 * T, height: 6 * T },
      { x: (25 + Math.floor(Math.random() * 45)) * T, y: (30 + Math.floor(Math.random() * 35)) * T, width: 2 * T, height: 6 * T }
    ];

    // Add 10s red telegraphs for each laser
    lasers.forEach((l, idx) => {
      particles.addTelegraph(
        l.x, l.y, l.width, l.height,
        CONFIG.ZOMBIE.BOSS.PHASE3_LASER_WARN,
        () => {
          // Fire Laser!
          audio.playLaserBlast();
          particles.shake(0.5, 12);
          this.activeLasers.push({
            x: l.x,
            y: l.y,
            width: l.width,
            height: l.height,
            duration: 1.2
          });
        },
        'rect',
        `LASER #${idx + 1}`
      );
    });
  }

  // Phase 3: Mega Shockwave (20s charge with 7-tile red radius, 7s continuous blast)
  startPhase3ShockwaveCharge(particles, audio) {
    this.phase3ShockwaveCooldown = CONFIG.ZOMBIE.BOSS.PHASE3_SHOCKWAVE_CD;
    const T = CONFIG.TILE_SIZE;
    const radiusPx = CONFIG.ZOMBIE.BOSS.PHASE3_SHOCKWAVE_RADIUS * T; // 7 tiles = 224 px

    particles.addTelegraph(
      this.x - radiusPx,
      this.y - radiusPx,
      radiusPx * 2,
      radiusPx * 2,
      CONFIG.ZOMBIE.BOSS.PHASE3_SHOCKWAVE_CHARGE,
      () => {
        // Unleash 7-second continuous shockwave!
        this.isShockwaveActive = true;
        this.shockwaveDurationTimer = CONFIG.ZOMBIE.BOSS.PHASE3_SHOCKWAVE_DURATION;
        this.shockwaveTickTimer = 0;
        audio.playBossRoar();
        particles.addExplosion(this.x, this.y, 250);
      },
      'circle',
      'MEGA SHOCKWAVE'
    );
  }

  takeHit(damageHits, allZombies, items, audio, particles) {
    if (this.isDead) return;

    this.hp -= damageHits;
    if (audio) audio.playArrowHit();
    if (particles) particles.addBlood(this.x + (Math.random() * 80 - 40), this.y + (Math.random() * 80 - 40), 6, '#f43f5e');

    // Phase 1 -> Phase 2 Transition
    if (this.phase === 1 && this.hp <= 0) {
      this.transitionToPhase2(allZombies, particles, audio);
      return;
    }

    // Phase 2 -> Phase 3 Transition
    if (this.phase === 2 && this.hp <= 0) {
      this.transitionToPhase3(particles, audio);
      return;
    }

    // Phase 3 Defeat -> Drops Vaccine!
    if (this.phase === 3 && this.hp <= 0) {
      this.isDead = true;
      this.hp = 0;
      if (audio) audio.playBossRoar();
      if (particles) {
        particles.shake(2.0, 30);
        particles.addExplosion(this.x, this.y, 280);
      }

      // Drop Vaccine item at center
      if (!this.hasDroppedVaccine) {
        this.hasDroppedVaccine = true;
        items.push({
          type: 'vaccine',
          name: '항바이러스 백신 (VACCINE)',
          x: this.x,
          y: this.y + 60,
          collected: false
        });
        if (particles) particles.addFloatingText('★ VACCINE DROPPED! ★', this.x, this.y - 180, '#fbbf24', 28);
      }
    }
  }

  render(ctx, sprites, camera) {
    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    // Render Projectiles
    this.megaBalls.forEach(b => b.render(ctx, sprites, camera));
    this.homingBalls.forEach(b => b.render(ctx, sprites, camera));

    // Render Active Lasers
    this.activeLasers.forEach(laser => {
      const lx = laser.x - camera.x;
      const ly = laser.y - camera.y;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.fillRect(lx, ly, laser.width, laser.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(lx + 4, ly + 4, Math.max(1, laser.width - 8), Math.max(1, laser.height - 8));
    });

    // Render Shockwave Aura if active
    if (this.isShockwaveActive) {
      const radiusPx = CONFIG.ZOMBIE.BOSS.PHASE3_SHOCKWAVE_RADIUS * CONFIG.TILE_SIZE;
      const pulse = 0.4 + 0.3 * Math.sin(Date.now() * 0.01);
      ctx.fillStyle = `rgba(225, 29, 72, ${pulse})`;
      ctx.beginPath();
      ctx.arc(screenX, screenY, radiusPx, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    if (this.isDead) return;

    // Draw Boss Sprite (10x10)
    const sprite = sprites.get(`boss_phase_${this.phase}_${this.animFrame}`);
    if (sprite) {
      ctx.drawImage(sprite, screenX - 160, screenY - 160);
    }

    // Boss Giant Health Bar
    this.drawBossHealthBar(ctx, screenX, screenY - 180);
  }

  drawBossHealthBar(ctx, screenX, screenY) {
    const barW = 260;
    const barH = 14;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(screenX - barW / 2 - 2, screenY - 2, barW + 4, barH + 4);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(screenX - barW / 2 - 2, screenY - 2, barW + 4, barH + 4);

    const progress = Math.max(0, this.hp / this.maxHp);
    const grad = ctx.createLinearGradient(screenX - barW / 2, screenY, screenX + barW / 2, screenY);
    grad.addColorStop(0, '#ef4444');
    grad.addColorStop(1, '#f59e0b');

    ctx.fillStyle = grad;
    ctx.fillRect(screenX - barW / 2, screenY, barW * progress, barH);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`BOSS PHASE ${this.phase}: ${this.hp} / ${this.maxHp} HP`, screenX, screenY + 11);
  }
}
