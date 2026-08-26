// js/world/map.js - 사이버 아레나 3D 맵 빌더

import { physicsWorld } from '../engine/physics.js';

export class ArenaMap {
    constructor(scene) {
        this.scene = scene;
        this.mapSize = 70; // 70x70 크기의 전투 구역
        this.spawnPoints = [];
    }

    // 절차적 사이버 그리드 텍스처 생성
    createGridTexture(lineColor = '#00f0ff', bgColor = '#0b1320') {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, 512, 512);

        // 외곽선 및 그리드
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, 512, 512);

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
        ctx.lineWidth = 2;
        const step = 64;
        for (let x = 0; x <= 512; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 512);
            ctx.stroke();
        }
        for (let y = 0; y <= 512; y += step) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(512, y);
            ctx.stroke();
        }

        // 중심 사이버 문양
        ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
        ctx.fillRect(240, 240, 32, 32);

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }

    // 메탈릭 패널 텍스처
    createWallTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#141d2b';
        ctx.fillRect(0, 0, 512, 512);

        ctx.fillStyle = '#1a2538';
        ctx.fillRect(8, 8, 240, 240);
        ctx.fillRect(264, 8, 240, 240);
        ctx.fillRect(8, 264, 240, 240);
        ctx.fillRect(264, 264, 240, 240);

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 4;
        ctx.strokeRect(20, 20, 216, 216);
        ctx.strokeRect(276, 276, 216, 216);

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }

    build() {
        const floorTex = this.createGridTexture('#00d8ff', '#080e18');
        floorTex.repeat.set(16, 16);

        const wallTex = this.createWallTexture();
        wallTex.repeat.set(4, 2);

        // 1. 메인 바닥 (Floor)
        const floorGeo = new THREE.PlaneGeometry(this.mapSize, this.mapSize);
        const floorMat = new THREE.MeshStandardMaterial({
            map: floorTex,
            roughness: 0.3,
            metalness: 0.6
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // 2. 외곽 경계 벽 (Perimeter Walls)
        const wallHeight = 10;
        const halfSize = this.mapSize / 2;
        const wallMat = new THREE.MeshStandardMaterial({
            map: wallTex,
            roughness: 0.4,
            metalness: 0.5
        });

        const walls = [
            // North
            { pos: [0, wallHeight / 2, -halfSize], size: [this.mapSize, wallHeight, 1] },
            // South
            { pos: [0, wallHeight / 2, halfSize], size: [this.mapSize, wallHeight, 1] },
            // East
            { pos: [halfSize, wallHeight / 2, 0], size: [1, wallHeight, this.mapSize] },
            // West
            { pos: [-halfSize, wallHeight / 2, 0], size: [1, wallHeight, this.mapSize] }
        ];

        walls.forEach(w => {
            const mesh = new THREE.Mesh(
                new THREE.BoxGeometry(w.size[0], w.size[1], w.size[2]),
                wallMat
            );
            mesh.position.set(w.pos[0], w.pos[1], w.pos[2]);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);

            physicsWorld.addBoxCollider(
                new THREE.Vector3(w.pos[0] - w.size[0]/2, w.pos[1] - w.size[1]/2, w.pos[2] - w.size[2]/2),
                new THREE.Vector3(w.pos[0] + w.size[0]/2, w.pos[1] + w.size[1]/2, w.pos[2] + w.size[2]/2)
            );
        });

        // 3. 2층 고지대 테라스 (Upper Walkways & Platforms)
        this.createPlatform(0, 5, -24, 28, 0.8, 8); // 북쪽 테라스
        this.createPlatform(0, 5, 24, 28, 0.8, 8);  // 남쪽 테라스
        this.createPlatform(-24, 5, 0, 8, 0.8, 28); // 서쪽 테라스
        this.createPlatform(24, 5, 0, 8, 0.8, 28);  // 동쪽 테라스

        // 4. 중앙 전술 타워 및 기둥
        this.createObstacle(0, 2, 0, 6, 4, 6, 0xff0055);

        // 엄폐물 상자들 (Covers)
        const covers = [
            [-10, 1.2, -10, 3, 2.4, 3],
            [10, 1.2, -10, 3, 2.4, 3],
            [-10, 1.2, 10, 3, 2.4, 3],
            [10, 1.2, 10, 3, 2.4, 3],
            [-18, 1.2, 0, 4, 2.4, 1.5],
            [18, 1.2, 0, 4, 2.4, 1.5],
            [0, 1.2, -14, 5, 2.4, 1.5],
            [0, 1.2, 14, 5, 2.4, 1.5]
        ];

        covers.forEach(c => {
            this.createObstacle(c[0], c[1], c[2], c[3], c[4], c[5], 0x00f0ff);
        });

        // 5. 점프 패드 설치 (슈퍼 점프 발판)
        this.createJumpPadMesh(new THREE.Vector3(-14, 0.1, -14));
        this.createJumpPadMesh(new THREE.Vector3(14, 0.1, -14));
        this.createJumpPadMesh(new THREE.Vector3(-14, 0.1, 14));
        this.createJumpPadMesh(new THREE.Vector3(14, 0.1, 14));
        this.createJumpPadMesh(new THREE.Vector3(0, 4.1, 0), 25.0); // 중앙 타워 위 메가 점프패드

        // 6. 스폰 포인트 목록 설정
        this.spawnPoints = [
            new THREE.Vector3(-22, 1.5, -22),
            new THREE.Vector3(22, 1.5, -22),
            new THREE.Vector3(-22, 1.5, 22),
            new THREE.Vector3(22, 1.5, 22),
            new THREE.Vector3(0, 6.5, -24),
            new THREE.Vector3(0, 6.5, 24),
            new THREE.Vector3(-24, 6.5, 0),
            new THREE.Vector3(24, 6.5, 0),
            new THREE.Vector3(-12, 1.5, 0),
            new THREE.Vector3(12, 1.5, 0)
        ];
    }

    // 2층 플랫폼 생성 함수
    createPlatform(x, y, z, w, h, d) {
        const platGeo = new THREE.BoxGeometry(w, h, d);
        const platMat = new THREE.MeshStandardMaterial({
            color: 0x1a2638,
            roughness: 0.4,
            metalness: 0.7
        });
        const plat = new THREE.Mesh(platGeo, platMat);
        plat.position.set(x, y, z);
        plat.castShadow = true;
        plat.receiveShadow = true;
        this.scene.add(plat);

        // 네온 테두리 스트립
        const edgeGeo = new THREE.BoxGeometry(w + 0.1, 0.2, d + 0.1);
        const edgeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const edge = new THREE.Mesh(edgeGeo, edgeMat);
        edge.position.set(x, y + h/2, z);
        this.scene.add(edge);

        // 플랫폼 지지대 기둥
        const pillarGeo = new THREE.CylinderGeometry(0.5, 0.5, y, 16);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0e1722, metalness: 0.8 });
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(x, y / 2, z);
        pillar.castShadow = true;
        this.scene.add(pillar);

        // 물리 충돌체 등록
        physicsWorld.addBoxCollider(
            new THREE.Vector3(x - w/2, y - h/2, z - d/2),
            new THREE.Vector3(x + w/2, y + h/2, z + d/2)
        );
        physicsWorld.addBoxCollider(
            new THREE.Vector3(x - 0.5, 0, z - 0.5),
            new THREE.Vector3(x + 0.5, y, z + 0.5)
        );
    }

    // 엄폐물 생성
    createObstacle(x, y, z, w, h, d, glowColor = 0x00f0ff) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x121b28,
            roughness: 0.5,
            metalness: 0.6
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);

        // 네온 데칼 라인
        const wireGeo = new THREE.BoxGeometry(w + 0.05, 0.1, d + 0.05);
        const wireMat = new THREE.MeshBasicMaterial({ color: glowColor });
        const wire = new THREE.Mesh(wireGeo, wireMat);
        wire.position.set(x, y, z);
        this.scene.add(wire);

        physicsWorld.addBoxCollider(
            new THREE.Vector3(x - w/2, y - h/2, z - d/2),
            new THREE.Vector3(x + w/2, y + h/2, z + d/2)
        );
    }

    // 점프 패드 생성
    createJumpPadMesh(position, force = 21.0) {
        const padBase = new THREE.Mesh(
            new THREE.CylinderGeometry(1.5, 1.8, 0.2, 16),
            new THREE.MeshStandardMaterial({ color: 0x0a1018, metalness: 0.8 })
        );
        padBase.position.copy(position);
        padBase.receiveShadow = true;
        this.scene.add(padBase);

        // 네온 글로우 링
        const ringGeo = new THREE.RingGeometry(0.5, 1.3, 16);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xffe600,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(position.x, position.y + 0.12, position.z);
        this.scene.add(ring);

        // 점프패드 물리 등록
        physicsWorld.addJumpPad(position, new THREE.Vector3(3.0, 1.0, 3.0), force);
    }

    // 랜덤 스폰 위치 반환
    getRandomSpawnPoint() {
        const idx = Math.floor(Math.random() * this.spawnPoints.length);
        const pt = this.spawnPoints[idx];
        return pt.clone().add(new THREE.Vector3((Math.random()-0.5)*2, 0, (Math.random()-0.5)*2));
    }
}
