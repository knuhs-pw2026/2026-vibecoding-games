// js/entities/bot.js - 지능형 AI 봇 클래스

import { physicsWorld } from '../engine/physics.js';
import { soundEngine } from '../engine/audio.js';

export class Bot {
    constructor(id, name, scene, difficulty = 'normal') {
        this.id = id;
        this.name = name;
        this.scene = scene;
        this.difficulty = difficulty;

        this.position = new THREE.Vector3(0, 1.5, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.radius = 0.5;
        this.height = 1.8;

        // 능력치 & 상태
        this.maxHp = 100;
        this.hp = 100;
        this.maxShield = 50;
        this.shield = 50;
        this.isAlive = true;
        this.respawnTimer = 0;

        // 점수
        this.kills = 0;
        this.deaths = 0;
        this.score = 0;

        // AI 파라미터 (난이도별)
        this.speed = difficulty === 'hard' ? 9.5 : (difficulty === 'easy' ? 6.5 : 8.0);
        this.reactionTime = difficulty === 'hard' ? 0.2 : (difficulty === 'easy' ? 0.7 : 0.4);
        this.accuracySpread = difficulty === 'hard' ? 0.03 : (difficulty === 'easy' ? 0.12 : 0.06);
        this.fireInterval = difficulty === 'hard' ? 0.14 : (difficulty === 'easy' ? 0.28 : 0.2);

        this.state = 'PATROL'; // PATROL, CHASE, ATTACK, RETREAT
        this.target = null;
        this.targetPos = new THREE.Vector3();
        this.stateTimer = 0;
        this.lastShotTime = 0;
        this.strafeDir = 1;
        this.strafeTimer = 0;

        // 3D 메시 생성
        this.mesh = this.createBotMesh();
        this.scene.add(this.mesh);
    }

    createBotMesh() {
        const group = new THREE.Group();

        // 1. 몸통 (Torso)
        const torsoGeo = new THREE.BoxGeometry(0.7, 0.8, 0.4);
        const torsoMat = new THREE.MeshStandardMaterial({
            color: 0x1d2736,
            metalness: 0.8,
            roughness: 0.3
        });
        const torso = new THREE.Mesh(torsoGeo, torsoMat);
        torso.position.set(0, 0.9, 0);
        torso.castShadow = true;
        group.add(torso);

        // 2. 머리 (Head)
        const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const headMat = new THREE.MeshStandardMaterial({
            color: 0x111924,
            metalness: 0.9,
            roughness: 0.2
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.set(0, 1.5, 0);
        head.castShadow = true;
        group.add(head);

        // 3. 네온 바이저 아이 (Visor)
        const eyeGeo = new THREE.BoxGeometry(0.3, 0.08, 0.05);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
        const eye = new THREE.Mesh(eyeGeo, eyeMat);
        eye.position.set(0, 1.52, -0.21);
        group.add(eye);

        // 4. 총기 (Bot Weapon)
        const gunGeo = new THREE.BoxGeometry(0.08, 0.1, 0.5);
        const gunMat = new THREE.MeshStandardMaterial({ color: 0x05080c });
        const gun = new THREE.Mesh(gunGeo, gunMat);
        gun.position.set(0.35, 0.85, -0.3);
        group.add(gun);

        return group;
    }

    getCurrentWeaponName() {
        return 'CYBER RIFLE';
    }

    takeDamage(amount, attacker, isHeadshot = false) {
        if (!this.isAlive) return false;

        // 실드 우선 소모
        if (this.shield > 0) {
            const shieldDmg = Math.min(this.shield, amount);
            this.shield -= shieldDmg;
            amount -= shieldDmg;
        }

        if (amount > 0) {
            this.hp = Math.max(0, this.hp - amount);
        }

        // 피격 시 공격자를 타겟으로 지정
        if (attacker && attacker !== this) {
            this.target = attacker;
            this.state = 'ATTACK';
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
        this.respawnTimer = 4.0;
        this.mesh.visible = false;
    }

    respawn(spawnPos) {
        this.hp = this.maxHp;
        this.shield = this.maxShield;
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

        // 1. AI 타겟 탐색 (플레이어 및 다른 봇 중 가장 가까운 적)
        const potentialTargets = [player, ...allBots].filter(t => t !== this && t.isAlive);
        let closestTarget = null;
        let minDistance = 45.0; // 시야 반경

        for (const candidate of potentialTargets) {
            const dist = this.position.distanceTo(candidate.position);
            if (dist < minDistance) {
                // 가시선(LOS) 체크
                const dir = candidate.position.clone().sub(this.position).normalize();
                const losHit = physicsWorld.raycastMap(
                    new THREE.Vector3(this.position.x, this.position.y + 1.4, this.position.z),
                    dir,
                    dist
                );
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

        // 2. 상태별 행동 처리
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
            // 적을 바라보며 좌우 스트레이프 및 거리 유지
            const toTarget = this.target.position.clone().sub(this.position);
            const dist = toTarget.length();
            toTarget.normalize();

            // 적과의 거리에 따라 전진/후진
            if (dist > 18) moveDir.add(toTarget);
            else if (dist < 8) moveDir.sub(toTarget);

            // 좌우 회피 기동 (Strafing)
            this.strafeTimer -= dt;
            if (this.strafeTimer <= 0) {
                this.strafeDir = Math.random() < 0.5 ? -1 : 1;
                this.strafeTimer = 1.0 + Math.random() * 1.5;
            }
            const right = new THREE.Vector3(-toTarget.z, 0, toTarget.x).multiplyScalar(this.strafeDir);
            moveDir.add(right);
            moveDir.normalize();

            // 사격 트리거
            this.tryShoot(projectileManager, player, allBots, onKillCallback);
        }

        // 3. 이동 및 물리 적용
        this.velocity.x = moveDir.x * this.speed;
        this.velocity.z = moveDir.z * this.speed;

        physicsWorld.moveEntity(
            this.position,
            this.velocity,
            this.radius,
            this.height,
            dt,
            false
        );

        // 4. 3D 메시 위치 및 회전 동기화
        this.mesh.position.copy(this.position);
        if (this.target && this.state === 'ATTACK') {
            const targetLookPos = new THREE.Vector3(this.target.position.x, this.position.y, this.target.position.z);
            if (this.position.distanceTo(targetLookPos) > 0.2) {
                this.mesh.lookAt(targetLookPos);
            }
        } else if (moveDir.lengthSq() > 0.01) {
            const moveLookPos = new THREE.Vector3(this.position.x + moveDir.x, this.position.y, this.position.z + moveDir.z);
            if (this.position.distanceTo(moveLookPos) > 0.2) {
                this.mesh.lookAt(moveLookPos);
            }
        }
    }

    tryShoot(projectileManager, player, allBots, onKillCallback) {
        const now = performance.now() / 1000;
        if (now - this.lastShotTime < this.fireInterval) return;
        if (!this.target || !this.target.isAlive) return;

        this.lastShotTime = now;
        soundEngine.playAssaultRifle();

        // 봇 발사 원점 및 방향 (오차 적용)
        const eyeOrigin = new THREE.Vector3(this.position.x, this.position.y + 1.4, this.position.z);
        const targetCenter = new THREE.Vector3(
            this.target.position.x,
            this.target.position.y + 1.2,
            this.target.position.z
        );

        const shootDir = targetCenter.clone().sub(eyeOrigin).normalize();

        // 봇 사격 히트스캔
        projectileManager.processHitscan(
            eyeOrigin,
            shootDir,
            120,
            14, // 봇 대미지
            this.accuracySpread,
            1,
            this,
            player,
            allBots,
            onKillCallback
        );
    }
}
