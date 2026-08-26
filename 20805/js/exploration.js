/**
 * 던전 탐험 & 시나리오 분기 엔진
 */
class ExplorationManager {
    constructor() {
        this.currentChapter = null;
        this.currentNode = null;
        this.isProcessing = false;
    }

    /**
     * 특정 챕터/노드로 탐험 시작 또는 재개
     */
    loadCurrentNode() {
        const chapterIdx = window.player.currentChapterIndex || 0;
        const chapter = window.CHAPTERS_DATA[chapterIdx];
        if (!chapter) {
            this.handleGameVictory();
            return;
        }

        this.currentChapter = chapter;
        const nodeId = window.player.currentNodeId || chapter.nodes[0].id;
        let node = chapter.nodes.find(n => n.id === nodeId);

        if (!node) {
            node = chapter.nodes[0];
            window.player.currentNodeId = node.id;
        }

        this.currentNode = node;
        this.renderNodeUI();
    }

    /**
     * 노드 UI 렌더링
     */
    renderNodeUI() {
        const chapterTitleEl = document.getElementById('explore-chapter-title');
        const nodeTitleEl = document.getElementById('explore-node-title');
        const storyTextEl = document.getElementById('explore-story-text');
        const choicesContainer = document.getElementById('explore-choices-container');
        const merchantContainer = document.getElementById('explore-merchant-container');

        if (chapterTitleEl) chapterTitleEl.textContent = this.currentChapter.name;
        if (nodeTitleEl) nodeTitleEl.textContent = `📍 ${this.currentNode.title}`;
        if (storyTextEl) storyTextEl.innerHTML = this.currentNode.desc;

        if (merchantContainer) merchantContainer.classList.add('hidden');
        if (choicesContainer) {
            choicesContainer.innerHTML = "";
            choicesContainer.classList.remove('hidden');
        }

        // 노드 타입별 UI 처리
        if (this.currentNode.type === "combat") {
            // 전투 노드
            const startBtn = document.createElement('button');
            startBtn.className = 'btn-choice btn-primary-gold';
            startBtn.innerHTML = `⚔️ 무기를 빼어들고 전투에 돌입한다!`;
            startBtn.onclick = () => {
                window.app.switchToCombat(this.currentNode.monsterId, (isWin, isFled) => {
                    if (isWin) {
                        this.advanceToNode(this.currentNode.nextNode);
                    } else if (isFled) {
                        // 도주 시 이전 노드 또는 현재 유지
                        this.renderNodeUI();
                    } else {
                        // 패배
                        window.app.showGameOverModal();
                    }
                });
            };
            choicesContainer.appendChild(startBtn);

        } else if (this.currentNode.type === "merchant") {
            // 상인 노드
            this.renderMerchantUI();

        } else if (this.currentNode.choices && this.currentNode.choices.length > 0) {
            // 선택지 노드
            this.currentNode.choices.forEach(choice => {
                const btn = document.createElement('button');
                btn.className = 'btn-choice';
                btn.innerHTML = choice.text;
                btn.onclick = () => this.handleChoice(choice);
                choicesContainer.appendChild(btn);
            });
        }
    }

    /**
     * 상인 상점 UI 렌더링 (구매 & 판매 탭 지원)
     */
    renderMerchantUI(currentTab = "buy") {
        const merchantContainer = document.getElementById('explore-merchant-container');
        const choicesContainer = document.getElementById('explore-choices-container');
        const itemsListEl = document.getElementById('merchant-items-list');

        if (!merchantContainer || !itemsListEl) return;

        merchantContainer.classList.remove('hidden');
        choicesContainer.innerHTML = "";

        // 상단 탭 헤더
        const headerEl = merchantContainer.querySelector('h3') || merchantContainer;
        let tabsContainer = document.getElementById('merchant-tabs-row');
        if (!tabsContainer) {
            tabsContainer = document.createElement('div');
            tabsContainer.id = 'merchant-tabs-row';
            tabsContainer.className = 'merchant-tabs-row';
            merchantContainer.insertBefore(tabsContainer, itemsListEl);
        }

        tabsContainer.innerHTML = `
            <button class="btn-tab ${currentTab === 'buy' ? 'active' : ''}" id="tab-merchant-buy">🛍️ 상점 물품 구매</button>
            <button class="btn-tab ${currentTab === 'sell' ? 'active' : ''}" id="tab-merchant-sell">💰 소지품 판매</button>
        `;

        document.getElementById('tab-merchant-buy').onclick = () => this.renderMerchantUI('buy');
        document.getElementById('tab-merchant-sell').onclick = () => this.renderMerchantUI('sell');

        itemsListEl.innerHTML = "";

        if (currentTab === "buy") {
            const itemsForSale = this.currentNode.itemsForSale || ["hp_potion_small", "mp_potion_small"];
            itemsForSale.forEach(itemId => {
                const item = window.ITEMS_DATA[itemId];
                if (!item) return;

                const itemCard = document.createElement('div');
                itemCard.className = `merchant-item-card rarity-${item.rarity}`;
                itemCard.innerHTML = `
                    <div class="item-header">
                        <span class="item-icon">${item.icon}</span>
                        <span class="item-name">${item.name}</span>
                    </div>
                    <div class="item-desc">${item.desc}</div>
                    <div class="item-buy-row">
                        <span class="item-price">💰 ${item.price} 골드</span>
                        <button class="btn-buy" ${window.player.gold < item.price ? 'disabled' : ''}>구매</button>
                    </div>
                `;

                const buyBtn = itemCard.querySelector('.btn-buy');
                buyBtn.onclick = () => {
                    if (window.player.gold >= item.price) {
                        window.player.gold -= item.price;
                        window.player.addItem(item.id, 1);
                        window.app.updateTopStats();
                        this.renderMerchantUI('buy');
                        window.app.showNotification(`[${item.name}]을(를) 구매했습니다!`, "success");
                    }
                };

                itemsListEl.appendChild(itemCard);
            });
        } else {
            // 소지품 판매 탭
            if (window.player.inventory.length === 0) {
                itemsListEl.innerHTML = `<div class="empty-inv-msg" style="grid-column: 1/-1; text-align:center; padding: 20px; color: var(--text-muted);">판매할 소지품이 없습니다.</div>`;
            } else {
                window.player.inventory.forEach(invItem => {
                    const item = window.ITEMS_DATA[invItem.id];
                    if (!item) return;

                    const sellPrice = Math.max(5, Math.floor((item.price || 20) * 0.5));
                    const itemCard = document.createElement('div');
                    itemCard.className = `merchant-item-card rarity-${item.rarity}`;
                    itemCard.innerHTML = `
                        <div class="item-header">
                            <span class="item-icon">${item.icon}</span>
                            <span class="item-name">${item.name} (보유: ${invItem.qty})</span>
                        </div>
                        <div class="item-desc">${item.desc}</div>
                        <div class="item-buy-row">
                            <span class="item-price" style="color: #06d6a0;">판매가: +${sellPrice} 골드</span>
                            <button class="btn-sell">판매</button>
                        </div>
                    `;

                    const sellBtn = itemCard.querySelector('.btn-sell');
                    sellBtn.onclick = () => {
                        const res = window.player.sellItem(item.id, 1);
                        if (res.success) {
                            window.app.updateTopStats();
                            this.renderMerchantUI('sell');
                            window.app.showNotification(res.message, "success");
                        }
                    };

                    itemsListEl.appendChild(itemCard);
                });
            }
        }

        // 상점 떠나기 버튼
        const leaveBtn = document.createElement('button');
        leaveBtn.className = 'btn-choice btn-leave-shop';
        leaveBtn.innerHTML = `🚶 상점을 떠나 다음 구역으로 전진한다.`;
        leaveBtn.onclick = () => {
            this.advanceToNode(this.currentNode.nextNode);
        };
        choicesContainer.appendChild(leaveBtn);
    }

    /**
     * 선택지 클릭 처리
     */
    async handleChoice(choice) {
        if (this.isProcessing) return;
        this.isProcessing = true;

        if (choice.type === "branch") {
            this.advanceToNode(choice.targetNode);
            this.isProcessing = false;
            return;
        }

        if (choice.type === "direct") {
            if (choice.desc) {
                window.app.showNotification(choice.desc);
            }
            if (choice.successEffect) {
                const effect = choice.successEffect;
                if (effect.healHp) window.player.hp = Math.min(window.player.maxHp, window.player.hp + effect.healHp);
                if (effect.healMp) window.player.mp = Math.min(window.player.maxMp, window.player.mp + effect.healMp);
                if (effect.statIncrease) {
                    window.player.applyStatIncrease(effect.statIncrease);
                    window.soundEngine.playLevelUp();
                }
                if (effect.exp) {
                    const expRes = window.player.gainExp(effect.exp);
                    if (expRes.leveledUp && window.app.showLevelUpModal) window.app.showLevelUpModal(expRes);
                }
            }
            this.advanceToNode(choice.nextNode);
            this.isProcessing = false;
            return;
        }

        if (choice.type === "dice_check") {
            const statName = choice.stat || "dex";
            const modifier = window.player.getModifier(statName);
            const rollResult = await window.diceEngine.roll({
                modifier,
                dc: choice.dc,
                reason: choice.reason,
                statName: statName.toUpperCase()
            });

            if (rollResult.isSuccess) {
                // 성공 처리
                const effect = choice.successEffect;
                let msg = choice.successText || "판정에 성공했습니다!";

                if (effect) {
                    if (effect.healHp) window.player.hp = Math.min(window.player.maxHp, window.player.hp + effect.healHp);
                    if (effect.healMp) window.player.mp = Math.min(window.player.maxMp, window.player.mp + effect.healMp);
                    if (effect.gold) window.player.gold += effect.gold;
                    if (effect.addItem) window.player.addItem(effect.addItem, 1);
                    if (effect.statIncrease) {
                        window.player.applyStatIncrease(effect.statIncrease);
                        window.soundEngine.playLevelUp();
                    }
                    if (effect.exp) {
                        const expRes = window.player.gainExp(effect.exp);
                        if (expRes.leveledUp && window.app.showLevelUpModal) window.app.showLevelUpModal(expRes);
                    }
                    if (effect.text) msg = effect.text;
                }

                window.app.showNotification(msg, "success");
            } else {
                // 실패 처리
                const effect = choice.failEffect;
                let msg = choice.failText || "판정에 실패했습니다...";

                if (effect) {
                    if (effect.damage) {
                        window.player.hp = Math.max(0, window.player.hp - effect.damage);
                        window.soundEngine.playSlash();
                        if (window.player.hp <= 0) {
                            window.app.updateTopStats();
                            window.app.showGameOverModal();
                            this.isProcessing = false;
                            return;
                        }
                    }
                    if (effect.statIncrease) {
                        window.player.applyStatIncrease(effect.statIncrease);
                    }
                    if (effect.text) msg = effect.text;
                }

                window.app.showNotification(msg, "warning");
            }

            window.player.save();
            window.app.updateTopStats();

            setTimeout(() => {
                this.advanceToNode(choice.nextNode);
                this.isProcessing = false;
            }, 1000);
        }
    }

    /**
     * 다음 노드로 진행
     */
    advanceToNode(targetNodeId) {
        if (targetNodeId === "chapter_complete") {
            this.handleChapterComplete();
            return;
        }

        if (targetNodeId === "game_victory") {
            this.handleGameVictory();
            return;
        }

        window.player.currentNodeId = targetNodeId;
        window.player.save();
        this.loadCurrentNode();
    }

    /**
     * 챕터 완료 처리
     */
    handleChapterComplete() {
        window.soundEngine.playLevelUp();
        window.player.currentChapterIndex++;

        if (window.player.currentChapterIndex >= window.CHAPTERS_DATA.length) {
            this.handleGameVictory();
        } else {
            const nextChapter = window.CHAPTERS_DATA[window.player.currentChapterIndex];
            window.player.currentNodeId = nextChapter.nodes[0].id;
            window.player.save();

            window.app.showChapterCompleteModal(this.currentChapter.name, () => {
                this.loadCurrentNode();
            });
        }
    }

    /**
     * 게임 전체 승리 (엔딩)
     */
    handleGameVictory() {
        window.soundEngine.playVictory();
        window.app.showVictoryModal();
    }
}

window.explorationManager = new ExplorationManager();
