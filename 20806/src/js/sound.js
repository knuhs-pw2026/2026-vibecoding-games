/**
 * [방탈출 / 텍스트 어드벤처] Web Audio API 기반 사운드 엔진
 * 
 * 외부 mp3 파일 없이 브라우저 내장 신디사이저로
 * 긴장감 넘치는 앰비언스, 타이핑 타건음, 자물쇠 해금음, 효과음을 100% 자체 생성합니다.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.volume = 0.6;
    this.ambientOsc = null;
    this.ambientGain = null;
    this.isAmbientPlaying = false;
  }

  // 브라우저 정책상 사용자 첫 인터랙션(클릭) 시 초기화
  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(mute) {
    this.isMuted = mute;
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08 * this.volume, this.ctx?.currentTime || 0);
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ambientGain && !this.isMuted) {
      this.ambientGain.gain.setValueAtTime(0.08 * this.volume, this.ctx?.currentTime || 0);
    }
  }

  // 1. 타이핑 타건음 (랜덤 피치)
  playTypewriter() {
    if (this.isMuted) return;
    this.initContext();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.value = 800 + Math.random() * 400;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200 + Math.random() * 80, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.03);

    gain.gain.setValueAtTime(0.04 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  }

  // 2. 버튼 클릭음
  playClick() {
    if (this.isMuted) return;
    this.initContext();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

    gain.gain.setValueAtTime(0.12 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // 3. 버튼 호버음
  playHover() {
    if (this.isMuted) return;
    this.initContext();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.linearRampToValueAtTime(520, now + 0.03);

    gain.gain.setValueAtTime(0.03 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  }

  // 4. 키패드 번호음 (DTMF 스타일)
  playKeypad(digit) {
    if (this.isMuted) return;
    this.initContext();

    const now = this.ctx.currentTime;
    const baseFreq = 500 + (parseInt(digit, 10) || 0) * 60;
    
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, now);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 1.5, now);

    gain.gain.setValueAtTime(0.1 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.09);
    osc2.stop(now + 0.09);
  }

  // 5. 자물쇠/도어락 잠금 해제 성공음
  playUnlock() {
    if (this.isMuted) return;
    this.initContext();

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.15 * this.volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  // 6. 퍼즐 오류 / 접근 거부 버저음
  playError() {
    if (this.isMuted) return;
    this.initContext();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.setValueAtTime(110, now + 0.1);

    gain.gain.setValueAtTime(0.15 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  // 7. 아이템 획득 찬미음
  playItemAcquire() {
    if (this.isMuted) return;
    this.initContext();

    const now = this.ctx.currentTime;
    const chords = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5

    chords.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.12 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  // 8. 아이템 조합 및 스파크
  playCombine() {
    if (this.isMuted) return;
    this.initContext();

    const now = this.ctx.currentTime;
    // 화이트 노이즈 버퍼 + 스위프 톤
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);

    gain.gain.setValueAtTime(0.18 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  // 9. 긴장감 심박수 (Heartbeat)
  playHeartbeat() {
    if (this.isMuted) return;
    this.initContext();

    const now = this.ctx.currentTime;
    [0, 0.15].forEach((offset) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + offset;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);

      gain.gain.setValueAtTime(0.25 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.14);
    });
  }

  // 10. 미스터리 앰비언트 배경음 (낮은 드론 & 바람 효과)
  startAmbientDrone() {
    if (this.isAmbientPlaying) return;
    this.initContext();

    const now = this.ctx.currentTime;
    
    // 저주파 드론 1 (55Hz - A1)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    this.ambientGain = this.ctx.createGain();

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 180;

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(55, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(56.2, now); // 비트 주파수(Binaural beat effect)

    this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.06 * this.volume, now);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);

    this.ambientOsc = [osc1, osc2];
    this.isAmbientPlaying = true;
  }
}

window.soundEngine = new SoundEngine();
