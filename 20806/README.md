# 🏫 야간 자율학습의 비밀: 닫힌 학교 탈출 (School Room Escape Web Game)

고등학교 동아리 활동(축제 부스 운영, 웹 프로그래밍 동아리 스터디, 인터랙티브 스토리텔링)을 위해 제작된 **HTML5 / CSS / Vanilla JavaScript 기반 방탈출 & 텍스트 어드벤처 웹 게임**입니다.

---

## 🎮 게임 개요 및 특징

- **장르**: 텍스트 어드벤처 + 포인트 앤 클릭 방탈출 (Interactive Fiction & Room Escape)
- **배경 스토리**: 야간 자율학습 후 깜빡 잠들었다가 자정에 갇힌 주인공. 정전된 학교 본관 3층부터 1층 정문까지 단서를 풀고 탈출하라!
- **엔딩 분기**: 
  - 🌟 **True Ending**: 마스터키를 찾아 당당하게 정문 탈출 (100% 해금)
  - 🧪 **Creative Ending**: 과학실 시약을 합성하여 쇠사슬 부식 탈출
  - 🚪 **Normal Ending**: 쪽문으로 은밀히 탈출
  - 💀 **Bad Ending**: 어둠 속 배회 / 시간 초과
  - 🏆 **Secret Achievement**: 10년 전 선배들의 타임캡슐 해독
- **기술 스택**: 순수 HTML5 + Modern Glassmorphism CSS + Vanilla JavaScript (Web Audio API 포함)
  - 별도의 Node.js 설치나 복잡한 빌드 도구 없이 `index.html` 더블클릭만으로 즉시 실행 가능합니다.

---

## 📂 프로젝트 구조

```
gunseongje/
├── index.html               # 메인 게임 화면 레이아웃 및 팝업 모달
├── style.css                # 미스터리 다크 글래스모피즘 스타일시트 & 애니메이션
├── README.md                # 동아리 부원용 가이드 문서
├── assets/
│   └── images/              # 고해상도 장소 배경 일러스트
│       ├── classroom.jpg    # 3-4반 교실
│       ├── hallway.jpg      # 복도 및 분전함
│       ├── office.jpg       # 교무실 및 금고
│       ├── sciencelab.jpg   # 과학실 및 실험대
│       └── schoolgate.jpg   # 학교 정문 (탈출구)
└── src/
    ├── data/
    │   └── story.js         # ⭐ 스토리 시나리오, 방(Scene), 선택지, 정답 데이터
    └── js/
        ├── sound.js         # Web Audio API 내장 사운드 신디사이저
        ├── inventory.js     # 아이템 획득, 인스펙터, 조합(Crafting) 시스템
        ├── puzzle.js        # 4자리 키패드 자물쇠, 전선 배선 퍼즐 엔진
        └── game.js          # 게임 루프, 타이머, 타이핑 효과, 세이브/로드 엔진
```

---

## 🛠️ 동아리 부원을 위한 커스텀 & 확장 가이드

### 1. 새로운 방(Scene) 추가하기 (`src/data/story.js`)
`story.js` 파일의 `scenes` 객체에 새로운 방을 추가하고 연결하세요:
```javascript
my_new_room: {
  id: "my_new_room",
  locationName: "동아리방",
  floor: "본관 4층",
  backgroundImage: "assets/images/classroom.jpg",
  speaker: "나 (동방 탐색)",
  text: "동아리방 구석에 수상한 상자가 놓여있다.",
  hotspots: [
    { id: "hs_box", label: "수상한 상자", x: 50, y: 50, targetScene: "open_box_scene" }
  ],
  choices: [
    {
      text: "📦 상자를 열어본다.",
      targetScene: "open_box_scene"
    },
    {
      text: "🔙 복도로 돌아간다.",
      targetScene: "hallway_3f"
    }
  ]
}
```

### 2. 자물쇠 및 비밀번호 정답 변경하기
`story.js` 파일 하단의 `puzzles` 객체에서 정답(`correctAnswer`)을 학교 설립일이나 특별한 숫자로 수정할 수 있습니다:
```javascript
keypad_office: {
  id: "keypad_office",
  type: "keypad",
  title: "교무실 디지털 도어락",
  subtitle: "4자리 비밀번호를 입력하세요",
  length: 4,
  correctAnswer: "1024", // <- 이 부분을 원하는 4자리 번호로 변경
  ...
}
```

### 3. 아이템 조합(Crafting) 추가하기 (`src/js/inventory.js`)
`inventory.js`의 `tryCombine` 함수 안에 새로운 조합식을 추가할 수 있습니다:
```javascript
// 예: 녹슨 열쇠 + 윤활유 -> 깨끗한 열쇠
if ((item1Id === "rusty_key" && item2Id === "oil") || ...) {
  this.removeItem("rusty_key");
  this.removeItem("oil");
  this.addItem("clean_key");
  this.game.showToast("기름칠하여 깨끗해진 열쇠를 얻었습니다!");
  return true;
}
```

---

## 🌐 학교 축제 부스 운영 및 무료 웹 배포 (GitHub Pages)

1. **학교 축제/동아리 부스 오프라인 플레이**:
   - 노트북이나 태블릿에서 `index.html`을 브라우저(Chrome/Edge)로 연 뒤 `F11` (전체 화면)을 누르면 아케이드 게임기처럼 플레이할 수 있습니다.

2. **GitHub Pages로 인터넷 배포 (QR 코드 생성)**:
   - 본 프로젝트 폴더를 GitHub 저장소에 업로드합니다.
   - 저장소의 **Settings** -> **Pages** 탭에서 `Branch: main` -> `Save`를 누르면 `https://<아이디>.github.io/<저장소이름>/` 형태의 웹 주소가 생성됩니다.
   - 해당 주소를 무료 QR 코드 사이트(예: naver qr, qr-code-generator 등)에서 QR 코드로 인쇄하여 축제 포스터에 붙여두면 친구들이 스마트폰으로 바로 접속해 플레이할 수 있습니다!
