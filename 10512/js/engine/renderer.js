// js/engine/renderer.js - Three.js 씬, 조명, 렌더러 및 파티클 관리자

export class GameRenderer {
    constructor() {
        this.container = document.getElementById('game-container');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });

        // 파티클 풀링
        this.particles = [];
        this.muzzleFlashes = [];

        this.init();
    }

    init() {
        // 렌더러 설정
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.container.appendChild(this.renderer.domElement);

        // 사이버펑크 배경 안개
        this.scene.background = new THREE.Color(0x060913);
        this.scene.fog = new THREE.FogExp2(0x080e1a, 0.015);
        this.scene.add(this.camera);

        // 조명 설정
        this.setupLights();

        // 윈도우 리사이즈 대응
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLights() {
        // 환경광 (은은한 앰비언트)
        const ambientLight = new THREE.AmbientLight(0x182438, 1.2);
        this.scene.add(ambientLight);

        // 메인 디렉셔널 라이트 (달빛/인공 조명)
        const dirLight = new THREE.DirectionalLight(0x70a0ff, 1.0);
        dirLight.position.set(40, 60, 30);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 10;
        dirLight.shadow.camera.far = 150;
        const d = 50;
        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;
        dirLight.shadow.bias = -0.0005;
        this.scene.add(dirLight);

        // 네온 포인트 라이트 (시안/핑크 사이버 테마)
        const light1 = new THREE.PointLight(0x00f0ff, 2.5, 35);
        light1.position.set(-20, 8, -20);
        this.scene.add(light1);

        const light2 = new THREE.PointLight(0xff0077, 2.5, 35);
        light2.position.set(20, 8, 20);
        this.scene.add(light2);

        const lightCenter = new THREE.PointLight(0xffe600, 3.0, 40);
        lightCenter.position.set(0, 12, 0);
        this.scene.add(lightCenter);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // 파티클 생성 (탄착 스파크, 폭발)
    createHitSparks(position, color = 0x00f0ff, count = 8) {
        const pGeo = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions.push(position.x, position.y, position.z);
            velocities.push(
                (Math.random() - 0.5) * 8,
                Math.random() * 8 + 2,
                (Math.random() - 0.5) * 8
            );
        }

        pGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const pMat = new THREE.PointsMaterial({
            color: color,
            size: 0.15,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending
        });

        const pSystem = new THREE.Points(pGeo, pMat);
        this.scene.add(pSystem);

        this.particles.push({
            mesh: pSystem,
            velocities: velocities,
            life: 0.4,
            maxLife: 0.4
        });
    }

    // 대형 폭발 이펙트 (구체 팽창 + 불꽃 파티클)
    createExplosion(position, radius = 5.0) {
        // 팽창하는 글로우 구체
        const sphereGeo = new THREE.SphereGeometry(0.5, 16, 16);
        const sphereMat = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.9,
            wireframe: true
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.copy(position);
        this.scene.add(sphere);

        // 스파크 파티클 30개
        this.createHitSparks(position, 0xff3300, 30);
        this.createHitSparks(position, 0xffe600, 20);

        // 동적 폭발 라이트
        const expLight = new THREE.PointLight(0xff6600, 8.0, 25);
        expLight.position.copy(position);
        this.scene.add(expLight);

        this.particles.push({
            mesh: sphere,
            light: expLight,
            isExplosionSphere: true,
            maxScale: radius * 1.8,
            life: 0.5,
            maxLife: 0.5
        });
    }

    // 파티클 업데이트 루프
    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;

            if (p.isExplosionSphere) {
                const progress = 1 - (p.life / p.maxLife);
                const currentScale = 0.5 + progress * p.maxScale;
                p.mesh.scale.set(currentScale, currentScale, currentScale);
                p.mesh.material.opacity = (p.life / p.maxLife) * 0.9;
                if (p.light) {
                    p.light.intensity = (p.life / p.maxLife) * 8.0;
                }

                if (p.life <= 0) {
                    this.scene.remove(p.mesh);
                    if (p.light) this.scene.remove(p.light);
                    p.mesh.geometry.dispose();
                    p.mesh.material.dispose();
                    this.particles.splice(i, 1);
                }
            } else {
                const positions = p.mesh.geometry.attributes.position.array;
                for (let j = 0; j < positions.length; j += 3) {
                    const vIdx = j;
                    positions[j] += p.velocities[vIdx] * dt;
                    positions[j + 1] += p.velocities[vIdx + 1] * dt;
                    positions[j + 2] += p.velocities[vIdx + 2] * dt;
                    p.velocities[vIdx + 1] -= 18.0 * dt; // 중력
                }
                p.mesh.geometry.attributes.position.needsUpdate = true;
                p.mesh.material.opacity = p.life / p.maxLife;

                if (p.life <= 0) {
                    this.scene.remove(p.mesh);
                    p.mesh.geometry.dispose();
                    p.mesh.material.dispose();
                    this.particles.splice(i, 1);
                }
            }
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

export const gameRenderer = new GameRenderer();
