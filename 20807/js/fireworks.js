// fireworks.js - 청량한 주간 축제 하늘 파티클 & 비눗방울 배경 엔진

const FestivalEffects = {
  canvas: null,
  ctx: null,
  ambientLights: [],
  animationFrameId: null,
  isRunning: false,

  init() {
    this.canvas = document.getElementById("festivalCanvas");
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // 주간 하늘 비눗방울 & 햇살 파티클 초기화
    this.initDaytimeParticles();
    this.start();
  },

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  initDaytimeParticles() {
    this.ambientLights = [];
    const count = Math.min(30, Math.floor(window.innerWidth / 45));
    // 청량한 파스텔 톤 비눗방울 & 햇살 글리터 색상
    const colors = [
      "rgba(186, 230, 253, 0.45)",  // Sky Blue
      "rgba(254, 240, 138, 0.45)",  // Soft Sunlit Yellow
      "rgba(254, 205, 211, 0.45)",  // Blossom Pink
      "rgba(216, 180, 254, 0.45)",  // Lavender
      "rgba(187, 247, 208, 0.45)"   // Fresh Mint
    ];

    for (let i = 0; i < count; i++) {
      this.ambientLights.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 8 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 0.6 - 0.2, // 위로 살랑살랑 부유
        alpha: Math.random() * 0.5 + 0.3,
        pulse: Math.random() * Math.PI,
        pulseSpeed: Math.random() * 0.02 + 0.01
      });
    }
  },

  launchFireworks() {},
  launchConfetti() {},

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    const render = () => {
      if (!this.ctx || !this.canvas) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // 주간 비눗방울 & 햇살 파티클 렌더링
      this.ambientLights.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        if (p.y < -20) {
          p.y = window.innerHeight + 20;
          p.x = Math.random() * window.innerWidth;
        }
        if (p.x < -20) p.x = window.innerWidth + 20;
        if (p.x > window.innerWidth + 20) p.x = -20;

        const currentRadius = p.radius + Math.sin(p.pulse) * 1.5;
        const currentAlpha = Math.max(0.15, Math.min(0.65, p.alpha + Math.sin(p.pulse) * 0.15));

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, Math.max(1, currentRadius), 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = currentAlpha;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
        this.ctx.fill();

        // 비눗방울 광택 하이라이트 림
        this.ctx.beginPath();
        this.ctx.arc(p.x - currentRadius * 0.3, p.y - currentRadius * 0.3, currentRadius * 0.3, 0, Math.PI * 2);
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        this.ctx.fill();

        this.ctx.restore();
      });

      this.animationFrameId = requestAnimationFrame(render);
    };

    render();
  }
};

if (typeof window !== "undefined") {
  window.FestivalEffects = FestivalEffects;
}
