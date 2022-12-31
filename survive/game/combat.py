"""This module handles logic for combat"""

import dataclasses
import math
from typing import Optional

from .creature import Creature
from .dice import Dice
from .game import game
from .item import InstantEffectItem


# TODO(miselin): this should be in Combat
@dataclasses.dataclass
class CombatState:
    """CombatState encapsulates key state for a battle"""

    player: Creature
    defender: Creature
    atkmult: float
    defmult: float
    needs_turn: bool
    player_heal: Optional[InstantEffectItem]


class Combat:
    """Combat handles all combat tasks for a battle"""

    def __init__(self, dice: Dice):
        self.dice = dice

    def _attack(self, attacker: Creature, defender: Creature, atkmult=1.0, defmult=1.0):
        """attack handles the logic for an attack from attacker to defender

        Returns True if either creature is now dead. False otherwise."""
        if not (attacker.alive and defender.alive):
            return True

        # Attacker damage that can be done (in XdY format - don't want to roll until after
        # the attack roll succeeds)
        attack_damage_multiplier = 1
        dam = attacker.get_weapon_damage()

        armor_bonus = defender.defense_bonus * defmult
        shield_bonus = 0
        armor_class = (
            10 + armor_bonus + shield_bonus + defender.attributes.get_modifier("dex")
        )
        armor_class = int(math.ceil(armor_class))

        attack_roll = self.dice.roll()
        attack_bonus = attacker.attack_bonus + defender.attributes.get_modifier("str")

        hit = False

        # Critical hit?
        if attack_roll >= attacker.get_weapon_critical_range():
            hit = True

            # Try again - do we beat the armor class?
            crit_roll = self.dice.roll()
            attack_roll = crit_roll + attack_bonus
            if attack_roll > armor_class:
                game().log(attacker.name + " CRITICAL HIT!")
                game().log(
                    (
                        f"... rolled {crit_roll} on d20 + "
                        f"atk bonus {attack_bonus} beats AC {armor_class}"
                    )
                )
                attack_damage_multiplier = attacker.get_weapon_critical_multiplier()
            else:
                game().log(attacker.name + " HIT")
        else:
            # not a crit, attack bonus now applies
            attack_roll += attack_bonus

            log_msg = f"AR: {attack_roll} vs AC: {armor_class}"
            hit = attack_roll > armor_class
            if hit:
                log_msg = f"{attacker.name} HIT: {log_msg}"
            else:
                log_msg = f"{attacker.name} MISS: {log_msg}"

            game().log(log_msg)

        # Did we score a hit?
        if hit:
            # Roll for damage.
            damroll = self.dice.rollnamed(dam)
            damroll *= attack_damage_multiplier * atkmult

            damroll = int(math.ceil(damroll))
            game().log(f"{attacker.name} hits for {damroll} damage (rolled {dam})!")
            defender.hitpoints -= damroll

        return not (attacker.alive and defender.alive)

    def turn(self, state: CombatState):
        """Run a turn of combat using the given battle state."""

        if not state.needs_turn:
            return

        # player can either heal or attack on their turn
        if state.player_heal is not None:
            state.player.inventory.take_item(state.player_heal)
            applied = state.player_heal.apply(state.player)
            game().log(
                f"{state.player.name} healed {applied} with {state.player_heal.name}"
            )
            state.player_heal = None
        else:
            self._attack(state.player, state.defender, atkmult=state.atkmult)

        # don't let the defender retaliate if the player dealt a fatal blow
        if state.defender.hitpoints >= 1:
            self._attack(state.defender, state.player, defmult=state.defmult)

        state.atkmult = 1.0
        state.defmult = 1.0

        state.needs_turn = False

        # we have to think after each combat turn to update state correctly
        state.player.think()
        state.defender.think()
