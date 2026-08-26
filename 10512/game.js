// CYBER STRIKE: 3D FPS & TOP-DOWN HYBRID SHOOTER BUNDLE
// Complete with Anti-Motion-Sickness (Top-Down, 3rd Person & 1st Person Modes)

(function () {
    'use strict';

    // -------------------------------------------------------------
    // 1. SOUND ENGINE (Web Audio API)
    // -------------------------------------------------------------
    class SoundEngine {
        constructor() {
            this.ctx = null;
            this.masterGain = null;
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

        playAssaultRifle() {
            if (!this.ctx) return;
            const t = this.ctx.currentTime;
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

        playShotgun() {
            if (!this.ctx) return;
            const t = this.ctx.currentTime;
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

        playSniper() {
            if (!this.ctx) return;
            const t = this.ctx.currentTime;
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

        playExplosion() {
            if (!this.ctx) return;
            const t = this.ctx.currentTime;
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

        playKillSound() {
            if (!this.ctx) return;
            const t = this.ctx.currentTime;
            const notes = [523.25, 659.25, 783.99, 1046.50];
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

        playReload() {
            if (!this.ctx) return;
            const t = this.ctx.currentTime;
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

        startCyberBGM() {
            if (this.bgmPlaying || !this.ctx) return;
            this.bgmPlaying = true;
            const chordNotes = [
                [130.81, 196.00, 246.94],
                [110.00, 164.81, 220.00],
                [87.31, 130.81, 174.61],
                [98.00, 146.83, 196.00]
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
    }
    const soundEngine = new SoundEngine();

    // -------------------------------------------------------------
    // 2. PHYSICS WORLD
    // -------------------------------------------------------------
    class PhysicsWorld {
        constructor() {
            this.colliders = [];
            this.jumpPads = [];
            this.gravity = -28.0;
        }

        addBoxCollider(min, max, type = 'solid') {
            this.colliders.push({ min: min.clone(), max: max.clone(), type: type });
        }

        addJumpPad(center, size, force = 22.0) {
            this.jumpPads.push({
                center: center.clone(),
                size: size.clone(),
                force: force,
                min: new THREE.Vector3(center.x - size.x / 2, center.y - size.y / 2, center.z - size.z / 2),
                max: new THREE.Vector3(center.x + size.x / 2, center.y + size.y / 2, center.z + size.z / 2)
            });
        }

        checkAABBCollision(boxA, boxB) {
            return (
                boxA.min.x <= boxB.max.x && boxA.max.x >= boxB.min.x &&
                boxA.min.y <= boxB.max.y && boxA.max.y >= boxB.min.y &&
                boxA.min.z <= boxB.max.z && boxA.max.z >= boxB.min.z
            );
        }

        moveEntity(position, velocity, radius, height, dt) {
            let isGrounded = false;
            velocity.y += this.gravity * dt;

            // Y 축
            const newPosY = position.y + velocity.y * dt;
            let finalY = newPosY;
            const bodyBoxY = {
                min: new THREE.Vector3(position.x - radius, newPosY, position.z - radius),
                max: new THREE.Vector3(position.x + radius, newPosY + height, position.z + radius)
            };

            if (finalY <= 0) {
                finalY = 0; velocity.y = 0; isGrounded = true;
            }

            for (const col of this.colliders) {
                if (this.checkAABBCollision(bodyBoxY, col)) {
                    if (velocity.y < 0 && position.y >= col.max.y - 0.2) {
                        finalY = col.max.y; velocity.y = 0; isGrounded = true;
                    } else if (velocity.y > 0 && position.y + height <= col.min.y + 0.2) {
                        finalY = col.min.y - height; velocity.y = 0;
                    }
                }
            }
            position.y = finalY;

            // X 축
            const newPosX = position.x + velocity.x * dt;
            let finalX = newPosX;
            const bodyBoxX = {
                min: new THREE.Vector3(newPosX - radius, position.y + 0.1, position.z - radius),
                max: new THREE.Vector3(newPosX + radius, position.y + height - 0.1, position.z + radius)
            };

            for (const col of this.colliders) {
                if (this.checkAABBCollision(bodyBoxX, col)) {
                    if (velocity.x > 0) finalX = col.min.x - radius - 0.001;
                    else if (velocity.x < 0) finalX = col.max.x + radius + 0.001;
                    velocity.x = 0;
                    break;
                }
            }
            position.x = finalX;

            // Z 축
            const newPosZ = position.z + velocity.z * dt;
            let finalZ = newPosZ;
            const bodyBoxZ = {
                min: new THREE.Vector3(position.x - radius, position.y + 0.1, newPosZ - radius),
                max: new THREE.Vector3(position.x + radius, position.y + height - 0.1, newPosZ + radius)
            };

            for (const col of this.colliders) {
                if (this.checkAABBCollision(bodyBoxZ, col)) {
                    if (velocity.z > 0) finalZ = col.min.z - radius - 0.001;
                    else if (velocity.z < 0) finalZ = col.max.z + radius + 0.001;
                    velocity.z = 0;
                    break;
                }
            }
            position.z = finalZ;

            // 점프 패드
            const footBox = {
                min: new THREE.Vector3(position.x - radius, position.y, position.z - radius),
                max: new THREE.Vector3(position.x + radius, position.y + 0.5, position.z + radius)
            };

            let hitJumpPad = false;
            for (const pad of this.jumpPads) {
                if (this.checkAABBCollision(footBox, pad)) {
                    velocity.y = pad.force;
                    hitJumpPad = true;
                    break;
                }
            }

            return { isGrounded, hitJumpPad };
        }

        raycastMap(origin, direction, maxDist = 100) {
            let nearestDist = maxDist;
            let hitPoint = null;
            const ray = new THREE.Ray(origin, direction.clone().normalize());

            for (const col of this.colliders) {
                const box = new THREE.Box3(col.min, col.max);
                const intersectPoint = new THREE.Vector3();
                if (ray.intersectBox(box, intersectPoint)) {
                    const dist = origin.distanceTo(intersectPoint);
                    if (dist < nearestDist) {
                        nearestDist = dist; hitPoint = intersectPoint;
                    }
                }
            }

            const targetPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
            const planeIntersect = new THREE.Vector3();
            if (ray.intersectPlane(targetPlane, planeIntersect)) {
                const dist = origin.distanceTo(planeIntersect);
                if (dist > 0 && dist < nearestDist) {
                    nearestDist = dist; hitPoint = planeIntersect;
                }
            }

            return { hit: hitPoint !== null, distance: nearestDist, point: hitPoint };
        }
    }
    const physicsWorld = new PhysicsWorld();

    // -------------------------------------------------------------
    // 3. RENDERER & PARTICLES
    // -------------------------------------------------------------
    class GameRenderer {
        constructor() {
            this.container = document.getElementById('game-container');
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
            this.particles = [];
            this.init();
        }

        init() {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.container.appendChild(this.renderer.domElement);

            // 밝고 선명한 사이버 아레나 배경 & 옅은 안개
            this.scene.background = new THREE.Color(0x121e33);
            this.scene.fog = new THREE.FogExp2(0x121e33, 0.007);
            this.scene.add(this.camera);

            // 전체 환경광 대폭 강화 (어두운 곳 없이 쾌적한 시야 확보)
            const ambientLight = new THREE.AmbientLight(0x406085, 2.2);
            this.scene.add(ambientLight);

            // 주 조명 (태양광/아레나 스포트라이트)
            const dirLight = new THREE.DirectionalLight(0xaad0ff, 1.8);
            dirLight.position.set(40, 70, 30);
            dirLight.castShadow = true;
            dirLight.shadow.mapSize.width = 1024;
            dirLight.shadow.mapSize.height = 1024;
            this.scene.add(dirLight);

            const light1 = new THREE.PointLight(0x00f0ff, 3.5, 45);
            light1.position.set(-20, 10, -20);
            this.scene.add(light1);

            const light2 = new THREE.PointLight(0xff0066, 3.5, 45);
            light2.position.set(20, 10, 20);
            this.scene.add(light2);

            const lightCenter = new THREE.PointLight(0xffe600, 4.0, 50);
            lightCenter.position.set(0, 14, 0);
            this.scene.add(lightCenter);

            window.addEventListener('resize', () => {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            });
        }

        createHitSparks(position, color = 0x00f0ff, count = 8) {
            const pGeo = new THREE.BufferGeometry();
            const positions = [];
            const velocities = [];
            for (let i = 0; i < count; i++) {
                positions.push(position.x, position.y, position.z);
                velocities.push((Math.random() - 0.5) * 8, Math.random() * 8 + 2, (Math.random() - 0.5) * 8);
            }
            pGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            const pMat = new THREE.PointsMaterial({
                color: color,
                size: 0.15,
                transparent: true,
                opacity: 1.0,
                blending: THREE.AdditiveBlending
            });
            const pSystem = new THREE.Points(pGeo, pMat);
            this.scene.add(pSystem);
            this.particles.push({ mesh: pSystem, velocities: velocities, life: 0.4, maxLife: 0.4 });
        }

        createExplosion(position, radius = 5.0) {
            const sphereGeo = new THREE.SphereGeometry(0.5, 16, 16);
            const sphereMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.9, wireframe: true });
            const sphere = new THREE.Mesh(sphereGeo, sphereMat);
            sphere.position.copy(position);
            this.scene.add(sphere);

            this.createHitSparks(position, 0xff3300, 25);
            this.createHitSparks(position, 0xffe600, 15);

            const expLight = new THREE.PointLight(0xff6600, 8.0, 25);
            expLight.position.copy(position);
            this.scene.add(expLight);

            this.particles.push({
                mesh: sphere,
                light: expLight,
                isExplosionSphere: true,
                maxScale: radius * 1.8,
                life: 0.5,
                maxLife: 0.5
            });
        }

        updateParticles(dt) {
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.life -= dt;
                if (p.isExplosionSphere) {
                    const progress = 1 - (p.life / p.maxLife);
                    const currentScale = 0.5 + progress * p.maxScale;
                    p.mesh.scale.set(currentScale, currentScale, currentScale);
                    p.mesh.material.opacity = (p.life / p.maxLife) * 0.9;
                    if (p.light) p.light.intensity = (p.life / p.maxLife) * 8.0;
                    if (p.life <= 0) {
                        this.scene.remove(p.mesh);
                        if (p.light) this.scene.remove(p.light);
                        this.particles.splice(i, 1);
                    }
                } else {
                    const positions = p.mesh.geometry.attributes.position.array;
                    for (let j = 0; j < positions.length; j += 3) {
                        positions[j] += p.velocities[j] * dt;
                        positions[j + 1] += p.velocities[j + 1] * dt;
                        positions[j + 2] += p.velocities[j + 2] * dt;
                        p.velocities[j + 1] -= 18.0 * dt;
                    }
                    p.mesh.geometry.attributes.position.needsUpdate = true;
                    p.mesh.material.opacity = p.life / p.maxLife;
                    if (p.life <= 0) {
                        this.scene.remove(p.mesh);
                        this.particles.splice(i, 1);
                    }
                }
            }
        }

        render() {
            this.renderer.render(this.scene, this.camera);
        }
    }
    const gameRenderer = new GameRenderer();

    // -------------------------------------------------------------
    // 4. MAP & ARENA
    // -------------------------------------------------------------
    class ArenaMap {
        constructor(scene) {
            this.scene = scene;
            this.mapSize = 70;
            this.spawnPoints = [];
        }

        createGridTexture(lineColor = '#00f0ff', bgColor = '#0b1320') {
            const canvas = document.createElement('canvas');
            canvas.width = 512; canvas.height = 512;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = bgColor; ctx.fillRect(0, 0, 512, 512);
            ctx.strokeStyle = lineColor; ctx.lineWidth = 4; ctx.strokeRect(0, 0, 512, 512);
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)'; ctx.lineWidth = 2;
            for (let x = 0; x <= 512; x += 64) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
            }
            for (let y = 0; y <= 512; y += 64) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
            }
            const tex = new THREE.CanvasTexture(canvas);
            tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
            return tex;
        }

        build() {
            const floorTex = this.createGridTexture('#00d8ff', '#080e18');
            floorTex.repeat.set(16, 16);
            const floorGeo = new THREE.PlaneGeometry(this.mapSize, this.mapSize);
            const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.3, metalness: 0.6 });
            const floor = new THREE.Mesh(floorGeo, floorMat);
            floor.rotation.x = -Math.PI / 2;
            floor.receiveShadow = true;
            this.scene.add(floor);

            const wallHeight = 10;
            const halfSize = this.mapSize / 2;
            const wallMat = new THREE.MeshStandardMaterial({ color: 0x141d2b, roughness: 0.4, metalness: 0.5 });
            const walls = [
                { pos: [0, wallHeight / 2, -halfSize], size: [this.mapSize, wallHeight, 1] },
                { pos: [0, wallHeight / 2, halfSize], size: [this.mapSize, wallHeight, 1] },
                { pos: [halfSize, wallHeight / 2, 0], size: [1, wallHeight, this.mapSize] },
                { pos: [-halfSize, wallHeight / 2, 0], size: [1, wallHeight, this.mapSize] }
            ];

            walls.forEach(w => {
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(w.size[0], w.size[1], w.size[2]), wallMat);
                mesh.position.set(w.pos[0], w.pos[1], w.pos[2]);
                this.scene.add(mesh);
                physicsWorld.addBoxCollider(
                    new THREE.Vector3(w.pos[0] - w.size[0]/2, w.pos[1] - w.size[1]/2, w.pos[2] - w.size[2]/2),
                    new THREE.Vector3(w.pos[0] + w.size[0]/2, w.pos[1] + w.size[1]/2, w.pos[2] + w.size[2]/2)
                );
            });

            this.createPlatform(0, 5, -24, 28, 0.8, 8);
            this.createPlatform(0, 5, 24, 28, 0.8, 8);
            this.createPlatform(-24, 5, 0, 8, 0.8, 28);
            this.createPlatform(24, 5, 0, 8, 0.8, 28);

            this.createObstacle(0, 2, 0, 6, 4, 6, 0xff0055);
            const covers = [
                [-10, 1.2, -10, 3, 2.4, 3], [10, 1.2, -10, 3, 2.4, 3],
                [-10, 1.2, 10, 3, 2.4, 3], [10, 1.2, 10, 3, 2.4, 3],
                [-18, 1.2, 0, 4, 2.4, 1.5], [18, 1.2, 0, 4, 2.4, 1.5],
                [0, 1.2, -14, 5, 2.4, 1.5], [0, 1.2, 14, 5, 2.4, 1.5]
            ];
            covers.forEach(c => this.createObstacle(c[0], c[1], c[2], c[3], c[4], c[5], 0x00f0ff));

            this.createJumpPadMesh(new THREE.Vector3(-14, 0.1, -14));
            this.createJumpPadMesh(new THREE.Vector3(14, 0.1, -14));
            this.createJumpPadMesh(new THREE.Vector3(-14, 0.1, 14));
            this.createJumpPadMesh(new THREE.Vector3(14, 0.1, 14));
            this.createJumpPadMesh(new THREE.Vector3(0, 4.1, 0), 25.0);

            this.spawnPoints = [
                new THREE.Vector3(-22, 1.5, -22), new THREE.Vector3(22, 1.5, -22),
                new THREE.Vector3(-22, 1.5, 22), new THREE.Vector3(22, 1.5, 22),
                new THREE.Vector3(0, 6.5, -24), new THREE.Vector3(0, 6.5, 24),
                new THREE.Vector3(-24, 6.5, 0), new THREE.Vector3(24, 6.5, 0),
                new THREE.Vector3(-12, 1.5, 0), new THREE.Vector3(12, 1.5, 0)
            ];
        }

        createPlatform(x, y, z, w, h, d) {
            const plat = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: 0x1a2638, metalness: 0.7 }));
            plat.position.set(x, y, z);
            this.scene.add(plat);

            const edge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.2, d + 0.1), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
            edge.position.set(x, y + h/2, z);
            this.scene.add(edge);

            physicsWorld.addBoxCollider(new THREE.Vector3(x - w/2, y - h/2, z - d/2), new THREE.Vector3(x + w/2, y + h/2, z + d/2));
        }

        createObstacle(x, y, z, w, h, d, glowColor = 0x00f0ff) {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: 0x121b28, metalness: 0.6 }));
            mesh.position.set(x, y, z);
            this.scene.add(mesh);

            const wire = new THREE.Mesh(new THREE.BoxGeometry(w + 0.05, 0.1, d + 0.05), new THREE.MeshBasicMaterial({ color: glowColor }));
            wire.position.set(x, y, z);
            this.scene.add(wire);

            physicsWorld.addBoxCollider(new THREE.Vector3(x - w/2, y - h/2, z - d/2), new THREE.Vector3(x + w/2, y + h/2, z + d/2));
        }

        createJumpPadMesh(position, force = 21.0) {
            const padBase = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 0.2, 16), new THREE.MeshStandardMaterial({ color: 0x0a1018, metalness: 0.8 }));
            padBase.position.copy(position);
            this.scene.add(padBase);

            const ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 1.3, 16), new THREE.MeshBasicMaterial({ color: 0xffe600, side: THREE.DoubleSide }));
            ring.rotation.x = -Math.PI / 2;
            ring.position.set(position.x, position.y + 0.12, position.z);
            this.scene.add(ring);

            physicsWorld.addJumpPad(position, new THREE.Vector3(3.0, 1.0, 3.0), force);
        }

        getRandomSpawnPoint() {
            const pt = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
            return pt.clone().add(new THREE.Vector3((Math.random()-0.5)*2, 0, (Math.random()-0.5)*2));
        }
    }

    // -------------------------------------------------------------
    // 5. PICKUP ITEMS
    // -------------------------------------------------------------
    class PickupManager {
        constructor(scene) {
            this.scene = scene;
            this.items = [];
        }

        init() {
            const spawnLocations = [
                { pos: new THREE.Vector3(0, 5.8, -24), type: 'health' },
                { pos: new THREE.Vector3(0, 5.8, 24), type: 'shield' },
                { pos: new THREE.Vector3(-24, 5.8, 0), type: 'ammo' },
                { pos: new THREE.Vector3(24, 5.8, 0), type: 'health' },
                { pos: new THREE.Vector3(-14, 1.2, 0), type: 'shield' },
                { pos: new THREE.Vector3(14, 1.2, 0), type: 'ammo' },
                { pos: new THREE.Vector3(0, 1.2, -8), type: 'health' },
                { pos: new THREE.Vector3(0, 1.2, 8), type: 'shield' }
            ];
            spawnLocations.forEach(loc => this.createPickup(loc.pos, loc.type));
        }

        createPickup(pos, type) {
            const group = new THREE.Group();
            group.position.copy(pos);

            let color = type === 'health' ? 0x00ff66 : (type === 'shield' ? 0x00c3ff : 0xffe600);
            let geometry = type === 'health' ? new THREE.BoxGeometry(0.8, 0.8, 0.8) : (type === 'shield' ? new THREE.OctahedronGeometry(0.6) : new THREE.BoxGeometry(1.0, 0.6, 0.7));

            const material = new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.5, metalness: 0.8 });
            const mesh = new THREE.Mesh(geometry, material);
            group.add(mesh);

            const light = new THREE.PointLight(color, 1.5, 4);
            light.position.set(0, 0.2, 0);
            group.add(light);

            this.scene.add(group);
            this.items.push({
                group: group,
                type: type,
                baseY: pos.y,
                active: true,
                respawnTimer: 0,
                respawnDuration: 15.0
            });
        }

        update(dt, player, bots = []) {
            this.items.forEach(item => {
                if (item.active) {
                    item.group.rotation.y += 1.8 * dt;
                    item.group.position.y = item.baseY + Math.sin(Date.now() * 0.003) * 0.15;

                    if (item.group.position.distanceTo(player.position) < 1.8) {
                        this.consumeItem(item, player, true);
                    }
                    if (item.active) {
                        for (const bot of bots) {
                            if (bot.isAlive && item.group.position.distanceTo(bot.position) < 1.8) {
                                this.consumeItem(item, bot, false);
                                break;
                            }
                        }
                    }
                } else {
                    item.respawnTimer -= dt;
                    if (item.respawnTimer <= 0) {
                        item.active = true;
                        item.group.visible = true;
                    }
                }
            });
        }

        consumeItem(item, entity, isPlayer) {
            let applied = false;
            if (item.type === 'health') {
                if (entity.hp < entity.maxHp) {
                    entity.hp = Math.min(entity.maxHp, entity.hp + 50);
                    applied = true;
                }
            } else if (item.type === 'shield') {
                if (entity.shield < entity.maxShield) {
                    entity.shield = Math.min(entity.maxShield, entity.shield + 50);
                    applied = true;
                }
            } else if (item.type === 'ammo') {
                if (entity.weapons) {
                    entity.weapons.forEach(w => w.refillAmmo());
                    applied = true;
                }
            }

            if (applied) {
                item.active = false;
                item.group.visible = false;
                item.respawnTimer = item.respawnDuration;
                if (isPlayer) {
                    soundEngine.playPickup(item.type);
                    if (window.hudManager) {
                        window.hudManager.showInteractionMessage(
                            item.type === 'health' ? '+50 HEALTH RECOVERED' :
                            item.type === 'shield' ? '+50 SHIELD CHARGED' : 'AMMO RESUPPLIED'
                        );
                        if (item.type === 'health' || item.type === 'shield') {
                            window.hudManager.triggerHealVignette();
                        }
                    }
                }
            }
        }
    }

    // -------------------------------------------------------------
    // 6. WEAPONS & ARSENAL (Rich Cyberpunk 3D Models)
    // -------------------------------------------------------------
    class Weapon {
        constructor(config, camera) {
            this.name = config.name;
            this.type = config.type;
            this.damage = config.damage;
            this.fireRate = config.fireRate;
            this.clipSize = config.clipSize;
            this.currentClip = config.clipSize;
            this.maxReserve = config.maxReserve;
            this.reserveAmmo = config.maxReserve;
            this.reloadTime = config.reloadTime;
            this.recoilStrength = config.recoilStrength;
            this.spread = config.spread;
            this.pellets = config.pellets || 1;
            this.isScoped = false;

            this.camera = camera;
            this.lastShotTime = 0;
            this.isReloading = false;
            this.reloadTimer = 0;

            // 1인칭 뷰모델 생성 (눈앞에 확실하게 보이도록 위치 및 크기 최적화)
            this.viewModel = this.createViewModel(config.modelType, config.themeColor);
            this.initialPos = new THREE.Vector3(0.24, -0.22, -0.42);
            this.initialRot = new THREE.Euler(0, 0, 0);
            this.viewModel.position.copy(this.initialPos);
            this.viewModel.scale.set(1.3, 1.3, 1.3); // 큼직하고 시원하게 확대!
            this.camera.add(this.viewModel);

            // 총구 화염 및 라이트
            this.muzzleLight = new THREE.PointLight(config.themeColor, 0, 8);
            this.muzzleLight.position.set(0, 0.05, -0.6);
            this.viewModel.add(this.muzzleLight);
            this.muzzleFlashTimer = 0;

            this.recoilOffset = new THREE.Vector3();
            this.recoilRot = new THREE.Vector3();
        }

        createViewModel(modelType, themeColor) {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({
                color: 0x18202c,
                metalness: 0.85,
                roughness: 0.2
            });
            const darkMat = new THREE.MeshStandardMaterial({
                color: 0x0a0f16,
                metalness: 0.9,
                roughness: 0.3
            });
            const neonMat = new THREE.MeshBasicMaterial({ color: themeColor });
            const glowMat = new THREE.MeshStandardMaterial({
                color: themeColor,
                emissive: themeColor,
                emissiveIntensity: 0.8
            });

            if (modelType === 'rifle') {
                // 🔹 ASSAULT RIFLE: 날렵한 사이버 소총
                const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.45), bodyMat);
                const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.35, 12), darkMat);
                barrel.rotation.x = Math.PI / 2;
                barrel.position.set(0, 0.02, -0.36);

                const mag = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.09), darkMat);
                mag.position.set(0, -0.11, -0.04);

                const stock = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, 0.16), bodyMat);
                stock.position.set(0, -0.01, 0.26);

                const neonStrip = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.015, 0.38), glowMat);
                neonStrip.position.set(0, 0.065, -0.02);

                const sight = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.08), neonMat);
                sight.position.set(0, 0.085, -0.12);

                group.add(body, barrel, mag, stock, neonStrip, sight);
            } else if (modelType === 'shotgun') {
                // 🔹 COMBAT SHOTGUN: 묵직한 중화력 더블 배럴 샷건
                const body = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.14, 0.42), bodyMat);
                const barrel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.38, 12), darkMat);
                barrel1.rotation.x = Math.PI / 2;
                barrel1.position.set(-0.026, 0.03, -0.32);

                const barrel2 = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.38, 12), darkMat);
                barrel2.rotation.x = Math.PI / 2;
                barrel2.position.set(0.026, 0.03, -0.32);

                const pump = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.15), glowMat);
                pump.position.set(0, -0.03, -0.2);

                const heavyStock = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.18), darkMat);
                heavyStock.position.set(0, -0.02, 0.25);

                group.add(body, barrel1, barrel2, pump, heavyStock);
            } else if (modelType === 'sniper') {
                // 🔹 PLASMA SNIPER: 거대한 광학 스코프가 달린 장총열 저격총
                const body = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, 0.55), bodyMat);
                const longBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.6, 12), darkMat);
                longBarrel.rotation.x = Math.PI / 2;
                longBarrel.position.set(0, 0.02, -0.52);

                const scopeBody = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.28, 16), darkMat);
                scopeBody.rotation.x = Math.PI / 2;
                scopeBody.position.set(0, 0.11, -0.08);

                const scopeLens = new THREE.Mesh(new THREE.RingGeometry(0.02, 0.034, 16), glowMat);
                scopeLens.position.set(0, 0.11, 0.06);

                const bipod = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.15, 0.02), neonMat);
                bipod.position.set(0, -0.08, -0.45);

                group.add(body, longBarrel, scopeBody, scopeLens, bipod);
            } else {
                // 🔹 ROCKET LAUNCHER: 육중한 어깨 견착식 로켓포
                const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.75, 16), darkMat);
                tube.rotation.x = Math.PI / 2;

                const blastShield = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.06), bodyMat);
                blastShield.position.set(0, 0.05, -0.15);

                const energyCore = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.25, 12), glowMat);
                energyCore.rotation.x = Math.PI / 2;
                energyCore.position.set(0, 0, 0.1);

                const grip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.06), bodyMat);
                grip.position.set(0, -0.12, -0.05);

                group.add(tube, blastShield, energyCore, grip);
            }

            return group;
        }

        canShoot() {
            const now = performance.now() / 1000;
            return (now - this.lastShotTime >= this.fireRate) && (this.currentClip > 0) && !this.isReloading;
        }

        shoot() {
            if (!this.canShoot()) {
                if (this.currentClip === 0 && !this.isReloading) this.reload();
                return false;
            }
            this.lastShotTime = performance.now() / 1000;
            this.currentClip--;

            if (this.type === 'hitscan') soundEngine.playAssaultRifle();
            else if (this.type === 'shotgun') soundEngine.playShotgun();
            else if (this.type === 'sniper') soundEngine.playSniper();
            else if (this.type === 'projectile') soundEngine.playRocketLaunch();

            // 생생한 반동 킥백
            this.recoilOffset.z = 0.14 * this.recoilStrength;
            this.recoilOffset.y = 0.05 * this.recoilStrength;
            this.recoilRot.x = 0.18 * this.recoilStrength;

            this.muzzleLight.intensity = 5.0;
            this.muzzleFlashTimer = 0.06;
            return true;
        }

        reload() {
            if (this.isReloading || this.currentClip >= this.clipSize || this.reserveAmmo <= 0) return;
            this.isReloading = true;
            this.reloadTimer = this.reloadTime;
            soundEngine.playReload();
        }

        refillAmmo() {
            this.reserveAmmo = this.maxReserve;
            this.currentClip = this.clipSize;
            this.isReloading = false;
        }

        update(dt) {
            if (this.muzzleFlashTimer > 0) {
                this.muzzleFlashTimer -= dt;
                if (this.muzzleFlashTimer <= 0) this.muzzleLight.intensity = 0;
            }

            if (this.isReloading) {
                this.reloadTimer -= dt;
                this.viewModel.rotation.z = Math.sin((1 - this.reloadTimer / this.reloadTime) * Math.PI * 2) * 0.5;
                if (this.reloadTimer <= 0) {
                    const needed = this.clipSize - this.currentClip;
                    const toAdd = Math.min(needed, this.reserveAmmo);
                    this.currentClip += toAdd;
                    this.reserveAmmo -= toAdd;
                    this.isReloading = false;
                    this.viewModel.rotation.z = 0;
                }
            }

            this.recoilOffset.lerp(new THREE.Vector3(0, 0, 0), 14 * dt);
            this.recoilRot.lerp(new THREE.Vector3(0, 0, 0), 14 * dt);

            // 항상 화면상에 총기가 뚜렷하게 보이도록 위치 동기화
            let targetX = this.initialPos.x + this.recoilOffset.x;
            let targetY = this.initialPos.y + this.recoilOffset.y;
            let targetZ = this.initialPos.z + this.recoilOffset.z;

            if (this.isScoped) {
                targetX = 0; targetY = -0.12; targetZ = -0.32;
            }

            this.viewModel.position.set(targetX, targetY, targetZ);
            this.viewModel.rotation.x = this.initialRot.x + this.recoilRot.x;
            this.viewModel.visible = true; // 무조건 총기를 볼 수 있도록 보장!
        }

        setVisible(visible) {
            this.viewModel.visible = visible;
            if (!visible) {
                this.isScoped = false;
                this.isReloading = false;
            }
        }
    }

    function createArsenal(camera) {
        return [
            new Weapon({ name: 'ASSAULT RIFLE', type: 'hitscan', modelType: 'rifle', themeColor: 0x00f0ff, damage: 25, fireRate: 0.11, clipSize: 30, maxReserve: 180, reloadTime: 1.8, recoilStrength: 1.0, spread: 0.02 }, camera),
            new Weapon({ name: 'COMBAT SHOTGUN', type: 'shotgun', modelType: 'shotgun', themeColor: 0xff0055, damage: 16, fireRate: 0.75, clipSize: 8, maxReserve: 48, reloadTime: 2.2, recoilStrength: 2.2, spread: 0.07, pellets: 8 }, camera),
            new Weapon({ name: 'PLASMA SNIPER', type: 'sniper', modelType: 'sniper', themeColor: 0xffe600, damage: 105, fireRate: 1.1, clipSize: 5, maxReserve: 25, reloadTime: 2.5, recoilStrength: 2.8, spread: 0.001 }, camera),
            new Weapon({ name: 'ROCKET LAUNCHER', type: 'projectile', modelType: 'rocket', themeColor: 0xff6600, damage: 120, fireRate: 1.2, clipSize: 4, maxReserve: 16, reloadTime: 2.8, recoilStrength: 3.0, spread: 0.01 }, camera)
        ];
    }

    // -------------------------------------------------------------
    // 7. PROJECTILE MANAGER
    // -------------------------------------------------------------
    class ProjectileManager {
        constructor(scene) {
            this.scene = scene;
            this.tracers = [];
            this.rockets = [];
        }

        addTracer(start, end, color = 0x00f0ff) {
            const material = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.9 });
            const points = [start.clone(), end.clone()];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            this.scene.add(line);
            this.tracers.push({ mesh: line, life: 0.08, maxLife: 0.08 });
        }

        spawnRocket(origin, direction, shooter, damage = 120, splashRadius = 6.0) {
            const group = new THREE.Group();
            group.position.copy(origin);
            const rocketMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8), new THREE.MeshBasicMaterial({ color: 0xff6600 }));
            rocketMesh.rotation.x = Math.PI / 2;
            group.add(rocketMesh);
            const flameLight = new THREE.PointLight(0xffaa00, 3.0, 6);
            group.add(flameLight);
            group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), direction.clone().normalize());
            this.scene.add(group);

            this.rockets.push({
                group: group,
                direction: direction.clone().normalize(),
                speed: 45.0,
                shooter: shooter,
                damage: damage,
                splashRadius: splashRadius,
                life: 4.0
            });
        }

        update(dt, player, bots = [], onKillCallback) {
            for (let i = this.tracers.length - 1; i >= 0; i--) {
                const tr = this.tracers[i];
                tr.life -= dt;
                tr.mesh.material.opacity = (tr.life / tr.maxLife) * 0.9;
                if (tr.life <= 0) {
                    this.scene.remove(tr.mesh);
                    this.tracers.splice(i, 1);
                }
            }

            for (let i = this.rockets.length - 1; i >= 0; i--) {
                const r = this.rockets[i];
                r.life -= dt;
                const moveStep = r.direction.clone().multiplyScalar(r.speed * dt);
                const prevPos = r.group.position.clone();
                r.group.position.add(moveStep);

                const mapHit = physicsWorld.raycastMap(prevPos, r.direction, moveStep.length());
                let hasDetonated = mapHit.hit || r.life <= 0;
                let detonatePos = mapHit.hit ? mapHit.point : r.group.position;

                if (!hasDetonated) {
                    const allTargets = [player, ...bots];
                    for (const target of allTargets) {
                        if (target === r.shooter || !target.isAlive) continue;
                        if (r.group.position.distanceTo(target.position) < 1.2) {
                            hasDetonated = true;
                            detonatePos = r.group.position;
                            break;
                        }
                    }
                }

                if (hasDetonated) {
                    gameRenderer.createExplosion(detonatePos, r.splashRadius);
                    soundEngine.playExplosion();
                    this.applySplashDamage(detonatePos, r.splashRadius, r.damage, r.shooter, player, bots, onKillCallback);
                    this.scene.remove(r.group);
                    this.rockets.splice(i, 1);
                }
            }
        }

        applySplashDamage(center, radius, maxDamage, shooter, player, bots, onKillCallback) {
            const targets = [player, ...bots];
            targets.forEach(target => {
                if (!target.isAlive) return;
                const dist = center.distanceTo(target.position);
                if (dist <= radius) {
                    const falloff = 1 - (dist / radius);
                    const actualDmg = Math.round(maxDamage * falloff);
                    if (actualDmg > 0) {
                        const killed = target.takeDamage(actualDmg, shooter, false);
                        if (shooter === player && target !== player) {
                            soundEngine.playHitmark(false);
                            if (window.hudManager) {
                                window.hudManager.showHitmarker(false);
                                window.hudManager.showDamageNumber(actualDmg);
                            }
                        }
                        if (killed && onKillCallback) {
                            onKillCallback(shooter, target, 'ROCKET LAUNCHER', false);
                        }
                    }
                }
            });
        }

        processHitscan(origin, direction, range, damage, spread, pellets, shooter, player, bots, onKillCallback) {
            let anyHit = false;
            let anyHeadshot = false;
            let totalDamageDealt = 0;

            for (let p = 0; p < pellets; p++) {
                const spreadDir = direction.clone().add(new THREE.Vector3(
                    (Math.random() - 0.5) * spread,
                    (Math.random() - 0.5) * spread,
                    (Math.random() - 0.5) * spread
                )).normalize();

                const mapHit = physicsWorld.raycastMap(origin, spreadDir, range);
                let closestDist = mapHit.hit ? mapHit.distance : range;
                let hitTarget = null;
                let isHeadshot = false;

                const targets = [player, ...bots];
                const ray = new THREE.Ray(origin, spreadDir);

                for (const target of targets) {
                    if (target === shooter || !target.isAlive) continue;

                    const headBox = new THREE.Box3(
                        new THREE.Vector3(target.position.x - 0.35, target.position.y + 1.3, target.position.z - 0.35),
                        new THREE.Vector3(target.position.x + 0.35, target.position.y + 1.9, target.position.z + 0.35)
                    );
                    const bodyBox = new THREE.Box3(
                        new THREE.Vector3(target.position.x - 0.5, target.position.y, target.position.z - 0.5),
                        new THREE.Vector3(target.position.x + 0.5, target.position.y + 1.3, target.position.z + 0.5)
                    );

                    const headIntersect = new THREE.Vector3();
                    const bodyIntersect = new THREE.Vector3();

                    if (ray.intersectBox(headBox, headIntersect)) {
                        const dist = origin.distanceTo(headIntersect);
                        if (dist < closestDist) {
                            closestDist = dist; hitTarget = target; isHeadshot = true;
                        }
                    } else if (ray.intersectBox(bodyBox, bodyIntersect)) {
                        const dist = origin.distanceTo(bodyIntersect);
                        if (dist < closestDist) {
                            closestDist = dist; hitTarget = target; isHeadshot = false;
                        }
                    }
                }

                const endPoint = origin.clone().add(spreadDir.multiplyScalar(closestDist));
                const tracerColor = shooter === player ? 0x00f0ff : 0xff3355;
                this.addTracer(origin, endPoint, tracerColor);

                if (hitTarget) {
                    anyHit = true;
                    if (isHeadshot) anyHeadshot = true;
                    const finalDamage = isHeadshot ? Math.round(damage * 2.0) : damage;
                    totalDamageDealt += finalDamage;
                    gameRenderer.createHitSparks(endPoint, isHeadshot ? 0xff0055 : 0x00f0ff, 10);

                    const killed = hitTarget.takeDamage(finalDamage, shooter, isHeadshot);
                    if (killed && onKillCallback) {
                        onKillCallback(shooter, hitTarget, shooter.getCurrentWeaponName ? shooter.getCurrentWeaponName() : 'WEAPON', isHeadshot);
                    }
                } else if (mapHit.hit) {
                    gameRenderer.createHitSparks(endPoint, 0x00ffff, 6);
                }
            }

            if (shooter === player && anyHit) {
                soundEngine.playHitmark(anyHeadshot);
                if (window.hudManager) {
                    window.hudManager.showHitmarker(anyHeadshot);
                    window.hudManager.showDamageNumber(totalDamageDealt);
                }
            }
        }
    }

    // -------------------------------------------------------------
    // 8. PLAYER CONTROLLER (With Multi-View: Top-Down / 3rd / 1st)
    // -------------------------------------------------------------
    class Player {
        constructor(camera, scene) {
            this.camera = camera;
            this.scene = scene;
            this.name = 'AGENT (YOU)';
            this.position = new THREE.Vector3(0, 1.5, 0);
            this.velocity = new THREE.Vector3(0, 0, 0);
            this.radius = 0.5;
            this.height = 1.8;

            this.maxHp = 150; this.hp = 150;
            this.maxShield = 150; this.shield = 150;
            this.isAlive = true;
            this.respawnTimer = 0;

            // 자동 자연 회복 타이머
            this.lastDamageTime = performance.now() / 1000;
            this.isBeginnerMode = true;

            this.kills = 0; this.deaths = 0; this.score = 0;
            this.killStreak = 0; this.shotsFired = 0; this.shotsHit = 0;

            // 시점 모드 ('topdown' | 'third' | 'first')
            this.viewMode = 'topdown';
            this.enableCameraShake = false;

            this.keys = {
                forward: false, backward: false, left: false, right: false,
                sprint: false, crouch: false, jump: false, shoot: false, aim: false
            };

            // 플레이어 3D 아바타 메시
            this.avatarMesh = this.createPlayerAvatar();
            this.scene.add(this.avatarMesh);

            if (!this.scene.children.includes(this.camera)) {
                this.scene.add(this.camera);
            }

            this.weapons = createArsenal(this.camera);
            this.currentWeaponIndex = 0;
            this.selectWeapon(0);

            this.yaw = 0; this.pitch = 0;
            this.mouseSensitivity = 0.0022;

            this.walkSpeed = 10.0; this.sprintSpeed = 15.0; this.crouchSpeed = 5.0;
            this.jumpForce = 11.5; this.isGrounded = false; this.isSliding = false;
            this.slideTimer = 0; this.headbobTimer = 0; this.cameraShake = 0; this.stepTimer = 0;

            this.initControls();
        }

        createPlayerAvatar() {
            const group = new THREE.Group();

            // 1. 몸통 (Torso)
            const torso = new THREE.Mesh(
                new THREE.BoxGeometry(0.7, 0.85, 0.4),
                new THREE.MeshStandardMaterial({ color: 0x00d8ff, metalness: 0.8, roughness: 0.25 })
            );
            torso.position.set(0, 0.9, 0);
            torso.castShadow = true;

            // 2. 머리 & 네온 헬멧 (Head & Helmet)
            const head = new THREE.Mesh(
                new THREE.BoxGeometry(0.42, 0.42, 0.42),
                new THREE.MeshStandardMaterial({ color: 0x08101a, metalness: 0.9, roughness: 0.2 })
            );
            head.position.set(0, 1.55, 0);
            head.castShadow = true;

            const visor = new THREE.Mesh(
                new THREE.BoxGeometry(0.34, 0.12, 0.06),
                new THREE.MeshBasicMaterial({ color: 0x00f0ff })
            );
            visor.position.set(0, 1.57, -0.22);

            // 3. 오른팔 & 큼직한 3D 총기 (Right Arm & Held Weapon)
            this.avatarArm = new THREE.Group();
            this.avatarArm.position.set(0.42, 1.15, 0);

            const armMesh = new THREE.Mesh(
                new THREE.BoxGeometry(0.18, 0.6, 0.18),
                new THREE.MeshStandardMaterial({ color: 0x0a1525, metalness: 0.8 })
            );
            armMesh.position.set(0, -0.2, 0);
            this.avatarArm.add(armMesh);

            // 손에 쥐어진 실제 크기의 사이버 무기
            this.avatarGun = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 0.16, 0.8),
                new THREE.MeshStandardMaterial({ color: 0x1a2638, metalness: 0.9, roughness: 0.2 })
            );
            this.avatarGun.position.set(0.05, -0.25, -0.35);

            const gunNeon = new THREE.Mesh(
                new THREE.BoxGeometry(0.14, 0.03, 0.7),
                new THREE.MeshBasicMaterial({ color: 0x00f0ff })
            );
            gunNeon.position.set(0.05, -0.17, -0.35);

            this.avatarArm.add(this.avatarGun, gunNeon);

            group.add(torso, head, visor, this.avatarArm);
            return group;
        }

        initControls() {
            window.addEventListener('keydown', (e) => this.onKeyDown(e));
            window.addEventListener('keyup', (e) => this.onKeyUp(e));
            window.addEventListener('mousedown', (e) => this.onMouseDown(e));
            window.addEventListener('mouseup', (e) => this.onMouseUp(e));
            window.addEventListener('mousemove', (e) => this.onMouseMove(e));
            window.addEventListener('wheel', (e) => this.onMouseWheel(e));
        }

        toggleViewMode() {
            if (this.viewMode === 'topdown') {
                this.viewMode = 'third';
                if (window.hudManager) window.hudManager.showInteractionMessage('VIEW: 3RD PERSON (3인칭 숄더뷰)');
            } else if (this.viewMode === 'third') {
                this.viewMode = 'first';
                if (window.hudManager) window.hudManager.showInteractionMessage('VIEW: 1ST PERSON (1인칭 FPS)');
            } else {
                this.viewMode = 'topdown';
                if (window.hudManager) window.hudManager.showInteractionMessage('VIEW: TOP-DOWN (탑다운 고정 시점)');
            }
        }

        onKeyDown(e) {
            if (!this.isAlive) return;
            switch (e.code) {
                case 'KeyW': this.keys.forward = true; break;
                case 'KeyS': this.keys.backward = true; break;
                case 'KeyA': this.keys.left = true; break;
                case 'KeyD': this.keys.right = true; break;
                case 'KeyV': this.toggleViewMode(); break; // V키로 시점 전환!
                case 'ShiftLeft': case 'ShiftRight': this.keys.sprint = true; break;
                case 'KeyC':
                    this.keys.crouch = true;
                    if (this.keys.sprint && this.isGrounded && !this.isSliding) {
                        this.isSliding = true; this.slideTimer = 0.8;
                    }
                    break;
                case 'Space':
                    if (this.isGrounded) {
                        this.velocity.y = this.jumpForce; this.isGrounded = false;
                    }
                    break;
                case 'KeyR': this.currentWeapon.reload(); break;
                case 'Digit1': this.selectWeapon(0); break;
                case 'Digit2': this.selectWeapon(1); break;
                case 'Digit3': this.selectWeapon(2); break;
                case 'Digit4': this.selectWeapon(3); break;
                case 'Tab':
                    e.preventDefault();
                    if (window.hudManager) window.hudManager.toggleScoreboard(true);
                    break;
            }
        }

        onKeyUp(e) {
            switch (e.code) {
                case 'KeyW': this.keys.forward = false; break;
                case 'KeyS': this.keys.backward = false; break;
                case 'KeyA': this.keys.left = false; break;
                case 'KeyD': this.keys.right = false; break;
                case 'ShiftLeft': case 'ShiftRight': this.keys.sprint = false; break;
                case 'KeyC': this.keys.crouch = false; this.isSliding = false; break;
                case 'Tab':
                    e.preventDefault();
                    if (window.hudManager) window.hudManager.toggleScoreboard(false);
                    break;
            }
        }

        onMouseDown(e) {
            if (document.pointerLockElement !== document.body) return;
            if (e.button === 0) this.keys.shoot = true;
            else if (e.button === 2) { this.keys.aim = true; this.setAimScope(true); }
        }

        onMouseUp(e) {
            if (e.button === 0) this.keys.shoot = false;
            else if (e.button === 2) { this.keys.aim = false; this.setAimScope(false); }
        }

        onMouseMove(e) {
            if (document.pointerLockElement !== document.body) return;
            this.yaw -= e.movementX * this.mouseSensitivity;
            if (this.viewMode !== 'topdown') {
                this.pitch -= e.movementY * this.mouseSensitivity;
                const maxPitch = Math.PI / 2 - 0.05;
                this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
            }
        }

        onMouseWheel(e) {
            if (document.pointerLockElement !== document.body) return;
            if (e.deltaY > 0) this.selectWeapon((this.currentWeaponIndex + 1) % this.weapons.length);
            else if (e.deltaY < 0) this.selectWeapon((this.currentWeaponIndex - 1 + this.weapons.length) % this.weapons.length);
        }

        selectWeapon(index) {
            if (index < 0 || index >= this.weapons.length) return;
            this.weapons.forEach((w, i) => w.setVisible(i === index));
            this.currentWeaponIndex = index;
            this.currentWeapon = this.weapons[index];
            this.setAimScope(this.keys ? this.keys.aim : false);
        }

        getCurrentWeaponName() {
            return this.currentWeapon ? this.currentWeapon.name : 'RIFLE';
        }

        setAimScope(active) {
            if (!this.currentWeapon) return;
            this.currentWeapon.isScoped = active;
            const scopeEl = document.getElementById('sniper-scope');
            if (this.currentWeapon.type === 'sniper' && active && this.viewMode === 'first') {
                this.camera.fov = 25;
                if (scopeEl) scopeEl.classList.add('active');
            } else {
                this.camera.fov = active ? 60 : 75;
                if (scopeEl) scopeEl.classList.remove('active');
            }
            this.camera.updateProjectionMatrix();
        }

        takeDamage(amount, attacker) {
            if (!this.isAlive) return false;
            soundEngine.playPlayerHurt();
            this.lastDamageTime = performance.now() / 1000; // 피격 시간 기록

            // 초보자 모드 시 피해량 50% 경감
            if (this.isBeginnerMode) {
                amount = Math.round(amount * 0.5);
            }

            if (this.enableCameraShake) this.cameraShake = 0.3;
            if (this.shield > 0) {
                const shieldDmg = Math.min(this.shield, amount);
                this.shield -= shieldDmg;
                amount -= shieldDmg;
            }
            if (amount > 0) this.hp = Math.max(0, this.hp - amount);
            if (window.hudManager) window.hudManager.triggerDamageVignette(this.hp <= 30);
            if (this.hp <= 0) {
                this.die(attacker);
                return true;
            }
            return false;
        }

        die(attacker) {
            this.isAlive = false;
            this.deaths++;
            this.killStreak = 0;
            this.respawnTimer = 3.0;
            this.avatarMesh.visible = false;
            this.setAimScope(false);
        }

        respawn(spawnPos) {
            this.hp = this.maxHp;
            this.shield = this.maxShield;
            this.position.copy(spawnPos);
            this.velocity.set(0, 0, 0);
            this.isAlive = true;
            this.avatarMesh.position.copy(spawnPos);
            this.avatarMesh.visible = (this.viewMode !== 'first');
            this.weapons.forEach(w => w.refillAmmo());
        }

        update(dt, projectileManager, bots, onKillCallback) {
            if (!this.isAlive) {
                this.respawnTimer -= dt;
                return;
            }

            // 🌟 [자동 자연 회복 (Auto-Regen)]: 비피격 2.5초 후 초당 25씩 빠르게 회복
            const now = performance.now() / 1000;
            if (now - this.lastDamageTime > 2.5) {
                if (this.shield < this.maxShield) {
                    this.shield = Math.min(this.maxShield, this.shield + 25 * dt);
                } else if (this.hp < this.maxHp) {
                    this.hp = Math.min(this.maxHp, this.hp + 25 * dt);
                }
            }

            // 🌟 [무한 예비 탄약 보충]: 탄약 고갈 방지
            if (this.isBeginnerMode && this.currentWeapon) {
                this.currentWeapon.reserveAmmo = this.currentWeapon.maxReserve;
            }

            // 1. 이동 벡터 계산
            let forward, right;
            if (this.viewMode === 'topdown') {
                forward = new THREE.Vector3(0, 0, -1);
                right = new THREE.Vector3(1, 0, 0);
            } else {
                forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
                right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
            }

            let moveDir = new THREE.Vector3();
            if (this.keys.forward) moveDir.add(forward);
            if (this.keys.backward) moveDir.sub(forward);
            if (this.keys.right) moveDir.add(right);
            if (this.keys.left) moveDir.sub(right);
            moveDir.normalize();

            let currentSpeed = this.walkSpeed;
            if (this.keys.crouch) currentSpeed = this.crouchSpeed;
            else if (this.keys.sprint && moveDir.lengthSq() > 0) currentSpeed = this.sprintSpeed;

            if (this.isSliding) {
                this.slideTimer -= dt;
                currentSpeed = this.sprintSpeed * 1.4;
                if (this.slideTimer <= 0) this.isSliding = false;
            }

            this.velocity.x = moveDir.x * currentSpeed;
            this.velocity.z = moveDir.z * currentSpeed;

            const moveResult = physicsWorld.moveEntity(this.position, this.velocity, this.radius, this.height, dt);
            this.isGrounded = moveResult.isGrounded;
            if (moveResult.hitJumpPad) soundEngine.playJumpPad();

            // 발소리
            if (this.isGrounded && moveDir.lengthSq() > 0) {
                this.stepTimer -= dt;
                if (this.stepTimer <= 0) {
                    soundEngine.playFootstep();
                    this.stepTimer = this.keys.sprint ? 0.28 : 0.42;
                }
            }

            // 아바타 메시 및 오른팔 조준선 동기화
            this.avatarMesh.position.copy(this.position);
            this.avatarMesh.rotation.y = this.yaw;
            if (this.avatarArm) {
                this.avatarArm.rotation.x = this.pitch;
            }
            this.avatarMesh.visible = (this.viewMode !== 'first');

            // 2. 총기 위치 및 조준선 중심 카메라
            const forwardDir = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
            const rightDir = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

            const gunWorldPos = this.position.clone()
                .add(rightDir.clone().multiplyScalar(0.45))
                .add(new THREE.Vector3(0, 1.35, 0))
                .add(forwardDir.clone().multiplyScalar(0.2));

            const aimTargetPoint = gunWorldPos.clone()
                .add(forwardDir.clone().multiplyScalar(25.0))
                .add(new THREE.Vector3(0, Math.sin(this.pitch) * 20.0, 0));

            if (this.viewMode === 'third' || this.viewMode === 'topdown') {
                const camDistance = this.viewMode === 'topdown' ? 4.5 : 2.5;
                const camHeight = this.viewMode === 'topdown' ? 2.8 : 0.8;
                const camRight = this.viewMode === 'topdown' ? 0.9 : 0.7;

                const desiredCamPos = gunWorldPos.clone()
                    .sub(forwardDir.clone().multiplyScalar(camDistance))
                    .add(new THREE.Vector3(0, camHeight, 0))
                    .add(rightDir.clone().multiplyScalar(camRight));

                this.camera.position.lerp(desiredCamPos, 18 * dt);
                this.camera.lookAt(aimTargetPoint);
            } else {
                const eyePos = gunWorldPos.clone().add(new THREE.Vector3(0, 0.15, 0)).sub(rightDir.clone().multiplyScalar(0.18));
                this.camera.position.set(eyePos.x, eyePos.y, eyePos.z);
                this.camera.rotation.set(0, 0, 0);
                this.camera.rotation.y = this.yaw;
                this.camera.rotation.x = this.pitch;
            }

            // 무기 뷰모델 업데이트
            this.currentWeapon.update(dt);

            if (this.keys.shoot) this.triggerWeaponShoot(projectileManager, bots, onKillCallback);
        }

        triggerWeaponShoot(projectileManager, bots, onKillCallback) {
            if (!this.currentWeapon.shoot()) return;
            this.shotsFired++;

            // 발사 원점: 총구 위치에서 직접 격발
            const forwardDir = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
            const rightDir = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
            const shootOrigin = this.position.clone()
                .add(rightDir.clone().multiplyScalar(0.45))
                .add(new THREE.Vector3(0, 1.35, 0))
                .add(forwardDir.clone().multiplyScalar(0.6));

            // 기본 조준 방향
            let shootDir = new THREE.Vector3(0, Math.sin(this.pitch), -Math.cos(this.pitch))
                .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw)
                .normalize();

            // 🌟 [스마트 에임 어시스트 (Aim Assist)]: 근처의 살아있는 적 방향으로 자석처럼 탄도 유도
            if (this.isBeginnerMode && bots && bots.length > 0) {
                let bestTarget = null;
                let bestAngle = 0.55; // 약 32도 이내의 적 자동 포착

                for (const bot of bots) {
                    if (!bot.isAlive) continue;
                    const toBot = bot.position.clone().add(new THREE.Vector3(0, 1.2, 0)).sub(shootOrigin).normalize();
                    const angle = shootDir.angleTo(toBot);
                    if (angle < bestAngle) {
                        bestAngle = angle;
                        bestTarget = toBot;
                    }
                }

                if (bestTarget) {
                    // 탄환 궤적을 적의 중심 쪽으로 80% 이상 강력하게 스냅 유도!
                    shootDir.lerp(bestTarget, 0.85).normalize();
                }
            }

            const weaponDmg = this.isBeginnerMode ? Math.round(this.currentWeapon.damage * 1.35) : this.currentWeapon.damage;

            if (this.currentWeapon.type === 'projectile') {
                projectileManager.spawnRocket(shootOrigin, shootDir, this, weaponDmg, 6.5);
            } else {
                projectileManager.processHitscan(shootOrigin, shootDir, 150, weaponDmg, this.currentWeapon.spread * (this.isGrounded ? 1.0 : 1.5), this.currentWeapon.pellets, this, this, bots, onKillCallback);
            }
        }
    }

    // -------------------------------------------------------------
    // 9. AI BOT (High-Visibility Crimson Neon Enemy with HP Bar)
    // -------------------------------------------------------------
    class Bot {
        constructor(id, name, scene, difficulty = 'normal') {
            this.id = id;
            this.name = name;
            this.scene = scene;
            this.difficulty = difficulty;
            this.position = new THREE.Vector3(0, 1.5, 0);
            this.velocity = new THREE.Vector3(0, 0, 0);
            this.radius = 0.5;
            this.height = 1.8;

            this.maxHp = 100; this.hp = 100;
            this.maxShield = 50; this.shield = 50;
            this.isAlive = true; this.respawnTimer = 0;
            this.kills = 0; this.deaths = 0; this.score = 0;

            this.speed = difficulty === 'hard' ? 9.5 : (difficulty === 'easy' ? 6.5 : 8.0);
            this.accuracySpread = difficulty === 'hard' ? 0.03 : (difficulty === 'easy' ? 0.12 : 0.06);
            this.fireInterval = difficulty === 'hard' ? 0.14 : (difficulty === 'easy' ? 0.28 : 0.2);

            this.state = 'PATROL';
            this.target = null;
            this.targetPos = new THREE.Vector3();
            this.stateTimer = 0;
            this.lastShotTime = 0;
            this.strafeDir = 1;
            this.strafeTimer = 0;

            this.mesh = this.createBotMesh();
            this.scene.add(this.mesh);
        }

        createBotMesh() {
            const group = new THREE.Group();

            // 1. 몸통 (눈에 확 띄는 선명한 크림슨 레드 아머)
            const torsoMat = new THREE.MeshStandardMaterial({
                color: 0xff1e40,
                emissive: 0x990022,
                emissiveIntensity: 0.45,
                metalness: 0.8,
                roughness: 0.2
            });
            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.85, 0.42), torsoMat);
            torso.position.set(0, 0.9, 0);
            torso.castShadow = true;

            // 2. 머리 (블랙 & 핫핑크 네온 바이저)
            const headMat = new THREE.MeshStandardMaterial({
                color: 0x1f0810,
                metalness: 0.9,
                roughness: 0.2
            });
            const head = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.44, 0.44), headMat);
            head.position.set(0, 1.55, 0);
            head.castShadow = true;

            // 강렬한 네온 옐로우/오렌지 바이저
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffe600 });
            const eye = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.06), eyeMat);
            eye.position.set(0, 1.58, -0.23);

            // 3. 어깨 네온 비콘 (먼 거리에서도 적임을 알 수 있는 발광 숄더)
            const shoulderMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
            const shoulderL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.25, 0.25), shoulderMat);
            shoulderL.position.set(-0.44, 1.15, 0);
            const shoulderR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.25, 0.25), shoulderMat);
            shoulderR.position.set(0.44, 1.15, 0);

            // 4. 총기
            const gun = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 0.14, 0.65),
                new THREE.MeshStandardMaterial({ color: 0x15050a, metalness: 0.9 })
            );
            gun.position.set(0.38, 0.88, -0.35);

            // 5. 머리 위 3D 체력바 (HP Bar Overlay)
            this.hpBarBg = new THREE.Mesh(
                new THREE.PlaneGeometry(0.9, 0.12),
                new THREE.MeshBasicMaterial({ color: 0x220000, side: THREE.DoubleSide })
            );
            this.hpBarBg.position.set(0, 2.05, 0);

            this.hpBarFg = new THREE.Mesh(
                new THREE.PlaneGeometry(0.86, 0.08),
                new THREE.MeshBasicMaterial({ color: 0xff0044, side: THREE.DoubleSide })
            );
            this.hpBarFg.position.set(0, 2.05, 0.01);

            // 6. 적 주변 붉은 오라 조명 (멀리서도 선명하게 발광)
            const enemyLight = new THREE.PointLight(0xff0044, 2.5, 8);
            enemyLight.position.set(0, 1.2, 0);

            group.add(torso, head, eye, shoulderL, shoulderR, gun, this.hpBarBg, this.hpBarFg, enemyLight);
            return group;
        }

        getCurrentWeaponName() { return 'CYBER RIFLE'; }

        takeDamage(amount, attacker) {
            if (!this.isAlive) return false;
            if (this.shield > 0) {
                const shieldDmg = Math.min(this.shield, amount);
                this.shield -= shieldDmg;
                amount -= shieldDmg;
            }
            if (amount > 0) this.hp = Math.max(0, this.hp - amount);

            // 머리 위 체력바 게이지 실시간 축소
            const hpRatio = Math.max(0, this.hp / this.maxHp);
            if (this.hpBarFg) {
                this.hpBarFg.scale.x = hpRatio;
                this.hpBarFg.position.x = -(1 - hpRatio) * 0.43;
            }

            if (attacker && attacker !== this) {
                this.target = attacker; this.state = 'ATTACK';
            }
            if (this.hp <= 0) {
                this.die(attacker);
                return true;
            }
            return false;
        }

        die() {
            this.isAlive = false;
            this.deaths++;
            this.respawnTimer = 4.0;
            this.mesh.visible = false;
        }

        respawn(spawnPos) {
            this.hp = this.maxHp;
            this.shield = this.maxShield;
            if (this.hpBarFg) {
                this.hpBarFg.scale.x = 1;
                this.hpBarFg.position.x = 0;
            }
            this.position.copy(spawnPos);
            this.mesh.position.copy(spawnPos);
            this.mesh.visible = true;
            this.isAlive = true;
            this.state = 'PATROL';
            this.target = null;
        }

        update(dt, player, allBots, map, projectileManager, onKillCallback) {
            if (!this.isAlive) {
                this.respawnTimer -= dt;
                return;
            }

            // 머리 위 체력바가 항상 플레이어 카메라를 바라보도록 회전 (Billboard)
            if (this.hpBarBg && player) {
                this.hpBarBg.lookAt(player.camera.position);
                this.hpBarFg.lookAt(player.camera.position);
            }

            const potentialTargets = [player, ...allBots].filter(t => t !== this && t.isAlive);
            let closestTarget = null;
            let minDistance = 45.0;

            for (const candidate of potentialTargets) {
                const dist = this.position.distanceTo(candidate.position);
                if (dist < minDistance) {
                    const dir = candidate.position.clone().sub(this.position).normalize();
                    const losHit = physicsWorld.raycastMap(new THREE.Vector3(this.position.x, this.position.y + 1.4, this.position.z), dir, dist);
                    if (!losHit.hit || losHit.distance >= dist - 0.5) {
                        minDistance = dist;
                        closestTarget = candidate;
                    }
                }
            }

            if (closestTarget) {
                this.target = closestTarget;
                this.state = minDistance < 22 ? 'ATTACK' : 'CHASE';
            } else if (this.state === 'ATTACK' || this.state === 'CHASE') {
                this.state = 'PATROL';
                this.target = null;
            }

            let moveDir = new THREE.Vector3();
            if (this.state === 'PATROL') {
                this.stateTimer -= dt;
                if (this.stateTimer <= 0) {
                    this.targetPos = map.getRandomSpawnPoint();
                    this.stateTimer = 4.0 + Math.random() * 3.0;
                }
                moveDir = this.targetPos.clone().sub(this.position).normalize();
            } else if (this.state === 'CHASE' && this.target) {
                moveDir = this.target.position.clone().sub(this.position).normalize();
            } else if (this.state === 'ATTACK' && this.target) {
                const toTarget = this.target.position.clone().sub(this.position);
                const dist = toTarget.length();
                toTarget.normalize();

                if (dist > 18) moveDir.add(toTarget);
                else if (dist < 8) moveDir.sub(toTarget);

                this.strafeTimer -= dt;
                if (this.strafeTimer <= 0) {
                    this.strafeDir = Math.random() < 0.5 ? -1 : 1;
                    this.strafeTimer = 1.0 + Math.random() * 1.5;
                }
                const right = new THREE.Vector3(-toTarget.z, 0, toTarget.x).multiplyScalar(this.strafeDir);
                moveDir.add(right);
                moveDir.normalize();

                this.tryShoot(projectileManager, player, allBots, onKillCallback);
            }

            this.velocity.x = moveDir.x * this.speed;
            this.velocity.z = moveDir.z * this.speed;
            physicsWorld.moveEntity(this.position, this.velocity, this.radius, this.height, dt);

            this.mesh.position.copy(this.position);
            if (this.target && this.state === 'ATTACK') {
                const targetLook = new THREE.Vector3(this.target.position.x, this.position.y, this.target.position.z);
                if (this.position.distanceTo(targetLook) > 0.2) this.mesh.lookAt(targetLook);
            } else if (moveDir.lengthSq() > 0.01) {
                const moveLook = new THREE.Vector3(this.position.x + moveDir.x, this.position.y, this.position.z + moveDir.z);
                if (this.position.distanceTo(moveLook) > 0.2) this.mesh.lookAt(moveLook);
            }
        }

        tryShoot(projectileManager, player, allBots, onKillCallback) {
            const now = performance.now() / 1000;
            if (now - this.lastShotTime < this.fireInterval) return;
            if (!this.target || !this.target.isAlive) return;

            this.lastShotTime = now;
            soundEngine.playAssaultRifle();

            const eyeOrigin = new THREE.Vector3(this.position.x, this.position.y + 1.4, this.position.z);
            const targetCenter = new THREE.Vector3(this.target.position.x, this.target.position.y + 1.2, this.target.position.z);
            const shootDir = targetCenter.clone().sub(eyeOrigin).normalize();

            projectileManager.processHitscan(eyeOrigin, shootDir, 120, 14, this.accuracySpread, 1, this, player, allBots, onKillCallback);
        }
    }

    // -------------------------------------------------------------
    // 10. HUD MANAGER
    // -------------------------------------------------------------
    class HUDManager {
        constructor() {
            this.hpVal = document.getElementById('hp-val');
            this.hpBar = document.getElementById('hp-bar');
            this.shieldVal = document.getElementById('shield-val');
            this.shieldBar = document.getElementById('shield-bar');

            this.weaponCurrentName = document.getElementById('weapon-current-name');
            this.ammoClip = document.getElementById('ammo-clip');
            this.ammoReserve = document.getElementById('ammo-reserve');
            this.reloadIndicator = document.getElementById('reload-indicator');
            this.reloadProgressContainer = document.getElementById('reload-progress-container');
            this.reloadProgressBar = document.getElementById('reload-progress-bar');
            this.weaponSlots = document.querySelectorAll('.weapon-slot');

            this.matchTimer = document.getElementById('match-timer');
            this.playerScore = document.getElementById('player-score');
            this.leaderScore = document.getElementById('leader-score');

            this.killFeed = document.getElementById('kill-feed');
            this.announcementTitle = document.getElementById('announcement-title');
            this.announcementSubtitle = document.getElementById('announcement-subtitle');

            this.hitmarker = document.getElementById('hitmarker');
            this.damageIndicator = document.getElementById('damage-indicator-text');
            this.damageVignette = document.getElementById('damage-vignette');
            this.healVignette = document.getElementById('heal-vignette');
            this.interactionPrompt = document.getElementById('interaction-prompt');

            this.scoreboardModal = document.getElementById('scoreboard-modal');
            this.scoreboardBody = document.getElementById('scoreboard-body');

            this.radarCanvas = document.getElementById('radar-canvas');
            this.radarCtx = this.radarCanvas ? this.radarCanvas.getContext('2d') : null;

            this.hitmarkerTimeout = null;
            this.announcementTimeout = null;
            this.interactionTimeout = null;

            window.hudManager = this;
        }

        updateVitals(player) {
            const hpPercent = Math.max(0, (player.hp / player.maxHp) * 100);
            const shieldPercent = Math.max(0, (player.shield / player.maxShield) * 100);
            if (this.hpVal) this.hpVal.textContent = Math.ceil(player.hp);
            if (this.hpBar) {
                this.hpBar.style.width = `${hpPercent}%`;
                if (player.hp <= 30) this.hpBar.classList.add('low');
                else this.hpBar.classList.remove('low');
            }
            if (this.shieldVal) this.shieldVal.textContent = Math.ceil(player.shield);
            if (this.shieldBar) this.shieldBar.style.width = `${shieldPercent}%`;
        }

        updateWeaponState(player) {
            const weapon = player.currentWeapon;
            if (!weapon) return;

            if (this.weaponCurrentName) this.weaponCurrentName.textContent = weapon.name;
            if (this.ammoClip) this.ammoClip.textContent = weapon.currentClip;
            if (this.ammoReserve) this.ammoReserve.textContent = weapon.reserveAmmo;

            if (weapon.currentClip <= Math.ceil(weapon.clipSize * 0.25)) {
                if (this.ammoClip) this.ammoClip.classList.add('low');
                if (this.reloadIndicator) this.reloadIndicator.classList.add('show');
            } else {
                if (this.ammoClip) this.ammoClip.classList.remove('low');
                if (this.reloadIndicator) this.reloadIndicator.classList.remove('show');
            }

            if (weapon.isReloading) {
                if (this.reloadProgressContainer) this.reloadProgressContainer.classList.add('active');
                const progress = (1 - weapon.reloadTimer / weapon.reloadTime) * 100;
                if (this.reloadProgressBar) this.reloadProgressBar.style.width = `${progress}%`;
            } else {
                if (this.reloadProgressContainer) this.reloadProgressContainer.classList.remove('active');
            }

            this.weaponSlots.forEach((slot, idx) => {
                if (idx === player.currentWeaponIndex) slot.classList.add('active');
                else slot.classList.remove('active');
            });
        }

        drawRadar(player, bots, pickupItems = []) {
            if (!this.radarCtx) return;
            const ctx = this.radarCtx;
            const w = this.radarCanvas.width; const h = this.radarCanvas.height;
            const cx = w / 2; const cy = h / 2;
            const range = 45;

            ctx.clearRect(0, 0, w, h);
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2); ctx.arc(cx, cy, 60, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();

            pickupItems.forEach(item => {
                if (!item.active) return;
                const dx = item.group.position.x - player.position.x;
                const dz = item.group.position.z - player.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < range) {
                    const rx = cx + (dx / range) * (w / 2 - 8);
                    const ry = cy + (dz / range) * (h / 2 - 8);
                    ctx.fillStyle = item.type === 'health' ? '#00ff66' : (item.type === 'shield' ? '#00c3ff' : '#ffe600');
                    ctx.beginPath(); ctx.arc(rx, ry, 3, 0, Math.PI * 2); ctx.fill();
                }
            });

            bots.forEach(bot => {
                if (!bot.isAlive) return;
                const dx = bot.position.x - player.position.x;
                const dz = bot.position.z - player.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < range) {
                    const rx = cx + (dx / range) * (w / 2 - 8);
                    const ry = cy + (dz / range) * (h / 2 - 8);
                    ctx.fillStyle = '#ff0055';
                    ctx.beginPath(); ctx.arc(rx, ry, 4, 0, Math.PI * 2); ctx.fill();
                }
            });

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(-player.yaw);
            ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 35, -Math.PI / 4 - Math.PI / 2, Math.PI / 4 - Math.PI / 2); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#00f0ff';
            ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(4, 5); ctx.lineTo(-4, 5); ctx.closePath(); ctx.fill();
            ctx.restore();
        }

        showHitmarker(isHeadshot = false) {
            if (!this.hitmarker) return;
            this.hitmarker.className = isHeadshot ? 'show headshot' : 'show';
            if (this.hitmarkerTimeout) clearTimeout(this.hitmarkerTimeout);
            this.hitmarkerTimeout = setTimeout(() => { if (this.hitmarker) this.hitmarker.className = ''; }, 120);
        }

        showDamageNumber(amount) {
            if (!this.damageIndicator) return;
            this.damageIndicator.textContent = `-${amount}`;
            this.damageIndicator.classList.add('show');
            setTimeout(() => { if (this.damageIndicator) this.damageIndicator.classList.remove('show'); }, 250);
        }

        triggerDamageVignette(isCritical = false) {
            if (!this.damageVignette) return;
            this.damageVignette.className = isCritical ? 'hit critical' : 'hit';
            setTimeout(() => { if (this.damageVignette && !isCritical) this.damageVignette.className = ''; }, 200);
        }

        triggerHealVignette() {
            if (!this.healVignette) return;
            this.healVignette.classList.add('active');
            setTimeout(() => { if (this.healVignette) this.healVignette.classList.remove('active'); }, 300);
        }

        addKillFeed(killer, victim, weaponName, isHeadshot) {
            if (!this.killFeed) return;
            const item = document.createElement('div');
            const isPlayerKiller = killer.name === 'AGENT (YOU)';
            const isPlayerVictim = victim.name === 'AGENT (YOU)';
            item.className = `kill-feed-item ${isPlayerKiller ? 'player-kill' : (isPlayerVictim ? 'player-death' : '')}`;
            item.innerHTML = `
                <span class="killer ${isPlayerKiller ? 'player' : ''}">${killer.name}</span>
                <span class="weapon-icon">[${weaponName}]</span>
                ${isHeadshot ? '<span class="headshot-badge">🎯 HEADSHOT</span>' : ''}
                <span class="victim ${isPlayerVictim ? 'player' : ''}">${victim.name}</span>
            `;
            this.killFeed.prepend(item);
            if (this.killFeed.children.length > 5) this.killFeed.removeChild(this.killFeed.lastChild);
            setTimeout(() => { if (item.parentNode) item.parentNode.removeChild(item); }, 5000);
        }

        showAnnouncement(title, subtitle = '') {
            if (!this.announcementTitle) return;
            this.announcementTitle.textContent = title;
            this.announcementSubtitle.textContent = subtitle;
            this.announcementTitle.classList.add('show');
            this.announcementSubtitle.classList.add('show');
            if (this.announcementTimeout) clearTimeout(this.announcementTimeout);
            this.announcementTimeout = setTimeout(() => {
                if (this.announcementTitle) this.announcementTitle.classList.remove('show');
                if (this.announcementSubtitle) this.announcementSubtitle.classList.remove('show');
            }, 2200);
        }

        showInteractionMessage(msg) {
            if (!this.interactionPrompt) return;
            this.interactionPrompt.textContent = msg;
            this.interactionPrompt.classList.add('show');
            if (this.interactionTimeout) clearTimeout(this.interactionTimeout);
            this.interactionTimeout = setTimeout(() => {
                if (this.interactionPrompt) this.interactionPrompt.classList.remove('show');
            }, 1800);
        }

        toggleScoreboard(show) {
            if (!this.scoreboardModal) return;
            if (show) this.scoreboardModal.classList.remove('hidden');
            else this.scoreboardModal.classList.add('hidden');
        }

        updateScoreboard(allParticipants) {
            if (!this.scoreboardBody) return;
            const sorted = [...allParticipants].sort((a, b) => b.kills - a.kills || b.score - a.score);
            this.scoreboardBody.innerHTML = '';
            sorted.forEach((p, idx) => {
                const isPlayer = p.name === 'AGENT (YOU)';
                const kd = p.deaths > 0 ? (p.kills / p.deaths).toFixed(1) : p.kills.toFixed(1);
                const tr = document.createElement('tr');
                tr.className = `scoreboard-row ${isPlayer ? 'is-player' : ''}`;
                tr.innerHTML = `
                    <td>#${idx + 1}</td>
                    <td>${p.name}</td>
                    <td style="color: #00f0ff;">${p.kills}</td>
                    <td style="color: #ff0055;">${p.deaths}</td>
                    <td>${kd}</td>
                    <td style="color: #ffe600; font-weight: bold;">${p.kills * 100}</td>
                    <td>${p.isAlive ? '<span style="color: #00ff66;">ALIVE</span>' : '<span style="color: #8faec5;">RESPAWNING</span>'}</td>
                `;
                this.scoreboardBody.appendChild(tr);
            });

            const topLeader = sorted[0];
            if (topLeader && this.leaderScore) {
                this.leaderScore.textContent = `${topLeader.name} (${topLeader.kills}/25)`;
            }
        }
    }

    // -------------------------------------------------------------
    // 11. GAME CONTROLLER
    // -------------------------------------------------------------
    class GameManager {
        constructor() {
            this.renderer = gameRenderer;
            this.scene = this.renderer.scene;
            this.camera = this.renderer.camera;

            this.hud = new HUDManager();
            this.map = new ArenaMap(this.scene);
            this.pickups = new PickupManager(this.scene);
            this.projectileManager = new ProjectileManager(this.scene);

            this.player = null;
            this.bots = [];
            this.allParticipants = [];

            this.targetKills = 25;
            this.matchTime = 600;
            this.gameState = 'MENU';

            this.lastTime = performance.now();
            this.botNames = ['VEX-01', 'KAI-88', 'RAZOR', 'NOVA', 'GHOST', 'TITAN', 'ECHO', 'VIPER', 'CIPHER', 'NEXUS'];

            this.setupUIEvents();
        }

        setupUIEvents() {
            const startBtn = document.getElementById('btn-start-game');
            const resumeBtn = document.getElementById('btn-resume-game');
            const restartBtn = document.getElementById('btn-restart-game');
            const playAgainBtn = document.getElementById('btn-play-again');

            const startScreen = document.getElementById('start-screen');
            const pauseScreen = document.getElementById('pause-screen');
            const gameOverScreen = document.getElementById('game-over-screen');

            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    soundEngine.init();
                    soundEngine.startCyberBGM();
                    const botCount = parseInt(document.getElementById('bot-count-select').value, 10) || 6;
                    const botDiff = document.getElementById('bot-diff-select').value || 'normal';
                    const viewMode = document.getElementById('view-mode-select') ? document.getElementById('view-mode-select').value : 'topdown';
                    const shakePref = document.getElementById('camera-shake-select') ? document.getElementById('camera-shake-select').value : 'off';

                    this.startMatch(botCount, botDiff, viewMode, shakePref === 'on');
                    if (startScreen) startScreen.classList.add('hidden');
                    this.lockPointer();
                });
            }

            if (resumeBtn) {
                resumeBtn.addEventListener('click', () => {
                    if (pauseScreen) pauseScreen.classList.add('hidden');
                    this.gameState = 'PLAYING';
                    this.lockPointer();
                });
            }

            if (restartBtn) {
                restartBtn.addEventListener('click', () => {
                    if (pauseScreen) pauseScreen.classList.add('hidden');
                    const botCount = parseInt(document.getElementById('bot-count-select').value, 10) || 6;
                    const botDiff = document.getElementById('bot-diff-select').value || 'normal';
                    const viewMode = document.getElementById('view-mode-select') ? document.getElementById('view-mode-select').value : 'topdown';
                    const shakePref = document.getElementById('camera-shake-select') ? document.getElementById('camera-shake-select').value : 'off';
                    this.startMatch(botCount, botDiff, viewMode, shakePref === 'on');
                    this.lockPointer();
                });
            }

            if (playAgainBtn) {
                playAgainBtn.addEventListener('click', () => {
                    if (gameOverScreen) gameOverScreen.classList.add('hidden');
                    const botCount = parseInt(document.getElementById('bot-count-select').value, 10) || 6;
                    const botDiff = document.getElementById('bot-diff-select').value || 'normal';
                    const viewMode = document.getElementById('view-mode-select') ? document.getElementById('view-mode-select').value : 'topdown';
                    const shakePref = document.getElementById('camera-shake-select') ? document.getElementById('camera-shake-select').value : 'off';
                    this.startMatch(botCount, botDiff, viewMode, shakePref === 'on');
                    this.lockPointer();
                });
            }

            document.addEventListener('pointerlockchange', () => {
                if (document.pointerLockElement !== document.body) {
                    if (this.gameState === 'PLAYING') {
                        this.gameState = 'PAUSED';
                        if (pauseScreen) pauseScreen.classList.remove('hidden');
                    }
                }
            });
        }

        lockPointer() {
            document.body.requestPointerLock();
        }

        startMatch(botCount, botDiff, viewMode = 'topdown', enableShake = false) {
            this.bots.forEach(b => {
                if (b.mesh) this.scene.remove(b.mesh);
            });
            this.bots = [];

            if (!this.mapInitialized) {
                this.map.build();
                this.pickups.init();
                this.mapInitialized = true;
            }

            if (!this.player) {
                this.player = new Player(this.camera, this.scene);
            }
            this.player.isBeginnerMode = (botDiff === 'beginner');
            this.player.viewMode = viewMode;
            this.player.enableCameraShake = enableShake;
            this.player.kills = 0;
            this.player.deaths = 0;
            this.player.score = 0;
            this.player.shotsFired = 0;
            this.player.shotsHit = 0;
            this.player.respawn(this.map.getRandomSpawnPoint());

            for (let i = 0; i < botCount; i++) {
                const botName = this.botNames[i % this.botNames.length];
                const actualDiff = botDiff === 'beginner' ? 'easy' : botDiff;
                const bot = new Bot(i + 1, botName, this.scene, actualDiff);
                bot.respawn(this.map.getRandomSpawnPoint());
                this.bots.push(bot);
            }

            this.allParticipants = [this.player, ...this.bots];
            this.matchTime = 600;
            this.gameState = 'PLAYING';

            const modeLabel = botDiff === 'beginner' ? '초보자 이지 모드 (자동조준+자연회복 ON)' : '일반 모드';
            this.hud.showAnnouncement('MATCH COMMENCED', `${modeLabel} | 25 KILLS TO WIN`);
        }

        onKill(killer, victim, weaponName, isHeadshot) {
            killer.kills++;
            killer.score += isHeadshot ? 150 : 100;
            this.hud.addKillFeed(killer, victim, weaponName, isHeadshot);

            if (killer === this.player) {
                this.player.killStreak++;
                this.player.shotsHit++;
                soundEngine.playKillSound();
                const streak = this.player.killStreak;
                if (streak === 2) this.hud.showAnnouncement('DOUBLE KILL!', 'EXCELLENT SHOT');
                else if (streak === 3) this.hud.showAnnouncement('TRIPLE KILL!', 'RAMPAGE ACTIVE');
                else if (streak === 4) this.hud.showAnnouncement('DOMINATING!', 'UNSTOPPABLE FORCE');
                else if (streak >= 5) this.hud.showAnnouncement('GODLIKE KILLSTREAK!', `${streak} KILLS IN A ROW`);
                else {
                    if (isHeadshot) this.hud.showAnnouncement('HEADSHOT!', '+150 PTS');
                }
            }

            if (killer.kills >= this.targetKills) {
                this.endMatch(killer);
            }
        }

        endMatch(winner) {
            this.gameState = 'GAMEOVER';
            document.exitPointerLock();
            const gameOverScreen = document.getElementById('game-over-screen');
            const resTitle = document.getElementById('result-title');
            const resSubtitle = document.getElementById('result-subtitle');

            const isPlayerWin = winner === this.player;
            if (resTitle) {
                resTitle.textContent = isPlayerWin ? 'VICTORY' : 'DEFEAT';
                resTitle.className = isPlayerWin ? 'victory-text' : 'defeat-text';
            }
            if (resSubtitle) {
                resSubtitle.textContent = isPlayerWin ?
                    `YOU DOMINATED THE ARENA WITH ${this.player.kills} KILLS!` :
                    `${winner.name} WON THE MATCH WITH ${winner.kills} KILLS.`;
            }

            const rKills = document.getElementById('res-kills');
            const rDeaths = document.getElementById('res-deaths');
            const rKd = document.getElementById('res-kd');
            const rAcc = document.getElementById('res-accuracy');

            if (rKills) rKills.textContent = this.player.kills;
            if (rDeaths) rDeaths.textContent = this.player.deaths;
            if (rKd) rKd.textContent = this.player.deaths > 0 ? (this.player.kills / this.player.deaths).toFixed(2) : this.player.kills.toFixed(2);
            if (rAcc) rAcc.textContent = `${this.player.shotsFired > 0 ? Math.round((this.player.shotsHit / this.player.shotsFired) * 100) : 0}%`;

            if (gameOverScreen) gameOverScreen.classList.remove('hidden');
        }

        run() {
            const now = performance.now();
            const dt = Math.min((now - this.lastTime) / 1000, 0.1);
            this.lastTime = now;

            if (this.gameState === 'PLAYING') {
                this.matchTime -= dt;
                if (this.matchTime <= 0) {
                    const sorted = [...this.allParticipants].sort((a, b) => b.kills - a.kills);
                    this.endMatch(sorted[0]);
                }
                const mins = Math.floor(Math.max(0, this.matchTime) / 60);
                const secs = Math.floor(Math.max(0, this.matchTime) % 60);
                if (this.hud.matchTimer) {
                    this.hud.matchTimer.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                }

                if (this.player.isAlive) {
                    this.player.update(dt, this.projectileManager, this.bots, (k, v, w, h) => this.onKill(k, v, w, h));
                } else if (this.player.respawnTimer <= 0) {
                    this.player.respawn(this.map.getRandomSpawnPoint());
                } else {
                    this.player.update(dt, this.projectileManager, this.bots, null);
                }

                this.bots.forEach(bot => {
                    if (bot.isAlive) {
                        bot.update(dt, this.player, this.bots, this.map, this.projectileManager, (k, v, w, h) => this.onKill(k, v, w, h));
                    } else if (bot.respawnTimer <= 0) {
                        bot.respawn(this.map.getRandomSpawnPoint());
                    } else {
                        bot.update(dt, this.player, this.bots, this.map, this.projectileManager, null);
                    }
                });

                this.projectileManager.update(dt, this.player, this.bots, (k, v, w, h) => this.onKill(k, v, w, h));
                this.pickups.update(dt, this.player, this.bots);
                this.renderer.updateParticles(dt);

                this.hud.updateVitals(this.player);
                this.hud.updateWeaponState(this.player);
                this.hud.drawRadar(this.player, this.bots, this.pickups.items);
                if (this.hud.playerScore) this.hud.playerScore.textContent = `${this.player.kills}`;
                this.hud.updateScoreboard(this.allParticipants);
            }

            this.renderer.render();
            requestAnimationFrame(() => this.run());
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        const game = new GameManager();
        game.run();
    });
})();
