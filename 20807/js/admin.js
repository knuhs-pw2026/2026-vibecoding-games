// admin.js - 군성제 관리자 인증 및 대시보드 (암호 123456, 신고 제거)

const AdminManager = {
  isLoggedIn: false,

  init() {
    const sessionAuth = sessionStorage.getItem(CONFIG.STORAGE_KEYS.ADMIN_AUTH);
    if (sessionAuth === "true") {
      this.setAdminState(true, false);
    }
  },

  login(password) {
    if (password === CONFIG.ADMIN_PASSWORD) {
      sessionStorage.setItem(CONFIG.STORAGE_KEYS.ADMIN_AUTH, "true");
      this.setAdminState(true, true);
      return { success: true };
    }
    return { success: false, msg: "비밀번호가 일치하지 않습니다." };
  },

  logout() {
    sessionStorage.removeItem(CONFIG.STORAGE_KEYS.ADMIN_AUTH);
    this.setAdminState(false, true);
  },

  setAdminState(isAuth, showToast = false) {
    this.isLoggedIn = isAuth;
    if (isAuth) {
      document.body.classList.add("admin-mode-active");
      const btn = document.getElementById("adminToggleBtn");
      if (btn) {
        btn.innerHTML = `<span>👑 관리자 ON</span>`;
        btn.classList.add("btn-admin-active");
      }
      if (showToast && typeof showToastMessage === "function") {
        showToastMessage("👑 관리자 모드가 활성화되었습니다. (삭제 권한 부여)");
      }
    } else {
      document.body.classList.remove("admin-mode-active");
      const btn = document.getElementById("adminToggleBtn");
      if (btn) {
        btn.innerHTML = `<span>🔒 관리자 로그인</span>`;
        btn.classList.remove("btn-admin-active");
      }
      if (showToast && typeof showToastMessage === "function") {
        showToastMessage("🔒 관리자 모드가 종료되었습니다.");
      }
    }

    if (typeof App !== "undefined") {
      App.updateMainBillboard();
      App.renderMessages();
    }
  },

  confirmAndDeleteMessage(messageId) {
    if (!this.isLoggedIn) {
      this.showLoginModal();
      return;
    }

    const messages = StorageManager.getMessages();
    const target = messages.find(m => m.id === messageId);
    if (!target) return;

    const confirmed = confirm(`[관리자 삭제]\n"${target.nickname}"님의 방명록을 정말 삭제하시겠습니까?\n\n내용: "${target.content.substring(0, 30)}..."`);
    if (confirmed) {
      StorageManager.deleteMessage(messageId, "관리자 즉시 삭제");
      if (typeof showToastMessage === "function") {
        showToastMessage("🗑️ 해당 방명록이 안전하게 삭제되었습니다.");
      }
      if (typeof App !== "undefined") {
        App.updateMainBillboard();
        App.renderMessages();
      }
    }
  },

  togglePinMessage(messageId) {
    if (!this.isLoggedIn) return;
    const messages = StorageManager.getMessages();
    const target = messages.find(m => m.id === messageId);
    if (target) {
      target.isPinned = !target.isPinned;
      StorageManager.saveMessages(messages, `공지 고정 토글: [${target.nickname}]`);
      if (typeof showToastMessage === "function") {
        showToastMessage(target.isPinned ? "📌 카드가 상단에 고정되었습니다." : "📌 고정이 해제되었습니다.");
      }
      if (typeof App !== "undefined") {
        App.updateMainBillboard();
        App.renderMessages();
      }
    }
  },

  openDashboard() {
    if (!this.isLoggedIn) {
      this.showLoginModal();
      return;
    }

    const modal = document.getElementById("adminDashboardModal");
    if (!modal) return;

    this.renderDashboardTab("messages");
    modal.classList.add("active");
  },

  renderDashboardTab(tabName) {
    const tabs = document.querySelectorAll(".admin-tab-btn");
    tabs.forEach(tab => {
      tab.classList.toggle("active", tab.dataset.tab === tabName);
    });

    const contentContainer = document.getElementById("adminTabContent");
    if (!contentContainer) return;

    if (tabName === "messages") {
      this.renderMessagesTab(contentContainer);
    } else if (tabName === "backups") {
      this.renderBackupsTab(contentContainer);
    }
  },

  renderMessagesTab(container) {
    const messages = StorageManager.getMessages();
    
    let html = `
      <div class="admin-table-header">
        <div class="admin-table-title">
          <h4>전체 방명록 관리 (${messages.length}건)</h4>
          <span class="text-muted">군성제에 등록된 모든 글을 모니터링하고 일괄 삭제할 수 있습니다.</span>
        </div>
        <div class="admin-table-actions">
          <button class="btn btn-sm btn-outline-danger" id="bulkDeleteBtn" onclick="AdminManager.handleBulkDelete()">
            선택 항목 일괄 삭제
          </button>
        </div>
      </div>
      <div class="admin-table-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th width="40"><input type="checkbox" id="selectAllCheckbox" onchange="AdminManager.toggleSelectAll(this)"></th>
              <th>작성자</th>
              <th>내용 미리보기</th>
              <th width="120">작성일시</th>
              <th width="110">관리</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (messages.length === 0) {
      html += `<tr><td colspan="5" class="text-center py-4 text-muted">등록된 방명록이 없습니다.</td></tr>`;
    } else {
      messages.forEach(m => {
        const timeStr = new Date(m.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

        html += `
          <tr>
            <td><input type="checkbox" class="msg-checkbox" value="${m.id}"></td>
            <td>
              <strong>${this.escapeHtml(m.nickname)}</strong>
              ${m.isPinned ? '<span class="badge-pin">📌 고정</span>' : ''}
            </td>
            <td class="msg-content-cell" title="${this.escapeHtml(m.content)}">
              ${this.escapeHtml(m.content)}
            </td>
            <td><small class="text-muted">${timeStr}</small></td>
            <td>
              <button class="btn-action-mini pin" onclick="AdminManager.togglePinMessage('${m.id}')" title="상단 고정">📌</button>
              <button class="btn-action-mini delete" onclick="AdminManager.deleteSingleFromDashboard('${m.id}')" title="삭제">🗑️</button>
            </td>
          </tr>
        `;
      });
    }

    html += `</tbody></table></div>`;
    container.innerHTML = html;
  },

  renderBackupsTab(container) {
    const snapshots = StorageManager.getSnapshots();

    let html = `
      <div class="admin-backups-manager">
        <div class="admin-table-title">
          <h4>🛡️ 자동 백업 스냅샷 및 복구 센터</h4>
          <p class="text-muted">실수로 글을 삭제하거나 데이터가 변경되었을 때 이전 복원 지점으로 되돌릴 수 있습니다.</p>
        </div>

        <div class="backup-quick-actions">
          <button class="btn btn-success" onclick="StorageManager.exportJSON()">
            💾 전체 데이터 JSON 백업 다운로드
          </button>
          <button class="btn btn-outline" onclick="StorageManager.exportCSV()">
            📊 엑셀/CSV 목록 다운로드
          </button>
          <button class="btn btn-primary" onclick="AdminManager.createManualSnapshot()">
            📸 지금 즉시 스냅샷 생성
          </button>
        </div>

        <h5 class="mt-4 mb-2">🕒 최근 자동 복원 지점 (${snapshots.length}개)</h5>
        <div class="snapshots-timeline">
    `;

    if (snapshots.length === 0) {
      html += `<p class="text-muted">기록된 스냅샷이 없습니다.</p>`;
    } else {
      snapshots.forEach((snap, idx) => {
        html += `
          <div class="snapshot-item">
            <div class="snapshot-info">
              <span class="snapshot-badge">${idx === 0 ? '최신 지점' : `#${idx + 1}`}</span>
              <strong>${snap.formattedTime}</strong>
              <span class="snapshot-reason">(${snap.reason} - 방명록 ${snap.messageCount}건)</span>
            </div>
            <button class="btn btn-sm btn-outline-warning" onclick="AdminManager.confirmRollback('${snap.id}')">
              ↩️ 이 시점으로 롤백
            </button>
          </div>
        `;
      });
    }

    html += `
        </div>
      </div>
    `;
    container.innerHTML = html;
  },

  deleteSingleFromDashboard(messageId) {
    const confirmed = confirm("정말 이 방명록을 삭제하시겠습니까?");
    if (confirmed) {
      StorageManager.deleteMessage(messageId, "관리자 대시보드 삭제");
      if (typeof showToastMessage === "function") {
        showToastMessage("🗑️ 메시지가 삭제되었습니다.");
      }
      this.renderDashboardTab("messages");
      if (typeof App !== "undefined") {
        App.updateMainBillboard();
        App.renderMessages();
      }
    }
  },

  toggleSelectAll(masterCheckbox) {
    const checkboxes = document.querySelectorAll(".msg-checkbox");
    checkboxes.forEach(cb => cb.checked = masterCheckbox.checked);
  },

  handleBulkDelete() {
    const checkboxes = document.querySelectorAll(".msg-checkbox:checked");
    const ids = Array.from(checkboxes).map(cb => cb.value);

    if (ids.length === 0) {
      alert("삭제할 항목을 먼저 선택해주세요.");
      return;
    }

    const confirmed = confirm(`선택한 ${ids.length}개의 방명록을 정말 일괄 삭제하시겠습니까?`);
    if (confirmed) {
      const deletedCount = StorageManager.deleteMultipleMessages(ids, `관리자 ${ids.length}건 일괄 삭제`);
      if (typeof showToastMessage === "function") {
        showToastMessage(`🗑️ ${deletedCount}개의 방명록이 일괄 삭제되었습니다.`);
      }
      this.renderDashboardTab("messages");
      if (typeof App !== "undefined") {
        App.updateMainBillboard();
        App.renderMessages();
      }
    }
  },

  createManualSnapshot() {
    StorageManager.createSnapshot("관리자 수동 스냅샷 생성");
    if (typeof showToastMessage === "function") {
      showToastMessage("📸 현재 상태 스냅샷이 생성되었습니다.");
    }
    this.renderDashboardTab("backups");
  },

  confirmRollback(snapshotId) {
    const confirmed = confirm("⚠️ 정말 이 시점으로 데이터를 롤백하시겠습니까?");
    if (confirmed) {
      const res = StorageManager.rollbackSnapshot(snapshotId);
      if (res.success) {
        if (typeof showToastMessage === "function") {
          showToastMessage(`↩️ [${res.timestamp}] 시점으로 데이터가 성공적으로 롤백되었습니다.`);
        }
        this.renderDashboardTab("backups");
        if (typeof App !== "undefined") {
          App.updateMainBillboard();
          App.renderMessages();
        }
      } else {
        alert(res.msg);
      }
    }
  },

  showLoginModal() {
    const modal = document.getElementById("adminLoginModal");
    if (modal) {
      const pwdInput = document.getElementById("adminPasswordInput");
      if (pwdInput) pwdInput.value = "";
      modal.classList.add("active");
      setTimeout(() => pwdInput && pwdInput.focus(), 100);
    }
  },

  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};

if (typeof window !== "undefined") {
  window.AdminManager = AdminManager;
}
