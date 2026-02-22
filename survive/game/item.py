"""This module exports classes for items in the world."""

import abc
import typing
from typing import Any, List

from .constants import PLAYER_CRIT_MINIMUM_MULTIPLIER
from .dice import Dice
from .types import Position, Wieldpoint

if typing.TYPE_CHECKING:
    from .creature import Creature

COLOR_RED = "#FF6464"
COLOR_GREEN = "#64FF64"


def render_inequality(a: float, b: float, fp: bool = False, higher_better: bool = True):
    """Renders a formatted string comparing two values."""

    if fp:
        a_str = "%.2f" % (a,)
        b_str = "%.2f" % (b,)
    else:
        a_str = "%d" % (a,)
        b_str = "%d" % (b,)

    if a < b:
        if higher_better:
            color = COLOR_RED
        else:
            color = COLOR_GREEN
        return "<font color=%s>%s < %s</font>" % (color, a_str, b_str)

    if a > b:
        if higher_better:
            color = COLOR_GREEN
        else:
            color = COLOR_RED
        return "<font color=%s>%s > %s</font>" % (color, a_str, b_str)

    return "%s = %s" % (a_str, b_str)


class Item:
    """Base class for all items in the game."""

    __metaclass__ = abc.ABCMeta

    def __init__(self, name: str = "Unknown Item"):
        self.name = name
        self.value: int = 1  # in gold

    @abc.abstractmethod
    def describe(self) -> str:
        """Describes the item."""


class Gold(Item):
    """Gold, by itself. For pickups from chests."""

    def __init__(self, value=1):
        super().__init__(name="Gold")
        self.value = value

    def __repr__(self):
        return self.describe()

    def describe(self) -> str:
        return "%d gold pieces" % (self.value,)


class WieldableItem(Item):
    """Base class for items that can be wielded."""

    def __init__(self, name="Unknown Wieldable Item", attackbonus=0, defensebonus=0):
        super().__init__(name=name)

        self.attackbonus = attackbonus
        self.defensebonus = defensebonus

    def __repr__(self):
        return self.describe()

    def describe(self) -> str:
        return "Wieldable '%s' attack bonus %.2f defense bonus %.2f" % (
            self.name,
            self.attackbonus,
            self.defensebonus,
        )

    def get_attack_bonus(self):
        """Get this item's attack bonus."""
        return self.attackbonus

    def get_defense_bonus(self):
        """Get this item's defense bonus."""
        return self.defensebonus

    def compare_to(self, other, tag=""):
        """Compre this item to another."""
        raise NotImplementedError(
            "Wieldable cannot implement compare_to, implement in subclass"
        )

    def wields_at(self) -> Wieldpoint:
        """Get the wieldpoint at which this item wields at."""
        raise NotImplementedError("Wieldable subclass must implement wields_at")


class Armor(WieldableItem):
    """Defines an Armor item."""

    def __init__(self, wields_at: Wieldpoint, *args, name="Unknown Armor", **kwargs):
        kwargs["name"] = name
        super().__init__(*args, **kwargs)
        self.wieldpoint = wields_at

    def __repr__(self):
        return self.describe()

    def describe(self) -> str:
        if self.attackbonus != 0:
            atk = " +%d ATK" % (self.attackbonus,)
        else:
            atk = ""

        if self.defensebonus != 0:
            df = " +%d DEF" % (self.defensebonus,)
        else:
            df = ""

        return "Armor '%s'%s%s" % (
            self.name,
            atk,
            df,
        )

    def wields_at(self) -> Wieldpoint:
        return self.wieldpoint

    def compare_to(self, other, tag="") -> str:
        return f"""Comparing {self.name} to {other.name}{tag}:
Attack Bonus: {render_inequality(self.attackbonus, other.attackbonus)}
Defense Bonus: {render_inequality(self.defensebonus, other.defensebonus)}
Wields At: {self.wieldpoint}
"""

    def serialize(self) -> Any:
        """Serializes the armor to a dict."""
        return {
            "name": self.name,
            "wieldpoint": self.wieldpoint,
            "attackbonus": self.attackbonus,
            "defensebonus": self.defensebonus,
        }

    @classmethod
    def deserialize(cls, obj: Any) -> "Weapon":
        """Deserializes the armor from a serialized dict."""
        return Weapon(**obj)


class Weapon(WieldableItem):
    """Defines a weapon."""

    def __init__(
        self,
        name="Unknown Weapon",
        critrange=20,
        critmult=PLAYER_CRIT_MINIMUM_MULTIPLIER,
        attackbonus=4,
        defensebonus=-1,
        dam="1d6",
    ):
        super().__init__(name, attackbonus, defensebonus)

        self.critrange = critrange
        self.critmult = max(PLAYER_CRIT_MINIMUM_MULTIPLIER, critmult)
        self.dam = dam

    def __repr__(self):
        return self.describe()

    def describe(self) -> str:
        return "'%s' dam %s crit %d-20 (x%.2f)" % (
            self.name,
            self.dam,
            self.critrange,
            self.critmult,
        )

    def critical_range(self):
        """Gets the critical range for this weapon.

        This sets the range of values that can trigger criticals.

        20 is a sane default. If lower, the weapon will more frequently crit."""
        return self.critrange

    def critical_multiplier(self):
        """Gets the critical hit multiplier for this weapon."""
        return self.critmult

    def damage(self) -> str:
        """Gets the damage dice name for this weapon."""
        return self.dam

    def wields_at(self) -> Wieldpoint:
        return "hands"

    def compare_to(self, other, tag="") -> str:
        dice = Dice()
        dam_min, dam_max = dice.minmax(self.dam)
        other_dam_min, other_dam_max = dice.minmax(other.dam)
        return f"""Comparing {self.name} to {other.name}{tag}:
Crit range: {render_inequality(self.critrange, other.critrange, higher_better=False)}
Crit multiplier: {render_inequality(self.critmult, other.critmult)}
Damage roll: {self.dam} vs {other.dam}
  ... minimum damage {render_inequality(dam_min, other_dam_min)}
  ... maximum damage {render_inequality(dam_max, other_dam_max)}
"""

    def serialize(self) -> Any:
        """Serializes the weapon to a dict."""
        return {
            "name": self.name,
            "critrange": self.critrange,
            "critmult": self.critmult,
            "dam": self.dam,
            "attackbonus": self.attackbonus,
            "defensebonus": self.defensebonus,
        }

    @classmethod
    def deserialize(cls, obj: Any) -> "Weapon":
        """Deserializes the weapon from a serialized dict."""
        return Weapon(**obj)


class InstantEffectItem(Item):
    """Describes an item that has an immediate effect when applied."""

    def __init__(self, name="Unknown Instant Effect Item", hpboost=0, hpdrop=0):
        super().__init__(name)

        self.hpboost = hpboost
        self.hpdrop = hpdrop

    def __repr__(self):
        return self.describe()

    def describe(self) -> str:
        if self.hpboost > 0:
            heals = " heals %d HP" % (self.hpboost,)
        else:
            heals = ""

        if self.hpdrop > 0:
            removes = " removes %d HP" % (self.hpdrop,)
        else:
            removes = ""

        return "'%s'%s%s per use" % (
            self.name,
            heals,
            removes,
        )

    def apply(self, creature: "Creature"):
        """Apply the item to the given creature."""
        previous = creature.hitpoints
        creature.hitpoints = min(
            creature.maxhitpoints, (creature.hitpoints + self.hpboost) - self.hpdrop
        )
        return creature.hitpoints - previous


class TurnBasedEffectItem(Item):
    """Describes an item that has an effect per turn when applied."""

    def __init__(self, name="Unknown Turn-based Effect Item", lifetime=5):
        super().__init__(name)

        self.expiry = 0
        self.lifetime = lifetime

    def set_expiry(self, turn: int):
        """Set the turn at which this item will expire."""
        self.expiry = turn

    def has_expired(self, turn: int) -> bool:
        """Check if this item expires at the given turn."""
        return turn >= self.expiry

    def get_lifetime(self):
        """Get the item's lifetime."""
        return self.lifetime

    def describe(self):
        return f"Item {self.name} does nothing per turn for {self.lifetime} turns"


class Poison(TurnBasedEffectItem):
    """Describes a poison."""

    def __init__(self, name="Unknown Poison", damageperturn=5, lifetime=5):
        TurnBasedEffectItem.__init__(self, name, lifetime)

        self.damageperturn = damageperturn

    def __repr__(self):
        return self.describe()

    def describe(self) -> str:
        return "Poison '%s' deals %d damage per turn for %d turns" % (
            self.name,
            self.damageperturn,
            self.lifetime,
        )

    def damage_per_turn(self) -> int:
        """Get the amount of damage this poison does per turn."""
        return self.damageperturn


class Buff(TurnBasedEffectItem):
    """Describes a buff."""

    def __init__(
        self, name="Unknown Buff", hpbuff=5, attackbuff=2, defensebuff=2, lifetime=5
    ):
        super().__init__(name, lifetime)

        self.hp_buff = hpbuff
        self.attack_buff = attackbuff
        self.defense_buff = defensebuff

    def __repr__(self):
        return self.describe()

    def describe(self):
        return (
            "Buff '%s' gives +%d HP, +%d Attack Bonus, and +%d Defense Bonus for %d turns"
            % (
                self.name,
                self.hp_buff,
                self.attack_buff,
                self.defense_buff,
                self.lifetime,
            )
        )

    def get_hp_buff(self) -> int:
        """Get the amount of HP buffed until expiry."""
        return self.hp_buff

    def get_attack_buff(self) -> int:
        """Get the amount of ATK buffed until expiry."""
        return self.attack_buff

    def get_defense_buff(self) -> int:
        """Get the amount of DEF buffed until expiry."""
        return self.defense_buff


class Container:
    """Describes a container in the world."""

    def __init__(self, capacity: int = 5, locked: bool = False):
        self._capacity = capacity
        self._locked = locked
        self._inventory: List[Item] = []

    def count(self):
        """Returns the number of items in the container."""
        return len(self._inventory)

    def capacity(self):
        """Returns the number of items that can fit in the container."""
        return self._capacity

    def items(self):
        """Returns the items in the container."""
        return self._inventory

    def full(self):
        """Returns True if the container is full."""
        return len(self._inventory) >= self._capacity

    def empty(self):
        """Returns True if the container is empty."""
        return len(self._inventory) == 0

    def add_item(self, item: Item) -> bool:
        """Adds an item to the container. Returns False if it's full."""
        if self.full():
            return False

        self._inventory.append(item)

        return True

    def take_item(self, item: Item):
        """Removes the given item from the container."""
        self._inventory.remove(item)

    def take_all(self):
        """Takes all items from the container."""
        items = self.items()
        self._inventory = []
        return items


class Chest(Container):
    """Specialiation of Container with a world coordinate."""

    def __init__(self, pos: Position, capacity=5):
        super().__init__(capacity=capacity)
        self.position = pos
