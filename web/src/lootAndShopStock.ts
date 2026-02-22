import {
  BANDAGES_GOLD_VALUE,
  BANDAGES_HEAL_HP,
  COLOSSAL_HEALTH_POTION_HEAL_HP,
  COLOSSAL_HEALTH_POTION_GOLD_VALUE,
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
  SHOP_SERVICE_COST_BONUS_POINT,
  SHOP_SERVICE_COST_REMOVE_GAMBIT,
  SHOP_SERVICE_COST_REMOVE_PERK,
} from "./constants";
import { Dice } from "./dice";
import { Armor, InstantEffectItem, type Item, Weapon } from "./items";
import { createArmor, createWeapon, NameGenerator } from "./procgen";
import type { SeededRandom } from "./rng";
import { EN } from "./strings/en";
import type { WieldSlot } from "./types";

export type ShopServiceId = "remove-perk" | "remove-gambit" | "bonus-point";

export type ShopStockEntry = {
  id: string;
  kind: "item" | "service";
  name: string;
  description: string;
  value: number;
  item: Item | null;
  serviceId: ShopServiceId | null;
  sold: boolean;
};

export function makeBandages(): InstantEffectItem {
  const item = new InstantEffectItem(EN.game.itemNames.bandages, BANDAGES_HEAL_HP);
  item.value = BANDAGES_GOLD_VALUE;
  return item;
}

export function makeHealthPotion(): InstantEffectItem {
  const item = new InstantEffectItem(EN.game.itemNames.healthPotion, HEALTH_POTION_HEAL_HP);
  item.value = HEALTH_POTION_GOLD_VALUE;
  return item;
}

export function makeLargePotion(): InstantEffectItem {
  const item = new InstantEffectItem(EN.game.itemNames.largeHealthPotion, LARGE_HEALTH_POTION_HEAL_HP);
  item.value = LARGE_HEALTH_POTION_GOLD_VALUE;
  return item;
}

export function makeHugePotion(): InstantEffectItem {
  const item = new InstantEffectItem(EN.game.itemNames.hugeHealthPotion, HUGE_HEALTH_POTION_HEAL_HP);
  item.value = HUGE_HEALTH_POTION_GOLD_VALUE;
  return item;
}

export function makeColossalPotion(): InstantEffectItem {
  const item = new InstantEffectItem(EN.game.itemNames.colossalHealthPotion, COLOSSAL_HEALTH_POTION_HEAL_HP);
  item.value = COLOSSAL_HEALTH_POTION_GOLD_VALUE;
  return item;
}

export function makeInstaheal(): InstantEffectItem {
  const item = new InstantEffectItem(EN.game.itemNames.instaheal, 1_000_000_000);
  item.value = INSTAHEAL_GOLD_VALUE;
  return item;
}

export function generateItemPools(
  dice: Dice,
  rng: SeededRandom,
  nameGenerator: NameGenerator,
): { weapons: Weapon[]; armors: Armor[] } {
  const weapons: Weapon[] = [];
  const armors: Armor[] = [];

  for (let i = 0; i < ITEM_POOL_GENERATION_COUNT; i += 1) {
    const special = dice.roll() >= ITEM_SPECIAL_ROLL_MIN;
    const valueMultiplier = special ? ITEM_SPECIAL_VALUE_MULTIPLIER : ITEM_DEFAULT_VALUE_MULTIPLIER;

    const mountpoint: WieldSlot = rng.choice(["head", "chest", "arms", "hands", "legs", "feet"]);
    const name = nameGenerator.generateName(mountpoint, special);

    if (mountpoint === "hands") {
      const weapon = createWeapon(
        name,
        dice.roll(ITEM_WEAPON_MAX_DAMAGE_ROLL_MIN, ITEM_WEAPON_MAX_DAMAGE_ROLL_MAX),
        dice.roll(ITEM_WEAPON_CHALLENGE_ROLL_MIN, ITEM_WEAPON_CHALLENGE_ROLL_MAX),
        rng,
      );
      weapon.value = Math.floor(
        (
          (dice.roll(1, ITEM_WEAPON_VALUE_DIE_SIDES) * ITEM_WEAPON_VALUE_DIE_MULTIPLIER)
          + weapon.getAttackBonus()
          + weapon.getDefenseBonus()
        ) * valueMultiplier,
      );
      weapons.push(weapon);
    } else {
      const armor = createArmor(name, mountpoint, dice.roll(ITEM_ARMOR_CHALLENGE_ROLL_MIN, ITEM_ARMOR_CHALLENGE_ROLL_MAX), rng);
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

function makeShopServiceEntries(nextId: (prefix: string) => string): ShopStockEntry[] {
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

export function createShopStock(items: Item[], nextId: (prefix: string) => string): ShopStockEntry[] {
  const serviceEntries = makeShopServiceEntries(nextId);
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
