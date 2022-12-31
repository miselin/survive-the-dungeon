"""This module exports Dice to handle dice-rolling activities"""
import re
from typing import Tuple

from .game import game


class Dice:
    """Dice handles all dice-rolling logic"""

    def __init__(self):
        self.regex = re.compile("([1-9][0-9]*)d([1-9][0-9]*)", re.I)

    def roll(self, low: int = 1, high: int = 20) -> int:
        """roll rolls a single die with the given range"""
        low = max(low, 1)
        return game().random().randint(low, high)

    def rollnamed(self, name: str) -> int:
        """rollnamed rolls a named set of dice, e.g. '3d6' will roll 3 6-sided dice"""
        match = self.regex.match(name)
        count = int(match.group(1))
        faces = int(match.group(2))

        total = 0
        for _ in range(count):
            total += self.roll(1, faces)

        return total

    def extract(self, name: str) -> Tuple[int, int]:
        """extract turns the given name (e.g. 3d6) into a dice and face count"""
        match = self.regex.match(name)
        count = int(match.group(1))
        faces = int(match.group(2))
        return (count, faces)

    def minmax(self, name: str) -> Tuple[int, int]:
        """minmax gives the minimumand maximum range for a named dice (e.g. 3d6 is 3-18)"""
        match = self.regex.match(name)
        count = int(match.group(1))
        faces = int(match.group(2))

        return (count, count * faces)
