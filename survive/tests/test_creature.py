import unittest

from game.game import Game, set_game

from .util import create_creature, create_gold, equip_standard


class TestCombat(unittest.TestCase):
    def setUp(self) -> None:
        # every test may need a game object to exist
        game = Game()
        set_game(game)

    def test_give_gold(self):
        creature = create_creature(name="Player")
        equip_standard(creature)

        self.assertEqual(creature.gold, 0)
        creature.give(create_gold(50))
        self.assertEqual(creature.gold, 50)

    def test_level_up(self):
        creature = create_creature(name="Player")
        equip_standard(creature)

        # "damaged" creature heals on level-up
        creature.hitpoints = 3

        self.assertEqual(creature.level, 1)
        self.assertEqual(creature.xp, 0)
        self.assertEqual(creature.maxhitpoints, 5)

        xp = creature.next_level_xp + 10
        creature.give_xp(xp)

        self.assertEqual(creature.level, 2)
        self.assertEqual(creature.xp, xp)
        self.assertEqual(creature.hitpoints, 7)


if __name__ == "__main__":
    unittest.main()
