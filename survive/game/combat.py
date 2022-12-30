import math

from game import game


class Combat:
    def __init__(self, dice):
        self.dice = dice

    # attack handles the logic for an attack from attacker to defender
    # returns True if either creature is now dead. False otherwise.
    def attack(self, attacker, defender, atkmult=1.0, defmult=1.0):
        if not (attacker.alive and defender.alive):
            return True

        # Attacker damage that can be done (in XdY format - don't want to roll until after
        # the attack roll succeeds)
        attackDamageMultiplier = 1
        dam = attacker.getWeaponDamage()

        armorBonus = defender.defenseBonus * defmult
        shieldBonus = 0
        AC = 10 + armorBonus + shieldBonus + defender.attributes.getModifier("dex")

        attackRoll = self.dice.roll()
        attackBonus = attacker.attackBonus + defender.attributes.getModifier("str")
        AR = attackRoll + attackBonus

        hit = False

        # Critical hit?
        if attackRoll >= attacker.getWeaponCriticalRange():
            """
            game().log(
                "Attack roll possible critical (%d >= %d)!"
                % (
                    attackRoll,
                    attacker.getWeaponCriticalRange(),
                )
            )
            """
            hit = True

            # Try again - do we beat the AC?
            AR_roll = self.dice.roll()
            AR = AR_roll + attackBonus
            if AR > AC:
                game().log(attacker.name + " CRITICAL HIT!")
                game().log(
                    "... rolled %d on d20 + atk bonus %d beats AC %d"
                    % (AR_roll, attackBonus, AC)
                )
                attackDamageMultiplier = attacker.getWeaponCriticalMultiplier()
            else:
                game().log(attacker.name + " HIT")
        else:
            log_msg = "AR: %d vs AC: %d" % (AR, AC)
            hit = AR > AC
            if hit:
                log_msg = attacker.name + " HIT: " + log_msg
            else:
                log_msg = attacker.name + " MISS: " + log_msg

            game().log(log_msg)

        # Did we score a hit?
        if hit:
            # Roll for damage.
            damroll = self.dice.rollnamed(dam)
            damroll *= attackDamageMultiplier * atkmult

            game().log(
                "%s hits for %d damage (rolled %s)!" % (attacker.name, damroll, dam)
            )
            defender.hitpoints -= int(math.ceil(damroll))

        return not (attacker.alive and defender.alive)

    def magic(self, spell):
        pass

    def special_attack(self, sattack):
        pass
