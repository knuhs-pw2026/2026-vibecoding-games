/**
 * D20 주사위 롤 & 판정 시각화 엔진
 */
class DiceEngine {
    constructor() {
        this.modal = null;
        this.diceElement = null;
        this.resultElement = null;
        this.isRolling = false;
    }

    init() {
        this.modal = document.getElementById('dice-modal');
        this.diceElement = document.getElementById('d20-dice');
        this.resultElement = document.getElementById('dice-result-text');
        this.dcElement = document.getElementById('dice-dc-text');
        this.reasonElement = document.getElementById('dice-reason-text');
    }

    /**
     * D20 주사위를 굴리고 판정 결과를 비동기로 반환
     * @param {Object} params
     * @param {number} params.modifier - 스탯 보정치 (+2, -1 등)
     * @param {number} params.dc - 목표 난이도 (Difficulty Class)
     * @param {string} params.reason - 판정 사유 ("함정 해제", "기습 공격", "마법 저항" 등)
     * @param {string} params.statName - 관련 스탯 이름 ("STR", "DEX" 등)
     * @returns {Promise<{natural: number, total: number, isSuccess: boolean, isCritSuccess: boolean, isCritFail: boolean}>}
     */
    roll({ modifier = 0, dc = 10, reason = "행동 판정", statName = "" } = {}) {
        return new Promise((resolve) => {
            if (this.isRolling) return;
            this.isRolling = true;

            this.init();
            
            // 모달 열기 및 초기 텍스트 설정
            this.reasonElement.textContent = reason;
            this.dcElement.textContent = `목표 난이도 (DC): ${dc} | 보정치: ${modifier >= 0 ? '+' : ''}${modifier} (${statName})`;
            this.resultElement.textContent = "주사위를 굴리는 중...";
            this.resultElement.className = "dice-result-text";
            
            this.modal.classList.add('active');
            this.diceElement.classList.add('rolling');

            window.soundEngine.playDiceRoll();

            // 주사위 롤 숫자 셔플 애니메이션
            let shuffleCount = 0;
            const shuffleInterval = setInterval(() => {
                const tempNum = Math.floor(Math.random() * 20) + 1;
                this.diceElement.querySelector('.dice-number').textContent = tempNum;
                shuffleCount++;
            }, 60);

            // 1.2초 후 최종 결과 도출
            setTimeout(() => {
                clearInterval(shuffleInterval);
                this.diceElement.classList.remove('rolling');

                // 1~20 주사위 굴림
                const natural = Math.floor(Math.random() * 20) + 1;
                const total = natural + modifier;
                
                const isCritSuccess = (natural === 20);
                const isCritFail = (natural === 1);
                const isSuccess = isCritSuccess ? true : (isCritFail ? false : (total >= dc));

                this.diceElement.querySelector('.dice-number').textContent = natural;

                // 결과 스타일 및 사운드
                if (isCritSuccess) {
                    this.resultElement.innerHTML = `대성공! (Natural 20) <br><span class="highlight-gold">총합: ${total} (DC ${dc} 돌파)</span>`;
                    this.resultElement.classList.add('crit-success');
                    window.soundEngine.playNat20();
                } else if (isCritFail) {
                    this.resultElement.innerHTML = `대실패! (Natural 1) <br><span class="highlight-red">총합: ${total} (치명적 실수)</span>`;
                    this.resultElement.classList.add('crit-fail');
                    window.soundEngine.playNat1();
                } else if (isSuccess) {
                    this.resultElement.innerHTML = `판정 성공! <br><span>주사위 ${natural} + 보정치 ${modifier} = ${total} (DC ${dc} 충족)</span>`;
                    this.resultElement.classList.add('success');
                    window.soundEngine.playLoot();
                } else {
                    this.resultElement.innerHTML = `판정 실패... <br><span>주사위 ${natural} + 보정치 ${modifier} = ${total} (DC ${dc} 미달)</span>`;
                    this.resultElement.classList.add('failure');
                }

                // 1.4초 후 모달 닫고 결과 반환
                setTimeout(() => {
                    this.modal.classList.remove('active');
                    this.isRolling = false;
                    resolve({
                        natural,
                        modifier,
                        total,
                        dc,
                        isSuccess,
                        isCritSuccess,
                        isCritFail
                    });
                }, 1400);

            }, 1100);
        });
    }
}

window.diceEngine = new DiceEngine();
