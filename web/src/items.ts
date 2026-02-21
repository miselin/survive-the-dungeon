import type { WieldSlot } from "./types";
import {
  BUFF_DEFAULT_ATTACK,
  BUFF_DEFAULT_DEFENSE,
  BUFF_DEFAULT_HP,
  CHEST_DEFAULT_CAPACITY,
  DEFAULT_WEAPON_ATTACK_BONUS,
  DEFAULT_WEAPON_CRITICAL_MULTIPLIER,
  DEFAULT_WEAPON_CRITICAL_RANGE,
  DEFAULT_WEAPON_DAMAGE_DICE,
  DEFAULT_WEAPON_DEFENSE_BONUS,
  POISON_DEFAULT_DAMAGE_PER_TURN,
  TURN_EFFECT_DEFAULT_LIFETIME,
  WEAPON_CRIT_MAXIMUM_ROLL,
} from "./constants";

let itemId = 1;

function allocItemId(): string {
  const value = itemId;
  itemId += 1;
  return `item-${value}`;
}

export function getNextItemId(): number {
  return itemId;
}

export function setNextItemId(nextId: number): void {
  itemId = Math.max(1, Math.floor(nextId));
}

export abstract class Item {
  readonly id: string;

  value = 1;

  constructor(readonly name: string) {
    this.id = allocItemId();
  }

  abstract describe(): string;
}

export type SerializedItem =
  | { kind: "gold"; id: string; name: string; value: number; amount: number }
  | { kind: "armor"; id: string; name: string; value: number; slot: WieldSlot; attackBonus: number; defenseBonus: number }
  | {
    kind: "weapon";
    id: string;
    name: string;
    value: number;
    critRange: number;
    critMult: number;
    attackBonus: number;
    defenseBonus: number;
    damageDice: string;
  }
  | { kind: "instant"; id: string; name: string; value: number; hpBoost: number; hpDrop: number }
  | { kind: "poison"; id: string; name: string; value: number; damagePerTurn: number; lifetime: number }
  | { kind: "buff"; id: string; name: string; value: number; hpBuff: number; attackBuff: number; defenseBuff: number; lifetime: number };

function assignItemMeta<T extends Item>(item: T, id: string, value: number): T {
  (item as Item & { id: string }).id = id;
  item.value = value;
  return item;
}

export class Gold extends Item {
  constructor(readonly amount: number) {
    super("Gold");
    this.value = amount;
  }

  describe(): string {
    return `${this.amount} gold`;
  }
}

export abstract class WieldableItem extends Item {
  constructor(name: string, readonly attackBonus = 0, readonly defenseBonus = 0) {
    super(name);
  }

  abstract wieldsAt(): WieldSlot;

  getAttackBonus(): number {
    return this.attackBonus;
  }

  getDefenseBonus(): number {
    return this.defenseBonus;
  }
}

export class Armor extends WieldableItem {
  constructor(
    private readonly wieldSlot: WieldSlot,
    name: string,
    attackBonus = 0,
    defenseBonus = 0,
  ) {
    super(name, attackBonus, defenseBonus);
  }

  wieldsAt(): WieldSlot {
    return this.wieldSlot;
  }

  describe(): string {
    return `Armor ${this.name} (${this.wieldSlot}) +${this.attackBonus} ATK +${this.defenseBonus} DEF`;
  }
}

export class Weapon extends WieldableItem {
  constructor(
    name: string,
    private readonly critRange = DEFAULT_WEAPON_CRITICAL_RANGE,
    private readonly critMult = DEFAULT_WEAPON_CRITICAL_MULTIPLIER,
    attackBonus = DEFAULT_WEAPON_ATTACK_BONUS,
    defenseBonus = DEFAULT_WEAPON_DEFENSE_BONUS,
    private readonly damageDice = DEFAULT_WEAPON_DAMAGE_DICE,
  ) {
    super(name, attackBonus, defenseBonus);
  }

  wieldsAt(): WieldSlot {
    return "hands";
  }

  criticalRange(): number {
    return this.critRange;
  }

  criticalMultiplier(): number {
    return this.critMult;
  }

  damage(): string {
    return this.damageDice;
  }

  describe(): string {
    return `${this.name} ${this.damageDice} crit ${this.critRange}-${WEAPON_CRIT_MAXIMUM_ROLL} x${this.critMult}`;
  }
}

export class InstantEffectItem extends Item {
  constructor(name: string, readonly hpBoost = 0, readonly hpDrop = 0) {
    super(name);
  }

  apply(currentHp: number, maxHp: number): { hp: number; delta: number } {
    const previous = currentHp;
    const next = Math.min(maxHp, Math.max(0, currentHp + this.hpBoost - this.hpDrop));
    return { hp: next, delta: next - previous };
  }

  describe(): string {
    return `${this.name} heals ${this.hpBoost} HP`;
  }
}

export abstract class TurnBasedEffectItem extends Item {
  private expiryTurn = 0;

  constructor(name: string, readonly lifetime = TURN_EFFECT_DEFAULT_LIFETIME) {
    super(name);
  }

  setExpiry(turn: number): void {
    this.expiryTurn = turn;
  }

  hasExpired(turn: number): boolean {
    return turn >= this.expiryTurn;
  }

  // Alias kept intentionally for compatibility with legacy naming.
  has_expired(turn: number): boolean {
    return this.hasExpired(turn);
  }
}

export class Poison extends TurnBasedEffectItem {
  constructor(name: string, readonly damagePerTurn = POISON_DEFAULT_DAMAGE_PER_TURN, lifetime = TURN_EFFECT_DEFAULT_LIFETIME) {
    super(name, lifetime);
  }

  describe(): string {
    return `${this.name} deals ${this.damagePerTurn}/turn for ${this.lifetime} turns`;
  }
}

export class Buff extends TurnBasedEffectItem {
  constructor(
    name: string,
    readonly hpBuff = BUFF_DEFAULT_HP,
    readonly attackBuff = BUFF_DEFAULT_ATTACK,
    readonly defenseBuff = BUFF_DEFAULT_DEFENSE,
    lifetime = TURN_EFFECT_DEFAULT_LIFETIME,
  ) {
    super(name, lifetime);
  }

  describe(): string {
    return `${this.name} +${this.hpBuff} HP +${this.attackBuff} ATK +${this.defenseBuff} DEF (${this.lifetime} turns)`;
  }
}

export class Container {
  private readonly inventory: Item[] = [];

  constructor(private readonly maxCapacity = 10) {}

  count(): number {
    return this.inventory.length;
  }

  capacity(): number {
    return this.maxCapacity;
  }

  items(): Item[] {
    return this.inventory;
  }

  add(item: Item): boolean {
    if (this.inventory.length >= this.maxCapacity) {
      return false;
    }
    this.inventory.push(item);
    return true;
  }

  remove(item: Item): void {
    const idx = this.inventory.findIndex((candidate) => candidate.id === item.id);
    if (idx >= 0) {
      this.inventory.splice(idx, 1);
    }
  }

  empty(): boolean {
    return this.inventory.length === 0;
  }
}

export class Chest extends Container {
  constructor(readonly x: number, readonly y: number, capacity = CHEST_DEFAULT_CAPACITY) {
    super(capacity);
  }
}

export function serializeItem(item: Item): SerializedItem {
  if (item instanceof Gold) {
    return {
      kind: "gold",
      id: item.id,
      name: item.name,
      value: item.value,
      amount: item.amount,
    };
  }

  if (item instanceof Armor) {
    return {
      kind: "armor",
      id: item.id,
      name: item.name,
      value: item.value,
      slot: item.wieldsAt(),
      attackBonus: item.getAttackBonus(),
      defenseBonus: item.getDefenseBonus(),
    };
  }

  if (item instanceof Weapon) {
    return {
      kind: "weapon",
      id: item.id,
      name: item.name,
      value: item.value,
      critRange: item.criticalRange(),
      critMult: item.criticalMultiplier(),
      attackBonus: item.getAttackBonus(),
      defenseBonus: item.getDefenseBonus(),
      damageDice: item.damage(),
    };
  }

  if (item instanceof InstantEffectItem) {
    return {
      kind: "instant",
      id: item.id,
      name: item.name,
      value: item.value,
      hpBoost: item.hpBoost,
      hpDrop: item.hpDrop,
    };
  }

  if (item instanceof Poison) {
    return {
      kind: "poison",
      id: item.id,
      name: item.name,
      value: item.value,
      damagePerTurn: item.damagePerTurn,
      lifetime: item.lifetime,
    };
  }

  if (item instanceof Buff) {
    return {
      kind: "buff",
      id: item.id,
      name: item.name,
      value: item.value,
      hpBuff: item.hpBuff,
      attackBuff: item.attackBuff,
      defenseBuff: item.defenseBuff,
      lifetime: item.lifetime,
    };
  }

  throw new Error(`Unsupported item serialization kind: ${item.constructor.name}`);
}

export function deserializeItem(serialized: SerializedItem): Item {
  if (serialized.kind === "gold") {
    return assignItemMeta(new Gold(serialized.amount), serialized.id, serialized.value);
  }

  if (serialized.kind === "armor") {
    return assignItemMeta(
      new Armor(serialized.slot, serialized.name, serialized.attackBonus, serialized.defenseBonus),
      serialized.id,
      serialized.value,
    );
  }

  if (serialized.kind === "weapon") {
    return assignItemMeta(
      new Weapon(
        serialized.name,
        serialized.critRange,
        serialized.critMult,
        serialized.attackBonus,
        serialized.defenseBonus,
        serialized.damageDice,
      ),
      serialized.id,
      serialized.value,
    );
  }

  if (serialized.kind === "instant") {
    return assignItemMeta(
      new InstantEffectItem(serialized.name, serialized.hpBoost, serialized.hpDrop),
      serialized.id,
      serialized.value,
    );
  }

  if (serialized.kind === "poison") {
    return assignItemMeta(
      new Poison(serialized.name, serialized.damagePerTurn, serialized.lifetime),
      serialized.id,
      serialized.value,
    );
  }

  return assignItemMeta(
    new Buff(
      serialized.name,
      serialized.hpBuff,
      serialized.attackBuff,
      serialized.defenseBuff,
      serialized.lifetime,
    ),
    serialized.id,
    serialized.value,
  );
}
