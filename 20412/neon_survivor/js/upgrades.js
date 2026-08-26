// ============================================================================
// NEON SURVIVOR: OVERDRIVE - Upgrades, Passives & Card Generation
// ============================================================================

const PASSIVE_ITEMS = {
    overcharge_core: {
        id: 'overcharge_core',
        name: 'Overcharge Core',
        koreanName: '초전도 과부하 코어',
        description: '치명타 확률 +8% 및 치명타 피해량이 대폭 증가합니다.',
        icon: '🎯',
        color: '#ffea00',
        maxLevel: 5,
        synergyWeapon: 'plasma_blaster',
        apply: (player, level) => {
            player.critChance = 0.05 + level * 0.08;
            player.critMultiplier = 1.5 + level * 0.25;
        }
    },
    repulsor_field: {
        id: 'repulsor_field',
        name: 'Repulsor Field',
        koreanName: '척력 확장 필드',
        description: '모든 무기의 공격 범위와 투사체 크기가 +18% 증가합니다.',
        icon: '📡',
        color: '#bd00ff',
        maxLevel: 5,
        synergyWeapon: 'orbital_saber',
        apply: (player, level) => {
            player.areaMultiplier = 1.0 + level * 0.18;
        }
    },
    flux_capacitors: {
        id: 'flux_capacitors',
        name: 'Flux Capacitor',
        koreanName: '플럭스 출력 증폭기',
        description: '모든 무기의 기본 공격력이 +15% 증가합니다.',
        icon: '💥',
        color: '#ff0055',
        maxLevel: 5,
        synergyWeapon: 'thunder_arc',
        apply: (player, level) => {
            player.damageMultiplier = 1.0 + level * 0.15;
        }
    },
    turbo_thrusters: {
        id: 'turbo_thrusters',
        name: 'Turbo Thrusters',
        koreanName: '하이퍼 부스터 엔진',
        description: '이동 속도 +14% 및 대시 쿨다운이 -15% 감소합니다.',
        icon: '🚀',
        color: '#ff6600',
        maxLevel: 5,
        synergyWeapon: 'cluster_missiles',
        apply: (player, level) => {
            player.moveSpeedMultiplier = 1.0 + level * 0.14;
            player.dashCooldownMultiplier = Math.max(0.4, 1.0 - level * 0.12);
        }
    },
    nanite_repair: {
        id: 'nanite_repair',
        name: 'Nanite Repair Bot',
        koreanName: '나노봇 자가 수리계',
        description: '초당 체력 재생 +1.8 HP/s 및 최대 체력 +25 증가.',
        icon: '💚',
        color: '#00ff88',
        maxLevel: 5,
        synergyWeapon: 'vortex_singularity',
        apply: (player, level) => {
            player.hpRegen = level * 1.8;
            player.maxHp = 100 + level * 25;
        }
    },
    chrono_matrix: {
        id: 'chrono_matrix',
        name: 'Chrono Matrix',
        koreanName: '시공간 가속 코어',
        description: '모든 무기의 쿨다운이 -9% 단축됩니다.',
        icon: '⏳',
        color: '#00e5ff',
        maxLevel: 5,
        synergyWeapon: 'emp_nova',
        apply: (player, level) => {
            player.cooldownMultiplier = Math.max(0.45, 1.0 - level * 0.09);
        }
    },
    energy_shield: {
        id: 'energy_shield',
        name: 'Aegis Shield Generator',
        koreanName: '이지스 방어막 생성기',
        description: '피해를 먼저 흡수하고 자동 충전되는 보호막을 생성합니다.',
        icon: '🛡️',
        color: '#3b82f6',
        maxLevel: 5,
        synergyWeapon: null,
        apply: (player, level) => {
            player.maxShield = level * 35;
            player.shieldRegenRate = 5 + level * 3;
        }
    },
    quantum_magnet: {
        id: 'quantum_magnet',
        name: 'Graviton Magnet',
        koreanName: '중력자 아이템 흡수기',
        description: '경험치 보석 및 아이템 자석 흡수 반경이 +45% 증가합니다.',
        icon: '🧲',
        color: '#ec4899',
        maxLevel: 5,
        synergyWeapon: null,
        apply: (player, level) => {
            player.magnetMultiplier = 1.0 + level * 0.45;
        }
    }
};

class UpgradeManager {
    constructor() {
        this.rerollsRemaining = 3;
    }

    reset() {
        this.rerollsRemaining = 3;
    }

    generateChoices(player, count = 3) {
        const choices = [];

        // 1. Check for Weapon Evolutions first!
        for (const [weaponId, weapon] of player.weapons.entries()) {
            if (weapon.level >= weapon.maxLevel && !weapon.isEvolved) {
                // Check if player owns required passive
                if (weapon.requiredPassive && player.passives.has(weapon.requiredPassive)) {
                    choices.push({
                        type: 'evolution',
                        weaponId: weaponId,
                        weapon: weapon,
                        rarity: 'evolution',
                        name: weapon.evolvedKoreanName,
                        engName: weapon.evolvedName,
                        icon: weapon.icon,
                        description: `[초월 각성] ${weapon.evolvedDescription}`,
                        badge: 'SUPER EVOLUTION',
                        color: '#ffd700'
                    });
                }
            }
        }

        const candidatePool = [];

        // 2. Existing weapon upgrades
        for (const [weaponId, weapon] of player.weapons.entries()) {
            if (weapon.level < weapon.maxLevel && !weapon.isEvolved) {
                candidatePool.push({
                    type: 'weapon_upgrade',
                    weaponId: weaponId,
                    weapon: weapon,
                    rarity: weapon.level >= 6 ? 'epic' : (weapon.level >= 3 ? 'rare' : 'common'),
                    name: `${weapon.koreanName} Lv.${weapon.level + 1}`,
                    engName: weapon.name,
                    icon: weapon.icon,
                    description: `공격력 및 탄환 수 증가, 쿨다운 감소`,
                    badge: `LV.${weapon.level} ➔ LV.${weapon.level + 1}`,
                    color: weapon.color
                });
            }
        }

        // 3. New weapon unlocks (if slots available, max 4 weapons)
        if (player.weapons.size < 4) {
            for (const weaponKey in window.WEAPON_CLASSES) {
                if (!player.weapons.has(weaponKey)) {
                    const temp = new window.WEAPON_CLASSES[weaponKey](player);
                    candidatePool.push({
                        type: 'new_weapon',
                        weaponKey: weaponKey,
                        rarity: 'epic',
                        name: `신규 무기: ${temp.koreanName}`,
                        engName: temp.name,
                        icon: temp.icon,
                        description: temp.description,
                        badge: 'NEW WEAPON',
                        color: temp.color
                    });
                }
            }
        }

        // 4. Passive upgrades & unlocks (max 4 passives)
        for (const passiveKey in PASSIVE_ITEMS) {
            const pInfo = PASSIVE_ITEMS[passiveKey];
            const currentLevel = player.passives.get(passiveKey) || 0;

            if (currentLevel === 0 && player.passives.size < 4) {
                // New passive
                candidatePool.push({
                    type: 'new_passive',
                    passiveKey: passiveKey,
                    rarity: 'rare',
                    name: `신규 패시브: ${pInfo.koreanName}`,
                    engName: pInfo.name,
                    icon: pInfo.icon,
                    description: pInfo.description,
                    badge: 'NEW PASSIVE',
                    color: pInfo.color
                });
            } else if (currentLevel > 0 && currentLevel < pInfo.maxLevel) {
                // Upgrade passive
                candidatePool.push({
                    type: 'passive_upgrade',
                    passiveKey: passiveKey,
                    rarity: currentLevel >= 3 ? 'epic' : 'rare',
                    name: `${pInfo.koreanName} Lv.${currentLevel + 1}`,
                    engName: pInfo.name,
                    icon: pInfo.icon,
                    description: pInfo.description,
                    badge: `LV.${currentLevel} ➔ LV.${currentLevel + 1}`,
                    color: pInfo.color
                });
            }
        }

        // Shuffle candidate pool
        for (let i = candidatePool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [candidatePool[i], candidatePool[j]] = [candidatePool[j], candidatePool[i]];
        }

        // Fill remaining choices up to count
        while (choices.length < count && candidatePool.length > 0) {
            choices.push(candidatePool.pop());
        }

        // Fallback: If nothing to upgrade, grant HP & Cash Stim
        if (choices.length === 0) {
            choices.push({
                type: 'heal_stim',
                rarity: 'common',
                name: '긴급 에너지 회복',
                engName: 'Emergency Repair',
                icon: '🔋',
                description: '최대 체력의 50%를 즉시 회복하고 스코어를 획득합니다.',
                badge: 'REPAIR',
                color: '#00ff88'
            });
        }

        return choices;
    }

    applyChoice(player, choice) {
        if (choice.type === 'evolution') {
            choice.weapon.evolve();
        } else if (choice.type === 'weapon_upgrade') {
            choice.weapon.upgrade();
        } else if (choice.type === 'new_weapon') {
            const WeaponClass = window.WEAPON_CLASSES[choice.weaponKey];
            if (WeaponClass) {
                const newWep = new WeaponClass(player);
                player.weapons.set(choice.weaponKey, newWep);
            }
        } else if (choice.type === 'new_passive' || choice.type === 'passive_upgrade') {
            const currentLevel = player.passives.get(choice.passiveKey) || 0;
            const newLevel = currentLevel + 1;
            player.passives.set(choice.passiveKey, newLevel);
            PASSIVE_ITEMS[choice.passiveKey].apply(player, newLevel);
        } else if (choice.type === 'heal_stim') {
            player.heal(player.maxHp * 0.5);
            player.score += 500;
        }

        if (window.soundEngine) {
            window.soundEngine.playPowerup();
        }
    }
}

window.PASSIVE_ITEMS = PASSIVE_ITEMS;
window.upgradeManager = new UpgradeManager();
