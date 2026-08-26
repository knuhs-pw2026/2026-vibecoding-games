// ============================================================================
// NEON SURVIVOR: OVERDRIVE - Procedural Audio Engine (Web Audio API)
// ============================================================================

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterVolume = 0.8;
        this.sfxVolume = 0.8;
        this.bgmVolume = 0.5;
        this.isMuted = false;
        this.bgmPlaying = false;
        this.bgmTimer = null;
        this.tempo = 126;
        this.currentStep = 0;
        this.intensity = 1; // 1: normal, 2: intense, 3: boss fight

        // Noise buffer for explosions
        this.noiseBuffer = null;
    }

    init() {
        if (this.ctx) return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.ctx = new AudioCtx();
        this.createNoiseBuffer();
    }

    resume() {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    createNoiseBuffer() {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        this.noiseBuffer = buffer;
    }

    getEffectiveSfxVol() {
        if (this.isMuted) return 0;
        return this.masterVolume * this.sfxVolume;
    }

    getEffectiveBgmVol() {
        if (this.isMuted) return 0;
        return this.masterVolume * this.bgmVolume;
    }

    // --- Sound Effects ---

    playLaser(pitchMod = 1) {
        if (!this.ctx || this.getEffectiveSfxVol() <= 0) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880 * pitchMod, t);
        osc.frequency.exponentialRampToValueAtTime(110 * pitchMod, t + 0.12);

        gain.gain.setValueAtTime(0.25 * this.getEffectiveSfxVol(), t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.13);
    }

    playPlasma(pitchMod = 1) {
        if (!this.ctx || this.getEffectiveSfxVol() <= 0) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(440 * pitchMod, t);
        osc.frequency.exponentialRampToValueAtTime(80 * pitchMod, t + 0.18);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, t);
        filter.frequency.exponentialRampToValueAtTime(300, t + 0.18);

        gain.gain.setValueAtTime(0.28 * this.getEffectiveSfxVol(), t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.19);
    }

    playExplosion(scale = 1) {
        if (!this.ctx || !this.noiseBuffer || this.getEffectiveSfxVol() <= 0) return;
        const t = this.ctx.currentTime;
        const dur = Math.min(0.8, 0.25 * scale);

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800 * (1 / Math.sqrt(scale)), t);
        filter.frequency.exponentialRampToValueAtTime(50, t + dur);

        const gain = this.ctx.createGain();
        const vol = Math.min(0.6, 0.3 * Math.sqrt(scale)) * this.getEffectiveSfxVol();
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(t);
        noise.stop(t + dur);
    }

    playHit() {
        if (!this.ctx || this.getEffectiveSfxVol() <= 0) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.05);

        gain.gain.setValueAtTime(0.2 * this.getEffectiveSfxVol(), t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.06);
    }

    playDash() {
        if (!this.ctx || this.getEffectiveSfxVol() <= 0) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.15);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, t);
        filter.Q.value = 3;

        gain.gain.setValueAtTime(0.35 * this.getEffectiveSfxVol(), t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.2);
    }

    playXpPickup() {
        if (!this.ctx || this.getEffectiveSfxVol() <= 0) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        const freq = notes[Math.floor(Math.random() * notes.length)];

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.08);

        gain.gain.setValueAtTime(0.12 * this.getEffectiveSfxVol(), t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.09);
    }

    playLevelUp() {
        if (!this.ctx || this.getEffectiveSfxVol() <= 0) return;
        const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C major arpeggio
        chords.forEach((freq, idx) => {
            const t = this.ctx.currentTime + idx * 0.07;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.3 * this.getEffectiveSfxVol(), t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.36);
        });
    }

    playLightning() {
        if (!this.ctx || this.getEffectiveSfxVol() <= 0) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.setValueAtTime(400, t + 0.03);
        osc.frequency.setValueAtTime(900, t + 0.06);
        osc.frequency.setValueAtTime(150, t + 0.1);

        gain.gain.setValueAtTime(0.25 * this.getEffectiveSfxVol(), t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.16);
    }

    playEMP() {
        if (!this.ctx || this.getEffectiveSfxVol() <= 0) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.5);

        gain.gain.setValueAtTime(0.5 * this.getEffectiveSfxVol(), t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.56);
    }

    playBossSiren() {
        if (!this.ctx || this.getEffectiveSfxVol() <= 0) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.linearRampToValueAtTime(440, t + 0.4);
        osc.frequency.linearRampToValueAtTime(220, t + 0.8);
        osc.frequency.linearRampToValueAtTime(440, t + 1.2);
        osc.frequency.linearRampToValueAtTime(220, t + 1.6);

        gain.gain.setValueAtTime(0.35 * this.getEffectiveSfxVol(), t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 1.85);
    }

    // --- Procedural Synthwave BGM ---

    startBGM() {
        this.resume();
        if (this.bgmPlaying) return;
        this.bgmPlaying = true;
        this.currentStep = 0;
        this.scheduleMusicStep();
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    scheduleMusicStep() {
        if (!this.bgmPlaying || !this.ctx) return;

        const stepTime = (60 / this.tempo) / 4; // 16th note in seconds
        this.playMusicStep(this.ctx.currentTime + 0.05, this.currentStep);

        this.currentStep = (this.currentStep + 1) % 64;
        this.bgmTimer = setTimeout(() => {
            this.scheduleMusicStep();
        }, stepTime * 1000);
    }

    playMusicStep(t, step) {
        if (this.getEffectiveBgmVol() <= 0) return;

        // Bassline Chords (A minor progression: A -> F -> C -> G)
        const chordIndex = Math.floor(step / 16);
        const rootNotes = [110, 87.31, 130.81, 98]; // A2, F2, C3, G2
        const root = rootNotes[chordIndex];

        // 1. Driving Synth Bass (plays on 8th notes)
        if (step % 2 === 0) {
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            const octave = (step % 4 === 2) ? 2 : 1;
            osc.frequency.setValueAtTime(root * octave, t);

            filter.type = 'lowpass';
            const cutoff = this.intensity > 1 ? 1400 : 800;
            filter.frequency.setValueAtTime(cutoff, t);
            filter.frequency.exponentialRampToValueAtTime(200, t + 0.12);

            gain.gain.setValueAtTime(0.22 * this.getEffectiveBgmVol(), t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.14);
        }

        // 2. Synth Kick & Snare Beat
        if (step % 4 === 0) {
            // Kick
            const kickOsc = this.ctx.createOscillator();
            const kickGain = this.ctx.createGain();
            kickOsc.frequency.setValueAtTime(140, t);
            kickOsc.frequency.exponentialRampToValueAtTime(40, t + 0.09);
            kickGain.gain.setValueAtTime(0.4 * this.getEffectiveBgmVol(), t);
            kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
            kickOsc.connect(kickGain);
            kickGain.connect(this.ctx.destination);
            kickOsc.start(t);
            kickOsc.stop(t + 0.1);
        }

        if (step % 8 === 4 && this.noiseBuffer) {
            // Snare / Clap
            const snare = this.ctx.createBufferSource();
            snare.buffer = this.noiseBuffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1800;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.18 * this.getEffectiveBgmVol(), t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
            snare.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            snare.start(t);
            snare.stop(t + 0.12);
        }

        // 3. Synth Arpeggio (Scale: A Minor / Pentatonic)
        if (this.intensity >= 2 && step % 2 === 1) {
            const scaleOffsets = [0, 3, 7, 10, 12, 15, 19];
            const arpIndex = (step * 3) % scaleOffsets.length;
            const semi = scaleOffsets[arpIndex];
            const arpFreq = (root * 2) * Math.pow(2, semi / 12);

            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(arpFreq, t);

            filter.type = 'highpass';
            filter.frequency.value = 400;

            gain.gain.setValueAtTime(0.12 * this.getEffectiveBgmVol(), t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.11);
        }
    }
}

window.soundEngine = new SoundEngine();
