/**
 * 마스터 애플리케이션 컨트롤러
 */
class App {
    constructor() {
        this.currentView = 'title'; // 'title', 'create', 'game'
        this.activeModal = null;
    }

    init() {
        this.bindEvents();
        this.checkExistingSave();
    }

    bindEvents() {
        // 타이틀 화면 버튼
        document.getElementById('btn-new-game').addEventListener('click', () => {
            window.soundEngine.playClick();
            this.switchView('create');
        });

        const btnContinue = document.getElementById('btn-continue-game');
        btnContinue.addEventListener('click', () => {
            window.soundEngine.playClick();
            if (window.player.load()) {
                this.startGame();
            }
        });

        // 캐릭터 생성 화면 직업 선택
        document.querySelectorAll('.class-card-select').forEach(card => {
            card.addEventListener('click', (e) => {
                window.soundEngine.playClick();
                document.querySelectorAll('.class-card-select').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.updateClassPreview(card.dataset.classId);
            });
        });

        document.getElementById('btn-start-adventure').addEventListener('click', () => {
            const nameInput = document.getElementById('char-name-input');
            const selectedCard = document.querySelector('.class-card-select.selected');
            const classId = selectedCard ? selectedCard.dataset.classId : 'warrior';

            window.soundEngine.playVictory();
            window.player.create(nameInput.value, classId);
            this.startGame();
        });

        document.getElementById('btn-back-to-title').addEventListener('click', () => {
            window.soundEngine.playClick();
            this.switchView('title');
        });

        // 인게임 상단바 버튼
        document.getElementById('btn-open-inventory').addEventListener('click', () => {
            window.soundEngine.playClick();
            this.openInventoryModal();
        });

        document.getElementById('btn-open-stats').addEventListener('click', () => {
            window.soundEngine.playClick();
            this.openStatsModal();
        });

        document.getElementById('btn-toggle-sound').addEventListener('click', () => {
            const enabled = window.soundEngine.toggleSound();
            const icon = document.getElementById('sound-icon');
            icon.textContent = enabled ? '🔊' : '🔇';
            this.showNotification(enabled ? "사운드가 켜졌습니다." : "사운드가 음소거되었습니다.");
        });

        // 전투 커맨드 버튼들
        document.getElementById('btn-combat-attack').addEventListener('click', () => {
            window.combatManager.handlePlayerAttack();
        });

        document.getElementById('btn-combat-defend').addEventListener('click', () => {
            window.combatManager.handlePlayerDefend();
        });

        document.getElementById('btn-combat-flee').addEventListener('click', () => {
            window.combatManager.handlePlayerFlee();
        });

        // 모달 닫기 버튼들
        document.querySelectorAll('.modal-close-btn, .modal-backdrop').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target === el) {
                    this.closeModals();
                }
            });
        });
    }

    checkExistingSave() {
        const btnContinue = document.getElementById('btn-continue-game');
        if (window.player.hasSave()) {
            btnContinue.classList.remove('hidden');
        } else {
            btnContinue.classList.add('hidden');
        }
    }

    switchView(viewName) {
        this.currentView = viewName;
        document.getElementById('view-title').classList.toggle('hidden', viewName !== 'title');
        document.getElementById('view-create').classList.toggle('hidden', viewName !== 'create');
        document.getElementById('view-game').classList.toggle('hidden', viewName !== 'game');

        if (viewName === 'title') {
            this.checkExistingSave();
        } else if (viewName === 'create') {
            this.updateClassPreview('warrior');
        }
    }

    updateClassPreview(classId) {
        const classData = window.CLASSES_DATA[classId];
        if (!classData) return;

        const previewContainer = document.getElementById('class-detail-preview');
        previewContainer.innerHTML = `
            <div class="class-preview-header">
                <span class="preview-icon">${classData.icon}</span>
                <div>
                    <h3 class="preview-name">${classData.name} <small class="text-gold">(${classData.title})</small></h3>
                    <p class="preview-desc">${classData.description}</p>
                </div>
            </div>
            <div class="preview-stats-grid">
                <div class="stat-pill">STR (근력): <strong>${classData.baseStats.str}</strong></div>
                <div class="stat-pill">DEX (민첩): <strong>${classData.baseStats.dex}</strong></div>
                <div class="stat-pill">CON (체력): <strong>${classData.baseStats.con}</strong></div>
                <div class="stat-pill">INT (지능): <strong>${classData.baseStats.int}</strong></div>
                <div class="stat-pill">WIS (지혜): <strong>${classData.baseStats.wis}</strong></div>
                <div class="stat-pill highlight-hp">HP: <strong>${classData.maxHp}</strong></div>
                <div class="stat-pill highlight-mp">MP: <strong>${classData.maxMp}</strong></div>
            </div>
            <div class="preview-skills-title">📜 레벨별 습득 스킬 트리</div>
            <div class="preview-skills-list">
                ${classData.skills.map(s => `
                    <div class="skill-mini-card">
                        <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                            <strong>${s.icon} ${s.name}</strong>
                            <span class="text-gold" style="font-weight:700;">Lv.${s.requiredLevel || 1}</span>
                        </div>
                        <div style="font-size:0.75rem; color:var(--text-secondary);">${s.desc} (소모: ${s.mpCost} MP)</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    startGame() {
        this.switchView('game');
        this.updateTopStats();
        this.switchToExploration();
        window.explorationManager.loadCurrentNode();
    }

    updateTopStats() {
        document.getElementById('top-player-name').textContent = window.player.name;
        document.getElementById('top-player-class').textContent = `${window.CLASSES_DATA[window.player.classId].name} Lv.${window.player.level}`;
        
        document.getElementById('top-player-hp-text').textContent = `${window.player.hp} / ${window.player.maxHp}`;
        document.getElementById('top-player-hp-bar').style.width = `${(window.player.hp / window.player.maxHp) * 100}%`;
        
        document.getElementById('top-player-mp-text').textContent = `${window.player.mp} / ${window.player.maxMp}`;
        document.getElementById('top-player-mp-bar').style.width = `${(window.player.mp / window.player.maxMp) * 100}%`;

        document.getElementById('top-player-gold').textContent = `💰 ${window.player.gold}`;
        document.getElementById('top-player-exp').textContent = `EXP: ${window.player.exp} / ${window.player.nextExp}`;
    }

    switchToExploration() {
        document.getElementById('panel-exploration').classList.remove('hidden');
        document.getElementById('panel-combat').classList.add('hidden');
        this.updateTopStats();
    }

    switchToCombat(monsterId, callback) {
        document.getElementById('panel-exploration').classList.add('hidden');
        document.getElementById('panel-combat').classList.remove('hidden');

        // 전투 플레이어 이름/직업 세팅
        document.getElementById('combat-player-name').textContent = window.player.name;
        document.getElementById('combat-player-icon').textContent = window.CLASSES_DATA[window.player.classId].icon;

        window.combatManager.startBattle(monsterId, (isWin, isFled) => {
            this.updateTopStats();
            this.switchToExploration();
            if (callback) callback(isWin, isFled);
        });
    }

    openInventoryModal() {
        const modal = document.getElementById('inventory-modal');
        const grid = document.getElementById('inventory-items-grid');
        const eqWeapon = document.getElementById('equipped-weapon-slot');
        const eqArmor = document.getElementById('equipped-armor-slot');
        const eqAcc = document.getElementById('equipped-accessory-slot');

        // 장착 장비 렌더링
        const renderEquipSlot = (slotEl, itemId, slotName) => {
            if (itemId && window.ITEMS_DATA[itemId]) {
                const item = window.ITEMS_DATA[itemId];
                slotEl.innerHTML = `
                    <div class="slot-icon">${item.icon}</div>
                    <div class="slot-info">
                        <div class="slot-name">${item.name}</div>
                        <div class="slot-stats">${this.formatItemStats(item)}</div>
                    </div>
                    <button class="btn-unequip">해제</button>
                `;
                slotEl.querySelector('.btn-unequip').onclick = () => {
                    window.player.unequip(slotName);
                    this.openInventoryModal();
                    this.updateTopStats();
                };
            } else {
                slotEl.innerHTML = `<span class="empty-slot">장착 없음 (${slotName})</span>`;
            }
        };

        renderEquipSlot(eqWeapon, window.player.equipment.weapon, 'weapon');
        renderEquipSlot(eqArmor, window.player.equipment.armor, 'armor');
        renderEquipSlot(eqAcc, window.player.equipment.accessory, 'accessory');

        // 인벤토리 아이템 렌더링
        grid.innerHTML = "";
        if (window.player.inventory.length === 0) {
            grid.innerHTML = `<div class="empty-inv-msg">소지품이 비어 있습니다.</div>`;
        } else {
            window.player.inventory.forEach(invItem => {
                const item = window.ITEMS_DATA[invItem.id];
                if (!item) return;

                const card = document.createElement('div');
                card.className = `inv-item-card rarity-${item.rarity}`;
                card.innerHTML = `
                    <div class="inv-item-top">
                        <span class="inv-item-icon">${item.icon}</span>
                        <span class="inv-item-qty">x${invItem.qty}</span>
                    </div>
                    <div class="inv-item-name">${item.name}</div>
                    <div class="inv-item-desc">${item.desc}</div>
                    <div class="inv-item-stats">${this.formatItemStats(item)}</div>
                    <div class="inv-item-actions">
                        ${['weapon', 'armor', 'accessory'].includes(item.type) 
                            ? `<button class="btn-equip">장착</button>` 
                            : `<button class="btn-use">사용</button>`
                        }
                    </div>
                `;

                const btnEquip = card.querySelector('.btn-equip');
                if (btnEquip) {
                    btnEquip.onclick = () => {
                        window.player.equip(item.id);
                        this.openInventoryModal();
                        this.updateTopStats();
                    };
                }

                const btnUse = card.querySelector('.btn-use');
                if (btnUse) {
                    btnUse.onclick = () => {
                        const res = window.player.useItem(item.id);
                        this.showNotification(res.message);
                        this.openInventoryModal();
                        this.updateTopStats();
                    };
                }

                grid.appendChild(card);
            });
        }

        modal.classList.add('active');
        this.activeModal = modal;
    }

    openStatsModal() {
        const modal = document.getElementById('stats-modal');
        const classData = window.CLASSES_DATA[window.player.classId];

        document.getElementById('stat-sheet-name').textContent = `${window.player.name} (${classData.name})`;
        document.getElementById('stat-sheet-level').textContent = `Lv.${window.player.level}`;
        document.getElementById('stat-sheet-exp').textContent = `${window.player.exp} / ${window.player.nextExp}`;
        document.getElementById('stat-sheet-atk').textContent = window.player.getTotalAtk();
        document.getElementById('stat-sheet-def').textContent = window.player.getTotalDef();
        
        const freePointsEl = document.getElementById('stat-free-points');
        freePointsEl.textContent = window.player.freeStatPoints;

        const statRowsContainer = document.getElementById('stat-sheet-rows');
        statRowsContainer.innerHTML = "";

        const statsList = [
            { key: 'str', name: 'STR (근력)', desc: '물리 공격력 및 강타 위력에 영향' },
            { key: 'dex', name: 'DEX (민첩)', desc: '함정 해제, 도주 및 순발력에 영향' },
            { key: 'con', name: 'CON (체력)', desc: '최대 체력 및 방어력에 영향' },
            { key: 'int', name: 'INT (지능)', desc: '마법 공격력, 최대 마나 및 룬 해독에 영향' },
            { key: 'wis', name: 'WIS (지혜)', desc: '치유량, 신성 마법 및 감응 판정에 영향' }
        ];

        statsList.forEach(s => {
            const total = window.player.getTotalStat(s.key);
            const mod = window.player.getModifier(s.key);
            const modSign = mod >= 0 ? `+${mod}` : `${mod}`;

            const row = document.createElement('div');
            row.className = 'stat-sheet-row';
            row.innerHTML = `
                <div class="stat-info">
                    <span class="stat-name">${s.name}</span>
                    <span class="stat-mod">(보정치: ${modSign})</span>
                    <div class="stat-desc">${s.desc}</div>
                </div>
                <div class="stat-val-control">
                    <strong class="stat-val">${total}</strong>
                    ${window.player.freeStatPoints > 0 ? `<button class="btn-stat-plus" data-stat="${s.key}">+1</button>` : ''}
                </div>
            `;

            const plusBtn = row.querySelector('.btn-stat-plus');
            if (plusBtn) {
                plusBtn.onclick = () => {
                    window.player.allocateStat(s.key);
                    window.soundEngine.playLevelUp();
                    this.openStatsModal();
                    this.updateTopStats();
                };
            }

            statRowsContainer.appendChild(row);
        });

        modal.classList.add('active');
        this.activeModal = modal;
    }

    formatItemStats(item) {
        if (!item.stats) return "";
        const parts = [];
        if (item.stats.atk) parts.push(`공격력 +${item.stats.atk}`);
        if (item.stats.def) parts.push(`방어력 +${item.stats.def}`);
        if (item.stats.maxHp) parts.push(`최대 HP +${item.stats.maxHp}`);
        if (item.stats.maxMp) parts.push(`최대 MP +${item.stats.maxMp}`);
        if (item.stats.str) parts.push(`근력 +${item.stats.str}`);
        if (item.stats.dex) parts.push(`민첩 +${item.stats.dex}`);
        if (item.stats.con) parts.push(`체력 +${item.stats.con}`);
        if (item.stats.int) parts.push(`지능 +${item.stats.int}`);
        if (item.stats.wis) parts.push(`지혜 +${item.stats.wis}`);
        return parts.join(' | ');
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
        this.activeModal = null;
    }

    showNotification(message, type = "info") {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast-message toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 400);
        }, 2800);
    }

    showChapterCompleteModal(chapterName, nextCallback) {
        const modal = document.getElementById('chapter-modal');
        document.getElementById('chapter-modal-title').textContent = `${chapterName} 정복 완료!`;
        document.getElementById('chapter-modal-desc').innerHTML = `
            지하의 악몽을 뚫고 챕터의 보스를 격파했습니다!<br>
            상처를 추스르고 다음 심연의 구역으로 진입합니다.
        `;

        const proceedBtn = document.getElementById('btn-chapter-proceed');
        proceedBtn.onclick = () => {
            modal.classList.remove('active');
            if (nextCallback) nextCallback();
        };

        modal.classList.add('active');
    }

    showGameOverModal() {
        const modal = document.getElementById('gameover-modal');
        document.getElementById('btn-gameover-restart').onclick = () => {
            window.player.deleteSave();
            modal.classList.remove('active');
            this.switchView('title');
        };
        modal.classList.add('active');
    }

    showVictoryModal() {
        const modal = document.getElementById('victory-modal');
        document.getElementById('btn-victory-restart').onclick = () => {
            window.player.deleteSave();
            modal.classList.remove('active');
            this.switchView('title');
        };
        modal.classList.add('active');
    }

    showLevelUpModal(expResult) {
        const modal = document.getElementById('levelup-modal');
        if (!modal) return;

        window.soundEngine.playLevelUp();

        document.getElementById('levelup-modal-title').textContent = `🎉 LEVEL UP! (Lv.${expResult.newLevel})`;
        document.getElementById('levelup-modal-subtitle').innerHTML = `
            레벨이 <strong>Lv.${expResult.oldLevel}</strong>에서 <strong class="text-gold">Lv.${expResult.newLevel}</strong>(으)로 상승했습니다!
        `;

        const skillsBox = document.getElementById('levelup-new-skills-box');
        skillsBox.innerHTML = "";

        if (expResult.newSkills && expResult.newSkills.length > 0) {
            const title = document.createElement('div');
            title.style.fontWeight = '700';
            title.style.color = '#f3e5ab';
            title.style.marginBottom = '6px';
            title.textContent = '🌟 새로 습득한 스킬:';
            skillsBox.appendChild(title);

            expResult.newSkills.forEach(s => {
                const card = document.createElement('div');
                card.className = 'new-skill-card';
                card.innerHTML = `
                    <div class="new-skill-header">
                        <span class="new-skill-title">${s.icon} ${s.name}</span>
                        <span class="new-skill-badge">${s.mpCost} MP</span>
                    </div>
                    <div class="new-skill-desc">${s.desc}</div>
                `;
                skillsBox.appendChild(card);
            });
        } else {
            skillsBox.innerHTML = `
                <div style="font-size:0.9rem; color:var(--text-secondary); padding:10px; background:rgba(0,0,0,0.2); border-radius:4px;">
                    기본 체력과 마나가 대폭 증가하고 공격력/방어력이 상승했습니다!
                </div>
            `;
        }

        const confirmBtn = document.getElementById('btn-levelup-confirm');
        confirmBtn.onclick = () => {
            modal.classList.remove('active');
            this.updateTopStats();
        };

        modal.classList.add('active');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();
});

