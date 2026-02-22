// src/constants.ts
var WORLD_WIDTH = 64;
var WORLD_HEIGHT = 64;
var PLAYER_INITIAL_HP = 30;
var PLAYER_CONSTITUTION_BONUS = 5;
var PLAYER_START_X = 4;
var PLAYER_START_Y = 4;
var PLAYER_BASE_ATTACK_BONUS = 2;
var PLAYER_BASE_DEFENSE_BONUS = 2;
var PLAYER_BASE_DEFENSE = 5;
var PLAYER_INVENTORY_CAPACITY = 10;
var CHALLENGE_LEVEL_SCALE_UP_FACTOR = 1.3;
var MAXIMUM_CHALLENGE_LEVEL = 10;
var BOSS_CHALLENGE_LEVEL = MAXIMUM_CHALLENGE_LEVEL + 5;
var FLOOR_DEPTH_SCALE_PER_FLOOR = 0.02;
var PLAYER_CRIT_MINIMUM_ROLL = 18;
var PLAYER_CRIT_MINIMUM_MULTIPLIER = 2;
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
var CREATURE_XP_MULTIPLIER = 2;
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
var SHOP_DISCOUNT_FOR_CHARISMA = 0.05;
var SHOP_SERVICE_COST_BONUS_POINT = 180;
var SHOP_SERVICE_COST_REMOVE_PERK = 260;
var SHOP_SERVICE_COST_REMOVE_GAMBIT = 240;
var SHOP_REWARD_FALLBACK_GOLD = 120;
var BANDAGES_HEAL_HP = 5;
var HEALTH_POTION_HEAL_HP = BANDAGES_HEAL_HP * 5;
var LARGE_HEALTH_POTION_HEAL_HP = HEALTH_POTION_HEAL_HP * 2;
var HUGE_HEALTH_POTION_HEAL_HP = HEALTH_POTION_HEAL_HP * 4;
var COLOSSAL_HEALTH_POTION_HEAL_HP = HEALTH_POTION_HEAL_HP * 10;
var BANDAGES_GOLD_VALUE = 10;
var HEALTH_POTION_GOLD_VALUE = 50;
var LARGE_HEALTH_POTION_GOLD_VALUE = 250;
var HUGE_HEALTH_POTION_GOLD_VALUE = 750;
var COLOSSAL_HEALTH_POTION_GOLD_VALUE = 1250;
var INSTAHEAL_GOLD_VALUE = 15e3;
var STARTING_BANDAGE_COUNT = 5;
var STARTING_WEAPON_CRITICAL_RANGE = 19;
var STARTING_WEAPON_CRITICAL_MULTIPLIER = 3;
var STARTING_WEAPON_ATTACK_BONUS = 0;
var STARTING_WEAPON_DEFENSE_BONUS = 0;
var STARTING_WEAPON_DAMAGE_DICE = "1d10";
var TURN_EFFECT_DEFAULT_LIFETIME = 5;
var POISON_DEFAULT_DAMAGE_PER_TURN = 5;
var BUFF_DEFAULT_HP = 5;
var BUFF_DEFAULT_ATTACK = 2;
var BUFF_DEFAULT_DEFENSE = 2;
var CHEST_DEFAULT_CAPACITY = 5;
var FLOOR_CHEST_CAPACITY = 6;
var ITEM_POOL_GENERATION_COUNT = 260;
var ITEM_SPECIAL_ROLL_MIN = 19;
var ITEM_SPECIAL_VALUE_MULTIPLIER = 3;
var ITEM_DEFAULT_VALUE_MULTIPLIER = 1;
var NAME_GENERATION_MAX_ATTEMPTS = 200;
var NAME_GENERATION_FALLBACK_MAX_ID = 1e5;
var ITEM_WEAPON_MAX_DAMAGE_ROLL_MIN = 6;
var ITEM_WEAPON_MAX_DAMAGE_ROLL_MAX = 24;
var WEAPON_DAMAGE_FACE_MIN = 2;
var WEAPON_DAMAGE_FACE_MAX = 20;
var ITEM_WEAPON_CHALLENGE_ROLL_MIN = 1;
var ITEM_WEAPON_CHALLENGE_ROLL_MAX = 6;
var ITEM_WEAPON_FLAT_BONUS_BASE = 1;
var ITEM_WEAPON_FLAT_BONUS_CHALLENGE_DIVISOR = 2;
var ITEM_WEAPON_FLAT_BONUS_RANDOM_MAX = 3;
var ITEM_ARMOR_CHALLENGE_ROLL_MIN = 1;
var ITEM_ARMOR_CHALLENGE_ROLL_MAX = 6;
var ITEM_ARMOR_DEFENSE_BASE_MIN = 1;
var ITEM_ARMOR_DEFENSE_CHALLENGE_BONUS = 2;
var ITEM_WEAPON_VALUE_DIE_SIDES = 8;
var ITEM_WEAPON_VALUE_DIE_MULTIPLIER = 10;
var ITEM_ARMOR_VALUE_ATTACK_WEIGHT = 3;
var ITEM_ARMOR_VALUE_DEFENSE_WEIGHT = 2;
var SHOP_TOP_WEAPONS = 5;
var SHOP_TOP_ARMORS = 5;
var SHOP_CLUTTER_DENSITY_DIVISOR = 3;
var FLOOR_MOB_BASE = 3;
var FLOOR_MOB_PER_FLOOR = 0.5;
var FLOOR_CHEST_BASE = 5;
var FLOOR_CHEST_PER_FLOOR = 0.4;
var FLOOR_SCALE_MINIMUM = 0.2;
var BOSS_STR_BONUS_BASE = 8;
var BOSS_DEX_BONUS_BASE = 4;
var BOSS_DEX_BONUS_FLOOR_DIVISOR = 2;
var BOSS_CON_BONUS_BASE = 6;
var BOSS_HP_SCALE_PER_FLOOR = 0.16;
var CHEST_WEAPON_ROLL_MIN = 13;
var CHEST_ARMOR_ROLL_MIN = 16;
var CHEST_GOLD_ROLL_MIN = 8;
var CHEST_HUGE_POTION_ROLL_MIN = 20;
var CHEST_LARGE_OR_HEALTH_ROLL_MIN = 19;
var CHEST_TIERED_POTION_ROLL_MIN = 18;
var CHEST_HIGH_TIER_LEVEL = 8;
var CHEST_MID_TIER_LEVEL = 5;
var CHEST_GOLD_DICE = "6d20";
var FLOOR_TRANSITION_HEAL_RATIO = 0.35;
var FLOOR_TRANSITION_HEAL_MINIMUM = 4;
var SHOP_REWARD_HEAL_FALLBACK_RATIO = 0.35;
var AI_MOVE_MS = 450;
var AI_WANDER_ROLL_MAX = 12;
var AI_WANDER_MOVE_ROLL_MIN = 9;
var LOG_LIMIT = 9;
var DANGER_WARNING_LEVEL_GAP = 2;
var SURPRISE_PROTECTION_ATTACK_MULTIPLIER = 0.35;
var SURPRISE_PROTECTION_FLEE_BONUS = 6;
var DEFAULT_ATTRS = {
  str: 14,
  dex: 12,
  con: 14,
  int: 10,
  wis: 10,
  chr: 10
};
var STARTING_ATTRS = {
  str: 16,
  dex: 14,
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
function getNextItemId() {
  return itemId;
}
function setNextItemId(nextId2) {
  itemId = Math.max(1, Math.floor(nextId2));
}
var Item = class {
  constructor(name) {
    this.name = name;
    this.id = allocItemId();
  }
  id;
  value = 1;
};
function assignItemMeta(item, id, value) {
  item.id = id;
  item.value = value;
  return item;
}
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
    this.damageDice = damageDice;
    this.critMult = Math.max(PLAYER_CRIT_MINIMUM_MULTIPLIER, critMult);
  }
  critMult;
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
    const critRange = this.critRange;
    const critPercent = (WEAPON_CRIT_MAXIMUM_ROLL - critRange + 1) / 20;
    return `Deals ${this.damageDice} damage. Critical hit: d20 >= ${critRange} for x${this.critMult} dmg (${(critPercent * 100).toFixed(2)}% chance)`;
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
    const next = Math.min(
      maxHp,
      Math.max(0, currentHp + this.hpBoost - this.hpDrop)
    );
    return { hp: next, delta: next - previous };
  }
  describe() {
    return `${this.name} heals ${this.hpBoost} HP`;
  }
};
var TurnBasedEffectItem = class extends Item {
  constructor(name, lifetime = TURN_EFFECT_DEFAULT_LIFETIME) {
    super(name);
    this.lifetime = lifetime;
  }
  expiryTurn = 0;
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
};
var Poison = class extends TurnBasedEffectItem {
  constructor(name, damagePerTurn = POISON_DEFAULT_DAMAGE_PER_TURN, lifetime = TURN_EFFECT_DEFAULT_LIFETIME) {
    super(name, lifetime);
    this.damagePerTurn = damagePerTurn;
  }
  describe() {
    return `${this.name} deals ${this.damagePerTurn}/turn for ${this.lifetime} turns`;
  }
};
var Buff = class extends TurnBasedEffectItem {
  constructor(name, hpBuff = BUFF_DEFAULT_HP, attackBuff = BUFF_DEFAULT_ATTACK, defenseBuff = BUFF_DEFAULT_DEFENSE, lifetime = TURN_EFFECT_DEFAULT_LIFETIME) {
    super(name, lifetime);
    this.hpBuff = hpBuff;
    this.attackBuff = attackBuff;
    this.defenseBuff = defenseBuff;
  }
  describe() {
    return `${this.name} +${this.hpBuff} HP +${this.attackBuff} ATK +${this.defenseBuff} DEF (${this.lifetime} turns)`;
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
    const idx = this.inventory.findIndex(
      (candidate) => candidate.id === item.id
    );
    if (idx >= 0) {
      this.inventory.splice(idx, 1);
    }
  }
  empty() {
    return this.inventory.length === 0;
  }
};
var Chest = class extends Container {
  constructor(x, y, capacity = CHEST_DEFAULT_CAPACITY) {
    super(capacity);
    this.x = x;
    this.y = y;
  }
};
function serializeItem(item) {
  if (item instanceof Gold) {
    return {
      kind: "gold",
      id: item.id,
      name: item.name,
      value: item.value,
      amount: item.amount
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
      defenseBonus: item.getDefenseBonus()
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
      damageDice: item.damage()
    };
  }
  if (item instanceof InstantEffectItem) {
    return {
      kind: "instant",
      id: item.id,
      name: item.name,
      value: item.value,
      hpBoost: item.hpBoost,
      hpDrop: item.hpDrop
    };
  }
  if (item instanceof Poison) {
    return {
      kind: "poison",
      id: item.id,
      name: item.name,
      value: item.value,
      damagePerTurn: item.damagePerTurn,
      lifetime: item.lifetime
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
      lifetime: item.lifetime
    };
  }
  throw new Error(
    `Unsupported item serialization kind: ${item.constructor.name}`
  );
}
function deserializeItem(serialized) {
  if (serialized.kind === "gold") {
    return assignItemMeta(
      new Gold(serialized.amount),
      serialized.id,
      serialized.value
    );
  }
  if (serialized.kind === "armor") {
    return assignItemMeta(
      new Armor(
        serialized.slot,
        serialized.name,
        serialized.attackBonus,
        serialized.defenseBonus
      ),
      serialized.id,
      serialized.value
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
        serialized.damageDice
      ),
      serialized.id,
      serialized.value
    );
  }
  if (serialized.kind === "instant") {
    return assignItemMeta(
      new InstantEffectItem(
        serialized.name,
        serialized.hpBoost,
        serialized.hpDrop
      ),
      serialized.id,
      serialized.value
    );
  }
  if (serialized.kind === "poison") {
    return assignItemMeta(
      new Poison(
        serialized.name,
        serialized.damagePerTurn,
        serialized.lifetime
      ),
      serialized.id,
      serialized.value
    );
  }
  return assignItemMeta(
    new Buff(
      serialized.name,
      serialized.hpBuff,
      serialized.attackBuff,
      serialized.defenseBuff,
      serialized.lifetime
    ),
    serialized.id,
    serialized.value
  );
}

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
  int: "Aptitude for lore and study.",
  wis: "Aptitude for instincts and awareness.",
  chr: "Improves shop discounts."
};
var EN = {
  ui: {
    appTitle: "Survive the Dungeon",
    menuSubtitle: "Descend floor by floor, gather gear, and survive the boss gauntlet.",
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
      gambit: "Gambit",
      wieldingNothing: "Wielding nothing."
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
    return Math.max(
      1,
      Math.floor(this.maxHitpoints * this.hitpointCapMultiplier)
    );
  }
  enforceHitpointCap() {
    const cap = this.currentMaxHitpoints();
    this.hitpoints = Math.min(cap, this.hitpoints);
  }
  rollMobGold(dice) {
    const count = Math.max(
      1,
      Math.ceil(this.maxHitpoints / CREATURE_GOLD_SCALER)
    );
    this.gold = Math.floor(
      dice.rollNamed(`${count}d20`) * CREATURE_GOLD_MULTIPLIER
    );
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
    const critMult = Math.max(
      PLAYER_CRIT_MINIMUM_MULTIPLIER,
      weapon.criticalMultiplier()
    );
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
  getWields() {
    const result = [];
    for (const slot of SLOTS) {
      const item = this.wieldpoints[slot];
      if (item) {
        result.push({ slot, item });
      }
    }
    return result;
  }
  describeWields() {
    const lines = [];
    for (const slot of SLOTS) {
      const item = this.wieldpoints[slot];
      if (item) {
        lines.push(`${slot}: ${item.name} - ${item.describe()}`);
      }
    }
    if (lines.length === 0) {
      return EN.game.labels.wieldingNothing;
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
      const idx = this.poisons.findIndex(
        (candidate) => candidate.id === poison.id
      );
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
      this.maxHitpoints = Math.floor(
        this.maxHitpoints * PLAYER_HP_PER_LEVEL_MULTIPLIER
      );
      const heal = Math.floor(this.maxHitpoints * PLAYER_HP_HEAL_ON_LEVEL_UP);
      this.hitpoints = Math.min(
        this.currentMaxHitpoints(),
        this.hitpoints + heal
      );
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
    const heals = this.inventory.items().filter(
      (item) => item instanceof InstantEffectItem && item.hpBoost > 0
    ).sort((a, b) => a.hpBoost - b.hpBoost);
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
    return this.inventory.items().filter(
      (item) => item instanceof InstantEffectItem && item.hpBoost > 0
    );
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
function makeSeedPhrase(userValue) {
  const trimmed = userValue.trim();
  if (trimmed.length > 0) {
    return trimmed;
  }
  return `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

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
    const defenderFalls = defender.hitpoints <= 0;
    if (defenderFalls) {
      defender.hitpoints = 0;
      defender.alive = false;
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
    if (defenderFalls) {
      const fallLevel = defender.mob ? "success" : "warn";
      const fallsText = EN.combat.logs.falls(defender.name);
      logs.push({ text: fallsText, level: fallLevel });
      moments.push({ type: "text", text: fallsText, level: fallLevel });
    }
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
  const critMult = rng.int(PLAYER_CRIT_MINIMUM_MULTIPLIER, PLAYER_CRIT_MAXIMUM_MULTIPLIER);
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
  const finisherPlayer = makeCreature("Player", 10);
  const finisherEnemy = makeCreature("Goblin", 1);
  finisherEnemy.mob = true;
  const finisherCombat = new Combat(new FixedDice([11]));
  const finisherResult = finisherCombat.turn(finisherPlayer, finisherEnemy, "normal");
  const damageMomentIndex = finisherResult.moments.findIndex((moment) => moment.type === "damage" && moment.actor === "Player" && moment.defender === "Goblin");
  const fallsMomentIndex = finisherResult.moments.findIndex((moment) => moment.type === "text" && moment.text === "Goblin falls.");
  assert(damageMomentIndex >= 0, "Expected a player damage moment when delivering a finishing blow");
  assert(
    fallsMomentIndex > damageMomentIndex,
    "Defeat moment should appear after the damage moment in combat roll playback"
  );
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

// src/buildChoices.ts
var PERK_POOL = [
  {
    id: "perk-iron-frame",
    name: EN.game.buildChoices.perks.ironFrame.name,
    description: EN.game.buildChoices.perks.ironFrame.description,
    kind: "perk",
    maxHitpoints: 28,
    defenseBonus: 2
  },
  {
    id: "perk-duelist-instinct",
    name: EN.game.buildChoices.perks.duelistInstinct.name,
    description: EN.game.buildChoices.perks.duelistInstinct.description,
    kind: "perk",
    attackBonus: 3,
    attributes: { dex: 1 }
  },
  {
    id: "perk-scavenger-wits",
    name: EN.game.buildChoices.perks.scavengerWits.name,
    description: EN.game.buildChoices.perks.scavengerWits.description,
    kind: "perk",
    attributes: { str: 2, chr: 2 }
  },
  {
    id: "perk-relentless-edge",
    name: EN.game.buildChoices.perks.relentlessEdge.name,
    description: EN.game.buildChoices.perks.relentlessEdge.description,
    kind: "perk",
    damageDealtMultiplier: 1.2
  },
  {
    id: "perk-warding-shell",
    name: EN.game.buildChoices.perks.wardingShell.name,
    description: EN.game.buildChoices.perks.wardingShell.description,
    kind: "perk",
    damageTakenMultiplier: 0.85
  }
];
var GAMBIT_POOL = [
  {
    id: "gambit-blood-oath",
    name: EN.game.buildChoices.gambits.bloodOath.name,
    description: EN.game.buildChoices.gambits.bloodOath.description,
    kind: "gambit",
    damageDealtMultiplier: 2,
    hitpointCapMultiplier: 0.5
  },
  {
    id: "gambit-berserker-stance",
    name: EN.game.buildChoices.gambits.berserkerStance.name,
    description: EN.game.buildChoices.gambits.berserkerStance.description,
    kind: "gambit",
    attackBonus: 6,
    defenseBonus: -4
  },
  {
    id: "gambit-hollow-core",
    name: EN.game.buildChoices.gambits.hollowCore.name,
    description: EN.game.buildChoices.gambits.hollowCore.description,
    kind: "gambit",
    damageDealtMultiplier: 1.6,
    maxHitpoints: -25
  },
  {
    id: "gambit-mirrored-pain",
    name: EN.game.buildChoices.gambits.mirroredPain.name,
    description: EN.game.buildChoices.gambits.mirroredPain.description,
    kind: "gambit",
    damageDealtMultiplier: 1.35,
    damageTakenMultiplier: 1.7
  },
  {
    id: "gambit-brittle-focus",
    name: EN.game.buildChoices.gambits.brittleFocus.name,
    description: EN.game.buildChoices.gambits.brittleFocus.description,
    kind: "gambit",
    attributes: { str: 4, dex: 4, con: -3 }
  }
];
var BUILD_CHOICE_BY_ID = new Map(
  [...PERK_POOL, ...GAMBIT_POOL].map((choice) => [choice.id, choice])
);
function findBuildChoice(id) {
  const choice = BUILD_CHOICE_BY_ID.get(id);
  if (!choice) {
    throw new Error(`Unknown build choice id: ${id}`);
  }
  return choice;
}

// src/lootAndShopStock.ts
function makeBandages() {
  const item = new InstantEffectItem(EN.game.itemNames.bandages, BANDAGES_HEAL_HP);
  item.value = BANDAGES_GOLD_VALUE;
  return item;
}
function makeHealthPotion() {
  const item = new InstantEffectItem(EN.game.itemNames.healthPotion, HEALTH_POTION_HEAL_HP);
  item.value = HEALTH_POTION_GOLD_VALUE;
  return item;
}
function makeLargePotion() {
  const item = new InstantEffectItem(EN.game.itemNames.largeHealthPotion, LARGE_HEALTH_POTION_HEAL_HP);
  item.value = LARGE_HEALTH_POTION_GOLD_VALUE;
  return item;
}
function makeHugePotion() {
  const item = new InstantEffectItem(EN.game.itemNames.hugeHealthPotion, HUGE_HEALTH_POTION_HEAL_HP);
  item.value = HUGE_HEALTH_POTION_GOLD_VALUE;
  return item;
}
function makeColossalPotion() {
  const item = new InstantEffectItem(EN.game.itemNames.colossalHealthPotion, COLOSSAL_HEALTH_POTION_HEAL_HP);
  item.value = COLOSSAL_HEALTH_POTION_GOLD_VALUE;
  return item;
}
function makeInstaheal() {
  const item = new InstantEffectItem(EN.game.itemNames.instaheal, 1e9);
  item.value = INSTAHEAL_GOLD_VALUE;
  return item;
}
function generateItemPools(dice, rng, nameGenerator) {
  const weapons = [];
  const armors = [];
  for (let i = 0; i < ITEM_POOL_GENERATION_COUNT; i += 1) {
    const special = dice.roll() >= ITEM_SPECIAL_ROLL_MIN;
    const valueMultiplier = special ? ITEM_SPECIAL_VALUE_MULTIPLIER : ITEM_DEFAULT_VALUE_MULTIPLIER;
    const mountpoint = rng.choice(["head", "chest", "arms", "hands", "legs", "feet"]);
    const name = nameGenerator.generateName(mountpoint, special);
    if (mountpoint === "hands") {
      const weapon = createWeapon(
        name,
        dice.roll(ITEM_WEAPON_MAX_DAMAGE_ROLL_MIN, ITEM_WEAPON_MAX_DAMAGE_ROLL_MAX),
        dice.roll(ITEM_WEAPON_CHALLENGE_ROLL_MIN, ITEM_WEAPON_CHALLENGE_ROLL_MAX),
        rng
      );
      weapon.value = Math.floor(
        (dice.roll(1, ITEM_WEAPON_VALUE_DIE_SIDES) * ITEM_WEAPON_VALUE_DIE_MULTIPLIER + weapon.getAttackBonus() + weapon.getDefenseBonus()) * valueMultiplier
      );
      weapons.push(weapon);
    } else {
      const armor = createArmor(name, mountpoint, dice.roll(ITEM_ARMOR_CHALLENGE_ROLL_MIN, ITEM_ARMOR_CHALLENGE_ROLL_MAX), rng);
      armor.value = Math.floor(
        (armor.getAttackBonus() * ITEM_ARMOR_VALUE_ATTACK_WEIGHT + armor.getDefenseBonus() * ITEM_ARMOR_VALUE_DEFENSE_WEIGHT) * valueMultiplier
      );
      armors.push(armor);
    }
  }
  weapons.sort((a, b) => b.value - a.value);
  armors.sort((a, b) => b.value - a.value);
  return { weapons, armors };
}
function makeShopServiceEntries(nextId2) {
  const services = [
    {
      id: "bonus-point",
      name: EN.game.shop.services.bonusPoint.name,
      description: EN.game.shop.services.bonusPoint.description,
      value: SHOP_SERVICE_COST_BONUS_POINT
    },
    {
      id: "remove-perk",
      name: EN.game.shop.services.removePerk.name,
      description: EN.game.shop.services.removePerk.description,
      value: SHOP_SERVICE_COST_REMOVE_PERK
    },
    {
      id: "remove-gambit",
      name: EN.game.shop.services.removeGambit.name,
      description: EN.game.shop.services.removeGambit.description,
      value: SHOP_SERVICE_COST_REMOVE_GAMBIT
    }
  ];
  return services.map((service) => ({
    id: nextId2("shop-service"),
    kind: "service",
    name: service.name,
    description: service.description,
    value: service.value,
    item: null,
    serviceId: service.id,
    sold: false
  }));
}
function createShopStock(items, nextId2) {
  const serviceEntries = makeShopServiceEntries(nextId2);
  const itemEntries = items.map((item) => ({
    id: item.id,
    kind: "item",
    name: item.name,
    description: item.describe(),
    value: item.value,
    item,
    serviceId: null,
    sold: false
  }));
  return [...serviceEntries, ...itemEntries];
}

// src/types.ts
var ROOM_START = 1;
var ROOM_BOSS = 2;
var ROOM_SHOP = 4;

// src/mapgen.ts
function keyOf(pos) {
  return `${pos.x},${pos.y}`;
}
function centerOf(room) {
  return {
    x: room.x + Math.floor(room.w / 2),
    y: room.y + Math.floor(room.h / 2)
  };
}
function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
function overlaps(a, b, padding = 1) {
  const ax = a.x - padding;
  const ay = a.y - padding;
  const aw = a.w + padding * 2;
  const ah = a.h + padding * 2;
  const bx = b.x - padding;
  const by = b.y - padding;
  const bw = b.w + padding * 2;
  const bh = b.h + padding * 2;
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
function roomContains(room, pos) {
  return pos.x >= room.x && pos.x < room.x + room.w && pos.y >= room.y && pos.y < room.y + room.h;
}
var WorldMap = class {
  constructor(width, height, rooms, cells) {
    this.width = width;
    this.height = height;
    this.rooms = rooms;
    this.cells = cells;
    this.visible = new Uint8Array(width * height);
    this.explored = new Uint8Array(width * height);
  }
  cells;
  visible;
  explored;
  inBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }
  idx(x, y) {
    return y * this.width + x;
  }
  tileAt(x, y) {
    if (!this.inBounds(x, y)) {
      return 0 /* Empty */;
    }
    return this.cells[this.idx(x, y)];
  }
  setTile(x, y, tile, replace = true) {
    if (!this.inBounds(x, y)) {
      return;
    }
    const index = this.idx(x, y);
    if (!replace && this.cells[index] !== 0 /* Empty */) {
      return;
    }
    this.cells[index] = tile;
  }
  isPassable(x, y) {
    const tile = this.tileAt(x, y);
    return tile === 1 /* Room */ || tile === 2 /* Hall */;
  }
  roomAt(pos) {
    for (const room of this.rooms) {
      if (roomContains(room, pos)) {
        return room;
      }
    }
    return null;
  }
  lineOfSight(a, b) {
    let x0 = a.x;
    let y0 = a.y;
    const x1 = b.x;
    const y1 = b.y;
    const dx = Math.abs(x1 - x0);
    const sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0);
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    while (true) {
      if (!(x0 === a.x && y0 === a.y) && !this.isPassable(x0, y0)) {
        return false;
      }
      if (x0 === x1 && y0 === y1) {
        return true;
      }
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x0 += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y0 += sy;
      }
    }
  }
  updateFov(origin, radius = 8) {
    this.visible.fill(0);
    const minX = Math.max(0, origin.x - radius);
    const maxX = Math.min(this.width - 1, origin.x + radius);
    const minY = Math.max(0, origin.y - radius);
    const maxY = Math.min(this.height - 1, origin.y + radius);
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const dx = x - origin.x;
        const dy = y - origin.y;
        if (dx * dx + dy * dy > radius * radius) {
          continue;
        }
        const target = { x, y };
        if (this.lineOfSight(origin, target)) {
          const idx = this.idx(x, y);
          this.visible[idx] = 1;
          this.explored[idx] = 1;
        }
      }
    }
  }
  pathTo(start, end, blocked) {
    if (start.x === end.x && start.y === end.y) {
      return [];
    }
    const frontier = [start];
    const cameFrom = /* @__PURE__ */ new Map();
    const seen = /* @__PURE__ */ new Set([keyOf(start)]);
    let cursor = 0;
    while (cursor < frontier.length) {
      const current = frontier[cursor];
      cursor += 1;
      if (current.x === end.x && current.y === end.y) {
        break;
      }
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
      ]) {
        const next = { x: current.x + dx, y: current.y + dy };
        if (!this.inBounds(next.x, next.y)) {
          continue;
        }
        if (!this.isPassable(next.x, next.y)) {
          continue;
        }
        const nextKey = keyOf(next);
        if (blocked.has(nextKey) && !(next.x === end.x && next.y === end.y)) {
          continue;
        }
        if (seen.has(nextKey)) {
          continue;
        }
        seen.add(nextKey);
        cameFrom.set(nextKey, current);
        frontier.push(next);
      }
    }
    const path = [];
    let step = end;
    while (step && !(step.x === start.x && step.y === start.y)) {
      path.push(step);
      step = cameFrom.get(keyOf(step));
      if (!step) {
        return [];
      }
    }
    path.reverse();
    return path;
  }
};
function carveRoom(cells, width, room) {
  for (let y = room.y; y < room.y + room.h; y += 1) {
    for (let x = room.x; x < room.x + room.w; x += 1) {
      cells[y * width + x] = 1 /* Room */;
    }
  }
}
function carveTunnel(cells, width, height, from, to) {
  let x = from.x;
  let y = from.y;
  const xStep = to.x >= from.x ? 1 : -1;
  while (x !== to.x) {
    if (x >= 0 && x < width && y >= 0 && y < height && cells[y * width + x] === 0 /* Empty */) {
      cells[y * width + x] = 2 /* Hall */;
    }
    x += xStep;
  }
  const yStep = to.y >= from.y ? 1 : -1;
  while (y !== to.y) {
    if (x >= 0 && x < width && y >= 0 && y < height && cells[y * width + x] === 0 /* Empty */) {
      cells[y * width + x] = 2 /* Hall */;
    }
    y += yStep;
  }
  if (x >= 0 && x < width && y >= 0 && y < height && cells[y * width + x] === 0 /* Empty */) {
    cells[y * width + x] = 2 /* Hall */;
  }
}
var CARDINAL_STEPS = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 }
];
function isReverse(a, b) {
  return a.x === -b.x && a.y === -b.y;
}
function carveLabyrinthBranches(cells, width, height, rng) {
  const hallStarts = [];
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      if (cells[y * width + x] === 2 /* Hall */) {
        hallStarts.push({ x, y });
      }
    }
  }
  if (hallStarts.length === 0) {
    return;
  }
  const branchCount = Math.max(16, Math.floor(width * height / 180));
  for (let i = 0; i < branchCount; i += 1) {
    const start = rng.choice(hallStarts);
    let cursor = { x: start.x, y: start.y };
    let direction = rng.choice(CARDINAL_STEPS);
    const steps = rng.int(7, 28);
    for (let step = 0; step < steps; step += 1) {
      if (rng.chance(0.35)) {
        const nextDirectionOptions = CARDINAL_STEPS.filter((candidate) => !isReverse(candidate, direction));
        direction = rng.choice(nextDirectionOptions);
      }
      const next = { x: cursor.x + direction.x, y: cursor.y + direction.y };
      if (next.x < 1 || next.y < 1 || next.x >= width - 1 || next.y >= height - 1) {
        break;
      }
      const idx = next.y * width + next.x;
      const tile = cells[idx];
      if (tile === 1 /* Room */) {
        break;
      }
      if (tile === 0 /* Empty */) {
        cells[idx] = 2 /* Hall */;
      }
      cursor = next;
      if (rng.chance(0.15)) {
        const sides = CARDINAL_STEPS.filter((candidate) => candidate.x !== direction.x || candidate.y !== direction.y);
        const side = rng.choice(sides);
        const branch = { x: cursor.x + side.x, y: cursor.y + side.y };
        if (branch.x > 0 && branch.y > 0 && branch.x < width - 1 && branch.y < height - 1) {
          const branchIdx = branch.y * width + branch.x;
          if (cells[branchIdx] === 0 /* Empty */) {
            cells[branchIdx] = 2 /* Hall */;
          }
        }
      }
    }
  }
}
function randomPointInRoom(room, rng, padding = 0) {
  const x = rng.int(room.x + padding, room.x + room.w - 1 - padding);
  const y = rng.int(room.y + padding, room.y + room.h - 1 - padding);
  return { x, y };
}
function connectRooms(rooms, rng) {
  const edges = [];
  const connected = /* @__PURE__ */ new Set();
  connected.add(rooms[0].id);
  while (connected.size < rooms.length) {
    let best = null;
    let bestDistance = Number.MAX_SAFE_INTEGER;
    for (const room of rooms) {
      if (!connected.has(room.id)) {
        continue;
      }
      for (const target of rooms) {
        if (connected.has(target.id)) {
          continue;
        }
        const distance = dist(centerOf(room), centerOf(target));
        if (distance < bestDistance) {
          bestDistance = distance;
          best = [room, target];
        }
      }
    }
    if (!best) {
      break;
    }
    edges.push(best);
    connected.add(best[1].id);
  }
  const extraCandidates = [];
  for (let i = 0; i < rooms.length; i += 1) {
    for (let j = i + 1; j < rooms.length; j += 1) {
      const key = `${rooms[i].id}-${rooms[j].id}`;
      const inverse = `${rooms[j].id}-${rooms[i].id}`;
      const exists = edges.some((entry) => {
        const edgeKey = `${entry[0].id}-${entry[1].id}`;
        return edgeKey === key || edgeKey === inverse;
      });
      if (!exists) {
        extraCandidates.push([rooms[i], rooms[j]]);
      }
    }
  }
  const extras = Math.max(1, Math.floor(rooms.length / 5));
  const shuffled = rng.shuffle(extraCandidates);
  for (let i = 0; i < Math.min(extras, shuffled.length); i += 1) {
    edges.push(shuffled[i]);
  }
  return edges;
}
function generateMap(rng) {
  const width = WORLD_WIDTH;
  const height = WORLD_HEIGHT;
  const cells = new Uint8Array(width * height);
  const rooms = [];
  let nextRoomId = 1;
  const startRoom = { id: nextRoomId, x: 1, y: 1, w: 8, h: 8, attrs: ROOM_START };
  nextRoomId += 1;
  const bossRoom = {
    id: nextRoomId,
    x: width - 10,
    y: height - 10,
    w: 8,
    h: 8,
    attrs: ROOM_BOSS
  };
  nextRoomId += 1;
  rooms.push(startRoom, bossRoom);
  const totalCells = width * height;
  const targetRects = Math.max(8, Math.floor(5e-3 * totalCells));
  const attemptsPerRoom = 200;
  const rectMaxWidth = Math.floor(width / 8);
  const rectMaxHeight = Math.floor(height / 8);
  const rectMinWidth = Math.max(4, Math.floor(rectMaxWidth * 0.5));
  const rectMinHeight = Math.max(4, Math.floor(rectMaxHeight * 0.5));
  for (let i = 0; i < targetRects; i += 1) {
    const roomW = rng.int(rectMinWidth, rectMaxWidth);
    const roomH = rng.int(rectMinHeight, rectMaxHeight);
    for (let attempt = 0; attempt < attemptsPerRoom; attempt += 1) {
      const roomX = rng.int(1, width - roomW - 2);
      const roomY = rng.int(1, height - roomH - 2);
      const room = { id: nextRoomId, x: roomX, y: roomY, w: roomW, h: roomH, attrs: 0 };
      let blocked = false;
      for (const other of rooms) {
        if (overlaps(room, other, 1)) {
          blocked = true;
          break;
        }
      }
      if (!blocked) {
        rooms.push(room);
        nextRoomId += 1;
        break;
      }
    }
  }
  const sortedByDistance = [...rooms].sort((a, b) => dist(centerOf(a), centerOf(startRoom)) - dist(centerOf(b), centerOf(startRoom)));
  const eligibleShopRooms = sortedByDistance.filter((room) => (room.attrs & (ROOM_START | ROOM_BOSS)) === 0);
  if (eligibleShopRooms.length > 0) {
    const idx = Math.floor(eligibleShopRooms.length * 0.65);
    eligibleShopRooms[Math.min(idx, eligibleShopRooms.length - 1)].attrs |= ROOM_SHOP;
  }
  for (const room of rooms) {
    carveRoom(cells, width, room);
  }
  const connections = connectRooms(sortedByDistance, rng);
  for (const [a, b] of connections) {
    const start = randomPointInRoom(a, rng, 1);
    const end = randomPointInRoom(b, rng, 1);
    carveTunnel(cells, width, height, start, end);
  }
  carveLabyrinthBranches(cells, width, height, rng);
  return new WorldMap(width, height, sortedByDistance, cells);
}
function randomPositionsInRoom(room, rng, count, keepouts = [], padding = 0) {
  const taken = new Set(keepouts.map((pos) => keyOf(pos)));
  const output = [];
  for (let i = 0; i < count; i += 1) {
    for (let attempts = 0; attempts < 5e3; attempts += 1) {
      const point = randomPointInRoom(room, rng, padding);
      const key = keyOf(point);
      if (taken.has(key)) {
        continue;
      }
      taken.add(key);
      output.push(point);
      break;
    }
  }
  return output;
}
function roomCenter(room) {
  return centerOf(room);
}

// src/runAi.ts
var CARDINAL_STEPS2 = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1]
];
function posKey(pos) {
  return `${pos.x},${pos.y}`;
}
function clonePos(pos) {
  return { x: pos.x, y: pos.y };
}
function chestPos(chest) {
  return { x: chest.x, y: chest.y };
}
function runAiStep(options) {
  if (options.overlayType !== "none") {
    return { battleTrigger: null };
  }
  const occupied = /* @__PURE__ */ new Set();
  occupied.add(posKey(options.player.position));
  for (const chest of options.chests) {
    if (!chest.chest.empty()) {
      occupied.add(posKey(chestPos(chest.chest)));
    }
  }
  for (const mob of options.mobs) {
    if (!mob.creature.alive) {
      continue;
    }
    occupied.add(posKey(mob.creature.position));
  }
  for (const mob of options.mobs) {
    const creature = mob.creature;
    if (!creature.alive || creature.inBattle) {
      continue;
    }
    const playerRoom = options.world.roomAt(options.player.position);
    const mobRoom = options.world.roomAt(creature.position);
    if (playerRoom && mobRoom && playerRoom.id === mobRoom.id) {
      const blocked = new Set(occupied);
      blocked.delete(posKey(creature.position));
      const path = options.world.pathTo(creature.position, options.player.position, blocked);
      if (path.length === 1) {
        return {
          battleTrigger: {
            mobId: mob.id,
            roomId: playerRoom?.id ?? mobRoom?.id ?? null,
            attackerName: creature.name
          }
        };
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
    if (options.rng.int(1, AI_WANDER_ROLL_MAX) < AI_WANDER_MOVE_ROLL_MIN) {
      continue;
    }
    const steps = options.rng.shuffle([
      { x: creature.position.x + 1, y: creature.position.y },
      { x: creature.position.x - 1, y: creature.position.y },
      { x: creature.position.x, y: creature.position.y + 1 },
      { x: creature.position.x, y: creature.position.y - 1 }
    ]);
    for (const next of steps) {
      if (!options.world.inBounds(next.x, next.y) || !options.world.isPassable(next.x, next.y)) {
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
  return { battleTrigger: null };
}
function findRetreatPosition(options) {
  if (options.battleRoomId === null) {
    return clonePos(options.fallback);
  }
  const occupied = /* @__PURE__ */ new Set();
  for (const mob of options.mobs) {
    if (mob.creature.alive) {
      occupied.add(posKey(mob.creature.position));
    }
  }
  for (const chest of options.chests) {
    if (!chest.chest.empty()) {
      occupied.add(posKey(chestPos(chest.chest)));
    }
  }
  occupied.delete(posKey(options.fallback));
  const frontier = [clonePos(options.fallback)];
  const seen = /* @__PURE__ */ new Set([posKey(options.fallback)]);
  let cursor = 0;
  while (cursor < frontier.length) {
    const current = frontier[cursor];
    cursor += 1;
    const currentRoom = options.world.roomAt(current);
    const isOutsideRoom = !currentRoom || currentRoom.id !== options.battleRoomId;
    const currentKey = posKey(current);
    if (isOutsideRoom && !occupied.has(currentKey)) {
      return clonePos(current);
    }
    for (const [dx, dy] of CARDINAL_STEPS2) {
      const next = { x: current.x + dx, y: current.y + dy };
      if (!options.world.inBounds(next.x, next.y) || !options.world.isPassable(next.x, next.y)) {
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
  return clonePos(options.fallback);
}

// src/runCombatFlow.ts
function resolveCombatTurn(options) {
  if (options.overlay.type !== "battle" || options.state !== "playing") {
    return {
      result: null,
      state: options.state,
      overlay: options.overlay,
      mobs: options.mobs,
      currentRoom: options.currentRoom,
      openBossReward: false,
      finalizeStats: false,
      maybeOpenAutoOverlay: false
    };
  }
  const battle = options.overlay;
  const mob = options.mobs.find((entry) => entry.id === battle.mobId);
  if (!mob || !mob.creature.alive) {
    return {
      result: null,
      state: options.state,
      overlay: { type: "none" },
      mobs: options.mobs,
      currentRoom: options.currentRoom,
      openBossReward: false,
      finalizeStats: false,
      maybeOpenAutoOverlay: true
    };
  }
  const openingProtection = battle.surpriseProtection;
  if (openingProtection) {
    options.log(EN.game.logs.dangerSenseProtected, "success");
    battle.surpriseProtection = false;
  }
  const result = options.combat.turn(options.player, mob.creature, options.action, {
    enemyAttackMultiplier: openingProtection ? SURPRISE_PROTECTION_ATTACK_MULTIPLIER : 1,
    fleeBonus: openingProtection ? SURPRISE_PROTECTION_FLEE_BONUS : 0
  });
  for (const entry of result.logs) {
    options.log(entry.text, entry.level);
  }
  if (result.fled) {
    options.player.position = findRetreatPosition({
      world: options.world,
      mobs: options.mobs,
      chests: options.chests,
      battleRoomId: battle.roomId,
      fallback: battle.fallback
    });
    options.player.inBattle = false;
    mob.creature.inBattle = false;
    const nextCurrentRoom = options.world.roomAt(options.player.position);
    options.log(EN.game.logs.retreat, "info");
    options.world.updateFov(options.player.position);
    return {
      result,
      state: options.state,
      overlay: { type: "none" },
      mobs: options.mobs,
      currentRoom: nextCurrentRoom,
      openBossReward: false,
      finalizeStats: false,
      maybeOpenAutoOverlay: true
    };
  }
  let nextMobs = options.mobs;
  let nextOverlay = options.overlay;
  let openBossReward = false;
  if (!mob.creature.alive) {
    options.stats.vanquished += 1;
    const gainedXp = Math.floor(mob.creature.maxHitpoints * CREATURE_XP_MULTIPLIER);
    const gain = options.player.giveXp(gainedXp);
    options.stats.xpGained += gainedXp;
    if (gain.leveled > 0) {
      options.log(EN.game.logs.welcomeLevel(options.player.level, options.player.unspentStatPoints), "success");
    }
    const lootGold = mob.creature.gold;
    options.player.give(new Gold(lootGold));
    options.stats.goldEarned += lootGold;
    options.log(EN.game.logs.lootKillRewards(lootGold, gainedXp), "success");
    options.player.inBattle = false;
    mob.creature.inBattle = false;
    nextOverlay = { type: "none" };
    const bossDefeated = mob.isBoss;
    nextMobs = options.mobs.filter((entry) => entry.creature.alive);
    if (bossDefeated) {
      options.log(EN.game.logs.bossDownChooseReward, "success");
      openBossReward = true;
    } else if (nextMobs.length > 0) {
      options.log(EN.game.logs.enemiesRemain(nextMobs.length, options.floor), "info");
    }
  }
  if (!options.player.alive) {
    return {
      result,
      state: "dead",
      overlay: nextOverlay,
      mobs: nextMobs,
      currentRoom: options.currentRoom,
      openBossReward,
      finalizeStats: true,
      maybeOpenAutoOverlay: false
    };
  }
  return {
    result,
    state: options.state,
    overlay: nextOverlay,
    mobs: nextMobs,
    currentRoom: options.currentRoom,
    openBossReward,
    finalizeStats: false,
    maybeOpenAutoOverlay: true
  };
}

// src/runEconomy.ts
function inventoryItems(player) {
  return player.inventory.items().map((item) => {
    if (item instanceof WieldableItem) {
      return { item, action: "equip" };
    }
    if (item instanceof InstantEffectItem) {
      return { item, action: "use" };
    }
    return { item, action: "none" };
  });
}
function equipInventoryItem(player, itemId2, log) {
  const item = player.inventory.items().find((entry) => entry.id === itemId2);
  if (!(item instanceof WieldableItem)) {
    return;
  }
  const slot = item.wieldsAt();
  const current = player.wieldpoints[slot];
  player.inventory.remove(item);
  player.wield(slot, item);
  if (current && current.name !== EN.game.startingGear.fists) {
    player.inventory.add(current);
  }
  log(EN.game.logs.equippedItem(item.name, slot), "success");
}
function useInventoryItem(player, itemId2, log) {
  const item = player.inventory.items().find((entry) => entry.id === itemId2);
  if (!(item instanceof InstantEffectItem)) {
    return;
  }
  player.inventory.remove(item);
  const healed = player.applyInstantItem(item);
  log(EN.game.logs.inventoryItemRestored(item.name, healed), "success");
}
function destroyInventoryItem(player, itemId2, log) {
  const item = player.inventory.items().find((entry) => entry.id === itemId2);
  if (!item) {
    return;
  }
  player.inventory.remove(item);
  log(EN.game.logs.destroyedItem(item.name), "warn");
}
function lootItemFromChest(options) {
  const item = options.chest.items().find((entry) => entry.id === options.itemId);
  if (!item) {
    return;
  }
  if (item instanceof Gold) {
    options.player.give(item);
    options.stats.goldEarned += item.amount;
    options.chest.remove(item);
    options.log(EN.game.logs.lootedGold(item.amount), "success");
    return;
  }
  if (options.player.inventory.add(item)) {
    options.chest.remove(item);
    options.log(EN.game.logs.lootedItem(item.name), "success");
  } else {
    options.log(EN.game.logs.inventoryFull, "warn");
  }
}
function lootAllFromChest(options) {
  const items = [...options.chest.items()];
  let filled = false;
  for (const item of items) {
    if (item instanceof Gold) {
      options.player.give(item);
      options.stats.goldEarned += item.amount;
      options.chest.remove(item);
      continue;
    }
    if (options.player.inventory.add(item)) {
      options.chest.remove(item);
    } else {
      filled = true;
    }
  }
  if (filled) {
    options.log(EN.game.logs.inventoryFullChestLeftovers, "warn");
  } else {
    options.log(EN.game.logs.lootedAllChest, "success");
  }
}
function resolveShopEntries(shopStock, activePerks, activeGambits) {
  return shopStock.map((entry) => {
    if (entry.kind === "service" && entry.serviceId !== null) {
      if (entry.serviceId === "remove-perk") {
        const latest = activePerks[activePerks.length - 1];
        return {
          ...entry,
          description: latest ? EN.game.shop.descriptions.removePerk(latest.name) : EN.game.shop.descriptions.removePerkNone
        };
      }
      if (entry.serviceId === "remove-gambit") {
        const latest = activeGambits[activeGambits.length - 1];
        return {
          ...entry,
          description: latest ? EN.game.shop.descriptions.removeGambit(latest.name) : EN.game.shop.descriptions.removeGambitNone
        };
      }
    }
    return entry;
  });
}
function computeShopEntryCost(entry, player) {
  const discount = SHOP_DISCOUNT_FOR_CHARISMA * player.attributes.modifier("chr");
  return Math.max(1, Math.floor(entry.value - entry.value * discount));
}
function buyShopEntry(options) {
  const entry = options.shopStock.find((candidate) => candidate.id === options.entryId);
  if (!entry || entry.sold) {
    return;
  }
  const cost = computeShopEntryCost(entry, options.player);
  if (options.player.gold < cost) {
    options.log(EN.game.logs.notEnoughGold, "warn");
    return;
  }
  if (entry.kind === "service") {
    let applied = false;
    if (entry.serviceId === "bonus-point") {
      options.player.grantAttributePoint(1);
      options.log(EN.game.logs.boughtRespecToken, "success");
      applied = true;
    } else if (entry.serviceId === "remove-perk") {
      const removed = options.removeLatestChoice("perk");
      if (!removed) {
        options.log(EN.game.logs.noActivePerkToRemove, "warn");
        return;
      }
      options.log(EN.game.logs.removedPerk(removed.name), "success");
      applied = true;
    } else if (entry.serviceId === "remove-gambit") {
      const removed = options.removeLatestChoice("gambit");
      if (!removed) {
        options.log(EN.game.logs.noActiveGambitToRemove, "warn");
        return;
      }
      options.log(EN.game.logs.removedGambit(removed.name), "success");
      applied = true;
    }
    if (!applied) {
      return;
    }
    options.player.spendGold(cost);
    options.stats.goldSpent += cost;
    entry.sold = true;
    options.log(EN.game.logs.purchasedEntry(entry.name, cost), "success");
    return;
  }
  const item = entry.item;
  if (!item || item instanceof Gold) {
    options.log(EN.game.logs.goldCannotBePurchased, "warn");
    return;
  }
  if (!options.player.inventory.add(item)) {
    options.log(EN.game.logs.inventoryFull, "warn");
    return;
  }
  options.player.spendGold(cost);
  options.stats.goldSpent += cost;
  entry.sold = true;
  options.log(EN.game.logs.purchasedEntry(entry.name, cost), "success");
}

// src/runFloorPopulation.ts
function populateDungeon(options) {
  const pools = generateItemPools(options.dice, options.rng, options.nameGenerator);
  const mobs = [];
  const chests = [];
  const shopClutter = [];
  const roomThreatById = /* @__PURE__ */ new Map();
  const startingRoom = options.world.rooms[0];
  const bossRoom = options.world.rooms.find((room) => (room.attrs & ROOM_BOSS) === ROOM_BOSS) ?? options.world.rooms[options.world.rooms.length - 1];
  const startY = roomCenter(startingRoom).y;
  const bossY = roomCenter(bossRoom).y;
  const yScaleSpan = Math.max(1, bossY - startY);
  const consumablesForShop = [
    makeBandages(),
    makeHealthPotion(),
    makeLargePotion(),
    makeHugePotion(),
    makeColossalPotion(),
    makeInstaheal()
  ];
  const shopItems = [
    ...consumablesForShop,
    ...pools.weapons.slice(0, SHOP_TOP_WEAPONS),
    ...pools.armors.slice(0, SHOP_TOP_ARMORS)
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
          sprite: options.rng.choice(sprites)
        });
      }
      continue;
    }
    const scaled = Math.max(FLOOR_SCALE_MINIMUM, yScale + options.floor * FLOOR_DEPTH_SCALE_PER_FLOOR);
    let mobCount = 0;
    if (isBoss) {
      mobCount = 1;
    } else if (!isStart) {
      mobCount = options.dice.roll(1, Math.max(1, Math.ceil((FLOOR_MOB_BASE + options.floor * FLOOR_MOB_PER_FLOOR) * scaled)));
    }
    const mobPositions = randomPositionsInRoom(room, options.rng, mobCount, [], 0);
    const chestCount = options.dice.roll(
      1,
      Math.max(1, Math.ceil((FLOOR_CHEST_BASE + options.floor * FLOOR_CHEST_PER_FLOOR) * scaled))
    );
    const chestPositions = randomPositionsInRoom(room, options.rng, chestCount, mobPositions, 1);
    for (const pos of mobPositions) {
      const mob = creatureAtLevel(challengeLevel, options.nameGenerator, options.rng);
      if (isBoss) {
        mob.name = EN.game.names.dungeonBoss;
        mob.attributes.modify("str", BOSS_STR_BONUS_BASE + floorOffset);
        mob.attributes.modify("dex", BOSS_DEX_BONUS_BASE + Math.floor(floorOffset / BOSS_DEX_BONUS_FLOOR_DIVISOR));
        mob.attributes.modify("con", BOSS_CON_BONUS_BASE + floorOffset);
        mob.maxHitpoints = Math.max(1, Math.floor(mob.maxHitpoints * (1 + floorOffset * BOSS_HP_SCALE_PER_FLOOR)));
        mob.hitpoints = mob.maxHitpoints;
      }
      mob.mob = true;
      mob.position = { x: pos.x, y: pos.y };
      mob.rollMobGold(options.dice);
      mobs.push({
        id: options.nextId("mob"),
        creature: mob,
        roomId: room.id,
        isBoss
      });
    }
    for (const pos of chestPositions) {
      const chest = new Chest(pos.x, pos.y, FLOOR_CHEST_CAPACITY);
      if (options.dice.roll(1, 20) >= CHEST_WEAPON_ROLL_MIN && pools.weapons.length > 0) {
        chest.add(pools.weapons.shift());
      }
      if (options.dice.roll(1, 20) >= CHEST_ARMOR_ROLL_MIN && pools.armors.length > 0) {
        chest.add(pools.armors.shift());
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
    roomThreatById
  };
}

// src/runProgression.ts
var ATTRIBUTE_ORDER = ["str", "dex", "con", "int", "wis", "chr"];
function toPublicBuildChoice(choice) {
  return {
    id: choice.id,
    name: choice.name,
    description: choice.description,
    kind: choice.kind
  };
}
function pickRandomBuildChoices(kind, count, rng, activePerks, activeGambits) {
  const pool = kind === "perk" ? PERK_POOL : GAMBIT_POOL;
  const active = new Set((kind === "perk" ? activePerks : activeGambits).map((choice) => choice.id));
  let available = pool.filter((choice) => !active.has(choice.id));
  if (available.length < count) {
    available = [...pool];
  }
  return rng.shuffle([...available]).slice(0, Math.min(count, available.length));
}
function createPendingBossRewards(rng, activePerks, activeGambits) {
  return {
    perks: pickRandomBuildChoices("perk", 3, rng, activePerks, activeGambits),
    gambits: pickRandomBuildChoices("gambit", 3, rng, activePerks, activeGambits)
  };
}
function applyBuildChoiceEffect(player, choice) {
  const previousCap = player.currentMaxHitpoints();
  player.attackBonus += choice.attackBonus ?? 0;
  player.defenseBonus += choice.defenseBonus ?? 0;
  if (choice.attributes) {
    for (const attr of ATTRIBUTE_ORDER) {
      const delta = choice.attributes[attr] ?? 0;
      if (delta === 0) {
        continue;
      }
      player.attributes.modify(attr, delta);
      if (attr === "con") {
        player.maxHitpoints = Math.max(1, player.maxHitpoints + delta * PLAYER_CONSTITUTION_BONUS);
      }
    }
  }
  if (choice.maxHitpoints) {
    player.maxHitpoints = Math.max(1, player.maxHitpoints + choice.maxHitpoints);
  }
  player.damageDealtMultiplier *= choice.damageDealtMultiplier ?? 1;
  player.damageTakenMultiplier *= choice.damageTakenMultiplier ?? 1;
  player.hitpointCapMultiplier *= choice.hitpointCapMultiplier ?? 1;
  const newCap = player.currentMaxHitpoints();
  if (newCap > previousCap) {
    player.hitpoints += newCap - previousCap;
  }
  player.enforceHitpointCap();
}
function removeBuildChoiceEffect(player, choice) {
  player.attackBonus -= choice.attackBonus ?? 0;
  player.defenseBonus -= choice.defenseBonus ?? 0;
  if (choice.attributes) {
    for (const attr of ATTRIBUTE_ORDER) {
      const delta = choice.attributes[attr] ?? 0;
      if (delta === 0) {
        continue;
      }
      player.attributes.modify(attr, -delta);
      if (attr === "con") {
        player.maxHitpoints = Math.max(1, player.maxHitpoints - delta * PLAYER_CONSTITUTION_BONUS);
      }
    }
  }
  if (choice.maxHitpoints) {
    player.maxHitpoints = Math.max(1, player.maxHitpoints - choice.maxHitpoints);
  }
  player.damageDealtMultiplier /= choice.damageDealtMultiplier ?? 1;
  player.damageTakenMultiplier /= choice.damageTakenMultiplier ?? 1;
  player.hitpointCapMultiplier /= choice.hitpointCapMultiplier ?? 1;
  player.enforceHitpointCap();
}
function createPendingShopRewards(activePerks, activeGambits) {
  const latestPerk = activePerks[activePerks.length - 1] ?? null;
  const latestGambit = activeGambits[activeGambits.length - 1] ?? null;
  return [
    {
      id: "bonus-point",
      title: EN.game.shop.rewards.bonusPoint.title,
      description: EN.game.shop.rewards.bonusPoint.description
    },
    {
      id: "remove-perk",
      title: EN.game.shop.rewards.removePerk.title,
      description: latestPerk ? EN.game.shop.rewards.removePerk.description(latestPerk.name) : EN.game.shop.rewards.removePerk.fallback()
    },
    {
      id: "remove-gambit",
      title: EN.game.shop.rewards.removeGambit.title,
      description: latestGambit ? EN.game.shop.rewards.removeGambit.description(latestGambit.name) : EN.game.shop.rewards.removeGambit.fallback()
    }
  ];
}
function chooseBossReward(options) {
  if (options.overlayType !== "boss-reward" || !options.pendingBossRewards) {
    return {
      pendingBossRewards: options.pendingBossRewards,
      shouldAdvanceFloor: false
    };
  }
  if (options.kind === "none") {
    options.log(EN.game.logs.descendWithoutModifier, "info");
    return {
      pendingBossRewards: null,
      shouldAdvanceFloor: true
    };
  }
  const source = options.kind === "perk" ? options.pendingBossRewards.perks : options.pendingBossRewards.gambits;
  const picked = source.find((choice) => choice.id === options.choiceId);
  if (!picked) {
    return {
      pendingBossRewards: options.pendingBossRewards,
      shouldAdvanceFloor: false
    };
  }
  applyBuildChoiceEffect(options.player, picked);
  if (options.kind === "perk") {
    options.activePerks.push(picked);
  } else {
    options.activeGambits.push(picked);
  }
  options.log(
    EN.game.logs.selectedBuildChoice(picked.kind === "perk" ? EN.game.labels.perk : EN.game.labels.gambit, picked.name),
    "success"
  );
  return {
    pendingBossRewards: null,
    shouldAdvanceFloor: true
  };
}
function claimShopReward(options) {
  if (options.overlayType !== "shop-reward" || !options.pendingShopRewards) {
    return {
      pendingShopRewards: options.pendingShopRewards,
      claimed: false
    };
  }
  if (options.choiceId === "bonus-point") {
    options.player.grantAttributePoint(1);
    options.log(EN.game.logs.shopRewardBonusPoint, "success");
  } else if (options.choiceId === "remove-perk") {
    const removed = options.removeLatestChoice("perk");
    if (removed) {
      options.log(EN.game.logs.shopRewardRemovedPerk(removed.name), "success");
    } else {
      options.player.give(new Gold(SHOP_REWARD_FALLBACK_GOLD));
      options.stats.goldEarned += SHOP_REWARD_FALLBACK_GOLD;
      options.log(EN.game.logs.shopRewardPerkFallbackGold(), "success");
    }
  } else if (options.choiceId === "remove-gambit") {
    const removed = options.removeLatestChoice("gambit");
    if (removed) {
      options.log(EN.game.logs.shopRewardRemovedGambit(removed.name), "success");
    } else {
      const heal = Math.max(1, Math.floor(options.player.currentMaxHitpoints() * SHOP_REWARD_HEAL_FALLBACK_RATIO));
      const before = options.player.hitpoints;
      options.player.hitpoints = Math.min(options.player.currentMaxHitpoints(), options.player.hitpoints + heal);
      options.log(EN.game.logs.shopRewardGambitFallbackHeal(options.player.hitpoints - before), "success");
    }
  }
  return {
    pendingShopRewards: null,
    claimed: true
  };
}
function isValidLevelUpAttribute(attr, validAttributes) {
  return validAttributes.includes(attr);
}
function allocateLevelUp(options) {
  if (options.overlayType !== "level-up") {
    return {
      spent: false,
      nextOverlayType: null
    };
  }
  if (!isValidLevelUpAttribute(options.attr, options.validAttributes)) {
    return {
      spent: false,
      nextOverlayType: null
    };
  }
  if (!options.player.spendAttributePoint(options.attr)) {
    return {
      spent: false,
      nextOverlayType: null
    };
  }
  options.log(EN.game.logs.levelUpSpent(EN.game.attributeLabels[options.attr]), "success");
  return {
    spent: true,
    nextOverlayType: options.player.unspentStatPoints > 0 ? "level-up" : "none"
  };
}

// src/runSaveCodec.ts
var ATTRIBUTE_ORDER2 = ["str", "dex", "con", "int", "wis", "chr"];
var WIELD_SLOTS = ["head", "chest", "arms", "hands", "legs", "feet"];
function bytesToBase64(bytes) {
  let binary = "";
  for (const value of bytes) {
    binary += String.fromCharCode(value);
  }
  return btoa(binary);
}
function base64ToBytes(input) {
  const binary = atob(input);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
function clonePos2(pos) {
  return { x: pos.x, y: pos.y };
}
function turnsRemaining(effect, currentTurn) {
  for (let turn = currentTurn; turn <= currentTurn + effect.lifetime; turn += 1) {
    if (effect.hasExpired(turn)) {
      return Math.max(0, turn - currentTurn);
    }
  }
  return 0;
}
function cloneOverlay(overlay) {
  if (overlay.type === "battle") {
    return {
      type: "battle",
      mobId: overlay.mobId,
      fallback: clonePos2(overlay.fallback),
      roomId: overlay.roomId,
      surpriseProtection: overlay.surpriseProtection
    };
  }
  if (overlay.type === "chest") {
    return { type: "chest", chestId: overlay.chestId };
  }
  return { type: overlay.type };
}
function serializeCreature(creature) {
  const wieldpoints = {
    head: null,
    chest: null,
    arms: null,
    hands: null,
    legs: null,
    feet: null
  };
  for (const slot of WIELD_SLOTS) {
    const item = creature.wieldpoints[slot];
    wieldpoints[slot] = item ? serializeItem(item) : null;
  }
  return {
    name: creature.name,
    position: clonePos2(creature.position),
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
      turnsRemaining: turnsRemaining(buff, creature.turn)
    })),
    poisons: creature.poisons.map((poison) => ({
      item: serializeItem(poison),
      turnsRemaining: turnsRemaining(poison, creature.turn)
    }))
  };
}
function hydrateCreatureFromSave(target, saved) {
  target.name = saved.name;
  target.position = clonePos2(saved.position);
  for (const attr of ATTRIBUTE_ORDER2) {
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
function encodeRunSaveData(input) {
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
      exploredBase64: bytesToBase64(input.world.explored)
    },
    player: serializeCreature(input.player),
    mobs: input.mobs.map((mob) => ({
      id: mob.id,
      roomId: mob.roomId,
      isBoss: mob.isBoss,
      creature: serializeCreature(mob.creature)
    })),
    chests: input.chests.map((entry) => ({
      id: entry.id,
      roomId: entry.roomId,
      chest: {
        x: entry.chest.x,
        y: entry.chest.y,
        capacity: entry.chest.capacity(),
        items: entry.chest.items().map((item) => serializeItem(item))
      }
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
      item: entry.item ? serializeItem(entry.item) : null
    })),
    shopClutter: input.shopClutter.map((entry) => ({ ...entry })),
    roomThreatById: [...input.roomThreatById.entries()],
    warnedDangerRooms: [...input.warnedDangerRooms],
    dangerProtectionArmedRooms: [...input.dangerProtectionArmedRooms],
    activePerkIds: [...input.activePerkIds],
    activeGambitIds: [...input.activeGambitIds],
    pendingBossRewards: input.pendingBossRewards ? {
      perkIds: input.pendingBossRewards.perks.map((choice) => choice.id),
      gambitIds: input.pendingBossRewards.gambits.map((choice) => choice.id)
    } : null,
    pendingShopRewards: input.pendingShopRewards ? input.pendingShopRewards.map((choice) => ({ ...choice })) : null,
    shopRewardClaimedFloors: [...input.shopRewardClaimedFloors],
    combatLuck: input.combatLuck
  };
}
function decodeRunSaveData(saved, deps) {
  if (saved.version !== 1) {
    throw new Error(`Unsupported save version: ${saved.version}`);
  }
  const expectedCells = saved.world.width * saved.world.height;
  const worldCells = base64ToBytes(saved.world.cellsBase64);
  const worldExplored = base64ToBytes(saved.world.exploredBase64);
  if (worldCells.length !== expectedCells || worldExplored.length !== expectedCells) {
    throw new Error("Save data map payload is malformed.");
  }
  const world = new WorldMap(
    saved.world.width,
    saved.world.height,
    saved.world.rooms.map((room) => ({ ...room })),
    worldCells
  );
  world.explored.set(worldExplored);
  const mobs = saved.mobs.map((entry) => {
    const creature = new Creature(entry.creature.name, clonePos2(entry.creature.position), new AttributeSet(entry.creature.attributes));
    hydrateCreatureFromSave(creature, entry.creature);
    return {
      id: entry.id,
      roomId: entry.roomId,
      isBoss: entry.isBoss,
      creature
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
      chest
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
    item: entry.item ? deserializeItem(entry.item) : null
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
    pendingBossRewards: saved.pendingBossRewards ? {
      perks: saved.pendingBossRewards.perkIds.map((id) => deps.findBuildChoice(id)),
      gambits: saved.pendingBossRewards.gambitIds.map((id) => deps.findBuildChoice(id))
    } : null,
    pendingShopRewards: saved.pendingShopRewards ? saved.pendingShopRewards.map((choice) => ({ ...choice })) : null,
    shopRewardClaimedFloors: [...saved.shopRewardClaimedFloors],
    combatLuck: saved.combatLuck ?? { playerD20History: [], playerMissStreak: 0 }
  };
}

// src/game.ts
var LEVEL_UP_ATTRIBUTES = ["str", "dex", "con", "chr"];
var ATTRIBUTE_LABELS = EN.game.attributeLabels;
var ATTRIBUTE_DESCRIPTIONS = EN.game.attributeDescriptions;
function posEq(a, b) {
  return a.x === b.x && a.y === b.y;
}
function clonePos3(pos) {
  return { x: pos.x, y: pos.y };
}
function chestPos2(chest) {
  return { x: chest.x, y: chest.y };
}
var entityId = 1;
function nextId(prefix) {
  const id = entityId;
  entityId += 1;
  return `${prefix}-${id}`;
}
var DungeonRun = class _DungeonRun {
  rng;
  dice;
  combat;
  world;
  player;
  seedPhrase;
  seedNumber;
  stats;
  logs = [];
  overlay = { type: "none" };
  state = "playing";
  floor = 1;
  mobs = [];
  chests = [];
  currentRoom = null;
  aiAccumMs = 0;
  nameGenerator;
  shopStock = [];
  shopClutter = [];
  roomThreatById = /* @__PURE__ */ new Map();
  warnedDangerRooms = /* @__PURE__ */ new Set();
  dangerProtectionArmedRooms = /* @__PURE__ */ new Set();
  activePerks = [];
  activeGambits = [];
  pendingBossRewards = null;
  pendingShopRewards = null;
  shopRewardClaimedFloors = /* @__PURE__ */ new Set();
  constructor(seedInput) {
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
      new AttributeSet(STARTING_ATTRS)
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
      floorReached: 1
    };
    this.preparePlayerGear();
    this.buildFloor(true);
    for (const intro of EN.game.introLogs) {
      this.log(intro);
    }
  }
  preparePlayerGear() {
    const fists = new Weapon(
      EN.game.startingGear.fists,
      STARTING_WEAPON_CRITICAL_RANGE,
      STARTING_WEAPON_CRITICAL_MULTIPLIER,
      STARTING_WEAPON_ATTACK_BONUS,
      STARTING_WEAPON_DEFENSE_BONUS,
      STARTING_WEAPON_DAMAGE_DICE
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
  buildFloor(initial = false) {
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
  populateDungeon() {
    const populated = populateDungeon({
      world: this.world,
      floor: this.floor,
      dice: this.dice,
      rng: this.rng,
      nameGenerator: this.nameGenerator,
      nextId
    });
    this.mobs = populated.mobs;
    this.chests = populated.chests;
    this.shopStock = populated.shopStock;
    this.shopClutter = populated.shopClutter;
    this.roomThreatById.clear();
    for (const [roomId, threat] of populated.roomThreatById) {
      this.roomThreatById.set(roomId, threat);
    }
  }
  removeLatestChoice(kind) {
    const list = kind === "perk" ? this.activePerks : this.activeGambits;
    const removed = list.pop() ?? null;
    if (!removed) {
      return null;
    }
    removeBuildChoiceEffect(this.player, removed);
    return removed;
  }
  openBossReward() {
    this.pendingBossRewards = createPendingBossRewards(this.rng, this.activePerks, this.activeGambits);
    this.overlay = { type: "boss-reward" };
  }
  prepareShopReward() {
    this.pendingShopRewards = createPendingShopRewards(this.activePerks, this.activeGambits);
    this.overlay = { type: "shop-reward" };
  }
  maybeOpenAutoOverlay() {
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
  advanceToNextFloor() {
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
  log(text, level = "info") {
    this.logs.push({ text, level });
    while (this.logs.length > LOG_LIMIT) {
      this.logs.shift();
    }
  }
  roomThreat(room) {
    if (!room) {
      return 0;
    }
    return this.roomThreatById.get(room.id) ?? 0;
  }
  warnIfDangerousRoom(room) {
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
  startBattle(mobId, fallback, roomId) {
    const surpriseProtection = roomId !== null && this.dangerProtectionArmedRooms.has(roomId);
    if (surpriseProtection) {
      this.dangerProtectionArmedRooms.delete(roomId);
    }
    this.overlay = {
      type: "battle",
      mobId,
      fallback: clonePos3(fallback),
      roomId,
      surpriseProtection
    };
  }
  canOpenShop() {
    const room = this.world.roomAt(this.player.position);
    return room !== null && (room.attrs & ROOM_SHOP) === ROOM_SHOP;
  }
  openInventory() {
    if (this.state !== "playing" || this.overlay.type !== "none") {
      return;
    }
    this.overlay = { type: "inventory" };
  }
  openShop() {
    if (this.state !== "playing" || !this.canOpenShop() || this.overlay.type !== "none") {
      return;
    }
    this.overlay = { type: "shop" };
  }
  closeOverlay() {
    if (this.overlay.type === "level-up" || this.overlay.type === "boss-reward" || this.overlay.type === "shop-reward") {
      return;
    }
    this.overlay = { type: "none" };
    this.maybeOpenAutoOverlay();
  }
  movePlayer(dx, dy) {
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
    const targetChest = this.chests.find((entry) => posEq(chestPos2(entry.chest), next) && !entry.chest.empty());
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
  tick(dtMs) {
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
    const aiStep = runAiStep({
      overlayType: this.overlay.type,
      world: this.world,
      rng: this.rng,
      player: this.player,
      mobs: this.mobs,
      chests: this.chests
    });
    const battleTrigger = aiStep.battleTrigger;
    if (battleTrigger) {
      this.startBattle(battleTrigger.mobId, this.player.position, battleTrigger.roomId);
      this.player.inBattle = true;
      const attacker = this.mobs.find((entry) => entry.id === battleTrigger.mobId);
      if (attacker) {
        attacker.creature.inBattle = true;
      }
      this.log(EN.game.logs.enemyAttacks(battleTrigger.attackerName), "warn");
    }
    this.world.updateFov(this.player.position);
  }
  performCombat(action) {
    const resolved = resolveCombatTurn({
      action,
      state: this.state,
      overlay: this.overlay,
      mobs: this.mobs,
      combat: this.combat,
      player: this.player,
      world: this.world,
      chests: this.chests,
      currentRoom: this.currentRoom,
      stats: this.stats,
      floor: this.floor,
      log: (text, level) => this.log(text, level)
    });
    this.state = resolved.state;
    this.overlay = resolved.overlay;
    this.mobs = resolved.mobs;
    this.currentRoom = resolved.currentRoom;
    if (resolved.openBossReward) {
      this.openBossReward();
    }
    if (resolved.finalizeStats) {
      this.finalizeStats();
    }
    if (resolved.maybeOpenAutoOverlay) {
      this.maybeOpenAutoOverlay();
    }
    return resolved.result;
  }
  finalizeStats() {
    this.stats.inventoryValue = this.player.inventory.items().reduce((acc, item) => acc + item.value, 0) + Object.values(this.player.wieldpoints).filter((item) => item instanceof WieldableItem).reduce((acc, item) => acc + item.value, 0);
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
  getBattleEnemy() {
    if (this.overlay.type !== "battle") {
      return null;
    }
    const overlay = this.overlay;
    return this.mobs.find((entry) => entry.id === overlay.mobId) ?? null;
  }
  getChest() {
    if (this.overlay.type !== "chest") {
      return null;
    }
    const overlay = this.overlay;
    return this.chests.find((entry) => entry.id === overlay.chestId) ?? null;
  }
  getRoomThreat(room) {
    return this.roomThreat(room);
  }
  getCurrentRoomThreat() {
    return this.roomThreat(this.currentRoom);
  }
  currentBuild() {
    return {
      perks: this.activePerks.map((choice) => toPublicBuildChoice(choice)),
      gambits: this.activeGambits.map((choice) => toPublicBuildChoice(choice))
    };
  }
  getBossRewards() {
    if (!this.pendingBossRewards) {
      return null;
    }
    return {
      perks: this.pendingBossRewards.perks.map((choice) => toPublicBuildChoice(choice)),
      gambits: this.pendingBossRewards.gambits.map((choice) => toPublicBuildChoice(choice))
    };
  }
  chooseBossReward(kind, choiceId) {
    const resolved = chooseBossReward({
      overlayType: this.overlay.type,
      pendingBossRewards: this.pendingBossRewards,
      kind,
      choiceId,
      player: this.player,
      activePerks: this.activePerks,
      activeGambits: this.activeGambits,
      log: (text, level) => this.log(text, level)
    });
    this.pendingBossRewards = resolved.pendingBossRewards;
    if (resolved.shouldAdvanceFloor) {
      this.advanceToNextFloor();
    }
  }
  getShopRewardChoices() {
    if (!this.pendingShopRewards) {
      return null;
    }
    return [...this.pendingShopRewards];
  }
  claimShopReward(choiceId) {
    const resolved = claimShopReward({
      overlayType: this.overlay.type,
      pendingShopRewards: this.pendingShopRewards,
      choiceId,
      player: this.player,
      stats: this.stats,
      removeLatestChoice: (kind) => this.removeLatestChoice(kind),
      log: (text, level) => this.log(text, level)
    });
    this.pendingShopRewards = resolved.pendingShopRewards;
    if (!resolved.claimed) {
      return;
    }
    this.overlay = { type: "none" };
    this.maybeOpenAutoOverlay();
  }
  levelUpChoices() {
    return LEVEL_UP_ATTRIBUTES.map((attr) => ({
      attr,
      label: ATTRIBUTE_LABELS[attr],
      description: ATTRIBUTE_DESCRIPTIONS[attr],
      value: this.player.attributes.get(attr),
      modifier: this.player.attributes.modifier(attr)
    }));
  }
  allocateLevelUp(attr) {
    const resolved = allocateLevelUp({
      overlayType: this.overlay.type,
      attr,
      validAttributes: LEVEL_UP_ATTRIBUTES,
      player: this.player,
      log: (text, level) => this.log(text, level)
    });
    if (!resolved.spent || resolved.nextOverlayType === null) {
      return;
    }
    this.overlay = { type: resolved.nextOverlayType };
    this.maybeOpenAutoOverlay();
  }
  inventoryItems() {
    return inventoryItems(this.player);
  }
  equipItem(itemId2) {
    equipInventoryItem(this.player, itemId2, (text, level) => this.log(text, level));
  }
  useInventoryItem(itemId2) {
    useInventoryItem(this.player, itemId2, (text, level) => this.log(text, level));
  }
  destroyInventoryItem(itemId2) {
    destroyInventoryItem(this.player, itemId2, (text, level) => this.log(text, level));
  }
  lootItem(itemId2) {
    const chestEntity = this.getChest();
    if (!chestEntity) {
      return;
    }
    lootItemFromChest({
      chest: chestEntity.chest,
      itemId: itemId2,
      player: this.player,
      stats: this.stats,
      log: (text, level) => this.log(text, level)
    });
  }
  lootAll() {
    const chestEntity = this.getChest();
    if (!chestEntity) {
      return;
    }
    lootAllFromChest({
      chest: chestEntity.chest,
      player: this.player,
      stats: this.stats,
      log: (text, level) => this.log(text, level)
    });
  }
  shopEntries() {
    return resolveShopEntries(this.shopStock, this.activePerks, this.activeGambits);
  }
  shopEntryCost(entry) {
    return computeShopEntryCost(entry, this.player);
  }
  buyShopEntry(entryId) {
    buyShopEntry({
      entryId,
      shopStock: this.shopStock,
      player: this.player,
      stats: this.stats,
      removeLatestChoice: (kind) => this.removeLatestChoice(kind),
      log: (text, level) => this.log(text, level)
    });
  }
  toSaveData() {
    return encodeRunSaveData({
      seedPhrase: this.seedPhrase,
      seedNumber: this.seedNumber,
      rngState: this.rng.getState(),
      nextEntityId: entityId,
      nextItemId: getNextItemId(),
      floor: this.floor,
      state: this.state,
      stats: { ...this.stats },
      logs: this.logs,
      overlay: this.overlay,
      world: this.world,
      player: this.player,
      mobs: this.mobs,
      chests: this.chests,
      currentRoomId: this.currentRoom?.id ?? null,
      aiAccumMs: this.aiAccumMs,
      shopStock: this.shopStock,
      shopClutter: this.shopClutter,
      roomThreatById: this.roomThreatById,
      warnedDangerRooms: this.warnedDangerRooms,
      dangerProtectionArmedRooms: this.dangerProtectionArmedRooms,
      activePerkIds: this.activePerks.map((choice) => choice.id),
      activeGambitIds: this.activeGambits.map((choice) => choice.id),
      pendingBossRewards: this.pendingBossRewards,
      pendingShopRewards: this.pendingShopRewards,
      shopRewardClaimedFloors: this.shopRewardClaimedFloors,
      combatLuck: this.combat.snapshotLuckState()
    });
  }
  static fromSaveData(saved) {
    const run = new _DungeonRun(saved.seedPhrase);
    const decoded = decodeRunSaveData(saved, { findBuildChoice });
    run.world = decoded.world;
    hydrateCreatureFromSave(run.player, decoded.player);
    run.world.updateFov(run.player.position);
    run.floor = decoded.floor;
    run.state = decoded.state;
    run.overlay = decoded.overlay;
    run.aiAccumMs = decoded.aiAccumMs;
    Object.assign(run.stats, decoded.stats);
    run.logs.splice(0, run.logs.length, ...decoded.logs);
    run.mobs = decoded.mobs;
    run.chests = decoded.chests;
    run.shopStock = decoded.shopStock;
    run.shopClutter = decoded.shopClutter;
    run.roomThreatById.clear();
    for (const [roomId, threat] of decoded.roomThreatById) {
      run.roomThreatById.set(roomId, threat);
    }
    run.warnedDangerRooms.clear();
    for (const roomId of decoded.warnedDangerRooms) {
      run.warnedDangerRooms.add(roomId);
    }
    run.dangerProtectionArmedRooms.clear();
    for (const roomId of decoded.dangerProtectionArmedRooms) {
      run.dangerProtectionArmedRooms.add(roomId);
    }
    run.activePerks.splice(0, run.activePerks.length, ...decoded.activePerks);
    run.activeGambits.splice(0, run.activeGambits.length, ...decoded.activeGambits);
    run.pendingBossRewards = decoded.pendingBossRewards;
    run.pendingShopRewards = decoded.pendingShopRewards;
    run.shopRewardClaimedFloors.clear();
    for (const floor of decoded.shopRewardClaimedFloors) {
      run.shopRewardClaimedFloors.add(floor);
    }
    run.combat.restoreLuckState(decoded.combatLuck);
    run.currentRoom = decoded.currentRoomId === null ? null : run.world.rooms.find((room) => room.id === decoded.currentRoomId) ?? run.world.roomAt(run.player.position);
    run.rng.setState(decoded.rngState);
    entityId = Math.max(1, Math.floor(decoded.nextEntityId));
    setNextItemId(decoded.nextItemId);
    return run;
  }
};

// src/tests/game.test.ts
function runGameTests() {
  const run = new DungeonRun("level-up-attributes");
  run.player.grantAttributePoint(2);
  run.overlay = { type: "level-up" };
  const choices = run.levelUpChoices().map((choice) => choice.attr).join(",");
  assertEqual(choices, "str,dex,con,chr", "Level-up choices should only include active gameplay stats");
  const pointsBefore = run.player.unspentStatPoints;
  run.allocateLevelUp("str");
  assertEqual(run.player.unspentStatPoints, pointsBefore - 1, "Spending a level-up point should reduce available points");
  run.overlay = { type: "level-up" };
  const intBefore = run.player.attributes.get("int");
  const pointsBeforeInvalid = run.player.unspentStatPoints;
  const allocate = run.allocateLevelUp;
  allocate.call(run, "int");
  assertEqual(run.player.attributes.get("int"), intBefore, "Inactive attributes should not be spendable via level-up");
  assertEqual(run.player.unspentStatPoints, pointsBeforeInvalid, "Invalid level-up attributes should not consume points");
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
    assert(
      weapon.criticalMultiplier() >= PLAYER_CRIT_MINIMUM_MULTIPLIER,
      `Procgen crit multiplier should be >=${PLAYER_CRIT_MINIMUM_MULTIPLIER}, got ${weapon.criticalMultiplier()}`
    );
  }
  const legacyWeapon = new Weapon("Legacy Blade", 20, 1, 0, 0, "1d6");
  assert(
    legacyWeapon.criticalMultiplier() >= PLAYER_CRIT_MINIMUM_MULTIPLIER,
    `Weapon constructor should clamp crit multiplier to >=${PLAYER_CRIT_MINIMUM_MULTIPLIER}, got ${legacyWeapon.criticalMultiplier()}`
  );
}

// src/tests/runCombatFlow.test.ts
function makePlayer(position = { x: 2, y: 2 }) {
  const player = new Creature(
    "Player",
    position,
    new AttributeSet({ str: 10, dex: 10, con: 10, int: 10, wis: 10, chr: 10 })
  );
  player.maxHitpoints = 80;
  player.hitpoints = 80;
  return player;
}
function makeMob(name, position = { x: 2, y: 3 }) {
  const mob = new Creature(
    name,
    position,
    new AttributeSet({ str: 10, dex: 10, con: 10, int: 10, wis: 10, chr: 10 })
  );
  mob.mob = true;
  mob.maxHitpoints = 30;
  mob.hitpoints = 30;
  return mob;
}
function makeWorld() {
  const width = 5;
  const height = 5;
  const cells = new Uint8Array(width * height).fill(2 /* Hall */);
  const rooms = [{ id: 1, x: 1, y: 1, w: 3, h: 3, attrs: 0 }];
  return new WorldMap(width, height, rooms, cells);
}
function fakeCombat(resultFactory) {
  return {
    turn: (player, enemy) => resultFactory(player, enemy)
  };
}
function battleOverlay(mobId, roomId = 1) {
  return {
    type: "battle",
    mobId,
    fallback: { x: 2, y: 2 },
    roomId,
    surpriseProtection: false
  };
}
function noLogs() {
  return () => {
  };
}
function runCombatFlowTests() {
  {
    const player = makePlayer();
    const world = makeWorld();
    const result = resolveCombatTurn({
      action: "normal",
      state: "playing",
      overlay: { type: "none" },
      mobs: [],
      combat: fakeCombat(() => ({ over: true, fled: false, logs: [], moments: [] })),
      player,
      world,
      chests: [],
      currentRoom: world.roomAt(player.position),
      stats: { vanquished: 0, goldEarned: 0, xpGained: 0 },
      floor: 1,
      log: noLogs()
    });
    assertEqual(result.result, null, "Combat flow should no-op when there is no battle overlay");
    assertEqual(result.maybeOpenAutoOverlay, false, "No-op combat flow should not request auto-overlay checks");
  }
  {
    const player = makePlayer();
    const world = makeWorld();
    const result = resolveCombatTurn({
      action: "normal",
      state: "playing",
      overlay: battleOverlay("missing-mob"),
      mobs: [],
      combat: fakeCombat(() => ({ over: true, fled: false, logs: [], moments: [] })),
      player,
      world,
      chests: [],
      currentRoom: world.roomAt(player.position),
      stats: { vanquished: 0, goldEarned: 0, xpGained: 0 },
      floor: 1,
      log: noLogs()
    });
    assertEqual(result.overlay.type, "none", "Missing battle target should close the battle overlay");
    assertEqual(result.maybeOpenAutoOverlay, true, "Missing battle target should allow auto-overlays to reopen");
  }
  {
    const player = makePlayer();
    const world = makeWorld();
    const enemy = makeMob("Runner");
    enemy.inBattle = true;
    player.inBattle = true;
    const mobs = [{ id: "mob-1", creature: enemy, roomId: 1, isBoss: false }];
    const chests = [];
    const result = resolveCombatTurn({
      action: "flee",
      state: "playing",
      overlay: battleOverlay("mob-1"),
      mobs,
      combat: fakeCombat(() => ({ over: true, fled: true, logs: [], moments: [] })),
      player,
      world,
      chests,
      currentRoom: world.roomAt(player.position),
      stats: { vanquished: 0, goldEarned: 0, xpGained: 0 },
      floor: 1,
      log: noLogs()
    });
    assertEqual(result.overlay.type, "none", "Successful flee should close the battle overlay");
    assertEqual(result.maybeOpenAutoOverlay, true, "Successful flee should request auto-overlay checks");
    assertEqual(player.inBattle, false, "Successful flee should clear player battle state");
    assertEqual(enemy.inBattle, false, "Successful flee should clear enemy battle state");
    assertEqual(result.currentRoom, null, "Successful flee should relocate the player outside the battle room when possible");
  }
  {
    const player = makePlayer();
    const world = makeWorld();
    const enemy = makeMob("Boss");
    enemy.maxHitpoints = 40;
    enemy.hitpoints = 40;
    enemy.gold = 19;
    const mobs = [{ id: "boss-1", creature: enemy, roomId: 1, isBoss: true }];
    const stats = { vanquished: 0, goldEarned: 0, xpGained: 0 };
    const result = resolveCombatTurn({
      action: "normal",
      state: "playing",
      overlay: battleOverlay("boss-1"),
      mobs,
      combat: fakeCombat((_player, combatEnemy) => {
        combatEnemy.alive = false;
        combatEnemy.hitpoints = 0;
        return { over: true, fled: false, logs: [], moments: [] };
      }),
      player,
      world,
      chests: [],
      currentRoom: world.roomAt(player.position),
      stats,
      floor: 2,
      log: noLogs()
    });
    assertEqual(result.openBossReward, true, "Defeating a boss should request opening boss rewards");
    assertEqual(result.mobs.length, 0, "Defeated enemies should be removed from the live mob list");
    assertEqual(stats.vanquished, 1, "Defeating an enemy should increment vanquish stats");
    assertEqual(stats.goldEarned, 19, "Defeating an enemy should award its gold");
    assertEqual(stats.xpGained, Math.floor(40 * CREATURE_XP_MULTIPLIER), "XP gain should scale with enemy max HP");
  }
  {
    const player = makePlayer();
    const world = makeWorld();
    const enemy = makeMob("Reaper");
    const result = resolveCombatTurn({
      action: "normal",
      state: "playing",
      overlay: battleOverlay("mob-1"),
      mobs: [{ id: "mob-1", creature: enemy, roomId: 1, isBoss: false }],
      combat: fakeCombat((combatPlayer) => {
        combatPlayer.alive = false;
        combatPlayer.hitpoints = 0;
        return { over: true, fled: false, logs: [], moments: [] };
      }),
      player,
      world,
      chests: [],
      currentRoom: world.roomAt(player.position),
      stats: { vanquished: 0, goldEarned: 0, xpGained: 0 },
      floor: 1,
      log: noLogs()
    });
    assertEqual(result.state, "dead", "Player death during combat should transition run state to dead");
    assertEqual(result.finalizeStats, true, "Player death during combat should request final stats finalization");
    assertEqual(result.maybeOpenAutoOverlay, false, "Player death should not request auto-overlay reopening");
  }
}

// src/tests/runProgression.test.ts
function makePlayer2() {
  const player = new Creature(
    "Player",
    { x: 0, y: 0 },
    new AttributeSet({ str: 10, dex: 10, con: 10, int: 10, wis: 10, chr: 10 })
  );
  player.maxHitpoints = 60;
  player.hitpoints = 60;
  return player;
}
function runProgressionTests() {
  {
    const player = makePlayer2();
    const activePerks = [];
    const activeGambits = [];
    const pendingBossRewards = {
      perks: [findBuildChoice("perk-duelist-instinct")],
      gambits: [findBuildChoice("gambit-berserker-stance")]
    };
    const result = chooseBossReward({
      overlayType: "boss-reward",
      pendingBossRewards,
      kind: "none",
      player,
      activePerks,
      activeGambits,
      log: () => {
      }
    });
    assertEqual(result.shouldAdvanceFloor, true, "Skipping boss rewards should advance to the next floor");
    assertEqual(result.pendingBossRewards, null, "Skipping boss rewards should clear pending boss rewards");
  }
  {
    const player = makePlayer2();
    const baseAttack = player.attackBonus;
    const activePerks = [];
    const activeGambits = [];
    const perk = findBuildChoice("perk-duelist-instinct");
    const result = chooseBossReward({
      overlayType: "boss-reward",
      pendingBossRewards: {
        perks: [perk],
        gambits: []
      },
      kind: "perk",
      choiceId: perk.id,
      player,
      activePerks,
      activeGambits,
      log: () => {
      }
    });
    assertEqual(result.shouldAdvanceFloor, true, "Picking a boss reward should advance to the next floor");
    assertEqual(activePerks.length, 1, "Picked perk should be added to active perks");
    assertEqual(activePerks[0].id, perk.id, "Picked perk should match selected id");
    assert(player.attackBonus > baseAttack, "Picked perk should apply its combat effect immediately");
  }
  {
    const player = makePlayer2();
    const stats = { goldEarned: 0 };
    const result = claimShopReward({
      overlayType: "shop-reward",
      pendingShopRewards: createPendingShopRewards([], []),
      choiceId: "remove-perk",
      player,
      stats,
      removeLatestChoice: () => null,
      log: () => {
      }
    });
    assertEqual(result.claimed, true, "Claiming a shop reward should report success when overlay is active");
    assertEqual(result.pendingShopRewards, null, "Claiming a shop reward should clear pending rewards");
    assertEqual(player.gold, SHOP_REWARD_FALLBACK_GOLD, "Missing perk removal should grant fallback gold");
    assertEqual(stats.goldEarned, SHOP_REWARD_FALLBACK_GOLD, "Fallback gold should be tracked in run stats");
  }
  {
    const player = makePlayer2();
    player.hitpoints = 5;
    const before = player.hitpoints;
    const result = claimShopReward({
      overlayType: "shop-reward",
      pendingShopRewards: createPendingShopRewards([], []),
      choiceId: "remove-gambit",
      player,
      stats: { goldEarned: 0 },
      removeLatestChoice: () => null,
      log: () => {
      }
    });
    assertEqual(result.claimed, true, "Missing gambit removal should still claim the reward");
    assert(player.hitpoints > before, "Missing gambit removal should trigger fallback healing");
  }
  {
    const player = makePlayer2();
    player.grantAttributePoint(1);
    const validResult = allocateLevelUp({
      overlayType: "level-up",
      attr: "str",
      validAttributes: LEVEL_UP_ATTRIBUTES,
      player,
      log: () => {
      }
    });
    assertEqual(validResult.spent, true, "Valid level-up allocation should spend a point");
    assertEqual(validResult.nextOverlayType, "none", "Overlay should close when no level-up points remain");
    const invalidResult = allocateLevelUp({
      overlayType: "level-up",
      attr: "int",
      validAttributes: LEVEL_UP_ATTRIBUTES,
      player,
      log: () => {
      }
    });
    assertEqual(invalidResult.spent, false, "Inactive attributes must not be spendable");
    const wrongOverlayResult = allocateLevelUp({
      overlayType: "shop",
      attr: "str",
      validAttributes: LEVEL_UP_ATTRIBUTES,
      player,
      log: () => {
      }
    });
    assertEqual(wrongOverlayResult.spent, false, "Level-up allocation should no-op outside the level-up overlay");
  }
}

// src/save.ts
var SAVE_TOKEN_PREFIX = "std1";
var SAVE_QUERY_PARAM = "save";
function bytesToBase64Url(bytes) {
  let binary = "";
  for (const value of bytes) {
    binary += String.fromCharCode(value);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}
function base64UrlToBytes(input) {
  const normalized = input.replaceAll("-", "+").replaceAll("_", "/");
  const padding = normalized.length % 4;
  const padded = padding === 0 ? normalized : `${normalized}${"=".repeat(4 - padding)}`;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
function encodeSaveToken(run) {
  const payload = JSON.stringify(run.toSaveData());
  const encoded = bytesToBase64Url(new TextEncoder().encode(payload));
  return `${SAVE_TOKEN_PREFIX}.${encoded}`;
}
function decodeSaveToken(token) {
  const trimmed = token.trim();
  const payload = trimmed.startsWith(`${SAVE_TOKEN_PREFIX}.`) ? trimmed.slice(SAVE_TOKEN_PREFIX.length + 1) : trimmed;
  if (!payload) {
    throw new Error("Save token is empty.");
  }
  const raw = new TextDecoder().decode(base64UrlToBytes(payload));
  return JSON.parse(raw);
}
function loadRunFromToken(token) {
  return DungeonRun.fromSaveData(decodeSaveToken(token));
}
function extractSaveToken(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.startsWith(`${SAVE_TOKEN_PREFIX}.`)) {
    return trimmed;
  }
  try {
    const url = new URL(trimmed);
    const token = url.searchParams.get(SAVE_QUERY_PARAM);
    if (token && token.trim().length > 0) {
      return token.trim();
    }
  } catch {
  }
  return trimmed;
}
function buildSaveUrl(token, locationLike) {
  const url = new URL(locationLike.pathname, locationLike.origin);
  url.searchParams.set(SAVE_QUERY_PARAM, token);
  return url.toString();
}
function extractSaveTokenFromSearch(search) {
  const params = new URLSearchParams(search);
  const token = params.get(SAVE_QUERY_PARAM);
  if (!token || token.trim().length === 0) {
    return null;
  }
  return token.trim();
}

// src/tests/save.test.ts
function runSaveTests() {
  const run = new DungeonRun("save-roundtrip");
  run.player.gold = 321;
  run.player.hitpoints = Math.max(1, run.player.hitpoints - 7);
  const token = encodeSaveToken(run);
  assert(token.startsWith("std1."), "Save token should include the std1 prefix");
  const loaded = loadRunFromToken(token);
  assertEqual(loaded.seedPhrase, run.seedPhrase, "Loaded run should preserve the original seed phrase");
  assertEqual(loaded.player.gold, run.player.gold, "Loaded run should preserve gold");
  assertEqual(loaded.player.hitpoints, run.player.hitpoints, "Loaded run should preserve hitpoints");
  assertEqual(loaded.floor, run.floor, "Loaded run should preserve floor");
  const url = buildSaveUrl(token, { origin: "https://example.com", pathname: "/play" });
  assertEqual(extractSaveToken(url), token, "Token extraction should work from a save URL");
  assertEqual(extractSaveToken(` ${token} `), token, "Token extraction should trim surrounding whitespace");
  assertEqual(extractSaveTokenFromSearch(`?save=${encodeURIComponent(token)}`), token, "Search extraction should decode save tokens");
}

// src/tests/run.ts
var tests = [
  { name: "dice", run: runDiceTests },
  { name: "procgen", run: runProcgenTests },
  { name: "combat", run: runCombatTests },
  { name: "run-combat-flow", run: runCombatFlowTests },
  { name: "run-progression", run: runProgressionTests },
  { name: "game", run: runGameTests },
  { name: "save", run: runSaveTests }
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
