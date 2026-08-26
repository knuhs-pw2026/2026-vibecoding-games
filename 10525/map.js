/**
 * CYBER STRIKE 2099 - 3D Arena Level Builder & Collision System
 * Builds high-visibility multi-level arena with precise bounding boxes, ramps, and barriers.
 */

class ArenaMap {
    constructor(scene) {
        this.scene = scene;
        this.colliders = [];
        this.ramps = [];
        this.jumpPads = [];
        this.materials = {};

        this.initMaterials();
        this.setupLighting();
        this.buildArena();
    }

    initMaterials() {
        const floorTex = TextureGenerator.createFloorTexture();
        floorTex.repeat.set(16, 16);

        const wallTex = TextureGenerator.createWallTexture();
        wallTex.repeat.set(8, 2);

        const crateTex = TextureGenerator.createCrateTexture();
        const jumpPadTex = TextureGenerator.createJumpPadTexture();

        this.materials = {
            floor: new THREE.MeshStandardMaterial({
                map: floorTex,
                roughness: 0.3,
                metalness: 0.4
            }),
            wall: new THREE.MeshStandardMaterial({
                map: wallTex,
                roughness: 0.4,
                metalness: 0.3
            }),
            crate: new THREE.MeshStandardMaterial({
                map: crateTex,
                roughness: 0.3,
                metalness: 0.5
            }),
            platform: new THREE.MeshStandardMaterial({
                color: 0x24344d,
                roughness: 0.35,
                metalness: 0.6
            }),
            neonCyan: new THREE.MeshBasicMaterial({ color: 0x00f3ff }),
            neonPink: new THREE.MeshBasicMaterial({ color: 0xff0055 }),
            neonGreen: new THREE.MeshBasicMaterial({ color: 0x00ff88 }),
            jumpPad: new THREE.MeshStandardMaterial({
                map: jumpPadTex,
                emissive: 0x00ff88,
                emissiveIntensity: 0.8,
                roughness: 0.2
            })
        };
    }

    setupLighting() {
        this.scene.fog = new THREE.FogExp2(0x18243b, 0.005);

        const ambientLight = new THREE.AmbientLight(0xb8d4ff, 2.4);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 3.0);
        dirLight.position.set(30, 55, 25);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 130;
        const d = 50;
        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;
        this.scene.add(dirLight);

        const rimLight = new THREE.DirectionalLight(0x00d4ff, 1.4);
        rimLight.position.set(-30, 30, -25);
        this.scene.add(rimLight);

        const lightColors = [0x00f3ff, 0xff0055, 0x00ff88, 0xffaa00];
        const lightPositions = [
            [-25, 7, -25],
            [25, 7, -25],
            [-25, 7, 25],
            [25, 7, 25],
            [0, 9, 0]
        ];

        lightPositions.forEach((pos, idx) => {
            const color = lightColors[idx % lightColors.length];
            const pLight = new THREE.PointLight(color, 3.2, 38, 1.8);
            pLight.position.set(pos[0], pos[1], pos[2]);
            this.scene.add(pLight);

            const orb = new THREE.Mesh(
                new THREE.SphereGeometry(0.35, 12, 12),
                new THREE.MeshBasicMaterial({ color: color })
            );
            orb.position.set(pos[0], pos[1], pos[2]);
            this.scene.add(orb);
        });
    }

    addBoxCollider(mesh, boxSize, boxPos) {
        if (mesh) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
        }

        const box = new THREE.Box3();
        box.setFromCenterAndSize(boxPos, boxSize);
        this.colliders.push({ mesh, box, min: box.min, max: box.max });
    }

    buildArena() {
        const arenaSize = 80;
        const wallHeight = 12;

        // 1. Arena Main Floor (80x80)
        const floorGeo = new THREE.PlaneGeometry(arenaSize, arenaSize);
        const floorMesh = new THREE.Mesh(floorGeo, this.materials.floor);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.receiveShadow = true;
        this.scene.add(floorMesh);

        // 2. Perimeter Boundary Walls (North, South, East, West)
        const wallThickness = 2.0;

        // North Wall
        const nWall = new THREE.Mesh(new THREE.BoxGeometry(arenaSize, wallHeight, wallThickness), this.materials.wall);
        nWall.position.set(0, wallHeight / 2, -arenaSize / 2 - wallThickness / 2);
        this.addBoxCollider(nWall, new THREE.Vector3(arenaSize, wallHeight, wallThickness), nWall.position);

        // South Wall
        const sWall = new THREE.Mesh(new THREE.BoxGeometry(arenaSize, wallHeight, wallThickness), this.materials.wall);
        sWall.position.set(0, wallHeight / 2, arenaSize / 2 + wallThickness / 2);
        this.addBoxCollider(sWall, new THREE.Vector3(arenaSize, wallHeight, wallThickness), sWall.position);

        // East Wall
        const eWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, arenaSize), this.materials.wall);
        eWall.position.set(arenaSize / 2 + wallThickness / 2, wallHeight / 2, 0);
        this.addBoxCollider(eWall, new THREE.Vector3(wallThickness, wallHeight, arenaSize), eWall.position);

        // West Wall
        const wWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, arenaSize), this.materials.wall);
        wWall.position.set(-arenaSize / 2 - wallThickness / 2, wallHeight / 2, 0);
        this.addBoxCollider(wWall, new THREE.Vector3(wallThickness, wallHeight, arenaSize), wWall.position);

        // Glowing Trim on Top of Walls
        const trimGeoH = new THREE.BoxGeometry(arenaSize, 0.4, 0.4);
        const nTrim = new THREE.Mesh(trimGeoH, this.materials.neonCyan);
        nTrim.position.set(0, wallHeight, -arenaSize / 2);
        const sTrim = new THREE.Mesh(trimGeoH, this.materials.neonCyan);
        sTrim.position.set(0, wallHeight, arenaSize / 2);
        this.scene.add(nTrim, sTrim);

        // 3. Central Raised Platform (22m x 22m, 3.5m high)
        const platGeo = new THREE.BoxGeometry(22, 3.5, 22);
        const platMesh = new THREE.Mesh(platGeo, this.materials.platform);
        platMesh.position.set(0, 1.75, 0);
        this.addBoxCollider(platMesh, new THREE.Vector3(22, 3.5, 22), platMesh.position);

        const platTrim = new THREE.Mesh(new THREE.BoxGeometry(22.3, 0.25, 22.3), this.materials.neonCyan);
        platTrim.position.set(0, 3.5, 0);
        this.scene.add(platTrim);

        // 4. Central Energy Core (Hologram Pillar)
        const pillarMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 14, 16), new THREE.MeshStandardMaterial({
            color: 0x142033,
            metalness: 0.8,
            roughness: 0.2
        }));
        pillarMesh.position.set(0, 7.0, 0);
        this.addBoxCollider(pillarMesh, new THREE.Vector3(2.8, 14, 2.8), pillarMesh.position);

        const coreRings = [4.5, 6.5, 8.5];
        coreRings.forEach(y => {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.09, 8, 24), this.materials.neonCyan);
            ring.position.set(0, y, 0);
            ring.rotation.x = Math.PI / 2;
            this.scene.add(ring);
        });

        // 5. Access Ramps to Central Platform (South and North)
        this.addRamp(new THREE.Vector3(0, 1.75, 16), new THREE.Vector3(6, 3.5, 10), 'south');
        this.addRamp(new THREE.Vector3(0, 1.75, -16), new THREE.Vector3(6, 3.5, 10), 'north');

        // 6. Tactical Cover Crates across the Arena
        const cratePositions = [
            // Lower Level Ground Crates
            [-15, 1.2, -15, 2.4, 2.4, 2.4],
            [-18, 1.0, -13, 2.0, 2.0, 2.0],
            [15, 1.2, -15, 2.4, 2.4, 2.4],
            [15, 1.2, 15, 2.4, 2.4, 2.4],
            [-15, 1.2, 15, 2.4, 2.4, 2.4],
            [0, 1.0, -28, 3.0, 2.0, 1.5],
            [0, 1.0, 28, 3.0, 2.0, 1.5],
            [-28, 1.0, 0, 1.5, 2.0, 3.0],
            [28, 1.0, 0, 1.5, 2.0, 3.0],
            // Upper Platform Crates (High Ground Cover)
            [-6, 4.5, -6, 2.0, 2.0, 2.0],
            [6, 4.5, 6, 2.0, 2.0, 2.0],
            [-6, 4.5, 6, 2.0, 2.0, 2.0],
            [6, 4.5, -6, 2.0, 2.0, 2.0]
        ];

        cratePositions.forEach(c => {
            const geo = new THREE.BoxGeometry(c[3], c[4], c[5]);
            const mesh = new THREE.Mesh(geo, this.materials.crate);
            mesh.position.set(c[0], c[1], c[2]);
            this.addBoxCollider(mesh, new THREE.Vector3(c[3], c[4], c[5]), mesh.position);
        });

        // 7. Corner Sniper Balconies (4m high) + Solid Railings
        const balconyCorners = [
            [-32, 4.0, -32],
            [32, 4.0, -32],
            [-32, 4.0, 32],
            [32, 4.0, 32]
        ];

        balconyCorners.forEach(pos => {
            // Platform
            const bGeo = new THREE.BoxGeometry(10, 4, 10);
            const bMesh = new THREE.Mesh(bGeo, this.materials.platform);
            bMesh.position.set(pos[0], 2.0, pos[2]);
            this.addBoxCollider(bMesh, new THREE.Vector3(10, 4, 10), bMesh.position);

            // Front Railing (Solid Collider)
            const railGeo = new THREE.BoxGeometry(10.2, 1.2, 0.4);
            const railMat = this.materials.neonPink;
            const r1 = new THREE.Mesh(railGeo, railMat);
            const rZ = pos[2] + (pos[2] < 0 ? 4.8 : -4.8);
            r1.position.set(pos[0], 4.6, rZ);
            this.addBoxCollider(r1, new THREE.Vector3(10.2, 1.2, 0.4), r1.position);

            // Side Railing
            const sideRailGeo = new THREE.BoxGeometry(0.4, 1.2, 10.2);
            const r2 = new THREE.Mesh(sideRailGeo, railMat);
            const rX = pos[0] + (pos[0] < 0 ? 4.8 : -4.8);
            r2.position.set(rX, 4.6, pos[2]);
            this.addBoxCollider(r2, new THREE.Vector3(0.4, 1.2, 10.2), r2.position);
        });

        // 8. Jump Pads
        const jumpPadLocations = [
            new THREE.Vector3(-24, 0.05, -12),
            new THREE.Vector3(24, 0.05, -12),
            new THREE.Vector3(-24, 0.05, 12),
            new THREE.Vector3(24, 0.05, 12)
        ];

        jumpPadLocations.forEach(pos => {
            const padGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.15, 24);
            const padMesh = new THREE.Mesh(padGeo, this.materials.jumpPad);
            padMesh.position.copy(pos);
            this.scene.add(padMesh);

            this.jumpPads.push({
                position: pos,
                radius: 2.0,
                launchForce: 18.0
            });
        });
    }

    // Add Physical Walkable Ramp
    addRamp(centerPos, size, direction) {
        const rampMesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), this.materials.platform);
        rampMesh.position.copy(centerPos);
        const angle = Math.atan2(size.y, size.z);
        rampMesh.rotation.x = direction === 'south' ? angle : -angle;
        rampMesh.castShadow = true;
        rampMesh.receiveShadow = true;
        this.scene.add(rampMesh);

        this.ramps.push({
            minX: centerPos.x - size.x / 2,
            maxX: centerPos.x + size.x / 2,
            minZ: centerPos.z - size.z / 2,
            maxZ: centerPos.z + size.z / 2,
            direction: direction,
            height: size.y,
            mesh: rampMesh
        });
    }

    // Query exact ground height on sloped ramps
    getRampHeightAt(x, z) {
        for (let i = 0; i < this.ramps.length; i++) {
            const r = this.ramps[i];
            if (x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ) {
                if (r.direction === 'south') {
                    // z goes from 21 (ground, 0m) to 11 (top platform, 3.5m)
                    const progress = (r.maxZ - z) / (r.maxZ - r.minZ);
                    return THREE.MathUtils.clamp(progress * r.height, 0, r.height);
                } else if (r.direction === 'north') {
                    // z goes from -21 (ground, 0m) to -11 (top platform, 3.5m)
                    const progress = (z - r.minZ) / (r.maxZ - r.minZ);
                    return THREE.MathUtils.clamp(progress * r.height, 0, r.height);
                }
            }
        }
        return null;
    }
}

window.ArenaMap = ArenaMap;
