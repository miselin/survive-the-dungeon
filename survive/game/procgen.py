"""This module handles various procedural generation tasks."""


import collections
import math
import random
from typing import Dict, List, Optional, Set

from .attributes import AttributeSet
from .constants import (CHALLENGE_LEVEL_SCALE_UP_FACTOR,
                        CREATURE_MAX_DAMAGE_AT_LEVEL_1,
                        CREATURE_MAX_HP_AT_LEVEL_1, CREATURE_MIN_HP_AT_LEVEL_1)
from .creature import Creature
from .game import game
from .item import Armor, Weapon
from .types import Wieldpoint
from .words import random_adjective, random_adverb

NAMES: Dict[str, Wieldpoint] = {
    "Helmet": "head",
    "Cap": "head",
    "Chestplate": "chest",
    "Shirt": "chest",
    "Leggings": "legs",
    "Greaves": "legs",
    "Boots": "feet",
    "Shoes": "feet",
    "Sandals": "feet",
    "Gauntlets": "arms",
    "Vambraces": "arms",
    "Sleeves": "arms",
    "Sword": "hands",
    "Dagger": "hands",
    "Stick": "hands",
    "Bat": "hands",
    "Longsword": "hands",
    "Shiv": "hands",
}

MOB_ATTRIBUTES = AttributeSet()
MOB_ATTRIBUTES.modify("str", 16)
MOB_ATTRIBUTES.modify("dex", 14)
MOB_ATTRIBUTES.modify("con", 12)
MOB_ATTRIBUTES.modify("int", 12)
MOB_ATTRIBUTES.modify("wis", 13)
MOB_ATTRIBUTES.modify("chr", 10)


class NameGenerator:
    """A name generator that never uses the same name twice."""

    def __init__(self, rng: random.Random):
        self._seen: Set[str] = set()
        self._rng = rng

        self._point_to_names: collections.defaultdict[
            Wieldpoint, List[str]
        ] = collections.defaultdict(list)

        for name, point in NAMES.items():
            self._point_to_names[point].append(name)

    def generate_name(self, point: Wieldpoint, special=False) -> str:
        """Generate a name for the given wieldpoint."""

        names_list = self._point_to_names[point]

        adj = random_adjective(self._rng)
        if special:
            adverb = random_adverb(self._rng)

        while True:
            name = self._rng.choice(names_list)
            if special:
                name = f"The {adverb} {adj} {name}"
            else:
                name = f"The {adj} {name}"

            if name in self._seen:
                adj = random_adjective(self._rng)
                if special:
                    adverb = random_adverb(self._rng)
                continue

            self._seen.add(name)

            return name


def create_weapon(name: str, max_damage: int, challenge_level: int, rng: random.Random):
    """Create a procedurally-generated weapon."""

    dmg = rng.randint(max_damage // 2, max_damage)

    faces = 20
    if dmg < faces:
        faces = dmg

    count = int(math.floor(dmg / faces))

    bonus = challenge_level

    return Weapon(name.title(), 20, 2, bonus + 1, 0, f"{count}d{faces}")


def create_armor(
    name: str, point: Wieldpoint, challenge_level: int, rng: random.Random
):
    """Create a procedurally-generated armor."""

    return Armor(
        point,
        name=name.title(),
        attackbonus=challenge_level,
        defensebonus=rng.randint(1, challenge_level + 2),
    )


def creature_at_level(
    challenge_level: int,
    name_generator: NameGenerator,
    rng: Optional[random.Random] = None,
) -> Creature:
    """Create a procedurally-generated creature at the given challenge level."""

    if rng is None:
        rng = game().random()

    max_damage = CREATURE_MAX_DAMAGE_AT_LEVEL_1

    min_hp = CREATURE_MIN_HP_AT_LEVEL_1
    max_hp = CREATURE_MAX_HP_AT_LEVEL_1

    potential_mountpoints: List[Wieldpoint] = ["chest", "arms", "feet"]

    for _ in range(challenge_level):
        # scale up
        max_damage = int(math.ceil(max_damage * CHALLENGE_LEVEL_SCALE_UP_FACTOR))
        max_hp = int(math.ceil(max_hp * CHALLENGE_LEVEL_SCALE_UP_FACTOR))
        min_hp = int(math.ceil(min_hp * CHALLENGE_LEVEL_SCALE_UP_FACTOR))

    weapon_name = name_generator.generate_name("hands")
    weapon = create_weapon(weapon_name, max_damage, challenge_level, rng)

    point: Wieldpoint = rng.choice(potential_mountpoints)

    armor_name = name_generator.generate_name(point)
    armor = create_armor(armor_name, point, challenge_level, rng)

    total_hp = rng.randint(min_hp, max_hp)

    creature = Creature(None, (0, 0), "Goblin")
    creature.hitpoints = creature.maxhitpoints = total_hp
    creature.wield(armor.wields_at(), armor)
    creature.wield(weapon.wields_at(), weapon)

    return creature
