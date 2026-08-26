/**
 * 게임 데이터베이스: 직업, 스킬, 아이템, 몬스터, 던전 시나리오
 */

// 1. 직업 데이터 (전사, 마법사, 탱커, 힐러 - 레벨별 스킬 해금 시스템)
const CLASSES_DATA = {
    warrior: {
        id: "warrior",
        name: "전사",
        title: "전장의 학살자",
        description: "강인한 근력과 파괴적인 물리 공격력으로 적의 전선을 분쇄하는 근접 딜러입니다.",
        icon: "⚔️",
        baseStats: {
            str: 16, // 근력
            dex: 12, // 민첩
            con: 14, // 체력
            int: 8,  // 지능
            wis: 10  // 지혜
        },
        maxHp: 120,
        maxMp: 40,
        startingEquipment: {
            weapon: "steel_sword",
            armor: "chain_mail",
            accessory: "warrior_ring"
        },
        skills: [
            {
                id: "heavy_strike",
                name: "강타",
                requiredLevel: 1,
                icon: "🗡️",
                mpCost: 8,
                cooldown: 0,
                desc: "무기에 체중을 실어 적에게 강력한 물리 피해를 입힙니다.",
                type: "single_attack",
                multiplier: 1.5,
                statBonus: "str",
                sound: "playSlash"
            },
            {
                id: "whirlwind",
                name: "회전 베기",
                requiredLevel: 2,
                icon: "🌪️",
                mpCost: 15,
                cooldown: 2,
                desc: "무기를 거세게 휘둘러 큰 피해를 입히고 적의 균형을 무너뜨립니다.",
                type: "single_attack",
                multiplier: 2.0,
                statBonus: "str",
                sound: "playSlash"
            },
            {
                id: "berserk_rage",
                name: "분노 폭발",
                requiredLevel: 3,
                icon: "🔥",
                mpCost: 20,
                cooldown: 3,
                desc: "내면의 분노를 개방하여 3턴 동안 공격력을 45% 증가시킵니다.",
                type: "buff",
                buffType: "atk_up",
                duration: 3,
                value: 0.45,
                sound: "playMagic"
            },
            {
                id: "blood_drain_strike",
                name: "흡혈의 일격",
                requiredLevel: 4,
                icon: "🩸",
                mpCost: 22,
                cooldown: 3,
                desc: "적의 혈맥을 베어 큰 피해를 입히고 가한 피해의 40%만큼 HP를 흡수합니다.",
                type: "lifesteal_attack",
                multiplier: 2.4,
                lifestealRate: 0.4,
                statBonus: "str",
                sound: "playSlash"
            },
            {
                id: "execute",
                name: "필살 참격",
                requiredLevel: 5,
                icon: "⚡",
                mpCost: 30,
                cooldown: 4,
                desc: "모든 기력을 칼끝에 모아 적의 급소를 갈라버리는 궁극의 참격입니다.",
                type: "single_attack",
                multiplier: 3.8,
                statBonus: "str",
                sound: "playSlash"
            }
        ]
    },
    mage: {
        id: "mage",
        name: "마법사",
        title: "비전의 탐구자",
        description: "비전 마나를 조율하여 강력한 원소 마법으로 적을 불태우고 파괴하는 주문 시전자입니다.",
        icon: "🔮",
        baseStats: {
            str: 7,
            dex: 11,
            con: 10,
            int: 17,
            wis: 14
        },
        maxHp: 80,
        maxMp: 90,
        startingEquipment: {
            weapon: "apprentice_wand",
            armor: "mage_robe",
            accessory: "mana_amulet"
        },
        skills: [
            {
                id: "fireball",
                name: "화염구",
                requiredLevel: 1,
                icon: "🔥",
                mpCost: 12,
                cooldown: 0,
                desc: "불꽃 덩어리를 소환하여 적에게 폭발적인 화염 피해를 가합니다.",
                type: "single_attack",
                multiplier: 1.6,
                statBonus: "int",
                sound: "playMagic"
            },
            {
                id: "frost_spike",
                name: "얼음 송곳",
                requiredLevel: 2,
                icon: "❄️",
                mpCost: 16,
                cooldown: 2,
                desc: "차가운 얼음 결정을 쏘아 보내 피해를 입히고 적의 공격력을 2턴간 30% 약화시킵니다.",
                type: "single_attack",
                multiplier: 1.9,
                statBonus: "int",
                debuffType: "atk_down",
                duration: 2,
                sound: "playMagic"
            },
            {
                id: "mana_shield",
                name: "마나 방벽",
                requiredLevel: 3,
                icon: "🛡️",
                mpCost: 20,
                cooldown: 3,
                desc: "마나로 이루어진 보호막을 생성하여 3턴 동안 받는 피해를 50% 흡수합니다.",
                type: "buff",
                buffType: "shield",
                duration: 3,
                value: 0.5,
                sound: "playHeal"
            },
            {
                id: "arcane_burst",
                name: "비전 마력 폭주",
                requiredLevel: 4,
                icon: "🌌",
                mpCost: 28,
                cooldown: 3,
                desc: "순수한 비전 에너지를 방출하여 적의 방어력을 50% 무시하고 관통 피해를 입힙니다.",
                type: "single_attack",
                multiplier: 2.6,
                ignoreDefRate: 0.5,
                statBonus: "int",
                sound: "playMagic"
            },
            {
                id: "lightning_storm",
                name: "번개 폭풍",
                requiredLevel: 5,
                icon: "⚡",
                mpCost: 40,
                cooldown: 4,
                desc: "하늘에서 파괴적인 벼락을 쏟아부어 압도적인 극대 마법 피해를 입힙니다.",
                type: "single_attack",
                multiplier: 4.0,
                statBonus: "int",
                sound: "playMagic"
            }
        ]
    },
    tank: {
        id: "tank",
        name: "탱커",
        title: "불굴의 수호자",
        description: "거대한 방패와 철벽같은 방어력으로 적의 맹공을 버텨내고 전장을 지배합니다.",
        icon: "🛡️",
        baseStats: {
            str: 14,
            dex: 9,
            con: 17,
            int: 8,
            wis: 12
        },
        maxHp: 150,
        maxMp: 45,
        startingEquipment: {
            weapon: "heavy_mace",
            armor: "plate_armor",
            accessory: "guardian_charm"
        },
        skills: [
            {
                id: "shield_bash",
                name: "방패 가격",
                requiredLevel: 1,
                icon: "🛡️",
                mpCost: 8,
                cooldown: 0,
                desc: "육중한 방패로 적을 쳐서 물리 피해를 주고 1턴 동안 기절시킵니다.",
                type: "single_attack",
                multiplier: 1.3,
                statBonus: "con",
                sound: "playShieldBlock"
            },
            {
                id: "taunt_roar",
                name: "도발의 포효",
                requiredLevel: 2,
                icon: "📢",
                mpCost: 12,
                cooldown: 2,
                desc: "우렁찬 함성으로 적의 평정을 잃게 만들고 자신의 방어력을 40% 상승시킵니다.",
                type: "buff",
                buffType: "def_up",
                duration: 3,
                value: 0.4,
                sound: "playShieldBlock"
            },
            {
                id: "iron_fortress",
                name: "철벽 방어",
                requiredLevel: 3,
                icon: "🏰",
                mpCost: 18,
                cooldown: 3,
                desc: "완벽한 방어 태세를 취하여 2턴 동안 받는 피해를 70% 감소시키고 일부를 반사합니다.",
                type: "buff",
                buffType: "damage_cut",
                duration: 2,
                value: 0.7,
                sound: "playShieldBlock"
            },
            {
                id: "vengeance_strike",
                name: "복수의 일격",
                requiredLevel: 4,
                icon: "⚔️",
                mpCost: 22,
                cooldown: 3,
                desc: "잃은 체력에 비례하여 위력이 증가하는 묵직한 반격을 가합니다.",
                type: "vengeance_attack",
                multiplier: 2.3,
                statBonus: "con",
                sound: "playSlash"
            },
            {
                id: "ground_slam",
                name: "대지 강타",
                requiredLevel: 5,
                icon: "🌋",
                mpCost: 28,
                cooldown: 4,
                desc: "지면을 세게 내리쳐 거대한 충격파를 일으키며 방어력 비례의 막대한 파괴를 가합니다.",
                type: "single_attack",
                multiplier: 3.5,
                statBonus: "con",
                sound: "playSlash"
            }
        ]
    },
    healer: {
        id: "healer",
        name: "힐러",
        title: "새벽빛 사제",
        description: "신성한 빛의 기도로 상처를 치유하고, 신성 마법으로 언데드와 악마를 퇴마합니다.",
        icon: "✨",
        baseStats: {
            str: 9,
            dex: 10,
            con: 13,
            int: 12,
            wis: 17
        },
        maxHp: 100,
        maxMp: 80,
        startingEquipment: {
            weapon: "holy_staff",
            armor: "cleric_vestment",
            accessory: "blessed_rosary"
        },
        skills: [
            {
                id: "heal_light",
                name: "치유의 빛",
                requiredLevel: 1,
                icon: "💚",
                mpCost: 14,
                cooldown: 0,
                desc: "신성한 빛을 불러일으켜 자신의 체력을 대폭 회복합니다.",
                type: "heal",
                multiplier: 1.8,
                statBonus: "wis",
                sound: "playHeal"
            },
            {
                id: "holy_smite",
                name: "신성한 강타",
                requiredLevel: 2,
                icon: "✝️",
                mpCost: 15,
                cooldown: 1,
                desc: "신성한 마력을 담은 빛의 철퇴로 적을 강타하여 피해를 입힙니다.",
                type: "single_attack",
                multiplier: 1.7,
                statBonus: "wis",
                sound: "playMagic"
            },
            {
                id: "divine_blessing",
                name: "축복의 기도",
                requiredLevel: 3,
                icon: "🌟",
                mpCost: 20,
                cooldown: 3,
                desc: "여신의 축복을 받아 3턴 동안 모든 능력치 보정치와 공격력을 30% 증가시킵니다.",
                type: "buff",
                buffType: "all_up",
                duration: 3,
                value: 0.3,
                sound: "playHeal"
            },
            {
                id: "purifying_flame",
                name: "정화의 성염",
                requiredLevel: 4,
                icon: "🕯️",
                mpCost: 25,
                cooldown: 3,
                desc: "모든 악을 태우는 성스러운 불꽃을 피워올려 피해를 입히고 자신의 마나를 25 회복합니다.",
                type: "mana_leech_attack",
                multiplier: 2.2,
                manaRestore: 25,
                statBonus: "wis",
                sound: "playMagic"
            },
            {
                id: "divine_wrath",
                name: "천벌",
                requiredLevel: 5,
                icon: "☀️",
                mpCost: 35,
                cooldown: 4,
                desc: "하늘의 태양빛을 모아 적에게 신성 정화 광선을 내리꽂아 괴멸적인 피해를 가합니다.",
                type: "single_attack",
                multiplier: 3.6,
                statBonus: "wis",
                sound: "playMagic"
            }
        ]
    }
};

// 특수 스킬북으로 습득 가능한 히든 스킬 데이터베이스
const EXTRA_SKILLS_DATA = {
    double_slash: {
        id: "double_slash",
        name: "연속 베기",
        icon: "⚔️",
        mpCost: 18,
        cooldown: 2,
        desc: "순식간에 2회의 날카로운 연속 참격을 가합니다.",
        type: "single_attack",
        multiplier: 2.5,
        statBonus: "str",
        sound: "playSlash"
    },
    meteor_strike: {
        id: "meteor_strike",
        name: "메테오 스트라이크",
        icon: "☄️",
        mpCost: 45,
        cooldown: 4,
        desc: "우주에서 거대한 운석을 낙하시켜 압도적인 멸망의 마법 피해를 입힙니다.",
        type: "single_attack",
        multiplier: 4.5,
        statBonus: "int",
        sound: "playMagic"
    },
    divine_barrier: {
        id: "divine_barrier",
        name: "성스러운 방벽",
        icon: "🛡️",
        mpCost: 25,
        cooldown: 4,
        desc: "빛의 결계를 둘러 2턴 동안 받는 모든 피해를 80% 무효화하고 체력을 회복합니다.",
        type: "buff",
        buffType: "damage_cut",
        duration: 2,
        value: 0.8,
        sound: "playHeal"
    },
    shadow_assassinate: {
        id: "shadow_assassinate",
        name: "그림자 암살",
        icon: "🗡️",
        mpCost: 26,
        cooldown: 3,
        desc: "그림자 속에서 적의 심장을 찔러 방어력을 무시하고 100% 치명타 일격을 가합니다.",
        type: "single_attack",
        multiplier: 3.2,
        ignoreDefRate: 0.7,
        statBonus: "dex",
        sound: "playSlash"
    }
};

// 2. 아이템 데이터베이스 (무기, 방어구, 장신구, 소비 아이템, 스탯북, 스킬북)
const ITEMS_DATA = {
    // [무기]
    steel_sword: {
        id: "steel_sword",
        name: "강철 롱소드",
        type: "weapon",
        rarity: "common",
        icon: "🗡️",
        stats: { atk: 12, str: 2 },
        price: 50,
        desc: "숙련된 대장장이가 벼려낸 단단한 강철검입니다."
    },
    apprentice_wand: {
        id: "apprentice_wand",
        name: "견습 마법봉",
        type: "weapon",
        rarity: "common",
        icon: "🪄",
        stats: { atk: 10, int: 2 },
        price: 50,
        desc: "마력 전도율이 우수한 떡갈나무로 깎아 만든 지팡이입니다."
    },
    heavy_mace: {
        id: "heavy_mace",
        name: "육중한 철퇴",
        type: "weapon",
        rarity: "common",
        icon: "🔨",
        stats: { atk: 11, con: 2 },
        price: 50,
        desc: "단단한 갑옷도 우그러뜨릴 수 있는 무거운 둔기입니다."
    },
    holy_staff: {
        id: "holy_staff",
        name: "사제의 목장",
        type: "weapon",
        rarity: "common",
        icon: "🦯",
        stats: { atk: 9, wis: 2 },
        price: 50,
        desc: "성수가 스며들어 은은한 성스러운 빛을 내뿜는 지팡이입니다."
    },
    flame_blade: {
        id: "flame_blade",
        name: "작열하는 업화의 검",
        type: "weapon",
        rarity: "rare",
        icon: "🔥",
        stats: { atk: 25, str: 4, dex: 2 },
        price: 180,
        desc: "칼날에 꺼지지 않는 지옥불이 깃들어 있는 보검입니다."
    },
    archmage_staff: {
        id: "archmage_staff",
        name: "대마법사의 에테르 지팡이",
        type: "weapon",
        rarity: "rare",
        icon: "🔮",
        stats: { atk: 24, int: 5, wis: 2 },
        price: 190,
        desc: "순수한 마나 결정이 박혀 있어 마법의 위력을 극대화합니다."
    },
    abyssal_reaper: {
        id: "abyssal_reaper",
        name: "심연의 처형검",
        type: "weapon",
        rarity: "epic",
        icon: "☠️",
        stats: { atk: 42, str: 7, dex: 4 },
        price: 450,
        desc: "심연의 군주의 영혼이 봉인된 전설의 파괴 무기입니다."
    },
    excalibur: {
        id: "excalibur",
        name: "성검 엑스칼리버",
        type: "weapon",
        rarity: "legendary",
        icon: "⚔️",
        stats: { atk: 58, str: 6, wis: 4, maxHp: 40 },
        price: 650,
        desc: "고대 전설의 황금빛 성검. 소지자에게 신성한 힘과 절대적인 파괴력을 부여합니다."
    },
    void_staff: {
        id: "void_staff",
        name: "공허의 파멸 지팡이",
        type: "weapon",
        rarity: "legendary",
        icon: "🌌",
        stats: { atk: 55, int: 8, maxMp: 50 },
        price: 650,
        desc: "공허의 정수를 응축한 궁극의 지팡이. 마법의 위력을 극대화합니다."
    },

    // [방어구]
    chain_mail: {
        id: "chain_mail",
        name: "사슬 갑옷",
        type: "armor",
        rarity: "common",
        icon: "🦺",
        stats: { def: 6, maxHp: 15 },
        price: 45,
        desc: "쇠사슬을 촘촘히 엮어 베기 공격에 강한 갑옷입니다."
    },
    mage_robe: {
        id: "mage_robe",
        name: "비전술사의 로브",
        type: "armor",
        rarity: "common",
        icon: "🥋",
        stats: { def: 3, maxMp: 20 },
        price: 45,
        desc: "마력의 흐름을 돕는 은실로 수놓은 로브입니다."
    },
    plate_armor: {
        id: "plate_armor",
        name: "중장 판금 갑옷",
        type: "armor",
        rarity: "common",
        icon: "🛡️",
        stats: { def: 10, maxHp: 25 },
        price: 55,
        desc: "전신을 두꺼운 강철판으로 감싼 육중한 갑옷입니다."
    },
    cleric_vestment: {
        id: "cleric_vestment",
        name: "축복받은 사제복",
        type: "armor",
        rarity: "common",
        icon: "🥻",
        stats: { def: 5, maxHp: 10, maxMp: 15 },
        price: 45,
        desc: "성스러운 가호가 깃들어 사악한 기운을 막아줍니다."
    },
    dragon_scale_mail: {
        id: "dragon_scale_mail",
        name: "용비늘 갑옷",
        type: "armor",
        rarity: "epic",
        icon: "🐉",
        stats: { def: 22, maxHp: 60, con: 4 },
        price: 400,
        desc: "화룡의 비늘로 만들어져 어떤 물리 및 화염 피해도 튕겨냅니다."
    },
    aegis_shield_armor: {
        id: "aegis_shield_armor",
        name: "이지스의 결계 갑옷",
        type: "armor",
        rarity: "legendary",
        icon: "🛡️",
        stats: { def: 32, maxHp: 100, con: 6 },
        price: 600,
        desc: "신들의 가호가 깃든 불침의 전설 판금 갑옷입니다."
    },

    // [장신구]
    warrior_ring: {
        id: "warrior_ring",
        name: "전사의 반지",
        type: "accessory",
        rarity: "common",
        icon: "💍",
        stats: { str: 1, atk: 2 },
        price: 30,
        desc: "근력을 조금 증강시켜주는 투박한 반지입니다."
    },
    mana_amulet: {
        id: "mana_amulet",
        name: "비전 아뮬렛",
        type: "accessory",
        rarity: "common",
        icon: "📿",
        stats: { int: 1, maxMp: 10 },
        price: 30,
        desc: "마나 회복을 도와주는 신비로운 목걸이입니다."
    },
    guardian_charm: {
        id: "guardian_charm",
        name: "수호의 부적",
        type: "accessory",
        rarity: "common",
        icon: "🧿",
        stats: { con: 1, def: 2 },
        price: 30,
        desc: "소지자의 신체를 단단하게 보호하는 부적입니다."
    },
    blessed_rosary: {
        id: "blessed_rosary",
        name: "축복의 묵주",
        type: "accessory",
        rarity: "common",
        icon: "📿",
        stats: { wis: 1, maxHp: 10 },
        price: 30,
        desc: "기도의 힘을 증폭시켜주는 묵주입니다."
    },
    vampiric_ring: {
        id: "vampiric_ring",
        name: "흡혈귀의 피반지",
        type: "accessory",
        rarity: "epic",
        icon: "🩸",
        stats: { atk: 8, str: 3, maxHp: 35 },
        price: 350,
        desc: "적의 생명력을 흡수하는 마력이 깃든 저주받은 반지입니다."
    },
    ring_of_kings: {
        id: "ring_of_kings",
        name: "고대 군주의 인장 반지",
        type: "accessory",
        rarity: "legendary",
        icon: "👑",
        stats: { str: 3, dex: 3, con: 3, int: 3, wis: 3, atk: 12, def: 8 },
        price: 700,
        desc: "고대 제국의 황제가 착용하던 모든 잠재력을 개방하는 반지입니다."
    },

    // [즉시 복용 포션 & 비약]
    hp_potion_small: {
        id: "hp_potion_small",
        name: "하급 체력 물약",
        type: "consumable",
        rarity: "common",
        icon: "🧪",
        healHp: 40,
        price: 20,
        desc: "체력을 40 회복합니다."
    },
    hp_potion_medium: {
        id: "hp_potion_medium",
        name: "중급 체력 물약",
        type: "consumable",
        rarity: "common",
        icon: "🍷",
        healHp: 75,
        price: 35,
        desc: "체력을 75 회복합니다."
    },
    hp_potion_large: {
        id: "hp_potion_large",
        name: "상급 체력 물약",
        type: "consumable",
        rarity: "rare",
        icon: "🍷",
        healHp: 120,
        price: 60,
        desc: "체력을 120 대량 회복합니다."
    },
    mp_potion_small: {
        id: "mp_potion_small",
        name: "하급 마나 물약",
        type: "consumable",
        rarity: "common",
        icon: "🧪",
        healMp: 30,
        price: 20,
        desc: "마나를 30 회복합니다."
    },
    mp_potion_medium: {
        id: "mp_potion_medium",
        name: "중급 마나 물약",
        type: "consumable",
        rarity: "common",
        icon: "🍶",
        healMp: 55,
        price: 35,
        desc: "마나를 55 회복합니다."
    },
    mp_potion_large: {
        id: "mp_potion_large",
        name: "상급 마나 물약",
        type: "consumable",
        rarity: "rare",
        icon: "🍶",
        healMp: 90,
        price: 60,
        desc: "마나를 90 대량 회복합니다."
    },
    elixir_of_life: {
        id: "elixir_of_life",
        name: "생명의 완벽한 엘릭서",
        type: "consumable",
        rarity: "epic",
        icon: "🏺",
        healHp: 999,
        healMp: 999,
        price: 150,
        desc: "즉시 체력과 마나를 100% 완전 회복합니다."
    },
    fire_scroll: {
        id: "fire_scroll",
        name: "화염 폭풍 주문서",
        type: "consumable",
        rarity: "rare",
        icon: "📜",
        combatEffect: { type: "damage", value: 75, sound: "playMagic" },
        price: 60,
        desc: "전투 중 사용하여 적에게 75의 강력한 화염 폭발 피해를 가합니다."
    },

    // [영구 스탯 북 (Stat Books)]
    tome_str: {
        id: "tome_str",
        name: "『근력의 비전서』",
        type: "stat_book",
        rarity: "rare",
        icon: "📕",
        statIncrease: { str: 1 },
        price: 110,
        desc: "복용/정독 시 영구적으로 [근력(STR) +1] 상승합니다."
    },
    tome_dex: {
        id: "tome_dex",
        name: "『민첩의 비서』",
        type: "stat_book",
        rarity: "rare",
        icon: "📗",
        statIncrease: { dex: 1 },
        price: 110,
        desc: "복용/정독 시 영구적으로 [민첩(DEX) +1] 상승합니다."
    },
    tome_con: {
        id: "tome_con",
        name: "『체력의 비전서』",
        type: "stat_book",
        rarity: "rare",
        icon: "📙",
        statIncrease: { con: 1, maxHp: 10 },
        price: 110,
        desc: "복용/정독 시 영구적으로 [체력(CON) +1, 최대 HP +10] 상승합니다."
    },
    tome_int: {
        id: "tome_int",
        name: "『비전의 마도서』",
        type: "stat_book",
        rarity: "rare",
        icon: "📘",
        statIncrease: { int: 1, maxMp: 10 },
        price: 110,
        desc: "복용/정독 시 영구적으로 [지능(INT) +1, 최대 MP +10] 상승합니다."
    },
    tome_wis: {
        id: "tome_wis",
        name: "『지혜의 경전』",
        type: "stat_book",
        rarity: "rare",
        icon: "📖",
        statIncrease: { wis: 1 },
        price: 110,
        desc: "복용/정독 시 영구적으로 [지혜(WIS) +1] 상승합니다."
    },
    tome_vitality: {
        id: "tome_vitality",
        name: "『생명의 고대 문서』",
        type: "stat_book",
        rarity: "epic",
        icon: "📜",
        statIncrease: { maxHp: 35 },
        price: 140,
        desc: "복용/정독 시 영구적으로 [최대 HP +35] 대폭 상승합니다."
    },
    tome_mana: {
        id: "tome_mana",
        name: "『마나의 고대 문서』",
        type: "stat_book",
        rarity: "epic",
        icon: "📜",
        statIncrease: { maxMp: 30 },
        price: 140,
        desc: "복용/정독 시 영구적으로 [최대 MP +30] 대폭 상승합니다."
    },

    // [신규 스킬북 (Skill Tomes)]
    skillbook_double_slash: {
        id: "skillbook_double_slash",
        name: "『스킬북: 연속 베기』",
        type: "skill_book",
        rarity: "epic",
        icon: "🎴",
        learnSkillId: "double_slash",
        price: 200,
        desc: "사용 시 강력한 2연타 물리 스킬 [연속 베기]를 영구 습득합니다."
    },
    skillbook_meteor: {
        id: "skillbook_meteor",
        name: "『스킬북: 메테오 스트라이크』",
        type: "skill_book",
        rarity: "epic",
        icon: "🎴",
        learnSkillId: "meteor_strike",
        price: 250,
        desc: "사용 시 운석을 낙하시키는 극대 마법 스킬 [메테오 스트라이크]를 영구 습득합니다."
    },
    skillbook_divine_barrier: {
        id: "skillbook_divine_barrier",
        name: "『스킬북: 성스러운 방벽』",
        type: "skill_book",
        rarity: "epic",
        icon: "🎴",
        learnSkillId: "divine_barrier",
        price: 200,
        desc: "사용 시 피해를 80% 감소시키는 방어 스킬 [성스러운 방벽]을 영구 습득합니다."
    },
    skillbook_shadow_assassinate: {
        id: "skillbook_shadow_assassinate",
        name: "『스킬북: 그림자 암살』",
        type: "skill_book",
        rarity: "epic",
        icon: "🎴",
        learnSkillId: "shadow_assassinate",
        price: 220,
        desc: "사용 시 적의 방어력을 70% 무시하는 치명타 스킬 [그림자 암살]을 영구 습득합니다."
    }
};

// 3. 몬스터 데이터베이스 (구역별)
const MONSTERS_DATA = {
    // Chapter 1: 지하 납골당
    crypt_skeleton: {
        id: "crypt_skeleton",
        name: "해골 전사",
        icon: "💀",
        maxHp: 55,
        atk: 14,
        def: 3,
        spd: 10,
        exp: 30,
        gold: 25,
        loot: ["hp_potion_small", "steel_sword"],
        skills: [
            { name: "녹슨 칼날 베기", multiplier: 1.2, desc: "녹슨 검으로 베어냅니다." },
            { name: "뼈마디 찌르기", multiplier: 1.5, desc: "뼈를 곤두세워 찌릅니다." }
        ]
    },
    crypt_ghoul: {
        id: "crypt_ghoul",
        name: "굶주린 구울",
        icon: "🧟",
        maxHp: 70,
        atk: 16,
        def: 4,
        spd: 12,
        exp: 40,
        gold: 35,
        loot: ["hp_potion_small", "mp_potion_small"],
        skills: [
            { name: "살점 뜯기", multiplier: 1.4, desc: "흉포하게 물어뜯어 출혈을 유발합니다." }
        ]
    },
    crypt_tomb_robber: {
        id: "crypt_tomb_robber",
        name: "음흉한 도굴꾼",
        icon: "🦹",
        maxHp: 60,
        atk: 18,
        def: 2,
        spd: 14,
        exp: 45,
        gold: 60,
        loot: ["fire_scroll", "warrior_ring"],
        skills: [
            { name: "단도 투척", multiplier: 1.3, desc: "독이 묻은 단도를 던집니다." },
            { name: "모래 뿌리기", multiplier: 0.8, desc: "시야를 가려 명중률을 떨어뜨립니다." }
        ]
    },
    boss_necromancer: {
        id: "boss_necromancer",
        name: "사령술사 모르가스",
        title: "[Chapter 1 보스]",
        isBoss: true,
        icon: "🧙‍♂️",
        maxHp: 160,
        atk: 22,
        def: 6,
        spd: 13,
        exp: 150,
        gold: 150,
        loot: ["archmage_staff", "hp_potion_large", "mana_amulet"],
        skills: [
            { name: "암흑의 손길", multiplier: 1.4, desc: "검은 영혼의 손길로 생명력을 갉아먹습니다." },
            { name: "시체 폭발", multiplier: 2.2, desc: "시체를 폭파시켜 거대한 암흑 충격을 일으킵니다." },
            { name: "망자의 결계", multiplier: 0, desc: "암흑 방어막을 둘러 방어력을 올립니다." }
        ]
    },

    // Chapter 2: 유황 광산
    mine_gargoyle: {
        id: "mine_gargoyle",
        name: "흑요석 가고일",
        icon: "🗿",
        maxHp: 110,
        atk: 24,
        def: 12,
        spd: 9,
        exp: 80,
        gold: 70,
        loot: ["heavy_mace", "hp_potion_large"],
        skills: [
            { name: "석화의 발톱", multiplier: 1.3, desc: "단단한 발톱으로 내려칩니다." },
            { name: "초음파 비명", multiplier: 1.6, desc: "고막을 찢는 비명으로 혼란을 줍니다." }
        ]
    },
    mine_fire_elemental: {
        id: "mine_fire_elemental",
        name: "화염 정령",
        icon: "🔥",
        maxHp: 95,
        atk: 28,
        def: 5,
        spd: 15,
        exp: 95,
        gold: 85,
        loot: ["fire_scroll", "flame_blade"],
        skills: [
            { name: "화염 폭발", multiplier: 1.5, desc: "맹렬한 화염을 뿜어냅니다." },
            { name: "열기 방출", multiplier: 1.8, desc: "주변의 산소를 태우며 폭발합니다." }
        ]
    },
    boss_lava_golem: {
        id: "boss_lava_golem",
        name: "용암 군주 이그니스",
        title: "[Chapter 2 보스]",
        isBoss: true,
        icon: "👹",
        maxHp: 280,
        atk: 34,
        def: 15,
        spd: 8,
        exp: 300,
        gold: 300,
        loot: ["dragon_scale_mail", "flame_blade", "hp_potion_large"],
        skills: [
            { name: "용암 분출", multiplier: 1.8, desc: "발밑에서 끓어오르는 용암을 솟구치게 합니다." },
            { name: "대격진", multiplier: 2.5, desc: "동굴 전체를 뒤흔드는 파괴적인 지진을 일으킵니다." }
        ]
    },

    // Chapter 3: 몰락한 알현실
    royal_fallen_knight: {
        id: "royal_fallen_knight",
        name: "타락한 근위기사",
        icon: "🛡️",
        maxHp: 160,
        atk: 36,
        def: 16,
        spd: 12,
        exp: 140,
        gold: 120,
        loot: ["abyssal_reaper", "plate_armor"],
        skills: [
            { name: "암흑 베기", multiplier: 1.5, desc: "저주받은 검기를 날립니다." },
            { name: "방패 돌진", multiplier: 1.7, desc: "육중한 방패로 들이받습니다." }
        ]
    },
    void_wraith: {
        id: "void_wraith",
        name: "공허의 망령",
        icon: "👻",
        maxHp: 140,
        atk: 42,
        def: 8,
        spd: 17,
        exp: 160,
        gold: 140,
        loot: ["mp_potion_large", "ring_of_kings"],
        skills: [
            { name: "영혼 갈취", multiplier: 1.6, desc: "플레이어의 영혼을 흡수하여 회복합니다." },
            { name: "공허의 절규", multiplier: 2.0, desc: "정신을 파괴하는 공허의 파동을 방출합니다." }
        ]
    },
    boss_tyrant_kael: {
        id: "boss_tyrant_kael",
        name: "불멸의 폭군 카엘",
        title: "[최종 보스]",
        isBoss: true,
        icon: "👑",
        maxHp: 480,
        atk: 48,
        def: 20,
        spd: 14,
        exp: 1000,
        gold: 1000,
        loot: ["ring_of_kings", "abyssal_reaper", "dragon_scale_mail"],
        skills: [
            { name: "폭군의 심판", multiplier: 1.8, desc: "붉은 번개를 내리쳐 처벌합니다." },
            { name: "심연의 묵시록", multiplier: 2.8, desc: "공간을 찢고 심연의 암흑 물질을 낙하시킵니다." },
            { name: "불멸의 피", multiplier: 0, desc: "어둠의 의식으로 자신의 체력을 50 회복합니다." }
        ]
    }
};

// 4. 챕터 및 던전 노드 시나리오 데이터 (영구 스탯 성장 사건 대폭 추가)
const CHAPTERS_DATA = [
    {
        id: 1,
        name: "Chapter 1: 잊혀진 지하 납골당 (The Forgotten Crypts)",
        theme: "어둡고 습한 고대 영묘. 차가운 석벽 사이로 촛불이 일렁이며 해골들의 바스락거림이 들려옵니다.",
        background: "crypt",
        bossId: "boss_necromancer",
        nodes: [
            {
                id: "1-1",
                title: "납골당 입구",
                type: "story",
                desc: "무거운 석문을 열자 썩은 냄새와 냉기가 뺨을 스칩니다. 부서진 석관들 사이로 바스락거리는 소리가 들려옵니다.",
                choices: [
                    {
                        text: "조심스럽게 횃불을 밝히며 그림자를 밟고 전진한다. (DEX 판정 DC 10)",
                        type: "dice_check",
                        stat: "dex",
                        dc: 10,
                        reason: "은밀한 잠입",
                        successText: "소리 없이 그림자 사이를 통과하여 유리한 위치를 선점했습니다! (+15 EXP)",
                        successEffect: { exp: 15 },
                        failText: "발밑의 해골을 밟아 부러뜨리는 바람에 적들의 이목을 끌었습니다!",
                        nextNode: "1-2"
                    },
                    {
                        text: "무기를 뽑아 들고 당당하게 문을 박차고 들어간다.",
                        type: "direct",
                        desc: "당신의 거친 진입에 지하의 망자들이 일제히 고개를 돌립니다!",
                        nextNode: "1-2"
                    }
                ]
            },
            {
                id: "1-2",
                title: "망자들의 안식처",
                type: "combat",
                monsterId: "crypt_skeleton",
                desc: "녹슨 검을 든 해골 전사가 턱뼈를 딱딱거리며 당신을 향해 돌진합니다!",
                nextNode: "1-3"
            },
            {
                id: "1-3",
                title: "고대 투사의 훈련 석실",
                type: "event",
                desc: "벽면에 고대 검투사들의 무예 비급과 무거운 강철 역기가 놓여 있습니다. 또한 한쪽에는 마력의 흐름을 정돈하는 명상석이 자리잡고 있습니다.",
                choices: [
                    {
                        text: "무거운 거대 철퇴를 들어올리며 근력 한계 훈련을 한다. (STR 판정 DC 12)",
                        type: "dice_check",
                        stat: "str",
                        dc: 12,
                        reason: "근력 한계 훈련",
                        successEffect: { statIncrease: { str: 1 }, text: "근육의 한계를 돌파했습니다! ⚔️ [영구 근력(STR) +1] 상승!" },
                        failEffect: { damage: 10, text: "무리한 훈련으로 근육이 파열되었습니다. (-10 HP)" },
                        nextNode: "1-4"
                    },
                    {
                        text: "신비로운 푸른 명상석에 앉아 정신을 집중한다. (WIS 판정 DC 11)",
                        type: "dice_check",
                        stat: "wis",
                        dc: 11,
                        reason: "정신 집중 명상",
                        successEffect: { statIncrease: { wis: 1, maxMp: 10 }, text: "정신이 맑아지며 지혜가 샘솟습니다! 🔮 [영구 지혜(WIS) +1, 최대 MP +10] 상승!" },
                        failEffect: { text: "잡념이 많아 명상에 집중하지 못했습니다." },
                        nextNode: "1-4"
                    },
                    {
                        text: "시간을 낭비하지 않고 다음 방으로 이동한다.",
                        type: "direct",
                        desc: "훈련장을 지나쳐 전진합니다.",
                        nextNode: "1-4"
                    }
                ]
            },
            {
                id: "1-4",
                title: "피 흘리는 여신의 제단",
                type: "event",
                desc: "어두운 방 한구석에 피로 물든 고대 여신의 석상이 서 있습니다. 제단 위에는 신비로운 푸른 보석이 놓여 있습니다.",
                choices: [
                    {
                        text: "제단에 무릎 꿇고 경건하게 기도를 올린다. (WIS 판정 DC 11)",
                        type: "dice_check",
                        stat: "wis",
                        dc: 11,
                        reason: "신성한 감응",
                        successEffect: { healHp: 60, healMp: 40, statIncrease: { con: 1 }, text: "여신의 따스한 은총이 상처를 치유하고 신체를 축복합니다! (+60 HP, +40 MP, 💖 [영구 체력(CON) +1])" },
                        failEffect: { damage: 15, text: "신성모독의 기운이 석상에서 뿜어져 나와 벼락처럼 당신을 내리칩니다! (-15 HP)" },
                        nextNode: "1-5"
                    },
                    {
                        text: "제단의 보석을 강제로 떼어내 챙긴다. (STR 판정 DC 13)",
                        type: "dice_check",
                        stat: "str",
                        dc: 13,
                        reason: "보석 강탈",
                        successEffect: { gold: 90, text: "힘으로 보석을 떼어냈습니다! 값비싼 푸른 보석을 손에 넣었습니다 (+90 골드)." },
                        failEffect: { damage: 20, text: "함정이 발동하여 독화살이 발사되었습니다! (-20 HP)" },
                        nextNode: "1-5"
                    }
                ]
            },
            {
                id: "1-5",
                title: "지하 묘지의 갈림길",
                type: "choice_branch",
                desc: "통로가 두 갈래로 나뉩니다. 왼쪽에서는 날카로운 기계 장치의 째깍거림이, 오른쪽에서는 의문의 모닥불 빛과 주사위 굴리는 소리가 들려옵니다.",
                choices: [
                    {
                        text: "왼쪽 통로로 진입한다 (도적의 함정 훈련소).",
                        type: "branch",
                        targetNode: "1-6a"
                    },
                    {
                        text: "오른쪽 통로로 진입한다 (방랑 암상인의 야영지).",
                        type: "branch",
                        targetNode: "1-6b"
                    }
                ]
            },
            {
                id: "1-6a",
                title: "도적 길드의 비밀 함정실",
                type: "event",
                desc: "복잡한 와이어와 회전 칼날 함정이 방 전체에 설치되어 있습니다. 가장 안쪽에는 보물 상자가 빛나고 있습니다.",
                choices: [
                    {
                        text: "칼날 사이의 사각지대를 파악하여 민첩하게 통과한다. (DEX 판정 DC 13)",
                        type: "dice_check",
                        stat: "dex",
                        dc: 13,
                        reason: "함정 해체 및 곡예",
                        successEffect: { statIncrease: { dex: 1 }, gold: 70, addItem: "warrior_ring", text: "신기에 가까운 몸놀림으로 함정을 통과했습니다! 🏃 [영구 민첩(DEX) +1], 70 골드, 보물 획득!" },
                        failEffect: { damage: 25, text: "회전 칼날에 스쳐 깊은 상처를 입었습니다! (-25 HP)" },
                        nextNode: "1-7"
                    },
                    {
                        text: "안전을 위해 우회하여 조심스럽게 지나간다.",
                        type: "direct",
                        desc: "함정을 건드리지 않고 조심스럽게 방을 빠져나갑니다.",
                        nextNode: "1-7"
                    }
                ]
            },
            {
                id: "1-6b",
                title: "비밀 암상인의 야영지",
                type: "merchant",
                desc: "두건을 깊게 눌러쓴 떠돌이 상인이 모닥불 곁에서 귀한 비전서와 강력한 물약들을 늘어놓고 있습니다.",
                itemsForSale: [
                    "hp_potion_medium",
                    "mp_potion_medium",
                    "elixir_of_life",
                    "tome_str",
                    "tome_dex",
                    "skillbook_double_slash",
                    "flame_blade",
                    "fire_scroll",
                    "guardian_charm"
                ],
                nextNode: "1-7"
            },
            {
                id: "1-7",
                title: "구울의 연회장",
                type: "combat",
                monsterId: "crypt_ghoul",
                desc: "신선한 살점을 뜯어먹던 굶주린 구울이 당신을 보자 피눈물을 흘리며 덤벼듭니다!",
                nextNode: "1-8"
            },
            {
                id: "1-8",
                title: "사령술사의 의식실 (Chapter 1 보스전)",
                type: "combat",
                monsterId: "boss_necromancer",
                desc: "거대한 해골 옥좌 위에서 사령술사 모르가스가 암흑의 주문을 외우며 일어섭니다!",
                nextNode: "chapter_complete"
            }
        ]
    },
    {
        id: 2,
        name: "Chapter 2: 심연의 유황 광산 (The Abyssal Brimstone Mines)",
        theme: "유황 냄새가 코를 찌르고 발밑으로 붉은 용암이 흐르는 지하 대광산입니다.",
        background: "mines",
        bossId: "boss_lava_golem",
        nodes: [
            {
                id: "2-1",
                title: "무너진 광산 갱도",
                type: "story",
                desc: "열기가 피부를 태울 듯 뜨겁습니다. 좁은 협곡 다리 건너편에 날개 달린 거대한 석상이 도사리고 있습니다.",
                choices: [
                    {
                        text: "무너지는 흔들다리를 신속하게 건넌다. (DEX 판정 DC 12)",
                        type: "dice_check",
                        stat: "dex",
                        dc: 12,
                        reason: "위태로운 도하",
                        successText: "민첩한 몸놀림으로 무사히 협곡을 건넜습니다! (+20 EXP)",
                        successEffect: { exp: 20 },
                        failEffect: { damage: 25, text: "다리 발판이 무너지며 용암 파편이 튀어 화상을 입었습니다! (-25 HP)" },
                        nextNode: "2-2"
                    }
                ]
            },
            {
                id: "2-2",
                title: "흑요석 절벽",
                type: "combat",
                monsterId: "mine_gargoyle",
                desc: "살아 움직이는 흑요석 가고일이 날카로운 비명과 함께 하늘에서 강하합니다!",
                nextNode: "2-3"
            },
            {
                id: "2-3",
                title: "고대 드워프의 용암 대장간",
                type: "event",
                desc: "끓어오르는 용암 풀 옆에 고대 드워프 대장장이의 불타는 모루와 담금질 수조가 남아 있습니다.",
                choices: [
                    {
                        text: "뜨거운 화염의 열기를 온몸으로 받아내며 신체를 단련한다. (CON 판정 DC 13)",
                        type: "dice_check",
                        stat: "con",
                        dc: 13,
                        reason: "화염 담금질 육체 단련",
                        successEffect: { statIncrease: { con: 1, maxHp: 25 }, text: "용암의 열기를 극복하여 강철같은 육체를 얻었습니다! 🛡️ [영구 체력(CON) +1, 최대 HP +25] 상승!" },
                        failEffect: { damage: 30, text: "지나친 열기에 심한 화상을 입었습니다! (-30 HP)" },
                        nextNode: "2-4"
                    },
                    {
                        text: "모루의 불꽃을 이용해 자신이 쥔 무기를 다시 벼린다. (STR 판정 DC 14)",
                        type: "dice_check",
                        stat: "str",
                        dc: 14,
                        reason: "무기 강화 벼림",
                        successEffect: { statIncrease: { str: 1 }, text: "칼날이 더욱 날카롭고 단단해졌습니다! ⚔️ [영구 근력(STR) +1] 상승!" },
                        failEffect: { damage: 15, text: "불티가 튀어 가벼운 화상을 입었습니다. (-15 HP)" },
                        nextNode: "2-4"
                    }
                ]
            },
            {
                id: "2-4",
                title: "광부들의 폐쇄된 비전 금고",
                type: "event",
                desc: "용암에 녹아내린 강철 금고가 단단히 잠겨 있습니다. 복잡한 고대 마법 룬 문자가 새겨져 있습니다.",
                choices: [
                    {
                        text: "마법 룬 문자의 공식을 심도있게 해독한다. (INT 판정 DC 13)",
                        type: "dice_check",
                        stat: "int",
                        dc: 13,
                        reason: "비전 룬 해독",
                        successEffect: { statIncrease: { int: 1 }, gold: 140, addItem: "dragon_scale_mail", text: "룬의 비밀을 완전히 깨달았습니다! 🧠 [영구 지능(INT) +1], [용비늘 갑옷], 140 골드 획득!" },
                        failEffect: { damage: 30, text: "룬의 마력 폭주로 폭발이 일어났습니다! (-30 HP)" },
                        nextNode: "2-5"
                    },
                    {
                        text: "철퇴와 순수 완력으로 금고 경첩을 내리친다. (STR 판정 DC 15)",
                        type: "dice_check",
                        stat: "str",
                        dc: 15,
                        reason: "금고 파괴",
                        successEffect: { gold: 120, addItem: "hp_potion_large", text: "괴력으로 금고를 박살냈습니다! 골드와 상급 물약을 획득했습니다." },
                        failEffect: { damage: 20, text: "금고 반동으로 손목을 다쳤습니다. (-20 HP)" },
                        nextNode: "2-5"
                    }
                ]
            },
            {
                id: "2-5",
                title: "화염의 용광로",
                type: "combat",
                monsterId: "mine_fire_elemental",
                desc: "끓어오르는 용암 속에서 순수한 불꽃의 정령이 솟구쳐 오릅니다!",
                nextNode: "2-6"
            },
            {
                id: "2-6",
                title: "지하 광산 암상인의 비밀 거래소",
                type: "merchant",
                desc: "광산 깊숙한 곳에서 특수 비전서와 상급 장비를 밀거래하는 상인을 발견했습니다.",
                itemsForSale: [
                    "hp_potion_large",
                    "mp_potion_large",
                    "elixir_of_life",
                    "tome_con",
                    "tome_int",
                    "tome_wis",
                    "skillbook_meteor",
                    "skillbook_divine_barrier",
                    "archmage_staff",
                    "dragon_scale_mail"
                ],
                nextNode: "2-7"
            },
            {
                id: "2-7",
                title: "용암 군주의 심장부 (Chapter 2 보스전)",
                type: "combat",
                monsterId: "boss_lava_golem",
                desc: "거대한 용암 바위들이 뭉쳐지며 용암 군주 이그니스가 지축을 울리며 포효합니다!",
                nextNode: "chapter_complete"
            }
        ]
    },
    {
        id: 3,
        name: "Chapter 3: 몰락한 왕의 알현실 (The Fallen Sovereign's Throne)",
        theme: "피와 공허로 물든 웅장한 황실의 잔해. 불멸의 폭군 카엘이 심연의 왕좌에서 당신을 내려다봅니다.",
        background: "throne",
        bossId: "boss_tyrant_kael",
        nodes: [
            {
                id: "3-1",
                title: "부서진 옥좌의 회랑",
                type: "story",
                desc: "과거 찬란했던 제국의 회랑이 지금은 암흑의 안개로 뒤덮여 있습니다. 타락한 기사들이 길을 막아섭니다.",
                choices: [
                    {
                        text: "기사의 명예를 걸고 정면 결투를 신청한다.",
                        type: "direct",
                        desc: "타락한 근위기사가 검을 겨누며 응수합니다!",
                        nextNode: "3-2"
                    }
                ]
            },
            {
                id: "3-2",
                title: "피의 결투장",
                type: "combat",
                monsterId: "royal_fallen_knight",
                desc: "타락한 근위기사가 검붉은 검기를 뿜어내며 베어옵니다!",
                nextNode: "3-3"
            },
            {
                id: "3-3",
                title: "공허의 거울과 각성의 제단",
                type: "event",
                desc: "공허의 차원을 비추는 거대한 거울이 놓여 있습니다. 거울 속에서 당신의 과거와 내면의 공포가 형상화됩니다.",
                choices: [
                    {
                        text: "흔들리지 않는 영혼으로 공포를 극복하고 진정한 잠재력을 각성한다. (WIS 판정 DC 14)",
                        type: "dice_check",
                        stat: "wis",
                        dc: 14,
                        reason: "영혼의 초월 각성",
                        successEffect: { healHp: 100, healMp: 80, statIncrease: { str: 1, dex: 1, con: 1, int: 1, wis: 1 }, addItem: "ring_of_kings", text: "시련을 이겨내고 영웅의 진정한 자아를 각성했습니다! 👑 [모든 스탯 +1 영구 상승!], [고대 군주의 인장 반지] 획득!" },
                        failEffect: { damage: 40, text: "악몽의 공포가 영혼을 갉아먹습니다! (-40 HP)" },
                        nextNode: "3-4"
                    },
                    {
                        text: "거울을 깨부수고 환영을 물리적으로 파괴한다. (STR 판정 DC 15)",
                        type: "dice_check",
                        stat: "str",
                        dc: 15,
                        reason: "공허의 거울 분쇄",
                        successEffect: { statIncrease: { str: 2 }, text: "거울을 박살내며 파괴적인 패기를 체득했습니다! 💥 [영구 근력(STR) +2] 상승!" },
                        failEffect: { damage: 30, text: "유리 파편이 튀어 상처를 입었습니다. (-30 HP)" },
                        nextNode: "3-4"
                    }
                ]
            },
            {
                id: "3-4",
                title: "공허의 틈새",
                type: "combat",
                monsterId: "void_wraith",
                desc: "공허의 망령이 영혼을 찢는 비명을 지르며 공간을 왜곡합니다!",
                nextNode: "3-5"
            },
            {
                id: "3-5",
                title: "최후의 황실 비밀 보물상인의 야영지",
                type: "merchant",
                desc: "불멸의 폭군 카엘과의 결전 직전, 전설의 유물과 고대 문서들을 취급하는 궁정 상인을 만났습니다.",
                itemsForSale: [
                    "elixir_of_life",
                    "tome_vitality",
                    "tome_mana",
                    "skillbook_shadow_assassinate",
                    "excalibur",
                    "void_staff",
                    "aegis_shield_armor",
                    "vampiric_ring"
                ],
                nextNode: "3-6"
            },
            {
                id: "3-6",
                title: "불멸의 폭군 카엘의 왕좌 (최종 결전)",
                type: "combat",
                monsterId: "boss_tyrant_kael",
                desc: "심연의 왕관을 쓴 불멸의 폭군 카엘이 심연의 대검을 뽑아들고 왕좌에서 내려옵니다. 세계의 운명이 걸린 마지막 결투입니다!",
                nextNode: "game_victory"
            }
        ]
    }
];

window.CLASSES_DATA = CLASSES_DATA;
window.EXTRA_SKILLS_DATA = EXTRA_SKILLS_DATA;
window.ITEMS_DATA = ITEMS_DATA;
window.MONSTERS_DATA = MONSTERS_DATA;
window.CHAPTERS_DATA = CHAPTERS_DATA;


