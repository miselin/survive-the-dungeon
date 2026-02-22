import type { DungeonRun } from "./game";
import { allSpritesReady, drawSheetSprite, SPRITE_IDS } from "./sprites";
import { EN } from "./strings/en";
import { ROOM_BOSS, ROOM_SHOP, ROOM_START, TileType } from "./types";
import type { Position } from "./types";

type Viewport = {
  left: number;
  top: number;
  cols: number;
  rows: number;
};

type RenderDungeonMapOptions = {
  run: DungeonRun;
  canvas: HTMLCanvasElement;
  revealAll: boolean;
};

function getViewport(
  playerPos: Position,
  mapWidth: number,
  mapHeight: number,
  tileSize: number,
  canvas: HTMLCanvasElement,
): Viewport {
  const cols = Math.max(10, Math.floor(canvas.width / tileSize));
  const rows = Math.max(10, Math.floor(canvas.height / tileSize));

  let left = playerPos.x - Math.floor(cols / 2);
  let top = playerPos.y - Math.floor(rows / 2);

  left = Math.max(0, Math.min(left, mapWidth - cols));
  top = Math.max(0, Math.min(top, mapHeight - rows));

  return { left, top, cols, rows };
}

export function renderDungeonMap(options: RenderDungeonMapOptions): void {
  const { run: activeRun, canvas, revealAll } = options;
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  context.imageSmoothingEnabled = false;
  context.fillStyle = "#091016";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const spritesReady = allSpritesReady();
  const tile = Math.max(16, Math.floor(Math.min(canvas.width / 28, canvas.height / 18)));
  const view = getViewport(
    activeRun.player.position,
    activeRun.world.width,
    activeRun.world.height,
    tile,
    canvas,
  );

  const screenPos = (worldX: number, worldY: number): Position => ({
    x: (worldX - view.left) * tile,
    y: (worldY - view.top) * tile,
  });

  const inViewport = (worldX: number, worldY: number): boolean => {
    const col = worldX - view.left;
    const row = worldY - view.top;
    return col >= 0 && col < view.cols && row >= 0 && row < view.rows;
  };

  const drawFog = (worldX: number, worldY: number): void => {
    if (revealAll) {
      return;
    }
    if (!activeRun.world.inBounds(worldX, worldY)) {
      return;
    }
    const idx = activeRun.world.idx(worldX, worldY);
    const explored = revealAll || activeRun.world.explored[idx] === 1;
    const visible = revealAll || activeRun.world.visible[idx] === 1;
    if (!explored || visible || !inViewport(worldX, worldY)) {
      return;
    }
    const pos = screenPos(worldX, worldY);
    context.fillStyle = "rgba(6, 11, 14, 0.56)";
    context.fillRect(pos.x, pos.y, tile, tile);
  };

  const drawWorldSprite = (
    sheet: "dungeon" | "chars" | "items",
    spriteId: number,
    worldX: number,
    worldY: number,
  ): void => {
    if (!activeRun.world.inBounds(worldX, worldY) || !inViewport(worldX, worldY)) {
      return;
    }

    const idx = activeRun.world.idx(worldX, worldY);
    const explored = revealAll || activeRun.world.explored[idx] === 1;
    const visible = revealAll || activeRun.world.visible[idx] === 1;
    if (!explored && !visible) {
      return;
    }

    const pos = screenPos(worldX, worldY);
    const drawn = drawSheetSprite(context, sheet, spriteId, pos.x, pos.y, tile);
    if (!drawn) {
      return;
    }

    if (explored && !visible) {
      drawFog(worldX, worldY);
    }
  };

  const drawTileAccent = (x: number, y: number, roomAttrs: number, visible: boolean): void => {
    const pos = screenPos(x, y);

    if ((roomAttrs & ROOM_SHOP) === ROOM_SHOP) {
      context.fillStyle = visible ? "rgba(230, 178, 86, 0.18)" : "rgba(156, 115, 54, 0.11)";
      context.fillRect(pos.x, pos.y, tile, tile);
      return;
    }

    if ((roomAttrs & ROOM_BOSS) === ROOM_BOSS) {
      context.fillStyle = visible ? "rgba(183, 80, 88, 0.16)" : "rgba(122, 53, 60, 0.11)";
      context.fillRect(pos.x, pos.y, tile, tile);
      return;
    }

    if ((roomAttrs & ROOM_START) === ROOM_START) {
      context.fillStyle = visible ? "rgba(104, 178, 205, 0.14)" : "rgba(72, 124, 146, 0.1)";
      context.fillRect(pos.x, pos.y, tile, tile);
      return;
    }

    const room = activeRun.world.roomAt({ x, y });
    if (!room) {
      return;
    }
    const threat = activeRun.getRoomThreat(room);
    const threatDelta = threat - activeRun.player.level;
    if (threatDelta >= 3) {
      context.fillStyle = visible ? "rgba(181, 99, 56, 0.12)" : "rgba(117, 66, 38, 0.08)";
      context.fillRect(pos.x, pos.y, tile, tile);
    }
  };

  const drawRoomLandmark = (room: { x: number; y: number; w: number; h: number; attrs: number }): void => {
    const cx = room.x + Math.floor(room.w / 2);
    const cy = room.y + Math.floor(room.h / 2);
    if (!activeRun.world.inBounds(cx, cy) || !inViewport(cx, cy)) {
      return;
    }

    const idx = activeRun.world.idx(cx, cy);
    const explored = revealAll || activeRun.world.explored[idx] === 1;
    const visible = revealAll || activeRun.world.visible[idx] === 1;
    if (!explored) {
      return;
    }

    const px = (cx - view.left) * tile;
    const py = (cy - view.top) * tile;

    if ((room.attrs & ROOM_SHOP) === ROOM_SHOP) {
      context.fillStyle = visible ? "rgba(241, 203, 119, 0.22)" : "rgba(160, 129, 77, 0.13)";
      context.beginPath();
      context.arc(px + (tile / 2), py + (tile / 2), tile * 0.48, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = visible ? "rgba(246, 225, 166, 0.7)" : "rgba(188, 160, 108, 0.35)";
      context.lineWidth = Math.max(1, Math.floor(tile / 10));
      context.beginPath();
      context.arc(px + (tile / 2), py + (tile / 2), tile * 0.28, 0, Math.PI * 2);
      context.stroke();

      if (spritesReady) {
        drawSheetSprite(context, "props", SPRITE_IDS.props.shopClutter[7], px, py, tile);
        const props = [
          { dx: -1, dy: 0, sprite: SPRITE_IDS.props.shopClutter[0] },
          { dx: 1, dy: 0, sprite: SPRITE_IDS.props.shopClutter[1] },
          { dx: 0, dy: -1, sprite: SPRITE_IDS.props.shopClutter[2] },
          { dx: 0, dy: 1, sprite: SPRITE_IDS.props.shopClutter[3] },
        ];
        for (const prop of props) {
          const tx = cx + prop.dx;
          const ty = cy + prop.dy;
          if (!activeRun.world.inBounds(tx, ty) || !inViewport(tx, ty)) {
            continue;
          }
          const tIdx = activeRun.world.idx(tx, ty);
          if (!revealAll && activeRun.world.visible[tIdx] !== 1) {
            continue;
          }
          drawSheetSprite(
            context,
            "props",
            prop.sprite,
            (tx - view.left) * tile,
            (ty - view.top) * tile,
            tile,
          );
        }
      } else {
        context.fillStyle = visible ? "#d0a65a" : "#8f7342";
        context.fillRect(px + (tile * 0.27), py + (tile * 0.27), tile * 0.46, tile * 0.46);
      }
      return;
    }

    if ((room.attrs & ROOM_BOSS) === ROOM_BOSS) {
      context.strokeStyle = visible ? "rgba(201, 112, 122, 0.65)" : "rgba(130, 78, 84, 0.34)";
      context.lineWidth = Math.max(1, Math.floor(tile / 12));
      context.beginPath();
      context.moveTo(px + (tile * 0.2), py + (tile * 0.2));
      context.lineTo(px + (tile * 0.8), py + (tile * 0.8));
      context.moveTo(px + (tile * 0.8), py + (tile * 0.2));
      context.lineTo(px + (tile * 0.2), py + (tile * 0.8));
      context.stroke();
      return;
    }

    if ((room.attrs & ROOM_START) === ROOM_START) {
      context.strokeStyle = visible ? "rgba(136, 204, 229, 0.62)" : "rgba(91, 138, 156, 0.35)";
      context.lineWidth = Math.max(1, Math.floor(tile / 12));
      context.beginPath();
      context.arc(px + (tile / 2), py + (tile / 2), tile * 0.22, 0, Math.PI * 2);
      context.stroke();
    }
  };

  for (let row = 0; row < view.rows; row += 1) {
    for (let col = 0; col < view.cols; col += 1) {
      const x = view.left + col;
      const y = view.top + row;

      if (!activeRun.world.inBounds(x, y)) {
        continue;
      }

      const idx = activeRun.world.idx(x, y);
      const explored = revealAll || activeRun.world.explored[idx] === 1;
      const visible = revealAll || activeRun.world.visible[idx] === 1;
      const tileType = activeRun.world.tileAt(x, y);

      if (!explored) {
        continue;
      }

      const px = col * tile;
      const py = row * tile;

      if (spritesReady) {
        if (tileType === TileType.Room) {
          drawWorldSprite("dungeon", SPRITE_IDS.dungeon.floor, x, y);
        } else if (tileType === TileType.Hall) {
          drawWorldSprite("dungeon", SPRITE_IDS.dungeon.hallFloor, x, y);
        }
      } else {
        if (tileType === TileType.Room) {
          context.fillStyle = visible ? "#2f5d4f" : "#1d3a32";
          context.fillRect(px, py, tile, tile);
        } else if (tileType === TileType.Hall) {
          context.fillStyle = visible ? "#2d4e63" : "#1a2f3d";
          context.fillRect(px, py, tile, tile);
        }
      }

      if (!activeRun.world.isPassable(x, y)) {
        continue;
      }

      const room = tileType === TileType.Room ? activeRun.world.roomAt({ x, y }) : null;
      if (room) {
        drawTileAccent(x, y, room.attrs, visible);
      }

      if (spritesReady) {
        if (!activeRun.world.isPassable(x, y - 1)) {
          drawWorldSprite("dungeon", SPRITE_IDS.dungeon.wallN, x, y - 1);
        }
        if (!activeRun.world.isPassable(x, y + 1)) {
          drawWorldSprite("dungeon", SPRITE_IDS.dungeon.wallS, x, y + 1);
        }
        if (!activeRun.world.isPassable(x - 1, y)) {
          drawWorldSprite("dungeon", SPRITE_IDS.dungeon.wallW, x - 1, y);
        }
        if (!activeRun.world.isPassable(x + 1, y)) {
          drawWorldSprite("dungeon", SPRITE_IDS.dungeon.wallE, x + 1, y);
        }
      }

      context.strokeStyle = spritesReady
        ? (visible ? "rgba(171, 212, 220, 0.28)" : "rgba(106, 136, 143, 0.22)")
        : (visible ? "#87b2a3" : "#385449");
      context.lineWidth = Math.max(1, Math.floor(tile / 12));

      if (!activeRun.world.isPassable(x, y - 1)) {
        context.beginPath();
        context.moveTo(px, py);
        context.lineTo(px + tile, py);
        context.stroke();
      }
      if (!activeRun.world.isPassable(x, y + 1)) {
        context.beginPath();
        context.moveTo(px, py + tile);
        context.lineTo(px + tile, py + tile);
        context.stroke();
      }
      if (!activeRun.world.isPassable(x - 1, y)) {
        context.beginPath();
        context.moveTo(px, py);
        context.lineTo(px, py + tile);
        context.stroke();
      }
      if (!activeRun.world.isPassable(x + 1, y)) {
        context.beginPath();
        context.moveTo(px + tile, py);
        context.lineTo(px + tile, py + tile);
        context.stroke();
      }
    }
  }

  for (const room of activeRun.world.rooms) {
    drawRoomLandmark(room);
  }

  for (const clutter of activeRun.shopClutter) {
    const idx = activeRun.world.idx(clutter.x, clutter.y);
    if (!revealAll && activeRun.world.visible[idx] !== 1) {
      continue;
    }

    const col = clutter.x - view.left;
    const row = clutter.y - view.top;
    if (col < 0 || col >= view.cols || row < 0 || row >= view.rows) {
      continue;
    }

    const px = col * tile;
    const py = row * tile;
    if (spritesReady) {
      drawSheetSprite(context, "props", clutter.sprite, px, py, tile);
    } else {
      context.fillStyle = "#7f6950";
      context.fillRect(px + (tile * 0.2), py + (tile * 0.2), tile * 0.6, tile * 0.6);
    }
  }

  for (const chest of activeRun.chests) {
    const chestPos = { x: chest.chest.x, y: chest.chest.y };
    const idx = activeRun.world.idx(chestPos.x, chestPos.y);
    if (!revealAll && activeRun.world.visible[idx] !== 1) {
      continue;
    }

    const col = chestPos.x - view.left;
    const row = chestPos.y - view.top;
    if (col < 0 || col >= view.cols || row < 0 || row >= view.rows) {
      continue;
    }

    const px = col * tile;
    const py = row * tile;
    if (spritesReady) {
      drawSheetSprite(
        context,
        "items",
        chest.chest.empty() ? SPRITE_IDS.items.chestOpen : SPRITE_IDS.items.chestClosed,
        px,
        py,
        tile,
      );
    } else {
      context.fillStyle = chest.chest.empty() ? "#6f7f8d" : "#d2a444";
      context.fillRect(px + (tile * 0.2), py + (tile * 0.2), tile * 0.6, tile * 0.6);
    }
  }

  for (const mob of activeRun.mobs) {
    if (!mob.creature.alive) {
      continue;
    }

    const idx = activeRun.world.idx(mob.creature.position.x, mob.creature.position.y);
    if (!revealAll && activeRun.world.visible[idx] !== 1) {
      continue;
    }

    const col = mob.creature.position.x - view.left;
    const row = mob.creature.position.y - view.top;
    if (col < 0 || col >= view.cols || row < 0 || row >= view.rows) {
      continue;
    }

    const px = col * tile;
    const py = row * tile;
    if (spritesReady) {
      drawSheetSprite(context, "chars", SPRITE_IDS.chars.mob, px, py, tile);
    } else {
      context.fillStyle = mob.creature.name === EN.game.names.dungeonBoss ? "#d16a32" : "#c74646";
      context.beginPath();
      context.arc(px + (tile / 2), py + (tile / 2), tile * 0.3, 0, Math.PI * 2);
      context.fill();
    }
  }

  const playerCol = activeRun.player.position.x - view.left;
  const playerRow = activeRun.player.position.y - view.top;
  const playerX = playerCol * tile;
  const playerY = playerRow * tile;

  if (spritesReady) {
    drawSheetSprite(context, "chars", SPRITE_IDS.chars.player, playerX, playerY, tile);
  } else {
    context.fillStyle = "#f0f4f8";
    context.fillRect(playerX + (tile * 0.2), playerY + (tile * 0.2), tile * 0.6, tile * 0.6);
  }
}
