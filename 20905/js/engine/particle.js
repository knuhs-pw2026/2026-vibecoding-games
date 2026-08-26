// particle.js - Particle System, Visual Effects, Telegraphs & Floating Text
import { CONFIG } from '../config.js';

export class ParticleManager {
  constructor() {
    this.particles = [];
    this.telegraphs = [];
    this.floatingTexts = [];
    this.screenShakeTime = 0;
    this.screenShakeIntensity = 0;
  }

  update(dt) {
    // 1. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) p.vy += p.gravity * dt;
      if (p.drag) {
        p.vx *= Math.pow(p.drag, dt * 60);
        p.vy *= Math.pow(p.drag, dt * 60);
      }
      if (p.grow) p.radius += p.grow * dt;
    }

    // 2. Update Telegraphs (Red Warning indicators)
    for (let i = this.telegraphs.length - 1; i >= 0; i--) {
      const t = this.telegraphs[i];
      t.elapsed += dt;
      if (t.elapsed >= t.duration) {
        if (t.onComplete) t.onComplete();
        this.telegraphs.splice(i, 1);
      }
    }

    // 3. Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      ft.y += ft.vy * dt;
    }

    // 4. Update Screen Shake
    if (this.screenShakeTime > 0) {
      this.screenShakeTime -= dt;
      if (this.screenShakeTime <= 0) {
        this.screenShakeIntensity = 0;
      }
    }
  }

  shake(duration = 0.3, intensity = 8) {
    this.screenShakeTime = duration;
    this.screenShakeIntensity = intensity;
  }

  getScreenShakeOffset() {
    if (this.screenShakeTime <= 0) return { x: 0, y: 0 };
    const factor = this.screenShakeTime > 0 ? this.screenShakeIntensity : 0;
    return {
      x: (Math.random() * 2 - 1) * factor,
      y: (Math.random() * 2 - 1) * factor
    };
  }

  // --- Particle Creators ---

  addBlood(x, y, count = 8, color = '#dc2626') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 100;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3,
        life: 0.3 + Math.random() * 0.4,
        maxLife: 0.7,
        color,
        drag: 0.88,
        type: 'circle'
      });
    }
  }

  addExplosion(x, y, radiusPx = 60) {
    this.shake(0.4, 12);
    // Shockwave ring
    this.particles.push({
      x, y,
      vx: 0, vy: 0,
      radius: 8,
      grow: radiusPx * 4,
      life: 0.35,
      maxLife: 0.35,
      color: '#ffedd5',
      type: 'ring'
    });

    // Fire / smoke sparks
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 180;
      const colors = ['#ff2200', '#ff7700', '#ffcc00', '#78350f', '#1e293b'];
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 4 + Math.random() * 6,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        drag: 0.85,
        type: 'circle'
      });
    }
  }

  addHealingSparkles(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 40;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        radius: 3,
        life: 0.6 + Math.random() * 0.3,
        maxLife: 0.9,
        color: '#4ade80',
        type: 'cross'
      });
    }
  }

  addFloatingText(text, x, y, color = '#ffffff', size = 14) {
    this.floatingTexts.push({
      text, x, y,
      vy: -35,
      life: 1.0,
      maxLife: 1.0,
      color,
      size
    });
  }

  // Add Red Warning Telegraph Box
  addTelegraph(x, y, width, height, duration, onComplete, shape = 'rect', label = '') {
    this.telegraphs.push({
      x, y, width, height,
      duration,
      elapsed: 0,
      onComplete,
      shape,
      label
    });
  }

  render(ctx, camera) {
    ctx.save();

    // 1. Render Telegraphs (Red Danger Zones)
    this.telegraphs.forEach(t => {
      const screenX = t.x - camera.x;
      const screenY = t.y - camera.y;
      const progress = Math.min(1, t.elapsed / t.duration);
      const pulse = 0.3 + 0.35 * Math.abs(Math.sin(t.elapsed * 8));

      ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;

      if (t.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(screenX + t.width / 2, screenY + t.height / 2, t.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(screenX, screenY, t.width, t.height);
        ctx.strokeRect(screenX, screenY, t.width, t.height);
      }

      // Progress bar fill inside telegraph
      ctx.fillStyle = 'rgba(254, 202, 202, 0.4)';
      if (t.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(screenX + t.width / 2, screenY + t.height / 2, (t.width / 2) * progress, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(screenX, screenY, t.width * progress, 4);
      }

      // Label / Countdown
      const remainingSec = Math.max(0, (t.duration - t.elapsed)).toFixed(1);
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(`! ${t.label} ${remainingSec}s !`, screenX + t.width / 2, screenY + t.height / 2 + 4);
    });

    // 2. Render Particles
    this.particles.forEach(p => {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;

      const screenX = p.x - camera.x;
      const screenY = p.y - camera.y;

      if (p.type === 'circle') {
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(screenX, screenY, Math.max(1, p.radius * alpha), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'ring') {
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 4 * alpha;
        ctx.beginPath();
        ctx.arc(screenX, screenY, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'cross') {
        ctx.globalAlpha = alpha;
        ctx.fillRect(screenX - 1, screenY - 4, 2, 8);
        ctx.fillRect(screenX - 4, screenY - 1, 8, 2);
      }
    });

    // 3. Render Floating Texts
    this.floatingTexts.forEach(ft => {
      const alpha = Math.max(0, ft.life / ft.maxLife);
      const screenX = ft.x - camera.x;
      const screenY = ft.y - camera.y;

      ctx.globalAlpha = alpha;
      ctx.font = `bold ${ft.size}px monospace`;
      ctx.textAlign = 'center';

      // Text Shadow
      ctx.fillStyle = '#000000';
      ctx.fillText(ft.text, screenX + 1, screenY + 1);
      // Main Text
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, screenX, screenY);
    });

    ctx.restore();
  }

  clear() {
    this.particles = [];
    this.telegraphs = [];
    this.floatingTexts = [];
    this.screenShakeTime = 0;
  }
}
