/**
 * ===================================================
 * 비속어 / 욕설 / 부적절한 닉네임 필터링 시스템 (Profanity Filter)
 * ===================================================
 */
class ProfanityFilter {
  constructor() {
    this.badWords = [
      // 욕설 / 비속어 / 멸칭
      '시발', '씨발', 'ㅅㅂ', '시바', '씨바', '쉬발', '시빨', '씨빨', '싀발', '씹', '싸가지',
      'tlqkf', 'tlqk', 'tlq', 'tlqkfsk', 'tlqkftorl', // 영타(QWERTY) 시발
      '개새끼', '개새', 'ㄱㅅㄲ', '개련', '개년', '쌍년', '쌍놈', '창녀', '창년', '걸레', 'rotoRl', 'roto',
      '병신', 'ㅂㅅ', '븅신', '호구', '지랄', 'ㅈㄹ', '염병', '미친놈', '미친년', '또라이', 'qudtls', 'wlfkf',
      '새끼', '존나', '좆', 'ㅈㄴ', '좆같', '조까', '닥쳐', '꺼져', 'ㄲㅈ', '개소리', '엠창', 'whs', 'whssk', 'tprrl',
      
      // 패드립
      '느금', '느금마', '니애미', '니엄마', '애미', '애비', '느개비', '엄창', '니엠', '애미뒤', 'smrma',
      
      // 성적 / 음란 표현
      '섹스', 'sex', '자위', '자지', '보지', '야동', '성기', '딜도', '콘돔', '유두', '딸딸이', 'tprtm',
      '음란', '포르노', 'porno', 'fuck', 'dick', 'pussy', 'bitch', 'nude', 'slut', 'penis', 'vagina',
      '노브라', '팬티', '가슴', '엉덩이', '성행위', '섹',
      
      // 혐오 / 극단적 / 차별 표현
      '일베', '한남', '김치녀', '틀딱', '장애인', '자살', '운지', '노무', '재기', 'nigger', 'nigga', 'ㅗ', '凸'
    ];
  }

  check(text) {
    if (!text || typeof text !== 'string') return { isClean: true, cleanName: '익명의 미식가' };

    const raw = text.trim();
    if (raw.length === 0) return { isClean: true, cleanName: '익명의 미식가' };
    if (raw.length > 12) return { isClean: false, reason: '닉네임은 최대 10자까지만 입력 가능합니다!' };

    // 특수문자, 공백, 숫자 우회 패턴 정규화 (예: "시.발", "시 1 발", "s_e_x")
    const normalized = raw
      .toLowerCase()
      .replace(/[\s\-_.,~!?@#$%^&*()+=\[\]{}|\\/`'":;<>0-9]/g, '');

    for (const bad of this.badWords) {
      if (raw.toLowerCase().includes(bad) || (normalized.length > 0 && normalized.includes(bad))) {
        return {
          isClean: false,
          badWord: bad,
          reason: `⚠️ 부적절한 단어("${bad}")가 포함되어 있습니다!\n축제 부스에서는 바르고 고운 말을 사용해주세요.`
        };
      }
    }

    return { isClean: true, cleanName: raw };
  }
}

class DujjonkuGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.graphics = new GraphicsRenderer(this.canvas);
    this.profanityFilter = new ProfanityFilter();

    // Game States: 'TITLE', 'PLAYING', 'CAUGHT', 'TIME_UP'
    this.state = 'TITLE';

    // In-game Variables (30 Seconds Class)
    this.timeLeft = 30.0;
    this.totalDuration = 30.0;
    this.score = 0;
    this.cookiesEaten = 0;
    this.currentCookieProgress = 0; // 0.0 to 1.0
    
    // Combo & Fever
    this.combo = 0;
    this.feverGauge = 0; // 0 to 100
    this.isFever = false;
    this.feverTimer = 0;

    // Player input state
    this.isEatingInput = false;
    this.lastEatSoundTick = 0;

    // Teacher Dynamic AI State
    // States: 'WRITING', 'WARNING', 'FAKE_TURN', 'TURNED', 'BAIT_PAUSE'
    this.teacherState = 'WRITING';
    this.teacherTimer = 0;
    this.teacherDuration = 2.0;
    this.suspicionProgress = 0;
    this.isSurpriseWarning = false;
    this.nextStateAfterBait = 'TURNED';

    // Festival Integrated Leaderboard
    this.leaderboard = this.loadLeaderboard();
    this.lastRegisteredId = null;

    // Bind DOM UI Elements & Event Listeners
    this.bindDOMElements();
    this.bindEvents();

    // Start rendering loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));

    // Update title screen with Festival 1st place info
    this.updateFestivalTop1Display();
  }

  // ===================================================
  // 1. LEADERBOARD DATA MANAGEMENT
  // ===================================================
  loadLeaderboard() {
    try {
      const data = localStorage.getItem('dujjonku_festival_leaderboard');
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load leaderboard', e);
    }
    // Initial festival mock rankings (30s targets)
    return [
      { id: 'mock-1', name: '2-3 쿠키괴물', score: 12500, cookies: 8, title: '전설의 스텔스 두쫀쿠 마스터', timeStr: '13:40' },
      { id: 'mock-2', name: '1-1 동아리부장', score: 8200, cookies: 5, title: '프로 몰래먹기러', timeStr: '12:15' },
      { id: 'mock-3', name: '3-4 카다이프장인', score: 4600, cookies: 3, title: '은밀한 두바이 입문자', timeStr: '11:50' }
    ];
  }

  saveLeaderboard() {
    try {
      localStorage.setItem('dujjonku_festival_leaderboard', JSON.stringify(this.leaderboard));
    } catch (e) {
      console.error('Failed to save leaderboard', e);
    }
  }

  registerScore(inputEl, btnEl) {
    const rawValue = inputEl ? inputEl.value : '';
    const filterResult = this.profanityFilter.check(rawValue);

    if (!filterResult.isClean) {
      window.soundEngine.playWarning();
      this.showFloatingNotice('⚠️ 바르고 고운 말을 사용해주세요!', '#ff3355');

      if (inputEl) {
        inputEl.classList.remove('input-error');
        void inputEl.offsetWidth; // Trigger reflow for shake animation
        inputEl.classList.add('input-error');
        inputEl.focus();
      }

      alert(filterResult.reason || '⚠️ 부적절한 닉네임입니다. 바르고 고운 말을 사용해주세요!');
      return false;
    }

    const playerName = filterResult.cleanName;
    if (btnEl) btnEl.disabled = true;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    const newId = 'entry-' + Date.now();
    const rankTitle = this.getRankTitle(this.cookiesEaten);

    const newEntry = {
      id: newId,
      name: playerName,
      score: this.score,
      cookies: this.cookiesEaten,
      title: rankTitle,
      timeStr: timeStr
    };

    this.leaderboard.push(newEntry);
    this.leaderboard.sort((a, b) => b.score - a.score || b.cookies - a.cookies);

    this.saveLeaderboard();
    this.lastRegisteredId = newId;

    window.soundEngine.playPerfect();
    this.updateFestivalTop1Display();
    this.renderLeaderboard(newId);
    this.showModal(this.rankingModal);
    return true;
  }

  renderLeaderboard(highlightId = null) {
    this.leaderboardList.innerHTML = '';
    const totalCount = this.leaderboard.length;
    this.totalPlayersCount.textContent = `총 ${totalCount}명 참가 중 (TOP 20)`;

    if (totalCount === 0) {
      this.leaderboardList.innerHTML = '<div class="empty-leaderboard-msg">아직 등록된 기록이 없습니다.<br>첫 번째 랭킹의 주인공이 되어보세요!</div>';
      return;
    }

    // 20위 아래로는 순위가 안 뜨게 TOP 20까지만 슬라이스
    const displayEntries = this.leaderboard.slice(0, 20);

    displayEntries.forEach((entry, idx) => {
      const rank = idx + 1;
      const row = document.createElement('div');
      row.className = 'leaderboard-row';
      if (entry.id === highlightId) {
        row.classList.add('highlight-new');
      }

      let rankBadgeHtml = `<span class="rank-badge">${rank}위</span>`;
      if (rank === 1) rankBadgeHtml = `<span class="rank-badge rank-gold">🥇 1위</span>`;
      else if (rank === 2) rankBadgeHtml = `<span class="rank-badge rank-silver">🥈 2위</span>`;
      else if (rank === 3) rankBadgeHtml = `<span class="rank-badge rank-bronze">🥉 3위</span>`;

      row.innerHTML = `
        ${rankBadgeHtml}
        <div class="player-info">
          <span class="player-name">${this.escapeHtml(entry.name)}</span>
          <span class="player-meta">${entry.title} (${entry.timeStr})</span>
        </div>
        <div class="player-cookies">🍪 ${entry.cookies}개</div>
        <div class="player-score">${entry.score.toLocaleString()}점</div>
        <button class="btn-delete-row" title="이 기록 삭제" data-id="${entry.id}">🗑️</button>
      `;

      // Individual row delete event
      const deleteBtn = row.querySelector('.btn-delete-row');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.deleteLeaderboardEntry(entry.id);
        });
      }

      this.leaderboardList.appendChild(row);
    });

    // 20위 초과 시 안내 메시지
    if (totalCount > 20) {
      const moreNote = document.createElement('div');
      moreNote.className = 'leaderboard-more-note';
      moreNote.textContent = `※ 명예의 전당에는 20위까지만 표시됩니다. (전체 ${totalCount}명 등록됨)`;
      this.leaderboardList.appendChild(moreNote);
    }

    if (highlightId) {
      setTimeout(() => {
        const highlightedEl = this.leaderboardList.querySelector('.highlight-new');
        if (highlightEl) {
          highlightEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }

  deleteLeaderboardEntry(id) {
    const target = this.leaderboard.find(e => e.id === id);
    if (!target) return;

    const confirmDelete = confirm(`[부스 관리자 권한]\n'${target.name}' (${target.score.toLocaleString()}점) 님의 기록을 삭제하시겠습니까?`);
    if (!confirmDelete) return;

    this.leaderboard = this.leaderboard.filter(e => e.id !== id);
    this.saveLeaderboard();
    this.renderLeaderboard();
    this.updateFestivalTop1Display();
    this.showFloatingNotice(`🗑️ ${target.name} 기록 삭제 완료!`, '#ff3355');
  }

  resetLeaderboard() {
    const confirmation = confirm('⚠️ [부스 관리자 전용]\n모든 참가자의 랭킹 기록을 초기화하시겠습니까?\n(축제 당일 새 기록을 시작할 때 사용하세요)');
    if (confirmation) {
      this.leaderboard = [];
      this.saveLeaderboard();
      this.renderLeaderboard();
      this.updateFestivalTop1Display();
      alert('축제 랭킹이 성공적으로 초기화되었습니다.');
    }
  }

  updateFestivalTop1Display() {
    if (this.leaderboard.length > 0) {
      const top = this.leaderboard[0];
      this.festivalTop1Display.textContent = `${top.name} (${top.score.toLocaleString()}점 / ${top.cookies}개)`;
    } else {
      this.festivalTop1Display.textContent = '아직 기록 없음';
    }
  }

  escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
  }

  // ===================================================
  // 2. DOM BINDINGS & LISTENERS
  // ===================================================
  bindDOMElements() {
    this.hud = document.getElementById('hud');
    this.timeDisplay = document.getElementById('time-display');
    this.scoreDisplay = document.getElementById('score-display');
    this.cookieCountDisplay = document.getElementById('cookie-count-display');
    this.soundBtn = document.getElementById('sound-btn');
    this.soundIcon = document.getElementById('sound-icon');

    this.feverGaugeContainer = document.getElementById('fever-gauge-container');
    this.feverBarFill = document.getElementById('fever-bar-fill');
    this.comboDisplay = document.getElementById('combo-display');

    this.actionPrompt = document.getElementById('action-prompt');
    this.floatingNotice = document.getElementById('floating-notice');
    this.dangerOverlay = document.getElementById('danger-overlay');

    // Modals
    this.titleScreen = document.getElementById('title-screen');
    this.caughtScreen = document.getElementById('caught-screen');
    this.clearScreen = document.getElementById('clear-screen');
    this.rankingModal = document.getElementById('ranking-modal');

    // Buttons
    this.startBtn = document.getElementById('start-btn');
    this.guideBtn = document.getElementById('guide-btn');
    this.closeRankingBtn = document.getElementById('close-ranking-btn');
    this.resetLeaderboardBtn = document.getElementById('reset-leaderboard-btn');

    this.restartCaughtBtn = document.getElementById('restart-caught-btn');
    this.leaderboardCaughtBtn = document.getElementById('leaderboard-caught-btn');
    this.homeCaughtBtn = document.getElementById('home-caught-btn');

    this.restartClearBtn = document.getElementById('restart-clear-btn');
    this.leaderboardClearBtn = document.getElementById('leaderboard-clear-btn');
    this.homeClearBtn = document.getElementById('home-clear-btn');

    // Name Registration Inputs
    this.caughtPlayerName = document.getElementById('caught-player-name');
    this.caughtRegisterBtn = document.getElementById('caught-register-btn');
    this.clearPlayerName = document.getElementById('clear-player-name');
    this.clearRegisterBtn = document.getElementById('clear-register-btn');

    // Result Value Placeholders
    this.caughtCookieVal = document.getElementById('caught-cookie-val');
    this.caughtScoreVal = document.getElementById('caught-score-val');
    this.caughtTitleVal = document.getElementById('caught-title-val');

    this.clearCookieVal = document.getElementById('clear-cookie-val');
    this.clearScoreVal = document.getElementById('clear-score-val');
    this.clearTitleVal = document.getElementById('clear-title-val');

    this.festivalTop1Display = document.getElementById('festival-top1-display');
    this.leaderboardList = document.getElementById('leaderboard-list');
    this.totalPlayersCount = document.getElementById('total-players-count');

    // Tabs
    this.tabRankingsBtn = document.getElementById('tab-rankings-btn');
    this.tabTitlesBtn = document.getElementById('tab-titles-btn');
    this.tabRankingsContent = document.getElementById('tab-rankings-content');
    this.tabTitlesContent = document.getElementById('tab-titles-content');
  }

  bindEvents() {
    // Keyboard Controls
    window.addEventListener('keydown', (e) => {
      if (document.activeElement === this.caughtPlayerName || document.activeElement === this.clearPlayerName) {
        if (e.key === 'Enter') {
          if (document.activeElement === this.caughtPlayerName) this.caughtRegisterBtn.click();
          if (document.activeElement === this.clearPlayerName) this.clearRegisterBtn.click();
        }
        return;
      }

      if (e.code === 'Space' || e.code === 'ArrowDown') {
        e.preventDefault();
        if (this.state === 'TITLE') {
          this.startGame();
        } else if (this.state === 'PLAYING') {
          this.startEating();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (document.activeElement === this.caughtPlayerName || document.activeElement === this.clearPlayerName) return;
      if (e.code === 'Space' || e.code === 'ArrowDown') {
        e.preventDefault();
        if (this.state === 'PLAYING') {
          this.stopEating();
        }
      }
    });

    // Mouse / Touch Controls
    const handlePressStart = (e) => {
      if (this.state === 'PLAYING') {
        e.preventDefault();
        this.startEating();
      }
    };

    const handlePressEnd = (e) => {
      if (this.state === 'PLAYING') {
        e.preventDefault();
        this.stopEating();
      }
    };

    this.canvas.addEventListener('mousedown', handlePressStart);
    window.addEventListener('mouseup', handlePressEnd);

    this.canvas.addEventListener('touchstart', handlePressStart, { passive: false });
    window.addEventListener('touchend', handlePressEnd, { passive: false });
    window.addEventListener('touchcancel', handlePressEnd, { passive: false });

    // UI Buttons
    this.startBtn.addEventListener('click', () => this.startGame());
    this.guideBtn.addEventListener('click', () => {
      this.renderLeaderboard();
      this.showModal(this.rankingModal);
    });
    this.closeRankingBtn.addEventListener('click', () => this.goToTitle());
    this.resetLeaderboardBtn.addEventListener('click', () => this.resetLeaderboard());

    this.restartCaughtBtn.addEventListener('click', () => this.startGame());
    this.leaderboardCaughtBtn.addEventListener('click', () => {
      this.renderLeaderboard();
      this.showModal(this.rankingModal);
    });
    this.homeCaughtBtn.addEventListener('click', () => this.goToTitle());

    this.restartClearBtn.addEventListener('click', () => this.startGame());
    this.leaderboardClearBtn.addEventListener('click', () => {
      this.renderLeaderboard();
      this.showModal(this.rankingModal);
    });
    this.homeClearBtn.addEventListener('click', () => this.goToTitle());

    // Registration Buttons
    this.caughtRegisterBtn.addEventListener('click', () => {
      this.registerScore(this.caughtPlayerName, this.caughtRegisterBtn);
    });

    this.clearRegisterBtn.addEventListener('click', () => {
      this.registerScore(this.clearPlayerName, this.clearRegisterBtn);
    });

    // Tab Buttons
    this.tabRankingsBtn.addEventListener('click', () => {
      this.tabRankingsBtn.classList.add('active');
      this.tabTitlesBtn.classList.remove('active');
      this.tabRankingsContent.classList.add('active');
      this.tabTitlesContent.classList.remove('active');
    });

    this.tabTitlesBtn.addEventListener('click', () => {
      this.tabTitlesBtn.classList.add('active');
      this.tabRankingsBtn.classList.remove('active');
      this.tabTitlesContent.classList.add('active');
      this.tabRankingsContent.classList.remove('active');
    });

    // Sound toggle
    this.soundBtn.addEventListener('click', () => {
      const isMuted = window.soundEngine.toggleMute();
      this.soundIcon.textContent = isMuted ? '🔇' : '🔊';
    });
  }

  showModal(screen) {
    [this.titleScreen, this.caughtScreen, this.clearScreen, this.rankingModal].forEach(m => {
      m.classList.remove('active');
    });
    if (screen) {
      screen.classList.add('active');
    }
  }

  goToTitle() {
    this.state = 'TITLE';
    this.showModal(this.titleScreen);
    this.hud.classList.add('hidden');
    this.feverGaugeContainer.classList.add('hidden');
    this.actionPrompt.classList.add('hidden');
    this.dangerOverlay.classList.remove('danger-active');
    window.soundEngine.stopBGM();
    this.updateFestivalTop1Display();
  }

  // ===================================================
  // 3. START GAME & GAMEPLAY FLOW
  // ===================================================
  startGame() {
    window.soundEngine.init();
    window.soundEngine.startBGM();

    this.state = 'PLAYING';
    this.timeLeft = 30.0;
    this.totalDuration = 30.0;
    this.score = 0;
    this.cookiesEaten = 0;
    this.currentCookieProgress = 0;
    this.combo = 0;
    this.feverGauge = 0;
    this.isFever = false;
    this.feverTimer = 0;
    this.isEatingInput = false;

    // Reset teacher state with brisk starting interval
    this.teacherState = 'WRITING';
    this.teacherTimer = 0;
    this.teacherDuration = 2.0;
    this.suspicionProgress = 0;
    this.isSurpriseWarning = false;

    // Reset registration forms
    this.caughtPlayerName.value = '';
    this.caughtRegisterBtn.disabled = false;
    this.clearPlayerName.value = '';
    this.clearRegisterBtn.disabled = false;

    // UI Reset
    this.showModal(null);
    this.hud.classList.remove('hidden');
    this.feverGaugeContainer.classList.remove('hidden');
    this.actionPrompt.classList.remove('hidden');
    this.dangerOverlay.classList.remove('danger-active');

    this.updateHUD();
    this.showFloatingNotice('⚡ 30초 스피드런 시작! ⚡', '#ffe07a');
  }

  startEating() {
    if (this.state !== 'PLAYING') return;
    this.isEatingInput = true;
  }

  stopEating() {
    if (this.state !== 'PLAYING') return;
    
    // Check if player safely released during WARNING or BAIT phase right before turn!
    if ((this.teacherState === 'WARNING' && this.suspicionProgress > 0.45) ||
        (this.teacherState === 'BAIT_PAUSE' && this.teacherTimer > 0.15)) {
      this.triggerPerfectTimingBonus();
    }

    this.isEatingInput = false;
  }

  triggerPerfectTimingBonus() {
    this.combo++;
    const bonus = 350 * this.combo;
    this.score += bonus;
    this.feverGauge = Math.min(100, this.feverGauge + 25);

    window.soundEngine.playPerfect();
    this.showFloatingNotice(`✨ PERFECT CLOSE CALL! +${bonus} ✨`, '#fef08a');

    this.comboDisplay.classList.add('combo-pop');
    setTimeout(() => this.comboDisplay.classList.remove('combo-pop'), 200);

    if (this.feverGauge >= 100 && !this.isFever) {
      this.activateFeverMode();
    }
  }

  activateFeverMode() {
    this.isFever = true;
    this.feverTimer = 4.0;
    window.soundEngine.playFever();
    this.showFloatingNotice('🔥 GOLDEN FEVER CRUNCH! (폭풍 흡입 찬스!) 🔥', '#ffe07a');

    // Teacher stays deeply focused on writing during fever
    this.teacherState = 'WRITING';
    this.teacherTimer = 0;
    this.teacherDuration = 4.5;
    this.dangerOverlay.classList.remove('danger-active');
  }

  showFloatingNotice(text, color = '#ffffff') {
    this.floatingNotice.textContent = text;
    this.floatingNotice.style.color = color;
    this.floatingNotice.classList.remove('notice-anim');
    void this.floatingNotice.offsetWidth;
    this.floatingNotice.classList.add('notice-anim');
  }

  triggerScreenShake() {
    const container = document.getElementById('game-container');
    container.classList.remove('screen-shake');
    void container.offsetWidth;
    container.classList.add('screen-shake');
  }

  // ===================================================
  // 4. MAIN GAME LOOP
  // ===================================================
  gameLoop(currentTime) {
    const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    if (this.state === 'PLAYING') {
      this.update(dt);
    }

    this.render();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.finishGame();
      return;
    }

    if (this.isFever) {
      this.feverTimer -= dt;
      this.feverGauge = (this.feverTimer / 4.0) * 100;
      if (this.feverTimer <= 0) {
        this.isFever = false;
        this.feverGauge = 0;
      }
    }

    this.updateTeacherAI(dt);

    if (this.isEatingInput) {
      // Snappy eating rates tuned for 30s gameplay (~1.5s per cookie normally)
      const eatRate = this.isFever ? 1.35 * dt : 0.65 * dt;
      this.currentCookieProgress += eatRate;
      
      const scoreGain = this.isFever ? 65 : 25;
      this.score += scoreGain;

      if (this.graphics.tick - this.lastEatSoundTick > (this.isFever ? 7 : 12)) {
        window.soundEngine.playBite();
        this.lastEatSoundTick = this.graphics.tick;
      }

      if (this.currentCookieProgress >= 1.0) {
        this.cookiesEaten++;
        this.currentCookieProgress = 0;
        this.score += 1500 * (this.isFever ? 2 : 1);
        this.feverGauge = Math.min(100, this.feverGauge + 20);

        window.soundEngine.playPerfect();
        this.showFloatingNotice(`🍪 두쫀쿠 완식! (+1500점) 🍪`, '#a8e04b');

        if (this.feverGauge >= 100 && !this.isFever) {
          this.activateFeverMode();
        }
      }

      // Check if caught in laser vision!
      if (this.teacherState === 'TURNED') {
        this.triggerCaught();
        return;
      }
    }

    this.updateHUD();
  }

  // ===================================================
  // 5. UNPREDICTABLE & DYNAMIC TEACHER AI STATE MACHINE
  // ===================================================
  updateTeacherAI(dt) {
    this.teacherTimer += dt;
    // Normalized progression from 0 (start) to 1 (end of 30s)
    const timeProgress = 1 - (this.timeLeft / this.totalDuration);

    if (this.teacherState === 'WRITING') {
      if (Math.random() < 0.12) {
        window.soundEngine.playChalk();
      }

      if (this.teacherTimer >= this.teacherDuration) {
        // Decide warning style: 30% chance for a Surprise Lightning Warning!
        const surpriseChance = 0.25 + timeProgress * 0.25;
        this.isSurpriseWarning = Math.random() < surpriseChance;

        this.teacherState = 'WARNING';
        this.teacherTimer = 0;
        // Warning duration: 0.32s ~ 0.75s (tighter as time goes down)
        this.teacherDuration = this.isSurpriseWarning
          ? Math.max(0.28, 0.45 - timeProgress * 0.15)
          : Math.max(0.45, 0.85 - timeProgress * 0.35);

        this.suspicionProgress = 0;
        window.soundEngine.playWarning();
        this.dangerOverlay.classList.add('danger-active');
      }
    } else if (this.teacherState === 'WARNING') {
      this.suspicionProgress = this.teacherTimer / this.teacherDuration;

      if (this.teacherTimer >= this.teacherDuration) {
        // 35% chance to do a Fake Turn (fakes out student)
        const fakeChance = 0.30 + timeProgress * 0.20;
        if (Math.random() < fakeChance) {
          this.teacherState = 'FAKE_TURN';
          this.teacherTimer = 0;
          this.teacherDuration = Math.max(0.35, 0.6 - timeProgress * 0.2);
          window.soundEngine.playTurn();
        } else {
          // Full turn with laser eyes
          this.teacherState = 'TURNED';
          this.teacherTimer = 0;
          // Look duration: 0.7s ~ 1.3s
          this.teacherDuration = Math.max(0.65, 1.25 - timeProgress * 0.45);
          window.soundEngine.playTurn();
        }
      }
    } else if (this.teacherState === 'FAKE_TURN') {
      if (this.teacherTimer >= this.teacherDuration) {
        // GIMMICK 1: DOUBLE-TURN BAIT (연타 낚시)
        // 40% chance: teacher turns back for only 0.25s then IMMEDIATELY whips around full 180!
        if (Math.random() < 0.40) {
          this.teacherState = 'BAIT_PAUSE';
          this.teacherTimer = 0;
          this.teacherDuration = 0.25; // Tiny window to trap greedy clickers
          this.nextStateAfterBait = 'TURNED';
          this.dangerOverlay.classList.remove('danger-active');
        } else {
          // Normal return to writing
          this.teacherState = 'WRITING';
          this.teacherTimer = 0;
          this.teacherDuration = Math.max(1.0, 2.4 - timeProgress * 1.2) + (Math.random() * 0.4 - 0.2);
          this.dangerOverlay.classList.remove('danger-active');
        }
      }
    } else if (this.teacherState === 'TURNED') {
      if (this.teacherTimer >= this.teacherDuration) {
        // GIMMICK 2: QUICK RE-TURN (기습 재확인)
        // 25% chance after looking away for 0.25s, teacher looks BACK again!
        if (Math.random() < 0.25) {
          this.teacherState = 'BAIT_PAUSE';
          this.teacherTimer = 0;
          this.teacherDuration = 0.30;
          this.nextStateAfterBait = 'TURNED';
          this.dangerOverlay.classList.remove('danger-active');
        } else {
          this.teacherState = 'WRITING';
          this.teacherTimer = 0;
          this.teacherDuration = Math.max(1.1, 2.5 - timeProgress * 1.2) + (Math.random() * 0.5 - 0.25);
          this.dangerOverlay.classList.remove('danger-active');
        }
      }
    } else if (this.teacherState === 'BAIT_PAUSE') {
      // Short breath before the instant trap turn!
      if (this.teacherTimer >= this.teacherDuration) {
        this.teacherState = this.nextStateAfterBait;
        this.teacherTimer = 0;
        this.teacherDuration = Math.max(0.6, 1.1 - timeProgress * 0.3);
        window.soundEngine.playTurn();
        this.dangerOverlay.classList.add('danger-active');
      }
    }
  }

  triggerCaught() {
    this.state = 'CAUGHT';
    this.isEatingInput = false;
    window.soundEngine.playCaught();
    window.soundEngine.stopBGM();
    this.triggerScreenShake();

    const rankTitle = this.getRankTitle(this.cookiesEaten);

    this.caughtCookieVal.textContent = `${this.cookiesEaten}개`;
    this.caughtScoreVal.textContent = `${this.score.toLocaleString()}점`;
    this.caughtTitleVal.textContent = rankTitle;

    setTimeout(() => {
      this.showModal(this.caughtScreen);
      this.caughtPlayerName.focus();
    }, 450);
  }

  finishGame() {
    this.state = 'TIME_UP';
    this.isEatingInput = false;
    window.soundEngine.playSchoolBell();
    window.soundEngine.stopBGM();

    const rankTitle = this.getRankTitle(this.cookiesEaten);

    this.clearCookieVal.textContent = `${this.cookiesEaten}개`;
    this.clearScoreVal.textContent = `${this.score.toLocaleString()}점`;
    this.clearTitleVal.textContent = rankTitle;

    setTimeout(() => {
      this.showModal(this.clearScreen);
      this.clearPlayerName.focus();
    }, 500);
  }

  getRankTitle(cookies) {
    if (cookies <= 1) return '배고픈 모범생';
    if (cookies <= 3) return '은밀한 두바이 입문자';
    if (cookies <= 6) return '프로 몰래먹기러';
    return '전설의 스텔스 두쫀쿠 마스터';
  }

  updateHUD() {
    this.timeDisplay.textContent = `${Math.ceil(this.timeLeft)}s`;
    this.scoreDisplay.textContent = this.score.toLocaleString();
    this.cookieCountDisplay.textContent = `${this.cookiesEaten}개`;
    this.comboDisplay.textContent = `${this.combo} COMBO!`;
    this.feverBarFill.style.width = `${Math.min(100, Math.max(0, this.feverGauge))}%`;
  }

  render() {
    this.graphics.clear();

    this.graphics.drawClassroom();
    this.graphics.drawTeacher(this.teacherState, this.suspicionProgress, this.isSurpriseWarning);

    const isCaught = (this.state === 'CAUGHT');
    this.graphics.drawStudentAndDesk(
      this.isEatingInput,
      this.currentCookieProgress,
      this.isFever,
      isCaught
    );

    this.graphics.updateAndDrawParticles();
  }
}

// Instantiate game on window load
window.addEventListener('DOMContentLoaded', () => {
  window.dujjonkuGame = new DujjonkuGame();
});
