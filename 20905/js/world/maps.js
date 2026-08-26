// maps.js - Generator for all 7 Stages
import { CONFIG } from '../config.js';
import { TileMap } from './tilemap.js';

export class MapGenerator {
  static createStage(stageId) {
    switch (stageId) {
      case 1:
        return MapGenerator.createPlayerHouse();
      case 2:
        return MapGenerator.createPlayerVillage();
      case 3:
        return MapGenerator.createHighwayToCity();
      case 4:
        return MapGenerator.createMetropolis();
      case 5:
        return MapGenerator.createSecretResearchOutpost();
      case 6:
        return MapGenerator.createZombieLab();
      case 7:
        return MapGenerator.createBossChamber();
      default:
        return MapGenerator.createPlayerHouse();
    }
  }

  // --- STAGE 1: PLAYER'S HOUSE (5x5) ---
  static createPlayerHouse() {
    const w = 5, h = 5;
    const map = new TileMap(w, h, 'tile_wood');

    // Walls around perimeter except bottom center exit
    for (let x = 0; x < w; x++) {
      map.setObstacle(x, 0, 'obstacle_crate'); // Top wall
      if (x !== 2) {
        map.setObstacle(x, h - 1, 'obstacle_crate'); // Bottom wall with door at (2, 4)
      }
    }
    for (let y = 0; y < h; y++) {
      map.setObstacle(0, y, 'obstacle_crate'); // Left wall
      map.setObstacle(w - 1, y, 'obstacle_crate'); // Right wall
    }

    // Cozy furniture (1-tile jumpable crates/desk)
    map.setObstacle(1, 1, 'obstacle_crate');
    map.setObstacle(3, 1, 'obstacle_crate');

    // Exit at bottom center
    map.exitTile = { x: 2, y: 4 };
    map.isExitOpen = true;

    return {
      tilemap: map,
      playerStart: { x: 2.5 * CONFIG.TILE_SIZE, y: 2.5 * CONFIG.TILE_SIZE },
      zombieSpawns: [], // Safe house!
      items: [
        { type: 'potion', x: 3.5 * CONFIG.TILE_SIZE, y: 2.5 * CONFIG.TILE_SIZE }
      ],
      objective: {
        type: 'exit_direct',
        text: '아래쪽 출구를 통해 마을로 나가세요!'
      }
    };
  }

  // --- STAGE 2: PLAYER'S VILLAGE (200x200) ---
  static createPlayerVillage() {
    const w = 200, h = 200;
    const map = new TileMap(w, h, 'tile_grass');

    // Perimeter boundary trees
    for (let x = 0; x < w; x++) {
      map.setObstacle(x, 0, 'obstacle_hedge');
      map.setObstacle(x, h - 1, 'obstacle_hedge');
    }
    for (let y = 0; y < h; y++) {
      map.setObstacle(0, y, 'obstacle_hedge');
      map.setObstacle(w - 1, y, 'obstacle_hedge');
    }

    // Dirt Roads crossing the village
    for (let x = 0; x < w; x++) {
      map.setFloor(x, 100, 'tile_dirt');
      map.setFloor(x, 101, 'tile_dirt');
    }
    for (let y = 0; y < h; y++) {
      map.setFloor(100, y, 'tile_dirt');
      map.setFloor(101, y, 'tile_dirt');
    }

    // Add 40 Suburban Houses (3x3) & 120 Trees (2x2) & jumpable fences (1-tile)
    for (let i = 0; i < 35; i++) {
      const hx = 10 + Math.floor(Math.random() * (w - 25));
      const hy = 10 + Math.floor(Math.random() * (h - 25));
      if (Math.abs(hx - 100) > 6 && Math.abs(hy - 100) > 6) {
        map.addMultiProp('multi_house', hx, hy, 3, 3);
        // Fences around houses (1-tile jumpable)
        for (let fx = 0; fx < 5; fx++) {
          if (!map.isSolidTile(hx - 1 + fx, hy + 4)) {
            map.setObstacle(hx - 1 + fx, hy + 4, 'obstacle_fence');
          }
        }
      }
    }

    for (let i = 0; i < 90; i++) {
      const tx = 6 + Math.floor(Math.random() * (w - 14));
      const ty = 6 + Math.floor(Math.random() * (h - 14));
      if (!map.isSolidTile(tx, ty) && !map.isSolidTile(tx + 1, ty + 1)) {
        map.addMultiProp('multi_tree', tx, ty, 2, 2);
      }
    }

    // 1-tile jumpable hedges scattered
    for (let i = 0; i < 150; i++) {
      const hx = 5 + Math.floor(Math.random() * (w - 10));
      const hy = 5 + Math.floor(Math.random() * (h - 10));
      if (!map.isSolidTile(hx, hy)) {
        map.setObstacle(hx, hy, 'obstacle_hedge');
      }
    }

    // Exit at top-left
    map.exitTile = { x: 4, y: 4 };
    map.isExitOpen = false;

    // Spawn 200 Normal Zombies
    const zombieSpawns = [];
    for (let i = 0; i < 200; i++) {
      const zx = 15 + Math.floor(Math.random() * (w - 30));
      const zy = 15 + Math.floor(Math.random() * (h - 30));
      if (!map.isSolidTile(zx, zy)) {
        zombieSpawns.push({
          type: 'NORMAL',
          x: (zx + 0.5) * CONFIG.TILE_SIZE,
          y: (zy + 0.5) * CONFIG.TILE_SIZE
        });
      }
    }

    // Health Potions (around 30 potions across the village)
    const items = [];
    for (let i = 0; i < 35; i++) {
      const px = 10 + Math.floor(Math.random() * (w - 20));
      const py = 10 + Math.floor(Math.random() * (h - 20));
      if (!map.isSolidTile(px, py)) {
        items.push({
          type: 'potion',
          x: (px + 0.5) * CONFIG.TILE_SIZE,
          y: (py + 0.5) * CONFIG.TILE_SIZE
        });
      }
    }

    return {
      tilemap: map,
      playerStart: { x: 100.5 * CONFIG.TILE_SIZE, y: 100.5 * CONFIG.TILE_SIZE },
      zombieSpawns,
      items,
      objective: {
        type: 'kill_count',
        targetKills: 50,
        currentKills: 0,
        text: '일반 좀비 50마리를 처치하여 탈출구를 개방하세요!'
      }
    };
  }

  // --- STAGE 3: ROAD TO CITY (140x80) ---
  static createHighwayToCity() {
    const w = 140, h = 80;
    const map = new TileMap(w, h, 'tile_road');

    // Guard rails & concrete barricades
    for (let x = 0; x < w; x++) {
      map.setObstacle(x, 0, 'obstacle_barricade');
      map.setObstacle(x, 1, 'obstacle_barricade');
      map.setObstacle(x, h - 2, 'obstacle_barricade');
      map.setObstacle(x, h - 1, 'obstacle_barricade');
    }
    for (let y = 0; y < h; y++) {
      map.setObstacle(0, y, 'obstacle_barricade');
      if (y < 35 || y > 45) {
        map.setObstacle(w - 1, y, 'obstacle_barricade');
      }
    }

    // Abandoned cars & jumpable barricades across the highway
    for (let i = 0; i < 28; i++) {
      const cx = 15 + Math.floor(Math.random() * (w - 30));
      const cy = 8 + Math.floor(Math.random() * (h - 20));
      if (!map.isSolidTile(cx, cy) && !map.isSolidTile(cx + 1, cy)) {
        map.addMultiProp('multi_car', cx, cy, 2, 1);
      }
    }

    // Jumpable roadblocks (1-tile)
    for (let i = 0; i < 40; i++) {
      const bx = 10 + Math.floor(Math.random() * (w - 25));
      const by = 5 + Math.floor(Math.random() * (h - 12));
      if (!map.isSolidTile(bx, by)) {
        map.setObstacle(bx, by, 'obstacle_barricade');
      }
    }

    // Abandoned police cars & civilian cars across the highway
    for (let i = 0; i < 28; i++) {
      const cx = 15 + Math.floor(Math.random() * (w - 30));
      const cy = 8 + Math.floor(Math.random() * (h - 20));
      if (!map.isSolidTile(cx, cy) && !map.isSolidTile(cx + 1, cy)) {
        map.addMultiProp(i % 2 === 0 ? 'multi_police_car' : 'multi_car', cx, cy, 2, 1);
      }
    }

    // Exit at end tunnel
    map.exitTile = { x: w - 2, y: 40 };
    map.isExitOpen = false;

    // Enemies: Normal zombies + Shooting zombies + 1 Mutant Zombie!
    const zombieSpawns = [];
    zombieSpawns.push({
      type: 'MUTANT',
      x: (w - 25) * CONFIG.TILE_SIZE,
      y: 40 * CONFIG.TILE_SIZE,
      isTarget: true
    });

    // 35 Normal zombies
    for (let i = 0; i < 35; i++) {
      const zx = 20 + Math.floor(Math.random() * (w - 40));
      const zy = 5 + Math.floor(Math.random() * (h - 12));
      if (!map.isSolidTile(zx, zy)) {
        zombieSpawns.push({
          type: 'NORMAL',
          x: (zx + 0.5) * CONFIG.TILE_SIZE,
          y: (zy + 0.5) * CONFIG.TILE_SIZE
        });
      }
    }

    // 12 Shooting zombies
    for (let i = 0; i < 12; i++) {
      const zx = 30 + Math.floor(Math.random() * (w - 45));
      const zy = 6 + Math.floor(Math.random() * (h - 15));
      if (!map.isSolidTile(zx, zy)) {
        zombieSpawns.push({
          type: 'SHOOTING',
          x: (zx + 0.5) * CONFIG.TILE_SIZE,
          y: (zy + 0.5) * CONFIG.TILE_SIZE
        });
      }
    }

    // Potions
    const items = [];
    for (let i = 0; i < 25; i++) {
      const px = 10 + Math.floor(Math.random() * (w - 20));
      const py = 5 + Math.floor(Math.random() * (h - 10));
      if (!map.isSolidTile(px, py)) {
        items.push({
          type: 'potion',
          x: (px + 0.5) * CONFIG.TILE_SIZE,
          y: (py + 0.5) * CONFIG.TILE_SIZE
        });
      }
    }

    return {
      tilemap: map,
      playerStart: { x: 5 * CONFIG.TILE_SIZE, y: 40 * CONFIG.TILE_SIZE },
      zombieSpawns,
      items,
      objective: {
        type: 'kill_mutant',
        text: '고속도로를 가로막는 거대 뮤턴트 좀비를 처치하고 톨게이트를 통과하세요!'
      }
    };
  }

  // --- STAGE 4: METROPOLIS / BIG CITY (250x250) ---
  static createMetropolis() {
    const w = 250, h = 250;
    const map = new TileMap(w, h, 'tile_sidewalk');

    // Boundaries
    for (let x = 0; x < w; x++) {
      map.setObstacle(x, 0, 'obstacle_crate');
      map.setObstacle(x, h - 1, 'obstacle_crate');
    }
    for (let y = 0; y < h; y++) {
      map.setObstacle(0, y, 'obstacle_crate');
      map.setObstacle(w - 1, y, 'obstacle_crate');
    }

    // Modern Asphalt City Grid Roads
    for (let x = 0; x < w; x++) {
      for (let r = 50; r < w; r += 60) {
        map.setFloor(x, r, 'tile_road');
        map.setFloor(x, r + 1, 'tile_road');
        map.setFloor(x, r + 2, 'tile_road');
        map.setFloor(r, x, 'tile_road');
        map.setFloor(r + 1, x, 'tile_road');
        map.setFloor(r + 2, x, 'tile_road');
      }
    }

    // High-Rise Skyscrapers & Bio-Corp Buildings (4x6 tiles)
    for (let i = 0; i < 40; i++) {
      const bx = 15 + Math.floor(Math.random() * (w - 40));
      const by = 15 + Math.floor(Math.random() * (h - 40));
      // Avoid placing buildings right on road centers or player spawn
      if (bx % 60 > 6 && by % 60 > 8 && (bx > 30 || by > 30)) {
        if (!map.isSolidTile(bx, by) && !map.isSolidTile(bx + 3, by + 5)) {
          map.addMultiProp('multi_skyscraper', bx, by, 4, 6);
        }
      }
    }

    // Abandoned Police Cars, Civilian Cars, Delivery Vans
    for (let i = 0; i < 60; i++) {
      const cx = 15 + Math.floor(Math.random() * (w - 30));
      const cy = 15 + Math.floor(Math.random() * (h - 30));
      if (!map.isSolidTile(cx, cy) && !map.isSolidTile(cx + 1, cy)) {
        map.addMultiProp(i % 3 === 0 ? 'multi_police_car' : 'multi_car', cx, cy, 2, 1);
      }
    }

    // Jumpable crates & barricades
    for (let i = 0; i < 180; i++) {
      const cx = 10 + Math.floor(Math.random() * (w - 20));
      const cy = 10 + Math.floor(Math.random() * (h - 20));
      if (!map.isSolidTile(cx, cy)) {
        map.setObstacle(cx, cy, Math.random() > 0.5 ? 'obstacle_crate' : 'obstacle_barricade');
      }
    }

    // Exit at underground entrance (240, 240)
    map.exitTile = { x: 240, y: 240 };
    map.isExitOpen = false;

    // Enemies: Normal, Exploding, Shooting + 3 Mutant Zombies
    const zombieSpawns = [];
    const mutantPositions = [
      { x: 70, y: 70 },
      { x: 180, y: 80 },
      { x: 120, y: 190 }
    ];
    mutantPositions.forEach(pos => {
      zombieSpawns.push({
        type: 'MUTANT',
        x: pos.x * CONFIG.TILE_SIZE,
        y: pos.y * CONFIG.TILE_SIZE
      });
    });

    // 70 Normal zombies
    for (let i = 0; i < 70; i++) {
      const zx = 15 + Math.floor(Math.random() * (w - 30));
      const zy = 15 + Math.floor(Math.random() * (h - 30));
      if (!map.isSolidTile(zx, zy)) {
        zombieSpawns.push({
          type: 'NORMAL',
          x: (zx + 0.5) * CONFIG.TILE_SIZE,
          y: (zy + 0.5) * CONFIG.TILE_SIZE
        });
      }
    }

    // 20 Exploding zombies
    for (let i = 0; i < 20; i++) {
      const zx = 20 + Math.floor(Math.random() * (w - 40));
      const zy = 20 + Math.floor(Math.random() * (h - 40));
      if (!map.isSolidTile(zx, zy)) {
        zombieSpawns.push({
          type: 'EXPLODING',
          x: (zx + 0.5) * CONFIG.TILE_SIZE,
          y: (zy + 0.5) * CONFIG.TILE_SIZE
        });
      }
    }

    // 25 Shooting zombies
    for (let i = 0; i < 25; i++) {
      const zx = 20 + Math.floor(Math.random() * (w - 40));
      const zy = 20 + Math.floor(Math.random() * (h - 40));
      if (!map.isSolidTile(zx, zy)) {
        zombieSpawns.push({
          type: 'SHOOTING',
          x: (zx + 0.5) * CONFIG.TILE_SIZE,
          y: (zy + 0.5) * CONFIG.TILE_SIZE
        });
      }
    }

    // Quest Items: 3 Emergency Generators on open, prominent crossroads
    const genSpots = [
      { x: 50, y: 50, name: '비상 발전기 #1 (북서 광장)' },
      { x: 170, y: 50, name: '비상 발전기 #2 (북동 광장)' },
      { x: 110, y: 170, name: '비상 발전기 #3 (남부 중앙 광장)' },
    ];

    const items = [];
    genSpots.forEach((spot) => {
      // Clear 5-tile radius around generator so it is 100% visible and accessible
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const tidx = map.getIndex(spot.x + dx, spot.y + dy);
          if (tidx !== -1) map.obstacleTiles[tidx] = null;
        }
      }
      items.push({
        type: 'generator',
        name: spot.name,
        x: (spot.x + 0.5) * CONFIG.TILE_SIZE,
        y: (spot.y + 0.5) * CONFIG.TILE_SIZE
      });
    });

    // Potions (plentiful 55 potions across the metropolis)
    for (let i = 0; i < 55; i++) {
      const px = 10 + Math.floor(Math.random() * (w - 20));
      const py = 10 + Math.floor(Math.random() * (h - 20));
      if (!map.isSolidTile(px, py)) {
        items.push({
          type: 'potion',
          x: (px + 0.5) * CONFIG.TILE_SIZE,
          y: (py + 0.5) * CONFIG.TILE_SIZE
        });
      }
    }

    // Clear player start area (15, 15)
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const tidx = map.getIndex(15 + dx, 15 + dy);
        if (tidx !== -1) map.obstacleTiles[tidx] = null;
      }
    }

    return {
      tilemap: map,
      playerStart: { x: 15 * CONFIG.TILE_SIZE, y: 15 * CONFIG.TILE_SIZE },
      zombieSpawns,
      items,
      objective: {
        type: 'collect_items',
        itemType: 'generator',
        requiredCount: 3,
        currentCount: 0,
        text: '도시 곳곳의 비상 전력 발전기 3개를 작동시켜 지하 진입로를 여세요!'
      }
    };
  }

  // --- STAGE 5: SECRET RESEARCH OUTPOST (220x220) ---
  static createSecretResearchOutpost() {
    const w = 220, h = 220;
    const map = new TileMap(w, h, 'tile_concrete');

    // Concrete walls and security fences
    for (let x = 0; x < w; x++) {
      map.setObstacle(x, 0, 'obstacle_fence');
      map.setObstacle(x, h - 1, 'obstacle_fence');
    }
    for (let y = 0; y < h; y++) {
      map.setObstacle(0, y, 'obstacle_fence');
      map.setObstacle(w - 1, y, 'obstacle_fence');
    }

    // Compound partitions & server racks & buildings
    for (let i = 0; i < 40; i++) {
      const bx = 15 + Math.floor(Math.random() * (w - 35));
      const by = 15 + Math.floor(Math.random() * (h - 35));
      if (!map.isSolidTile(bx, by)) {
        map.addMultiProp('multi_server', bx, by, 2, 2);
      }
    }

    // Security barricades & consoles
    for (let i = 0; i < 180; i++) {
      const cx = 10 + Math.floor(Math.random() * (w - 20));
      const cy = 10 + Math.floor(Math.random() * (h - 20));
      if (!map.isSolidTile(cx, cy)) {
        map.setObstacle(cx, cy, Math.random() > 0.5 ? 'obstacle_lab_console' : 'obstacle_barricade');
      }
    }

    // Exit at research main building entrance
    map.exitTile = { x: 210, y: 110 };
    map.isExitOpen = false;

    // Enemies: 2 Mutants + Normal, Exploding, Shooting
    const zombieSpawns = [];
    zombieSpawns.push(
      { type: 'MUTANT', x: 80 * CONFIG.TILE_SIZE, y: 110 * CONFIG.TILE_SIZE },
      { type: 'MUTANT', x: 170 * CONFIG.TILE_SIZE, y: 150 * CONFIG.TILE_SIZE }
    );

    // 60 Normal
    for (let i = 0; i < 60; i++) {
      const zx = 15 + Math.floor(Math.random() * (w - 30));
      const zy = 15 + Math.floor(Math.random() * (h - 30));
      if (!map.isSolidTile(zx, zy)) {
        zombieSpawns.push({
          type: 'NORMAL',
          x: (zx + 0.5) * CONFIG.TILE_SIZE,
          y: (zy + 0.5) * CONFIG.TILE_SIZE
        });
      }
    }

    // 16 Exploding
    for (let i = 0; i < 16; i++) {
      const zx = 20 + Math.floor(Math.random() * (w - 40));
      const zy = 20 + Math.floor(Math.random() * (h - 40));
      if (!map.isSolidTile(zx, zy)) {
        zombieSpawns.push({
          type: 'EXPLODING',
          x: (zx + 0.5) * CONFIG.TILE_SIZE,
          y: (zy + 0.5) * CONFIG.TILE_SIZE
        });
      }
    }

    // 20 Shooting
    for (let i = 0; i < 20; i++) {
      const zx = 20 + Math.floor(Math.random() * (w - 40));
      const zy = 20 + Math.floor(Math.random() * (h - 40));
      if (!map.isSolidTile(zx, zy)) {
        zombieSpawns.push({
          type: 'SHOOTING',
          x: (zx + 0.5) * CONFIG.TILE_SIZE,
          y: (zy + 0.5) * CONFIG.TILE_SIZE
        });
      }
    }

    // Quest Items: 3 Security Keycards on open prominent checkpoints
    const keycardSpots = [
      { x: 40, y: 40, name: '보안 칩 Alpha (서부 관측소)' },
      { x: 180, y: 50, name: '보안 칩 Beta (동부 초소)' },
      { x: 110, y: 190, name: '보안 칩 Gamma (남부 통제소)' },
    ];

    const items = [];
    keycardSpots.forEach((spot) => {
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const tidx = map.getIndex(spot.x + dx, spot.y + dy);
          if (tidx !== -1) map.obstacleTiles[tidx] = null;
        }
      }
      items.push({
        type: 'keycard',
        name: spot.name,
        x: (spot.x + 0.5) * CONFIG.TILE_SIZE,
        y: (spot.y + 0.5) * CONFIG.TILE_SIZE
      });
    });

    // Potions
    for (let i = 0; i < 45; i++) {
      const px = 10 + Math.floor(Math.random() * (w - 20));
      const py = 10 + Math.floor(Math.random() * (h - 20));
      if (!map.isSolidTile(px, py)) {
        items.push({
          type: 'potion',
          x: (px + 0.5) * CONFIG.TILE_SIZE,
          y: (py + 0.5) * CONFIG.TILE_SIZE
        });
      }
    }

    return {
      tilemap: map,
      playerStart: { x: 15 * CONFIG.TILE_SIZE, y: 110 * CONFIG.TILE_SIZE },
      zombieSpawns,
      items,
      objective: {
        type: 'collect_items',
        itemType: 'keycard',
        requiredCount: 3,
        currentCount: 0,
        text: '보안 데이터 칩 3개를 회수하여 연구실 본동 격리문을 해제하세요!'
      }
    };
  }

  // --- STAGE 6: INSIDE ZOMBIE LAB (160x160) ---
  static createZombieLab() {
    const w = 160, h = 160;
    const map = new TileMap(w, h, 'tile_lab');

    // Lab walls
    for (let x = 0; x < w; x++) {
      map.setObstacle(x, 0, 'obstacle_lab_console');
      map.setObstacle(x, h - 1, 'obstacle_lab_console');
    }
    for (let y = 0; y < h; y++) {
      map.setObstacle(0, y, 'obstacle_lab_console');
      map.setObstacle(w - 1, y, 'obstacle_lab_console');
    }

    // Bio Tubes (1x2) & Server Racks
    for (let i = 0; i < 35; i++) {
      const bx = 10 + Math.floor(Math.random() * (w - 25));
      const by = 10 + Math.floor(Math.random() * (h - 25));
      if (!map.isSolidTile(bx, by) && !map.isSolidTile(bx, by + 1)) {
        map.addMultiProp('multi_biotube', bx, by, 1, 2);
      }
    }

    for (let i = 0; i < 20; i++) {
      const sx = 12 + Math.floor(Math.random() * (w - 25));
      const sy = 12 + Math.floor(Math.random() * (h - 25));
      if (!map.isSolidTile(sx, sy) && !map.isSolidTile(sx + 1, sy + 1)) {
        map.addMultiProp('multi_server', sx, sy, 2, 2);
      }
    }

    // Jumpable lab consoles
    for (let i = 0; i < 150; i++) {
      const cx = 10 + Math.floor(Math.random() * (w - 20));
      const cy = 10 + Math.floor(Math.random() * (h - 20));
      if (!map.isSolidTile(cx, cy)) {
        map.setObstacle(cx, cy, 'obstacle_lab_console');
      }
    }

    // Exit at Decontamination Airlock
    map.exitTile = { x: 150, y: 80 };
    map.isExitOpen = false;

    // Enemies: 2 Mutants + Normal, Exploding, Shooting
    const zombieSpawns = [];
    zombieSpawns.push(
      { type: 'MUTANT', x: 60 * CONFIG.TILE_SIZE, y: 60 * CONFIG.TILE_SIZE },
      { type: 'MUTANT', x: 110 * CONFIG.TILE_SIZE, y: 120 * CONFIG.TILE_SIZE }
    );

    // 50 Normal
    for (let i = 0; i < 50; i++) {
      const zx = 15 + Math.floor(Math.random() * (w - 30));
      const zy = 15 + Math.floor(Math.random() * (h - 30));
      if (!map.isSolidTile(zx, zy)) {
        zombieSpawns.push({
          type: 'NORMAL',
          x: (zx + 0.5) * CONFIG.TILE_SIZE,
          y: (zy + 0.5) * CONFIG.TILE_SIZE
        });
      }
    }

    // 14 Exploding
    for (let i = 0; i < 14; i++) {
      const zx = 15 + Math.floor(Math.random() * (w - 30));
      const zy = 15 + Math.floor(Math.random() * (h - 30));
      if (!map.isSolidTile(zx, zy)) {
        zombieSpawns.push({
          type: 'EXPLODING',
          x: (zx + 0.5) * CONFIG.TILE_SIZE,
          y: (zy + 0.5) * CONFIG.TILE_SIZE
        });
      }
    }

    // 20 Shooting
    for (let i = 0; i < 20; i++) {
      const zx = 15 + Math.floor(Math.random() * (w - 30));
      const zy = 15 + Math.floor(Math.random() * (h - 30));
      if (!map.isSolidTile(zx, zy)) {
        zombieSpawns.push({
          type: 'SHOOTING',
          x: (zx + 0.5) * CONFIG.TILE_SIZE,
          y: (zy + 0.5) * CONFIG.TILE_SIZE
        });
      }
    }

    // Quest Items: 3 Decontamination Valves on open chambers
    const valveSpots = [
      { x: 30, y: 130, name: '격리 밸브 #1 (A 구역)' },
      { x: 130, y: 30, name: '격리 밸브 #2 (B 구역)' },
      { x: 90, y: 80, name: '격리 밸브 #3 (중앙 챔버)' },
    ];

    const labItems = [];
    valveSpots.forEach((spot) => {
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const tidx = map.getIndex(spot.x + dx, spot.y + dy);
          if (tidx !== -1) map.obstacleTiles[tidx] = null;
        }
      }
      labItems.push({
        type: 'valve',
        name: spot.name,
        x: (spot.x + 0.5) * CONFIG.TILE_SIZE,
        y: (spot.y + 0.5) * CONFIG.TILE_SIZE
      });
    });

    // Potions
    for (let i = 0; i < 40; i++) {
      const px = 10 + Math.floor(Math.random() * (w - 20));
      const py = 10 + Math.floor(Math.random() * (h - 20));
      if (!map.isSolidTile(px, py)) {
        labItems.push({
          type: 'potion',
          x: (px + 0.5) * CONFIG.TILE_SIZE,
          y: (py + 0.5) * CONFIG.TILE_SIZE
        });
      }
    }

    return {
      tilemap: map,
      playerStart: { x: 15 * CONFIG.TILE_SIZE, y: 80 * CONFIG.TILE_SIZE },
      zombieSpawns,
      items: labItems,
      objective: {
        type: 'collect_items',
        itemType: 'valve',
        requiredCount: 3,
        currentCount: 0,
        text: '오염 격리 밸브 3개를 모두 해제하여 최종 보스 챔버 에어로크를 여세요!'
      }
    };
  }

  // --- STAGE 7: FINAL BOSS CHAMBER (100x100) ---
  static createBossChamber() {
    const w = 100, h = 100;
    const map = new TileMap(w, h, 'tile_lab');

    // Reinforced perimeter walls
    for (let x = 0; x < w; x++) {
      map.setObstacle(x, 0, 'obstacle_lab_console');
      map.setObstacle(x, 1, 'obstacle_lab_console');
      map.setObstacle(x, h - 2, 'obstacle_lab_console');
      map.setObstacle(x, h - 1, 'obstacle_lab_console');
    }
    for (let y = 0; y < h; y++) {
      map.setObstacle(0, y, 'obstacle_lab_console');
      map.setObstacle(1, y, 'obstacle_lab_console');
      map.setObstacle(w - 2, y, 'obstacle_lab_console');
      map.setObstacle(w - 1, y, 'obstacle_lab_console');
    }

    // Barricades positioned SAFELY away from player spawn (50, 85) and boss (50, 38)
    const barricadeSpots = [
      { x: 22, y: 22 }, { x: 78, y: 22 },
      { x: 22, y: 78 }, { x: 78, y: 78 },
      { x: 50, y: 15 },
      { x: 18, y: 50 }, { x: 82, y: 50 }
    ];
    barricadeSpots.forEach(pos => {
      map.setObstacle(pos.x, pos.y, 'obstacle_barricade');
    });

    // Clear player start zone (50, 85) in an 8x8 radius
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const tidx = map.getIndex(50 + dx, 85 + dy);
        if (tidx !== -1) map.obstacleTiles[tidx] = null;
      }
    }

    // Clear boss central arena (50, 38) in an 14x14 radius
    for (let dy = -7; dy <= 7; dy++) {
      for (let dx = -7; dx <= 7; dx++) {
        const tidx = map.getIndex(50 + dx, 38 + dy);
        if (tidx !== -1) map.obstacleTiles[tidx] = null;
      }
    }

    // Boss Zombie is created at center (50, 38)
    // Plentiful health potions around arena
    const items = [];
    const potionPositions = [
      { x: 12, y: 12 }, { x: 88, y: 12 },
      { x: 12, y: 88 }, { x: 88, y: 88 },
      { x: 50, y: 12 }, { x: 50, y: 92 },
      { x: 12, y: 50 }, { x: 88, y: 50 },
      { x: 30, y: 30 }, { x: 70, y: 30 },
      { x: 30, y: 70 }, { x: 70, y: 70 }
    ];
    potionPositions.forEach(p => {
      items.push({
        type: 'potion',
        x: p.x * CONFIG.TILE_SIZE,
        y: p.y * CONFIG.TILE_SIZE
      });
    });

    return {
      tilemap: map,
      playerStart: { x: 50 * CONFIG.TILE_SIZE, y: 85 * CONFIG.TILE_SIZE },
      zombieSpawns: [], // Boss spawns minions in Phase 1 & 2
      items,
      isBossStage: true,
      bossStart: { x: 50 * CONFIG.TILE_SIZE, y: 38 * CONFIG.TILE_SIZE },
      objective: {
        type: 'defeat_boss',
        text: '10x10 보스 좀비의 3개 페이즈를 모두 파괴하고 백신을 획득하세요!'
      }
    };
  }
}
