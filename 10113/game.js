// ============================================================================
// 수박 게임 (Suika Game) - 유러피안 마켓 & 리얼 원목 과일 상자 통합 엔진
// Matter.js 2D 물리 엔진, 피버 모드, 2단계 NEXT, 1.5초 콤보, 폭죽 파티클,
// 착지 가이드라인, 상자 흔들기(15초/3회), Web Audio API, LocalStorage 연동
// ============================================================================

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. 과일 11단계 데이터 정의 (생생한 과즙 컬러 & 디테일)
  // --------------------------------------------------------------------------
  const FRUITS = [
    {
      id: 0,
      name: '체리',
      englishName: 'Cherry',
      radius: 18,
      score: 2,
      color: '#FF2A55',
      secondaryColor: '#B30024',
      leafColor: '#4CAF50',
      highlight: '#FFAEC0',
      details: 'cherry'
    },
    {
      id: 1,
      name: '딸기',
      englishName: 'Strawberry',
      radius: 26,
      score: 4,
      color: '#FF3B30',
      secondaryColor: '#9E0012',
      leafColor: '#2E7D32',
      highlight: '#FF9E99',
      details: 'strawberry'
    },
    {
      id: 2,
      name: '포도',
      englishName: 'Grape',
      radius: 35,
      score: 8,
      color: '#9C27B0',
      secondaryColor: '#4A0B55',
      leafColor: '#388E3C',
      highlight: '#E1BEE7',
      details: 'grape'
    },
    {
      id: 3,
      name: '귤',
      englishName: 'Tangerine',
      radius: 45,
      score: 16,
      color: '#FF9F1A',
      secondaryColor: '#D35400',
      leafColor: '#43A047',
      highlight: '#FFEAA7',
      details: 'tangerine'
    },
    {
      id: 4,
      name: '감',
      englishName: 'Persimmon',
      radius: 56,
      score: 32,
      color: '#E65100',
      secondaryColor: '#BF360C',
      leafColor: '#33691E',
      highlight: '#FFB74D',
      details: 'persimmon'
    },
    {
      id: 5,
      name: '사과',
      englishName: 'Apple',
      radius: 68,
      score: 64,
      color: '#E74C3C',
      secondaryColor: '#8E1A10',
      leafColor: '#2ECC71',
      highlight: '#FF7675',
      details: 'apple'
    },
    {
      id: 6,
      name: '배',
      englishName: 'Pear',
      radius: 81,
      score: 128,
      color: '#ECC06C',
      secondaryColor: '#B78114',
      leafColor: '#2E7D32',
      highlight: '#FFF3B0',
      details: 'pear'
    },
    {
      id: 7,
      name: '복숭아',
      englishName: 'Peach',
      radius: 95,
      score: 256,
      color: '#FF7597',
      secondaryColor: '#C2185B',
      leafColor: '#43A047',
      highlight: '#FFD3DF',
      details: 'peach'
    },
    {
      id: 8,
      name: '파인애플',
      englishName: 'Pineapple',
      radius: 110,
      score: 512,
      color: '#F1C40F',
      secondaryColor: '#B7950B',
      leafColor: '#10AC84',
      highlight: '#FEF1B5',
      details: 'pineapple'
    },
    {
      id: 9,
      name: '멜론',
      englishName: 'Melon',
      radius: 126,
      score: 1024,
      color: '#A3CB38',
      secondaryColor: '#5B7A16',
      leafColor: '#2F701E',
      highlight: '#DDF786',
      details: 'melon'
    },
    {
      id: 10,
      name: '수박',
      englishName: 'Watermelon',
      radius: 145,
      score: 2048,
      color: '#2ECC71',
      secondaryColor: '#0E6635',
      insideColor: '#FF3838',
      highlight: '#82E0AA',
      details: 'watermelon'
    }
  ];

  // --------------------------------------------------------------------------
  // 2. Web Audio API 절차적 사운드 신시사이저 (Zero-CORS)
  // --------------------------------------------------------------------------
  class SoundFX {
    constructor() {
      this.ctx = null;
      this.isMuted = false;
      this.initialized = false;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.initialized = true;
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      return this.isMuted;
    }

    playDrop() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(460, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.12);
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    }

    playBounce(intensity = 0.5) {
      if (this.isMuted || intensity < 0.2) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const vol = Math.min(0.22, intensity * 0.18);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220 + Math.random() * 60, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    }

    playMerge(level = 0) {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const scale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 783.99];
      const baseFreq = scale[Math.min(level, scale.length - 1)];

      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(baseFreq * 1.4, t);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq, t + 0.05);
      gain1.gain.setValueAtTime(0.38, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(baseFreq * 2, t);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 2.05, t + 0.2);
      gain2.gain.setValueAtTime(0.18, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc1.connect(gain1);
      osc2.connect(gain2);
      gain1.connect(this.ctx.destination);
      gain2.connect(this.ctx.destination);
      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.28);
      osc2.stop(t + 0.25);
    }

    playCombo(combo = 2) {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      const count = Math.min(notes.length, Math.max(2, combo));

      notes.slice(0, count).forEach((freq, idx) => {
        const startT = t + idx * 0.055;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startT);
        gain.gain.setValueAtTime(0.22, startT);
        gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startT);
        osc.stop(startT + 0.16);
      });
    }

    playFeverStart() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.50];
      chord.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.linearRampToValueAtTime(freq * 1.5, t + 0.35);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.45);
      });
    }

    playFireworks() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const fanfare = [
        { f: 523.25, d: 0.1, off: 0 },
        { f: 659.25, d: 0.1, off: 0.1 },
        { f: 783.99, d: 0.1, off: 0.2 },
        { f: 1046.50, d: 0.35, off: 0.3 }
      ];
      fanfare.forEach(item => {
        const startT = t + item.off;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, startT);
        gain.gain.setValueAtTime(0.3, startT);
        gain.gain.exponentialRampToValueAtTime(0.001, startT + item.d);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startT);
        osc.stop(startT + item.d);
      });
    }

    playShake() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.linearRampToValueAtTime(60, t + 0.35);
      gain.gain.setValueAtTime(0.32, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    }

    playWatermelon() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const fanfare = [
        { f: 523.25, d: 0.12, off: 0 },
        { f: 659.25, d: 0.12, off: 0.12 },
        { f: 783.99, d: 0.12, off: 0.24 },
        { f: 1046.50, d: 0.55, off: 0.36 }
      ];
      fanfare.forEach(item => {
        const startT = t + item.off;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, startT);
        gain.gain.setValueAtTime(0.35, startT);
        gain.gain.exponentialRampToValueAtTime(0.001, startT + item.d);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startT);
        osc.stop(startT + item.d);
      });
    }

    playGameOver() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [440, 415.3, 392, 349.23];
      notes.forEach((freq, idx) => {
        const startT = t + idx * 0.18;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startT);
        gain.gain.setValueAtTime(0.25, startT);
        gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startT);
        osc.stop(startT + 0.25);
      });
    }

    playClick() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    }
  }

  const soundFX = new SoundFX();

  // --------------------------------------------------------------------------
  // 3. 파티클 및 화면 전체 축하 폭죽 시스템
  // --------------------------------------------------------------------------
  class ParticleSystem {
    constructor() {
      this.particles = [];
      this.rings = [];
      this.floatingTexts = [];
      this.confetti = [];
    }

    createMergeBurst(x, y, fruitData, isMajor = false) {
      const count = isMajor ? 32 : 18;
      const baseColor = fruitData.color;
      const highlight = fruitData.highlight || '#FFFFFF';

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
          vy: Math.sin(angle) * speed - 1.8,
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

    createFloatingText(x, y, text, color = '#FFD700', fontSize = 24, isSpecial = false) {
      this.floatingTexts.push({
        x,
        y,
        text,
        color,
        fontSize,
        isSpecial,
        alpha: 1,
        scale: 0.4,
        maxScale: isSpecial ? 1.35 : 1.2,
        vy: -2.8,
        life: 1,
        decay: isSpecial ? 0.018 : 0.022
      });
    }

    createConfettiFireworks(width, height) {
      const colors = ['#FF4757', '#FFA502', '#2ED573', '#1E90FF', '#9C27B0', '#FFD700', '#FF6B81'];
      for (let i = 0; i < 70; i++) {
        const startX = width * 0.1 + Math.random() * (width * 0.8);
        const startY = height * 0.3 + Math.random() * (height * 0.4);
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        const color = colors[Math.floor(Math.random() * colors.length)];

        this.confetti.push({
          x: startX,
          y: startY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3.5,
          gravity: 0.18,
          friction: 0.96,
          w: Math.random() * 8 + 6,
          h: Math.random() * 5 + 4,
          color,
          alpha: 1,
          life: 1,
          decay: Math.random() * 0.014 + 0.012,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.3
        });
      }
    }

    update() {
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
        if (p.life <= 0) this.particles.splice(i, 1);
      }

      for (let i = this.rings.length - 1; i >= 0; i--) {
        const r = this.rings[i];
        r.radius += (r.maxRadius - r.radius) * 0.28 + 1.8;
        r.alpha -= 0.048;
        if (r.alpha <= 0 || r.radius >= r.maxRadius) this.rings.splice(i, 1);
      }

      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.y += ft.vy;
        ft.vy *= 0.94;
        if (ft.scale < ft.maxScale) ft.scale += 0.18;
        ft.life -= ft.decay;
        ft.alpha = Math.max(0, ft.life);
        if (ft.life <= 0) this.floatingTexts.splice(i, 1);
      }

      for (let i = this.confetti.length - 1; i >= 0; i--) {
        const c = this.confetti[i];
        c.x += c.vx;
        c.y += c.vy;
        c.vy += c.gravity;
        c.vx *= c.friction;
        c.rotation += c.rotSpeed;
        c.life -= c.decay;
        c.alpha = Math.max(0, c.life);
        if (c.life <= 0) this.confetti.splice(i, 1);
      }
    }

    draw(ctx) {
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

      for (const p of this.particles) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        if (p.isSparkle) {
          ctx.beginPath();
          const s = p.size;
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(0, 0, s, 0);
          ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      for (const c of this.confetti) {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);
        ctx.globalAlpha = c.alpha;
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();
      }

      for (const ft of this.floatingTexts) {
        ctx.save();
        ctx.translate(ft.x, ft.y);
        ctx.scale(ft.scale, ft.scale);
        ctx.globalAlpha = ft.alpha;
        ctx.font = `900 ${ft.fontSize}px 'Jua', 'Outfit', 'Noto Sans KR', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = ft.isSpecial ? 5 : 4;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.strokeText(ft.text, 0, 0);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, 0, 0);
        ctx.restore();
      }
    }

    clear() {
      this.particles = [];
      this.rings = [];
      this.floatingTexts = [];
      this.confetti = [];
    }
  }

  // --------------------------------------------------------------------------
  // 4. 과일 렌더러 함수들 (먹음직스러운 과즙 & 귀여운 표정)
  // --------------------------------------------------------------------------
  function drawFruit(ctx, fruitData, x, y, angle, squashX = 1, squashY = 1, impactIntensity = 0, time = 0, isFever = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(squashX, squashY);

    const r = fruitData.radius;

    // 수박(최종) 황금 오라 글로우
    if (fruitData.id === 10) {
      ctx.save();
      ctx.shadowColor = 'rgba(46, 204, 113, 0.9)';
      ctx.shadowBlur = 24 + Math.sin(time * 0.005) * 8;
      ctx.beginPath();
      ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(46, 204, 113, 0.25)';
      ctx.fill();
      ctx.restore();
    }

    // 기본 과일 바디 3D 구형 그라데이션
    const grad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.08, 0, 0, r);
    grad.addColorStop(0, fruitData.highlight || '#FFF');
    grad.addColorStop(0.35, fruitData.color);
    grad.addColorStop(1, fruitData.secondaryColor);

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // 외곽선
    ctx.lineWidth = Math.max(2, r * 0.045);
    ctx.strokeStyle = fruitData.secondaryColor;
    ctx.stroke();

    // 과일별 고유 무늬
    drawFruitSpecificDetails(ctx, fruitData, r, time);

    // 하이라이트 광택 (Glossy Specular)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(-r * 0.42, -r * 0.42, r * 0.26, r * 0.13, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.52)';
    ctx.fill();
    ctx.restore();

    // 귀여운 표정
    drawFruitFace(ctx, fruitData, r, impactIntensity, time, isFever);

    // 꼭지 및 잎사귀
    drawFruitTop(ctx, fruitData, r);

    ctx.restore();
  }

  function drawGhostFruit(ctx, fruitData, x, y, isMergeChance = false, time = 0) {
    ctx.save();
    ctx.translate(x, y);

    const r = fruitData.radius;
    const pulse = Math.sin(time * 0.008) * 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = isMergeChance ? 'rgba(255, 215, 0, 0.25)' : 'rgba(255, 255, 255, 0.18)';
    ctx.fill();

    ctx.lineWidth = isMergeChance ? 3.5 : 2.2;
    ctx.strokeStyle = isMergeChance ? '#FFD700' : fruitData.color;
    ctx.setLineDash([6, 5]);
    ctx.stroke();
    ctx.restore();

    // 중앙 십자선
    ctx.save();
    ctx.strokeStyle = isMergeChance ? 'rgba(255, 215, 0, 0.85)' : 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 2;
    const crossSize = Math.min(14, r * 0.3);
    ctx.beginPath();
    ctx.moveTo(-crossSize, 0);
    ctx.lineTo(crossSize, 0);
    ctx.moveTo(0, -crossSize);
    ctx.lineTo(0, crossSize);
    ctx.stroke();
    ctx.restore();

    if (isMergeChance) {
      ctx.save();
      ctx.shadowColor = 'rgba(255, 215, 0, 0.9)';
      ctx.shadowBlur = 10;
      ctx.font = `900 ${Math.max(11, Math.round(r * 0.28))}px 'Jua', 'Noto Sans KR', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#B33939';
      ctx.lineWidth = 3.5;
      ctx.strokeText('✨ 합체 찬스!', 0, -r - 12 + pulse);
      ctx.fillStyle = '#FFD700';
      ctx.fillText('✨ 합체 찬스!', 0, -r - 12 + pulse);
      ctx.restore();
    }

    ctx.restore();
  }

  function drawFruitSpecificDetails(ctx, fruitData, r, time) {
    switch (fruitData.details) {
      case 'strawberry': {
        ctx.fillStyle = '#FFEAA7';
        const seeds = [[-0.4, -0.2], [0.3, -0.2], [-0.1, 0.1], [-0.5, 0.4], [0.4, 0.4], [0, 0.6], [0.2, -0.6], [-0.2, -0.6]];
        seeds.forEach(([sx, sy]) => {
          ctx.beginPath();
          ctx.ellipse(sx * r, sy * r, r * 0.04, r * 0.07, Math.PI / 8, 0, Math.PI * 2);
          ctx.fill();
        });
        break;
      }
      case 'grape': {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
        const grapes = [[-0.4, -0.3], [0.4, -0.3], [-0.5, 0.2], [0.5, 0.2], [0, 0.5]];
        grapes.forEach(([gx, gy]) => {
          ctx.beginPath();
          ctx.arc(gx * r, gy * r, r * 0.26, 0, Math.PI * 2);
          ctx.fill();
        });
        break;
      }
      case 'tangerine': {
        ctx.fillStyle = 'rgba(211, 84, 0, 0.22)';
        for (let i = 0; i < 8; i++) {
          const ang = (i * Math.PI) / 4;
          ctx.beginPath();
          ctx.arc(Math.cos(ang) * r * 0.65, Math.sin(ang) * r * 0.65, r * 0.04, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'persimmon': {
        ctx.strokeStyle = 'rgba(191, 54, 12, 0.3)';
        ctx.lineWidth = r * 0.04;
        ctx.beginPath();
        ctx.moveTo(-r * 0.7, 0);
        ctx.lineTo(r * 0.7, 0);
        ctx.moveTo(0, -r * 0.7);
        ctx.lineTo(0, r * 0.7);
        ctx.stroke();
        break;
      }
      case 'apple': {
        ctx.beginPath();
        ctx.arc(0, -r * 0.75, r * 0.18, 0, Math.PI);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fill();
        break;
      }
      case 'peach': {
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.95);
        ctx.bezierCurveTo(-r * 0.15, 0, -r * 0.1, r * 0.6, 0, r * 0.95);
        ctx.strokeStyle = 'rgba(194, 24, 91, 0.4)';
        ctx.lineWidth = r * 0.05;
        ctx.stroke();
        break;
      }
      case 'pineapple': {
        ctx.strokeStyle = 'rgba(183, 149, 11, 0.35)';
        ctx.lineWidth = Math.max(1.5, r * 0.035);
        const step = r * 0.35;
        for (let x = -r; x <= r; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, -r);
          ctx.lineTo(x + r, r);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x, -r);
          ctx.lineTo(x - r, r);
          ctx.stroke();
        }
        break;
      }
      case 'melon': {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = Math.max(1.5, r * 0.032);
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const ang = (i * Math.PI) / 3;
          ctx.moveTo(Math.cos(ang) * r * 0.9, Math.sin(ang) * r * 0.9);
          ctx.quadraticCurveTo(0, 0, Math.cos(ang + Math.PI) * r * 0.9, Math.sin(ang + Math.PI) * r * 0.9);
        }
        ctx.stroke();
        break;
      }
      case 'watermelon': {
        ctx.strokeStyle = '#0B4D26';
        ctx.lineWidth = r * 0.11;
        ctx.lineCap = 'round';
        const stripes = [-0.65, -0.35, 0, 0.35, 0.65];
        stripes.forEach(sx => {
          ctx.beginPath();
          ctx.moveTo(sx * r, -Math.sqrt(Math.max(0, r * r - (sx * r) ** 2)) * 0.9);
          ctx.quadraticCurveTo(sx * r * 1.3, 0, sx * r, Math.sqrt(Math.max(0, r * r - (sx * r) ** 2)) * 0.9);
          ctx.stroke();
        });
        break;
      }
    }
  }

  function drawFruitFace(ctx, fruitData, r, impactIntensity, time, isFever) {
    const eyeOffset = r * 0.32;
    const eyeY = -r * 0.05;
    const eyeSize = Math.max(2, r * 0.09);

    const blinkCycle = (time + fruitData.id * 800) % 3500;
    const isBlinking = blinkCycle < 140;

    // 볼터치
    ctx.fillStyle = isFever ? 'rgba(255, 50, 80, 0.6)' : 'rgba(255, 80, 100, 0.42)';
    ctx.beginPath();
    ctx.arc(-eyeOffset * 1.1, eyeY + r * 0.18, r * 0.14, 0, Math.PI * 2);
    ctx.arc(eyeOffset * 1.1, eyeY + r * 0.18, r * 0.14, 0, Math.PI * 2);
    ctx.fill();

    if (impactIntensity > 0.5) {
      // 충돌 시 놀라는 표정 (> <)
      ctx.strokeStyle = '#222';
      ctx.lineWidth = Math.max(2, r * 0.06);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-eyeOffset - eyeSize, eyeY - eyeSize);
      ctx.lineTo(-eyeOffset + eyeSize * 0.5, eyeY);
      ctx.lineTo(-eyeOffset - eyeSize, eyeY + eyeSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(eyeOffset + eyeSize, eyeY - eyeSize);
      ctx.lineTo(eyeOffset - eyeSize * 0.5, eyeY);
      ctx.lineTo(eyeOffset + eyeSize, eyeY + eyeSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, eyeY + r * 0.22, r * 0.14, 0, Math.PI * 2);
      ctx.fillStyle = '#222';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, eyeY + r * 0.26, r * 0.08, 0, Math.PI);
      ctx.fillStyle = '#FF5252';
      ctx.fill();
    } else if (isFever) {
      // 피버 모드 신나는 표정 (^ ▽ ^)
      ctx.strokeStyle = '#222';
      ctx.lineWidth = Math.max(2, r * 0.06);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(-eyeOffset, eyeY - eyeSize * 0.4, eyeSize * 0.9, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(eyeOffset, eyeY - eyeSize * 0.4, eyeSize * 0.9, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, eyeY + r * 0.14, r * 0.16, 0, Math.PI);
      ctx.fillStyle = '#FF4757';
      ctx.fill();
      ctx.stroke();
    } else if (isBlinking) {
      // 눈 감은 표정 (u u)
      ctx.strokeStyle = '#222';
      ctx.lineWidth = Math.max(2, r * 0.05);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(-eyeOffset, eyeY, eyeSize, 0.2, Math.PI - 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(eyeOffset, eyeY, eyeSize, 0.2, Math.PI - 0.2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, eyeY + r * 0.14, r * 0.1, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else {
      // 평상시 초롱초롱 눈망울
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(-eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
      ctx.arc(eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(-eyeOffset - eyeSize * 0.3, eyeY - eyeSize * 0.3, eyeSize * 0.45, 0, Math.PI * 2);
      ctx.arc(eyeOffset - eyeSize * 0.3, eyeY - eyeSize * 0.3, eyeSize * 0.45, 0, Math.PI * 2);
      ctx.arc(-eyeOffset + eyeSize * 0.35, eyeY + eyeSize * 0.35, eyeSize * 0.2, 0, Math.PI * 2);
      ctx.arc(eyeOffset + eyeSize * 0.35, eyeY + eyeSize * 0.35, eyeSize * 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, eyeY + r * 0.16, r * 0.12, 0.1, Math.PI - 0.1);
      ctx.strokeStyle = '#222';
      ctx.lineWidth = Math.max(1.8, r * 0.045);
      ctx.lineCap = 'round';
      ctx.stroke();

      if (fruitData.id >= 4) {
        ctx.beginPath();
        ctx.arc(0, eyeY + r * 0.16, r * 0.11, 0, Math.PI);
        ctx.fillStyle = '#FF5252';
        ctx.fill();
      }
    }
  }

  function drawFruitTop(ctx, fruitData, r) {
    if (fruitData.id === 0) {
      ctx.strokeStyle = '#5D4037';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(r * 0.4, -r * 1.5, r * 0.7, -r * 1.7);
      ctx.stroke();
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.ellipse(r * 0.7, -r * 1.7, 5, 8, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (fruitData.details === 'persimmon') {
      ctx.fillStyle = '#33691E';
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.translate(0, -r * 0.9);
        ctx.rotate((i * Math.PI) / 2 + Math.PI / 4);
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.15, r * 0.1, r * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#3E2723';
      ctx.fillRect(-r * 0.05, -r * 1.08, r * 0.1, r * 0.18);
    } else if (fruitData.details === 'pineapple') {
      ctx.fillStyle = '#10AC84';
      for (let i = -2; i <= 2; i++) {
        ctx.save();
        ctx.translate(i * r * 0.15, -r * 0.95);
        ctx.rotate((i * Math.PI) / 8);
        ctx.beginPath();
        ctx.moveTo(-r * 0.08, 0);
        ctx.quadraticCurveTo(0, -r * 0.4, 0, -r * 0.45);
        ctx.quadraticCurveTo(0, -r * 0.4, r * 0.08, 0);
        ctx.fill();
        ctx.restore();
      }
    } else if (fruitData.leafColor) {
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(-r * 0.05, -r * 1.1, r * 0.1, r * 0.18);
      ctx.fillStyle = fruitData.leafColor;
      ctx.beginPath();
      ctx.ellipse(r * 0.16, -r * 1.05, r * 0.16, r * 0.09, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --------------------------------------------------------------------------
  // 5. 메인 게임 클래스 (FruitMergeGame)
  // --------------------------------------------------------------------------
  const { Engine, World, Bodies, Body, Events } = window.Matter;

  class FruitMergeGame {
    constructor() {
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');

      this.width = 434;
      this.height = 640;
      this.canvas.width = this.width;
      this.canvas.height = this.height;

      // 점수 및 LocalStorage
      this.score = 0;
      this.highScore = parseInt(localStorage.getItem('suika_fruit_highscore') || '0', 10);
      this.isNewBestAchieved = false;

      // 1.5초 콤보 시스템
      this.combo = 0;
      this.comboTimer = null;

      // 피버 모드 (5초 지속 & 과일 폭탄)
      this.feverGauge = 0;
      this.isFeverMode = false;
      this.feverDuration = 5000;
      this.feverEndTime = 0;

      this.isGameOver = false;
      this.isPaused = false;
      this.discoveredFruits = new Set([0]);

      // NEXT 2단계 드롭 큐 (NEXT 1 & NEXT 2)
      this.currentFruitLevel = this.getRandomDropLevel();
      this.nextFruitLevel1 = this.getRandomDropLevel();
      this.nextFruitLevel2 = this.getRandomDropLevel();

      this.dropperX = this.width / 2;
      this.targetDropperX = this.width / 2;
      this.dropperY = 65;
      this.canDrop = true;
      this.dropCooldown = 520;

      // 상단 위험선
      this.dangerLineY = 125;
      this.dangerTimer = 0;
      this.dangerDuration = 3.0;
      this.isDangerActive = false;

      // 상자 흔들기 (15초 쿨타임 / 게임당 3회 제한)
      this.maxShakes = 3;
      this.remainingShakes = 3;
      this.shakeCooldownUntil = 0;
      this.shakeCooldownDuration = 15000;
      this.shakeTimerInterval = null;
      this.shakeIntensity = 0;

      this.particles = new ParticleSystem();
      this.activeFruits = [];

      this.initPhysics();
      this.initUI();
      this.initEvents();

      this.lastTime = performance.now();
      this.animate = this.animate.bind(this);
      requestAnimationFrame(this.animate);
    }

    initPhysics() {
      this.engine = Engine.create({
        gravity: { x: 0, y: 1.4, scale: 0.001 }
      });
      this.world = this.engine.world;

      const wallThickness = 60;
      const wallOptions = { isStatic: true, friction: 0.28, restitution: 0.15 };

      this.ground = Bodies.rectangle(this.width / 2, this.height + wallThickness / 2 - 10, this.width + 100, wallThickness, wallOptions);
      this.leftWall = Bodies.rectangle(-wallThickness / 2 + 10, this.height / 2, wallThickness, this.height * 2, wallOptions);
      this.rightWall = Bodies.rectangle(this.width + wallThickness / 2 - 10, this.height / 2, wallThickness, this.height * 2, wallOptions);

      const cornerLeft = Bodies.rectangle(18, this.height - 10, 36, 36, { isStatic: true, angle: Math.PI / 4, render: { visible: false } });
      const cornerRight = Bodies.rectangle(this.width - 18, this.height - 10, 36, 36, { isStatic: true, angle: -Math.PI / 4, render: { visible: false } });

      World.add(this.world, [this.ground, this.leftWall, this.rightWall, cornerLeft, cornerRight]);

      Events.on(this.engine, 'collisionStart', (event) => this.handleCollision(event));
    }

    getRandomDropLevel() {
      const rand = Math.random();
      if (rand < 0.40) return 0; // 체리
      if (rand < 0.75) return 1; // 딸기
      if (rand < 0.95) return 2; // 포도
      return 3; // 귤
    }

    handleCollision(event) {
      if (this.isGameOver) return;
      const pairs = event.pairs;

      for (let i = 0; i < pairs.length; i++) {
        const { bodyA, bodyB } = pairs[i];

        if (bodyA.isStatic || bodyB.isStatic) {
          const dynamicBody = bodyA.isStatic ? bodyB : bodyA;
          if (dynamicBody.speed > 1.8) {
            soundFX.playBounce(dynamicBody.speed * 0.1);
          }
          continue;
        }

        const fruitA = bodyA.customFruit;
        const fruitB = bodyB.customFruit;
        if (!fruitA || !fruitB) continue;

        const relativeSpeed = Math.hypot(bodyA.velocity.x - bodyB.velocity.x, bodyA.velocity.y - bodyB.velocity.y);
        if (relativeSpeed > 3.0) {
          fruitA.impact = 1.0;
          fruitB.impact = 1.0;
          soundFX.playBounce(relativeSpeed * 0.14);
        }

        if (fruitA.fruitId === fruitB.fruitId && !fruitA.isMerging && !fruitB.isMerging) {
          const nextId = fruitA.fruitId + 1;
          if (nextId >= FRUITS.length) continue;

          fruitA.isMerging = true;
          fruitB.isMerging = true;

          const midX = (bodyA.position.x + bodyB.position.x) / 2;
          const midY = (bodyA.position.y + bodyB.position.y) / 2;

          this.mergeFruits(bodyA, bodyB, nextId, midX, midY);
        }
      }
    }

    mergeFruits(bodyA, bodyB, nextId, x, y) {
      const nextFruitData = FRUITS[nextId];

      bodyA.collisionFilter.mask = 0;
      bodyB.collisionFilter.mask = 0;

      setTimeout(() => {
        World.remove(this.world, bodyA);
        World.remove(this.world, bodyB);
        this.activeFruits = this.activeFruits.filter(f => f.body !== bodyA && f.body !== bodyB);
      }, 15);

      // 1.5초 콤보 시스템
      this.combo++;
      clearTimeout(this.comboTimer);
      this.comboTimer = setTimeout(() => {
        this.combo = 0;
        this.updateComboUI();
      }, 1500);

      const comboMultiplier = this.combo > 1 ? this.combo : 1;
      const feverMultiplier = this.isFeverMode ? 3 : 1;
      const totalMultiplier = comboMultiplier * feverMultiplier;
      const addedScore = nextFruitData.score * totalMultiplier;

      this.addScore(addedScore);

      if (!this.isFeverMode) {
        const gaugeGain = 18 + nextId * 3;
        this.addFeverGauge(gaugeGain);
      }

      // 복숭아(7) 이상 상위 과일 완성 시 축하 폭죽 발사!
      if (nextId >= 7) {
        soundFX.playFireworks();
        this.particles.createConfettiFireworks(this.width, this.height);
      }

      if (!this.discoveredFruits.has(nextId)) {
        this.discoveredFruits.add(nextId);
        this.updateEvolutionLadderUI();
      }

      soundFX.playMerge(nextId);
      if (this.combo > 1) soundFX.playCombo(this.combo);

      if (nextId === 10) {
        soundFX.playWatermelon();
        this.showCelebrationModal('🍉 전설의 거대 수박 완성!', '축하합니다! 11단계 과일 진화의 정점인 거대 수박을 완성했습니다!! 🎉');
      }

      // 과즙 파티클 & 플로팅 텍스트
      const isMajor = nextId >= 4;
      this.particles.createMergeBurst(x, y, nextFruitData, isMajor);

      let popupText = `+${addedScore}`;
      if (this.isFeverMode && this.combo > 1) {
        popupText = `+${addedScore} (FEVER x${this.combo}!)`;
      } else if (this.combo > 1) {
        popupText = `+${addedScore} (COMBO x${this.combo}!)`;
      } else if (this.isFeverMode) {
        popupText = `+${addedScore} (FEVER 3x!)`;
      }

      this.particles.createFloatingText(
        x,
        y - 20,
        popupText,
        this.isFeverMode ? '#FFD700' : (this.combo > 2 ? '#FF3838' : (isMajor ? '#FFA502' : '#FFD700')),
        isMajor ? 26 : 22,
        this.combo > 1 || this.isFeverMode
      );

      const newFruitBody = this.createFruitBody(x, y, nextId);
      Body.setVelocity(newFruitBody, {
        x: (Math.random() - 0.5) * 2.2,
        y: -2.8
      });

      World.add(this.world, newFruitBody);
      this.activeFruits.push({
        body: newFruitBody,
        fruitData: nextFruitData,
        squashX: 1.28,
        squashY: 0.72,
        impact: 0.85,
        spawnTime: performance.now()
      });

      this.updateComboUI();
    }

    createFruitBody(x, y, fruitId) {
      const fruitData = FRUITS[fruitId];
      const r = fruitData.radius;
      const body = Bodies.circle(x, y, r, {
        restitution: 0.22,
        friction: 0.28,
        density: 0.0016 + fruitId * 0.0003,
        frictionAir: 0.012
      });

      body.customFruit = {
        fruitId,
        isMerging: false,
        impact: 0
      };
      return body;
    }

    dropFruit() {
      if (!this.canDrop || this.isGameOver || this.isPaused) return;
      this.canDrop = false;
      soundFX.playDrop();

      const currentLevel = this.currentFruitLevel;
      const currentFruitData = FRUITS[currentLevel];
      const dropX = Math.max(
        currentFruitData.radius + 14,
        Math.min(this.width - currentFruitData.radius - 14, this.dropperX)
      );

      const fruitBody = this.createFruitBody(dropX, this.dropperY, currentLevel);
      World.add(this.world, fruitBody);

      this.activeFruits.push({
        body: fruitBody,
        fruitData: currentFruitData,
        squashX: 0.85,
        squashY: 1.15,
        impact: 0,
        spawnTime: performance.now()
      });

      // 피버 모드일 때 과일 폭탄 충격파 효과
      if (this.isFeverMode) {
        soundFX.playFireworks();
        this.triggerFeverBombEffect(dropX, this.dropperY);
      }

      // NEXT 2단계 큐 전진
      this.currentFruitLevel = this.nextFruitLevel1;
      this.nextFruitLevel1 = this.nextFruitLevel2;
      this.nextFruitLevel2 = this.getRandomDropLevel();
      this.updateNextFruitUI();

      setTimeout(() => {
        if (!this.isGameOver) this.canDrop = true;
      }, this.dropCooldown);
    }

    triggerFeverBombEffect(x, y) {
      this.particles.createMergeBurst(x, y + 40, FRUITS[10], true);
      this.activeFruits.forEach(f => {
        const dx = f.body.position.x - x;
        const dy = f.body.position.y - y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 260) {
          const force = (1 - dist / 260) * 0.04 * f.body.mass;
          Body.applyForce(f.body, f.body.position, {
            x: (dx / dist) * force,
            y: (dy / dist) * force - 0.02 * f.body.mass
          });
        }
      });
    }

    addFeverGauge(amount) {
      if (this.isFeverMode) return;
      this.feverGauge = Math.min(100, this.feverGauge + amount);
      this.updateFeverUI();

      if (this.feverGauge >= 100) {
        this.activateFeverMode();
      }
    }

    activateFeverMode() {
      this.isFeverMode = true;
      this.feverEndTime = performance.now() + this.feverDuration;
      soundFX.playFeverStart();
      this.particles.createConfettiFireworks(this.width, this.height);

      const banner = document.getElementById('feverBanner');
      if (banner) banner.classList.add('active');
    }

    deactivateFeverMode() {
      this.isFeverMode = false;
      this.feverGauge = 0;
      this.updateFeverUI();

      const banner = document.getElementById('feverBanner');
      if (banner) banner.classList.remove('active');
    }

    updateFeverUI() {
      const fill = document.getElementById('feverBarFill');
      const text = document.getElementById('feverStatusText');
      if (!fill || !text) return;

      if (this.isFeverMode) {
        const timeLeft = Math.max(0, (this.feverEndTime - performance.now()) / 1000).toFixed(1);
        const percent = ((this.feverEndTime - performance.now()) / this.feverDuration) * 100;
        fill.style.width = `${percent}%`;
        fill.style.background = 'linear-gradient(90deg, #E74C3C 0%, #F1C40F 100%)';
        text.innerText = `🔥 피버 지속 중! (${timeLeft}s)`;
        text.style.color = '#E74C3C';
      } else {
        fill.style.width = `${this.feverGauge}%`;
        fill.style.background = 'linear-gradient(90deg, #F39C12 0%, #E74C3C 50%, #F1C40F 100%)';
        text.innerText = `${Math.round(this.feverGauge)}%`;
        text.style.color = '#D35400';
      }
    }

    calculateLandingPosition() {
      const curFruitData = FRUITS[this.currentFruitLevel];
      const r = curFruitData.radius;
      const dropX = Math.max(r + 14, Math.min(this.width - r - 14, this.dropperX));

      let landingY = this.height - 10 - r;
      let isMergeChance = false;
      let targetFruit = null;

      for (let i = 0; i < this.activeFruits.length; i++) {
        const f = this.activeFruits[i];
        const fx = f.body.position.x;
        const fy = f.body.position.y;
        const fr = f.fruitData.radius;

        const dx = Math.abs(fx - dropX);
        const distReq = r + fr;

        if (dx < distReq) {
          const dy = Math.sqrt(Math.max(0, distReq * distReq - dx * dx));
          const contactY = fy - dy;
          if (contactY >= this.dropperY + r && contactY < landingY) {
            landingY = contactY;
            targetFruit = f;
          }
        }
      }

      if (targetFruit && targetFruit.fruitData.id === this.currentFruitLevel) {
        isMergeChance = true;
      }

      return { dropX, landingY, isMergeChance };
    }

    addScore(pts) {
      this.score += pts;
      if (this.score > this.highScore) {
        const isFirstRecord = !this.isNewBestAchieved && this.highScore > 0;
        this.highScore = this.score;
        this.isNewBestAchieved = true;
        localStorage.setItem('suika_fruit_highscore', this.highScore.toString());

        const newBestBadge = document.getElementById('newBestBadge');
        if (newBestBadge) newBestBadge.style.display = 'inline-block';

        if (isFirstRecord) {
          soundFX.playFireworks();
          this.particles.createConfettiFireworks(this.width, this.height);
          this.particles.createFloatingText(this.width / 2, 220, '🎉 신기록 경신!', '#FFD700', 32, true);
        }
      }
      this.updateScoreUI();
    }

    updateScoreUI() {
      const scoreElem = document.getElementById('currentScore');
      const highElem = document.getElementById('highScore');
      if (scoreElem) scoreElem.innerText = this.score.toLocaleString();
      if (highElem) highElem.innerText = this.highScore.toLocaleString();
    }

    updateComboUI() {
      const comboBadge = document.getElementById('comboBadge');
      if (!comboBadge) return;
      if (this.combo > 1) {
        comboBadge.innerText = `🔥 COMBO x${this.combo}! (${this.combo}배)`;
        comboBadge.classList.add('active');
      } else {
        comboBadge.classList.remove('active');
      }
    }

    updateNextFruitUI() {
      const now = performance.now();

      // NEXT 1
      const nextCanvas1 = document.getElementById('nextFruitCanvas1');
      if (nextCanvas1) {
        const ctx1 = nextCanvas1.getContext('2d');
        ctx1.clearRect(0, 0, nextCanvas1.width, nextCanvas1.height);
        const fruit1 = FRUITS[this.nextFruitLevel1];
        const scale1 = Math.min(0.9, 20 / fruit1.radius);
        ctx1.save();
        ctx1.translate(nextCanvas1.width / 2, nextCanvas1.height / 2);
        ctx1.scale(scale1, scale1);
        drawFruit(ctx1, fruit1, 0, 0, 0, 1, 1, 0, now, false);
        ctx1.restore();

        const name1 = document.getElementById('nextFruitName1');
        if (name1) name1.innerText = fruit1.name;
      }

      // NEXT 2
      const nextCanvas2 = document.getElementById('nextFruitCanvas2');
      if (nextCanvas2) {
        const ctx2 = nextCanvas2.getContext('2d');
        ctx2.clearRect(0, 0, nextCanvas2.width, nextCanvas2.height);
        const fruit2 = FRUITS[this.nextFruitLevel2];
        const scale2 = Math.min(0.85, 15 / fruit2.radius);
        ctx2.save();
        ctx2.translate(nextCanvas2.width / 2, nextCanvas2.height / 2);
        ctx2.scale(scale2, scale2);
        drawFruit(ctx2, fruit2, 0, 0, 0, 1, 1, 0, now, false);
        ctx2.restore();

        const name2 = document.getElementById('nextFruitName2');
        if (name2) name2.innerText = fruit2.name;
      }
    }

    updateEvolutionLadderUI() {
      const ladderContainer = document.getElementById('evolutionLadder');
      if (!ladderContainer) return;
      ladderContainer.innerHTML = '';
      FRUITS.forEach((fruit, idx) => {
        const isDiscovered = this.discoveredFruits.has(idx);
        const item = document.createElement('div');
        item.className = `evo-card ${isDiscovered ? 'discovered' : 'locked'}`;
        item.innerHTML = `
          <div class="evo-badge-circle" style="background: ${fruit.color}">
            ${idx + 1}
          </div>
          <div class="evo-card-info">
            <span class="evo-card-name">${fruit.name}</span>
            <span class="evo-card-pts">+${fruit.score}점</span>
          </div>
        `;
        ladderContainer.appendChild(item);
      });
    }

    triggerShake() {
      const now = performance.now();
      if (this.remainingShakes <= 0 || now < this.shakeCooldownUntil || this.isGameOver || this.isPaused) {
        return;
      }

      this.remainingShakes--;
      this.shakeCooldownUntil = now + this.shakeCooldownDuration;
      this.shakeIntensity = 20;
      soundFX.playShake();

      this.activeFruits.forEach(f => {
        Body.applyForce(f.body, f.body.position, {
          x: (Math.random() - 0.5) * 0.045 * f.body.mass,
          y: -0.024 * f.body.mass
        });
        Body.setAngularVelocity(f.body, (Math.random() - 0.5) * 0.22);
      });

      this.updateShakeBtnUI();

      if (this.shakeTimerInterval) clearInterval(this.shakeTimerInterval);
      this.shakeTimerInterval = setInterval(() => {
        const currentNow = performance.now();
        if (currentNow >= this.shakeCooldownUntil) {
          clearInterval(this.shakeTimerInterval);
          this.shakeTimerInterval = null;
        }
        this.updateShakeBtnUI();
      }, 250);
    }

    updateShakeBtnUI() {
      const shakeBtn = document.getElementById('shakeBtn');
      if (!shakeBtn) return;
      const now = performance.now();
      const isCoolingDown = now < this.shakeCooldownUntil;

      if (this.remainingShakes <= 0) {
        shakeBtn.className = 'crate-shake-btn shake-exhausted';
        shakeBtn.disabled = true;
        shakeBtn.innerHTML = `❌ 상자 흔들기 (0/3 소진)`;
      } else if (isCoolingDown) {
        const secondsLeft = Math.ceil((this.shakeCooldownUntil - now) / 1000);
        shakeBtn.className = 'crate-shake-btn shake-cooldown';
        shakeBtn.disabled = true;
        shakeBtn.innerHTML = `⏳ 쿨타임 (${secondsLeft}s) [${this.remainingShakes}/3]`;
      } else {
        shakeBtn.className = 'crate-shake-btn shake-ready';
        shakeBtn.disabled = false;
        shakeBtn.innerHTML = `📳 상자 흔들기 (${this.remainingShakes}/3회) [S]`;
      }
    }

    checkDangerAndGameOver(deltaTime) {
      if (this.isGameOver) return;
      const now = performance.now();
      let hasOverflow = false;

      for (let i = 0; i < this.activeFruits.length; i++) {
        const f = this.activeFruits[i];
        if (now - f.spawnTime > 1500) {
          const topY = f.body.position.y - f.fruitData.radius;
          if (topY < this.dangerLineY) {
            hasOverflow = true;
            break;
          }
        }
      }

      const warningBanner = document.getElementById('dangerWarning');

      if (hasOverflow) {
        this.dangerTimer += deltaTime;
        this.isDangerActive = true;
        const remaining = Math.max(0, this.dangerDuration - this.dangerTimer).toFixed(1);

        if (warningBanner) {
          warningBanner.classList.add('visible');
          warningBanner.innerText = `⚠️ 위험! 과일이 넘칩니다! (${remaining}s)`;
        }

        if (this.dangerTimer >= this.dangerDuration) {
          this.triggerGameOver();
        }
      } else {
        this.dangerTimer = Math.max(0, this.dangerTimer - deltaTime * 1.5);
        if (this.dangerTimer <= 0) {
          this.isDangerActive = false;
          if (warningBanner) warningBanner.classList.remove('visible');
        }
      }
    }

    triggerGameOver() {
      this.isGameOver = true;
      soundFX.playGameOver();

      const modal = document.getElementById('gameOverModal');
      const finalScore = document.getElementById('finalScoreVal');
      const modalBest = document.getElementById('modalNewBest');
      if (finalScore) finalScore.innerText = this.score.toLocaleString();
      if (modalBest) modalBest.style.display = this.isNewBestAchieved ? 'block' : 'none';
      if (modal) modal.classList.add('active');
    }

    showCelebrationModal(title, msg) {
      const modal = document.getElementById('celebrationModal');
      const titleElem = document.getElementById('celebTitle');
      const msgElem = document.getElementById('celebMsg');
      if (titleElem) titleElem.innerText = title;
      if (msgElem) msgElem.innerText = msg;
      if (modal) modal.classList.add('active');
    }

    restart() {
      this.activeFruits.forEach(f => World.remove(this.world, f.body));
      this.activeFruits = [];
      this.particles.clear();

      this.score = 0;
      this.combo = 0;
      this.feverGauge = 0;
      this.isFeverMode = false;
      this.isGameOver = false;
      this.dangerTimer = 0;
      this.isDangerActive = false;
      this.canDrop = true;
      this.isNewBestAchieved = false;

      this.remainingShakes = 3;
      this.shakeCooldownUntil = 0;
      if (this.shakeTimerInterval) {
        clearInterval(this.shakeTimerInterval);
        this.shakeTimerInterval = null;
      }
      this.updateShakeBtnUI();

      this.currentFruitLevel = this.getRandomDropLevel();
      this.nextFruitLevel1 = this.getRandomDropLevel();
      this.nextFruitLevel2 = this.getRandomDropLevel();

      this.updateScoreUI();
      this.updateComboUI();
      this.updateFeverUI();
      this.updateNextFruitUI();

      const newBestBadge = document.getElementById('newBestBadge');
      if (newBestBadge) newBestBadge.style.display = 'none';

      const dangerBanner = document.getElementById('dangerWarning');
      if (dangerBanner) dangerBanner.classList.remove('visible');

      const gameOverModal = document.getElementById('gameOverModal');
      if (gameOverModal) gameOverModal.classList.remove('active');

      const celebModal = document.getElementById('celebrationModal');
      if (celebModal) celebModal.classList.remove('active');

      const feverBanner = document.getElementById('feverBanner');
      if (feverBanner) feverBanner.classList.remove('active');
    }

    initEvents() {
      const handleMove = (clientX) => {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.width / rect.width;
        const curFruitData = FRUITS[this.currentFruitLevel];
        const minX = curFruitData.radius + 14;
        const maxX = this.width - curFruitData.radius - 14;
        let x = (clientX - rect.left) * scaleX;
        this.targetDropperX = Math.max(minX, Math.min(maxX, x));
      };

      this.canvas.addEventListener('mousemove', (e) => handleMove(e.clientX));
      window.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
          handleMove(e.clientX);
        }
      });

      this.canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) handleMove(e.touches[0].clientX);
      }, { passive: true });

      this.canvas.addEventListener('mousedown', () => this.dropFruit());
      this.canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.dropFruit();
      });

      window.addEventListener('keydown', (e) => {
        const step = 20;
        const curFruitData = FRUITS[this.currentFruitLevel];
        const minX = curFruitData.radius + 14;
        const maxX = this.width - curFruitData.radius - 14;

        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
          this.targetDropperX = Math.max(minX, this.targetDropperX - step);
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
          this.targetDropperX = Math.min(maxX, this.targetDropperX + step);
        } else if (e.code === 'Space' || e.code === 'ArrowDown') {
          e.preventDefault();
          if (this.isGameOver) {
            this.restart();
          } else {
            this.dropFruit();
          }
        } else if (e.code === 'KeyS') {
          this.triggerShake();
        } else if (e.code === 'KeyR') {
          this.restart();
        }
      });
    }

    initUI() {
      this.updateScoreUI();
      this.updateNextFruitUI();
      this.updateEvolutionLadderUI();
      this.updateShakeBtnUI();
      this.updateFeverUI();

      document.getElementById('restartBtn')?.addEventListener('click', () => {
        soundFX.playClick();
        this.restart();
      });

      document.getElementById('modalRestartBtn')?.addEventListener('click', () => {
        soundFX.playClick();
        this.restart();
      });

      document.getElementById('celebContinueBtn')?.addEventListener('click', () => {
        soundFX.playClick();
        document.getElementById('celebrationModal')?.classList.remove('active');
      });

      document.getElementById('shakeBtn')?.addEventListener('click', () => {
        this.triggerShake();
      });

      const soundBtn = document.getElementById('soundToggleBtn');
      soundBtn?.addEventListener('click', () => {
        const isMuted = soundFX.toggleMute();
        soundBtn.innerText = isMuted ? '🔇 음소거' : '🔊 사운드 ON';
      });
    }

    animate(time) {
      requestAnimationFrame(this.animate);

      const deltaTime = Math.min(0.05, (time - this.lastTime) / 1000);
      this.lastTime = time;

      if (!this.isPaused && !this.isGameOver) {
        Engine.update(this.engine, deltaTime * 1000);
        this.checkDangerAndGameOver(deltaTime);

        if (this.isFeverMode) {
          this.updateFeverUI();
          if (time >= this.feverEndTime) {
            this.deactivateFeverMode();
          }
        }
      }

      this.dropperX += (this.targetDropperX - this.dropperX) * 0.28;

      if (this.shakeIntensity > 0) {
        this.shakeIntensity *= 0.88;
        if (this.shakeIntensity < 0.1) this.shakeIntensity = 0;
      }

      this.ctx.save();
      this.ctx.clearRect(0, 0, this.width, this.height);

      if (this.shakeIntensity > 0) {
        const sx = (Math.random() - 0.5) * this.shakeIntensity;
        const sy = (Math.random() - 0.5) * this.shakeIntensity;
        this.ctx.translate(sx, sy);
      }

      // 상자 내부 원목 널빤지 배경 렌더링
      this.drawCrateInteriorBackground();
      this.drawDangerLine(time);
      this.drawActiveFruits(time);

      this.particles.update();
      this.particles.draw(this.ctx);

      if (!this.isGameOver) {
        this.drawDropperAndGuide(time);
      }

      this.ctx.restore();
    }

    // 상자 내부 원목 널빤지(Vertical Timber Slats) 렌더링
    drawCrateInteriorBackground() {
      this.ctx.save();
      // 원목 베이스 그라데이션
      const bgGrad = this.ctx.createLinearGradient(0, 0, 0, this.height);
      bgGrad.addColorStop(0, '#5C3A21');
      bgGrad.addColorStop(0.5, '#4A2E19');
      bgGrad.addColorStop(1, '#331F10');
      this.ctx.fillStyle = bgGrad;
      this.ctx.fillRect(0, 0, this.width, this.height);

      // 세로 널빤지 이음선 및 결 표현
      const slatWidth = this.width / 5;
      this.ctx.strokeStyle = 'rgba(20, 10, 5, 0.45)';
      this.ctx.lineWidth = 2;
      for (let i = 1; i < 5; i++) {
        const sx = i * slatWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(sx, 0);
        this.ctx.lineTo(sx, this.height);
        this.ctx.stroke();

        // 널빤지 못(Nails) 디테일
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.beginPath();
        this.ctx.arc(sx - slatWidth / 2, 25, 2.5, 0, Math.PI * 2);
        this.ctx.arc(sx - slatWidth / 2, this.height - 25, 2.5, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // 상자 내부 가장자리 앰비언트 오클루전 그림자
      const shadowGrad = this.ctx.createRadialGradient(
        this.width / 2, this.height / 2, this.width * 0.35,
        this.width / 2, this.height / 2, this.width * 0.75
      );
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
      this.ctx.fillStyle = shadowGrad;
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.restore();
    }

    drawDangerLine(time) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(10, this.dangerLineY);
      this.ctx.lineTo(this.width - 10, this.dangerLineY);

      if (this.isDangerActive) {
        const flash = Math.sin(time * 0.015) > 0;
        this.ctx.strokeStyle = flash ? '#FF3838' : 'rgba(255, 56, 56, 0.3)';
        this.ctx.lineWidth = 3.5;
        this.ctx.setLineDash([8, 6]);
      } else {
        this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([6, 6]);
      }

      this.ctx.stroke();
      this.ctx.setLineDash([]);
      this.ctx.restore();
    }

    drawActiveFruits(time) {
      for (let i = 0; i < this.activeFruits.length; i++) {
        const f = this.activeFruits[i];
        const { x, y } = f.body.position;
        const angle = f.body.angle;

        f.squashX += (1.0 - f.squashX) * 0.15;
        f.squashY += (1.0 - f.squashY) * 0.15;
        f.impact = Math.max(0, f.impact - 0.04);

        drawFruit(
          this.ctx,
          f.fruitData,
          x,
          y,
          angle,
          f.squashX,
          f.squashY,
          f.impact,
          time,
          this.isFeverMode
        );
      }
    }

    drawDropperAndGuide(time) {
      const curFruit = FRUITS[this.currentFruitLevel];
      const x = this.dropperX;
      const y = this.dropperY;

      const { dropX, landingY, isMergeChance } = this.calculateLandingPosition();

      // 점선 가이드라인
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(dropX, y + curFruit.radius + 4);
      this.ctx.lineTo(dropX, landingY - curFruit.radius);
      this.ctx.strokeStyle = isMergeChance ? 'rgba(255, 215, 0, 0.85)' : 'rgba(255, 255, 255, 0.4)';
      this.ctx.lineWidth = isMergeChance ? 2.5 : 1.8;
      this.ctx.setLineDash([6, 6]);
      this.ctx.stroke();
      this.ctx.restore();

      // 예상 착지 지점 고스트 과일
      drawGhostFruit(this.ctx, curFruit, dropX, landingY, isMergeChance, time);

      // 상단 대기 과일
      if (this.canDrop) {
        const bobbing = Math.sin(time * 0.005) * 3;
        drawFruit(this.ctx, curFruit, x, y + bobbing, 0, 1, 1, 0, time, this.isFeverMode);
      }

      // 상단 구름 드로퍼 캐릭터
      this.ctx.save();
      this.ctx.translate(x, y - 28);
      this.drawCuteCloud();
      this.ctx.restore();
    }

    drawCuteCloud() {
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.strokeStyle = '#D7CCC8';
      this.ctx.lineWidth = 2;

      this.ctx.beginPath();
      this.ctx.arc(0, 0, 16, 0, Math.PI * 2);
      this.ctx.arc(-14, 4, 12, 0, Math.PI * 2);
      this.ctx.arc(14, 4, 12, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#4E342E';
      this.ctx.beginPath();
      this.ctx.arc(-6, 2, 2, 0, Math.PI * 2);
      this.ctx.arc(6, 2, 2, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = 'rgba(255, 100, 120, 0.5)';
      this.ctx.beginPath();
      this.ctx.arc(-10, 5, 3, 0, Math.PI * 2);
      this.ctx.arc(10, 5, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.fruitGame = new FruitMergeGame();
  });

})();
