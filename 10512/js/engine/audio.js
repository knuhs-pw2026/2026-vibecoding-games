// js/engine/audio.js - Web Audio API 기반 절차적 사운드 엔진

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isMuted = false;
        this.bgmPlaying = false;
        this.bgmTimer = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.6;
            this.masterGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // 화이트 노이즈 버퍼 생성 헬퍼
    createNoiseBuffer(duration = 0.5) {
        if (!this.ctx) return null;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    // 1. 어썰트 라이플 발사음
    playAssaultRifle() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;

        // 1) 펀치감 있는 저음 오실레이터
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);

        oscGain.gain.setValueAtTime(0.8, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.09);

        // 2) 폭발적 화이트 노이즈 펀치
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.12);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, t);
        filter.frequency.exponentialRampToValueAtTime(300, t + 0.1);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.7, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noise.start(t);
    }

    // 2. 샷건 발사음
    playShotgun() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;

        // 강력한 저주파 베이스 붐
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(20, t + 0.25);

        oscGain.gain.setValueAtTime(1.0, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.25);

        // 강력한 산탄 노이즈
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.28);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2800, t);
        filter.frequency.exponentialRampToValueAtTime(100, t + 0.25);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.9, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noise.start(t);
    }

    // 3. 플라즈마 스나이퍼 발사음
    playSniper() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;

        // 고에너지 레이저 빔 피치 스윕
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1800, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.35);

        oscGain.gain.setValueAtTime(0.8, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.35);

        // 플라즈마 잔향 화이트 노이즈
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.35);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2000, t);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.5, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noise.start(t);
    }

    // 4. 로켓 런처 발사음
    playRocketLaunch() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, t);
        osc.frequency.linearRampToValueAtTime(300, t + 0.2);

        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.3);

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.4);
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.6, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
        noise.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noise.start(t);
    }

    // 5. 대형 폭발음 (로켓 탄착 등)
    playExplosion() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;

        // 초저음 진동
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(15, t + 0.8);

        oscGain.gain.setValueAtTime(1.0, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.8);

        // 무거운 굉음 노이즈
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.9);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, t);
        filter.frequency.exponentialRampToValueAtTime(40, t + 0.9);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(1.0, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noise.start(t);
    }

    // 6. 히트마커 타격음 (깔끔한 타격 핑)
    playHitmark(isHeadshot = false) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const startFreq = isHeadshot ? 1800 : 1100;
        const endFreq = isHeadshot ? 2400 : 900;
        osc.frequency.setValueAtTime(startFreq, t);
        osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.08);

        gain.gain.setValueAtTime(isHeadshot ? 0.8 : 0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.08);
    }

    // 7. 킬 달성 사운드 (쾌감 있는 아르페지오)
    playKillSound() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

        notes.forEach((freq, idx) => {
            const noteStart = t + idx * 0.04;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, noteStart);

            gain.gain.setValueAtTime(0.4, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.15);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(noteStart);
            osc.stop(noteStart + 0.15);
        });
    }

    // 8. 재장전 사운드 (철컥 메탈릭)
    playReload() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;

        // 탄창 빼기 (Click 1)
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(400, t);
        osc1.frequency.exponentialRampToValueAtTime(120, t + 0.06);
        gain1.gain.setValueAtTime(0.3, t);
        gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
        osc1.connect(gain1);
        gain1.connect(this.masterGain);
        osc1.start(t);
        osc1.stop(t + 0.06);

        // 탄창 끼우기 (Click 2)
        const t2 = t + 0.25;
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(300, t2);
        osc2.frequency.exponentialRampToValueAtTime(600, t2 + 0.08);
        gain2.gain.setValueAtTime(0.4, t2);
        gain2.gain.exponentialRampToValueAtTime(0.01, t2 + 0.08);
        osc2.connect(gain2);
        gain2.connect(this.masterGain);
        osc2.start(t2);
        osc2.stop(t2 + 0.08);
    }

    // 9. 점프패드 워프 사운드
    playJumpPad() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(900, t + 0.3);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.3);
    }

    // 10. 아이템 픽업 사운드
    playPickup(type = 'hp') {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const start = type === 'shield' ? 440 : 660;
        osc.frequency.setValueAtTime(start, t);
        osc.frequency.exponentialRampToValueAtTime(start * 1.5, t + 0.15);

        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.15);
    }

    // 11. 피격 사운드
    playPlayerHurt() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.12);
    }

    // 12. 발소리 (Footstep)
    playFootstep() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.05);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, t);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(t);
    }

    // 13. 사이버펑크 앰비언스 BGM
    startCyberBGM() {
        if (this.bgmPlaying || !this.ctx) return;
        this.bgmPlaying = true;

        const chordNotes = [
            [130.81, 196.00, 246.94], // C3, G3, B3
            [110.00, 164.81, 220.00], // A2, E3, A3
            [87.31, 130.81, 174.61],  // F2, C3, F3
            [98.00, 146.83, 196.00]   // G2, D3, G3
        ];
        let chordIdx = 0;

        const playChords = () => {
            if (!this.bgmPlaying || !this.ctx) return;
            const t = this.ctx.currentTime;
            const notes = chordNotes[chordIdx % chordNotes.length];
            chordIdx++;

            notes.forEach(f => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, t);

                gain.gain.setValueAtTime(0.01, t);
                gain.gain.linearRampToValueAtTime(0.06, t + 0.8);
                gain.gain.linearRampToValueAtTime(0.01, t + 2.8);

                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start(t);
                osc.stop(t + 3.0);
            });

            this.bgmTimer = setTimeout(playChords, 2800);
        };

        playChords();
    }

    stopCyberBGM() {
        this.bgmPlaying = false;
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }
}

export const soundEngine = new SoundEngine();
