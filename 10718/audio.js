/**
 * Web Audio API Sound Synthesizer for Tug of War
 * Completely procedural - no external audio files required!
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.bgmPlaying = false;
        this.bgmTimer = null;
        this.bgmStep = 0;
        this.masterGain = null;
        this.sfxGain = null;
        this.bgmGain = null;
    }

    init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        this.bgmGain.connect(this.masterGain);
    }

    resume() {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
        }
        return this.isMuted;
    }

    // Play energetic tap sound (pitch increases with player CPS)
    playTap(player = 1, cps = 0) {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Base frequency: P1 is punchy triangle, P2 is snappy sawtooth
        const baseFreq = player === 1 ? 180 : 250;
        const pitchBonus = Math.min(cps * 18, 250);
        const freq = baseFreq + pitchBonus;

        osc.type = player === 1 ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.06);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.07);
    }

    // Rope strain whoosh
    playRopeStrain() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.linearRampToValueAtTime(140, now + 0.1);
        osc.frequency.linearRampToValueAtTime(60, now + 0.2);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    // Fever mode ignition sound
    playFever() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.3);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.4);
    }

    // Countdown Beep (3, 2, 1, GO!)
    playCountdown(isGo = false) {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = isGo ? 'square' : 'triangle';
        const freq = isGo ? 880 : 440;
        const duration = isGo ? 0.4 : 0.15;

        osc.frequency.setValueAtTime(freq, now);
        if (isGo) {
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);
        }

        gain.gain.setValueAtTime(isGo ? 0.6 : 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + duration);
    }

    // Victory Fanfare
    playVictory() {
        if (this.isMuted || !this.ctx) return;
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
        notes.forEach((freq, i) => {
            const now = this.ctx.currentTime + i * 0.1;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now);
            osc.stop(now + 0.4);
        });
    }

    // Urgent 1-second countdown tick for last 5 seconds
    playTimeWarning() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.09);
    }

    // Time's Up Buzzer
    playTimeUp() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.45);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.45);
    }

    // Fast-paced Synth Arcade BGM
    startBGM() {
        if (this.bgmPlaying || !this.ctx) return;
        this.bgmPlaying = true;
        this.bgmStep = 0;

        const bassScale = [110, 110, 130.81, 146.83, 164.81, 146.83, 130.81, 98]; // A2, C3, D3, E3...
        const leadScale = [440, 523.25, 587.33, 659.25, 783.99, 659.25, 523.25, 440];

        const tempo = 145; // BPM
        const interval = (60 / tempo) / 4 * 1000; // 16th note

        this.bgmTimer = setInterval(() => {
            if (!this.bgmPlaying || this.isMuted || !this.ctx) return;
            const now = this.ctx.currentTime;

            // Bass beat every 4th 16th note (quarter beat)
            if (this.bgmStep % 4 === 0) {
                const bassOsc = this.ctx.createOscillator();
                const bassGain = this.ctx.createGain();
                const bassNote = bassScale[Math.floor(this.bgmStep / 4) % bassScale.length];

                bassOsc.type = 'sawtooth';
                bassOsc.frequency.setValueAtTime(bassNote, now);

                bassGain.gain.setValueAtTime(0.3, now);
                bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

                bassOsc.connect(bassGain);
                bassGain.connect(this.bgmGain);

                bassOsc.start(now);
                bassOsc.stop(now + 0.2);

                // Kick punch
                const kickOsc = this.ctx.createOscillator();
                const kickGain = this.ctx.createGain();
                kickOsc.frequency.setValueAtTime(130, now);
                kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.08);

                kickGain.gain.setValueAtTime(0.5, now);
                kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

                kickOsc.connect(kickGain);
                kickGain.connect(this.bgmGain);

                kickOsc.start(now);
                kickOsc.stop(now + 0.1);
            }

            // Snare on 2 and 4 (step 8 and 24 in 32 step bar)
            if (this.bgmStep % 16 === 8) {
                const snareNoise = this.ctx.createBufferSource();
                const bufferSize = this.ctx.sampleRate * 0.1;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                snareNoise.buffer = buffer;

                const snareGain = this.ctx.createGain();
                snareGain.gain.setValueAtTime(0.25, now);
                snareGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

                snareNoise.connect(snareGain);
                snareGain.connect(this.bgmGain);

                snareNoise.start(now);
                snareNoise.stop(now + 0.1);
            }

            // Arpeggio Lead on 16th notes
            if (Math.random() > 0.3) {
                const leadOsc = this.ctx.createOscillator();
                const leadGain = this.ctx.createGain();
                const note = leadScale[(this.bgmStep * 3) % leadScale.length];

                leadOsc.type = 'triangle';
                leadOsc.frequency.setValueAtTime(note, now);

                leadGain.gain.setValueAtTime(0.12, now);
                leadGain.gain.exponentialRampToValueAtTime(0.005, now + 0.08);

                leadOsc.connect(leadGain);
                leadGain.connect(this.bgmGain);

                leadOsc.start(now);
                leadOsc.stop(now + 0.09);
            }

            this.bgmStep = (this.bgmStep + 1) % 64;
        }, interval);
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    }
}

window.soundEngine = new SoundEngine();
