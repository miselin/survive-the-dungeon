from dice import Dice

COLOR_RED = "#FF6464"
COLOR_GREEN = "#64FF64"


def render_inequality(a, b, fp=False, higher_better=True):
    if fp:
        a_str = "%.2f" % (a,)
        b_str = "%.2f" % (b,)
    else:
        a_str = "%d" % (a,)
        b_str = "%d" % (b,)

    if a == b:
        return "%s = %s" % (a_str, b_str)
    elif a < b:
        if higher_better:
            color = COLOR_RED
        else:
            color = COLOR_GREEN
        return "<font color=%s>%s < %s</font>" % (color, a_str, b_str)
    elif a > b:
        if higher_better:
            color = COLOR_GREEN
        else:
            color = COLOR_RED
        return "<font color=%s>%s > %s</font>" % (color, a_str, b_str)


class Item:
    def __init__(self, name="Unknown Item"):
        self.name = name
        self.value = 1  # in gold

    def describe(self):
        raise NotImplementedError("description() is not implemented for this item")


class Gold(Item):
    """Gold, by itself. For pickups from chests."""

    def __init__(self, value=1):
        super().__init__(name="Gold")
        self.value = value

    def __repr__(self):
        return self.describe()

    def describe(self):
        return "%d gold pieces" % (self.value,)


class WieldableItem(Item):
    def __init__(self, name="Unknown Wieldable Item", attackbonus=0, defensebonus=0):
        Item.__init__(self, name)

        self.attackbonus = attackbonus
        self.defensebonus = defensebonus

    def __repr__(self):
        return self.describe()

    def describe(self):
        return "Wieldable '%s' attack bonus %.2f defense bonus %.2f" % (
            self.name,
            self.attackbonus,
            self.defensebonus,
        )

    def getAttackBonus(self):
        return self.attackbonus

    def getDefenseBonus(self):
        return self.defensebonus

    def compare_to(self, other, tag=""):
        raise NotImplementedError(
            "Wieldable cannot implement compare_to, implement in subclass"
        )

    def wields_at(self):
        raise NotImplementedError("Wieldable subclass must implement wields_at")


class Armor(WieldableItem):
    def __init__(self, wields_at, name="Unknown Armor", *args, **kwargs):
        super().__init__(name, *args, **kwargs)
        self.wieldpoint = wields_at

    def __repr__(self):
        return self.describe()

    def describe(self):
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

    def wields_at(self):
        return self.wieldpoint

    def compare_to(self, other, tag=""):
        return f"""Comparing {self.name} to {other.name}{tag}:
Attack Bonus: {render_inequality(self.attackbonus, other.attackbonus)}
Defense Bonus: {render_inequality(self.defensebonus, other.defensebonus)}
Wields At: {self.wieldpoint}
"""


class Weapon(WieldableItem):
    def __init__(
        self,
        name="Unknown Weapon",
        critrange=20,
        critmult=2,
        attackbonus=4,
        defensebonus=-1,
        dam="1d6",
    ):
        WieldableItem.__init__(self, name, attackbonus, defensebonus)

        self.critrange = critrange
        self.critmult = critmult
        self.dam = dam

    def __repr__(self):
        return self.describe()

    def describe(self):
        return "'%s' dam %s crit %d-20 (x%.2f)" % (
            self.name,
            self.dam,
            self.critrange,
            self.critmult,
        )

    def criticalRange(self):
        return self.critrange

    def criticalMultiplier(self):
        return self.critmult

    def damage(self):
        return self.dam

    def wields_at(self):
        return "hands"

    def compare_to(self, other, tag=""):
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


class InstantEffectItem(Item):
    def __init__(self, name="Unknown Instant Effect Item", hpboost=0, hpdrop=0):
        Item.__init__(self, name)

        self.hpboost = hpboost
        self.hpdrop = hpdrop

    def __repr__(self):
        return self.describe()

    def describe(self):
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

    def apply(self, creature):
        previous = creature.hitpoints
        creature.hitpoints = min(
            creature.maxhitpoints, (creature.hitpoints + self.hpboost) - self.hpdrop
        )
        return creature.hitpoints - previous


class TurnBasedEffectItem(Item):
    def __init__(self, name="Unknown Turn-based Effect Item", lifetime=5):
        Item.__init__(self, name)

        self.expiry = 0
        self.lifetime = lifetime

    def setExpiry(self, turn):
        self.expiry = turn

    def hasExpired(self, turn):
        return turn >= self.expiry

    def getLifetime(self):
        return self.lifetime


class Poison(TurnBasedEffectItem):
    def __init__(self, name="Unknown Poison", damageperturn=5, lifetime=5):
        TurnBasedEffectItem.__init__(self, name, lifetime)

        self.damageperturn = damageperturn

    def __repr__(self):
        return self.describe()

    def describe(self):
        return "Poison '%s' deals %d damage per turn for %d turns" % (
            self.name,
            self.damageperturn,
            self.lifetime,
        )

    def damagePerTurn(self):
        return self.damageperturn


class Buff(TurnBasedEffectItem):
    def __init__(
        self, name="Unknown Buff", hpbuff=5, attackbuff=2, defensebuff=2, lifetime=5
    ):
        TurnBasedEffectItem.__init__(self, name, lifetime)

        self.hpBuff = hpbuff
        self.attackBuff = attackbuff
        self.defenseBuff = defensebuff

    def __repr__(self):
        return self.describe()

    def describe(self):
        return (
            "Buff '%s' gives +%d HP, +%d Attack Bonus, and +%d Defense Bonus for %d turns"
            % (self.name, self.hpBuff, self.attackBuff, self.defenseBuff, self.lifetime)
        )

    def getHpBuff(self):
        return self.hpBuff

    def getAttackBuff(self):
        return self.attackBuff

    def getDefenseBuff(self):
        return self.defenseBuff


class Container:
    def __init__(self, capacity=5, locked=False):
        self._capacity = capacity
        self._locked = locked
        self._inventory = []

    def count(self):
        return len(self._inventory)

    def capacity(self):
        return self._capacity

    def items(self):
        return self._inventory

    def full(self):
        return len(self._inventory) >= self._capacity

    def empty(self):
        return len(self._inventory) == 0

    def add_item(self, item):
        if self.full():
            return False

        self._inventory.append(item)

        return True

    def take_item(self, item):
        self._inventory.remove(item)

    def take_all(self):
        items = self.items()
        self._inventory = []
        return items
