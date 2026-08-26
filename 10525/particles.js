/**
 * CYBER STRIKE 2099 - Particle & Visual Effects Engine
 * Manages spark showers, bullet tracers, muzzle flashes, explosions, holographic pickups,
 * Supernova Laser Beam, and SANABI Chain Arm (사슬팔) 3D Grapple Wire & Execution Slam FX.
 */

class ParticleEngine {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.tracers = [];
        this.pickups = [];
        this.activeBeams = [];

        // Dynamic 3D Chain Wire Mesh
        this.chainMesh = null;
        this.initChainMesh();

        this.glowTex = TextureGenerator.createGlowSpriteTexture('#00f3ff');
        this.glowOrangeTex = TextureGenerator.createGlowSpriteTexture('#ff7700');
        this.glowGreenTex = TextureGenerator.createGlowSpriteTexture('#00ff66');
        this.glowPurpleTex = TextureGenerator.createGlowSpriteTexture('#ff00aa');
    }

    initChainMesh() {
        const chainMat = new THREE.LineBasicMaterial({
            color: 0x00f3ff,
            linewidth: 3,
            transparent: true,
            opacity: 0.95
        });
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(60); // 20 segments
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.chainMesh = new THREE.Line(geom, chainMat);
        this.chainMesh.visible = false;
        this.scene.add(this.chainMesh);
    }

    // Update 3D Grapple Chain Link Line between Player Hand and Target
    updateGrappleChain(startPos, endPos, isVisible = true) {
        if (!this.chainMesh) return;
        if (!isVisible) {
            this.chainMesh.visible = false;
            return;
        }

        this.chainMesh.visible = true;
        const posAttr = this.chainMesh.geometry.attributes.position;
        const count = 20;

        for (let i = 0; i < count; i++) {
            const t = i / (count - 1);
            // Linear interpolation with subtle dynamic chain sag/wave
            const p = startPos.clone().lerp(endPos, t);
            const sag = Math.sin(t * Math.PI) * 0.15;
            p.y -= sag;

            posAttr.setXYZ(i, p.x, p.y, p.z);
        }
        posAttr.needsUpdate = true;
    }

    // SANABI Chain Execution Slam Impact (처형 분쇄 폭발 효과)
    createExecutionSlamFX(position) {
        // 1. Massive Radial Shockwave Ring
        const ringGeo = new THREE.RingGeometry(0.3, 0.8, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00f3ff,
            transparent: true,
            opacity: 0.95,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(position);
        ring.rotation.x = -Math.PI / 2;

        this.scene.add(ring);
        this.particles.push({
            mesh: ring,
            life: 0.35,
            maxLife: 0.35,
            update: (dt, p) => {
                const scale = (1 - p.life / p.maxLife) * 8.0;
                p.mesh.scale.set(scale, scale, scale);
                ringMat.opacity = (p.life / p.maxLife);
            }
        });

        // 2. High-speed kinetic spark & debris burst
        for (let i = 0; i < 40; i++) {
            const size = 0.15 + Math.random() * 0.25;
            const isCyan = Math.random() > 0.3;
            const spriteMat = new THREE.SpriteMaterial({
                map: isCyan ? this.glowTex : this.glowPurpleTex,
                color: 0xffffff,
                transparent: true,
                opacity: 1.0,
                blending: THREE.AdditiveBlending
            });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.position.copy(position);
            sprite.scale.set(size, size, size);

            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 16,
                Math.random() * 14 + 3,
                (Math.random() - 0.5) * 16
            );

            this.scene.add(sprite);
            this.particles.push({
                mesh: sprite,
                velocity: vel,
                gravity: -10.0,
                life: 0.35 + Math.random() * 0.3,
                maxLife: 0.65,
                update: (dt, p) => {
                    p.velocity.y += p.gravity * dt;
                    p.mesh.position.addScaledVector(p.velocity, dt);
                    spriteMat.opacity = p.life / p.maxLife;
                    p.mesh.scale.multiplyScalar(0.97);
                }
            });
        }
    }

    // 1. Bullet Tracer Effect
    createTracer(startPos, endPos, color = 0x00f3ff, width = 2) {
        const material = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.9,
            linewidth: width
        });
        const points = [startPos.clone(), endPos.clone()];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);

        this.scene.add(line);
        this.tracers.push({
            mesh: line,
            material: material,
            life: 0.1,
            maxLife: 0.1
        });
    }

    // 2. Muzzle Flash Effect
    createMuzzleFlash(position, color = 0x00f3ff, size = 0.6) {
        const spriteMat = new THREE.SpriteMaterial({
            map: color === 0xff7700 ? this.glowOrangeTex : this.glowTex,
            color: 0xffffff,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending
        });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.position.copy(position);
        sprite.scale.set(size, size, size);

        this.scene.add(sprite);
        this.particles.push({
            mesh: sprite,
            life: 0.05,
            maxLife: 0.05,
            update: (dt, p) => {
                p.mesh.scale.multiplyScalar(0.9);
            }
        });
    }

    // 3. Railgun Charging Sparks
    createChargeSparks(position) {
        for (let i = 0; i < 4; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 0.8 + Math.random() * 0.6;
            const startPos = position.clone().add(new THREE.Vector3(
                Math.cos(angle) * dist,
                (Math.random() - 0.5) * dist,
                Math.sin(angle) * dist
            ));

            const spriteMat = new THREE.SpriteMaterial({
                map: this.glowTex,
                color: 0x00f3ff,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending
            });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.position.copy(startPos);
            sprite.scale.set(0.12, 0.12, 0.12);

            this.scene.add(sprite);
            this.particles.push({
                mesh: sprite,
                target: position,
                life: 0.15,
                maxLife: 0.15,
                update: (dt, p) => {
                    p.mesh.position.lerp(p.target, dt * 15);
                    p.mesh.scale.multiplyScalar(0.9);
                }
            });
        }
    }

    // 4. COLOSSAL HIGH-OUTPUT LASER CANNON BEAM (Image 2 style)
    createMegaLaserBeam(origin, direction, length = 100) {
        const beamGroup = new THREE.Group();
        const midPoint = origin.clone().addScaledVector(direction, length / 2);

        // Core Inner Beam
        const innerGeo = new THREE.CylinderGeometry(0.35, 0.55, length, 16);
        const innerMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.98,
            blending: THREE.AdditiveBlending
        });
        const innerMesh = new THREE.Mesh(innerGeo, innerMat);

        // Outer Neon Cyan Glow Beam
        const outerGeo = new THREE.CylinderGeometry(0.85, 1.4, length, 16);
        const outerMat = new THREE.MeshBasicMaterial({
            color: 0x00e5ff,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending
        });
        const outerMesh = new THREE.Mesh(outerGeo, outerMat);

        // Massive Energy Aura Shroud
        const auraGeo = new THREE.CylinderGeometry(1.6, 2.4, length, 16);
        const auraMat = new THREE.MeshBasicMaterial({
            color: 0x0088ff,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending,
            wireframe: true
        });
        const auraMesh = new THREE.Mesh(auraGeo, auraMat);

        innerMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        outerMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        auraMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

        innerMesh.position.copy(midPoint);
        outerMesh.position.copy(midPoint);
        auraMesh.position.copy(midPoint);

        beamGroup.add(innerMesh, outerMesh, auraMesh);

        for (let i = 0; i < 8; i++) {
            const ringGeo = new THREE.RingGeometry(0.8, 1.6, 16);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
            ring.position.copy(origin.clone().addScaledVector(direction, i * (length / 8)));
            beamGroup.add(ring);
        }

        const flareMat = new THREE.SpriteMaterial({
            map: this.glowTex,
            color: 0xffffff,
            blending: THREE.AdditiveBlending
        });
        const flare = new THREE.Sprite(flareMat);
        flare.scale.set(4.5, 4.5, 4.5);
        flare.position.copy(origin);
        beamGroup.add(flare);

        this.scene.add(beamGroup);

        this.activeBeams.push({
            group: beamGroup,
            innerMat: innerMat,
            outerMat: outerMat,
            auraMat: auraMat,
            auraMesh: auraMesh,
            innerMesh: innerMesh,
            life: 0.55,
            maxLife: 0.55
        });

        this.createExplosion(origin, 3.5);
    }

    // 5. Impact Spark Shower
    createImpactSparks(position, normal, count = 12, color = 0x00f3ff) {
        for (let i = 0; i < count; i++) {
            const size = 0.08 + Math.random() * 0.08;
            const spriteMat = new THREE.SpriteMaterial({
                map: this.glowTex,
                color: color,
                transparent: true,
                opacity: 1.0,
                blending: THREE.AdditiveBlending
            });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.position.copy(position);
            sprite.scale.set(size, size, size);

            const vel = new THREE.Vector3(
                normal.x + (Math.random() - 0.5) * 1.5,
                normal.y + (Math.random() - 0.5) * 1.5,
                normal.z + (Math.random() - 0.5) * 1.5
            ).normalize().multiplyScalar(4 + Math.random() * 8);

            this.scene.add(sprite);
            this.particles.push({
                mesh: sprite,
                velocity: vel,
                gravity: -9.8,
                life: 0.25 + Math.random() * 0.2,
                maxLife: 0.4,
                update: (dt, p) => {
                    p.velocity.y += p.gravity * dt;
                    p.mesh.position.addScaledVector(p.velocity, dt);
                    spriteMat.opacity = p.life / p.maxLife;
                }
            });
        }
    }

    // 6. Enemy Cyber-Blood Burst
    createEnemyHitFX(position, count = 10, isHeadshot = false) {
        const color = isHeadshot ? 0xff0055 : 0x00f3ff;
        for (let i = 0; i < count; i++) {
            const size = 0.1 + Math.random() * 0.12;
            const spriteMat = new THREE.SpriteMaterial({
                map: isHeadshot ? this.glowPurpleTex : this.glowTex,
                color: color,
                transparent: true,
                opacity: 1.0,
                blending: THREE.AdditiveBlending
            });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.position.copy(position);
            sprite.scale.set(size, size, size);

            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 6,
                Math.random() * 5 + 1,
                (Math.random() - 0.5) * 6
            );

            this.scene.add(sprite);
            this.particles.push({
                mesh: sprite,
                velocity: vel,
                gravity: -6.0,
                life: 0.35 + Math.random() * 0.2,
                maxLife: 0.5,
                update: (dt, p) => {
                    p.velocity.y += p.gravity * dt;
                    p.mesh.position.addScaledVector(p.velocity, dt);
                    spriteMat.opacity = p.life / p.maxLife;
                }
            });
        }
    }

    // 7. Massive Explosion
    createExplosion(position, radius = 4) {
        const ringGeo = new THREE.RingGeometry(0.2, 0.5, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00f3ff,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(position);
        ring.rotation.x = -Math.PI / 2;

        this.scene.add(ring);
        this.particles.push({
            mesh: ring,
            life: 0.45,
            maxLife: 0.45,
            update: (dt, p) => {
                const scale = (1 - p.life / p.maxLife) * (radius * 2.5);
                p.mesh.scale.set(scale, scale, scale);
                ringMat.opacity = (p.life / p.maxLife) * 0.9;
            }
        });

        for (let i = 0; i < 30; i++) {
            const size = 0.25 + Math.random() * 0.35;
            const isOrange = Math.random() > 0.4;
            const spriteMat = new THREE.SpriteMaterial({
                map: isOrange ? this.glowOrangeTex : this.glowTex,
                color: 0xffffff,
                transparent: true,
                opacity: 1.0,
                blending: THREE.AdditiveBlending
            });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.position.copy(position);
            sprite.scale.set(size, size, size);

            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 14,
                Math.random() * 12 + 2,
                (Math.random() - 0.5) * 14
            );

            this.scene.add(sprite);
            this.particles.push({
                mesh: sprite,
                velocity: vel,
                gravity: -8.0,
                life: 0.4 + Math.random() * 0.4,
                maxLife: 0.8,
                update: (dt, p) => {
                    p.velocity.y += p.gravity * dt;
                    p.mesh.position.addScaledVector(p.velocity, dt);
                    spriteMat.opacity = p.life / p.maxLife;
                    p.mesh.scale.multiplyScalar(0.98);
                }
            });
        }
    }

    // 8. Holographic Pickups
    spawnPickup(type, position) {
        const group = new THREE.Group();
        group.position.copy(position);

        let color, innerMesh;
        if (type === 'health') {
            color = 0xff0055;
            const crossMat = new THREE.MeshStandardMaterial({
                color: 0xff0055,
                emissive: 0xff0055,
                emissiveIntensity: 0.8,
                roughness: 0.2
            });
            const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.2), crossMat);
            const hBar = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.2), crossMat);
            group.add(vBar);
            group.add(hBar);
        } else if (type === 'shield') {
            color = 0x00a8ff;
            const shieldMat = new THREE.MeshStandardMaterial({
                color: 0x00a8ff,
                emissive: 0x0066ff,
                emissiveIntensity: 0.8
            });
            innerMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), shieldMat);
            group.add(innerMesh);
        } else {
            color = 0xffaa00;
            const ammoMat = new THREE.MeshStandardMaterial({
                color: 0xffaa00,
                emissive: 0xff6600,
                emissiveIntensity: 0.8
            });
            innerMesh = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.3), ammoMat);
            group.add(innerMesh);
        }

        const wireGeo = new THREE.IcosahedronGeometry(0.5, 1);
        const wireMat = new THREE.MeshBasicMaterial({
            color: color,
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });
        const wireMesh = new THREE.Mesh(wireGeo, wireMat);
        group.add(wireMesh);

        const groundRing = new THREE.Mesh(
            new THREE.RingGeometry(0.4, 0.6, 16),
            new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
        );
        groundRing.rotation.x = -Math.PI / 2;
        groundRing.position.y = -position.y + 0.05;
        group.add(groundRing);

        this.scene.add(group);

        const pickupObj = {
            type: type,
            group: group,
            baseY: position.y,
            time: Math.random() * 10,
            active: true
        };
        this.pickups.push(pickupObj);
        return pickupObj;
    }

    update(dt) {
        for (let i = this.tracers.length - 1; i >= 0; i--) {
            const t = this.tracers[i];
            t.life -= dt;
            t.material.opacity = (t.life / t.maxLife) * 0.9;
            if (t.life <= 0) {
                this.scene.remove(t.mesh);
                t.mesh.geometry.dispose();
                t.material.dispose();
                this.tracers.splice(i, 1);
            }
        }

        for (let i = this.activeBeams.length - 1; i >= 0; i--) {
            const b = this.activeBeams[i];
            b.life -= dt;
            const progress = b.life / b.maxLife;

            b.auraMesh.rotation.y += dt * 12;
            b.innerMat.opacity = Math.min(1.0, progress * 1.5);
            b.outerMat.opacity = progress * 0.7;
            b.auraMat.opacity = progress * 0.4;

            if (b.life <= 0) {
                this.scene.remove(b.group);
                this.activeBeams.splice(i, 1);
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            if (p.update) p.update(dt, p);
            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                if (p.mesh.geometry) p.mesh.geometry.dispose();
                if (p.mesh.material) p.mesh.material.dispose();
                this.particles.splice(i, 1);
            }
        }

        for (let i = this.pickups.length - 1; i >= 0; i--) {
            const pk = this.pickups[i];
            if (!pk.active) {
                this.scene.remove(pk.group);
                this.pickups.splice(i, 1);
                continue;
            }
            pk.time += dt * 2.5;
            pk.group.rotation.y += dt * 1.8;
            pk.group.position.y = pk.baseY + Math.sin(pk.time) * 0.15;
        }
    }
}

window.ParticleEngine = ParticleEngine;
