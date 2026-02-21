import {
  CREATURE_GOLD_MULTIPLIER,
  CREATURE_GOLD_SCALER,
  DEFAULT_WEAPON_CRITICAL_MULTIPLIER,
  DEFAULT_WEAPON_CRITICAL_RANGE,
  DEFAULT_WEAPON_DAMAGE_DICE,
  MOB_CRITICAL_MULTIPLIER_MAXIMUM,
  MOB_CRITICAL_RANGE_MINIMUM,
  PLAYER_BASE_ATTACK_BONUS,
  PLAYER_BASE_DEFENSE,
  PLAYER_BASE_DEFENSE_BONUS,
  PLAYER_HP_HEAL_ON_LEVEL_UP,
  PLAYER_HP_PER_LEVEL_MULTIPLIER,
  PLAYER_CONSTITUTION_BONUS,
  PLAYER_INVENTORY_CAPACITY,
  PLAYER_INITIAL_HP,
  PLAYER_XP_FOR_LEVEL_2,
  PLAYER_XP_GOAL_MULTIPLIER,
} from "./constants";
import { AttributeSet, type AttributeName } from "./attributes";
import { Buff, Container, Gold, InstantEffectItem, Poison, Weapon, WieldableItem } from "./items";
import type { Position, WieldSlot } from "./types";
import type { Dice } from "./dice";

const SLOTS: WieldSlot[] = ["head", "chest", "arms", "hands", "legs", "feet"];

export class Creature {
  alive = true;

  hitpoints = PLAYER_INITIAL_HP;

  maxHitpoints = PLAYER_INITIAL_HP;

  buffs: Buff[] = [];

  poisons: Poison[] = [];

  xp = 0;

  nextLevelXp = PLAYER_XP_FOR_LEVEL_2;

  level = 1;

  turn = 1;

  gold = 0;

  inventory = new Container(PLAYER_INVENTORY_CAPACITY);

  defenseBase = PLAYER_BASE_DEFENSE;

  attackBonus = PLAYER_BASE_ATTACK_BONUS;

  defenseBonus = PLAYER_BASE_DEFENSE_BONUS;

  mob = false;

  inBattle = false;

  damageDealtMultiplier = 1;

  damageTakenMultiplier = 1;

  hitpointCapMultiplier = 1;

  unspentStatPoints = 0;

  readonly wieldpoints: Record<WieldSlot, WieldableItem | null> = {
    head: null,
    chest: null,
    arms: null,
    hands: null,
    legs: null,
    feet: null,
  };

  constructor(
    name: string,
    public position: Position,
    readonly attributes: AttributeSet = new AttributeSet(),
  ) {
    this.name = name;
  }

  name: string;

  currentMaxHitpoints(): number {
    return Math.max(1, Math.floor(this.maxHitpoints * this.hitpointCapMultiplier));
  }

  enforceHitpointCap(): void {
    const cap = this.currentMaxHitpoints();
    this.hitpoints = Math.min(cap, this.hitpoints);
  }

  rollMobGold(dice: Dice): void {
    const count = Math.max(1, Math.ceil(this.maxHitpoints / CREATURE_GOLD_SCALER));
    this.gold = Math.floor(dice.rollNamed(`${count}d20`) * CREATURE_GOLD_MULTIPLIER);
  }

  getWeapon(): Weapon | null {
    const weapon = this.wieldpoints.hands;
    return weapon instanceof Weapon ? weapon : null;
  }

  getWeaponDamage(): string {
    const weapon = this.getWeapon();
    if (!weapon) {
      return DEFAULT_WEAPON_DAMAGE_DICE;
    }
    return weapon.damage();
  }

  getWeaponCriticalRange(): number {
    const weapon = this.getWeapon();
    if (!weapon) {
      return DEFAULT_WEAPON_CRITICAL_RANGE;
    }
    const critRange = weapon.criticalRange();
    if (this.mob) {
      return Math.max(MOB_CRITICAL_RANGE_MINIMUM, critRange);
    }
    return critRange;
  }

  getWeaponCriticalMultiplier(): number {
    const weapon = this.getWeapon();
    if (!weapon) {
      return DEFAULT_WEAPON_CRITICAL_MULTIPLIER;
    }
    const critMult = weapon.criticalMultiplier();
    if (this.mob) {
      return Math.min(MOB_CRITICAL_MULTIPLIER_MAXIMUM, critMult);
    }
    return critMult;
  }

  wield(slot: WieldSlot, item: WieldableItem | null): void {
    const current = this.wieldpoints[slot];
    if (current) {
      this.attackBonus -= current.getAttackBonus();
      this.defenseBonus -= current.getDefenseBonus();
    }

    this.wieldpoints[slot] = item;

    if (item) {
      this.attackBonus += item.getAttackBonus();
      this.defenseBonus += item.getDefenseBonus();
    }
  }

  describeWields(): string {
    const lines: string[] = [];
    for (const slot of SLOTS) {
      const item = this.wieldpoints[slot];
      if (item) {
        lines.push(`${slot}: ${item.describe()}`);
      }
    }
    if (lines.length === 0) {
      return "Wielding nothing.";
    }
    return lines.join("\n");
  }

  addBuff(buff: Buff): void {
    this.buffs.push(buff);
    buff.setExpiry(this.turn + buff.lifetime);

    this.hitpoints += buff.hpBuff;
    this.attackBonus += buff.attackBuff;
    this.defenseBonus += buff.defenseBuff;
  }

  addPoison(poison: Poison): void {
    this.poisons.push(poison);
    poison.setExpiry(this.turn + poison.lifetime);
  }

  think(): void {
    if (!this.alive) {
      return;
    }

    const expiredBuffs: Buff[] = [];
    for (const buff of this.buffs) {
      if (buff.hasExpired(this.turn)) {
        expiredBuffs.push(buff);
      }
    }

    for (const buff of expiredBuffs) {
      const idx = this.buffs.findIndex((candidate) => candidate.id === buff.id);
      if (idx >= 0) {
        this.buffs.splice(idx, 1);
      }
      this.hitpoints -= buff.hpBuff;
      this.attackBonus -= buff.attackBuff;
      this.defenseBonus -= buff.defenseBuff;
      if (this.hitpoints < 1) {
        this.hitpoints = 1;
      }
    }

    const expiredPoisons: Poison[] = [];
    for (const poison of this.poisons) {
      if (poison.hasExpired(this.turn)) {
        expiredPoisons.push(poison);
      }
      this.hitpoints -= poison.damagePerTurn;
    }

    for (const poison of expiredPoisons) {
      const idx = this.poisons.findIndex((candidate) => candidate.id === poison.id);
      if (idx >= 0) {
        this.poisons.splice(idx, 1);
      }
    }

    if (this.hitpoints <= 0) {
      this.alive = false;
      this.hitpoints = 0;
    } else {
      this.enforceHitpointCap();
    }

    this.turn += 1;
  }

  give(item: Gold | WieldableItem | InstantEffectItem): boolean {
    if (item instanceof Gold) {
      this.gold += item.amount;
      return true;
    }
    return this.inventory.add(item);
  }

  spendGold(amount: number): boolean {
    if (this.gold < amount) {
      return false;
    }
    this.gold -= amount;
    return true;
  }

  giveXp(xp: number): { leveled: number; pointsAwarded: number } {
    this.xp += xp;

    let leveled = 0;
    while (this.xp >= this.nextLevelXp) {
      this.level += 1;
      leveled += 1;
      this.unspentStatPoints += 1;
      this.nextLevelXp *= PLAYER_XP_GOAL_MULTIPLIER;
      this.maxHitpoints = Math.floor(this.maxHitpoints * PLAYER_HP_PER_LEVEL_MULTIPLIER);
      const heal = Math.floor(this.maxHitpoints * PLAYER_HP_HEAL_ON_LEVEL_UP);
      this.hitpoints = Math.min(this.currentMaxHitpoints(), this.hitpoints + heal);
    }

    this.enforceHitpointCap();
    return { leveled, pointsAwarded: leveled };
  }

  applyInstantItem(item: InstantEffectItem): number {
    const applied = item.apply(this.hitpoints, this.currentMaxHitpoints());
    this.hitpoints = applied.hp;
    return applied.delta;
  }

  grantAttributePoint(points = 1): void {
    this.unspentStatPoints += Math.max(0, Math.floor(points));
  }

  spendAttributePoint(attr: AttributeName): boolean {
    if (this.unspentStatPoints <= 0) {
      return false;
    }

    this.attributes.modify(attr, 1);
    this.unspentStatPoints -= 1;

    if (attr === "con") {
      this.maxHitpoints += PLAYER_CONSTITUTION_BONUS;
      this.hitpoints = Math.min(
        this.currentMaxHitpoints(),
        this.hitpoints + PLAYER_CONSTITUTION_BONUS,
      );
    }

    this.enforceHitpointCap();
    return true;
  }

  bestHealItem(): InstantEffectItem | null {
    const hpNeeded = this.maxHitpoints - this.hitpoints;
    const heals = this.inventory
      .items()
      .filter((item): item is InstantEffectItem => item instanceof InstantEffectItem && item.hpBoost > 0)
      .sort((a, b) => a.hpBoost - b.hpBoost);

    if (heals.length === 0) {
      return null;
    }

    let fallback = heals[0];
    for (const heal of heals) {
      if (heal.hpBoost >= hpNeeded) {
        return heal;
      }
      fallback = heal;
    }

    return fallback;
  }

  healItems(): InstantEffectItem[] {
    return this.inventory
      .items()
      .filter((item): item is InstantEffectItem => item instanceof InstantEffectItem && item.hpBoost > 0);
  }
}
