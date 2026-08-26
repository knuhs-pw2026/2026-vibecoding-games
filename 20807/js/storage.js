// storage.js - 로컬 저장소 및 다중 백업/복구 관리 엔진 (주간 테마, 신고 제거)

const StorageManager = {
  init() {
    if (!localStorage.getItem(CONFIG.STORAGE_KEYS.MESSAGES) || localStorage.getItem(CONFIG.STORAGE_KEYS.MESSAGES).includes("msg_sample_")) {
      this.saveMessages([], "군성제 방명록 초기화 (빈 상태 시작)", false);
    }
    if (!localStorage.getItem(CONFIG.STORAGE_KEYS.SNAPSHOTS)) {
      this.createSnapshot("군성제 라이브 전광판 시작");
    }

    this.setupBeforeUnloadProtection();
  },

  getMessages() {
    try {
      const data = localStorage.getItem(CONFIG.STORAGE_KEYS.MESSAGES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("메시지 파싱 실패:", e);
      return [];
    }
  },

  saveMessages(messages, reason = "데이터 변경", makeSnapshot = true) {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
      if (makeSnapshot) {
        this.createSnapshot(reason);
      }
      this.syncLatestJSONBackup();
      this.notifyBackupStatus();
      return true;
    } catch (e) {
      console.error("메시지 저장 실패:", e);
      return false;
    }
  },

  addMessage(messageData) {
    const messages = this.getMessages();
    const newMessage = {
      id: "msg_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      nickname: messageData.nickname || "익명의 군성인",
      content: messageData.content || "",
      theme: messageData.theme || "theme-sunny-lemon",
      font: messageData.font || "font-sans",
      sticker: messageData.sticker || "sticker-sparkle",
      createdAt: new Date().toISOString(),
      isPinned: false
    };

    messages.unshift(newMessage);
    this.saveMessages(messages, `새 방명록 등록: [${newMessage.nickname}]`);
    return newMessage;
  },

  deleteMessage(messageId, adminReason = "관리자 삭제") {
    const messages = this.getMessages();
    const targetIndex = messages.findIndex(m => m.id === messageId);
    if (targetIndex !== -1) {
      const deleted = messages.splice(targetIndex, 1)[0];
      this.saveMessages(messages, `방명록 삭제: [${deleted.nickname}] - ${adminReason}`);
      return true;
    }
    return false;
  },

  deleteMultipleMessages(messageIds, adminReason = "관리자 일괄 삭제") {
    let messages = this.getMessages();
    const initialCount = messages.length;
    messages = messages.filter(m => !messageIds.includes(m.id));
    const deletedCount = initialCount - messages.length;
    
    if (deletedCount > 0) {
      this.saveMessages(messages, `${deletedCount}개 방명록 일괄 삭제 - ${adminReason}`);
      return deletedCount;
    }
    return 0;
  },

  // ==================== 🛡️ 3중 백업 및 스냅샷 복구 시스템 ====================

  createSnapshot(reason = "자동 스냅샷") {
    try {
      let snapshots = this.getSnapshots();
      const messages = this.getMessages();

      const newSnapshot = {
        id: "snap_" + Date.now(),
        timestamp: new Date().toISOString(),
        formattedTime: new Date().toLocaleString("ko-KR"),
        reason: reason,
        messageCount: messages.length,
        data: {
          messages: messages
        }
      };

      snapshots.unshift(newSnapshot);
      if (snapshots.length > CONFIG.MAX_SNAPSHOTS) {
        snapshots = snapshots.slice(0, CONFIG.MAX_SNAPSHOTS);
      }

      localStorage.setItem(CONFIG.STORAGE_KEYS.SNAPSHOTS, JSON.stringify(snapshots));
      return newSnapshot;
    } catch (e) {
      console.error("스냅샷 생성 실패:", e);
      return null;
    }
  },

  getSnapshots() {
    try {
      const data = localStorage.getItem(CONFIG.STORAGE_KEYS.SNAPSHOTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  rollbackSnapshot(snapshotId) {
    const snapshots = this.getSnapshots();
    const target = snapshots.find(s => s.id === snapshotId);
    if (!target || !target.data) {
      return { success: false, msg: "해당 복원 지점을 찾을 수 없습니다." };
    }

    try {
      this.createSnapshot("롤백 직전 자동 백업");
      localStorage.setItem(CONFIG.STORAGE_KEYS.MESSAGES, JSON.stringify(target.data.messages || []));
      return { success: true, timestamp: target.formattedTime, count: target.messageCount };
    } catch (e) {
      return { success: false, msg: e.message };
    }
  },

  syncLatestJSONBackup() {
    const backupData = {
      version: "1.0",
      appName: CONFIG.APP_NAME,
      festivalName: CONFIG.FESTIVAL_NAME,
      lastUpdatedAt: new Date().toISOString(),
      formattedDate: new Date().toLocaleString("ko-KR"),
      totalCount: this.getMessages().length,
      messages: this.getMessages()
    };
    try {
      localStorage.setItem("fest_latest_backup_json", JSON.stringify(backupData, null, 2));
    } catch (e) {
      console.warn("로컬 백업 캐시 갱신 중 에러:", e);
    }
  },

  exportJSON() {
    const backupData = {
      version: "1.0",
      appName: CONFIG.APP_NAME,
      festivalName: CONFIG.FESTIVAL_NAME,
      exportedAt: new Date().toISOString(),
      formattedDate: new Date().toLocaleString("ko-KR"),
      messages: this.getMessages()
    };

    const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const now = new Date();
    const dateStr = now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") + "_" +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0");
    const fileName = `군성제_방명록_백업_${dateStr}.json`;

    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    return { fileName, count: backupData.messages.length };
  },

  exportCSV() {
    const messages = this.getMessages();
    let csvContent = "\uFEFF";
    csvContent += "ID,작성일시,작성자,내용\n";

    messages.forEach(m => {
      const cleanContent = `"${(m.content || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      const row = [
        m.id,
        new Date(m.createdAt).toLocaleString("ko-KR"),
        `"${m.nickname}"`,
        cleanContent
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const now = new Date();
    const dateStr = now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");
    const fileName = `군성제_방명록_목록_${dateStr}.csv`;

    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  importJSON(jsonString, mode = "replace") {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.messages)) {
        return { success: false, msg: "올바른 방명록 백업 JSON 형식이 아닙니다." };
      }

      this.createSnapshot("백업 파일 가져오기 직전 상태");

      if (mode === "replace") {
        this.saveMessages(parsed.messages, "백업 파일로 전체 덮어쓰기 복원");
        return { success: true, count: parsed.messages.length, mode: "replace" };
      } else {
        const currentMessages = this.getMessages();
        const existingIds = new Set(currentMessages.map(m => m.id));
        let addedCount = 0;

        parsed.messages.forEach(m => {
          if (!existingIds.has(m.id)) {
            currentMessages.push(m);
            addedCount++;
          }
        });

        this.saveMessages(currentMessages, `백업 파일 병합 복원 (+${addedCount}건)`);
        return { success: true, count: addedCount, mode: "merge" };
      }
    } catch (e) {
      return { success: false, msg: "파일 분석 오류: " + e.message };
    }
  },

  setupBeforeUnloadProtection() {
    window.addEventListener("beforeunload", (e) => {
      const input = document.getElementById("quickContent");
      if (input && input.value && input.value.trim().length > 3) {
        e.preventDefault();
        e.returnValue = "작성 중인 메시지가 있습니다. 정말 페이지를 벗어나시겠습니까?";
        return e.returnValue;
      }
    });
  },

  notifyBackupStatus() {
    const event = new CustomEvent("fest_data_changed", {
      detail: { timestamp: new Date().toISOString() }
    });
    window.dispatchEvent(event);
  }
};

if (typeof window !== "undefined") {
  window.StorageManager = StorageManager;
}
