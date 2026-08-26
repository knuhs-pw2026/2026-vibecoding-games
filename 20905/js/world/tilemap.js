// tilemap.js - World Grid, Obstacles & Jump Detection
import { CONFIG } from '../config.js';

export class TileMap {
  constructor(width, height, defaultFloor = 'tile_concrete') {
    this.width = width;
    this.height = height;
    this.tileSize = CONFIG.TILE_SIZE;
    this.floorTiles = new Array(width * height).fill(defaultFloor);
    this.obstacleTiles = new Array(width * height).fill(null);
    this.exitTile = null;
    this.isExitOpen = false;
    this.multiProps = []; // e.g. multi-tile houses, trees, cars
  }

  getIndex(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return -1;
    return y * this.width + x;
  }

  getTileCoord(worldX, worldY) {
    return {
      tx: Math.floor(worldX / this.tileSize),
      ty: Math.floor(worldY / this.tileSize)
    };
  }

  setFloor(x, y, floorType) {
    const idx = this.getIndex(x, y);
    if (idx !== -1) this.floorTiles[idx] = floorType;
  }

  setObstacle(x, y, obstacleType) {
    const idx = this.getIndex(x, y);
    if (idx !== -1) this.obstacleTiles[idx] = obstacleType;
  }

  addMultiProp(propType, tx, ty, widthTiles, heightTiles) {
    this.multiProps.push({
      type: propType,
      tx, ty,
      widthTiles,
      heightTiles,
      worldX: tx * this.tileSize,
      worldY: ty * this.tileSize,
      widthPx: widthTiles * this.tileSize,
      heightPx: heightTiles * this.tileSize,
    });

    // Mark the tiles covered as solid obstacles
    for (let dy = 0; dy < heightTiles; dy++) {
      for (let dx = 0; dx < widthTiles; dx++) {
        const idx = this.getIndex(tx + dx, ty + dy);
        if (idx !== -1) {
          this.obstacleTiles[idx] = 'solid_multi_prop';
        }
      }
    }
  }

  isSolidTile(tx, ty) {
    // Check map boundaries
    if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) {
      return true;
    }
    const idx = this.getIndex(tx, ty);
    return this.obstacleTiles[idx] !== null;
  }

  // Check if a circular or box entity collides with solid tiles
  isPositionBlocked(x, y, radius = 12) {
    const minTx = Math.floor((x - radius) / this.tileSize);
    const maxTx = Math.floor((x + radius) / this.tileSize);
    const minTy = Math.floor((y - radius) / this.tileSize);
    const maxTy = Math.floor((y + radius) / this.tileSize);

    for (let ty = minTy; ty <= maxTy; ty++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        if (this.isSolidTile(tx, ty)) {
          return true;
        }
      }
    }
    return false;
  }

  // 1-Tile Obstacle Jump Check
  // Conditions:
  // 1) Player is facing an obstacle tile directly in front (1 tile away)
  // 2) The obstacle in front is exactly 1 tile deep
  // 3) The landing tile 2 tiles away is open & walkable (not solid)
  canJumpOver(playerX, playerY, dir) {
    const { tx, ty } = this.getTileCoord(playerX, playerY);
    let dx = 0, dy = 0;

    if (dir === 'left') dx = -1;
    else if (dir === 'right') dx = 1;
    else if (dir === 'up') dy = -1;
    else if (dir === 'down') dy = 1;

    const obstacleTx = tx + dx;
    const obstacleTy = ty + dy;
    const landingTx = tx + dx * 2;
    const landingTy = ty + dy * 2;

    // Check if the tile directly ahead is an obstacle
    const isAheadSolid = this.isSolidTile(obstacleTx, obstacleTy);
    // Check if landing tile is inside map and NOT solid
    const isLandingWalkable = !this.isSolidTile(landingTx, landingTy) &&
      landingTx >= 0 && landingTx < this.width &&
      landingTy >= 0 && landingTy < this.height;

    if (isAheadSolid && isLandingWalkable) {
      return {
        canJump: true,
        landingX: (landingTx + 0.5) * this.tileSize,
        landingY: (landingTy + 0.5) * this.tileSize,
        obstacleTx,
        obstacleTy
      };
    }

    return { canJump: false };
  }

  render(ctx, sprites, camera) {
    const startTx = Math.max(0, Math.floor(camera.x / this.tileSize));
    const endTx = Math.min(this.width - 1, Math.ceil((camera.x + camera.width) / this.tileSize));
    const startTy = Math.max(0, Math.floor(camera.y / this.tileSize));
    const endTy = Math.min(this.height - 1, Math.ceil((camera.y + camera.height) / this.tileSize));

    // 1. Draw Floor Tiles
    for (let ty = startTy; ty <= endTy; ty++) {
      for (let tx = startTx; tx <= endTx; tx++) {
        const idx = this.getIndex(tx, ty);
        const floorKey = this.floorTiles[idx] || 'tile_concrete';
        const sprite = sprites.get(floorKey);
        const screenX = tx * this.tileSize - camera.x;
        const screenY = ty * this.tileSize - camera.y;

        if (sprite) {
          ctx.drawImage(sprite, screenX, screenY, this.tileSize, this.tileSize);
        } else {
          ctx.fillStyle = '#334155';
          ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
        }
      }
    }

    // 2. Draw Exit Portal Tile
    if (this.exitTile) {
      const screenX = this.exitTile.x * this.tileSize - camera.x;
      const screenY = this.exitTile.y * this.tileSize - camera.y;

      if (this.isExitOpen) {
        // Glowing Green Open Portal
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
        ctx.strokeStyle = '#86efac';
        ctx.lineWidth = 3;
        ctx.strokeRect(screenX + 2, screenY + 2, this.tileSize - 4, this.tileSize - 4);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('EXIT', screenX + this.tileSize / 2, screenY + this.tileSize / 2 + 3);
      } else {
        // Red Locked Portal
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX + 2, screenY + 2, this.tileSize - 4, this.tileSize - 4);
        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LOCK', screenX + this.tileSize / 2, screenY + this.tileSize / 2 + 3);
      }
    }

    // 3. Draw 1-Tile Obstacles
    for (let ty = startTy; ty <= endTy; ty++) {
      for (let tx = startTx; tx <= endTx; tx++) {
        const idx = this.getIndex(tx, ty);
        const obsKey = this.obstacleTiles[idx];
        if (obsKey && obsKey !== 'solid_multi_prop') {
          const sprite = sprites.get(obsKey);
          const screenX = tx * this.tileSize - camera.x;
          const screenY = ty * this.tileSize - camera.y;

          if (sprite) {
            ctx.drawImage(sprite, screenX, screenY, this.tileSize, this.tileSize);
          } else {
            ctx.fillStyle = '#64748b';
            ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
          }
        }
      }
    }

    // 4. Draw Multi-Tile Props (Houses, Cars, Trees)
    this.multiProps.forEach(prop => {
      const sprite = sprites.get(prop.type);
      const screenX = prop.worldX - camera.x;
      const screenY = prop.worldY - camera.y;

      if (sprite) {
        ctx.drawImage(sprite, screenX, screenY, prop.widthPx, prop.heightPx);
      }
    });
  }
}
