/**
 * [방탈출 / 텍스트 어드벤처] 스토리 및 씬 데이터베이스
 * 
 * 동아리 부원들이 새로운 방(Scene)이나 선택지(Choices)를 추가할 때
 * 이 파일의 구조를 참고하여 손쉽게 확장할 수 있습니다.
 */

window.STORY_DATA = {
  // 초기 게임 상태
  initialState: {
    currentSceneId: "classroom_start",
    timeRemaining: 1800, // 30분 (초 단위)
    tension: 20, // 긴장도 (0 ~ 100)
    flags: {
      hasLight: false,
      powerRestored: false,
      lockerUnlocked: false,
      officeDoorUnlocked: false,
      officeSafeUnlocked: false,
      scienceLabUnlocked: false,
      truthDocumentFound: false,
      timeCapsuleFound: false,
      wiresConnected: false,
      visitedRooms: ["classroom_start"]
    }
  },

  // 모든 씬(장소) 데이터
  scenes: {
    // ------------------------------------------------------------------------
    // [1] 3학년 4반 교실
    // ------------------------------------------------------------------------
    classroom_start: {
      id: "classroom_start",
      locationName: "3학년 4반 교실",
      floor: "본관 3층",
      backgroundImage: "assets/images/classroom.jpg",
      speaker: "나 (독백)",
      text: `눈을 떠보니 칠흑 같은 어둠 속이다.\n창밖을 보니 자정이 넘은 시각. 교실엔 아무도 없고 차가운 밤공기만 맴돈다.\n\n"야간 자율학습 때 깜빡 잠들었나...? 문이 잠겨 있어!"\n교실 안을 둘러보고 나갈 방법을 찾아야 한다.`,
      hotspots: [
        { id: "hs_chalkboard", label: "칠판 낙서", x: 62, y: 35, targetScene: "classroom_blackboard" },
        { id: "hs_desk", label: "내 서랍 & 짝꿍 서랍", x: 45, y: 72, targetScene: "classroom_desk" },
        { id: "hs_locker", label: "뒷문 쪽 사물함", x: 18, y: 65, targetScene: "classroom_locker" },
        { id: "hs_door", label: "복도로 통하는 앞문", x: 92, y: 55, targetScene: "classroom_door" }
      ],
      choices: [
        {
          text: "🔍 교탁과 칠판 쪽을 자세히 살펴본다.",
          targetScene: "classroom_blackboard"
        },
        {
          text: "🎒 책상 서랍과 떨어진 가방을 뒤져본다.",
          targetScene: "classroom_desk"
        },
        {
          text: "🔒 비밀번호로 잠긴 뒷 사물함을 조사한다.",
          targetScene: "classroom_locker"
        },
        {
          text: "🚪 닫힌 교실 앞문을 열어본다.",
          targetScene: "classroom_door"
        }
      ]
    },

    classroom_blackboard: {
      id: "classroom_blackboard",
      locationName: "3학년 4반 칠판 앞",
      floor: "본관 3층",
      backgroundImage: "assets/images/classroom.jpg",
      speaker: "나 (조사)",
      text: `칠판에는 지워지지 않은 수학/물리 수식들과 함께 누군가 급하게 긁어쓴 낙서가 있다.\n\n[ 칠판 메모 ]: \n"불이 꺼지면 선을 순서대로 연결해라.\n빨강(R) → 노랑(Y) → 파랑(B) → 초록(G).\n단, 전원 레버는 마지막에 올려야 함!"\n\n그리고 구석에 [ 24 x 13 = ? ] 이라는 의문의 낙서도 적혀있다.`,
      choices: [
        {
          text: "✏️ 칠판 낙서의 단서를 수첩에 메모하고 돌아선다.",
          targetScene: "classroom_start",
          action: (state) => {
            state.flags.blackboardInspected = true;
          }
        },
        {
          text: "🔢 낙서 [24 x 13]의 값을 암산해본다. (사물함 힌트인가?)",
          targetScene: "classroom_locker_hint"
        }
      ]
    },

    classroom_locker_hint: {
      id: "classroom_locker_hint",
      locationName: "3학년 4반 교실",
      floor: "본관 3층",
      backgroundImage: "assets/images/classroom.jpg",
      speaker: "나 (추리)",
      text: `24 곱하기 13은... **312** 이다. 4자리 비밀번호라면 앞에 0을 붙인 **0312**일까, 아니면 312 뒤에 무언가가 더 있는 걸까?\n사물함 자물쇠를 확인해보자.`,
      choices: [
        {
          text: "🔒 사물함 자물쇠로 이동한다.",
          targetScene: "classroom_locker"
        },
        {
          text: "🔙 교실 중앙으로 돌아간다.",
          targetScene: "classroom_start"
        }
      ]
    },

    classroom_desk: {
      id: "classroom_desk",
      locationName: "책상 서랍",
      floor: "본관 3층",
      backgroundImage: "assets/images/classroom.jpg",
      speaker: "나 (탐색)",
      text: `짝꿍의 서랍 속에서 오래된 [방전된 손전등]과 [찢어진 일기장 조각 1]을 발견했다!\n손전등 뚜껑을 열어보니 AA 배터리가 빠져 있다. 배터리만 구하면 어두운 복도를 밝힐 수 있을 텐데...`,
      choices: [
        {
          text: "🔦 방전된 손전등과 일기장 조각을 챙긴다.",
          targetScene: "classroom_start",
          condition: (state) => !state.hasItem("empty_flashlight"),
          action: (state) => {
            state.addItem("empty_flashlight");
            state.addItem("diary_piece_1");
            state.showToast("아이템 획득: [방전된 손전등], [찢어진 일기장 1]");
          }
        },
        {
          text: "🔙 교실 중앙으로 돌아간다.",
          targetScene: "classroom_start",
          condition: (state) => state.hasItem("empty_flashlight")
        }
      ]
    },

    classroom_locker: {
      id: "classroom_locker",
      locationName: "교실 뒤 사물함",
      floor: "본관 3층",
      backgroundImage: "assets/images/classroom.jpg",
      speaker: "나 (자물쇠)",
      text: `반장의 사물함에 4자리 다이얼 자물쇠가 걸려있다.\n칠판에 적혀있던 의문의 계산식 [24 x 13 = ?]과 3월 12일 신학기 쪽지가 붙어있다.\n\n4자리 비밀번호를 입력해 사물함을 열어보자.`,
      choices: [
        {
          text: "🔢 4자리 비밀번호 자물쇠를 푼다.",
          triggerPuzzle: "keypad_locker",
          condition: (state) => !state.flags.lockerUnlocked
        },
        {
          text: "📦 열린 사물함 내부를 확인한다.",
          targetScene: "classroom_locker_opened",
          condition: (state) => state.flags.lockerUnlocked
        },
        {
          text: "🔙 돌아간다.",
          targetScene: "classroom_start"
        }
      ]
    },

    classroom_locker_opened: {
      id: "classroom_locker_opened",
      locationName: "열린 사물함",
      floor: "본관 3층",
      backgroundImage: "assets/images/classroom.jpg",
      speaker: "나 (아이템)",
      text: `사물함 안에는 새 [AA 배터리 2개]와 교무실 비상 안내문이 들어있다!\n\n💡 **[아이템 팁]**: 하단 가방(인벤토리)에서 [방전된 손전등]을 클릭 후 [AA 배터리]와 조합할 수 있습니다.`,
      choices: [
        {
          text: "🔋 AA 배터리를 챙긴다.",
          targetScene: "classroom_start",
          condition: (state) => !state.hasItem("battery") && !state.hasItem("flashlight"),
          action: (state) => {
            state.addItem("battery");
            state.showToast("아이템 획득: [AA 배터리 2개]");
          }
        },
        {
          text: "🔙 교실 중앙으로 돌아간다.",
          targetScene: "classroom_start"
        }
      ]
    },

    classroom_door: {
      id: "classroom_door",
      locationName: "3학년 4반 앞문",
      floor: "본관 3층",
      backgroundImage: "assets/images/classroom.jpg",
      speaker: "나 (문)",
      text: `교실 앞문의 잠금장치를 풀고 문을 살짝 밀어보았다. 끼이익- 소리와 함께 문이 열린다.\n하지만 복도는 가로등 불빛조차 닿지 않는 완벽한 암흑이다. 손전등 없이 나갔다가는 길을 잃거나 다칠 것 같다.`,
      choices: [
        {
          text: "🔦 손전등을 켜고 복도로 나선다.",
          targetScene: "hallway_3f",
          condition: (state) => state.hasItem("flashlight")
        },
        {
          text: "⚠️ 손전등 없이 어둠 속으로 발을 내딛는다.",
          targetScene: "bad_ending_darkness",
          condition: (state) => !state.hasItem("flashlight")
        },
        {
          text: "🔙 먼저 교실에서 조명 도구를 더 찾아본다.",
          targetScene: "classroom_start"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // [2] 3층 복도 & 분전함
    // ------------------------------------------------------------------------
    hallway_3f: {
      id: "hallway_3f",
      locationName: "본관 3층 복도",
      floor: "본관 3층",
      backgroundImage: "assets/images/hallway.jpg",
      speaker: "나 (탐색)",
      text: `손전등 빛이 어두운 복도를 비춘다. 저 멀리 비상구 표시등이 희미하게 깜빡이고 있다.\n\n벽면에는 [3층 분전함(두꺼비집)]이 있고, 복도 끝에는 2층으로 내려가는 계단과 전자도어락이 달린 [교무실]이 보인다.\n현재 복도 전원이 차단되어 교무실 도어락에 불이 들어오지 않는다.`,
      hotspots: [
        { id: "hs_fuse", label: "벽면 분전함 (전원)", x: 25, y: 55, targetScene: "fuse_box" },
        { id: "hs_office", label: "교무실 입구", x: 75, y: 60, targetScene: "teachers_office_door" },
        { id: "hs_stairs", label: "2층으로 내려가는 계단", x: 50, y: 48, targetScene: "hallway_2f" }
      ],
      choices: [
        {
          text: "⚡ 3층 벽면의 분전함(배전반)을 열어본다.",
          targetScene: "fuse_box"
        },
        {
          text: "🚪 복도 끝의 [교무실] 문으로 다가간다.",
          targetScene: "teachers_office_door"
        },
        {
          text: "⬇️ 계단을 통해 [2층 복도/과학실] 방향으로 내려간다.",
          targetScene: "hallway_2f"
        },
        {
          text: "🔙 3학년 4반 교실로 돌아간다.",
          targetScene: "classroom_start"
        }
      ]
    },

    fuse_box: {
      id: "fuse_box",
      locationName: "3층 벽면 분전함",
      floor: "본관 3층",
      backgroundImage: "assets/images/hallway.jpg",
      speaker: "나 (배전반)",
      text: `분전함을 열자 끊어진 전선들과 4색(빨강, 노랑, 파랑, 초록) 터미널 단자가 어지럽게 널려있다.\n\n"칠판에 적혀있던 연결 순서 메모가 뭐였더라...?"`,
      choices: [
        {
          text: "🔌 4색 전선 배선 퍼즐을 시작한다.",
          triggerPuzzle: "wire_puzzle",
          condition: (state) => !state.flags.powerRestored
        },
        {
          text: "⚡ 전원이 복구되어 배전반이 정상 작동 중이다.",
          targetScene: "hallway_3f",
          condition: (state) => state.flags.powerRestored
        },
        {
          text: "🔙 복도로 물러선다.",
          targetScene: "hallway_3f"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // [3] 교무실 & 금고
    // ------------------------------------------------------------------------
    teachers_office_door: {
      id: "teachers_office_door",
      locationName: "교무실 앞",
      floor: "본관 3층",
      backgroundImage: "assets/images/hallway.jpg",
      speaker: "나 (도어락)",
      text: (state) => {
        if (!state.flags.powerRestored) {
          return `교무실 문에는 최신형 디지털 도어락이 설치되어 있다.\n하지만 건물의 메인 전원이 내려가 있어 도어락 화면이 꺼져있다.\n먼저 분전함에서 전원을 켜야 한다.`;
        } else if (state.flags.officeDoorUnlocked) {
          return `교무실 도어락이 해제되어 문이 살짝 열려있다. 안으로 들어갈 수 있다.`;
        } else {
          return `분전함을 복구하자 도어락 키패드에 파란 불빛이 켜졌다!\n도어락에 4자리 비밀번호를 입력해야 한다.\n(힌트: 3학년 교무실 문 옆에 '선생님 생신: 개교기념일(10월 24일)' 메모가 붙어있다.)`;
        }
      },
      choices: [
        {
          text: "🔢 도어락 비밀번호(1024)를 입력한다.",
          triggerPuzzle: "keypad_office",
          condition: (state) => state.flags.powerRestored && !state.flags.officeDoorUnlocked
        },
        {
          text: "🚪 열린 문을 통해 교무실 안으로 진입한다.",
          targetScene: "teachers_office",
          condition: (state) => state.flags.officeDoorUnlocked
        },
        {
          text: "🔙 3층 복도로 돌아간다.",
          targetScene: "hallway_3f"
        }
      ]
    },

    teachers_office: {
      id: "teachers_office",
      locationName: "교무실 내부",
      floor: "본관 3층",
      backgroundImage: "assets/images/office.jpg",
      speaker: "나 (교무실)",
      text: `교무실 안은 서류와 시험지가 빼곡히 쌓여있다.\n선생님 책상 위에는 [찢어진 일기장 조각 2]와 당직 근무 일지가 놓여있고, 한쪽 구석에는 묵직한 철제 금고가 자리잡고 있다.`,
      hotspots: [
        { id: "hs_teacher_desk", label: "선생님 책상 & 서류", x: 38, y: 75, targetScene: "office_desk" },
        { id: "hs_safe", label: "철제 금고 (다이얼)", x: 88, y: 55, targetScene: "office_safe" }
      ],
      choices: [
        {
          text: "📄 선생님 책상 위의 일지와 서류를 조사한다.",
          targetScene: "office_desk"
        },
        {
          text: "🗄️ 구석의 대형 철제 금고를 조사한다.",
          targetScene: "office_safe"
        },
        {
          text: "🔙 교무실 밖 복도로 나간다.",
          targetScene: "hallway_3f"
        }
      ]
    },

    office_desk: {
      id: "office_desk",
      locationName: "교무실 주번/당직 책상",
      floor: "본관 3층",
      backgroundImage: "assets/images/office.jpg",
      speaker: "나 (서류 조사)",
      text: `책상 위에서 [찢어진 일기장 조각 2]와 [과학실 열쇠]를 발견했다!\n\n당직 일지 메모:\n"금고 비밀번호 다이얼: 학교 설립 연도(1953년)의 마지막 두 자리 + 과학실 번호(7) = 5307"`,
      choices: [
        {
          text: "🔑 과학실 열쇠와 일기장 조각 2를 획득한다.",
          targetScene: "teachers_office",
          condition: (state) => !state.hasItem("sciencelab_key"),
          action: (state) => {
            state.addItem("sciencelab_key");
            state.addItem("diary_piece_2");
            state.showToast("아이템 획득: [과학실 열쇠], [찢어진 일기장 2]");
          }
        },
        {
          text: "🔙 교무실 중앙으로 돌아간다.",
          targetScene: "teachers_office",
          condition: (state) => state.hasItem("sciencelab_key")
        }
      ]
    },

    office_safe: {
      id: "office_safe",
      locationName: "교무실 대형 금고",
      floor: "본관 3층",
      backgroundImage: "assets/images/office.jpg",
      speaker: "나 (금고)",
      text: `육중한 금고에 다이얼식 4자리 번호 잠금장치가 부착되어 있다.\n책상에서 확인한 힌트 [5307]을 다이얼에 맞춰보자.`,
      choices: [
        {
          text: "🔐 금고 다이얼 번호(4자리)를 맞춘다.",
          triggerPuzzle: "keypad_safe",
          condition: (state) => !state.flags.officeSafeUnlocked
        },
        {
          text: "🌟 열린 금고 속의 [학교 정문 비상 마스터키]를 획득한다!",
          targetScene: "teachers_office",
          condition: (state) => state.flags.officeSafeUnlocked && !state.hasItem("master_key"),
          action: (state) => {
            state.addItem("master_key");
            state.flags.truthDocumentFound = true;
            state.showToast("핵심 아이템 획득: [학교 정문 비상 마스터키] & [기밀 봉투]");
          }
        },
        {
          text: "🔙 교무실 중앙으로 돌아간다.",
          targetScene: "teachers_office"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // [4] 2층 복도 & 과학실
    // ------------------------------------------------------------------------
    hallway_2f: {
      id: "hallway_2f",
      locationName: "본관 2층 복도",
      floor: "본관 2층",
      backgroundImage: "assets/images/hallway.jpg",
      speaker: "나 (2층)",
      text: `2층 복도로 내려오자 서늘한 한기와 함께 알 수 없는 화학 약품 냄새가 희미하게 풍겨온다.\n복도 중간에는 [과학실] 문이 굳게 닫혀있고, 계단을 더 내려가면 1층 [학교 정문]으로 이어진다.`,
      hotspots: [
        { id: "hs_sciencelab", label: "과학실 문", x: 30, y: 55, targetScene: "sciencelab_door" },
        { id: "hs_gate_down", label: "1층 학교 정문으로 가기", x: 70, y: 65, targetScene: "schoolgate_scene" },
        { id: "hs_up_3f", label: "3층으로 올라가기", x: 50, y: 35, targetScene: "hallway_3f" }
      ],
      choices: [
        {
          text: "🧪 2층 [과학실] 입구로 다가간다.",
          targetScene: "sciencelab_door"
        },
        {
          text: "🏃 1층 [학교 정문 / 탈출구]로 내려간다.",
          targetScene: "schoolgate_scene"
        },
        {
          text: "⬆️ 3층 복도로 다시 올라간다.",
          targetScene: "hallway_3f"
        }
      ]
    },

    sciencelab_door: {
      id: "sciencelab_door",
      locationName: "과학실 입구",
      floor: "본관 2층",
      backgroundImage: "assets/images/hallway.jpg",
      speaker: "나 (과학실 문)",
      text: (state) => {
        if (state.flags.scienceLabUnlocked) {
          return `과학실 자물쇠가 열려있다. 문틈 사이로 묘한 푸른 형광빛이 새어 나온다.`;
        } else if (state.hasItem("sciencelab_key")) {
          return `과학실 문에 황동 자물쇠가 채워져 있다. 교무실에서 얻은 [과학실 열쇠]로 열 수 있을 것 같다.`;
        } else {
          return `과학실 문이 단단한 열쇠 자물쇠로 잠겨있다. 어디선가 열쇠를 찾아야 한다.`;
        }
      },
      choices: [
        {
          text: "🔑 [과학실 열쇠]를 꽂아 문을 연다.",
          targetScene: "sciencelab",
          condition: (state) => state.hasItem("sciencelab_key") && !state.flags.scienceLabUnlocked,
          action: (state) => {
            state.flags.scienceLabUnlocked = true;
            state.showToast("과학실 문이 열렸습니다!");
          }
        },
        {
          text: "🚪 과학실 안으로 들어간다.",
          targetScene: "sciencelab",
          condition: (state) => state.flags.scienceLabUnlocked
        },
        {
          text: "🔙 2층 복도로 물러선다.",
          targetScene: "hallway_2f"
        }
      ]
    },

    sciencelab: {
      id: "sciencelab",
      locationName: "과학실 내부",
      floor: "본관 2층",
      backgroundImage: "assets/images/sciencelab.jpg",
      speaker: "나 (과학실 탐색)",
      text: `실험대 위에는 형형색색의 플라스크와 시약병들이 어둠 속에서 빛나고 있고, 구석에는 인체 골격 모형이 서 있다.\n\n칠판에는 [THE ALCHEMIST'S FORMULA: 빨강 용액 + 파랑 용액 = 강력한 산성 부식제]라고 적혀있다.\n그리고 실험대 구석에 10년 전 선배들이 남긴 것으로 보이는 [오래된 타임캡슐 상자]가 놓여있다!`,
      hotspots: [
        { id: "hs_chemicals", label: "실험대 시약병들", x: 45, y: 75, targetScene: "sciencelab_chemicals" },
        { id: "hs_capsule", label: "비밀 타임캡슐", x: 80, y: 60, targetScene: "sciencelab_capsule" }
      ],
      choices: [
        {
          text: "🧪 실험대 위의 [빨간색 시약]과 [파란색 시약]을 조사한다.",
          targetScene: "sciencelab_chemicals"
        },
        {
          text: "🕰️ 비밀 타임캡슐 상자를 조사한다.",
          targetScene: "sciencelab_capsule"
        },
        {
          text: "🔙 2층 복도로 나간다.",
          targetScene: "hallway_2f"
        }
      ]
    },

    sciencelab_chemicals: {
      id: "sciencelab_chemicals",
      locationName: "과학실 실험대",
      floor: "본관 2층",
      backgroundImage: "assets/images/sciencelab.jpg",
      speaker: "나 (시약)",
      text: `실험대에서 [빨간색 산성 시약]과 [파란색 촉매 용액]을 챙겼다.\n인벤토리에서 두 시약을 조합하면 어떤 자물쇠든 녹여버리는 [특수 부식액]을 만들 수 있을 것 같다.`,
      choices: [
        {
          text: "🧪 시약병들을 가방에 챙긴다.",
          targetScene: "sciencelab",
          condition: (state) => !state.hasItem("red_chemical") && !state.hasItem("reagent_solution"),
          action: (state) => {
            state.addItem("red_chemical");
            state.addItem("blue_chemical");
            state.showToast("아이템 획득: [빨간색 시약], [파란색 시약]");
          }
        },
        {
          text: "🔙 과학실 중앙으로 돌아간다.",
          targetScene: "sciencelab"
        }
      ]
    },

    sciencelab_capsule: {
      id: "sciencelab_capsule",
      locationName: "비밀 타임캡슐 상자",
      floor: "본관 2층",
      backgroundImage: "assets/images/sciencelab.jpg",
      speaker: "나 (타임캡슐)",
      text: (state) => {
        if (state.hasItem("complete_diary")) {
          return `완성된 선배의 일기장에 적힌 비밀 코드 '1999'를 입력하자 타임캡슐 상자가 경쾌한 소리를 내며 열렸다!\n안에는 전설적인 동아리 선배들의 축제 우승 메달과 감사 편지가 들어있다! (시크릿 엔딩 해금 조건 달성)`;
        } else {
          return `타임캡슐 상자에는 '동아리 일기를 모두 모은 자에게만 열린다'는 문구가 적혀있다.\n일기장 조각 1과 2를 모두 찾아 인벤토리에서 조합해야 할 것 같다.`;
        }
      },
      choices: [
        {
          text: "🏆 타임캡슐의 보물을 수락한다.",
          targetScene: "sciencelab",
          condition: (state) => state.hasItem("complete_diary") && !state.flags.timeCapsuleFound,
          action: (state) => {
            state.flags.timeCapsuleFound = true;
            state.showToast("히든 업적 달성: [선배의 유산]");
          }
        },
        {
          text: "🔙 돌아선다.",
          targetScene: "sciencelab"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // [5] 1층 정문 & 엔딩 분기
    // ------------------------------------------------------------------------
    schoolgate_scene: {
      id: "schoolgate_scene",
      locationName: "1층 학교 정문 (교문)",
      floor: "본관 1층 외부",
      backgroundImage: "assets/images/schoolgate.jpg",
      speaker: "나 (탈출구)",
      text: `드디어 1층 현관을 지나 학교 정문에 도착했다!\n그러나 거대한 철문은 굵은 쇠사슬과 육중한 패드락(자물쇠)으로 단단히 잠겨있다.\n\n바깥 가로등 불빛이 자유의 문턱을 비추고 있다. 어떻게 탈출할 것인가?`,
      choices: [
        {
          text: "🌟 [정문 비상 마스터키]로 철문 자물쇠를 풀고 탈출한다!",
          targetScene: "ending_true",
          condition: (state) => state.hasItem("master_key")
        },
        {
          text: "🧪 [특수 부식액]을 부어 쇠사슬을 녹이고 탈출한다!",
          targetScene: "ending_chemical",
          condition: (state) => state.hasItem("reagent_solution")
        },
        {
          text: "🚪 마스터키 없이 교직원 비상 쪽문으로 조용히 빠져나간다.",
          targetScene: "ending_normal"
        },
        {
          text: "🔙 아직 못 푼 비밀이 있어 2층/3층으로 돌아간다.",
          targetScene: "hallway_2f"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // 엔딩 시나리오 (Endings)
    // ------------------------------------------------------------------------
    ending_true: {
      id: "ending_true",
      locationName: "학교 정문 앞 도로",
      floor: "외부",
      backgroundImage: "assets/images/schoolgate.jpg",
      speaker: "엔딩",
      isEnding: true,
      endingType: "true",
      endingTitle: "🌟 TRUE ENDING: 새벽을 밝히는 자",
      text: `철컥-! \n교무실 금고에서 얻은 마스터키가 돌아가자 육중한 철문이 활짝 열렸다.\n\n동이 트기 시작하는 새벽하늘의 찬란한 빛이 쏟아져 들어온다.\n당신은 학교에 숨겨진 모든 수수께끼를 완벽하게 풀어내고, 당당히 정문을 통해 탈출에 성공했다!\n\n(완벽한 방탈출을 축하합니다!)`,
      choices: [
        {
          text: "🔄 처음부터 다시 도전하기",
          targetScene: "classroom_start",
          action: (state) => state.restart()
        }
      ]
    },

    ending_chemical: {
      id: "ending_chemical",
      locationName: "학교 정문",
      floor: "외부",
      backgroundImage: "assets/images/schoolgate.jpg",
      speaker: "엔딩",
      isEnding: true,
      endingType: "secret",
      endingTitle: "🧪 CREATIVE ENDING: 과학부의 기적",
      text: `치이익-! \n직접 합성한 특수 산성 부식액을 붓자 두꺼운 쇠사슬이 거품을 내며 순식간에 끊어졌다.\n\n정규 루트인 마스터키 대신 기상천외한 화학 지식을 발휘하여 정문을 돌파했다!\n과학 선생님이 보시면 경악하시겠지만, 어쨌든 당신은 완벽하게 탈출했다!`,
      choices: [
        {
          text: "🔄 처음부터 다시 도전하기",
          targetScene: "classroom_start",
          action: (state) => state.restart()
        }
      ]
    },

    ending_normal: {
      id: "ending_normal",
      locationName: "학교 후문 골목",
      floor: "외부",
      backgroundImage: "assets/images/schoolgate.jpg",
      speaker: "엔딩",
      isEnding: true,
      endingType: "normal",
      endingTitle: "🚪 NORMAL ENDING: 은밀한 탈출",
      text: `정문의 큰 쇠사슬을 풀지는 못했지만, 쓰레기장 옆 조그만 쪽문을 밀어 가까스로 학교를 빠져나왔다.\n\n비록 학교의 모든 비밀과 금고를 열어보지는 못했지만, 다치지 않고 무사히 집에 갈 수 있게 되었다.\n"다음번엔 교무실 금고의 마스터키까지 모두 찾아봐야겠어..."`,
      choices: [
        {
          text: "🔄 진엔딩을 향해 다시 도전하기",
          targetScene: "classroom_start",
          action: (state) => state.restart()
        }
      ]
    },

    bad_ending_darkness: {
      id: "bad_ending_darkness",
      locationName: "어두운 복도 구석",
      floor: "본관 3층",
      backgroundImage: "assets/images/hallway.jpg",
      speaker: "엔딩",
      isEnding: true,
      endingType: "bad",
      endingTitle: "💀 BAD ENDING: 영원한 어둠 속의 자습",
      text: `손전등 없이 무작정 어두운 복도로 나섰다가 계단 턱에 걸려 넘어지고 말았다.\n완벽한 정전 속에서 방향 감각마저 잃어버린 채, 차가운 복도 바닥에서 아침 등교 시간까지 갇히고 말았다...\n\n(Tip: 교실 서랍과 사물함에서 손전등과 배터리를 먼저 획득하세요!)`,
      choices: [
        {
          text: "🔄 교실에서 다시 시작하기",
          targetScene: "classroom_start",
          action: (state) => state.restart()
        }
      ]
    }
  },

  // --------------------------------------------------------------------------
  // 아이템 정의 (Items Database)
  // --------------------------------------------------------------------------
  items: {
    empty_flashlight: {
      id: "empty_flashlight",
      name: "방전된 손전등",
      icon: "🔦",
      category: "도구",
      description: "배터리가 빠져 있어 켜지지 않는 휴대용 손전등. AA 배터리 2개가 필요하다.",
      combinableWith: "battery"
    },
    battery: {
      id: "battery",
      name: "AA 배터리 2개",
      icon: "🔋",
      category: "재료",
      description: "사물함에서 찾은 새 배터리. 손전등에 넣을 수 있다.",
      combinableWith: "empty_flashlight"
    },
    flashlight: {
      id: "flashlight",
      name: "작동하는 손전등",
      icon: "⚡",
      category: "도구",
      description: "배터리를 넣어 환하게 빛나는 손전등. 어두운 3층 복도를 탐색할 수 있다.",
      combinableWith: null
    },
    diary_piece_1: {
      id: "diary_piece_1",
      name: "찢어진 일기장 1",
      icon: "📜",
      category: "단서",
      description: "10년 전 선배의 일기장 첫 장. [19...]라는 글자만 남아있다.",
      combinableWith: "diary_piece_2"
    },
    diary_piece_2: {
      id: "diary_piece_2",
      name: "찢어진 일기장 2",
      icon: "📜",
      category: "단서",
      description: "교무실에서 찾은 일기장 뒷 장. [...99 우리의 타임캡슐 비밀번호는 창립해다]라고 적혀있다.",
      combinableWith: "diary_piece_1"
    },
    complete_diary: {
      id: "complete_diary",
      name: "완성된 선배의 일기",
      icon: "📖",
      category: "특수단서",
      description: "두 조각을 이어붙인 일기장. [타임캡슐 암호: 1999]가 선명하게 보인다.",
      combinableWith: null
    },
    sciencelab_key: {
      id: "sciencelab_key",
      name: "과학실 열쇠",
      icon: "🗝️",
      category: "열쇠",
      description: "2층 과학실 문을 열 수 있는 황동 열쇠.",
      combinableWith: null
    },
    master_key: {
      id: "master_key",
      name: "정문 비상 마스터키",
      icon: "🌟",
      category: "열쇠",
      description: "학교 정문 철문의 대형 자물쇠를 단번에 열 수 있는 마스터키.",
      combinableWith: null
    },
    red_chemical: {
      id: "red_chemical",
      name: "빨간색 산성 시약",
      icon: "🔴",
      category: "화학물질",
      description: "강한 산성을 띠는 액체. 파란색 촉매 시약과 조합하면 금속을 녹일 수 있다.",
      combinableWith: "blue_chemical"
    },
    blue_chemical: {
      id: "blue_chemical",
      name: "파란색 촉매 시약",
      icon: "🔵",
      category: "화학물질",
      description: "화학 반응을 가속하는 촉매 용액. 빨간색 시약과 섞어보자.",
      combinableWith: "red_chemical"
    },
    reagent_solution: {
      id: "reagent_solution",
      name: "특수 금속 부식액",
      icon: "🧪",
      category: "특수도구",
      description: "빨강과 파랑 시약을 정밀하게 배합한 강력한 부식액. 정문의 쇠사슬을 녹일 수 있다.",
      combinableWith: null
    }
  },

  // --------------------------------------------------------------------------
  // 퍼즐 정의 (Puzzles Database)
  // --------------------------------------------------------------------------
  puzzles: {
    keypad_locker: {
      id: "keypad_locker",
      type: "keypad",
      title: "반장 사물함 자물쇠",
      subtitle: "4자리 비밀번호를 입력하세요 (힌트: 칠판 24 x 13)",
      length: 4,
      correctAnswer: "0312",
      alternateAnswers: ["3120", "312"],
      onSuccess: (state) => {
        state.flags.lockerUnlocked = true;
        state.showToast("찰칵! 사물함 자물쇠가 열렸습니다!");
        state.loadScene("classroom_locker_opened");
      }
    },
    keypad_office: {
      id: "keypad_office",
      type: "keypad",
      title: "교무실 디지털 도어락",
      subtitle: "4자리 비밀번호를 입력하세요 (힌트: 개교기념일 10월 24일)",
      length: 4,
      correctAnswer: "1024",
      onSuccess: (state) => {
        state.flags.officeDoorUnlocked = true;
        state.showToast("삐빅! 교무실 도어락이 해제되었습니다!");
        state.loadScene("teachers_office");
      }
    },
    keypad_safe: {
      id: "keypad_safe",
      type: "keypad",
      title: "교무실 대형 금고",
      subtitle: "4자리 다이얼 코드를 입력하세요 (힌트: 당직일지 메모)",
      length: 4,
      correctAnswer: "5307",
      onSuccess: (state) => {
        state.flags.officeSafeUnlocked = true;
        state.showToast("철컹! 금고 잠금장치가 해제되었습니다!");
        state.loadScene("office_safe");
      }
    },
    wire_puzzle: {
      id: "wire_puzzle",
      type: "wire",
      title: "3층 배전반 전선 연결",
      subtitle: "칠판 힌트에 맞춰 전선을 올바른 순서(빨강 → 노랑 → 파랑 → 초록)로 연결하세요",
      correctOrder: ["red", "yellow", "blue", "green"],
      onSuccess: (state) => {
        state.flags.powerRestored = true;
        state.showToast("⚡ 위이잉- 복도 전원이 복구되었습니다!");
        state.loadScene("hallway_3f");
      }
    }
  }
};
