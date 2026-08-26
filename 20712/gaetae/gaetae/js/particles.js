/**
 * 네온 서바이벌 파티클, 플로팅 텍스트 및 시각 효과 엔진
 */
class ParticleSystem {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
    this.ghosts = [];

    // 화면 흔들림 상태
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.enableScreenShake = true;
    this.enableDamageText = true;
  }

  // 화면 흔들림 유발
  triggerShake(intensity = 8, duration = 0.2) {
    if (!this.enableScreenShake) return;
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
  }

  // 기본 네온 파티클 방출
  emit(x, y, count = 10, color = '#00f0ff', speed = 150, size = 3.5, life = 0.5) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 0.7 + 0.3) * speed;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color: color,
        size: size * (Math.random() * 0.6 + 0.7),
        life: life * (Math.random() * 0.5 + 0.7),
        maxLife: life,
        drag: 0.94
      });
    }
  }

  // 원형 충격파 링 생성
  emitShockwave(x, y, maxRadius = 60, color = '#00f0ff', duration = 0.3) {
    this.shockwaves.push({
      x: x,
      y: y,
      radius: 5,
      maxRadius: maxRadius,
      color: color,
      life: duration,
      maxLife: duration,
      lineWidth: 4
    });
  }

  // 플레이어/미사일 잔상 효과 (Ghost Trail)
  emitGhost(x, y, radius, color, alpha = 0.6) {
    this.ghosts.push({
      x: x,
      y: y,
      radius: radius,
      color: color,
      alpha: alpha,
      maxLife: 0.25,
      life: 0.25
    });
  }

  // 대미지 텍스트 팝업
  addFloatingText(text, x, y, isCrit = false, color = null) {
    if (!this.enableDamageText) return;
    this.floatingTexts.push({
      text: Math.round(text),
      x: x + (Math.random() * 20 - 10),
      y: y - 10,
      vy: -(Math.random() * 50 + 60),
      vx: (Math.random() * 40 - 20),
      color: color || (isCrit ? '#ffcc00' : '#ffffff'),
      size: isCrit ? 20 : 14,
      isCrit: isCrit,
      life: 0.6,
      maxLife: 0.6
    });
  }

  update(dt) {
    // 1. 화면 흔들림 갱신
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      const factor = this.shakeDuration > 0 ? this.shakeIntensity : 0;
      this.shakeOffsetX = (Math.random() * 2 - 1) * factor;
      this.shakeOffsetY = (Math.random() * 2 - 1) * factor;
      this.shakeIntensity *= 0.92;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }

    // 2. 파티클 갱신
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= p.drag;
      p.vy *= p.drag;
    }

    // 3. 충격파 갱신
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.life -= dt;
      if (sw.life <= 0) {
        this.shockwaves.splice(i, 1);
        continue;
      }
      const progress = 1 - (sw.life / sw.maxLife);
      sw.radius = 5 + (sw.maxRadius - 5) * progress;
    }

    // 4. 잔상 갱신
    for (let i = this.ghosts.length - 1; i >= 0; i--) {
      const g = this.ghosts[i];
      g.life -= dt;
      if (g.life <= 0) {
        this.ghosts.splice(i, 1);
      }
    }

    // 5. 플로팅 텍스트 갱신
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      ft.x += ft.vx * dt;
      ft.y += ft.vy * dt;
      ft.vy += 80 * dt; // 중력 가속
    }
  }

  render(ctx, camera) {
    ctx.save();
    // 카메라 좌표계 적용
    ctx.translate(-camera.x, -camera.y);

    // 1. 잔상 렌더링
    for (const g of this.ghosts) {
      const alpha = (g.life / g.maxLife) * g.alpha;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = g.color;
      ctx.shadowColor = g.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. 파티클 렌더링
    for (const p of this.particles) {
      const progress = p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = progress;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, p.size * progress), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. 충격파 렌더링
    for (const sw of this.shockwaves) {
      const progress = sw.life / sw.maxLife;
      ctx.save();
      ctx.globalAlpha = progress;
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = sw.lineWidth * progress;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 4. 플로팅 대미지 텍스트 렌더링
    for (const ft of this.floatingTexts) {
      const progress = ft.life / ft.maxLife;
      ctx.save();
      ctx.globalAlpha = Math.min(1, progress * 1.5);
      ctx.font = `${ft.isCrit ? '900' : '700'} ${ft.size}px 'Orbitron', 'Rajdhani', sans-serif`;
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = ft.isCrit ? 12 : 6;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    ctx.restore();
  }

  clear() {
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
    this.ghosts = [];
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
  }
}

window.particleSystem = new ParticleSystem();
