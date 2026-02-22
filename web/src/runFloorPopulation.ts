import {
  BOSS_CHALLENGE_LEVEL,
  BOSS_CON_BONUS_BASE,
  BOSS_DEX_BONUS_BASE,
  BOSS_DEX_BONUS_FLOOR_DIVISOR,
  BOSS_HP_SCALE_PER_FLOOR,
  BOSS_STR_BONUS_BASE,
  CHEST_ARMOR_ROLL_MIN,
  CHEST_GOLD_DICE,
  CHEST_GOLD_ROLL_MIN,
  CHEST_HIGH_TIER_LEVEL,
  CHEST_HUGE_POTION_ROLL_MIN,
  CHEST_LARGE_OR_HEALTH_ROLL_MIN,
  CHEST_MID_TIER_LEVEL,
  CHEST_TIERED_POTION_ROLL_MIN,
  CHEST_WEAPON_ROLL_MIN,
  FLOOR_CHEST_BASE,
  FLOOR_CHEST_CAPACITY,
  FLOOR_CHEST_PER_FLOOR,
  FLOOR_DEPTH_SCALE_PER_FLOOR,
  FLOOR_MOB_BASE,
  FLOOR_MOB_PER_FLOOR,
  FLOOR_SCALE_MINIMUM,
  MAXIMUM_CHALLENGE_LEVEL,
  SHOP_CLUTTER_DENSITY_DIVISOR,
  SHOP_TOP_ARMORS,
  SHOP_TOP_WEAPONS,
} from "./constants";
import { Dice } from "./dice";
import type { Creature } from "./creature";
import { Armor, Chest, Gold, InstantEffectItem, type Item, Weapon } from "./items";
import {
  createShopStock,
  generateItemPools,
  makeBandages,
  makeColossalPotion,
  makeHealthPotion,
  makeHugePotion,
  makeInstaheal,
  makeLargePotion,
  type ShopStockEntry,
} from "./lootAndShopStock";
import { randomPositionsInRoom, roomCenter, type WorldMap } from "./mapgen";
import { creatureAtLevel, NameGenerator } from "./procgen";
import type { SeededRandom } from "./rng";
import { EN } from "./strings/en";
import { ROOM_BOSS, ROOM_SHOP, ROOM_START } from "./types";

export type MobEntity = {
  id: string;
  creature: Creature;
  roomId: number;
  isBoss: boolean;
};

export type ChestEntity = {
  id: string;
  chest: Chest;
  roomId: number;
};

export type ShopClutter = {
  x: number;
  y: number;
  sprite: number;
};

type PopulateDungeonOptions = {
  world: WorldMap;
  floor: number;
  dice: Dice;
  rng: SeededRandom;
  nameGenerator: NameGenerator;
  nextId: (prefix: string) => string;
};

type PopulateDungeonResult = {
  mobs: MobEntity[];
  chests: ChestEntity[];
  shopStock: ShopStockEntry[];
  shopClutter: ShopClutter[];
  roomThreatById: Map<number, number>;
};

export function populateDungeon(options: PopulateDungeonOptions): PopulateDungeonResult {
  const pools = generateItemPools(options.dice, options.rng, options.nameGenerator);
  const mobs: MobEntity[] = [];
  const chests: ChestEntity[] = [];
  const shopClutter: ShopClutter[] = [];
  const roomThreatById = new Map<number, number>();

  const startingRoom = options.world.rooms[0];
  const bossRoom = options.world.rooms.find((room) => (room.attrs & ROOM_BOSS) === ROOM_BOSS)
    ?? options.world.rooms[options.world.rooms.length - 1];
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
  const shopStock = createShopStock(shopItems, options.nextId);

  for (const room of options.world.rooms) {
    const centerY = roomCenter(room).y;
    const yScale = Math.max(0, Math.min(1, (centerY - startY) / yScaleSpan));

    const isStart = (room.attrs & ROOM_START) === ROOM_START;
    const isBoss = (room.attrs & ROOM_BOSS) === ROOM_BOSS;
    const isShop = (room.attrs & ROOM_SHOP) === ROOM_SHOP;

    const floorOffset = Math.max(0, options.floor - 1);

    let challengeLevel = floorOffset + Math.floor(yScale * MAXIMUM_CHALLENGE_LEVEL);
    if (isBoss) {
      challengeLevel = BOSS_CHALLENGE_LEVEL + floorOffset;
    }
    if (isStart || isShop) {
      challengeLevel = 0;
    }
    roomThreatById.set(room.id, challengeLevel);

    if (isShop) {
      const roomSquares = room.w * room.h;
      const clutterCount = Math.max(1, Math.ceil(roomSquares / SHOP_CLUTTER_DENSITY_DIVISOR));
      const clutterPositions = randomPositionsInRoom(room, options.rng, clutterCount);
      const sprites = [88, 89, 90, 91, 92, 93, 94, 95];
      for (const pos of clutterPositions) {
        shopClutter.push({
          x: pos.x,
          y: pos.y,
          sprite: options.rng.choice(sprites),
        });
      }
      continue;
    }

    const scaled = Math.max(FLOOR_SCALE_MINIMUM, yScale + (options.floor * FLOOR_DEPTH_SCALE_PER_FLOOR));

    let mobCount = 0;
    if (isBoss) {
      mobCount = 1;
    } else if (!isStart) {
      mobCount = options.dice.roll(1, Math.max(1, Math.ceil((FLOOR_MOB_BASE + (options.floor * FLOOR_MOB_PER_FLOOR)) * scaled)));
    }

    const mobPositions = randomPositionsInRoom(room, options.rng, mobCount, [], 0);

    const chestCount = options.dice.roll(
      1,
      Math.max(1, Math.ceil((FLOOR_CHEST_BASE + (options.floor * FLOOR_CHEST_PER_FLOOR)) * scaled)),
    );
    const chestPositions = randomPositionsInRoom(room, options.rng, chestCount, mobPositions, 1);

    for (const pos of mobPositions) {
      const mob = creatureAtLevel(challengeLevel, options.nameGenerator, options.rng);
      if (isBoss) {
        mob.name = EN.game.names.dungeonBoss;
        mob.attributes.modify("str", BOSS_STR_BONUS_BASE + floorOffset);
        mob.attributes.modify("dex", BOSS_DEX_BONUS_BASE + Math.floor(floorOffset / BOSS_DEX_BONUS_FLOOR_DIVISOR));
        mob.attributes.modify("con", BOSS_CON_BONUS_BASE + floorOffset);
        mob.maxHitpoints = Math.max(1, Math.floor(mob.maxHitpoints * (1 + (floorOffset * BOSS_HP_SCALE_PER_FLOOR))));
        mob.hitpoints = mob.maxHitpoints;
      }

      mob.mob = true;
      mob.position = { x: pos.x, y: pos.y };
      mob.rollMobGold(options.dice);

      mobs.push({
        id: options.nextId("mob"),
        creature: mob,
        roomId: room.id,
        isBoss,
      });
    }

    for (const pos of chestPositions) {
      const chest = new Chest(pos.x, pos.y, FLOOR_CHEST_CAPACITY);

      if (options.dice.roll(1, 20) >= CHEST_WEAPON_ROLL_MIN && pools.weapons.length > 0) {
        chest.add(pools.weapons.shift() as Weapon);
      }
      if (options.dice.roll(1, 20) >= CHEST_ARMOR_ROLL_MIN && pools.armors.length > 0) {
        chest.add(pools.armors.shift() as Armor);
      }
      if (options.dice.roll(1, 20) >= CHEST_GOLD_ROLL_MIN) {
        chest.add(new Gold(options.dice.rollNamed(CHEST_GOLD_DICE)));
      }
      if (options.dice.roll(1, 20) >= CHEST_HUGE_POTION_ROLL_MIN) {
        chest.add(makeLargePotion());
      } else if (options.dice.roll(1, 20) >= CHEST_LARGE_OR_HEALTH_ROLL_MIN) {
        chest.add(challengeLevel >= CHEST_HIGH_TIER_LEVEL ? makeLargePotion() : makeHealthPotion());
      } else if (options.dice.roll(1, 20) >= CHEST_TIERED_POTION_ROLL_MIN) {
        if (challengeLevel >= CHEST_HIGH_TIER_LEVEL) {
          chest.add(makeLargePotion());
        } else if (challengeLevel >= CHEST_MID_TIER_LEVEL) {
          chest.add(makeHealthPotion());
        } else {
          chest.add(makeBandages());
        }
      }

      if (!chest.empty()) {
        chests.push({ id: options.nextId("chest"), chest, roomId: room.id });
      }
    }
  }

  return {
    mobs,
    chests,
    shopStock,
    shopClutter,
    roomThreatById,
  };
}
