// js/entities/player.js - 1인칭 플레이어 컨트롤러 및 상태 관리

import { soundEngine } from '../engine/audio.js';
import { physicsWorld } from '../engine/physics.js';
import { createArsenal } from './weapons.js';

export class Player {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;

        this.name = 'AGENT (YOU)';
        this.position = new THREE.Vector3(0, 1.5, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.radius = 0.5;
        this.normalHeight = 1.8;
        this.crouchHeight = 1.0;
        this.height = this.normalHeight;

        // 체력 & 쉴드
        this.maxHp = 100;
        this.hp = 100;
        this.maxShield = 100;
        this.shield = 100;
        this.isAlive = true;
        this.respawnTimer = 0;

        // 점수
        this.kills = 0;
        this.deaths = 0;
        this.score = 0;
        this.killStreak = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;

        // 이동 및 입력 상태 먼저 초기화
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            sprint: false,
            crouch: false,
            jump: false,
            shoot: false,
            aim: false
        };

        // 카메라를 씬에 추가 (뷰모델 자식 렌더링 필수)
        if (!this.scene.children.includes(this.camera)) {
            this.scene.add(this.camera);
        }

        // 무기 인벤토리
        this.weapons = createArsenal(this.camera);
        this.currentWeaponIndex = 0;
        this.selectWeapon(0);

        // 시점 각도 (라디안)
        this.yaw = 0;
        this.pitch = 0;
        this.mouseSensitivity = 0.0022;

        // 이동 스펙
        this.walkSpeed = 9.0;
        this.sprintSpeed = 14.5;
        this.crouchSpeed = 5.0;
        this.jumpForce = 11.5;
        this.isGrounded = false;
        this.isSliding = false;
        this.slideTimer = 0;

        // 헤드밥 & 카메라 셰이크
        this.headbobTimer = 0;
        this.cameraShake = 0;
        this.stepTimer = 0;

        this.initControls();
    }

    initControls() {
        // 키보드 이벤트
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));

        // 마우스 클릭 및 시점 회전
        window.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mouseup', (e) => this.onMouseUp(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('wheel', (e) => this.onMouseWheel(e));
    }

    onKeyDown(e) {
        if (!this.isAlive) return;

        switch (e.code) {
            case 'KeyW': this.keys.forward = true; break;
            case 'KeyS': this.keys.backward = true; break;
            case 'KeyA': this.keys.left = true; break;
            case 'KeyD': this.keys.right = true; break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.keys.sprint = true;
                break;
            case 'KeyC':
                this.keys.crouch = true;
                if (this.keys.sprint && this.isGrounded && !this.isSliding) {
                    this.isSliding = true;
                    this.slideTimer = 0.8;
                }
                break;
            case 'Space':
                if (this.isGrounded) {
                    this.velocity.y = this.jumpForce;
                    this.isGrounded = false;
                }
                break;
            case 'KeyR':
                this.currentWeapon.reload();
                break;
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
            case 'ShiftLeft':
            case 'ShiftRight':
                this.keys.sprint = false;
                break;
            case 'KeyC':
                this.keys.crouch = false;
                this.isSliding = false;
                break;
            case 'Tab':
                e.preventDefault();
                if (window.hudManager) window.hudManager.toggleScoreboard(false);
                break;
        }
    }

    onMouseDown(e) {
        if (document.pointerLockElement !== document.body) return;
        if (e.button === 0) { // 좌클릭 발사
            this.keys.shoot = true;
        } else if (e.button === 2) { // 우클릭 조준
            this.keys.aim = true;
            this.setAimScope(true);
        }
    }

    onMouseUp(e) {
        if (e.button === 0) {
            this.keys.shoot = false;
        } else if (e.button === 2) {
            this.keys.aim = false;
            this.setAimScope(false);
        }
    }

    onMouseMove(e) {
        if (document.pointerLockElement !== document.body) return;

        this.yaw -= e.movementX * this.mouseSensitivity;
        this.pitch -= e.movementY * this.mouseSensitivity;

        // 시점 상하 89도 제한
        const maxPitch = Math.PI / 2 - 0.02;
        this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
    }

    onMouseWheel(e) {
        if (document.pointerLockElement !== document.body) return;
        if (e.deltaY > 0) {
            this.selectWeapon((this.currentWeaponIndex + 1) % this.weapons.length);
        } else if (e.deltaY < 0) {
            this.selectWeapon((this.currentWeaponIndex - 1 + this.weapons.length) % this.weapons.length);
        }
    }

    selectWeapon(index) {
        if (index < 0 || index >= this.weapons.length) return;
        this.weapons.forEach((w, i) => w.setVisible(i === index));
        this.currentWeaponIndex = index;
        this.currentWeapon = this.weapons[index];
        this.setAimScope(this.keys.aim);
    }

    getCurrentWeaponName() {
        return this.currentWeapon ? this.currentWeapon.name : 'RIFLE';
    }

    setAimScope(active) {
        this.currentWeapon.isScoped = active;
        if (this.currentWeapon.type === 'sniper' && active) {
            this.camera.fov = 25; // 3배 확대
            document.getElementById('sniper-scope').classList.add('active');
        } else {
            this.camera.fov = active ? 60 : 75;
            document.getElementById('sniper-scope').classList.remove('active');
        }
        this.camera.updateProjectionMatrix();
    }

    takeDamage(amount, attacker, isHeadshot = false) {
        if (!this.isAlive) return false;

        soundEngine.playPlayerHurt();
        this.cameraShake = 0.4;

        // 실드 우선 소모
        if (this.shield > 0) {
            const shieldDmg = Math.min(this.shield, amount);
            this.shield -= shieldDmg;
            amount -= shieldDmg;
        }

        if (amount > 0) {
            this.hp = Math.max(0, this.hp - amount);
        }

        // 피격 비넷 효과
        if (window.hudManager) {
            window.hudManager.triggerDamageVignette(this.hp <= 30);
        }

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
        this.respawnTimer = 3.0; // 3초 후 부활
        this.setAimScope(false);
    }

    respawn(spawnPos) {
        this.hp = this.maxHp;
        this.shield = this.maxShield;
        this.position.copy(spawnPos);
        this.velocity.set(0, 0, 0);
        this.isAlive = true;
        this.weapons.forEach(w => w.refillAmmo());
    }

    update(dt, projectileManager, bots, onKillCallback) {
        if (!this.isAlive) {
            this.respawnTimer -= dt;
            return;
        }

        // 1. 이동 방향 벡터 계산
        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

        let moveDir = new THREE.Vector3();
        if (this.keys.forward) moveDir.add(forward);
        if (this.keys.backward) moveDir.sub(forward);
        if (this.keys.right) moveDir.add(right);
        if (this.keys.left) moveDir.sub(right);
        moveDir.normalize();

        // 2. 이동 속도 설정
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

        // 3. 물리 엔진 충돌 처리
        const moveResult = physicsWorld.moveEntity(
            this.position,
            this.velocity,
            this.radius,
            this.height,
            dt,
            this.isGrounded
        );
        this.isGrounded = moveResult.isGrounded;
        if (moveResult.hitJumpPad) {
            soundEngine.playJumpPad();
        }

        // 4. 발소리 & 헤드밥
        if (this.isGrounded && moveDir.lengthSq() > 0) {
            this.headbobTimer += dt * (this.keys.sprint ? 14 : 9);
            this.stepTimer -= dt;
            if (this.stepTimer <= 0) {
                soundEngine.playFootstep();
                this.stepTimer = this.keys.sprint ? 0.28 : 0.42;
            }
        } else {
            this.headbobTimer = 0;
        }

        // 5. 카메라 위치 및 회전 동기화
        const headbobY = Math.sin(this.headbobTimer) * (this.keys.sprint ? 0.08 : 0.04);
        const headbobX = Math.cos(this.headbobTimer * 0.5) * 0.03;

        // 카메라 흔들림 감쇄
        let shakeOffset = new THREE.Vector3();
        if (this.cameraShake > 0) {
            this.cameraShake -= dt * 1.5;
            shakeOffset.set(
                (Math.random() - 0.5) * this.cameraShake * 0.4,
                (Math.random() - 0.5) * this.cameraShake * 0.4,
                (Math.random() - 0.5) * this.cameraShake * 0.4
            );
        }

        const eyeHeight = this.height * 0.9;
        this.camera.position.set(
            this.position.x + headbobX + shakeOffset.x,
            this.position.y + eyeHeight + headbobY + shakeOffset.y,
            this.position.z + shakeOffset.z
        );

        this.camera.rotation.set(0, 0, 0);
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;

        // 6. 무기 업데이트 & 사격
        const swayX = Math.sin(this.headbobTimer * 0.5) * 0.01;
        const swayY = Math.abs(Math.sin(this.headbobTimer)) * 0.01;
        this.currentWeapon.update(dt, swayX, swayY);

        if (this.keys.shoot) {
            this.triggerWeaponShoot(projectileManager, bots, onKillCallback);
        }
    }

    triggerWeaponShoot(projectileManager, bots, onKillCallback) {
        if (!this.currentWeapon.shoot()) return;

        this.shotsFired++;
        const shootOrigin = this.camera.position.clone();
        const shootDir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);

        if (this.currentWeapon.type === 'projectile') {
            // 로켓 발사
            projectileManager.spawnRocket(
                shootOrigin,
                shootDir,
                this,
                this.currentWeapon.damage,
                6.0
            );
        } else {
            // 히트스캔 (라이플, 샷건, 스나이퍼)
            projectileManager.processHitscan(
                shootOrigin,
                shootDir,
                150,
                this.currentWeapon.damage,
                this.currentWeapon.spread * (this.isGrounded ? 1.0 : 2.5),
                this.currentWeapon.pellets,
                this,
                this,
                bots,
                onKillCallback
            );
        }
    }
}
