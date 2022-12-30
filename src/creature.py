import math

from attributes import AttributeSet
from dice import Dice
from game import game
from item import Container, Gold


class Creature:
    def __init__(
        self, sprite, initial_pos, name="Creature", attribute_override=None, debug=False
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

        # Debugging dumps (verbose!)
        self.debug = debug

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
        self.buffs = []

        # Poisons applied to the creature at this point in time.
        self.poisons = []

        # Current experience points
        self.xp = 0

        # Next level experience points
        self.next_level_xp = 64

        # Current level
        self.level = 1

        # Turn number. Used for buff timeouts and such.
        self.turn = 1

        # How much gold do we have?
        self.gold = 0

        # Current inventory.
        self.inventory = Container(capacity=10)

        # Some creatures will naturally have a higher defense base. This number
        # is immutable - additional defense points come from the defense bonus
        # which is calculated from armor, and from the CON attribute (and to
        # a lesser extent, the DEX attribute)
        self.defenseBase = 5

        # The attack bonus will be calculated as weapons are wielded or powers
        # used that cause the creature to gain or lose attack bonuses. For
        # example, a piece of armor might increase the defensive bonus but be
        # awfully unwieldy, causing the attack bonus to reduce. Minimum of 2.
        self.attackBonus = 2

        # The defense bonus is adjusted when armor is worn or powers used.
        # Minimum of 2.
        self.defenseBonus = 2

        # All wield points for the creature. None means not wielded, otherwise
        # this will be valid Python object holding information about the item.
        # Note that wielding anything will automatically affect the bonuses -
        # the actual inventory and wield points is for the player's benefit.
        self.wieldpoints = {
            "head": None,  # Helmets and such
            "chest": None,  # Armor
            "arms": None,  # Armor
            "hands": None,  # Weapons
            "legs": None,  # Armor
            "feet": None,
        }  # Armor, dexterity modifiers

        self.default_wield = {
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
        self.ai = None

    def writedebug(self, s):
        if self.debug:
            print(s)

    def rollforattrs(self):
        rolls = self.attributes.rollfor()

        dice = Dice()

        # hp = d20 + CON modifier normalized to 14 as the midpoint

        rolls["hp"] = (dice.roll(1, 20) + rolls["con"][0] - 14, "1d20")
        self.hitpoints = self.maxhitpoints = max(
            5, rolls["hp"][0]
        )  # creatures cannot have less than 5 hp to start with

        return rolls

    def roll_mob_attrs(self):
        dice = Dice()
        # scale gold based on HP of the creature
        count = int(math.ceil(self.maxhitpoints / 15))
        if count <= 0:
            count = 1
        self.gold = dice.rollnamed("%dd20" % (count,)) * 3

    def getWeaponDamage(self):
        # Unarmed combat: 1-6 damage.
        if self.wieldpoints["hands"] == None:
            return "1d6"
        else:
            return self.wieldpoints["hands"].damage()

    def getWeaponCriticalRange(self):
        # Unarmed combat is always a 5% chance of a critical
        if self.wieldpoints["hands"] == None:
            return 20
        else:
            return self.wieldpoints["hands"].criticalRange()

    def getWeaponCriticalMultiplier(self):
        # Unarmed combat will always have a 2x damage critical
        if self.wieldpoints["hands"] == None:
            return 2
        else:
            return self.wieldpoints["hands"].criticalMultiplier()

    def wield(self, point, item):
        # Unwield any existing item, and remove bonuses.
        currentItem = self.wieldpoints[point]
        if currentItem is not None:
            self.attackBonus -= currentItem.getAttackBonus()
            self.defenseBonus -= currentItem.getDefenseBonus()

        # Wield the new item
        self.wieldpoints[point] = item

        # Apply bonuses
        if item is not None:
            self.writedebug(
                "Creature '%s' at turn %d wielded '%s' on '%s' for %d Attack Bonus and %d Defense Bonus"
                % (
                    self.name,
                    self.turn,
                    item.name,
                    point,
                    item.getAttackBonus(),
                    item.getDefenseBonus(),
                )
            )

            self.attackBonus += item.getAttackBonus()
            self.defenseBonus += item.getDefenseBonus()

    def atWieldPoint(self, point):
        return self.wieldpoints[point]

    def buff(self, buff):
        self.buffs += [buff]

        buff.setExpiry(self.turn + buff.getLifetime())

        self.writedebug(
            "Creature '%s' at turn %d has had a buff (%s) applied for %d turns, with +%d HP, +%d Attack Bonus, +%d Defense Bonus."
            % (
                self.name,
                self.turn,
                buff.name,
                buff.getLifetime(),
                buff.getHpBuff(),
                buff.getAttackBuff(),
                buff.getDefenseBuff(),
            )
        )

        self.hitpoints += buff.getHpBuff()
        self.attackBonus += buff.getAttackBuff()
        self.defenseBonus += buff.getDefenseBuff()

    def poison(self, poison):
        self.poisons += [poison]

        self.writedebug(
            "Creature '%s' at turn %d has had poison (%s) applied for %d turns, with %d damage per turn."
            % (
                self.name,
                self.turn,
                poison.name,
                poison.getLifetime(),
                poison.damagePerTurn(),
            )
        )

        poison.setExpiry(self.turn + poison.getLifetime())

    def think(self):
        # Don't do anything for dead creatures.
        if not self.alive:
            return

        if self.ai is not None:
            self.ai.think()

        # Check all buffs for expiry
        removeList = []
        for buff in self.buffs:
            if buff.hasExpired(self.turn):
                self.writedebug(
                    "Creature '%s' at turn %d has had buff '%s' expire."
                    % (self.name, self.turn, buff.name)
                )
                removeList += [buff]

        for buff in removeList:
            self.buffs.remove(buff)

            self.hitpoints -= buff.getHpBuff()
            self.attackBonus -= buff.getAttackBuff()
            self.defenseBonus -= buff.getDefenseBuff()

            # When a buff expires it CANNOT kill the creature, only leave them
            # with very few hitpoints.
            if self.hitpoints < 0:
                self.hitpoints = 1

        # Check poisons for expiry
        removeList = []
        for poison in self.poisons:
            if poison.hasExpired(self.turn):
                self.writedebug(
                    "Creature '%s' at turn %d has had poison '%s' expire."
                    % (self.name, self.turn, poison.name)
                )
                removeList += [poison]

            self.hitpoints -= poison.damagePerTurn()

        for poison in removeList:
            self.poisons.remove(poison)

        # Are we dead?
        if self.hitpoints <= 0:
            self.writedebug("Creature: at turn %d, '%s' died." % (self.turn, self.name))
            self.alive = False
            self.hitpoints = 0
        else:
            self.writedebug(
                "Creature: at turn %d, '%s' has %d HP."
                % (self.turn, self.name, self.hitpoints)
            )

        # Turn complete
        self.turn += 1

    def give(self, item):
        if isinstance(item, Gold):
            self.gold += item.value
            return True
        else:
            return self.inventory.add_item(item)

    def give_xp(self, xp):
        self.xp += xp
        if self.xp >= self.next_level_xp:
            self.next_level_xp *= 2.0
            self.level += 1
            self.maxhitpoints *= 2
            self.hitpoints = self.maxhitpoints  # player heals on level-up
            game().log("Welcome to level %d" % (self.level,))

    def describe_wields(self):
        entries = []
        for point in ("hands", "chest", "head", "arms", "legs", "feet"):
            wield = self.wieldpoints[point]
            if wield is not None:
                entries.append(f"<b>{point.title()}</b>\n  {wield.describe()}")

        if not entries:
            return "Wielding and wearing nothing."
        else:
            return "<b>Wielding:</b>\n%s" % ("\n".join(entries),)

    def ai_control(self, ai):
        self.ai = ai

    def ai_release(self):
        self.ai.detach()
        self.ai = None
