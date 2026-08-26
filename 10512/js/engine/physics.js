// js/engine/physics.js - 충돌 판정 및 물리 연산 매니저

export class PhysicsWorld {
    constructor() {
        this.colliders = []; // 정적 맵 충돌체 (AABB 박스들)
        this.jumpPads = [];  // 점프 패드 영역
        this.gravity = -28.0;
    }

    addBoxCollider(min, max, type = 'solid') {
        this.colliders.push({
            min: min.clone ? min.clone() : new THREE.Vector3(min.x, min.y, min.z),
            max: max.clone ? max.clone() : new THREE.Vector3(max.x, max.y, max.z),
            type: type
        });
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

    // AABB vs AABB 충돌 체크
    checkAABBCollision(boxA, boxB) {
        return (
            boxA.min.x <= boxB.max.x && boxA.max.x >= boxB.min.x &&
            boxA.min.y <= boxB.max.y && boxA.max.y >= boxB.min.y &&
            boxA.min.z <= boxB.max.z && boxA.max.z >= boxB.min.z
        );
    }

    // 플레이어/봇 이동 및 충돌 해결 (Sliding collision)
    moveEntity(position, velocity, radius, height, dt, onGroundCheck) {
        let isGrounded = false;

        // 1. 중력 적용
        velocity.y += this.gravity * dt;

        // 2. Y축 이동 및 바닥/천장 충돌
        const newPosY = position.y + velocity.y * dt;
        let finalY = newPosY;

        const bodyBoxY = {
            min: new THREE.Vector3(position.x - radius, newPosY, position.z - radius),
            max: new THREE.Vector3(position.x + radius, newPosY + height, position.z + radius)
        };

        // 기본 지면 (y=0 바닥)
        if (finalY <= 0) {
            finalY = 0;
            velocity.y = 0;
            isGrounded = true;
        }

        for (const col of this.colliders) {
            if (this.checkAABBCollision(bodyBoxY, col)) {
                if (velocity.y < 0 && position.y >= col.max.y - 0.2) {
                    // 상단에 착지
                    finalY = col.max.y;
                    velocity.y = 0;
                    isGrounded = true;
                } else if (velocity.y > 0 && position.y + height <= col.min.y + 0.2) {
                    // 천장에 머리 부딪힘
                    finalY = col.min.y - height;
                    velocity.y = 0;
                }
            }
        }
        position.y = finalY;

        // 3. X축 이동 및 충돌
        const newPosX = position.x + velocity.x * dt;
        let finalX = newPosX;
        const bodyBoxX = {
            min: new THREE.Vector3(newPosX - radius, position.y + 0.1, position.z - radius),
            max: new THREE.Vector3(newPosX + radius, position.y + height - 0.1, position.z + radius)
        };

        for (const col of this.colliders) {
            if (this.checkAABBCollision(bodyBoxX, col)) {
                if (velocity.x > 0) {
                    finalX = col.min.x - radius - 0.001;
                } else if (velocity.x < 0) {
                    finalX = col.max.x + radius + 0.001;
                }
                velocity.x = 0;
                break;
            }
        }
        position.x = finalX;

        // 4. Z축 이동 및 충돌
        const newPosZ = position.z + velocity.z * dt;
        let finalZ = newPosZ;
        const bodyBoxZ = {
            min: new THREE.Vector3(position.x - radius, position.y + 0.1, newPosZ - radius),
            max: new THREE.Vector3(position.x + radius, position.y + height - 0.1, newPosZ + radius)
        };

        for (const col of this.colliders) {
            if (this.checkAABBCollision(bodyBoxZ, col)) {
                if (velocity.z > 0) {
                    finalZ = col.min.z - radius - 0.001;
                } else if (velocity.z < 0) {
                    finalZ = col.max.z + radius + 0.001;
                }
                velocity.z = 0;
                break;
            }
        }
        position.z = finalZ;

        // 5. 점프 패드 밟았는지 확인
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

    // 레이캐스트 충돌 (Ray vs AABB)
    raycastMap(origin, direction, maxDist = 100) {
        let nearestDist = maxDist;
        let hitPoint = null;
        let hitNormal = null;

        const ray = new THREE.Ray(origin, direction.clone().normalize());

        for (const col of this.colliders) {
            const box = new THREE.Box3(col.min, col.max);
            const intersectPoint = new THREE.Vector3();
            if (ray.intersectBox(box, intersectPoint)) {
                const dist = origin.distanceTo(intersectPoint);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    hitPoint = intersectPoint;
                }
            }
        }

        // 바닥 평면 y=0 체크
        const targetPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const planeIntersect = new THREE.Vector3();
        if (ray.intersectPlane(targetPlane, planeIntersect)) {
            const dist = origin.distanceTo(planeIntersect);
            if (dist > 0 && dist < nearestDist) {
                nearestDist = dist;
                hitPoint = planeIntersect;
            }
        }

        return { hit: hitPoint !== null, distance: nearestDist, point: hitPoint };
    }
}

export const physicsWorld = new PhysicsWorld();
