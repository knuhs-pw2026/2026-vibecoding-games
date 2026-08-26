/**
 * 네온 서바이벌 무기 및 투사체 시스템
 */
class WeaponSystem {
  constructor(player) {
    this.player = player;
    this.weapons = {};
    this.projectiles = [];
    this.activeBeams = []; // 레이저 빔 지속 연출용

    // 기본 무기 등록
    this.initDefaultWeapons();
  }

  initDefaultWeapons() {
    // 1. 펄스 블래스터 (기본 지급)
    this.weapons.blaster = {
      id: 'blaster',
      name: '펄스 블래스터',
      evolvedName: '👑 오메가 하이퍼 개틀링',
      icon: '🔫',
      evolvedIcon: '🔱',
      level: 1,
      maxLevel: 6, // 6레벨: 초월 승급
      cooldown: 0.45,
      timer: 0,
      baseDamage: 25,
      speed: 680,
      projectiles: 1,
      pierce: 1,
      color: '#00f0ff'
    };

    // 2. 플라즈마 오비탈 (회전 구체: 반경 130px~250px 및 크기 대폭 확장)
    this.weapons.orbital = {
      id: 'orbital',
      name: '플라즈마 오비탈',
      evolvedName: '👑 갤럭시 슈퍼노바 성운',
      icon: '🔮',
      evolvedIcon: '🌌',
      level: 0,
      maxLevel: 6,
      angle: 0,
      radius: 130, // 기본 반경을 85 -> 130으로 대폭 확장
      orbSize: 14,  // 구체 크기를 7 -> 14로 2배 확대
      count: 2,
      speed: 3.6,
      baseDamage: 25,
      hitCooldowns: new Map(),
      color: '#b026ff'
    };

    this.weapons.lightning = {
      id: 'lightning',
      name: '체인 라이트닝',
      evolvedName: '👑 신의 심판 묠니르',
      icon: '⚡',
      evolvedIcon: '⚡👑',
      level: 0,
      maxLevel: 6,
      cooldown: 2.0,
      timer: 0,
      baseDamage: 45,
      chains: 3,
      range: 420,
      color: '#ffcc00'
    };

    this.weapons.missile = {
      id: 'missile',
      name: '호밍 마이크로 미사일',
      evolvedName: '👑 아포칼립스 MIRV 핵미사일',
      icon: '🚀',
      evolvedIcon: '☄️',
      level: 0,
      maxLevel: 6,
      cooldown: 1.8,
      timer: 0,
      baseDamage: 60,
      count: 1,
      speed: 390,
      explosionRadius: 60,
      color: '#ff0077'
    };

    this.weapons.laser_nova = {
      id: 'laser_nova',
      name: '레이저 노바',
      evolvedName: '👑 제로-디멘션 슈퍼노바',
      icon: '✨',
      evolvedIcon: '💥',
      level: 0,
      maxLevel: 6,
      cooldown: 3.2,
      timer: 0,
      baseDamage: 75,
      beamCount: 2,
      duration: 0.40,
      width: 16,
      color: '#818cf8' // 눈부심 없는 부드러운 라벤더 인디고
    };

    this.weapons.cryo = {
      id: 'cryo',
      name: '초저온 동결 필드',
      evolvedName: '👑 절대영도 빙하기 엠파이어',
      icon: '❄️',
      evolvedIcon: '🧊',
      level: 0,
      maxLevel: 6,
      radius: 130, // 90 -> 130으로 확장
      tickCooldown: 0.45,
      timer: 0,
      baseDamage: 15,
      slowFactor: 0.40,
      color: '#55d0ff'
    };
  }

  // 스킬/무기 레벨업 & 6레벨 초월 승급 적용
  upgradeWeapon(id) {
    const w = this.weapons[id];
    if (!w) return;
    w.level++;

    if (id === 'blaster') {
      if (w.level === 2) { w.projectiles = 2; w.baseDamage = 35; w.cooldown = 0.40; }
      else if (w.level === 3) { w.projectiles = 3; w.baseDamage = 48; w.pierce = 2; w.cooldown = 0.35; }
      else if (w.level === 4) { w.projectiles = 4; w.baseDamage = 65; w.pierce = 2; w.cooldown = 0.30; }
      else if (w.level === 5) { w.projectiles = 5; w.baseDamage = 85; w.pierce = 3; w.cooldown = 0.25; }
      else if (w.level >= 6) { 
        // 👑 [초월 승급] 오메가 하이퍼 개틀링
        w.name = w.evolvedName;
        w.icon = w.evolvedIcon;
        w.projectiles = 8;
        w.baseDamage = 180;
        w.pierce = 5;
        w.cooldown = 0.12; // 초고속 레이저 난사
        w.color = '#ffff00';
      }
    } else if (id === 'orbital') {
      if (w.level === 1) { w.count = 2; w.radius = 130; w.orbSize = 15; }
      else if (w.level === 2) { w.count = 3; w.speed = 4.2; w.baseDamage = 38; w.radius = 150; w.orbSize = 17; }
      else if (w.level === 3) { w.count = 4; w.speed = 4.8; w.baseDamage = 55; w.radius = 175; w.orbSize = 19; }
      else if (w.level === 4) { w.count = 5; w.speed = 5.4; w.baseDamage = 75; w.radius = 200; w.orbSize = 21; }
      else if (w.level === 5) { w.count = 6; w.speed = 6.0; w.baseDamage = 100; w.radius = 225; w.orbSize = 23; }
      else if (w.level >= 6) {
        // 👑 [초월 승급] 갤럭시 슈퍼노바 성운 (2중 궤도 12개 초대형 구체)
        w.name = w.evolvedName;
        w.icon = w.evolvedIcon;
        w.count = 12;
        w.radius = 240;
        w.orbSize = 26; // 거대 초신성 구체
        w.speed = 7.5;
        w.baseDamage = 260;
        w.color = '#ff00ff';
      }
    } else if (id === 'lightning') {
      if (w.level === 1) { w.chains = 3; }
      else if (w.level === 2) { w.chains = 4; w.baseDamage = 65; w.cooldown = 1.7; }
      else if (w.level === 3) { w.chains = 5; w.baseDamage = 95; w.cooldown = 1.4; }
      else if (w.level === 4) { w.chains = 7; w.baseDamage = 130; w.cooldown = 1.2; }
      else if (w.level === 5) { w.chains = 9; w.baseDamage = 175; w.cooldown = 1.0; }
      else if (w.level >= 6) {
        // 👑 [초월 승급] 신의 심판 묠니르
        w.name = w.evolvedName;
        w.icon = w.evolvedIcon;
        w.chains = 25; // 25명 전 화면 연쇄 벼락
        w.baseDamage = 450;
        w.cooldown = 0.55;
        w.range = 650;
        w.color = '#00ffff';
      }
    } else if (id === 'missile') {
      if (w.level === 1) { w.count = 1; }
      else if (w.level === 2) { w.count = 2; w.baseDamage = 90; w.explosionRadius = 70; w.cooldown = 1.5; }
      else if (w.level === 3) { w.count = 3; w.baseDamage = 130; w.explosionRadius = 85; w.cooldown = 1.3; }
      else if (w.level === 4) { w.count = 4; w.baseDamage = 175; w.explosionRadius = 100; w.cooldown = 1.1; }
      else if (w.level === 5) { w.count = 5; w.baseDamage = 230; w.explosionRadius = 115; w.cooldown = 0.9; }
      else if (w.level >= 6) {
        // 👑 [초월 승급] 아포칼립스 MIRV 핵미사일
        w.name = w.evolvedName;
        w.icon = w.evolvedIcon;
        w.count = 8;
        w.baseDamage = 550;
        w.explosionRadius = 180; // 초대형 핵폭발
        w.cooldown = 0.55;
        w.speed = 480;
        w.color = '#ff3300';
      }
    } else if (id === 'laser_nova') {
      if (w.level === 1) { w.beamCount = 2; }
      else if (w.level === 2) { w.beamCount = 4; w.baseDamage = 115; w.width = 18; w.cooldown = 2.7; }
      else if (w.level === 3) { w.beamCount = 6; w.baseDamage = 160; w.width = 22; w.cooldown = 2.3; }
      else if (w.level === 4) { w.beamCount = 8; w.baseDamage = 215; w.width = 26; w.cooldown = 1.9; }
      else if (w.level === 5) { w.beamCount = 10; w.baseDamage = 280; w.width = 30; w.cooldown = 1.5; }
      else if (w.level >= 6) {
        // 👑 [초월 승급] 제로-디멘션 슈퍼노바
        w.name = w.evolvedName;
        w.icon = w.evolvedIcon;
        w.beamCount = 16; // 16방향 360도 거대 광자포
        w.baseDamage = 700;
        w.width = 38;
        w.cooldown = 1.0;
        w.color = '#a855f7'; // 눈부심 없는 부드러운 퍼플 바이올렛
      }
    } else if (id === 'cryo') {
      if (w.level === 1) { w.radius = 130; }
      else if (w.level === 2) { w.radius = 160; w.slowFactor = 0.50; w.baseDamage = 25; }
      else if (w.level === 3) { w.radius = 195; w.slowFactor = 0.60; w.baseDamage = 42; }
      else if (w.level === 4) { w.radius = 230; w.slowFactor = 0.70; w.baseDamage = 65; }
      else if (w.level === 5) { w.radius = 270; w.slowFactor = 0.80; w.baseDamage = 95; }
      else if (w.level >= 6) {
        // 👑 [초월 승급] 절대영도 빙하기 엠파이어
        w.name = w.evolvedName;
        w.icon = w.evolvedIcon;
        w.radius = 360; // 초대형 빙하기
        w.slowFactor = 0.95; // 95% 완전 동결
        w.baseDamage = 260;
        w.color = '#00ffff';
      }
    }
  }

  // 전체 무기 프레임 갱신
  update(dt, enemyManager) {
    const enemies = enemyManager.enemies;
    const player = this.player;

    // 1. 펄스 블래스터 갱신
    const blaster = this.weapons.blaster;
    if (blaster.level > 0) {
      blaster.timer -= dt;
      const actualCd = blaster.cooldown * player.stats.cooldownMult;
      if (blaster.timer <= 0) {
        const target = enemyManager.getClosestEnemy(player.x, player.y, 650);
        if (target) {
          this.fireBlaster(target);
          blaster.timer = actualCd;
        }
      }
    }

    // 2. 플라즈마 오비탈 갱신 (대형 구체 & 2중 궤도)
    const orbital = this.weapons.orbital;
    if (orbital.level > 0) {
      orbital.angle += orbital.speed * dt;
      // 오비탈 타격 쿨다운 해제
      for (const [eId, time] of orbital.hitCooldowns.entries()) {
        if (time - dt <= 0) {
          orbital.hitCooldowns.delete(eId);
        } else {
          orbital.hitCooldowns.set(eId, time - dt);
        }
      }

      const orbRadius = orbital.orbSize || 16;
      const isEvolved = orbital.level >= 6;

      // 6레벨 초월 시 2중 궤도(내부/외부 6개씩) 회전
      for (let i = 0; i < orbital.count; i++) {
        let curRadius = orbital.radius;
        let curAngle = orbital.angle + (i * Math.PI * 2) / orbital.count;

        if (isEvolved) {
          if (i % 2 === 0) {
            curRadius = orbital.radius * 0.62; // 내부 궤도 (150px)
            curAngle = -orbital.angle * 1.2 + (i * Math.PI * 2) / orbital.count;
          } else {
            curRadius = orbital.radius; // 외부 궤도 (240px)
          }
        }

        const ox = player.x + Math.cos(curAngle) * curRadius;
        const oy = player.y + Math.sin(curAngle) * curRadius;

        // 대형 네온 파티클 방출
        if (Math.random() < 0.4) {
          window.particleSystem.emit(ox, oy, 1, isEvolved ? '#ff00ff' : orbital.color, 30, isEvolved ? 4 : 2.5, 0.25);
        }

        // 적 충돌 검사
        for (const enemy of enemies) {
          if (orbital.hitCooldowns.has(enemy.id)) continue;
          const dist = Math.hypot(enemy.x - ox, enemy.y - oy);
          if (dist < enemy.radius + orbRadius) {
            const dmg = player.calculateDamage(orbital.baseDamage);
            enemyManager.damageEnemy(enemy, dmg.damage, dmg.isCrit);
            orbital.hitCooldowns.set(enemy.id, isEvolved ? 0.15 : 0.22);
            window.particleSystem.emit(ox, oy, isEvolved ? 10 : 5, orbital.color, 120, 3.5, 0.3);
          }
        }
      }
    }

    // 3. 체인 라이트닝 갱신
    const lightning = this.weapons.lightning;
    if (lightning.level > 0) {
      lightning.timer -= dt;
      const actualCd = lightning.cooldown * player.stats.cooldownMult;
      if (lightning.timer <= 0) {
        const target = enemyManager.getClosestEnemy(player.x, player.y, lightning.range);
        if (target) {
          this.triggerLightningChain(target, enemyManager);
          lightning.timer = actualCd;
        }
      }
    }

    // 4. 호밍 미사일 갱신
    const missile = this.weapons.missile;
    if (missile.level > 0) {
      missile.timer -= dt;
      const actualCd = missile.cooldown * player.stats.cooldownMult;
      if (missile.timer <= 0) {
        if (enemies.length > 0) {
          this.fireMissiles(missile.count, enemyManager);
          missile.timer = actualCd;
        }
      }
    }

    // 5. 레이저 노바 갱신
    const laser = this.weapons.laser_nova;
    if (laser.level > 0) {
      laser.timer -= dt;
      const actualCd = laser.cooldown * player.stats.cooldownMult;
      if (laser.timer <= 0) {
        this.fireLaserNova(enemyManager);
        laser.timer = actualCd;
      }
    }

    // 6. 초저온 동결 필드 갱신
    const cryo = this.weapons.cryo;
    if (cryo.level > 0) {
      cryo.timer -= dt;
      if (cryo.timer <= 0) {
        cryo.timer = cryo.tickCooldown;
        for (const enemy of enemies) {
          const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
          if (dist < cryo.radius + enemy.radius) {
            enemy.slowTimer = 0.8;
            enemy.slowFactor = cryo.slowFactor;
            const dmg = player.calculateDamage(cryo.baseDamage);
            enemyManager.damageEnemy(enemy, dmg.damage, dmg.isCrit);
            window.particleSystem.emit(enemy.x, enemy.y, 2, cryo.color, 40, 2, 0.2);
          }
        }
      }
    }

    // 지속 레이저 빔 갱신
    for (let i = this.activeBeams.length - 1; i >= 0; i--) {
      const beam = this.activeBeams[i];
      beam.life -= dt;
      if (beam.life <= 0) {
        this.activeBeams.splice(i, 1);
      }
    }

    // 투사체 업데이트 및 충돌 검사
    this.updateProjectiles(dt, enemyManager);
  }

  // --- 발사 로직 구현 ---

  fireBlaster(target) {
    const w = this.weapons.blaster;
    const player = this.player;
    const baseAngle = Math.atan2(target.y - player.y, target.x - player.x);

    window.soundManager.playShoot('laser');

    const spreadAngle = 0.15;
    const count = w.projectiles;
    const startAngle = baseAngle - ((count - 1) * spreadAngle) / 2;

    for (let i = 0; i < count; i++) {
      const angle = startAngle + i * spreadAngle;
      this.projectiles.push({
        type: 'bullet',
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * w.speed,
        vy: Math.sin(angle) * w.speed,
        damage: w.baseDamage,
        pierce: w.pierce,
        radius: 4.5,
        color: w.color,
        life: 1.2,
        hitEnemies: new Set()
      });
    }
  }

  fireMissiles(count, enemyManager) {
    const player = this.player;
    const w = this.weapons.missile;
    window.soundManager.playShoot('missile');

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      this.projectiles.push({
        type: 'missile',
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * (w.speed * 0.5),
        vy: Math.sin(angle) * (w.speed * 0.5),
        target: null,
        damage: w.baseDamage,
        explosionRadius: w.explosionRadius,
        speed: w.speed,
        radius: 6,
        color: w.color,
        life: 3.5,
        turnRate: 4.5
      });
    }
  }

  triggerLightningChain(firstTarget, enemyManager) {
    const w = this.weapons.lightning;
    const player = this.player;
    const enemies = enemyManager.enemies;
    window.soundManager.playLightning();

    const hitTargets = [firstTarget];
    let currentTarget = firstTarget;

    const dmg = player.calculateDamage(w.baseDamage);
    enemyManager.damageEnemy(firstTarget, dmg.damage, dmg.isCrit);
    window.particleSystem.emit(firstTarget.x, firstTarget.y, 8, w.color, 120, 3, 0.4);

    // 체인 점프
    for (let jump = 1; jump < w.chains; jump++) {
      let nextTarget = null;
      let minDst = 200;

      for (const e of enemies) {
        if (hitTargets.includes(e)) continue;
        const dst = Math.hypot(e.x - currentTarget.x, e.y - currentTarget.y);
        if (dst < minDst) {
          minDst = dst;
          nextTarget = e;
        }
      }

      if (nextTarget) {
        hitTargets.push(nextTarget);
        const jDmg = player.calculateDamage(w.baseDamage * 0.85);
        enemyManager.damageEnemy(nextTarget, jDmg.damage, jDmg.isCrit);
        window.particleSystem.emit(nextTarget.x, nextTarget.y, 6, w.color, 100, 3, 0.3);
        currentTarget = nextTarget;
      } else {
        break;
      }
    }

    // 체인 번개 궤적 빔 등록
    for (let i = 0; i < hitTargets.length; i++) {
      const from = i === 0 ? player : hitTargets[i - 1];
      const to = hitTargets[i];
      this.activeBeams.push({
        type: 'lightning',
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
        color: w.color,
        life: 0.15,
        maxLife: 0.15
      });
    }
  }

  fireLaserNova(enemyManager) {
    const w = this.weapons.laser_nova;
    const player = this.player;
    window.soundManager.playShoot('laser');
    window.particleSystem.triggerShake(5, 0.2);

    const count = w.beamCount;
    const baseAngle = Math.random() * Math.PI;

    for (let i = 0; i < count; i++) {
      const angle = baseAngle + (i * Math.PI * 2) / count;
      const length = 750;
      const endX = player.x + Math.cos(angle) * length;
      const endY = player.y + Math.sin(angle) * length;

      this.activeBeams.push({
        type: 'laser',
        x1: player.x,
        y1: player.y,
        x2: endX,
        y2: endY,
        angle: angle,
        width: w.width,
        color: w.color,
        life: w.duration,
        maxLife: w.duration
      });

      // 레이저 선분과 적 충돌 검사
      for (const enemy of enemyManager.enemies) {
        // 점과 선분 사이의 거리 계산
        const dist = this.distToSegment(enemy.x, enemy.y, player.x, player.y, endX, endY);
        if (dist < enemy.radius + w.width / 2) {
          const dmg = player.calculateDamage(w.baseDamage);
          enemyManager.damageEnemy(enemy, dmg.damage, dmg.isCrit);
          window.particleSystem.emit(enemy.x, enemy.y, 8, w.color, 140, 3.5, 0.4);
        }
      }
    }
  }

  distToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  // --- 투사체 업데이트 ---

  updateProjectiles(dt, enemyManager) {
    const enemies = enemyManager.enemies;
    const player = this.player;

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= dt;

      if (p.life <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // 미사일 유도 처리
      if (p.type === 'missile') {
        if (!p.target || p.target.hp <= 0) {
          p.target = enemyManager.getClosestEnemy(p.x, p.y, 600);
        }
        if (p.target) {
          const desiredAngle = Math.atan2(p.target.y - p.y, p.target.x - p.x);
          const currentAngle = Math.atan2(p.vy, p.vx);
          let diff = desiredAngle - currentAngle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          const newAngle = currentAngle + Math.sign(diff) * Math.min(Math.abs(diff), p.turnRate * dt);
          p.vx = Math.cos(newAngle) * p.speed;
          p.vy = Math.sin(newAngle) * p.speed;
        }

        // 미사일 배기 가스 파티클
        if (Math.random() < 0.5) {
          window.particleSystem.emit(p.x, p.y, 1, '#ff5500', 30, 2, 0.2);
        }
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // 충돌 검사
      let projectileDestroyed = false;

      for (const enemy of enemies) {
        if (p.type === 'bullet' && p.hitEnemies.has(enemy.id)) continue;

        const dst = Math.hypot(enemy.x - p.x, enemy.y - p.y);
        if (dst < enemy.radius + p.radius) {
          if (p.type === 'bullet') {
            const dmg = player.calculateDamage(p.damage);
            enemyManager.damageEnemy(enemy, dmg.damage, dmg.isCrit);
            p.hitEnemies.add(enemy.id);
            p.pierce--;
            window.particleSystem.emit(p.x, p.y, 4, p.color, 80, 2.5, 0.25);

            if (p.pierce <= 0) {
              projectileDestroyed = true;
              break;
            }
          } else if (p.type === 'missile') {
            // 미사일 폭발 (AoE 대미지)
            window.soundManager.playExplosion(false);
            window.particleSystem.triggerShake(6, 0.25);
            window.particleSystem.emitShockwave(p.x, p.y, p.explosionRadius, p.color, 0.35);
            window.particleSystem.emit(p.x, p.y, 16, p.color, 180, 4, 0.4);

            for (const splashTarget of enemies) {
              const sDst = Math.hypot(splashTarget.x - p.x, splashTarget.y - p.y);
              if (sDst <= p.explosionRadius + splashTarget.radius) {
                const dmg = player.calculateDamage(p.damage);
                enemyManager.damageEnemy(splashTarget, dmg.damage, dmg.isCrit);
              }
            }
            projectileDestroyed = true;
            break;
          }
        }
      }

      if (projectileDestroyed) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  // --- 렌더링 ---

  render(ctx, camera) {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    const player = this.player;

    // 1. 초저온 필드 렌더링
    const cryo = this.weapons.cryo;
    if (cryo.level > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(85, 208, 255, 0.06)';
      ctx.strokeStyle = 'rgba(85, 208, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(player.x, player.y, cryo.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 2. 오비탈 구체 렌더링 (확대된 크기 & 초월 2중 궤도)
    const orbital = this.weapons.orbital;
    if (orbital.level > 0) {
      const orbRadius = orbital.orbSize || 16;
      const isEvolved = orbital.level >= 6;

      for (let i = 0; i < orbital.count; i++) {
        let curRadius = orbital.radius;
        let curAngle = orbital.angle + (i * Math.PI * 2) / orbital.count;

        if (isEvolved) {
          if (i % 2 === 0) {
            curRadius = orbital.radius * 0.62;
            curAngle = -orbital.angle * 1.2 + (i * Math.PI * 2) / orbital.count;
          }
        }

        const ox = player.x + Math.cos(curAngle) * curRadius;
        const oy = player.y + Math.sin(curAngle) * curRadius;

        ctx.save();
        ctx.fillStyle = orbital.color;
        ctx.shadowColor = isEvolved ? '#ff00ff' : orbital.color;
        ctx.shadowBlur = isEvolved ? 22 : 14;

        // 외곽 플라즈마 링
        ctx.beginPath();
        ctx.arc(ox, oy, orbRadius, 0, Math.PI * 2);
        ctx.fill();

        // 내부 고에너지 코어
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ox, oy, orbRadius * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // 초월 시 별빛 코어 스파크
        if (isEvolved) {
          ctx.strokeStyle = '#ffff00';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ox, oy, orbRadius * 1.3, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    // 3. 레이저 & 체인 빔 렌더링
    for (const beam of this.activeBeams) {
      const alpha = beam.life / beam.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = beam.color;
      ctx.shadowColor = beam.color;
      ctx.shadowBlur = 15;

      if (beam.type === 'lightning') {
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(beam.x1, beam.y1);
        // 지그재그 번개 라인
        const midX = (beam.x1 + beam.x2) / 2 + (Math.random() * 20 - 10);
        const midY = (beam.y1 + beam.y2) / 2 + (Math.random() * 20 - 10);
        ctx.lineTo(midX, midY);
        ctx.lineTo(beam.x2, beam.y2);
        ctx.stroke();
      } else if (beam.type === 'laser') {
        ctx.shadowBlur = 6;
        ctx.lineWidth = beam.width * alpha;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(beam.x1, beam.y1);
        ctx.lineTo(beam.x2, beam.y2);
        ctx.stroke();

        // 부드럽고 눈에 편안한 파스텔톤 내부 코어
        ctx.strokeStyle = 'rgba(238, 242, 255, 0.6)';
        ctx.lineWidth = beam.width * 0.35 * alpha;
        ctx.beginPath();
        ctx.moveTo(beam.x1, beam.y1);
        ctx.lineTo(beam.x2, beam.y2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 4. 투사체 렌더링
    for (const p of this.projectiles) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;

      if (p.type === 'bullet') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'missile') {
        const angle = Math.atan2(p.vy, p.vx);
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(-6, -4);
        ctx.lineTo(-4, 0);
        ctx.lineTo(-6, 4);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.restore();
  }

  clear() {
    this.projectiles = [];
    this.activeBeams = [];
    this.initDefaultWeapons();
  }
}

window.WeaponSystem = WeaponSystem;
