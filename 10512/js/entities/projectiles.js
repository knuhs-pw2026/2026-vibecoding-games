// js/entities/projectiles.js - 탄도 궤적 및 로켓 투사체 시스템

import { soundEngine } from '../engine/audio.js';
import { physicsWorld } from '../engine/physics.js';
import { gameRenderer } from '../engine/renderer.js';

export class ProjectileManager {
    constructor(scene) {
        this.scene = scene;
        this.tracers = [];
        this.rockets = [];
    }

    // 1. 히트스캔 탄도 궤적 (Tracer Laser Line)
    addTracer(start, end, color = 0x00f0ff) {
        const material = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.9,
            linewidth: 2
        });

        const points = [start.clone(), end.clone()];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);

        this.scene.add(line);
        this.tracers.push({
            mesh: line,
            life: 0.08,
            maxLife: 0.08
        });
    }

    // 2. 로켓 투사체 발사
    spawnRocket(origin, direction, shooter, damage = 120, splashRadius = 6.0) {
        const group = new THREE.Group();
        group.position.copy(origin);

        const rocketGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8);
        const rocketMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
        const rocketMesh = new THREE.Mesh(rocketGeo, rocketMat);
        rocketMesh.rotation.x = Math.PI / 2;
        group.add(rocketMesh);

        // 로켓 후미 추진 화염 라이트
        const flameLight = new THREE.PointLight(0xffaa00, 3.0, 6);
        group.add(flameLight);

        // 방향 설정
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

    // 업데이트 루프
    update(dt, player, bots = [], onKillCallback) {
        // 1. 탄도 궤적 페이드 아웃
        for (let i = this.tracers.length - 1; i >= 0; i--) {
            const tr = this.tracers[i];
            tr.life -= dt;
            tr.mesh.material.opacity = (tr.life / tr.maxLife) * 0.9;
            if (tr.life <= 0) {
                this.scene.remove(tr.mesh);
                tr.mesh.geometry.dispose();
                tr.mesh.material.dispose();
                this.tracers.splice(i, 1);
            }
        }

        // 2. 로켓 투사체 이동 및 충돌
        for (let i = this.rockets.length - 1; i >= 0; i--) {
            const r = this.rockets[i];
            r.life -= dt;

            const moveStep = r.direction.clone().multiplyScalar(r.speed * dt);
            const prevPos = r.group.position.clone();
            r.group.position.add(moveStep);

            // 추진 스파크
            if (Math.random() < 0.4) {
                gameRenderer.createHitSparks(r.group.position, 0xff7700, 2);
            }

            // 충돌 체크 (벽 레이캐스트)
            const mapHit = physicsWorld.raycastMap(prevPos, r.direction, moveStep.length());
            let hasDetonated = mapHit.hit || r.life <= 0;
            let detonatePos = mapHit.hit ? mapHit.point : r.group.position;

            // 충돌 체크 (플레이어 / 봇 직격)
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
                // 대형 폭발 발생
                gameRenderer.createExplosion(detonatePos, r.splashRadius);
                soundEngine.playExplosion();

                // 스플래시 대미지 계산
                this.applySplashDamage(detonatePos, r.splashRadius, r.damage, r.shooter, player, bots, onKillCallback);

                // 로켓 제거
                this.scene.remove(r.group);
                this.rockets.splice(i, 1);
            }
        }
    }

    // 스플래시 폭발 피해
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

    // 히트스캔 사격 처리 (총알 즉시 판정)
    processHitscan(origin, direction, range, damage, spread, pellets, shooter, player, bots, onKillCallback) {
        let anyHit = false;
        let anyHeadshot = false;
        let totalDamageDealt = 0;

        for (let p = 0; p < pellets; p++) {
            // 탄퍼짐 계산
            const spreadDir = direction.clone().add(new THREE.Vector3(
                (Math.random() - 0.5) * spread,
                (Math.random() - 0.5) * spread,
                (Math.random() - 0.5) * spread
            )).normalize();

            // 1. 맵 충돌 거리
            const mapHit = physicsWorld.raycastMap(origin, spreadDir, range);
            let closestDist = mapHit.hit ? mapHit.distance : range;
            let hitTarget = null;
            let isHeadshot = false;

            // 2. 플레이어 및 봇과의 교차 검사
            const targets = [player, ...bots];
            const ray = new THREE.Ray(origin, spreadDir);

            for (const target of targets) {
                if (target === shooter || !target.isAlive) continue;

                // 머리 & 몸통 AABB
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
                        closestDist = dist;
                        hitTarget = target;
                        isHeadshot = true;
                    }
                } else if (ray.intersectBox(bodyBox, bodyIntersect)) {
                    const dist = origin.distanceTo(bodyIntersect);
                    if (dist < closestDist) {
                        closestDist = dist;
                        hitTarget = target;
                        isHeadshot = false;
                    }
                }
            }

            const endPoint = origin.clone().add(spreadDir.multiplyScalar(closestDist));

            // 탄도 궤적 렌더링
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
                // 벽 충돌 스파크
                gameRenderer.createHitSparks(endPoint, 0x00ffff, 6);
            }
        }

        // 플레이어 사격 피드백 (히트마커 사운드 & UI)
        if (shooter === player && anyHit) {
            soundEngine.playHitmark(anyHeadshot);
            if (window.hudManager) {
                window.hudManager.showHitmarker(anyHeadshot);
                window.hudManager.showDamageNumber(totalDamageDealt);
            }
        }
    }
}
