"""Exports constants that can be used across the game."""

# Initial HP the player has in the dungeon
PLAYER_INITIAL_HP = 30

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
