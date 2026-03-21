import {
  type Combat,
  type CombatResult,
  type EnemyActionId,
  type PlannedEnemyAction,
  type PlayerAction,
} from "./combat";
import {
  CREATURE_XP_MULTIPLIER,
  SURPRISE_PROTECTION_ATTACK_MULTIPLIER,
  SURPRISE_PROTECTION_FLEE_BONUS,
} from "./constants";
import type { Creature } from "./creature";
import type { OverlayState, RunState } from "./game";
import { Gold } from "./items";
import { type WorldMap } from "./mapgen";
import { findRetreatPosition } from "./runAi";
import type { ChestEntity, MobEntity } from "./runFloorPopulation";
import { EN } from "./strings/en";
import type { LogEntry, Room } from "./types";

type CombatStats = {
  vanquished: number;
  goldEarned: number;
  xpGained: number;
};

type LogFn = (text: string, level?: LogEntry["level"]) => void;

type ResolveCombatTurnOptions = {
  action: PlayerAction;
  state: RunState;
  overlay: OverlayState;
  mobs: MobEntity[];
  combat: Combat;
  player: Creature;
  world: WorldMap;
  chests: ChestEntity[];
  currentRoom: Room | null;
  stats: CombatStats;
  floor: number;
  log: LogFn;
};

export type ResolveCombatTurnResult = {
  result: CombatResult | null;
  state: RunState;
  overlay: OverlayState;
  mobs: MobEntity[];
  currentRoom: Room | null;
  openBossReward: boolean;
  finalizeStats: boolean;
  maybeOpenAutoOverlay: boolean;
};

export function resolveCombatTurn(
  options: ResolveCombatTurnOptions,
): ResolveCombatTurnResult {
  if (options.overlay.type !== "battle" || options.state !== "playing") {
    return {
      result: null,
      state: options.state,
      overlay: options.overlay,
      mobs: options.mobs,
      currentRoom: options.currentRoom,
      openBossReward: false,
      finalizeStats: false,
      maybeOpenAutoOverlay: false,
    };
  }

  const battle = options.overlay;
  const mob = options.mobs.find((entry) => entry.id === battle.mobId);
  if (!mob || !mob.creature.alive) {
    return {
      result: null,
      state: options.state,
      overlay: { type: "none" },
      mobs: options.mobs,
      currentRoom: options.currentRoom,
      openBossReward: false,
      finalizeStats: false,
      maybeOpenAutoOverlay: true,
    };
  }

  const openingProtection = battle.surpriseProtection;
  if (openingProtection) {
    options.log(EN.game.logs.dangerSenseProtected, "success");
    battle.surpriseProtection = false;
  }

  const combatWithIntent = options.combat as Combat & {
    planEnemyAction?: (enemy: Creature) => PlannedEnemyAction;
    enemyActionForId?: (id: EnemyActionId) => PlannedEnemyAction;
  };
  let forcedEnemyAction: PlannedEnemyAction | undefined = undefined;
  if (mob.nextEnemyActionId && combatWithIntent.enemyActionForId) {
    forcedEnemyAction = combatWithIntent.enemyActionForId(mob.nextEnemyActionId);
  } else if (combatWithIntent.planEnemyAction) {
    forcedEnemyAction = combatWithIntent.planEnemyAction(mob.creature);
  }
  if (forcedEnemyAction) {
    mob.intentHint = forcedEnemyAction.intentHint;
  }
  mob.nextEnemyActionId = undefined;

  const result = options.combat.turn(
    options.player,
    mob.creature,
    options.action,
    {
      enemyAttackMultiplier: openingProtection
        ? SURPRISE_PROTECTION_ATTACK_MULTIPLIER
        : 1,
      fleeBonus: openingProtection ? SURPRISE_PROTECTION_FLEE_BONUS : 0,
      forcedEnemyAction,
    },
  );
  for (const entry of result.logs) {
    options.log(entry.text, entry.level);
  }

  if (result.fled) {
    options.player.position = findRetreatPosition({
      world: options.world,
      mobs: options.mobs,
      chests: options.chests,
      battleRoomId: battle.roomId,
      fallback: battle.fallback,
    });
    options.player.inBattle = false;
    mob.creature.inBattle = false;
    mob.intentHint = undefined;
    mob.nextEnemyActionId = undefined;

    const nextCurrentRoom = options.world.roomAt(options.player.position);
    options.log(EN.game.logs.retreat, "info");
    options.world.updateFov(options.player.position);
    return {
      result,
      state: options.state,
      overlay: { type: "none" },
      mobs: options.mobs,
      currentRoom: nextCurrentRoom,
      openBossReward: false,
      finalizeStats: false,
      maybeOpenAutoOverlay: true,
    };
  }

  let nextMobs = options.mobs;
  let nextOverlay: OverlayState = options.overlay;
  let openBossReward = false;
  if (!mob.creature.alive) {
    options.stats.vanquished += 1;

    const gainedXp = Math.floor(
      mob.creature.maxHitpoints * CREATURE_XP_MULTIPLIER,
    );
    const gain = options.player.giveXp(gainedXp);
    options.stats.xpGained += gainedXp;
    if (gain.leveled > 0) {
      options.log(
        EN.game.logs.welcomeLevel(
          options.player.level,
          options.player.unspentStatPoints,
        ),
        "success",
      );
    }

    const lootGold = mob.creature.gold;
    options.player.give(new Gold(lootGold));
    options.stats.goldEarned += lootGold;
    options.log(EN.game.logs.lootKillRewards(lootGold, gainedXp), "success");

    options.player.inBattle = false;
    mob.creature.inBattle = false;
    mob.intentHint = undefined;
    mob.nextEnemyActionId = undefined;
    nextOverlay = { type: "none" };

    const bossDefeated = mob.isBoss;
    nextMobs = options.mobs.filter((entry) => entry.creature.alive);
    if (bossDefeated) {
      options.log(EN.game.logs.bossDownChooseReward, "success");
      openBossReward = true;
    } else if (nextMobs.length > 0) {
      options.log(
        EN.game.logs.enemiesRemain(nextMobs.length, options.floor),
        "info",
      );
    }
  } else if (options.player.alive && combatWithIntent.planEnemyAction) {
    const nextIntent = combatWithIntent.planEnemyAction(mob.creature);
    mob.nextEnemyActionId = nextIntent.id;
    mob.intentHint = nextIntent.intentHint;
  }

  if (!options.player.alive) {
    return {
      result,
      state: "dead",
      overlay: nextOverlay,
      mobs: nextMobs,
      currentRoom: options.currentRoom,
      openBossReward,
      finalizeStats: true,
      maybeOpenAutoOverlay: false,
    };
  }

  return {
    result,
    state: options.state,
    overlay: nextOverlay,
    mobs: nextMobs,
    currentRoom: options.currentRoom,
    openBossReward,
    finalizeStats: false,
    maybeOpenAutoOverlay: true,
  };
}
