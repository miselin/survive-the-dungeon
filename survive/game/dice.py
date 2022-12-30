"""This module exports Dice to handle dice-rolling activities"""
import re
from typing import Tuple

from .game import game


class Dice:
    """Dice handles all dice-rolling logic"""

    def __init__(self):
        self.regex = re.compile("([1-9][0-9]*)d([1-9][0-9]*)", re.I)

    def roll(self, min: int = 1, max: int = 20) -> int:
        """roll rolls a single die with the given range"""
        if min < 1:
            min = 1
        return int(game().random().uniform(min, max + 1))

    def rollnamed(self, name: str) -> int:
        """rollnamed rolls a named set of dice, e.g. '3d6' will roll 3 6-sided dice"""
        m = self.regex.match(name)
        count = int(m.group(1))
        faces = int(m.group(2))

        n = 0
        for i in range(count):
            n += self.roll(1, faces)

        return n

    def extract(self, name: str) -> Tuple[int, int]:
        """extract turns the given name (e.g. 3d6) into a dice and face count"""
        m = self.regex.match(name)
        count = int(m.group(1))
        faces = int(m.group(2))
        return (count, faces)

    def minmax(self, name: str) -> Tuple[int, int]:
        """minmax gives the minimumand maximum range for a named dice (e.g. 3d6 is 3-18)"""
        m = self.regex.match(name)
        count = int(m.group(1))
        faces = int(m.group(2))

        return (count, count * faces)
