"""This module handles everything to do with creatures (and the player)"""

import math
import typing
from typing import Dict, Iterable, List, Optional, Tuple

import pygame

from .attributes import AttributeSet
from .dice import Dice
from .game import game
from .item import Buff, Container, Gold, Item, Poison, WieldableItem
from .types import Position, Wieldpoint

if typing.TYPE_CHECKING:
    from .ai import AIInstance


class Creature:
    """Creature defines a creature in the world, including the player."""

    def __init__(
        self,
        sprite: pygame.Surface,
        initial_pos: Position,
        name: str = "Creature",
        attribute_override: Optional[AttributeSet] = None,
    ):
        self.sprite = sprite
        self.position = initial_pos

        # Name of the creature.
        self.name = name

        # Creature base attributes
        if attribute_override is not None:
            self.attributes = attribute_override
        else:
            self.attributes = AttributeSet()

        # Alive or dead?
        self.alive = True

        # Creature's hitpoints. Can be increased by any number of means.
        # Can only be increased past the maximum hitpoints by a buff from a
        # power or armor piece.
        self.hitpoints = 30

        # Creature's maximum hitpoints. Can only be increased by specific
        # powers, or by levelling up.
        self.maxhitpoints = 30

        # Buffs applied to the creature at this point in time.
        self.buffs: List[Buff] = []

        # Poisons applied to the creature at this point in time.
        self.poisons: List[Poison] = []

        # Current experience points
        self.xp = 0

        # Next level experience points
        self.next_level_xp = 64

        # Current level
        self.level = 1

        # Turn number. Used for buff timeouts and such.
        self.turn = 1

        # How much gold do we have?
        self.gold: int = 0

        # Current inventory.
        self.inventory = Container(capacity=10)

        # Some creatures will naturally have a higher defense base. This number
        # is immutable - additional defense points come from the defense bonus
        # which is calculated from armor, and from the CON attribute (and to
        # a lesser extent, the DEX attribute)
        self.defense_base = 5

        # The attack bonus will be calculated as weapons are wielded or powers
        # used that cause the creature to gain or lose attack bonuses. For
        # example, a piece of armor might increase the defensive bonus but be
        # awfully unwieldy, causing the attack bonus to reduce. Minimum of 2.
        self.attack_bonus = 2

        # The defense bonus is adjusted when armor is worn or powers used.
        # Minimum of 2.
        self.defense_bonus = 2

        # All wield points for the creature. None means not wielded, otherwise
        # this will be valid Python object holding information about the item.
        # Note that wielding anything will automatically affect the bonuses -
        # the actual inventory and wield points is for the player's benefit.
        self.wieldpoints: Dict[Wieldpoint, Optional[WieldableItem]] = {
            "head": None,  # Helmets and such
            "chest": None,  # Armor
            "arms": None,  # Armor
            "hands": None,  # Weapons
            "legs": None,  # Armor
            "feet": None,
        }  # Armor, dexterity modifiers

        self.default_wield: Dict[Wieldpoint, Optional[WieldableItem]] = {
            "head": None,  # Helmets and such
            "chest": None,  # Armor
            "arms": None,  # Armor
            "hands": None,  # Weapons
            "legs": None,  # Armor
            "feet": None,
        }

        # Creatures in battle don't do other AI things like move around.
        self.in_battle = False

        # Creatures can be controlled by an AI that needs to think, too.
        self.ai: Optional["AIInstance"] = None

    def rollforattrs(self):
        """Rolls dice for the attributes of this creature."""

        rolls = self.attributes.rollfor()

        dice = Dice()

        # hp = d20 + CON modifier normalized to 14 as the midpoint

        rolls["hp"] = (dice.roll(1, 20) + rolls["con"][0] - 14, "1d20")
        self.hitpoints = self.maxhitpoints = max(
            5, rolls["hp"][0]
        )  # creatures cannot have less than 5 hp to start with

        return rolls

    def roll_mob_attrs(self):
        """Rolls dice for mob attributes such as held gold."""

        dice = Dice()
        # scale gold based on HP of the creature
        count = int(math.ceil(self.maxhitpoints / 15))
        if count <= 0:
            count = 1
        self.gold = dice.rollnamed(f"{count}d20") * 3

    def get_weapon_damage(self):
        """Gets the damage of the weapon currently wielded."""

        # Unarmed combat: 1-6 damage.
        if self.wieldpoints["hands"] is not None:
            return "1d6"

        return self.wieldpoints["hands"].damage()

    def get_weapon_critical_range(self):
        """Gets the critical range of the weapon currently wielded."""

        # Unarmed combat is always a 5% chance of a critical
        if self.wieldpoints["hands"] is not None:
            return 20

        return self.wieldpoints["hands"].critical_range()

    def get_weapon_critical_multiplier(self):
        """Gets the critical multiplier of the weapon currently wielded."""

        # Unarmed combat will always have a 2x damage critical
        if self.wieldpoints["hands"] is not None:
            return 2

        return self.wieldpoints["hands"].critical_multiplier()

    def wield(self, point: Wieldpoint, item: WieldableItem):
        """Wields the given item at the given mount point."""

        # Unwield any existing item, and remove bonuses.
        current_item = self.wieldpoints[point]
        if current_item is not None:
            self.attack_bonus -= current_item.get_attack_bonus()
            self.defense_bonus -= current_item.get_defense_bonus()

        # Wield the new item
        self.wieldpoints[point] = item

        # Apply bonuses
        if item is not None:
            self.attack_bonus += item.get_attack_bonus()
            self.defense_bonus += item.get_defense_bonus()

    def at_wield_point(self, point: Wieldpoint) -> Optional[WieldableItem]:
        """Returns the item wielded at the given mount point."""

        return self.wieldpoints[point]

    def buff(self, buff: Buff):
        """Adds a buff to the creature."""

        self.buffs += [buff]

        buff.set_expiry(self.turn + buff.get_lifetime())

        self.hitpoints += buff.get_hp_buff()
        self.attack_bonus += buff.get_attack_buff()
        self.defense_bonus += buff.get_defense_buff()

    def poison(self, poison: Poison):
        """Applies a poison to the creature."""

        self.poisons += [poison]

        poison.set_expiry(self.turn + poison.get_lifetime())

    def think(self):
        """Handles any logic that needs to repeatedly happen for the creature.

        This includes things like buffs and poisons, or AI if attached."""

        # Don't do anything for dead creatures.
        if not self.alive:
            return

        if self.ai is not None:
            self.ai.think()

        # Check all buffs for expiry
        remove_list = []
        for buff in self.buffs:
            if buff.hasExpired(self.turn):
                remove_list += [buff]

        for buff in remove_list:
            self.buffs.remove(buff)

            self.hitpoints -= buff.get_hp_buff()
            self.attack_bonus -= buff.get_attack_buff()
            self.defense_bonus -= buff.get_defense_buff()

            # When a buff expires it CANNOT kill the creature, only leave them
            # with very few hitpoints.
            if self.hitpoints < 0:
                self.hitpoints = 1

        # Check poisons for expiry
        remove_list = []
        for poison in self.poisons:
            if poison.hasExpired(self.turn):
                remove_list += [poison]

            self.hitpoints -= poison.damage_per_turn()

        for poison in remove_list:
            self.poisons.remove(poison)

        # Are we dead?
        if self.hitpoints <= 0:
            self.alive = False
            self.hitpoints = 0

        # Turn complete
        self.turn += 1

    def give(self, item: Item):
        """Gives the creature an item."""

        if isinstance(item, Gold):
            self.gold += item.value
            return True

        return self.inventory.add_item(item)

    def give_xp(self, xp: int):
        """Gives the creature XP."""

        self.xp += xp
        if self.xp >= self.next_level_xp:
            self.next_level_xp *= 2
            self.level += 1
            self.maxhitpoints *= 2
            self.hitpoints = self.maxhitpoints  # player heals on level-up
            game().log(f"Welcome to level {self.level}")

    def describe_wields(self) -> str:
        """Describes the items that the creature is wielding."""

        describe_wieldpoints: Iterable[Wieldpoint] = (
            "hands",
            "chest",
            "head",
            "arms",
            "legs",
            "feet",
        )

        # iterating a tuple here so we can order the output
        entries = []
        for point in describe_wieldpoints:
            wield = self.wieldpoints[point]
            if wield is not None:
                entries.append(f"<b>{point.title()}</b>\n  {wield.describe()}")

        if not entries:
            return "Wielding and wearing nothing."

        output = "\n".join(entries)
        return f"<b>Wielding:</b>\n{output}"

    def ai_control(self, ai: "AIInstance"):
        """Sets this creature as controlled by the given AI."""

        self.ai = ai

    def ai_release(self):
        """Releases control of this creature from any AI controlling it."""

        self.ai.detach()
        self.ai = None
