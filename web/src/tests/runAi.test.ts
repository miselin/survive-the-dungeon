import { AttributeSet } from "../attributes.js";
import { AI_LEASH_PURSUIT_TURNS, AI_WANDER_ROLL_MAX } from "../constants.js";
import { Creature } from "../creature.js";
import { WorldMap } from "../mapgen.js";
import { SeededRandom } from "../rng.js";
import { runAiStep } from "../runAi.js";
import type { MobEntity } from "../runFloorPopulation.js";
import { TileType, type Position, type Room } from "../types.js";
import { assertEqual } from "./assert.js";

class ForcedWanderRng {
  int(_min: number, _max: number): number {
    return AI_WANDER_ROLL_MAX;
  }

  shuffle<T>(items: T[]): T[] {
    return [...items];
  }
}

function makeActor(name: string, position: Position, isMob: boolean): Creature {
  const actor = new Creature(
    name,
    position,
    new AttributeSet({ str: 10, dex: 10, con: 10, int: 10, wis: 10, chr: 10 }),
  );
  actor.mob = isMob;
  return actor;
}

function buildTwoRoomWorld(): WorldMap {
  const width = 9;
  const height = 5;
  const cells = new Uint8Array(width * height).fill(TileType.Empty);
  const rooms: Room[] = [
    { id: 1, x: 1, y: 1, w: 3, h: 3, attrs: 0 },
    { id: 2, x: 5, y: 1, w: 3, h: 3, attrs: 0 },
  ];

  for (const room of rooms) {
    for (let y = room.y; y < room.y + room.h; y += 1) {
      for (let x = room.x; x < room.x + room.w; x += 1) {
        cells[y * width + x] = TileType.Room;
      }
    }
  }

  cells[2 * width + 4] = TileType.Hall;
  return new WorldMap(width, height, rooms, cells);
}

export function runAiTests(): void {
  {
    const world = buildTwoRoomWorld();
    const rng = new SeededRandom("ai-leash-return");
    const player = makeActor("Player", { x: 3, y: 2 }, false);
    const mobCreature = makeActor("Stalker", { x: 1, y: 2 }, true);
    const mobs: MobEntity[] = [
      {
        id: "mob-1",
        creature: mobCreature,
        roomId: 1,
        isBoss: false,
        pursuitTurnsRemaining: 0,
      },
    ];

    const initial = runAiStep({
      overlayType: "none",
      world,
      rng,
      player,
      mobs,
      chests: [],
    });
    assertEqual(
      initial.battleTrigger,
      null,
      "Initial aggro should move toward player instead of starting battle at distance",
    );
    assertEqual(
      mobs[0].pursuitTurnsRemaining,
      AI_LEASH_PURSUIT_TURNS,
      "Entering a mob's home room should arm leash pursuit turns",
    );

    player.position = { x: 7, y: 2 };

    runAiStep({
      overlayType: "none",
      world,
      rng,
      player,
      mobs,
      chests: [],
    });
    assertEqual(
      mobs[0].pursuitTurnsRemaining,
      AI_LEASH_PURSUIT_TURNS - 1,
      "First out-of-room chase tick should consume one leash pursuit turn",
    );

    runAiStep({
      overlayType: "none",
      world,
      rng,
      player,
      mobs,
      chests: [],
    });
    assertEqual(
      mobs[0].pursuitTurnsRemaining,
      0,
      "Second out-of-room chase tick should fully consume leash pursuit turns",
    );
    assertEqual(
      world.roomAt(mobCreature.position),
      null,
      "Mob should be in hall after spending leash turns while chasing",
    );

    runAiStep({
      overlayType: "none",
      world,
      rng,
      player,
      mobs,
      chests: [],
    });
    assertEqual(
      world.roomAt(mobCreature.position)?.id ?? null,
      1,
      "Mob should return to its home room after leash pursuit ends",
    );
  }

  {
    const world = buildTwoRoomWorld();
    const player = makeActor("Player", { x: 7, y: 2 }, false);
    const mobCreature = makeActor("Wanderer", { x: 3, y: 2 }, true);
    const mobs: MobEntity[] = [
      {
        id: "mob-1",
        creature: mobCreature,
        roomId: 1,
        isBoss: false,
        pursuitTurnsRemaining: 0,
      },
    ];

    runAiStep({
      overlayType: "none",
      world,
      rng: new ForcedWanderRng() as unknown as SeededRandom,
      player,
      mobs,
      chests: [],
    });

    assertEqual(
      world.roomAt(mobCreature.position)?.id ?? null,
      1,
      "Idle wandering should keep mobs inside their home room",
    );
  }

  {
    const world = buildTwoRoomWorld();
    const rng = new SeededRandom("ai-boss-ignore-leash");
    const player = makeActor("Player", { x: 3, y: 2 }, false);
    const bossCreature = makeActor("Boss", { x: 1, y: 2 }, true);
    const mobs: MobEntity[] = [
      {
        id: "boss-1",
        creature: bossCreature,
        roomId: 1,
        isBoss: true,
        pursuitTurnsRemaining: 0,
      },
    ];

    runAiStep({
      overlayType: "none",
      world,
      rng,
      player,
      mobs,
      chests: [],
    });
    assertEqual(
      mobs[0].pursuitTurnsRemaining,
      AI_LEASH_PURSUIT_TURNS,
      "Boss should arm pursuit after initial aggro in home room",
    );

    player.position = { x: 7, y: 2 };

    runAiStep({
      overlayType: "none",
      world,
      rng,
      player,
      mobs,
      chests: [],
    });
    runAiStep({
      overlayType: "none",
      world,
      rng,
      player,
      mobs,
      chests: [],
    });
    runAiStep({
      overlayType: "none",
      world,
      rng,
      player,
      mobs,
      chests: [],
    });

    assertEqual(
      world.roomAt(bossCreature.position)?.id ?? null,
      2,
      "Boss should continue pursuing beyond normal leash duration after aggro",
    );
    assertEqual(
      mobs[0].pursuitTurnsRemaining,
      AI_LEASH_PURSUIT_TURNS,
      "Boss pursuit counter should not decay after aggro",
    );
  }
}
