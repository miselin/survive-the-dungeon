import {
  AI_LEASH_PURSUIT_TURNS,
  AI_WANDER_MOVE_ROLL_MIN,
  AI_WANDER_ROLL_MAX,
} from "./constants";
import { Creature } from "./creature";
import { Chest } from "./items";
import { WorldMap } from "./mapgen";
import type { SeededRandom } from "./rng";
import type { Position } from "./types";

type MobLike = {
  id: string;
  creature: Creature;
  roomId: number;
  isBoss: boolean;
  pursuitTurnsRemaining: number;
};

type ChestLike = {
  chest: Chest;
};

type RunAiStepOptions = {
  overlayType: string;
  world: WorldMap;
  rng: SeededRandom;
  player: Creature;
  mobs: MobLike[];
  chests: ChestLike[];
};

type BattleTrigger = {
  mobId: string;
  roomId: number | null;
  attackerName: string;
};

export type RunAiStepResult = {
  battleTrigger: BattleTrigger | null;
};

type FindRetreatPositionOptions = {
  world: WorldMap;
  mobs: MobLike[];
  chests: ChestLike[];
  battleRoomId: number | null;
  fallback: Position;
};

const CARDINAL_STEPS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function posKey(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

function clonePos(pos: Position): Position {
  return { x: pos.x, y: pos.y };
}

function chestPos(chest: Chest): Position {
  return { x: chest.x, y: chest.y };
}

export function runAiStep(options: RunAiStepOptions): RunAiStepResult {
  if (options.overlayType !== "none") {
    return { battleTrigger: null };
  }

  const roomById = new Map(options.world.rooms.map((room) => [room.id, room]));
  const occupied = new Set<string>();
  occupied.add(posKey(options.player.position));

  for (const chest of options.chests) {
    if (!chest.chest.empty()) {
      occupied.add(posKey(chestPos(chest.chest)));
    }
  }

  for (const mob of options.mobs) {
    if (!mob.creature.alive) {
      continue;
    }
    occupied.add(posKey(mob.creature.position));
  }

  for (const mob of options.mobs) {
    const creature = mob.creature;
    if (!creature.alive || creature.inBattle) {
      continue;
    }

    const playerRoom = options.world.roomAt(options.player.position);
    const mobRoom = options.world.roomAt(creature.position);
    const mobInHomeRoom = mobRoom !== null && mobRoom.id === mob.roomId;
    const playerInMobHomeRoom =
      playerRoom !== null && playerRoom.id === mob.roomId;
    const homeAggro = mobInHomeRoom && playerInMobHomeRoom;

    if (homeAggro) {
      mob.pursuitTurnsRemaining = AI_LEASH_PURSUIT_TURNS;
    }

    const canPursuePlayer = homeAggro || mob.pursuitTurnsRemaining > 0;
    if (canPursuePlayer) {
      const blocked = new Set(occupied);
      blocked.delete(posKey(creature.position));
      const path = options.world.pathTo(
        creature.position,
        options.player.position,
        blocked,
      );

      if (path.length === 1) {
        return {
          battleTrigger: {
            mobId: mob.id,
            roomId: playerRoom?.id ?? mobRoom?.id ?? mob.roomId,
            attackerName: creature.name,
          },
        };
      }

      if (path.length > 0) {
        const next = path[0];
        const nextKey = posKey(next);
        if (!occupied.has(nextKey)) {
          occupied.delete(posKey(creature.position));
          creature.position = next;
          occupied.add(nextKey);
        }
      }

      if (!homeAggro && !mob.isBoss) {
        mob.pursuitTurnsRemaining = Math.max(0, mob.pursuitTurnsRemaining - 1);
      }
      continue;
    }

    const homeRoom = roomById.get(mob.roomId) ?? null;
    if (!mobInHomeRoom && homeRoom) {
      const blocked = new Set(occupied);
      blocked.delete(posKey(creature.position));
      const homeTarget = {
        x: homeRoom.x + Math.floor(homeRoom.w / 2),
        y: homeRoom.y + Math.floor(homeRoom.h / 2),
      };
      const pathHome = options.world.pathTo(
        creature.position,
        homeTarget,
        blocked,
      );
      if (pathHome.length > 0) {
        const next = pathHome[0];
        const nextKey = posKey(next);
        if (!occupied.has(nextKey)) {
          occupied.delete(posKey(creature.position));
          creature.position = next;
          occupied.add(nextKey);
        }
      }
      continue;
    }

    if (options.rng.int(1, AI_WANDER_ROLL_MAX) < AI_WANDER_MOVE_ROLL_MIN) {
      continue;
    }

    const steps = options.rng.shuffle<Position>([
      { x: creature.position.x + 1, y: creature.position.y },
      { x: creature.position.x - 1, y: creature.position.y },
      { x: creature.position.x, y: creature.position.y + 1 },
      { x: creature.position.x, y: creature.position.y - 1 },
    ]);
    for (const next of steps) {
      if (
        !options.world.inBounds(next.x, next.y) ||
        !options.world.isPassable(next.x, next.y)
      ) {
        continue;
      }
      const nextRoom = options.world.roomAt(next);
      if (!nextRoom || nextRoom.id !== mob.roomId) {
        continue;
      }
      const nextKey = posKey(next);
      if (occupied.has(nextKey)) {
        continue;
      }
      occupied.delete(posKey(creature.position));
      creature.position = next;
      occupied.add(nextKey);
      break;
    }
  }

  return { battleTrigger: null };
}

export function findRetreatPosition(
  options: FindRetreatPositionOptions,
): Position {
  if (options.battleRoomId === null) {
    return clonePos(options.fallback);
  }

  const occupied = new Set<string>();
  for (const mob of options.mobs) {
    if (mob.creature.alive) {
      occupied.add(posKey(mob.creature.position));
    }
  }
  for (const chest of options.chests) {
    if (!chest.chest.empty()) {
      occupied.add(posKey(chestPos(chest.chest)));
    }
  }
  occupied.delete(posKey(options.fallback));

  const frontier: Position[] = [clonePos(options.fallback)];
  const seen = new Set<string>([posKey(options.fallback)]);
  let cursor = 0;

  while (cursor < frontier.length) {
    const current = frontier[cursor];
    cursor += 1;

    const currentRoom = options.world.roomAt(current);
    const isOutsideRoom =
      !currentRoom || currentRoom.id !== options.battleRoomId;
    const currentKey = posKey(current);
    if (isOutsideRoom && !occupied.has(currentKey)) {
      return clonePos(current);
    }

    for (const [dx, dy] of CARDINAL_STEPS) {
      const next = { x: current.x + dx, y: current.y + dy };
      if (
        !options.world.inBounds(next.x, next.y) ||
        !options.world.isPassable(next.x, next.y)
      ) {
        continue;
      }
      const key = posKey(next);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      frontier.push(next);
    }
  }

  return clonePos(options.fallback);
}
