// zombie.js - AI & Mechanics for Normal, Exploding, Shooting, and Mutant Zombies
import { CONFIG } from '../config.js';

export class ZombieProjectile {
  constructor(x, y, vx, vy, type = 'green_ball', damage = 10) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.type = type;
    this.damage = damage;
    this.radius = 8;
    this.active = true;
    this.life = 3.5;
  }

  update(dt, tilemap, player, audio, particles) {
    if (!this.active) return;
    this.life -= dt;
    if (this.life <= 0) {
      this.active = false;
      return;
    }

    this.x += this.vx * (dt * 60);
    this.y += this.vy * (dt * 60);

    // Collision with solid tile
    const { tx, ty } = tilemap.getTileCoord(this.x, this.y);
    if (tilemap.isSolidTile(tx, ty)) {
      this.active = false;
      particles.addBlood(this.x, this.y, 4, '#84cc16');
      return;
    }

    // Collision with Player
    const dist = Math.hypot(this.x - player.x, this.y - player.y);
    if (dist < this.radius + player.radius) {
      this.active = false;
      player.takeDamage(this.damage, audio, particles);
    }
  }

  render(ctx, sprites, camera) {
    if (!this.active) return;
    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    const sprite = sprites.get('projectile_green_ball');
    if (sprite) {
      ctx.drawImage(sprite, screenX - 12, screenY - 12);
    } else {
      ctx.fillStyle = '#84cc16';
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export class Zombie {
  constructor(x, y, type = 'NORMAL') {
    this.x = x;
    this.y = y;
    this.type = type; // 'NORMAL' | 'EXPLODING' | 'SHOOTING' | 'MUTANT'
    this.dir = 'down';
    this.isDead = false;

    // Type-specific setup
    this.setupStats();

    // Timers & State
    this.walkTimer = 0;
    this.walkFrame = 0;
    this.attackCooldown = 0;
    this.shootCooldown = Math.random() * 2.0; // Stagger first shot
    this.punchCooldown = 3.0;
    this.stompCooldown = 8.0;

    this.isAirborne = false;
    this.airborneTimer = 0;
    this.punchTelegraphActive = false;
    this.punchTelegraph = null;
    this.stompTelegraph = null;

    this.hasExploded = false;
  }

  setupStats() {
    const T = CONFIG.TILE_SIZE;
    switch (this.type) {
      case 'NORMAL':
        this.hp = CONFIG.ZOMBIE.NORMAL.HP;
        this.maxHp = CONFIG.ZOMBIE.NORMAL.HP;
        this.speed = CONFIG.ZOMBIE.NORMAL.SPEED;
        this.radius = 12;
        this.width = T;
        this.height = T;
        this.damage = CONFIG.ZOMBIE.NORMAL.DAMAGE;
        break;

      case 'EXPLODING':
        this.hp = CONFIG.ZOMBIE.EXPLODING.HP;
        this.maxHp = CONFIG.ZOMBIE.EXPLODING.HP;
        this.speed = CONFIG.ZOMBIE.EXPLODING.SPEED;
        this.radius = 13;
        this.width = T;
        this.height = T;
        this.damage = CONFIG.ZOMBIE.EXPLODING.TOUCH_DAMAGE;
        break;

      case 'SHOOTING':
        this.hp = CONFIG.ZOMBIE.SHOOTING.HP;
        this.maxHp = CONFIG.ZOMBIE.SHOOTING.HP;
        this.speed = CONFIG.ZOMBIE.SHOOTING.SPEED;
        this.radius = 12;
        this.width = T;
        this.height = T;
        this.damage = CONFIG.ZOMBIE.SHOOTING.BALL_DAMAGE;
        break;

      case 'MUTANT':
        this.hp = CONFIG.ZOMBIE.MUTANT.HP;
        this.maxHp = CONFIG.ZOMBIE.MUTANT.HP;
        this.speed = CONFIG.ZOMBIE.MUTANT.SPEED;
        this.radius = 32;
        this.width = CONFIG.ZOMBIE.MUTANT.WIDTH_TILES * T;   // 96 px
        this.height = CONFIG.ZOMBIE.MUTANT.HEIGHT_TILES * T; // 160 px
        this.damage = CONFIG.ZOMBIE.MUTANT.PUNCH_DAMAGE;
        break;
    }
  }

  update(dt, player, tilemap, allZombies, enemyProjectiles, audio, particles) {
    if (this.isDead) return;

    // Cooldown timers
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.punchCooldown > 0) this.punchCooldown -= dt;
    if (this.stompCooldown > 0) this.stompCooldown -= dt;

    // Distance to player
    const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
    const aggroDist = (this.type === 'MUTANT' ? 18 : 14) * CONFIG.TILE_SIZE;

    // 1. MUTANT ZOMBIE SPECIFIC LOGIC
    if (this.type === 'MUTANT') {
      this.updateMutantAI(dt, player, distToPlayer, allZombies, audio, particles);
      return;
    }

    // 2. EXPLODING ZOMBIE PROXIMITY CHECK (1 Tile = ~32px)
    if (this.type === 'EXPLODING' && distToPlayer <= CONFIG.TILE_SIZE * 1.1) {
      this.explodeDirectTouch(player, audio, particles);
      return;
    }

    // 3. SHOOTING ZOMBIE PROJECTILE FIRE (5s Cooldown)
    if (this.type === 'SHOOTING' && distToPlayer <= CONFIG.ZOMBIE.SHOOTING.SHOOT_RANGE * CONFIG.TILE_SIZE) {
      if (this.shootCooldown <= 0) {
        this.shootGreenBall(player, enemyProjectiles, audio);
      }
    }

    // 4. MOVEMENT TOWARDS PLAYER IF AGGROED
    if (distToPlayer <= aggroDist) {
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      const vx = Math.cos(angle) * this.speed;
      const vy = Math.sin(angle) * this.speed;

      // Update facing direction
      if (Math.abs(vx) > Math.abs(vy)) {
        this.dir = vx > 0 ? 'right' : 'left';
      } else {
        this.dir = vy > 0 ? 'down' : 'up';
      }

      const nextX = this.x + vx;
      const nextY = this.y + vy;

      if (!tilemap.isPositionBlocked(nextX, this.y, this.radius)) {
        this.x = nextX;
      }
      if (!tilemap.isPositionBlocked(this.x, nextY, this.radius)) {
        this.y = nextY;
      }

      this.walkTimer += dt * 6;
      this.walkFrame = Math.floor(this.walkTimer) % 4;

      // Melee scratch attack on player
      if (distToPlayer <= this.radius + player.radius + 6 && this.attackCooldown <= 0) {
        player.takeDamage(this.damage, audio, particles);
        this.attackCooldown = 1.0;
      }
    } else {
      this.walkFrame = 0;
    }
  }

  // Shoot Green Acid Ball (Shooting Zombie)
  shootGreenBall(player, enemyProjectiles, audio) {
    this.shootCooldown = CONFIG.ZOMBIE.SHOOTING.SHOOT_COOLDOWN;
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    const speed = CONFIG.ZOMBIE.SHOOTING.BALL_SPEED;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    enemyProjectiles.push(new ZombieProjectile(this.x, this.y, vx, vy, 'green_ball', CONFIG.ZOMBIE.SHOOTING.BALL_DAMAGE));
    audio.playAcidSpit();
  }

  // Exploding Zombie: Direct Touch Explosion (5칸 = 50 HP)
  explodeDirectTouch(player, audio, particles) {
    if (this.hasExploded) return;
    this.hasExploded = true;
    this.isDead = true;
    this.hp = 0;

    if (audio) audio.playExplosion();
    if (particles) particles.addExplosion(this.x, this.y, 70);
    player.takeDamage(CONFIG.ZOMBIE.EXPLODING.TOUCH_DAMAGE, audio, particles);
  }

  // Exploding Zombie: Arrow hit or Chain explosion (4-Tile AoE)
  triggerAoEExplosion(player, allZombies, audio, particles) {
    if (this.hasExploded) return;
    this.hasExploded = true;
    this.isDead = true;
    this.hp = 0;

    if (audio) audio.playExplosion();
    const aoePx = CONFIG.ZOMBIE.EXPLODING.AOE_RADIUS * CONFIG.TILE_SIZE; // 4 tiles = 128px
    if (particles) particles.addExplosion(this.x, this.y, aoePx);

    // Damage Player in 4 tiles (2칸 = 20 HP)
    const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
    if (distToPlayer <= aoePx) {
      player.takeDamage(CONFIG.ZOMBIE.EXPLODING.AOE_DAMAGE_PLAYER, audio, particles);
    }

    // Affect other zombies in 4 tiles
    allZombies.forEach(other => {
      if (other === this || other.isDead) return;
      const dist = Math.hypot(other.x - this.x, other.y - this.y);
      if (dist <= aoePx) {
        if (other.type === 'EXPLODING') {
          // Chain explosion!
          other.triggerAoEExplosion(player, allZombies, audio, particles);
        } else if (other.type === 'NORMAL' || other.type === 'SHOOTING') {
          // Die instantly
          other.hp = 0;
          other.isDead = true;
          if (particles) particles.addBlood(other.x, other.y, 10, '#4ade80');
        } else if (other.type === 'MUTANT') {
          // Mutant takes 2 hits damage
          other.takeHit(CONFIG.ZOMBIE.EXPLODING.AOE_DAMAGE_MUTANT, allZombies, player, audio, particles);
        }
      }
    });
  }

  // --- MUTANT ZOMBIE COMPLEX AI ---
  updateMutantAI(dt, player, distToPlayer, allZombies, audio, particles) {
    // 1. If currently Airborne from Stomp Attack
    if (this.isAirborne) {
      this.airborneTimer += dt;
      if (this.airborneTimer >= CONFIG.ZOMBIE.MUTANT.STOMP_AIR_TIME) {
        this.executeStompLanding(player, allZombies, audio, particles);
      }
      return;
    }

    // 2. Check for Stomp Attack Trigger (20s Cooldown)
    if (this.stompCooldown <= 0 && distToPlayer <= 16 * CONFIG.TILE_SIZE) {
      this.startStompAttack(player, particles);
      return;
    }

    // 3. Check for Punch Attack Trigger (10s Cooldown)
    if (this.punchCooldown <= 0 && distToPlayer <= 4 * CONFIG.TILE_SIZE && !this.punchTelegraphActive) {
      this.startPunchAttack(player, allZombies, particles);
      return;
    }

    // 4. Standard Mutant Walk / Aggro
    if (distToPlayer <= 18 * CONFIG.TILE_SIZE && !this.punchTelegraphActive) {
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      this.x += Math.cos(angle) * this.speed;
      this.y += Math.sin(angle) * this.speed;

      this.walkTimer += dt * 4;
      this.walkFrame = Math.floor(this.walkTimer) % 4;
    }
  }

  startPunchAttack(player, allZombies, particles) {
    this.punchCooldown = CONFIG.ZOMBIE.MUTANT.PUNCH_COOLDOWN;
    this.punchTelegraphActive = true;

    // 2x2 Tiles Warning Area near mutant towards player
    const T = CONFIG.TILE_SIZE;
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    const punchX = this.x + Math.cos(angle) * 32 - T;
    const punchY = this.y + Math.sin(angle) * 32 - T;
    const punchW = 2 * T;
    const punchH = 2 * T;

    particles.addTelegraph(
      punchX, punchY, punchW, punchH,
      CONFIG.ZOMBIE.MUTANT.PUNCH_TELEGRAPH,
      () => {
        this.punchTelegraphActive = false;
        // Punch Impact
        particles.addExplosion(punchX + T, punchY + T, 40);
        particles.shake(0.3, 10);

        // Check player inside 2x2
        if (player.x >= punchX && player.x <= punchX + punchW &&
            player.y >= punchY && player.y <= punchY + punchH) {
          player.takeDamage(CONFIG.ZOMBIE.MUTANT.PUNCH_DAMAGE, null, particles);
        }

        // Kill any normal/shooting/exploding zombies in range
        allZombies.forEach(z => {
          if (z === this || z.isDead) return;
          if (z.x >= punchX && z.x <= punchX + punchW &&
              z.y >= punchY && z.y <= punchY + punchH) {
            if (z.type === 'EXPLODING') {
              z.triggerAoEExplosion(player, allZombies, null, particles);
            } else if (z.type === 'NORMAL' || z.type === 'SHOOTING') {
              z.hp = 0;
              z.isDead = true;
              particles.addBlood(z.x, z.y, 8);
            }
          }
        });
      },
      'rect',
      'MUTANT PUNCH'
    );
  }

  startStompAttack(player, particles) {
    this.stompCooldown = CONFIG.ZOMBIE.MUTANT.STOMP_COOLDOWN;
    this.isAirborne = true;
    this.airborneTimer = 0;

    // 3x3 Tiles Warning Area around player's current location
    const T = CONFIG.TILE_SIZE;
    const stompW = 3 * T;
    const stompH = 3 * T;
    this.stompLandingX = player.x;
    this.stompLandingY = player.y;

    particles.addTelegraph(
      this.stompLandingX - stompW / 2,
      this.stompLandingY - stompH / 2,
      stompW, stompH,
      CONFIG.ZOMBIE.MUTANT.STOMP_AIR_TIME,
      null,
      'rect',
      'MUTANT STOMP'
    );
  }

  executeStompLanding(player, allZombies, audio, particles) {
    this.isAirborne = false;
    this.x = this.stompLandingX;
    this.y = this.stompLandingY;

    audio.playMutantStomp();
    particles.shake(0.5, 14);
    particles.addExplosion(this.x, this.y, 80);

    const T = CONFIG.TILE_SIZE;
    const stompRadius = (3 * T) / 2;

    // Damage player if inside 3x3 area (5칸 = 50 HP)
    const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
    if (distToPlayer <= stompRadius) {
      player.takeDamage(CONFIG.ZOMBIE.MUTANT.STOMP_DAMAGE, audio, particles);
    }

    // Kill any normal, shooting, exploding zombies inside
    allZombies.forEach(z => {
      if (z === this || z.isDead) return;
      const dist = Math.hypot(z.x - this.x, z.y - this.y);
      if (dist <= stompRadius) {
        if (z.type === 'EXPLODING') {
          z.triggerAoEExplosion(player, allZombies, audio, particles);
        } else if (z.type === 'NORMAL' || z.type === 'SHOOTING') {
          z.hp = 0;
          z.isDead = true;
          particles.addBlood(z.x, z.y, 10);
        }
      }
    });
  }

  takeHit(damageHits, allZombies, player, audio, particles) {
    if (this.isDead) return;

    if (this.type === 'EXPLODING') {
      // 1 arrow triggers immediate 4-tile AoE explosion!
      this.triggerAoEExplosion(player, allZombies, audio, particles);
      return;
    }

    this.hp -= damageHits;
    if (audio) audio.playArrowHit();
    if (particles) {
      particles.addBlood(this.x, this.y, 6, '#ef4444');
      particles.addFloatingText(`-${damageHits}`, this.x, this.y - 15, '#f59e0b', 13);
    }

    if (this.hp <= 0) {
      this.isDead = true;
      if (particles) particles.addBlood(this.x, this.y, 15, '#b91c1c');
      if (this.type === 'MUTANT') {
        if (particles) {
          particles.addExplosion(this.x, this.y, 50);
          particles.addFloatingText('MUTANT DEFEATED!', this.x, this.y - 30, '#a855f7', 16);
        }
      }
    }
  }

  render(ctx, sprites, camera) {
    if (this.isDead || this.isAirborne) return;

    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    if (this.type === 'NORMAL') {
      const sprite = sprites.get(`zombie_normal_${this.walkFrame}`);
      if (sprite) ctx.drawImage(sprite, screenX - 16, screenY - 16);
    } else if (this.type === 'EXPLODING') {
      const sprite = sprites.get(`zombie_exploding_${this.walkFrame}`);
      if (sprite) ctx.drawImage(sprite, screenX - 16, screenY - 16);
    } else if (this.type === 'SHOOTING') {
      const sprite = sprites.get(`zombie_shooting_${this.walkFrame}`);
      if (sprite) ctx.drawImage(sprite, screenX - 16, screenY - 16);
    } else if (this.type === 'MUTANT') {
      let key = `zombie_mutant_walk_${this.walkFrame}`;
      if (this.punchTelegraphActive) key = 'zombie_mutant_punch';
      const sprite = sprites.get(key) || sprites.get('zombie_mutant_walk_0');
      if (sprite) {
        ctx.drawImage(sprite, screenX - 48, screenY - 130);
      }

      // Mutant HP Bar
      this.drawHealthBar(ctx, screenX, screenY - 140, this.hp, this.maxHp, 50);
    }
  }

  drawHealthBar(ctx, screenX, screenY, hp, maxHp, barWidth = 30) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(screenX - barWidth / 2, screenY, barWidth, 5);
    const progress = Math.max(0, hp / maxHp);
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(screenX - barWidth / 2 + 1, screenY + 1, (barWidth - 2) * progress, 3);
  }
}
