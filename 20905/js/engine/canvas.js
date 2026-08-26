// canvas.js - Canvas Management, Pixel Rendering, Camera & Minimap
import { CONFIG } from '../config.js';

export class CanvasEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.width = CONFIG.CANVAS_WIDTH;
    this.height = CONFIG.CANVAS_HEIGHT;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.camera = {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      targetX: 0,
      targetY: 0,
    };
  }

  resize() {
    this.ctx.imageSmoothingEnabled = false;
  }

  updateCamera(target, worldWidthPx, worldHeightPx, shakeOffset) {
    // Center camera on target
    this.camera.targetX = target.x - this.width / 2;
    this.camera.targetY = target.y - this.height / 2;

    // Smooth lerp
    this.camera.x += (this.camera.targetX - this.camera.x) * 0.15;
    this.camera.y += (this.camera.targetY - this.camera.y) * 0.15;

    // Clamp camera within map bounds (or center if map is smaller than canvas)
    if (worldWidthPx < this.width) {
      this.camera.x = (worldWidthPx - this.width) / 2;
    } else {
      this.camera.x = Math.max(0, Math.min(this.camera.x, worldWidthPx - this.width));
    }

    if (worldHeightPx < this.height) {
      this.camera.y = (worldHeightPx - this.height) / 2;
    } else {
      this.camera.y = Math.max(0, Math.min(this.camera.y, worldHeightPx - this.height));
    }

    // Apply screen shake
    if (shakeOffset) {
      this.camera.x += shakeOffset.x;
      this.camera.y += shakeOffset.y;
    }
  }

  clear() {
    this.ctx.fillStyle = '#050508';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  // Draw apocalyptic atmospheric vignette & darkness gradient
  drawVignette(stageId) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const radius = Math.max(this.width, this.height) * 0.75;

    const grad = this.ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius);
    if (stageId === 7) {
      // Crimson ominous atmosphere for Boss stage
      grad.addColorStop(0, 'rgba(30, 0, 10, 0)');
      grad.addColorStop(0.8, 'rgba(80, 0, 20, 0.4)');
      grad.addColorStop(1, 'rgba(20, 0, 5, 0.85)');
    } else {
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.35)');
      grad.addColorStop(1, 'rgba(5, 5, 10, 0.8)');
    }

    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  // Draw Minimap in top-left or specified mini canvas
  drawMinimap(miniCtx, player, zombies, boss, items, tilemap, exitTile) {
    if (!miniCtx || !tilemap) return;
    const mw = miniCtx.canvas.width;
    const mh = miniCtx.canvas.height;

    miniCtx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    miniCtx.fillRect(0, 0, mw, mh);

    const scaleX = mw / (tilemap.width * CONFIG.TILE_SIZE);
    const scaleY = mh / (tilemap.height * CONFIG.TILE_SIZE);

    // Draw Exit Portal (Flashing Green Beacon)
    if (exitTile) {
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.008);
      miniCtx.fillStyle = exitTile.isExitOpen ? '#22c55e' : '#ef4444';
      const ex = exitTile.x * CONFIG.TILE_SIZE * scaleX;
      const ey = exitTile.y * CONFIG.TILE_SIZE * scaleY;
      miniCtx.fillRect(ex - 2, ey - 2, 6, 6);
      if (exitTile.isExitOpen) {
        miniCtx.strokeStyle = `rgba(134, 239, 172, ${pulse})`;
        miniCtx.strokeRect(ex - 4, ey - 4, 10, 10);
      }
    }

    // Draw Items
    items.forEach(item => {
      if (!item.collected) {
        const ix = item.x * scaleX;
        const iy = item.y * scaleY;

        if (item.type === 'potion') {
          // Red Potion dot
          miniCtx.fillStyle = '#ef4444';
          miniCtx.fillRect(ix - 1.5, iy - 1.5, 3, 3);
        } else {
          // Large Glowing Quest Item Diamond (Generator, Keycard, Valve, Vaccine)
          const pulse = 0.6 + 0.4 * Math.sin(Date.now() * 0.01);
          miniCtx.fillStyle = item.type === 'vaccine' ? '#fbbf24' : '#06b6d4';
          miniCtx.beginPath();
          miniCtx.arc(ix, iy, 4, 0, Math.PI * 2);
          miniCtx.fill();
          miniCtx.strokeStyle = `rgba(255, 255, 255, ${pulse})`;
          miniCtx.lineWidth = 1;
          miniCtx.stroke();
        }
      }
    });

    // Draw Zombies
    zombies.forEach(z => {
      if (z.hp > 0) {
        miniCtx.fillStyle = z.type === 'MUTANT' ? '#a855f7' : (z.type === 'EXPLODING' ? '#f97316' : '#ef4444');
        const size = z.type === 'MUTANT' ? 5 : 2.5;
        miniCtx.fillRect(z.x * scaleX - size/2, z.y * scaleY - size/2, size, size);
      }
    });

    // Draw Boss
    if (boss && boss.hp > 0) {
      miniCtx.fillStyle = '#e11d48';
      miniCtx.fillRect(boss.x * scaleX - 5, boss.y * scaleY - 5, 10, 10);
      miniCtx.strokeStyle = '#ffffff';
      miniCtx.strokeRect(boss.x * scaleX - 6, boss.y * scaleY - 6, 12, 12);
    }

    // Draw Player (Bright Yellow with Crosshair)
    miniCtx.fillStyle = '#fde047';
    miniCtx.fillRect(player.x * scaleX - 2, player.y * scaleY - 2, 4, 4);
  }
}
