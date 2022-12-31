"""This module provides common utilities for tests to use."""

from typing import List, Iterable

from typing import Optional
from survive.game.attributes import AttributeSet
from survive.game.creature import Creature
from survive.game.dice import Dice
from survive.game.item import Armor, InstantEffectItem, Weapon

class TestDice(Dice):
    """A test dice that returns values from a queue instead of an RNG."""

    def __init__(self):
        self._results: List[int] = []

    def set_results(self, results: List[int]):
        """Set the queue of results directly."""
        self._results = results

    def queue_result(self, result: int):
        """Add a result to the queue."""
        self._results.append(result)

    def queue_results(self, *args: Iterable[int]):
        """Add multiple results at once."""
        self._results.extend(args)

    def roll(self, _: int = 1, __: int = 20) -> int:
        return self._results.pop(0)

    def rollnamed(self, _: str) -> int:
        return self._results.pop(0)

def create_creature(name: str = "Creature", hp: int = 5) -> Creature:
    """Create a creature to be used for testing."""
    creature_attribs = AttributeSet()
    creature_attribs.modify("str", 16)
    creature_attribs.modify("dex", 14)
    creature_attribs.modify("con", 12)
    creature_attribs.modify("int", 12)
    creature_attribs.modify("wis", 13)
    creature_attribs.modify("chr", 10)

    creature = Creature(
            None,
            (0, 0),
            name,
            attribute_override=creature_attribs,
    )

    creature.maxhitpoints = creature.hitpoints = hp

    return creature

def equip_standard(creature: Creature):
    """Equip the given creature with standard basic gear."""
    fists = Weapon("Fists", 19, 2, dam="1d10")
    cloth = Armor("chest", name="Cloth Armor", defensebonus=1)
    leather_boots = Armor("feet", name="Leather Boots", defensebonus=1)

    creature.wield("hands", fists)
    creature.wield("chest", cloth)
    creature.wield("feet", leather_boots)

def get_healing_item(hp: int, name: str = "Bandages") -> InstantEffectItem:
    """Get a healing item that heals the given HP."""
    return InstantEffectItem(name, hp)
