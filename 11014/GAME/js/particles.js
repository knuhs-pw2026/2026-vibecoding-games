/**
 * ANCIENT CASTLE GUARDIANS: PARTICLE & VISUAL FX SYSTEM
 * Handles floating combat text, neon magic sparks, radial blast rings,
 * summoning rainbow fireworks, lightning bolts, and blood/ice bursts.
 */

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
    this.lightningChains = [];
    this.areaRings = [];
  }

  update(dt) {
    // Update simple particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.gravity) p.vy += p.gravity * dt;
      if (p.shrink) p.size = Math.max(0.5, p.size * (1 - dt * 2));
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.life -= dt;
      if (t.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      t.y += t.vy * dt;
      t.alpha = Math.min(1, t.life / (t.maxLife * 0.5));
    }

    // Update Area Rings
    for (let i = this.areaRings.length - 1; i >= 0; i--) {
      const ring = this.areaRings[i];
      ring.life -= dt;
      if (ring.life <= 0) {
        this.areaRings.splice(i, 1);
        continue;
      }
      ring.radius += ring.expandSpeed * dt;
      ring.alpha = ring.life / ring.maxLife;
    }

    // Update lightning chains
    for (let i = this.lightningChains.length - 1; i >= 0; i--) {
      const chain = this.lightningChains[i];
      chain.life -= dt;
      if (chain.life <= 0) {
        this.lightningChains.splice(i, 1);
      }
    }
  }

  spawnFloatingText(x, y, text, color = '#ffffff', scale = 1.0) {
    this.floatingTexts.push({
      x: x + (Math.random() * 20 - 10),
      y: y + (Math.random() * 10 - 5),
      vy: -55 * scale,
      text: text,
      color: color,
      scale: scale,
      life: 0.85,
      maxLife: 0.85,
      alpha: 1.0
    });
  }

  spawnHitSparks(x, y, color = '#fbbf24', count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 180 + 60;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2,
        color: color,
        life: 0.35,
        maxLife: 0.35,
        alpha: 1.0,
        shrink: true
      });
    }
  }

  spawnExplosion(x, y, color = '#ef4444', radius = 60) {
    // Ring wave
    this.areaRings.push({
      x: x,
      y: y,
      radius: 10,
      expandSpeed: radius * 3,
      color: color,
      life: 0.4,
      maxLife: 0.4,
      alpha: 1.0
    });

    // Fire sparks
    for (let i = 0; i < 22; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 250 + 50;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 5 + 3,
        color: Math.random() < 0.5 ? color : '#fbbf24',
        life: 0.5,
        maxLife: 0.5,
        alpha: 1.0,
        shrink: true
      });
    }
  }

  spawnRainbowSummonSparks(x, y) {
    const colors = ['#f43f5e', '#fbbf24', '#34d399', '#38bdf8', '#a855f7', '#ec4899'];
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 350 + 100;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.2,
        maxLife: 1.2,
        alpha: 1.0,
        gravity: 120,
        shrink: true
      });
    }
  }

  addLightning(segments, color = '#38bdf8') {
    this.lightningChains.push({
      segments: segments,
      color: color,
      life: 0.22,
      maxLife: 0.22
    });
  }

  draw(ctx) {
    ctx.save();

    // Draw Area Rings
    for (let ring of this.areaRings) {
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = Math.max(0, ring.alpha);
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw Lightning Chains
    for (let chain of this.lightningChains) {
      ctx.strokeStyle = chain.color;
      ctx.shadowColor = chain.color;
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3;
      ctx.globalAlpha = chain.life / chain.maxLife;
      ctx.beginPath();
      for (let i = 0; i < chain.segments.length; i++) {
        const pt = chain.segments[i];
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    }

    // Draw Particles
    for (let p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Floating Texts
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let t of this.floatingTexts) {
      ctx.globalAlpha = Math.max(0, t.alpha);
      ctx.font = `bold ${Math.floor(16 * t.scale)}px Outfit, sans-serif`;
      ctx.fillStyle = t.color;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.fillText(t.text, t.x, t.y);
    }

    ctx.restore();
  }
}
