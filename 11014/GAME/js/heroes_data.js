/**
 * ANCIENT CASTLE GUARDIANS: HEROES & WEAPONS DATABASE
 * 5-Star Mythic Heroes (12) with unique Exclusive Weapons & Skills
 * 4-Star Legendary Heroes (20)
 * 3-Star Epic Heroes (12)
 * 2-Star Rare Heroes (8)
 * 1-Star Common Heroes (6)
 * Total: 58 Heroes + Exclusive Weapons & Equipment Database
 */

const HERO_TIERS = {
  5: { name: '신화 (Mythic)', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.8)', bgGradient: 'linear-gradient(135deg, #78350f, #f59e0b, #fbbf24)' },
  4: { name: '전설 (Legendary)', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.7)', bgGradient: 'linear-gradient(135deg, #831843, #ec4899)' },
  3: { name: '에픽 (Epic)', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)', bgGradient: 'linear-gradient(135deg, #581c87, #a855f7)' },
  2: { name: '레어 (Rare)', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)', bgGradient: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' },
  1: { name: '일반 (Common)', color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', bgGradient: 'linear-gradient(135deg, #064e3b, #10b981)' }
};

const ELEMENTS = {
  holy: { name: '신성/빛', icon: '✨', color: '#fbbf24', strongAgainst: 'undead,demon' },
  fire: { name: '화염', icon: '🔥', color: '#ef4444', strongAgainst: 'golem,orc' },
  ice: { name: '빙결', icon: '❄️', color: '#38bdf8', strongAgainst: 'dragon,demon' },
  thunder: { name: '번개', icon: '⚡', color: '#facc15', strongAgainst: 'elf,water' },
  dark: { name: '암흑/사령', icon: '🌑', color: '#9333ea', strongAgainst: 'holy,elf' },
  earth: { name: '대지', icon: '🪨', color: '#84cc16', strongAgainst: 'thunder,orc' },
  wind: { name: '바람', icon: '🌪️', color: '#14b8a6', strongAgainst: 'earth,golem' },
  physical: { name: '물리/기계', icon: '⚔️', color: '#e2e8f0', strongAgainst: 'all' }
};

// 12 Mythic 5-Star Heroes with Exclusive Weapons
const MYTHIC_5_STAR_HEROES = [
  {
    id: 'hero_erica',
    name: '에리카',
    title: '성광의 수호기사단장',
    tier: 5,
    role: 'tanker', // tanker, warrior, mage, ranger, assassin, support
    element: 'holy',
    avatar: '🛡️',
    baseHp: 1800,
    baseAtk: 120,
    baseDef: 85,
    atkSpeed: 1.1,
    range: 160,
    position: 'ground', // 'ground' (성문 앞 지상 요격) or 'wall' (성벽 위 원거리)
    skillName: '성광의 가호 & 결계',
    skillDesc: '아군 전체 및 성벽에 최대 체력의 30% 방어막을 6초간 부여하고, 전방에 성광 참격을 날려 450% 피해를 입힙니다.',
    skillCooldown: 12,
    exclusiveWeapon: {
      id: 'weap_excalibur',
      name: '성검 엑스칼리버',
      desc: '신성한 빛이 깃든 전설의 성검. 에리카가 장착 시 방어막 지속시간 2배 및 성광 반사 피해 100% 부여.',
      baseAtk: 240,
      baseDef: 120,
      specialEffect: '결계 지속시간 +6초, 방어막 피격 시 적에게 신성 반사 피해 120%',
      recipe: {
        iron: 200,
        mithril: 100,
        adamantite: 50,
        orichalcum: 30,
        dragonStone: 15,
        dungeonCoins: 500
      }
    }
  },
  {
    id: 'hero_ignis',
    name: '이그니스',
    title: '멸망의 대마도사',
    tier: 5,
    role: 'mage',
    element: 'fire',
    avatar: '🔥',
    baseHp: 850,
    baseAtk: 320,
    baseDef: 30,
    atkSpeed: 0.9,
    range: 520,
    position: 'wall',
    skillName: '지옥염화 메테오',
    skillDesc: '하늘에서 3개의 거대한 화염 운석을 낙하시켜 적 군단에 750%의 광역 폭발 피해와 5초간 지속 연소 상태를 부여합니다.',
    skillCooldown: 14,
    exclusiveWeapon: {
      id: 'weap_hellfire_staff',
      name: '지옥염화의 지팡이',
      desc: '지옥의 화염을 봉인한 고대 지팡이. 메테오 개수 5개로 증가 및 연소 피해 150% 증가.',
      baseAtk: 450,
      baseDef: 20,
      specialEffect: '메테오 낙하 수 5개로 증가, 화염 폭발 반경 40% 증가 및 마법 저항 50% 관통',
      recipe: {
        iron: 150,
        mithril: 120,
        adamantite: 60,
        orichalcum: 40,
        dragonStone: 15,
        dungeonCoins: 500
      }
    }
  },
  {
    id: 'hero_malachai',
    name: '말라카이',
    title: '영혼의 사신',
    tier: 5,
    role: 'mage',
    element: 'dark',
    avatar: '💀',
    baseHp: 900,
    baseAtk: 280,
    baseDef: 35,
    atkSpeed: 1.0,
    range: 480,
    position: 'wall',
    skillName: '영혼 수확 & 사령 소환',
    skillDesc: '전방에 암흑의 소용돌이를 일으켜 500% 마법 피해를 입히고, 쓰러진 적들의 영혼을 망령 전사 4기로 부활시켜 전방에 돌격시킵니다.',
    skillCooldown: 13,
    exclusiveWeapon: {
      id: 'weap_soul_scythe',
      name: '명계의 사신 낫',
      desc: '영혼을 베어 넘기는 저승의 낫. 말라카이가 장착 시 망령 전사 소환 수 8기로 증가 & 자폭 피해.',
      baseAtk: 400,
      baseDef: 30,
      specialEffect: '부활 망령 전사 8기로 증가, 망령 공격력 80% 증가 및 사망 시 광역 영혼 폭발',
      recipe: {
        iron: 180,
        mithril: 110,
        adamantite: 65,
        orichalcum: 35,
        dragonStone: 15,
        dungeonCoins: 500
      }
    }
  },
  {
    id: 'hero_ren',
    name: '렌',
    title: '질풍의 환영 칼날',
    tier: 5,
    role: 'assassin',
    element: 'wind',
    avatar: '🗡️',
    baseHp: 1100,
    baseAtk: 310,
    baseDef: 45,
    atkSpeed: 1.8,
    range: 220,
    position: 'ground',
    skillName: '환영 분신 난무',
    skillDesc: '가장 강력한 적 또는 보스 배후로 순간이동하여 12회의 초고속 연타(총 850% 물리 피해)를 가하고 100% 치명타를 터뜨립니다.',
    skillCooldown: 10,
    exclusiveWeapon: {
      id: 'weap_skywind_daggers',
      name: '천공의 쌍단검',
      desc: '바람의 정령이 벼려낸 환영의 쌍단검. 연타 횟수 20회로 증가 및 적 공격력 40% 감소 디버프.',
      baseAtk: 420,
      baseDef: 40,
      specialEffect: '연타 횟수 20회로 폭증, 치명타 피해량 +150%, 4초간 공격속도 100% 버프',
      recipe: {
        iron: 200,
        mithril: 130,
        adamantite: 50,
        orichalcum: 40,
        dragonStone: 15,
        dungeonCoins: 500
      }
    }
  },
  {
    id: 'hero_barrak',
    name: '바락',
    title: '대지의 파쇄자',
    tier: 5,
    role: 'warrior',
    element: 'earth',
    avatar: '🔨',
    baseHp: 2100,
    baseAtk: 220,
    baseDef: 95,
    atkSpeed: 0.8,
    range: 180,
    position: 'ground',
    skillName: '진도 9 파쇄 지진',
    skillDesc: '대지를 내리찍어 전방 일직선상의 모든 적을 공중에 띄우며 600% 대지 피해를 입히고 3초간 기절(스턴)시킵니다.',
    skillCooldown: 11,
    exclusiveWeapon: {
      id: 'weap_earthshaker_hammer',
      name: '거신의 대지퇴',
      desc: '대지의 신 바위 심장을 박아 넣은 거대 해머. 기절 시간 5초로 증가 & 방어력 100% 추가 흡수.',
      baseAtk: 360,
      baseDef: 150,
      specialEffect: '광역 지진 범위 2배, 기절 지속시간 5초로 증가, 충격파 주변에 모래폭풍 생성(적 명중률 -50%)',
      recipe: {
        iron: 250,
        mithril: 100,
        adamantite: 80,
        orichalcum: 30,
        dragonStone: 15,
        dungeonCoins: 500
      }
    }
  },
  {
    id: 'hero_elena',
    name: '엘레나',
    title: '뇌제의 저격 여신',
    tier: 5,
    role: 'ranger',
    element: 'thunder',
    avatar: '🏹',
    baseHp: 920,
    baseAtk: 340,
    baseDef: 35,
    atkSpeed: 1.3,
    range: 580,
    position: 'wall',
    skillName: '뇌신포 체인 라이트닝',
    skillDesc: '빛의 번개 화살을 발사하여 전장 내 최대 10명의 적에게 연쇄 번개 피해(650%)를 주고 2초간 감전 마비시킵니다.',
    skillCooldown: 9,
    exclusiveWeapon: {
      id: 'weap_thunder_storm_bow',
      name: '뇌신포 폭풍궁',
      desc: '번개의 신 토르의 축복을 받은 활. 연쇄 타겟 20명으로 확대 및 번개 폭풍 화살비 지원.',
      baseAtk: 460,
      baseDef: 25,
      specialEffect: '연쇄 번개 타겟 20명으로 증가, 번개 적중 시 30% 확률로 추가 벼락 강림(300% 추가타)',
      recipe: {
        iron: 160,
        mithril: 140,
        adamantite: 70,
        orichalcum: 40,
        dragonStone: 15,
        dungeonCoins: 500
      }
    }
  },
  {
    id: 'hero_freezia',
    name: '프리지아',
    title: '혹한의 서리 여왕',
    tier: 5,
    role: 'mage',
    element: 'ice',
    avatar: '❄️',
    baseHp: 880,
    baseAtk: 290,
    baseDef: 40,
    atkSpeed: 1.0,
    range: 500,
    position: 'wall',
    skillName: '절대 영도 블리자드',
    skillDesc: '전장 전체에 혹한의 눈보라를 소환하여 6초간 적들의 이동속도를 70% 감소시키고, 매초 120% 빙결 피해를 입힙니다.',
    skillCooldown: 15,
    exclusiveWeapon: {
      id: 'weap_glacies_heart',
      name: '만년설의 심장 오브',
      desc: '영원히 녹지 않는 태고의 얼음 오브. 블리자드 종료 시 적 전원 4초간 완전 동결 및 빙결 파쇄.',
      baseAtk: 430,
      baseDef: 50,
      specialEffect: '이동속도 감소 90%로 강화, 눈보라 종료 시 빙결된 적들에게 500% 얼음 파쇄 폭발',
      recipe: {
        iron: 150,
        mithril: 150,
        adamantite: 60,
        orichalcum: 45,
        dragonStone: 15,
        dungeonCoins: 500
      }
    }
  },
  {
    id: 'hero_seraphina',
    name: '세라피나',
    title: '천상의 대사제',
    tier: 5,
    role: 'support',
    element: 'holy',
    avatar: '🕊️',
    baseHp: 1000,
    baseAtk: 180,
    baseDef: 50,
    atkSpeed: 1.0,
    range: 450,
    position: 'wall',
    skillName: '천상의 은총 & 성벽 복구',
    skillDesc: '성벽의 HP를 즉시 25% 복구하고, 아군 전원의 체력을 100% 회복시키며 5초간 공격력 50% 증가 축복을 부여합니다.',
    skillCooldown: 16,
    exclusiveWeapon: {
      id: 'weap_apostle_codex',
      name: '여신의 묵시록 성서',
      desc: '신들의 비밀이 적힌 성서. 성벽 회복량 40%로 증가 및 3초간 성벽 무적 에너지 실드 전개.',
      baseAtk: 280,
      baseDef: 100,
      specialEffect: '성벽 회복량 40%로 증가, 스킬 시전 시 성벽에 4초간 완전 무적 배리어 생성',
      recipe: {
        iron: 140,
        mithril: 160,
        adamantite: 50,
        orichalcum: 50,
        dragonStone: 15,
        dungeonCoins: 500
      }
    }
  },
  {
    id: 'hero_dracul',
    name: '드라큘',
    title: '진홍의 혈황제',
    tier: 5,
    role: 'warrior',
    element: 'dark',
    avatar: '🩸',
    baseHp: 1600,
    baseAtk: 300,
    baseDef: 60,
    atkSpeed: 1.4,
    range: 190,
    position: 'ground',
    skillName: '블러디 카니발 & 흡혈 광란',
    skillDesc: '자신의 피를 태워 전방 부채꼴 범위에 피의 파동(700% 피해)을 발사하고 입힌 피해의 50%만큼 체력을 흡수합니다.',
    skillCooldown: 8,
    exclusiveWeapon: {
      id: 'weap_bloodthirsty_sword',
      name: '블러드써스티 대검',
      desc: '피를 갈망하는 저주받은 마검. 흡혈량 100%로 증가 및 적 처치 시 공격력 10% 영구 중첩(최대 10중첩).',
      baseAtk: 440,
      baseDef: 50,
      specialEffect: '흡혈 비율 100%로 증가, 치명타 적중 시 주변에 피의 가시 폭발(300% 광역 피해)',
      recipe: {
        iron: 220,
        mithril: 120,
        adamantite: 70,
        orichalcum: 40,
        dragonStone: 15,
        dungeonCoins: 500
      }
    }
  },
  {
    id: 'hero_chronos',
    name: '크로노스',
    title: '시간의 지배자',
    tier: 5,
    role: 'support',
    element: 'physical',
    avatar: '⏳',
    baseHp: 950,
    baseAtk: 240,
    baseDef: 45,
    atkSpeed: 1.1,
    range: 520,
    position: 'wall',
    skillName: '시간 왜곡 & 타임 스톱',
    skillDesc: '전장의 모든 적을 4초간 완전히 정지(Time Stop)시키고, 아군 전체의 스킬 쿨타임을 5초 단축시킵니다.',
    skillCooldown: 18,
    exclusiveWeapon: {
      id: 'weap_chronometer',
      name: '시간 왜곡의 회중시계',
      desc: '시공간의 흐름을 조율하는 아티팩트. 시간 정지 6초로 증가 & 적 공격속도/이동속도 50% 영구 감속.',
      baseAtk: 350,
      baseDef: 70,
      specialEffect: '타임 스톱 지속시간 6초로 증가, 아군 전체 공격속도 및 쿨타임 회복속도 50% 가속 버프',
      recipe: {
        iron: 180,
        mithril: 150,
        adamantite: 80,
        orichalcum: 50,
        dragonStone: 15,
        dungeonCoins: 500
      }
    }
  },
  {
    id: 'hero_victoria',
    name: '빅토리아',
    title: '마도공학 천재 포병',
    tier: 5,
    role: 'ranger',
    element: 'physical',
    avatar: '⚙️',
    baseHp: 1050,
    baseAtk: 330,
    baseDef: 55,
    atkSpeed: 1.2,
    range: 550,
    position: 'wall',
    skillName: '초시공 아케인 궤도 폭격',
    skillDesc: '위성 궤도 레이저를 가동하여 가장 밀집된 적 지역에 900%의 아케인 관통 빔을 3회 연속 폭격합니다.',
    skillCooldown: 12,
    exclusiveWeapon: {
      id: 'weap_orbital_railcannon',
      name: '초시공 궤도 캐논',
      desc: '초고밀도 에테르 에너지를 쏘아내는 마도 레일건. 성탑 포탑들의 공격력을 150% 증폭시키고 궤도 폭격 5회 발사.',
      baseAtk: 470,
      baseDef: 40,
      specialEffect: '성탑 포탑 4종의 공격력 +150% 패시브 버프, 궤도 레이저 폭격 5회로 증가',
      recipe: {
        iron: 240,
        mithril: 140,
        adamantite: 90,
        orichalcum: 50,
        dragonStone: 15,
        dungeonCoins: 500
      }
    }
  },
  {
    id: 'hero_bahamut',
    name: '바하무트',
    title: '용혈의 패왕 용기사',
    tier: 5,
    role: 'warrior',
    element: 'fire',
    avatar: '🐉',
    baseHp: 1950,
    baseAtk: 310,
    baseDef: 80,
    atkSpeed: 1.2,
    range: 200,
    position: 'ground',
    skillName: '드래곤 포효 & 화염 브레스',
    skillDesc: '고대 화룡의 화신으로 변신하여 전방 600 범위를 집어삼키는 파멸의 화염 브레스(800% 피해)를 방사합니다.',
    skillCooldown: 13,
    exclusiveWeapon: {
      id: 'weap_dragon_spear',
      name: '드래곤 하트 창',
      desc: '진룡의 심장으로 벼린 불멸의 용창. 브레스 공격 범위 전장 전체로 확대 및 적 방어력 70% 파쇄.',
      baseAtk: 450,
      baseDef: 90,
      specialEffect: '브레스 지속시간 2배, 적 방어력 70% 무시, 아군 전체 용의 사기 버프(치명타율 +30%)',
      recipe: {
        iron: 230,
        mithril: 150,
        adamantite: 80,
        orichalcum: 60,
        dragonStone: 20,
        dungeonCoins: 500
      }
    }
  }
];

// 20 Legendary 4-Star Heroes
const LEGENDARY_4_STAR_HEROES = [
  { id: 'hero_leon', name: '레온', title: '황혼의 검호', tier: 4, role: 'warrior', element: 'holy', avatar: '⚔️', baseHp: 1200, baseAtk: 190, baseDef: 60, atkSpeed: 1.3, range: 170, position: 'ground', skillName: '황혼의 일섬', skillDesc: '전방으로 돌진하여 일렬의 적들에게 450% 피해를 입힙니다.', skillCooldown: 9 },
  { id: 'hero_kyle', name: '카일', title: '저격의 명수', tier: 4, role: 'ranger', element: 'physical', avatar: '🎯', baseHp: 750, baseAtk: 220, baseDef: 28, atkSpeed: 1.1, range: 560, position: 'wall', skillName: '헤드샷 저격', skillDesc: '체력이 가장 높은 적에게 600%의 단일 치명타 피해를 입힙니다.', skillCooldown: 8 },
  { id: 'hero_pyro', name: '파이로', title: '화염술사', tier: 4, role: 'mage', element: 'fire', avatar: '💥', baseHp: 700, baseAtk: 210, baseDef: 25, atkSpeed: 1.0, range: 460, position: 'wall', skillName: '화염 폭풍', skillDesc: '지정 영역에 400% 화염 지속 피해를 줍니다.', skillCooldown: 10 },
  { id: 'hero_gawain', name: '가웨인', title: '은빛 기사', tier: 4, role: 'tanker', element: 'holy', avatar: '🛡️', baseHp: 1500, baseAtk: 110, baseDef: 75, atkSpeed: 1.0, range: 150, position: 'ground', skillName: '방패 밀치기', skillDesc: '적들을 강하게 밀쳐내며 300% 피해와 2초 기절을 부여합니다.', skillCooldown: 10 },
  { id: 'hero_shadow', name: '섀도우', title: '그림자 암살자', tier: 4, role: 'assassin', element: 'dark', avatar: '👤', baseHp: 850, baseAtk: 230, baseDef: 32, atkSpeed: 1.6, range: 180, position: 'ground', skillName: '암습의 비수', skillDesc: '적 후방으로 침투하여 500% 치명타 공격을 가합니다.', skillCooldown: 7 },
  { id: 'hero_frost', name: '프로스트', title: '서리 사냥꾼', tier: 4, role: 'ranger', element: 'ice', avatar: '🧊', baseHp: 780, baseAtk: 195, baseDef: 30, atkSpeed: 1.2, range: 500, position: 'wall', skillName: '빙결 화살', skillDesc: '화살을 발사하여 적 5명을 3초간 동결시킵니다.', skillCooldown: 11 },
  { id: 'hero_silvana', name: '실바나', title: '숲의 드루이드', tier: 4, role: 'support', element: 'earth', avatar: '🌿', baseHp: 880, baseAtk: 140, baseDef: 40, atkSpeed: 1.0, range: 440, position: 'wall', skillName: '치유의 덩굴', skillDesc: '성벽과 아군의 체력을 15% 회복하고 적을 묶습니다.', skillCooldown: 12 },
  { id: 'hero_jill', name: '질', title: '룬 마도사', tier: 4, role: 'mage', element: 'thunder', avatar: '🔮', baseHp: 720, baseAtk: 215, baseDef: 26, atkSpeed: 1.0, range: 480, position: 'wall', skillName: '방전 마법진', skillDesc: '지면에 마법진을 깔아 진입하는 적들에게 지속 감전 피해를 줍니다.', skillCooldown: 10 },
  { id: 'hero_ironheart', name: '아이언하트', title: '철벽의 거인', tier: 4, role: 'tanker', element: 'physical', avatar: '🏰', baseHp: 1700, baseAtk: 95, baseDef: 85, atkSpeed: 0.8, range: 140, position: 'ground', skillName: '철벽 방진', skillDesc: '5초간 자신이 받는 피해를 70% 감소시킵니다.', skillCooldown: 12 },
  { id: 'hero_guile', name: '가일', title: '폭풍의 권사', tier: 4, role: 'warrior', element: 'wind', avatar: '🥊', baseHp: 1150, baseAtk: 205, baseDef: 50, atkSpeed: 1.5, range: 160, position: 'ground', skillName: '질풍 연타', skillDesc: '초고속 주먹 연타로 전방의 적들을 넉백시키며 420% 피해를 줍니다.', skillCooldown: 8 },
  { id: 'hero_clara', name: '클라라', title: '아케인 건슬링어', tier: 4, role: 'ranger', element: 'physical', avatar: '🔫', baseHp: 800, baseAtk: 225, baseDef: 30, atkSpeed: 1.4, range: 510, position: 'wall', skillName: '마탄 난사', skillDesc: '전방에 마도 총탄을 부채꼴로 난사하여 480% 피해를 입힙니다.', skillCooldown: 9 },
  { id: 'hero_walter', name: '발터', title: '맹독 연금술사', tier: 4, role: 'mage', element: 'dark', avatar: '🧪', baseHp: 740, baseAtk: 185, baseDef: 35, atkSpeed: 1.0, range: 450, position: 'wall', skillName: '독가스 플라스크', skillDesc: '독 플라스크를 투척하여 8초간 광역 맹독 중독을 일으킵니다.', skillCooldown: 11 },
  { id: 'hero_lorelei', name: '로렐라이', title: '환영의 무희', tier: 4, role: 'support', element: 'wind', avatar: '💃', baseHp: 820, baseAtk: 150, baseDef: 38, atkSpeed: 1.2, range: 400, position: 'ground', skillName: '열정의 왈츠', skillDesc: '아군 전체의 공격속도를 6초간 50% 상승시킵니다.', skillCooldown: 13 },
  { id: 'hero_torvin', name: '토르빈', title: '벼락의 창술사', tier: 4, role: 'warrior', element: 'thunder', avatar: '⚡', baseHp: 1250, baseAtk: 195, baseDef: 55, atkSpeed: 1.2, range: 190, position: 'ground', skillName: '뇌격창 투척', skillDesc: '관통하는 번개 창을 던져 일직선상의 적들에게 460% 피해를 줍니다.', skillCooldown: 9 },
  { id: 'hero_vlad', name: '블라드', title: '밤의 백작', tier: 4, role: 'assassin', element: 'dark', avatar: '🦇', baseHp: 950, baseAtk: 210, baseDef: 42, atkSpeed: 1.3, range: 170, position: 'ground', skillName: '박쥐 떼 습격', skillDesc: '박쥐 떼를 방출해 적들을 실명시키고 피해의 40%를 흡혈합니다.', skillCooldown: 10 },
  { id: 'hero_lapis', name: '라피스', title: '숲의 수호정령', tier: 4, role: 'support', element: 'holy', avatar: '🧚', baseHp: 790, baseAtk: 130, baseDef: 35, atkSpeed: 1.1, range: 460, position: 'wall', skillName: '정령의 안식', skillDesc: '체력이 가장 낮은 아군 3명을 치유하고 방어막을 씌웁니다.', skillCooldown: 10 },
  { id: 'hero_grog', name: '그로그', title: '불굴의 바바리안', tier: 4, role: 'warrior', element: 'earth', avatar: '🪓', baseHp: 1450, baseAtk: 180, baseDef: 48, atkSpeed: 1.1, range: 170, position: 'ground', skillName: '광란의 도끼질', skillDesc: '양손 도끼를 회전시켜 주변 적들에게 420% 회오리 피해를 줍니다.', skillCooldown: 8 },
  { id: 'hero_briggs', name: '브릭스', title: '중화기 포술장', tier: 4, role: 'ranger', element: 'fire', avatar: '💣', baseHp: 890, baseAtk: 235, baseDef: 38, atkSpeed: 0.8, range: 540, position: 'wall', skillName: '고폭탄 발사', skillDesc: '거대 고폭탄을 발사하여 광역 520% 화염 폭발을 일으킵니다.', skillCooldown: 11 },
  { id: 'hero_gabriel', name: '가브리엘', title: '은빛 퇴마사', tier: 4, role: 'mage', element: 'holy', avatar: '📖', baseHp: 760, baseAtk: 200, baseDef: 36, atkSpeed: 1.0, range: 470, position: 'wall', skillName: '악마 퇴치령', skillDesc: '신성한 빛으로 언데드와 악마에게 2배의 피해(500%)를 줍니다.', skillCooldown: 10 },
  { id: 'hero_necros', name: '네크로스', title: '해골 지휘관', tier: 4, role: 'mage', element: 'dark', avatar: '🧙', baseHp: 800, baseAtk: 180, baseDef: 30, atkSpeed: 1.0, range: 450, position: 'wall', skillName: '해골 방패병 소환', skillDesc: '성벽 앞에 해골 방패병 3기를 소환하여 적의 진격을 막아섭니다.', skillCooldown: 14 }
];

// 12 Epic 3-Star Heroes
const EPIC_3_STAR_HEROES = [
  { id: 'hero_footman_elite', name: '정예 왕실 보병', title: '왕실 수호대', tier: 3, role: 'tanker', element: 'physical', avatar: '🛡️', baseHp: 950, baseAtk: 75, baseDef: 45, atkSpeed: 1.0, range: 150, position: 'ground', skillName: '수호의 방패', skillDesc: '3초간 방어력을 50% 올립니다.', skillCooldown: 10 },
  { id: 'hero_longbow_elite', name: '정예 장궁병', title: '왕립 사수', tier: 3, role: 'ranger', element: 'physical', avatar: '🏹', baseHp: 520, baseAtk: 130, baseDef: 20, atkSpeed: 1.1, range: 480, position: 'wall', skillName: '화살비', skillDesc: '일정 구역에 화살비를 쏟아붓습니다.', skillCooldown: 9 },
  { id: 'hero_apprentice_mage', name: '왕립 마법수련생', title: '화염 마법사', tier: 3, role: 'mage', element: 'fire', avatar: '🔥', baseHp: 480, baseAtk: 140, baseDef: 18, atkSpeed: 0.9, range: 430, position: 'wall', skillName: '파이어볼', skillDesc: '광역 폭발 화염구를 발사합니다.', skillCooldown: 8 },
  { id: 'hero_cleric_sister', name: '성당 수녀', title: '치유사', tier: 3, role: 'support', element: 'holy', avatar: '✨', baseHp: 550, baseAtk: 80, baseDef: 25, atkSpeed: 1.0, range: 400, position: 'wall', skillName: '치유의 기도', skillDesc: '성벽 체력을 8% 회복시킵니다.', skillCooldown: 12 },
  { id: 'hero_scout_ranger', name: '숲의 정찰병', title: '엘프 순찰자', tier: 3, role: 'ranger', element: 'wind', avatar: '🍃', baseHp: 500, baseAtk: 125, baseDef: 22, atkSpeed: 1.3, range: 460, position: 'wall', skillName: '연사 사격', skillDesc: '연속으로 3발의 화살을 쏩니다.', skillCooldown: 7 },
  { id: 'hero_heavy_knight', name: '중갑 기사', title: '돌격 기사', tier: 3, role: 'warrior', element: 'physical', avatar: '🐎', baseHp: 1050, baseAtk: 100, baseDef: 50, atkSpeed: 1.0, range: 160, position: 'ground', skillName: '기병 돌격', skillDesc: '전방으로 돌진하여 250% 피해를 줍니다.', skillCooldown: 9 },
  { id: 'hero_frost_witch', name: '빙결 마녀', title: '얼음 술사', tier: 3, role: 'mage', element: 'ice', avatar: '❄️', baseHp: 490, baseAtk: 135, baseDef: 20, atkSpeed: 0.9, range: 440, position: 'wall', skillName: '서리 송곳', skillDesc: '얼음 창을 꽂아 적을 느리게 합니다.', skillCooldown: 9 },
  { id: 'hero_thief_rogue', name: '그림자 도적', title: '도적', tier: 3, role: 'assassin', element: 'dark', avatar: '🗡️', baseHp: 600, baseAtk: 145, baseDef: 25, atkSpeed: 1.5, range: 160, position: 'ground', skillName: '급소 찌르기', skillDesc: '치명타 300% 단일 피해를 입힙니다.', skillCooldown: 8 },
  { id: 'hero_thunder_monk', name: '뇌전 수도승', title: '권승', tier: 3, role: 'warrior', element: 'thunder', avatar: '⚡', baseHp: 820, baseAtk: 115, baseDef: 35, atkSpeed: 1.2, range: 160, position: 'ground', skillName: '벽력권', skillDesc: '번개 충격파를 발사합니다.', skillCooldown: 8 },
  { id: 'hero_stone_golem_ally', name: '아군 바위 골렘', title: '수호 골렘', tier: 3, role: 'tanker', element: 'earth', avatar: '🗿', baseHp: 1200, baseAtk: 70, baseDef: 60, atkSpeed: 0.7, range: 140, position: 'ground', skillName: '바위 던지기', skillDesc: '거대한 바위를 던져 기절시킵니다.', skillCooldown: 12 },
  { id: 'hero_alchemist_bomber', name: '폭탄 투척수', title: '화약 전문가', tier: 3, role: 'ranger', element: 'fire', avatar: '💣', baseHp: 560, baseAtk: 135, baseDef: 22, atkSpeed: 0.9, range: 420, position: 'wall', skillName: '연쇄 폭탄', skillDesc: '폭탄을 던져 광역 피해를 줍니다.', skillCooldown: 9 },
  { id: 'hero_dark_cultist', name: '개심한 이교도', title: '암흑 사제', tier: 3, role: 'mage', element: 'dark', avatar: '🕯️', baseHp: 510, baseAtk: 125, baseDef: 24, atkSpeed: 1.0, range: 430, position: 'wall', skillName: '저주의 손길', skillDesc: '적의 방어력을 30% 감소시킵니다.', skillCooldown: 10 }
];

// 8 Rare 2-Star Heroes
const RARE_2_STAR_HEROES = [
  { id: 'hero_mercenary_swordsman', name: '용병 검투사', title: '숙련 용병', tier: 2, role: 'warrior', element: 'physical', avatar: '🗡️', baseHp: 650, baseAtk: 60, baseDef: 28, atkSpeed: 1.1, range: 150, position: 'ground', skillName: '강타', skillDesc: '강한 일격을 가합니다.', skillCooldown: 7 },
  { id: 'hero_hunter_archer', name: '마을 사냥꾼', title: '수렵꾼', tier: 2, role: 'ranger', element: 'physical', avatar: '🏹', baseHp: 380, baseAtk: 85, baseDef: 15, atkSpeed: 1.1, range: 450, position: 'wall', skillName: '조준 사격', skillDesc: '강력한 화살 한 발을 발사합니다.', skillCooldown: 8 },
  { id: 'hero_guard_captain', name: '성문 경비대장', title: '경비대장', tier: 2, role: 'tanker', element: 'physical', avatar: '🛡️', baseHp: 750, baseAtk: 50, baseDef: 35, atkSpeed: 0.9, range: 140, position: 'ground', skillName: '경비 태세', skillDesc: '잠시 방어력을 올립니다.', skillCooldown: 9 },
  { id: 'hero_church_acolyte', name: '견습 사제', title: '사제', tier: 2, role: 'support', element: 'holy', avatar: '🕊️', baseHp: 400, baseAtk: 45, baseDef: 18, atkSpeed: 1.0, range: 380, position: 'wall', skillName: '작은 치유', skillDesc: '아군 체력을 조금 회복합니다.', skillCooldown: 11 },
  { id: 'hero_wandering_mage', name: '방랑 마법사', title: '마법사', tier: 2, role: 'mage', element: 'fire', avatar: '🔮', baseHp: 360, baseAtk: 90, baseDef: 14, atkSpeed: 0.9, range: 410, position: 'wall', skillName: '불꽃 튀기기', skillDesc: '작은 불꽃으로 피해를 줍니다.', skillCooldown: 7 },
  { id: 'hero_woodsman_axe', name: '벌목꾼', title: '도끼 전사', tier: 2, role: 'warrior', element: 'earth', avatar: '🪓', baseHp: 700, baseAtk: 65, baseDef: 24, atkSpeed: 0.9, range: 150, position: 'ground', skillName: '도끼 찍기', skillDesc: '적을 바닥에 내리찍습니다.', skillCooldown: 8 },
  { id: 'hero_spearman_recruit', name: '장창병', title: '창병', tier: 2, role: 'warrior', element: 'physical', avatar: '🔱', baseHp: 620, baseAtk: 62, baseDef: 26, atkSpeed: 1.1, range: 170, position: 'ground', skillName: '찌르기', skillDesc: '장거리 찌르기로 공격합니다.', skillCooldown: 7 },
  { id: 'hero_wind_archer', name: '바람의 궁병', title: '궁병', tier: 2, role: 'ranger', element: 'wind', avatar: '🍃', baseHp: 390, baseAtk: 80, baseDef: 16, atkSpeed: 1.2, range: 440, position: 'wall', skillName: '돌풍살', skillDesc: '바람 화살을 발사합니다.', skillCooldown: 8 }
];

// 6 Common 1-Star Heroes
const COMMON_1_STAR_HEROES = [
  { id: 'hero_recruit_soldier', name: '신병 전사', title: '훈련병', tier: 1, role: 'warrior', element: 'physical', avatar: '🗡️', baseHp: 400, baseAtk: 35, baseDef: 15, atkSpeed: 1.0, range: 140, position: 'ground', skillName: '찌르기', skillDesc: '기본적인 무기 공격.', skillCooldown: 6 },
  { id: 'hero_militia_archer', name: '의용군 활잡이', title: '민병대', tier: 1, role: 'ranger', element: 'physical', avatar: '🏹', baseHp: 260, baseAtk: 50, baseDef: 10, atkSpeed: 1.0, range: 420, position: 'wall', skillName: '화살 쏘기', skillDesc: '나무 화살 발사.', skillCooldown: 7 },
  { id: 'hero_farm_volunteer', name: '농민 의용군', title: '의용군', tier: 1, role: 'tanker', element: 'earth', avatar: '🌾', baseHp: 480, baseAtk: 28, baseDef: 18, atkSpeed: 0.9, range: 130, position: 'ground', skillName: '낫 휘두르기', skillDesc: '낫을 휘둘러 방어합니다.', skillCooldown: 7 },
  { id: 'hero_village_stone', name: '투석병', title: '투석병', tier: 1, role: 'ranger', element: 'physical', avatar: '🪨', baseHp: 280, baseAtk: 45, baseDef: 10, atkSpeed: 1.0, range: 390, position: 'wall', skillName: '돌 던지기', skillDesc: '돌을 던집니다.', skillCooldown: 6 },
  { id: 'hero_torch_bearer', name: '횃불지기', title: '횃불병', tier: 1, role: 'warrior', element: 'fire', avatar: '🔥', baseHp: 420, baseAtk: 38, baseDef: 14, atkSpeed: 1.0, range: 140, position: 'ground', skillName: '횃불 휘두르기', skillDesc: '불을 붙여 공격합니다.', skillCooldown: 7 },
  { id: 'hero_apprentice_healer', name: '약초 캐는 아이', title: '약초사', tier: 1, role: 'support', element: 'holy', avatar: '🌱', baseHp: 300, baseAtk: 25, baseDef: 12, atkSpeed: 1.0, range: 350, position: 'wall', skillName: '약초 바르기', skillDesc: '소량의 체력을 치유합니다.', skillCooldown: 10 }
];

// All Heroes Array (58 Heroes)
const ALL_HEROES = [
  ...MYTHIC_5_STAR_HEROES,
  ...LEGENDARY_4_STAR_HEROES,
  ...EPIC_3_STAR_HEROES,
  ...RARE_2_STAR_HEROES,
  ...COMMON_1_STAR_HEROES
];

const HERO_MAP = {};
ALL_HEROES.forEach(hero => {
  HERO_MAP[hero.id] = hero;
});

// Common Equipments for non-exclusive or general slots
const COMMON_EQUIPMENTS = [
  { id: 'eq_iron_sword', name: '강철 기사검', tier: 1, type: 'weapon', atk: 30, def: 5, icon: '🗡️' },
  { id: 'eq_composite_bow', name: '합성 곡궁', tier: 2, type: 'weapon', atk: 55, def: 0, icon: '🏹' },
  { id: 'eq_ruby_staff', name: '루비 마도봉', tier: 3, type: 'weapon', atk: 110, def: 15, icon: '🔮' },
  { id: 'eq_dragonslayer', name: '드래곤 슬레이어', tier: 4, type: 'weapon', atk: 220, def: 40, icon: '⚔️' },
  { id: 'eq_iron_armor', name: '사슬 갑옷', tier: 1, type: 'armor', atk: 0, def: 25, hp: 150, icon: '🛡️' },
  { id: 'eq_mithril_plate', name: '미스릴 판금갑', tier: 3, type: 'armor', atk: 10, def: 70, hp: 450, icon: '🦺' },
  { id: 'eq_titan_shield', name: '타이탄 대방패', tier: 4, type: 'armor', atk: 20, def: 130, hp: 900, icon: '🛡️' }
];

// Enemy Race Database for Waves & Scouting
const ENEMY_RACES = {
  orc: {
    name: '오크 & 고블린 부족',
    icon: '👺',
    desc: '대규모 물량 공세와 빠른 돌진 속도를 가진 야만 부족.',
    weakness: '화염, 대지',
    resistance: '물리',
    bossName: '파괴의 족장 그롬마쉬',
    bossDesc: '거대한 도끼로 성벽을 직접 파괴하는 공성 분쇄자.'
  },
  undead: {
    name: '언데드 네크로 군단',
    icon: '💀',
    desc: '처치되어도 부활하거나 독과 저주를 내뿜는 불사의 망자들.',
    weakness: '신성/빛',
    resistance: '암흑, 독',
    bossName: '사령대제 리치왕 말로크',
    bossDesc: '끊임없이 해골 군단을 소환하며 전장 전체에 즉사 오라를 방출.'
  },
  demon: {
    name: '지옥 데몬 군단',
    icon: '👿',
    desc: '막강한 마법 저항력과 화염 폭발을 일으키는 지옥의 악마들.',
    weakness: '빙결, 신성',
    resistance: '화염, 암흑',
    bossName: '심연의 마왕 벨리알',
    bossDesc: '성벽을 향해 거대한 헬파이어 브레스를 난사.'
  },
  dark_elf: {
    name: '다크엘프 & 암흑 야수',
    icon: '🧝',
    desc: '초장거리 치명타 화살과 은신 침투로 아군을 암살하는 부대.',
    weakness: '번개, 빛',
    resistance: '바람, 물리',
    bossName: '그림자 여왕 모르가나',
    bossDesc: '환영 분신을 다수 생성하고 성벽 위의 영웅들을 집중 저격.'
  },
  golem: {
    name: '고대 골렘 & 공성 거신',
    icon: '🗿',
    desc: '극도로 높은 체력과 단단한 방어력으로 성벽을 무너뜨리는 병기.',
    weakness: '바람, 번개, 화염',
    resistance: '대지, 물리',
    bossName: '고대 파멸의 거신 아틀라스',
    bossDesc: '거대한 바위 투척으로 성벽과 포탑에 치명적인 충격파.'
  },
  dragon: {
    name: '드래곤 킨 & 화룡 군단',
    icon: '🐲',
    desc: '하늘을 날며 지상을 불태우는 최강의 침략 종족.',
    weakness: '빙결, 번개',
    resistance: '화염, 대지, 물리',
    bossName: '멸망의 암흑룡 데스윙',
    bossDesc: '전장을 뒤덮는 묵시록 브레스로 성을 순식간에 잿더미로 만듦.'
  }
};
