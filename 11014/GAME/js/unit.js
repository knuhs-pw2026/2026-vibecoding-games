/**
 * ANCIENT CASTLE GUARDIANS: HERO & ENEMY UNITS ENGINE
 * Manages deployed heroes (Wall & Ground), auto-attacks, exclusive skills,
 * and diverse enemy races (Orcs, Undead, Demons, Elves, Golems, Dragons, Bosses).
 */

class HeroUnit {
  constructor(heroData, slotIndex, game) {
    this.game = game;
    this.data = heroData; // Base Hero definition
    this.slotIndex = slotIndex;

    // Slot position coordinates (Left Castle Area)
    this.isWall = (heroData.position === 'wall');
    this.baseX = this.isWall ? (140 - (slotIndex % 4) * 25) : (270 + (slotIndex % 4) * 35);
    this.baseY = 140 + slotIndex * 70;
    this.x = this.baseX;
    this.y = this.baseY;
    this.radius = 20;

    // Level & Enhancements from player profile
    this.level = heroData.level || 1;
    this.exclusiveWeapon = heroData.exclusiveWeapon || null;

    // Calculated Stats
    this.recalculateStats();

    // Combat State
    this.atkCooldown = 0;
    this.skillCooldown = 0;
    this.maxSkillCooldown = heroData.skillCooldown || 10;
    this.attackAnimTimer = 0;
    this.target = null;
    this.isDead = false;
  }

  recalculateStats() {
    const lvlMultiplier = 1 + (this.level - 1) * 0.15;
    let baseAtk = this.data.baseAtk * lvlMultiplier;
    let baseDef = this.data.baseDef * lvlMultiplier;
    let baseHp = this.data.baseHp * lvlMultiplier;

    // Add Exclusive Weapon Stats
    if (this.exclusiveWeapon) {
      baseAtk += (this.exclusiveWeapon.currentAtk || this.exclusiveWeapon.baseAtk);
      baseDef += (this.exclusiveWeapon.currentDef || this.exclusiveWeapon.baseDef);
    }

    this.maxHp = Math.floor(baseHp);
    this.currentHp = this.maxHp;
    this.atk = Math.floor(baseAtk);
    this.def = Math.floor(baseDef);
    this.range = this.data.range;
    this.atkSpeed = this.data.atkSpeed;
    this.element = this.data.element;
  }

  update(dt) {
    if (this.isDead) return;

    if (this.atkCooldown > 0) this.atkCooldown -= dt;
    if (this.skillCooldown > 0) this.skillCooldown -= dt;
    if (this.attackAnimTimer > 0) this.attackAnimTimer -= dt;

    // Target acquisition
    this.findTarget();

    // Auto-attack
    if (this.atkCooldown <= 0 && this.target && !this.target.isDead) {
      this.performBasicAttack(this.target);
      this.atkCooldown = 1 / this.atkSpeed;
      this.attackAnimTimer = 0.2;
    }

    // Auto-cast skill if auto-battle is enabled
    if (this.game.autoBattle && this.skillCooldown <= 0 && this.game.enemies.length > 0) {
      this.castSkill();
    }
  }

  findTarget() {
    let closestEnemy = null;
    let closestDist = this.range;

    for (let enemy of this.game.enemies) {
      if (enemy.isDead) continue;
      const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
      if (dist <= closestDist) {
        closestDist = dist;
        closestEnemy = enemy;
      }
    }

    this.target = closestEnemy;
  }

  performBasicAttack(target) {
    if (this.data.role === 'ranger' || this.data.role === 'mage' || this.data.role === 'support') {
      // Ranged Projectile
      this.game.spawnProjectile({
        type: this.data.role === 'mage' ? 'magic_orb' : 'arrow',
        x: this.x + 10,
        y: this.y,
        targetX: target.x,
        targetY: target.y,
        target: target,
        damage: this.atk,
        element: this.element,
        speed: 850,
        color: ELEMENTS[this.element] ? ELEMENTS[this.element].color : '#fbbf24',
        source: 'hero'
      });
      if (this.game.audio) {
        if (this.data.role === 'mage') this.game.audio.playMagicSound();
        else this.game.audio.playShootArrow();
      }
    } else {
      // Melee Swing
      target.takeDamage(this.atk, this.element);
      if (this.game.audio) this.game.audio.playSwordSwing();
      if (this.game.particles) {
        this.game.particles.spawnHitSparks(target.x, target.y, ELEMENTS[this.element]?.color || '#ffffff');
      }
    }
  }

  castSkill() {
    if (this.skillCooldown > 0) return false;
    this.skillCooldown = this.maxSkillCooldown;

    const heroId = this.data.id;
    const hasExclusive = !!this.exclusiveWeapon;
    const dmgScale = hasExclusive ? 1.6 : 1.0;

    if (this.game.audio) this.game.audio.playMagicSound();
    if (this.game.particles) {
      this.game.particles.spawnFloatingText(this.x, this.y - 30, `[스킬] ${this.data.skillName}!`, '#f59e0b', 1.3);
    }

    // Hero-Specific Mythic 5-Star Ultimate Skills
    if (heroId === 'hero_erica') {
      // Holy Barrier & Blade Wave
      const barrierAmt = Math.floor(this.game.castle.maxHp * (hasExclusive ? 0.45 : 0.25));
      this.game.castle.barrier = Math.min(this.game.castle.maxHp * 0.8, this.game.castle.barrier + barrierAmt);
      this.game.spawnProjectile({
        type: 'holy_blade',
        x: this.x + 20,
        y: 350,
        targetX: 1200,
        targetY: 350,
        damage: this.atk * 4.5 * dmgScale,
        element: 'holy',
        speed: 900,
        piercing: true,
        pierceCount: 25,
        color: '#fbbf24'
      });
    } else if (heroId === 'hero_ignis') {
      // Hellfire Meteors
      const meteorCount = hasExclusive ? 5 : 3;
      for (let i = 0; i < meteorCount; i++) {
        setTimeout(() => {
          const targetX = 500 + Math.random() * 500;
          const targetY = 150 + Math.random() * 450;
          this.game.spawnProjectile({
            type: 'meteor',
            x: targetX - 200,
            y: -100,
            targetX: targetX,
            targetY: targetY,
            damage: this.atk * 6.5 * dmgScale,
            element: 'fire',
            speed: 950,
            splashRadius: 130,
            specialEffect: 'burn',
            color: '#ef4444'
          });
        }, i * 220);
      }
    } else if (heroId === 'hero_malachai') {
      // Soul Scythe & Wraith Summons
      this.game.spawnProjectile({
        type: 'soul_scythe',
        x: this.x + 20,
        y: 350,
        targetX: 1100,
        targetY: 350,
        damage: this.atk * 5.0 * dmgScale,
        element: 'dark',
        speed: 800,
        piercing: true,
        pierceCount: 20,
        color: '#a855f7'
      });
      // Spawn ally skeletons
      const summonCount = hasExclusive ? 8 : 4;
      for (let i = 0; i < summonCount; i++) {
        this.game.spawnAllyMinion({
          x: 290 + Math.random() * 80,
          y: 200 + Math.random() * 350,
          hp: 600,
          atk: this.atk * 0.75,
          lifeTime: 12
        });
      }
    } else if (heroId === 'hero_ren') {
      // Illusion Flurry on strongest enemy
      let boss = this.game.enemies.find(e => e.isBoss && !e.isDead) || this.game.enemies[0];
      if (boss) {
        const hits = hasExclusive ? 20 : 12;
        for (let i = 0; i < hits; i++) {
          setTimeout(() => {
            if (!boss.isDead) {
              boss.takeDamage(this.atk * 0.9 * dmgScale, 'wind', true);
              if (this.game.particles) this.game.particles.spawnHitSparks(boss.x, boss.y, '#14b8a6');
            }
          }, i * 70);
        }
      }
    } else if (heroId === 'hero_barrak') {
      // Earthquake Stun
      for (let enemy of this.game.enemies) {
        if (!enemy.isDead && enemy.x < 1100) {
          enemy.takeDamage(this.atk * 5.5 * dmgScale, 'earth');
          enemy.applyStun(hasExclusive ? 5.0 : 3.0);
        }
      }
      if (this.game.camera) this.game.camera.shake = 18;
    } else if (heroId === 'hero_elena') {
      // Thunder chain
      const targetCount = hasExclusive ? 20 : 10;
      let hit = 0;
      for (let enemy of this.game.enemies) {
        if (enemy.isDead) continue;
        enemy.takeDamage(this.atk * 6.0 * dmgScale, 'thunder');
        enemy.applyStun(2.0);
        hit++;
        if (hit >= targetCount) break;
      }
      if (this.game.audio) this.game.audio.playLightning();
    } else if (heroId === 'hero_freezia') {
      // Blizzard Freeze
      for (let enemy of this.game.enemies) {
        if (!enemy.isDead) {
          enemy.takeDamage(this.atk * 4.0 * dmgScale, 'ice');
          enemy.applyFreeze(hasExclusive ? 6.0 : 4.0);
        }
      }
    } else if (heroId === 'hero_seraphina') {
      // Heal Castle & Invulnerable Barrier
      this.game.castle.currentHp = Math.min(this.game.castle.maxHp, this.game.castle.currentHp + this.game.castle.maxHp * (hasExclusive ? 0.4 : 0.25));
      if (hasExclusive) this.game.castle.invulnerableTimer = 4.0;
      if (this.game.audio) this.game.audio.playRepair();
    } else if (heroId === 'hero_dracul') {
      // Blood Carnival & Heal
      let totalDmg = 0;
      for (let enemy of this.game.enemies) {
        if (!enemy.isDead && enemy.x < 750) {
          const dmg = this.atk * 6.5 * dmgScale;
          enemy.takeDamage(dmg, 'dark');
          totalDmg += dmg;
        }
      }
      this.currentHp = Math.min(this.maxHp, this.currentHp + totalDmg * 0.4);
    } else if (heroId === 'hero_chronos') {
      // Time Stop
      const stopDuration = hasExclusive ? 6.0 : 4.0;
      for (let enemy of this.game.enemies) {
        if (!enemy.isDead) enemy.applyStun(stopDuration);
      }
      // Reduce cooldowns for other heroes
      for (let hero of this.game.deployedHeroes) {
        if (hero !== this) hero.skillCooldown = Math.max(0, hero.skillCooldown - 5.0);
      }
    } else if (heroId === 'hero_victoria') {
      // Orbital Railcannon
      const targetCount = hasExclusive ? 5 : 3;
      for (let i = 0; i < targetCount; i++) {
        setTimeout(() => {
          const tx = 550 + i * 150;
          for (let enemy of this.game.enemies) {
            if (!enemy.isDead && Math.abs(enemy.x - tx) < 100) {
              enemy.takeDamage(this.atk * 8.0 * dmgScale, 'physical');
            }
          }
          if (this.game.particles) this.game.particles.spawnExplosion(tx, 350, '#38bdf8', 120);
        }, i * 250);
      }
    } else if (heroId === 'hero_bahamut') {
      // Dragon Breath
      for (let enemy of this.game.enemies) {
        if (!enemy.isDead) {
          enemy.takeDamage(this.atk * 7.5 * dmgScale, 'fire');
          enemy.applyBurn(5.0, this.atk * 0.5);
        }
      }
    } else {
      // Generic / 4-Star Skill Attack
      for (let enemy of this.game.enemies) {
        if (!enemy.isDead && Math.hypot(enemy.x - this.x, enemy.y - this.y) <= this.range * 1.3) {
          enemy.takeDamage(this.atk * 3.5, this.element);
          if (this.data.role === 'tanker') enemy.applyStun(2.0);
          if (this.data.role === 'support') this.game.castle.currentHp = Math.min(this.game.castle.maxHp, this.game.castle.currentHp + 300);
        }
      }
    }

    return true;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Exclusive Weapon Aura if equipped
    if (this.exclusiveWeapon) {
      ctx.strokeStyle = '#f59e0b';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Hero Platform / Circle
    const tierConfig = HERO_TIERS[this.data.tier] || HERO_TIERS[1];
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = tierConfig.color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Avatar Emoji
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.data.avatar, 0, 0);

    // Level Badge
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-18, this.radius + 2, 36, 13);
    ctx.strokeStyle = tierConfig.color;
    ctx.lineWidth = 1;
    ctx.strokeRect(-18, this.radius + 2, 36, 13);
    ctx.font = 'bold 9px Outfit, sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(`Lv.${this.level}`, 0, this.radius + 9);

    // Skill Cooldown Indicator
    if (this.skillCooldown > 0) {
      const pct = this.skillCooldown / this.maxSkillCooldown;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, this.radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct, false);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}

class EnemyUnit {
  constructor(config, game) {
    this.game = game;
    this.id = 'enemy_' + Math.random().toString(36).substr(2, 9);
    this.race = config.race || 'orc';
    this.name = config.name || '오크 보병';
    this.avatar = config.avatar || '👺';
    this.isBoss = config.isBoss || false;

    this.x = config.x || 1200;
    this.y = config.y || 200 + Math.random() * 450;
    this.radius = this.isBoss ? 42 : 18;
    this.speed = config.speed || (this.isBoss ? 35 : 65);
    this.baseSpeed = this.speed;

    // Stats
    this.maxHp = config.hp || 300;
    this.currentHp = this.maxHp;
    this.atk = config.atk || 25;
    this.def = config.def || 5;
    this.atkSpeed = config.atkSpeed || 0.8;
    this.atkCooldown = 0;
    this.range = this.isBoss ? 110 : 35;

    // Rewards on Death
    this.goldReward = config.gold || 15;
    this.coinReward = config.coins || 5;

    // Status Effects
    this.burnTimer = 0;
    this.burnDps = 0;
    this.freezeTimer = 0;
    this.stunTimer = 0;

    this.isDead = false;
  }

  update(dt) {
    if (this.isDead) return;

    // Process Status Effects
    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      return; // Stunned, cannot move or attack
    }

    if (this.burnTimer > 0) {
      this.burnTimer -= dt;
      this.takeDamage(this.burnDps * dt, 'fire');
    }

    let currentSpeed = this.baseSpeed;
    if (this.freezeTimer > 0) {
      this.freezeTimer -= dt;
      currentSpeed *= 0.45;
    }

    if (this.atkCooldown > 0) this.atkCooldown -= dt;

    // Check if in range of Castle or Ground Heroes
    const targetGroundHero = this.findNearbyGroundHero();
    const distanceToCastle = this.x - this.game.castle.x;

    if (targetGroundHero) {
      // Attack ground hero
      if (this.atkCooldown <= 0) {
        targetGroundHero.currentHp -= Math.max(1, this.atk - targetGroundHero.def);
        this.atkCooldown = 1 / this.atkSpeed;
        if (targetGroundHero.currentHp <= 0) targetGroundHero.isDead = true;
      }
    } else if (distanceToCastle <= this.range) {
      // Attack Castle Wall
      if (this.atkCooldown <= 0) {
        this.game.castle.takeDamage(this.atk, this);
        this.atkCooldown = 1 / this.atkSpeed;
      }
    } else {
      // Move Left towards the castle
      this.x -= currentSpeed * dt;
    }
  }

  findNearbyGroundHero() {
    for (let hero of this.game.deployedHeroes) {
      if (hero.isDead || hero.isWall) continue;
      const dist = Math.hypot(hero.x - this.x, hero.y - this.y);
      if (dist <= this.range + hero.radius) {
        return hero;
      }
    }
    return null;
  }

  takeDamage(amount, element = 'physical', isCrit = false) {
    if (this.isDead) return;

    // Element Weakness & Resistance
    const raceInfo = ENEMY_RACES[this.race];
    let multiplier = 1.0;
    if (raceInfo) {
      if (raceInfo.weakness.includes(ELEMENTS[element]?.name || element)) multiplier = 1.5;
      if (raceInfo.resistance.includes(ELEMENTS[element]?.name || element)) multiplier = 0.7;
    }

    let actualDamage = Math.max(1, (amount * multiplier) - this.def);
    if (isCrit) actualDamage *= 1.8;

    this.currentHp -= actualDamage;

    // Floating text
    if (this.game.particles) {
      const textColor = isCrit ? '#f43f5e' : (ELEMENTS[element]?.color || '#ffffff');
      this.game.particles.spawnFloatingText(
        this.x,
        this.y - (this.isBoss ? 45 : 20),
        Math.round(actualDamage) + (isCrit ? ' 💥' : ''),
        textColor,
        isCrit ? 1.4 : (this.isBoss ? 1.2 : 1.0)
      );
    }

    if (this.currentHp <= 0) {
      this.currentHp = 0;
      this.die();
    }
  }

  applyBurn(duration, dps) {
    this.burnTimer = Math.max(this.burnTimer, duration);
    this.burnDps = dps;
  }

  applyFreeze(duration) {
    this.freezeTimer = Math.max(this.freezeTimer, duration);
  }

  applyStun(duration) {
    this.stunTimer = Math.max(this.stunTimer, duration);
  }

  die() {
    this.isDead = true;
    this.game.gold += this.goldReward;
    this.game.dungeon.minerals.dungeonCoins += this.coinReward;

    // Random Mineral Drop
    if (Math.random() < 0.35) {
      this.game.dungeon.minerals.iron += Math.floor(Math.random() * 4 + 1);
    }
    if (Math.random() < 0.15) {
      this.game.dungeon.minerals.mithril += Math.floor(Math.random() * 2 + 1);
    }
    if (this.isBoss) {
      this.game.dungeon.minerals.adamantite += 5;
      this.game.dungeon.minerals.orichalcum += 3;
      this.game.dungeon.minerals.dragonStone += 1;
      this.game.diamonds += 50; // Premium currency on boss kill
    }

    if (this.game.particles) {
      this.game.particles.spawnExplosion(this.x, this.y, this.isBoss ? '#f59e0b' : '#ef4444', this.radius * 1.5);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Freeze / Stun visual tint
    if (this.freezeTimer > 0) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
    } else if (this.burnTimer > 0) {
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 12;
    }

    // Body Circle
    ctx.fillStyle = this.isBoss ? '#7f1d1d' : '#1e293b';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = this.isBoss ? '#ef4444' : '#64748b';
    ctx.lineWidth = this.isBoss ? 4 : 2;
    ctx.stroke();

    // Avatar
    ctx.font = `${this.isBoss ? 40 : 20}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.avatar, 0, 0);

    // HP Bar
    const hpBarW = this.radius * 2;
    const hpBarH = this.isBoss ? 8 : 5;
    const hpPct = Math.max(0, this.currentHp / this.maxHp);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(-hpBarW / 2, -this.radius - 12, hpBarW, hpBarH);
    ctx.fillStyle = this.isBoss ? '#ef4444' : '#22c55e';
    ctx.fillRect(-hpBarW / 2, -this.radius - 12, hpBarW * hpPct, hpBarH);

    ctx.restore();
  }
}

class AllyMinion {
  constructor(config, game) {
    this.game = game;
    this.x = config.x;
    this.y = config.y;
    this.hp = config.hp || 400;
    this.maxHp = this.hp;
    this.atk = config.atk || 50;
    this.lifeTime = config.lifeTime || 10;
    this.radius = 14;
    this.speed = 80;
    this.atkCooldown = 0;
    this.isDead = false;
  }

  update(dt) {
    this.lifeTime -= dt;
    if (this.lifeTime <= 0) {
      this.isDead = true;
      return;
    }

    if (this.atkCooldown > 0) this.atkCooldown -= dt;

    // Find nearest enemy to engage
    let nearest = null;
    let minDist = 300;
    for (let e of this.game.enemies) {
      if (e.isDead) continue;
      const d = Math.hypot(e.x - this.x, e.y - this.y);
      if (d < minDist) {
        minDist = d;
        nearest = e;
      }
    }

    if (nearest) {
      if (minDist <= 30) {
        if (this.atkCooldown <= 0) {
          nearest.takeDamage(this.atk, 'dark');
          this.atkCooldown = 1.0;
        }
      } else {
        const angle = Math.atan2(nearest.y - this.y, nearest.x - this.x);
        this.x += Math.cos(angle) * this.speed * dt;
        this.y += Math.sin(angle) * this.speed * dt;
      }
    } else {
      this.x += this.speed * 0.5 * dt;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = '#a855f7';
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💀', 0, 0);
    ctx.restore();
  }
}
