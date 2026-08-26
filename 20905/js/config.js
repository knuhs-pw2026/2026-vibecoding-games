// config.js - Global game constants and configurations
export const CONFIG = {
  TILE_SIZE: 32,          // Each grid tile is 32x32 pixels
  CANVAS_WIDTH: 960,
  CANVAS_HEIGHT: 640,
  FPS: 60,

  // Player Settings
  PLAYER: {
    MAX_HP: 100,          // 10 segments of 10 HP (1칸 = 10 HP)
    SEGMENT_HP: 10,       // 1칸 = 10 HP
    SPEED: 3.9,           // Slightly faster for smoother dodging
    SIZE: 26,             // Hitbox diameter/size
    JUMP_DURATION: 0.36,  // Jump duration in seconds
    JUMP_HEIGHT: 28,      // Parabolic jump peak in pixels
    BOW_COOLDOWN: 0.26,   // Snappier arrow shooting cooldown
    ARROW_SPEED: 11.0,    // Faster arrow projectile
    INVINCIBLE_TIME: 1.2, // Generous invulnerability time on hit
  },

  // Zombie Types & Stats
  ZOMBIE: {
    // 1. Normal Zombie (일반 좀비)
    NORMAL: {
      HP: 2,              // Takes 2 arrow hits to kill
      SPEED: 1.15,
      AGGRO_RANGE: 12,
      DAMAGE: 10,         // 1칸 (10 HP) scratch damage
      ATTACK_COOLDOWN: 1.0,
      COLOR: '#4e7c59',
      SIZE: 26,
    },
    // 2. Exploding Zombie (폭발 좀비)
    EXPLODING: {
      HP: 1,              // Explodes on 1 arrow hit
      SPEED: 0.75,
      AGGRO_RANGE: 13,
      PROXIMITY_RANGE: 1.0,
      TOUCH_DAMAGE: 50,   // 5칸 (50 HP) direct touch explosion
      AOE_RADIUS: 4.0,
      AOE_DAMAGE_PLAYER: 20, // 2칸 (20 HP) on arrow/chain explosion
      AOE_DAMAGE_MUTANT: 2,
      SIZE: 28,
      COLOR: '#c84332',
    },
    // 3. Shooting Zombie (슈팅 좀비)
    SHOOTING: {
      HP: 2,              // Takes 2 arrow hits to kill
      SPEED: 1.15,
      AGGRO_RANGE: 13,
      SHOOT_RANGE: 10,
      SHOOT_COOLDOWN: 3.5,
      BALL_SPEED: 4.5,
      BALL_DAMAGE: 20,    // 2칸 (20 HP) acid projectile damage
      SIZE: 26,
      COLOR: '#2f887b',
    },
    // 4. Mutant Zombie (뮤턴트 좀비)
    MUTANT: {
      HP: 10,             // Takes 10 arrow hits to kill
      SPEED: 1.0,
      WIDTH_TILES: 3,     // 3 tiles wide
      HEIGHT_TILES: 5,    // 5 tiles high
      AGGRO_RANGE: 18,
      PUNCH_COOLDOWN: 3.0,   // 주먹 공격 3초 쿨타임
      PUNCH_TELEGRAPH: 1.4,  // 빠른 1.4초 텔레그래프
      PUNCH_RADIUS_TILES: 2, // 2x2 red area
      PUNCH_DAMAGE: 20,      // 2칸 (20 HP)
      STOMP_COOLDOWN: 5.0,   // 밟기 공격 5초 쿨타임
      STOMP_AIR_TIME: 2.2,   // 2.2초 공중 체공 경고
      STOMP_RADIUS_TILES: 3, // 3x3 red landing area
      STOMP_DAMAGE: 50,      // 5칸 (50 HP)
      COLOR: '#663973',
    },
    // 5. Boss Zombie (보스 좀비)
    BOSS: {
      WIDTH_TILES: 10,    // 10x10 tiles
      HEIGHT_TILES: 10,
      // Phase 1
      PHASE1_HP: 100,
      PHASE1_BALL_CD: 12.0, // 12s cooldown for 3 giant balls
      PHASE1_BALL_SPEED: 4.2,
      PHASE1_BALL_DAMAGE: 20, // 2칸 (20 HP)
      // Phase 2
      PHASE2_HP: 100,
      PHASE2_BALL_CD: 12.0, // 12s cooldown for 6 homing balls
      PHASE2_HOMING_HP: 2,
      PHASE2_HOMING_SPEED: 2.2,
      PHASE2_HOMING_DAMAGE: 20, // 2칸
      // Phase 3
      PHASE3_HP: 200,
      PHASE3_LASER_CD: 5.0,      // 레이저 공격 5초 쿨타임
      PHASE3_LASER_WARN: 1.8,    // 1.8초 긴박한 경고 후 발사
      PHASE3_LASER_DAMAGE: 50,   // 5칸 (50 HP)
      PHASE3_SHOCKWAVE_CD: 8.0,  // 광역공격 8초 쿨타임
      PHASE3_SHOCKWAVE_CHARGE: 2.5, // 2.5초 차징 경고
      PHASE3_SHOCKWAVE_RADIUS: 7.0, // 7 tiles radius
      PHASE3_SHOCKWAVE_DURATION: 2.0, // 2초 지속 충격파 + 화면 진동
      PHASE3_SHOCKWAVE_TICK_DMG: 15,
      COLOR: '#8b1e3f',
    }
  },

  // Items
  ITEM: {
    POTION_HEAL: 10,      // 회복약은 오직 10 HP (1칸)만 회복
    SIZE: 22,
  },

  // Stages Metadata
  STAGES: [
    {
      id: 1,
      name: "플레이어의 집",
      nameEn: "Player's House",
      width: 5,
      height: 5,
      description: "좀비 아포칼립스가 시작되었다. 서둘러 밖으로 나가자!",
      objectiveText: "아래쪽 출구를 통해 마을로 나가기",
    },
    {
      id: 2,
      name: "플레이어가 사는 마을",
      nameEn: "Village Suburbs",
      width: 200,
      height: 200,
      description: "마을 전체가 좀비로 가득 찼다. 50마리의 좀비를 물리치고 탈출구를 찾아라!",
      objectiveText: "일반 좀비 50마리 처치 후 좌상단 탈출구로 이동",
      targetKills: 50,
      initialZombies: 200,
    },
    {
      id: 3,
      name: "도시로 향하는 길",
      nameEn: "Highway to Metropolis",
      width: 140,
      height: 80,
      description: "폐차량과 바리케이드로 막힌 고속도로. 슈팅 좀비와 거대 뮤턴트가 지키고 있다!",
      objectiveText: "뮤턴트 좀비 1마리 처치 후 톨게이트 터널 돌파",
      requireMutantClear: true,
    },
    {
      id: 4,
      name: "대도시",
      nameEn: "Metropolis Ruins",
      width: 250,
      height: 250,
      description: "가장 거대한 대도시. 3곳의 비상 전력기를 가동하여 비밀 연구소 지하 진입로를 열어라!",
      objectiveText: "비상 전력 콘솔 3개 가동 후 지하 진입구로 이동",
      requiredGenerators: 3,
    },
    {
      id: 5,
      name: "비밀 연구지역",
      nameEn: "Secret Research Outpost",
      width: 220,
      height: 220,
      description: "군사 보안 구역. 보안 데이터 칩 3개를 회수하여 연구실 본동 격리문을 해제하라!",
      objectiveText: "보안 데이터 칩 3개 획득 후 연구동 입구 도달",
      requiredKeycards: 3,
    },
    {
      id: 6,
      name: "좀비 연구실 내부",
      nameEn: "Bio-Hazard Laboratory",
      width: 160,
      height: 160,
      description: "바이러스가 최초 발생한 연구실. 메인 챔버의 오염 격리 밸브 3개를 열어라!",
      objectiveText: "격리 밸브 3개 해제 후 최종 챔버 에어로크로 진입",
      requiredValves: 3,
    },
    {
      id: 7,
      name: "최종 보스 챔버",
      nameEn: "Final Boss Chamber",
      width: 100,
      height: 100,
      description: "바이러스의 근원, 10x10 거대 보스 좀비와의 최종 결전! 백신을 확보하라!",
      objectiveText: "보스 좀비의 3개 페이즈를 격파하고 백신 획득!",
      isBossStage: true,
    }
  ]
};
