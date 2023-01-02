"""Exports constants that can be used across the game."""
import math

# Initial HP the player has in the dungeon
PLAYER_INITIAL_HP = 30

# HP bonus/penalty per level of constitution modifier
PLAYER_CONSTITUTION_BONUS = 5

# Factor to scale up for every increase in challenge level
CHALLENGE_LEVEL_SCALE_UP_FACTOR = 1.3

# Maximum challenge level for mobs in the dungeon
MAXIMUM_CHALLENGE_LEVEL = 10

# Boss challenge level
BOSS_CHALLENGE_LEVEL = MAXIMUM_CHALLENGE_LEVEL + 5

# Lowest possible d20 roll to get a crit for the player
# Used to generate the crit range for weapons in the dungeon
PLAYER_CRIT_MINIMUM_ROLL = 18

# Highest possible damage multiplier for a critical hit
PLAYER_CRIT_MAXIMUM_MULTIPLIER = 3

# Creature gold scale - HP is divided by this to get gold
# a creature will drop.
CREATURE_GOLD_SCALER = 15

# Creature gold multiplier - increases gold payout from creatures.
# Can be floating point, the gold payout will get floor()'d.
CREATURE_GOLD_MULTIPLIER = 3

# Creature XP multiplier - Max HP is multiplied by this to get the total
# XP a player gets for killing the creature.
CREATURE_XP_MULTIPLIER = 2

# The player can move at most one tile per this many milliseconds.
MS_PER_TILE_MOVE = 125

# Creatures can move at most one tile per this many milliseconds.
# It should be moderately higher than the player's move speed or else
# the player has no chance to escape an encounter before it happens.
MS_PER_AI_MOVE = 500

# The maximum damage that a creature at the base challenge level can deal.
# We don't want a weapon that can one-hit the player even with a crit.
# This is multiplied by CHALLENGE_LEVEL_SCALE_UP_FACTOR per challenge level.
CREATURE_MAX_DAMAGE_AT_LEVEL_1 = int(math.floor(PLAYER_INITIAL_HP * 0.3))

# Maximum HP that a creature can have at the base challenge level.
# Too high, and the player spends too long in battles. Too low, and the
# player can too easily complete the dungeon without too much challenge.
# This is multiplied by CHALLENGE_LEVEL_SCALE_UP_FACTOR per challenge level.
CREATURE_MAX_HP_AT_LEVEL_1 = 40

# Maximum HP that a creature can have at the base challenge level.
# This is multiplied by CHALLENGE_LEVEL_SCALE_UP_FACTOR per challenge level.
CREATURE_MIN_HP_AT_LEVEL_1 = int(math.floor(CREATURE_MAX_HP_AT_LEVEL_1 * 0.5))

# Maximum damage multiplier when an attack fails to exceed the defender's armor class.
# This is used to still do a little damage on every attack turn.
# Scaled based on the percentage of the armor class that the attack roll made.
# e.g. AR 20 vs AC 20 is an ineffective attack with 1x scale of this multiplier
# e.g. AR 1 vs AC 20 is an ineffective attack with 0.05x scale of this multiplier
MAXIMUM_INEFFECTIVE_DAMAGE_MULTIPLIER = 0.5

# HP increase multiplier per player level
PLAYER_HP_PER_LEVEL_MULTIPLIER = 1.5

# Percentage of HP to heal on level-up.
PLAYER_HP_HEAL_ON_LEVEL_UP = 0.75

# XP to level 2 for the player. At each level the next XP is multiplied by
# PLAYER_XP_GOAL_MULTIPLIER.
PLAYER_XP_FOR_LEVEL_2 = 128

# XP goal multiplier per level
PLAYER_XP_GOAL_MULTIPLIER = 4

# Named dice for the amount of gold to put in a chest.
GOLD_IN_CHEST_DICE = "6d20"

# Amount of HP that bandages heal
BANDAGES_HEAL_HP = 5

# Amount of HP that a health potion heals
HEALTH_POTION_HEAL_HP = BANDAGES_HEAL_HP * 5

# Amount of HP that a large health potion heals
LARGE_HEALTH_POTION_HEAL_HP = HEALTH_POTION_HEAL_HP * 2

# Amount of HP that a huge health potion heals
HUGE_HEALTH_POTION_HEAL_HP = HEALTH_POTION_HEAL_HP * 4

# Amount of HP that a colossal health potion heals
COLOSSAL_HEALTH_POTION_HEAL_HP = HEALTH_POTION_HEAL_HP * 10

# Discount per level of charisma modifier in the shop.
SHOP_DISCOUNT_FOR_CHARISMA = 0.05

# Number of ability points for point buy character creation.
POINT_BUY_POOL_COUNT = 27
