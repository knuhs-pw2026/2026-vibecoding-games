// arrow.js - Bow Arrow Projectile Entity
import { CONFIG } from '../config.js';

export class Arrow {
  constructor(x, y, dir) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.speed = CONFIG.PLAYER.ARROW_SPEED;
    this.vx = 0;
    this.vy = 0;
    this.active = true;
    this.life = 2.5; // Seconds before auto-fade

    if (dir === 'right') this.vx = this.speed;
    else if (dir === 'left') this.vx = -this.speed;
    else if (dir === 'down') this.vy = this.speed;
    else if (dir === 'up') this.vy = -this.speed;
  }

  update(dt, tilemap, particles) {
    if (!this.active) return;

    this.life -= dt;
    if (this.life <= 0) {
      this.active = false;
      return;
    }

    this.x += this.vx * (dt * 60);
    this.y += this.vy * (dt * 60);

    // Obstacle collision check (solid wall or crates)
    const { tx, ty } = tilemap.getTileCoord(this.x, this.y);
    if (tilemap.isSolidTile(tx, ty)) {
      this.active = false;
      particles.addBlood(this.x, this.y, 4, '#78350f'); // Wood splinters
    }
  }

  render(ctx, sprites, camera) {
    if (!this.active) return;

    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    const sprite = sprites.get(`arrow_${this.dir}`);
    if (sprite) {
      ctx.drawImage(sprite, screenX - CONFIG.TILE_SIZE / 2, screenY - CONFIG.TILE_SIZE / 2);
    }
  }
}
