/**
 * CYBER STRIKE 2099 - Main Game Controller & Physics Engine
 * Complete integration with Sub-Stepped Swept Collision Resolution (Zero Wall Passing/Clipping),
 * Supernova Laser Beam, SANABI Chain Arm Grapple & Execution, and HUD.
 */

class CyberStrikeGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        this.map = null;
        this.particleEngine = null;
        this.weaponSystem = null;
        this.enemyManager = null;

        this.isPlaying = false;
        this.isPaused = false;
        this.isGameOver = false;

        // Player Stats
        this.health = 100;
        this.maxHealth = 100;
        this.shield = 100;
        this.maxShield = 100;
        this.lastDamageTime = 0;
        this.stamina = 100;
        this.maxStamina = 100;

        this.score = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.totalKills = 0;
        this.headshots = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;

        // Player Kinematics
        this.playerPos = new THREE.Vector3(0, 1.8, 15);
        this.playerVel = new THREE.Vector3();
        this.onGround = false;
        this.playerHeight = 1.8;
        this.crouchHeight = 1.1;
        this.playerRadius = 0.45;
        this.isCrouching = false;
        this.isSprinting = false;

        this.walkSpeed = 9.0;
        this.sprintSpeed = 15.0;
        this.crouchSpeed = 5.0;
        this.gravity = -26.0;
        this.jumpForce = 10.5;

        this.footstepTimer = 0;

        // Camera Orientation
        this.pitch = 0;
        this.yaw = 0;
        this.mouseSensitivity = 1.0;

        // Camera Screen Shake
        this.screenShakeIntensity = 0;
        this.screenShakeTimer = 0;

        // SANABI Chain Arm Grapple State
        this.isGrappling = false;
        this.grapplePoint = new THREE.Vector3();
        this.grappleEnemy = null;
        this.grappleSpeed = 34.0;
        this.grappleMaxRange = 65.0;

        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            sprint: false,
            crouch: false,
            shoot: false
        };

        this.raycaster = new THREE.Raycaster();
        this.radarCanvas = document.getElementById('minimap-canvas');
        this.radarCtx = this.radarCanvas ? this.radarCanvas.getContext('2d') : null;

        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x101a2d);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
        this.camera.position.copy(this.playerPos);
        this.camera.rotation.order = 'YXZ';
        this.scene.add(this.camera);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.3;

        const container = document.getElementById('game-container');
        if (container) container.appendChild(this.renderer.domElement);

        this.particleEngine = new ParticleEngine(this.scene);
        this.weaponSystem = new WeaponSystem(this.camera, this.scene, this.particleEngine);
        this.map = new ArenaMap(this.scene);
        this.enemyManager = new EnemyManager(this.scene, this.particleEngine);

        this.bindEvents();
        this.animate();
    }

    bindEvents() {
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        window.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mouseup', (e) => this.onMouseUp(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('wheel', (e) => this.onMouseWheel(e));
        window.addEventListener('contextmenu', (e) => e.preventDefault());

        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === document.body) {
                this.isPaused = false;
                const pauseScreen = document.getElementById('pause-screen');
                if (pauseScreen) pauseScreen.classList.remove('active');
            } else {
                if (this.isPlaying && !this.isGameOver) {
                    this.pauseGame();
                }
            }
        });

        const btnStart = document.getElementById('btn-start');
        if (btnStart) btnStart.addEventListener('click', () => this.startGame());

        const btnResume = document.getElementById('btn-resume');
        if (btnResume) btnResume.addEventListener('click', () => this.resumeGame());

        const btnRestart = document.getElementById('btn-restart');
        if (btnRestart) btnRestart.addEventListener('click', () => this.restartGame());

        const btnRestartPause = document.getElementById('btn-restart-pause');
        if (btnRestartPause) btnRestartPause.addEventListener('click', () => this.restartGame());

        const btnHow = document.getElementById('btn-how-to-play');
        const modalHow = document.getElementById('controls-modal');
        const btnCloseHow = document.getElementById('btn-close-controls');
        if (btnHow && modalHow && btnCloseHow) {
            btnHow.addEventListener('click', () => modalHow.classList.add('active'));
            btnCloseHow.addEventListener('click', () => modalHow.classList.remove('active'));
        }

        const btnSettings = document.getElementById('btn-settings-open');
        const btnPauseSettings = document.getElementById('btn-pause-settings');
        const modalSettings = document.getElementById('settings-modal');
        const btnCloseSettings = document.getElementById('btn-close-settings');

        const openSettings = () => modalSettings.classList.add('active');
        if (btnSettings) btnSettings.addEventListener('click', openSettings);
        if (btnPauseSettings) btnPauseSettings.addEventListener('click', openSettings);
        if (btnCloseSettings) {
            btnCloseSettings.addEventListener('click', () => {
                modalSettings.classList.remove('active');
                if (this.isPlaying && !this.isPaused) {
                    document.body.requestPointerLock();
                }
            });
        }

        const sensSlider = document.getElementById('setting-sens');
        const sensVal = document.getElementById('setting-sens-val');
        if (sensSlider) {
            sensSlider.addEventListener('input', (e) => {
                this.mouseSensitivity = parseFloat(e.target.value);
                if (sensVal) sensVal.innerText = this.mouseSensitivity.toFixed(1);
            });
        }

        const fovSlider = document.getElementById('setting-fov');
        const fovVal = document.getElementById('setting-fov-val');
        if (fovSlider) {
            fovSlider.addEventListener('input', (e) => {
                const fov = parseInt(e.target.value);
                this.camera.fov = fov;
                this.camera.updateProjectionMatrix();
                if (fovVal) fovVal.innerText = `${fov}°`;
            });
        }

        const volSlider = document.getElementById('setting-vol');
        const volVal = document.getElementById('setting-vol-val');
        if (volSlider) {
            volSlider.addEventListener('input', (e) => {
                const vol = parseInt(e.target.value);
                if (window.soundEngine) window.soundEngine.setVolume(vol / 100);
                if (volVal) volVal.innerText = `${vol}%`;
            });
        }

        const crossColor = document.getElementById('setting-crosshair-color');
        if (crossColor) {
            crossColor.addEventListener('change', (e) => {
                const col = e.target.value;
                document.querySelectorAll('.crosshair-bar, .crosshair-dot').forEach(el => {
                    el.style.backgroundColor = col;
                    el.style.boxShadow = `0 0 6px ${col}`;
                });
            });
        }
    }

    onKeyDown(e) {
        if (!this.isPlaying || this.isPaused || this.isGameOver) return;

        switch (e.code) {
            case 'KeyW': this.keys.forward = true; break;
            case 'KeyS': this.keys.backward = true; break;
            case 'KeyA': this.keys.left = true; break;
            case 'KeyD': this.keys.right = true; break;
            case 'Space':
                if (this.isGrappling) {
                    this.releaseGrapple(true);
                } else if (this.onGround) {
                    this.playerVel.y = this.jumpForce;
                    this.onGround = false;
                    if (window.soundEngine) window.soundEngine.playJump();
                }
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                if (this.stamina > 15) this.keys.sprint = true;
                break;
            case 'KeyC':
            case 'ControlLeft':
                this.keys.crouch = true;
                break;
            case 'KeyR':
                this.weaponSystem.startReload();
                break;
            case 'KeyE':
            case 'KeyF':
                this.triggerGrapple();
                break;
            case 'Digit1': this.weaponSystem.selectWeapon(0); break;
            case 'Digit2': this.weaponSystem.selectWeapon(1); break;
            case 'Digit3': this.weaponSystem.selectWeapon(2); break;
            case 'Digit4': this.weaponSystem.selectWeapon(3); break;
            case 'Digit5': this.weaponSystem.selectWeapon(4); break;
        }
    }

    onKeyUp(e) {
        switch (e.code) {
            case 'KeyW': this.keys.forward = false; break;
            case 'KeyS': this.keys.backward = false; break;
            case 'KeyA': this.keys.left = false; break;
            case 'KeyD': this.keys.right = false; break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.keys.sprint = false;
                break;
            case 'KeyC':
            case 'ControlLeft':
                this.keys.crouch = false;
                break;
        }
    }

    onMouseDown(e) {
        if (!this.isPlaying || this.isPaused || this.isGameOver) return;
        if (e.button === 0) {
            this.keys.shoot = true;
            this.triggerShoot();
        } else if (e.button === 2) {
            if (this.weaponSystem.getCurrentWeapon().type === 'chainarm') {
                this.triggerGrapple();
            } else {
                this.weaponSystem.toggleScope();
            }
        }
    }

    onMouseUp(e) {
        if (e.button === 0) {
            this.keys.shoot = false;
            if (this.weaponSystem.isChargingRailgun && this.weaponSystem.railgunChargeProgress < this.weaponSystem.railgunChargeTime) {
                this.weaponSystem.isChargingRailgun = false;
                this.weaponSystem.railgunChargeProgress = 0;
            }
            if (this.isGrappling && this.weaponSystem.getCurrentWeapon().type === 'chainarm') {
                this.releaseGrapple(false);
            }
        }
    }

    onMouseMove(e) {
        if (!this.isPlaying || this.isPaused || this.isGameOver) return;
        if (document.pointerLockElement !== document.body) return;

        const sens = 0.002 * this.mouseSensitivity;
        this.yaw -= e.movementX * sens;
        this.pitch -= e.movementY * sens;

        this.pitch = Math.max(-Math.PI / 2 + 0.02, Math.min(Math.PI / 2 - 0.02, this.pitch));

        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;

        this.weaponSystem.applySway(e.movementX, e.movementY);
    }

    onMouseWheel(e) {
        if (!this.isPlaying || this.isPaused || this.isGameOver) return;
        if (e.deltaY > 0) {
            let next = (this.weaponSystem.currentWeaponIndex + 1) % this.weaponSystem.weapons.length;
            this.weaponSystem.selectWeapon(next);
        } else if (e.deltaY < 0) {
            let prev = (this.weaponSystem.currentWeaponIndex - 1 + this.weaponSystem.weapons.length) % this.weaponSystem.weapons.length;
            this.weaponSystem.selectWeapon(prev);
        }
    }

    startGame() {
        if (window.soundEngine) window.soundEngine.init();
        const startScreen = document.getElementById('start-screen');
        if (startScreen) startScreen.classList.remove('active');

        this.isPlaying = true;
        this.isPaused = false;
        this.isGameOver = false;

        this.health = 100;
        this.shield = 100;
        this.score = 0;
        this.totalKills = 0;
        this.headshots = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;

        this.playerPos.set(0, 1.8, 15);
        this.playerVel.set(0, 0, 0);

        this.isGrappling = false;
        this.grappleEnemy = null;

        document.body.requestPointerLock();
        this.enemyManager.startWave(1);
    }

    pauseGame() {
        this.isPaused = true;
        const pauseScreen = document.getElementById('pause-screen');
        if (pauseScreen) pauseScreen.classList.add('active');
    }

    resumeGame() {
        this.isPaused = false;
        const pauseScreen = document.getElementById('pause-screen');
        if (pauseScreen) pauseScreen.classList.remove('active');
        document.body.requestPointerLock();
    }

    restartGame() {
        location.reload();
    }

    shakeCamera(intensity = 0.2, duration = 0.35) {
        this.screenShakeIntensity = intensity;
        this.screenShakeTimer = duration;
    }

    triggerGrapple() {
        if (this.isGrappling) {
            this.releaseGrapple(true);
            return;
        }

        const shootDir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion).normalize();
        this.raycaster.set(this.camera.position, shootDir);
        this.raycaster.far = this.grappleMaxRange;

        const enemyMeshList = [];
        this.enemyManager.enemies.forEach(e => {
            e.group.traverse(child => {
                if (child.isMesh) {
                    child.userData = { enemy: e, isHead: (child === e.head) };
                    enemyMeshList.push(child);
                }
            });
        });

        const mapMeshes = this.map.colliders.map(c => c.mesh).filter(m => m !== null);
        const allTargets = enemyMeshList.concat(mapMeshes);

        const intersects = this.raycaster.intersectObjects(allTargets, true);

        if (intersects.length > 0) {
            const hit = intersects[0];
            this.isGrappling = true;
            this.grapplePoint.copy(hit.point);

            if (window.soundEngine) {
                window.soundEngine.playChainLaunch();
                setTimeout(() => window.soundEngine.playChainLatch(), 60);
                setTimeout(() => window.soundEngine.playChainReel(), 120);
            }

            if (hit.object.userData && hit.object.userData.enemy) {
                this.grappleEnemy = hit.object.userData.enemy;
            } else {
                this.grappleEnemy = null;
            }

            this.weaponSystem.applyRecoil(0.12, 0.1);
        } else {
            if (window.soundEngine) window.soundEngine.playChainLaunch();
        }
    }

    releaseGrapple(isSlingshot = false) {
        if (!this.isGrappling) return;
        this.isGrappling = false;
        this.grappleEnemy = null;
        this.particleEngine.updateGrappleChain(this.playerPos, this.playerPos, false);

        if (isSlingshot) {
            const lookDir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion).normalize();
            this.playerVel.addScaledVector(lookDir, 14.0);
            this.playerVel.y = Math.max(this.playerVel.y + 8.0, 10.0);
            if (window.soundEngine) window.soundEngine.playJump();
        }
    }

    executeSanabiSlam(enemy) {
        if (window.soundEngine) window.soundEngine.playChainExecution();
        this.shakeCamera(0.45, 0.5);

        this.particleEngine.createExecutionSlamFX(enemy.group.position);

        const result = this.enemyManager.applyDamage(enemy, 320, true);
        this.showHitmarker(true);
        this.addScore(result.score * 1.5, true);

        if (result.killed) {
            this.totalKills++;
            this.headshots++;
            this.addKillfeed('SANABI CHAIN SLAM', enemy.name, true);
        }

        this.playerVel.set(0, 12.0, 0);
        this.releaseGrapple(false);
    }

    triggerShoot() {
        const w = this.weaponSystem.getCurrentWeapon();
        const now = performance.now() / 1000;

        if (this.weaponSystem.isReloading) return;
        if (now - this.weaponSystem.lastShotTime < w.fireRate) return;

        if (w.type === 'chainarm') {
            this.triggerGrapple();
            this.weaponSystem.lastShotTime = now;
            return;
        }

        if (w.currentMag <= 0) {
            if (window.soundEngine) window.soundEngine.playEmpty();
            this.weaponSystem.startReload();
            return;
        }

        if (w.type === 'railgun') {
            if (!this.weaponSystem.isChargingRailgun) {
                this.weaponSystem.isChargingRailgun = true;
                this.weaponSystem.railgunChargeProgress = 0;
                if (window.soundEngine) window.soundEngine.playRailgunCharge();
            }
            return;
        }

        w.currentMag--;
        this.weaponSystem.lastShotTime = now;
        this.shotsFired++;

        if (window.soundEngine) window.soundEngine.playShoot(w.type);

        this.weaponSystem.applyRecoil(w.recoilKick, w.recoilPitch);

        const crosshair = document.getElementById('crosshair-container');
        if (crosshair) {
            crosshair.classList.add('spread');
            setTimeout(() => crosshair.classList.remove('spread'), 100);
        }

        const muzzlePos = this.weaponSystem.getMuzzleWorldPosition();
        this.particleEngine.createMuzzleFlash(muzzlePos, w.color, 0.5);

        if (w.type === 'rocket') {
            const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion).normalize();
            this.weaponSystem.fireRocket(muzzlePos, dir);
        } else {
            const pelletCount = w.pellets || 1;
            for (let i = 0; i < pelletCount; i++) {
                this.fireHitscanBullet(w, muzzlePos);
            }
        }
    }

    fireSupernovaMegaBeam() {
        const w = this.weaponSystem.getCurrentWeapon();
        const now = performance.now() / 1000;

        w.currentMag--;
        this.weaponSystem.lastShotTime = now;
        this.weaponSystem.isChargingRailgun = false;
        this.weaponSystem.railgunChargeProgress = 0;
        this.shotsFired++;

        const muzzlePos = this.weaponSystem.getMuzzleWorldPosition();
        const shootDir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion).normalize();

        if (window.soundEngine) window.soundEngine.playRailgunBlast();
        this.shakeCamera(0.35, 0.5);
        this.weaponSystem.applyRecoil(w.recoilKick, w.recoilPitch);

        this.particleEngine.createMegaLaserBeam(muzzlePos, shootDir, 100);

        const beamRadius = 1.4;

        this.enemyManager.enemies.slice().forEach(enemy => {
            const enemyCenter = enemy.group.position.clone().add(new THREE.Vector3(0, enemy.height * 0.5, 0));
            const toEnemy = enemyCenter.clone().sub(muzzlePos);
            const projection = toEnemy.dot(shootDir);

            if (projection > 0 && projection < 100) {
                const closestPoint = muzzlePos.clone().addScaledVector(shootDir, projection);
                const distToBeam = enemyCenter.distanceTo(closestPoint);

                if (distToBeam <= beamRadius + 0.8) {
                    this.shotsHit++;
                    const result = this.enemyManager.applyDamage(enemy, w.damage, true);
                    this.showHitmarker(true);
                    this.addScore(result.score, true);

                    if (result.killed) {
                        this.totalKills++;
                        this.headshots++;
                        this.addKillfeed('SUPERNOVA BEAM', enemy.name, true);
                    }
                }
            }
        });
    }

    fireHitscanBullet(weapon, muzzlePos) {
        const spreadX = (Math.random() - 0.5) * weapon.spread * (this.weaponSystem.isScoped ? 0.2 : 1.0);
        const spreadY = (Math.random() - 0.5) * weapon.spread * (this.weaponSystem.isScoped ? 0.2 : 1.0);

        const shootDir = new THREE.Vector3(spreadX, spreadY, -1).applyQuaternion(this.camera.quaternion).normalize();
        this.raycaster.set(this.camera.position, shootDir);

        const enemyMeshList = [];
        this.enemyManager.enemies.forEach(e => {
            e.group.traverse(child => {
                if (child.isMesh) {
                    child.userData = { enemy: e, isHead: (child === e.head) };
                    enemyMeshList.push(child);
                }
            });
        });

        const mapMeshes = this.map.colliders.map(c => c.mesh).filter(m => m !== null);
        const allTargets = enemyMeshList.concat(mapMeshes);

        const intersects = this.raycaster.intersectObjects(allTargets, true);

        if (intersects.length > 0) {
            const hit = intersects[0];
            const endPos = hit.point;

            this.particleEngine.createTracer(muzzlePos, endPos, weapon.color);

            if (hit.object.userData && hit.object.userData.enemy) {
                this.shotsHit++;
                const enemy = hit.object.userData.enemy;
                const isHeadshot = hit.object.userData.isHead;

                const result = this.enemyManager.applyDamage(enemy, weapon.damage, isHeadshot);

                this.showHitmarker(isHeadshot);
                if (window.soundEngine) window.soundEngine.playHitmarker(isHeadshot);

                this.addScore(result.score, isHeadshot);

                if (result.killed) {
                    this.totalKills++;
                    if (isHeadshot) this.headshots++;
                    this.addKillfeed(weapon.name, enemy.name, isHeadshot);
                }
            } else {
                this.particleEngine.createImpactSparks(endPos, hit.face ? hit.face.normal : new THREE.Vector3(0, 1, 0), 8, weapon.color);
            }
        } else {
            const endPos = this.camera.position.clone().addScaledVector(shootDir, 80);
            this.particleEngine.createTracer(muzzlePos, endPos, weapon.color);
        }
    }

    showHitmarker(isHeadshot) {
        const hm = document.getElementById('hitmarker');
        if (!hm) return;
        hm.classList.remove('active', 'headshot');
        void hm.offsetWidth;
        if (isHeadshot) hm.classList.add('headshot');
        hm.classList.add('active');
        setTimeout(() => hm.classList.remove('active'), 120);
    }

    addScore(amount, isHeadshot) {
        this.combo++;
        this.comboTimer = 4.0;
        const multiplier = Math.min(5, Math.floor(1 + this.combo / 4));
        this.score += amount * multiplier;

        const comboEl = document.getElementById('hud-combo');
        if (comboEl) {
            comboEl.innerText = `x${multiplier} COMBO`;
            comboEl.classList.add('active');
        }
    }

    addKillfeed(weaponName, enemyName, isHeadshot) {
        const kf = document.getElementById('killfeed');
        if (!kf) return;

        const item = document.createElement('div');
        item.className = `killfeed-item ${isHeadshot ? 'headshot' : ''}`;
        item.innerHTML = `<span>PLAYER</span> <span>[${weaponName}]</span> <span>${enemyName}</span> ${isHeadshot ? '🎯' : '💥'}`;
        kf.appendChild(item);

        setTimeout(() => {
            if (kf.contains(item)) kf.removeChild(item);
        }, 3500);
    }

    onPlayerDamaged(damage) {
        if (this.isGameOver) return;
        this.lastDamageTime = performance.now() / 1000;

        if (this.shield > 0) {
            if (window.soundEngine) window.soundEngine.playShieldHit();
            const absorbed = Math.min(this.shield, damage);
            this.shield -= absorbed;
            damage -= absorbed;
        }

        if (damage > 0) {
            if (window.soundEngine) window.soundEngine.playPlayerHurt();
            this.health = Math.max(0, this.health - damage);
        }

        const dmgOverlay = document.getElementById('damage-overlay');
        if (dmgOverlay) {
            dmgOverlay.classList.add('active');
            setTimeout(() => dmgOverlay.classList.remove('active'), 150);
        }

        if (this.health <= 0) {
            this.triggerGameOver();
        }
    }

    triggerGameOver() {
        this.isGameOver = true;
        this.isPlaying = false;
        this.releaseGrapple(false);
        document.exitPointerLock();

        const goScreen = document.getElementById('gameover-screen');
        if (goScreen) {
            goScreen.classList.add('active');
            document.getElementById('go-wave').innerText = this.enemyManager.currentWave;
            document.getElementById('go-kills').innerText = this.totalKills;
            document.getElementById('go-headshots').innerText = this.headshots;
            const acc = this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 0;
            document.getElementById('go-acc').innerText = `${acc}%`;
            document.getElementById('go-score').innerText = this.score.toString().padStart(6, '0');
        }
    }

    // =========================================================================
    // ROBUST 3D SWEPT COLLISION & PHYSICS ENGINE (ZERO TUNNELING / ZERO CLIPPING)
    // =========================================================================
    updatePlayerPhysics(dt) {
        // 1. Calculate Intent / Velocity
        if (this.isGrappling) {
            if (this.grappleEnemy) {
                if (this.grappleEnemy.hp <= 0) {
                    this.releaseGrapple(false);
                } else {
                    this.grapplePoint.copy(this.grappleEnemy.group.position).add(new THREE.Vector3(0, this.grappleEnemy.height * 0.5, 0));
                }
            }

            const targetPos = this.grapplePoint;
            const toTarget = targetPos.clone().sub(this.playerPos);
            const dist = toTarget.length();

            const handPos = this.weaponSystem.getMuzzleWorldPosition();
            this.particleEngine.updateGrappleChain(handPos, targetPos, true);

            const pullDir = toTarget.clone().normalize();
            this.playerVel.copy(pullDir.multiplyScalar(this.grappleSpeed));

            if (this.grappleEnemy && dist < 2.2) {
                this.executeSanabiSlam(this.grappleEnemy);
            } else if (dist < 1.6) {
                this.releaseGrapple(false);
            }
        } else {
            if (this.keys.sprint && (this.keys.forward || this.keys.backward || this.keys.left || this.keys.right) && this.stamina > 0) {
                this.isSprinting = true;
                this.stamina = Math.max(0, this.stamina - dt * 25);
                if (this.stamina <= 0) this.keys.sprint = false;
            } else {
                this.isSprinting = false;
                this.stamina = Math.min(this.maxStamina, this.stamina + dt * 18);
            }

            const curSpeed = this.keys.crouch ? this.crouchSpeed : (this.isSprinting ? this.sprintSpeed : this.walkSpeed);

            const moveDir = new THREE.Vector3();
            if (this.keys.forward) moveDir.z -= 1;
            if (this.keys.backward) moveDir.z += 1;
            if (this.keys.left) moveDir.x -= 1;
            if (this.keys.right) moveDir.x += 1;

            if (moveDir.lengthSq() > 0) {
                moveDir.normalize();
                moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
            }

            this.playerVel.x = THREE.MathUtils.lerp(this.playerVel.x, moveDir.x * curSpeed, dt * 15);
            this.playerVel.z = THREE.MathUtils.lerp(this.playerVel.z, moveDir.z * curSpeed, dt * 15);
            this.playerVel.y += this.gravity * dt;
        }

        // 2. Sub-stepping for Bulletproof Collision Resolution (2 sub-steps per frame)
        const subSteps = 2;
        const subDt = dt / subSteps;
        const pRadius = this.playerRadius;
        const pHeight = this.keys.crouch ? this.crouchHeight : this.playerHeight;
        const stepUpLimit = 0.6; // Automatically step up small obstacles/stairs

        for (let step = 0; step < subSteps; step++) {
            // A. Move X-axis & Resolve Horizontal Collisions
            this.playerPos.x += this.playerVel.x * subDt;
            for (let i = 0; i < this.map.colliders.length; i++) {
                const b = this.map.colliders[i];
                // Check if vertical overlapping with box
                const feetY = this.playerPos.y - pHeight;
                const headY = this.playerPos.y;
                if (headY > b.min.y && feetY < b.max.y - stepUpLimit) {
                    if (this.playerPos.z + pRadius > b.min.z && this.playerPos.z - pRadius < b.max.z) {
                        if (this.playerPos.x + pRadius > b.min.x && this.playerPos.x - pRadius < b.max.x) {
                            if (this.playerVel.x > 0) {
                                this.playerPos.x = b.min.x - pRadius;
                                this.playerVel.x = 0;
                            } else if (this.playerVel.x < 0) {
                                this.playerPos.x = b.max.x + pRadius;
                                this.playerVel.x = 0;
                            }
                        }
                    }
                }
            }

            // B. Move Z-axis & Resolve Horizontal Collisions
            this.playerPos.z += this.playerVel.z * subDt;
            for (let i = 0; i < this.map.colliders.length; i++) {
                const b = this.map.colliders[i];
                const feetY = this.playerPos.y - pHeight;
                const headY = this.playerPos.y;
                if (headY > b.min.y && feetY < b.max.y - stepUpLimit) {
                    if (this.playerPos.x + pRadius > b.min.x && this.playerPos.x - pRadius < b.max.x) {
                        if (this.playerPos.z + pRadius > b.min.z && this.playerPos.z - pRadius < b.max.z) {
                            if (this.playerVel.z > 0) {
                                this.playerPos.z = b.min.z - pRadius;
                                this.playerVel.z = 0;
                            } else if (this.playerVel.z < 0) {
                                this.playerPos.z = b.max.z + pRadius;
                                this.playerVel.z = 0;
                            }
                        }
                    }
                }
            }

            // C. Move Y-axis & Resolve Ground/Ceiling/Ramp Collisions
            this.playerPos.y += this.playerVel.y * subDt;

            let highestGroundY = 0; // Default floor y = 0

            // Check if player is standing on a sloped ramp
            const rampY = this.map.getRampHeightAt(this.playerPos.x, this.playerPos.z);
            if (rampY !== null) {
                highestGroundY = Math.max(highestGroundY, rampY);
            }

            // Check box top surfaces (crates, platforms, balconies)
            for (let i = 0; i < this.map.colliders.length; i++) {
                const b = this.map.colliders[i];
                if (this.playerPos.x + pRadius * 0.7 > b.min.x && this.playerPos.x - pRadius * 0.7 < b.max.x &&
                    this.playerPos.z + pRadius * 0.7 > b.min.z && this.playerPos.z - pRadius * 0.7 < b.max.z) {
                    // If feet are above or within step-up range of box top
                    const feetY = this.playerPos.y - pHeight;
                    if (feetY >= b.max.y - 0.75) {
                        highestGroundY = Math.max(highestGroundY, b.max.y);
                    }
                }
            }

            // Ground Landing Resolution
            if (this.playerPos.y - pHeight <= highestGroundY) {
                this.playerPos.y = highestGroundY + pHeight;
                this.playerVel.y = 0;
                this.onGround = true;
            } else {
                this.onGround = false;
            }

            // Arena Perimeter Boundary Clamping
            this.playerPos.x = THREE.MathUtils.clamp(this.playerPos.x, -37.5, 37.5);
            this.playerPos.z = THREE.MathUtils.clamp(this.playerPos.z, -37.5, 37.5);
        }

        // 3. Camera Positioning & Shake
        if (this.screenShakeTimer > 0) {
            this.screenShakeTimer -= dt;
            const shakeX = (Math.random() - 0.5) * this.screenShakeIntensity;
            const shakeY = (Math.random() - 0.5) * this.screenShakeIntensity;
            const shakeZ = (Math.random() - 0.5) * this.screenShakeIntensity;
            this.camera.position.set(this.playerPos.x + shakeX, this.playerPos.y + shakeY, this.playerPos.z + shakeZ);
        } else {
            this.camera.position.copy(this.playerPos);
        }

        // 4. Jump Pad Boost
        const prompt = document.getElementById('interaction-prompt');
        let onJumpPad = false;
        this.map.jumpPads.forEach(pad => {
            const d = new THREE.Vector2(this.playerPos.x - pad.position.x, this.playerPos.z - pad.position.z).length();
            if (d < pad.radius && this.playerPos.y < 2.5) {
                onJumpPad = true;
                this.playerVel.y = pad.launchForce;
                this.onGround = false;
                if (window.soundEngine) window.soundEngine.playJumpPad();
            }
        });

        if (prompt) {
            if (onJumpPad) {
                prompt.innerText = "⚡ JUMP PAD BOOSTED ⚡";
                prompt.classList.add('active');
                setTimeout(() => prompt.classList.remove('active'), 1000);
            }
        }

        // 5. Footsteps
        const isMoving = (this.keys.forward || this.keys.backward || this.keys.left || this.keys.right) && this.onGround;
        if (isMoving && !this.isGrappling) {
            this.footstepTimer += dt * (this.isSprinting ? 1.6 : 1.0);
            if (this.footstepTimer >= 0.4) {
                this.footstepTimer = 0;
                if (window.soundEngine) window.soundEngine.playFootstep();
            }
        }

        // 6. Holographic Item Pickups
        this.particleEngine.pickups.forEach(pk => {
            if (!pk.active) return;
            const dist = this.playerPos.distanceTo(pk.group.position);
            if (dist < 2.0) {
                pk.active = false;
                if (pk.type === 'health') {
                    this.health = Math.min(this.maxHealth, this.health + 40);
                    if (window.soundEngine) window.soundEngine.playPickup('health');
                } else if (pk.type === 'shield') {
                    this.shield = Math.min(this.maxShield, this.shield + 50);
                    if (window.soundEngine) window.soundEngine.playPickup('shield');
                } else {
                    this.weaponSystem.weapons.forEach(w => {
                        if (w.type !== 'chainarm') w.reserveAmmo += w.magSize * 2;
                    });
                    if (window.soundEngine) window.soundEngine.playPickup('ammo');
                }
            }
        });

        // 7. Shield Regeneration
        const now = performance.now() / 1000;
        if (now - this.lastDamageTime > 4.0 && this.shield < this.maxShield) {
            this.shield = Math.min(this.maxShield, this.shield + dt * 25);
        }

        // 8. Combo Expiry
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) {
                this.combo = 0;
                const comboEl = document.getElementById('hud-combo');
                if (comboEl) comboEl.classList.remove('active');
            }
        }
    }

    updateRocketExplosions() {
        const projectiles = this.weaponSystem.projectiles;
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const p = projectiles[i];
            let hit = false;
            let hitPos = p.mesh.position.clone();

            if (p.mesh.position.y <= 0.2) {
                hit = true;
                hitPos.y = 0.2;
            }

            if (!hit) {
                this.map.colliders.forEach(col => {
                    if (col.box.containsPoint(p.mesh.position)) {
                        hit = true;
                    }
                });
            }

            if (!hit) {
                this.enemyManager.enemies.forEach(e => {
                    if (p.mesh.position.distanceTo(e.group.position) < 1.5) {
                        hit = true;
                    }
                });
            }

            if (hit) {
                this.particleEngine.createExplosion(hitPos, p.splashRadius);
                if (window.soundEngine) window.soundEngine.playExplosion(true);
                this.shakeCamera(0.18, 0.25);

                this.enemyManager.enemies.forEach(e => {
                    const dist = hitPos.distanceTo(e.group.position);
                    if (dist <= p.splashRadius) {
                        const falloff = 1 - (dist / p.splashRadius);
                        const dmg = Math.floor(p.damage * falloff);
                        const res = this.enemyManager.applyDamage(e, dmg, false);
                        this.showHitmarker(false);
                        this.addScore(res.score, false);
                        if (res.killed) {
                            this.totalKills++;
                            this.addKillfeed('ROCKET', e.name, false);
                        }
                    }
                });

                this.scene.remove(p.mesh);
                projectiles.splice(i, 1);
            }
        }
    }

    renderMinimap() {
        if (!this.radarCtx) return;
        const ctx = this.radarCtx;
        const w = this.radarCanvas.width;
        const h = this.radarCanvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const scale = 1.4;

        ctx.clearRect(0, 0, w, h);

        ctx.strokeStyle = 'rgba(0, 243, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx.arc(cx, cy, 55, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
        ctx.moveTo(0, cy); ctx.lineTo(w, cy);
        ctx.stroke();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-this.yaw);
        const pSize = 22 * scale;
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.4)';
        ctx.strokeRect(-pSize / 2 - this.playerPos.x * scale, -pSize / 2 + this.playerPos.z * scale, pSize, pSize);

        this.enemyManager.enemies.forEach(e => {
            const ex = (e.group.position.x - this.playerPos.x) * scale;
            const ez = (e.group.position.z - this.playerPos.z) * scale;

            ctx.fillStyle = e.type === 'goliath' ? '#ff0055' : (e.type === 'soldier' ? '#ffaa00' : '#ff3366');
            ctx.beginPath();
            ctx.arc(ex, -ez, e.type === 'goliath' ? 5 : 3.5, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();

        ctx.fillStyle = '#00f3ff';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 6);
        ctx.lineTo(cx - 5, cy + 5);
        ctx.lineTo(cx, cy + 2);
        ctx.lineTo(cx + 5, cy + 5);
        ctx.closePath();
        ctx.fill();
    }

    updateHUD() {
        const hpBar = document.getElementById('hud-health-bar');
        const hpText = document.getElementById('hud-health-text');
        if (hpBar && hpText) {
            hpBar.style.width = `${(this.health / this.maxHealth) * 100}%`;
            hpText.innerText = Math.round(this.health);
        }

        const shBar = document.getElementById('hud-shield-bar');
        const shText = document.getElementById('hud-shield-text');
        if (shBar && shText) {
            shBar.style.width = `${(this.shield / this.maxShield) * 100}%`;
            shText.innerText = Math.round(this.shield);
        }

        const stBar = document.getElementById('hud-stamina-bar');
        if (stBar) {
            stBar.style.width = `${(this.stamina / this.maxStamina) * 100}%`;
        }

        const lowVignette = document.getElementById('low-hp-vignette');
        if (lowVignette) {
            if (this.health < 30) lowVignette.classList.add('pulsing');
            else lowVignette.classList.remove('pulsing');
        }

        const curW = this.weaponSystem.getCurrentWeapon();
        const ammoCur = document.getElementById('hud-ammo-cur');
        const ammoRes = document.getElementById('hud-ammo-res');
        const wName = document.getElementById('hud-weapon-name');
        const reloadPrompt = document.getElementById('reload-prompt');

        if (ammoCur && ammoRes && wName) {
            if (curW.type === 'chainarm') {
                ammoCur.innerText = '∞';
                ammoRes.innerText = 'WIRE';
                wName.innerText = 'SANABI CHAIN ARM';
                if (reloadPrompt) reloadPrompt.classList.remove('active');
            } else {
                ammoCur.innerText = curW.currentMag;
                ammoRes.innerText = curW.reserveAmmo;
                wName.innerText = curW.name;

                if (curW.currentMag <= curW.magSize * 0.25) {
                    ammoCur.classList.add('low');
                    if (reloadPrompt && !this.weaponSystem.isReloading) reloadPrompt.classList.add('active');
                } else {
                    ammoCur.classList.remove('low');
                    if (reloadPrompt) reloadPrompt.classList.remove('active');
                }
            }
        }

        const scoreEl = document.getElementById('hud-score');
        if (scoreEl) scoreEl.innerText = this.score.toString().padStart(6, '0');

        const waveEl = document.getElementById('hud-wave');
        if (waveEl) waveEl.innerText = this.enemyManager.currentWave;

        const enemiesLeft = document.getElementById('hud-enemies-left');
        if (enemiesLeft) {
            const count = this.enemyManager.enemiesToSpawn + this.enemyManager.enemies.length;
            enemiesLeft.innerText = `ENEMIES: ${count}`;
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const dt = Math.min(this.clock.getDelta(), 0.1);

        if (this.isPlaying && !this.isPaused && !this.isGameOver) {
            if (this.keys.shoot && this.weaponSystem.getCurrentWeapon().isAuto) {
                this.triggerShoot();
            }

            if (this.weaponSystem.isChargingRailgun && this.weaponSystem.railgunChargeProgress >= this.weaponSystem.railgunChargeTime) {
                this.fireSupernovaMegaBeam();
            }

            const isMoving = this.keys.forward || this.keys.backward || this.keys.left || this.keys.right;

            this.updatePlayerPhysics(dt);
            this.weaponSystem.update(dt, isMoving, this.isSprinting, this.isGrappling);
            this.updateRocketExplosions();
            this.enemyManager.update(dt, this.playerPos, (dmg) => this.onPlayerDamaged(dmg));
            this.particleEngine.update(dt);
            this.renderMinimap();
            this.updateHUD();
        }

        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new CyberStrikeGame();
});
