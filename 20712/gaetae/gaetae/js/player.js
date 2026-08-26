/**
 * 네온 서바이벌 플레이어 캐릭터 시스템
 */
class Player {
  constructor(onLevelUp) {
    this.onLevelUp = onLevelUp;

    // 위치 및 물리
    this.x = 0;
    this.y = 0;
    this.radius = 16;
    this.baseSpeed = 220;
    this.facingAngle = 0;

    // 생명력 및 쉴드
    this.maxHp = 100;
    this.hp = 100;
    this.maxShield = 0;
    this.shield = 0;
    this.shieldRegenTimer = 0;

    // 경험치 및 레벨
    this.level = 1;
    this.xp = 0;
    this.maxXp = 20; // 35 -> 20으로 단축하여 빠른 초반 성장
    this.totalGemsCollected = 0;

    // 대시 / 회피 스킬
    this.dashCooldown = 2.2; // 2.8 -> 2.2로 단축
    this.dashTimer = 0;
    this.isDashing = false;
    this.dashDuration = 0.24;
    this.dashTimeLeft = 0;
    this.dashSpeed = 750;
    this.dashDirX = 0;
    this.dashDirY = 0;

    // 피격 무적 (i-frame)
    this.invulnerableTimer = 0;

    // 기본 스탯
    this.stats = {
      damageMult: 1.0,
      speedMult: 1.0,
      armor: 0,
      critChance: 0.08,
      critMult: 1.6,
      cooldownMult: 1.0,
      magnetRadius: 140, // 110 -> 140으로 기본 흡입 반경 확장
      hpRegen: 0.5 // 기본 초당 0.5 HP 지속 재생 추가
    };

    // 입력 상태
    this.keys = {};
    this.touchVector = { x: 0, y: 0 };
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.maxHp = 100;
    this.hp = 100;
    this.maxShield = 0;
    this.shield = 0;
    this.level = 1;
    this.xp = 0;
    this.maxXp = 20;
    this.totalGemsCollected = 0;
    this.dashTimer = 0;
    this.isDashing = false;
    this.invulnerableTimer = 0;

    this.stats = {
      damageMult: 1.0,
      speedMult: 1.0,
      armor: 0,
      critChance: 0.08,
      critMult: 1.6,
      cooldownMult: 1.0,
      magnetRadius: 140,
      hpRegen: 0.5
    };
  }

  // 이동 및 물리 갱신
  update(dt) {
    // 1. 대시 쿨다운 및 지속 시간 갱신
    if (this.dashTimer > 0) {
      this.dashTimer -= dt;
    }

    if (this.isDashing) {
      this.dashTimeLeft -= dt;
      this.x += this.dashDirX * this.dashSpeed * dt;
      this.y += this.dashDirY * this.dashSpeed * dt;

      // 대시 잔상 방출
      window.particleSystem.emitGhost(this.x, this.y, this.radius, '#00f0ff', 0.5);

      if (this.dashTimeLeft <= 0) {
        this.isDashing = false;
      }
    } else {
      // 일반 이동 입력 처리
      let moveX = 0;
      let moveY = 0;

      if (this.keys['KeyW'] || this.keys['ArrowUp']) moveY -= 1;
      if (this.keys['KeyS'] || this.keys['ArrowDown']) moveY += 1;
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
      if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

      // 터치/조이스틱 입력 합성
      if (this.touchVector.x !== 0 || this.touchVector.y !== 0) {
        moveX = this.touchVector.x;
        moveY = this.touchVector.y;
      }

      const length = Math.hypot(moveX, moveY);
      if (length > 0) {
        const normX = moveX / length;
        const normY = moveY / length;
        const speed = this.baseSpeed * this.stats.speedMult;

        this.x += normX * speed * dt;
        this.y += normY * speed * dt;
        this.facingAngle = Math.atan2(normY, normX);

        // 이동 잔상/먼지 파티클
        if (Math.random() < 0.25) {
          window.particleSystem.emit(this.x, this.y, 1, '#00f0ff', 20, 2, 0.15);
        }
      }
    }

    // 2. 피격 무적 타이머
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    // 3. 체력 재생 갱신
    if (this.stats.hpRegen > 0 && this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + this.stats.hpRegen * dt);
    }
  }

  // 대시 발동
  dash() {
    const actualCd = this.dashCooldown * this.stats.cooldownMult;
    if (this.dashTimer > 0 || this.isDashing) return false;

    let moveX = 0;
    let moveY = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveY -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveY += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

    if (this.touchVector.x !== 0 || this.touchVector.y !== 0) {
      moveX = this.touchVector.x;
      moveY = this.touchVector.y;
    }

    let len = Math.hypot(moveX, moveY);
    if (len === 0) {
      // 정지 상태일 때는 바라보는 방향으로 대시
      this.dashDirX = Math.cos(this.facingAngle);
      this.dashDirY = Math.sin(this.facingAngle);
    } else {
      this.dashDirX = moveX / len;
      this.dashDirY = moveY / len;
    }

    this.isDashing = true;
    this.dashTimeLeft = this.dashDuration;
    this.dashTimer = actualCd;
    this.invulnerableTimer = this.dashDuration + 0.05; // 대시 중 무적

    window.soundManager.playDash();
    window.particleSystem.triggerShake(4, 0.15);
    window.particleSystem.emitShockwave(this.x, this.y, 45, '#00f0ff', 0.25);
    return true;
  }

  // 피해 입기
  takeDamage(amount) {
    if (this.invulnerableTimer > 0 || this.isDashing) return;

    // 아머 방어력 적용
    const effectiveDamage = Math.max(1, amount - this.stats.armor);

    // 쉴드 우선 차감
    if (this.shield > 0) {
      if (this.shield >= effectiveDamage) {
        this.shield -= effectiveDamage;
      } else {
        const remaining = effectiveDamage - this.shield;
        this.shield = 0;
        this.hp -= remaining;
      }
    } else {
      this.hp -= effectiveDamage;
    }

    this.invulnerableTimer = 0.15; // 0.15초 무적
    window.soundManager.playHit();
    window.particleSystem.triggerShake(6, 0.2);
    window.particleSystem.emit(this.x, this.y, 8, '#ff0077', 90, 3, 0.25);

    if (this.hp <= 0) {
      this.hp = 0;
    }
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    window.particleSystem.emit(this.x, this.y, 6, '#00ff66', 60, 2.5, 0.3);
  }

  // 경험치 추가 및 레벨업 체크
  addXp(amount) {
    this.xp += amount;
    this.totalGemsCollected++;

    if (this.xp >= this.maxXp) {
      this.xp -= this.maxXp;
      this.level++;
      // 레벨업 요구치 부드러운 18% 점진 상승 (성장 가속화)
      this.maxXp = Math.round(this.maxXp * 1.18 + 6);

      window.soundManager.playLevelUp();
      window.particleSystem.triggerShake(8, 0.3);
      window.particleSystem.emitShockwave(this.x, this.y, 100, '#00f0ff', 0.45);
      window.particleSystem.emit(this.x, this.y, 25, '#ffcc00', 160, 4, 0.5);

      if (this.onLevelUp) {
        this.onLevelUp(this.level);
      }
    }
  }

  // 공격력 및 치명타 계산
  calculateDamage(baseDamage) {
    const isCrit = Math.random() < this.stats.critChance;
    let finalDmg = baseDamage * this.stats.damageMult;
    if (isCrit) {
      finalDmg *= this.stats.critMult;
    }
    return {
      damage: Math.round(finalDmg),
      isCrit: isCrit
    };
  }

  // --- 렌더링 ---
  render(ctx, camera) {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    const isInvulnerable = this.invulnerableTimer > 0;
    if (isInvulnerable && Math.floor(Date.now() / 50) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // 1. 자석 반경 표시 (미세한 네온 원)
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.stats.magnetRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 2. 쉴드 보호막 렌더링
    if (this.shield > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 3. 플레이어 외형 렌더링 (사이버네틱 코어)
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.facingAngle);

    // 사이버 글로우
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 15;

    // 메인 동체
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(this.radius * 1.2, 0);
    ctx.lineTo(-this.radius * 0.9, -this.radius * 0.85);
    ctx.lineTo(-this.radius * 0.4, 0);
    ctx.lineTo(-this.radius * 0.9, this.radius * 0.85);
    ctx.closePath();
    ctx.fill();

    // 내부 코어
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();
  }
}

window.Player = Player;
