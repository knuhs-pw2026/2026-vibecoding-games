// item.js - Health Potions, Vaccine & Objective Items with Dropped Beacon Visuals
import { CONFIG } from '../config.js';

export class Item {
  constructor(data) {
    this.type = data.type; // 'potion' | 'vaccine' | 'generator' | 'keycard' | 'valve'
    this.name = data.name || (data.type === 'potion' ? '회복약' : (data.type === 'vaccine' ? '백신' : '퀘스트 아이템'));
    this.x = data.x;
    this.y = data.y;
    this.collected = false;
    this.radius = 20;
    this.bounceTimer = Math.random() * Math.PI * 2;
  }

  update(dt, player, stageObjective, audio, particles, onGameWin) {
    if (this.collected) return;

    this.bounceTimer += dt * 4;

    // Proximity check with player
    const dist = Math.hypot(this.x - player.x, this.y - player.y);
    if (dist < this.radius + player.radius) {
      this.collect(player, stageObjective, audio, particles, onGameWin);
    }
  }

  collect(player, stageObjective, audio, particles, onGameWin) {
    if (this.collected) return;

    if (this.type === 'potion') {
      if (player.hp >= player.maxHp) return; // Only pickup if player is hurt
      this.collected = true;
      // Heals ONLY 10 HP (1칸)
      player.heal(CONFIG.ITEM.POTION_HEAL, audio, particles);
    } else if (this.type === 'vaccine') {
      this.collected = true;
      if (audio) audio.playStageClear();
      if (particles) {
        particles.addHealingSparkles(this.x, this.y, 40);
        particles.addFloatingText('★ VACCINE ACQUIRED! GAME CLEAR! ★', this.x, this.y - 30, '#fbbf24', 20);
      }
      if (onGameWin) onGameWin();
    } else {
      // Quest Items (Generator, Keycard, Valve)
      this.collected = true;
      if (audio) audio.playPotion();
      if (particles) {
        particles.addHealingSparkles(this.x, this.y, 25);
        particles.addFloatingText(`[${this.name}] 획득 완료!`, this.x, this.y - 25, '#38bdf8', 16);
      }

      if (stageObjective && stageObjective.type === 'collect_items') {
        stageObjective.currentCount++;
      }
    }
  }

  render(ctx, sprites, camera) {
    if (this.collected) return;

    const screenX = this.x - camera.x;
    const yBob = Math.sin(this.bounceTimer) * 4;
    const screenY = this.y - camera.y + yBob;

    // 1. Draw Glowing Ground Beacon & Halo
    const pulse = 0.4 + 0.35 * Math.sin(this.bounceTimer * 1.5);
    let haloColor = '#38bdf8';
    let ringColor = 'rgba(56, 189, 248, 0.4)';

    if (this.type === 'potion') {
      haloColor = '#ef4444';
      ringColor = `rgba(239, 68, 68, ${pulse * 0.7})`;
    } else if (this.type === 'generator') {
      haloColor = '#06b6d4';
      ringColor = `rgba(6, 182, 212, ${pulse})`;
    } else if (this.type === 'keycard') {
      haloColor = '#3b82f6';
      ringColor = `rgba(59, 130, 246, ${pulse})`;
    } else if (this.type === 'valve') {
      haloColor = '#f97316';
      ringColor = `rgba(249, 115, 22, ${pulse})`;
    } else if (this.type === 'vaccine') {
      haloColor = '#fbbf24';
      ringColor = `rgba(251, 191, 36, ${pulse})`;
    }

    // Ground Beacon Ring
    ctx.save();
    ctx.strokeStyle = haloColor;
    ctx.fillStyle = ringColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(screenX, screenY + 12 - yBob, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 2. Draw Sprite
    let spriteKey = 'item_potion';
    if (this.type === 'vaccine') spriteKey = 'item_vaccine';
    else if (this.type === 'generator') spriteKey = 'item_generator';
    else if (this.type === 'keycard') spriteKey = 'item_keycard';
    else if (this.type === 'valve') spriteKey = 'item_valve';

    const sprite = sprites.get(spriteKey) || sprites.get('item_potion');
    if (sprite) {
      ctx.drawImage(sprite, screenX - CONFIG.TILE_SIZE / 2, screenY - CONFIG.TILE_SIZE / 2);
    }

    // 3. Floating Label for Quest Items
    if (this.type !== 'potion') {
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(screenX - 45, screenY - 26, 90, 14);
      ctx.fillStyle = haloColor;
      ctx.fillText(this.name, screenX, screenY - 15);
    }

    ctx.restore();
  }
}
