/**
 * storyData.js - 경북대학교사범대학부설고등학교 《검은 그늘 속에서》 시나리오 데이터베이스
 */

const STORY_DATA = {
    // 학교 야간 생존 수칙서 전문
    rulebook: {
        title: "경북대학교사범대학부설고등학교 야간 자율학습 특별 행동지침서",
        subtitle: "※ 본 수칙서는 202X년 축제 기간 중 발견된 미확인 문서입니다. 생존을 위해 반드시 숙지하십시오.",
        rules: [
            {
                num: "1조",
                content: "해가 진 후 교실에 혼자 남아 있을 때 책걸상에 앉아 고개를 숙이고 있는 학생을 목격하더라도 절대 말을 걸거나 어깨를 흔들지 마십시오. 그들은 이미 자습을 끝낼 수 없는 상태입니다."
            },
            {
                num: "2조",
                content: "복도 이동 시에는 가급적 불빛을 최소화하고 벽에 밀착하여 이동하십시오. 어둠 속에서 발소리가 들릴 때 절대 뒤를 돌아보거나 뛰지 마십시오. 뛰는 행위는 '추격 대상'으로 인식됩니다."
            },
            {
                num: "3조",
                content: "본관 2층 양호실은 임시 안전 구역입니다. 양호실 옷장에 걸린 '사대부고 단정한 교복'을 착용하면, 복도의 그림자들은 당신을 동화된 학생으로 착각하여 지나칠 것입니다."
            },
            {
                num: "4조",
                content: "교내에서 발견되는 '2학년 학생의 만년필'은 강력한 암시 도구입니다. 종이나 학생증에 적은 문장은 현실에 투영됩니다. 단, 거짓된 사실을 적으면 만년필의 저주를 받습니다."
            },
            {
                num: "5조",
                content: "1층 중앙현관(탈출구)을 지키는 '검은 그늘'은 기억과 이름을 먹고 자랍니다. 탈출할 때 자신이 누구인지 잊어버리면 영원히 문을 열 수 없습니다. 반드시 '나는 축제를 즐기러 온 사대부고 학생이다'라는 자각을 잃지 마십시오."
            }
        ]
    },

    // 씬 데이터
    scenes: {
        // --- 프롤로그 ---
        prologue: {
            id: "prologue",
            location: "경북대사대부고 축제 운동장 (현실)",
            text: `가을바람이 선선하게 부는 경북대학교사범대학부설고등학교의 축제 날 저녁.
화려한 부스 조명과 노랫소리로 교정이 시끌벅적하다.

동아리 부스를 구경하던 도중, 친구에게서 이상한 메신저 링크가 도착했다.

[ 야, 이거 우리 학교 옛날 건물 괴담 텍본인데 개소름 돋음 ㅋㅋㅋ 한번 읽어봐 ]

호기심에 첨부된 《검은 그늘 속에서 - 사대부고 야간 잔류 수칙》 텍스트를 누른 순간, 스마트폰 화면이 기괴하게 일그러지며 강렬한 현기증이 덮쳐왔다.

눈앞이 새까맣게 암전된다.`,
            choices: [
                {
                    text: "흐려지는 정신을 붙잡고 눈을 뜬다.",
                    target: "classroom_start",
                    action: () => {
                        soundEngine.playDanger();
                    }
                }
            ]
        },

        // --- 1단계: 2학년 교실 (시작 지점) ---
        classroom_start: {
            id: "classroom_start",
            location: "본관 3층 2학년 3반 교실 (심야)",
            isCheckpoint: true,
            text: `차가운 나무 바닥의 감촉에 눈을 떴다.
창밖은 칠흑 같은 어둠에 잠겨 있고, 운동장의 음악 소리는 거짓말처럼 사라졌다.

희미한 달빛 아래, 교실 창가 쪽 책상들에 여러 명의 학생들이 앉아 있다.
하지만... 이상하다.
그들은 미동도 없이 고개를 푹 숙인 채, 눈가에서 **검은 타르 같은 눈물**을 뚝뚝 흘리며 나무 책걸상과 서서히 살점이 녹아붙어 일체화되어 가고 있다.

공기 중에 비릿한 먹물 냄새가 진동한다.`,
            choices: [
                {
                    text: "가장 가까운 책상의 학생에게 다가가 어깨를 흔들어 깨운다.",
                    target: "classroom_touch_student",
                    danger: true
                },
                {
                    text: "숨을 죽이고 교탁과 사물함 쪽을 조심스럽게 살핀다.",
                    target: "classroom_search"
                }
            ]
        },

        classroom_touch_student: {
            id: "classroom_touch_student",
            location: "2학년 3반 교실 - 책걸상",
            text: `학생의 어깨에 손을 얹는 순간, 얼음장처럼 차가운 냉기가 손을 타고 올라왔다!

고개를 푹 숙이고 있던 학생의 목이 기괴한 소리를 내며 180도 꺾여 당신을 응시했다.
검은 눈물을 흘리는 텅 빈 눈구멍에서 검은 그림자 덩굴이 뿜어져 나와 당신의 손목을 옭아맨다!

"너도... 자습... 해야지..."

가까스로 손을 뿌리치고 물러섰지만, 온몸에 불길한 오한과 함께 오염이 번졌다!`,
            onEnter: (state) => {
                state.contamination += 25;
                soundEngine.playDanger();
            },
            choices: [
                {
                    text: "서둘러 교탁 쪽으로 물러나 탈출 단서를 찾는다.",
                    target: "classroom_search"
                }
            ]
        },

        classroom_search: {
            id: "classroom_search",
            location: "2학년 3반 교실 - 교탁 및 사물함",
            text: `교탁 서랍을 뒤지자 건전지가 든 **소형 손전등**과 붉은 얼룩이 묻은 **종이 뭉치**가 발견되었다.

종이 뭉치를 펼쳐보니 《경북대사대부고 야간 자율학습 특별 행동지침서》라고 적혀 있다!
이 지옥 같은 공간에서 살아남기 위한 유일한 생존 수칙인 듯하다.`,
            onEnter: (state) => {
                if (!state.inventory.includes("flashlight")) {
                    state.inventory.push("flashlight");
                }
                if (!state.inventory.includes("rulesheet")) {
                    state.inventory.push("rulesheet");
                    state.hasRulebook = true;
                }
                soundEngine.playItemGet();
            },
            choices: [
                {
                    text: "수칙서와 손전등을 챙겨 복도로 나선다.",
                    target: "hallway_2f"
                }
            ]
        },

        // --- 2단계: 복도 및 이동 ---
        hallway_2f: {
            id: "hallway_2f",
            location: "본관 3층 복도",
            text: `끼이익-
교실 문을 열고 나오자 끝이 보이지 않는 긴 복도가 펼쳐져 있다.
형광등은 깨져 있고, 벽면을 따라 검은 그늘이 핏줄처럼 꿈틀거리고 있다.

저 멀리 복도 끝 계단 쪽에서 질척거리는 발소리가 천천히 다가온다.
인간의 발소리가 아니다. 벽과 천장을 타고 흘러내리는 듯한 끔찍한 소리다.`,
            choices: [
                {
                    text: "손전등을 켜고 전속력으로 반대편 계단을 향해 달린다.",
                    target: "hallway_run_bad",
                    danger: true
                },
                {
                    text: "손전등을 끄고 벽에 밀착하여 조용히 2층 양호실 방향으로 피신한다. (수칙 준수)",
                    target: "infirmary_arrive"
                }
            ]
        },

        hallway_run_bad: {
            id: "hallway_run_bad",
            location: "본관 3층 복도 끝",
            text: `당황하여 손전등 불빛을 비추며 요란하게 발소리를 내며 달렸다.

그 순간, 벽면에 흩어져 있던 검은 그늘들이 일제히 당신의 그림자를 향해 쇄도했다!
수칙을 어긴 대가는 가혹했다. 바닥에서 솟구친 그림자 손들이 발목을 붙잡아 바닥으로 끌어당겼다.

살을 파고드는 지독한 한기 속에서 필사적으로 몸부림쳐 간신히 양호실 문 안으로 굴러떨어졌다!`,
            onEnter: (state) => {
                state.contamination += 35;
                soundEngine.playDanger();
            },
            choices: [
                {
                    text: "거친 숨을 몰아쉬며 양호실 문을 잠근다.",
                    target: "infirmary_inside"
                }
            ]
        },

        infirmary_arrive: {
            id: "infirmary_arrive",
            location: "본관 2층 양호실 앞",
            text: `수칙에 따라 불빛을 끄고 벽에 붙어 발소리를 죽이자, 거대한 그늘의 형체가 복도 허공을 스쳐 지나갔다.
그림자는 당신을 눈치채지 못하고 반대편으로 멀어졌다.

눈앞에 굳게 닫힌 '양호실' 문이 보인다. 수칙서에서 언급되었던 유일한 안전 구역이다.`,
            choices: [
                {
                    text: "양호실 문을 열고 들어간다.",
                    target: "infirmary_inside"
                }
            ]
        },

        // --- 3단계: 양호실 탐색 (핵심 아이템 구역) ---
        infirmary_inside: {
            id: "infirmary_inside",
            location: "본관 2층 양호실 (안전 지대)",
            isCheckpoint: true,
            text: `양호실 안은 은은한 소독약 냄새가 감돌며, 바깥의 불길한 한기가 한풀 꺾이는 기분이다.

침대 옆 옷장에는 **'경북대사대부고 명찰이 달린 단정한 교복'**이 걸려 있고,
약품 보관함에는 긴장을 완화해 주는 **의문의 안정제**가 놓여 있다.
또한 교탁 위 필통에서 푸른빛을 은은하게 뿜어내는 **'2학년 학생의 낡은 만년필'**이 눈에 띈다.`,
            choices: [
                {
                    text: "옷장에 걸린 사대부고 교복을 입어 위장한다. (수칙 3조)",
                    target: "infirmary_get_uniform",
                    condition: (state) => !state.inventory.includes("uniform")
                },
                {
                    text: "교탁의 만년필과 약품 보관함의 안정제를 챙긴다.",
                    target: "infirmary_get_items",
                    condition: (state) => !state.inventory.includes("fountainpen")
                },
                {
                    text: "모든 준비를 마치고 1층 중앙 로비로 향한다. (교복 착용 및 만년필 획득 완료)",
                    target: "stairs_to_1f",
                    condition: (state) => state.inventory.includes("uniform") && state.inventory.includes("fountainpen")
                },
                {
                    text: "아직 모든 준비를 마치지 못했지만 서둘러 1층으로 내려간다.",
                    target: "stairs_to_1f",
                    danger: true,
                    condition: (state) => !state.inventory.includes("uniform") || !state.inventory.includes("fountainpen")
                }
            ]
        },

        infirmary_get_uniform: {
            id: "infirmary_get_uniform",
            location: "양호실 옷장",
            text: `단정한 사대부고 교복을 입자 신기하게도 몸을 짓누르던 검은 한기가 옅어지는 것이 느껴진다.
교복에 새겨진 사대부고 마크가 당신을 이 학교의 '정상적인 학생'으로 인식시켜 주는 방어막이 되어주고 있다.`,
            onEnter: (state) => {
                if (!state.inventory.includes("uniform")) {
                    state.inventory.push("uniform");
                    state.contamination = Math.max(0, state.contamination - 15);
                    soundEngine.playItemGet();
                }
            },
            choices: [
                {
                    text: "양호실 내부를 더 둘러본다.",
                    target: "infirmary_inside"
                }
            ]
        },

        infirmary_get_items: {
            id: "infirmary_get_items",
            location: "양호실 약품함 & 교탁",
            text: `안정제를 삼키자 요동치던 심장이 가라앉고 머리가 맑아졌다. (오염도 30% 정화!)
이어 집어 든 **2학년 학생의 만년필**에서는 기이한 무게감이 느껴진다.
수칙서에 따르면 이 만년필로 적는 글은 현실에 암시를 투영한다고 했다.`,
            onEnter: (state) => {
                if (!state.inventory.includes("fountainpen")) {
                    state.inventory.push("fountainpen");
                }
                if (!state.inventory.includes("calming_pill")) {
                    state.inventory.push("calming_pill");
                    state.contamination = Math.max(0, state.contamination - 30);
                }
                soundEngine.playItemGet();
            },
            choices: [
                {
                    text: "양호실 내부를 더 둘러본다.",
                    target: "infirmary_inside"
                }
            ]
        },

        // --- 4단계: 1층 계단 및 교무실 갈림길 ---
        stairs_to_1f: {
            id: "stairs_to_1f",
            location: "본관 2층 → 1층 중앙 계단",
            text: `교복을 갖춰 입고 만년필을 쥔 채 1층으로 내려가는 계단에 섰다.
계단참 창가에 선배들이 남겨놓은 듯한 **호신 부적(護)**과 떨어진 **학생증 조각**이 바닥에 뒹굴고 있다.

아래층 중앙 로비에서는 탈출구를 가로막은 검은 그늘의 거대한 심장 고동 소리가 쿵- 쿵- 울려 퍼진다.`,
            choices: [
                {
                    text: "바닥에 떨어진 호신 부적과 학생증 조각을 주워 챙긴다.",
                    target: "stairs_get_secret_item",
                    condition: (state) => !state.inventory.includes("charm")
                },
                {
                    text: "망설이지 않고 곧바로 1층 중앙 로비로 진입한다.",
                    target: "central_lobby"
                }
            ]
        },

        stairs_get_secret_item: {
            id: "stairs_get_secret_item",
            location: "중앙 계단참",
            text: `푸른 기운이 도는 **호신 부적**과 **사대부고 학생증**을 챙겼다!
부적의 기운이 온몸을 감싸며 어둠의 잠식을 완벽하게 차단해 주는 느낌이다.`,
            onEnter: (state) => {
                if (!state.inventory.includes("charm")) {
                    state.inventory.push("charm");
                }
                if (!state.inventory.includes("studentcard")) {
                    state.inventory.push("studentcard");
                }
                state.contamination = Math.max(0, state.contamination - 10);
                soundEngine.playItemGet();
            },
            choices: [
                {
                    text: "호신 부적을 품에 쥐고 1층 중앙 로비로 발을 내딛는다.",
                    target: "central_lobby"
                }
            ]
        },

        // --- 5단계: 1층 중앙 로비 & 최후의 탈출문 대치 ---
        central_lobby: {
            id: "central_lobby",
            location: "본관 1층 중앙 로비 & 현관 정문",
            isCheckpoint: true,
            text: `본관 1층 현관문 너머로 희미한 축제의 불빛과 가을바람 냄새가 스며 나오고 있다!
그러나 거대한 유리문 앞을 **집채만 한 검은 그늘의 형체**가 가로막고 있다.

그늘 안에는 책걸상에 갇힌 채 자신을 잃어버린 수많은 과거 학생들의 얼굴이 비명을 지르며 소용돌이치고 있다.

"돌아가라... 너도 영원히 이곳에 남아 우리와 함께 자습해야 한다..."

그늘이 거대한 손을 뻗어 당신의 의식과 기억을 통째로 집어삼키려 한다!`,
            onEnter: (state) => {
                soundEngine.playDanger();
            },
            choices: [
                {
                    text: "공포에 질려 '제발 살려주세요!'라고 외치며 뒤로 도망친다.",
                    target: "lobby_bad_run",
                    danger: true
                },
                {
                    text: "공포를 억누르고, 2학년 만년필로 학생증에 이름을 적으며 '나는 지금 축제를 즐기는 사대부고 학생이다!'라고 외친다. (정체성 자각)",
                    target: "gate_climax"
                }
            ]
        },

        lobby_bad_run: {
            id: "lobby_bad_run",
            location: "1층 로비 복도",
            text: `등을 돌려 도망치려 하자, 검은 그늘이 폭발적으로 팽창하며 로비 전체를 집어삼켰다!
탈출의 마지막 순간에 이성을 잃은 대가는 참혹했다.`,
            onEnter: (state) => {
                state.contamination = 100;
            },
            choices: [
                {
                    text: "결과를 확인한다...",
                    target: "ending_bad_shadow"
                }
            ]
        },

        gate_climax: {
            id: "gate_climax",
            location: "본관 중앙 현관 앞 - 최후의 정화",
            text: `손을 부들부들 떨면서도 **2학년 학생의 만년필**을 쥐고 자신의 학생증에 또렷하게 본인의 이름을 적었다.

그리고 힘껏 소리쳤다.
**"나는 과거에 얽매인 망령이 아니다! 나는 202X년 지금, 친구들과 함께 축제를 즐기러 온 경북대사대부고의 학생이다!"**

그 순간, 만년필 촉에서 눈부신 금빛 광채가 뿜어져 나왔다!
교복의 옷깃이 찬란하게 빛나며 어둠을 밀어내기 시작한다.

검은 그늘은 고통스러운 비명을 지르며 산산이 부서져 허공으로 흩어지고, 굳게 잠겼던 본관 중앙 유리문이 시원한 바람과 함께 활짝 열린다!`,
            onEnter: (state) => {
                soundEngine.playVictory();
            },
            choices: [
                {
                    text: "빛이 쏟아지는 문밖 운동장으로 힘차게 뛰어나간다!",
                    target: "determine_ending"
                }
            ]
        },

        // --- 엔딩 판정 분기 ---
        determine_ending: {
            id: "determine_ending",
            redirect: (state) => {
                if (state.contamination >= 100) {
                    return "ending_bad_chair";
                }
                // 히든엔딩 조건: 오염도 20% 이하 + 호신 부적 획득
                if (state.contamination <= 20 && state.inventory.includes("charm")) {
                    return "ending_secret";
                }
                // 일반 진엔딩
                return "ending_true";
            }
        },

        // ==================== 엔딩 모음 ====================
        
        // 1. 진엔딩 (True Ending)
        ending_true: {
            id: "ending_true",
            isEnding: true,
            endingType: "true",
            title: "TRUE END : 햇살 속의 축제 귀환",
            badge: "🏆 탈출 성공 (진엔딩)",
            summary: "정체성을 잃지 않고 어둠의 괴담을 돌파하여, 따뜻하고 활기찬 사대부고 축제 현장으로 무사히 귀환했습니다!",
            text: `눈이 부실 정도로 따스한 조명과 신나는 축제 음악이 귓가를 가득 채웠다.
주변을 둘러보니 어느새 친구들이 양손에 닭꼬치와 음료수를 들고 당신을 향해 손을 흔들고 있다.

"야! 어디 갔었어? 아까 그 괴담 링크 보다가 멍때리길래 놀랐잖아!"

손을 내려다보자 끔찍했던 오염은 흔적도 없이 사라져 있다.
당신은 악몽 같은 괴담의 그늘에서 당당하게 승리하고 일상으로 돌아왔다!

※ 축제 부스 스태프에게 아래의 [탈출 성공 인증서]를 보여주고 사은품을 수령하세요!`,
            choices: [
                {
                    text: "🎉 탈출 성공 인증서 확인 및 발급받기",
                    target: "certificate_modal"
                },
                {
                    text: "처음부터 다시 플레이하기",
                    target: "prologue",
                    reset: true
                }
            ]
        },

        // 2. 히든엔딩 (Secret Ending)
        ending_secret: {
            id: "ending_secret",
            isEnding: true,
            endingType: "secret",
            title: "SECRET END : 사대부고 전설의 탈출왕",
            badge: "👑 전설의 탈출왕 (히든엔딩)",
            summary: "단 한 번의 망설임 없이 모든 비밀 단서(만년필, 교복, 호신부적)를 완벽하게 회수하고 어둠을 소멸시켰습니다!",
            text: `당신이 내뿜은 찬란한 빛에 사대부고를 떠돌던 오랜 '검은 그늘'의 잔재들이 완전히 정화되어 사라졌다.

눈을 뜨자 축제 무대에서는 환호성이 터져 나오고 있었고,
주머니 속에는 맑게 정화된 푸른 유리구슬 하나가 기념품처럼 남아 있었다.

당신은 단순한 탈출을 넘어, 학교에 깃들어 있던 백 년의 괴담을 완벽하게 해결한 전설의 학생으로 남게 되었습니다!

※ 최고 랭크 달성! 축제 부스 스태프에게 이 화면을 제시하면 특별 스페셜 리워드를 지급받을 수 있습니다!`,
            choices: [
                {
                    text: "👑 전설 등급 탈출 인증서 발급받기",
                    target: "certificate_modal"
                },
                {
                    text: "처음부터 다시 플레이하기",
                    target: "prologue",
                    reset: true
                }
            ]
        },

        // 3. 배드엔딩 1: 영원한 야간자율학습
        ending_bad_chair: {
            id: "ending_bad_chair",
            isEnding: true,
            endingType: "bad",
            title: "BAD END 1 : 영원한 야간자율학습",
            badge: "💀 동화 배드엔딩",
            summary: "오염도 100% 도달. 당신의 육체와 영혼이 책걸상과 일체화되어 영원히 학교에 남겨졌습니다.",
            text: `손가락 끝부터 서서히 검은 목재의 질감으로 변해간다.
의식은 아득해지고, 눈에서는 차가운 검은 눈물이 흘러내린다.

"자습이... 아직 끝나지 않았어..."

당신은 2학년 교실 창가 자리에 단단히 고정된 채, 다음 축제 때 문을 열고 들어올 또 다른 희생자를 영원히 기다리게 됩니다.`,
            choices: [
                {
                    text: "직전 체크포인트에서 다시 도전하기",
                    action: (game) => game.loadCheckpoint()
                },
                {
                    text: "처음부터 다시 시작하기",
                    target: "prologue",
                    reset: true
                }
            ]
        },

        // 4. 배드엔딩 2: 복도의 영원한 그림자
        ending_bad_shadow: {
            id: "ending_bad_shadow",
            isEnding: true,
            endingType: "bad",
            title: "BAD END 2 : 복도의 영원한 그림자",
            badge: "💀 추격 배드엔딩",
            summary: "수칙을 무시하고 도주하다가 검은 그늘의 집합체에 완전히 침식당했습니다.",
            text: `검은 그늘의 거대한 손아귀가 당신의 전신을 감싸 쥐었다.
소리를 지르려 했지만 입안 가득 끈적한 먹물 같은 어둠이 차올랐다.

당신의 육체는 형체를 잃고 본관 1층 복도 벽면의 얼룩으로 녹아들었습니다.
축제가 끝나고 불이 꺼지면, 당신 또한 누군가의 발목을 잡는 그림자가 될 것입니다.`,
            choices: [
                {
                    text: "직전 체크포인트에서 다시 도전하기",
                    action: (game) => game.loadCheckpoint()
                },
                {
                    text: "처음부터 다시 시작하기",
                    target: "prologue",
                    reset: true
                }
            ]
        },

        // 5. 배드엔딩 3: 잊혀진 이름과 축제
        ending_bad_memory: {
            id: "ending_bad_memory",
            isEnding: true,
            endingType: "bad",
            title: "BAD END 3 : 잊혀진 이름과 축제",
            badge: "💀 망각 배드엔딩",
            summary: "자신의 진짜 이름을 떠올리지 못해 영원한 망령으로 학교에 남겨졌습니다.",
            text: `문턱을 넘으려던 순간, 머릿속이 하얗게 비워졌다.
"내 이름이... 뭐였더라? 나는 왜 여기에 있지?"

정체성을 잃어버린 당신은 문밖으로 나갈 자격을 잃고 말았습니다.
문은 굳게 닫혔고, 당신은 조용히 어두운 교실로 발걸음을 돌려 빈 책상에 앉았습니다.`,
            choices: [
                {
                    text: "직전 체크포인트에서 다시 도전하기",
                    action: (game) => game.loadCheckpoint()
                },
                {
                    text: "처음부터 다시 시작하기",
                    target: "prologue",
                    reset: true
                }
            ]
        }
    }
};

window.STORY_DATA = STORY_DATA;
