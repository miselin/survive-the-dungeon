import {
  findBuildChoice,
  GAMBIT_POOL,
  PERK_POOL,
  type BuildChoice,
  type BuildChoiceDefinition,
  type BuildChoiceKind,
} from "./buildChoices";
import {
  AI_WANDER_MOVE_ROLL_MIN,
  AI_WANDER_ROLL_MAX,
  AI_MOVE_MS,
  BANDAGES_HEAL_HP,
  BOSS_CON_BONUS_BASE,
  BOSS_DEX_BONUS_BASE,
  BOSS_DEX_BONUS_FLOOR_DIVISOR,
  BOSS_CHALLENGE_LEVEL,
  BOSS_HP_SCALE_PER_FLOOR,
  BOSS_STR_BONUS_BASE,
  BANDAGES_GOLD_VALUE,
  CHEST_ARMOR_ROLL_MIN,
  CHEST_GOLD_DICE,
  CHEST_GOLD_ROLL_MIN,
  CHEST_HIGH_TIER_LEVEL,
  CHEST_HUGE_POTION_ROLL_MIN,
  CHEST_LARGE_OR_HEALTH_ROLL_MIN,
  CHEST_MID_TIER_LEVEL,
  CHEST_TIERED_POTION_ROLL_MIN,
  CHEST_WEAPON_ROLL_MIN,
  COLOSSAL_HEALTH_POTION_HEAL_HP,
  COLOSSAL_HEALTH_POTION_GOLD_VALUE,
  CREATURE_XP_MULTIPLIER,
  DANGER_WARNING_LEVEL_GAP,
  FLOOR_CHEST_BASE,
  FLOOR_CHEST_CAPACITY,
  FLOOR_CHEST_PER_FLOOR,
  FLOOR_DEPTH_SCALE_PER_FLOOR,
  FLOOR_MOB_BASE,
  FLOOR_MOB_PER_FLOOR,
  FLOOR_SCALE_MINIMUM,
  FLOOR_TRANSITION_HEAL_MINIMUM,
  FLOOR_TRANSITION_HEAL_RATIO,
  HEALTH_POTION_HEAL_HP,
  HEALTH_POTION_GOLD_VALUE,
  HUGE_HEALTH_POTION_HEAL_HP,
  HUGE_HEALTH_POTION_GOLD_VALUE,
  INSTAHEAL_GOLD_VALUE,
  ITEM_ARMOR_CHALLENGE_ROLL_MAX,
  ITEM_ARMOR_CHALLENGE_ROLL_MIN,
  ITEM_ARMOR_VALUE_ATTACK_WEIGHT,
  ITEM_ARMOR_VALUE_DEFENSE_WEIGHT,
  ITEM_DEFAULT_VALUE_MULTIPLIER,
  ITEM_POOL_GENERATION_COUNT,
  ITEM_SPECIAL_ROLL_MIN,
  ITEM_SPECIAL_VALUE_MULTIPLIER,
  ITEM_WEAPON_CHALLENGE_ROLL_MAX,
  ITEM_WEAPON_CHALLENGE_ROLL_MIN,
  ITEM_WEAPON_MAX_DAMAGE_ROLL_MAX,
  ITEM_WEAPON_MAX_DAMAGE_ROLL_MIN,
  ITEM_WEAPON_VALUE_DIE_MULTIPLIER,
  ITEM_WEAPON_VALUE_DIE_SIDES,
  LARGE_HEALTH_POTION_HEAL_HP,
  LARGE_HEALTH_POTION_GOLD_VALUE,
  LOG_LIMIT,
  MAXIMUM_CHALLENGE_LEVEL,
  PLAYER_CONSTITUTION_BONUS,
  PLAYER_START_X,
  PLAYER_START_Y,
  SHOP_CLUTTER_DENSITY_DIVISOR,
  SHOP_DISCOUNT_FOR_CHARISMA,
  SHOP_REWARD_FALLBACK_GOLD,
  SHOP_REWARD_HEAL_FALLBACK_RATIO,
  SHOP_SERVICE_COST_BONUS_POINT,
  SHOP_SERVICE_COST_REMOVE_GAMBIT,
  SHOP_SERVICE_COST_REMOVE_PERK,
  SHOP_TOP_ARMORS,
  SHOP_TOP_WEAPONS,
  STARTING_ATTRS,
  STARTING_BANDAGE_COUNT,
  STARTING_WEAPON_ATTACK_BONUS,
  STARTING_WEAPON_CRITICAL_MULTIPLIER,
  STARTING_WEAPON_CRITICAL_RANGE,
  STARTING_WEAPON_DAMAGE_DICE,
  STARTING_WEAPON_DEFENSE_BONUS,
  SURPRISE_PROTECTION_ATTACK_MULTIPLIER,
  SURPRISE_PROTECTION_FLEE_BONUS,
} from "./constants";
import { AttributeSet, type AttributeName, type AttributesRecord } from "./attributes";
import { Combat, type PlayerAction } from "./combat";
import { Creature } from "./creature";
import { Dice } from "./dice";
import {
  Armor,
  Buff,
  Chest,
  Container,
  deserializeItem,
  Gold,
  InstantEffectItem,
  type Item,
  type SerializedItem,
  serializeItem,
  setNextItemId,
  getNextItemId,
  Poison,
  Weapon,
  WieldableItem,
} from "./items";
import { generateMap, randomPositionsInRoom, roomCenter, WorldMap } from "./mapgen";
import { createArmor, createWeapon, creatureAtLevel, NameGenerator } from "./procgen";
import { makeSeedPhrase, SeededRandom } from "./rng";
import { EN } from "./strings/en";
import { ROOM_BOSS, ROOM_SHOP, ROOM_START } from "./types";
import type { LogEntry, Position, Room, WieldSlot } from "./types";
import type { CombatLuckState, CombatResult } from "./combat";

export type { BuildChoice, BuildChoiceKind } from "./buildChoices";

type MobEntity = {
  id: string;
  creature: Creature;
  roomId: number;
  isBoss: boolean;
};

type ChestEntity = {
  id: string;
  chest: Chest;
  roomId: number;
};

type InventoryRenderable = {
  item: Item;
  action: "equip" | "use" | "none";
};

type ShopEntry = {
  id: string;
  kind: "item" | "service";
  name: string;
  description: string;
  value: number;
  item: Item | null;
  serviceId: ShopServiceId | null;
  sold: boolean;
};

type ShopServiceId = "remove-perk" | "remove-gambit" | "bonus-point";

type ShopClutter = {
  x: number;
  y: number;
  sprite: number;
};

export type LevelUpChoice = {
  attr: AttributeName;
  label: string;
  description: string;
  value: number;
  modifier: number;
};

export type ShopRewardChoice = {
  id: "bonus-point" | "remove-perk" | "remove-gambit";
  title: string;
  description: string;
};

export type OverlayState =
  | { type: "none" }
  | { type: "battle"; mobId: string; fallback: Position; roomId: number | null; surpriseProtection: boolean }
  | { type: "chest"; chestId: string }
  | { type: "inventory" }
  | { type: "shop" }
  | { type: "level-up" }
  | { type: "boss-reward" }
  | { type: "shop-reward" };

export type RunState = "playing" | "dead" | "won";

export type RunStats = {
  vanquished: number;
  goldEarned: number;
  goldSpent: number;
  goldLeftBehind: number;
  inventoryValue: number;
  xpGained: number;
  level: number;
  floorReached: number;
};

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

type SavedShopEntry = {
  id: string;
  kind: "item" | "service";
  name: string;
  description: string;
  value: number;
  sold: boolean;
  serviceId: ShopServiceId | null;
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
  shopClutter: ShopClutter[];
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

const ATTRIBUTE_ORDER: AttributeName[] = ["str", "dex", "con", "int", "wis", "chr"];
export const LEVEL_UP_ATTRIBUTES = ["str", "dex", "con", "chr"] as const;
export type LevelUpAttribute = (typeof LEVEL_UP_ATTRIBUTES)[number];
const LEVEL_UP_ATTRIBUTE_SET = new Set<AttributeName>(LEVEL_UP_ATTRIBUTES);
const WIELD_SLOTS: WieldSlot[] = ["head", "chest", "arms", "hands", "legs", "feet"];

const ATTRIBUTE_LABELS = EN.game.attributeLabels;
const ATTRIBUTE_DESCRIPTIONS = EN.game.attributeDescriptions;

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

function turnsRemaining(effect: Buff | Poison, currentTurn: number): number {
  for (let turn = currentTurn; turn <= currentTurn + effect.lifetime; turn += 1) {
    if (effect.hasExpired(turn)) {
      return Math.max(0, turn - currentTurn);
    }
  }
  return 0;
}

function posEq(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

function posKey(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

function clonePos(pos: Position): Position {
  return { x: pos.x, y: pos.y };
}

function chestPos(chest: Chest): Position {
  return { x: chest.x, y: chest.y };
}

let entityId = 1;
function nextId(prefix: string): string {
  const id = entityId;
  entityId += 1;
  return `${prefix}-${id}`;
}

function makeBandages(): InstantEffectItem {
  const item = new InstantEffectItem(EN.game.itemNames.bandages, BANDAGES_HEAL_HP);
  item.value = BANDAGES_GOLD_VALUE;
  return item;
}

function makeHealthPotion(): InstantEffectItem {
  const item = new InstantEffectItem(EN.game.itemNames.healthPotion, HEALTH_POTION_HEAL_HP);
  item.value = HEALTH_POTION_GOLD_VALUE;
  return item;
}

function makeLargePotion(): InstantEffectItem {
  const item = new InstantEffectItem(EN.game.itemNames.largeHealthPotion, LARGE_HEALTH_POTION_HEAL_HP);
  item.value = LARGE_HEALTH_POTION_GOLD_VALUE;
  return item;
}

function makeHugePotion(): InstantEffectItem {
  const item = new InstantEffectItem(EN.game.itemNames.hugeHealthPotion, HUGE_HEALTH_POTION_HEAL_HP);
  item.value = HUGE_HEALTH_POTION_GOLD_VALUE;
  return item;
}

function makeColossalPotion(): InstantEffectItem {
  const item = new InstantEffectItem(EN.game.itemNames.colossalHealthPotion, COLOSSAL_HEALTH_POTION_HEAL_HP);
  item.value = COLOSSAL_HEALTH_POTION_GOLD_VALUE;
  return item;
}

function makeInstaheal(): InstantEffectItem {
  const item = new InstantEffectItem(EN.game.itemNames.instaheal, 1_000_000_000);
  item.value = INSTAHEAL_GOLD_VALUE;
  return item;
}

export class DungeonRun {
  readonly rng: SeededRandom;

  readonly dice: Dice;

  readonly combat: Combat;

  world: WorldMap;

  readonly player: Creature;

  readonly seedPhrase: string;

  readonly seedNumber: number;

  readonly stats: RunStats;

  readonly logs: LogEntry[] = [];

  overlay: OverlayState = { type: "none" };

  state: RunState = "playing";

  floor = 1;

  mobs: MobEntity[] = [];

  chests: ChestEntity[] = [];

  currentRoom: Room | null = null;

  private aiAccumMs = 0;

  private readonly nameGenerator: NameGenerator;

  private shopStock: ShopEntry[] = [];

  shopClutter: ShopClutter[] = [];

  private readonly roomThreatById = new Map<number, number>();

  private readonly warnedDangerRooms = new Set<number>();

  private readonly dangerProtectionArmedRooms = new Set<number>();

  private readonly activePerks: BuildChoiceDefinition[] = [];

  private readonly activeGambits: BuildChoiceDefinition[] = [];

  private pendingBossRewards: { perks: BuildChoiceDefinition[]; gambits: BuildChoiceDefinition[] } | null = null;

  private pendingShopRewards: ShopRewardChoice[] | null = null;

  private readonly shopRewardClaimedFloors = new Set<number>();

  constructor(seedInput: string) {
    this.seedPhrase = makeSeedPhrase(seedInput);
    this.rng = new SeededRandom(this.seedPhrase);
    this.seedNumber = this.rng.seed;
    this.dice = new Dice(this.rng);
    this.combat = new Combat(this.dice);
    this.world = generateMap(this.rng);
    this.nameGenerator = new NameGenerator(this.rng);

    this.player = new Creature(
      EN.game.names.player,
      { x: PLAYER_START_X, y: PLAYER_START_Y },
      new AttributeSet(STARTING_ATTRS),
    );
    this.player.maxHitpoints += this.player.attributes.modifier("con") * PLAYER_CONSTITUTION_BONUS;
    this.player.hitpoints = this.player.maxHitpoints;

    this.stats = {
      vanquished: 0,
      goldEarned: 0,
      goldSpent: 0,
      goldLeftBehind: 0,
      inventoryValue: 0,
      xpGained: 0,
      level: 1,
      floorReached: 1,
    };

    this.preparePlayerGear();
    this.buildFloor(true);

    for (const intro of EN.game.introLogs) {
      this.log(intro);
    }
  }

  private preparePlayerGear(): void {
    const fists = new Weapon(
      EN.game.startingGear.fists,
      STARTING_WEAPON_CRITICAL_RANGE,
      STARTING_WEAPON_CRITICAL_MULTIPLIER,
      STARTING_WEAPON_ATTACK_BONUS,
      STARTING_WEAPON_DEFENSE_BONUS,
      STARTING_WEAPON_DAMAGE_DICE,
    );
    const cloth = new Armor("chest", EN.game.startingGear.clothArmor, 0, 1);
    const boots = new Armor("feet", EN.game.startingGear.leatherBoots, 0, 1);

    this.player.wield("hands", fists);
    this.player.wield("chest", cloth);
    this.player.wield("feet", boots);

    for (let i = 0; i < STARTING_BANDAGE_COUNT; i += 1) {
      this.player.give(makeBandages());
    }
    this.player.give(makeHealthPotion());
  }

  private generateItemPools(): { weapons: Weapon[]; armors: Armor[] } {
    const weapons: Weapon[] = [];
    const armors: Armor[] = [];

    for (let i = 0; i < ITEM_POOL_GENERATION_COUNT; i += 1) {
      const special = this.dice.roll() >= ITEM_SPECIAL_ROLL_MIN;
      const valueMultiplier = special ? ITEM_SPECIAL_VALUE_MULTIPLIER : ITEM_DEFAULT_VALUE_MULTIPLIER;

      const mountpoint: WieldSlot = this.rng.choice(["head", "chest", "arms", "hands", "legs", "feet"]);
      const name = this.nameGenerator.generateName(mountpoint, special);

      if (mountpoint === "hands") {
        const weapon = createWeapon(
          name,
          this.dice.roll(ITEM_WEAPON_MAX_DAMAGE_ROLL_MIN, ITEM_WEAPON_MAX_DAMAGE_ROLL_MAX),
          this.dice.roll(ITEM_WEAPON_CHALLENGE_ROLL_MIN, ITEM_WEAPON_CHALLENGE_ROLL_MAX),
          this.rng,
        );
        weapon.value = Math.floor(
          (
            (this.dice.roll(1, ITEM_WEAPON_VALUE_DIE_SIDES) * ITEM_WEAPON_VALUE_DIE_MULTIPLIER)
            + weapon.getAttackBonus()
            + weapon.getDefenseBonus()
          ) * valueMultiplier,
        );
        weapons.push(weapon);
      } else {
        const armor = createArmor(name, mountpoint, this.dice.roll(ITEM_ARMOR_CHALLENGE_ROLL_MIN, ITEM_ARMOR_CHALLENGE_ROLL_MAX), this.rng);
        armor.value = Math.floor(
          (
            (armor.getAttackBonus() * ITEM_ARMOR_VALUE_ATTACK_WEIGHT)
            + (armor.getDefenseBonus() * ITEM_ARMOR_VALUE_DEFENSE_WEIGHT)
          ) * valueMultiplier,
        );
        armors.push(armor);
      }
    }

    weapons.sort((a, b) => b.value - a.value);
    armors.sort((a, b) => b.value - a.value);

    return { weapons, armors };
  }

  private makeShopServiceEntries(): ShopEntry[] {
    const services: Array<{ id: ShopServiceId; name: string; description: string; value: number }> = [
      {
        id: "bonus-point",
        name: EN.game.shop.services.bonusPoint.name,
        description: EN.game.shop.services.bonusPoint.description,
        value: SHOP_SERVICE_COST_BONUS_POINT,
      },
      {
        id: "remove-perk",
        name: EN.game.shop.services.removePerk.name,
        description: EN.game.shop.services.removePerk.description,
        value: SHOP_SERVICE_COST_REMOVE_PERK,
      },
      {
        id: "remove-gambit",
        name: EN.game.shop.services.removeGambit.name,
        description: EN.game.shop.services.removeGambit.description,
        value: SHOP_SERVICE_COST_REMOVE_GAMBIT,
      },
    ];

    return services.map((service) => ({
      id: nextId("shop-service"),
      kind: "service",
      name: service.name,
      description: service.description,
      value: service.value,
      item: null,
      serviceId: service.id,
      sold: false,
    }));
  }

  private createShopStock(items: Item[]): ShopEntry[] {
    const serviceEntries = this.makeShopServiceEntries();
    const itemEntries = items.map((item) => ({
      id: item.id,
      kind: "item" as const,
      name: item.name,
      description: item.describe(),
      value: item.value,
      item,
      serviceId: null,
      sold: false,
    }));
    return [...serviceEntries, ...itemEntries];
  }

  private buildFloor(initial = false): void {
    this.world = generateMap(this.rng);

    this.mobs = [];
    this.chests = [];
    this.shopStock = [];
    this.shopClutter = [];

    this.roomThreatById.clear();
    this.warnedDangerRooms.clear();
    this.dangerProtectionArmedRooms.clear();

    this.pendingBossRewards = null;
    this.pendingShopRewards = null;

    this.populateDungeon();

    const startingRoom = this.world.rooms.find((room) => (room.attrs & ROOM_START) === ROOM_START) ?? this.world.rooms[0];
    this.player.position = roomCenter(startingRoom);
    this.currentRoom = this.world.roomAt(this.player.position);

    this.world.updateFov(this.player.position);
    this.aiAccumMs = 0;

    if (!initial) {
      this.log(EN.game.logs.descendFloor(this.floor), "success");
    }
  }

  private populateDungeon(): void {
    const pools = this.generateItemPools();

    const startingRoom = this.world.rooms[0];
    const bossRoom = this.world.rooms.find((room) => (room.attrs & ROOM_BOSS) === ROOM_BOSS)
      ?? this.world.rooms[this.world.rooms.length - 1];
    const startY = roomCenter(startingRoom).y;
    const bossY = roomCenter(bossRoom).y;
    const yScaleSpan = Math.max(1, bossY - startY);

    const consumablesForShop: InstantEffectItem[] = [
      makeBandages(),
      makeHealthPotion(),
      makeLargePotion(),
      makeHugePotion(),
      makeColossalPotion(),
      makeInstaheal(),
    ];

    const shopItems: Item[] = [
      ...consumablesForShop,
      ...pools.weapons.slice(0, SHOP_TOP_WEAPONS),
      ...pools.armors.slice(0, SHOP_TOP_ARMORS),
    ];
    this.shopStock = this.createShopStock(shopItems);

    for (const room of this.world.rooms) {
      const centerY = roomCenter(room).y;
      const yScale = Math.max(0, Math.min(1, (centerY - startY) / yScaleSpan));

      const isStart = (room.attrs & ROOM_START) === ROOM_START;
      const isBoss = (room.attrs & ROOM_BOSS) === ROOM_BOSS;
      const isShop = (room.attrs & ROOM_SHOP) === ROOM_SHOP;

      const floorOffset = Math.max(0, this.floor - 1);

      let challengeLevel = floorOffset + Math.floor(yScale * MAXIMUM_CHALLENGE_LEVEL);
      if (isBoss) {
        challengeLevel = BOSS_CHALLENGE_LEVEL + floorOffset;
      }
      if (isStart || isShop) {
        challengeLevel = 0;
      }
      this.roomThreatById.set(room.id, challengeLevel);

      if (isShop) {
        const roomSquares = room.w * room.h;
        const clutterCount = Math.max(1, Math.ceil(roomSquares / SHOP_CLUTTER_DENSITY_DIVISOR));
        const clutterPositions = randomPositionsInRoom(room, this.rng, clutterCount);
        const sprites = [88, 89, 90, 91, 92, 93, 94, 95];
        for (const pos of clutterPositions) {
          this.shopClutter.push({
            x: pos.x,
            y: pos.y,
            sprite: this.rng.choice(sprites),
          });
        }
        continue;
      }

      const scaled = Math.max(FLOOR_SCALE_MINIMUM, yScale + (this.floor * FLOOR_DEPTH_SCALE_PER_FLOOR));

      let mobCount = 0;
      if (isBoss) {
        mobCount = 1;
      } else if (!isStart) {
        mobCount = this.dice.roll(1, Math.max(1, Math.ceil((FLOOR_MOB_BASE + (this.floor * FLOOR_MOB_PER_FLOOR)) * scaled)));
      }

      const mobPositions = randomPositionsInRoom(room, this.rng, mobCount, [], 0);

      const chestCount = this.dice.roll(
        1,
        Math.max(1, Math.ceil((FLOOR_CHEST_BASE + (this.floor * FLOOR_CHEST_PER_FLOOR)) * scaled)),
      );
      const chestPositions = randomPositionsInRoom(room, this.rng, chestCount, mobPositions, 1);

      for (const pos of mobPositions) {
        const mob = creatureAtLevel(challengeLevel, this.nameGenerator, this.rng);
        if (isBoss) {
          mob.name = EN.game.names.dungeonBoss;
          mob.attributes.modify("str", BOSS_STR_BONUS_BASE + floorOffset);
          mob.attributes.modify("dex", BOSS_DEX_BONUS_BASE + Math.floor(floorOffset / BOSS_DEX_BONUS_FLOOR_DIVISOR));
          mob.attributes.modify("con", BOSS_CON_BONUS_BASE + floorOffset);
          mob.maxHitpoints = Math.max(1, Math.floor(mob.maxHitpoints * (1 + (floorOffset * BOSS_HP_SCALE_PER_FLOOR))));
          mob.hitpoints = mob.maxHitpoints;
        }

        mob.mob = true;
        mob.position = clonePos(pos);
        mob.rollMobGold(this.dice);

        this.mobs.push({
          id: nextId("mob"),
          creature: mob,
          roomId: room.id,
          isBoss,
        });
      }

      for (const pos of chestPositions) {
        const chest = new Chest(pos.x, pos.y, FLOOR_CHEST_CAPACITY);

        if (this.dice.roll(1, 20) >= CHEST_WEAPON_ROLL_MIN && pools.weapons.length > 0) {
          chest.add(pools.weapons.shift() as Weapon);
        }
        if (this.dice.roll(1, 20) >= CHEST_ARMOR_ROLL_MIN && pools.armors.length > 0) {
          chest.add(pools.armors.shift() as Armor);
        }
        if (this.dice.roll(1, 20) >= CHEST_GOLD_ROLL_MIN) {
          chest.add(new Gold(this.dice.rollNamed(CHEST_GOLD_DICE)));
        }
        if (this.dice.roll(1, 20) >= CHEST_HUGE_POTION_ROLL_MIN) {
          chest.add(makeLargePotion());
        } else if (this.dice.roll(1, 20) >= CHEST_LARGE_OR_HEALTH_ROLL_MIN) {
          chest.add(challengeLevel >= CHEST_HIGH_TIER_LEVEL ? makeLargePotion() : makeHealthPotion());
        } else if (this.dice.roll(1, 20) >= CHEST_TIERED_POTION_ROLL_MIN) {
          if (challengeLevel >= CHEST_HIGH_TIER_LEVEL) {
            chest.add(makeLargePotion());
          } else if (challengeLevel >= CHEST_MID_TIER_LEVEL) {
            chest.add(makeHealthPotion());
          } else {
            chest.add(makeBandages());
          }
        }

        if (!chest.empty()) {
          this.chests.push({ id: nextId("chest"), chest, roomId: room.id });
        }
      }
    }
  }

  private asPublicBuildChoice(choice: BuildChoiceDefinition): BuildChoice {
    return {
      id: choice.id,
      name: choice.name,
      description: choice.description,
      kind: choice.kind,
    };
  }

  private randomBuildChoices(kind: BuildChoiceKind, count: number): BuildChoiceDefinition[] {
    const pool = kind === "perk" ? PERK_POOL : GAMBIT_POOL;
    const active = new Set((kind === "perk" ? this.activePerks : this.activeGambits).map((choice) => choice.id));

    let available = pool.filter((choice) => !active.has(choice.id));
    if (available.length < count) {
      available = [...pool];
    }

    return this.rng.shuffle([...available]).slice(0, Math.min(count, available.length));
  }

  private applyBuildChoiceEffect(choice: BuildChoiceDefinition): void {
    const previousCap = this.player.currentMaxHitpoints();

    this.player.attackBonus += choice.attackBonus ?? 0;
    this.player.defenseBonus += choice.defenseBonus ?? 0;

    if (choice.attributes) {
      for (const attr of ATTRIBUTE_ORDER) {
        const delta = choice.attributes[attr] ?? 0;
        if (delta === 0) {
          continue;
        }
        this.player.attributes.modify(attr, delta);
        if (attr === "con") {
          this.player.maxHitpoints = Math.max(1, this.player.maxHitpoints + (delta * PLAYER_CONSTITUTION_BONUS));
        }
      }
    }

    if (choice.maxHitpoints) {
      this.player.maxHitpoints = Math.max(1, this.player.maxHitpoints + choice.maxHitpoints);
    }

    this.player.damageDealtMultiplier *= choice.damageDealtMultiplier ?? 1;
    this.player.damageTakenMultiplier *= choice.damageTakenMultiplier ?? 1;
    this.player.hitpointCapMultiplier *= choice.hitpointCapMultiplier ?? 1;

    const newCap = this.player.currentMaxHitpoints();
    if (newCap > previousCap) {
      this.player.hitpoints += newCap - previousCap;
    }
    this.player.enforceHitpointCap();
  }

  private removeBuildChoiceEffect(choice: BuildChoiceDefinition): void {
    this.player.attackBonus -= choice.attackBonus ?? 0;
    this.player.defenseBonus -= choice.defenseBonus ?? 0;

    if (choice.attributes) {
      for (const attr of ATTRIBUTE_ORDER) {
        const delta = choice.attributes[attr] ?? 0;
        if (delta === 0) {
          continue;
        }
        this.player.attributes.modify(attr, -delta);
        if (attr === "con") {
          this.player.maxHitpoints = Math.max(1, this.player.maxHitpoints - (delta * PLAYER_CONSTITUTION_BONUS));
        }
      }
    }

    if (choice.maxHitpoints) {
      this.player.maxHitpoints = Math.max(1, this.player.maxHitpoints - choice.maxHitpoints);
    }

    const dealt = choice.damageDealtMultiplier ?? 1;
    const taken = choice.damageTakenMultiplier ?? 1;
    const cap = choice.hitpointCapMultiplier ?? 1;

    this.player.damageDealtMultiplier /= dealt;
    this.player.damageTakenMultiplier /= taken;
    this.player.hitpointCapMultiplier /= cap;

    this.player.enforceHitpointCap();
  }

  private removeLatestChoice(kind: BuildChoiceKind): BuildChoiceDefinition | null {
    const list = kind === "perk" ? this.activePerks : this.activeGambits;
    const removed = list.pop() ?? null;
    if (!removed) {
      return null;
    }
    this.removeBuildChoiceEffect(removed);
    return removed;
  }

  private openBossReward(): void {
    this.pendingBossRewards = {
      perks: this.randomBuildChoices("perk", 3),
      gambits: this.randomBuildChoices("gambit", 3),
    };
    this.overlay = { type: "boss-reward" };
  }

  private prepareShopReward(): void {
    const latestPerk = this.activePerks[this.activePerks.length - 1] ?? null;
    const latestGambit = this.activeGambits[this.activeGambits.length - 1] ?? null;

    this.pendingShopRewards = [
      {
        id: "bonus-point",
        title: EN.game.shop.rewards.bonusPoint.title,
        description: EN.game.shop.rewards.bonusPoint.description,
      },
      {
        id: "remove-perk",
        title: EN.game.shop.rewards.removePerk.title,
        description: latestPerk
          ? EN.game.shop.rewards.removePerk.description(latestPerk.name)
          : EN.game.shop.rewards.removePerk.fallback(),
      },
      {
        id: "remove-gambit",
        title: EN.game.shop.rewards.removeGambit.title,
        description: latestGambit
          ? EN.game.shop.rewards.removeGambit.description(latestGambit.name)
          : EN.game.shop.rewards.removeGambit.fallback(),
      },
    ];
    this.overlay = { type: "shop-reward" };
  }

  private maybeOpenAutoOverlay(): void {
    if (this.state !== "playing") {
      return;
    }
    if (this.overlay.type !== "none") {
      return;
    }
    if (this.player.unspentStatPoints > 0) {
      this.overlay = { type: "level-up" };
    }
  }

  private advanceToNextFloor(): void {
    this.floor += 1;
    this.stats.floorReached = this.floor;

    const before = this.player.hitpoints;
    const heal = Math.max(FLOOR_TRANSITION_HEAL_MINIMUM, Math.floor(this.player.currentMaxHitpoints() * FLOOR_TRANSITION_HEAL_RATIO));
    this.player.hitpoints = Math.min(this.player.currentMaxHitpoints(), this.player.hitpoints + heal);

    this.player.inBattle = false;
    this.overlay = { type: "none" };

    this.buildFloor(false);

    const healed = this.player.hitpoints - before;
    if (healed > 0) {
      this.log(EN.game.logs.breathRecover(healed), "success");
    }

    this.maybeOpenAutoOverlay();
  }

  private log(text: string, level: LogEntry["level"] = "info"): void {
    this.logs.push({ text, level });
    while (this.logs.length > LOG_LIMIT) {
      this.logs.shift();
    }
  }

  private roomThreat(room: Room | null): number {
    if (!room) {
      return 0;
    }
    return this.roomThreatById.get(room.id) ?? 0;
  }

  private warnIfDangerousRoom(room: Room): void {
    if ((room.attrs & (ROOM_START | ROOM_SHOP | ROOM_BOSS)) !== 0) {
      return;
    }

    const threat = this.roomThreat(room);
    if (threat < this.player.level + DANGER_WARNING_LEVEL_GAP) {
      return;
    }
    if (this.warnedDangerRooms.has(room.id)) {
      return;
    }

    this.warnedDangerRooms.add(room.id);
    this.dangerProtectionArmedRooms.add(room.id);
    this.log(EN.game.logs.dangerWarning(threat), "warn");
  }

  private startBattle(mobId: string, fallback: Position, roomId: number | null): void {
    const surpriseProtection = roomId !== null && this.dangerProtectionArmedRooms.has(roomId);
    if (surpriseProtection) {
      this.dangerProtectionArmedRooms.delete(roomId);
    }

    this.overlay = {
      type: "battle",
      mobId,
      fallback: clonePos(fallback),
      roomId,
      surpriseProtection,
    };
  }

  private findRetreatPosition(battleRoomId: number | null, fallback: Position): Position {
    if (battleRoomId === null) {
      return clonePos(fallback);
    }

    const occupied = new Set<string>();
    for (const mob of this.mobs) {
      if (mob.creature.alive) {
        occupied.add(posKey(mob.creature.position));
      }
    }
    for (const chest of this.chests) {
      if (!chest.chest.empty()) {
        occupied.add(posKey(chestPos(chest.chest)));
      }
    }
    occupied.delete(posKey(fallback));

    const frontier: Position[] = [clonePos(fallback)];
    const seen = new Set<string>([posKey(fallback)]);
    let cursor = 0;

    while (cursor < frontier.length) {
      const current = frontier[cursor];
      cursor += 1;

      const currentRoom = this.world.roomAt(current);
      const isOutsideRoom = !currentRoom || currentRoom.id !== battleRoomId;
      const currentKey = posKey(current);
      if (isOutsideRoom && !occupied.has(currentKey)) {
        return clonePos(current);
      }

      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const next = { x: current.x + dx, y: current.y + dy };
        if (!this.world.inBounds(next.x, next.y) || !this.world.isPassable(next.x, next.y)) {
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

    return clonePos(fallback);
  }

  canOpenShop(): boolean {
    const room = this.world.roomAt(this.player.position);
    return room !== null && (room.attrs & ROOM_SHOP) === ROOM_SHOP;
  }

  openInventory(): void {
    if (this.state !== "playing" || this.overlay.type !== "none") {
      return;
    }
    this.overlay = { type: "inventory" };
  }

  openShop(): void {
    if (this.state !== "playing" || !this.canOpenShop() || this.overlay.type !== "none") {
      return;
    }
    this.overlay = { type: "shop" };
  }

  closeOverlay(): void {
    if (this.overlay.type === "level-up" || this.overlay.type === "boss-reward" || this.overlay.type === "shop-reward") {
      return;
    }
    this.overlay = { type: "none" };
    this.maybeOpenAutoOverlay();
  }

  movePlayer(dx: number, dy: number): void {
    if (this.state !== "playing") {
      return;
    }
    if (this.overlay.type !== "none") {
      return;
    }

    const next = { x: this.player.position.x + dx, y: this.player.position.y + dy };
    if (!this.world.inBounds(next.x, next.y) || !this.world.isPassable(next.x, next.y)) {
      return;
    }

    const targetMob = this.mobs.find((mob) => mob.creature.alive && posEq(mob.creature.position, next));
    if (targetMob) {
      const roomId = this.world.roomAt(targetMob.creature.position)?.id ?? null;
      this.startBattle(targetMob.id, this.player.position, roomId);
      this.player.inBattle = true;
      targetMob.creature.inBattle = true;
      this.log(EN.game.logs.engageEnemy(targetMob.creature.name), "warn");
      return;
    }

    const targetChest = this.chests.find((entry) => posEq(chestPos(entry.chest), next) && !entry.chest.empty());
    if (targetChest) {
      this.overlay = { type: "chest", chestId: targetChest.id };
      this.log(EN.game.logs.openChest, "info");
      return;
    }

    this.player.position = next;

    const prevRoom = this.currentRoom;
    this.currentRoom = this.world.roomAt(this.player.position);
    if (this.currentRoom !== prevRoom && this.currentRoom !== null) {
      if ((this.currentRoom.attrs & ROOM_BOSS) === ROOM_BOSS) {
        this.log(EN.game.logs.enterBossLair, "warn");
      } else if ((this.currentRoom.attrs & ROOM_SHOP) === ROOM_SHOP) {
        this.log(EN.game.logs.enterShopRoom, "success");

        if (!this.shopRewardClaimedFloors.has(this.floor)) {
          this.shopRewardClaimedFloors.add(this.floor);
          this.log(EN.game.logs.shopkeeperTuneup, "success");
          this.prepareShopReward();
        }
      }
      this.warnIfDangerousRoom(this.currentRoom);
    }

    this.world.updateFov(this.player.position);
  }

  tick(dtMs: number): void {
    if (this.state !== "playing") {
      return;
    }

    if (this.overlay.type === "battle") {
      return;
    }

    this.aiAccumMs += dtMs;
    if (this.aiAccumMs < AI_MOVE_MS) {
      return;
    }

    this.aiAccumMs -= AI_MOVE_MS;
    this.runAiStep();
    this.world.updateFov(this.player.position);
  }

  private runAiStep(): void {
    if (this.overlay.type !== "none") {
      return;
    }

    const occupied = new Set<string>();
    occupied.add(posKey(this.player.position));

    for (const chest of this.chests) {
      if (!chest.chest.empty()) {
        occupied.add(posKey(chestPos(chest.chest)));
      }
    }

    for (const mob of this.mobs) {
      if (!mob.creature.alive) {
        continue;
      }
      occupied.add(posKey(mob.creature.position));
    }

    for (const mob of this.mobs) {
      const creature = mob.creature;
      if (!creature.alive || creature.inBattle) {
        continue;
      }

      const playerRoom = this.world.roomAt(this.player.position);
      const mobRoom = this.world.roomAt(creature.position);

      if (playerRoom && mobRoom && playerRoom.id === mobRoom.id) {
        const blocked = new Set(occupied);
        blocked.delete(posKey(creature.position));
        const path = this.world.pathTo(creature.position, this.player.position, blocked);

        if (path.length === 1) {
          const roomId = playerRoom?.id ?? mobRoom?.id ?? null;
          this.startBattle(mob.id, this.player.position, roomId);
          this.player.inBattle = true;
          creature.inBattle = true;
          this.log(EN.game.logs.enemyAttacks(creature.name), "warn");
          return;
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
        continue;
      }

      if (this.rng.int(1, AI_WANDER_ROLL_MAX) < AI_WANDER_MOVE_ROLL_MIN) {
        continue;
      }

      const steps = this.rng.shuffle<Position>([
        { x: creature.position.x + 1, y: creature.position.y },
        { x: creature.position.x - 1, y: creature.position.y },
        { x: creature.position.x, y: creature.position.y + 1 },
        { x: creature.position.x, y: creature.position.y - 1 },
      ]);
      for (const next of steps) {
        if (!this.world.inBounds(next.x, next.y) || !this.world.isPassable(next.x, next.y)) {
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
  }

  performCombat(action: PlayerAction): CombatResult | null {
    if (this.overlay.type !== "battle" || this.state !== "playing") {
      return null;
    }

    const battle = this.overlay;
    const mob = this.mobs.find((entry) => entry.id === battle.mobId);
    if (!mob || !mob.creature.alive) {
      this.overlay = { type: "none" };
      this.maybeOpenAutoOverlay();
      return null;
    }

    const openingProtection = battle.surpriseProtection;
    if (openingProtection) {
      this.log(EN.game.logs.dangerSenseProtected, "success");
      battle.surpriseProtection = false;
    }

    const result = this.combat.turn(this.player, mob.creature, action, {
      enemyAttackMultiplier: openingProtection ? SURPRISE_PROTECTION_ATTACK_MULTIPLIER : 1,
      fleeBonus: openingProtection ? SURPRISE_PROTECTION_FLEE_BONUS : 0,
    });
    for (const entry of result.logs) {
      this.log(entry.text, entry.level);
    }

    if (result.fled) {
      this.player.position = this.findRetreatPosition(battle.roomId, battle.fallback);
      this.player.inBattle = false;
      mob.creature.inBattle = false;
      this.overlay = { type: "none" };
      this.currentRoom = this.world.roomAt(this.player.position);
      this.log(EN.game.logs.retreat, "info");
      this.world.updateFov(this.player.position);
      this.maybeOpenAutoOverlay();
      return result;
    }

    if (!mob.creature.alive) {
      this.stats.vanquished += 1;

      const gainedXp = Math.floor(mob.creature.maxHitpoints * CREATURE_XP_MULTIPLIER);
      const gain = this.player.giveXp(gainedXp);
      this.stats.xpGained += gainedXp;
      if (gain.leveled > 0) {
        this.log(EN.game.logs.welcomeLevel(this.player.level, this.player.unspentStatPoints), "success");
      }

      const lootGold = mob.creature.gold;
      this.player.give(new Gold(lootGold));
      this.stats.goldEarned += lootGold;
      this.log(EN.game.logs.lootKillRewards(lootGold, gainedXp), "success");

      this.player.inBattle = false;
      mob.creature.inBattle = false;
      this.overlay = { type: "none" };

      const bossDefeated = mob.isBoss;
      this.mobs = this.mobs.filter((entry) => entry.creature.alive);

      if (bossDefeated) {
        this.log(EN.game.logs.bossDownChooseReward, "success");
        this.openBossReward();
      } else if (this.mobs.length > 0) {
        this.log(EN.game.logs.enemiesRemain(this.mobs.length, this.floor), "info");
      }
    }

    if (!this.player.alive) {
      this.state = "dead";
      this.finalizeStats();
      return result;
    }

    this.maybeOpenAutoOverlay();
    return result;
  }

  private finalizeStats(): void {
    this.stats.inventoryValue =
      this.player.inventory.items().reduce((acc, item) => acc + item.value, 0)
      + Object.values(this.player.wieldpoints)
        .filter((item): item is WieldableItem => item instanceof WieldableItem)
        .reduce((acc, item) => acc + item.value, 0);

    this.stats.goldLeftBehind = this.chests.reduce((acc, entry) => {
      let total = acc;
      for (const item of entry.chest.items()) {
        if (item instanceof Gold) {
          total += item.amount;
        }
      }
      return total;
    }, 0);

    this.stats.level = this.player.level;
    this.stats.floorReached = this.floor;
  }

  getBattleEnemy(): MobEntity | null {
    if (this.overlay.type !== "battle") {
      return null;
    }
    const overlay = this.overlay;
    return this.mobs.find((entry) => entry.id === overlay.mobId) ?? null;
  }

  getChest(): ChestEntity | null {
    if (this.overlay.type !== "chest") {
      return null;
    }
    const overlay = this.overlay;
    return this.chests.find((entry) => entry.id === overlay.chestId) ?? null;
  }

  getRoomThreat(room: Room | null): number {
    return this.roomThreat(room);
  }

  getCurrentRoomThreat(): number {
    return this.roomThreat(this.currentRoom);
  }

  currentBuild(): { perks: BuildChoice[]; gambits: BuildChoice[] } {
    return {
      perks: this.activePerks.map((choice) => this.asPublicBuildChoice(choice)),
      gambits: this.activeGambits.map((choice) => this.asPublicBuildChoice(choice)),
    };
  }

  getBossRewards(): { perks: BuildChoice[]; gambits: BuildChoice[] } | null {
    if (!this.pendingBossRewards) {
      return null;
    }

    return {
      perks: this.pendingBossRewards.perks.map((choice) => this.asPublicBuildChoice(choice)),
      gambits: this.pendingBossRewards.gambits.map((choice) => this.asPublicBuildChoice(choice)),
    };
  }

  chooseBossReward(kind: BuildChoiceKind | "none", choiceId?: string): void {
    if (this.overlay.type !== "boss-reward" || !this.pendingBossRewards) {
      return;
    }

    if (kind === "none") {
      this.log(EN.game.logs.descendWithoutModifier, "info");
      this.pendingBossRewards = null;
      this.advanceToNextFloor();
      return;
    }

    const source = kind === "perk" ? this.pendingBossRewards.perks : this.pendingBossRewards.gambits;
    const picked = source.find((choice) => choice.id === choiceId);
    if (!picked) {
      return;
    }

    this.applyBuildChoiceEffect(picked);
    if (kind === "perk") {
      this.activePerks.push(picked);
    } else {
      this.activeGambits.push(picked);
    }

    this.log(
      EN.game.logs.selectedBuildChoice(picked.kind === "perk" ? EN.game.labels.perk : EN.game.labels.gambit, picked.name),
      "success",
    );
    this.pendingBossRewards = null;
    this.advanceToNextFloor();
  }

  getShopRewardChoices(): ShopRewardChoice[] | null {
    if (!this.pendingShopRewards) {
      return null;
    }
    return [...this.pendingShopRewards];
  }

  claimShopReward(choiceId: ShopRewardChoice["id"]): void {
    if (this.overlay.type !== "shop-reward" || !this.pendingShopRewards) {
      return;
    }

    if (choiceId === "bonus-point") {
      this.player.grantAttributePoint(1);
      this.log(EN.game.logs.shopRewardBonusPoint, "success");
    } else if (choiceId === "remove-perk") {
      const removed = this.removeLatestChoice("perk");
      if (removed) {
        this.log(EN.game.logs.shopRewardRemovedPerk(removed.name), "success");
      } else {
        this.player.give(new Gold(SHOP_REWARD_FALLBACK_GOLD));
        this.stats.goldEarned += SHOP_REWARD_FALLBACK_GOLD;
        this.log(EN.game.logs.shopRewardPerkFallbackGold(), "success");
      }
    } else if (choiceId === "remove-gambit") {
      const removed = this.removeLatestChoice("gambit");
      if (removed) {
        this.log(EN.game.logs.shopRewardRemovedGambit(removed.name), "success");
      } else {
        const heal = Math.max(1, Math.floor(this.player.currentMaxHitpoints() * SHOP_REWARD_HEAL_FALLBACK_RATIO));
        const before = this.player.hitpoints;
        this.player.hitpoints = Math.min(this.player.currentMaxHitpoints(), this.player.hitpoints + heal);
        this.log(EN.game.logs.shopRewardGambitFallbackHeal(this.player.hitpoints - before), "success");
      }
    }

    this.pendingShopRewards = null;
    this.overlay = { type: "none" };
    this.maybeOpenAutoOverlay();
  }

  levelUpChoices(): LevelUpChoice[] {
    return LEVEL_UP_ATTRIBUTES.map((attr) => ({
      attr,
      label: ATTRIBUTE_LABELS[attr],
      description: ATTRIBUTE_DESCRIPTIONS[attr],
      value: this.player.attributes.get(attr),
      modifier: this.player.attributes.modifier(attr),
    }));
  }

  allocateLevelUp(attr: LevelUpAttribute): void {
    if (this.overlay.type !== "level-up") {
      return;
    }
    if (!LEVEL_UP_ATTRIBUTE_SET.has(attr)) {
      return;
    }

    if (!this.player.spendAttributePoint(attr)) {
      return;
    }

    this.log(EN.game.logs.levelUpSpent(ATTRIBUTE_LABELS[attr]), "success");

    if (this.player.unspentStatPoints > 0) {
      this.overlay = { type: "level-up" };
    } else {
      this.overlay = { type: "none" };
    }
    this.maybeOpenAutoOverlay();
  }

  inventoryItems(): InventoryRenderable[] {
    return this.player.inventory.items().map((item) => {
      if (item instanceof WieldableItem) {
        return { item, action: "equip" };
      }
      if (item instanceof InstantEffectItem) {
        return { item, action: "use" };
      }
      return { item, action: "none" };
    });
  }

  equipItem(itemId: string): void {
    const item = this.player.inventory.items().find((entry) => entry.id === itemId);
    if (!(item instanceof WieldableItem)) {
      return;
    }

    const slot = item.wieldsAt();
    const current = this.player.wieldpoints[slot];
    this.player.inventory.remove(item);
    this.player.wield(slot, item);

    if (current && current.name !== EN.game.startingGear.fists) {
      this.player.inventory.add(current);
    }

    this.log(EN.game.logs.equippedItem(item.name, slot), "success");
  }

  useInventoryItem(itemId: string): void {
    const item = this.player.inventory.items().find((entry) => entry.id === itemId);
    if (!(item instanceof InstantEffectItem)) {
      return;
    }

    this.player.inventory.remove(item);
    const healed = this.player.applyInstantItem(item);
    this.log(EN.game.logs.inventoryItemRestored(item.name, healed), "success");
  }

  destroyInventoryItem(itemId: string): void {
    const item = this.player.inventory.items().find((entry) => entry.id === itemId);
    if (!item) {
      return;
    }
    this.player.inventory.remove(item);
    this.log(EN.game.logs.destroyedItem(item.name), "warn");
  }

  lootItem(itemId: string): void {
    const chestEntity = this.getChest();
    if (!chestEntity) {
      return;
    }

    const item = chestEntity.chest.items().find((entry) => entry.id === itemId);
    if (!item) {
      return;
    }

    if (item instanceof Gold) {
      this.player.give(item);
      this.stats.goldEarned += item.amount;
      chestEntity.chest.remove(item);
      this.log(EN.game.logs.lootedGold(item.amount), "success");
      return;
    }

    if (this.player.inventory.add(item)) {
      chestEntity.chest.remove(item);
      this.log(EN.game.logs.lootedItem(item.name), "success");
    } else {
      this.log(EN.game.logs.inventoryFull, "warn");
    }
  }

  lootAll(): void {
    const chestEntity = this.getChest();
    if (!chestEntity) {
      return;
    }

    const items = [...chestEntity.chest.items()];
    let filled = false;

    for (const item of items) {
      if (item instanceof Gold) {
        this.player.give(item);
        this.stats.goldEarned += item.amount;
        chestEntity.chest.remove(item);
        continue;
      }

      if (this.player.inventory.add(item)) {
        chestEntity.chest.remove(item);
      } else {
        filled = true;
      }
    }

    if (filled) {
      this.log(EN.game.logs.inventoryFullChestLeftovers, "warn");
    } else {
      this.log(EN.game.logs.lootedAllChest, "success");
    }
  }

  shopEntries(): ShopEntry[] {
    return this.shopStock.map((entry) => {
      if (entry.kind === "service" && entry.serviceId !== null) {
        if (entry.serviceId === "remove-perk") {
          const latest = this.activePerks[this.activePerks.length - 1];
          return {
            ...entry,
            description: latest
              ? EN.game.shop.descriptions.removePerk(latest.name)
              : EN.game.shop.descriptions.removePerkNone,
          };
        }

        if (entry.serviceId === "remove-gambit") {
          const latest = this.activeGambits[this.activeGambits.length - 1];
          return {
            ...entry,
            description: latest
              ? EN.game.shop.descriptions.removeGambit(latest.name)
              : EN.game.shop.descriptions.removeGambitNone,
          };
        }
      }

      return entry;
    });
  }

  shopEntryCost(entry: ShopEntry): number {
    const discount = SHOP_DISCOUNT_FOR_CHARISMA * this.player.attributes.modifier("chr");
    return Math.max(1, Math.floor(entry.value - (entry.value * discount)));
  }

  buyShopEntry(entryId: string): void {
    const entry = this.shopStock.find((candidate) => candidate.id === entryId);
    if (!entry || entry.sold) {
      return;
    }

    const cost = this.shopEntryCost(entry);
    if (this.player.gold < cost) {
      this.log(EN.game.logs.notEnoughGold, "warn");
      return;
    }

    if (entry.kind === "service") {
      let applied = false;

      if (entry.serviceId === "bonus-point") {
        this.player.grantAttributePoint(1);
        this.log(EN.game.logs.boughtRespecToken, "success");
        applied = true;
      } else if (entry.serviceId === "remove-perk") {
        const removed = this.removeLatestChoice("perk");
        if (!removed) {
          this.log(EN.game.logs.noActivePerkToRemove, "warn");
          return;
        }
        this.log(EN.game.logs.removedPerk(removed.name), "success");
        applied = true;
      } else if (entry.serviceId === "remove-gambit") {
        const removed = this.removeLatestChoice("gambit");
        if (!removed) {
          this.log(EN.game.logs.noActiveGambitToRemove, "warn");
          return;
        }
        this.log(EN.game.logs.removedGambit(removed.name), "success");
        applied = true;
      }

      if (!applied) {
        return;
      }

      this.player.spendGold(cost);
      this.stats.goldSpent += cost;
      entry.sold = true;
      this.log(EN.game.logs.purchasedEntry(entry.name, cost), "success");
      return;
    }

    const item = entry.item;
    if (!item || item instanceof Gold) {
      this.log(EN.game.logs.goldCannotBePurchased, "warn");
      return;
    }

    if (!this.player.inventory.add(item)) {
      this.log(EN.game.logs.inventoryFull, "warn");
      return;
    }

    this.player.spendGold(cost);
    this.stats.goldSpent += cost;
    entry.sold = true;
    this.log(EN.game.logs.purchasedEntry(entry.name, cost), "success");
  }

  private static cloneOverlay(overlay: OverlayState): OverlayState {
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

  private serializeCreature(creature: Creature): SavedCreature {
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

  private static hydrateCreature(target: Creature, saved: SavedCreature): void {
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

  toSaveData(): DungeonRunSaveData {
    return {
      version: 1,
      seedPhrase: this.seedPhrase,
      seedNumber: this.seedNumber,
      rngState: this.rng.getState(),
      nextEntityId: entityId,
      nextItemId: getNextItemId(),
      floor: this.floor,
      state: this.state,
      stats: { ...this.stats },
      logs: this.logs.map((entry) => ({ text: entry.text, level: entry.level })),
      overlay: DungeonRun.cloneOverlay(this.overlay),
      world: {
        width: this.world.width,
        height: this.world.height,
        rooms: this.world.rooms.map((room) => ({ ...room })),
        cellsBase64: bytesToBase64(this.world.cells),
        exploredBase64: bytesToBase64(this.world.explored),
      },
      player: this.serializeCreature(this.player),
      mobs: this.mobs.map((mob) => ({
        id: mob.id,
        roomId: mob.roomId,
        isBoss: mob.isBoss,
        creature: this.serializeCreature(mob.creature),
      })),
      chests: this.chests.map((entry) => ({
        id: entry.id,
        roomId: entry.roomId,
        chest: {
          x: entry.chest.x,
          y: entry.chest.y,
          capacity: entry.chest.capacity(),
          items: entry.chest.items().map((item) => serializeItem(item)),
        },
      })),
      currentRoomId: this.currentRoom?.id ?? null,
      aiAccumMs: this.aiAccumMs,
      shopStock: this.shopStock.map((entry) => ({
        id: entry.id,
        kind: entry.kind,
        name: entry.name,
        description: entry.description,
        value: entry.value,
        sold: entry.sold,
        serviceId: entry.serviceId,
        item: entry.item ? serializeItem(entry.item) : null,
      })),
      shopClutter: this.shopClutter.map((entry) => ({ ...entry })),
      roomThreatById: [...this.roomThreatById.entries()],
      warnedDangerRooms: [...this.warnedDangerRooms],
      dangerProtectionArmedRooms: [...this.dangerProtectionArmedRooms],
      activePerkIds: this.activePerks.map((choice) => choice.id),
      activeGambitIds: this.activeGambits.map((choice) => choice.id),
      pendingBossRewards: this.pendingBossRewards
        ? {
          perkIds: this.pendingBossRewards.perks.map((choice) => choice.id),
          gambitIds: this.pendingBossRewards.gambits.map((choice) => choice.id),
        }
        : null,
      pendingShopRewards: this.pendingShopRewards
        ? this.pendingShopRewards.map((choice) => ({ ...choice }))
        : null,
      shopRewardClaimedFloors: [...this.shopRewardClaimedFloors],
      combatLuck: this.combat.snapshotLuckState(),
    };
  }

  static fromSaveData(saved: DungeonRunSaveData): DungeonRun {
    if (saved.version !== 1) {
      throw new Error(`Unsupported save version: ${saved.version}`);
    }

    const run = new DungeonRun(saved.seedPhrase);

    const expectedCells = saved.world.width * saved.world.height;
    const worldCells = base64ToBytes(saved.world.cellsBase64);
    const worldExplored = base64ToBytes(saved.world.exploredBase64);
    if (worldCells.length !== expectedCells || worldExplored.length !== expectedCells) {
      throw new Error("Save data map payload is malformed.");
    }

    run.world = new WorldMap(
      saved.world.width,
      saved.world.height,
      saved.world.rooms.map((room) => ({ ...room })),
      worldCells,
    );
    run.world.explored.set(worldExplored);

    DungeonRun.hydrateCreature(run.player, saved.player);
    run.world.updateFov(run.player.position);

    run.floor = saved.floor;
    run.state = saved.state;
    run.overlay = DungeonRun.cloneOverlay(saved.overlay);
    run.aiAccumMs = saved.aiAccumMs;

    Object.assign(run.stats, saved.stats);
    run.logs.splice(0, run.logs.length, ...saved.logs.map((entry) => ({ text: entry.text, level: entry.level })));

    run.mobs = saved.mobs.map((entry) => {
      const creature = new Creature(entry.creature.name, clonePos(entry.creature.position), new AttributeSet(entry.creature.attributes));
      DungeonRun.hydrateCreature(creature, entry.creature);
      return {
        id: entry.id,
        roomId: entry.roomId,
        isBoss: entry.isBoss,
        creature,
      };
    });

    run.chests = saved.chests.map((entry) => {
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

    run.shopStock = saved.shopStock.map((entry) => ({
      id: entry.id,
      kind: entry.kind,
      name: entry.name,
      description: entry.description,
      value: entry.value,
      sold: entry.sold,
      serviceId: entry.serviceId,
      item: entry.item ? deserializeItem(entry.item) : null,
    }));

    run.shopClutter = saved.shopClutter.map((entry) => ({ ...entry }));

    run.roomThreatById.clear();
    for (const [roomId, threat] of saved.roomThreatById) {
      run.roomThreatById.set(roomId, threat);
    }

    run.warnedDangerRooms.clear();
    for (const roomId of saved.warnedDangerRooms) {
      run.warnedDangerRooms.add(roomId);
    }

    run.dangerProtectionArmedRooms.clear();
    for (const roomId of saved.dangerProtectionArmedRooms) {
      run.dangerProtectionArmedRooms.add(roomId);
    }

    run.activePerks.splice(0, run.activePerks.length, ...saved.activePerkIds.map((id) => findBuildChoice(id)));
    run.activeGambits.splice(0, run.activeGambits.length, ...saved.activeGambitIds.map((id) => findBuildChoice(id)));

    run.pendingBossRewards = saved.pendingBossRewards
      ? {
        perks: saved.pendingBossRewards.perkIds.map((id) => findBuildChoice(id)),
        gambits: saved.pendingBossRewards.gambitIds.map((id) => findBuildChoice(id)),
      }
      : null;

    run.pendingShopRewards = saved.pendingShopRewards
      ? saved.pendingShopRewards.map((choice) => ({ ...choice }))
      : null;

    run.shopRewardClaimedFloors.clear();
    for (const floor of saved.shopRewardClaimedFloors) {
      run.shopRewardClaimedFloors.add(floor);
    }

    run.combat.restoreLuckState(saved.combatLuck ?? { playerD20History: [], playerMissStreak: 0 });

    run.currentRoom = saved.currentRoomId === null
      ? null
      : run.world.rooms.find((room) => room.id === saved.currentRoomId) ?? run.world.roomAt(run.player.position);

    run.rng.setState(saved.rngState);
    entityId = Math.max(1, Math.floor(saved.nextEntityId));
    setNextItemId(saved.nextItemId);

    return run;
  }
}
