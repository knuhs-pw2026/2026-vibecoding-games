// input.js - Keyboard, Mouse & Touch Controller
export class InputManager {
  constructor() {
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      shoot: false,
      jump: false,
      pause: false
    };

    this.justPressed = {
      shoot: false,
      jump: false,
      pause: false,
      digit: null
    };

    this.lastDirection = 'down'; // 'down' | 'up' | 'left' | 'right'
    this.initKeyboard();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Prevent scrolling on arrow keys & space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.keys.up = true;
          this.lastDirection = 'up';
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.keys.down = true;
          this.lastDirection = 'down';
          break;
        case 'ArrowLeft':
        case 'KeyA':
          this.keys.left = true;
          this.lastDirection = 'left';
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.keys.right = true;
          this.lastDirection = 'right';
          break;
        case 'KeyR':
          if (!this.keys.shoot) this.justPressed.shoot = true;
          this.keys.shoot = true;
          break;
        case 'Space':
          if (!this.keys.jump) this.justPressed.jump = true;
          this.keys.jump = true;
          break;
        case 'KeyP':
        case 'Escape':
          this.justPressed.pause = true;
          break;
        // Debug stage jump shortcuts: Digit1 ~ Digit7
        case 'Digit1': case 'Digit2': case 'Digit3':
        case 'Digit4': case 'Digit5': case 'Digit6': case 'Digit7':
          this.justPressed.digit = parseInt(e.key, 10);
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.keys.up = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.keys.down = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          this.keys.left = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.keys.right = false;
          break;
        case 'KeyR':
          this.keys.shoot = false;
          break;
        case 'Space':
          this.keys.jump = false;
          break;
      }
    });
  }

  // Hook touch / virtual buttons from HTML DOM
  bindVirtualControls(elements) {
    if (!elements) return;

    const bindBtn = (el, pressAction, releaseAction) => {
      if (!el) return;
      const start = (e) => { e.preventDefault(); pressAction(); };
      const end = (e) => { e.preventDefault(); releaseAction(); };

      el.addEventListener('mousedown', start);
      el.addEventListener('mouseup', end);
      el.addEventListener('mouseleave', end);
      el.addEventListener('touchstart', start, { passive: false });
      el.addEventListener('touchend', end, { passive: false });
      el.addEventListener('touchcancel', end, { passive: false });
    };

    if (elements.btnUp) {
      bindBtn(elements.btnUp, () => { this.keys.up = true; this.lastDirection = 'up'; }, () => { this.keys.up = false; });
    }
    if (elements.btnDown) {
      bindBtn(elements.btnDown, () => { this.keys.down = true; this.lastDirection = 'down'; }, () => { this.keys.down = false; });
    }
    if (elements.btnLeft) {
      bindBtn(elements.btnLeft, () => { this.keys.left = true; this.lastDirection = 'left'; }, () => { this.keys.left = false; });
    }
    if (elements.btnRight) {
      bindBtn(elements.btnRight, () => { this.keys.right = true; this.lastDirection = 'right'; }, () => { this.keys.right = false; });
    }
    if (elements.btnShoot) {
      bindBtn(elements.btnShoot, () => { this.justPressed.shoot = true; this.keys.shoot = true; }, () => { this.keys.shoot = false; });
    }
    if (elements.btnJump) {
      bindBtn(elements.btnJump, () => { this.justPressed.jump = true; this.keys.jump = true; }, () => { this.keys.jump = false; });
    }
  }

  isMoving() {
    return this.keys.up || this.keys.down || this.keys.left || this.keys.right;
  }

  // Consume and clear single-frame triggers
  consumeShoot() {
    const v = this.justPressed.shoot;
    this.justPressed.shoot = false;
    return v;
  }

  consumeJump() {
    const v = this.justPressed.jump;
    this.justPressed.jump = false;
    return v;
  }

  consumePause() {
    const v = this.justPressed.pause;
    this.justPressed.pause = false;
    return v;
  }

  consumeDigit() {
    const d = this.justPressed.digit;
    this.justPressed.digit = null;
    return d;
  }
}
