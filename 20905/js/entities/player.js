// player.js - Player Character Logic & Rendering
import { CONFIG } from '../config.js';
import { Arrow } from './arrow.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dir = 'down'; // 'down' | 'up' | 'left' | 'right'
    this.hp = CONFIG.PLAYER.MAX_HP;
    this.maxHp = CONFIG.PLAYER.MAX_HP;
    this.speed = CONFIG.PLAYER.SPEED;
    this.radius = CONFIG.PLAYER.SIZE / 2;

    // Movement & Animation
    this.isMoving = false;
    this.walkTimer = 0;
    this.walkFrame = 0;
    this.expression = 'normal';

    // Jump State
    this.isJumping = false;
    this.jumpTimer = 0;
    this.jumpDuration = CONFIG.PLAYER.JUMP_DURATION;
    this.jumpStartX = 0;
    this.jumpStartY = 0;
    this.jumpTargetX = 0;
    this.jumpTargetY = 0;
    this.jumpHeightOffset = 0;

    // Combat & Cooldowns
    this.shootCooldown = 0;
    this.invincibleTimer = 0;
    this.isDead = false;

    // Stats tracking
    this.kills = 0;
    this.arrowsShot = 0;
    this.damageTaken = 0;
  }

  update(dt, input, tilemap, audio, particles, arrows) {
    if (this.isDead) return;

    // 1. Update Cooldowns
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.invincibleTimer > 0) this.invincibleTimer -= dt;

    // 2. Handle Jump in Progress
    if (this.isJumping) {
      this.jumpTimer += dt;
      const progress = Math.min(1, this.jumpTimer / this.jumpDuration);

      // Lerp position
      this.x = this.jumpStartX + (this.jumpTargetX - this.jumpStartX) * progress;
      this.y = this.jumpStartY + (this.jumpTargetY - this.jumpStartY) * progress;

      // Parabolic Arc
      this.jumpHeightOffset = -Math.sin(progress * Math.PI) * CONFIG.PLAYER.JUMP_HEIGHT;

      if (progress >= 1) {
        this.isJumping = false;
        this.jumpHeightOffset = 0;
        this.x = this.jumpTargetX;
        this.y = this.jumpTargetY;
        particles.addBlood(this.x, this.y + 10, 4, '#e2e8f0'); // Land dust
      }
      return; // Skip standard movement while in mid-air
    }

    // 3. Check for Jump Trigger (Space)
    if (input.consumeJump()) {
      const jumpCheck = tilemap.canJumpOver(this.x, this.y, this.dir);
      if (jumpCheck.canJump) {
        this.isJumping = true;
        this.jumpTimer = 0;
        this.jumpStartX = this.x;
        this.jumpStartY = this.y;
        this.jumpTargetX = jumpCheck.landingX;
        this.jumpTargetY = jumpCheck.landingY;
        audio.playJump();
        particles.addBlood(this.x, this.y + 10, 6, '#cbd5e1'); // Jump dust
        particles.addFloatingText('JUMP!', this.x, this.y - 20, '#60a5fa', 14);
        return;
      } else {
        // Obstacle is too thick or no 1-tile jumpable gap
        particles.addFloatingText('장애물 1칸만 점프 가능!', this.x, this.y - 15, '#f87171', 11);
      }
    }

    // 4. Check for Bow Shoot Trigger (R key)
    if (input.consumeShoot() && this.shootCooldown <= 0) {
      this.shootBow(arrows, audio, particles);
    }

    // 5. Movement & Direction
    let dx = 0;
    let dy = 0;

    if (input.keys.up) { dy -= 1; this.dir = 'up'; }
    else if (input.keys.down) { dy += 1; this.dir = 'down'; }
    else if (input.keys.left) { dx -= 1; this.dir = 'left'; }
    else if (input.keys.right) { dx += 1; this.dir = 'right'; }

    // Normalize diagonal movement if any
    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    this.isMoving = (dx !== 0 || dy !== 0);

    if (this.isMoving) {
      const nextX = this.x + dx * this.speed;
      const nextY = this.y + dy * this.speed;

      // Axis-separated collision for smooth sliding along obstacles
      if (!tilemap.isPositionBlocked(nextX, this.y, this.radius)) {
        this.x = nextX;
      }
      if (!tilemap.isPositionBlocked(this.x, nextY, this.radius)) {
        this.y = nextY;
      }

      // Walk cycle animation
      this.walkTimer += dt * 8;
      this.walkFrame = Math.floor(this.walkTimer) % 4;
    } else {
      this.walkFrame = 0;
    }

    // Expression state
    if (this.invincibleTimer > 0) {
      this.expression = 'hurt';
    } else if (this.isJumping) {
      this.expression = 'determined';
    } else {
      this.expression = 'normal';
    }
  }

  shootBow(arrows, audio, particles) {
    this.shootCooldown = CONFIG.PLAYER.BOW_COOLDOWN;
    this.arrowsShot++;

    // Arrow spawn point based on direction
    let spawnX = this.x;
    let spawnY = this.y;
    if (this.dir === 'right') spawnX += 16;
    else if (this.dir === 'left') spawnX -= 16;
    else if (this.dir === 'down') spawnY += 16;
    else if (this.dir === 'up') spawnY -= 16;

    arrows.push(new Arrow(spawnX, spawnY, this.dir));
    audio.playShoot();
  }

  takeDamage(amount, audio, particles) {
    if (this.invincibleTimer > 0 || this.isDead) return;

    this.hp = Math.max(0, this.hp - amount);
    this.damageTaken += amount;
    this.invincibleTimer = CONFIG.PLAYER.INVINCIBLE_TIME;

    if (audio) audio.playHurt();
    if (particles) {
      particles.shake(0.3, 8);
      particles.addBlood(this.x, this.y, 10, '#ef4444');
      particles.addFloatingText(`-${amount} HP`, this.x, this.y - 20, '#ef4444', 16);
    }

    if (this.hp <= 0) {
      this.isDead = true;
      if (audio) audio.playGameOver();
      if (particles) particles.addExplosion(this.x, this.y, 30);
    }
  }

  heal(amount, audio, particles) {
    if (this.hp >= this.maxHp) return;
    const actual = Math.min(amount, this.maxHp - this.hp);
    this.hp = Math.min(this.maxHp, this.hp + amount);

    if (audio) audio.playPotion();
    if (particles) {
      particles.addHealingSparkles(this.x, this.y, 15);
      particles.addFloatingText(`+${actual} HP`, this.x, this.y - 25, '#22c55e', 16);
    }
  }

  render(ctx, sprites, camera) {
    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y + this.jumpHeightOffset;

    // Flashing effect during invincibility
    if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer * 20) % 2 === 0) {
      return;
    }

    let spriteKey = `player_${this.dir}_walk_${this.walkFrame}`;
    if (this.isJumping) {
      spriteKey = `player_${this.dir}_jump`;
    } else if (this.expression === 'hurt') {
      spriteKey = `player_${this.dir}_hurt`;
    } else if (this.shootCooldown > CONFIG.PLAYER.BOW_COOLDOWN * 0.5) {
      spriteKey = `player_${this.dir}_shoot`;
    }

    const sprite = sprites.get(spriteKey) || sprites.get(`player_${this.dir}_walk_0`);
    if (sprite) {
      ctx.drawImage(sprite, screenX - CONFIG.TILE_SIZE / 2, screenY - CONFIG.TILE_SIZE / 2);
    }

    // Facing indicator / Aim reticle
    this.drawAimGuide(ctx, screenX, screenY);
  }

  drawAimGuide(ctx, screenX, screenY) {
    let targetX = screenX;
    let targetY = screenY;
    const dist = 36;
    if (this.dir === 'right') targetX += dist;
    else if (this.dir === 'left') targetX -= dist;
    else if (this.dir === 'down') targetY += dist;
    else if (this.dir === 'up') targetY -= dist;

    ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.beginPath();
    ctx.arc(targetX, targetY, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}
