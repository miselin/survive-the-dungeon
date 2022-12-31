"""This module handles logic for combat"""

import math

from .creature import Creature
from .dice import Dice
from .game import game


class Combat:
    """Combat handles all combat tasks for a battle"""

    def __init__(self, dice: Dice):
        self.dice = dice

    def attack(self, attacker: Creature, defender: Creature, atkmult=1.0, defmult=1.0):
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

        attack_roll = self.dice.roll()
        attack_bonus = attacker.attack_bonus + defender.attributes.get_modifier("str")
        attack_roll = attack_roll + attack_bonus

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
                        "atk bonus {attack_bonus} beats AC {armor_class}"
                    )
                )
                attack_damage_multiplier = attacker.get_weapon_critical_multiplier()
            else:
                game().log(attacker.name + " HIT")
        else:
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

            game().log(f"{attacker.name} hits for {damroll} damage (rolled {dam})!")
            defender.hitpoints -= int(math.ceil(damroll))

        return not (attacker.alive and defender.alive)
