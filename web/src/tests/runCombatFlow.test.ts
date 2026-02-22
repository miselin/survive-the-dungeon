import { AttributeSet } from "../attributes.js";
import { CREATURE_XP_MULTIPLIER } from "../constants.js";
import { Creature } from "../creature.js";
import type { OverlayState } from "../game.js";
import type { ChestEntity, MobEntity } from "../runFloorPopulation.js";
import { resolveCombatTurn } from "../runCombatFlow.js";
import { WorldMap } from "../mapgen.js";
import { TileType, type Room } from "../types.js";
import type { Combat, CombatResult } from "../combat.js";
import { assertEqual } from "./assert.js";

function makePlayer(position = { x: 2, y: 2 }): Creature {
  const player = new Creature(
    "Player",
    position,
    new AttributeSet({ str: 10, dex: 10, con: 10, int: 10, wis: 10, chr: 10 }),
  );
  player.maxHitpoints = 80;
  player.hitpoints = 80;
  return player;
}

function makeMob(name: string, position = { x: 2, y: 3 }): Creature {
  const mob = new Creature(
    name,
    position,
    new AttributeSet({ str: 10, dex: 10, con: 10, int: 10, wis: 10, chr: 10 }),
  );
  mob.mob = true;
  mob.maxHitpoints = 30;
  mob.hitpoints = 30;
  return mob;
}

function makeWorld(): WorldMap {
  const width = 5;
  const height = 5;
  const cells = new Uint8Array(width * height).fill(TileType.Hall);
  const rooms: Room[] = [{ id: 1, x: 1, y: 1, w: 3, h: 3, attrs: 0 }];
  return new WorldMap(width, height, rooms, cells);
}

function fakeCombat(resultFactory: (player: Creature, enemy: Creature) => CombatResult): Combat {
  return {
    turn: (player: Creature, enemy: Creature) => resultFactory(player, enemy),
  } as unknown as Combat;
}

function battleOverlay(mobId: string, roomId: number | null = 1): OverlayState {
  return {
    type: "battle",
    mobId,
    fallback: { x: 2, y: 2 },
    roomId,
    surpriseProtection: false,
  };
}

function noLogs(): (text: string, level?: "info" | "warn" | "success") => void {
  return () => {};
}

export function runCombatFlowTests(): void {
  {
    const player = makePlayer();
    const world = makeWorld();
    const result = resolveCombatTurn({
      action: "normal",
      state: "playing",
      overlay: { type: "none" },
      mobs: [],
      combat: fakeCombat(() => ({ over: true, fled: false, logs: [], moments: [] })),
      player,
      world,
      chests: [],
      currentRoom: world.roomAt(player.position),
      stats: { vanquished: 0, goldEarned: 0, xpGained: 0 },
      floor: 1,
      log: noLogs(),
    });

    assertEqual(result.result, null, "Combat flow should no-op when there is no battle overlay");
    assertEqual(result.maybeOpenAutoOverlay, false, "No-op combat flow should not request auto-overlay checks");
  }

  {
    const player = makePlayer();
    const world = makeWorld();
    const result = resolveCombatTurn({
      action: "normal",
      state: "playing",
      overlay: battleOverlay("missing-mob"),
      mobs: [],
      combat: fakeCombat(() => ({ over: true, fled: false, logs: [], moments: [] })),
      player,
      world,
      chests: [],
      currentRoom: world.roomAt(player.position),
      stats: { vanquished: 0, goldEarned: 0, xpGained: 0 },
      floor: 1,
      log: noLogs(),
    });

    assertEqual(result.overlay.type, "none", "Missing battle target should close the battle overlay");
    assertEqual(result.maybeOpenAutoOverlay, true, "Missing battle target should allow auto-overlays to reopen");
  }

  {
    const player = makePlayer();
    const world = makeWorld();
    const enemy = makeMob("Runner");
    enemy.inBattle = true;
    player.inBattle = true;
    const mobs: MobEntity[] = [{ id: "mob-1", creature: enemy, roomId: 1, isBoss: false }];
    const chests: ChestEntity[] = [];
    const result = resolveCombatTurn({
      action: "flee",
      state: "playing",
      overlay: battleOverlay("mob-1"),
      mobs,
      combat: fakeCombat(() => ({ over: true, fled: true, logs: [], moments: [] })),
      player,
      world,
      chests,
      currentRoom: world.roomAt(player.position),
      stats: { vanquished: 0, goldEarned: 0, xpGained: 0 },
      floor: 1,
      log: noLogs(),
    });

    assertEqual(result.overlay.type, "none", "Successful flee should close the battle overlay");
    assertEqual(result.maybeOpenAutoOverlay, true, "Successful flee should request auto-overlay checks");
    assertEqual(player.inBattle, false, "Successful flee should clear player battle state");
    assertEqual(enemy.inBattle, false, "Successful flee should clear enemy battle state");
    assertEqual(result.currentRoom, null, "Successful flee should relocate the player outside the battle room when possible");
  }

  {
    const player = makePlayer();
    const world = makeWorld();
    const enemy = makeMob("Boss");
    enemy.maxHitpoints = 40;
    enemy.hitpoints = 40;
    enemy.gold = 19;
    const mobs: MobEntity[] = [{ id: "boss-1", creature: enemy, roomId: 1, isBoss: true }];
    const stats = { vanquished: 0, goldEarned: 0, xpGained: 0 };

    const result = resolveCombatTurn({
      action: "normal",
      state: "playing",
      overlay: battleOverlay("boss-1"),
      mobs,
      combat: fakeCombat((_player, combatEnemy) => {
        combatEnemy.alive = false;
        combatEnemy.hitpoints = 0;
        return { over: true, fled: false, logs: [], moments: [] };
      }),
      player,
      world,
      chests: [],
      currentRoom: world.roomAt(player.position),
      stats,
      floor: 2,
      log: noLogs(),
    });

    assertEqual(result.openBossReward, true, "Defeating a boss should request opening boss rewards");
    assertEqual(result.mobs.length, 0, "Defeated enemies should be removed from the live mob list");
    assertEqual(stats.vanquished, 1, "Defeating an enemy should increment vanquish stats");
    assertEqual(stats.goldEarned, 19, "Defeating an enemy should award its gold");
    assertEqual(stats.xpGained, Math.floor(40 * CREATURE_XP_MULTIPLIER), "XP gain should scale with enemy max HP");
  }

  {
    const player = makePlayer();
    const world = makeWorld();
    const enemy = makeMob("Reaper");
    const result = resolveCombatTurn({
      action: "normal",
      state: "playing",
      overlay: battleOverlay("mob-1"),
      mobs: [{ id: "mob-1", creature: enemy, roomId: 1, isBoss: false }],
      combat: fakeCombat((combatPlayer) => {
        combatPlayer.alive = false;
        combatPlayer.hitpoints = 0;
        return { over: true, fled: false, logs: [], moments: [] };
      }),
      player,
      world,
      chests: [],
      currentRoom: world.roomAt(player.position),
      stats: { vanquished: 0, goldEarned: 0, xpGained: 0 },
      floor: 1,
      log: noLogs(),
    });

    assertEqual(result.state, "dead", "Player death during combat should transition run state to dead");
    assertEqual(result.finalizeStats, true, "Player death during combat should request final stats finalization");
    assertEqual(result.maybeOpenAutoOverlay, false, "Player death should not request auto-overlay reopening");
  }
}
