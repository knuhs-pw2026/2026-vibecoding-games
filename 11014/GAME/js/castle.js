/**
 * ANCIENT CASTLE GUARDIANS: CASTLE & TURRETS DEFENSE SYSTEM
 * Manages Castle Walls, Emergency Repair, Fortifications,
 * and 4 Defensive Towers (Ballista, Inferno Cannon, Arcane Spire, Tesla Coil).
 */

class CastleManager {
  constructor(game) {
    this.game = game;

    // Castle Base Coordinates & Dimensions on Battlefield
    this.x = 220; // Castle Wall X coordinate (Canvas left side)
    this.width = 160;
    this.height = 700;

    // Wall Stats & Upgrades
    this.wallLevel = 1;
    this.maxHp = 5000;
    this.currentHp = 5000;
    this.armor = 20; // Flat damage reduction
    this.thornDamage = 15; // Reflect damage
    this.regenRate = 5; // HP regen per second
    this.barrier = 0; // Temporary energy shield
    this.maxBarrier = 0;
    this.invulnerableTimer = 0;

    // 4 Castle Defensive Turrets
    this.turrets = {
      ballista: {
        id: 'ballista',
        name: '아케인 발리스타',
        icon: '🏹',
        level: 1,
        unlocked: true,
        baseDmg: 80,
        atkSpeed: 1.2, // shots per sec
        range: 650,
        cooldown: 0,
        color: '#fbbf24',
        desc: '원거리의 단일 적을 관통하여 치명타를 입히는 대형 쇠뇌.'
      },
      inferno: {
        id: 'inferno',
        name: '인페르노 화염포',
        icon: '💣',
        level: 1,
        unlocked: true,
        baseDmg: 120,
        atkSpeed: 0.6,
        range: 520,
        splashRadius: 90,
        cooldown: 0,
        color: '#ef4444',
        desc: '고열의 화염구를 발사하여 광역 폭발과 화상을 유발하는 박격포.'
      },
      arcane: {
        id: 'arcane',
        name: '아케인 마법탑',
        icon: '🔮',
        level: 1,
        unlocked: false,
        baseDmg: 95,
        atkSpeed: 1.0,
        range: 580,
        cooldown: 0,
        color: '#a855f7',
        desc: '적들을 추적하는 신비의 유도 마탄을 난사하는 마도 탑.'
      },
      tesla: {
        id: 'tesla',
        name: '테슬라 뇌전탑',
        icon: '⚡',
        level: 1,
        unlocked: false,
        baseDmg: 140,
        atkSpeed: 0.8,
        range: 480,
        chainCount: 5,
        cooldown: 0,
        color: '#38bdf8',
        desc: '침공하는 적 무리에게 연쇄 번개를 방출해 감전 마비시키는 뇌전탑.'
      }
    };
  }

  // Update Castle HP, Regens, Turret attacks
  update(dt) {
    // Wall Regen (with difficulty multiplier)
    const diff = this.game.getDifficultyConfig ? this.game.getDifficultyConfig() : { wallRegenScale: 1.0 };
    if (this.currentHp > 0 && this.currentHp < this.maxHp) {
      this.currentHp = Math.min(this.maxHp, this.currentHp + this.regenRate * (diff.wallRegenScale || 1.0) * dt);
    }

    // Invulnerable timer countdown
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    // Turrets targeting & shooting
    this.updateTurrets(dt);
  }

  updateTurrets(dt) {
    if (!this.game.enemies || this.game.enemies.length === 0) return;

    for (let key in this.turrets) {
      const turret = this.turrets[key];
      if (!turret.unlocked) continue;

      if (turret.cooldown > 0) {
        turret.cooldown -= dt;
        continue;
      }

      // Turret positions along the castle wall
      let turretY = 160;
      if (key === 'inferno') turretY = 300;
      if (key === 'arcane') turretY = 440;
      if (key === 'tesla') turretY = 580;

      // Find best target in range
      const target = this.findTurretTarget(this.x, turretY, turret.range);
      if (target) {
        this.fireTurret(turret, this.x, turretY, target);
        turret.cooldown = 1 / turret.atkSpeed;
      }
    }
  }

  findTurretTarget(originX, originY, range) {
    let closestEnemy = null;
    let closestDist = range;

    for (let enemy of this.game.enemies) {
      if (enemy.isDead) continue;
      const dx = enemy.x - originX;
      const dy = enemy.y - originY;
      const dist = Math.hypot(dx, dy);

      if (dist <= closestDist) {
        closestDist = dist;
        closestEnemy = enemy;
      }
    }

    return closestEnemy;
  }

  fireTurret(turret, startX, startY, target) {
    const damage = turret.baseDmg * (1 + (turret.level - 1) * 0.35);

    if (turret.id === 'ballista') {
      this.game.spawnProjectile({
        type: 'ballista_bolt',
        x: startX,
        y: startY,
        targetX: target.x,
        targetY: target.y,
        speed: 1200,
        damage: damage,
        color: '#fbbf24',
        piercing: true,
        source: 'turret'
      });
      if (this.game.audio) this.game.audio.playShootArrow();
    } else if (turret.id === 'inferno') {
      this.game.spawnProjectile({
        type: 'cannon_ball',
        x: startX,
        y: startY,
        targetX: target.x,
        targetY: target.y,
        speed: 700,
        damage: damage,
        splashRadius: turret.splashRadius,
        color: '#ef4444',
        source: 'turret'
      });
      if (this.game.audio) this.game.audio.playFireball();
    } else if (turret.id === 'arcane') {
      this.game.spawnProjectile({
        type: 'arcane_missile',
        x: startX,
        y: startY,
        target: target,
        speed: 900,
        damage: damage,
        color: '#a855f7',
        source: 'turret'
      });
      if (this.game.audio) this.game.audio.playMagicSound();
    } else if (turret.id === 'tesla') {
      // Direct Chain Lightning
      this.game.createTeslaChain(startX, startY, target, turret.chainCount, damage);
      if (this.game.audio) this.game.audio.playLightning();
    }
  }

  // Castle Takes Damage from Enemies
  takeDamage(amount, sourceEnemy = null) {
    if (this.invulnerableTimer > 0) {
      if (this.game.particles) {
        this.game.particles.spawnFloatingText(this.x + 20, 300, '무적!', '#38bdf8');
      }
      return 0;
    }

    // Apply armor reduction
    let actualDamage = Math.max(1, amount - this.armor);

    // Apply barrier first
    if (this.barrier > 0) {
      if (this.barrier >= actualDamage) {
        this.barrier -= actualDamage;
        if (this.game.particles) {
          this.game.particles.spawnFloatingText(this.x + 20, 280, `방어막 -${Math.round(actualDamage)}`, '#38bdf8');
        }
        return 0;
      } else {
        actualDamage -= this.barrier;
        this.barrier = 0;
      }
    }

    this.currentHp -= actualDamage;

    // Thorn reflect damage
    if (sourceEnemy && this.thornDamage > 0 && !sourceEnemy.isDead) {
      sourceEnemy.takeDamage(this.thornDamage, 'physical');
    }

    if (this.game.audio) this.game.audio.playCastleHit();
    if (this.game.camera) this.game.camera.shake = Math.min(15, this.game.camera.shake + 4);

    // Floating damage text
    if (this.game.particles) {
      this.game.particles.spawnFloatingText(this.x + 10, 320 + Math.random() * 40, `성벽 -${Math.round(actualDamage)}`, '#ef4444', 1.2);
    }

    if (this.currentHp <= 0) {
      this.currentHp = 0;
      this.game.onCastleDestroyed();
    }

    return actualDamage;
  }

  // Emergency Repair Wall
  emergencyRepair() {
    const repairCost = Math.floor(50 + (this.maxHp - this.currentHp) * 0.1);
    if (this.currentHp >= this.maxHp) return { success: false, msg: '성벽이 이미 최대 체력입니다.' };

    if (this.game.gold >= repairCost) {
      this.game.gold -= repairCost;
      const healed = Math.min(this.maxHp - this.currentHp, this.maxHp * 0.35);
      this.currentHp += healed;
      if (this.game.audio) this.game.audio.playRepair();
      if (this.game.particles) {
        this.game.particles.spawnFloatingText(this.x + 30, 260, `성벽 수리 +${Math.round(healed)}`, '#22c55e', 1.3);
      }
      return { success: true, healed: healed };
    }
    return { success: false, msg: '수리에 필요한 골드가 부족합니다!' };
  }

  getRepairCost() {
    return Math.floor(50 + (this.maxHp - this.currentHp) * 0.1);
  }

  // Upgrade Castle Wall
  upgradeWall() {
    const cost = Math.floor(200 * Math.pow(1.5, this.wallLevel - 1));
    if (this.game.gold >= cost) {
      this.game.gold -= cost;
      this.wallLevel++;
      this.maxHp += 1500;
      this.currentHp += 1500;
      this.armor += 8;
      this.thornDamage += 6;
      this.regenRate += 3;
      if (this.game.audio) this.game.audio.playUpgrade();
      return true;
    }
    return false;
  }

  getWallUpgradeCost() {
    return Math.floor(200 * Math.pow(1.5, this.wallLevel - 1));
  }

  // Upgrade or Unlock Turret
  upgradeTurret(turretKey) {
    const turret = this.turrets[turretKey];
    if (!turret) return false;

    if (!turret.unlocked) {
      // Unlock cost
      const unlockCost = turretKey === 'arcane' ? 500 : 1000;
      if (this.game.gold >= unlockCost) {
        this.game.gold -= unlockCost;
        turret.unlocked = true;
        if (this.game.audio) this.game.audio.playUpgrade();
        return true;
      }
      return false;
    }

    const cost = Math.floor(150 * Math.pow(1.4, turret.level));
    if (this.game.gold >= cost) {
      this.game.gold -= cost;
      turret.level++;
      if (this.game.audio) this.game.audio.playUpgrade();
      return true;
    }
    return false;
  }

  getTurretCost(turretKey) {
    const turret = this.turrets[turretKey];
    if (!turret) return 0;
    if (!turret.unlocked) return turretKey === 'arcane' ? 500 : 1000;
    return Math.floor(150 * Math.pow(1.4, turret.level));
  }

  // Render Castle Wall & Turrets on Canvas
  draw(ctx) {
    const wallX = this.x - 120;
    const wallY = 60;
    const wallW = 140;
    const wallH = 680;

    // Castle Back Fortification & Towers
    ctx.save();

    // Stone Wall Gradient
    const grad = ctx.createLinearGradient(wallX, 0, wallX + wallW, 0);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(0.5, '#334155');
    grad.addColorStop(1, '#475569');

    ctx.fillStyle = grad;
    ctx.fillRect(wallX, wallY, wallW, wallH);

    // Stone Bricks details
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    for (let y = wallY; y < wallY + wallH; y += 30) {
      ctx.beginPath();
      ctx.moveTo(wallX, y);
      ctx.lineTo(wallX + wallW, y);
      ctx.stroke();
      const offset = (Math.floor(y / 30) % 2) * 35;
      for (let x = wallX + offset; x < wallX + wallW; x += 70) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 30);
        ctx.stroke();
      }
    }

    // Battlements (성벽 위 요철)
    ctx.fillStyle = '#64748b';
    for (let y = wallY; y < wallY + wallH; y += 45) {
      ctx.fillRect(wallX + wallW - 10, y, 14, 25);
    }

    // Castle Gate
    ctx.fillStyle = '#451a03';
    ctx.fillRect(wallX + wallW - 20, 320, 24, 160);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.strokeRect(wallX + wallW - 20, 320, 24, 160);

    // Turrets Icons & Platforms
    const turretKeys = ['ballista', 'inferno', 'arcane', 'tesla'];
    const turretYs = [160, 300, 440, 580];

    turretKeys.forEach((key, idx) => {
      const turret = this.turrets[key];
      const ty = turretYs[idx];

      // Platform
      ctx.fillStyle = turret.unlocked ? '#0f172a' : '#1e1b4b';
      ctx.beginPath();
      ctx.arc(wallX + wallW - 5, ty, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = turret.unlocked ? turret.color : '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Icon & Level
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(turret.unlocked ? turret.icon : '🔒', wallX + wallW - 5, ty);

      if (turret.unlocked) {
        ctx.font = 'bold 11px Outfit, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(`Lv.${turret.level}`, wallX + wallW - 5, ty + 20);
      }
    });

    // Barrier Glow if active
    if (this.barrier > 0 || this.invulnerableTimer > 0) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
      ctx.lineWidth = 8;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(wallX + wallW + 5, wallY);
      ctx.lineTo(wallX + wallW + 5, wallY + wallH);
      ctx.stroke();
    }

    ctx.restore();
  }
}
