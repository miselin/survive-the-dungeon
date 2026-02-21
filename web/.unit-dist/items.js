import { BUFF_DEFAULT_ATTACK, BUFF_DEFAULT_DEFENSE, BUFF_DEFAULT_HP, CHEST_DEFAULT_CAPACITY, DEFAULT_WEAPON_ATTACK_BONUS, DEFAULT_WEAPON_CRITICAL_MULTIPLIER, DEFAULT_WEAPON_CRITICAL_RANGE, DEFAULT_WEAPON_DAMAGE_DICE, DEFAULT_WEAPON_DEFENSE_BONUS, POISON_DEFAULT_DAMAGE_PER_TURN, TURN_EFFECT_DEFAULT_LIFETIME, WEAPON_CRIT_MAXIMUM_ROLL, } from "./constants";
let itemId = 1;
function allocItemId() {
    const value = itemId;
    itemId += 1;
    return `item-${value}`;
}
export function getNextItemId() {
    return itemId;
}
export function setNextItemId(nextId) {
    itemId = Math.max(1, Math.floor(nextId));
}
export class Item {
    name;
    id;
    value = 1;
    constructor(name) {
        this.name = name;
        this.id = allocItemId();
    }
}
function assignItemMeta(item, id, value) {
    item.id = id;
    item.value = value;
    return item;
}
export class Gold extends Item {
    amount;
    constructor(amount) {
        super("Gold");
        this.amount = amount;
        this.value = amount;
    }
    describe() {
        return `${this.amount} gold`;
    }
}
export class WieldableItem extends Item {
    attackBonus;
    defenseBonus;
    constructor(name, attackBonus = 0, defenseBonus = 0) {
        super(name);
        this.attackBonus = attackBonus;
        this.defenseBonus = defenseBonus;
    }
    getAttackBonus() {
        return this.attackBonus;
    }
    getDefenseBonus() {
        return this.defenseBonus;
    }
}
export class Armor extends WieldableItem {
    wieldSlot;
    constructor(wieldSlot, name, attackBonus = 0, defenseBonus = 0) {
        super(name, attackBonus, defenseBonus);
        this.wieldSlot = wieldSlot;
    }
    wieldsAt() {
        return this.wieldSlot;
    }
    describe() {
        return `Armor ${this.name} (${this.wieldSlot}) +${this.attackBonus} ATK +${this.defenseBonus} DEF`;
    }
}
export class Weapon extends WieldableItem {
    critRange;
    critMult;
    damageDice;
    constructor(name, critRange = DEFAULT_WEAPON_CRITICAL_RANGE, critMult = DEFAULT_WEAPON_CRITICAL_MULTIPLIER, attackBonus = DEFAULT_WEAPON_ATTACK_BONUS, defenseBonus = DEFAULT_WEAPON_DEFENSE_BONUS, damageDice = DEFAULT_WEAPON_DAMAGE_DICE) {
        super(name, attackBonus, defenseBonus);
        this.critRange = critRange;
        this.critMult = critMult;
        this.damageDice = damageDice;
    }
    wieldsAt() {
        return "hands";
    }
    criticalRange() {
        return this.critRange;
    }
    criticalMultiplier() {
        return this.critMult;
    }
    damage() {
        return this.damageDice;
    }
    describe() {
        return `${this.name} ${this.damageDice} crit ${this.critRange}-${WEAPON_CRIT_MAXIMUM_ROLL} x${this.critMult}`;
    }
}
export class InstantEffectItem extends Item {
    hpBoost;
    hpDrop;
    constructor(name, hpBoost = 0, hpDrop = 0) {
        super(name);
        this.hpBoost = hpBoost;
        this.hpDrop = hpDrop;
    }
    apply(currentHp, maxHp) {
        const previous = currentHp;
        const next = Math.min(maxHp, Math.max(0, currentHp + this.hpBoost - this.hpDrop));
        return { hp: next, delta: next - previous };
    }
    describe() {
        return `${this.name} heals ${this.hpBoost} HP`;
    }
}
export class TurnBasedEffectItem extends Item {
    lifetime;
    expiryTurn = 0;
    constructor(name, lifetime = TURN_EFFECT_DEFAULT_LIFETIME) {
        super(name);
        this.lifetime = lifetime;
    }
    setExpiry(turn) {
        this.expiryTurn = turn;
    }
    hasExpired(turn) {
        return turn >= this.expiryTurn;
    }
    // Alias kept intentionally for compatibility with legacy naming.
    has_expired(turn) {
        return this.hasExpired(turn);
    }
}
export class Poison extends TurnBasedEffectItem {
    damagePerTurn;
    constructor(name, damagePerTurn = POISON_DEFAULT_DAMAGE_PER_TURN, lifetime = TURN_EFFECT_DEFAULT_LIFETIME) {
        super(name, lifetime);
        this.damagePerTurn = damagePerTurn;
    }
    describe() {
        return `${this.name} deals ${this.damagePerTurn}/turn for ${this.lifetime} turns`;
    }
}
export class Buff extends TurnBasedEffectItem {
    hpBuff;
    attackBuff;
    defenseBuff;
    constructor(name, hpBuff = BUFF_DEFAULT_HP, attackBuff = BUFF_DEFAULT_ATTACK, defenseBuff = BUFF_DEFAULT_DEFENSE, lifetime = TURN_EFFECT_DEFAULT_LIFETIME) {
        super(name, lifetime);
        this.hpBuff = hpBuff;
        this.attackBuff = attackBuff;
        this.defenseBuff = defenseBuff;
    }
    describe() {
        return `${this.name} +${this.hpBuff} HP +${this.attackBuff} ATK +${this.defenseBuff} DEF (${this.lifetime} turns)`;
    }
}
export class Container {
    maxCapacity;
    inventory = [];
    constructor(maxCapacity = 10) {
        this.maxCapacity = maxCapacity;
    }
    count() {
        return this.inventory.length;
    }
    capacity() {
        return this.maxCapacity;
    }
    items() {
        return this.inventory;
    }
    add(item) {
        if (this.inventory.length >= this.maxCapacity) {
            return false;
        }
        this.inventory.push(item);
        return true;
    }
    remove(item) {
        const idx = this.inventory.findIndex((candidate) => candidate.id === item.id);
        if (idx >= 0) {
            this.inventory.splice(idx, 1);
        }
    }
    empty() {
        return this.inventory.length === 0;
    }
}
export class Chest extends Container {
    x;
    y;
    constructor(x, y, capacity = CHEST_DEFAULT_CAPACITY) {
        super(capacity);
        this.x = x;
        this.y = y;
    }
}
export function serializeItem(item) {
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
export function deserializeItem(serialized) {
    if (serialized.kind === "gold") {
        return assignItemMeta(new Gold(serialized.amount), serialized.id, serialized.value);
    }
    if (serialized.kind === "armor") {
        return assignItemMeta(new Armor(serialized.slot, serialized.name, serialized.attackBonus, serialized.defenseBonus), serialized.id, serialized.value);
    }
    if (serialized.kind === "weapon") {
        return assignItemMeta(new Weapon(serialized.name, serialized.critRange, serialized.critMult, serialized.attackBonus, serialized.defenseBonus, serialized.damageDice), serialized.id, serialized.value);
    }
    if (serialized.kind === "instant") {
        return assignItemMeta(new InstantEffectItem(serialized.name, serialized.hpBoost, serialized.hpDrop), serialized.id, serialized.value);
    }
    if (serialized.kind === "poison") {
        return assignItemMeta(new Poison(serialized.name, serialized.damagePerTurn, serialized.lifetime), serialized.id, serialized.value);
    }
    return assignItemMeta(new Buff(serialized.name, serialized.hpBuff, serialized.attackBuff, serialized.defenseBuff, serialized.lifetime), serialized.id, serialized.value);
}
