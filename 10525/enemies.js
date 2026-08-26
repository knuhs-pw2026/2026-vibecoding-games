/**
 * CYBER STRIKE 2099 - Intelligent Enemy AI & Wave Management Engine
 * Generates 3D Enemy Models (Drones, Cyber Soldiers, Heavy Mechs) with dynamic behaviors and attacks.
 */

class EnemyManager {
    constructor(scene, particleEngine) {
        this.scene = scene;
        this.particleEngine = particleEngine;
        this.enemies = [];
        this.enemyProjectiles = [];

        // Wave Management
        this.currentWave = 1;
        this.enemiesToSpawn = 0;
        this.spawnTimer = 0;
        this.isWaveActive = false;
        this.waveTransitionTimer = 0;

        // Shared Materials
        this.darkChassisMat = new THREE.MeshStandardMaterial({
            color: 0x181c24,
            metalness: 0.8,
            roughness: 0.3
        });
        this.redEyeMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
        this.orangeEyeMat = new THREE.MeshBasicMaterial({ color: 0xff7700 });
        this.cyanGlowMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });

        // Spawn Locations around the arena
        this.spawnPoints = [
            new THREE.Vector3(-30, 1, -30),
            new THREE.Vector3(30, 1, -30),
            new THREE.Vector3(-30, 1, 30),
            new THREE.Vector3(30, 1, 30),
            new THREE.Vector3(0, 1, -35),
            new THREE.Vector3(0, 1, 35),
            new THREE.Vector3(-35, 1, 0),
            new THREE.Vector3(35, 1, 0)
        ];
    }

    startWave(waveNum) {
        this.currentWave = waveNum;
        this.isWaveActive = true;
        // Total enemies increases per wave
        this.enemiesToSpawn = 4 + waveNum * 3;
        this.spawnTimer = 0.5;

        if (window.soundEngine) window.soundEngine.playWaveStart();

        // UI Banner
        const banner = document.getElementById('wave-banner');
        const bTitle = document.getElementById('wave-banner-title');
        const bSub = document.getElementById('wave-banner-subtitle');
        if (banner && bTitle) {
            bTitle.innerText = `WAVE ${waveNum}`;
            bSub.innerText = waveNum % 3 === 0 ? "⚠️ WARNING: HEAVY GOLIATH DETECTED ⚠️" : "HOSTILE UNITS ENGAGING";
            banner.classList.add('active');
            setTimeout(() => banner.classList.remove('active'), 2500);
        }
    }

    // 1. Build Crawler Drone 3D Model
    createDroneMesh() {
        const group = new THREE.Group();
        // Central body sphere/capsule
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 12), this.darkChassisMat);
        body.position.y = 0.5;
        body.scale.set(1, 0.7, 1.2);

        // Glowing red sensor eye
        const eye = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 8), this.redEyeMat);
        eye.rotation.x = Math.PI / 2;
        eye.position.set(0, 0.52, 0.48);

        // 4 Blade-like Insectoid Legs
        const legMat = new THREE.MeshStandardMaterial({ color: 0x0f141e, metalness: 0.9, roughness: 0.2 });
        for (let i = 0; i < 4; i++) {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.02, 0.7, 6), legMat);
            const side = (i % 2 === 0) ? 1 : -1;
            const front = (i < 2) ? 1 : -1;
            leg.position.set(side * 0.45, 0.25, front * 0.3);
            leg.rotation.z = side * 0.6;
            leg.rotation.x = front * 0.3;
            group.add(leg);
        }

        group.add(body, eye);
        return { group, head: eye };
    }

    // 2. Build Cyber Soldier 3D Model
    createSoldierMesh() {
        const group = new THREE.Group();
        // Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.35), this.darkChassisMat);
        torso.position.y = 1.1;

        // Head (Critical hit zone)
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.32, 0.3), new THREE.MeshStandardMaterial({ color: 0x222c3d }));
        head.position.set(0, 1.7, 0);

        // Glowing Visor
        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.05), this.orangeEyeMat);
        visor.position.set(0, 1.7, 0.16);

        // Arms & Laser Rifle
        const armMat = new THREE.MeshStandardMaterial({ color: 0x111722 });
        const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.7, 0.16), armMat);
        leftArm.position.set(-0.4, 1.1, 0);

        const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.7, 0.16), armMat);
        rightArm.position.set(0.4, 1.1, 0.2);
        rightArm.rotation.x = -Math.PI / 4;

        const gun = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.6), new THREE.MeshStandardMaterial({ color: 0x050505 }));
        gun.position.set(0.4, 1.1, 0.4);

        // Legs
        const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.2), armMat);
        leftLeg.position.set(-0.18, 0.35, 0);

        const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.2), armMat);
        rightLeg.position.set(0.18, 0.35, 0);

        group.add(torso, head, visor, leftArm, rightArm, gun, leftLeg, rightLeg);
        return { group, head };
    }

    // 3. Build Goliath Mech 3D Model (Boss)
    createGoliathMesh() {
        const group = new THREE.Group();
        // Massive Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 1.2), this.darkChassisMat);
        torso.position.y = 2.2;

        // Glowing Core
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 12), this.redEyeMat);
        core.position.set(0, 2.2, 0.55);

        // Head Armor Unit
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.6), new THREE.MeshStandardMaterial({ color: 0x2d1822 }));
        head.position.set(0, 3.1, 0.2);

        // Dual Shoulder Rocket Pods
        const podGeo = new THREE.BoxGeometry(0.5, 0.6, 0.9);
        const podMat = new THREE.MeshStandardMaterial({ color: 0x334455 });
        const leftPod = new THREE.Mesh(podGeo, podMat);
        leftPod.position.set(-1.1, 2.9, 0);

        const rightPod = new THREE.Mesh(podGeo, podMat);
        rightPod.position.set(1.1, 2.9, 0);

        // Massive Heavy Legs
        const legMat = new THREE.MeshStandardMaterial({ color: 0x11151c });
        const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.6, 8), legMat);
        leftLeg.position.set(-0.6, 0.8, 0);

        const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.6, 8), legMat);
        rightLeg.position.set(0.6, 0.8, 0);

        group.add(torso, core, head, leftPod, rightPod, leftLeg, rightLeg);
        return { group, head };
    }

    // Spawn an Enemy Unit
    spawnEnemy(type) {
        const spawnPos = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)].clone();
        // Add random scatter
        spawnPos.x += (Math.random() - 0.5) * 6;
        spawnPos.z += (Math.random() - 0.5) * 6;

        let enemyData;
        if (type === 'drone') {
            const { group, head } = this.createDroneMesh();
            group.position.copy(spawnPos);
            this.scene.add(group);

            enemyData = {
                type: 'drone',
                name: 'CRAWLER DRONE',
                group: group,
                head: head,
                hp: 45 + this.currentWave * 8,
                maxHp: 45 + this.currentWave * 8,
                speed: 8.5 + Math.random() * 1.5,
                attackRange: 2.2,
                attackDamage: 12,
                attackCooldown: 1.0,
                attackTimer: 0,
                scoreValue: 100,
                height: 1.0,
                animTime: Math.random() * 10
            };
        } else if (type === 'soldier') {
            const { group, head } = this.createSoldierMesh();
            group.position.copy(spawnPos);
            this.scene.add(group);

            enemyData = {
                type: 'soldier',
                name: 'CYBER SOLDIER',
                group: group,
                head: head,
                hp: 90 + this.currentWave * 15,
                maxHp: 90 + this.currentWave * 15,
                speed: 4.5,
                attackRange: 28,
                attackDamage: 16,
                attackCooldown: 1.4,
                attackTimer: Math.random(),
                scoreValue: 250,
                height: 2.0,
                strafeDir: Math.random() > 0.5 ? 1 : -1,
                strafeTimer: 2.0,
                animTime: 0
            };
        } else { // Goliath Boss
            const { group, head } = this.createGoliathMesh();
            group.position.copy(spawnPos);
            this.scene.add(group);

            enemyData = {
                type: 'goliath',
                name: 'HEAVY GOLIATH',
                group: group,
                head: head,
                hp: 450 + this.currentWave * 120,
                maxHp: 450 + this.currentWave * 120,
                speed: 2.8,
                attackRange: 35,
                attackDamage: 30,
                attackCooldown: 2.2,
                attackTimer: 1.0,
                scoreValue: 1000,
                height: 3.5,
                animTime: 0
            };
        }

        // Add Overhead Health Bar (Sprite)
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 128, 16);
        ctx.fillStyle = '#00f3ff';
        ctx.fillRect(2, 2, 124, 12);
        const barTex = new THREE.CanvasTexture(canvas);

        const barMat = new THREE.SpriteMaterial({ map: barTex, depthTest: false, transparent: true });
        const hpSprite = new THREE.Sprite(barMat);
        hpSprite.scale.set(1.2, 0.15, 1);
        hpSprite.position.y = enemyData.height + 0.3;
        enemyData.group.add(hpSprite);
        enemyData.hpSprite = hpSprite;
        enemyData.barCanvas = canvas;
        enemyData.barTex = barTex;

        this.enemies.push(enemyData);
    }

    // Damage an Enemy
    applyDamage(enemy, amount, isHeadshot = false) {
        const actualDmg = isHeadshot ? amount * 2.5 : amount;
        enemy.hp -= actualDmg;

        // Particle FX
        this.particleEngine.createEnemyHitFX(enemy.group.position.clone().add(new THREE.Vector3(0, enemy.height * 0.6, 0)), isHeadshot ? 15 : 8, isHeadshot);

        // Update Health Bar Sprite
        if (enemy.barCanvas && enemy.barTex) {
            const ctx = enemy.barCanvas.getContext('2d');
            const pct = Math.max(0, enemy.hp / enemy.maxHp);
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(0, 0, 128, 16);
            ctx.fillStyle = isHeadshot ? '#ff0055' : (pct > 0.4 ? '#00f3ff' : '#ff3366');
            ctx.fillRect(2, 2, Math.floor(124 * pct), 12);
            enemy.barTex.needsUpdate = true;
        }

        if (enemy.hp <= 0) {
            this.killEnemy(enemy, isHeadshot);
            return { killed: true, score: enemy.scoreValue * (isHeadshot ? 1.5 : 1), isHeadshot };
        }
        return { killed: false, score: Math.floor(actualDmg), isHeadshot };
    }

    // Handle Enemy Death & Drops
    killEnemy(enemy, isHeadshot) {
        // Explosion / Disintegration
        if (enemy.type === 'goliath') {
            this.particleEngine.createExplosion(enemy.group.position, 6.0);
            if (window.soundEngine) window.soundEngine.playExplosion(true);
        } else {
            this.particleEngine.createEnemyHitFX(enemy.group.position, 25, isHeadshot);
            if (window.soundEngine) window.soundEngine.playExplosion(false);
        }

        // Random Drops (Health, Shield, Ammo)
        const rand = Math.random();
        if (rand < 0.25) {
            this.particleEngine.spawnPickup('health', enemy.group.position.clone().setY(1.0));
        } else if (rand < 0.5) {
            this.particleEngine.spawnPickup('shield', enemy.group.position.clone().setY(1.0));
        } else if (rand < 0.8) {
            this.particleEngine.spawnPickup('ammo', enemy.group.position.clone().setY(1.0));
        }

        // Remove mesh
        this.scene.remove(enemy.group);
        const idx = this.enemies.indexOf(enemy);
        if (idx !== -1) {
            this.enemies.splice(idx, 1);
        }
    }

    // Main Update Loop
    update(dt, playerPosition, onPlayerDamaged) {
        // 1. Spawning Waves
        if (this.isWaveActive && this.enemiesToSpawn > 0) {
            this.spawnTimer -= dt;
            if (this.spawnTimer <= 0) {
                // Determine Enemy Type based on wave
                let type = 'drone';
                const r = Math.random();
                if (this.currentWave >= 3 && this.enemiesToSpawn === 1 && this.currentWave % 3 === 0) {
                    type = 'goliath'; // Boss spawn
                } else if (this.currentWave >= 2 && r > 0.5) {
                    type = 'soldier';
                }

                this.spawnEnemy(type);
                this.enemiesToSpawn--;
                this.spawnTimer = Math.max(0.4, 2.0 - this.currentWave * 0.15);
            }
        }

        // 2. Wave Completion Check
        if (this.isWaveActive && this.enemiesToSpawn === 0 && this.enemies.length === 0) {
            this.isWaveActive = false;
            this.waveTransitionTimer = 4.0; // 4 seconds intermission
            const banner = document.getElementById('wave-banner');
            const bTitle = document.getElementById('wave-banner-title');
            const bSub = document.getElementById('wave-banner-subtitle');
            if (banner && bTitle) {
                bTitle.innerText = `WAVE ${this.currentWave} CLEARED`;
                bSub.innerText = "NEXT WAVE INCOMING IN 4s...";
                banner.classList.add('active');
                setTimeout(() => banner.classList.remove('active'), 3500);
            }
        }

        // Wave Intermission Countdown
        if (!this.isWaveActive && this.waveTransitionTimer > 0) {
            this.waveTransitionTimer -= dt;
            if (this.waveTransitionTimer <= 0) {
                this.startWave(this.currentWave + 1);
            }
        }

        // 3. Update Enemy AI & Movements
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            e.attackTimer -= dt;
            e.animTime += dt * 5;

            const toPlayer = playerPosition.clone().sub(e.group.position);
            const distToPlayer = toPlayer.length();
            toPlayer.y = 0; // Keep on flat plane
            const dir = toPlayer.clone().normalize();

            // Look towards player
            e.group.lookAt(playerPosition.x, e.group.position.y, playerPosition.z);

            if (e.type === 'drone') {
                // Crawler Drone: Charges relentlessly, leaping melee attack
                if (distToPlayer > e.attackRange) {
                    e.group.position.addScaledVector(dir, e.speed * dt);
                } else {
                    // Attack
                    if (e.attackTimer <= 0) {
                        e.attackTimer = e.attackCooldown;
                        onPlayerDamaged(e.attackDamage);
                    }
                }
                // Animate leg bob
                e.group.position.y = 0.5 + Math.abs(Math.sin(e.animTime)) * 0.15;

            } else if (e.type === 'soldier') {
                // Cyber Soldier: Maintains distance, strafes left/right, shoots laser bursts
                e.strafeTimer -= dt;
                if (e.strafeTimer <= 0) {
                    e.strafeDir *= -1;
                    e.strafeTimer = 1.5 + Math.random() * 2;
                }

                if (distToPlayer > 18) {
                    e.group.position.addScaledVector(dir, e.speed * dt);
                } else if (distToPlayer < 8) {
                    // Back up
                    e.group.position.addScaledVector(dir, -e.speed * dt);
                }

                // Strafe sideways
                const strafeVec = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(e.strafeDir * e.speed * 0.6 * dt);
                e.group.position.add(strafeVec);

                // Shoot laser bolt
                if (distToPlayer < e.attackRange && e.attackTimer <= 0) {
                    e.attackTimer = e.attackCooldown;
                    this.fireEnemyBolt(e.group.position.clone().add(new THREE.Vector3(0, 1.2, 0)), playerPosition.clone().add(new THREE.Vector3(0, 1.0, 0)));
                }

            } else if (e.type === 'goliath') {
                // Goliath Mech: Slow advance, fires dual heavy plasma rockets
                if (distToPlayer > 12) {
                    e.group.position.addScaledVector(dir, e.speed * dt);
                }

                if (distToPlayer < e.attackRange && e.attackTimer <= 0) {
                    e.attackTimer = e.attackCooldown;
                    // Fire 2 rockets in sequence
                    this.fireEnemyBolt(e.group.position.clone().add(new THREE.Vector3(-1.0, 2.9, 0)), playerPosition.clone().add(new THREE.Vector3(0, 1.0, 0)), true);
                    setTimeout(() => {
                        this.fireEnemyBolt(e.group.position.clone().add(new THREE.Vector3(1.0, 2.9, 0)), playerPosition.clone().add(new THREE.Vector3(0, 1.0, 0)), true);
                    }, 250);
                }
            }
        }

        // 4. Update Enemy Projectiles
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const p = this.enemyProjectiles[i];
            p.life -= dt;
            p.mesh.position.addScaledVector(p.velocity, dt);

            // Check hit against player
            const dist = p.mesh.position.distanceTo(playerPosition.clone().add(new THREE.Vector3(0, 1.0, 0)));
            if (dist < 1.2) {
                onPlayerDamaged(p.damage);
                this.particleEngine.createImpactSparks(p.mesh.position, new THREE.Vector3(0, 1, 0), 10, 0xff0055);
                this.scene.remove(p.mesh);
                this.enemyProjectiles.splice(i, 1);
                continue;
            }

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.enemyProjectiles.splice(i, 1);
            }
        }
    }

    // Enemy Laser Projectile
    fireEnemyBolt(origin, targetPos, isHeavy = false) {
        if (window.soundEngine) window.soundEngine.playEnemyShoot();
        const dir = targetPos.clone().sub(origin).normalize();

        const geo = new THREE.SphereGeometry(isHeavy ? 0.35 : 0.15, 8, 8);
        const mat = new THREE.MeshBasicMaterial({ color: isHeavy ? 0xff0055 : 0xff7700 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(origin);

        this.scene.add(mesh);
        this.enemyProjectiles.push({
            mesh: mesh,
            velocity: dir.multiplyScalar(isHeavy ? 22 : 32),
            damage: isHeavy ? 28 : 14,
            life: 3.5
        });
    }
}

window.EnemyManager = EnemyManager;
