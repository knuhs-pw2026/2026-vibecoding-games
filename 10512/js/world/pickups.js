// js/world/pickups.js - 체력, 쉴드, 탄약 픽업 아이템 매니저

import { soundEngine } from '../engine/audio.js';

export class PickupManager {
    constructor(scene) {
        this.scene = scene;
        this.items = [];
    }

    init() {
        // 맵 내 주요 전략 위치에 픽업 아이템 배치
        const spawnLocations = [
            { pos: new THREE.Vector3(0, 5.8, -24), type: 'health' },
            { pos: new THREE.Vector3(0, 5.8, 24), type: 'shield' },
            { pos: new THREE.Vector3(-24, 5.8, 0), type: 'ammo' },
            { pos: new THREE.Vector3(24, 5.8, 0), type: 'health' },
            { pos: new THREE.Vector3(-14, 1.2, 0), type: 'shield' },
            { pos: new THREE.Vector3(14, 1.2, 0), type: 'ammo' },
            { pos: new THREE.Vector3(0, 1.2, -8), type: 'health' },
            { pos: new THREE.Vector3(0, 1.2, 8), type: 'shield' }
        ];

        spawnLocations.forEach(loc => this.createPickup(loc.pos, loc.type));
    }

    createPickup(pos, type) {
        const group = new THREE.Group();
        group.position.copy(pos);

        let color = 0x00ff66;
        let geometry;

        if (type === 'health') {
            color = 0x00ff66;
            geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        } else if (type === 'shield') {
            color = 0x00c3ff;
            geometry = new THREE.OctahedronGeometry(0.6);
        } else {
            color = 0xffe600;
            geometry = new THREE.BoxGeometry(1.0, 0.6, 0.7);
        }

        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.2
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        group.add(mesh);

        // 아이템 하단 빛무리
        const light = new THREE.PointLight(color, 1.5, 4);
        light.position.set(0, 0.2, 0);
        group.add(light);

        this.scene.add(group);

        this.items.push({
            group: group,
            mesh: mesh,
            light: light,
            type: type,
            baseY: pos.y,
            active: true,
            respawnTimer: 0,
            respawnDuration: 15.0 // 15초 후 리스폰
        });
    }

    update(dt, player, bots = []) {
        this.items.forEach(item => {
            if (item.active) {
                // 부유 및 회전 애니메이션
                item.group.rotation.y += 1.8 * dt;
                item.group.position.y = item.baseY + Math.sin(Date.now() * 0.003) * 0.15;

                // 플레이어와 거리 체크 (충돌 판정)
                const distToPlayer = item.group.position.distanceTo(player.position);
                if (distToPlayer < 1.8) {
                    this.consumeItem(item, player, true);
                }

                // 봇들과의 거리 체크
                if (item.active) {
                    for (const bot of bots) {
                        if (bot.isAlive && item.group.position.distanceTo(bot.position) < 1.8) {
                            this.consumeItem(item, bot, false);
                            break;
                        }
                    }
                }
            } else {
                item.respawnTimer -= dt;
                if (item.respawnTimer <= 0) {
                    item.active = true;
                    item.group.visible = true;
                }
            }
        });
    }

    consumeItem(item, entity, isPlayer) {
        let applied = false;

        if (item.type === 'health') {
            if (entity.hp < entity.maxHp) {
                entity.hp = Math.min(entity.maxHp, entity.hp + 50);
                applied = true;
            }
        } else if (item.type === 'shield') {
            if (entity.shield < entity.maxShield) {
                entity.shield = Math.min(entity.maxShield, entity.shield + 50);
                applied = true;
            }
        } else if (item.type === 'ammo') {
            if (entity.weapons) {
                entity.weapons.forEach(w => w.refillAmmo());
                applied = true;
            }
        }

        if (applied) {
            item.active = false;
            item.group.visible = false;
            item.respawnTimer = item.respawnDuration;

            if (isPlayer) {
                soundEngine.playPickup(item.type);
                if (window.hudManager) {
                    window.hudManager.showInteractionMessage(
                        item.type === 'health' ? '+50 HEALTH RECOVERED' :
                        item.type === 'shield' ? '+50 SHIELD CHARGED' : 'AMMO RESUPPLIED'
                    );
                    if (item.type === 'health' || item.type === 'shield') {
                        window.hudManager.triggerHealVignette();
                    }
                }
            }
        }
    }
}
