import { WORLD_HEIGHT, WORLD_WIDTH } from "./constants";
import { SeededRandom } from "./rng";
import { ROOM_BOSS, ROOM_SHOP, ROOM_START, TileType } from "./types";
function keyOf(pos) {
    return `${pos.x},${pos.y}`;
}
function centerOf(room) {
    return {
        x: room.x + Math.floor(room.w / 2),
        y: room.y + Math.floor(room.h / 2),
    };
}
function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt((dx * dx) + (dy * dy));
}
function overlaps(a, b, padding = 1) {
    const ax = a.x - padding;
    const ay = a.y - padding;
    const aw = a.w + (padding * 2);
    const ah = a.h + (padding * 2);
    const bx = b.x - padding;
    const by = b.y - padding;
    const bw = b.w + (padding * 2);
    const bh = b.h + (padding * 2);
    return ax < (bx + bw) && (ax + aw) > bx && ay < (by + bh) && (ay + ah) > by;
}
function roomContains(room, pos) {
    return pos.x >= room.x && pos.x < (room.x + room.w) && pos.y >= room.y && pos.y < (room.y + room.h);
}
export class WorldMap {
    width;
    height;
    rooms;
    cells;
    visible;
    explored;
    constructor(width, height, rooms, cells) {
        this.width = width;
        this.height = height;
        this.rooms = rooms;
        this.cells = cells;
        this.visible = new Uint8Array(width * height);
        this.explored = new Uint8Array(width * height);
    }
    inBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    idx(x, y) {
        return (y * this.width) + x;
    }
    tileAt(x, y) {
        if (!this.inBounds(x, y)) {
            return TileType.Empty;
        }
        return this.cells[this.idx(x, y)];
    }
    setTile(x, y, tile, replace = true) {
        if (!this.inBounds(x, y)) {
            return;
        }
        const index = this.idx(x, y);
        if (!replace && this.cells[index] !== TileType.Empty) {
            return;
        }
        this.cells[index] = tile;
    }
    isPassable(x, y) {
        const tile = this.tileAt(x, y);
        return tile === TileType.Room || tile === TileType.Hall;
    }
    roomAt(pos) {
        for (const room of this.rooms) {
            if (roomContains(room, pos)) {
                return room;
            }
        }
        return null;
    }
    lineOfSight(a, b) {
        let x0 = a.x;
        let y0 = a.y;
        const x1 = b.x;
        const y1 = b.y;
        const dx = Math.abs(x1 - x0);
        const sx = x0 < x1 ? 1 : -1;
        const dy = -Math.abs(y1 - y0);
        const sy = y0 < y1 ? 1 : -1;
        let err = dx + dy;
        while (true) {
            if (!(x0 === a.x && y0 === a.y) && !this.isPassable(x0, y0)) {
                return false;
            }
            if (x0 === x1 && y0 === y1) {
                return true;
            }
            const e2 = 2 * err;
            if (e2 >= dy) {
                err += dy;
                x0 += sx;
            }
            if (e2 <= dx) {
                err += dx;
                y0 += sy;
            }
        }
    }
    updateFov(origin, radius = 8) {
        this.visible.fill(0);
        const minX = Math.max(0, origin.x - radius);
        const maxX = Math.min(this.width - 1, origin.x + radius);
        const minY = Math.max(0, origin.y - radius);
        const maxY = Math.min(this.height - 1, origin.y + radius);
        for (let y = minY; y <= maxY; y += 1) {
            for (let x = minX; x <= maxX; x += 1) {
                const dx = x - origin.x;
                const dy = y - origin.y;
                if ((dx * dx) + (dy * dy) > (radius * radius)) {
                    continue;
                }
                const target = { x, y };
                if (this.lineOfSight(origin, target)) {
                    const idx = this.idx(x, y);
                    this.visible[idx] = 1;
                    this.explored[idx] = 1;
                }
            }
        }
    }
    pathTo(start, end, blocked) {
        if (start.x === end.x && start.y === end.y) {
            return [];
        }
        const frontier = [start];
        const cameFrom = new Map();
        const seen = new Set([keyOf(start)]);
        let cursor = 0;
        while (cursor < frontier.length) {
            const current = frontier[cursor];
            cursor += 1;
            if (current.x === end.x && current.y === end.y) {
                break;
            }
            for (const [dx, dy] of [
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
            ]) {
                const next = { x: current.x + dx, y: current.y + dy };
                if (!this.inBounds(next.x, next.y)) {
                    continue;
                }
                if (!this.isPassable(next.x, next.y)) {
                    continue;
                }
                const nextKey = keyOf(next);
                if (blocked.has(nextKey) && !(next.x === end.x && next.y === end.y)) {
                    continue;
                }
                if (seen.has(nextKey)) {
                    continue;
                }
                seen.add(nextKey);
                cameFrom.set(nextKey, current);
                frontier.push(next);
            }
        }
        const path = [];
        let step = end;
        while (step && !(step.x === start.x && step.y === start.y)) {
            path.push(step);
            step = cameFrom.get(keyOf(step));
            if (!step) {
                return [];
            }
        }
        path.reverse();
        return path;
    }
}
function carveRoom(cells, width, room) {
    for (let y = room.y; y < (room.y + room.h); y += 1) {
        for (let x = room.x; x < (room.x + room.w); x += 1) {
            cells[(y * width) + x] = TileType.Room;
        }
    }
}
function carveTunnel(cells, width, height, from, to) {
    let x = from.x;
    let y = from.y;
    const xStep = to.x >= from.x ? 1 : -1;
    while (x !== to.x) {
        if (x >= 0 && x < width && y >= 0 && y < height && cells[(y * width) + x] === TileType.Empty) {
            cells[(y * width) + x] = TileType.Hall;
        }
        x += xStep;
    }
    const yStep = to.y >= from.y ? 1 : -1;
    while (y !== to.y) {
        if (x >= 0 && x < width && y >= 0 && y < height && cells[(y * width) + x] === TileType.Empty) {
            cells[(y * width) + x] = TileType.Hall;
        }
        y += yStep;
    }
    if (x >= 0 && x < width && y >= 0 && y < height && cells[(y * width) + x] === TileType.Empty) {
        cells[(y * width) + x] = TileType.Hall;
    }
}
const CARDINAL_STEPS = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
];
function isReverse(a, b) {
    return a.x === (-b.x) && a.y === (-b.y);
}
function carveLabyrinthBranches(cells, width, height, rng) {
    const hallStarts = [];
    for (let y = 1; y < height - 1; y += 1) {
        for (let x = 1; x < width - 1; x += 1) {
            if (cells[(y * width) + x] === TileType.Hall) {
                hallStarts.push({ x, y });
            }
        }
    }
    if (hallStarts.length === 0) {
        return;
    }
    const branchCount = Math.max(16, Math.floor((width * height) / 180));
    for (let i = 0; i < branchCount; i += 1) {
        const start = rng.choice(hallStarts);
        let cursor = { x: start.x, y: start.y };
        let direction = rng.choice(CARDINAL_STEPS);
        const steps = rng.int(7, 28);
        for (let step = 0; step < steps; step += 1) {
            if (rng.chance(0.35)) {
                const nextDirectionOptions = CARDINAL_STEPS.filter((candidate) => !isReverse(candidate, direction));
                direction = rng.choice(nextDirectionOptions);
            }
            const next = { x: cursor.x + direction.x, y: cursor.y + direction.y };
            if (next.x < 1 || next.y < 1 || next.x >= (width - 1) || next.y >= (height - 1)) {
                break;
            }
            const idx = (next.y * width) + next.x;
            const tile = cells[idx];
            if (tile === TileType.Room) {
                break;
            }
            if (tile === TileType.Empty) {
                cells[idx] = TileType.Hall;
            }
            cursor = next;
            if (rng.chance(0.15)) {
                const sides = CARDINAL_STEPS.filter((candidate) => candidate.x !== direction.x || candidate.y !== direction.y);
                const side = rng.choice(sides);
                const branch = { x: cursor.x + side.x, y: cursor.y + side.y };
                if (branch.x > 0 && branch.y > 0 && branch.x < (width - 1) && branch.y < (height - 1)) {
                    const branchIdx = (branch.y * width) + branch.x;
                    if (cells[branchIdx] === TileType.Empty) {
                        cells[branchIdx] = TileType.Hall;
                    }
                }
            }
        }
    }
}
function randomPointInRoom(room, rng, padding = 0) {
    const x = rng.int(room.x + padding, room.x + room.w - 1 - padding);
    const y = rng.int(room.y + padding, room.y + room.h - 1 - padding);
    return { x, y };
}
function connectRooms(rooms, rng) {
    const edges = [];
    const connected = new Set();
    connected.add(rooms[0].id);
    while (connected.size < rooms.length) {
        let best = null;
        let bestDistance = Number.MAX_SAFE_INTEGER;
        for (const room of rooms) {
            if (!connected.has(room.id)) {
                continue;
            }
            for (const target of rooms) {
                if (connected.has(target.id)) {
                    continue;
                }
                const distance = dist(centerOf(room), centerOf(target));
                if (distance < bestDistance) {
                    bestDistance = distance;
                    best = [room, target];
                }
            }
        }
        if (!best) {
            break;
        }
        edges.push(best);
        connected.add(best[1].id);
    }
    const extraCandidates = [];
    for (let i = 0; i < rooms.length; i += 1) {
        for (let j = i + 1; j < rooms.length; j += 1) {
            const key = `${rooms[i].id}-${rooms[j].id}`;
            const inverse = `${rooms[j].id}-${rooms[i].id}`;
            const exists = edges.some((entry) => {
                const edgeKey = `${entry[0].id}-${entry[1].id}`;
                return edgeKey === key || edgeKey === inverse;
            });
            if (!exists) {
                extraCandidates.push([rooms[i], rooms[j]]);
            }
        }
    }
    const extras = Math.max(1, Math.floor(rooms.length / 5));
    const shuffled = rng.shuffle(extraCandidates);
    for (let i = 0; i < Math.min(extras, shuffled.length); i += 1) {
        edges.push(shuffled[i]);
    }
    return edges;
}
export function generateMap(rng) {
    const width = WORLD_WIDTH;
    const height = WORLD_HEIGHT;
    const cells = new Uint8Array(width * height);
    const rooms = [];
    let nextRoomId = 1;
    const startRoom = { id: nextRoomId, x: 1, y: 1, w: 8, h: 8, attrs: ROOM_START };
    nextRoomId += 1;
    const bossRoom = {
        id: nextRoomId,
        x: width - 10,
        y: height - 10,
        w: 8,
        h: 8,
        attrs: ROOM_BOSS,
    };
    nextRoomId += 1;
    rooms.push(startRoom, bossRoom);
    const totalCells = width * height;
    const targetRects = Math.max(8, Math.floor(0.005 * totalCells));
    const attemptsPerRoom = 200;
    const rectMaxWidth = Math.floor(width / 8);
    const rectMaxHeight = Math.floor(height / 8);
    const rectMinWidth = Math.max(4, Math.floor(rectMaxWidth * 0.5));
    const rectMinHeight = Math.max(4, Math.floor(rectMaxHeight * 0.5));
    for (let i = 0; i < targetRects; i += 1) {
        const roomW = rng.int(rectMinWidth, rectMaxWidth);
        const roomH = rng.int(rectMinHeight, rectMaxHeight);
        for (let attempt = 0; attempt < attemptsPerRoom; attempt += 1) {
            const roomX = rng.int(1, width - roomW - 2);
            const roomY = rng.int(1, height - roomH - 2);
            const room = { id: nextRoomId, x: roomX, y: roomY, w: roomW, h: roomH, attrs: 0 };
            let blocked = false;
            for (const other of rooms) {
                if (overlaps(room, other, 1)) {
                    blocked = true;
                    break;
                }
            }
            if (!blocked) {
                rooms.push(room);
                nextRoomId += 1;
                break;
            }
        }
    }
    const sortedByDistance = [...rooms].sort((a, b) => dist(centerOf(a), centerOf(startRoom)) - dist(centerOf(b), centerOf(startRoom)));
    const eligibleShopRooms = sortedByDistance.filter((room) => (room.attrs & (ROOM_START | ROOM_BOSS)) === 0);
    if (eligibleShopRooms.length > 0) {
        const idx = Math.floor(eligibleShopRooms.length * 0.65);
        eligibleShopRooms[Math.min(idx, eligibleShopRooms.length - 1)].attrs |= ROOM_SHOP;
    }
    for (const room of rooms) {
        carveRoom(cells, width, room);
    }
    const connections = connectRooms(sortedByDistance, rng);
    for (const [a, b] of connections) {
        const start = randomPointInRoom(a, rng, 1);
        const end = randomPointInRoom(b, rng, 1);
        carveTunnel(cells, width, height, start, end);
    }
    carveLabyrinthBranches(cells, width, height, rng);
    return new WorldMap(width, height, sortedByDistance, cells);
}
export function randomPositionsInRoom(room, rng, count, keepouts = [], padding = 0) {
    const taken = new Set(keepouts.map((pos) => keyOf(pos)));
    const output = [];
    for (let i = 0; i < count; i += 1) {
        for (let attempts = 0; attempts < 5000; attempts += 1) {
            const point = randomPointInRoom(room, rng, padding);
            const key = keyOf(point);
            if (taken.has(key)) {
                continue;
            }
            taken.add(key);
            output.push(point);
            break;
        }
    }
    return output;
}
export function roomDistance(a, b) {
    return dist(centerOf(a), centerOf(b));
}
export function roomCenter(room) {
    return centerOf(room);
}
