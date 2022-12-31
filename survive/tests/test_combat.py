import unittest
from typing import Tuple

from game.combat import Combat, CombatState
from game.game import Game, set_game

from .util import TestDice, create_creature, equip_standard, get_healing_item


def create_default_combat(dice: TestDice) -> Tuple[Combat, CombatState]:
    """Create a default combat scenario taht can be used for testing."""
    combat = Combat(dice)

    combat_a = create_creature(name="Player")
    combat_b = create_creature(name="Goblin")

    equip_standard(combat_a)
    equip_standard(combat_b)

    combat_state = CombatState(
        player=combat_a,
        defender=combat_b,
        atkmult=1.0,
        defmult=1.0,
        needs_turn=False,
        player_heal=None,
    )

    return (combat, combat_state)


class TestCombat(unittest.TestCase):
    def setUp(self) -> None:
        # every test may need a game object to exist
        game = Game()
        set_game(game)

    def test_defender_cant_retaliate(self):
        dice = TestDice()

        combat, combat_state = create_default_combat(dice)

        # player rolls
        # attack roll (not crit), damage roll (deal 6 damage)
        dice.queue_results(18, 6)

        combat_state.needs_turn = True
        combat.turn(combat_state)

        self.assertTrue(combat_state.player.alive)
        self.assertFalse(combat_state.defender.alive)
        self.assertEqual(combat_state.defender.hitpoints, 0)

    def test_player_crit(self):
        dice = TestDice()

        combat, combat_state = create_default_combat(dice)

        # player rolls: attack roll (crit), attack roll (hit), damage roll
        # defender rolls: attack roll (miss)
        dice.queue_results(20, 18, 2, 1)

        combat_state.needs_turn = True
        combat.turn(combat_state)

        self.assertTrue(combat_state.player.alive)
        self.assertTrue(combat_state.defender.alive)
        self.assertEqual(combat_state.defender.hitpoints, 1)

    def test_player_crit_miss(self):
        dice = TestDice()

        combat, combat_state = create_default_combat(dice)

        # player rolls: attack roll (crit), attack roll (miss), damage roll
        # defender rolls: attack roll (miss)
        dice.queue_results(20, 1, 2, 1)

        combat_state.needs_turn = True
        combat.turn(combat_state)

        self.assertTrue(combat_state.player.alive)
        self.assertTrue(combat_state.defender.alive)
        self.assertEqual(combat_state.defender.hitpoints, 3)

    def test_player_miss(self):
        dice = TestDice()

        combat, combat_state = create_default_combat(dice)

        # player rolls: attack roll (miss)
        # defender rolls: attack roll (also miss)
        dice.queue_results(1, 1)

        combat_state.needs_turn = True
        combat.turn(combat_state)

        self.assertTrue(combat_state.player.alive)
        self.assertTrue(combat_state.defender.alive)
        self.assertEqual(combat_state.defender.hitpoints, 5)

    def test_player_heal(self):
        dice = TestDice()

        combat, combat_state = create_default_combat(dice)

        # player rolls: attack roll (miss)
        # defender rolls: attack roll (hit), damage roll
        dice.queue_results(1, 18, 2)

        combat_state.needs_turn = True
        combat.turn(combat_state)

        self.assertTrue(combat_state.player.alive)
        self.assertTrue(combat_state.defender.alive)
        self.assertEqual(combat_state.player.hitpoints, 3)
        self.assertEqual(combat_state.defender.hitpoints, 5)

        # player does not roll
        # defender rolls: attack roll (miss)
        dice.queue_results(1)

        combat_state.needs_turn = True
        combat_state.player_heal = get_healing_item(5)
        combat_state.player.give(combat_state.player_heal)
        combat.turn(combat_state)

        self.assertTrue(combat_state.player.alive)
        self.assertTrue(combat_state.defender.alive)
        self.assertEqual(combat_state.player.hitpoints, 5)
        self.assertEqual(combat_state.defender.hitpoints, 5)

    def test_player_dies(self):
        dice = TestDice()

        combat, combat_state = create_default_combat(dice)

        # player rolls: attack roll (miss)
        # defender rolls: attack roll (crit), attack roll (hit), damage
        dice.queue_results(1, 20, 18, 5)

        combat_state.needs_turn = True
        combat.turn(combat_state)

        self.assertFalse(combat_state.player.alive)
        self.assertTrue(combat_state.defender.alive)
        self.assertEqual(combat_state.player.hitpoints, 0)
        self.assertEqual(combat_state.defender.hitpoints, 5)

    def test_do_nothing_if_dead(self):
        dice = TestDice()

        combat, combat_state = create_default_combat(dice)

        # player rolls: attack roll (miss)
        # defender rolls: attack roll (crit), attack roll (hit), damage
        dice.queue_results(1, 20, 18, 5)

        combat_state.needs_turn = True
        combat.turn(combat_state)

        self.assertFalse(combat_state.player.alive)
        self.assertTrue(combat_state.defender.alive)
        self.assertEqual(combat_state.player.hitpoints, 0)
        self.assertEqual(combat_state.defender.hitpoints, 5)

        # no need for dice here, nothing happens
        combat_state.needs_turn = True
        combat.turn(combat_state)

        self.assertFalse(combat_state.player.alive)
        self.assertTrue(combat_state.defender.alive)
        self.assertEqual(combat_state.player.hitpoints, 0)
        self.assertEqual(combat_state.defender.hitpoints, 5)

    def test_do_nothing_if_unneeded(self):
        dice = TestDice()

        combat, combat_state = create_default_combat(dice)

        # no need for dice here, nothing happens
        combat_state.needs_turn = False
        combat.turn(combat_state)


if __name__ == "__main__":
    unittest.main()
