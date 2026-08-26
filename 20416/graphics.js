/**
 * ===================================================
 * 선생님 몰래 두쫀쿠 먹기 (Dubai Cookie Stealth Eater)
 * Graphics & Character Animation Engine (Canvas 2D)
 * ===================================================
 */

class GraphicsRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    // Particle manager
    this.particles = [];
    this.tick = 0;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.tick++;
  }

  // ===================================================
  // 1. CLASSROOM BACKGROUND & BLACKBOARD
  // ===================================================
  drawClassroom() {
    const ctx = this.ctx;

    // Wall Background
    const wallGrad = ctx.createLinearGradient(0, 0, 0, 380);
    wallGrad.addColorStop(0, '#3a4a58');
    wallGrad.addColorStop(1, '#2c3742');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, this.width, 380);

    // Floor (Wood parquet tiles with perspective)
    const floorGrad = ctx.createLinearGradient(0, 380, 0, this.height);
    floorGrad.addColorStop(0, '#664228');
    floorGrad.addColorStop(1, '#4a2f1b');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, 380, this.width, this.height - 380);

    // Floor Planks Lines
    ctx.strokeStyle = 'rgba(30, 15, 5, 0.4)';
    ctx.lineWidth = 2;
    for (let x = -100; x <= this.width + 100; x += 90) {
      ctx.beginPath();
      ctx.moveTo(x, 380);
      ctx.lineTo(x + (x - this.width / 2) * 0.4, this.height);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, 380);
    ctx.lineTo(this.width, 380);
    ctx.stroke();

    // Blackboard Frame
    const boardX = 80;
    const boardY = 30;
    const boardW = 640;
    const boardH = 250;

    // Outer Wooden Frame
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(boardX - 12, boardY - 12, boardW + 24, boardH + 24);
    ctx.fillStyle = '#A06835';
    ctx.fillRect(boardX - 8, boardY - 8, boardW + 16, boardH + 16);

    // Blackboard Surface
    const boardGrad = ctx.createRadialGradient(
      boardX + boardW / 2, boardY + boardH / 2, 50,
      boardX + boardW / 2, boardY + boardH / 2, 350
    );
    boardGrad.addColorStop(0, '#234e35');
    boardGrad.addColorStop(1, '#153221');
    ctx.fillStyle = boardGrad;
    ctx.fillRect(boardX, boardY, boardW, boardH);

    // Chalk tray & accessories
    ctx.fillStyle = '#5c3818';
    ctx.fillRect(boardX - 12, boardY + boardH + 8, boardW + 24, 14);
    
    // Chalk pieces & eraser
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(boardX + 40, boardY + boardH + 4, 25, 6);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(boardX + 75, boardY + boardH + 4, 25, 6);
    ctx.fillStyle = '#334155';
    ctx.fillRect(boardX + boardW - 90, boardY + boardH + 2, 45, 10);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(boardX + boardW - 90, boardY + boardH, 45, 4);

    // Chalk writing on blackboard
    ctx.save();
    ctx.fillStyle = 'rgba(240, 245, 240, 0.85)';
    ctx.font = 'bold 18px "Jua", sans-serif';
    ctx.fillText('오늘의 학습 목표: 수업 집중하기!', boardX + 30, boardY + 45);

    ctx.font = '14px "Jua", sans-serif';
    ctx.fillStyle = 'rgba(255, 230, 150, 0.8)';
    ctx.fillText('※ 수업 중 취식 절대 금지! (특히 두쫀쿠)', boardX + 30, boardY + 75);
    
    ctx.font = '13px monospace';
    ctx.fillStyle = 'rgba(220, 235, 220, 0.6)';
    ctx.fillText('E = mc²   |   sin²θ + cos²θ = 1', boardX + 30, boardY + 115);
    ctx.fillText('Dubai_Cookie = Kataifi + Pistachio', boardX + 30, boardY + 140);
    ctx.fillText('Stealth_Level = MAX', boardX + 30, boardY + 165);
    ctx.restore();

    // Window on the left side
    this.drawWindow(15, 60, 45, 180);
  }

  drawWindow(x, y, w, h) {
    const ctx = this.ctx;
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
    // Sun rays
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 4);
    ctx.lineTo(x + w + 80, y + h + 60);
    ctx.lineTo(x + w + 30, y + h + 100);
    ctx.lineTo(x + 4, y + h);
    ctx.closePath();
    ctx.fill();
  }

  // ===================================================
  // 2. TEACHER CHARACTER
  // ===================================================
  drawTeacher(state, suspicionProgress = 0, isSurpriseWarning = false) {
    const ctx = this.ctx;
    const teacherX = 400;
    const teacherY = 190;

    ctx.save();
    ctx.translate(teacherX, teacherY);

    if (state === 'WRITING') {
      this.drawTeacherBackView();
    } else if (state === 'WARNING' || state === 'SUSPICIOUS') {
      this.drawTeacherSuspicious(suspicionProgress, isSurpriseWarning);
    } else if (state === 'FAKE_TURN') {
      this.drawTeacherFakeTurn();
    } else if (state === 'BAIT_PAUSE') {
      this.drawTeacherBaitPause();
    } else if (state === 'TURNED') {
      this.drawTeacherTurned();
    }

    ctx.restore();
  }

  drawTeacherBackView() {
    const ctx = this.ctx;
    const writeOffset = Math.sin(this.tick * 0.25) * 6;

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-45, 45, 90, 100, [10, 10, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-15, 38, 30, 12);

    ctx.fillStyle = '#331e10';
    ctx.beginPath();
    ctx.arc(0, 15, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#211208';
    ctx.beginPath();
    ctx.arc(0, 10, 32, Math.PI * 0.8, Math.PI * 2.2);
    ctx.fill();

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(35, 60);
    ctx.quadraticCurveTo(55, 30 + writeOffset, 65, 5 + writeOffset);
    ctx.stroke();

    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(65, 5 + writeOffset, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(66, -2 + writeOffset, 8, 14);

    if (Math.random() < 0.25) {
      this.addChalkDust(400 + 65, 190 + writeOffset);
    }
  }

  drawTeacherSuspicious(progress, isSurprise = false) {
    const ctx = this.ctx;
    const headTilt = Math.sin(this.tick * 0.3) * 4;

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-45, 45, 90, 100, [10, 10, 0, 0]);
    ctx.fill();

    ctx.save();
    ctx.translate(0, headTilt);

    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(10, 15, 32, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#331e10';
    ctx.beginPath();
    ctx.arc(2, 10, 32, Math.PI * 0.5, Math.PI * 1.8);
    ctx.fill();

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.strokeRect(18, 8, 16, 12);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(26, 14, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(35, 0);
    ctx.quadraticCurveTo(40, 10, 35, 14);
    ctx.quadraticCurveTo(30, 10, 35, 0);
    ctx.fill();

    ctx.restore();

    const alertBounce = Math.sin(this.tick * 0.4) * 8;
    const alertScale = 1.0 + Math.sin(this.tick * 0.5) * 0.2;

    ctx.save();
    ctx.translate(0, -45 + alertBounce);
    ctx.scale(alertScale, alertScale);

    if (isSurprise) {
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 20;
      ctx.font = '900 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡!', 0, 0);
    } else {
      ctx.fillStyle = 'rgba(255, 51, 85, 0.9)';
      ctx.shadowColor = '#ff3355';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', 0, 0);
    }
    ctx.restore();
  }

  drawTeacherBaitPause() {
    const ctx = this.ctx;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-45, 45, 90, 100, [10, 10, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(8, 15, 32, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff4757';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👀', 20, -25);
  }

  drawTeacherFakeTurn() {
    const ctx = this.ctx;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-45, 45, 90, 100, [10, 10, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(15, 15, 32, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#331e10';
    ctx.beginPath();
    ctx.arc(5, 8, 32, Math.PI * 0.6, Math.PI * 1.9);
    ctx.fill();

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(22, 14);
    ctx.lineTo(34, 14);
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = '900 22px "Jua", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('???', 30, -30);
  }

  drawTeacherTurned() {
    const ctx = this.ctx;

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-50, 45, 100, 105, [12, 12, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-18, 45);
    ctx.lineTo(0, 75);
    ctx.lineTo(18, 45);
    ctx.fill();

    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-6, 55);
    ctx.lineTo(6, 55);
    ctx.lineTo(10, 115);
    ctx.lineTo(0, 130);
    ctx.lineTo(-10, 115);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(0, 15, 35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#331e10';
    ctx.beginPath();
    ctx.arc(0, 10, 36, Math.PI * 1.1, Math.PI * 1.9);
    ctx.fill();

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4;
    ctx.strokeRect(-28, 5, 22, 16);
    ctx.strokeRect(6, 5, 22, 16);
    ctx.beginPath();
    ctx.moveTo(-6, 13);
    ctx.lineTo(6, 13);
    ctx.stroke();

    // ANGRY LASER EYES
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0055';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(-17, 13, 5, 0, Math.PI * 2);
    ctx.arc(17, 13, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Laser beam sweep
    const sweepOffset = Math.sin(this.tick * 0.18) * 100;
    ctx.strokeStyle = 'rgba(255, 0, 50, 0.45)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-17, 13);
    ctx.lineTo(-140 + sweepOffset, 400);
    ctx.moveTo(17, 13);
    ctx.lineTo(140 + sweepOffset, 400);
    ctx.stroke();

    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.arc(0, 32, 10, 0, Math.PI, true);
    ctx.fill();

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-45, 65);
    ctx.lineTo(-90, 80);
    ctx.stroke();

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-90, 80);
    ctx.lineTo(-140, 120);
    ctx.stroke();

    ctx.fillStyle = '#ff3355';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('💢', 38, -5);
  }

  // ===================================================
  // 3. STUDENT (PLAYER) & DESK
  // ===================================================
  drawStudentAndDesk(isEating, biteProgress, isFever, isCaught) {
    const ctx = this.ctx;
    const deskX = 400;
    const deskY = 460;

    ctx.save();
    ctx.translate(deskX, deskY);

    if (isCaught) {
      this.drawStudentCaught();
    } else if (isEating) {
      this.drawStudentEating(biteProgress, isFever);
    } else {
      this.drawStudentStudying();
    }

    this.drawDesk(isEating, biteProgress, isFever);

    ctx.restore();
  }

  drawStudentStudying() {
    const ctx = this.ctx;

    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.roundRect(-60, -80, 120, 100, [20, 20, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(0, -110, 36, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -105, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-10, -108, 6, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(10, -108, 6, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();

    ctx.fillStyle = 'rgba(244, 114, 182, 0.6)';
    ctx.beginPath();
    ctx.arc(-18, -98, 7, 0, Math.PI * 2);
    ctx.arc(18, -98, 7, 0, Math.PI * 2);
    ctx.fill();

    const haloBob = Math.sin(this.tick * 0.1) * 3;
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.8)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, -155 + haloBob, 26, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawStudentEating(biteProgress, isFever) {
    const ctx = this.ctx;
    const chewOffset = Math.sin(this.tick * (isFever ? 0.6 : 0.35)) * 6;
    const headDuck = 12;

    if (isFever) {
      ctx.fillStyle = 'rgba(243, 183, 73, 0.35)';
      ctx.beginPath();
      ctx.arc(0, -100 + headDuck, 75, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.roundRect(-65, -80 + headDuck, 130, 100, [20, 20, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(0, -105 + headDuck, 38, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -100 + headDuck, 34 + Math.abs(chewOffset * 0.5), 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(-12, -105 + headDuck, 7, Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(12, -105 + headDuck, 7, Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();

    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.arc(-22, -95 + headDuck, 9, 0, Math.PI * 2);
    ctx.arc(22, -95 + headDuck, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#881337';
    ctx.beginPath();
    ctx.arc(0, -85 + headDuck + chewOffset, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#8ec03f';
    ctx.beginPath();
    ctx.arc(0, -83 + headDuck + chewOffset, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(-24, -65 + headDuck, 12, 0, Math.PI * 2);
    ctx.arc(24, -65 + headDuck, 12, 0, Math.PI * 2);
    ctx.fill();

    if (Math.random() < (isFever ? 0.8 : 0.4)) {
      this.addKataifiCrumb(400 + (Math.random() * 40 - 20), 460 - 75 + headDuck);
    }
  }

  drawStudentCaught() {
    const ctx = this.ctx;
    const shake = Math.sin(this.tick * 0.6) * 4;

    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.roundRect(-60 + shake, -80, 120, 100, [20, 20, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(shake, -105, 34, 0, Math.PI * 2);
    ctx.fill();

    const panicGrad = ctx.createLinearGradient(0, -130, 0, -90);
    panicGrad.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
    panicGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = panicGrad;
    ctx.beginPath();
    ctx.arc(shake, -105, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-12 + shake, -110, 9, 0, Math.PI * 2);
    ctx.arc(12 + shake, -110, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-12 + shake, -110, 3, 0, Math.PI * 2);
    ctx.arc(12 + shake, -110, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4c0519';
    ctx.beginPath();
    ctx.ellipse(shake, -85, 10, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(-35 + shake, -120, 5, 0, Math.PI * 2);
    ctx.arc(35 + shake, -120, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawDesk(isEating, biteProgress, isFever) {
    const ctx = this.ctx;

    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.roundRect(-240, -10, 480, 140, [14, 14, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#d97706';
    ctx.fillRect(-240, -10, 480, 10);

    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-180, 10, 110, 75);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-176, 14, 102, 67);
    ctx.fillStyle = '#94a3b8';
    for (let l = 22; l < 75; l += 10) {
      ctx.fillRect(-170, l, 90, 3);
    }

    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.roundRect(100, 20, 70, 22, 6);
    ctx.fill();

    this.drawDubaiCookie(0, 35, isEating, biteProgress, isFever);
  }

  // ===================================================
  // 4. DUBAI CHEWY COOKIE RENDERING (벡터 일러스트 복원)
  // ===================================================
  drawDubaiCookie(x, y, isEating, biteProgress, isFever) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    const radius = 34;

    if (isFever) {
      ctx.shadowColor = '#f3b749';
      ctx.shadowBlur = 25;
    } else {
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;
    }

    ctx.fillStyle = isFever ? '#b45309' : '#271406';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isFever ? '#f59e0b' : '#4a2711';
    ctx.beginPath();
    ctx.arc(0, 0, radius - 5, 0, Math.PI * 2);
    ctx.fill();

    const pistGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, radius - 10);
    pistGrad.addColorStop(0, '#a3e635');
    pistGrad.addColorStop(0.7, '#65a30d');
    pistGrad.addColorStop(1, '#4d7c0f');
    ctx.fillStyle = pistGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius - 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 4, Math.sin(angle) * 4);
      ctx.lineTo(Math.cos(angle) * (radius - 12), Math.sin(angle) * (radius - 12));
      ctx.stroke();
    }

    ctx.strokeStyle = isFever ? '#fef08a' : '#1c0d02';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-20, -10);
    ctx.quadraticCurveTo(0, -18, 20, -10);
    ctx.moveTo(-18, 5);
    ctx.quadraticCurveTo(0, 15, 18, 5);
    ctx.stroke();

    if (biteProgress > 0.05) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = '#000000';
      const biteRadius = radius * (biteProgress * 1.5);
      ctx.beginPath();
      ctx.arc(radius * 0.7, -radius * 0.7, biteRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }

    if (isEating) {
      ctx.fillStyle = '#8ec03f';
      ctx.beginPath();
      ctx.arc(28, -25, 3, 0, Math.PI * 2);
      ctx.arc(20, -32, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ===================================================
  // 5. PARTICLE SYSTEM
  // ===================================================
  addKataifiCrumb(x, y) {
    this.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: -Math.random() * 4 - 2,
      gravity: 0.25,
      size: Math.random() * 5 + 3,
      color: Math.random() > 0.5 ? '#f3b749' : '#8ec03f',
      life: 1.0,
      decay: 0.025,
      rot: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.2
    });
  }

  addChalkDust(x, y) {
    this.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: Math.random() * 1.5 + 0.5,
      gravity: 0.05,
      size: Math.random() * 3 + 1,
      color: 'rgba(255, 255, 255, 0.7)',
      life: 0.8,
      decay: 0.03
    });
  }

  updateAndDrawParticles() {
    const ctx = this.ctx;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.life -= p.decay;

      if (p.rot !== undefined) p.rot += p.rotSpeed;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;

      if (p.rot !== undefined) {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

window.GraphicsRenderer = GraphicsRenderer;
