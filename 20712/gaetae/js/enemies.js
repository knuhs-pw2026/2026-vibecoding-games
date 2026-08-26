/**
 * 네온 서바이벌 적 군단, 4대 역할군(근접/저격/마법/서포트) 및 100배 엘리트 커맨더 시스템
 */

let enemyIdCounter = 0;

class EnemyManager {
  constructor(player) {
    this.player = player;
    this.enemies = [];
    this.gems = [];
    this.enemyProjectiles = [];
    this.bossSpawnedWaves = new Set();

    this.spawnTimer = 0;
    this.spawnInterval = 0.4;
    this.maxEnemies = 250; // 웨이브에 따라 최대 2,500마리까지 자동 확장
    this.totalKills = 0;
    this.totalDamageDealt = 0;
    this.waveNumber = 1;
    this.activeBoss = null; // 현재 활성화된 거대 보스
  }

  update(dt, gameTime) {
    const player = this.player;

    // 1. 웨이브 난이도 및 스폰 로직
    this.updateSpawning(dt, gameTime);

    // 2. 적 이동 및 4대 역할군 AI 로직
    const enemyCount = this.enemies.length;
    const skipSeparation = enemyCount > 100;

    for (let i = enemyCount - 1; i >= 0; i--) {
      const e = this.enemies[i];

      // 슬로우 타이머 갱신
      if (e.slowTimer > 0) {
        e.slowTimer -= dt;
      }

      // 피격 플래시 타이머
      if (e.flashTimer > 0) {
        e.flashTimer -= dt;
      }

      const currentSpeed = (e.slowTimer > 0 ? e.speed * e.slowFactor : e.speed);

      // 플레이어와의 거리 계산
      const dx = player.x - e.x;
      const dy = player.y - e.y;
      const dist = Math.hypot(dx, dy);

      // --- [역할군별 AI 패턴] ---

      if (e.role === 'sniper') {
        // 🎯 [저격형]: 450px 거리 유지 및 레이저 조준선 1.5초 후 고속 레일건 발사
        if (dist > 480) {
          e.x += (dx / dist) * currentSpeed * dt;
          e.y += (dy / dist) * currentSpeed * dt;
        } else if (dist < 320) {
          e.x -= (dx / dist) * currentSpeed * dt;
          e.y -= (dy / dist) * currentSpeed * dt;
        }

        e.shootTimer -= dt;
        // 조준 중일 때
        if (e.shootTimer <= 1.5 && e.shootTimer > 0) {
          e.isAiming = true;
          e.aimAngle = Math.atan2(dy, dx);
        } else if (e.shootTimer <= 0) {
          e.isAiming = false;
          // 고속 관통 레일건 탄환 발사
          this.fireEnemyBullet(e.x, e.y, e.aimAngle || Math.atan2(dy, dx), 420, e.damage * 1.8, 6, '#c084fc');
          e.shootTimer = 3.5;
        }
      } else if (e.role === 'mage') {
        // 🔮 [마법형]: 중거리에서 3~5방향 확산 마법탄 또는 유도 파이어볼 시전
        if (dist > 350) {
          e.x += (dx / dist) * currentSpeed * dt;
          e.y += (dy / dist) * currentSpeed * dt;
        } else if (dist < 220) {
          e.x -= (dx / dist) * currentSpeed * dt;
          e.y -= (dy / dist) * currentSpeed * dt;
        }

        e.shootTimer -= dt;
        if (e.shootTimer <= 0 && dist < 550) {
          const baseA = Math.atan2(dy, dx);
          // 3방향 확산 마법탄
          for (let s = -1; s <= 1; s++) {
            this.fireEnemyBullet(e.x, e.y, baseA + s * 0.25, 200, e.damage, 6, '#38bdf8');
          }
          e.shootTimer = 3.0;
        }
      } else if (e.role === 'support') {
        // 🛡️ [서포트형]: 아군 주변을 배회하며 치유(Healer) 또는 쉴드 버프(Buffer) 시전
        // 플레이어로부터 적당한 거리 유지
        if (dist > 380) {
          e.x += (dx / dist) * currentSpeed * 0.8 * dt;
          e.y += (dy / dist) * currentSpeed * 0.8 * dt;
        } else if (dist < 260) {
          e.x -= (dx / dist) * currentSpeed * dt;
          e.y -= (dy / dist) * currentSpeed * dt;
        }

        e.skillTimer -= dt;
        if (e.skillTimer <= 0) {
          if (e.type === 'healer') {
            // 주변 300px 내 부상당한 아군 적 치유
            for (const ally of this.enemies) {
              if (ally !== e && ally.hp < ally.maxHp) {
                const aDst = Math.hypot(ally.x - e.x, ally.y - e.y);
                if (aDst < 300) {
                  ally.hp = Math.min(ally.maxHp, ally.hp + ally.maxHp * 0.25);
                  window.particleSystem.emit(ally.x, ally.y, 4, '#10b981', 60, 2.5, 0.3);
                }
              }
            }
          } else if (e.type === 'shield_buffer') {
            // 주변 아군에게 방어막 오라 부여
            for (const ally of this.enemies) {
              if (ally !== e) {
                const aDst = Math.hypot(ally.x - e.x, ally.y - e.y);
                if (aDst < 250) {
                  ally.hasShieldBuff = true;
                  ally.shieldBuffTimer = 2.0;
                }
              }
            }
          }
          e.skillTimer = 3.5;
        }
      } else if (e.type === 'boss') {
        // 👑 [100배 엘리트 커맨더]: 돌진, 24방향 나선 탄막 & 광자포
        e.x += (dx / dist) * currentSpeed * dt;
        e.y += (dy / dist) * currentSpeed * dt;

        e.shootTimer -= dt;
        if (e.shootTimer <= 0) {
          // 24방향 나선형 전방위 탄막 난사
          for (let b = 0; b < 24; b++) {
            const angle = (b * Math.PI * 2) / 24 + gameTime * 1.5;
            this.fireEnemyBullet(e.x, e.y, angle, 220, e.damage * 0.35, 7, '#ff0055');
          }
          e.shootTimer = 2.2;
        }
      } else {
        // ⚔️ [근접형 (돌진 버서커 / 중장갑 분쇄자)]: 저돌적으로 플레이어 추격
        if (dist > 1) {
          e.x += (dx / dist) * currentSpeed * dt;
          e.y += (dy / dist) * currentSpeed * dt;
        }
      }

      // 버프 타이머 갱신
      if (e.hasShieldBuff) {
        e.shieldBuffTimer -= dt;
        if (e.shieldBuffTimer <= 0) e.hasShieldBuff = false;
      }

      // 적 상호 간 겹침 방지 (성능 최적화된 샘플링)
      if (!skipSeparation || i % 3 === 0) {
        const step = skipSeparation ? 4 : 1;
        for (let j = 0; j < enemyCount; j += step) {
          if (i === j) continue;
          const other = this.enemies[j];
          const sepDx = e.x - other.x;
          const sepDy = e.y - other.y;
          const sepDist = Math.hypot(sepDx, sepDy);
          const minDist = e.radius + other.radius;
          if (sepDist > 0 && sepDist < minDist) {
            const push = (minDist - sepDist) * 0.4;
            e.x += (sepDx / sepDist) * push * dt * 25;
            e.y += (sepDy / sepDist) * push * dt * 25;
          }
        }
      }

      // 플레이어와 접촉 대미지 검사
      if (dist < player.radius + e.radius) {
        player.takeDamage(e.damage * dt);
      }
    }

    // 3. 적 투사체 갱신
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const ep = this.enemyProjectiles[i];
      ep.life -= dt;
      if (ep.life <= 0) {
        this.enemyProjectiles.splice(i, 1);
        continue;
      }
      ep.x += ep.vx * dt;
      ep.y += ep.vy * dt;

      // 플레이어 피격 검사
      const pDst = Math.hypot(player.x - ep.x, player.y - ep.y);
      if (pDst < player.radius + ep.radius) {
        player.takeDamage(ep.damage);
        window.particleSystem.emit(ep.x, ep.y, 6, ep.color || '#ff0077', 80, 2.5, 0.2);
        this.enemyProjectiles.splice(i, 1);
      }
    }

    // 4. 에너지 젬 자석 흡입 및 획득 갱신
    const magnetRadius = player.stats.magnetRadius;
    for (let i = this.gems.length - 1; i >= 0; i--) {
      const gem = this.gems[i];
      const gDst = Math.hypot(player.x - gem.x, player.y - gem.y);

      if (gDst < magnetRadius || gem.isAttracted) {
        gem.isAttracted = true;
        const speed = Math.max(450, 1400 - gDst * 2);
        gem.x += ((player.x - gem.x) / gDst) * speed * dt;
        gem.y += ((player.y - gem.y) / gDst) * speed * dt;
      }

      if (gDst < player.radius + gem.radius) {
        if (gem.isMagnetOrb) {
          this.attractAllGems();
          window.particleSystem.triggerShake(5, 0.2);
        } else {
          player.addXp(gem.xp);
          if (gem.heal) player.heal(gem.heal);
          window.soundManager.playGem();
        }
        window.particleSystem.emit(gem.x, gem.y, 3, gem.color, 60, 2, 0.2);
        this.gems.splice(i, 1);
      }
    }
  }

  // --- 스폰 타임라인 및 난이도 관리 ---

  updateSpawning(dt, gameTime) {
    this.spawnTimer -= dt;
    this.waveNumber = Math.floor(gameTime / 20) + 1; // 20초당 1웨이브

    // 초반 10웨이브까지 5배 스폰, 10웨이브 이후 5웨이브마다 이전보다 5배씩 기하급수 증폭
    let waveSwarmFactor = 5;
    if (this.waveNumber > 10) {
      const post10Tier = Math.floor((this.waveNumber - 10) / 5) + 1;
      waveSwarmFactor = 5 * Math.pow(5, post10Tier);
    }

    // 웨이브별 최대 적 수 캡 확장 (250 ~ 2,500마리)
    if (this.waveNumber <= 10) {
      this.maxEnemies = 250;
    } else {
      const tier = Math.floor((this.waveNumber - 10) / 5) + 1;
      this.maxEnemies = Math.min(2500, Math.floor(250 * Math.pow(2.2, tier)));
    }

    this.spawnInterval = Math.max(0.08, 0.45 - (this.waveNumber * 0.008));

    if (this.spawnTimer <= 0) {
      this.spawnTimer = this.spawnInterval;

      if (this.enemies.length < this.maxEnemies) {
        const availableSlots = this.maxEnemies - this.enemies.length;
        const batchSize = Math.min(availableSlots, Math.min(35, Math.floor(3 + Math.sqrt(waveSwarmFactor) * 1.5)));
        for (let s = 0; s < batchSize; s++) {
          this.spawnRandomEnemy(gameTime, this.waveNumber);
        }
      }
    }

    // 👑 10웨이브마다 엘리트 커맨더 생성 (스탯 100배!)
    if (this.waveNumber % 10 === 0 && !this.bossSpawnedWaves.has(this.waveNumber)) {
      this.bossSpawnedWaves.add(this.waveNumber);
      this.spawnEliteBoss(gameTime, this.waveNumber);
      this.showWaveWarning(`🚨 WARNING: [WAVE ${this.waveNumber}] 100배 위력의 초거대 엘리트 커맨더 강림! 🚨`);
      window.soundManager.playWarning();
    }
  }

  // --- 4대 역할군 적 스폰 ---
  spawnRandomEnemy(gameTime, waveNumber) {
    const player = this.player;
    const spawnDist = 650 + Math.random() * 120;
    const angle = Math.random() * Math.PI * 2;
    const x = player.x + Math.cos(angle) * spawnDist;
    const y = player.y + Math.sin(angle) * spawnDist;

    const waveHpScale = 1 + (waveNumber - 1) * 0.22;
    const waveDmgScale = 1 + (waveNumber - 1) * 0.14;
    const waveArmor = Math.max(0, Math.floor((waveNumber - 1) * 2.2));

    const rand = Math.random();
    let type = 'melee_berserker';
    let role = 'melee';
    let baseHp = 22;
    let speed = 135;
    let radius = 12;
    let color = '#ff5500';
    let baseDamage = 12;
    let xp = 15;

    if (rand < 0.35) {
      // 1. ⚔️ 근접형 (돌진 버서커)
      type = 'melee_berserker';
      role = 'melee';
      baseHp = 22;
      speed = 145;
      radius = 12;
      color = '#ff5500';
      baseDamage = 12;
      xp = 15;
    } else if (rand < 0.55) {
      // 1. ⚔️ 근접형 (중장갑 분쇄자)
      type = 'heavy_crusher';
      role = 'melee';
      baseHp = 70;
      speed = 65;
      radius = 18;
      color = '#ff0077';
      baseDamage = 20;
      xp = 45;
    } else if (rand < 0.72) {
      // 2. 🎯 저격형 (광선 저격수)
      type = 'laser_sniper';
      role = 'sniper';
      baseHp = 32;
      speed = 100;
      radius = 14;
      color = '#a855f7';
      baseDamage = 22;
      xp = 50;
    } else if (rand < 0.88) {
      // 3. 🔮 마법형 (플라즈마 메이지)
      type = 'plasma_mage';
      role = 'mage';
      baseHp = 38;
      speed = 95;
      radius = 15;
      color = '#38bdf8';
      baseDamage = 16;
      xp = 55;
    } else {
      // 4. 🛡️ 서포트형 (치유 드론 or 쉴드 버퍼)
      const isHealer = Math.random() < 0.5;
      type = isHealer ? 'healer' : 'shield_buffer';
      role = 'support';
      baseHp = 45;
      speed = 110;
      radius = 14;
      color = isHealer ? '#10b981' : '#eab308';
      baseDamage = 8;
      xp = 65;
    }

    const hp = Math.round(baseHp * waveHpScale);
    const damage = Math.round(baseDamage * waveDmgScale);

    this.enemies.push({
      id: ++enemyIdCounter,
      type: type,
      role: role,
      x: x,
      y: y,
      hp: hp,
      maxHp: hp,
      armor: waveArmor,
      speed: speed,
      radius: radius,
      color: color,
      damage: damage,
      xp: xp,
      slowTimer: 0,
      slowFactor: 1,
      flashTimer: 0,
      shootTimer: Math.random() * 2 + 1,
      skillTimer: Math.random() * 2 + 1,
      isAiming: false,
      aimAngle: 0,
      hasShieldBuff: false,
      shieldBuffTimer: 0
    });
  }

  // 👑 [100배 엘리트 커맨더 스폰]
  spawnEliteBoss(gameTime, waveNumber) {
    const player = this.player;
    const angle = Math.random() * Math.PI * 2;
    const x = player.x + Math.cos(angle) * 750;
    const y = player.y + Math.sin(angle) * 750;

    // 기존 대비 100배 스탯 적용! (75,000 ~ 150,000+ HP)
    const bossTier = Math.floor(waveNumber / 10);
    const bossHp = Math.round(75000 * (1 + (bossTier - 1) * 0.6));
    const bossDamage = Math.round(150 * (1 + (bossTier - 1) * 0.4));
    const bossArmor = Math.floor(waveNumber * 5);

    const boss = {
      id: ++enemyIdCounter,
      type: 'boss',
      role: 'boss',
      name: `👑 [WAVE ${waveNumber}] 오메가 엘리트 커맨더`,
      x: x,
      y: y,
      hp: bossHp,
      maxHp: bossHp,
      armor: bossArmor,
      speed: 75,
      radius: 54, // 초대형 거대 코어
      color: '#ff0055',
      damage: bossDamage,
      xp: 25000, // 즉시 3~4 레벨업 분량의 대량 XP
      slowTimer: 0,
      slowFactor: 1,
      flashTimer: 0,
      shootTimer: 2.0
    };

    this.enemies.push(boss);
    this.activeBoss = boss;
  }

  fireEnemyBullet(x, y, angle, speed, damage, radius = 5, color = '#ff0055') {
    this.enemyProjectiles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      damage: damage,
      radius: radius,
      color: color,
      life: 4.0
    });
  }

  // --- 대미지 & 처치 (방어력 및 버프 감쇄 적용) ---

  damageEnemy(enemy, rawDamage, isCrit = false) {
    let effectiveArmor = enemy.armor || 0;
    if (enemy.hasShieldBuff) effectiveArmor += 20; // 쉴드 버프 시 방어력 +20

    let actualDamage = Math.max(1, Math.round(rawDamage - effectiveArmor));
    if (enemy.hasShieldBuff) actualDamage = Math.max(1, Math.round(actualDamage * 0.6)); // 40% 피해 감소

    enemy.hp -= actualDamage;
    enemy.flashTimer = 0.08;
    this.totalDamageDealt += actualDamage;

    window.soundManager.playHit();
    window.particleSystem.addFloatingText(actualDamage, enemy.x, enemy.y, isCrit);

    if (enemy.hp <= 0) {
      this.killEnemy(enemy);
    }
  }

  killEnemy(enemy) {
    const idx = this.enemies.indexOf(enemy);
    if (idx === -1) return;

    this.enemies.splice(idx, 1);
    this.totalKills++;

    const isBoss = enemy.type === 'boss';
    if (isBoss) {
      this.activeBoss = null;
      window.soundManager.playExplosion(true);
      window.soundManager.playLevelUp();
      window.particleSystem.triggerShake(25, 0.8);
      window.particleSystem.emit(enemy.x, enemy.y, 80, '#ffd700', 300, 6, 0.8);
      window.particleSystem.emitShockwave(enemy.x, enemy.y, 250, '#ff0077', 0.6);

      // 전 화면 몬스터 소멸 충격파
      for (const e of this.enemies) {
        if (e !== enemy) {
          e.hp -= 2000;
        }
      }

      // 초대형 레전더리 무지개 코어 드롭 (풀피 회복 + 대량 XP + 마그넷)
      this.gems.push({
        x: enemy.x,
        y: enemy.y,
        xp: enemy.xp,
        heal: 999, // 100% 풀피 회복
        radius: 16,
        color: '#ffd700',
        isAttracted: false
      });
      this.gems.push({
        x: enemy.x + 30,
        y: enemy.y,
        isMagnetOrb: true,
        radius: 12,
        color: '#00f0ff',
        isAttracted: false
      });
    } else {
      window.soundManager.playExplosion(false);
      window.particleSystem.emit(enemy.x, enemy.y, 10, enemy.color, 110, 3, 0.35);

      const dropRoll = Math.random();
      if (dropRoll < 0.035) {
        // 마그넷 오브
        this.gems.push({
          x: enemy.x,
          y: enemy.y,
          isMagnetOrb: true,
          radius: 8,
          color: '#00f0ff',
          isAttracted: false
        });
      } else if (dropRoll < 0.08) {
        // 체력 20 회복 하트
        this.gems.push({
          x: enemy.x,
          y: enemy.y,
          xp: enemy.xp,
          heal: 20,
          radius: 7,
          color: '#10b981',
          isAttracted: false
        });
      } else {
        const isRare = dropRoll < 0.20;
        this.gems.push({
          x: enemy.x,
          y: enemy.y,
          xp: isRare ? enemy.xp * 2.5 : enemy.xp,
          radius: isRare ? 7 : 4.5,
          color: isRare ? '#b026ff' : '#00f0ff',
          isAttracted: false
        });
      }
    }
  }

  attractAllGems() {
    for (const gem of this.gems) {
      gem.isAttracted = true;
    }
  }

  getClosestEnemy(x, y, maxRange = 600) {
    let closest = null;
    let minDist = maxRange;
    for (const e of this.enemies) {
      const dst = Math.hypot(e.x - x, e.y - y);
      if (dst < minDist) {
        minDist = dst;
        closest = e;
      }
    }
    return closest;
  }

  showWaveWarning(text) {
    const banner = document.getElementById('warning-banner');
    if (banner) {
      banner.querySelector('.warning-text').innerText = text;
      banner.classList.remove('hidden');
      setTimeout(() => {
        banner.classList.add('hidden');
      }, 4000);
    }
  }

  // --- 렌더링 ---

  render(ctx, camera) {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // 1. 에너지 젬 렌더링
    for (const g of this.gems) {
      ctx.save();
      ctx.fillStyle = g.color;
      ctx.shadowColor = g.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(g.x, g.y - g.radius);
      ctx.lineTo(g.x + g.radius, g.y);
      ctx.lineTo(g.x, g.y + g.radius);
      ctx.lineTo(g.x - g.radius, g.y);
      ctx.closePath();
      ctx.fill();

      if (g.isMagnetOrb || g.heal > 100) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. 적 투사체 렌더링
    for (const ep of this.enemyProjectiles) {
      ctx.save();
      ctx.fillStyle = ep.color;
      ctx.shadowColor = ep.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ep.x, ep.y, ep.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. 적 군단 렌더링
    for (const e of this.enemies) {
      ctx.save();
      const isFlashing = e.flashTimer > 0;
      ctx.fillStyle = isFlashing ? '#ffffff' : e.color;
      ctx.shadowColor = e.color;
      ctx.shadowBlur = e.type === 'boss' ? 30 : 10;

      // 저격수 조준 레이저선 렌더링
      if (e.isAiming) {
        ctx.save();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(e.x + Math.cos(e.aimAngle) * 600, e.y + Math.sin(e.aimAngle) * 600);
        ctx.stroke();
        ctx.restore();
      }

      // 역할군별 전용 외형 드로잉
      ctx.beginPath();
      if (e.type === 'boss') {
        // 👑 100배 엘리트 커맨더: 거대 12각형 스타 코어 + 회전 오라
        const sides = 12;
        for (let s = 0; s < sides; s++) {
          const a = (s * Math.PI * 2) / sides + Date.now() * 0.001;
          const r = s % 2 === 0 ? e.radius : e.radius * 0.75;
          const px = e.x + Math.cos(a) * r;
          const py = e.y + Math.sin(a) * r;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
      } else if (e.role === 'sniper') {
        // 🎯 저격수: 다이아몬드 / 마름모
        ctx.moveTo(e.x, e.y - e.radius * 1.3);
        ctx.lineTo(e.x + e.radius, e.y);
        ctx.lineTo(e.x, e.y + e.radius * 1.3);
        ctx.lineTo(e.x - e.radius, e.y);
        ctx.closePath();
      } else if (e.role === 'mage') {
        // 🔮 마법사: 6각 룬 헥사곤
        const sides = 6;
        for (let s = 0; s < sides; s++) {
          const a = (s * Math.PI * 2) / sides;
          const px = e.x + Math.cos(a) * e.radius;
          const py = e.y + Math.sin(a) * e.radius;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
      } else if (e.role === 'support') {
        // 🛡️ 서포트 (치유/버퍼): 십자 윙 형상
        const r = e.radius;
        ctx.rect(e.x - r * 0.35, e.y - r, r * 0.7, r * 2);
        ctx.rect(e.x - r, e.y - r * 0.35, r * 2, r * 0.7);
      } else if (e.type === 'heavy_crusher') {
        // ⚔️ 근접 중장갑: 견고한 사각형 큐브
        ctx.rect(e.x - e.radius, e.y - e.radius, e.radius * 2, e.radius * 2);
      } else {
        // ⚔️ 근접 버서커: 날카로운 전방위 삼각형
        const angle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
        ctx.translate(e.x, e.y);
        ctx.rotate(angle);
        ctx.moveTo(e.radius * 1.4, 0);
        ctx.lineTo(-e.radius * 0.9, -e.radius * 0.85);
        ctx.lineTo(-e.radius * 0.4, 0);
        ctx.lineTo(-e.radius * 0.9, e.radius * 0.85);
        ctx.closePath();
      }
      ctx.fill();

      // 쉴드 버프 오라 링
      if (e.hasShieldBuff) {
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 슬로우 오라
      if (e.slowTimer > 0) {
        ctx.strokeStyle = '#55d0ff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // HP 바 렌더링
      if (e.type === 'boss' || e.hp < e.maxHp) {
        const barW = e.radius * 2.4;
        const barH = e.type === 'boss' ? 8 : 4;
        const barX = (e.role === 'melee' && e.type !== 'heavy_crusher' ? 0 : e.x) - barW / 2;
        const barY = (e.role === 'melee' && e.type !== 'heavy_crusher' ? 0 : e.y) - e.radius - 12;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX, barY, barW, barH);

        const hpRatio = Math.max(0, e.hp / e.maxHp);
        ctx.fillStyle = e.type === 'boss' ? '#ff0055' : '#00ff66';
        ctx.fillRect(barX, barY, barW * hpRatio, barH);

        if (e.type === 'boss') {
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(barX, barY, barW, barH);
        }
      }

      ctx.restore();
    }

    ctx.restore();
  }

  clear() {
    this.enemies = [];
    this.gems = [];
    this.enemyProjectiles = [];
    this.bossSpawnedWaves = new Set();
    this.totalKills = 0;
    this.totalDamageDealt = 0;
    this.waveNumber = 1;
    this.activeBoss = null;
  }
}

window.EnemyManager = EnemyManager;
