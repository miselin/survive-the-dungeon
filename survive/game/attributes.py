"""This module exports AttributeSet to handle character attributes."""

import math
from typing import Dict, List, Literal, Tuple

from .dice import Dice

Attribute = Literal["str", "dex", "con", "int", "wis", "chr"]

ATTRIBUTES: List[Attribute] = ["str", "dex", "con", "int", "wis", "chr"]


class AttributeSet:
    """AttributeSet holds a full set of character attributes."""

    labels: Dict[Attribute, str] = {
        "str": "Strength",
        "dex": "Dexterity",
        "con": "Constitution",
        "int": "Intelligence",
        "wis": "Wisdom",
        "chr": "Charisma",
    }

    def __init__(self) -> None:
        self.attrs: Dict[Attribute, int] = {}
        self.attrs["str"] = 10
        self.attrs["dex"] = 10
        self.attrs["con"] = 10
        self.attrs["int"] = 10
        self.attrs["wis"] = 10
        self.attrs["chr"] = 10

    def rollfor(self) -> Dict[Attribute, Tuple[int, str]]:
        """rollfor rolls dice for all attributes in this set"""
        dice = Dice()

        rolls = {}
        for key in self.attrs:
            rolls[key] = (dice.roll(3, 19), "3d6")
            self.attrs[key] = rolls[key][0]
        return rolls

    def modify(self, attr: Attribute, amt: float):
        """modify adds the given amount to the given attribute"""
        self.attrs[attr] += int(math.floor(amt))

    def get(self, attr: Attribute) -> int:
        """get gets the given attribute"""
        return self.attrs[attr]

    def get_modifier(self, attr: Attribute) -> int:
        """get_modifier gets the given attribute as a modifier.

        This follows the D&D equation where an attribute value of 10
        results in a modifier of +0, and an attribute value of 30
        results in a modifier to +10."""
        return int(math.floor((self.get(attr) - 10) / 2))

    def attr_label(self, attr: Attribute) -> str:
        """attr_label gets the given attribute's readable label"""
        return self.labels[attr]

    def __repr__(self):
        return " ".join([f"{k.upper()}: {v}" for k, v in self.attrs.items()])

    def __str__(self):
        return " ".join([f"{self.labels[k]}: {v}" for k, v in self.attrs.items()])

    def describe(self, attribute: Attribute) -> str:
        """Describe the given attribute."""
        if attribute == "str":
            return "The <b>Strength</b> modifier makes your attacks more likely to hit."
        if attribute == "dex":
            return (
                "The <b>Dexterity</b> modifier makes enemy attacks less likely to hit."
            )
        if attribute == "con":
            return "The <b>Constitution</b> modifier sets your initial HP."
        if attribute == "int":
            return "The <b>Intelligence</b> modifier doesn't do anything yet."
        if attribute == "wis":
            return "The <b>Wisdom</b> modifier doesn't do anything yet."
        if attribute == "chr":
            return "The <b>Charisma</b> modifier changes the cost of goods in the shop."

        raise ValueError("unknown attribute")
