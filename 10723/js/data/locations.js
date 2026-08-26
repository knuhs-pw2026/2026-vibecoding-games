/* ==========================================================================
   School Mystery Detective Game - Locations & Hotspots Data
   ========================================================================== */

export const LOCATIONS = {
  loc_teachers_room: {
    id: "loc_teachers_room",
    name: "2층 본관 교무실",
    floor: "본관 2층",
    description: "선생님들이 모두 퇴근하여 적막만이 흐른다. 문제의 시험지가 보관되어 있던 금고가 열려있다.",
    suspects: ["민우"],
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
        message: "비밀번호 다이얼이 맞춰진 채로 문이 열려있다. 원래 들어있던 2학년 수학 기말고사 시험지만 사라졌다.",
        sound: "clue"
      },
      {
        id: "hs_trash",
        name: "교무실 쓰레기통",
        icon: "🗑️",
        x: 78,
        y: 75,
        clueId: "clue_torn_paper",
        message: "쓰레기통 속을 뒤지자 구석에서 찢어진 종이 조각을 발견했다! [찢어진 수학 시험지 조각]을 획득했다.",
        sound: "clue"
      },
      {
        id: "hs_teacher_desk",
        name: "수학 선생님 책상",
        icon: "📑",
        x: 25,
        y: 60,
        clueId: null,
        message: "책상 위에는 '기말고사 보안 철저 요망 - 4자리 암호는 원소 퀴즈 참고'라는 포스트잇 메모가 붙어있다.",
        sound: "inspect"
      }
    ]
  },
  loc_science_lab: {
    id: "loc_science_lab",
    name: "3층 구관 과학실",
    floor: "구관 3층",
    description: "다양한 화학 약품과 비커가 정렬되어 있다. 알코올 램프 특유의 냄새가 맴돈다.",
    suspects: ["도윤"],
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
        message: "서랍 안에서 알 수 없는 계산식이 적힌 쪽지를 발견했다! [암호가 적힌 메모지]를 획득했다.",
        sound: "clue"
      },
      {
        id: "hs_chemical_cabinet",
        name: "시약 보관함",
        icon: "🧴",
        x: 20,
        y: 38,
        clueId: null,
        message: "에탄올과 에테르 병이 놓여있다. 누군가 최근에 에탄올 병을 만진 듯 뚜껑이 헐겁게 닫혀있다.",
        sound: "inspect"
      },
      {
        id: "hs_broken_beaker",
        name: "바닥의 깨진 비커 파편",
        icon: "💥",
        x: 75,
        y: 78,
        clueId: null,
        message: "도윤이가 떨어뜨렸다는 비커 파편이다. 파편 주위는 말끔하게 걸레질되어 있다.",
        sound: "inspect"
      }
    ]
  },
  loc_broadcast_room: {
    id: "loc_broadcast_room",
    name: "4층 방송실",
    floor: "본관 4층",
    description: "방음벽으로 둘러싸여 조용하며, 복도 마이크와 믹싱 콘솔 불빛이 은은하게 켜져있다.",
    suspects: ["하은"],
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
        message: "복도 모니터링 채널 녹음 테이프를 재생하자 9시 25분의 이상 소음이 들린다! [방송부 복도 녹음 파일]을 확보했다.",
        sound: "clue"
      },
      {
        id: "hs_camera_shelf",
        name: "카메라 렌즈 보관함",
        icon: "📷",
        x: 78,
        y: 40,
        clueId: null,
        message: "렌즈 청소용 극세사 타월 몇 장 중 파란색 타월 한 장이 비어있다.",
        sound: "inspect"
      },
      {
        id: "hs_broadcast_window",
        name: "빗물이 들이치는 창문",
        icon: "🪟",
        x: 18,
        y: 35,
        clueId: null,
        message: "창문 틈새로 빗방울이 살짝 들이치고 있다. 바닥에 물기를 닦아낸 흔적이 있다.",
        sound: "inspect"
      }
    ]
  },
  loc_art_room: {
    id: "loc_art_room",
    name: "1층 별관 미술실",
    floor: "별관 1층",
    description: "유화 물감 냄새가 진동하는 방. 석고상들과 미완성 캔버스들이 줄지어 늘어서 있다.",
    suspects: ["서준"],
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
        message: "석고상 뒤편 틈새에서 비누로 본을 뜬 복제 열쇠를 발견했다! [미술실 석고상 뒤 복사 열쇠]를 획득했다.",
        sound: "clue"
      },
      {
        id: "hs_easel_canvas",
        name: "마감 중인 유화 캔버스",
        icon: "🎨",
        x: 65,
        y: 55,
        clueId: null,
        message: "푸른 밤하늘을 그린 캔버스. 팔레트에는 아직 굳지 않은 짙은 코발트 블루 물감이 묻어있다.",
        sound: "inspect"
      },
      {
        id: "hs_art_bag",
        name: "서준이의 화구 가방",
        icon: "👜",
        x: 82,
        y: 75,
        clueId: null,
        message: "커다란 방수 캔버스 가방. 쇠로 된 버클 장식이 복도에서 들렸던 '짤랑' 소리와 일치한다.",
        sound: "inspect"
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
        message: "야간 접속 기록을 조회했다. 민우 학생의 계정이 9시 22분부터 35분까지 입력 없이 방치되어 있었다. [PC 접속 로그]를 확보했다.",
        sound: "clue"
      },
      {
        id: "hs_hallway_fire_extinguisher",
        name: "복도 소화전 뒤편",
        icon: "🧯",
        x: 85,
        y: 65,
        clueId: "clue_wet_towel",
        message: "소화전 틈새에 젖은 파란 타월이 쑤셔 박혀 있다! [젖은 파란색 극세사 타월]을 획득했다.",
        sound: "clue"
      }
    ]
  }
};
