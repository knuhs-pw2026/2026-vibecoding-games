/**
 * [방탈출 / 텍스트 어드벤처] 인벤토리 & 아이템 조합 시스템
 */

class InventoryManager {
  constructor(game) {
    this.game = game;
    this.items = []; // 아이템 ID 목록 (문자열 배열)
    this.selectedItem = null;
  }

  // 아이템 추가
  addItem(itemId) {
    if (!window.STORY_DATA.items[itemId]) {
      console.warn(`[Inventory] 존재하지 않는 아이템 ID: ${itemId}`);
      return false;
    }
    if (!this.items.includes(itemId)) {
      this.items.push(itemId);
      if (window.soundEngine) window.soundEngine.playItemAcquire();
      this.render();
      return true;
    }
    return false;
  }

  // 아이템 제거
  removeItem(itemId) {
    const idx = this.items.indexOf(itemId);
    if (idx !== -1) {
      this.items.splice(idx, 1);
      if (this.selectedItem === itemId) {
        this.selectedItem = null;
      }
      this.render();
      return true;
    }
    return false;
  }

  // 소지 여부 확인
  hasItem(itemId) {
    return this.items.includes(itemId);
  }

  // 아이템 상세 정보 가져오기
  getItemData(itemId) {
    return window.STORY_DATA.items[itemId] || null;
  }

  // 아이템 선택 (조합 또는 조사용)
  selectItem(itemId) {
    const itemData = this.getItemData(itemId);
    if (!itemData) return;

    if (this.selectedItem === itemId) {
      // 이미 선택된 아이템을 다시 클릭하면 해제
      this.selectedItem = null;
      this.render();
      return;
    }

    if (this.selectedItem && this.selectedItem !== itemId) {
      // 두 번째 아이템 클릭 시 -> 조합 시도!
      this.tryCombine(this.selectedItem, itemId);
      return;
    }

    this.selectedItem = itemId;
    this.render();
    if (window.soundEngine) window.soundEngine.playClick();
  }

  // 아이템 조합 로직
  tryCombine(item1Id, item2Id) {
    const item1 = this.getItemData(item1Id);
    const item2 = this.getItemData(item2Id);

    // 조합 1: 방전된 손전등 + AA 배터리 -> 작동하는 손전등
    if (
      (item1Id === "empty_flashlight" && item2Id === "battery") ||
      (item1Id === "battery" && item2Id === "empty_flashlight")
    ) {
      this.removeItem("empty_flashlight");
      this.removeItem("battery");
      this.addItem("flashlight");
      if (window.soundEngine) window.soundEngine.playCombine();
      this.game.showToast("⚡ [작동하는 손전등] 조합 성공! 이제 어두운 복도를 밝힐 수 있습니다.");
      this.openInspectModal("flashlight");
      this.selectedItem = null;
      this.render();
      return true;
    }

    // 조합 2: 찢어진 일기장 1 + 찢어진 일기장 2 -> 완성된 선배의 일기
    if (
      (item1Id === "diary_piece_1" && item2Id === "diary_piece_2") ||
      (item1Id === "diary_piece_2" && item2Id === "diary_piece_1")
    ) {
      this.removeItem("diary_piece_1");
      this.removeItem("diary_piece_2");
      this.addItem("complete_diary");
      if (window.soundEngine) window.soundEngine.playCombine();
      this.game.showToast("📖 [완성된 선배의 일기] 조합 성공! 타임캡슐 암호(1999)를 확인했습니다.");
      this.openInspectModal("complete_diary");
      this.selectedItem = null;
      this.render();
      return true;
    }

    // 조합 3: 빨간색 시약 + 파란색 시약 -> 특수 금속 부식액
    if (
      (item1Id === "red_chemical" && item2Id === "blue_chemical") ||
      (item1Id === "blue_chemical" && item2Id === "red_chemical")
    ) {
      this.removeItem("red_chemical");
      this.removeItem("blue_chemical");
      this.addItem("reagent_solution");
      if (window.soundEngine) window.soundEngine.playCombine();
      this.game.showToast("🧪 [특수 금속 부식액] 합성 성공! 쇠사슬을 녹일 수 있습니다.");
      this.openInspectModal("reagent_solution");
      this.selectedItem = null;
      this.render();
      return true;
    }

    // 조합 불가능한 경우
    if (window.soundEngine) window.soundEngine.playError();
    this.game.showToast("❌ 두 아이템은 서로 결합할 수 없습니다.");
    this.selectedItem = null;
    this.render();
    return false;
  }

  // 아이템 조사 모달 열기
  openInspectModal(itemId) {
    const item = this.getItemData(itemId);
    if (!item) return;

    const modal = document.getElementById("item-inspect-modal");
    if (!modal) return;

    document.getElementById("inspect-item-icon").textContent = item.icon;
    document.getElementById("inspect-item-name").textContent = item.name;
    document.getElementById("inspect-item-category").textContent = `[${item.category}]`;
    document.getElementById("inspect-item-desc").textContent = item.description;

    const combineHint = item.combinableWith
      ? `💡 다른 아이템과 조합할 수 있을 것 같다.`
      : `단독으로 사용하거나 단서로 확인하는 아이템입니다.`;
    document.getElementById("inspect-item-hint").textContent = combineHint;

    modal.classList.add("active");
    if (window.soundEngine) window.soundEngine.playClick();
  }

  // 인벤토리 UI 렌더링
  render() {
    const dockContainer = document.getElementById("quick-inventory-items");
    const modalContainer = document.getElementById("modal-inventory-list");
    const countBadge = document.getElementById("inventory-count-badge");

    if (countBadge) {
      countBadge.textContent = this.items.length;
    }

    // 1. 하단 퀵 인벤토리 바 렌더링 (최대 6슬롯)
    if (dockContainer) {
      dockContainer.innerHTML = "";
      for (let i = 0; i < 6; i++) {
        const slot = document.createElement("div");
        slot.className = "inventory-slot";

        if (i < this.items.length) {
          const itemId = this.items[i];
          const item = this.getItemData(itemId);
          slot.classList.add("filled");
          if (this.selectedItem === itemId) {
            slot.classList.add("selected");
          }

          slot.innerHTML = `
            <span class="item-icon">${item.icon}</span>
            <span class="item-name-tag">${item.name}</span>
          `;

          slot.addEventListener("click", () => {
            this.selectItem(itemId);
          });
          slot.addEventListener("dblclick", () => {
            this.openInspectModal(itemId);
          });
          slot.title = `${item.name} (클릭: 선택/조합, 더블클릭: 조사)`;
        } else {
          slot.innerHTML = `<span class="empty-slot-plus">+</span>`;
        }

        dockContainer.appendChild(slot);
      }
    }

    // 2. 전체 인벤토리 모달 렌더링
    if (modalContainer) {
      modalContainer.innerHTML = "";
      if (this.items.length === 0) {
        modalContainer.innerHTML = `<div class="empty-inventory-msg">가방이 비어있습니다. 방을 조사하여 아이템을 모아보세요.</div>`;
      } else {
        this.items.forEach((itemId) => {
          const item = this.getItemData(itemId);
          const card = document.createElement("div");
          card.className = `inventory-card ${this.selectedItem === itemId ? "selected" : ""}`;
          card.innerHTML = `
            <div class="card-icon">${item.icon}</div>
            <div class="card-info">
              <div class="card-header">
                <span class="card-name">${item.name}</span>
                <span class="card-category">${item.category}</span>
              </div>
              <div class="card-desc">${item.description}</div>
            </div>
            <button class="inspect-btn">🔍 조사</button>
          `;

          card.addEventListener("click", (e) => {
            if (e.target.classList.contains("inspect-btn")) {
              this.openInspectModal(itemId);
            } else {
              this.selectItem(itemId);
            }
          });

          modalContainer.appendChild(card);
        });
      }
    }
  }
}

window.InventoryManager = InventoryManager;
