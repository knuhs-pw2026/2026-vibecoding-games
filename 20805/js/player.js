/**
 * 플레이어 상태, 스탯, 장비, 인벤토리 및 저장 관리
 */
class Player {
    constructor() {
        this.name = "모험가";
        this.classId = "warrior";
        this.level = 1;
        this.exp = 0;
        this.nextExp = 100;
        this.gold = 50;
        this.freeStatPoints = 0;

        this.baseStats = {
            str: 10,
            dex: 10,
            con: 10,
            int: 10,
            wis: 10
        };

        this.hp = 100;
        this.maxHp = 100;
        this.mp = 50;
        this.maxMp = 50;

        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };

        this.inventory = []; // [{ id: "hp_potion_small", qty: 3 }, ...]
        this.learnedCustomSkills = []; // ["double_slash", ...]
        this.currentChapterIndex = 0;
        this.currentNodeId = "1-1";
    }

    /**
     * 신규 캐릭터 초기화
     */
    create(name, classId) {
        const classData = window.CLASSES_DATA[classId];
        if (!classData) return;

        this.name = name.trim() || "이름 없는 자";
        this.classId = classId;
        this.level = 1;
        this.exp = 0;
        this.nextExp = 100;
        this.gold = 100;
        this.freeStatPoints = 0;
        this.learnedCustomSkills = [];

        this.baseStats = { ...classData.baseStats };
        this.maxHp = classData.maxHp;
        this.hp = this.maxHp;
        this.maxMp = classData.maxMp;
        this.mp = this.maxMp;

        this.equipment = {
            weapon: classData.startingEquipment.weapon,
            armor: classData.startingEquipment.armor,
            accessory: classData.startingEquipment.accessory
        };

        this.inventory = [
            { id: "hp_potion_small", qty: 2 },
            { id: "mp_potion_small", qty: 1 }
        ];

        this.currentChapterIndex = 0;
        this.currentNodeId = "1-1";

        this.recalculateStats();
        this.save();
    }

    /**
     * D&D 스타일 스탯 보정치 계산 ( (Stat - 10) / 2 )
     */
    getModifier(statName) {
        const totalStat = this.getTotalStat(statName);
        return Math.floor((totalStat - 10) / 2);
    }

    /**
     * 장비 보너스를 포함한 총 스탯 계산
     */
    getTotalStat(statName) {
        let val = this.baseStats[statName] || 10;

        // 장착된 장비 스탯 가산
        Object.values(this.equipment).forEach(itemId => {
            if (itemId && window.ITEMS_DATA[itemId]) {
                const item = window.ITEMS_DATA[itemId];
                if (item.stats && item.stats[statName]) {
                    val += item.stats[statName];
                }
            }
        });

        return val;
    }

    /**
     * 총 공격력 계산
     */
    getTotalAtk() {
        let baseAtk = 5 + this.getModifier('str') * 2;
        if (this.classId === 'mage') {
            baseAtk = 5 + this.getModifier('int') * 2;
        } else if (this.classId === 'healer') {
            baseAtk = 5 + this.getModifier('wis') * 2;
        }

        Object.values(this.equipment).forEach(itemId => {
            if (itemId && window.ITEMS_DATA[itemId]) {
                const item = window.ITEMS_DATA[itemId];
                if (item.stats && item.stats.atk) {
                    baseAtk += item.stats.atk;
                }
            }
        });

        return Math.max(1, baseAtk);
    }

    /**
     * 총 방어력 계산
     */
    getTotalDef() {
        let baseDef = this.getModifier('con');

        Object.values(this.equipment).forEach(itemId => {
            if (itemId && window.ITEMS_DATA[itemId]) {
                const item = window.ITEMS_DATA[itemId];
                if (item.stats && item.stats.def) {
                    baseDef += item.stats.def;
                }
            }
        });

        return Math.max(0, baseDef);
    }

    /**
     * 장비 반영 후 최대 HP/MP 재계산
     */
    recalculateStats() {
        const classData = window.CLASSES_DATA[this.classId] || window.CLASSES_DATA.warrior;
        let bonusHp = (this.baseStats.con - 10) * 8 + (this.level - 1) * 20;
        let bonusMp = (this.baseStats.int - 10) * 6 + (this.level - 1) * 12;

        Object.values(this.equipment).forEach(itemId => {
            if (itemId && window.ITEMS_DATA[itemId]) {
                const item = window.ITEMS_DATA[itemId];
                if (item.stats) {
                    if (item.stats.maxHp) bonusHp += item.stats.maxHp;
                    if (item.stats.maxMp) bonusMp += item.stats.maxMp;
                }
            }
        });

        this.maxHp = Math.max(50, classData.maxHp + bonusHp);
        this.maxMp = Math.max(20, classData.maxMp + bonusMp);

        this.hp = Math.min(this.hp, this.maxHp);
        this.mp = Math.min(this.mp, this.maxMp);
    }

    /**
     * 사용 가능한 해금된 스킬 목록 반환 (직업 스킬 + 스킬북으로 배운 히든 스킬)
     */
    getAvailableSkills() {
        const classData = window.CLASSES_DATA[this.classId];
        const classSkills = classData ? classData.skills.filter(s => (s.requiredLevel || 1) <= this.level) : [];
        const customSkills = (this.learnedCustomSkills || []).map(id => window.EXTRA_SKILLS_DATA[id]).filter(Boolean);
        return [...classSkills, ...customSkills];
    }

    /**
     * 영구 스탯 및 체력/마나 증가 적용
     */
    applyStatIncrease(statObj) {
        if (!statObj) return [];
        const changes = [];

        ['str', 'dex', 'con', 'int', 'wis'].forEach(k => {
            if (statObj[k]) {
                this.baseStats[k] += statObj[k];
                changes.push(`${k.toUpperCase()} +${statObj[k]}`);
            }
        });

        if (statObj.maxHp) {
            this.baseStats.con += Math.floor(statObj.maxHp / 8);
            changes.push(`최대 HP +${statObj.maxHp}`);
        }

        if (statObj.maxMp) {
            this.baseStats.int += Math.floor(statObj.maxMp / 6);
            changes.push(`최대 MP +${statObj.maxMp}`);
        }

        this.recalculateStats();
        this.hp = Math.min(this.hp + 20, this.maxHp);
        this.save();
        return changes;
    }

    /**
     * 경험치 획득 및 레벨업
     */
    gainExp(amount) {
        this.exp += amount;
        let leveledUp = false;
        const oldLevel = this.level;
        let newlyLearnedSkills = [];

        while (this.exp >= this.nextExp) {
            this.exp -= this.nextExp;
            this.level += 1;
            this.nextExp = Math.floor(this.nextExp * 1.5);
            this.freeStatPoints += 3;

            // 레벨업 시 HP/MP 최대치로 완전 회복
            this.recalculateStats();
            this.hp = this.maxHp;
            this.mp = this.maxMp;
            leveledUp = true;
        }

        if (leveledUp) {
            window.soundEngine.playLevelUp();
            const allSkills = (window.CLASSES_DATA[this.classId] || {}).skills || [];
            newlyLearnedSkills = allSkills.filter(s => (s.requiredLevel || 1) > oldLevel && (s.requiredLevel || 1) <= this.level);
        }

        this.save();
        return {
            leveledUp,
            oldLevel,
            newLevel: this.level,
            newSkills: newlyLearnedSkills
        };
    }

    /**
     * 아이템 인벤토리 추가
     */
    addItem(itemId, qty = 1) {
        if (!window.ITEMS_DATA[itemId]) return;

        const existing = this.inventory.find(i => i.id === itemId);
        if (existing) {
            existing.qty += qty;
        } else {
            this.inventory.push({ id: itemId, qty });
        }
        window.soundEngine.playLoot();
        this.save();
    }

    /**
     * 아이템 소비/제거
     */
    removeItem(itemId, qty = 1) {
        const itemIndex = this.inventory.findIndex(i => i.id === itemId);
        if (itemIndex > -1) {
            this.inventory[itemIndex].qty -= qty;
            if (this.inventory[itemIndex].qty <= 0) {
                this.inventory.splice(itemIndex, 1);
            }
            this.save();
            return true;
        }
        return false;
    }

    /**
     * 장비 장착
     */
    equip(itemId) {
        const item = window.ITEMS_DATA[itemId];
        if (!item || !['weapon', 'armor', 'accessory'].includes(item.type)) return;

        const slot = item.type;
        const currentEquipped = this.equipment[slot];

        // 기존 장비가 있다면 인벤토리로 복귀
        if (currentEquipped) {
            this.addItem(currentEquipped, 1);
        }

        // 새 장비 인벤토리에서 제거 후 장착
        this.removeItem(itemId, 1);
        this.equipment[slot] = itemId;

        this.recalculateStats();
        window.soundEngine.playLoot();
        this.save();
    }

    /**
     * 장비 해제
     */
    unequip(slot) {
        const itemId = this.equipment[slot];
        if (!itemId) return;

        this.equipment[slot] = null;
        this.addItem(itemId, 1);
        this.recalculateStats();
        this.save();
    }

    /**
     * 포션, 스탯북, 스킬북 등 소비/학습 아이템 사용
     */
    useItem(itemId) {
        const item = window.ITEMS_DATA[itemId];
        if (!item) return { success: false, message: "존재하지 않는 아이템입니다." };

        // 1. 영구 스탯북 사용
        if (item.type === 'stat_book') {
            if (!this.removeItem(itemId, 1)) {
                return { success: false, message: "아이템이 부족합니다." };
            }
            this.applyStatIncrease(item.statIncrease);
            window.soundEngine.playLevelUp();
            this.save();
            return { success: true, message: `📖 ${item.name}을(를) 정독하여 영구적으로 능력치가 상승했습니다!` };
        }

        // 2. 신규 스킬북 사용
        if (item.type === 'skill_book') {
            if (!this.learnedCustomSkills) this.learnedCustomSkills = [];
            if (this.learnedCustomSkills.includes(item.learnSkillId)) {
                return { success: false, message: "이미 습득한 스킬입니다!" };
            }
            if (!this.removeItem(itemId, 1)) {
                return { success: false, message: "아이템이 부족합니다." };
            }
            this.learnedCustomSkills.push(item.learnSkillId);
            window.soundEngine.playLevelUp();
            this.save();
            const skillData = window.EXTRA_SKILLS_DATA[item.learnSkillId];
            const skillName = skillData ? skillData.name : "새 스킬";
            return { success: true, message: `✨ 새로운 스킬 [${skillName}]을(를) 영구 습득했습니다!` };
        }

        // 3. 체력/마나 회복 포션 & 비약
        if (item.type === 'consumable') {
            if (!this.removeItem(itemId, 1)) {
                return { success: false, message: "아이템이 부족합니다." };
            }

            let msg = `${item.name}을(를) 사용했습니다.`;

            if (item.healHp) {
                const healed = Math.min(item.healHp, this.maxHp - this.hp);
                this.hp = Math.min(this.maxHp, this.hp + item.healHp);
                msg += ` (HP +${healed})`;
                window.soundEngine.playHeal();
            }

            if (item.healMp) {
                const healed = Math.min(item.healMp, this.maxMp - this.mp);
                this.mp = Math.min(this.maxMp, this.mp + item.healMp);
                msg += ` (MP +${healed})`;
                window.soundEngine.playHeal();
            }

            this.save();
            return { success: true, message: msg };
        }

        return { success: false, message: "사용할 수 없는 아이템입니다." };
    }

    /**
     * 아이템 상점에 판매 (원가의 50% 환전)
     */
    sellItem(itemId, qty = 1) {
        const item = window.ITEMS_DATA[itemId];
        if (!item) return { success: false, message: "아이템을 찾을 수 없습니다." };

        const sellPrice = Math.max(5, Math.floor((item.price || 20) * 0.5));
        const totalGain = sellPrice * qty;

        if (!this.removeItem(itemId, qty)) {
            return { success: false, message: "판매할 아이템이 부족합니다." };
        }

        this.gold += totalGain;
        window.soundEngine.playLoot();
        this.save();
        return { success: true, gold: totalGain, message: `💰 [${item.name}]을(를) 판매하여 ${totalGain} 골드를 획득했습니다!` };
    }

    /**
     * 스탯 포인트 투자
     */
    allocateStat(statName) {
        if (this.freeStatPoints <= 0) return false;
        if (this.baseStats[statName] !== undefined) {
            this.baseStats[statName] += 1;
            this.freeStatPoints -= 1;
            this.recalculateStats();
            this.save();
            return true;
        }
        return false;
    }

    /**
     * 로컬 스토리지 저장
     */
    save() {
        const data = {
            name: this.name,
            classId: this.classId,
            level: this.level,
            exp: this.exp,
            nextExp: this.nextExp,
            gold: this.gold,
            freeStatPoints: this.freeStatPoints,
            baseStats: this.baseStats,
            hp: this.hp,
            mp: this.mp,
            equipment: this.equipment,
            inventory: this.inventory,
            learnedCustomSkills: this.learnedCustomSkills || [],
            currentChapterIndex: this.currentChapterIndex,
            currentNodeId: this.currentNodeId
        };
        try {
            localStorage.setItem('grimforge_trpg_save', JSON.stringify(data));
        } catch (e) {
            console.error("Save error:", e);
        }
    }

    /**
     * 로컬 스토리지 불러오기
     */
    load() {
        try {
            const saved = localStorage.getItem('grimforge_trpg_save');
            if (!saved) return false;

            const data = JSON.parse(saved);
            this.name = data.name || "모험가";
            this.classId = data.classId || "warrior";
            this.level = data.level || 1;
            this.exp = data.exp || 0;
            this.nextExp = data.nextExp || 100;
            this.gold = data.gold || 0;
            this.freeStatPoints = data.freeStatPoints || 0;
            this.baseStats = data.baseStats || { str: 10, dex: 10, con: 10, int: 10, wis: 10 };
            this.hp = data.hp || 100;
            this.mp = data.mp || 50;
            this.equipment = data.equipment || { weapon: null, armor: null, accessory: null };
            this.inventory = data.inventory || [];
            this.learnedCustomSkills = data.learnedCustomSkills || [];
            this.currentChapterIndex = data.currentChapterIndex || 0;
            this.currentNodeId = data.currentNodeId || "1-1";

            this.recalculateStats();
            return true;
        } catch (e) {
            console.error("Load error:", e);
            return false;
        }
    }

    hasSave() {
        return !!localStorage.getItem('grimforge_trpg_save');
    }

    deleteSave() {
        localStorage.removeItem('grimforge_trpg_save');
    }
}

window.player = new Player();

