// ============================================================================
// 과즙 파티클, 충격파 링, 스파클, 플로팅 텍스트 이펙트 시스템
// ============================================================================

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.rings = [];
    this.floatingTexts = [];
  }

  // 1. 과일 합성 시 과즙 물방울 & 별빛 폭발 파티클
  createMergeBurst(x, y, fruitData, isMajor = false) {
    const count = isMajor ? 32 : 18;
    const baseColor = fruitData.color;
    const highlight = fruitData.highlight || '#FFFFFF';

    // 팽창하는 충격파 링 생성
    this.rings.push({
      x,
      y,
      radius: fruitData.radius * 0.3,
      maxRadius: fruitData.radius * 1.6,
      color: baseColor,
      alpha: 0.95,
      lineWidth: isMajor ? 6 : 4
    });

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6.5 + (isMajor ? 4.5 : 2.5);
      const size = Math.random() * 6.5 + 3.5;
      const isSparkle = Math.random() > 0.35;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.8, // 위로 솟구치는 탄성
        gravity: 0.24,
        friction: 0.96,
        size,
        color: isSparkle ? highlight : baseColor,
        alpha: 1,
        life: 1,
        decay: Math.random() * 0.022 + 0.018,
        isSparkle,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.25
      });
    }
  }

  // 2. 점수 및 콤보 플로팅 텍스트 팝업 (+64, COMBO x2! +80 등)
  createFloatingText(x, y, text, color = '#FFD700', fontSize = 24, isCombo = false) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      fontSize,
      isCombo,
      alpha: 1,
      scale: 0.4,
      maxScale: isCombo ? 1.35 : 1.2,
      vy: -2.8,
      life: 1,
      decay: isCombo ? 0.018 : 0.022
    });
  }

  // 업데이트 및 소멸 처리
  update() {
    // 파티클 업데이트
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.rotation += p.rotSpeed;
      p.life -= p.decay;
      p.alpha = Math.max(0, p.life);

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 링 업데이트
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.radius += (r.maxRadius - r.radius) * 0.28 + 1.8;
      r.alpha -= 0.048;
      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        this.rings.splice(i, 1);
      }
    }

    // 플로팅 텍스트 업데이트
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.vy *= 0.94;
      if (ft.scale < ft.maxScale) {
        ft.scale += 0.18;
      }
      ft.life -= ft.decay;
      ft.alpha = Math.max(0, ft.life);
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  // 캔버스 렌더링
  draw(ctx) {
    // 1. 충격파 링 그리기
    for (const r of this.rings) {
      ctx.save();
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = Math.max(0, r.alpha);
      ctx.lineWidth = r.lineWidth;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. 파티클 그리기
    for (const p of this.particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.isSparkle) {
        // 별 모양 스파클
        ctx.beginPath();
        const s = p.size;
        ctx.moveTo(0, -s);
        ctx.quadraticCurveTo(0, 0, s, 0);
        ctx.quadraticCurveTo(0, 0, 0, s);
        ctx.quadraticCurveTo(0, 0, -s, 0);
        ctx.quadraticCurveTo(0, 0, 0, -s);
        ctx.fill();
      } else {
        // 과즙 물방울
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 3. 플로팅 텍스트 그리기 (외곽선 + 생생한 폰트)
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.translate(ft.x, ft.y);
      ctx.scale(ft.scale, ft.scale);
      ctx.globalAlpha = ft.alpha;
      ctx.font = `900 ${ft.fontSize}px 'Jua', 'Outfit', 'Noto Sans KR', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 텍스트 외곽선 (짙은 테두리 섀도우)
      ctx.lineWidth = ft.isCombo ? 5 : 4;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.strokeText(ft.text, 0, 0);

      // 본문 텍스트 채우기
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);
      ctx.restore();
    }
  }

  clear() {
    this.particles = [];
    this.rings = [];
    this.floatingTexts = [];
  }
}
