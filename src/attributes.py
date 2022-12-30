import math

from dice import Dice


class AttributeSet:
    labels = {
        "str": "Strength",
        "dex": "Dexterity",
        "con": "Constitution",
        "int": "Intelligence",
        "wis": "Wisdom",
        "chr": "Charisma",
    }

    def __init__(self):
        self.attrs = {}
        self.attrs["str"] = 10
        self.attrs["dex"] = 10
        self.attrs["con"] = 10
        self.attrs["int"] = 10
        self.attrs["wis"] = 10
        self.attrs["chr"] = 10

    def rollfor(self):
        dice = Dice()

        rolls = {}
        for key in self.attrs.keys():
            rolls[key] = (dice.roll(3, 19), "3d6")
            self.attrs[key] = rolls[key][0]
        return rolls

    def modify(self, attr, amt):
        self.attrs[attr] += int(math.floor(amt))

    def get(self, attr):
        return self.attrs[attr]

    def getModifier(self, attr):
        return int(self.get(attr))

    def attrlabel(self, attr):
        return self.labels[attr]

    def __repr__(self):
        return " ".join(["%s: %d" % (k.upper(), v) for k, v in self.attrs.iteritems()])

    def __str__(self):
        return " ".join(
            ["%s: %d" % (self.labels[k], v) for k, v in self.attrs.iteritems()]
        )
