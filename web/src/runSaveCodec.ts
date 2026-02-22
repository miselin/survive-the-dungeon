import {
  type AttributeName,
  AttributeSet,
  type AttributesRecord,
} from "./attributes";
import type { CombatLuckState } from "./combat";
import { Creature } from "./creature";
import {
  Buff,
  Chest,
  Container,
  deserializeItem,
  Poison,
  serializeItem,
  type Item,
  type SerializedItem,
  WieldableItem,
} from "./items";
import { WorldMap } from "./mapgen";
import type { BuildChoiceDefinition } from "./buildChoices";
import type {
  OverlayState,
  RunState,
  RunStats,
  ShopRewardChoice,
} from "./game";
import type { LogEntry, Position, Room, WieldSlot } from "./types";

type SavedTimedEffect = {
  item: SerializedItem;
  turnsRemaining: number;
};

type SavedCreature = {
  name: string;
  position: Position;
  attributes: AttributesRecord;
  alive: boolean;
  hitpoints: number;
  maxHitpoints: number;
  xp: number;
  nextLevelXp: number;
  level: number;
  turn: number;
  gold: number;
  defenseBase: number;
  attackBonus: number;
  defenseBonus: number;
  mob: boolean;
  inBattle: boolean;
  damageDealtMultiplier: number;
  damageTakenMultiplier: number;
  hitpointCapMultiplier: number;
  unspentStatPoints: number;
  inventoryCapacity: number;
  inventory: SerializedItem[];
  wieldpoints: Record<WieldSlot, SerializedItem | null>;
  buffs: SavedTimedEffect[];
  poisons: SavedTimedEffect[];
};

type SavedMob = {
  id: string;
  roomId: number;
  isBoss: boolean;
  creature: SavedCreature;
};

type SavedChest = {
  id: string;
  roomId: number;
  chest: {
    x: number;
    y: number;
    capacity: number;
    items: SerializedItem[];
  };
};

type SavedShopServiceId = "remove-perk" | "remove-gambit" | "bonus-point";

type SavedShopEntry = {
  id: string;
  kind: "item" | "service";
  name: string;
  description: string;
  value: number;
  sold: boolean;
  serviceId: SavedShopServiceId | null;
  item: SerializedItem | null;
};

type SavedPendingBossRewards = {
  perkIds: string[];
  gambitIds: string[];
};

type SavedWorld = {
  width: number;
  height: number;
  rooms: Room[];
  cellsBase64: string;
  exploredBase64: string;
};

export type DungeonRunSaveData = {
  version: 1;
  seedPhrase: string;
  seedNumber: number;
  rngState: number;
  nextEntityId: number;
  nextItemId: number;
  floor: number;
  state: RunState;
  stats: RunStats;
  logs: LogEntry[];
  overlay: OverlayState;
  world: SavedWorld;
  player: SavedCreature;
  mobs: SavedMob[];
  chests: SavedChest[];
  currentRoomId: number | null;
  aiAccumMs: number;
  shopStock: SavedShopEntry[];
  shopClutter: RuntimeShopClutter[];
  roomThreatById: Array<[number, number]>;
  warnedDangerRooms: number[];
  dangerProtectionArmedRooms: number[];
  activePerkIds: string[];
  activeGambitIds: string[];
  pendingBossRewards: SavedPendingBossRewards | null;
  pendingShopRewards: ShopRewardChoice[] | null;
  shopRewardClaimedFloors: number[];
  combatLuck?: CombatLuckState;
};

export type RuntimeMob = {
  id: string;
  creature: Creature;
  roomId: number;
  isBoss: boolean;
};

export type RuntimeChest = {
  id: string;
  chest: Chest;
  roomId: number;
};

export type RuntimeShopEntry = {
  id: string;
  kind: "item" | "service";
  name: string;
  description: string;
  value: number;
  item: Item | null;
  serviceId: SavedShopServiceId | null;
  sold: boolean;
};

export type RuntimeShopClutter = {
  x: number;
  y: number;
  sprite: number;
};

export type EncodeRunSaveInput = {
  seedPhrase: string;
  seedNumber: number;
  rngState: number;
  nextEntityId: number;
  nextItemId: number;
  floor: number;
  state: RunState;
  stats: RunStats;
  logs: LogEntry[];
  overlay: OverlayState;
  world: WorldMap;
  player: Creature;
  mobs: RuntimeMob[];
  chests: RuntimeChest[];
  currentRoomId: number | null;
  aiAccumMs: number;
  shopStock: RuntimeShopEntry[];
  shopClutter: RuntimeShopClutter[];
  roomThreatById: Map<number, number>;
  warnedDangerRooms: Set<number>;
  dangerProtectionArmedRooms: Set<number>;
  activePerkIds: string[];
  activeGambitIds: string[];
  pendingBossRewards: {
    perks: BuildChoiceDefinition[];
    gambits: BuildChoiceDefinition[];
  } | null;
  pendingShopRewards: ShopRewardChoice[] | null;
  shopRewardClaimedFloors: Set<number>;
  combatLuck: CombatLuckState;
};

export type DecodeRunSaveDependencies = {
  findBuildChoice: (id: string) => BuildChoiceDefinition;
};

export type DecodedRunSaveData = {
  rngState: number;
  nextEntityId: number;
  nextItemId: number;
  floor: number;
  state: RunState;
  stats: RunStats;
  logs: LogEntry[];
  overlay: OverlayState;
  world: WorldMap;
  player: SavedCreature;
  mobs: RuntimeMob[];
  chests: RuntimeChest[];
  currentRoomId: number | null;
  aiAccumMs: number;
  shopStock: RuntimeShopEntry[];
  shopClutter: RuntimeShopClutter[];
  roomThreatById: Array<[number, number]>;
  warnedDangerRooms: number[];
  dangerProtectionArmedRooms: number[];
  activePerks: BuildChoiceDefinition[];
  activeGambits: BuildChoiceDefinition[];
  pendingBossRewards: {
    perks: BuildChoiceDefinition[];
    gambits: BuildChoiceDefinition[];
  } | null;
  pendingShopRewards: ShopRewardChoice[] | null;
  shopRewardClaimedFloors: number[];
  combatLuck: CombatLuckState;
};

const ATTRIBUTE_ORDER: AttributeName[] = [
  "str",
  "dex",
  "con",
  "int",
  "wis",
  "chr",
];
const WIELD_SLOTS: WieldSlot[] = [
  "head",
  "chest",
  "arms",
  "hands",
  "legs",
  "feet",
];

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const value of bytes) {
    binary += String.fromCharCode(value);
  }
  return btoa(binary);
}

function base64ToBytes(input: string): Uint8Array {
  const binary = atob(input);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function clonePos(pos: Position): Position {
  return { x: pos.x, y: pos.y };
}

function turnsRemaining(effect: Buff | Poison, currentTurn: number): number {
  for (
    let turn = currentTurn;
    turn <= currentTurn + effect.lifetime;
    turn += 1
  ) {
    if (effect.hasExpired(turn)) {
      return Math.max(0, turn - currentTurn);
    }
  }
  return 0;
}

function cloneOverlay(overlay: OverlayState): OverlayState {
  if (overlay.type === "battle") {
    return {
      type: "battle",
      mobId: overlay.mobId,
      fallback: clonePos(overlay.fallback),
      roomId: overlay.roomId,
      surpriseProtection: overlay.surpriseProtection,
    };
  }
  if (overlay.type === "chest") {
    return { type: "chest", chestId: overlay.chestId };
  }
  return { type: overlay.type };
}

function serializeCreature(creature: Creature): SavedCreature {
  const wieldpoints: Record<WieldSlot, SerializedItem | null> = {
    head: null,
    chest: null,
    arms: null,
    hands: null,
    legs: null,
    feet: null,
  };

  for (const slot of WIELD_SLOTS) {
    const item = creature.wieldpoints[slot];
    wieldpoints[slot] = item ? serializeItem(item) : null;
  }

  return {
    name: creature.name,
    position: clonePos(creature.position),
    attributes: creature.attributes.toObject(),
    alive: creature.alive,
    hitpoints: creature.hitpoints,
    maxHitpoints: creature.maxHitpoints,
    xp: creature.xp,
    nextLevelXp: creature.nextLevelXp,
    level: creature.level,
    turn: creature.turn,
    gold: creature.gold,
    defenseBase: creature.defenseBase,
    attackBonus: creature.attackBonus,
    defenseBonus: creature.defenseBonus,
    mob: creature.mob,
    inBattle: creature.inBattle,
    damageDealtMultiplier: creature.damageDealtMultiplier,
    damageTakenMultiplier: creature.damageTakenMultiplier,
    hitpointCapMultiplier: creature.hitpointCapMultiplier,
    unspentStatPoints: creature.unspentStatPoints,
    inventoryCapacity: creature.inventory.capacity(),
    inventory: creature.inventory.items().map((item) => serializeItem(item)),
    wieldpoints,
    buffs: creature.buffs.map((buff) => ({
      item: serializeItem(buff),
      turnsRemaining: turnsRemaining(buff, creature.turn),
    })),
    poisons: creature.poisons.map((poison) => ({
      item: serializeItem(poison),
      turnsRemaining: turnsRemaining(poison, creature.turn),
    })),
  };
}

export function hydrateCreatureFromSave(
  target: Creature,
  saved: SavedCreature,
): void {
  target.name = saved.name;
  target.position = clonePos(saved.position);

  for (const attr of ATTRIBUTE_ORDER) {
    const current = target.attributes.get(attr);
    const desired = saved.attributes[attr];
    if (desired !== current) {
      target.attributes.modify(attr, desired - current);
    }
  }

  target.alive = saved.alive;
  target.hitpoints = saved.hitpoints;
  target.maxHitpoints = saved.maxHitpoints;
  target.xp = saved.xp;
  target.nextLevelXp = saved.nextLevelXp;
  target.level = saved.level;
  target.turn = saved.turn;
  target.gold = saved.gold;
  target.defenseBase = saved.defenseBase;
  target.attackBonus = saved.attackBonus;
  target.defenseBonus = saved.defenseBonus;
  target.mob = saved.mob;
  target.inBattle = saved.inBattle;
  target.damageDealtMultiplier = saved.damageDealtMultiplier;
  target.damageTakenMultiplier = saved.damageTakenMultiplier;
  target.hitpointCapMultiplier = saved.hitpointCapMultiplier;
  target.unspentStatPoints = saved.unspentStatPoints;

  target.inventory = new Container(saved.inventoryCapacity);
  for (const serializedItem of saved.inventory) {
    const item = deserializeItem(serializedItem);
    if (!target.inventory.add(item)) {
      throw new Error(`Unable to restore inventory item ${item.id}.`);
    }
  }

  for (const slot of WIELD_SLOTS) {
    const serialized = saved.wieldpoints[slot];
    if (!serialized) {
      target.wieldpoints[slot] = null;
      continue;
    }
    const item = deserializeItem(serialized);
    if (!(item instanceof WieldableItem)) {
      throw new Error(`Invalid wielded item for slot ${slot}.`);
    }
    target.wieldpoints[slot] = item;
  }

  target.buffs = saved.buffs.map((entry) => {
    const item = deserializeItem(entry.item);
    if (!(item instanceof Buff)) {
      throw new Error("Invalid saved buff.");
    }
    item.setExpiry(target.turn + Math.max(0, Math.floor(entry.turnsRemaining)));
    return item;
  });

  target.poisons = saved.poisons.map((entry) => {
    const item = deserializeItem(entry.item);
    if (!(item instanceof Poison)) {
      throw new Error("Invalid saved poison.");
    }
    item.setExpiry(target.turn + Math.max(0, Math.floor(entry.turnsRemaining)));
    return item;
  });

  target.enforceHitpointCap();
}

export function encodeRunSaveData(
  input: EncodeRunSaveInput,
): DungeonRunSaveData {
  return {
    version: 1,
    seedPhrase: input.seedPhrase,
    seedNumber: input.seedNumber,
    rngState: input.rngState,
    nextEntityId: input.nextEntityId,
    nextItemId: input.nextItemId,
    floor: input.floor,
    state: input.state,
    stats: { ...input.stats },
    logs: input.logs.map((entry) => ({ text: entry.text, level: entry.level })),
    overlay: cloneOverlay(input.overlay),
    world: {
      width: input.world.width,
      height: input.world.height,
      rooms: input.world.rooms.map((room) => ({ ...room })),
      cellsBase64: bytesToBase64(input.world.cells),
      exploredBase64: bytesToBase64(input.world.explored),
    },
    player: serializeCreature(input.player),
    mobs: input.mobs.map((mob) => ({
      id: mob.id,
      roomId: mob.roomId,
      isBoss: mob.isBoss,
      creature: serializeCreature(mob.creature),
    })),
    chests: input.chests.map((entry) => ({
      id: entry.id,
      roomId: entry.roomId,
      chest: {
        x: entry.chest.x,
        y: entry.chest.y,
        capacity: entry.chest.capacity(),
        items: entry.chest.items().map((item) => serializeItem(item)),
      },
    })),
    currentRoomId: input.currentRoomId,
    aiAccumMs: input.aiAccumMs,
    shopStock: input.shopStock.map((entry) => ({
      id: entry.id,
      kind: entry.kind,
      name: entry.name,
      description: entry.description,
      value: entry.value,
      sold: entry.sold,
      serviceId: entry.serviceId,
      item: entry.item ? serializeItem(entry.item) : null,
    })),
    shopClutter: input.shopClutter.map((entry) => ({ ...entry })),
    roomThreatById: [...input.roomThreatById.entries()],
    warnedDangerRooms: [...input.warnedDangerRooms],
    dangerProtectionArmedRooms: [...input.dangerProtectionArmedRooms],
    activePerkIds: [...input.activePerkIds],
    activeGambitIds: [...input.activeGambitIds],
    pendingBossRewards: input.pendingBossRewards
      ? {
          perkIds: input.pendingBossRewards.perks.map((choice) => choice.id),
          gambitIds: input.pendingBossRewards.gambits.map(
            (choice) => choice.id,
          ),
        }
      : null,
    pendingShopRewards: input.pendingShopRewards
      ? input.pendingShopRewards.map((choice) => ({ ...choice }))
      : null,
    shopRewardClaimedFloors: [...input.shopRewardClaimedFloors],
    combatLuck: input.combatLuck,
  };
}

export function decodeRunSaveData(
  saved: DungeonRunSaveData,
  deps: DecodeRunSaveDependencies,
): DecodedRunSaveData {
  if (saved.version !== 1) {
    throw new Error(`Unsupported save version: ${saved.version}`);
  }

  const expectedCells = saved.world.width * saved.world.height;
  const worldCells = base64ToBytes(saved.world.cellsBase64);
  const worldExplored = base64ToBytes(saved.world.exploredBase64);
  if (
    worldCells.length !== expectedCells ||
    worldExplored.length !== expectedCells
  ) {
    throw new Error("Save data map payload is malformed.");
  }

  const world = new WorldMap(
    saved.world.width,
    saved.world.height,
    saved.world.rooms.map((room) => ({ ...room })),
    worldCells,
  );
  world.explored.set(worldExplored);

  const mobs = saved.mobs.map((entry) => {
    const creature = new Creature(
      entry.creature.name,
      clonePos(entry.creature.position),
      new AttributeSet(entry.creature.attributes),
    );
    hydrateCreatureFromSave(creature, entry.creature);
    return {
      id: entry.id,
      roomId: entry.roomId,
      isBoss: entry.isBoss,
      creature,
    };
  });

  const chests = saved.chests.map((entry) => {
    const chest = new Chest(entry.chest.x, entry.chest.y, entry.chest.capacity);
    for (const itemData of entry.chest.items) {
      const item = deserializeItem(itemData);
      if (!chest.add(item)) {
        throw new Error(`Unable to restore chest item ${item.id}.`);
      }
    }
    return {
      id: entry.id,
      roomId: entry.roomId,
      chest,
    };
  });

  const shopStock = saved.shopStock.map((entry) => ({
    id: entry.id,
    kind: entry.kind,
    name: entry.name,
    description: entry.description,
    value: entry.value,
    sold: entry.sold,
    serviceId: entry.serviceId,
    item: entry.item ? deserializeItem(entry.item) : null,
  }));

  return {
    rngState: saved.rngState,
    nextEntityId: saved.nextEntityId,
    nextItemId: saved.nextItemId,
    floor: saved.floor,
    state: saved.state,
    stats: { ...saved.stats },
    logs: saved.logs.map((entry) => ({ text: entry.text, level: entry.level })),
    overlay: cloneOverlay(saved.overlay),
    world,
    player: saved.player,
    mobs,
    chests,
    currentRoomId: saved.currentRoomId,
    aiAccumMs: saved.aiAccumMs,
    shopStock,
    shopClutter: saved.shopClutter.map((entry) => ({ ...entry })),
    roomThreatById: [...saved.roomThreatById],
    warnedDangerRooms: [...saved.warnedDangerRooms],
    dangerProtectionArmedRooms: [...saved.dangerProtectionArmedRooms],
    activePerks: saved.activePerkIds.map((id) => deps.findBuildChoice(id)),
    activeGambits: saved.activeGambitIds.map((id) => deps.findBuildChoice(id)),
    pendingBossRewards: saved.pendingBossRewards
      ? {
          perks: saved.pendingBossRewards.perkIds.map((id) =>
            deps.findBuildChoice(id),
          ),
          gambits: saved.pendingBossRewards.gambitIds.map((id) =>
            deps.findBuildChoice(id),
          ),
        }
      : null,
    pendingShopRewards: saved.pendingShopRewards
      ? saved.pendingShopRewards.map((choice) => ({ ...choice }))
      : null,
    shopRewardClaimedFloors: [...saved.shopRewardClaimedFloors],
    combatLuck: saved.combatLuck ?? {
      playerD20History: [],
      playerMissStreak: 0,
    },
  };
}
