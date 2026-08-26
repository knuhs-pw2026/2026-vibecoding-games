/**
 * 턴제 전투 시스템 엔진 (D20 주사위 판정, 스킬, 몬스터 AI, 전투 로그)
 */
class CombatManager {
    constructor() {
        this.currentMonster = null;
        this.monsterHp = 0;
        this.monsterMaxHp = 0;
        this.isPlayerTurn = true;
        this.turnCount = 1;
        this.isBusy = false;
        
        // 전투 중 버프/상태
        this.playerBuffs = []; // [{ type: "shield"|"atk_up"|"def_up", duration: 3, value: 0.5 }]
        this.skillCooldowns = {}; // { skill_id: remainingTurns }
        this.isDefending = false;
        this.onCombatEndCallback = null;
    }

    /**
     * 전투 시작
     */
    startBattle(monsterId, onCombatEnd) {
        const monsterTemplate = window.MONSTERS_DATA[monsterId];
        if (!monsterTemplate) return;

        this.currentMonster = { ...monsterTemplate };
        this.monsterMaxHp = monsterTemplate.maxHp;
        this.monsterHp = monsterTemplate.maxHp;
        this.isPlayerTurn = true;
        this.turnCount = 1;
        this.isBusy = false;
        this.playerBuffs = [];
        this.skillCooldowns = {};
        this.isDefending = false;
        this.onCombatEndCallback = onCombatEnd;

        this.renderCombatUI();
        this.log(`⚔️ <strong>${this.currentMonster.name}</strong>(이)가 나타났습니다! 전투가 시작됩니다!`, "log-system");
        window.soundEngine.playSlash();
    }

    /**
     * 전투 UI 렌더링 및 동기화
     */
    renderCombatUI() {
        const monsterNameEl = document.getElementById('combat-monster-name');
        const monsterIconEl = document.getElementById('combat-monster-icon');
        const monsterHpTextEl = document.getElementById('combat-monster-hp-text');
        const monsterHpBarEl = document.getElementById('combat-monster-hp-bar');

        if (monsterNameEl) monsterNameEl.textContent = `${this.currentMonster.title || ''} ${this.currentMonster.name}`;
        if (monsterIconEl) monsterIconEl.textContent = this.currentMonster.icon;
        
        this.updateMonsterHpUI();
        this.updatePlayerCombatUI();
        this.renderSkillButtons();
        this.renderItemButtons();
    }

    updateMonsterHpUI() {
        const hpText = document.getElementById('combat-monster-hp-text');
        const hpBar = document.getElementById('combat-monster-hp-bar');
        const pct = Math.max(0, (this.monsterHp / this.monsterMaxHp) * 100);

        if (hpText) hpText.textContent = `${Math.ceil(this.monsterHp)} / ${this.monsterMaxHp} HP`;
        if (hpBar) hpBar.style.width = `${pct}%`;
    }

    updatePlayerCombatUI() {
        const hpText = document.getElementById('combat-player-hp-text');
        const hpBar = document.getElementById('combat-player-hp-bar');
        const mpText = document.getElementById('combat-player-mp-text');
        const mpBar = document.getElementById('combat-player-mp-bar');

        const hpPct = Math.max(0, (window.player.hp / window.player.maxHp) * 100);
        const mpPct = Math.max(0, (window.player.mp / window.player.maxMp) * 100);

        if (hpText) hpText.textContent = `${window.player.hp} / ${window.player.maxHp} HP`;
        if (hpBar) hpBar.style.width = `${hpPct}%`;
        if (mpText) mpText.textContent = `${window.player.mp} / ${window.player.maxMp} MP`;
        if (mpBar) mpBar.style.width = `${mpPct}%`;
    }

    /**
     * 플레이어 스킬 버튼 동적 렌더링 (직업 스킬 + 스킬북 습득 히든 스킬 + 레벨 잠금 상태)
     */
    renderSkillButtons() {
        const container = document.getElementById('combat-skills-container');
        if (!container) return;

        const classData = window.CLASSES_DATA[window.player.classId];
        if (!classData) return;

        container.innerHTML = "";

        // 1. 기본 직업 스킬 렌더링
        classData.skills.forEach(skill => {
            const btn = document.createElement('button');
            const reqLv = skill.requiredLevel || 1;
            const isUnlocked = window.player.level >= reqLv;
            const cd = this.skillCooldowns[skill.id] || 0;
            const hasMp = window.player.mp >= skill.mpCost;

            if (!isUnlocked) {
                btn.className = 'btn-skill skill-locked';
                btn.disabled = true;
                btn.innerHTML = `
                    <div class="skill-icon-name">🔒 ${skill.name}</div>
                    <div class="skill-meta">
                        <span class="skill-req-lv">Lv.${reqLv} 습득</span>
                    </div>
                `;
                btn.title = `[잠김] Lv.${reqLv} 달성 시 해금: ${skill.desc}`;
            } else {
                btn.className = 'btn-skill';
                const disabled = cd > 0 || !hasMp || !this.isPlayerTurn || this.isBusy;
                btn.disabled = disabled;
                btn.innerHTML = `
                    <div class="skill-icon-name">${skill.icon} ${skill.name}</div>
                    <div class="skill-meta">
                        <span class="skill-mp">${skill.mpCost} MP</span>
                        ${cd > 0 ? `<span class="skill-cd">쿨다운: ${cd}턴</span>` : ''}
                    </div>
                `;
                btn.title = `${skill.desc} (소모 MP: ${skill.mpCost})`;
                btn.onclick = () => this.handlePlayerSkill(skill);
            }

            container.appendChild(btn);
        });

        // 2. 스킬북으로 습득한 히든 스킬 렌더링
        if (window.player.learnedCustomSkills && window.player.learnedCustomSkills.length > 0) {
            window.player.learnedCustomSkills.forEach(skillId => {
                const skill = window.EXTRA_SKILLS_DATA[skillId];
                if (!skill) return;

                const btn = document.createElement('button');
                btn.className = 'btn-skill btn-skill-custom';
                const cd = this.skillCooldowns[skill.id] || 0;
                const hasMp = window.player.mp >= skill.mpCost;
                const disabled = cd > 0 || !hasMp || !this.isPlayerTurn || this.isBusy;

                btn.disabled = disabled;
                btn.innerHTML = `
                    <div class="skill-icon-name">✨ ${skill.icon} ${skill.name}</div>
                    <div class="skill-meta">
                        <span class="skill-mp">${skill.mpCost} MP</span>
                        ${cd > 0 ? `<span class="skill-cd">쿨다운: ${cd}턴</span>` : ''}
                    </div>
                `;
                btn.title = `[비전서 스킬] ${skill.desc} (소모 MP: ${skill.mpCost})`;
                btn.onclick = () => this.handlePlayerSkill(skill);
                container.appendChild(btn);
            });
        }
    }

    /**
     * 인벤토리 소비 아이템 버튼 렌더링
     */
    renderItemButtons() {
        const container = document.getElementById('combat-items-container');
        if (!container) return;

        container.innerHTML = "";
        const consumables = window.player.inventory.filter(i => {
            const item = window.ITEMS_DATA[i.id];
            return item && item.type === 'consumable';
        });

        if (consumables.length === 0) {
            container.innerHTML = `<span class="no-items-text">사용 가능한 아이템이 없습니다.</span>`;
            return;
        }

        consumables.forEach(invItem => {
            const item = window.ITEMS_DATA[invItem.id];
            const btn = document.createElement('button');
            btn.className = 'btn-combat-item';
            btn.disabled = !this.isPlayerTurn || this.isBusy;
            btn.innerHTML = `${item.icon} ${item.name} (${invItem.qty})`;
            btn.onclick = () => this.handlePlayerUseItem(item);
            container.appendChild(btn);
        });
    }

    /**
     * 1. 플레이어 일반 공격 (주사위 눈 비례 데미지 증폭)
     */
    async handlePlayerAttack() {
        if (!this.isPlayerTurn || this.isBusy) return;
        this.isBusy = true;

        this.log(`⚔️ 당신이 <strong>${this.currentMonster.name}</strong>에게 기본 공격을 시도합니다!`, "log-player");

        // D20 명중 및 위력 주사위 판정 (기본 DC 10)
        const rollResult = await window.diceEngine.roll({
            modifier: window.player.getModifier('str'),
            dc: 10,
            reason: "일반 공격 명중 & 위력 판정",
            statName: "STR"
        });

        // 🎲 주사위 굴림 값(1~20)에 따른 위력 배율 계산 (높을수록 압도적인 데미지!)
        const diceScaling = 0.65 + (rollResult.natural / 20) * 0.75; // 1->0.68배 ~ 20->1.4배
        const overkillBonus = rollResult.isSuccess ? Math.max(0, (rollResult.total - rollResult.dc) * 2) : 0;

        let baseDamage = window.player.getTotalAtk() + Math.floor(Math.random() * 4) + 1;
        baseDamage = Math.floor(baseDamage * diceScaling) + overkillBonus;
        let isCrit = false;

        // 버프 적용
        const atkBuff = this.playerBuffs.find(b => b.type === "atk_up" || b.type === "all_up");
        if (atkBuff) {
            baseDamage = Math.floor(baseDamage * (1 + atkBuff.value));
        }

        if (rollResult.isCritSuccess) {
            baseDamage = Math.floor(baseDamage * 2.2);
            isCrit = true;
            this.log(`💥 <strong>대성공(Natural 20)!</strong> 극한의 치명타가 적중했습니다!`, "log-crit");
        } else if (rollResult.isCritFail) {
            baseDamage = 0;
            this.log(`💨 <strong>대실패(Natural 1)!</strong> 공격이 완전히 빗나갔습니다!`, "log-fail");
        } else if (!rollResult.isSuccess) {
            baseDamage = Math.floor(baseDamage * 0.4);
            this.log(`🛡️ 적이 공격을 비스듬히 흘려냈습니다. (약한 피해)`, "log-sub");
        } else {
            this.log(`🎲 주사위 [${rollResult.natural}] 효과: 위력 <strong>${Math.round(diceScaling * 100)}% + 초과 보너스 ${overkillBonus}</strong> 적용!`, "log-system");
        }

        // 몬스터 방어력 차감
        const finalDamage = Math.max(1, baseDamage - Math.floor(this.currentMonster.def * 0.5));
        
        if (baseDamage > 0) {
            window.soundEngine.playSlash();
            this.applyDamageToMonster(finalDamage, isCrit);
            this.log(`🗡️ 적에게 <strong>${finalDamage}</strong>의 물리 피해를 입혔습니다!`, "log-player");
        }

        this.checkCombatState();
    }

    /**
     * 2. 플레이어 스킬 시전 (주사위 눈 비례 데미지 증폭)
     */
    async handlePlayerSkill(skill) {
        if (!this.isPlayerTurn || this.isBusy) return;
        if (window.player.mp < skill.mpCost) return;

        this.isBusy = true;
        window.player.mp -= skill.mpCost;
        this.updatePlayerCombatUI();

        this.log(`✨ 당신이 <strong>[${skill.name}]</strong>을(를) 시전합니다!`, "log-player");

        // 사운드 재생
        if (window.soundEngine[skill.sound]) {
            window.soundEngine[skill.sound]();
        }

        // 스킬 타입별 처리
        if (skill.type === "heal") {
            const wisMod = window.player.getModifier('wis');
            const healAmount = Math.floor((35 + wisMod * 8) * skill.multiplier);
            const actualHeal = Math.min(healAmount, window.player.maxHp - window.player.hp);
            window.player.hp += actualHeal;
            this.updatePlayerCombatUI();
            this.showFloatingText(document.getElementById('combat-player-avatar'), `+${actualHeal}`, 'heal');
            this.log(`💚 생명력이 <strong>${actualHeal}</strong> 회복되었습니다!`, "log-heal");
        } else if (skill.type === "buff") {
            this.playerBuffs.push({
                type: skill.buffType,
                duration: skill.duration,
                value: skill.value,
                name: skill.name
            });
            this.showFloatingText(document.getElementById('combat-player-avatar'), `${skill.name}!`, 'buff');
            this.log(`🛡️ <strong>[${skill.name}]</strong> 버프가 활성화되었습니다! (${skill.duration}턴 지속)`, "log-buff");
        } else {
            // 공격형 스킬 (단일 공격, 흡혈, 마나회복, 복수, 방어무시)
            const statMod = window.player.getModifier(skill.statBonus || 'str');
            const rollResult = await window.diceEngine.roll({
                modifier: statMod,
                dc: 11,
                reason: `${skill.name} 위력 판정`,
                statName: (skill.statBonus || 'str').toUpperCase()
            });

            // 🎲 주사위 롤에 따른 스킬 위력 배율
            const diceScaling = 0.7 + (rollResult.natural / 20) * 0.7; // 1->0.73배 ~ 20->1.4배
            const overkillBonus = rollResult.isSuccess ? Math.max(0, (rollResult.total - rollResult.dc) * 3) : 0;

            let dmg = Math.floor(((window.player.getTotalAtk() + 10) * skill.multiplier) * diceScaling) + overkillBonus;
            let isCrit = false;

            // 복수의 일격 추가 배율 (체력 잃은 만큼)
            if (skill.type === "vengeance_attack") {
                const lostRate = 1 - (window.player.hp / window.player.maxHp);
                dmg = Math.floor(dmg * (1 + lostRate * 1.5));
            }

            if (rollResult.isCritSuccess) {
                dmg = Math.floor(dmg * 2.0);
                isCrit = true;
                this.log(`💥 <strong>대성공(Natural 20)!</strong> 스킬이 폭발적인 위력을 발휘합니다!`, "log-crit");
            } else if (rollResult.isCritFail) {
                dmg = Math.floor(dmg * 0.3);
                this.log(`💨 <strong>대실패(Natural 1)!</strong> 마력/타격의 초점이 어긋났습니다.`, "log-fail");
            } else {
                this.log(`🎲 주사위 [${rollResult.natural}] 효과: 스킬 위력 <strong>${Math.round(diceScaling * 100)}% + 보너스 ${overkillBonus}</strong> 적용!`, "log-system");
            }

            // 방어 무시 여부 계산
            let targetDef = this.currentMonster.def;
            if (skill.ignoreDefRate) {
                targetDef = Math.floor(targetDef * (1 - skill.ignoreDefRate));
            }

            const finalDamage = Math.max(8, dmg - targetDef);
            this.applyDamageToMonster(finalDamage, isCrit);
            this.log(`💥 <strong>${finalDamage}</strong>의 피해를 입혔습니다!`, "log-player");

            // 흡혈 효과
            if (skill.type === "lifesteal_attack") {
                const lifesteal = Math.floor(finalDamage * (skill.lifestealRate || 0.4));
                window.player.hp = Math.min(window.player.maxHp, window.player.hp + lifesteal);
                this.updatePlayerCombatUI();
                this.showFloatingText(document.getElementById('combat-player-avatar'), `+${lifesteal}`, 'heal');
                this.log(`🩸 체력을 <strong>${lifesteal}</strong> 흡수했습니다!`, "log-heal");
            }

            // 마나 흡수 효과
            if (skill.type === "mana_leech_attack") {
                window.player.mp = Math.min(window.player.maxMp, window.player.mp + (skill.manaRestore || 25));
                this.updatePlayerCombatUI();
                this.showFloatingText(document.getElementById('combat-player-avatar'), `+${skill.manaRestore} MP`, 'buff');
                this.log(`🕯️ 마나를 <strong>${skill.manaRestore}</strong> 회복했습니다!`, "log-heal");
            }
        }

        if (skill.cooldown > 0) {
            this.skillCooldowns[skill.id] = skill.cooldown;
        }

        this.checkCombatState();
    }

    /**
     * 3. 플레이어 방어 태세
     */
    handlePlayerDefend() {
        if (!this.isPlayerTurn || this.isBusy) return;
        this.isBusy = true;
        this.isDefending = true;
        window.soundEngine.playShieldBlock();
        this.log(`🛡️ 방어 태세를 취했습니다. 이번 턴에 받는 피해가 대폭 감소하며 마나를 8 회복합니다.`, "log-buff");
        window.player.mp = Math.min(window.player.maxMp, window.player.mp + 8);
        this.updatePlayerCombatUI();
        
        setTimeout(() => {
            this.endPlayerTurn();
        }, 600);
    }

    /**
     * 4. 플레이어 전투 중 아이템 사용
     */
    handlePlayerUseItem(item) {
        if (!this.isPlayerTurn || this.isBusy) return;
        this.isBusy = true;

        if (item.combatEffect && item.combatEffect.type === "damage") {
            window.player.removeItem(item.id, 1);
            window.soundEngine.playMagic();
            this.applyDamageToMonster(item.combatEffect.value, false);
            this.log(`📜 <strong>${item.name}</strong>(을)를 사용하여 적에게 <strong>${item.combatEffect.value}</strong>의 피해를 입혔습니다!`, "log-player");
        } else {
            const res = window.player.useItem(item.id);
            this.log(`🧪 ${res.message}`, "log-heal");
        }

        this.updatePlayerCombatUI();
        this.renderItemButtons();
        this.checkCombatState();
    }

    /**
     * 5. 도주 시도
     */
    async handlePlayerFlee() {
        if (!this.isPlayerTurn || this.isBusy) return;
        if (this.currentMonster.isBoss) {
            this.log(`⛔ 보스전에서는 도망칠 수 없습니다! 맞서 싸워야 합니다!`, "log-fail");
            return;
        }

        this.isBusy = true;
        this.log(`🏃 전장을 탈출하기 위해 민첩하게 퇴로를 찾습니다!`, "log-player");

        const rollResult = await window.diceEngine.roll({
            modifier: window.player.getModifier('dex'),
            dc: 12,
            reason: "도주 판정",
            statName: "DEX"
        });

        if (rollResult.isSuccess) {
            this.log(`💨 무사히 도망쳤습니다!`, "log-system");
            window.soundEngine.playLoot();
            setTimeout(() => {
                if (this.onCombatEndCallback) this.onCombatEndCallback(false, true); // (isWin, isFled)
            }, 800);
        } else {
            this.log(`⚠️ 적의 추격에 막혀 도주에 실패했습니다!`, "log-fail");
            this.endPlayerTurn();
        }
    }

    /**
     * 몬스터에게 데미지 적용
     */
    applyDamageToMonster(damage, isCrit = false) {
        this.monsterHp = Math.max(0, this.monsterHp - damage);
        this.updateMonsterHpUI();

        const monsterAvatar = document.getElementById('combat-monster-avatar');
        if (monsterAvatar) {
            monsterAvatar.classList.add('shake');
            setTimeout(() => monsterAvatar.classList.remove('shake'), 400);
            this.showFloatingText(monsterAvatar, `-${damage}`, isCrit ? 'crit' : 'damage');
        }
    }

    /**
     * 플레이어에게 데미지 적용
     */
    applyDamageToPlayer(rawDamage) {
        let finalDamage = rawDamage;

        // 방어 태세 시 50% 감소
        if (this.isDefending) {
            finalDamage = Math.floor(finalDamage * 0.5);
        }

        // 방패/데미지 컷 버프 확인
        const shieldBuff = this.playerBuffs.find(b => b.type === "shield" || b.type === "damage_cut");
        if (shieldBuff) {
            finalDamage = Math.floor(finalDamage * (1 - shieldBuff.value));
        }

        // 방어력 차감
        finalDamage = Math.max(1, finalDamage - Math.floor(window.player.getTotalDef() * 0.7));

        window.player.hp = Math.max(0, window.player.hp - finalDamage);
        this.updatePlayerCombatUI();

        const playerAvatar = document.getElementById('combat-player-avatar');
        if (playerAvatar) {
            playerAvatar.classList.add('shake');
            setTimeout(() => playerAvatar.classList.remove('shake'), 400);
            this.showFloatingText(playerAvatar, `-${finalDamage}`, 'damage');
        }

        return finalDamage;
    }

    /**
     * 플로팅 데미지 텍스트 연출
     */
    showFloatingText(targetEl, text, type) {
        if (!targetEl) return;
        const floatEl = document.createElement('div');
        floatEl.className = `floating-dmg ${type}`;
        floatEl.textContent = text;
        targetEl.appendChild(floatEl);

        setTimeout(() => {
            floatEl.remove();
        }, 900);
    }

    /**
     * 전투 상태 체크 (승리/패배/턴 종료)
     */
    checkCombatState() {
        if (this.monsterHp <= 0) {
            this.handleVictory();
        } else {
            this.endPlayerTurn();
        }
    }

    /**
     * 플레이어 턴 종료 -> 적 턴으로 전환
     */
    endPlayerTurn() {
        this.isPlayerTurn = false;
        this.renderSkillButtons();
        this.renderItemButtons();

        setTimeout(() => {
            this.processMonsterTurn();
        }, 700);
    }

    /**
     * 몬스터 턴 AI 로직
     */
    processMonsterTurn() {
        if (this.monsterHp <= 0) return;

        this.log(`⚠️ <strong>${this.currentMonster.name}</strong>의 턴입니다!`, "log-monster");

        // 몬스터 스킬 또는 일반 공격 결정
        const skills = this.currentMonster.skills || [];
        const useSkill = skills.length > 0 && Math.random() < 0.45;

        if (useSkill) {
            const skill = skills[Math.floor(Math.random() * skills.length)];
            this.log(`🔥 ${this.currentMonster.name}(이)가 <strong>[${skill.name}]</strong>(을)를 사용합니다! (${skill.desc})`, "log-monster");
            window.soundEngine.playSlash();
            
            const rawDamage = Math.floor((this.currentMonster.atk * (skill.multiplier || 1.4)) + (Math.random() * 6));
            const takenDamage = this.applyDamageToPlayer(rawDamage);
            this.log(`💥 <strong>${takenDamage}</strong>의 피해를 입었습니다!`, "log-monster");
        } else {
            this.log(`🗡️ ${this.currentMonster.name}(이)가 거칠게 공격해옵니다!`, "log-monster");
            window.soundEngine.playSlash();
            
            const rawDamage = Math.floor(this.currentMonster.atk + (Math.random() * 5));
            const takenDamage = this.applyDamageToPlayer(rawDamage);
            this.log(`💔 <strong>${takenDamage}</strong>의 피해를 입었습니다!`, "log-monster");
        }

        // 플레이어 패배 확인
        if (window.player.hp <= 0) {
            this.handleDefeat();
            return;
        }

        // 턴 마무리 및 버프/쿨다운 감소
        this.startNextTurn();
    }

    /**
     * 다음 턴 시작 (플레이어 턴 복귀)
     */
    startNextTurn() {
        this.turnCount++;
        this.isDefending = false;
        this.isPlayerTurn = true;
        this.isBusy = false;

        // 쿨다운 감소
        for (const skillId in this.skillCooldowns) {
            if (this.skillCooldowns[skillId] > 0) {
                this.skillCooldowns[skillId]--;
            }
        }

        // 버프 지속시간 감소
        this.playerBuffs = this.playerBuffs.filter(b => {
            b.duration--;
            if (b.duration <= 0) {
                this.log(`⌛ [${b.name || b.type}] 효과가 만료되었습니다.`, "log-sub");
                return false;
            }
            return true;
        });

        this.renderSkillButtons();
        this.renderItemButtons();
        this.log(`--- [ ${this.turnCount} 턴 ] 당신의 차례입니다 ---`, "log-system");
    }

    /**
     * 전투 승리 처리
     */
    handleVictory() {
        this.isBusy = true;
        window.soundEngine.playVictory();
        this.log(`🏆 <strong>${this.currentMonster.name}</strong>을(를) 격퇴했습니다!`, "log-crit");

        const expGained = this.currentMonster.exp || 20;
        const goldGained = this.currentMonster.gold || 15;
        window.player.gold += goldGained;
        
        this.log(`💰 전리품: +${goldGained} 골드, +${expGained} EXP 획득!`, "log-heal");

        // 드랍 아이템 롤
        if (this.currentMonster.loot && this.currentMonster.loot.length > 0) {
            const droppedId = this.currentMonster.loot[Math.floor(Math.random() * this.currentMonster.loot.length)];
            const droppedItem = window.ITEMS_DATA[droppedId];
            if (droppedItem) {
                window.player.addItem(droppedId, 1);
                this.log(`🎁 [${droppedItem.name}]을(를) 획득했습니다!`, "log-buff");
            }
        }

        const expResult = window.player.gainExp(expGained);
        if (expResult.leveledUp) {
            this.log(`🎉 <strong>LEVEL UP!</strong> 레벨이 ${expResult.newLevel}로 올랐습니다! (스탯 포인트 +3)`, "log-crit");
            if (expResult.newSkills && expResult.newSkills.length > 0) {
                expResult.newSkills.forEach(ns => {
                    this.log(`🌟 <strong>새로운 스킬 습득! [${ns.name}]</strong> (${ns.desc})`, "log-buff");
                });
            }
        }

        window.player.save();

        setTimeout(() => {
            if (this.onCombatEndCallback) this.onCombatEndCallback(true, false);
            if (expResult.leveledUp && window.app.showLevelUpModal) {
                window.app.showLevelUpModal(expResult);
            }
        }, 1500);
    }

    /**
     * 전투 패배 (사망) 처리
     */
    handleDefeat() {
        this.isBusy = true;
        window.soundEngine.playNat1();
        this.log(`☠️ 체력이 바닥나 쓰러졌습니다... 당신의 모험은 여기서 끝납니다.`, "log-fail");

        setTimeout(() => {
            if (this.onCombatEndCallback) this.onCombatEndCallback(false, false);
        }, 1500);
    }

    /**
     * 로그 출력
     */
    log(htmlText, className = "") {
        const logBox = document.getElementById('combat-log-box');
        if (!logBox) return;

        const p = document.createElement('div');
        p.className = `log-entry ${className}`;
        p.innerHTML = htmlText;
        logBox.appendChild(p);
        logBox.scrollTop = logBox.scrollHeight;
    }
}

window.combatManager = new CombatManager();
