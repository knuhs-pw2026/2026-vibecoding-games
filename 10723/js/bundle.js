/* ==========================================================================
   School Mystery Detective Game - Unified Standalone Engine Bundle
   Supports direct file:// execution with zero CORS or server requirement!
   ========================================================================== */

(function () {
  'use strict';

  // 1. DATA: CLUES
  const CLUES = {
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

  // 2. DATA: STORY & CHARACTERS
  const CHARACTERS = {
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

  const STORY_EVENTS = {
    intro: [
      { speaker: "detective", text: "밤 9시 30분. 쏟아지는 빗속에서 정적이 감도는 학교 구관 건물..." },
      { speaker: "detective", text: "내일 아침이면 2학년 1학기 기말고사가 시작된다." },
      { speaker: "detective", text: "하지만 방금 전, 교무실 금고에 보관 중이던 [수학 기말고사 시험지]가 도난당했다는 긴급 방송이 울렸다!" },
      { speaker: "detective", text: "학교 정문이 잠기는 밤 10시까지 남은 시간은 단 30분. 구관에 남아있는 사람은 나와 4명의 학생뿐이다." },
      { speaker: "detective", text: "현장의 단서들을 수집하고 알리바이를 대조하여, 시험지를 훔쳐간 진범을 밝혀내야 한다!" }
    ]
  };

  const DEDUCTION_PHASES = [
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

  const ENDINGS = {
    true_ending: {
      title: "⭐ [진엔딩] 진실의 빛 - 밝혀진 밀실의 비밀",
      type: "SUCCESS",
      badge: "TRUE ENDING",
      story: `"서준아, 네 화구 가방에서 들린 버클 소리와 석고상 뒤 열쇠에 묻은 짙은 코발트 블루 유화 물감... 모든 증거가 너를 가리키고 있어."\n\n이서준은 고개를 떨구며 주머니에서 시험지 원본을 꺼내놓았다.\n"미대 입시를 위해 실기에만 매달리다 보니 이번 수학 시험을 망치면 유급될 거라는 불안감에 눈이 멀었어... 미안해."\n\n곧이어 도착한 교사들에게 시험지는 안전하게 회수되었고, 시험은 정상적으로 치러지게 되었다.\n학교의 평화를 지켜낸 추리동아리의 명성은 전교에 드높아졌다!`
    },
    bad_minwoo: {
      title: "❌ [배드엔딩 A] 무고한 학생회장 지목",
      type: "FAIL",
      badge: "BAD ENDING",
      story: `"민우야! 네 PC 유휴 시간과 음료수 구매 알리바이가 거짓이지?!"\n\n민우는 억울함을 호소하며 교무실 CCTV 타임스탬프 영수증을 제출했다.\n엉뚱한 사람을 추궁하는 사이, 밤 10시 종이 울리고 진짜 범인은 시험지를 챙겨 유유히 교문을 빠져나갔다...`
    },
    bad_doyoon: {
      title: "❌ [배드엔딩 B] 오판된 과학실의 진실",
      type: "FAIL",
      badge: "BAD ENDING",
      story: `"도윤아, 과학실의 에탄올과 암호 메모지가 결정적인 증거야!"\n\n도윤은 어이없어하며 메모지는 단지 선생님과의 퀴즈 내기였음을 증명했다.\n결정적인 물증을 제시하지 못한 채 추리는 미궁에 빠지고 말았다...`
    },
    bad_haeun: {
      title: "❌ [배드엔딩 C] 빗나간 방송부 의혹",
      type: "FAIL",
      badge: "BAD ENDING",
      story: `"하은아! 복도 소화전에 숨겨진 젖은 렌즈 타월이 네 것이잖아!"\n\n하은은 울먹이며 창문으로 들이치는 빗물을 닦으려 썼을 뿐이라고 해명했다.\n진짜 범인을 밝혀내지 못한 채 시험은 전면 취소되고 학교는 큰 혼란에 휩싸였다...`
    }
  };

  // 3. DATA: LOCATIONS
  const LOCATIONS = {
    loc_teachers_room: {
      id: "loc_teachers_room",
      name: "2층 본관 교무실",
      floor: "본관 2층",
      description: "선생님들이 모두 퇴근하여 적막만이 흐른다. 문제의 시험지가 보관되어 있던 금고가 열려있다.",
      suspects: ["minwoo"],
      themeColor: "#3b82f6",
      bgSvgType: "teachers_room",
      hotspots: [
        {
          id: "hs_safe",
          name: "철제 금고",
          icon: "🔒",
          x: 48,
          y: 42,
          clueId: "clue_safe_lock",
          message: "비밀번호 다이얼이 맞춰진 채로 문이 열려있다. 원래 들어있던 2학년 수학 기말고사 시험지만 사라졌다."
        },
        {
          id: "hs_trash",
          name: "교무실 쓰레기통",
          icon: "🗑️",
          x: 78,
          y: 75,
          clueId: "clue_torn_paper",
          message: "쓰레기통 속을 뒤지자 구석에서 찢어진 종이 조각을 발견했다! [찢어진 수학 시험지 조각]을 획득했다."
        },
        {
          id: "hs_teacher_desk",
          name: "수학 선생님 책상",
          icon: "📑",
          x: 25,
          y: 60,
          clueId: null,
          message: "책상 위에는 '기말고사 보안 철저 요망 - 4자리 암호는 원소 퀴즈 참고'라는 포스트잇 메모가 붙어있다."
        }
      ]
    },
    loc_science_lab: {
      id: "loc_science_lab",
      name: "3층 구관 과학실",
      floor: "구관 3층",
      description: "다양한 화학 약품과 비커가 정렬되어 있다. 알코올 램프 특유의 냄새가 맴돈다.",
      suspects: ["doyoon"],
      themeColor: "#10b981",
      bgSvgType: "science_lab",
      hotspots: [
        {
          id: "hs_lab_desk",
          name: "화학 실험대 서랍",
          icon: "🧪",
          x: 52,
          y: 58,
          clueId: "clue_locker_memo",
          message: "서랍 안에서 알 수 없는 계산식이 적힌 쪽지를 발견했다! [암호가 적힌 메모지]를 획득했다."
        },
        {
          id: "hs_chemical_cabinet",
          name: "시약 보관함",
          icon: "🧴",
          x: 20,
          y: 38,
          clueId: null,
          message: "에탄올과 에테르 병이 놓여있다. 누군가 최근에 에탄올 병을 만진 듯 뚜껑이 헐겁게 닫혀있다."
        },
        {
          id: "hs_broken_beaker",
          name: "바닥의 깨진 비커 파편",
          icon: "💥",
          x: 75,
          y: 78,
          clueId: null,
          message: "도윤이가 떨어뜨렸다는 비커 파편이다. 파편 주위는 말끔하게 걸레질되어 있다."
        }
      ]
    },
    loc_broadcast_room: {
      id: "loc_broadcast_room",
      name: "4층 방송실",
      floor: "본관 4층",
      description: "방음벽으로 둘러싸여 조용하며, 복도 마이크와 믹싱 콘솔 불빛이 은은하게 켜져있다.",
      suspects: ["haeun"],
      themeColor: "#8b5cf6",
      bgSvgType: "broadcast_room",
      hotspots: [
        {
          id: "hs_audio_mixer",
          name: "오디오 믹싱 콘솔",
          icon: "🎙️",
          x: 42,
          y: 52,
          clueId: "clue_broadcast_tape",
          message: "복도 모니터링 채널 녹음 테이프를 재생하자 9시 25분의 이상 소음이 들린다! [방송부 복도 녹음 파일]을 확보했다."
        },
        {
          id: "hs_camera_shelf",
          name: "카메라 렌즈 보관함",
          icon: "📷",
          x: 78,
          y: 40,
          clueId: null,
          message: "렌즈 청소용 극세사 타월 몇 장 중 파란색 타월 한 장이 비어있다."
        },
        {
          id: "hs_broadcast_window",
          name: "빗물이 들이치는 창문",
          icon: "🪟",
          x: 18,
          y: 35,
          clueId: null,
          message: "창문 틈새로 빗방울이 살짝 들이치고 있다. 바닥에 물기를 닦아낸 흔적이 있다."
        }
      ]
    },
    loc_art_room: {
      id: "loc_art_room",
      name: "1층 별관 미술실",
      floor: "별관 1층",
      description: "유화 물감 냄새가 진동하는 방. 석고상들과 미완성 캔버스들이 줄지어 늘어서 있다.",
      suspects: ["seojun"],
      themeColor: "#f59e0b",
      bgSvgType: "art_room",
      hotspots: [
        {
          id: "hs_agrippa_statue",
          name: "아그리파 석고상",
          icon: "🗿",
          x: 30,
          y: 45,
          clueId: "clue_master_key_trace",
          message: "석고상 뒤편 틈새에서 비누로 본을 뜬 복제 열쇠를 발견했다! [미술실 석고상 뒤 복사 열쇠]를 획득했다."
        },
        {
          id: "hs_easel_canvas",
          name: "마감 중인 유화 캔버스",
          icon: "🎨",
          x: 65,
          y: 55,
          clueId: null,
          message: "푸른 밤하늘을 그린 캔버스. 팔레트에는 아직 굳지 않은 짙은 코발트 블루 물감이 묻어있다."
        },
        {
          id: "hs_art_bag",
          name: "서준이의 화구 가방",
          icon: "👜",
          x: 82,
          y: 75,
          clueId: null,
          message: "커다란 방수 캔버스 가방. 쇠로 된 버클 장식이 복도에서 들렸던 '짤랑' 소리와 일치한다."
        }
      ]
    },
    loc_computer_lab: {
      id: "loc_computer_lab",
      name: "3층 컴퓨터실",
      floor: "본관 3층",
      description: "수십 대의 컴퓨터 모니터가 늘어서 있다. 복사기와 레이저 프린터가 한 켠에 자리 잡고 있다.",
      suspects: [],
      themeColor: "#06b6d4",
      bgSvgType: "computer_lab",
      hotspots: [
        {
          id: "hs_server_pc",
          name: "중앙 서버 컴퓨터",
          icon: "💻",
          x: 50,
          y: 50,
          clueId: "clue_security_log",
          message: "야간 접속 기록을 조회했다. 민우 학생의 계정이 9시 22분부터 35분까지 입력 없이 방치되어 있었다. [PC 접속 로그]를 확보했다."
        },
        {
          id: "hs_hallway_fire_extinguisher",
          name: "복도 소화전 뒤편",
          icon: "🧯",
          x: 85,
          y: 65,
          clueId: "clue_wet_towel",
          message: "소화전 틈새에 젖은 파란 타월이 쑤셔 박혀 있다! [젖은 파란색 극세사 타월]을 획득했다."
        }
      ]
    }
  };

  // 4. ENGINE: SOUND
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.isMuted = false;
      this.bgmGain = null;
      this.isBgmPlaying = false;
      this.bgmTimer = null;
    }
    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === "suspended") this.ctx.resume();
    }
    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.bgmGain && this.ctx) {
        this.bgmGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
      }
      return this.isMuted;
    }
    playTypewriter() {
      if (this.isMuted) return;
      this.init();
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(400 + Math.random() * 200, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
      } catch (e) {}
    }
    playClick() {
      if (this.isMuted) return;
      this.init();
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.09);
      } catch (e) {}
    }
    playClueFound() {
      if (this.isMuted) return;
      this.init();
      try {
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          gain.gain.setValueAtTime(0.1, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.4);
        });
      } catch (e) {}
    }
    playObjection() {
      if (this.isMuted) return;
      this.init();
      try {
        const now = this.ctx.currentTime;
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = "sine";
        subOsc.frequency.setValueAtTime(120, now);
        subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
        subGain.gain.setValueAtTime(0.3, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        subOsc.connect(subGain);
        subGain.connect(this.ctx.destination);
        subOsc.start(now);
        subOsc.stop(now + 0.5);

        [293.66, 349.23, 440.00, 587.33].forEach(freq => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.75);
        });
      } catch (e) {}
    }
    playSuccess() {
      if (this.isMuted) return;
      this.init();
      try {
        const now = this.ctx.currentTime;
        [440, 554.37, 659.25, 880].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.12, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.45);
        });
      } catch (e) {}
    }
    playFail() {
      if (this.isMuted) return;
      this.init();
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.setValueAtTime(110, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      } catch (e) {}
    }
    startMysteryBGM() {
      if (this.isBgmPlaying) return;
      this.init();
      this.isBgmPlaying = true;
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
      this.bgmGain.connect(this.ctx.destination);

      const scale = [220, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00, 440];
      let step = 0;
      const playBgmStep = () => {
        if (!this.isBgmPlaying) return;
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(scale[step % scale.length], now);
          noteGain.gain.setValueAtTime(0.04, now);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          osc.connect(noteGain);
          noteGain.connect(this.bgmGain);
          osc.start(now);
          osc.stop(now + 1.3);

          if (step % 4 === 0) {
            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bassOsc.type = "triangle";
            bassOsc.frequency.setValueAtTime(55, now);
            bassGain.gain.setValueAtTime(0.06, now);
            bassGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
            bassOsc.connect(bassGain);
            bassGain.connect(this.bgmGain);
            bassOsc.start(now);
            bassOsc.stop(now + 2.1);
          }
          step = (step + (Math.random() > 0.4 ? 1 : 2)) % scale.length;
        } catch (e) {}
        this.bgmTimer = setTimeout(playBgmStep, 500);
      };
      playBgmStep();
    }
  }

  const audio = new SoundEngine();

  // 5. ENGINE: DIALOGUE
  class DialogueEngine {
    constructor() {
      this.speakerEl = null;
      this.roleEl = null;
      this.avatarEl = null;
      this.textEl = null;
      this.cursorEl = null;
      this.choicesContainer = null;
      this.typewriterTimer = null;
      this.isTyping = false;
      this.currentText = "";
      this.onCompleteCallback = null;
    }
    init() {
      this.speakerEl = document.getElementById("speaker-name");
      this.roleEl = document.getElementById("speaker-role");
      this.avatarEl = document.getElementById("speaker-avatar");
      this.textEl = document.getElementById("dialogue-text");
      this.cursorEl = document.getElementById("dialogue-cursor");
      this.choicesContainer = document.getElementById("dialogue-choices");
    }
    setSpeaker(characterId) {
      const char = CHARACTERS[characterId] || { name: "안내", role: "시스템", avatar: "📢", color: "#94a3b8" };
      if (this.speakerEl) this.speakerEl.textContent = char.name;
      if (this.roleEl) this.roleEl.textContent = char.role;
      if (this.avatarEl) {
        this.avatarEl.textContent = char.avatar;
        this.avatarEl.style.borderColor = char.color;
        this.avatarEl.style.boxShadow = `0 0 15px ${char.color}40`;
      }
    }
    playDialogue(speakerId, text, choices = [], onComplete = null) {
      this.setSpeaker(speakerId);
      this.currentText = text;
      this.onCompleteCallback = onComplete;
      this.clearChoices();

      if (this.typewriterTimer) clearInterval(this.typewriterTimer);
      if (this.textEl) this.textEl.textContent = "";
      if (this.cursorEl) this.cursorEl.style.display = "inline-block";

      this.isTyping = true;
      let charIndex = 0;

      this.typewriterTimer = setInterval(() => {
        if (charIndex < text.length) {
          this.textEl.textContent += text.charAt(charIndex);
          if (charIndex % 3 === 0) audio.playTypewriter();
          charIndex++;
        } else {
          this.finishTyping(choices);
        }
      }, 25);
    }
    finishTyping(choices = []) {
      this.isTyping = false;
      clearInterval(this.typewriterTimer);
      if (this.cursorEl) this.cursorEl.style.display = "none";
      if (choices && choices.length > 0) this.renderChoices(choices);
      if (this.onCompleteCallback) {
        const cb = this.onCompleteCallback;
        this.onCompleteCallback = null;
        cb();
      }
    }
    renderChoices(choices) {
      this.clearChoices();
      if (!this.choicesContainer) return;
      choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.className = `btn-choice ${choice.isHighlight ? 'highlight' : ''}`;
        btn.innerHTML = `${choice.icon ? choice.icon + ' ' : ''}${choice.text}`;
        btn.onclick = () => {
          audio.playClick();
          if (choice.onClick) choice.onClick();
        };
        this.choicesContainer.appendChild(btn);
      });
    }
    clearChoices() {
      if (this.choicesContainer) this.choicesContainer.innerHTML = "";
    }
    playQueue(dialogueList, onAllFinished) {
      if (!dialogueList || dialogueList.length === 0) {
        if (onAllFinished) onAllFinished();
        return;
      }
      let currentIndex = 0;
      const showNext = () => {
        if (currentIndex >= dialogueList.length) {
          if (onAllFinished) onAllFinished();
          return;
        }
        const item = dialogueList[currentIndex];
        const isLast = currentIndex === dialogueList.length - 1;
        const choices = isLast ? [] : [{
          text: "다음 ▶",
          icon: "⏩",
          onClick: () => {
            currentIndex++;
            showNext();
          }
        }];
        this.playDialogue(item.speaker, item.text, choices, () => {
          if (isLast && onAllFinished) onAllFinished();
        });
      };
      showNext();
    }
  }

  const dialogue = new DialogueEngine();

  // 6. ENGINE: NOTEBOOK
  class NotebookEngine {
    constructor() {
      this.modalEl = null;
      this.cluesGridEl = null;
      this.suspectsGridEl = null;
      this.timelineContainerEl = null;
      this.badgeCountEl = null;
      this.currentTab = "clues";
      this.selectedClueId = null;
      this.onPresentClueCallback = null;
    }
    init() {
      this.modalEl = document.getElementById("notebook-modal");
      this.cluesGridEl = document.getElementById("notebook-clues-grid");
      this.suspectsGridEl = document.getElementById("notebook-suspects-grid");
      this.timelineContainerEl = document.getElementById("notebook-timeline-content");
      this.badgeCountEl = document.getElementById("clue-badge-count");

      document.querySelectorAll(".notebook-tab").forEach(tab => {
        tab.addEventListener("click", () => {
          audio.playClick();
          document.querySelectorAll(".notebook-tab").forEach(t => t.classList.remove("active"));
          tab.classList.add("active");
          this.switchTab(tab.dataset.tab);
        });
      });

      const closeBtn = document.getElementById("btn-close-notebook");
      if (closeBtn) closeBtn.addEventListener("click", () => this.close());
      this.updateBadge();
    }
    open(onPresentCallback = null) {
      this.onPresentClueCallback = onPresentCallback;
      audio.playClick();
      this.switchTab(this.currentTab);
      if (this.modalEl) this.modalEl.classList.add("active");
    }
    close() {
      audio.playClick();
      if (this.modalEl) this.modalEl.classList.remove("active");
      this.onPresentClueCallback = null;
    }
    switchTab(tabName) {
      this.currentTab = tabName;
      const views = {
        clues: document.getElementById("tab-view-clues"),
        suspects: document.getElementById("tab-view-suspects"),
        timeline: document.getElementById("tab-view-timeline")
      };
      Object.keys(views).forEach(k => {
        if (views[k]) views[k].style.display = (k === tabName) ? "block" : "none";
      });
      if (tabName === "clues") this.renderClues();
      if (tabName === "suspects") this.renderSuspects();
      if (tabName === "timeline") this.renderTimeline();
    }
    addClue(clueId) {
      if (CLUES[clueId] && !CLUES[clueId].discovered) {
        CLUES[clueId].discovered = true;
        this.updateBadge();
        this.showClueToast(CLUES[clueId]);
        audio.playClueFound();
      }
    }
    getDiscoveredCluesCount() {
      return Object.values(CLUES).filter(c => c.discovered).length;
    }
    updateBadge() {
      const count = this.getDiscoveredCluesCount();
      if (this.badgeCountEl) this.badgeCountEl.textContent = count;
    }
    showClueToast(clue) {
      const banner = document.getElementById("clue-banner");
      const bannerIcon = document.getElementById("clue-banner-icon");
      const bannerName = document.getElementById("clue-banner-name");
      if (banner && bannerIcon && bannerName) {
        bannerIcon.textContent = clue.icon;
        bannerName.textContent = clue.name;
        banner.classList.add("active");
        setTimeout(() => banner.classList.remove("active"), 2500);
      }
    }
    renderClues() {
      if (!this.cluesGridEl) return;
      this.cluesGridEl.innerHTML = "";
      const discoveredClues = Object.values(CLUES).filter(c => c.discovered);
      if (discoveredClues.length === 0) {
        this.cluesGridEl.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; color: var(--text-dim); padding: 40px;">
            아직 발견된 단서가 없습니다. 교내 핫스팟을 조사해보세요!
          </div>
        `;
        return;
      }
      discoveredClues.forEach(clue => {
        const card = document.createElement("div");
        card.className = `clue-card ${this.selectedClueId === clue.id ? 'selected' : ''}`;
        card.innerHTML = `
          <div class="clue-card-header">
            <div class="clue-icon-box">${clue.icon}</div>
            <div>
              <div class="clue-title">${clue.name}</div>
              <div style="font-size: 0.72rem; color: var(--text-dim);">발견 장소: ${clue.location}</div>
            </div>
          </div>
          <div class="clue-description">${clue.detailDesc}</div>
          <div class="clue-tag">${clue.category}</div>
          ${this.onPresentClueCallback ? `
            <button class="btn-present-clue" style="margin-top: 8px; width: 100%;">
              👉 이 증거 제시하기
            </button>
          ` : ''}
        `;
        card.onclick = () => {
          this.selectedClueId = clue.id;
          document.querySelectorAll(".clue-card").forEach(c => c.classList.remove("selected"));
          card.classList.add("selected");
        };
        if (this.onPresentClueCallback) {
          const presentBtn = card.querySelector(".btn-present-clue");
          if (presentBtn) {
            presentBtn.onclick = (e) => {
              e.stopPropagation();
              const callback = this.onPresentClueCallback;
              this.close();
              callback(clue);
            };
          }
        }
        this.cluesGridEl.appendChild(card);
      });
    }
    renderSuspects() {
      if (!this.suspectsGridEl) return;
      this.suspectsGridEl.innerHTML = "";
      ["minwoo", "haeun", "doyoon", "seojun"].forEach(id => {
        const char = CHARACTERS[id];
        const card = document.createElement("div");
        card.className = "suspect-card";
        card.innerHTML = `
          <div class="suspect-card-avatar" style="border-color: ${char.color};">${char.avatar}</div>
          <div class="suspect-card-info">
            <div class="suspect-card-name">${char.name}</div>
            <div class="suspect-card-role">${char.role}</div>
            <div class="suspect-card-alibi"><strong>진술:</strong> "${char.introDialogue}"</div>
          </div>
        `;
        this.suspectsGridEl.appendChild(card);
      });
    }
    renderTimeline() {
      if (!this.timelineContainerEl) return;
      this.timelineContainerEl.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px; font-size: 0.9rem;">
          <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border-left: 4px solid var(--accent-blue);">
            <strong>🕒 21:00</strong> - 야간 자율학습 종료 및 교사들 퇴근 준비
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border-left: 4px solid var(--accent-purple);">
            <strong>🕒 21:15</strong> - 야간 비 쏟아짐 시작, 4명의 학생 각자의 장소에 잔류
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border-left: 4px solid var(--accent-crimson);">
            <strong>🕒 21:25</strong> - ⚠️ <strong>사건 발생 추정 시간</strong>: 복도에서 급한 발소리와 가방 쇠붙이 소음 발생
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border-left: 4px solid var(--accent-gold);">
            <strong>🕒 21:30</strong> - 교무실 수학 시험지 금고 도난 확인
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
            <strong>🕒 22:00</strong> - 🚪 <strong>학교 정문 폐쇄 예정 (제한 시간)</strong>
          </div>
        </div>
      `;
    }
  }

  const notebook = new NotebookEngine();

  // 7. ENGINE: PUZZLE
  class PuzzleEngine {
    constructor() {
      this.modalEl = null;
      this.displayEl = null;
      this.currentCode = "";
      this.targetCode = "0140";
      this.isSolved = false;
      this.onSolveCallback = null;
    }
    init() {
      this.modalEl = document.getElementById("puzzle-modal");
      this.displayEl = document.getElementById("keypad-display");

      const closeBtn = document.getElementById("btn-close-puzzle");
      if (closeBtn) closeBtn.addEventListener("click", () => this.close());

      document.querySelectorAll(".keypad-num").forEach(btn => {
        btn.addEventListener("click", () => this.addDigit(btn.dataset.val));
      });

      const clearBtn = document.getElementById("btn-keypad-clear");
      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          audio.playClick();
          this.currentCode = "";
          this.updateDisplay();
        });
      }

      const submitBtn = document.getElementById("btn-keypad-submit");
      if (submitBtn) submitBtn.addEventListener("click", () => this.checkCode());
    }
    open(onSolve = null) {
      this.onSolveCallback = onSolve;
      this.currentCode = "";
      this.updateDisplay();
      audio.playClick();
      if (this.modalEl) this.modalEl.classList.add("active");
    }
    close() {
      audio.playClick();
      if (this.modalEl) this.modalEl.classList.remove("active");
    }
    addDigit(digit) {
      if (this.currentCode.length >= 4) return;
      audio.playClick();
      this.currentCode += digit;
      this.updateDisplay();
      if (this.currentCode.length === 4) {
        setTimeout(() => this.checkCode(), 200);
      }
    }
    updateDisplay() {
      if (this.displayEl) this.displayEl.textContent = this.currentCode.padEnd(4, "-");
    }
    checkCode() {
      if (this.currentCode === this.targetCode) {
        audio.playSuccess();
        this.isSolved = true;
        this.close();
        notebook.addClue("clue_safe_lock");
        dialogue.playDialogue(
          "detective",
          "철컥! [0140]을 입력하자 금고의 보조 잠금장치가 해제되었다! 탄소(6)와 산소(8)를 이용한 수학 퀴즈 암호가 맞았다.",
          [{
            text: "단서 확인하기",
            icon: "🔍",
            onClick: () => {
              if (this.onSolveCallback) this.onSolveCallback();
            }
          }]
        );
      } else {
        audio.playFail();
        if (this.displayEl) {
          this.displayEl.style.borderColor = "var(--accent-crimson)";
          this.displayEl.classList.add("shake-screen");
          setTimeout(() => {
            this.displayEl.style.borderColor = "var(--accent-blue)";
            this.displayEl.classList.remove("shake-screen");
            this.currentCode = "";
            this.updateDisplay();
          }, 600);
        }
      }
    }
  }

  const puzzle = new PuzzleEngine();

  // 8. ENGINE: DEDUCTION
  class DeductionEngine {
    constructor() {
      this.modalEl = null;
      this.stepBadgeEl = null;
      this.questionTextEl = null;
      this.optionsListEl = null;
      this.currentStepIndex = 0;
    }
    init() {
      this.modalEl = document.getElementById("deduction-modal");
      this.stepBadgeEl = document.getElementById("deduction-step-badge");
      this.questionTextEl = document.getElementById("deduction-question-text");
      this.optionsListEl = document.getElementById("deduction-options-list");

      const closeBtn = document.getElementById("btn-close-deduction");
      if (closeBtn) closeBtn.addEventListener("click", () => this.close());
    }
    start() {
      this.currentStepIndex = 0;
      audio.playObjection();
      this.triggerObjectionBanner("진실을 밝힐 시간이다!");
      setTimeout(() => {
        if (this.modalEl) {
          this.modalEl.classList.add("active");
          this.renderStep();
        }
      }, 1000);
    }
    close() {
      audio.playClick();
      if (this.modalEl) this.modalEl.classList.remove("active");
    }
    renderStep() {
      const phase = DEDUCTION_PHASES[this.currentStepIndex];
      if (!phase) return;
      if (this.stepBadgeEl) this.stepBadgeEl.textContent = `PHASE ${phase.step} / 3 - ${phase.title}`;
      if (this.questionTextEl) this.questionTextEl.textContent = phase.question;
      if (!this.optionsListEl) return;
      this.optionsListEl.innerHTML = "";

      phase.options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "deduction-option-btn";
        btn.innerHTML = `
          <span class="option-num-badge">${idx + 1}</span>
          <span>${opt.text}</span>
        `;
        btn.onclick = () => this.handleSelection(opt);
        this.optionsListEl.appendChild(btn);
      });
    }
    handleSelection(option) {
      audio.playClick();
      if (this.currentStepIndex < 2) {
        if (option.isCorrect) {
          audio.playSuccess();
          this.triggerObjectionBanner("정답입니다!");
          this.currentStepIndex++;
          setTimeout(() => this.renderStep(), 1000);
        } else {
          audio.playFail();
          alert(`❌ 논리적 오류: ${option.feedback}`);
        }
      } else {
        this.close();
        const endingKey = option.endingType || (option.isCorrect ? "true_ending" : "bad_minwoo");
        const endingData = ENDINGS[endingKey] || ENDINGS.true_ending;
        if (option.isCorrect) {
          audio.playObjection();
          this.triggerObjectionBanner("범인은 바로 당신이야!");
        } else {
          audio.playFail();
        }
        setTimeout(() => this.showEndingScreen(endingData), 1200);
      }
    }
    triggerObjectionBanner(text = "이의 있음!") {
      const banner = document.getElementById("objection-banner");
      const container = document.querySelector(".game-container");
      if (banner) {
        banner.textContent = text;
        banner.classList.add("active");
        if (container) container.classList.add("shake-screen");
        setTimeout(() => {
          banner.classList.remove("active");
          if (container) container.classList.remove("shake-screen");
        }, 1200);
      }
    }
    showEndingScreen(endingData) {
      const endingScreen = document.getElementById("ending-screen");
      const endingBadge = document.getElementById("ending-badge");
      const endingTitle = document.getElementById("ending-title");
      const endingStory = document.getElementById("ending-story-text");

      if (endingBadge) {
        endingBadge.textContent = endingData.badge;
        endingBadge.style.color = endingData.type === "SUCCESS" ? "var(--accent-gold)" : "var(--accent-crimson)";
      }
      if (endingTitle) endingTitle.textContent = endingData.title;
      if (endingStory) {
        endingStory.innerHTML = endingData.story.trim().replace(/\n/g, "<br><br>");
      }
      if (endingScreen) endingScreen.classList.remove("hidden");
    }
  }

  const deduction = new DeductionEngine();

  // 9. ENGINE: INVESTIGATION
  class InvestigationEngine {
    constructor() {
      this.currentLocationId = "loc_teachers_room";
      this.viewportEl = null;
      this.hotspotsLayerEl = null;
      this.locationTitleEl = null;
      this.locationListEl = null;
      this.standeeEl = null;
      this.inspectedHotspots = new Set();
    }
    init() {
      this.viewportEl = document.getElementById("scene-canvas-wrapper");
      this.hotspotsLayerEl = document.getElementById("hotspots-layer");
      this.locationTitleEl = document.getElementById("header-location-name");
      this.locationListEl = document.getElementById("map-location-list");
      this.standeeEl = document.getElementById("character-standee");

      this.renderLocationList();
      this.loadLocation(this.currentLocationId);
    }
    renderLocationList() {
      if (!this.locationListEl) return;
      this.locationListEl.innerHTML = "";

      Object.values(LOCATIONS).forEach(loc => {
        const card = document.createElement("div");
        card.className = `location-card ${loc.id === this.currentLocationId ? 'active' : ''}`;
        card.dataset.locId = loc.id;
        const suspectNames = loc.suspects.map(sid => CHARACTERS[sid]?.name).filter(Boolean);

        card.innerHTML = `
          <div class="location-card-top">
            <span class="location-name">${loc.name}</span>
            <span class="location-badge">${loc.floor}</span>
          </div>
          <div class="location-desc">${loc.description.slice(0, 32)}...</div>
          ${suspectNames.length > 0 ? `
            <div class="location-suspect-tags">
              ${suspectNames.map(name => `<span class="suspect-tag">👤 ${name}</span>`).join('')}
            </div>
          ` : ''}
        `;

        card.onclick = () => {
          if (this.currentLocationId !== loc.id) {
            audio.playClick();
            this.loadLocation(loc.id);
          }
        };

        this.locationListEl.appendChild(card);
      });
    }
    loadLocation(locId) {
      const loc = LOCATIONS[locId];
      if (!loc) return;
      this.currentLocationId = locId;

      if (this.locationTitleEl) this.locationTitleEl.textContent = `${loc.name} (${loc.floor})`;
      document.querySelectorAll(".location-card").forEach(c => {
        c.classList.toggle("active", c.dataset.locId === locId);
      });

      this.renderSceneSvg(loc.bgSvgType);
      this.renderHotspots(loc.hotspots);
      this.renderCharacter(loc.suspects[0] || null);

      const suspectId = loc.suspects[0];
      if (suspectId && CHARACTERS[suspectId]) {
        const char = CHARACTERS[suspectId];
        dialogue.playDialogue(
          suspectId,
          char.introDialogue,
          [
            {
              text: "💬 질문하기",
              icon: "❓",
              onClick: () => this.talkToSuspect(suspectId)
            },
            {
              text: "📋 증거 제시",
              icon: "👉",
              onClick: () => this.presentEvidenceToSuspect(suspectId)
            }
          ]
        );
      } else {
        dialogue.playDialogue(
          "detective",
          loc.description,
          [{
            text: "🔍 현장 조사하기",
            icon: "🔎",
            onClick: () => dialogue.finishTyping()
          }]
        );
      }
    }
    renderCharacter(suspectId) {
      if (!this.standeeEl) return;
      if (!suspectId || !CHARACTERS[suspectId]) {
        this.standeeEl.style.display = "none";
        return;
      }
      const char = CHARACTERS[suspectId];
      this.standeeEl.style.display = "flex";
      this.standeeEl.style.alignItems = "flex-end";
      this.standeeEl.innerHTML = `
        <div style="text-align: center; animation: fadeIn 0.4s ease;">
          <div style="font-size: 8rem; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.8));">
            ${char.avatar}
          </div>
          <div style="background: rgba(15,23,42,0.85); padding: 4px 12px; border-radius: 99px; border: 1px solid ${char.color}; font-size: 0.85rem; font-weight: 700; color: ${char.color};">
            ${char.name} (${char.role})
          </div>
        </div>
      `;
    }
    talkToSuspect(suspectId) {
      let responseText = "";
      if (suspectId === "minwoo") {
        responseText = "학생회 축제 공문과 기말고사 일정 조율 때문에 바빴어. 컴퓨터실 로그를 확인해보면 알겠지만 난 줄곧 컴퓨터 앞에 있었어.";
      } else if (suspectId === "haeun") {
        responseText = "9시 25분쯤 복도에서 다급하게 뛰어가는 소리와 짤랑거리는 쇠 소리를 들었어요! 누군가 무거운 가방을 메고 뛰는 느낌이었죠.";
      } else if (suspectId === "doyoon") {
        responseText = "과학실에서 비커가 깨져서 에탄올 걸레질을 하느라 옷에 냄새가 밴 것뿐이야. 교무실 쪽엔 간 적도 없어.";
      } else if (suspectId === "seojun") {
        responseText = "미술실에서 유화 마감 작업을 계속했어. 손에 묻은 파란 물감도 캔버스 작업 때문이고... 날 의심하는 거야?";
      }

      dialogue.playDialogue(
        suspectId,
        responseText,
        [
          {
            text: "📋 증거 제시하기",
            icon: "👉",
            onClick: () => this.presentEvidenceToSuspect(suspectId)
          },
          {
            text: "돌아가기",
            icon: "↩️",
            onClick: () => this.loadLocation(this.currentLocationId)
          }
        ]
      );
    }
    presentEvidenceToSuspect(suspectId) {
      notebook.open((presentedClue) => {
        const char = CHARACTERS[suspectId];
        if (!char) return;
        const reaction = char.clueReactions[presentedClue.id] || char.clueReactions.default;

        if (
          (suspectId === "seojun" && presentedClue.id === "clue_master_key_trace") ||
          (suspectId === "minwoo" && presentedClue.id === "clue_security_log")
        ) {
          audio.playObjection();
          this.triggerObjectionBanner();
        }

        dialogue.playDialogue(
          suspectId,
          `[${presentedClue.name}을(를) 제시했다]\n\n"${reaction}"`,
          [
            {
              text: "다른 질문하기",
              icon: "💬",
              onClick: () => this.talkToSuspect(suspectId)
            },
            {
              text: "수색 계속하기",
              icon: "🔍",
              onClick: () => this.loadLocation(this.currentLocationId)
            }
          ]
        );
      });
    }
    triggerObjectionBanner() {
      const banner = document.getElementById("objection-banner");
      const container = document.querySelector(".game-container");
      if (banner) {
        banner.classList.add("active");
        if (container) container.classList.add("shake-screen");
        setTimeout(() => {
          banner.classList.remove("active");
          if (container) container.classList.remove("shake-screen");
        }, 1200);
      }
    }
    renderHotspots(hotspots) {
      if (!this.hotspotsLayerEl) return;
      this.hotspotsLayerEl.innerHTML = "";

      hotspots.forEach(hs => {
        const btn = document.createElement("button");
        const isInspected = this.inspectedHotspots.has(hs.id);
        btn.className = `hotspot-btn ${isInspected ? 'inspected' : ''}`;
        btn.style.left = `${hs.x}%`;
        btn.style.top = `${hs.y}%`;
        btn.innerHTML = `<span class="hotspot-icon">${hs.icon}</span><span>${hs.name}</span>`;

        btn.onclick = () => {
          this.inspectedHotspots.add(hs.id);
          btn.classList.add("inspected");

          if (hs.clueId) notebook.addClue(hs.clueId);

          if (hs.id === "hs_safe" && !puzzle.isSolved) {
            dialogue.playDialogue(
              "detective",
              "금고에 4자리 전자 비밀번호 키패드가 연결되어 있다. 암호를 입력해 볼까?",
              [
                {
                  text: "🔢 암호 입력하기",
                  icon: "🔑",
                  isHighlight: true,
                  onClick: () => puzzle.open()
                },
                {
                  text: "주변 더 둘러보기",
                  icon: "↩️",
                  onClick: () => dialogue.finishTyping()
                }
              ]
            );
            return;
          }

          audio.playClick();
          dialogue.playDialogue(
            "detective",
            hs.message,
            [{
              text: "확인",
              icon: "✅",
              onClick: () => dialogue.finishTyping()
            }]
          );
        };

        this.hotspotsLayerEl.appendChild(btn);
      });
    }
    renderSceneSvg(bgType) {
      if (!this.viewportEl) return;
      let svgContent = "";
      if (bgType === "teachers_room") {
        svgContent = `
          <svg viewBox="0 0 1000 600" class="scene-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="wall-tr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e293b"/></linearGradient>
              <linearGradient id="floor-tr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>
            </defs>
            <rect width="1000" height="420" fill="url(#wall-tr)"/>
            <polygon points="0,420 1000,420 1000,600 0,600" fill="url(#floor-tr)"/>
            <rect x="100" y="80" width="220" height="200" fill="#030712" stroke="#334155" stroke-width="6" rx="4"/>
            <line x1="210" y1="80" x2="210" y2="280" stroke="#334155" stroke-width="4"/>
            <line x1="100" y1="180" x2="320" y2="180" stroke="#334155" stroke-width="4"/>
            <rect x="180" y="380" width="280" height="120" fill="#334155" stroke="#475569" stroke-width="3" rx="6"/>
            <rect x="440" y="240" width="160" height="200" fill="#1e293b" stroke="#f59e0b" stroke-width="4" rx="8"/>
            <circle cx="520" cy="330" r="30" fill="#334155" stroke="#fcd34d" stroke-width="3"/>
            <rect x="490" y="325" width="60" height="10" fill="#fcd34d" rx="3"/>
            <rect x="700" y="100" width="220" height="340" fill="#1e293b" stroke="#475569" stroke-width="4" rx="4"/>
          </svg>
        `;
      } else if (bgType === "science_lab") {
        svgContent = `
          <svg viewBox="0 0 1000 600" class="scene-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="wall-sci" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#064e3b"/><stop offset="100%" stop-color="#022c22"/></linearGradient>
            </defs>
            <rect width="1000" height="420" fill="url(#wall-sci)"/>
            <polygon points="0,420 1000,420 1000,600 0,600" fill="#0f172a"/>
            <rect x="150" y="60" width="400" height="180" fill="#065f46" stroke="#047857" stroke-width="6" rx="6"/>
            <text x="180" y="130" fill="#a7f3d0" font-size="24" font-family="monospace">C(6) + O(8) × 10 = ?</text>
            <text x="180" y="180" fill="#6ee7b7" font-size="18" font-family="monospace">CH3CH2OH (Ethanol Lab)</text>
            <rect x="650" y="120" width="260" height="300" fill="#134e4a" stroke="#14b8a6" stroke-width="3" rx="6"/>
            <rect x="350" y="380" width="380" height="140" fill="#1e293b" stroke="#10b981" stroke-width="3" rx="6"/>
          </svg>
        `;
      } else if (bgType === "broadcast_room") {
        svgContent = `
          <svg viewBox="0 0 1000 600" class="scene-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="wall-bc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2e1065"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>
            </defs>
            <rect width="1000" height="420" fill="url(#wall-bc)"/>
            <polygon points="0,420 1000,420 1000,600 0,600" fill="#090d16"/>
            <rect x="420" y="30" width="160" height="45" fill="#ef4444" rx="6"/>
            <text x="460" y="60" fill="#fff" font-size="20" font-weight="bold" font-family="sans-serif">ON AIR</text>
            <rect x="250" y="360" width="500" height="150" fill="#1e1b4b" stroke="#8b5cf6" stroke-width="3" rx="8"/>
            <line x1="400" y1="360" x2="400" y2="280" stroke="#c084fc" stroke-width="6"/>
            <circle cx="400" cy="270" r="16" fill="#c084fc"/>
          </svg>
        `;
      } else if (bgType === "art_room") {
        svgContent = `
          <svg viewBox="0 0 1000 600" class="scene-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="wall-art" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#451a03"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>
            </defs>
            <rect width="1000" height="420" fill="url(#wall-art)"/>
            <polygon points="0,420 1000,420 1000,600 0,600" fill="#18181b"/>
            <polygon points="600,200 550,460 650,460" fill="none" stroke="#d97706" stroke-width="6"/>
            <rect x="520" y="240" width="160" height="180" fill="#1e3a8a" stroke="#3b82f6" stroke-width="4" rx="4"/>
            <rect x="220" y="300" width="120" height="180" fill="#3f3f46" stroke="#71717a" stroke-width="3" rx="4"/>
            <circle cx="280" cy="260" r="32" fill="#e4e4e7" stroke="#a1a1aa" stroke-width="3"/>
            <rect x="740" y="380" width="200" height="140" fill="#27272a" stroke="#f59e0b" stroke-width="3" rx="6"/>
          </svg>
        `;
      } else if (bgType === "computer_lab") {
        svgContent = `
          <svg viewBox="0 0 1000 600" class="scene-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="wall-pc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#083344"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>
            </defs>
            <rect width="1000" height="420" fill="url(#wall-pc)"/>
            <polygon points="0,420 1000,420 1000,600 0,600" fill="#0f172a"/>
            <rect x="120" y="340" width="760" height="160" fill="#164e63" stroke="#06b6d4" stroke-width="3" rx="8"/>
            <rect x="420" y="160" width="160" height="220" fill="#0e7490" stroke="#22d3ee" stroke-width="4" rx="6"/>
          </svg>
        `;
      }
      this.viewportEl.innerHTML = svgContent;
    }
  }

  const investigation = new InvestigationEngine();

  // 10. MASTER GAME ORCHESTRATOR
  class GameMaster {
    constructor() {
      this.rainCanvas = null;
      this.rainCtx = null;
      this.raindrops = [];
    }
    init() {
      dialogue.init();
      notebook.init();
      puzzle.init();
      deduction.init();
      investigation.init();

      this.initRainCanvas();
      this.setupGlobalEvents();
    }
    initRainCanvas() {
      this.rainCanvas = document.getElementById("rain-canvas");
      if (!this.rainCanvas) return;
      this.rainCtx = this.rainCanvas.getContext("2d");

      const resizeCanvas = () => {
        this.rainCanvas.width = window.innerWidth;
        this.rainCanvas.height = window.innerHeight;
      };
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      for (let i = 0; i < 100; i++) {
        this.raindrops.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          length: Math.random() * 20 + 10,
          speed: Math.random() * 8 + 6
        });
      }

      const animateRain = () => {
        if (this.rainCtx) {
          this.rainCtx.clearRect(0, 0, this.rainCanvas.width, this.rainCanvas.height);
          this.rainCtx.strokeStyle = "rgba(148, 163, 184, 0.35)";
          this.rainCtx.lineWidth = 1.2;
          this.raindrops.forEach(drop => {
            this.rainCtx.beginPath();
            this.rainCtx.moveTo(drop.x, drop.y);
            this.rainCtx.lineTo(drop.x - 2, drop.y + drop.length);
            this.rainCtx.stroke();
            drop.y += drop.speed;
            drop.x -= 1;
            if (drop.y > this.rainCanvas.height) {
              drop.y = -drop.length;
              drop.x = Math.random() * this.rainCanvas.width;
            }
          });
        }
        requestAnimationFrame(animateRain);
      };
      animateRain();
    }
    setupGlobalEvents() {
      const startBtn = document.getElementById("btn-start-game");
      if (startBtn) {
        startBtn.addEventListener("click", () => {
          audio.playClick();
          audio.startMysteryBGM();
          document.getElementById("start-screen").classList.add("hidden");
          this.startIntro();
        });
      }

      const restartBtn = document.getElementById("btn-restart-game");
      if (restartBtn) {
        restartBtn.addEventListener("click", () => location.reload());
      }

      const notebookBtn = document.getElementById("btn-open-notebook");
      if (notebookBtn) notebookBtn.addEventListener("click", () => notebook.open());

      const deductionBtn = document.getElementById("btn-start-deduction");
      if (deductionBtn) deductionBtn.addEventListener("click", () => deduction.start());

      const muteBtn = document.getElementById("btn-toggle-sound");
      if (muteBtn) {
        muteBtn.addEventListener("click", () => {
          const isMuted = audio.toggleMute();
          muteBtn.textContent = isMuted ? "🔇" : "🔊";
        });
      }

      const guideBtn = document.getElementById("btn-guide");
      const guideModal = document.getElementById("guide-modal");
      const closeGuideBtn = document.getElementById("btn-close-guide");
      if (guideBtn && guideModal) {
        guideBtn.addEventListener("click", () => {
          audio.playClick();
          guideModal.classList.add("active");
        });
      }
      if (closeGuideBtn && guideModal) {
        closeGuideBtn.addEventListener("click", () => {
          audio.playClick();
          guideModal.classList.remove("active");
        });
      }

      this.startCountdownTimer();
    }
    startCountdownTimer() {
      const timerDisplay = document.getElementById("header-timer");
      let secondsLeft = 30 * 60;
      setInterval(() => {
        if (secondsLeft > 0) {
          secondsLeft--;
          const mins = Math.floor(secondsLeft / 60);
          const secs = secondsLeft % 60;
          if (timerDisplay) {
            const currentMinute = 30 + Math.floor((30 * 60 - secondsLeft) / 60);
            timerDisplay.textContent = `21:${String(currentMinute).padStart(2, '0')} (남은 시간: ${mins}분 ${String(secs).padStart(2, '0')}초)`;
          }
        }
      }, 1000);
    }
    startIntro() {
      dialogue.playQueue(STORY_EVENTS.intro, () => {
        dialogue.playDialogue(
          "detective",
          "자, 먼저 2층 교무실과 다른 장소들을 샅샅이 조사하여 사건의 단서를 모으자!",
          [{
            text: "수사 개시! 🔍",
            icon: "🚀",
            onClick: () => investigation.loadLocation("loc_teachers_room")
          }]
        );
      });
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    const game = new GameMaster();
    game.init();
  });
})();
