// Difficulty Settings Matrix
const DIFFICULTY_SETTINGS = {
  easy: {
    name: '쉬움',
    icon: '🟢',
    badgeClass: 'diff-easy',
    hpScale: 0.7,
    atkScale: 0.7,
    speedScale: 0.9,
    rewardGold: 1.0,
    rewardCoins: 1.0,
    rewardDiamonds: 1.0,
    wallRegenScale: 1.5,
    desc: '편안하게 영웅과 성을 육성할 수 있는 입문 난이도 (성벽 자동 회복 1.5배)'
  },
  normal: {
    name: '보통',
    icon: '🔵',
    badgeClass: 'diff-normal',
    hpScale: 1.0,
    atkScale: 1.0,
    speedScale: 1.0,
    rewardGold: 1.0,
    rewardCoins: 1.0,
    rewardDiamonds: 1.0,
    wallRegenScale: 1.0,
    desc: '표준 전투 밸런스의 정통 디펜스 모드 (기본)'
  },
  hard: {
    name: '어려움',
    icon: '🟠',
    badgeClass: 'diff-hard',
    hpScale: 1.5,
    atkScale: 1.4,
    speedScale: 1.15,
    rewardGold: 1.35,
    rewardCoins: 1.35,
    rewardDiamonds: 1.35,
    wallRegenScale: 1.0,
    desc: '적 이동속도 +15%, 보상 배율 135%의 혹독한 전투'
  },
  nightmare: {
    name: '악몽',
    icon: '🟣',
    badgeClass: 'diff-nightmare',
    hpScale: 2.2,
    atkScale: 2.0,
    speedScale: 1.25,
    rewardGold: 1.8,
    rewardCoins: 1.8,
    rewardDiamonds: 1.8,
    wallRegenScale: 0.8,
    desc: '강력한 적 부대 급습, 보상 배율 180%의 고난도 도전'
  },
  hell: {
    name: '지옥',
    icon: '🔴',
    badgeClass: 'diff-hell',
    hpScale: 3.2,
    atkScale: 2.8,
    speedScale: 1.35,
    rewardGold: 2.5,
    rewardCoins: 2.5,
    rewardDiamonds: 2.5,
    wallRegenScale: 0.6,
    desc: '최상위 수호대를 위한 극한 난이도, 보상 배율 250%!'
  }
};

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Canvas & Viewport
    this.width = 1280;
    this.height = 720;
    this.camera = { x: 0, y: 0, shake: 0 };

    // Game Speed & Controls
    this.gameSpeed = 1.0;
    this.autoBattle = true;
    this.isPaused = false;
    this.running = false;

    // Game Difficulty
    this.difficulty = 'normal';

    // Currencies
    this.gold = 1000;
    this.diamonds = 2000; // Free starter diamonds for summons
    this.gachaMileage = 0; // Mileage points for special exchange

    // Core Managers
    this.audio = new SoundEngine();
    this.particles = new ParticleSystem();
    this.castle = new CastleManager(this);
    this.dungeon = new DungeonManager(this);
    this.ui = null;

    // Owned Heroes Roster (Map: heroId -> HeroRecord)
    this.ownedHeroes = {};

    // Deployed Heroes (Max 8 slots on Wall & Ground)
    this.deployedHeroIds = [];
    this.deployedHeroes = [];

    // Combat Entities
    this.enemies = [];
    this.projectiles = [];
    this.allyMinions = [];

    // Wave Management
    this.wave = 1;
    this.maxWave = 50;
    this.waveState = 'prep'; // 'prep', 'battle', 'boss', 'cleared', 'gameover'
    this.enemiesToSpawn = [];
    this.spawnTimer = 0;

    // 100-Pull Pity & Gacha System
    this.summonCount = 0;
    this.pityCounter = 0;
    this.maxPity = 100; // 100 pulls pity guaranteed 5-star
    this.gachaHistory = []; // List of recent pulls
    this.freeDailyPullAvailable = true;
    this.lastFreePullDate = null;
    this.selectedPickupHeroId = 'hero_erica'; // Default pickup hero

    // Default starter heroes
    this.initStarterHeroes();
  }

  init(ui) {
    this.ui = ui;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.audio.init();
    this.loadProgress();
    this.checkDailyFreePull();
    this.syncDeployedUnits();
  }

  resize() {
    this.canvas.width = 1280;
    this.canvas.height = 720;
  }

  setDifficulty(diffKey) {
    if (!DIFFICULTY_SETTINGS[diffKey]) return;
    this.difficulty = diffKey;
    this.saveProgress();
    if (this.ui) this.ui.renderAll();
  }

  getDifficultyConfig() {
    return DIFFICULTY_SETTINGS[this.difficulty] || DIFFICULTY_SETTINGS.normal;
  }

  checkDailyFreePull() {
    const today = new Date().toDateString();
    if (this.lastFreePullDate !== today) {
      this.freeDailyPullAvailable = true;
    }
  }

  initStarterHeroes() {
    // Give 1 Starter 5-Star (Erica), 1 4-Star (Leon), 1 3-Star, 1 2-Star
    this.grantHero('hero_erica', false);
    this.grantHero('hero_leon', false);
    this.grantHero('hero_longbow_elite', false);
    this.grantHero('hero_mercenary_swordsman', false);

    // Auto deploy starters
    this.deployedHeroIds = ['hero_erica', 'hero_leon', 'hero_longbow_elite', 'hero_mercenary_swordsman'];
  }

  grantHero(heroId, isSummon = false) {
    const baseHero = HERO_MAP[heroId];
    if (!baseHero) return { isNew: false, shardsGained: 0 };

    let isNew = false;
    let shardsGained = 0;

    if (!this.ownedHeroes[heroId]) {
      isNew = true;
      this.ownedHeroes[heroId] = {
        id: heroId,
        level: 1,
        shards: 0,
        equippedExclusive: false,
        exclusiveWeapon: null
      };

      // Check if weapon already crafted
      if (this.dungeon && this.dungeon.craftedExclusiveWeapons[heroId]) {
        this.ownedHeroes[heroId].equippedExclusive = true;
        this.ownedHeroes[heroId].exclusiveWeapon = this.dungeon.craftedExclusiveWeapons[heroId];
      }
    } else {
      // Duplicate gives shards for level up (Safe: does NOT take user gold)
      shardsGained = baseHero.tier === 5 ? 30 : baseHero.tier === 4 ? 20 : 10;
      this.ownedHeroes[heroId].shards = (this.ownedHeroes[heroId].shards || 0) + shardsGained;
    }

    if (isSummon) {
      this.gachaMileage += 1;
    }

    return { isNew, shardsGained };
  }

  levelUpHero(heroId) {
    const heroRecord = this.ownedHeroes[heroId];
    if (!heroRecord) return false;
    const cost = heroRecord.level * 150;

    if (this.gold >= cost) {
      this.gold -= cost;
      heroRecord.level++;
      this.syncDeployedUnits();
      if (this.audio) this.audio.playUpgrade();
      return true;
    }
    return false;
  }

  syncDeployedUnits() {
    this.deployedHeroes = [];
    this.deployedHeroIds.forEach((heroId, slotIdx) => {
      const baseHero = HERO_MAP[heroId];
      const record = this.ownedHeroes[heroId];
      if (baseHero && record) {
        const mergedData = {
          ...baseHero,
          level: record.level,
          exclusiveWeapon: record.exclusiveWeapon || (this.dungeon.craftedExclusiveWeapons[heroId] || null)
        };
        const unit = new HeroUnit(mergedData, slotIdx, this);
        this.deployedHeroes.push(unit);
      }
    });
  }

  deployHero(heroId) {
    if (this.deployedHeroIds.includes(heroId)) return;
    if (this.deployedHeroIds.length >= 8) {
      alert('최대 8명의 영웅만 출전할 수 있습니다!');
      return;
    }
    this.deployedHeroIds.push(heroId);
    this.syncDeployedUnits();
    if (this.ui) this.ui.renderAll();
  }

  undeployHero(heroId) {
    this.deployedHeroIds = this.deployedHeroIds.filter(id => id !== heroId);
    this.syncDeployedUnits();
    if (this.ui) this.ui.renderAll();
  }

  // Realistic Gacha Summon System with 100-Pull Pity
  summonGacha(count = 1, isFree = false) {
    const cost = isFree ? 0 : (count === 1 ? 100 : 900);
    if (!isFree && this.diamonds < cost) {
      alert('다이아가 부족합니다! 던전 보스나 퀘스트를 통해 획득할 수 있습니다.');
      return null;
    }

    if (isFree) {
      this.freeDailyPullAvailable = false;
      this.lastFreePullDate = new Date().toDateString();
    } else {
      this.diamonds -= cost;
    }

    const results = [];
    let highestTier = 1;

    for (let i = 0; i < count; i++) {
      this.summonCount++;
      this.pityCounter++;

      let roll = Math.random() * 100;
      let tier = 1;
      let isPityTriggered = false;

      // 100-Pull Pity guarantee 5-Star Mythic
      if (this.pityCounter >= this.maxPity) {
        tier = 5;
        this.pityCounter = 0;
        isPityTriggered = true;
      } else if (count === 10 && i === 9 && roll > 18) {
        // 10th summon guaranteed 4-Star+
        tier = Math.random() < 0.15 ? 5 : 4;
        if (tier === 5) this.pityCounter = 0;
      } else {
        if (roll < 3.0) {
          tier = 5; // 3%
          this.pityCounter = 0;
        } else if (roll < 18.0) {
          tier = 4; // 15%
        } else if (roll < 48.0) {
          tier = 3; // 30%
        } else if (roll < 80.0) {
          tier = 2; // 32%
        } else {
          tier = 1; // 20%
        }
      }

      if (tier > highestTier) highestTier = tier;

      // Pick hero in tier (with 50% rate-up for selected 5-star pickup)
      let pool = ALL_HEROES.filter(h => h.tier === tier);
      let chosen = null;

      if (tier === 5 && this.selectedPickupHeroId && pool.some(h => h.id === this.selectedPickupHeroId)) {
        if (Math.random() < 0.5) {
          chosen = pool.find(h => h.id === this.selectedPickupHeroId);
        }
      }

      if (!chosen) {
        chosen = pool[Math.floor(Math.random() * pool.length)];
      }

      const grantResult = this.grantHero(chosen.id, true);

      const resultItem = {
        hero: chosen,
        isNew: grantResult.isNew,
        shardsGained: grantResult.shardsGained,
        tier: tier,
        isPity: isPityTriggered,
        pullNumber: this.summonCount
      };

      results.push(resultItem);

      // Add to Gacha History
      this.gachaHistory.unshift({
        heroId: chosen.id,
        heroName: chosen.name,
        heroAvatar: chosen.avatar,
        tier: tier,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isNew: grantResult.isNew,
        isPity: isPityTriggered
      });
      if (this.gachaHistory.length > 50) this.gachaHistory.pop();
    }

    this.saveProgress();
    return {
      cards: results,
      highestTier: highestTier,
      has5Star: results.some(r => r.tier === 5),
      has4Star: results.some(r => r.tier === 4),
      pityRemaining: Math.max(0, this.maxPity - this.pityCounter)
    };
  }

  // Start Next Wave Battle with Difficulty Scaler
  startWave() {
    if (this.waveState === 'battle') return;

    this.waveState = 'battle';
    const intel = this.dungeon.getNextWaveIntel(this.wave);
    const count = intel.estimatedEnemyCount;
    const isBossWave = intel.isBossWave;
    const raceKey = intel.raceKey;
    const raceInfo = ENEMY_RACES[raceKey];

    const diff = this.getDifficultyConfig();

    this.enemiesToSpawn = [];
    const hpScale = Math.pow(1.18, this.wave - 1) * diff.hpScale;
    const atkScale = Math.pow(1.12, this.wave - 1) * diff.atkScale;
    const speedBonus = diff.speedScale;

    for (let i = 0; i < count; i++) {
      this.enemiesToSpawn.push({
        race: raceKey,
        name: `${raceInfo.name} 병사`,
        avatar: raceInfo.icon,
        hp: Math.max(50, Math.floor(180 * hpScale)),
        atk: Math.max(5, Math.floor(18 * atkScale)),
        def: Math.floor(4 * hpScale),
        speed: (55 + Math.random() * 20) * speedBonus,
        isBoss: false,
        gold: Math.floor(15 * diff.rewardGold),
        coins: Math.floor(5 * diff.rewardCoins)
      });
    }

    // Add Boss if Boss Wave
    if (isBossWave) {
      this.enemiesToSpawn.push({
        race: raceKey,
        name: raceInfo.bossName,
        avatar: raceInfo.icon,
        hp: Math.max(500, Math.floor(4500 * hpScale)),
        atk: Math.max(20, Math.floor(65 * atkScale)),
        def: Math.floor(18 * hpScale),
        speed: 35 * speedBonus,
        isBoss: true,
        gold: Math.floor(300 * this.wave * diff.rewardGold),
        coins: Math.floor(100 * this.wave * diff.rewardCoins)
      });
    }

    this.spawnTimer = 0.5;
    if (this.ui) this.ui.renderAll();
  }

  spawnNextEnemy() {
    if (this.enemiesToSpawn.length === 0) return;
    const cfg = this.enemiesToSpawn.shift();
    const enemy = new EnemyUnit(cfg, this);
    this.enemies.push(enemy);
  }

  onWaveCleared() {
    this.waveState = 'prep';
    const diff = this.getDifficultyConfig();

    const waveRewardGold = Math.floor((250 + this.wave * 100) * diff.rewardGold);
    const waveRewardCoins = Math.floor((50 + this.wave * 20) * diff.rewardCoins);
    const waveRewardDiamonds = Math.floor(30 * diff.rewardDiamonds);

    this.gold += waveRewardGold;
    this.dungeon.minerals.dungeonCoins += waveRewardCoins;
    this.diamonds += waveRewardDiamonds;

    if (this.audio) this.audio.playFanfare();
    if (this.particles) {
      this.particles.spawnFloatingText(640, 200, `웨이브 ${this.wave} 클리어! (+🪙${waveRewardGold}, +💎${waveRewardDiamonds})`, '#22c55e', 2.0);
    }

    this.wave++;
    this.saveProgress();
    if (this.ui) this.ui.renderAll();
  }

  onCastleDestroyed() {
    this.waveState = 'gameover';
    alert(`성벽이 함락되었습니다! 웨이브 ${this.wave}에서 패배하였습니다.\n성을 긴급 복구하여 다시 도전하세요.`);
    this.castle.currentHp = Math.floor(this.castle.maxHp * 0.5);
    this.waveState = 'prep';
    this.enemies = [];
    this.enemiesToSpawn = [];
    if (this.ui) this.ui.renderAll();
  }

  spawnProjectile(config) {
    const p = new Projectile(config);
    this.projectiles.push(p);
  }

  spawnAllyMinion(config) {
    const minion = new AllyMinion(config, this);
    this.allyMinions.push(minion);
  }

  createTeslaChain(startX, startY, firstTarget, maxChains, damage) {
    let current = firstTarget;
    let hitList = [firstTarget];
    let segments = [{ x: startX, y: startY }, { x: firstTarget.x, y: firstTarget.y }];

    firstTarget.takeDamage(damage, 'thunder');

    for (let i = 1; i < maxChains; i++) {
      let nextTarget = null;
      let minDist = 200;
      for (let e of this.enemies) {
        if (e.isDead || hitList.includes(e)) continue;
        const d = Math.hypot(e.x - current.x, e.y - current.y);
        if (d < minDist) {
          minDist = d;
          nextTarget = e;
        }
      }

      if (nextTarget) {
        hitList.push(nextTarget);
        segments.push({ x: nextTarget.x, y: nextTarget.y });
        nextTarget.takeDamage(damage * Math.pow(0.85, i), 'thunder');
        current = nextTarget;
      } else {
        break;
      }
    }

    this.particles.addLightning(segments, '#38bdf8');
  }

  // Main Loop
  start() {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(t => this.loop(t));
  }

  loop(currentTime) {
    if (!this.running) return;

    let dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (dt > 0.1) dt = 0.1; // Cap delta time
    dt *= this.gameSpeed;

    if (!this.isPaused) {
      this.update(dt);
    }

    this.draw();
    requestAnimationFrame(t => this.loop(t));
  }

  update(dt) {
    // Screen shake decay
    if (this.camera.shake > 0) {
      this.camera.shake = Math.max(0, this.camera.shake - dt * 25);
    }

    // Update Dungeon Mining
    this.dungeon.update(dt);

    // Update Castle & Turrets
    this.castle.update(dt);

    // Wave Spawner
    if (this.waveState === 'battle') {
      if (this.enemiesToSpawn.length > 0) {
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
          this.spawnNextEnemy();
          this.spawnTimer = 0.6 / this.gameSpeed;
        }
      } else if (this.enemies.length === 0) {
        this.onWaveCleared();
      }
    }

    // Update Deployed Heroes
    for (let hero of this.deployedHeroes) {
      hero.update(dt);
    }

    // Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(dt);
      if (enemy.isDead) {
        this.enemies.splice(i, 1);
      }
    }

    // Update Ally Minions
    for (let i = this.allyMinions.length - 1; i >= 0; i--) {
      const m = this.allyMinions[i];
      m.update(dt);
      if (m.isDead) {
        this.allyMinions.splice(i, 1);
      }
    }

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(dt, this);
      if (p.isDead) {
        this.projectiles.splice(i, 1);
      }
    }

    // Update Particles
    this.particles.update(dt);
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    // Camera shake
    if (this.camera.shake > 0) {
      const sx = (Math.random() - 0.5) * this.camera.shake;
      const sy = (Math.random() - 0.5) * this.camera.shake;
      ctx.translate(sx, sy);
    }

    // Battlefield Background
    this.drawBattlefield(ctx);

    // Draw Castle Wall & Turrets
    this.castle.draw(ctx);

    // Draw Deployed Heroes
    for (let hero of this.deployedHeroes) {
      hero.draw(ctx);
    }

    // Draw Ally Minions
    for (let minion of this.allyMinions) {
      minion.draw(ctx);
    }

    // Draw Enemies
    for (let enemy of this.enemies) {
      enemy.draw(ctx);
    }

    // Draw Projectiles
    for (let p of this.projectiles) {
      p.draw(ctx);
    }

    // Draw Particles & Floating Texts
    this.particles.draw(ctx);

    ctx.restore();
  }

  drawBattlefield(ctx) {
    // Sky / Ground gradient
    const grad = ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.3, '#111827');
    grad.addColorStop(0.6, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Grid Floor lines for distance perception
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
    ctx.lineWidth = 1;
    for (let y = 120; y < 700; y += 40) {
      ctx.beginPath();
      ctx.moveTo(220, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
    for (let x = 250; x < this.width; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 100);
      ctx.lineTo(x, 700);
      ctx.stroke();
    }

    // Front Battlefield Border / Danger Line
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(240, 100);
    ctx.lineTo(240, 700);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Persistence
  saveProgress() {
    try {
      const data = {
        wave: this.wave,
        difficulty: this.difficulty,
        gold: this.gold,
        diamonds: this.diamonds,
        gachaMileage: this.gachaMileage,
        minerals: this.dungeon.minerals,
        miningLevel: this.dungeon.miningLevel,
        dungeonFloor: this.dungeon.dungeonFloor,
        craftedExclusiveWeapons: this.dungeon.craftedExclusiveWeapons,
        ownedHeroes: this.ownedHeroes,
        deployedHeroIds: this.deployedHeroIds,
        castleWallLevel: this.castle.wallLevel,
        turrets: this.castle.turrets,
        pityCounter: this.pityCounter,
        summonCount: this.summonCount,
        gachaHistory: this.gachaHistory,
        freeDailyPullAvailable: this.freeDailyPullAvailable,
        lastFreePullDate: this.lastFreePullDate,
        selectedPickupHeroId: this.selectedPickupHeroId
      };
      localStorage.setItem('ancient_castle_save', JSON.stringify(data));
    } catch (e) {
      console.warn('Save failed', e);
    }
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem('ancient_castle_save');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.wave) this.wave = data.wave;
        if (data.difficulty && DIFFICULTY_SETTINGS[data.difficulty]) this.difficulty = data.difficulty;
        if (data.gold !== undefined) this.gold = data.gold;
        if (data.diamonds !== undefined) this.diamonds = data.diamonds;
        if (data.gachaMileage !== undefined) this.gachaMileage = data.gachaMileage;
        if (data.minerals) this.dungeon.minerals = data.minerals;
        if (data.miningLevel) this.dungeon.miningLevel = data.miningLevel;
        if (data.dungeonFloor) this.dungeon.dungeonFloor = data.dungeonFloor;
        if (data.craftedExclusiveWeapons) this.dungeon.craftedExclusiveWeapons = data.craftedExclusiveWeapons;
        if (data.ownedHeroes) this.ownedHeroes = data.ownedHeroes;
        if (data.deployedHeroIds) this.deployedHeroIds = data.deployedHeroIds;
        if (data.pityCounter !== undefined) this.pityCounter = data.pityCounter;
        if (data.summonCount !== undefined) this.summonCount = data.summonCount;
        if (data.gachaHistory) this.gachaHistory = data.gachaHistory;
        if (data.freeDailyPullAvailable !== undefined) this.freeDailyPullAvailable = data.freeDailyPullAvailable;
        if (data.lastFreePullDate) this.lastFreePullDate = data.lastFreePullDate;
        if (data.selectedPickupHeroId) this.selectedPickupHeroId = data.selectedPickupHeroId;
        if (data.castleWallLevel) {
          this.castle.wallLevel = data.castleWallLevel;
          this.castle.maxHp = 5000 + (data.castleWallLevel - 1) * 1500;
          this.castle.currentHp = this.castle.maxHp;
        }
        if (data.turrets) this.castle.turrets = data.turrets;
      }
    } catch (e) {
      console.warn('Load failed', e);
    }
  }
}
