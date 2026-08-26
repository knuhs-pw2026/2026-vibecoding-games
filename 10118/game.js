/**
 * Corpse Dash - Geometry & Death (10 Stages Full Edition)
 * Core Game Engine & Physics
 */

// ==========================================
// 1. Web Audio API Sound Synthesizer (내장 음원)
// ==========================================
class SoundSynth {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmPlaying = false;
    this.bgmTimer = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
    return !this.muted;
  }

  playJump() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.1);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.1);
    } catch(e) {}
  }

  playDeath() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.28);
      
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.28);
    } catch(e) {}
  }

  playLand() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);
      
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.05);
    } catch(e) {}
  }

  playPad() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.22);
      
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.22);
    } catch(e) {}
  }

  playClear() {
    if (this.muted || !this.ctx) return;
    try {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const now = this.ctx.currentTime + (idx * 0.06);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.22);
      });
    } catch(e) {}
  }

  playSwitch() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.setValueAtTime(920, now + 0.06);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.12);
    } catch(e) {}
  }

  startBGM() {
    if (this.muted || this.bgmPlaying || !this.ctx) return;
    this.bgmPlaying = true;
    
    const bassline = [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83];
    let noteIdx = 0;
    
    this.bgmTimer = setInterval(() => {
      if (this.muted || !this.bgmPlaying) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassline[noteIdx % bassline.length], now);
        
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.18);
        noteIdx++;
      } catch(e) {}
    }, 180);
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

// ==========================================
// 2. Particle System (네온 파티클 이펙트)
// ==========================================
class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  addDeathBurst(x, y, color = '#00f3ff') {
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      const size = 3 + Math.random() * 6;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        color: Math.random() > 0.4 ? color : '#ff007f',
        alpha: 1,
        life: 0.8 + Math.random() * 0.4,
        maxLife: 1.2,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.3
      });
    }
  }

  addJumpDust(x, y) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + 2,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 1.5,
        size: 3 + Math.random() * 3,
        color: '#00f3ff',
        alpha: 0.8,
        life: 0.25,
        maxLife: 0.25,
        rotation: 0,
        vRot: 0
      });
    }
  }

  addPortalSparkle(x, y) {
    if (Math.random() > 0.35) return;
    const angle = Math.random() * Math.PI * 2;
    const dist = 10 + Math.random() * 20;
    this.particles.push({
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      vx: -Math.cos(angle) * 1.2,
      vy: -Math.sin(angle) * 1.2,
      size: 2 + Math.random() * 2,
      color: '#ffe600',
      alpha: 1,
      life: 0.4,
      maxLife: 0.4,
      rotation: 0,
      vRot: 0
    });
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 9.8 * 0.08;
      p.rotation += p.vRot;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }
    ctx.restore();
  }

  clear() {
    this.particles = [];
  }
}

// ==========================================
// 3. Level Designs (10개 스테이지 전체)
// ==========================================
const LEVELS = [
  // STAGE 1: 첫 번째 희생 (First Step)
  {
    name: "01. 첫 번째 희생 (First Step)",
    hint: "높은 2칸 벽 앞에 가시가 있습니다. 가시에 몸을 던져 시체 발판을 만들고 벽을 넘으세요!",
    maxCorpses: 2,
    spawn: { x: 3 * 30, y: 14 * 30 },
    goal: { x: 27 * 30, y: 14 * 30 },
    tiles: [
      ...createBorder(32, 18),
      ...createLineH(1, 30, 15, 1),
      { type: 2, x: 11, y: 14 },
      { type: 1, x: 12, y: 14 },
      { type: 1, x: 12, y: 13 },
    ]
  },

  // STAGE 2: 시체의 다리 (Corpse Bridge)
  {
    name: "02. 시체의 다리 (Corpse Bridge)",
    hint: "가시 웅덩이입니다! 차례대로 가시 위로 뛰어들어 2~3개의 시체로 안전한 다리를 만드세요.",
    maxCorpses: 3,
    spawn: { x: 3 * 30, y: 14 * 30 },
    goal: { x: 27 * 30, y: 14 * 30 },
    tiles: [
      ...createBorder(32, 18),
      ...createLineH(1, 9, 15, 1),
      ...createLineH(10, 12, 16, 1),
      { type: 2, x: 10, y: 15 },
      { type: 2, x: 11, y: 15 },
      { type: 2, x: 12, y: 15 },
      ...createLineH(13, 30, 15, 1),
    ]
  },

  // STAGE 3: 2층 테라스 (Sky Platform)
  {
    name: "03. 2층 테라스 (Sky Platform)",
    hint: "출구가 2층 높은 테라스에 있습니다. 가시에서 사망하여 발판을 만든 뒤 2층으로 뛰어오르세요.",
    maxCorpses: 2,
    spawn: { x: 3 * 30, y: 14 * 30 },
    goal: { x: 26 * 30, y: 10 * 30 },
    tiles: [
      ...createBorder(32, 18),
      ...createLineH(1, 30, 15, 1),
      { type: 2, x: 13, y: 14 },
      ...createLineH(17, 29, 11, 1),
      ...createLineV(17, 12, 14, 1),
    ]
  },

  // STAGE 4: 희생의 무게 (Weight of Death)
  {
    name: "04. 희생의 무게 (Weight of Death)",
    hint: "레이저 문이 길을 막고 있습니다! 스위치 위 가시에 뛰어들어 시체로 문을 영구 개방하세요.",
    maxCorpses: 2,
    spawn: { x: 3 * 30, y: 14 * 30 },
    goal: { x: 27 * 30, y: 14 * 30 },
    tiles: [
      ...createBorder(32, 18),
      ...createLineH(1, 30, 15, 1),
      { type: 7, x: 14, y: 14, targetDoor: 'door4' },
      { type: 2, x: 14, y: 14 },
      { type: 8, x: 20, y: 14, doorId: 'door4' },
      { type: 8, x: 20, y: 13, doorId: 'door4' },
      { type: 8, x: 20, y: 12, doorId: 'door4' },
      ...createLineV(20, 1, 11, 1),
    ]
  },

  // STAGE 5: 시체 2단 탑 쌓기 (Corpse Tower)
  {
    name: "05. 시체 2단 탑 (Corpse Tower)",
    hint: "벽이 너무 높습니다! 지상 가시와 공중 가시에 차례로 닿아 2단 시체 탑을 쌓아 올라가세요.",
    maxCorpses: 3,
    spawn: { x: 3 * 30, y: 14 * 30 },
    goal: { x: 26 * 30, y: 9 * 30 },
    tiles: [
      ...createBorder(32, 18),
      ...createLineH(1, 30, 15, 1),
      { type: 2, x: 12, y: 14 },
      { type: 2, x: 12, y: 12 },
      { type: 1, x: 12, y: 11 },
      ...createLineH(16, 29, 10, 1),
      ...createLineV(16, 11, 14, 1),
    ]
  },

  // STAGE 6: 점프 패드 도약 (Bounce & Sac)
  {
    name: "06. 점프 패드 도약 (Bounce & Sac)",
    hint: "점프 패드를 타고 튕겨 올라 공중 가시에서 사망하세요. 공중 시체 발판을 딛고 고지에 안착!",
    maxCorpses: 2,
    spawn: { x: 3 * 30, y: 14 * 30 },
    goal: { x: 26 * 30, y: 7 * 30 },
    tiles: [
      ...createBorder(32, 18),
      ...createLineH(1, 30, 15, 1),
      { type: 6, x: 8, y: 14 },
      { type: 2, x: 14, y: 10 },
      { type: 1, x: 14, y: 11 },
      ...createLineH(19, 29, 8, 1),
      ...createLineV(19, 9, 14, 1),
    ]
  },

  // STAGE 7: 이중 레이저 문 (Dual Gate)
  {
    name: "07. 이중 레이저 문 (Dual Gate)",
    hint: "2개의 문이 닫혀 있습니다. 1번 스위치 가시와 2번 스위치 가시에 각각 시체를 남겨 모두 여세요.",
    maxCorpses: 3,
    spawn: { x: 3 * 30, y: 14 * 30 },
    goal: { x: 28 * 30, y: 14 * 30 },
    tiles: [
      ...createBorder(32, 18),
      ...createLineH(1, 30, 15, 1),
      { type: 7, x: 8, y: 14, targetDoor: 'door7A' },
      { type: 2, x: 8, y: 14 },
      { type: 8, x: 15, y: 14, doorId: 'door7A' },
      { type: 8, x: 15, y: 13, doorId: 'door7A' },
      ...createLineV(15, 1, 12, 1),
      { type: 7, x: 19, y: 14, targetDoor: 'door7B' },
      { type: 2, x: 19, y: 14 },
      { type: 8, x: 23, y: 14, doorId: 'door7B' },
      { type: 8, x: 23, y: 13, doorId: 'door7B' },
      ...createLineV(23, 1, 12, 1),
    ]
  },

  // STAGE 8: 4연속 가시 계곡 (Spike Valley)
  {
    name: "08. 4연속 가시 계곡 (Spike Valley)",
    hint: "넓은 가시 계곡입니다. 3개의 시체를 적절히 투하하여 징검다리 발판을 놓아 돌파하세요.",
    maxCorpses: 4,
    spawn: { x: 3 * 30, y: 14 * 30 },
    goal: { x: 28 * 30, y: 14 * 30 },
    tiles: [
      ...createBorder(32, 18),
      ...createLineH(1, 8, 15, 1),
      ...createLineH(9, 13, 16, 1),
      { type: 2, x: 9, y: 15 },
      { type: 2, x: 10, y: 15 },
      { type: 2, x: 11, y: 15 },
      { type: 2, x: 12, y: 15 },
      { type: 2, x: 13, y: 15 },
      ...createLineH(14, 30, 15, 1),
    ]
  },

  // STAGE 9: 천장 가시 드롭 (Ceiling Drop)
  {
    name: "09. 천장 가시 드롭 (Ceiling Drop)",
    hint: "위쪽 길 천장 가시에 머리를 부딪히면 시체가 아래 가시밭으로 떨어져 안전한 길을 만듭니다!",
    maxCorpses: 3,
    spawn: { x: 3 * 30, y: 7 * 30 },
    goal: { x: 27 * 30, y: 14 * 30 },
    tiles: [
      ...createBorder(32, 18),
      ...createLineH(1, 9, 8, 1),
      { type: 1, x: 13, y: 5 },
      { type: 3, x: 13, y: 6 },
      { type: 1, x: 14, y: 5 },
      { type: 3, x: 14, y: 6 },
      ...createLineH(1, 11, 15, 1),
      { type: 2, x: 12, y: 14 },
      { type: 2, x: 13, y: 14 },
      { type: 2, x: 14, y: 14 },
      ...createLineH(15, 30, 15, 1),
    ]
  },

  // STAGE 10: 궁극의 마스터 챌린지 (The Grand Finale)
  {
    name: "10. 궁극의 탈출 (Grand Finale)",
    hint: "최종 마스터 퍼즐! 스위치 개방 ➜ 점프 패드 도약 ➜ 공중 시체 발판 ➜ 최종 포털에 도달하세요!",
    maxCorpses: 3,
    spawn: { x: 2 * 30, y: 14 * 30 },
    goal: { x: 28 * 30, y: 3 * 30 },
    tiles: [
      ...createBorder(32, 18),
      ...createLineH(1, 30, 15, 1),
      { type: 7, x: 6, y: 14, targetDoor: 'door10' },
      { type: 2, x: 6, y: 14 },
      { type: 8, x: 10, y: 14, doorId: 'door10' },
      { type: 8, x: 10, y: 13, doorId: 'door10' },
      ...createLineV(10, 1, 12, 1),
      { type: 6, x: 12, y: 14 },
      { type: 1, x: 17, y: 10 },
      { type: 2, x: 18, y: 9 },
      { type: 1, x: 18, y: 10 },
      ...createLineH(21, 23, 7, 1),
      { type: 6, x: 22, y: 6 },
      ...createLineH(26, 30, 4, 1),
    ]
  }
];

function createBorder(w, h) {
  const list = [];
  for (let x = 0; x < w; x++) {
    list.push({ type: 1, x, y: 0 });
    list.push({ type: 1, x, y: h - 1 });
  }
  for (let y = 1; y < h - 1; y++) {
    list.push({ type: 1, x: 0, y });
    list.push({ type: 1, x: w - 1, y });
  }
  return list;
}

function createLineH(x1, x2, y, type = 1) {
  const list = [];
  for (let x = x1; x <= x2; x++) {
    list.push({ type, x, y });
  }
  return list;
}

function createLineV(x, y1, y2, type = 1) {
  const list = [];
  for (let y = y1; y <= y2; y++) {
    list.push({ type, x, y });
  }
  return list;
}

// ==========================================
// 4. Corpse Object (가시에 닿은 위치 그대로 수평 고정)
// ==========================================
class Corpse {
  constructor(x, y) {
    // 가시에 닿은 바로 그 순간의 위치에 그대로 수평 고정
    this.x = x;
    this.y = y;
    this.w = 26;
    this.h = 26;
    this.isSettled = true; // 가시에 닿은 위치 그대로 즉시 고정
    this.color = '#52586b';
    this.borderColor = '#8892b0';
  }

  update(dt, tiles, otherCorpses) {
    // 가시에 닿은 그 자리에 물리적으로 단단히 고정된 플랫폼으로 유지됨
  }

  intersects(rect) {
    return (
      this.x < rect.x + rect.w &&
      this.x + this.w > rect.x &&
      this.y < rect.y + rect.h &&
      this.y + this.h > rect.y
    );
  }

  draw(ctx) {
    ctx.save();
    // 바닥과 완벽히 수평인 사각형 시체 발판
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(136, 146, 176, 0.5)';
    ctx.shadowBlur = 6;
    
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeRect(this.x, this.y, this.w, this.h);

    // Dead Eyes (X_X)
    ctx.fillStyle = '#ff0055';
    ctx.font = 'bold 9px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('X  X', this.x + this.w / 2, this.y + this.h / 2 + 3);

    ctx.restore();
  }
}

// ==========================================
// 5. Player Class (관성 없는 즉시 반응 조작)
// ==========================================
class Player {
  constructor(x, y) {
    this.spawnX = x;
    this.spawnY = y;
    this.x = x;
    this.y = y;
    this.w = 26;
    this.h = 26;
    this.vx = 0;
    this.vy = 0;
    
    // Physics: No Inertia, Tight Controls
    this.moveSpeed = 5.0;
    this.gravity = 0.90;
    this.jumpForce = -13.0;
    
    this.isGrounded = false;
    this.coyoteTime = 0;
    this.jumpBuffered = 0;
    this.trail = [];
    this.angle = 0;
  }

  reset(x, y) {
    this.x = x || this.spawnX;
    this.y = y || this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.isGrounded = false;
    this.coyoteTime = 0;
    this.jumpBuffered = 0;
    this.trail = [];
    this.angle = 0;
  }

  update(dt, input, game) {
    // 1. Instant horizontal movement (No Inertia)
    if (input.left) {
      this.vx = -this.moveSpeed;
    } else if (input.right) {
      this.vx = this.moveSpeed;
    } else {
      this.vx = 0;
    }

    // 2. Jump buffering & Coyote time
    if (this.isGrounded) {
      this.coyoteTime = 0.12;
    } else {
      this.coyoteTime -= dt;
    }

    if (input.jumpPressed) {
      this.jumpBuffered = 0.15;
    } else {
      this.jumpBuffered -= dt;
    }

    if (this.jumpBuffered > 0 && this.coyoteTime > 0) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
      this.coyoteTime = 0;
      this.jumpBuffered = 0;
      game.sound.playJump();
      game.particles.addJumpDust(this.x + this.w / 2, this.y + this.h);
    }

    if (!input.jump && this.vy < -4) {
      this.vy *= 0.65;
    }

    // 3. Gravity
    this.vy += this.gravity;
    if (this.vy > 15) this.vy = 15;

    // 4. Motion trail
    if (Math.abs(this.vx) > 0.5 || Math.abs(this.vy) > 0.5) {
      this.trail.unshift({ x: this.x, y: this.y, alpha: 0.5 });
      if (this.trail.length > 5) this.trail.pop();
    }

    // 5. Rotation in air
    if (!this.isGrounded) {
      this.angle += (this.vx >= 0 ? 1 : -1) * 0.12;
    } else {
      this.angle = 0;
    }

    // 6. X Collision Step
    this.x += this.vx;
    this.handleHorizontalCollisions(game);

    // 7. Y Collision Step
    this.isGrounded = false;
    this.y += this.vy;
    this.handleVerticalCollisions(game);

    // 8. Triggers (Spikes, JumpPad, Goal)
    this.handleTriggerCollisions(game);
  }

  handleHorizontalCollisions(game) {
    const solids = this.getSolidColliders(game);
    for (const b of solids) {
      if (this.intersects(b)) {
        if (this.vx > 0) {
          this.x = b.x - this.w;
          this.vx = 0;
        } else if (this.vx < 0) {
          this.x = b.x + b.w;
          this.vx = 0;
        }
      }
    }
  }

  handleVerticalCollisions(game) {
    const solids = this.getSolidColliders(game);
    for (const b of solids) {
      if (this.intersects(b)) {
        if (this.vy > 0) {
          this.y = b.y - this.h;
          this.vy = 0;
          if (!this.isGrounded) {
            game.sound.playLand();
          }
          this.isGrounded = true;
        } else if (this.vy < 0) {
          this.y = b.y + b.h;
          this.vy = 0;
        }
      }
    }
  }

  getSolidColliders(game) {
    const list = [];
    for (const tile of game.currentLevel.tiles) {
      if (tile.type === 1 || (tile.type === 8 && !tile.isOpen)) {
        list.push({ x: tile.x * 30, y: tile.y * 30, w: 30, h: 30 });
      }
    }
    for (const c of game.corpses) {
      list.push({ x: c.x, y: c.y, w: c.w, h: c.h });
    }
    return list;
  }

  handleTriggerCollisions(game) {
    for (const tile of game.currentLevel.tiles) {
      const tx = tile.x * 30;
      const ty = tile.y * 30;
      
      // Up Spike (Type 2)
      if (tile.type === 2) {
        const spikeHitbox = { x: tx + 6, y: ty + 4, w: 18, h: 24 };
        if (this.intersects(spikeHitbox)) {
          // If standing safely on top of a settled corpse, safe!
          const safelyStandingOnCorpse = game.corpses.some(c => {
            return Math.abs(c.x - this.x) < 20 && 
                   this.y + this.h <= c.y + 2 && 
                   this.isGrounded;
          });

          if (!safelyStandingOnCorpse) {
            game.killPlayer();
            return;
          }
        }
      }

      // Ceiling Spike (Type 3)
      if (tile.type === 3) {
        const spikeHitbox = { x: tx + 6, y: ty + 2, w: 18, h: 24 };
        if (this.intersects(spikeHitbox)) {
          game.killPlayer();
          return;
        }
      }

      // Jump Pad (Type 6)
      if (tile.type === 6) {
        const padHitbox = { x: tx + 2, y: ty + 16, w: 26, h: 14 };
        if (this.intersects(padHitbox)) {
          this.vy = -18.5;
          this.isGrounded = false;
          game.sound.playPad();
          game.particles.addJumpDust(tx + 15, ty + 15);
        }
      }

      // Goal Portal
      const goal = game.currentLevel.goal;
      const goalHitbox = { x: goal.x + 4, y: goal.y + 4, w: 22, h: 22 };
      if (this.intersects(goalHitbox)) {
        game.completeLevel();
        return;
      }
    }
  }

  intersects(rect) {
    return (
      this.x < rect.x + rect.w &&
      this.x + this.w > rect.x &&
      this.y < rect.y + rect.h &&
      this.y + this.h > rect.y
    );
  }

  draw(ctx) {
    ctx.save();
    for (const t of this.trail) {
      ctx.globalAlpha = t.alpha * 0.4;
      ctx.fillStyle = '#00f3ff';
      ctx.fillRect(t.x, t.y, this.w, this.h);
    }

    ctx.globalAlpha = 1.0;
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    ctx.rotate(this.angle);

    ctx.fillStyle = '#00f3ff';
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 14;
    ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);

    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.fillRect(-this.w / 4, -this.h / 4, this.w / 2, this.h / 2);

    ctx.fillStyle = '#000000';
    ctx.fillRect(-4, -5, 3, 5);
    ctx.fillRect(3, -5, 3, 5);

    ctx.restore();
  }
}

// ==========================================
// 6. Main Game Controller
// ==========================================
class CorpseDashGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.sound = new SoundSynth();
    this.particles = new ParticleSystem();
    this.player = new Player(0, 0);
    
    this.currentLevelIdx = 0;
    this.currentLevel = null;
    this.corpses = [];
    
    this.deaths = 0;
    this.stageDeaths = 0;
    this.totalDeaths = 0;
    this.startTime = Date.now();
    this.stageStartTime = Date.now();
    
    this.isPlaying = false;
    this.screenShake = 0;
    
    this.input = {
      left: false,
      right: false,
      jump: false,
      jumpPressed: false
    };

    this.initDOM();
    this.bindEvents();
    this.loadLevel(0);
  }

  initDOM() {
    this.dom = {
      startScreen: document.getElementById('start-screen'),
      clearScreen: document.getElementById('clear-screen'),
      allClearScreen: document.getElementById('all-clear-screen'),
      warnToast: document.getElementById('warn-toast'),
      btnPlay: document.getElementById('btn-play-game'),
      btnNext: document.getElementById('btn-next-level'),
      btnReplayAll: document.getElementById('btn-replay-all'),
      btnSound: document.getElementById('btn-sound'),
      btnRestart: document.getElementById('btn-restart'),
      stageText: document.getElementById('current-stage-text'),
      corpseText: document.getElementById('corpse-count-text'),
      deathText: document.getElementById('death-count-text'),
      timeText: document.getElementById('time-text'),
      hintText: document.getElementById('hint-text'),
      clearStageName: document.getElementById('clear-stage-name'),
      stageDeathsVal: document.getElementById('stage-deaths-val'),
      stageTimeVal: document.getElementById('stage-time-val'),
      totalDeathsVal: document.getElementById('total-deaths-val'),
      totalTimeVal: document.getElementById('total-time-val'),
      stageButtonsContainer: document.getElementById('stage-buttons-container')
    };

    this.dom.stageButtonsContainer.innerHTML = '';
    LEVELS.forEach((lvl, idx) => {
      const btn = document.createElement('button');
      btn.className = `btn-stage ${idx === 0 ? 'active' : ''}`;
      btn.textContent = `S${idx + 1}`;
      btn.title = lvl.name;
      btn.addEventListener('click', () => {
        this.currentLevelIdx = idx;
        this.loadLevel(idx);
        this.hideAllModals();
        this.isPlaying = true;
      });
      this.dom.stageButtonsContainer.appendChild(btn);
    });
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.input.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.input.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        if (!this.input.jump) this.input.jumpPressed = true;
        this.input.jump = true;
      }
      if (e.key === 'r' || e.key === 'R') this.restartCurrentLevel();
      if (e.key === 'm' || e.key === 'M') this.toggleSound();
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.input.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.input.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        this.input.jump = false;
        this.input.jumpPressed = false;
      }
    });

    this.dom.btnPlay.addEventListener('click', () => {
      this.sound.init();
      this.sound.startBGM();
      this.dom.startScreen.classList.remove('active');
      this.isPlaying = true;
      this.stageStartTime = Date.now();
      this.startTime = Date.now();
    });

    this.dom.btnNext.addEventListener('click', () => {
      this.dom.clearScreen.classList.remove('active');
      this.currentLevelIdx++;
      if (this.currentLevelIdx >= LEVELS.length) {
        this.showAllClear();
      } else {
        this.loadLevel(this.currentLevelIdx);
        this.isPlaying = true;
      }
    });

    this.dom.btnReplayAll.addEventListener('click', () => {
      this.dom.allClearScreen.classList.remove('active');
      this.totalDeaths = 0;
      this.deaths = 0;
      this.currentLevelIdx = 0;
      this.startTime = Date.now();
      this.loadLevel(0);
      this.isPlaying = true;
    });

    this.dom.btnRestart.addEventListener('click', () => this.restartCurrentLevel());
    this.dom.btnSound.addEventListener('click', () => this.toggleSound());
  }

  toggleSound() {
    this.sound.init();
    const active = this.sound.toggleMute();
    this.dom.btnSound.textContent = active ? '🔊' : '🔇';
  }

  hideAllModals() {
    this.dom.startScreen.classList.remove('active');
    this.dom.clearScreen.classList.remove('active');
    this.dom.allClearScreen.classList.remove('active');
  }

  showToast(msg) {
    if (!this.dom.warnToast) return;
    this.dom.warnToast.textContent = msg;
    this.dom.warnToast.classList.add('show');
    setTimeout(() => {
      this.dom.warnToast.classList.remove('show');
    }, 1800);
  }

  loadLevel(idx) {
    this.currentLevelIdx = idx;
    this.currentLevel = JSON.parse(JSON.stringify(LEVELS[idx]));
    this.corpses = [];
    this.stageDeaths = 0;
    this.stageStartTime = Date.now();
    
    this.player.reset(this.currentLevel.spawn.x, this.currentLevel.spawn.y);
    this.particles.clear();

    const num = String(idx + 1).padStart(2, '0');
    const total = String(LEVELS.length).padStart(2, '0');
    this.dom.stageText.textContent = `${num} / ${total}`;
    this.dom.corpseText.textContent = `0 / ${this.currentLevel.maxCorpses}`;
    this.dom.deathText.textContent = this.deaths;
    this.dom.hintText.textContent = this.currentLevel.hint;

    const buttons = this.dom.stageButtonsContainer.querySelectorAll('.btn-stage');
    buttons.forEach((btn, i) => {
      btn.classList.toggle('active', i === idx);
    });
  }

  restartCurrentLevel() {
    this.sound.playDeath();
    this.loadLevel(this.currentLevelIdx);
  }

  killPlayer() {
    // 1. Check Max Corpse Limit
    if (this.corpses.length >= this.currentLevel.maxCorpses) {
      this.sound.playDeath();
      this.showToast(`⚠️ 시체 생성 한도(${this.currentLevel.maxCorpses}개) 초과! 리셋됩니다.`);
      setTimeout(() => {
        this.loadLevel(this.currentLevelIdx);
      }, 350);
      return;
    }

    // 2. 가시에 닿은 바로 그 위치(x, y)에 수평 모양 그대로 시체 생성
    const corpse = new Corpse(this.player.x, this.player.y);
    this.corpses.push(corpse);

    // 3. Update stats
    this.deaths++;
    this.stageDeaths++;
    this.totalDeaths++;
    this.dom.deathText.textContent = this.deaths;
    this.dom.corpseText.textContent = `${this.corpses.length} / ${this.currentLevel.maxCorpses}`;

    // 4. VFX & Audio
    this.sound.playDeath();
    this.particles.addDeathBurst(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2);
    this.screenShake = 10;

    // 5. Respawn Player at start
    this.player.reset(this.currentLevel.spawn.x, this.currentLevel.spawn.y);
  }

  completeLevel() {
    this.isPlaying = false;
    this.sound.playClear();

    const stageElapsed = Math.floor((Date.now() - this.stageStartTime) / 1000);
    const m = String(Math.floor(stageElapsed / 60)).padStart(2, '0');
    const s = String(stageElapsed % 60).padStart(2, '0');

    if (this.currentLevelIdx >= LEVELS.length - 1) {
      this.showAllClear();
    } else {
      this.dom.clearStageName.textContent = this.currentLevel.name;
      this.dom.stageDeathsVal.textContent = `${this.corpses.length} / ${this.currentLevel.maxCorpses}`;
      this.dom.stageTimeVal.textContent = `${m}:${s}`;
      this.dom.clearScreen.classList.add('active');
    }
  }

  showAllClear() {
    this.isPlaying = false;
    const totalElapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const m = String(Math.floor(totalElapsed / 60)).padStart(2, '0');
    const s = String(totalElapsed % 60).padStart(2, '0');

    this.dom.totalDeathsVal.textContent = this.totalDeaths;
    this.dom.totalTimeVal.textContent = `${m}:${s}`;
    this.dom.allClearScreen.classList.add('active');
  }

  updateSwitches() {
    const switches = this.currentLevel.tiles.filter(t => t.type === 7);
    const doors = this.currentLevel.tiles.filter(t => t.type === 8);

    switches.forEach(sw => {
      const swBox = { x: sw.x * 30 + 2, y: sw.y * 30 + 18, w: 26, h: 12 };
      
      const isPressedByPlayer = this.player.intersects(swBox);
      const isPressedByCorpse = this.corpses.some(c => c.intersects(swBox));
      const active = isPressedByPlayer || isPressedByCorpse;

      if (active && !sw.isActivated) {
        sw.isActivated = true;
        this.sound.playSwitch();
      }

      doors.forEach(door => {
        if (door.doorId === sw.targetDoor) {
          door.isOpen = active || sw.isActivated;
        }
      });
    });
  }

  update(dt) {
    if (this.screenShake > 0) {
      this.screenShake *= 0.86;
      if (this.screenShake < 0.2) this.screenShake = 0;
    }

    if (this.currentLevel && this.currentLevel.goal) {
      this.particles.addPortalSparkle(this.currentLevel.goal.x + 15, this.currentLevel.goal.y + 15);
    }

    this.particles.update(dt);

    if (!this.isPlaying) return;

    const totalElapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const m = String(Math.floor(totalElapsed / 60)).padStart(2, '0');
    const s = String(totalElapsed % 60).padStart(2, '0');
    this.dom.timeText.textContent = `${m}:${s}`;

    for (const c of this.corpses) {
      c.update(dt, this.currentLevel.tiles, this.corpses);
    }

    this.player.update(dt, this.input, this);
    this.updateSwitches();

    this.input.jumpPressed = false;
  }

  draw() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      this.ctx.translate(sx, sy);
    }

    this.drawBackground();
    this.drawTiles();

    for (const c of this.corpses) {
      c.draw(this.ctx);
    }

    this.drawGoal();

    if (this.isPlaying) {
      this.player.draw(this.ctx);
    }

    this.particles.draw(this.ctx);

    this.ctx.restore();
  }

  drawBackground() {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 960; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 540);
      ctx.stroke();
    }
    for (let y = 0; y < 540; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(960, y);
      ctx.stroke();
    }
  }

  drawTiles() {
    const ctx = this.ctx;

    for (const tile of this.currentLevel.tiles) {
      const tx = tile.x * 30;
      const ty = tile.y * 30;

      if (tile.type === 1) {
        ctx.fillStyle = '#14142b';
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.fillRect(tx, ty, 30, 30);
        ctx.strokeRect(tx, ty, 30, 30);

        ctx.fillStyle = 'rgba(0, 243, 255, 0.06)';
        ctx.fillRect(tx + 5, ty + 5, 20, 20);
      }
      else if (tile.type === 2) {
        ctx.save();
        ctx.fillStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(tx + 15, ty + 2);
        ctx.lineTo(tx + 28, ty + 28);
        ctx.lineTo(tx + 2, ty + 28);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(tx + 15, ty + 9);
        ctx.lineTo(tx + 22, ty + 25);
        ctx.lineTo(tx + 8, ty + 25);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      else if (tile.type === 3) {
        ctx.save();
        ctx.fillStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(tx + 15, ty + 28);
        ctx.lineTo(tx + 28, ty + 2);
        ctx.lineTo(tx + 2, ty + 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      else if (tile.type === 6) {
        ctx.save();
        ctx.fillStyle = '#ffe600';
        ctx.shadowColor = '#ffe600';
        ctx.shadowBlur = 12;
        ctx.fillRect(tx + 3, ty + 20, 24, 8);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(tx + 3, ty + 20, 24, 8);
        ctx.restore();
      }
      else if (tile.type === 7) {
        ctx.save();
        const color = tile.isActivated ? '#00ff88' : '#ff007f';
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fillRect(tx + 4, ty + 22, 22, 6);
        ctx.restore();
      }
      else if (tile.type === 8) {
        ctx.save();
        if (tile.isOpen) {
          ctx.strokeStyle = 'rgba(0, 255, 136, 0.25)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(tx + 12, ty, 6, 30);
        } else {
          ctx.fillStyle = '#ff007f';
          ctx.shadowColor = '#ff007f';
          ctx.shadowBlur = 12;
          ctx.fillRect(tx + 11, ty, 8, 30);
          ctx.fillStyle = '#fff';
          ctx.fillRect(tx + 13, ty, 4, 30);
        }
        ctx.restore();
      }
    }
  }

  drawGoal() {
    if (!this.currentLevel || !this.currentLevel.goal) return;
    const ctx = this.ctx;
    const gx = this.currentLevel.goal.x + 15;
    const gy = this.currentLevel.goal.y + 15;
    const angle = Date.now() * 0.003;

    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(angle);

    ctx.strokeStyle = '#ffe600';
    ctx.shadowColor = '#ffe600';
    ctx.shadowBlur = 16;
    ctx.lineWidth = 3;
    ctx.strokeRect(-12, -12, 24, 24);

    ctx.rotate(-angle * 2);
    ctx.strokeStyle = '#00f3ff';
    ctx.shadowColor = '#00f3ff';
    ctx.strokeRect(-8, -8, 16, 16);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  startLoop() {
    let lastTime = performance.now();
    const frame = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      this.update(dt);
      this.draw();

      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const game = new CorpseDashGame();
  game.startLoop();
});
