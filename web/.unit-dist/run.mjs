// src/constants.ts
var PLAYER_INITIAL_HP = 30;
var PLAYER_CONSTITUTION_BONUS = 5;
var PLAYER_BASE_ATTACK_BONUS = 2;
var PLAYER_BASE_DEFENSE_BONUS = 2;
var PLAYER_BASE_DEFENSE = 5;
var PLAYER_INVENTORY_CAPACITY = 10;
var CHALLENGE_LEVEL_SCALE_UP_FACTOR = 1.3;
var MAXIMUM_CHALLENGE_LEVEL = 10;
var BOSS_CHALLENGE_LEVEL = MAXIMUM_CHALLENGE_LEVEL + 5;
var PLAYER_CRIT_MINIMUM_ROLL = 18;
var PLAYER_CRIT_MAXIMUM_MULTIPLIER = 3;
var WEAPON_CRIT_MAXIMUM_ROLL = 20;
var DEFAULT_WEAPON_CRITICAL_RANGE = 20;
var DEFAULT_WEAPON_CRITICAL_MULTIPLIER = 2;
var DEFAULT_WEAPON_DAMAGE_DICE = "1d6";
var DEFAULT_WEAPON_ATTACK_BONUS = 4;
var DEFAULT_WEAPON_DEFENSE_BONUS = -1;
var MOB_CRITICAL_RANGE_MINIMUM = 17;
var MOB_CRITICAL_MULTIPLIER_MAXIMUM = 3;
var CREATURE_MAX_DAMAGE_AT_LEVEL_1 = Math.floor(PLAYER_INITIAL_HP * 0.3);
var CREATURE_MAX_HP_AT_LEVEL_1 = 40;
var CREATURE_MIN_HP_AT_LEVEL_1 = Math.floor(CREATURE_MAX_HP_AT_LEVEL_1 * 0.5);
var CREATURE_BASE_STR = 6;
var CREATURE_BASE_DEX = 4;
var CREATURE_BASE_CON = 2;
var CREATURE_BASELINE_STR = 8;
var CREATURE_BASELINE_DEX = 8;
var CREATURE_BASELINE_CON = 8;
var CREATURE_BASE_ATTACK_BONUS = 0;
var CREATURE_BASE_DEFENSE_BONUS = 0;
var CREATURE_GOLD_SCALER = 15;
var CREATURE_GOLD_MULTIPLIER = 3;
var PLAYER_HP_PER_LEVEL_MULTIPLIER = 1.5;
var PLAYER_HP_HEAL_ON_LEVEL_UP = 0.75;
var PLAYER_XP_FOR_LEVEL_2 = 128;
var PLAYER_XP_GOAL_MULTIPLIER = 4;
var MAXIMUM_INEFFECTIVE_DAMAGE_MULTIPLIER = 0.5;
var COMBAT_OFFENSIVE_ATTACK_MULTIPLIER = 2;
var COMBAT_OFFENSIVE_DEFENSE_MULTIPLIER = 0.3;
var COMBAT_DEFENSIVE_ATTACK_MULTIPLIER = 0.5;
var COMBAT_DEFENSIVE_DEFENSE_MULTIPLIER = 1.5;
var FLEE_DIE_SIDES = 20;
var FLEE_BASE_DC = 11;
var PLAYER_LUCK_HISTORY_SIZE = 8;
var PLAYER_LUCK_LOW_ROLL_THRESHOLD = 8;
var PLAYER_LUCK_LOW_ROLL_TRIGGER = 4;
var PLAYER_LUCK_BONUS_PER_LOW_ROLL = 1;
var PLAYER_LUCK_MAX_HISTORY_BONUS = 3;
var PLAYER_LUCK_BONUS_PER_MISS_STREAK = 1;
var PLAYER_LUCK_MAX_MISS_STREAK_BONUS = 3;
var PLAYER_LUCK_LOW_HP_RATIO = 0.3;
var PLAYER_LUCK_LOW_HP_BONUS = 2;
var PLAYER_LUCK_CRITICAL_HP_RATIO = 0.15;
var PLAYER_LUCK_CRITICAL_HP_EXTRA_BONUS = 1;
var PLAYER_LUCK_MAX_TOTAL_BONUS = 6;
var ENEMY_STYLE_LOW_HP_RATIO = 0.35;
var ENEMY_STYLE_GUARDED_CHANCE_PERCENT = 45;
var ENEMY_STYLE_RECKLESS_CHANCE_PERCENT = 30;
var ENEMY_STYLE_GUARDED_ATTACK_MULTIPLIER = 0.65;
var ENEMY_STYLE_GUARDED_DEFENSE_MULTIPLIER = 1.4;
var ENEMY_STYLE_RECKLESS_ATTACK_MULTIPLIER = 1.6;
var ENEMY_STYLE_RECKLESS_DEFENSE_MULTIPLIER = 0.7;
var ENEMY_STYLE_STEADY_ATTACK_MULTIPLIER = 1;
var ENEMY_STYLE_STEADY_DEFENSE_MULTIPLIER = 1;
var SHOP_REWARD_FALLBACK_GOLD = 120;
var BANDAGES_HEAL_HP = 5;
var HEALTH_POTION_HEAL_HP = BANDAGES_HEAL_HP * 5;
var LARGE_HEALTH_POTION_HEAL_HP = HEALTH_POTION_HEAL_HP * 2;
var HUGE_HEALTH_POTION_HEAL_HP = HEALTH_POTION_HEAL_HP * 4;
var COLOSSAL_HEALTH_POTION_HEAL_HP = HEALTH_POTION_HEAL_HP * 10;
var NAME_GENERATION_MAX_ATTEMPTS = 200;
var NAME_GENERATION_FALLBACK_MAX_ID = 1e5;
var WEAPON_DAMAGE_FACE_MIN = 2;
var WEAPON_DAMAGE_FACE_MAX = 20;
var ITEM_WEAPON_FLAT_BONUS_BASE = 1;
var ITEM_WEAPON_FLAT_BONUS_CHALLENGE_DIVISOR = 2;
var ITEM_WEAPON_FLAT_BONUS_RANDOM_MAX = 3;
var ITEM_ARMOR_DEFENSE_BASE_MIN = 1;
var ITEM_ARMOR_DEFENSE_CHALLENGE_BONUS = 2;
var SHOP_REWARD_HEAL_FALLBACK_RATIO = 0.35;
var DEFAULT_ATTRS = {
  str: 14,
  dex: 12,
  con: 14,
  int: 10,
  wis: 10,
  chr: 10
};

// src/attributes.ts
var AttributeSet = class _AttributeSet {
  attrs;
  constructor(base) {
    this.attrs = {
      str: DEFAULT_ATTRS.str,
      dex: DEFAULT_ATTRS.dex,
      con: DEFAULT_ATTRS.con,
      int: DEFAULT_ATTRS.int,
      wis: DEFAULT_ATTRS.wis,
      chr: DEFAULT_ATTRS.chr,
      ...base
    };
  }
  get(attr) {
    return this.attrs[attr];
  }
  modify(attr, amount) {
    this.attrs[attr] += Math.floor(amount);
  }
  modifier(attr) {
    return Math.floor((this.get(attr) - 10) / 2);
  }
  clone() {
    return new _AttributeSet({ ...this.attrs });
  }
  toObject() {
    return { ...this.attrs };
  }
};

// src/items.ts
var itemId = 1;
function allocItemId() {
  const value = itemId;
  itemId += 1;
  return `item-${value}`;
}
var Item = class {
  constructor(name) {
    this.name = name;
    this.id = allocItemId();
  }
  id;
  value = 1;
};
var Gold = class extends Item {
  constructor(amount) {
    super("Gold");
    this.amount = amount;
    this.value = amount;
  }
  describe() {
    return `${this.amount} gold`;
  }
};
var WieldableItem = class extends Item {
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
};
var Armor = class extends WieldableItem {
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
};
var Weapon = class extends WieldableItem {
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
};
var InstantEffectItem = class extends Item {
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
};
var Container = class {
  constructor(maxCapacity = 10) {
    this.maxCapacity = maxCapacity;
  }
  inventory = [];
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
};

// src/creature.ts
var SLOTS = ["head", "chest", "arms", "hands", "legs", "feet"];
var Creature = class {
  constructor(name, position, attributes = new AttributeSet()) {
    this.position = position;
    this.attributes = attributes;
    this.name = name;
  }
  alive = true;
  hitpoints = PLAYER_INITIAL_HP;
  maxHitpoints = PLAYER_INITIAL_HP;
  buffs = [];
  poisons = [];
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
  wieldpoints = {
    head: null,
    chest: null,
    arms: null,
    hands: null,
    legs: null,
    feet: null
  };
  name;
  currentMaxHitpoints() {
    return Math.max(1, Math.floor(this.maxHitpoints * this.hitpointCapMultiplier));
  }
  enforceHitpointCap() {
    const cap = this.currentMaxHitpoints();
    this.hitpoints = Math.min(cap, this.hitpoints);
  }
  rollMobGold(dice) {
    const count = Math.max(1, Math.ceil(this.maxHitpoints / CREATURE_GOLD_SCALER));
    this.gold = Math.floor(dice.rollNamed(`${count}d20`) * CREATURE_GOLD_MULTIPLIER);
  }
  getWeapon() {
    const weapon = this.wieldpoints.hands;
    return weapon instanceof Weapon ? weapon : null;
  }
  getWeaponDamage() {
    const weapon = this.getWeapon();
    if (!weapon) {
      return DEFAULT_WEAPON_DAMAGE_DICE;
    }
    return weapon.damage();
  }
  getWeaponCriticalRange() {
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
  getWeaponCriticalMultiplier() {
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
  wield(slot, item) {
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
  describeWields() {
    const lines = [];
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
  addBuff(buff) {
    this.buffs.push(buff);
    buff.setExpiry(this.turn + buff.lifetime);
    this.hitpoints += buff.hpBuff;
    this.attackBonus += buff.attackBuff;
    this.defenseBonus += buff.defenseBuff;
  }
  addPoison(poison) {
    this.poisons.push(poison);
    poison.setExpiry(this.turn + poison.lifetime);
  }
  think() {
    if (!this.alive) {
      return;
    }
    const expiredBuffs = [];
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
    const expiredPoisons = [];
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
  give(item) {
    if (item instanceof Gold) {
      this.gold += item.amount;
      return true;
    }
    return this.inventory.add(item);
  }
  spendGold(amount) {
    if (this.gold < amount) {
      return false;
    }
    this.gold -= amount;
    return true;
  }
  giveXp(xp) {
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
  applyInstantItem(item) {
    const applied = item.apply(this.hitpoints, this.currentMaxHitpoints());
    this.hitpoints = applied.hp;
    return applied.delta;
  }
  grantAttributePoint(points = 1) {
    this.unspentStatPoints += Math.max(0, Math.floor(points));
  }
  spendAttributePoint(attr) {
    if (this.unspentStatPoints <= 0) {
      return false;
    }
    this.attributes.modify(attr, 1);
    this.unspentStatPoints -= 1;
    if (attr === "con") {
      this.maxHitpoints += PLAYER_CONSTITUTION_BONUS;
      this.hitpoints = Math.min(
        this.currentMaxHitpoints(),
        this.hitpoints + PLAYER_CONSTITUTION_BONUS
      );
    }
    this.enforceHitpointCap();
    return true;
  }
  bestHealItem() {
    const hpNeeded = this.maxHitpoints - this.hitpoints;
    const heals = this.inventory.items().filter((item) => item instanceof InstantEffectItem && item.hpBoost > 0).sort((a, b) => a.hpBoost - b.hpBoost);
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
  healItems() {
    return this.inventory.items().filter((item) => item instanceof InstantEffectItem && item.hpBoost > 0);
  }
};

// src/rng.ts
var UINT32_MAX = 4294967295;
function xmur3(input) {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i += 1) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = h << 13 | h >>> 19;
  }
  return () => {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}
var SeededRandom = class {
  state;
  seed;
  phrase;
  constructor(seedPhrase) {
    this.phrase = seedPhrase;
    const seedSource = xmur3(seedPhrase);
    this.seed = seedSource();
    this.state = this.seed >>> 0;
  }
  next() {
    this.state = this.state + 1831565813 >>> 0;
    let r = Math.imul(this.state ^ this.state >>> 15, this.state | 1);
    r ^= r + Math.imul(r ^ r >>> 7, r | 61);
    return ((r ^ r >>> 14) >>> 0) / (UINT32_MAX + 1);
  }
  getState() {
    return this.state >>> 0;
  }
  setState(state) {
    this.state = state >>> 0;
  }
  int(min, max) {
    if (max < min) {
      return min;
    }
    const span = max - min + 1;
    return Math.floor(this.next() * span) + min;
  }
  choice(items) {
    return items[this.int(0, items.length - 1)];
  }
  chance(probability) {
    return this.next() < probability;
  }
  shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = this.int(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
};

// src/dice.ts
var DICE_RE = /^([1-9][0-9]*)\s*d\s*([1-9][0-9]*)(?:\s*([+-])\s*([0-9]+))?$/i;
function parseDice(name) {
  const match = name.trim().match(DICE_RE);
  if (!match) {
    throw new Error(`Invalid dice: ${name}`);
  }
  const count = Number.parseInt(match[1], 10);
  const faces = Number.parseInt(match[2], 10);
  const sign = match[3] ?? "+";
  const modifierAbs = match[4] ? Number.parseInt(match[4], 10) : 0;
  const modifier = sign === "-" ? -modifierAbs : modifierAbs;
  return { count, faces, modifier };
}
var Dice = class {
  constructor(rng) {
    this.rng = rng;
  }
  roll(low = 1, high = 20) {
    const min = Math.max(1, low);
    return this.rng.int(min, high);
  }
  rollNamed(name) {
    const { count, faces, modifier } = parseDice(name);
    let total = 0;
    for (let i = 0; i < count; i += 1) {
      total += this.roll(1, faces);
    }
    return total + modifier;
  }
  minMax(name) {
    const { count, faces, modifier } = parseDice(name);
    return [count + modifier, count * faces + modifier];
  }
};

// src/strings/en.ts
var attributeLabels = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  chr: "Charisma"
};
var attributeDescriptions = {
  str: "Increases hit chance and boosts aggressive builds.",
  dex: "Improves defense and flee reliability.",
  con: "Raises max HP and durability.",
  int: "Reserved for future spell/crafting systems.",
  wis: "Reserved for future utility systems.",
  chr: "Improves shop discounts."
};
var EN = {
  ui: {
    appTitle: "Survive the Dungeon",
    menuSubtitle: "A browser port of your one-week roguelike prototype.",
    seedInputLabel: "Seed phrase (optional)",
    seedInputPlaceholder: "e.g. goblin-market-17",
    startRunButton: "Start Run",
    menuHelp: "Leave blank for a unique seed each run. Keyboard: WASD / arrows, M toggles reveal-map debug. Mobile: on-screen d-pad.",
    seedPrefix: "Seed",
    mapAriaLabel: "Dungeon map",
    room: {
      shop: "Shop",
      dungeon: "Dungeon",
      hall: "Hall"
    },
    buttons: {
      save: "Save",
      load: "Load",
      resumeLast: "Resume Last",
      inventory: "Inventory",
      shop: "Shop",
      revealMap: "Reveal Map",
      hideMap: "Hide Map",
      newRun: "New Run",
      close: "Close",
      pick: "Pick",
      claim: "Claim",
      loot: "Loot",
      lootAll: "Loot All",
      equip: "Equip",
      use: "Use",
      drop: "Drop",
      buy: "Buy",
      sold: "Sold",
      continue: "Continue",
      skip: "Skip",
      descend: "Descend",
      descendWithoutPicking: "Descend Without Picking"
    },
    saves: {
      loadPrompt: "Paste a save token or a full resume URL.",
      loadFailed: "That save token could not be loaded.",
      noLatestSave: "No recent local save is available.",
      tokenCopied: "Save token copied to clipboard.",
      shareUrlCopied: "Resume URL copied to clipboard.",
      copyTokenPrompt: "Copy this save token:",
      copyShareUrlPrompt: "Copy this resume URL:"
    },
    sidebar: {
      logTitle: "Log",
      buildModifiers: "Build Modifiers",
      wieldedGear: "Wielded Gear",
      combatLog: "Combat Log",
      perks: "Perks",
      gambits: "Gambits"
    },
    stateText: {
      floor: (floor) => `Floor ${floor}`,
      cleared: "Dungeon cleared",
      defeated: "You were defeated"
    },
    stats: {
      hp: (hp, cap) => `HP ${hp} / ${cap}`,
      xp: (xp, next) => `XP ${xp} / ${next}`,
      floor: "Floor",
      gold: "Gold",
      level: "Level",
      unspentStats: "Unspent Stats",
      enemiesLeft: "Enemies Left",
      room: "Room",
      threat: "Threat"
    },
    threat: {
      unknown: "Unknown",
      safe: "Safe",
      deadly: (level) => `L${level} Deadly`,
      risky: (level) => `L${level} Risky`,
      manageable: (level) => `L${level} Manageable`
    },
    buildSummaryNone: "No active perks or gambits yet.",
    runSummary: {
      vanquished: "Vanquished",
      goldEarned: "Gold earned",
      goldSpent: "Gold spent",
      goldLeftInChests: "Gold left in chests",
      inventoryValue: "Inventory value",
      xpGained: "XP gained",
      finalLevel: "Final level",
      floorReached: "Floor reached"
    },
    compare: {
      hoverHint: "Hover or focus an Equip button to compare with your currently wielded gear.",
      atkBonus: "ATK Bonus",
      defBonus: "DEF Bonus",
      damageAvg: "Damage Avg",
      critRangeStart: "Crit Range Start",
      critMult: "Crit Mult",
      slot: "Slot",
      current: "Current",
      empty: "Empty",
      stat: "Stat",
      candidate: "Candidate",
      delta: "Delta"
    },
    overlays: {
      runEnd: {
        victoryTitle: "Victory",
        defeatTitle: "Defeat",
        victoryBody: "You cleared every enemy in the dungeon.",
        defeatBody: "The dungeon consumed you."
      },
      combatFx: {
        title: "Combat Roll",
        hint: "Watch the checks resolve moment by moment.",
        skipAll: "Skip all combat roll animations"
      },
      battle: {
        title: (enemyName) => `Battle: ${enemyName}`,
        noTargetTitle: "Battle",
        noTargetBody: "No target.",
        yourHp: (current, max) => `Your HP: ${current}/${max}`,
        enemyHp: (current, max) => `Enemy HP: ${current}/${max}`,
        ambushProtectionHint: "Ambush protection active: enemy opening strike weakened and flee is easier.",
        healChoice: (choice) => `Heal choice: ${choice}`,
        actions: {
          normal: { label: "Normal", subtitle: "1.0x damage, 1.0x defense" },
          offensive: { label: "Offensive", subtitle: "2.0x damage, 0.3x defense" },
          defensive: { label: "Defensive", subtitle: "0.5x damage, 1.5x defense" },
          heal: { label: "Heal", subtitle: "Use best healing item" },
          flee: { label: "Flee", subtitle: "Dexterity check to escape" }
        }
      },
      levelUp: {
        title: "Level Up",
        body: (unspent) => `Spend your stat point to shape your build. Unspent: ${unspent}`,
        spend: (label) => `+1 ${label}`
      },
      bossReward: {
        title: "Boss Defeated",
        emptyTitle: "Boss Reward",
        emptyBody: "No rewards available.",
        body: (floor) => `Floor ${floor} boss is down. Take a Perk, embrace a Gambit, or descend unchanged.`,
        currentBuild: (perks, gambits) => `Current build: ${perks} Perk(s), ${gambits} Gambit(s)`
      },
      shopReward: {
        title: "Shop Discovery Reward",
        body: "Finding the shop grants a free build-control reward. Pick one:"
      },
      chest: {
        title: "Chest",
        emptyBody: "Empty chest.",
        nothingLeft: "Nothing left."
      },
      inventory: {
        title: "Inventory",
        emptyBody: "Inventory is empty.",
        equipComparisonTitle: "Equip Comparison"
      },
      shop: {
        title: "Shop",
        price: (cost) => `${cost}g`,
        itemValue: (value) => `${value}g`
      }
    },
    combatFxMoments: {
      phaseLabel: {
        toHit: "To Hit",
        critCheck: "Critical Threat",
        critConfirm: "Critical Confirm",
        flee: "Flee Check"
      },
      verdictSuccess: "Success",
      verdictFail: "Fail",
      damageRollTitle: (actor) => `${actor} damage roll`,
      damageRollDetail: (roll, multiplier, final, defender, remainingHp) => `${roll} x ${multiplier.toFixed(2)} = ${final} damage to ${defender} (now ${remainingHp} HP)`,
      healTitle: (actor) => `${actor} heals`,
      healDetail: (item, amount) => `${item} restores ${amount} HP`
    }
  },
  combat: {
    logs: {
      playerCritical: (attacker, multiplier) => `${attacker} rolls a CRITICAL hit! Damage x${multiplier}.`,
      playerCriticalMoment: (attacker, multiplier) => `${attacker} rolls a critical hit! Damage multiplied by ${multiplier}x.`,
      enemyCritical: (attacker) => `${attacker} lands a CRITICAL hit!`,
      enemyCriticalDowngrade: (attacker) => `${attacker} almost crit, but only lands a normal hit.`,
      reducedDamageHit: (attacker, armorClass, totalAttack) => `${attacker} fails to beat AC ${armorClass} (${totalAttack}) and deals reduced damage.`,
      hit: (attacker, totalAttack, armorClass) => `${attacker} hits (${totalAttack} vs AC ${armorClass}).`,
      damage: (attacker, damage, defender, remainingHp) => `${attacker} deals ${damage} damage to ${defender} (now ${remainingHp} HP).`,
      falls: (defender) => `${defender} falls.`,
      offensiveStance: "You commit to an offensive strike.",
      defensiveStance: "You take a defensive stance.",
      fleeSuccess: (score, dc) => `You escape (roll ${score} vs ${dc}).`,
      fleeSuccessMoment: (score, dc) => `Escape succeeded (${score} vs ${dc}).`,
      fleeFail: (score, dc) => `Retreat failed (roll ${score} vs ${dc}).`,
      fleeFailMoment: (score, dc) => `Escape failed (${score} vs ${dc}).`,
      heal: (itemName, amount) => `You use ${itemName} and restore ${amount} HP.`,
      noHealingItem: "You have no healing item.",
      noHealingMoment: "No healing item available.",
      enemyStyle: (enemyName, styleName) => `${enemyName} uses ${styleName}.`
    },
    enemyStyles: {
      guarded: "guarded strike",
      reckless: "reckless swing",
      steady: "steady attack"
    },
    healChoiceNone: "No healing item",
    healChoiceItem: (itemName, hpBoost) => `${itemName} (+${hpBoost} HP)`
  },
  game: {
    names: {
      player: "Player",
      dungeonBoss: "Dungeon Boss"
    },
    labels: {
      perk: "Perk",
      gambit: "Gambit"
    },
    startingGear: {
      fists: "Fists",
      clothArmor: "Cloth Armor",
      leatherBoots: "Leather Boots"
    },
    itemNames: {
      bandages: "Bandages",
      healthPotion: "Health Potion",
      largeHealthPotion: "Large Health Potion",
      hugeHealthPotion: "Huge Health Potion",
      colossalHealthPotion: "Colossal Health Potion",
      instaheal: "Instaheal"
    },
    attributeLabels,
    attributeDescriptions,
    buildChoices: {
      perks: {
        ironFrame: {
          name: "Iron Frame",
          description: "+28 max HP and +2 DEF."
        },
        duelistInstinct: {
          name: "Duelist Instinct",
          description: "+3 ATK and +1 DEX."
        },
        scavengerWits: {
          name: "Scavenger Wits",
          description: "+2 STR and +2 CHR."
        },
        relentlessEdge: {
          name: "Relentless Edge",
          description: "Deal 20% more damage."
        },
        wardingShell: {
          name: "Warding Shell",
          description: "Take 15% less damage."
        }
      },
      gambits: {
        bloodOath: {
          name: "Blood Oath",
          description: "Deal 2x damage, but HP is capped at 50%."
        },
        berserkerStance: {
          name: "Berserker Stance",
          description: "+6 ATK, but -4 DEF."
        },
        hollowCore: {
          name: "Hollow Core",
          description: "Deal 60% more damage, but lose 25 max HP."
        },
        mirroredPain: {
          name: "Mirrored Pain",
          description: "Deal 35% more damage, but take 70% more damage."
        },
        brittleFocus: {
          name: "Brittle Focus",
          description: "+4 STR and +4 DEX, but -3 CON."
        }
      }
    },
    shop: {
      services: {
        bonusPoint: {
          name: "Stat Respec Token",
          description: "Gain 1 stat point immediately."
        },
        removePerk: {
          name: "Perk Reforge",
          description: "Remove your latest Perk."
        },
        removeGambit: {
          name: "Gambit Cleanse",
          description: "Remove your latest Gambit."
        }
      },
      rewards: {
        bonusPoint: {
          title: "Training Insight",
          description: "Gain 1 bonus stat point."
        },
        removePerk: {
          title: "Reforge Perk",
          description: (perkName) => `Remove your latest Perk: ${perkName}.`,
          fallback: () => `No Perk active. Gain ${SHOP_REWARD_FALLBACK_GOLD} gold instead.`
        },
        removeGambit: {
          title: "Cleanse Gambit",
          description: (gambitName) => `Remove your latest Gambit: ${gambitName}.`,
          fallback: () => `No Gambit active. Restore ${Math.round(SHOP_REWARD_HEAL_FALLBACK_RATIO * 100)}% HP instead.`
        }
      },
      descriptions: {
        removePerk: (perkName) => `Remove your latest Perk: ${perkName}.`,
        removePerkNone: "No active Perk to remove right now.",
        removeGambit: (gambitName) => `Remove your latest Gambit: ${gambitName}.`,
        removeGambitNone: "No active Gambit to remove right now."
      }
    },
    introLogs: [
      "Welcome to the dungeon. Good luck.",
      "Defeat each floor boss to descend and shape your build.",
      "WASD/Arrows move. Step into enemies to battle.",
      "Use Inventory and Shop controls in the side panel."
    ],
    logs: {
      descendFloor: (floor) => `You descend to floor ${floor}.`,
      breathRecover: (healed) => `You catch your breath and recover ${healed} HP.`,
      dangerWarning: (threat) => `You sense overwhelming danger here. Recommended level ${threat}. First contact grants ambush protection.`,
      engageEnemy: (enemyName) => `You engage ${enemyName}.`,
      openChest: "You open a chest.",
      enterBossLair: "You enter the dungeon boss lair.",
      enterShopRoom: "You find the shop room.",
      shopkeeperTuneup: "The shopkeeper offers a free build tune-up.",
      enemyAttacks: (enemyName) => `${enemyName} attacks you!`,
      dangerSenseProtected: "Your danger sense blunts the ambush. Enemy opening strike is weakened.",
      retreat: "You break line of engagement and retreat.",
      welcomeLevel: (level, points) => `Welcome to level ${level}. (${points} point${points === 1 ? "" : "s"} to spend)`,
      lootKillRewards: (gold, xp) => `Looted ${gold} gold and gained ${xp} XP.`,
      bossDownChooseReward: "The floor boss is down. Choose a Perk, a Gambit, or descend unchanged.",
      enemiesRemain: (count, floor) => `${count} enemies remain on floor ${floor}.`,
      descendWithoutModifier: "You descend without taking a new build modifier.",
      selectedBuildChoice: (kindLabel, name) => `Selected ${kindLabel}: ${name}.`,
      shopRewardBonusPoint: "Shop reward: +1 stat point.",
      shopRewardRemovedPerk: (name) => `Shop reward: removed Perk ${name}.`,
      shopRewardPerkFallbackGold: () => `No Perk to remove. You receive ${SHOP_REWARD_FALLBACK_GOLD} gold instead.`,
      shopRewardRemovedGambit: (name) => `Shop reward: removed Gambit ${name}.`,
      shopRewardGambitFallbackHeal: (amount) => `No Gambit to remove. Restored ${amount} HP instead.`,
      levelUpSpent: (label) => `Level-up point spent on ${label}.`,
      equippedItem: (itemName, slot) => `Equipped ${itemName} at ${slot}.`,
      inventoryItemRestored: (itemName, healed) => `${itemName} restored ${healed} HP.`,
      destroyedItem: (itemName) => `Destroyed ${itemName}.`,
      lootedGold: (amount) => `Looted ${amount} gold.`,
      lootedItem: (itemName) => `Looted ${itemName}.`,
      inventoryFull: "Inventory is full.",
      inventoryFullChestLeftovers: "Inventory is full. Some items were left in the chest.",
      lootedAllChest: "Looted all chest contents.",
      notEnoughGold: "Not enough gold for that purchase.",
      boughtRespecToken: "Purchased a +1 stat point respec token.",
      noActivePerkToRemove: "No active Perk to remove.",
      removedPerk: (name) => `Removed Perk ${name}.`,
      noActiveGambitToRemove: "No active Gambit to remove.",
      removedGambit: (name) => `Removed Gambit ${name}.`,
      purchasedEntry: (name, cost) => `Purchased ${name} for ${cost} gold.`,
      goldCannotBePurchased: "Gold cannot be purchased."
    }
  }
};

// src/combat.ts
function armorClassFor(defender, defenseMultiplier = 1) {
  return Math.ceil(
    10 + defender.defenseBonus * defenseMultiplier + defender.attributes.modifier("dex")
  );
}
function playerLuckBonusFromState(state, hpRatio) {
  const lowRolls = state.playerD20History.filter((roll) => roll <= PLAYER_LUCK_LOW_ROLL_THRESHOLD).length;
  const triggerExcess = Math.max(0, lowRolls - PLAYER_LUCK_LOW_ROLL_TRIGGER + 1);
  const historyBonus = Math.min(
    PLAYER_LUCK_MAX_HISTORY_BONUS,
    triggerExcess * PLAYER_LUCK_BONUS_PER_LOW_ROLL
  );
  const missStreakBonus = Math.min(
    PLAYER_LUCK_MAX_MISS_STREAK_BONUS,
    state.playerMissStreak * PLAYER_LUCK_BONUS_PER_MISS_STREAK
  );
  let hpBonus = 0;
  if (hpRatio <= PLAYER_LUCK_LOW_HP_RATIO) {
    hpBonus += PLAYER_LUCK_LOW_HP_BONUS;
  }
  if (hpRatio <= PLAYER_LUCK_CRITICAL_HP_RATIO) {
    hpBonus += PLAYER_LUCK_CRITICAL_HP_EXTRA_BONUS;
  }
  return Math.max(0, Math.min(PLAYER_LUCK_MAX_TOTAL_BONUS, historyBonus + missStreakBonus + hpBonus));
}
var Combat = class {
  constructor(dice) {
    this.dice = dice;
  }
  playerD20History = [];
  playerMissStreak = 0;
  snapshotLuckState() {
    return {
      playerD20History: [...this.playerD20History],
      playerMissStreak: this.playerMissStreak
    };
  }
  restoreLuckState(state) {
    this.playerD20History = state.playerD20History.map((roll) => Math.max(1, Math.floor(roll))).slice(-PLAYER_LUCK_HISTORY_SIZE);
    this.playerMissStreak = Math.max(0, Math.floor(state.playerMissStreak));
  }
  playerLuckBonus(player) {
    const hpRatio = player.hitpoints / Math.max(1, player.currentMaxHitpoints());
    return playerLuckBonusFromState(this.snapshotLuckState(), hpRatio);
  }
  recordPlayerD20Roll(roll, success) {
    this.playerD20History.push(roll);
    if (this.playerD20History.length > PLAYER_LUCK_HISTORY_SIZE) {
      this.playerD20History.shift();
    }
    if (success) {
      this.playerMissStreak = 0;
    } else {
      this.playerMissStreak += 1;
    }
  }
  attack(attacker, defender, attackMultiplier, defenseMultiplier, logs, moments) {
    if (!attacker.alive || !defender.alive) {
      return;
    }
    const armorClass = armorClassFor(defender, defenseMultiplier);
    const attackRoll = this.dice.roll();
    const attackBonus = attacker.attackBonus + attacker.attributes.modifier("str");
    const luckBonus = !attacker.mob ? this.playerLuckBonus(attacker) : 0;
    const totalAttackBonus = attackBonus + luckBonus;
    let attackDamageMultiplier = 1;
    if (attackRoll >= attacker.getWeaponCriticalRange()) {
      moments.push({
        type: "roll",
        phase: "crit-check",
        actor: attacker.name,
        defender: defender.name,
        roll: attackRoll,
        bonus: 0,
        total: attackRoll,
        target: attacker.getWeaponCriticalRange(),
        success: true
      });
      if (!attacker.mob) {
        const critMultiplier = attacker.getWeaponCriticalMultiplier();
        attackDamageMultiplier = critMultiplier;
        logs.push({ text: EN.combat.logs.playerCritical(attacker.name, critMultiplier), level: "success" });
        moments.push({
          type: "text",
          text: EN.combat.logs.playerCriticalMoment(attacker.name, critMultiplier),
          level: "success"
        });
        this.recordPlayerD20Roll(attackRoll, true);
      } else {
        const critConfirm = this.dice.roll() + attackBonus;
        moments.push({
          type: "roll",
          phase: "crit-confirm",
          actor: attacker.name,
          defender: defender.name,
          roll: critConfirm - attackBonus,
          bonus: attackBonus,
          total: critConfirm,
          target: armorClass,
          success: critConfirm > armorClass
        });
        if (critConfirm > armorClass) {
          attackDamageMultiplier = attacker.getWeaponCriticalMultiplier();
          logs.push({ text: EN.combat.logs.enemyCritical(attacker.name), level: "success" });
        } else {
          logs.push({ text: EN.combat.logs.enemyCriticalDowngrade(attacker.name), level: "info" });
        }
      }
    } else {
      const totalAttack = attackRoll + totalAttackBonus;
      const hit = totalAttack > armorClass;
      moments.push({
        type: "roll",
        phase: "to-hit",
        actor: attacker.name,
        defender: defender.name,
        roll: attackRoll,
        bonus: totalAttackBonus,
        total: totalAttack,
        target: armorClass,
        success: hit
      });
      if (!attacker.mob) {
        this.recordPlayerD20Roll(attackRoll, hit);
      }
      if (!hit) {
        attackDamageMultiplier *= Math.max(1, totalAttack) / Math.max(1, armorClass) * MAXIMUM_INEFFECTIVE_DAMAGE_MULTIPLIER;
        logs.push({
          text: EN.combat.logs.reducedDamageHit(attacker.name, armorClass, totalAttack),
          level: "warn"
        });
      } else {
        logs.push({ text: EN.combat.logs.hit(attacker.name, totalAttack, armorClass), level: "success" });
      }
    }
    const damageRoll = this.dice.rollNamed(attacker.getWeaponDamage());
    let damage = damageRoll;
    damage = Math.ceil(
      damage * attackDamageMultiplier * attackMultiplier * attacker.damageDealtMultiplier * defender.damageTakenMultiplier
    );
    const finalDamage = Math.max(1, damage);
    defender.hitpoints -= finalDamage;
    const remainingHp = Math.max(0, defender.hitpoints);
    logs.push({
      text: EN.combat.logs.damage(attacker.name, finalDamage, defender.name, remainingHp),
      level: "info"
    });
    if (defender.hitpoints <= 0) {
      defender.hitpoints = 0;
      defender.alive = false;
      const fallLevel = defender.mob ? "success" : "warn";
      const fallsText = EN.combat.logs.falls(defender.name);
      logs.push({ text: fallsText, level: fallLevel });
      moments.push({ type: "text", text: fallsText, level: fallLevel });
    }
    moments.push({
      type: "damage",
      actor: attacker.name,
      defender: defender.name,
      dice: attacker.getWeaponDamage(),
      roll: damageRoll,
      multiplier: attackDamageMultiplier * attackMultiplier * attacker.damageDealtMultiplier * defender.damageTakenMultiplier,
      final: finalDamage,
      remainingHp
    });
  }
  enemyAction(enemy) {
    const hpRatio = enemy.hitpoints / Math.max(1, enemy.maxHitpoints);
    if (hpRatio < ENEMY_STYLE_LOW_HP_RATIO && this.dice.roll(1, 100) <= ENEMY_STYLE_GUARDED_CHANCE_PERCENT) {
      return {
        atk: ENEMY_STYLE_GUARDED_ATTACK_MULTIPLIER,
        def: ENEMY_STYLE_GUARDED_DEFENSE_MULTIPLIER,
        name: EN.combat.enemyStyles.guarded
      };
    }
    if (this.dice.roll(1, 100) <= ENEMY_STYLE_RECKLESS_CHANCE_PERCENT) {
      return {
        atk: ENEMY_STYLE_RECKLESS_ATTACK_MULTIPLIER,
        def: ENEMY_STYLE_RECKLESS_DEFENSE_MULTIPLIER,
        name: EN.combat.enemyStyles.reckless
      };
    }
    return {
      atk: ENEMY_STYLE_STEADY_ATTACK_MULTIPLIER,
      def: ENEMY_STYLE_STEADY_DEFENSE_MULTIPLIER,
      name: EN.combat.enemyStyles.steady
    };
  }
  turn(player, enemy, action, options = {}) {
    const logs = [];
    const moments = [];
    if (!player.alive || !enemy.alive) {
      return { over: true, fled: false, logs, moments };
    }
    let playerAtkMult = 1;
    let playerDefMult = 1;
    if (action === "offensive") {
      playerAtkMult = COMBAT_OFFENSIVE_ATTACK_MULTIPLIER;
      playerDefMult = COMBAT_OFFENSIVE_DEFENSE_MULTIPLIER;
      logs.push({ text: EN.combat.logs.offensiveStance, level: "warn" });
      moments.push({ type: "text", text: EN.combat.logs.offensiveStance, level: "warn" });
    } else if (action === "defensive") {
      playerAtkMult = COMBAT_DEFENSIVE_ATTACK_MULTIPLIER;
      playerDefMult = COMBAT_DEFENSIVE_DEFENSE_MULTIPLIER;
      logs.push({ text: EN.combat.logs.defensiveStance, level: "info" });
      moments.push({ type: "text", text: EN.combat.logs.defensiveStance, level: "info" });
    }
    if (action === "flee") {
      const fleeRoll = this.dice.roll(1, FLEE_DIE_SIDES);
      const fleeBonus = player.attributes.modifier("dex") + (options.fleeBonus ?? 0) + this.playerLuckBonus(player);
      const score = fleeRoll + fleeBonus;
      const dc = FLEE_BASE_DC + enemy.attributes.modifier("dex");
      const fleeSuccess = score >= dc;
      moments.push({
        type: "roll",
        phase: "flee",
        actor: player.name,
        defender: enemy.name,
        roll: fleeRoll,
        bonus: fleeBonus,
        total: score,
        target: dc,
        success: fleeSuccess
      });
      this.recordPlayerD20Roll(fleeRoll, fleeSuccess);
      if (fleeSuccess) {
        logs.push({ text: EN.combat.logs.fleeSuccess(score, dc), level: "success" });
        moments.push({ type: "text", text: EN.combat.logs.fleeSuccessMoment(score, dc), level: "success" });
        return { over: true, fled: true, logs, moments };
      }
      logs.push({ text: EN.combat.logs.fleeFail(score, dc), level: "warn" });
      moments.push({ type: "text", text: EN.combat.logs.fleeFailMoment(score, dc), level: "warn" });
    } else if (action === "heal") {
      const heal = player.bestHealItem();
      if (heal) {
        player.inventory.remove(heal);
        const amount = player.applyInstantItem(heal);
        logs.push({ text: EN.combat.logs.heal(heal.name, amount), level: "success" });
        moments.push({
          type: "heal",
          actor: player.name,
          item: heal.name,
          amount
        });
      } else {
        logs.push({ text: EN.combat.logs.noHealingItem, level: "warn" });
        moments.push({ type: "text", text: EN.combat.logs.noHealingMoment, level: "warn" });
      }
    } else {
      this.attack(player, enemy, playerAtkMult, 1, logs, moments);
    }
    if (enemy.alive) {
      const enemyStyle = this.enemyAction(enemy);
      const styleText = EN.combat.logs.enemyStyle(enemy.name, enemyStyle.name);
      logs.push({ text: styleText, level: "info" });
      moments.push({ type: "text", text: styleText, level: "info" });
      this.attack(
        enemy,
        player,
        enemyStyle.atk * Math.max(0, options.enemyAttackMultiplier ?? 1),
        playerDefMult * enemyStyle.def,
        logs,
        moments
      );
    }
    player.think();
    enemy.think();
    const over = !player.alive || !enemy.alive;
    return { over, fled: false, logs, moments };
  }
};

// src/procgen.ts
var NAME_PARTS = {
  head: ["Helmet", "Cap", "Mask"],
  chest: ["Chestplate", "Shirt", "Vest"],
  arms: ["Gauntlets", "Sleeves", "Vambraces"],
  hands: ["Sword", "Dagger", "Club", "Mace", "Spear"],
  legs: ["Greaves", "Leggings", "Pants"],
  feet: ["Boots", "Shoes", "Sandals"]
};
var ADJECTIVES = [
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
  "radiant"
];
var ADVERBS = ["eerily", "violently", "surprisingly", "quietly", "wildly", "ominously"];
var NameGenerator = class {
  constructor(rng) {
    this.rng = rng;
  }
  seen = /* @__PURE__ */ new Set();
  generateName(slot, special = false) {
    const options = NAME_PARTS[slot];
    for (let attempt = 0; attempt < NAME_GENERATION_MAX_ATTEMPTS; attempt += 1) {
      const noun = this.rng.choice(options);
      const adjective = this.rng.choice(ADJECTIVES);
      const value = special ? `The ${this.rng.choice(ADVERBS)} ${adjective} ${noun}` : `The ${adjective} ${noun}`;
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
};
function createWeapon(name, maxDamage, challengeLevel, rng) {
  const damage = rng.int(Math.max(1, Math.floor(maxDamage / 2)), Math.max(2, maxDamage));
  const faces = Math.max(WEAPON_DAMAGE_FACE_MIN, Math.min(WEAPON_DAMAGE_FACE_MAX, damage));
  const count = Math.max(1, Math.floor(damage / faces));
  const flatBonus = Math.max(
    ITEM_WEAPON_FLAT_BONUS_BASE,
    ITEM_WEAPON_FLAT_BONUS_BASE + Math.floor(challengeLevel / ITEM_WEAPON_FLAT_BONUS_CHALLENGE_DIVISOR) + rng.int(0, ITEM_WEAPON_FLAT_BONUS_RANDOM_MAX)
  );
  const critRange = rng.int(PLAYER_CRIT_MINIMUM_ROLL, WEAPON_CRIT_MAXIMUM_ROLL);
  const critMult = rng.int(1, PLAYER_CRIT_MAXIMUM_MULTIPLIER);
  return new Weapon(name, critRange, critMult, challengeLevel + 1, 0, `${count}d${faces} +${flatBonus}`);
}
function createArmor(name, slot, challengeLevel, rng) {
  return new Armor(
    slot,
    name,
    challengeLevel,
    rng.int(ITEM_ARMOR_DEFENSE_BASE_MIN, challengeLevel + ITEM_ARMOR_DEFENSE_CHALLENGE_BONUS)
  );
}
function creatureAtLevel(challengeLevel, names, rng) {
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
      chr: 8
    })
  );
  creature.attributes.modify("str", CREATURE_BASE_STR);
  creature.attributes.modify("dex", CREATURE_BASE_DEX);
  creature.attributes.modify("con", CREATURE_BASE_CON);
  creature.attackBonus = CREATURE_BASE_ATTACK_BONUS;
  creature.defenseBonus = CREATURE_BASE_DEFENSE_BONUS;
  const weapon = createWeapon(names.generateName("hands"), maxDamage, challengeLevel, rng);
  const armorSlot = rng.choice(["chest", "arms", "feet"]);
  const armor = createArmor(names.generateName(armorSlot), armorSlot, challengeLevel, rng);
  creature.wield("hands", weapon);
  creature.wield(armorSlot, armor);
  creature.maxHitpoints = rng.int(minHp, maxHp);
  creature.hitpoints = creature.maxHitpoints;
  return creature;
}

// src/tests/assert.ts
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message} (expected ${String(expected)}, got ${String(actual)})`);
  }
}

// src/tests/combat.test.ts
var FixedDice = class {
  queue;
  constructor(rolls) {
    this.queue = [...rolls];
  }
  roll(low = 1, high = 20) {
    const next = this.queue.shift() ?? low;
    return Math.max(low, Math.min(high, next));
  }
  rollNamed(_name) {
    return 1;
  }
  minMax(_name) {
    return [1, 1];
  }
};
function makeCreature(name, hp = 100) {
  const creature = new Creature(
    name,
    { x: 0, y: 0 },
    new AttributeSet({ str: 10, dex: 10, con: 10, int: 10, wis: 10, chr: 10 })
  );
  creature.hitpoints = hp;
  creature.maxHitpoints = hp;
  creature.attackBonus = 0;
  creature.defenseBonus = 0;
  return creature;
}
function runCombatTests() {
  const rng = new SeededRandom("mob-ac-range");
  const names = new NameGenerator(rng);
  let maxAc = 0;
  for (let i = 0; i < 80; i += 1) {
    const mob = creatureAtLevel(0, names, rng);
    maxAc = Math.max(maxAc, armorClassFor(mob));
  }
  assert(maxAc <= 14, `Level-0 mob AC should stay manageable (<=14), got ${maxAc}`);
  const neutralLuck = playerLuckBonusFromState(
    { playerD20History: [12, 14, 16, 18], playerMissStreak: 0 },
    0.9
  );
  assertEqual(neutralLuck, 0, "Luck bonus should be 0 with healthy HP and normal rolls");
  const pressuredLuck = playerLuckBonusFromState(
    { playerD20History: [1, 2, 3, 4, 5, 6, 7, 8], playerMissStreak: 3 },
    0.1
  );
  assert(pressuredLuck >= 4, `Luck bonus should increase under pressure, got ${pressuredLuck}`);
  const player = makeCreature("Player", 100);
  player.maxHitpoints = 100;
  player.hitpoints = 10;
  const enemy = makeCreature("Goblin", 100);
  enemy.defenseBonus = 1;
  enemy.mob = true;
  const combat = new Combat(new FixedDice([9, 80, 9]));
  combat.restoreLuckState({
    playerD20History: [1, 2, 3, 4, 5, 6, 7, 8],
    playerMissStreak: 2
  });
  const result = combat.turn(player, enemy, "normal");
  const playerRoll = result.moments.find(
    (moment) => moment.type === "roll" && moment.actor === "Player" && moment.phase === "to-hit"
  );
  assert(!!playerRoll && playerRoll.type === "roll", "Expected player to-hit roll moment");
  if (!playerRoll || playerRoll.type !== "roll") {
    return;
  }
  assert(playerRoll.bonus > 0, `Expected positive luck-adjusted to-hit bonus, got ${playerRoll.bonus}`);
  assert(playerRoll.success, "Expected luck-adjusted roll to convert the hit check to success");
}

// src/tests/dice.test.ts
function runDiceTests() {
  const dice = new Dice(new SeededRandom("dice-flat-modifier"));
  assertEqual(dice.rollNamed("1d1 +5"), 6, "Dice roll should include +modifier");
  assertEqual(dice.rollNamed("2d1+3"), 5, "Dice roll should parse +modifier without spaces");
  const minMaxA = dice.minMax("2d4 +3");
  assertEqual(minMaxA[0], 5, "Dice min should include modifier");
  assertEqual(minMaxA[1], 11, "Dice max should include modifier");
  const minMaxB = dice.minMax("3d6-2");
  assertEqual(minMaxB[0], 1, "Dice min should support negative modifier");
  assertEqual(minMaxB[1], 16, "Dice max should support negative modifier");
}

// src/tests/procgen.test.ts
function runProcgenTests() {
  const rng = new SeededRandom("procgen-dice-format");
  const firstWeapon = createWeapon("Test Blade", 10, 1, rng);
  assert(
    /^\d+\s*d\s*\d+\s*\+\s*\d+$/i.test(firstWeapon.damage()),
    `Procgen weapon damage should include flat bonus, got: ${firstWeapon.damage()}`
  );
  const procgenRng = new SeededRandom("procgen-min-damage");
  const dice = new Dice(new SeededRandom("procgen-min-damage-dice"));
  for (let i = 0; i < 80; i += 1) {
    const weapon = createWeapon(`Blade-${i}`, 6, 0, procgenRng);
    const [minDamage] = dice.minMax(weapon.damage());
    assert(minDamage > 1, `Procgen min damage should be >1, got ${minDamage} from ${weapon.damage()}`);
  }
}

// src/tests/run.ts
var tests = [
  { name: "dice", run: runDiceTests },
  { name: "procgen", run: runProcgenTests },
  { name: "combat", run: runCombatTests }
];
var failures = 0;
for (const test of tests) {
  try {
    test.run();
    console.log(`PASS ${test.name}`);
  } catch (error) {
    failures += 1;
    const message = error instanceof Error ? error.message : String(error);
    console.error(`FAIL ${test.name}: ${message}`);
  }
}
if (failures > 0) {
  const maybeProcess = globalThis;
  if (maybeProcess.process) {
    maybeProcess.process.exitCode = 1;
  }
  throw new Error(`${failures} unit test suite(s) failed.`);
}
console.log(`PASS all ${tests.length} test suites`);
