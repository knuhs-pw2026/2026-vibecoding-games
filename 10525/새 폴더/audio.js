/**
 * CYBER STRIKE 2099 - Procedural Web Audio API Sound Engine
 * Real-time synthesized audio for weapons, impacts, high-power railgun beam,
 * and SANABI Cybernetic Chain Arm (사슬팔) wire action & execution strike sounds.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        this.ambientOscillators = [];
        this.volume = 0.8;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
            this.sfxGain.connect(this.masterGain);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
            this.musicGain.connect(this.masterGain);

            this.initialized = true;
            this.startAmbientMusic();
        } catch (e) {
            console.warn("Web Audio API not supported or blocked:", e);
        }
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    createNoiseBuffer(duration = 0.5) {
        if (!this.ctx) return null;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    // ==========================================
    // SANABI (산나비) CHAIN ARM (사슬팔) SOUNDS
    // ==========================================

    // 1. Chain Arm Launch / Shoot (사슬 사출음)
    playChainLaunch() {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;

        // Metallic Piston Whack
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.15);

        // Chain links rattling whoosh
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.22);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2800, now);
        filter.Q.value = 6.0;

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.45, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);
        noise.start(now);
        noise.stop(now + 0.22);
    }

    // 2. Chain Claw Latches onto Wall or Enemy (사슬 고리 부착/타격음)
    playChainLatch() {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;

        // Heavy Clang!
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.12);

        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.12);

        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2200, now);
        osc2.frequency.exponentialRampToValueAtTime(800, now + 0.08);

        gain2.gain.setValueAtTime(0.4, now);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc2.connect(gain2);
        gain2.connect(this.sfxGain);
        osc2.start(now);
        osc2.stop(now + 0.08);
    }

    // 3. High-Speed Winch Reel (초고속 와이어 감기음)
    playChainReel() {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(950, now + 0.35);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.35);
    }

    // 4. SANABI Devastating Slam Strike (산나비 사슬팔 처형 타격음)
    playChainExecution() {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;

        // Subwoofer Impact Drop
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(180, now);
        subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.45);

        subGain.gain.setValueAtTime(0.95, now);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        subOsc.connect(subGain);
        subGain.connect(this.sfxGain);
        subOsc.start(now);
        subOsc.stop(now + 0.5);

        // Explosive Bone/Armor Crunch
        const crunchOsc = this.ctx.createOscillator();
        const crunchGain = this.ctx.createGain();
        crunchOsc.type = 'sawtooth';
        crunchOsc.frequency.setValueAtTime(1100, now);
        crunchOsc.frequency.exponentialRampToValueAtTime(80, now + 0.3);

        crunchGain.gain.setValueAtTime(0.85, now);
        crunchGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        crunchOsc.connect(crunchGain);
        crunchGain.connect(this.sfxGain);
        crunchOsc.start(now);
        crunchOsc.stop(now + 0.3);

        // Sonic Blast Noise
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.4);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2800, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.4);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.8, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);
        noise.start(now);
        noise.stop(now + 0.4);
    }

    // ==========================================
    // RAILGUN SOUNDS
    // ==========================================
    playRailgunCharge() {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const dur = 0.45;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(1800, now + dur);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.5, now + dur);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + dur);

        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(600, now);
        osc2.frequency.linearRampToValueAtTime(3200, now + dur);

        gain2.gain.setValueAtTime(0.02, now);
        gain2.gain.linearRampToValueAtTime(0.35, now + dur);

        osc2.connect(gain2);
        gain2.connect(this.sfxGain);
        osc2.start(now);
        osc2.stop(now + dur);
    }

    playRailgunBlast() {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const dur = 1.0;

        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(220, now);
        subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.5);

        subGain.gain.setValueAtTime(0.95, now);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        subOsc.connect(subGain);
        subGain.connect(this.sfxGain);
        subOsc.start(now);
        subOsc.stop(now + 0.6);

        const laserOsc = this.ctx.createOscillator();
        const laserGain = this.ctx.createGain();
        laserOsc.type = 'sawtooth';
        laserOsc.frequency.setValueAtTime(2400, now);
        laserOsc.frequency.exponentialRampToValueAtTime(140, now + dur);

        laserGain.gain.setValueAtTime(0.8, now);
        laserGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

        laserOsc.connect(laserGain);
        laserGain.connect(this.sfxGain);
        laserOsc.start(now);
        laserOsc.stop(now + dur);

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(dur);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(3800, now);
        filter.frequency.exponentialRampToValueAtTime(600, now + dur);
        filter.Q.value = 4.0;

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.85, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);
        noise.start(now);
        noise.stop(now + dur);
    }

    // ==========================================
    // WEAPONS & COMBAT SOUNDS
    // ==========================================
    playShoot(type = 'rifle') {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;

        if (type === 'rifle') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(450, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now);
            osc.stop(now + 0.12);

            const noise = this.ctx.createBufferSource();
            noise.buffer = this.createNoiseBuffer(0.1);
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(2200, now);
            filter.Q.value = 3.0;

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.3, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.sfxGain);
            noise.start(now);
            noise.stop(now + 0.1);

        } else if (type === 'shotgun') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);

            gain.gain.setValueAtTime(0.7, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now);
            osc.stop(now + 0.25);

            const noise = this.ctx.createBufferSource();
            noise.buffer = this.createNoiseBuffer(0.28);
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(3500, now);
            filter.frequency.exponentialRampToValueAtTime(400, now + 0.28);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.6, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.sfxGain);
            noise.start(now);
            noise.stop(now + 0.28);

        } else if (type === 'railgun') {
            this.playRailgunBlast();

        } else if (type === 'chainarm') {
            this.playChainLaunch();

        } else if (type === 'rocket') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.linearRampToValueAtTime(320, now + 0.15);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);

            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now);
            osc.stop(now + 0.4);

            const noise = this.ctx.createBufferSource();
            noise.buffer = this.createNoiseBuffer(0.35);
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(800, now);

            const nGain = this.ctx.createGain();
            nGain.gain.setValueAtTime(0.5, now);
            nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

            noise.connect(filter);
            filter.connect(nGain);
            nGain.connect(this.sfxGain);
            noise.start(now);
            noise.stop(now + 0.35);
        }
    }

    playExplosion(isLarge = false) {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const dur = isLarge ? 0.8 : 0.45;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(isLarge ? 120 : 160, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + dur);

        gain.gain.setValueAtTime(isLarge ? 0.9 : 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + dur);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + dur);

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(dur);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(isLarge ? 2000 : 1400, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + dur);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(isLarge ? 0.8 : 0.5, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);
        noise.start(now);
        noise.stop(now + dur);
    }

    playHitmarker(isHeadshot = false) {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = isHeadshot ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(isHeadshot ? 2400 : 1600, now);
        if (isHeadshot) {
            osc.frequency.setValueAtTime(2800, now + 0.03);
        }

        gain.gain.setValueAtTime(isHeadshot ? 0.35 : 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (isHeadshot ? 0.08 : 0.04));

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + (isHeadshot ? 0.08 : 0.04));
    }

    playReload() {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;

        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(900, now);
        osc1.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain1.gain.setValueAtTime(0.2, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc1.connect(gain1);
        gain1.connect(this.sfxGain);
        osc1.start(now);
        osc1.stop(now + 0.05);

        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(400, now + 0.45);
        osc2.frequency.exponentialRampToValueAtTime(1100, now + 0.52);
        gain2.gain.setValueAtTime(0.25, now + 0.45);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.52);
        osc2.connect(gain2);
        gain2.connect(this.sfxGain);
        osc2.start(now + 0.45);
        osc2.stop(now + 0.52);

        const osc3 = this.ctx.createOscillator();
        const gain3 = this.ctx.createGain();
        osc3.type = 'sawtooth';
        osc3.frequency.setValueAtTime(1200, now + 0.85);
        osc3.frequency.exponentialRampToValueAtTime(600, now + 0.95);
        gain3.gain.setValueAtTime(0.3, now + 0.85);
        gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.95);
        osc3.connect(gain3);
        gain3.connect(this.sfxGain);
        osc3.start(now + 0.85);
        osc3.stop(now + 0.95);
    }

    playEmpty() {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.04);
    }

    playFootstep() {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.08);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        noise.start(now);
        noise.stop(now + 0.08);
    }

    playJump() {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    playJumpPad() {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.3);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.3);
    }

    playShieldHit() {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.1);
    }

    playPlayerHurt() {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    playPickup(type = 'ammo') {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const freqs = type === 'health' ? [523, 659, 784] : type === 'shield' ? [440, 554, 659] : [600, 800];
        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + idx * 0.06;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.1);
        });
    }

    playWaveStart() {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const notes = [220, 277, 330, 440];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + idx * 0.12;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.35);
        });
    }

    playEnemyShoot() {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    startAmbientMusic() {
        if (!this.ctx || this.ambientOscillators.length > 0) return;
        const chords = [55, 110, 164.81];
        chords.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(250, this.ctx.currentTime);

            gain.gain.setValueAtTime(0.06, this.ctx.currentTime);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);

            osc.start();
            this.ambientOscillators.push({ osc, filter, gain });
        });
    }
}

window.soundEngine = new SoundEngine();
