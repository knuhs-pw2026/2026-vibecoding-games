/* ==========================================================================
   School Mystery Detective Game - Story, Dialogue & Characters Data
   ========================================================================== */

export const CHARACTERS = {
  detective: {
    id: "detective",
    name: "추리부장 (나)",
    role: "추리 동아리 2학년",
    avatar: "🕵️",
    color: "#38bdf8"
  },
  minwoo: {
    id: "minwoo",
    name: "강민우",
    role: "전교 학생회장 (2학년)",
    avatar: "🧑‍💼",
    color: "#60a5fa",
    location: "loc_teachers_room",
    introDialogue: "선생님들이 시험지 도난 건으로 비상이 걸리셨어. 난 학생회 축제 유인물 출력하느라 컴퓨터실에만 있었는데 말이지.",
    clueReactions: {
      clue_security_log: "어...? 9시 22분부터 35분까지 입력이 없었다고? 아, 그땐 프린터 토너가 걸려서 교무실 앞 자판기에 음료수 뽑으러 잠깐 나갔다 온 거야!",
      clue_torn_paper: "시험지 조각이라고? 난 이런 특수 잉크 펜은 쓰지 않아. 난 항상 검은색 제트스트림만 쓰거든.",
      default: "그 단서가 나와 무슨 상관이 있다는 건지 잘 모르겠는데."
    }
  },
  haeun: {
    id: "haeun",
    name: "윤하은",
    role: "방송부 아나운서 (2학년)",
    avatar: "👩‍🎤",
    color: "#c084fc",
    location: "loc_broadcast_room",
    introDialogue: "비 오는 날 밤 방송실은 진짜 무섭다니까요... 그래도 내일 아침 방송 테스트 때문에 남아있었는데 이상한 소릴 들었어요!",
    clueReactions: {
      clue_broadcast_tape: "맞아요! 제가 녹음 콘솔 켜뒀을 때 복도에서 다급하게 뛰어가는 소리가 잡혔어요! 가방 쇠붙이 소리 같았는데...",
      clue_wet_towel: "어! 이 파란 극세사 타월은 우리 방송실 카메라 렌즈 닦는 수건인데... 2층 복도 소화전에 왜 있죠?!",
      default: "흠, 이건 사건 현장에서 중요한 증거가 될 것 같긴 하네요!"
    }
  },
  doyoon: {
    id: "doyoon",
    name: "한도윤",
    role: "과학부장 (2학년)",
    avatar: "👨‍🔬",
    color: "#34d399",
    location: "loc_science_lab",
    introDialogue: "난 결백해! 단지 내일 수행평가에 쓸 에탄올 용액을 제조하다가 비커를 깨뜨려서 치우고 있었을 뿐이야.",
    clueReactions: {
      clue_locker_memo: "아, 그 메모? 내가 심심해서 원소기호로 만든 퀴즈 쪽지야! 탄소(C)는 6번, 산소(O)는 8번이니까... 어라? 그게 왜 거기 있지?",
      clue_torn_paper: "이 종이에서 알코올 냄새가 난다고? 과학실 에탄올을 훔쳐가서 잉크를 지우려 한 누군가의 짓 아닐까?",
      default: "과학적인 인과관계가 부족한 증거군."
    }
  },
  seojun: {
    id: "seojun",
    name: "이서준",
    role: "미술부 부원 (2학년)",
    avatar: "🧑‍🎨",
    color: "#fbbf24",
    location: "loc_art_room",
    introDialogue: "난 이번 주말 공모전 마감이라 미술실에서 계속 유화만 그렸어. 교무실 근처엔 가지도 않았다고.",
    clueReactions: {
      clue_master_key_trace: "(눈이 크게 흔들리며) 앗... 그, 그 열쇠는... 석고상 뒤에 조각용 도구 넣어두려고 둔 건데... 왜 거기에 유화 물감이...",
      clue_broadcast_tape: "복도 녹음 소리...? 내 화구 가방 버클 소리 같다고? 하하, 학교에 이런 가방 멘 학생이 한둘인가?",
      default: "난 그림 그리는 것 말고는 아는 게 없어."
    }
  }
};

export const STORY_EVENTS = {
  intro: [
    { speaker: "detective", text: "밤 9시 30분. 쏟아지는 빗속에서 정적이 감도는 학교 구관 건물..." },
    { speaker: "detective", text: "내일 아침이면 2학년 1학기 기말고사가 시작된다." },
    { speaker: "detective", text: "하지만 방금 전, 교무실 금고에 보관 중이던 [수학 기말고사 시험지]가 도난당했다는 긴급 방송이 울렸다!" },
    { speaker: "detective", text: "학교 정문이 잠기는 밤 10시까지 남은 시간은 단 30분. 구관에 남아있는 사람은 나와 4명의 학생뿐이다." },
    { speaker: "detective", text: "현장의 단서들을 수집하고 알리바이를 대조하여, 시험지를 훔쳐간 진범을 밝혀내야 한다!" }
  ],
  puzzleSolved: [
    { speaker: "detective", text: "수수께끼 암호가 풀렸다! 원소기호 계산식의 정답은 [0140]이다!" },
    { speaker: "detective", text: "교무실 금고 비밀번호의 트릭이 완벽하게 풀렸다." }
  ]
};

/* Climax Deduction Steps */
export const DEDUCTION_PHASES = [
  {
    step: 1,
    title: "1단계: 침입 경로와 열쇠의 비밀",
    question: "범인이 잠겨있던 교무실 비상 뒷문을 통과하기 위해 사용한 수법과 증거는 무엇인가?",
    options: [
      {
        id: "opt_1_wrong_1",
        text: "학생회장의 마스터키 권한을 해킹하여 전자 도어록을 열었다.",
        isCorrect: false,
        feedback: "교무실 뒷문은 전자 도어록이 아닌 구형 열쇠 방식입니다."
      },
      {
        id: "opt_1_correct",
        text: "미술실에서 비누와 찰흙으로 본을 떠서 만든 [복제 열쇠]로 몰래 문을 열었다.",
        isCorrect: true,
        feedback: "정확합니다! 미술실 석고상 뒤에서 발견된 복제 열쇠에 유화 물감이 묻어있었습니다."
      },
      {
        id: "opt_1_wrong_2",
        text: "비 오는 틈을 타 2층 창문을 깨고 침입했다.",
        isCorrect: false,
        feedback: "교무실 창문은 모두 안쪽에서 온전하게 잠겨 있었습니다."
      }
    ]
  },
  {
    step: 2,
    title: "2단계: 금고 암호와 물적 증거의 모순",
    question: "범인이 현장에 남긴 결정적인 물적 증거와, 알리바이의 모순은 무엇인가?",
    options: [
      {
        id: "opt_2_correct",
        text: "화구 가방 쇠버클 소리가 녹음된 [복도 녹음 파일]과 열쇠에 묻은 [굳지 않은 코발트 블루 물감].",
        isCorrect: true,
        feedback: "완벽합니다! 9시 25분 복도를 질주한 범인의 소리와 미술실의 물감이 완벽히 일치합니다!"
      },
      {
        id: "opt_2_wrong_1",
        text: "컴퓨터실에서 로그인된 민우의 학생회 계정 로그인 로그 기록.",
        isCorrect: false,
        feedback: "그것만으로는 시험지를 직접 훔쳤다는 물적 증거가 되지 못합니다."
      },
      {
        id: "opt_2_wrong_2",
        text: "과학실 바닥에 떨어져 깨진 비커 파편과 에탄올 용액.",
        isCorrect: false,
        feedback: "도윤이의 알리바이는 과학실 청소로 이미 확인되었습니다."
      }
    ]
  },
  {
    step: 3,
    title: "3단계: 최종 진범 지목",
    question: "모든 단서와 모순을 종합했을 때, 시험지를 훔쳐간 진범은 누구인가?",
    options: [
      {
        id: "opt_3_minwoo",
        text: "강민우 (학생회장 - 전교 1등 유지의 압박)",
        isCorrect: false,
        endingType: "bad_minwoo"
      },
      {
        id: "opt_3_doyoon",
        text: "한도윤 (과학부장 - 시험지 암호 퀴즈 출제자)",
        isCorrect: false,
        endingType: "bad_doyoon"
      },
      {
        id: "opt_3_seojun",
        text: "이서준 (미술부원 - 실기 준비로 인한 성적 하락 위기)",
        isCorrect: true,
        endingType: "true_ending"
      },
      {
        id: "opt_3_haeun",
        text: "윤하은 (방송부원 - 방송실 타월 소유자)",
        isCorrect: false,
        endingType: "bad_haeun"
      }
    ]
  }
];

export const ENDINGS = {
  true_ending: {
    title: "⭐ [진엔딩] 진실의 빛 - 밝혀진 밀실의 비밀",
    type: "SUCCESS",
    badge: "TRUE ENDING",
    story: `
      "서준아, 네 화구 가방에서 들린 버클 소리와 석고상 뒤 열쇠에 묻은 짙은 코발트 블루 유화 물감... 모든 증거가 너를 가리키고 있어."
      
      이서준은 고개를 떨구며 주머니에서 시험지 원본을 꺼내놓았다.
      "미대 입시를 위해 실기에만 매달리다 보니 이번 수학 시험을 망치면 유급될 거라는 불안감에 눈이 멀었어... 미안해."
      
      곧이어 도착한 교사들에게 시험지는 안전하게 회수되었고, 시험은 정상적으로 치러지게 되었다.
      학교의 평화를 지켜낸 추리동아리의 명성은 전교에 드높아졌다!
    `
  },
  bad_minwoo: {
    title: "❌ [배드엔딩 A] 무고한 학생회장 지목",
    type: "FAIL",
    badge: "BAD ENDING",
    story: `
      "민우야! 네 PC 유휴 시간과 음료수 구매 알리바이가 거짓이지?!"
      
      민우는 억울함을 호소하며 교무실 CCTV 타임스탬프 영수증을 제출했다.
      엉뚱한 사람을 추궁하는 사이, 밤 10시 종이 울리고 진짜 범인은 시험지를 챙겨 유유히 교문을 빠져나갔다...
    `
  },
  bad_doyoon: {
    title: "❌ [배드엔딩 B] 오판된 과학실의 진실",
    type: "FAIL",
    badge: "BAD ENDING",
    story: `
      "도윤아, 과학실의 에탄올과 암호 메모지가 결정적인 증거야!"
      
      도윤은 어이없어하며 메모지는 단지 선생님과의 퀴즈 내기였음을 증명했다.
      결정적인 물증을 제시하지 못한 채 추리는 미궁에 빠지고 말았다...
    `
  },
  bad_haeun: {
    title: "❌ [배드엔딩 C] 빗나간 방송부 의혹",
    type: "FAIL",
    badge: "BAD ENDING",
    story: `
      "하은아! 복도 소화전에 숨겨진 젖은 렌즈 타월이 네 것이잖아!"
      
      하은은 울먹이며 창문으로 들이치는 빗물을 닦으려 썼을 뿐이라고 해명했다.
      진짜 범인을 밝혀내지 못한 채 시험은 전면 취소되고 학교는 큰 혼란에 휩싸였다...
    `
  }
};
