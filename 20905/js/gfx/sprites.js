// sprites.js - Procedural Pixel Art Sprite Generator & Cache
import { CONFIG } from '../config.js';

export class SpriteManager {
  constructor() {
    this.cache = new Map();
    this.init();
  }

  init() {
    // Generate and cache all pixel art canvases
    this.generatePlayerSprites();
    this.generateZombieSprites();
    this.generateProjectileSprites();
    this.generateItemSprites();
    this.generateTileSprites();
  }

  createCanvas(width, height) {
    const c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { canvas: c, ctx };
  }

  // 1. Player Sprites (4 directions, walk frames, hurt, jump, shoot)
  generatePlayerSprites() {
    const directions = ['down', 'up', 'left', 'right'];
    const T = CONFIG.TILE_SIZE;

    directions.forEach(dir => {
      // Walk frames 0, 1, 2
      for (let frame = 0; frame < 4; frame++) {
        const { canvas, ctx } = this.createCanvas(T, T);
        this.drawPixelPlayer(ctx, dir, frame % 4, false, false, 'normal');
        this.cache.set(`player_${dir}_walk_${frame}`, canvas);
      }

      // Hurt frame
      const hurt = this.createCanvas(T, T);
      this.drawPixelPlayer(hurt.ctx, dir, 0, true, false, 'hurt');
      this.cache.set(`player_${dir}_hurt`, hurt.canvas);

      // Jump frame
      const jump = this.createCanvas(T, T);
      this.drawPixelPlayer(jump.ctx, dir, 1, false, true, 'determined');
      this.cache.set(`player_${dir}_jump`, jump.canvas);

      // Shoot frame
      const shoot = this.createCanvas(T, T);
      this.drawPixelPlayer(shoot.ctx, dir, 0, false, false, 'aim');
      this.drawPixelBow(shoot.ctx, dir);
      this.cache.set(`player_${dir}_shoot`, shoot.canvas);
    });
  }

  drawPixelPlayer(ctx, dir, walkFrame, isHurt, isJump, expr) {
    const P = 2; // pixel scale (16x16 logical drawn at 32x32)
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(16, 30, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    const yOff = isJump ? -4 : (walkFrame % 2 === 1 ? -1 : 0);

    // Body colors
    const skin = isHurt ? '#ff9999' : '#fbd3a2';
    const hair = '#3b281c';
    const jacket = isHurt ? '#ff4d4d' : '#2b5c8f';
    const pants = '#1f2937';
    const boots = '#4a3728';

    ctx.save();
    ctx.translate(0, yOff);

    // Legs / Boots
    ctx.fillStyle = pants;
    let legOffset = (walkFrame === 1 ? -2 : walkFrame === 3 ? 2 : 0);
    if (dir === 'down' || dir === 'up') {
      ctx.fillRect(10 + legOffset, 22, 4, 6);
      ctx.fillRect(18 - legOffset, 22, 4, 6);
      ctx.fillStyle = boots;
      ctx.fillRect(10 + legOffset, 26, 4, 4);
      ctx.fillRect(18 - legOffset, 26, 4, 4);
    } else {
      ctx.fillRect(12 + legOffset, 22, 8, 6);
      ctx.fillStyle = boots;
      ctx.fillRect(12 + legOffset, 26, 8, 4);
    }

    // Torso / Jacket
    ctx.fillStyle = jacket;
    ctx.fillRect(10, 14, 12, 9);
    // Belt
    ctx.fillStyle = '#6b5438';
    ctx.fillRect(10, 21, 12, 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(14, 21, 4, 2);

    // Head
    ctx.fillStyle = skin;
    ctx.fillRect(10, 4, 12, 10);

    // Hair
    ctx.fillStyle = hair;
    ctx.fillRect(9, 2, 14, 4);
    if (dir === 'down') {
      ctx.fillRect(9, 4, 3, 4);
      ctx.fillRect(20, 4, 3, 4);
      ctx.fillRect(12, 2, 8, 3);
    } else if (dir === 'up') {
      ctx.fillRect(9, 4, 14, 8);
    } else if (dir === 'left') {
      ctx.fillRect(9, 4, 10, 5);
      ctx.fillRect(17, 2, 5, 3);
    } else if (dir === 'right') {
      ctx.fillRect(13, 4, 10, 5);
      ctx.fillRect(10, 2, 5, 3);
    }

    // Face details & expressions
    if (dir === 'down') {
      // Eyes
      ctx.fillStyle = expr === 'hurt' ? '#ef4444' : '#1e293b';
      if (expr === 'hurt') {
        // X eyes
        ctx.fillRect(12, 7, 2, 1);
        ctx.fillRect(18, 7, 2, 1);
      } else {
        ctx.fillRect(12, 7, 2, 3);
        ctx.fillRect(18, 7, 2, 3);
        // Eye highlights
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(12, 7, 1, 1);
        ctx.fillRect(18, 7, 1, 1);
      }
      // Mouth / Expression
      ctx.fillStyle = expr === 'hurt' ? '#7f1d1d' : expr === 'determined' ? '#475569' : '#b45309';
      if (expr === 'determined') {
        ctx.fillRect(14, 11, 4, 1);
      } else if (expr === 'hurt') {
        ctx.fillRect(14, 11, 4, 2);
      } else {
        ctx.fillRect(14, 11, 4, 1);
      }
    } else if (dir === 'left') {
      ctx.fillStyle = expr === 'hurt' ? '#ef4444' : '#1e293b';
      ctx.fillRect(11, 7, 2, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(11, 7, 1, 1);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(11, 11, 3, 1);
    } else if (dir === 'right') {
      ctx.fillStyle = expr === 'hurt' ? '#ef4444' : '#1e293b';
      ctx.fillRect(19, 7, 2, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20, 7, 1, 1);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(18, 11, 3, 1);
    }

    // Hands / Arms
    ctx.fillStyle = skin;
    if (dir === 'down') {
      ctx.fillRect(8, 16, 2, 5);
      ctx.fillRect(22, 16, 2, 5);
    } else if (dir === 'up') {
      ctx.fillRect(8, 14, 2, 5);
      ctx.fillRect(22, 14, 2, 5);
    } else if (dir === 'left') {
      ctx.fillRect(14, 16, 4, 4);
    } else if (dir === 'right') {
      ctx.fillRect(14, 16, 4, 4);
    }

    ctx.restore();
  }

  drawPixelBow(ctx, dir) {
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#d97706';

    if (dir === 'right') {
      ctx.beginPath();
      ctx.arc(24, 18, 8, -Math.PI/2, Math.PI/2, false);
      ctx.stroke();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(24, 10);
      ctx.lineTo(18, 18);
      ctx.lineTo(24, 26);
      ctx.stroke();
    } else if (dir === 'left') {
      ctx.beginPath();
      ctx.arc(8, 18, 8, Math.PI/2, -Math.PI/2, false);
      ctx.stroke();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(8, 10);
      ctx.lineTo(14, 18);
      ctx.lineTo(8, 26);
      ctx.stroke();
    } else if (dir === 'down') {
      ctx.beginPath();
      ctx.arc(16, 24, 8, 0, Math.PI, false);
      ctx.stroke();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(8, 24);
      ctx.lineTo(16, 18);
      ctx.lineTo(24, 24);
      ctx.stroke();
    } else if (dir === 'up') {
      ctx.beginPath();
      ctx.arc(16, 8, 8, Math.PI, 0, false);
      ctx.stroke();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(8, 8);
      ctx.lineTo(16, 14);
      ctx.lineTo(24, 8);
      ctx.stroke();
    }
  }

  // 2. Zombie Sprites (5 Types)
  generateZombieSprites() {
    const T = CONFIG.TILE_SIZE;

    // Normal Zombie (32x32)
    for (let f = 0; f < 4; f++) {
      const { canvas, ctx } = this.createCanvas(T, T);
      this.drawNormalZombie(ctx, f);
      this.cache.set(`zombie_normal_${f}`, canvas);
    }

    // Exploding Zombie (32x32, pulsating glow)
    for (let f = 0; f < 4; f++) {
      const { canvas, ctx } = this.createCanvas(T, T);
      this.drawExplodingZombie(ctx, f);
      this.cache.set(`zombie_exploding_${f}`, canvas);
    }

    // Shooting Zombie (32x32, acid shooter)
    for (let f = 0; f < 4; f++) {
      const { canvas, ctx } = this.createCanvas(T, T);
      this.drawShootingZombie(ctx, f);
      this.cache.set(`zombie_shooting_${f}`, canvas);
    }

    // Mutant Zombie (3x5 tiles = 96 x 160 px)
    const mw = 3 * T;
    const mh = 5 * T;
    for (let f = 0; f < 4; f++) {
      const { canvas, ctx } = this.createCanvas(mw, mh);
      this.drawMutantZombie(ctx, f, 'normal');
      this.cache.set(`zombie_mutant_walk_${f}`, canvas);
    }
    // Mutant punch & stomp states
    const mutantPunch = this.createCanvas(mw, mh);
    this.drawMutantZombie(mutantPunch.ctx, 0, 'punch');
    this.cache.set('zombie_mutant_punch', mutantPunch.canvas);

    const mutantStomp = this.createCanvas(mw, mh);
    this.drawMutantZombie(mutantStomp.ctx, 0, 'stomp');
    this.cache.set('zombie_mutant_stomp', mutantStomp.canvas);

    // Boss Zombie (10x10 tiles = 320 x 320 px)
    const bw = 10 * T;
    const bh = 10 * T;
    for (let phase = 1; phase <= 3; phase++) {
      for (let f = 0; f < 4; f++) {
        const { canvas, ctx } = this.createCanvas(bw, bh);
        this.drawBossZombie(ctx, phase, f);
        this.cache.set(`boss_phase_${phase}_${f}`, canvas);
      }
    }
  }

  drawNormalZombie(ctx, frame) {
    // Rotting Undead Zombie with decaying skin, exposed ribs, dripping blood/saliva, shambling limp
    const skin = '#446b4e';
    const darkRot = '#203a27';
    const exposedBone = '#e2e8f0';
    const bloodGore = '#991b1b';
    const tatteredShirt = '#57534e';
    const tatteredPants = '#292524';

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(16, 30, 9, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shambling / Limping animation (uneven legs)
    const limpY = frame % 2 === 1 ? -1 : 1;
    const legOff = frame === 1 ? -3 : (frame === 3 ? 2 : 0);

    ctx.save();
    ctx.translate(0, limpY);

    // Tattered pants with exposed rotting leg bone
    ctx.fillStyle = tatteredPants;
    ctx.fillRect(9 + legOff, 21, 4, 7);
    ctx.fillRect(18 - legOff, 21, 4, 8);
    // Exposed bone on left leg
    ctx.fillStyle = exposedBone;
    ctx.fillRect(10 + legOff, 25, 2, 3);
    ctx.fillStyle = bloodGore;
    ctx.fillRect(9 + legOff, 24, 4, 1);

    // Decaying Torso with ripped shirt & exposed bloody ribs
    ctx.fillStyle = tatteredShirt;
    ctx.fillRect(8, 12, 16, 10);
    // Bloody tear hole
    ctx.fillStyle = bloodGore;
    ctx.fillRect(12, 14, 6, 6);
    // Exposed Ribs
    ctx.fillStyle = exposedBone;
    ctx.fillRect(13, 15, 4, 1);
    ctx.fillRect(13, 17, 4, 1);

    // Shambling outstretched zombie arms (one reaching forward, one hanging)
    ctx.fillStyle = skin;
    if (frame % 2 === 0) {
      ctx.fillRect(4, 13, 4, 9); // left arm reaching
      ctx.fillRect(23, 15, 4, 7); // right arm drooping
      ctx.fillStyle = bloodGore;
      ctx.fillRect(4, 20, 4, 3); // bloody claws
    } else {
      ctx.fillRect(5, 14, 4, 8);
      ctx.fillRect(22, 13, 5, 8);
      ctx.fillStyle = bloodGore;
      ctx.fillRect(23, 19, 4, 3);
    }

    // Rotting Head (asymmetrical, rotting flesh patch)
    ctx.fillStyle = skin;
    ctx.fillRect(8, 2, 15, 11);
    ctx.fillStyle = darkRot;
    ctx.fillRect(8, 2, 6, 4); // necrotic rot patch

    // Messy decayed hair
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(9, 1, 10, 2);
    ctx.fillRect(18, 2, 4, 2);

    // Hollow Undead Eyes (One bloody red, one glowing yellow)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(11, 5, 2, 3);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(17, 5, 2, 3);
    ctx.fillStyle = '#000000';
    ctx.fillRect(12, 6, 1, 1);

    // Gaping Rotten Open Jaw with dripping green saliva/blood
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(11, 9, 8, 4);
    ctx.fillStyle = exposedBone;
    ctx.fillRect(12, 9, 2, 2); // jagged teeth
    ctx.fillRect(16, 9, 2, 2);
    ctx.fillStyle = '#22c55e'; // toxic saliva drip
    ctx.fillRect(14, 12, 2, 2);

    ctx.restore();
  }

  drawExplodingZombie(ctx, frame) {
    // Grossly bloated zombie filled with radioactive pus, glowing boils, twitching dislocated head
    const skin = '#854d0e';
    const darkFlesh = '#713f12';
    const bloodGore = '#991b1b';

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(16, 30, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const pulse = Math.sin(frame * Math.PI / 2) * 1.5;

    // Bloated festering pulsating belly
    ctx.fillStyle = '#c2410c';
    ctx.beginPath();
    ctx.arc(16, 18, 10 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Glowing infected pustules / toxic boils
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(13, 16, 4, 0, Math.PI * 2);
    ctx.arc(19, 19, 3, 0, Math.PI * 2);
    ctx.arc(15, 22, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Bulging glowing yellow/green radioactive veins
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(10, 13);
    ctx.lineTo(15, 18);
    ctx.lineTo(21, 14);
    ctx.moveTo(13, 22);
    ctx.lineTo(18, 20);
    ctx.stroke();

    // Small stubby decaying legs
    ctx.fillStyle = '#451a03';
    ctx.fillRect(8, 24, 5, 6);
    ctx.fillRect(18, 24, 5, 6);
    ctx.fillStyle = bloodGore;
    ctx.fillRect(8, 28, 5, 2);

    // Twisted head slumped on bloated shoulder
    ctx.fillStyle = skin;
    ctx.fillRect(10, 3, 11, 9);
    ctx.fillStyle = darkFlesh;
    ctx.fillRect(10, 3, 4, 3);

    // Wild manic undead eyes
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(12, 6, 2, 2);
    ctx.fillRect(17, 5, 3, 3);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(18, 6, 1, 1);

    // Dripping toxic bile mouth
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(13, 9, 6, 2);
    ctx.fillStyle = '#84cc16';
    ctx.fillRect(14, 10, 3, 3);

    // Top spark / leaking toxic fumes
    ctx.fillStyle = frame % 2 === 0 ? '#fbbf24' : '#ef4444';
    ctx.fillRect(15, 0, 2, 3);
  }

  drawShootingZombie(ctx, frame) {
    // Biohazard hazmat zombie with mutated acidic spitter jaw & glowing spinal bio-tank
    const skin = '#115e59';
    const suit = '#334155';
    const hazardYellow = '#eab308';
    const acidGreen = '#84cc16';

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(16, 30, 9, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    const legOff = frame % 2 === 1 ? -2 : 2;

    // Legs with torn hazmat boots
    ctx.fillStyle = suit;
    ctx.fillRect(9 + legOff, 22, 4, 8);
    ctx.fillRect(18 - legOff, 22, 4, 8);
    ctx.fillStyle = hazardYellow;
    ctx.fillRect(9 + legOff, 26, 4, 2);

    // Torn Hazmat Torso with glowing bio-acid core
    ctx.fillStyle = suit;
    ctx.fillRect(8, 12, 15, 11);
    ctx.fillStyle = hazardYellow;
    ctx.fillRect(8, 12, 3, 8);

    // Pulsating green bio-acid tank on back
    ctx.fillStyle = acidGreen;
    ctx.fillRect(5, 11, 4, 9);
    ctx.fillStyle = '#bef264';
    ctx.fillRect(6, 13, 2, 5);

    // Right Arm: Mutated Acid Spitter Cannon / Gaping Tentacle
    ctx.fillStyle = skin;
    ctx.fillRect(21, 13, 6, 6);
    ctx.fillStyle = acidGreen;
    ctx.fillRect(24, 14, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(26, 15, 2, 2);

    // Broken Hazmat Helmet / Ghoulish face
    ctx.fillStyle = skin;
    ctx.fillRect(9, 3, 13, 10);
    ctx.fillStyle = suit;
    ctx.fillRect(9, 2, 13, 3); // helmet rim

    // Cracked green visor / Undead red eye
    ctx.fillStyle = '#84cc16';
    ctx.fillRect(11, 5, 8, 3);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(13, 6, 2, 2);

    // Acid dripping spitter mouth
    ctx.fillStyle = '#042f2e';
    ctx.fillRect(11, 9, 8, 3);
    ctx.fillStyle = acidGreen;
    ctx.fillRect(13, 10, 4, 3);
  }

  drawMutantZombie(ctx, frame, state) {
    // 3 tiles x 5 tiles = 96 x 160 px Colossal Zombie Behemoth
    const w = 96;
    const h = 160;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.ellipse(w/2, h - 8, 42, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    const mutantPurple = '#3b0764';
    const darkRotFlesh = '#581c87';
    const rawSinew = '#9333ea';
    const bone = '#fef08a';
    const bloodGore = '#991b1b';

    const yOff = state === 'stomp' ? -24 : (frame % 2 === 1 ? -4 : 0);

    ctx.save();
    ctx.translate(0, yOff);

    // Massive Muscular Legs with exposed tendons & bone spikes
    ctx.fillStyle = mutantPurple;
    ctx.fillRect(20, 95, 24, 55);
    ctx.fillRect(52, 95, 24, 55);
    // Bloody tendons
    ctx.fillStyle = rawSinew;
    ctx.fillRect(24, 105, 8, 25);
    ctx.fillRect(64, 105, 8, 25);
    // Bone spikes on knees
    ctx.fillStyle = bone;
    ctx.fillRect(16, 112, 8, 8);
    ctx.fillRect(72, 112, 8, 8);

    // Colossal Rotting Torso with exposed ribs & beating black heart
    ctx.fillStyle = darkRotFlesh;
    ctx.fillRect(14, 35, 68, 68);

    // Ripped pectoral muscles & bloody flesh
    ctx.fillStyle = rawSinew;
    ctx.fillRect(22, 42, 22, 26);
    ctx.fillRect(52, 42, 22, 26);
    ctx.fillRect(26, 72, 44, 22);

    // Bloody ribs & rotting gore
    ctx.fillStyle = bloodGore;
    ctx.fillRect(36, 50, 24, 20);
    ctx.fillStyle = bone;
    ctx.fillRect(38, 54, 20, 2);
    ctx.fillRect(38, 60, 20, 2);

    // Huge Claws / Arms
    ctx.fillStyle = mutantPurple;
    if (state === 'punch') {
      // Wind up giant blood-drenched fist
      ctx.fillRect(2, 40, 18, 60);
      ctx.fillStyle = bloodGore;
      ctx.fillRect(58, 30, 36, 36);
      ctx.fillStyle = bone;
      ctx.fillRect(86, 36, 10, 10);
    } else {
      ctx.fillRect(2, 40, 18, 65);
      ctx.fillRect(76, 40, 18, 65);
      // Gore-stained claws
      ctx.fillStyle = bloodGore;
      ctx.fillRect(2, 95, 18, 12);
      ctx.fillRect(76, 95, 18, 12);
      ctx.fillStyle = bone;
      ctx.fillRect(2, 105, 6, 6);
      ctx.fillRect(88, 105, 6, 6);
    }

    // Demonic Undead Head with Jagged Horns & Exposed Skull
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(30, 8, 36, 32);

    // Bone Horns
    ctx.fillStyle = bone;
    ctx.fillRect(8, 20, 12, 20);
    ctx.fillRect(76, 20, 12, 20);

    // Glowing Bloodshot Crimson Eyes
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(36, 18, 8, 8);
    ctx.fillRect(52, 18, 8, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(38, 20, 3, 3);
    ctx.fillRect(54, 20, 3, 3);

    // Giant Dripping Jaws with Fangs
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(36, 28, 24, 10);
    ctx.fillStyle = bone;
    ctx.fillRect(38, 28, 5, 8);
    ctx.fillRect(45, 28, 5, 8);
    ctx.fillRect(52, 28, 5, 8);
    ctx.fillStyle = '#22c55e'; // venom drip
    ctx.fillRect(44, 36, 4, 4);

    ctx.restore();
  }

  drawBossZombie(ctx, phase, frame) {
    // 10 tiles x 10 tiles = 320 x 320 px Colossal Bio-Abomination Zombie
    const w = 320;
    const h = 320;
    const cx = w / 2;
    const cy = h / 2;

    // Colossal Dark Aura / Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.ellipse(cx, h - 20, 125, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    const phaseColor = phase === 1 ? '#4c0519' : phase === 2 ? '#4a044e' : '#2b0606';
    const goreColor = phase === 1 ? '#9f1239' : phase === 2 ? '#86198f' : '#7f1d1d';
    const coreGlow = phase === 1 ? '#f43f5e' : phase === 2 ? '#d946ef' : '#ef4444';

    // Massive Body Hull / Bio-Necrotic Shell
    ctx.fillStyle = phaseColor;
    ctx.fillRect(50, 50, 220, 220);

    // Exposed Rotting Ribs & Heavy Bone Plating
    ctx.fillStyle = goreColor;
    ctx.fillRect(70, 70, 180, 180);

    // Beating Necrotic Core / Rotten Heart
    const pulse = Math.sin(frame * Math.PI / 2) * 8;
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(cx, cy + 10, 48 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Central Demonic Evil Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy + 10, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(cx, cy + 10, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.fillRect(cx - 4, cy - 2, 8, 24); // Slit pupil

    // Spiked Necrotic Shoulders & Tentacles
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(30, 30, 45, 90);
    ctx.fillRect(245, 30, 45, 90);
    ctx.fillRect(20, 150, 45, 100);
    ctx.fillRect(255, 150, 45, 100);

    // Phase 3 Laser Emitters & Bio-Cannons
    if (phase === 3) {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(65, 30, 25, 35);
      ctx.fillRect(230, 30, 25, 35);
      ctx.fillRect(145, 15, 30, 35);
      // Crackling energy lines
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(75, 45); ctx.lineTo(cx, cy); ctx.lineTo(240, 45);
      ctx.stroke();
    }

    // Heavy Rotten Jaws & Dripping Fangs
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(80, 210, 160, 40);
    ctx.fillStyle = '#fef08a';
    for (let i = 0; i < 7; i++) {
      ctx.fillRect(90 + i * 20, 210, 14, 24);
      ctx.fillRect(90 + i * 20, 230, 14, 18);
    }
  }

  // 3. Projectile Sprites
  generateProjectileSprites() {
    const T = CONFIG.TILE_SIZE;

    // Arrow (4 directions: right, left, down, up)
    ['right', 'left', 'down', 'up'].forEach(dir => {
      const { canvas, ctx } = this.createCanvas(T, T);
      this.drawArrow(ctx, dir);
      this.cache.set(`arrow_${dir}`, canvas);
    });

    // Shooting Zombie Green Acid Ball
    const acid = this.createCanvas(24, 24);
    acid.ctx.fillStyle = '#84cc16';
    acid.ctx.beginPath();
    acid.ctx.arc(12, 12, 9, 0, Math.PI * 2);
    acid.ctx.fill();
    acid.ctx.fillStyle = '#d9f99d';
    acid.ctx.beginPath();
    acid.ctx.arc(10, 10, 4, 0, Math.PI * 2);
    acid.ctx.fill();
    this.cache.set('projectile_green_ball', acid.canvas);

    // Boss Phase 1 Mega Ball (48x48)
    const megaBall = this.createCanvas(48, 48);
    megaBall.ctx.fillStyle = '#e11d48';
    megaBall.ctx.beginPath();
    megaBall.ctx.arc(24, 24, 20, 0, Math.PI * 2);
    megaBall.ctx.fill();
    megaBall.ctx.fillStyle = '#ffe4e6';
    megaBall.ctx.beginPath();
    megaBall.ctx.arc(20, 20, 8, 0, Math.PI * 2);
    megaBall.ctx.fill();
    this.cache.set('projectile_boss_mega', megaBall.canvas);

    // Boss Phase 2 Homing Ball (36x36)
    const homingBall = this.createCanvas(36, 36);
    homingBall.ctx.fillStyle = '#c026d3';
    homingBall.ctx.beginPath();
    homingBall.ctx.arc(18, 18, 15, 0, Math.PI * 2);
    homingBall.ctx.fill();
    homingBall.ctx.fillStyle = '#fae8ff';
    homingBall.ctx.beginPath();
    homingBall.ctx.arc(15, 15, 6, 0, Math.PI * 2);
    homingBall.ctx.fill();
    this.cache.set('projectile_boss_homing', homingBall.canvas);
  }

  drawArrow(ctx, dir) {
    ctx.save();
    ctx.translate(16, 16);
    if (dir === 'left') ctx.rotate(Math.PI);
    else if (dir === 'up') ctx.rotate(-Math.PI / 2);
    else if (dir === 'down') ctx.rotate(Math.PI / 2);

    // Arrow shaft
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-12, -1.5, 20, 3);

    // Arrow head (metal)
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(6, -5);
    ctx.lineTo(6, 5);
    ctx.closePath();
    ctx.fill();

    // Arrow fletching (feathers)
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-12, -4, 4, 2);
    ctx.fillRect(-12, 2, 4, 2);

    ctx.restore();
  }

  // 4. Dropped Item Sprites (Potion, Generator, Keycard, Valve, Vaccine)
  generateItemSprites() {
    const T = CONFIG.TILE_SIZE;

    // 1. Health Potion (회복약) - Red Bubbling Flask
    const potion = this.createCanvas(T, T);
    const pctx = potion.ctx;
    // Ground Shadow
    pctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    pctx.beginPath();
    pctx.ellipse(16, 28, 8, 3, 0, 0, Math.PI * 2);
    pctx.fill();
    // Bottle Flask
    pctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    pctx.fillRect(9, 10, 14, 16);
    pctx.fillRect(13, 6, 6, 4); // neck
    // Red Elixir Liquid
    pctx.fillStyle = '#ef4444';
    pctx.fillRect(10, 14, 12, 11);
    pctx.fillStyle = '#f87171';
    pctx.fillRect(10, 14, 12, 3);
    // White Medical Cross
    pctx.fillStyle = '#ffffff';
    pctx.fillRect(14, 16, 4, 7);
    pctx.fillRect(12, 18, 8, 3);
    // Cork Cap
    pctx.fillStyle = '#b45309';
    pctx.fillRect(13, 4, 6, 3);
    this.cache.set('item_potion', potion.canvas);

    // 2. Emergency Generator Power Core (대도시 퀘스트 아이템) - Dropped Glowing Reactor Cell
    const gen = this.createCanvas(T, T);
    const gctx = gen.ctx;
    // Ground Shadow
    gctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    gctx.beginPath();
    gctx.ellipse(16, 28, 10, 3, 0, 0, Math.PI * 2);
    gctx.fill();
    // Metal Casing
    gctx.fillStyle = '#1e293b';
    gctx.fillRect(8, 8, 16, 18);
    // Glowing Cyber Core
    gctx.fillStyle = '#06b6d4';
    gctx.fillRect(11, 11, 10, 12);
    // Power Lightning Symbol
    gctx.fillStyle = '#fbbf24';
    gctx.beginPath();
    gctx.moveTo(17, 11); gctx.lineTo(13, 17); gctx.lineTo(16, 17); gctx.lineTo(14, 22); gctx.lineTo(19, 16); gctx.lineTo(16, 16);
    gctx.closePath();
    gctx.fill();
    // Outer Gold Connectors
    gctx.fillStyle = '#f59e0b';
    gctx.fillRect(6, 12, 3, 10);
    gctx.fillRect(23, 12, 3, 10);
    this.cache.set('item_generator', gen.canvas);

    // 3. Security Data Chip / Keycard (비밀 연구지역 퀘스트 아이템) - Dropped Blue Hologram Keycard
    const keycard = this.createCanvas(T, T);
    const kctx = keycard.ctx;
    // Ground Shadow
    kctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    kctx.beginPath();
    kctx.ellipse(16, 28, 9, 3, 0, 0, Math.PI * 2);
    kctx.fill();
    // Card Base
    kctx.fillStyle = '#2563eb';
    kctx.fillRect(7, 9, 18, 14);
    // Microchip Gold Contact
    kctx.fillStyle = '#fbbf24';
    kctx.fillRect(11, 12, 6, 5);
    // Magnetic Stripe / Hologram
    kctx.fillStyle = '#60a5fa';
    kctx.fillRect(7, 19, 18, 2);
    kctx.fillStyle = '#ffffff';
    kctx.fillRect(19, 12, 4, 4); // Security LED
    this.cache.set('item_keycard', keycard.canvas);

    // 4. Decontamination Valve Wheel (연구실 퀘스트 아이템) - Dropped Orange Valve Wheel
    const valve = this.createCanvas(T, T);
    const vactx = valve.ctx;
    // Ground Shadow
    vactx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    vactx.beginPath();
    vactx.ellipse(16, 28, 9, 3, 0, 0, Math.PI * 2);
    vactx.fill();
    // Heavy Valve Outer Ring
    vactx.fillStyle = '#f97316';
    vactx.beginPath();
    vactx.arc(16, 16, 11, 0, Math.PI * 2);
    vactx.fill();
    // Inner Hollow
    vactx.fillStyle = '#0f172a';
    vactx.beginPath();
    vactx.arc(16, 16, 6, 0, Math.PI * 2);
    vactx.fill();
    // Brass Spokes
    vactx.fillStyle = '#fbbf24';
    vactx.fillRect(14, 7, 4, 18);
    vactx.fillRect(7, 14, 18, 4);
    this.cache.set('item_valve', valve.canvas);

    // 5. Miracle Vaccine (백신) - Golden / Cyan Cure Syringe Flask
    const vaccine = this.createCanvas(T, T);
    const vctx = vaccine.ctx;
    // Ground Shadow
    vctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    vctx.beginPath();
    vctx.ellipse(16, 28, 10, 3, 0, 0, Math.PI * 2);
    vctx.fill();
    // Glass tube
    vctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    vctx.fillRect(7, 9, 18, 14);
    // Golden cure fluid
    vctx.fillStyle = '#06b6d4';
    vctx.fillRect(9, 11, 14, 10);
    vctx.fillStyle = '#38bdf8';
    vctx.fillRect(9, 11, 14, 3);
    // Needle tip
    vctx.fillStyle = '#cbd5e1';
    vctx.fillRect(25, 15, 6, 2);
    // Plunger
    vctx.fillStyle = '#f59e0b';
    vctx.fillRect(3, 12, 4, 8);
    // Golden Glow border
    vctx.strokeStyle = '#fbbf24';
    vctx.lineWidth = 1.5;
    vctx.strokeRect(6, 8, 20, 16);
    this.cache.set('item_vaccine', vaccine.canvas);
  }

  // 5. Environment & Obstacle Tiles
  generateTileSprites() {
    const T = CONFIG.TILE_SIZE;

    // Floor tiles: Wood, Grass, Concrete, Modern Asphalt Road, High-Tech Lab, Dirt, Sidewalk
    this.cache.set('tile_wood', this.createWoodTile(T));
    this.cache.set('tile_grass', this.createGrassTile(T));
    this.cache.set('tile_road', this.createModernRoadTile(T));
    this.cache.set('tile_concrete', this.createConcreteTile(T));
    this.cache.set('tile_sidewalk', this.createSidewalkTile(T));
    this.cache.set('tile_lab', this.createHighTechLabTile(T));
    this.cache.set('tile_dirt', this.createDirtTile(T));

    // Obstacle tiles (1-tile jumpable & solid)
    this.cache.set('obstacle_fence', this.createFenceObstacle(T));
    this.cache.set('obstacle_hedge', this.createHedgeObstacle(T));
    this.cache.set('obstacle_crate', this.createCrateObstacle(T));
    this.cache.set('obstacle_barricade', this.createBarricadeObstacle(T));
    this.cache.set('obstacle_lab_console', this.createLabConsoleObstacle(T));
    this.cache.set('obstacle_rock', this.createRockObstacle(T));

    // Multi-tile Props & High-Rise Buildings
    this.cache.set('multi_tree', this.createTreeSprite(T * 2, T * 2));
    this.cache.set('multi_car', this.createCarSprite(T * 2, T));
    this.cache.set('multi_police_car', this.createPoliceCarSprite(T * 2, T));
    this.cache.set('multi_house', this.createModernHouseSprite(T * 3, T * 3));
    this.cache.set('multi_skyscraper', this.createSkyscraperSprite(T * 4, T * 6));
    this.cache.set('multi_biotube', this.createBioTubeSprite(T, T * 2));
    this.cache.set('multi_server', this.createCyberServerSprite(T * 2, T * 2));
  }

  createWoodTile(T) {
    const { canvas, ctx } = this.createCanvas(T, T);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, T, T);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(1, 1, T - 2, 6);
    ctx.fillRect(1, 8, T - 2, 6);
    ctx.fillRect(1, 16, T - 2, 6);
    ctx.fillRect(1, 24, T - 2, 6);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, 7, T, 1);
    ctx.fillRect(0, 15, T, 1);
    ctx.fillRect(0, 23, T, 1);
    return canvas;
  }

  createGrassTile(T) {
    const { canvas, ctx } = this.createCanvas(T, T);
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, T, T);
    ctx.fillStyle = '#166534';
    ctx.fillRect(4, 6, 2, 5);
    ctx.fillRect(18, 14, 2, 5);
    ctx.fillRect(24, 22, 2, 5);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(12, 18, 3, 4);
    ctx.fillRect(6, 26, 3, 4);
    ctx.fillStyle = '#14532d';
    ctx.fillRect(20, 4, 2, 2);
    return canvas;
  }

  createModernRoadTile(T) {
    const { canvas, ctx } = this.createCanvas(T, T);
    // Dark textured asphalt
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, T, T);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, T, 1);
    ctx.fillRect(0, T - 1, T, 1);
    // Asphalt grain
    ctx.fillStyle = '#334155';
    ctx.fillRect(6, 8, 2, 2);
    ctx.fillRect(22, 20, 2, 2);
    ctx.fillRect(14, 26, 2, 2);
    // Yellow lane marker edge
    ctx.fillStyle = '#eab308';
    ctx.fillRect(0, 1, T, 2);
    ctx.fillRect(0, T - 3, T, 2);
    // White dashed center line
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 15, 12, 2);
    return canvas;
  }

  createSidewalkTile(T) {
    const { canvas, ctx } = this.createCanvas(T, T);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, T, T);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, 14, 14);
    ctx.strokeRect(17, 1, 14, 14);
    ctx.strokeRect(1, 17, 14, 14);
    ctx.strokeRect(17, 17, 14, 14);
    return canvas;
  }

  createConcreteTile(T) {
    const { canvas, ctx } = this.createCanvas(T, T);
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, T, T);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, T - 1, T - 1);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(4, 4, 3, 3);
    ctx.fillRect(20, 18, 3, 3);
    return canvas;
  }

  createHighTechLabTile(T) {
    const { canvas, ctx } = this.createCanvas(T, T);
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, T, T);
    // Metal grid frame
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, T - 2, T - 2);
    // Glowing Cyan circuit trace
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(2, 2, 3, 3);
    ctx.fillRect(T - 5, T - 5, 3, 3);
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
    ctx.beginPath();
    ctx.moveTo(3, 3); ctx.lineTo(16, 3); ctx.lineTo(16, 16); ctx.lineTo(29, 29);
    ctx.stroke();
    return canvas;
  }

  createDirtTile(T) {
    const { canvas, ctx } = this.createCanvas(T, T);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, 0, T, T);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(4, 6, 4, 3);
    ctx.fillRect(18, 18, 4, 3);
    ctx.fillStyle = '#291102';
    ctx.fillRect(12, 24, 2, 2);
    return canvas;
  }

  // 1-Tile Obstacles
  createFenceObstacle(T) {
    const { canvas, ctx } = this.createCanvas(T, T);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(2, 10, T - 4, 4);
    ctx.fillRect(2, 20, T - 4, 4);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(6, 4, 4, 26);
    ctx.fillRect(22, 4, 4, 26);
    // Wire mesh
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeRect(4, 8, T - 8, 16);
    return canvas;
  }

  createHedgeObstacle(T) {
    const { canvas, ctx } = this.createCanvas(T, T);
    ctx.fillStyle = '#14532d';
    ctx.fillRect(2, 4, T - 4, T - 8);
    ctx.fillStyle = '#166534';
    ctx.fillRect(4, 6, T - 8, T - 12);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(8, 8, 4, 4);
    ctx.fillRect(18, 14, 4, 4);
    return canvas;
  }

  createCrateObstacle(T) {
    const { canvas, ctx } = this.createCanvas(T, T);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(2, 2, T - 4, T - 4);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(4, 4, T - 8, T - 8);
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;
    ctx.strokeRect(3, 3, T - 6, T - 6);
    return canvas;
  }

  createBarricadeObstacle(T) {
    const { canvas, ctx } = this.createCanvas(T, T);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(2, 6, T - 4, 20);
    ctx.fillStyle = '#0f172a';
    // Diagonal hazard stripes
    ctx.beginPath();
    ctx.moveTo(6, 6); ctx.lineTo(12, 6); ctx.lineTo(6, 26); ctx.fill();
    ctx.moveTo(18, 6); ctx.lineTo(24, 6); ctx.lineTo(18, 26); ctx.fill();
    return canvas;
  }

  createLabConsoleObstacle(T) {
    const { canvas, ctx } = this.createCanvas(T, T);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(2, 4, T - 4, T - 8);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(6, 8, T - 12, 10);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(8, 20, 4, 3);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(16, 20, 4, 3);
    return canvas;
  }

  createRockObstacle(T) {
    const { canvas, ctx } = this.createCanvas(T, T);
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.ellipse(T/2, T/2, 12, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.ellipse(T/2 + 2, T/2 + 2, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    return canvas;
  }

  // Multi-Tile Detailed Structures
  createTreeSprite(w, h) {
    const { canvas, ctx } = this.createCanvas(w, h);
    // Tree trunk
    ctx.fillStyle = '#451a03';
    ctx.fillRect(w/2 - 6, h - 26, 12, 26);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(w/2 - 4, h - 24, 8, 24);
    // Lush layered canopy
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.arc(w/2, h/2 - 6, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(w/2 - 6, h/2 - 10, 18, 0, Math.PI * 2);
    ctx.arc(w/2 + 6, h/2 - 6, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(w/2 - 4, h/2 - 12, 8, 0, Math.PI * 2);
    ctx.fill();
    return canvas;
  }

  createCarSprite(w, h) {
    const { canvas, ctx } = this.createCanvas(w, h);
    // Abandoned civilian sedan
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(2, h - 4, w - 4, 4);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(4, 6, w - 8, h - 10);
    // Glass windshield & windows
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(16, 8, 14, h - 14);
    ctx.fillRect(34, 8, 14, h - 14);
    // Headlights
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(w - 6, 8, 2, 4);
    ctx.fillRect(w - 6, h - 12, 2, 4);
    // Tires
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(8, 2, 8, 4);
    ctx.fillRect(w - 16, 2, 8, 4);
    ctx.fillRect(8, h - 6, 8, 4);
    ctx.fillRect(w - 16, h - 6, 8, 4);
    return canvas;
  }

  createPoliceCarSprite(w, h) {
    const { canvas, ctx } = this.createCanvas(w, h);
    // Police cruiser
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(4, 6, w - 8, h - 10);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(14, 6, 28, h - 10);
    // Windows
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(18, 8, 10, h - 14);
    ctx.fillRect(30, 8, 10, h - 14);
    // Siren light bar (Red & Blue)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(26, 4, 4, 3);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(30, 4, 4, 3);
    // Tires
    ctx.fillStyle = '#000000';
    ctx.fillRect(8, 2, 8, 4);
    ctx.fillRect(w - 16, 2, 8, 4);
    ctx.fillRect(8, h - 6, 8, 4);
    ctx.fillRect(w - 16, h - 6, 8, 4);
    return canvas;
  }

  createModernHouseSprite(w, h) {
    const { canvas, ctx } = this.createCanvas(w, h);
    // Brick house base
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(6, 26, w - 12, h - 30);
    // Gabled Roof
    ctx.fillStyle = '#450a0a';
    ctx.beginPath();
    ctx.moveTo(w/2, 4);
    ctx.lineTo(2, 30);
    ctx.lineTo(w - 2, 30);
    ctx.closePath();
    ctx.fill();
    // Chimney
    ctx.fillStyle = '#78350f';
    ctx.fillRect(w - 22, 6, 8, 16);
    // Wooden Door
    ctx.fillStyle = '#78350f';
    ctx.fillRect(w/2 - 10, h - 28, 20, 24);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(w/2 + 4, h - 16, 3, 3); // doorknob
    // Windows with warm light
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(12, 36, 16, 16);
    ctx.fillRect(w - 28, 36, 16, 16);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.strokeRect(12, 36, 16, 16);
    ctx.strokeRect(w - 28, 36, 16, 16);
    return canvas;
  }

  createSkyscraperSprite(w, h) {
    const { canvas, ctx } = this.createCanvas(w, h);
    // High-rise glass & steel skyscraper (4 tiles x 6 tiles = 128 x 192 px)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(4, 10, w - 8, h - 14);

    // Rooftop Helipad & Antenna
    ctx.fillStyle = '#334155';
    ctx.fillRect(16, 4, w - 32, 6);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w/2, 4); ctx.lineTo(w/2, -8);
    ctx.stroke();

    // Blue Glass Window Grid
    const cols = 5;
    const rows = 9;
    const winW = 16;
    const winH = 12;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const wx = 12 + c * 22;
        const wy = 18 + r * 18;
        ctx.fillStyle = (r + c) % 3 === 0 ? '#38bdf8' : ((r + c) % 5 === 0 ? '#0284c7' : '#1e3a8a');
        ctx.fillRect(wx, wy, winW, winH);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(wx + 1, wy + 1, winW - 2, 2);
      }
    }

    // Neon Cyber Sign on facade
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.fillRect(20, h - 30, w - 40, 14);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('METRO BIO-CORP', w/2, h - 20);

    return canvas;
  }

  createBioTubeSprite(w, h) {
    const { canvas, ctx } = this.createCanvas(w, h);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(2, 2, w - 4, 8);
    ctx.fillRect(2, h - 10, w - 4, 8);
    ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
    ctx.fillRect(4, 10, w - 8, h - 20);
    // Green bio-fluid bubbles
    ctx.fillStyle = '#84cc16';
    ctx.fillRect(8, 18, 4, 4);
    ctx.fillRect(18, 34, 5, 5);
    ctx.fillRect(10, 48, 3, 3);
    ctx.strokeStyle = '#06b6d4';
    ctx.strokeRect(3, 9, w - 6, h - 18);
    return canvas;
  }

  createCyberServerSprite(w, h) {
    const { canvas, ctx } = this.createCanvas(w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(4, 4, w - 8, h - 8);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(4, 4, w - 8, h - 8);
    // Server blinking LEDs
    for (let r = 0; r < 4; r++) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(8, 8 + r * 14, w - 16, 10);
      ctx.fillStyle = r % 2 === 0 ? '#22c55e' : '#38bdf8';
      ctx.fillRect(12, 11 + r * 14, 4, 4);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(20, 11 + r * 14, 4, 4);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(28, 12 + r * 14, 24, 2);
    }
    return canvas;
  }

  get(name) {
    return this.cache.get(name) || null;
  }
}
