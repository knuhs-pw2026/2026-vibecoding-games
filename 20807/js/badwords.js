// badwords.js - 실시간 비속어 감지 및 마스킹 필터링 엔진

const BadWordsFilter = {
  // 현재 등록된 금지어 목록 가져오기
  getWords() {
    if (typeof StorageManager !== "undefined") {
      return StorageManager.getBannedWords();
    }
    return CONFIG.DEFAULT_BANNED_WORDS;
  },

  // 특수문자나 띄어쓰기 우회 패턴(예: "시 1 발", "개-새-끼") 대응 정규식 빌더
  buildRegex(word) {
    // 글자 사이에 공백이나 특수기호, 숫자가 끼어있는 경우 매칭
    const escaped = word.split("").map(char => {
      // 특수문자 이스케이프
      const safeChar = char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return safeChar;
    }).join("[\\s\\d~!@#$%^&*()_+\\-=\\[\\]{};':\",.<>/?]*");

    return new RegExp(escaped, "gi");
  },

  // 텍스트 내 비속어 포함 여부 및 감지된 단어 목록 반환
  check(text) {
    if (!text || typeof text !== "string") {
      return { hasBadWord: false, detectedWords: [] };
    }

    const words = this.getWords();
    const detected = [];

    for (const word of words) {
      if (!word.trim()) continue;
      const regex = this.buildRegex(word.trim());
      if (regex.test(text)) {
        detected.push(word.trim());
      }
    }

    return {
      hasBadWord: detected.length > 0,
      detectedWords: detected
    };
  },

  // 비속어 자동 마스킹 (*** 대체)
  mask(text, maskChar = "*") {
    if (!text || typeof text !== "string") return text;

    let cleanText = text;
    const words = this.getWords();

    for (const word of words) {
      if (!word.trim()) continue;
      const regex = this.buildRegex(word.trim());
      cleanText = cleanText.replace(regex, (match) => {
        return maskChar.repeat(match.length);
      });
    }

    return cleanText;
  },

  // 관리자: 새 금지어 추가
  addWord(newWord) {
    if (!newWord || !newWord.trim()) return false;
    const trimmed = newWord.trim();
    const words = this.getWords();

    if (!words.includes(trimmed)) {
      words.push(trimmed);
      StorageManager.saveBannedWords(words);
      return true;
    }
    return false;
  },

  // 관리자: 금지어 삭제
  removeWord(targetWord) {
    const words = this.getWords();
    const filtered = words.filter(w => w !== targetWord);
    if (filtered.length !== words.length) {
      StorageManager.saveBannedWords(filtered);
      return true;
    }
    return false;
  },

  // 기본 금지어 목록으로 초기화
  resetToDefault() {
    StorageManager.saveBannedWords(CONFIG.DEFAULT_BANNED_WORDS);
    return CONFIG.DEFAULT_BANNED_WORDS;
  }
};

// 전역 내보내기
if (typeof window !== "undefined") {
  window.BadWordsFilter = BadWordsFilter;
}
