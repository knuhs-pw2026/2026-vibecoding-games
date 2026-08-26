/**
 * soundEngine.js - Web Audio API 기반 오디오 합성 엔진
 * 외부 사운드 파일 의존성 없이 브라우저 내에서 즉각 실시간 합성 재생
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.heartbeatTimer = null;
        this.droneOsc = null;
        this.droneGain = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.initialized = true;
            this.startAmbienceDrone();
        } catch (e) {
            console.warn("Web Audio API not supported", e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.droneGain) {
            this.droneGain.gain.setValueAtTime(this.isMuted ? 0 : 0.04, this.ctx ? this.ctx.currentTime : 0);
        }
        return this.isMuted;
    }

    // 타이핑 소리 (타자기/키보드 클릭)
    playTypewriter() {
        if (this.isMuted || !this.ctx) return;
        this.resume();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800 + Math.random() * 400, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.02);
            
            gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.02);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(this.ctx.currentTime + 0.02);
        } catch (e) {}
    }

    // 버튼 선택 효과음
    playSelect() {
        if (this.isMuted || !this.ctx) return;
        this.resume();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);
            
            gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(this.ctx.currentTime + 0.08);
        } catch (e) {}
    }

    // 아이템 획득/수칙서 발견 (맑은 공명음)
    playItemGet() {
        if (this.isMuted || !this.ctx) return;
        this.resume();
        try {
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, High C
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const startTime = this.ctx.currentTime + idx * 0.06;
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, startTime);
                
                gain.gain.setValueAtTime(0.06, startTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start(startTime);
                osc.stop(startTime + 0.35);
            });
        } catch (e) {}
    }

    // 경고 / 오염도 증가 / 충격음
    playDanger() {
        if (this.isMuted || !this.ctx) return;
        this.resume();
        try {
            // 저음 충격 노이즈
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(160, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.5);
            
            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(this.ctx.currentTime + 0.6);
        } catch (e) {}
    }

    // 심장 박동 1회 (쿵-쾅)
    playHeartbeat() {
        if (this.isMuted || !this.ctx) return;
        this.resume();
        try {
            const now = this.ctx.currentTime;
            
            // 첫 번째 박동 (쿵)
            const osc1 = this.ctx.createOscillator();
            const gain1 = this.ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(85, now);
            osc1.frequency.exponentialRampToValueAtTime(40, now + 0.12);
            gain1.gain.setValueAtTime(0.18, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc1.connect(gain1);
            gain1.connect(this.ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.15);

            // 두 번째 박동 (쾅)
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(70, now + 0.16);
            osc2.frequency.exponentialRampToValueAtTime(30, now + 0.3);
            gain2.gain.setValueAtTime(0.15, now + 0.16);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc2.connect(gain2);
            gain2.connect(this.ctx.destination);
            osc2.start(now + 0.16);
            osc2.stop(now + 0.35);
        } catch (e) {}
    }

    // 탈출 성공 팡파레 / 안도감
    playVictory() {
        if (this.isMuted || !this.ctx) return;
        this.resume();
        try {
            const chords = [
                [523.25, 659.25, 783.99],       // C
                [587.33, 739.99, 880.00],       // D
                [659.25, 830.61, 987.77],       // E
                [783.99, 987.77, 1174.66, 1567.98] // G Maj
            ];

            chords.forEach((chord, i) => {
                const startTime = this.ctx.currentTime + i * 0.22;
                chord.forEach(freq => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, startTime);
                    gain.gain.setValueAtTime(0.08, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.8);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(startTime);
                    osc.stop(startTime + 0.85);
                });
            });
        } catch (e) {}
    }

    // 어두운 앰비언스 드론 지속음
    startAmbienceDrone() {
        if (!this.ctx) return;
        try {
            this.droneOsc = this.ctx.createOscillator();
            this.droneGain = this.ctx.createGain();
            
            this.droneOsc.type = 'sine';
            this.droneOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A
            
            this.droneGain.gain.setValueAtTime(this.isMuted ? 0 : 0.03, this.ctx.currentTime);
            
            this.droneOsc.connect(this.droneGain);
            this.droneGain.connect(this.ctx.destination);
            
            this.droneOsc.start();
        } catch (e) {}
    }

    // 오염도에 따른 심장박동 주기 제어
    updateContaminationState(contamination) {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }

        if (contamination >= 30) {
            const interval = Math.max(700, 2000 - (contamination * 15)); // 오염도 높을수록 빠른 심장박동
            this.heartbeatTimer = setInterval(() => {
                this.playHeartbeat();
            }, interval);
        }
    }
}

window.soundEngine = new SoundEngine();
