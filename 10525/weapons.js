/**
 * CYBER STRIKE 2099 - Weapon Models, Kinematics & Arsenal Engine
 * Generates 3D weapon models including the Supernova Railgun and SANABI Cybernetic Chain Arm (사슬팔).
 */

class WeaponSystem {
    constructor(camera, scene, particleEngine) {
        this.camera = camera;
        this.scene = scene;
        this.particleEngine = particleEngine;

        this.weaponContainer = new THREE.Group();
        this.camera.add(this.weaponContainer);
        this.defaultPosition = new THREE.Vector3(0.28, -0.26, -0.55);
        this.weaponContainer.position.copy(this.defaultPosition);

        // Weapon Kinematics
        this.currentRecoilPos = new THREE.Vector3();
        this.currentRecoilRot = new THREE.Vector3();
        this.targetRecoilPos = new THREE.Vector3();
        this.targetRecoilRot = new THREE.Vector3();
        this.swayOffset = new THREE.Vector2();

        this.bobTime = 0;
        this.isReloading = false;
        this.reloadProgress = 0;
        this.isScoped = false;

        // Railgun Charging Gimmick
        this.isChargingRailgun = false;
        this.railgunChargeProgress = 0;
        this.railgunChargeTime = 0.38;

        // Projectiles
        this.projectiles = [];

        // Weapon Definitions (5 Weapons)
        this.weapons = [
            {
                id: 0,
                name: 'PULSE RIFLE',
                type: 'rifle',
                damage: 26,
                fireRate: 0.1,
                magSize: 30,
                currentMag: 30,
                reserveAmmo: 180,
                reloadTime: 1.4,
                spread: 0.02,
                recoilKick: 0.04,
                recoilPitch: 0.05,
                isAuto: true,
                color: 0x00f3ff,
                mesh: null,
                muzzleOffset: new THREE.Vector3(0.0, 0.04, -0.52)
            },
            {
                id: 1,
                name: 'PLASMA SHOTGUN',
                type: 'shotgun',
                damage: 16,
                pellets: 8,
                fireRate: 0.65,
                magSize: 8,
                currentMag: 8,
                reserveAmmo: 48,
                reloadTime: 1.8,
                spread: 0.08,
                recoilKick: 0.12,
                recoilPitch: 0.14,
                isAuto: false,
                color: 0x00ffaa,
                mesh: null,
                muzzleOffset: new THREE.Vector3(0.0, 0.03, -0.48)
            },
            {
                id: 2,
                name: 'SUPERNOVA RAILGUN',
                type: 'railgun',
                damage: 240,
                fireRate: 1.2,
                magSize: 5,
                currentMag: 5,
                reserveAmmo: 25,
                reloadTime: 2.2,
                spread: 0.0001,
                recoilKick: 0.28,
                recoilPitch: 0.3,
                isAuto: false,
                color: 0x00f3ff,
                canScope: true,
                mesh: null,
                muzzleOffset: new THREE.Vector3(0.0, 0.06, -0.82)
            },
            {
                id: 3,
                name: 'ROCKET LAUNCHER',
                type: 'rocket',
                damage: 180,
                splashRadius: 6.0,
                fireRate: 1.2,
                magSize: 4,
                currentMag: 4,
                reserveAmmo: 16,
                reloadTime: 2.4,
                spread: 0.01,
                recoilKick: 0.2,
                recoilPitch: 0.22,
                isAuto: false,
                color: 0xff8800,
                mesh: null,
                muzzleOffset: new THREE.Vector3(0.0, 0.06, -0.6)
            },
            {
                id: 4,
                name: 'SANABI CHAIN ARM', // 5th Weapon: 산나비 사슬팔
                type: 'chainarm',
                damage: 320, // Devastating execution slam
                fireRate: 0.4,
                magSize: 999, // Infinite wire grapple stamina
                currentMag: 999,
                reserveAmmo: 999,
                reloadTime: 0,
                spread: 0,
                recoilKick: 0.08,
                recoilPitch: 0.08,
                isAuto: false,
                color: 0x00f3ff,
                mesh: null,
                muzzleOffset: new THREE.Vector3(0.0, 0.02, -0.45)
            }
        ];

        this.currentWeaponIndex = 0;
        this.lastShotTime = 0;

        this.buildWeaponModels();
        this.selectWeapon(0);
    }

    buildWeaponModels() {
        const darkMetalMat = new THREE.MeshStandardMaterial({
            color: 0x18202c,
            metalness: 0.85,
            roughness: 0.25
        });
        const chromeMat = new THREE.MeshStandardMaterial({
            color: 0x556677,
            metalness: 0.9,
            roughness: 0.15
        });

        // 1. Pulse Rifle Model
        const rifleGroup = new THREE.Group();
        const rBody = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.45), darkMetalMat);
        const rBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 12), chromeMat);
        rBarrel.rotation.x = Math.PI / 2;
        rBarrel.position.set(0, 0.03, -0.3);

        const rGlowStrips = new THREE.Mesh(
            new THREE.BoxGeometry(0.084, 0.02, 0.3),
            new THREE.MeshBasicMaterial({ color: 0x00f3ff })
        );
        rGlowStrips.position.set(0, 0.02, -0.05);

        const rMag = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.16, 0.08),
            new THREE.MeshStandardMaterial({ color: 0x1a2233 })
        );
        rMag.position.set(0, -0.1, -0.05);
        rMag.rotation.x = 0.2;

        const rSight = new THREE.Mesh(
            new THREE.BoxGeometry(0.04, 0.03, 0.1),
            new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true })
        );
        rSight.position.set(0, 0.08, -0.1);

        rifleGroup.add(rBody, rBarrel, rGlowStrips, rMag, rSight);
        this.weapons[0].mesh = rifleGroup;
        this.weaponContainer.add(rifleGroup);

        // 2. Plasma Shotgun Model
        const shotgunGroup = new THREE.Group();
        const sBody = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.42), darkMetalMat);
        const sBarrel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 12), chromeMat);
        const sBarrel2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 12), chromeMat);
        sBarrel1.rotation.x = Math.PI / 2;
        sBarrel2.rotation.x = Math.PI / 2;
        sBarrel1.position.set(-0.025, 0.04, -0.28);
        sBarrel2.position.set(0.025, 0.04, -0.28);

        const sGlow = new THREE.Mesh(
            new THREE.BoxGeometry(0.104, 0.025, 0.25),
            new THREE.MeshBasicMaterial({ color: 0x00ff88 })
        );
        sGlow.position.set(0, -0.02, -0.05);

        const sPump = new THREE.Mesh(
            new THREE.BoxGeometry(0.11, 0.06, 0.15),
            new THREE.MeshStandardMaterial({ color: 0x223344 })
        );
        sPump.position.set(0, -0.04, -0.2);

        shotgunGroup.add(sBody, sBarrel1, sBarrel2, sGlow, sPump);
        this.weapons[1].mesh = shotgunGroup;
        this.weaponContainer.add(shotgunGroup);

        // 3. SUPERNOVA MECHA RAILGUN (Image 1)
        const railGroup = new THREE.Group();
        const whiteArmorMat = new THREE.MeshStandardMaterial({ color: 0xf4f7fb, roughness: 0.2, metalness: 0.4 });
        const slateBlueMat = new THREE.MeshStandardMaterial({ color: 0x475f80, roughness: 0.3, metalness: 0.5 });
        const mechChassisMat = new THREE.MeshStandardMaterial({ color: 0x181f2a, roughness: 0.35, metalness: 0.8 });
        const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xb57335, roughness: 0.25, metalness: 0.85 });
        const neonCoreMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });

        const topCowl = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.42), whiteArmorMat);
        topCowl.position.set(0, 0.06, -0.48);

        const topNose = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.08, 0.14), whiteArmorMat);
        topNose.position.set(0, 0.04, -0.72);
        topNose.rotation.x = -0.3;

        const sideStripeL = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.02, 0.35), neonCoreMat);
        sideStripeL.position.set(-0.063, 0.05, -0.48);
        const sideStripeR = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.02, 0.35), neonCoreMat);
        sideStripeR.position.set(0.063, 0.05, -0.48);

        const btmCowl = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.38), whiteArmorMat);
        btmCowl.position.set(0, -0.05, -0.45);

        const chinMesh = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.09, 0.22), slateBlueMat);
        chinMesh.position.set(0, -0.07, -0.66);

        const boltGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.12, 8);
        boltGeo.rotateZ(Math.PI / 2);
        const boltMesh = new THREE.Mesh(boltGeo, chromeMat);
        boltMesh.position.set(0, -0.06, -0.7);

        const railCore = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.55), neonCoreMat);
        railCore.position.set(0, 0.01, -0.5);

        const midChassis = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.14, 0.28), mechChassisMat);
        midChassis.position.set(0, 0.01, -0.15);

        const midBlueCover = new THREE.Mesh(new THREE.BoxGeometry(0.135, 0.08, 0.2), slateBlueMat);
        midBlueCover.position.set(0, 0.06, -0.16);

        const capGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.14, 12);
        capGeo.rotateX(Math.PI / 2);
        const capMesh = new THREE.Mesh(capGeo, bronzeMat);
        capMesh.position.set(0.075, -0.02, -0.2);

        const capRing = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 12), mechChassisMat);
        capRing.rotateX(Math.PI / 2);
        capRing.position.set(0.075, -0.02, -0.2);

        const stockMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.15, 0.22), whiteArmorMat);
        stockMesh.position.set(0, 0.01, 0.1);

        const stockEndCap = new THREE.Mesh(new THREE.BoxGeometry(0.145, 0.08, 0.06), slateBlueMat);
        stockEndCap.position.set(0, 0.04, 0.22);

        const scopeBase = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.14), mechChassisMat);
        scopeBase.position.set(0, 0.14, -0.08);

        const scopeLens = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.16, 12), chromeMat);
        scopeLens.rotateX(Math.PI / 2);
        scopeLens.position.set(0, 0.15, -0.08);

        const scopeGlass = new THREE.Mesh(new THREE.CircleGeometry(0.022, 12), neonCoreMat);
        scopeGlass.position.set(0, 0.15, -0.165);

        railGroup.add(
            topCowl, topNose, sideStripeL, sideStripeR,
            btmCowl, chinMesh, boltMesh, railCore,
            midChassis, midBlueCover, capMesh, capRing,
            stockMesh, stockEndCap, scopeBase, scopeLens, scopeGlass
        );

        railGroup.userData = { topCowl, btmCowl, railCore, neonCoreMat };
        this.weapons[2].mesh = railGroup;
        this.weaponContainer.add(railGroup);

        // 4. Heavy Rocket Launcher
        const rktGroup = new THREE.Group();
        const rktTube = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.65, 16), darkMetalMat);
        rktTube.rotation.x = Math.PI / 2;
        rktTube.position.set(0, 0.04, -0.2);

        const rktExhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.07, 0.12, 16), chromeMat);
        rktExhaust.rotation.x = Math.PI / 2;
        rktExhaust.position.set(0, 0.04, 0.15);

        const rktGlow = new THREE.Mesh(
            new THREE.TorusGeometry(0.08, 0.01, 8, 16),
            new THREE.MeshBasicMaterial({ color: 0xff8800 })
        );
        rktGlow.position.set(0, 0.04, -0.48);

        rktGroup.add(rktTube, rktExhaust, rktGlow);
        this.weapons[3].mesh = rktGroup;
        this.weaponContainer.add(rktGroup);

        // =================================================================
        // 5. SANABI CYBERNETIC CHAIN ARM (산나비 사슬팔 3D 모델)
        // =================================================================
        const armGroup = new THREE.Group();

        // Forearm cybernetic chassis
        const armChassisMat = new THREE.MeshStandardMaterial({ color: 0x222c3d, metalness: 0.85, roughness: 0.25 });
        const armArmorMat = new THREE.MeshStandardMaterial({ color: 0xd8e2ec, metalness: 0.5, roughness: 0.2 });
        const chainSteelMat = new THREE.MeshStandardMaterial({ color: 0x718096, metalness: 0.9, roughness: 0.1 });

        // Forearm Body
        const armBody = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.15, 0.38), armChassisMat);
        armBody.position.set(0, -0.02, -0.12);

        // Upper White Plating
        const armPlateTop = new THREE.Mesh(new THREE.BoxGeometry(0.145, 0.05, 0.32), armArmorMat);
        armPlateTop.position.set(0, 0.06, -0.12);

        // Glowing Cyan Circuit Traces on Forearm
        const armGlow = new THREE.Mesh(new THREE.BoxGeometry(0.148, 0.015, 0.28), neonCoreMat);
        armGlow.position.set(0, 0.065, -0.12);

        // Hydraulic Winch Drum (사슬 감개 드럼)
        const winchDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.15, 12), chainSteelMat);
        winchDrum.rotateZ(Math.PI / 2);
        winchDrum.position.set(0, 0.03, -0.02);

        // Mechanical Fist / Knuckles
        const knuckleGeo = new THREE.BoxGeometry(0.13, 0.11, 0.12);
        const knuckleMesh = new THREE.Mesh(knuckleGeo, armChassisMat);
        knuckleMesh.position.set(0, -0.02, -0.36);

        // 3-Claw Grapple Hook Launcher on Top/Front (사슬 갈퀴 발사기)
        const hookBase = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.1, 8), chainSteelMat);
        hookBase.rotateX(Math.PI / 2);
        hookBase.position.set(0, 0.04, -0.38);

        // 3 Curved Claws
        const claw1 = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.09, 4), neonCoreMat);
        claw1.rotateX(-Math.PI / 3);
        claw1.position.set(0, 0.08, -0.42);

        const claw2 = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.09, 4), neonCoreMat);
        claw2.rotateX(-Math.PI / 3);
        claw2.rotateZ(Math.PI * 0.7);
        claw2.position.set(-0.04, 0.02, -0.42);

        const claw3 = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.09, 4), neonCoreMat);
        claw3.rotateX(-Math.PI / 3);
        claw3.rotateZ(-Math.PI * 0.7);
        claw3.position.set(0.04, 0.02, -0.42);

        armGroup.add(
            armBody, armPlateTop, armGlow, winchDrum,
            knuckleMesh, hookBase, claw1, claw2, claw3
        );

        armGroup.userData = {
            winchDrum, knuckleMesh, hookBase, claw1, claw2, claw3, armGlow
        };

        this.weapons[4].mesh = armGroup;
        this.weaponContainer.add(armGroup);
    }

    getCurrentWeapon() {
        return this.weapons[this.currentWeaponIndex];
    }

    selectWeapon(index) {
        if (index < 0 || index >= this.weapons.length || (index === this.currentWeaponIndex && this.weapons[index].mesh.visible)) {
            return;
        }
        this.currentWeaponIndex = index;
        this.isReloading = false;
        this.isScoped = false;
        this.isChargingRailgun = false;
        this.railgunChargeProgress = 0;

        this.weapons.forEach((w, i) => {
            if (w.mesh) w.mesh.visible = (i === index);
        });

        const scopeElem = document.getElementById('sniper-scope');
        if (scopeElem) scopeElem.classList.remove('active');

        for (let i = 1; i <= 5; i++) {
            const slot = document.getElementById(`slot-${i}`);
            if (slot) {
                if (i === index + 1) slot.classList.add('active');
                else slot.classList.remove('active');
            }
        }
    }

    toggleScope() {
        const cur = this.getCurrentWeapon();
        if (!cur.canScope || this.isReloading) return;
        this.isScoped = !this.isScoped;

        const scopeElem = document.getElementById('sniper-scope');
        if (scopeElem) {
            if (this.isScoped) scopeElem.classList.add('active');
            else scopeElem.classList.remove('active');
        }

        if (cur.mesh) cur.mesh.visible = !this.isScoped;
    }

    applyRecoil(kick, pitch) {
        this.targetRecoilPos.z += kick;
        this.targetRecoilRot.x += pitch;
    }

    applySway(deltaX, deltaY) {
        this.swayOffset.x = THREE.MathUtils.clamp(this.swayOffset.x - deltaX * 0.0003, -0.04, 0.04);
        this.swayOffset.y = THREE.MathUtils.clamp(this.swayOffset.y + deltaY * 0.0003, -0.04, 0.04);
    }

    startReload() {
        const w = this.getCurrentWeapon();
        if (w.type === 'chainarm') return false; // Chain arm has infinite wire
        if (this.isReloading || w.currentMag >= w.magSize || w.reserveAmmo <= 0) return false;

        this.isReloading = true;
        this.reloadProgress = 0;
        this.isChargingRailgun = false;
        if (this.isScoped) this.toggleScope();

        if (window.soundEngine) window.soundEngine.playReload();
        return true;
    }

    fireRocket(origin, direction) {
        const group = new THREE.Group();
        const rktGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8);
        const rktMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xff4400 });
        const mesh = new THREE.Mesh(rktGeo, rktMat);
        mesh.rotation.x = Math.PI / 2;
        group.add(mesh);

        group.position.copy(origin);
        group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), direction);

        this.scene.add(group);
        this.projectiles.push({
            mesh: group,
            velocity: direction.clone().multiplyScalar(35),
            damage: 180,
            splashRadius: 6.0,
            life: 4.0
        });
    }

    update(dt, isMoving, isSprinting, isGrappling = false) {
        const w = this.getCurrentWeapon();

        // 1. Railgun Charging Animation
        if (w.type === 'railgun' && this.isChargingRailgun) {
            this.railgunChargeProgress += dt;
            const progress = Math.min(1.0, this.railgunChargeProgress / this.railgunChargeTime);

            if (w.mesh && w.mesh.userData.topCowl) {
                w.mesh.userData.topCowl.position.y = 0.06 + progress * 0.04;
                w.mesh.userData.btmCowl.position.y = -0.05 - progress * 0.04;
            }

            const muzzlePos = this.getMuzzleWorldPosition();
            this.particleEngine.createChargeSparks(muzzlePos);

            this.weaponContainer.position.x = this.defaultPosition.x + (Math.random() - 0.5) * 0.008 * progress;
            this.weaponContainer.position.y = this.defaultPosition.y + (Math.random() - 0.5) * 0.008 * progress;
        } else if (w.type === 'railgun' && w.mesh && w.mesh.userData.topCowl) {
            w.mesh.userData.topCowl.position.y = THREE.MathUtils.lerp(w.mesh.userData.topCowl.position.y, 0.06, dt * 15);
            w.mesh.userData.btmCowl.position.y = THREE.MathUtils.lerp(w.mesh.userData.btmCowl.position.y, -0.05, dt * 15);
        }

        // 2. SANABI Chain Arm Grappling Reel Animation
        if (w.type === 'chainarm' && w.mesh) {
            if (isGrappling) {
                // Rotate winch rapidly
                w.mesh.userData.winchDrum.rotation.x += dt * 35;
                // Thrust arm forward
                this.weaponContainer.position.z = THREE.MathUtils.lerp(this.weaponContainer.position.z, this.defaultPosition.z - 0.12, dt * 20);
            }
        }

        // 3. Reloading Logic
        if (this.isReloading) {
            this.reloadProgress += dt;
            const progress = this.reloadProgress / w.reloadTime;

            const dip = Math.sin(progress * Math.PI) * 0.25;
            this.weaponContainer.position.y = this.defaultPosition.y - dip;
            this.weaponContainer.rotation.z = Math.sin(progress * Math.PI) * 0.4;

            if (this.reloadProgress >= w.reloadTime) {
                const needed = w.magSize - w.currentMag;
                const toAdd = Math.min(needed, w.reserveAmmo);
                w.currentMag += toAdd;
                w.reserveAmmo -= toAdd;
                this.isReloading = false;
                this.weaponContainer.rotation.z = 0;
            }
        } else if (!this.isChargingRailgun) {
            // 4. Weapon Bobbing
            if (isMoving) {
                const freq = isSprinting ? 12 : 7;
                const amp = isSprinting ? 0.025 : 0.012;
                this.bobTime += dt * freq;
                this.weaponContainer.position.x = this.defaultPosition.x + Math.cos(this.bobTime) * amp + this.swayOffset.x;
                this.weaponContainer.position.y = this.defaultPosition.y + Math.abs(Math.sin(this.bobTime)) * amp + this.swayOffset.y;
            } else {
                this.bobTime += dt * 2;
                this.weaponContainer.position.x = this.defaultPosition.x + Math.sin(this.bobTime) * 0.003 + this.swayOffset.x;
                this.weaponContainer.position.y = this.defaultPosition.y + Math.cos(this.bobTime) * 0.003 + this.swayOffset.y;
            }
        }

        // 5. Recoil Recovery
        this.currentRecoilPos.lerp(this.targetRecoilPos, dt * 25);
        this.currentRecoilRot.lerp(this.targetRecoilRot, dt * 25);
        this.targetRecoilPos.lerp(new THREE.Vector3(), dt * 10);
        this.targetRecoilRot.lerp(new THREE.Vector3(), dt * 10);

        this.weaponContainer.position.z = this.defaultPosition.z + this.currentRecoilPos.z;
        this.weaponContainer.rotation.x = this.currentRecoilRot.x;

        // 6. Return Sway to center
        this.swayOffset.lerp(new THREE.Vector2(), dt * 8);

        // 7. Update Projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.life -= dt;
            p.mesh.position.addScaledVector(p.velocity, dt);

            if (Math.random() > 0.3) {
                this.particleEngine.createMuzzleFlash(p.mesh.position, 0xff7700, 0.3);
            }

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.projectiles.splice(i, 1);
            }
        }
    }

    getMuzzleWorldPosition() {
        const cur = this.getCurrentWeapon();
        const offset = cur.muzzleOffset.clone();
        return offset.applyMatrix4(cur.mesh.matrixWorld);
    }
}

window.WeaponSystem = WeaponSystem;
