export const WORLD_WIDTH = 64;
export const WORLD_HEIGHT = 64;

// Player baseline
export const PLAYER_INITIAL_HP = 30;
export const PLAYER_CONSTITUTION_BONUS = 5;
export const PLAYER_START_X = 4;
export const PLAYER_START_Y = 4;
export const PLAYER_BASE_ATTACK_BONUS = 2;
export const PLAYER_BASE_DEFENSE_BONUS = 2;
export const PLAYER_BASE_DEFENSE = 5;
export const PLAYER_INVENTORY_CAPACITY = 10;

// Creature/floor challenge scaling
export const CHALLENGE_LEVEL_SCALE_UP_FACTOR = 1.3;
export const MAXIMUM_CHALLENGE_LEVEL = 10;
export const BOSS_CHALLENGE_LEVEL = MAXIMUM_CHALLENGE_LEVEL + 5;
export const FLOOR_DEPTH_SCALE_PER_FLOOR = 0.02;

// Critical tuning
export const PLAYER_CRIT_MINIMUM_ROLL = 18;
export const PLAYER_CRIT_MAXIMUM_MULTIPLIER = 3;
export const WEAPON_CRIT_MAXIMUM_ROLL = 20;
export const DEFAULT_WEAPON_CRITICAL_RANGE = 20;
export const DEFAULT_WEAPON_CRITICAL_MULTIPLIER = 2;
export const DEFAULT_WEAPON_DAMAGE_DICE = "1d6";
export const DEFAULT_WEAPON_ATTACK_BONUS = 4;
export const DEFAULT_WEAPON_DEFENSE_BONUS = -1;
export const MOB_CRITICAL_RANGE_MINIMUM = 17;
export const MOB_CRITICAL_MULTIPLIER_MAXIMUM = 3;

export const CREATURE_MAX_DAMAGE_AT_LEVEL_1 = Math.floor(PLAYER_INITIAL_HP * 0.3);
export const CREATURE_MAX_HP_AT_LEVEL_1 = 40;
export const CREATURE_MIN_HP_AT_LEVEL_1 = Math.floor(CREATURE_MAX_HP_AT_LEVEL_1 * 0.5);
export const CREATURE_BASE_STR = 6;
export const CREATURE_BASE_DEX = 4;
export const CREATURE_BASE_CON = 2;
export const CREATURE_BASELINE_STR = 8;
export const CREATURE_BASELINE_DEX = 8;
export const CREATURE_BASELINE_CON = 8;
export const CREATURE_BASE_ATTACK_BONUS = 0;
export const CREATURE_BASE_DEFENSE_BONUS = 0;

export const CREATURE_GOLD_SCALER = 15;
export const CREATURE_GOLD_MULTIPLIER = 3;
export const CREATURE_XP_MULTIPLIER = 2;

// Level scaling
export const PLAYER_HP_PER_LEVEL_MULTIPLIER = 1.5;
export const PLAYER_HP_HEAL_ON_LEVEL_UP = 0.75;
export const PLAYER_XP_FOR_LEVEL_2 = 128;
export const PLAYER_XP_GOAL_MULTIPLIER = 4;

// Combat tuning
export const MAXIMUM_INEFFECTIVE_DAMAGE_MULTIPLIER = 0.5;
export const COMBAT_OFFENSIVE_ATTACK_MULTIPLIER = 2.0;
export const COMBAT_OFFENSIVE_DEFENSE_MULTIPLIER = 0.3;
export const COMBAT_DEFENSIVE_ATTACK_MULTIPLIER = 0.5;
export const COMBAT_DEFENSIVE_DEFENSE_MULTIPLIER = 1.5;
export const FLEE_DIE_SIDES = 20;
export const FLEE_BASE_DC = 11;
export const PLAYER_LUCK_HISTORY_SIZE = 8;
export const PLAYER_LUCK_LOW_ROLL_THRESHOLD = 8;
export const PLAYER_LUCK_LOW_ROLL_TRIGGER = 4;
export const PLAYER_LUCK_BONUS_PER_LOW_ROLL = 1;
export const PLAYER_LUCK_MAX_HISTORY_BONUS = 3;
export const PLAYER_LUCK_BONUS_PER_MISS_STREAK = 1;
export const PLAYER_LUCK_MAX_MISS_STREAK_BONUS = 3;
export const PLAYER_LUCK_LOW_HP_RATIO = 0.3;
export const PLAYER_LUCK_LOW_HP_BONUS = 2;
export const PLAYER_LUCK_CRITICAL_HP_RATIO = 0.15;
export const PLAYER_LUCK_CRITICAL_HP_EXTRA_BONUS = 1;
export const PLAYER_LUCK_MAX_TOTAL_BONUS = 6;

// Enemy behavior profiles
export const ENEMY_STYLE_LOW_HP_RATIO = 0.35;
export const ENEMY_STYLE_GUARDED_CHANCE_PERCENT = 45;
export const ENEMY_STYLE_RECKLESS_CHANCE_PERCENT = 30;
export const ENEMY_STYLE_GUARDED_ATTACK_MULTIPLIER = 0.65;
export const ENEMY_STYLE_GUARDED_DEFENSE_MULTIPLIER = 1.4;
export const ENEMY_STYLE_RECKLESS_ATTACK_MULTIPLIER = 1.6;
export const ENEMY_STYLE_RECKLESS_DEFENSE_MULTIPLIER = 0.7;
export const ENEMY_STYLE_STEADY_ATTACK_MULTIPLIER = 1.0;
export const ENEMY_STYLE_STEADY_DEFENSE_MULTIPLIER = 1.0;

// Economy/shop
export const SHOP_DISCOUNT_FOR_CHARISMA = 0.05;
export const SHOP_SERVICE_COST_BONUS_POINT = 180;
export const SHOP_SERVICE_COST_REMOVE_PERK = 260;
export const SHOP_SERVICE_COST_REMOVE_GAMBIT = 240;
export const SHOP_REWARD_FALLBACK_GOLD = 120;

// Consumables
export const BANDAGES_HEAL_HP = 5;
export const HEALTH_POTION_HEAL_HP = BANDAGES_HEAL_HP * 5;
export const LARGE_HEALTH_POTION_HEAL_HP = HEALTH_POTION_HEAL_HP * 2;
export const HUGE_HEALTH_POTION_HEAL_HP = HEALTH_POTION_HEAL_HP * 4;
export const COLOSSAL_HEALTH_POTION_HEAL_HP = HEALTH_POTION_HEAL_HP * 10;
export const BANDAGES_GOLD_VALUE = 10;
export const HEALTH_POTION_GOLD_VALUE = 50;
export const LARGE_HEALTH_POTION_GOLD_VALUE = 250;
export const HUGE_HEALTH_POTION_GOLD_VALUE = 750;
export const COLOSSAL_HEALTH_POTION_GOLD_VALUE = 1250;
export const INSTAHEAL_GOLD_VALUE = 15000;
export const STARTING_BANDAGE_COUNT = 5;

// Starting weapon loadout
export const STARTING_WEAPON_CRITICAL_RANGE = 19;
export const STARTING_WEAPON_CRITICAL_MULTIPLIER = 3;
export const STARTING_WEAPON_ATTACK_BONUS = 0;
export const STARTING_WEAPON_DEFENSE_BONUS = 0;
export const STARTING_WEAPON_DAMAGE_DICE = "1d10";

// Turn-based items
export const TURN_EFFECT_DEFAULT_LIFETIME = 5;
export const POISON_DEFAULT_DAMAGE_PER_TURN = 5;
export const BUFF_DEFAULT_HP = 5;
export const BUFF_DEFAULT_ATTACK = 2;
export const BUFF_DEFAULT_DEFENSE = 2;

// Inventory/chest capacities
export const CHEST_DEFAULT_CAPACITY = 5;
export const FLOOR_CHEST_CAPACITY = 6;

// Procgen loot knobs
export const ITEM_POOL_GENERATION_COUNT = 260;
export const ITEM_SPECIAL_ROLL_MIN = 19;
export const ITEM_SPECIAL_VALUE_MULTIPLIER = 3;
export const ITEM_DEFAULT_VALUE_MULTIPLIER = 1;
export const NAME_GENERATION_MAX_ATTEMPTS = 200;
export const NAME_GENERATION_FALLBACK_MAX_ID = 100000;
export const ITEM_WEAPON_MAX_DAMAGE_ROLL_MIN = 6;
export const ITEM_WEAPON_MAX_DAMAGE_ROLL_MAX = 24;
export const WEAPON_DAMAGE_FACE_MIN = 2;
export const WEAPON_DAMAGE_FACE_MAX = 20;
export const ITEM_WEAPON_CHALLENGE_ROLL_MIN = 1;
export const ITEM_WEAPON_CHALLENGE_ROLL_MAX = 6;
export const ITEM_WEAPON_FLAT_BONUS_BASE = 1;
export const ITEM_WEAPON_FLAT_BONUS_CHALLENGE_DIVISOR = 2;
export const ITEM_WEAPON_FLAT_BONUS_RANDOM_MAX = 3;
export const ITEM_ARMOR_CHALLENGE_ROLL_MIN = 1;
export const ITEM_ARMOR_CHALLENGE_ROLL_MAX = 6;
export const ITEM_ARMOR_DEFENSE_BASE_MIN = 1;
export const ITEM_ARMOR_DEFENSE_CHALLENGE_BONUS = 2;
export const ITEM_WEAPON_VALUE_DIE_SIDES = 8;
export const ITEM_WEAPON_VALUE_DIE_MULTIPLIER = 10;
export const ITEM_ARMOR_VALUE_ATTACK_WEIGHT = 3;
export const ITEM_ARMOR_VALUE_DEFENSE_WEIGHT = 2;
export const SHOP_TOP_WEAPONS = 5;
export const SHOP_TOP_ARMORS = 5;
export const SHOP_CLUTTER_DENSITY_DIVISOR = 3;

// Mob/chest spawn formulas
export const FLOOR_MOB_BASE = 3;
export const FLOOR_MOB_PER_FLOOR = 0.5;
export const FLOOR_CHEST_BASE = 5;
export const FLOOR_CHEST_PER_FLOOR = 0.4;
export const FLOOR_SCALE_MINIMUM = 0.2;
export const BOSS_STR_BONUS_BASE = 8;
export const BOSS_DEX_BONUS_BASE = 4;
export const BOSS_DEX_BONUS_FLOOR_DIVISOR = 2;
export const BOSS_CON_BONUS_BASE = 6;
export const BOSS_HP_SCALE_PER_FLOOR = 0.16;

// Chest loot odds
export const CHEST_WEAPON_ROLL_MIN = 13; // d20 > 12
export const CHEST_ARMOR_ROLL_MIN = 16; // d20 > 15
export const CHEST_GOLD_ROLL_MIN = 8; // d20 > 7
export const CHEST_HUGE_POTION_ROLL_MIN = 20; // d20 >= 20
export const CHEST_LARGE_OR_HEALTH_ROLL_MIN = 19; // d20 >= 19
export const CHEST_TIERED_POTION_ROLL_MIN = 18; // d20 >= 18
export const CHEST_HIGH_TIER_LEVEL = 8;
export const CHEST_MID_TIER_LEVEL = 5;
export const CHEST_GOLD_DICE = "6d20";

// Floor transition/healing
export const FLOOR_TRANSITION_HEAL_RATIO = 0.35;
export const FLOOR_TRANSITION_HEAL_MINIMUM = 4;
export const SHOP_REWARD_HEAL_FALLBACK_RATIO = 0.35;

// AI wandering
export const AI_MOVE_MS = 450;
export const AI_WANDER_ROLL_MAX = 12;
export const AI_WANDER_MOVE_ROLL_MIN = 9; // move when roll is 9..12

export const LOG_LIMIT = 9;

export const DANGER_WARNING_LEVEL_GAP = 2;
export const SURPRISE_PROTECTION_ATTACK_MULTIPLIER = 0.35;
export const SURPRISE_PROTECTION_FLEE_BONUS = 6;

export const DEFAULT_ATTRS = {
  str: 14,
  dex: 12,
  con: 14,
  int: 10,
  wis: 10,
  chr: 10,
};

export const STARTING_ATTRS = {
  str: 16,
  dex: 14,
  con: 14,
  int: 10,
  wis: 10,
  chr: 10,
};
