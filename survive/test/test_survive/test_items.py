"""Tests for game items"""
# pylint: disable=missing-docstring

import unittest

from game.game import Game, set_game
from game.item import Chest, Item, Weapon


class TestCombat(unittest.TestCase):
    def setUp(self) -> None:
        # every test may need a game object to exist
        game = Game()
        set_game(game)

    def test_chest_take(self):
        item = Item(name="Test Item")
        chest = Chest((0, 0), capacity=1)

        chest.add_item(item)
        self.assertEqual(chest.count(), 1)
        self.assertTrue(chest.full())

        chest.take_item(item)
        self.assertEqual(chest.count(), 0)

        self.assertTrue(chest.empty())

    def test_chest_take_all(self):
        item1 = Item(name="Test Item 1")
        item2 = Item(name="Test Item 2")
        chest = Chest((0, 0), capacity=2)

        chest.add_item(item1)
        chest.add_item(item2)

        self.assertEqual(chest.count(), 2)

        chest.take_all()

        self.assertEqual(chest.count(), 0)

    def test_chest_full(self):
        item1 = Item(name="Test Item 1")
        item2 = Item(name="Test Item 2")
        chest = Chest((0, 0), capacity=1)

        self.assertTrue(chest.add_item(item1))
        self.assertFalse(chest.add_item(item2))

    def test_weapon_crit_multiplier_is_never_below_two(self):
        weapon = Weapon(name="Bugged Blade", critmult=1)
        self.assertEqual(weapon.critical_multiplier(), 2)

    def test_weapon_deserialize_normalizes_legacy_crit_multiplier(self):
        weapon = Weapon.deserialize(
            {
                "name": "Legacy Blade",
                "critrange": 20,
                "critmult": 1,
                "dam": "1d6",
                "attackbonus": 0,
                "defensebonus": 0,
            }
        )
        self.assertEqual(weapon.critical_multiplier(), 2)


if __name__ == "__main__":
    unittest.main()
