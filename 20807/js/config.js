// config.js - 2026 군성제 주간(낮) 축제 설정 (신고/금지어 제거, 관리자 암호 123456)

const CONFIG = {
  APP_NAME: "군성제 ☀️",
  FESTIVAL_NAME: "2026 군성제 실시간 라이브 전광판",
  ADMIN_PASSWORD: "123456", // 관리자 비밀번호
  STORAGE_KEYS: {
    MESSAGES: "fest_guestbook_messages_v1",
    SETTINGS: "fest_guestbook_settings_v1",
    SNAPSHOTS: "fest_guestbook_snapshots_v1",
    ADMIN_AUTH: "fest_guestbook_admin_auth_v1"
  },
  MAX_SNAPSHOTS: 10,
  
  // 청량하고 화사한 낮 축제 카드 테마
  CARD_THEMES: [
    { id: "theme-sunny-lemon", name: "써니 레몬", bg: "linear-gradient(135deg, #fef9c3, #fef08a)", border: "#fde047", text: "#713f12", accent: "#ca8a04" },
    { id: "theme-sky-blue", name: "청량 스카이", bg: "linear-gradient(135deg, #e0f2fe, #bae6fd)", border: "#7dd3fc", text: "#0c4a6e", accent: "#0284c7" },
    { id: "theme-blossom-pink", name: "블라썸 핑크", bg: "linear-gradient(135deg, #ffe4e6, #fecdd3)", border: "#fda4af", text: "#881337", accent: "#e11d48" },
    { id: "theme-fresh-mint", name: "싱그런 민트", bg: "linear-gradient(135deg, #dcfce7, #bbf7d0)", border: "#86efac", text: "#14532d", accent: "#16a34a" },
    { id: "theme-lavender-violet", name: "라벤더 퍼플", bg: "linear-gradient(135deg, #f3e8ff, #e9d5ff)", border: "#d8b4fe", text: "#581c87", accent: "#9333ea" },
    { id: "theme-pure-white", name: "퓨어 화이트", bg: "linear-gradient(135deg, #ffffff, #f8fafc)", border: "#cbd5e1", text: "#0f172a", accent: "#64748b" }
  ],

  STICKERS: [
    { id: "sticker-sparkle", icon: "✨", label: "반짝이" },
    { id: "sticker-sun", icon: "☀️", label: "햇살" },
    { id: "sticker-guitar", icon: "🎸", label: "기타" },
    { id: "sticker-heart", icon: "💖", label: "하트" },
    { id: "sticker-balloon", icon: "🎈", label: "풍선" },
    { id: "sticker-party", icon: "🥳", label: "파티" },
    { id: "sticker-clover", icon: "🍀", label: "행운" }
  ],

  FONTS: [
    { id: "font-sans", name: "모던 산세리프", css: "'Pretendard', sans-serif" },
    { id: "font-pen", name: "감성 손글씨", css: "'Gaegu', cursive, sans-serif" },
    { id: "font-cute", name: "둥근 고딕", css: "'Jua', sans-serif" }
  ],

  // 닉네임 자동 생성 사전 (형용사 + 명사)
  NICKNAME_DATA: {
    adjectives: [
      "햇살가득한", "열정적인", "설레는", "청량한", "신나는", "반짝이는", "매점털이",
      "목청터진", "1열사수", "군성제장인", "감성폭발", "흥부자", "기타치는",
      "솜사탕든", "풍선든", "주점달리는", "소원비는", "청춘가득한", "활기찬"
    ],
    nouns: [
      "솜사탕", "밴드부 1열", "군성제요정", "매점 VIP", "보컬꿈나무",
      "베이스장인", "동아리회장", "새내기", "졸업반선배", "푸드트럭단골",
      "치어리더", "피아노맨", "파랑풍선", "인형탈", "축제마스터", "무대감독", "푸른하늘"
    ]
  },

  // 초기 방명록 데이터 빈 상태
  SAMPLE_MESSAGES: []
};

if (typeof window !== "undefined") {
  window.CONFIG = CONFIG;
}
