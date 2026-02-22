import { ROOM_BOSS, ROOM_SHOP } from "./types";
import { type DungeonRun, type LevelUpAttribute } from "./game";
import type { Position } from "./types";

type DebugSnapshot = {
  seedPhrase: string;
  seedNumber: number;
  floor: number;
  state: string;
  overlay: string;
  player: {
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    gold: number;
    level: number;
    xp: number;
    unspentStatPoints: number;
  };
  mobs: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    alive: boolean;
    isBoss: boolean;
  }>;
  chests: Array<{
    id: string;
    x: number;
    y: number;
    items: number;
  }>;
  roomCount: number;
  logs: Array<{
    text: string;
    level: string;
  }>;
};

type DebugMoveResult = {
  ok: boolean;
  steps: number;
  state: string;
  overlay: string;
  position: Position;
  reason?: string;
};

type MoveToOptions = {
  ignoreMobs?: boolean;
  allowMobId?: string;
  ignoreChests?: boolean;
};

type DebugBridge = {
  snapshot: () => DebugSnapshot | null;
  setRevealMap: (enabled: boolean) => void;
  moveBy: (dx: number, dy: number) => DebugMoveResult;
  moveTo: (x: number, y: number, opts?: MoveToOptions) => DebugMoveResult;
  moveToRoom: (kind: "shop" | "boss") => DebugMoveResult;
  moveToMob: (mobId?: string) => DebugMoveResult;
  moveToChest: (chestId?: string) => DebugMoveResult;
  resolveCombat: (
    action?: "normal" | "offensive" | "defensive" | "heal" | "flee",
    maxRounds?: number,
  ) => {
    rounds: number;
    state: string;
    overlay: string;
  };
  openInventory: () => void;
  openShop: () => void;
  closeOverlay: () => void;
  lootAll: () => void;
  chooseBossReward: (
    kind?: "perk" | "gambit" | "none",
    choiceId?: string,
  ) => void;
  claimShopReward: (
    choiceId: "bonus-point" | "remove-perk" | "remove-gambit",
  ) => void;
  allocateLevelUp: (attr: LevelUpAttribute) => void;
  canOpenShop: () => boolean;
  grantRegressionPower: () => void;
  exportSaveToken: () => string | null;
  importSaveToken: (token: string) => boolean;
};

type DebugBridgeOptions = {
  isDev: boolean;
  getRun: () => DungeonRun | null;
  setRevealMap: (enabled: boolean) => void;
  forceRender: () => void;
  exportSaveToken: (run: DungeonRun) => string;
  importSaveToken: (token: string) => boolean;
};

declare global {
  interface Window {
    __surviveDebug?: DebugBridge;
  }
}

function buildDebugMoveResult(
  activeRun: DungeonRun,
  steps: number,
  ok: boolean,
  reason?: string,
): DebugMoveResult {
  return {
    ok,
    steps,
    state: activeRun.state,
    overlay: activeRun.overlay.type,
    position: {
      x: activeRun.player.position.x,
      y: activeRun.player.position.y,
    },
    reason,
  };
}

function noRunResult(): DebugMoveResult {
  return {
    ok: false,
    steps: 0,
    state: "none",
    overlay: "none",
    position: { x: 0, y: 0 },
    reason: "no-run",
  };
}

export function installDebugBridge(options: DebugBridgeOptions): void {
  if (!options.isDev) {
    delete window.__surviveDebug;
    return;
  }

  const getRun = options.getRun;
  const posKey = (pos: Position): string => `${pos.x},${pos.y}`;
  const roomCenter = (room: {
    x: number;
    y: number;
    w: number;
    h: number;
  }): Position => ({
    x: room.x + Math.floor(room.w / 2),
    y: room.y + Math.floor(room.h / 2),
  });
  const manhattan = (a: Position, b: Position): number =>
    Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

  const roomSafeTile = (
    activeRun: DungeonRun,
    room: { x: number; y: number; w: number; h: number },
  ): Position => {
    const blocked = new Set<string>();
    for (const mob of activeRun.mobs) {
      if (mob.creature.alive) {
        blocked.add(posKey(mob.creature.position));
      }
    }
    for (const chest of activeRun.chests) {
      if (chest.chest.count() > 0) {
        blocked.add(`${chest.chest.x},${chest.chest.y}`);
      }
    }

    const candidates: Position[] = [];
    for (let y = room.y; y < room.y + room.h; y += 1) {
      for (let x = room.x; x < room.x + room.w; x += 1) {
        if (!activeRun.world.isPassable(x, y)) {
          continue;
        }
        const key = `${x},${y}`;
        if (blocked.has(key)) {
          continue;
        }
        candidates.push({ x, y });
      }
    }

    if (candidates.length === 0) {
      return roomCenter(room);
    }

    candidates.sort(
      (a, b) =>
        manhattan(a, activeRun.player.position) -
        manhattan(b, activeRun.player.position),
    );
    return candidates[0];
  };

  const moveTo = (
    activeRun: DungeonRun,
    target: Position,
    opts?: MoveToOptions,
  ): DebugMoveResult => {
    if (activeRun.overlay.type !== "none") {
      return buildDebugMoveResult(
        activeRun,
        0,
        false,
        `overlay:${activeRun.overlay.type}`,
      );
    }
    if (activeRun.state !== "playing") {
      return buildDebugMoveResult(
        activeRun,
        0,
        false,
        `state:${activeRun.state}`,
      );
    }

    const blocked = new Set<string>();
    if (!opts?.ignoreMobs) {
      for (const mob of activeRun.mobs) {
        if (!mob.creature.alive) {
          continue;
        }
        if (opts?.allowMobId && mob.id === opts.allowMobId) {
          continue;
        }
        blocked.add(posKey(mob.creature.position));
      }
    }
    if (!opts?.ignoreChests) {
      for (const chest of activeRun.chests) {
        if (chest.chest.count() <= 0) {
          continue;
        }
        const key = `${chest.chest.x},${chest.chest.y}`;
        if (target.x === chest.chest.x && target.y === chest.chest.y) {
          continue;
        }
        blocked.add(key);
      }
    }

    const path = activeRun.world.pathTo(
      activeRun.player.position,
      target,
      blocked,
    );
    if (
      path.length === 0 &&
      (activeRun.player.position.x !== target.x ||
        activeRun.player.position.y !== target.y)
    ) {
      return buildDebugMoveResult(activeRun, 0, false, "no-path");
    }

    let steps = 0;
    for (const step of path) {
      const dx = step.x - activeRun.player.position.x;
      const dy = step.y - activeRun.player.position.y;
      activeRun.movePlayer(dx, dy);
      steps += 1;

      if (activeRun.overlay.type !== "none") {
        return buildDebugMoveResult(activeRun, steps, true);
      }
      if (activeRun.state !== "playing") {
        return buildDebugMoveResult(
          activeRun,
          steps,
          false,
          `state:${activeRun.state}`,
        );
      }
    }

    return buildDebugMoveResult(activeRun, steps, true);
  };

  window.__surviveDebug = {
    snapshot: (): DebugSnapshot | null => {
      const activeRun = getRun();
      if (!activeRun) {
        return null;
      }
      return {
        seedPhrase: activeRun.seedPhrase,
        seedNumber: activeRun.seedNumber,
        floor: activeRun.floor,
        state: activeRun.state,
        overlay: activeRun.overlay.type,
        player: {
          x: activeRun.player.position.x,
          y: activeRun.player.position.y,
          hp: activeRun.player.hitpoints,
          maxHp: activeRun.player.currentMaxHitpoints(),
          gold: activeRun.player.gold,
          level: activeRun.player.level,
          xp: activeRun.player.xp,
          unspentStatPoints: activeRun.player.unspentStatPoints,
        },
        mobs: activeRun.mobs.map((mob) => ({
          id: mob.id,
          name: mob.creature.name,
          x: mob.creature.position.x,
          y: mob.creature.position.y,
          hp: mob.creature.hitpoints,
          maxHp: mob.creature.maxHitpoints,
          alive: mob.creature.alive,
          isBoss: mob.isBoss,
        })),
        chests: activeRun.chests.map((chest) => ({
          id: chest.id,
          x: chest.chest.x,
          y: chest.chest.y,
          items: chest.chest.count(),
        })),
        roomCount: activeRun.world.rooms.length,
        logs: activeRun.logs
          .slice(-30)
          .map((entry) => ({ text: entry.text, level: entry.level })),
      };
    },
    setRevealMap: (enabled: boolean): void => {
      options.setRevealMap(enabled);
    },
    moveBy: (dx: number, dy: number): DebugMoveResult => {
      const activeRun = getRun();
      if (!activeRun) {
        return noRunResult();
      }
      activeRun.movePlayer(dx, dy);
      return buildDebugMoveResult(activeRun, 1, true);
    },
    moveTo: (x: number, y: number, opts?: MoveToOptions): DebugMoveResult => {
      const activeRun = getRun();
      if (!activeRun) {
        return noRunResult();
      }
      return moveTo(activeRun, { x, y }, opts);
    },
    moveToRoom: (kind: "shop" | "boss"): DebugMoveResult => {
      const activeRun = getRun();
      if (!activeRun) {
        return noRunResult();
      }
      const flag = kind === "shop" ? ROOM_SHOP : ROOM_BOSS;
      const room = activeRun.world.rooms.find(
        (candidate) => (candidate.attrs & flag) === flag,
      );
      if (!room) {
        return buildDebugMoveResult(activeRun, 0, false, "room-not-found");
      }
      return moveTo(activeRun, roomSafeTile(activeRun, room));
    },
    moveToMob: (mobId?: string): DebugMoveResult => {
      const activeRun = getRun();
      if (!activeRun) {
        return noRunResult();
      }
      const alive = activeRun.mobs.filter((mob) => mob.creature.alive);
      const target = mobId
        ? alive.find((mob) => mob.id === mobId)
        : alive.slice().sort((a, b) => {
            const da =
              Math.abs(a.creature.position.x - activeRun.player.position.x) +
              Math.abs(a.creature.position.y - activeRun.player.position.y);
            const db =
              Math.abs(b.creature.position.x - activeRun.player.position.x) +
              Math.abs(b.creature.position.y - activeRun.player.position.y);
            return da - db;
          })[0];
      if (!target) {
        return buildDebugMoveResult(activeRun, 0, false, "mob-not-found");
      }
      return moveTo(activeRun, target.creature.position, {
        allowMobId: target.id,
      });
    },
    moveToChest: (chestId?: string): DebugMoveResult => {
      const activeRun = getRun();
      if (!activeRun) {
        return noRunResult();
      }
      const target = chestId
        ? activeRun.chests.find((chest) => chest.id === chestId)
        : activeRun.chests
            .filter((chest) => chest.chest.count() > 0)
            .sort((a, b) => {
              const da =
                Math.abs(a.chest.x - activeRun.player.position.x) +
                Math.abs(a.chest.y - activeRun.player.position.y);
              const db =
                Math.abs(b.chest.x - activeRun.player.position.x) +
                Math.abs(b.chest.y - activeRun.player.position.y);
              return da - db;
            })[0];
      if (!target) {
        return buildDebugMoveResult(activeRun, 0, false, "chest-not-found");
      }
      return moveTo(
        activeRun,
        { x: target.chest.x, y: target.chest.y },
        { ignoreChests: true },
      );
    },
    resolveCombat: (
      action: "normal" | "offensive" | "defensive" | "heal" | "flee" = "normal",
      maxRounds = 24,
    ): { rounds: number; state: string; overlay: string } => {
      const activeRun = getRun();
      if (!activeRun) {
        return { rounds: 0, state: "none", overlay: "none" };
      }
      let rounds = 0;
      while (
        activeRun.overlay.type === "battle" &&
        activeRun.state === "playing" &&
        rounds < maxRounds
      ) {
        activeRun.performCombat(action);
        rounds += 1;
      }
      return {
        rounds,
        state: activeRun.state,
        overlay: activeRun.overlay.type,
      };
    },
    openInventory: (): void => {
      getRun()?.openInventory();
    },
    openShop: (): void => {
      getRun()?.openShop();
    },
    closeOverlay: (): void => {
      getRun()?.closeOverlay();
    },
    lootAll: (): void => {
      const activeRun = getRun();
      activeRun?.lootAll();
      activeRun?.closeOverlay();
    },
    chooseBossReward: (
      kind: "perk" | "gambit" | "none" = "none",
      choiceId?: string,
    ): void => {
      getRun()?.chooseBossReward(kind, choiceId);
    },
    claimShopReward: (
      choiceId: "bonus-point" | "remove-perk" | "remove-gambit",
    ): void => {
      getRun()?.claimShopReward(choiceId);
    },
    allocateLevelUp: (attr: LevelUpAttribute): void => {
      getRun()?.allocateLevelUp(attr);
    },
    canOpenShop: (): boolean => {
      const activeRun = getRun();
      return activeRun ? activeRun.canOpenShop() : false;
    },
    grantRegressionPower: (): void => {
      const activeRun = getRun();
      if (!activeRun) {
        return;
      }
      activeRun.player.attackBonus += 45;
      activeRun.player.defenseBonus += 20;
      activeRun.player.damageDealtMultiplier *= 5.5;
      activeRun.player.damageTakenMultiplier *= 0.25;
      activeRun.player.maxHitpoints = Math.max(
        activeRun.player.maxHitpoints,
        2200,
      );
      activeRun.player.hitpoints = activeRun.player.currentMaxHitpoints();
      activeRun.player.gold += 2000;
      options.forceRender();
    },
    exportSaveToken: (): string | null => {
      const activeRun = getRun();
      return activeRun ? options.exportSaveToken(activeRun) : null;
    },
    importSaveToken: (token: string): boolean => options.importSaveToken(token),
  };
}
