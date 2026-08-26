/**
 * ANCIENT CASTLE GUARDIANS: DUNGEON & FORGE SYSTEM
 * 1. Next Wave Enemy Intel & Scouting (종족, 약점, 보스 정보)
 * 2. Deep Mine & Expedition (5대 광물 및 던전 코인 채굴)
 * 3. Exclusive Weapon Forge & Crafting (5성 12영웅 전용무기 제작 및 +15 강화)
 */

class DungeonManager {
  constructor(game) {
    this.game = game;

    // Minerals & Dungeon Currencies
    this.minerals = {
      iron: 100,          // 철광석
      mithril: 40,        // 미스릴
      adamantite: 15,     // 아다만타이트
      orichalcum: 5,      // 오리하르콘
      dragonStone: 2,     // 용혈석
      dungeonCoins: 250   // 던전 코인
    };

    // Mining Speed / Level Upgrades
    this.miningLevel = 1;
    this.miningRates = {
      iron: 2.0,
      mithril: 1.0,
      adamantite: 0.4,
      orichalcum: 0.15,
      dragonStone: 0.05,
      dungeonCoins: 3.0
    };

    // Deep Dungeon Exploration Floor (B1F ~ B50F)
    this.dungeonFloor = 1;
    this.maxDungeonFloor = 50;

    // Crafted Exclusive Weapons (Map: heroId -> Weapon Object with enhanceLevel)
    this.craftedExclusiveWeapons = {}; // heroId: { ...weaponData, enhanceLevel: 0 }

    // Inventory of weapons/armors
    this.equipmentInventory = [];

    // Mining auto-timer
    this.lastMineUpdate = performance.now();
  }

  // Update mining ticks
  update(dt) {
    // Passive mineral mining
    this.minerals.iron += this.miningRates.iron * dt * this.miningLevel;
    this.minerals.mithril += this.miningRates.mithril * dt * this.miningLevel;
    this.minerals.adamantite += this.miningRates.adamantite * dt * this.miningLevel;
    this.minerals.orichalcum += this.miningRates.orichalcum * dt * this.miningLevel;
    this.minerals.dragonStone += this.miningRates.dragonStone * dt * this.miningLevel;
    this.minerals.dungeonCoins += this.miningRates.dungeonCoins * dt * this.miningLevel;
  }

  // Manual Mine Click (Strike the Vein)
  manualMine() {
    const boost = this.miningLevel;
    const gained = {
      iron: Math.floor(Math.random() * 5 + 3) * boost,
      mithril: Math.floor(Math.random() * 3 + 1) * boost,
      adamantite: Math.random() < 0.5 ? 1 * boost : 0,
      orichalcum: Math.random() < 0.25 ? 1 * boost : 0,
      dragonStone: Math.random() < 0.1 ? 1 : 0,
      dungeonCoins: Math.floor(Math.random() * 8 + 5) * boost
    };

    this.minerals.iron += gained.iron;
    this.minerals.mithril += gained.mithril;
    this.minerals.adamantite += gained.adamantite;
    this.minerals.orichalcum += gained.orichalcum;
    this.minerals.dragonStone += gained.dragonStone;
    this.minerals.dungeonCoins += gained.dungeonCoins;

    if (this.game.audio) this.game.audio.playMineHit();
    return gained;
  }

  // Upgrade Mining Tools
  upgradeMining() {
    const cost = Math.floor(100 * Math.pow(1.6, this.miningLevel - 1));
    if (this.minerals.dungeonCoins >= cost) {
      this.minerals.dungeonCoins -= cost;
      this.miningLevel++;
      if (this.game.audio) this.game.audio.playUpgrade();
      return true;
    }
    return false;
  }

  getUpgradeMiningCost() {
    return Math.floor(100 * Math.pow(1.6, this.miningLevel - 1));
  }

  // Dungeon Deep Floor Expedition (Challenge Boss/Mobs)
  challengeDungeonFloor() {
    const floor = this.dungeonFloor;
    const rewards = {
      iron: 150 * floor,
      mithril: 80 * floor,
      adamantite: 35 * floor,
      orichalcum: 15 * floor,
      dragonStone: Math.floor(floor / 3) + 1,
      dungeonCoins: 300 * floor,
      gold: 500 * floor
    };

    // Add rewards
    this.minerals.iron += rewards.iron;
    this.minerals.mithril += rewards.mithril;
    this.minerals.adamantite += rewards.adamantite;
    this.minerals.orichalcum += rewards.orichalcum;
    this.minerals.dragonStone += rewards.dragonStone;
    this.minerals.dungeonCoins += rewards.dungeonCoins;
    this.game.gold += rewards.gold;

    this.dungeonFloor++;
    if (this.game.audio) this.game.audio.playFanfare();
    return rewards;
  }

  // Craft 5-Star Hero Exclusive Weapon
  canCraftExclusiveWeapon(heroId) {
    const hero = HERO_MAP[heroId];
    if (!hero || !hero.exclusiveWeapon) return false;
    if (this.craftedExclusiveWeapons[heroId]) return false; // Already crafted

    const recipe = hero.exclusiveWeapon.recipe;
    return (
      this.minerals.iron >= recipe.iron &&
      this.minerals.mithril >= recipe.mithril &&
      this.minerals.adamantite >= recipe.adamantite &&
      this.minerals.orichalcum >= recipe.orichalcum &&
      this.minerals.dragonStone >= recipe.dragonStone &&
      this.minerals.dungeonCoins >= recipe.dungeonCoins
    );
  }

  craftExclusiveWeapon(heroId) {
    const hero = HERO_MAP[heroId];
    if (!hero || !hero.exclusiveWeapon) return { success: false, msg: '전용무기 정보가 없습니다.' };
    if (this.craftedExclusiveWeapons[heroId]) return { success: false, msg: '이미 제작 완료된 전용무기입니다.' };

    const recipe = hero.exclusiveWeapon.recipe;
    if (!this.canCraftExclusiveWeapon(heroId)) {
      return { success: false, msg: '필요한 광물 또는 던전 코인이 부족합니다!' };
    }

    // Deduct materials
    this.minerals.iron -= recipe.iron;
    this.minerals.mithril -= recipe.mithril;
    this.minerals.adamantite -= recipe.adamantite;
    this.minerals.orichalcum -= recipe.orichalcum;
    this.minerals.dragonStone -= recipe.dragonStone;
    this.minerals.dungeonCoins -= recipe.dungeonCoins;

    // Create Crafted Weapon Record
    const craftedWeapon = {
      ...hero.exclusiveWeapon,
      ownerHeroId: heroId,
      ownerHeroName: hero.name,
      enhanceLevel: 0,
      currentAtk: hero.exclusiveWeapon.baseAtk,
      currentDef: hero.exclusiveWeapon.baseDef
    };

    this.craftedExclusiveWeapons[heroId] = craftedWeapon;

    // Auto equip if player owns the hero
    if (this.game.ownedHeroes[heroId]) {
      this.game.ownedHeroes[heroId].equippedExclusive = true;
      this.game.ownedHeroes[heroId].exclusiveWeapon = craftedWeapon;
    }

    if (this.game.audio) this.game.audio.playCraftSuccess();
    return { success: true, weapon: craftedWeapon };
  }

  // Enhance Weapon (+1 to +15)
  enhanceWeapon(heroId) {
    const weapon = this.craftedExclusiveWeapons[heroId];
    if (!weapon) return { success: false, msg: '무기가 존재하지 않습니다.' };
    if (weapon.enhanceLevel >= 15) return { success: false, msg: '이미 최고 강화 단계(+15)입니다!' };

    const lvl = weapon.enhanceLevel;
    const costGold = (lvl + 1) * 300;
    const costCoins = (lvl + 1) * 40;
    const costMithril = (lvl + 1) * 8;

    if (this.game.gold < costGold || this.minerals.dungeonCoins < costCoins || this.minerals.mithril < costMithril) {
      return { success: false, msg: '강화에 필요한 골드, 미스릴 또는 던전 코인이 부족합니다.' };
    }

    // Success probability (100% at +1~+5, 80% at +6~+10, 60% at +11~+15)
    const successRate = lvl < 5 ? 1.0 : (lvl < 10 ? 0.85 : 0.65);
    this.game.gold -= costGold;
    this.minerals.dungeonCoins -= costCoins;
    this.minerals.mithril -= costMithril;

    if (Math.random() <= successRate) {
      weapon.enhanceLevel++;
      weapon.currentAtk = Math.floor(weapon.baseAtk * (1 + weapon.enhanceLevel * 0.25));
      weapon.currentDef = Math.floor(weapon.baseDef * (1 + weapon.enhanceLevel * 0.25));

      if (this.game.ownedHeroes[heroId]) {
        this.game.ownedHeroes[heroId].exclusiveWeapon = weapon;
      }
      if (this.game.audio) this.game.audio.playUpgrade();
      return { success: true, level: weapon.enhanceLevel, msg: `강화 성공! +${weapon.enhanceLevel} 달성!` };
    } else {
      if (this.game.audio) this.game.audio.playFail();
      return { success: false, failed: true, msg: '강화에 실패하였습니다... 재료가 소모되었습니다.' };
    }
  }

  // Get Next Wave Intel for Scouting
  getNextWaveIntel(waveNum) {
    const raceKeys = ['orc', 'undead', 'demon', 'dark_elf', 'golem', 'dragon'];
    const raceKey = raceKeys[(waveNum - 1) % raceKeys.length];
    const raceInfo = ENEMY_RACES[raceKey];

    const isBossWave = (waveNum % 5 === 0);
    const difficultyScale = Math.pow(1.15, waveNum - 1);

    return {
      waveNum: waveNum,
      isBossWave: isBossWave,
      raceKey: raceKey,
      raceName: raceInfo.name,
      raceIcon: raceInfo.icon,
      raceDesc: raceInfo.desc,
      weakness: raceInfo.weakness,
      resistance: raceInfo.resistance,
      bossName: isBossWave ? raceInfo.bossName : null,
      bossDesc: isBossWave ? raceInfo.bossDesc : null,
      estimatedEnemyCount: Math.min(60, 15 + waveNum * 4),
      difficultyScale: difficultyScale.toFixed(2),
      recommendedElements: raceInfo.weakness
    };
  }
}
