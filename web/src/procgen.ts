import {
  CHALLENGE_LEVEL_SCALE_UP_FACTOR,
  CREATURE_BASE_CON,
  CREATURE_BASE_DEX,
  CREATURE_BASE_DEFENSE_BONUS,
  CREATURE_BASE_ATTACK_BONUS,
  CREATURE_BASELINE_CON,
  CREATURE_BASELINE_DEX,
  CREATURE_BASELINE_STR,
  CREATURE_BASE_STR,
  CREATURE_MAX_DAMAGE_AT_LEVEL_1,
  CREATURE_MAX_HP_AT_LEVEL_1,
  CREATURE_MIN_HP_AT_LEVEL_1,
  ITEM_ARMOR_DEFENSE_BASE_MIN,
  ITEM_ARMOR_DEFENSE_CHALLENGE_BONUS,
  ITEM_WEAPON_FLAT_BONUS_BASE,
  ITEM_WEAPON_FLAT_BONUS_CHALLENGE_DIVISOR,
  ITEM_WEAPON_FLAT_BONUS_RANDOM_MAX,
  NAME_GENERATION_FALLBACK_MAX_ID,
  NAME_GENERATION_MAX_ATTEMPTS,
  PLAYER_CRIT_MAXIMUM_MULTIPLIER,
  PLAYER_CRIT_MINIMUM_MULTIPLIER,
  PLAYER_CRIT_MINIMUM_ROLL,
  WEAPON_CRIT_MAXIMUM_ROLL,
  WEAPON_DAMAGE_FACE_MAX,
  WEAPON_DAMAGE_FACE_MIN,
} from "./constants";
import { AttributeSet } from "./attributes";
import { Armor, Weapon } from "./items";
import { Creature } from "./creature";
import { SeededRandom } from "./rng";
import type { WieldSlot } from "./types";

const NAME_PARTS: Record<WieldSlot, string[]> = {
  head: ["Helmet", "Cap", "Mask"],
  chest: ["Chestplate", "Shirt", "Vest"],
  arms: ["Gauntlets", "Sleeves", "Vambraces"],
  hands: ["Sword", "Dagger", "Club", "Mace", "Spear"],
  legs: ["Greaves", "Leggings", "Pants"],
  feet: ["Boots", "Shoes", "Sandals"],
};

const ADJECTIVES = [
  "ancient",
  "rusted",
  "vicious",
  "sturdy",
  "ornate",
  "ashen",
  "scarred",
  "silent",
  "grim",
  "hollow",
  "tempered",
  "radiant",
];

const ADVERBS = [
  "eerily",
  "violently",
  "surprisingly",
  "quietly",
  "wildly",
  "ominously",
];

export class NameGenerator {
  private readonly seen = new Set<string>();

  constructor(private readonly rng: SeededRandom) {}

  generateName(slot: WieldSlot, special = false): string {
    const options = NAME_PARTS[slot];
    for (
      let attempt = 0;
      attempt < NAME_GENERATION_MAX_ATTEMPTS;
      attempt += 1
    ) {
      const noun = this.rng.choice(options);
      const adjective = this.rng.choice(ADJECTIVES);
      const value = special
        ? `The ${this.rng.choice(ADVERBS)} ${adjective} ${noun}`
        : `The ${adjective} ${noun}`;

      if (this.seen.has(value)) {
        continue;
      }
      this.seen.add(value);
      return value;
    }

    const fallback = `${this.rng.choice(ADJECTIVES)} ${this.rng.choice(options)} ${Math.floor(this.rng.next() * NAME_GENERATION_FALLBACK_MAX_ID)}`;
    this.seen.add(fallback);
    return fallback;
  }
}

export function createWeapon(
  name: string,
  maxDamage: number,
  challengeLevel: number,
  rng: SeededRandom,
): Weapon {
  const damage = rng.int(
    Math.max(1, Math.floor(maxDamage / 2)),
    Math.max(2, maxDamage),
  );
  const faces = Math.max(
    WEAPON_DAMAGE_FACE_MIN,
    Math.min(WEAPON_DAMAGE_FACE_MAX, damage),
  );
  const count = Math.max(1, Math.floor(damage / faces));
  const flatBonus = Math.max(
    ITEM_WEAPON_FLAT_BONUS_BASE,
    ITEM_WEAPON_FLAT_BONUS_BASE +
      Math.floor(challengeLevel / ITEM_WEAPON_FLAT_BONUS_CHALLENGE_DIVISOR) +
      rng.int(0, ITEM_WEAPON_FLAT_BONUS_RANDOM_MAX),
  );

  const critRange = rng.int(PLAYER_CRIT_MINIMUM_ROLL, WEAPON_CRIT_MAXIMUM_ROLL);
  const critMult = rng.int(
    PLAYER_CRIT_MINIMUM_MULTIPLIER,
    PLAYER_CRIT_MAXIMUM_MULTIPLIER,
  );

  return new Weapon(
    name,
    critRange,
    critMult,
    challengeLevel + 1,
    0,
    `${count}d${faces} +${flatBonus}`,
  );
}

export function createArmor(
  name: string,
  slot: WieldSlot,
  challengeLevel: number,
  rng: SeededRandom,
): Armor {
  return new Armor(
    slot,
    name,
    challengeLevel,
    rng.int(
      ITEM_ARMOR_DEFENSE_BASE_MIN,
      challengeLevel + ITEM_ARMOR_DEFENSE_CHALLENGE_BONUS,
    ),
  );
}

export function creatureAtLevel(
  challengeLevel: number,
  names: NameGenerator,
  rng: SeededRandom,
): Creature {
  let maxDamage = CREATURE_MAX_DAMAGE_AT_LEVEL_1;
  let minHp = CREATURE_MIN_HP_AT_LEVEL_1;
  let maxHp = CREATURE_MAX_HP_AT_LEVEL_1;

  for (let i = 0; i < challengeLevel; i += 1) {
    maxDamage = Math.ceil(maxDamage * CHALLENGE_LEVEL_SCALE_UP_FACTOR);
    maxHp = Math.ceil(maxHp * CHALLENGE_LEVEL_SCALE_UP_FACTOR);
    minHp = Math.ceil(minHp * CHALLENGE_LEVEL_SCALE_UP_FACTOR);
  }

  const creature = new Creature(
    "Goblin",
    { x: 0, y: 0 },
    new AttributeSet({
      str: CREATURE_BASELINE_STR,
      dex: CREATURE_BASELINE_DEX,
      con: CREATURE_BASELINE_CON,
      int: 8,
      wis: 8,
      chr: 8,
    }),
  );
  creature.attributes.modify("str", CREATURE_BASE_STR);
  creature.attributes.modify("dex", CREATURE_BASE_DEX);
  creature.attributes.modify("con", CREATURE_BASE_CON);
  creature.attackBonus = CREATURE_BASE_ATTACK_BONUS;
  creature.defenseBonus = CREATURE_BASE_DEFENSE_BONUS;

  const weapon = createWeapon(
    names.generateName("hands"),
    maxDamage,
    challengeLevel,
    rng,
  );
  const armorSlot: WieldSlot = rng.choice(["chest", "arms", "feet"]);
  const armor = createArmor(
    names.generateName(armorSlot),
    armorSlot,
    challengeLevel,
    rng,
  );

  creature.wield("hands", weapon);
  creature.wield(armorSlot, armor);

  creature.maxHitpoints = rng.int(minHp, maxHp);
  creature.hitpoints = creature.maxHitpoints;

  return creature;
}
