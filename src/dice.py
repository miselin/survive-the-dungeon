import re

from game import game


class Dice:
    def __init__(self):
        self.regex = re.compile("([1-9][0-9]*)d([1-9][0-9]*)", re.I)

    def roll(self, min=1, max=20):
        if min < 1:
            min = 1
        return int(game().random().uniform(min, max + 1))

    def rollnamed(self, name):
        m = self.regex.match(name)
        count = int(m.group(1))
        faces = int(m.group(2))

        n = 0
        for i in range(count):
            n += self.roll(1, faces)

        return n

    def extract(self, name):
        m = self.regex.match(name)
        count = int(m.group(1))
        faces = int(m.group(2))
        return (count, faces)

    def minmax(self, name):
        m = self.regex.match(name)
        count = int(m.group(1))
        faces = int(m.group(2))

        return (count, count * faces)
