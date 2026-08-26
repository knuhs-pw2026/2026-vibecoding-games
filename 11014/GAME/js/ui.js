/**
 * ANCIENT CASTLE GUARDIANS: UI MANAGER
 * Handles Top HUD, Deployed Skills Deck, Dungeon Modal (Scout, Mine, Forge),
 * Heroes Modal (Deploy & Levelup), 100-Pull Pity Gacha Summon & Realistic 3D Cinematic Sequences,
 * 5-Star Mythic Cutscenes, Gacha History, Castle Defense, and 5-tier Difficulty Selector.
 */

class UIManager {
  constructor(game) {
    this.game = game;
    this.activeModal = null;
    this.currentDungeonTab = 'scout'; // 'scout', 'mine', 'forge'
    this.heroFilterTier = 'all';

    // Cinematic State
    this.activeGachaResult = null;
    this.portalTimer = null;
    this.revealedCardCount = 0;
    this.isMythicCutsceneActive = false;

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.hudWave = document.getElementById('hud-wave');
    this.hudCastleHpBar = document.getElementById('hud-castle-hp-bar');
    this.hudCastleHpText = document.getElementById('hud-castle-hp-text');
    this.hudCastleBarrier = document.getElementById('hud-castle-barrier');
    this.hudGold = document.getElementById('hud-gold');
    this.hudDiamonds = document.getElementById('hud-diamonds');
    this.hudDungeonCoins = document.getElementById('hud-dungeon-coins');
    this.hudMinerals = document.getElementById('hud-minerals-list');

    // Controls
    this.btnDifficulty = document.getElementById('btn-difficulty');
    this.btnStartWave = document.getElementById('btn-start-wave');
    this.btnEmergencyRepair = document.getElementById('btn-emergency-repair');
    this.btnSpeed = document.getElementById('btn-speed');
    this.btnAuto = document.getElementById('btn-auto');
    this.btnAudio = document.getElementById('btn-audio');

    this.heroSkillDeck = document.getElementById('hero-skill-deck');

    // Modals
    this.modalDungeon = document.getElementById('modal-dungeon');
    this.modalHeroes = document.getElementById('modal-heroes');
    this.modalSummon = document.getElementById('modal-summon');
    this.modalCastle = document.getElementById('modal-castle');
    this.modalGachaCinematic = document.getElementById('modal-gacha-cinematic');
    this.modalGachaResult = document.getElementById('modal-gacha-result');
    this.modalGachaHistory = document.getElementById('modal-gacha-history');
    this.modalDifficulty = document.getElementById('modal-difficulty');
    this.gachaMythicCutscene = document.getElementById('gacha-mythic-cutscene');

    // Gacha Cinematic Elements
    this.gachaPortalScene = document.getElementById('gacha-portal-scene');
    this.gachaCardsScene = document.getElementById('gacha-cards-scene');
    this.interactiveCardsGrid = document.getElementById('interactive-cards-grid');
    this.portalLightBeam = document.getElementById('portal-light-beam');
    this.portalStatusText = document.getElementById('portal-status-text');
    this.cinematicPhaseText = document.getElementById('cinematic-phase-text');
    this.btnSkipCinematic = document.getElementById('btn-skip-gacha-cinematic');
    this.btnRevealAllCards = document.getElementById('btn-reveal-all-cards');

    // Summon Banner Elements
    this.gachaPityBar = document.getElementById('gacha-pity-bar');
    this.gachaPityText = document.getElementById('gacha-pity-text');
    this.pickupHeroSelect = document.getElementById('pickup-hero-select');
    this.btnSummonFree = document.getElementById('btn-summon-free');
    this.freeSummonStatus = document.getElementById('free-summon-status');
    this.btnOpenGachaHistory = document.getElementById('btn-open-gacha-history');
  }

  bindEvents() {
    // Difficulty Modal Open
    if (this.btnDifficulty) {
      this.btnDifficulty.addEventListener('click', () => {
        this.openModal('difficulty');
      });
    }

    // Wave Start
    if (this.btnStartWave) {
      this.btnStartWave.addEventListener('click', () => {
        this.game.startWave();
        this.renderAll();
      });
    }

    // Emergency Repair
    if (this.btnEmergencyRepair) {
      this.btnEmergencyRepair.addEventListener('click', () => {
        const res = this.game.castle.emergencyRepair();
        if (!res.success && res.msg) alert(res.msg);
        this.renderAll();
      });
    }

    // Game Speed
    if (this.btnSpeed) {
      this.btnSpeed.addEventListener('click', () => {
        this.game.gameSpeed = this.game.gameSpeed === 1.0 ? 2.0 : 1.0;
        this.btnSpeed.textContent = `⚡ ${this.game.gameSpeed}x 배속`;
      });
    }

    // Auto Battle
    if (this.btnAuto) {
      this.btnAuto.addEventListener('click', () => {
        this.game.autoBattle = !this.game.autoBattle;
        this.btnAuto.className = this.game.autoBattle ? 'btn-toggle active' : 'btn-toggle';
        this.btnAuto.textContent = this.game.autoBattle ? '⚔️ 자동 전투: ON' : '⚔️ 자동 전투: OFF';
      });
    }

    // Audio Toggle
    if (this.btnAudio) {
      this.btnAudio.addEventListener('click', () => {
        const state = this.game.audio.toggle();
        this.btnAudio.textContent = state ? '🔊 사운드 ON' : '🔇 사운드 OFF';
      });
    }

    // Bottom Navigation Buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget.dataset.modal;
        this.openModal(target);
      });
    });

    // Close Modal Buttons
    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeAllModals();
      });
    });

    // Dungeon Tab Switching
    document.querySelectorAll('.dungeon-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentDungeonTab = e.currentTarget.dataset.tab;
        this.renderDungeonModal();
      });
    });

    // Hero Filter Tabs
    document.querySelectorAll('.hero-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.hero-filter-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.heroFilterTier = e.currentTarget.dataset.tier;
        this.renderHeroesModal();
      });
    });

    // Gacha Summon Buttons
    if (this.btnSummonFree) {
      this.btnSummonFree.addEventListener('click', () => {
        if (!this.game.freeDailyPullAvailable) {
          alert('오늘의 무료 소환을 이미 사용하셨습니다! 내일 다시 이용해주세요.');
          return;
        }
        this.handleSummon(1, true);
      });
    }

    const btnSummon1 = document.getElementById('btn-summon-1');
    const btnSummon10 = document.getElementById('btn-summon-10');
    if (btnSummon1) {
      btnSummon1.addEventListener('click', () => this.handleSummon(1, false));
    }
    if (btnSummon10) {
      btnSummon10.addEventListener('click', () => this.handleSummon(10, false));
    }

    // Pickup Hero Selection Change
    if (this.pickupHeroSelect) {
      this.pickupHeroSelect.addEventListener('change', (e) => {
        this.game.selectedPickupHeroId = e.target.value;
        this.game.saveProgress();
        this.renderSummonModal();
      });
    }

    // Gacha History Open
    if (this.btnOpenGachaHistory) {
      this.btnOpenGachaHistory.addEventListener('click', () => {
        this.openModal('gacha-history');
      });
    }

    // Gacha Cinematic Controls
    if (this.btnSkipCinematic) {
      this.btnSkipCinematic.addEventListener('click', () => {
        this.skipGachaCinematic();
      });
    }

    if (this.btnRevealAllCards) {
      this.btnRevealAllCards.addEventListener('click', () => {
        this.revealAllCards();
      });
    }

    // Gacha Result Retry / Close Buttons
    const btnRetry1 = document.getElementById('btn-retry-summon-1');
    const btnRetry10 = document.getElementById('btn-retry-summon-10');
    const btnCloseGacha = document.getElementById('btn-close-gacha');
    const btnCloseResultX = document.getElementById('btn-close-result-x');

    if (btnRetry1) {
      btnRetry1.addEventListener('click', () => {
        this.modalGachaResult.classList.add('hidden');
        this.handleSummon(1, false);
      });
    }

    if (btnRetry10) {
      btnRetry10.addEventListener('click', () => {
        this.modalGachaResult.classList.add('hidden');
        this.handleSummon(10, false);
      });
    }

    if (btnCloseGacha) {
      btnCloseGacha.addEventListener('click', () => {
        this.modalGachaResult.classList.add('hidden');
        this.renderAll();
      });
    }

    if (btnCloseResultX) {
      btnCloseResultX.addEventListener('click', () => {
        this.modalGachaResult.classList.add('hidden');
        this.renderAll();
      });
    }
  }

  openModal(modalId) {
    this.closeAllModals();
    this.activeModal = modalId;

    if (modalId === 'dungeon') {
      this.modalDungeon.classList.remove('hidden');
      this.renderDungeonModal();
    } else if (modalId === 'heroes') {
      this.modalHeroes.classList.remove('hidden');
      this.renderHeroesModal();
    } else if (modalId === 'summon') {
      this.modalSummon.classList.remove('hidden');
      this.renderSummonModal();
    } else if (modalId === 'castle') {
      this.modalCastle.classList.remove('hidden');
      this.renderCastleModal();
    } else if (modalId === 'difficulty') {
      this.modalDifficulty.classList.remove('hidden');
      this.renderDifficultyModal();
    } else if (modalId === 'gacha-history') {
      this.modalGachaHistory.classList.remove('hidden');
      this.renderGachaHistoryModal();
    }
  }

  closeAllModals() {
    if (this.modalDungeon) this.modalDungeon.classList.add('hidden');
    if (this.modalHeroes) this.modalHeroes.classList.add('hidden');
    if (this.modalSummon) this.modalSummon.classList.add('hidden');
    if (this.modalCastle) this.modalCastle.classList.add('hidden');
    if (this.modalGachaCinematic) this.modalGachaCinematic.classList.add('hidden');
    if (this.modalGachaResult) this.modalGachaResult.classList.add('hidden');
    if (this.modalGachaHistory) this.modalGachaHistory.classList.add('hidden');
    if (this.modalDifficulty) this.modalDifficulty.classList.add('hidden');
    if (this.gachaMythicCutscene) this.gachaMythicCutscene.classList.add('hidden');

    if (this.portalTimer) {
      clearTimeout(this.portalTimer);
      this.portalTimer = null;
    }

    this.activeModal = null;
  }

  // ==========================================================
  // REALISTIC GACHA CINEMATIC & REVEAL SYSTEM
  // ==========================================================
  handleSummon(count, isFree = false) {
    const resultData = this.game.summonGacha(count, isFree);
    if (!resultData) return;

    this.activeGachaResult = resultData;
    this.revealedCardCount = 0;

    // Start Cinematic Sequence
    this.startGachaCinematic(resultData);
  }

  startGachaCinematic(resultData) {
    this.closeAllModals();
    this.modalGachaCinematic.classList.remove('hidden');
    this.activeModal = 'gacha-cinematic';

    // Phase 1: Portal Scene
    this.gachaPortalScene.classList.remove('hidden');
    this.gachaCardsScene.classList.add('hidden');
    this.gachaMythicCutscene.classList.add('hidden');

    // Set portal sound & light beam glow
    if (this.game.audio) this.game.audio.playGachaPortal();

    this.portalLightBeam.className = `portal-light-beam glow-tier-${resultData.highestTier}`;
    
    if (resultData.highestTier === 5) {
      this.cinematicPhaseText.textContent = '🌟 신화의 마법진이 황금빛으로 공명합니다!';
      this.portalStatusText.textContent = '신화 5성 영웅의 강림이 확정되었습니다!';
    } else if (resultData.highestTier === 4) {
      this.cinematicPhaseText.textContent = '✨ 전설의 마법진이 보랏빛으로 빛납니다!';
      this.portalStatusText.textContent = '강력한 4성 전설 영웅이 응답하였습니다!';
    } else {
      this.cinematicPhaseText.textContent = '소환진 공명 중...';
      this.portalStatusText.textContent = '차원의 문을 통과하고 있습니다...';
    }

    // Auto transition to card reveal phase after 1.5s
    this.portalTimer = setTimeout(() => {
      this.transitionToCardsScene(resultData);
    }, 1500);
  }

  transitionToCardsScene(resultData) {
    if (this.portalTimer) {
      clearTimeout(this.portalTimer);
      this.portalTimer = null;
    }

    this.gachaPortalScene.classList.add('hidden');
    this.gachaCardsScene.classList.remove('hidden');
    this.cinematicPhaseText.textContent = '카드를 선택하여 영웅을 확인하세요!';

    this.interactiveCardsGrid.innerHTML = '';
    this.revealedCardCount = 0;

    resultData.cards.forEach((item, idx) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'flip-card';
      cardEl.dataset.index = idx;

      const tierCfg = HERO_TIERS[item.hero.tier];

      cardEl.innerHTML = `
        <div class="flip-card-inner">
          <div class="flip-card-front card-glow-${item.hero.tier}">
            <div class="card-back-rune">✨</div>
            <div class="card-back-text">TOUCH</div>
          </div>
          <div class="flip-card-back tier-${item.hero.tier}-card">
            <span class="card-badge ${item.isNew ? 'badge-new' : 'badge-shards'}">
              ${item.isNew ? 'NEW!' : `조각 +${item.shardsGained}`}
            </span>
            <div class="gacha-tier-badge" style="background: ${tierCfg.color};">${item.hero.tier}★ ${tierCfg.name}</div>
            <div class="card-avatar">${item.hero.avatar}</div>
            <div class="card-name" style="color: ${tierCfg.color};">${item.hero.name}</div>
            <div class="card-title">${item.hero.title}</div>
            <div class="card-element">${ELEMENTS[item.hero.element]?.icon || ''} ${ELEMENTS[item.hero.element]?.name || ''}</div>
          </div>
        </div>
      `;

      cardEl.addEventListener('click', () => {
        this.flipSingleCard(cardEl, item);
      });

      this.interactiveCardsGrid.appendChild(cardEl);
    });
  }

  flipSingleCard(cardEl, item) {
    if (cardEl.classList.contains('revealed') || this.isMythicCutsceneActive) return;

    cardEl.classList.add('revealed');
    this.revealedCardCount++;

    // Audio SFX
    if (this.game.audio) this.game.audio.playCardFlip();

    // If 5-Star Mythic Hero: Trigger Epic Fullscreen Cutscene!
    if (item.hero.tier === 5) {
      this.showMythicCutscene(item.hero, () => {
        this.checkAllCardsRevealed();
      });
    } else {
      if (item.hero.tier === 4 && this.game.audio) {
        this.game.audio.playSummon4Star();
      }
      this.checkAllCardsRevealed();
    }
  }

  showMythicCutscene(hero, onComplete) {
    this.isMythicCutsceneActive = true;
    this.gachaMythicCutscene.classList.remove('hidden');

    const avatarEl = document.getElementById('mythic-cutscene-avatar');
    const nameEl = document.getElementById('mythic-cutscene-name');
    const titleEl = document.getElementById('mythic-cutscene-title');
    const quoteEl = document.getElementById('mythic-cutscene-quote');
    const weaponNameEl = document.getElementById('mythic-cutscene-weap-name');

    if (avatarEl) avatarEl.textContent = hero.avatar;
    if (nameEl) nameEl.textContent = hero.name;
    if (titleEl) titleEl.textContent = hero.title;
    if (quoteEl) quoteEl.textContent = `"${hero.skillDesc.slice(0, 45)}..."`;
    if (weaponNameEl) weaponNameEl.textContent = hero.exclusiveWeapon?.name || '신화의 전용무기';

    if (this.game.audio) this.game.audio.playSummon5Star();
    if (this.game.particles) this.game.particles.spawnRainbowSummonSparks(640, 360);

    const clickHandler = () => {
      this.gachaMythicCutscene.classList.add('hidden');
      this.gachaMythicCutscene.removeEventListener('click', clickHandler);
      this.isMythicCutsceneActive = false;
      if (onComplete) onComplete();
    };

    this.gachaMythicCutscene.addEventListener('click', clickHandler);
  }

  revealAllCards() {
    const cards = this.interactiveCardsGrid.querySelectorAll('.flip-card:not(.revealed)');
    cards.forEach((card, idx) => {
      setTimeout(() => {
        card.classList.add('revealed');
        this.revealedCardCount++;
        if (this.game.audio) this.game.audio.playCardFlip();
        if (idx === cards.length - 1) {
          setTimeout(() => this.showFinalResults(this.activeGachaResult), 800);
        }
      }, idx * 70);
    });
  }

  checkAllCardsRevealed() {
    if (!this.activeGachaResult) return;
    if (this.revealedCardCount >= this.activeGachaResult.cards.length) {
      setTimeout(() => {
        this.showFinalResults(this.activeGachaResult);
      }, 900);
    }
  }

  skipGachaCinematic() {
    if (this.portalTimer) {
      clearTimeout(this.portalTimer);
      this.portalTimer = null;
    }
    this.isMythicCutsceneActive = false;
    this.gachaMythicCutscene.classList.add('hidden');
    this.showFinalResults(this.activeGachaResult);
  }

  showFinalResults(resultData) {
    if (!resultData) return;
    this.closeAllModals();
    this.modalGachaResult.classList.remove('hidden');
    this.activeModal = 'gacha-result';

    const container = document.getElementById('gacha-result-cards');
    container.innerHTML = '';

    resultData.cards.forEach((res, idx) => {
      const card = document.createElement('div');
      const tierConfig = HERO_TIERS[res.hero.tier];
      card.className = `gacha-card tier-${res.hero.tier}`;
      card.style.animationDelay = `${idx * 0.06}s`;
      card.style.borderColor = tierConfig.color;
      card.style.boxShadow = `0 0 15px ${tierConfig.glow}`;

      card.innerHTML = `
        <div class="gacha-tier-badge" style="background: ${tierConfig.color};">${res.hero.tier}★ ${tierConfig.name}</div>
        <div class="gacha-avatar">${res.hero.avatar}</div>
        <div class="gacha-hero-name" style="color: ${tierConfig.color};">${res.hero.name}</div>
        <div class="gacha-hero-title">${res.hero.title}</div>
        <div class="gacha-hero-elem">${ELEMENTS[res.hero.element]?.icon || ''} ${ELEMENTS[res.hero.element]?.name || ''}</div>
        ${res.isNew ? '<span class="badge-new">NEW!</span>' : `<span class="badge-dup">조각 +${res.shardsGained}</span>`}
      `;
      container.appendChild(card);
    });

    this.renderAll();
  }

  // ==========================================================
  // RENDER SECTIONS
  // ==========================================================
  renderAll() {
    this.renderHUD();
    this.renderSkillDeck();

    if (this.activeModal === 'dungeon') this.renderDungeonModal();
    if (this.activeModal === 'heroes') this.renderHeroesModal();
    if (this.activeModal === 'summon') this.renderSummonModal();
    if (this.activeModal === 'castle') this.renderCastleModal();
    if (this.activeModal === 'difficulty') this.renderDifficultyModal();
    if (this.activeModal === 'gacha-history') this.renderGachaHistoryModal();
  }

  renderHUD() {
    if (!this.hudWave) return;

    // Difficulty Button Badge
    if (this.btnDifficulty) {
      const diff = this.game.getDifficultyConfig();
      this.btnDifficulty.className = `btn-toggle btn-diff-badge ${diff.badgeClass}`;
      this.btnDifficulty.innerHTML = `${diff.icon} 난이도: ${diff.name} (${Math.round(diff.rewardGold * 100)}%)`;
    }

    // Wave HUD
    const intel = this.game.dungeon.getNextWaveIntel(this.game.wave);
    if (this.game.waveState === 'battle') {
      const remain = this.game.enemiesToSpawn.length + this.game.enemies.length;
      this.hudWave.innerHTML = `<span class="wave-num">WAVE ${this.game.wave}</span> <span class="wave-race">${intel.raceIcon} ${intel.raceName} 침공 중! (남은 적: ${remain})</span>`;
      this.btnStartWave.classList.add('hidden');
    } else {
      this.hudWave.innerHTML = `<span class="wave-num">WAVE ${this.game.wave} 대기</span> <span class="wave-race">다음 적: ${intel.raceIcon} ${intel.raceName}</span>`;
      this.btnStartWave.classList.remove('hidden');
    }

    // Castle HP
    const castle = this.game.castle;
    const hpPct = Math.max(0, (castle.currentHp / castle.maxHp) * 100);
    this.hudCastleHpBar.style.width = `${hpPct}%`;
    this.hudCastleHpText.textContent = `${Math.round(castle.currentHp)} / ${castle.maxHp} HP (${Math.round(hpPct)}%)`;

    if (castle.barrier > 0) {
      this.hudCastleBarrier.textContent = `🛡️ 방어막: +${Math.round(castle.barrier)}`;
      this.hudCastleBarrier.classList.remove('hidden');
    } else {
      this.hudCastleBarrier.classList.add('hidden');
    }

    // Currencies
    this.hudGold.textContent = Math.floor(this.game.gold).toLocaleString();
    this.hudDiamonds.textContent = Math.floor(this.game.diamonds).toLocaleString();
    this.hudDungeonCoins.textContent = Math.floor(this.game.dungeon.minerals.dungeonCoins).toLocaleString();

    // Minerals bar
    const min = this.game.dungeon.minerals;
    this.hudMinerals.innerHTML = `
      <span title="철광석">⛏️ 철: <b>${Math.floor(min.iron)}</b></span>
      <span title="미스릴">🔷 미스릴: <b>${Math.floor(min.mithril)}</b></span>
      <span title="아다만타이트">🔶 아다만: <b>${Math.floor(min.adamantite)}</b></span>
      <span title="오리하르콘">🔮 오리하르콘: <b>${Math.floor(min.orichalcum)}</b></span>
      <span title="용혈석">🐲 용혈석: <b>${Math.floor(min.dragonStone)}</b></span>
    `;
  }

  renderSkillDeck() {
    if (!this.heroSkillDeck) return;
    this.heroSkillDeck.innerHTML = '';

    const deployed = this.game.deployedHeroes;
    for (let i = 0; i < 8; i++) {
      const hero = deployed[i];
      const slot = document.createElement('div');

      if (hero) {
        const tierConfig = HERO_TIERS[hero.data.tier] || HERO_TIERS[1];
        const isReady = hero.skillCooldown <= 0;
        const cooldownPct = isReady ? 0 : (hero.skillCooldown / hero.maxSkillCooldown) * 100;

        slot.className = `deck-slot tier-${hero.data.tier} ${isReady ? 'ready' : 'cooldown'}`;
        slot.style.borderColor = tierConfig.color;

        slot.innerHTML = `
          <div class="slot-avatar">${hero.data.avatar}</div>
          <div class="slot-hero-name" style="color: ${tierConfig.color}">${hero.data.name}</div>
          <div class="slot-skill-name">${hero.data.skillName}</div>
          <div class="cooldown-overlay" style="height: ${cooldownPct}%;"></div>
          ${!isReady ? `<span class="cooldown-timer">${hero.skillCooldown.toFixed(1)}s</span>` : '<span class="ready-badge">READY</span>'}
        `;

        slot.addEventListener('click', () => {
          if (hero.skillCooldown <= 0) {
            hero.castSkill();
            this.renderSkillDeck();
          }
        });
      } else {
        slot.className = 'deck-slot empty';
        slot.innerHTML = `
          <div class="empty-plus">+</div>
          <div class="empty-text">영웅 미배치</div>
        `;
        slot.addEventListener('click', () => {
          this.openModal('heroes');
        });
      }

      this.heroSkillDeck.appendChild(slot);
    }
  }

  // 1. Dungeon Modal
  renderDungeonModal() {
    document.querySelectorAll('.dungeon-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === this.currentDungeonTab);
    });

    const content = document.getElementById('dungeon-tab-content');
    if (!content) return;

    if (this.currentDungeonTab === 'scout') {
      this.renderScoutTab(content);
    } else if (this.currentDungeonTab === 'mine') {
      this.renderMineTab(content);
    } else if (this.currentDungeonTab === 'forge') {
      this.renderForgeTab(content);
    }
  }

  renderScoutTab(container) {
    const intel = this.game.dungeon.getNextWaveIntel(this.game.wave);
    const diff = this.game.getDifficultyConfig();

    container.innerHTML = `
      <div class="scout-container">
        <div class="scout-header">
          <h3>📡 WAVE ${this.game.wave} 침공 정찰 보고서</h3>
          <span class="scout-tag ${intel.isBossWave ? 'boss-tag' : 'normal-tag'}">
            ${intel.isBossWave ? '⚠️ 보스 침공 경보' : '⚔️ 일반 침공파'}
          </span>
        </div>

        <div class="scout-intel-card">
          <div class="intel-race-header">
            <span class="race-icon-large">${intel.raceIcon}</span>
            <div>
              <h4>${intel.raceName}</h4>
              <p>${intel.raceDesc}</p>
            </div>
          </div>

          <div class="intel-grid">
            <div class="intel-item"><span>예상 적 규모</span><b>약 ${intel.estimatedEnemyCount} 기</b></div>
            <div class="intel-item"><span>약점 속성</span><b class="weakness">${intel.weakness}</b></div>
            <div class="intel-item"><span>저항 속성</span><b class="resistance">${intel.resistance}</b></div>
            <div class="intel-item"><span>현재 난이도</span><b>${diff.icon} ${diff.name} (체력 x${diff.hpScale})</b></div>
          </div>

          ${intel.isBossWave ? `
            <div class="boss-intel-box">
              <h5>👑 출현 보스: ${intel.bossName}</h5>
              <p>${intel.bossDesc}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderMineTab(container) {
    const dungeon = this.game.dungeon;
    const upgradeCost = dungeon.getUpgradeMiningCost();

    container.innerHTML = `
      <div class="mine-container">
        <div class="mine-header-box">
          <div>
            <h3>⛏️ 지하 고대 광맥 채굴 (Lv.${dungeon.miningLevel})</h3>
            <p>전용무기 제작과 성벽 포탑 강화에 필요한 5대 희귀 광물을 지속적으로 채굴합니다.</p>
          </div>
          <button id="btn-upgrade-mining" class="btn-primary" ${dungeon.minerals.dungeonCoins < upgradeCost ? 'disabled' : ''}>
            광산 기계 업그레이드 (🪙 ${upgradeCost})
          </button>
        </div>

        <div class="mine-vein-action">
          <button id="btn-manual-mine" class="btn-mine-strike">
            <span class="pickaxe-icon">⛏️</span>
            <span>광맥 강력 타격! (수동 채굴)</span>
          </button>
        </div>

        <div class="minerals-storage-grid">
          <div class="mineral-card iron">
            <span class="m-icon">⛏️</span>
            <div class="m-info">
              <h5>철광석</h5>
              <b>${Math.floor(dungeon.minerals.iron)} 개</b>
              <small>+${(dungeon.miningRates.iron * dungeon.miningLevel).toFixed(1)}/s</small>
            </div>
          </div>
          <div class="mineral-card mithril">
            <span class="m-icon">🔷</span>
            <div class="m-info">
              <h5>미스릴</h5>
              <b>${Math.floor(dungeon.minerals.mithril)} 개</b>
              <small>+${(dungeon.miningRates.mithril * dungeon.miningLevel).toFixed(1)}/s</small>
            </div>
          </div>
          <div class="mineral-card adamantite">
            <span class="m-icon">🔶</span>
            <div class="m-info">
              <h5>아다만타이트</h5>
              <b>${Math.floor(dungeon.minerals.adamantite)} 개</b>
              <small>+${(dungeon.miningRates.adamantite * dungeon.miningLevel).toFixed(2)}/s</small>
            </div>
          </div>
          <div class="mineral-card orichalcum">
            <span class="m-icon">🔮</span>
            <div class="m-info">
              <h5>오리하르콘</h5>
              <b>${Math.floor(dungeon.minerals.orichalcum)} 개</b>
              <small>+${(dungeon.miningRates.orichalcum * dungeon.miningLevel).toFixed(2)}/s</small>
            </div>
          </div>
          <div class="mineral-card dragon">
            <span class="m-icon">🐲</span>
            <div class="m-info">
              <h5>용혈석</h5>
              <b>${Math.floor(dungeon.minerals.dragonStone)} 개</b>
              <small>+${(dungeon.miningRates.dragonStone * dungeon.miningLevel).toFixed(3)}/s</small>
            </div>
          </div>
          <div class="mineral-card coins">
            <span class="m-icon">🪙</span>
            <div class="m-info">
              <h5>던전 코인</h5>
              <b>${Math.floor(dungeon.minerals.dungeonCoins)} 코인</b>
              <small>+${(dungeon.miningRates.dungeonCoins * dungeon.miningLevel).toFixed(1)}/s</small>
            </div>
          </div>
        </div>
      </div>
    `;

    const btnManual = document.getElementById('btn-manual-mine');
    if (btnManual) {
      btnManual.addEventListener('click', () => {
        dungeon.manualMine();
        this.renderAll();
      });
    }

    const btnUpgrade = document.getElementById('btn-upgrade-mining');
    if (btnUpgrade) {
      btnUpgrade.addEventListener('click', () => {
        dungeon.upgradeMining();
        this.renderAll();
      });
    }
  }

  renderForgeTab(container) {
    const dungeon = this.game.dungeon;
    container.innerHTML = `
      <div class="forge-container">
        <div class="forge-header">
          <h3>🔥 5성 신화 영웅 전용무기 대장간</h3>
          <p>각 5성 영웅 고유의 파괴적인 스킬과 히든 이펙트를 개방하는 최강의 무기를 제작 및 강화합니다.</p>
        </div>
        <div class="weapons-grid" id="forge-weapons-list">
          <!-- Populated dynamically -->
        </div>
      </div>
    `;

    const list = document.getElementById('forge-weapons-list');
    MYTHIC_5_STAR_HEROES.forEach(hero => {
      const weap = hero.exclusiveWeapon;
      if (!weap) return;

      const isCrafted = !!dungeon.craftedExclusiveWeapons[hero.id];
      const craftedData = dungeon.craftedExclusiveWeapons[hero.id];
      const enhanceLvl = isCrafted ? (craftedData.enhanceLevel || 0) : 0;
      const canCraft = dungeon.canCraftWeapon(hero.id);
      const isOwnedHero = !!this.game.ownedHeroes[hero.id];

      const card = document.createElement('div');
      card.className = `weapon-forge-card ${isCrafted ? 'crafted' : ''}`;

      card.innerHTML = `
        <div class="weapon-top">
          <span class="weapon-hero-badge">${hero.avatar} ${hero.name} 전용</span>
          <span class="weapon-status-badge ${isCrafted ? 'crafted' : 'uncrafted'}">
            ${isCrafted ? `제작 완료 (+${enhanceLvl} 강화)` : '미제작'}
          </span>
        </div>
        <h4 class="weapon-name">⚔️ ${weap.name}</h4>
        <p class="weapon-desc">${weap.desc}</p>
        <div class="weapon-special-box">
          <span class="sp-label">✨ 각성 고유 효과:</span>
          <span class="sp-text">${weap.specialEffect}</span>
        </div>

        <div class="weapon-recipe">
          <span class="rec-item ${dungeon.minerals.iron >= weap.recipe.iron ? 'ok' : 'no'}">⛏️ 철 ${weap.recipe.iron}</span>
          <span class="rec-item ${dungeon.minerals.mithril >= weap.recipe.mithril ? 'ok' : 'no'}">🔷 미스릴 ${weap.recipe.mithril}</span>
          <span class="rec-item ${dungeon.minerals.adamantite >= weap.recipe.adamantite ? 'ok' : 'no'}">🔶 아다만 ${weap.recipe.adamantite}</span>
          <span class="rec-item ${dungeon.minerals.orichalcum >= weap.recipe.orichalcum ? 'ok' : 'no'}">🔮 오리하르콘 ${weap.recipe.orichalcum}</span>
          <span class="rec-item ${dungeon.minerals.dragonStone >= weap.recipe.dragonStone ? 'ok' : 'no'}">🐲 용혈석 ${weap.recipe.dragonStone}</span>
          <span class="rec-item ${dungeon.minerals.dungeonCoins >= weap.recipe.dungeonCoins ? 'ok' : 'no'}">🪙 코인 ${weap.recipe.dungeonCoins}</span>
        </div>

        <div class="weapon-actions">
          ${!isCrafted ? `
            <button class="btn-craft btn-accent" data-heroid="${hero.id}" ${canCraft ? '' : 'disabled'}>
              전용무기 단조 제작
            </button>
          ` : `
            <button class="btn-enhance btn-primary" data-heroid="${hero.id}">
              +${enhanceLvl + 1} 강화 시도 (🪙 ${dungeon.getEnhanceCost(hero.id)})
            </button>
          `}
        </div>
      `;

      list.appendChild(card);
    });

    list.querySelectorAll('.btn-craft').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const heroId = e.currentTarget.dataset.heroid;
        const res = dungeon.craftExclusiveWeapon(heroId);
        if (!res.success) alert(res.msg);
        this.renderAll();
      });
    });

    list.querySelectorAll('.btn-enhance').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const heroId = e.currentTarget.dataset.heroid;
        const res = dungeon.enhanceExclusiveWeapon(heroId);
        if (!res.success) alert(res.msg);
        this.renderAll();
      });
    });
  }

  // 2. Heroes Roster Modal
  renderHeroesModal() {
    const list = document.getElementById('heroes-roster-list');
    if (!list) return;
    list.innerHTML = '';

    let heroesToShow = ALL_HEROES;
    if (this.heroFilterTier !== 'all') {
      const tierNum = parseInt(this.heroFilterTier);
      heroesToShow = ALL_HEROES.filter(h => h.tier === tierNum);
    }

    heroesToShow.forEach(hero => {
      const isOwned = !!this.game.ownedHeroes[hero.id];
      const record = this.game.ownedHeroes[hero.id];
      const lvl = record ? record.level : 1;
      const shards = record ? (record.shards || 0) : 0;
      const isDeployed = this.game.deployedHeroIds.includes(hero.id);
      const tierCfg = HERO_TIERS[hero.tier];
      const hasExclusive = this.game.dungeon && !!this.game.dungeon.craftedExclusiveWeapons[hero.id];

      const card = document.createElement('div');
      card.className = `hero-roster-card ${isOwned ? 'owned' : 'unowned'} tier-${hero.tier}`;
      card.style.borderColor = isOwned ? tierCfg.color : '#334155';

      const lvlUpCost = lvl * 150;

      card.innerHTML = `
        <div class="hero-card-top">
          <div class="hero-card-avatar">${hero.avatar}</div>
          <div class="hero-card-info">
            <div class="hero-card-name" style="color: ${tierCfg.color};">${hero.name} ${isOwned ? `<span class="lvl-badge">Lv.${lvl}</span>` : ''}</div>
            <div class="hero-card-title">${hero.title}</div>
            <div class="hero-card-tier" style="color: ${tierCfg.color};">${hero.tier}★ ${tierCfg.name} | ${ELEMENTS[hero.element]?.icon || ''} ${ELEMENTS[hero.element]?.name || ''}</div>
            <div class="hero-card-role">위치: ${hero.position === 'wall' ? '🏰 성벽 위 원거리' : '🛡️ 성문 앞 지상 요격'} | ${hero.role.toUpperCase()}</div>
          </div>
        </div>

        <div class="hero-card-stats">
          <span>❤️ HP: <b>${Math.floor(hero.baseHp * (1 + (lvl - 1) * 0.15))}</b></span>
          <span>⚔️ ATK: <b>${Math.floor(hero.baseAtk * (1 + (lvl - 1) * 0.15))}</b></span>
          <span>🛡️ DEF: <b>${Math.floor(hero.baseDef * (1 + (lvl - 1) * 0.15))}</b></span>
        </div>

        <div class="hero-card-skill-desc">
          <b>⚡ [${hero.skillName}]</b>: ${hero.skillDesc}
        </div>

        ${hero.tier === 5 ? `
          <div class="hero-exclusive-tag ${hasExclusive ? 'equipped' : ''}">
            ⚔️ 전용무기: ${hero.exclusiveWeapon?.name} ${hasExclusive ? '<b>(장착 완료)</b>' : '<small>(대장간에서 제작)</small>'}
          </div>
        ` : ''}

        <div class="hero-card-actions">
          ${isOwned ? `
            <div class="shards-info">보유 조각: <b>${shards} 개</b></div>
            <button class="btn-deploy btn-sm ${isDeployed ? 'btn-danger' : 'btn-primary'}" data-heroid="${hero.id}">
              ${isDeployed ? '출전 해제' : '출전 배치'}
            </button>
            <button class="btn-lvlup btn-sm btn-accent" data-heroid="${hero.id}" ${this.game.gold < lvlUpCost ? 'disabled' : ''}>
              레벨업 (🪙 ${lvlUpCost})
            </button>
          ` : `
            <div class="unowned-text">미보유 (소환에서 획득)</div>
          `}
        </div>
      `;

      list.appendChild(card);
    });

    list.querySelectorAll('.btn-deploy').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const heroId = e.currentTarget.dataset.heroid;
        if (this.game.deployedHeroIds.includes(heroId)) {
          this.game.undeployHero(heroId);
        } else {
          this.game.deployHero(heroId);
        }
        this.renderAll();
      });
    });

    list.querySelectorAll('.btn-lvlup').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const heroId = e.currentTarget.dataset.heroid;
        this.game.levelUpHero(heroId);
        this.renderAll();
      });
    });
  }

  // 3. Summon Modal (100-Pull Pity System)
  renderSummonModal() {
    const pity = this.game.pityCounter;
    const maxPity = this.game.maxPity;
    const remaining = Math.max(0, maxPity - pity);
    const pct = Math.min(100, (pity / maxPity) * 100);

    if (this.gachaPityText) {
      this.gachaPityText.textContent = `${pity} / ${maxPity} 회 (${remaining}회 남음)`;
    }

    if (this.gachaPityBar) {
      this.gachaPityBar.style.width = `${pct}%`;
    }

    // Populate Pickup dropdown
    if (this.pickupHeroSelect && this.pickupHeroSelect.options.length === 0) {
      MYTHIC_5_STAR_HEROES.forEach(hero => {
        const opt = document.createElement('option');
        opt.value = hero.id;
        opt.textContent = `${hero.avatar} 5성 [${hero.name}] - ${hero.title}`;
        if (hero.id === this.game.selectedPickupHeroId) opt.selected = true;
        this.pickupHeroSelect.appendChild(opt);
      });
    }

    // Free pull state
    if (this.freeSummonStatus) {
      if (this.game.freeDailyPullAvailable) {
        this.freeSummonStatus.textContent = '오늘 무료 가능!';
        this.freeSummonStatus.style.color = '#34d399';
      } else {
        this.freeSummonStatus.textContent = '내일 다시 가능';
        this.freeSummonStatus.style.color = '#94a3b8';
      }
    }
  }

  // 4. Difficulty Selector Modal
  renderDifficultyModal() {
    const grid = document.getElementById('difficulty-cards-grid');
    if (!grid) return;
    grid.innerHTML = '';

    for (let key in DIFFICULTY_SETTINGS) {
      const diff = DIFFICULTY_SETTINGS[key];
      const isCurrent = (this.game.difficulty === key);

      const card = document.createElement('div');
      card.className = `difficulty-card ${isCurrent ? 'active' : ''}`;

      card.innerHTML = `
        <div class="diff-card-icon">${diff.icon}</div>
        <div class="diff-card-name">${diff.name}</div>
        <span class="diff-card-badge ${diff.badgeClass}">${isCurrent ? '현재 적용 중' : '선택 가능'}</span>
        
        <div class="diff-card-stats">
          <span>적 체력: <b>x${diff.hpScale}</b></span>
          <span>적 공격력: <b>x${diff.atkScale}</b></span>
          <span>보상 배율: <b>x${diff.rewardGold} (${Math.round(diff.rewardGold * 100)}%)</b></span>
        </div>

        <div class="diff-card-desc">${diff.desc}</div>
        <button class="btn-sm ${isCurrent ? 'btn-accent' : 'btn-primary'}" style="margin-top: 6px; width: 100%;">
          ${isCurrent ? '적용 중' : '이 난이도로 변경'}
        </button>
      `;

      card.addEventListener('click', () => {
        this.game.setDifficulty(key);
        this.renderAll();
      });

      grid.appendChild(card);
    }
  }

  // 5. Gacha History Log Modal
  renderGachaHistoryModal() {
    const tbody = document.getElementById('gacha-history-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!this.game.gachaHistory || this.game.gachaHistory.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#94a3b8; padding:20px;">아직 소환 기록이 없습니다.</td></tr>`;
      return;
    }

    this.game.gachaHistory.forEach(record => {
      const tierCfg = HERO_TIERS[record.tier] || HERO_TIERS[1];
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td style="color: #94a3b8;">${record.time}</td>
        <td><span class="gacha-tier-badge" style="background:${tierCfg.color}; color:#000; font-size:0.7rem;">${record.tier}★</span></td>
        <td style="color:${tierCfg.color}; font-weight:800;">${record.heroAvatar} ${record.heroName}</td>
        <td>${record.isPity ? '<b style="color:#fbbf24;">[천장 확정]</b>' : record.isNew ? '<span style="color:#ef4444;">NEW!</span>' : '<span style="color:#60a5fa;">조각</span>'}</td>
      `;

      tbody.appendChild(tr);
    });
  }

  // 6. Castle Modal
  renderCastleModal() {
    const castle = this.game.castle;
    const wallUpgradeCost = castle.getWallUpgradeCost();

    const wallStats = document.getElementById('castle-wall-stats');
    if (wallStats) {
      wallStats.innerHTML = `
        <div class="wall-stat-item"><span>성벽 등급</span><b>Lv.${castle.wallLevel}</b></div>
        <div class="wall-stat-item"><span>최대 체력</span><b>${castle.maxHp} HP</b></div>
        <div class="wall-stat-item"><span>방어력</span><b>${castle.armor} (피해 감소)</b></div>
        <div class="wall-stat-item"><span>가시 반사</span><b>${castle.thornDamage}</b></div>
        <div class="wall-stat-item"><span>초당 재생</span><b>+${castle.regenRate} HP/s</b></div>
      `;
    }

    const btnUpgradeWall = document.getElementById('btn-upgrade-wall');
    if (btnUpgradeWall) {
      btnUpgradeWall.textContent = `🧱 성벽 증축 강화 (🪙 ${wallUpgradeCost})`;
      btnUpgradeWall.disabled = (this.game.gold < wallUpgradeCost);
      btnUpgradeWall.onclick = () => {
        castle.upgradeWall();
        this.renderAll();
      };
    }

    // Turrets list
    const turretsList = document.getElementById('castle-turrets-list');
    if (turretsList) {
      turretsList.innerHTML = '';
      for (let key in castle.turrets) {
        const turret = castle.turrets[key];
        const cost = castle.getTurretCost(key);
        const card = document.createElement('div');
        card.className = `turret-card ${turret.unlocked ? 'unlocked' : 'locked'}`;

        card.innerHTML = `
          <div class="turret-header">
            <span class="turret-icon">${turret.icon}</span>
            <div class="turret-title-box">
              <h5>${turret.name} ${turret.unlocked ? `<span class="lvl">Lv.${turret.level}</span>` : '<span class="lock">미해금</span>'}</h5>
              <p>${turret.desc}</p>
            </div>
          </div>
          <div class="turret-stats">
            <span>공격력: ${Math.floor(turret.baseDmg * (1 + (turret.level - 1) * 0.35))}</span>
            <span>사거리: ${turret.range}</span>
            <span>공속: ${turret.atkSpeed}/s</span>
          </div>
          <button class="btn-upgrade-turret btn-primary btn-sm" data-turret="${key}" ${this.game.gold < cost ? 'disabled' : ''}>
            ${turret.unlocked ? `포탑 업그레이드 (🪙 ${cost})` : `포탑 해금 (🪙 ${cost})`}
          </button>
        `;

        turretsList.appendChild(card);
      }

      turretsList.querySelectorAll('.btn-upgrade-turret').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const key = e.currentTarget.dataset.turret;
          castle.upgradeTurret(key);
          this.renderAll();
        });
      });
    }
  }
}
