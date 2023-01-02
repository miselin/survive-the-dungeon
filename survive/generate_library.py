#!/usr/bin/env python
"""Generates a library of enemies for inserting into generated worlds.

Perfectly balancing randomly-generated mobs turns out to be a complex task,
especially when those enemies get the same procedurally-generated armors and
weapons that the player receives. Instead of trying to perfectly fine-tune the
procedural enemy generation, we'll instead pre-generate a handful of enemies
at different challenge levels. These can then be inserted by the procedural
generation at runtime to rooms in the dungeon.
"""

import math
import random
import time
from typing import Any, Dict, List

from game.procgen import NameGenerator, creature_at_level


def main() -> None:
    """Entry point for the library generator."""

    seed = int(math.floor(time.time()))
    rng = random.Random(seed)

    name_generator = NameGenerator(rng)

    generated: Dict[int, List[Dict[str, Any]]] = {}

    for challenge_level in range(10):
        generated[challenge_level] = []

        # generate 10 mobs per challenge level
        for _ in range(10):
            creature = creature_at_level(challenge_level, name_generator, rng)
            print(creature.describe_wields())


if __name__ == "__main__":
    main()
