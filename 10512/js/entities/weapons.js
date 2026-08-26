// js/entities/weapons.js - 무기 데이터, 3D 뷰모델 절차적 생성 및 반동 시스템

import { soundEngine } from '../engine/audio.js';

export class Weapon {
    constructor(config, camera) {
        this.name = config.name;
        this.type = config.type; // 'hitscan' | 'shotgun' | 'sniper' | 'projectile'
        this.damage = config.damage;
        this.fireRate = config.fireRate; // 초당 발사 간격
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

        // 뷰모델 (1인칭 총기 3D 모델)
        this.viewModel = this.createViewModel(config.modelType, config.themeColor);
        this.initialPos = new THREE.Vector3(0.28, -0.25, -0.5);
        this.initialRot = new THREE.Euler(0, 0, 0);
        this.viewModel.position.copy(this.initialPos);
        this.camera.add(this.viewModel);

        // 총구 화염 조명
        this.muzzleLight = new THREE.PointLight(config.themeColor, 0, 8);
        this.muzzleLight.position.set(0, 0.05, -0.7);
        this.viewModel.add(this.muzzleLight);
        this.muzzleFlashTimer = 0;

        // 반동 및 스웨이 상태
        this.recoilOffset = new THREE.Vector3();
        this.recoilRot = new THREE.Vector3();
    }

    createViewModel(modelType, themeColor) {
        const group = new THREE.Group();

        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x151b26,
            metalness: 0.85,
            roughness: 0.25
        });

        const accentMat = new THREE.MeshBasicMaterial({ color: themeColor });

        if (modelType === 'rifle') {
            // 어썰트 라이플
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.5), bodyMat);
            const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 12), bodyMat);
            barrel.rotation.x = Math.PI / 2;
            barrel.position.set(0, 0.02, -0.35);

            const mag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.08), bodyMat);
            mag.position.set(0, -0.12, -0.05);

            const neonLine = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.015, 0.4), accentMat);
            neonLine.position.set(0, 0.04, 0);

            group.add(body, barrel, mag, neonLine);
        } else if (modelType === 'shotgun') {
            // 샷건
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.45), bodyMat);
            const barrel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 12), bodyMat);
            barrel1.rotation.x = Math.PI / 2;
            barrel1.position.set(-0.025, 0.03, -0.3);

            const barrel2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 12), bodyMat);
            barrel2.rotation.x = Math.PI / 2;
            barrel2.position.set(0.025, 0.03, -0.3);

            const pump = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.15), accentMat);
            pump.position.set(0, -0.02, -0.2);

            group.add(body, barrel1, barrel2, pump);
        } else if (modelType === 'sniper') {
            // 스나이퍼
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, 0.7), bodyMat);
            const longBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.6, 12), bodyMat);
            longBarrel.rotation.x = Math.PI / 2;
            longBarrel.position.set(0, 0.02, -0.55);

            const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 12), bodyMat);
            scope.rotation.x = Math.PI / 2;
            scope.position.set(0, 0.09, -0.1);

            const neonScope = new THREE.Mesh(new THREE.RingGeometry(0.025, 0.035, 16), accentMat);
            neonScope.position.set(0, 0.09, 0.03);

            group.add(body, longBarrel, scope, neonScope);
        } else {
            // 로켓 런처
            const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.8, 16), bodyMat);
            tube.rotation.x = Math.PI / 2;
            const shield = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.05), accentMat);
            shield.position.set(0, 0.05, -0.2);

            group.add(tube, shield);
        }

        return group;
    }

    canShoot() {
        const now = performance.now() / 1000;
        return (now - this.lastShotTime >= this.fireRate) && (this.currentClip > 0) && !this.isReloading;
    }

    shoot() {
        if (!this.canShoot()) {
            if (this.currentClip === 0 && !this.isReloading) {
                this.reload();
            }
            return false;
        }

        this.lastShotTime = performance.now() / 1000;
        this.currentClip--;

        // 사운드 재생
        if (this.type === 'hitscan') soundEngine.playAssaultRifle();
        else if (this.type === 'shotgun') soundEngine.playShotgun();
        else if (this.type === 'sniper') soundEngine.playSniper();
        else if (this.type === 'projectile') soundEngine.playRocketLaunch();

        // 뷰모델 반동 적용 (Kickback)
        this.recoilOffset.z = 0.12 * this.recoilStrength;
        this.recoilOffset.y = 0.04 * this.recoilStrength;
        this.recoilRot.x = 0.15 * this.recoilStrength;

        // 총구 화염 조명 ON
        this.muzzleLight.intensity = 4.0;
        this.muzzleFlashTimer = 0.05;

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

    update(dt, swayX = 0, swayY = 0) {
        // 총구 화염 타이머
        if (this.muzzleFlashTimer > 0) {
            this.muzzleFlashTimer -= dt;
            if (this.muzzleFlashTimer <= 0) {
                this.muzzleLight.intensity = 0;
            }
        }

        // 재장전 처리
        if (this.isReloading) {
            this.reloadTimer -= dt;
            // 재장전 회전 애니메이션
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

        // 반동 복원 (Spring decay)
        this.recoilOffset.lerp(new THREE.Vector3(0, 0, 0), 12 * dt);
        this.recoilRot.lerp(new THREE.Vector3(0, 0, 0), 12 * dt);

        // 스코프 줌 모드 시 총기 위치 조정 (정조준)
        let targetX = this.initialPos.x + swayX + this.recoilOffset.x;
        let targetY = this.initialPos.y + swayY + this.recoilOffset.y;
        let targetZ = this.initialPos.z + this.recoilOffset.z;

        if (this.isScoped) {
            targetX = 0;
            targetY = -0.15;
            targetZ = -0.35;
        }

        this.viewModel.position.set(targetX, targetY, targetZ);
        this.viewModel.rotation.x = this.initialRot.x + this.recoilRot.x;
        this.viewModel.rotation.y = this.initialRot.y;
    }

    setVisible(visible) {
        this.viewModel.visible = visible;
        if (!visible) {
            this.isScoped = false;
            this.isReloading = false;
        }
    }
}

// 4종 무기 팩토리
export function createArsenal(camera) {
    return [
        new Weapon({
            name: 'ASSAULT RIFLE',
            type: 'hitscan',
            modelType: 'rifle',
            themeColor: 0x00f0ff,
            damage: 25,
            fireRate: 0.11,
            clipSize: 30,
            maxReserve: 180,
            reloadTime: 1.8,
            recoilStrength: 1.0,
            spread: 0.02
        }, camera),

        new Weapon({
            name: 'COMBAT SHOTGUN',
            type: 'shotgun',
            modelType: 'shotgun',
            themeColor: 0xff0055,
            damage: 16,
            fireRate: 0.75,
            clipSize: 8,
            maxReserve: 48,
            reloadTime: 2.2,
            recoilStrength: 2.2,
            spread: 0.07,
            pellets: 8
        }, camera),

        new Weapon({
            name: 'PLASMA SNIPER',
            type: 'sniper',
            modelType: 'sniper',
            themeColor: 0xffe600,
            damage: 105,
            fireRate: 1.1,
            clipSize: 5,
            maxReserve: 25,
            reloadTime: 2.5,
            recoilStrength: 2.8,
            spread: 0.001
        }, camera),

        new Weapon({
            name: 'ROCKET LAUNCHER',
            type: 'projectile',
            modelType: 'rocket',
            themeColor: 0xff6600,
            damage: 120,
            fireRate: 1.2,
            clipSize: 4,
            maxReserve: 16,
            reloadTime: 2.8,
            recoilStrength: 3.0,
            spread: 0.01
        }, camera)
    ];
}
