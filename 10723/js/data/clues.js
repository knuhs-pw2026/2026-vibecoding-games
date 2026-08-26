/* ==========================================================================
   School Mystery Detective Game - Clues & Evidence Data
   ========================================================================== */

export const CLUES = {
  clue_torn_paper: {
    id: "clue_torn_paper",
    name: "찢어진 수학 시험지 조각",
    category: "물적 증거",
    icon: "📄",
    location: "교무실 쓰레기통",
    shortDesc: "모서리가 찢겨나간 2학년 수학 기말고사 시험지 모범답안지 일부분.",
    detailDesc: "교무실 쓰레기통 구석에서 발견된 찢어진 시험지 조각. 상단에 파란색 특수 수성펜 잉크가 번져 있으며, 특정 화학 약품 특유의 알코올 냄새가 희미하게 난다.",
    relevantSuspect: "도윤",
    discovered: false
  },
  clue_security_log: {
    id: "clue_security_log",
    name: "야간 컴퓨터실 PC 접속 로그",
    category: "기록 증거",
    icon: "💻",
    location: "컴퓨터실 메인 서버",
    shortDesc: "밤 9시 15분부터 9시 40분까지의 학생 로그인 기록.",
    detailDesc: "학생회장 민우의 계정으로 9시 10분에 로그인되었으나, 9시 22분부터 9시 35분까지는 마우스 및 키보드 입력이 전혀 없는 유휴(Idle) 상태였다.",
    relevantSuspect: "민우",
    discovered: false
  },
  clue_wet_towel: {
    id: "clue_wet_towel",
    name: "젖은 파란색 극세사 타월",
    category: "물적 증거",
    icon: "🧣",
    location: "구관 2층 복도 소화전 뒤",
    shortDesc: "비에 젖은 채 은밀히 숨겨져 있던 청소용 극세사 타월.",
    detailDesc: "창문 틈새로 빗물을 닦은 듯 흥건하게 젖어있다. 놀랍게도 방송실 카메라 렌즈 클리너에 쓰이는 특수 섬유와 동일한 재질이다.",
    relevantSuspect: "하은",
    discovered: false
  },
  clue_locker_memo: {
    id: "clue_locker_memo",
    name: "암호가 적힌 메모지",
    category: "문서 증거",
    icon: "🔢",
    location: "과학실 실험대 서랍",
    shortDesc: "금고 비밀번호를 유추할 수 있는 수학 퀴즈 메모.",
    detailDesc: "‘원소번호 6번(C) + 8번(O) × 10 = ?’라는 수식이 적혀 있다. 교무실 비밀번호 자물쇠와 연관되어 있는 것으로 보인다.",
    relevantSuspect: "도윤",
    discovered: false
  },
  clue_broadcast_tape: {
    id: "clue_broadcast_tape",
    name: "방송부 복도 녹음 파일",
    category: "음성 증거",
    icon: "🎙️",
    location: "방송실 오디오 믹서",
    shortDesc: "밤 9시 25분경 복도 마이크에 우연히 녹음된 소리.",
    detailDesc: "급하게 복도를 뛰어가는 가벼운 발소리와 함께 '짤랑'거리는 열쇠 뭉치 소리, 그리고 캔버스 가방이 부딪히는 소리가 녹음되어 있다.",
    relevantSuspect: "서준",
    discovered: false
  },
  clue_master_key_trace: {
    id: "clue_master_key_trace",
    name: "미술실 석고상 뒤 복사 열쇠",
    category: "결정적 증거",
    icon: "🗝️",
    location: "미술실 대형 아그리파 석고상 뒤",
    shortDesc: "교무실 비상 뒷문을 열 수 있는 스페어 열쇠.",
    detailDesc: "비누로 본을 떠서 만든 조잡한 복제 열쇠. 손잡이 부분에 굳지 않은 파란색 유화 물감이 살짝 묻어있다.",
    relevantSuspect: "서준",
    discovered: false
  },
  clue_safe_lock: {
    id: "clue_safe_lock",
    name: "열린 교무실 보관 금고",
    category: "현장 흔적",
    icon: "🔒",
    location: "교무실 금고",
    shortDesc: "강제로 부순 흔적 없이 정상적으로 4자리 암호가 풀린 금고.",
    detailDesc: "다이얼 자물쇠는 정상 입력되어 열려 있으며, 내부의 수학 기말고사 시험지 봉투만 감쪽같이 사라졌다.",
    relevantSuspect: null,
    discovered: false
  }
};
