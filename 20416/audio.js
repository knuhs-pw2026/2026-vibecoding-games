/**
 * ===================================================
 * 선생님 몰래 두쫀쿠 먹기 (Dubai Cookie Stealth Eater)
 * Sound Engine (Web Audio API Synthesizer)
 * ===================================================
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.isBgmPlaying = false;
  }

  // Initialize AudioContext upon user gesture
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
    } else if (this.isBgmPlaying) {
      this.startBGM();
    }
    return this.isMuted;
  }

  // Master Gain Node helper
  createNode(type = 'sine', freq = 440) {
    if (!this.ctx || this.isMuted) return null;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    return { osc, gain };
  }

  // 1. Crunch / Bite SFX (Crispy kataifi & chewy chocolate)
  playBite() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Noise buffer for crunchy kataifi sound
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    // Bandpass filter for crispy bite texture
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2800, now);
    filter.Q.setValueAtTime(3.0, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.08);

    // Chewy tone
    const node = this.createNode('triangle', 320);
    if (node) {
      node.osc.frequency.exponentialRampToValueAtTime(140, now + 0.1);
      node.gain.gain.setValueAtTime(0.2, now);
      node.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      node.osc.start(now);
      node.osc.stop(now + 0.1);
    }
  }

  // 2. Blackboard Chalk Ticking SFX
  playChalk() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const node = this.createNode('square', 800 + Math.random() * 400);
    if (node) {
      node.gain.gain.setValueAtTime(0.04, now);
      node.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      node.osc.start(now);
      node.osc.stop(now + 0.04);
    }
  }

  // 3. Teacher Warning Alert ("!" / "?")
  playWarning() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const node = this.createNode('sawtooth', 880);
    if (node) {
      node.osc.frequency.setValueAtTime(880, now);
      node.osc.frequency.setValueAtTime(1200, now + 0.07);
      node.gain.gain.setValueAtTime(0.25, now);
      node.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      node.osc.start(now);
      node.osc.stop(now + 0.2);
    }
  }

  // 4. Quick Swish (Head turning)
  playTurn() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const node = this.createNode('sine', 600);
    if (node) {
      node.osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);
      node.gain.gain.setValueAtTime(0.2, now);
      node.gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
      node.osc.start(now);
      node.osc.stop(now + 0.15);
    }
  }

  // 5. Caught / Game Over (Dramatic chord)
  playCaught() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const freqs = [350, 290, 220, 150];
    freqs.forEach((freq, idx) => {
      const node = this.createNode('sawtooth', freq);
      if (node) {
        node.gain.gain.setValueAtTime(0.3, now + idx * 0.08);
        node.gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.5);
        node.osc.start(now + idx * 0.08);
        node.osc.stop(now + idx * 0.08 + 0.5);
      }
    });
  }

  // 6. Perfect / Close Call Bonus ("Ding!")
  playPerfect() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const node1 = this.createNode('sine', 1046.5); // C6
    const node2 = this.createNode('sine', 1567.98); // G6
    [node1, node2].forEach(n => {
      if (n) {
        n.gain.gain.setValueAtTime(0.2, now);
        n.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        n.osc.start(now);
        n.osc.stop(now + 0.35);
      }
    });
  }

  // 7. Golden Fever Mode Activation
  playFever() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const node = this.createNode('triangle', freq);
      if (node) {
        node.gain.gain.setValueAtTime(0.25, now + i * 0.06);
        node.gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.25);
        node.osc.start(now + i * 0.06);
        node.osc.stop(now + i * 0.06 + 0.25);
      }
    });
  }

  // 8. School Bell Chimes (Class finished / Clear)
  playSchoolBell() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Classic Ding-Dong-Dang-Dong bell
    const bellNotes = [523.25, 659.25, 783.99, 659.25, 523.25];
    bellNotes.forEach((freq, idx) => {
      const node = this.createNode('sine', freq);
      if (node) {
        const time = now + idx * 0.35;
        node.gain.gain.setValueAtTime(0.25, time);
        node.gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
        node.osc.start(time);
        node.osc.stop(time + 0.6);
      }
    });
  }

  // 9. Upbeat Sneaking Chiptune BGM Generator
  startBGM() {
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    if (this.isMuted) return;

    this.init();
    this.bgmStep = 0;
    // Fun stealthy melody notes (frequencies)
    const bassline = [130.81, 146.83, 155.56, 174.61, 196.00, 174.61, 155.56, 146.83];
    const melody = [
      523.25, 0, 587.33, 0, 659.25, 523.25, 0, 783.99,
      659.25, 0, 587.33, 0, 523.25, 493.88, 523.25, 0
    ];

    const bpm = 135;
    const stepTime = (60 / bpm) / 2; // sixteenth notes

    this.bgmTimer = setInterval(() => {
      if (!this.ctx || this.isMuted || !this.isBgmPlaying) return;
      const now = this.ctx.currentTime;

      // Bass beat
      const bassFreq = bassline[Math.floor(this.bgmStep / 2) % bassline.length];
      if (this.bgmStep % 2 === 0 && bassFreq) {
        const bass = this.createNode('triangle', bassFreq);
        if (bass) {
          bass.gain.gain.setValueAtTime(0.12, now);
          bass.gain.gain.exponentialRampToValueAtTime(0.001, now + stepTime * 1.5);
          bass.osc.start(now);
          bass.osc.stop(now + stepTime * 1.5);
        }
      }

      // Lead melody
      const melFreq = melody[this.bgmStep % melody.length];
      if (melFreq > 0) {
        const lead = this.createNode('square', melFreq);
        if (lead) {
          lead.gain.gain.setValueAtTime(0.045, now);
          lead.gain.gain.exponentialRampToValueAtTime(0.001, now + stepTime * 0.9);
          lead.osc.start(now);
          lead.osc.stop(now + stepTime * 0.9);
        }
      }

      this.bgmStep++;
    }, stepTime * 1000);
  }

  stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

// Global Sound Instance
window.soundEngine = new SoundEngine();
