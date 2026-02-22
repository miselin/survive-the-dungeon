import {
  COMBAT_DEFENSIVE_ATTACK_MULTIPLIER,
  COMBAT_DEFENSIVE_DEFENSE_MULTIPLIER,
  COMBAT_OFFENSIVE_ATTACK_MULTIPLIER,
  COMBAT_OFFENSIVE_DEFENSE_MULTIPLIER,
  ENEMY_STYLE_GUARDED_ATTACK_MULTIPLIER,
  ENEMY_STYLE_GUARDED_CHANCE_PERCENT,
  ENEMY_STYLE_GUARDED_DEFENSE_MULTIPLIER,
  ENEMY_STYLE_LOW_HP_RATIO,
  ENEMY_STYLE_RECKLESS_ATTACK_MULTIPLIER,
  ENEMY_STYLE_RECKLESS_CHANCE_PERCENT,
  ENEMY_STYLE_RECKLESS_DEFENSE_MULTIPLIER,
  ENEMY_STYLE_STEADY_ATTACK_MULTIPLIER,
  ENEMY_STYLE_STEADY_DEFENSE_MULTIPLIER,
  FLEE_BASE_DC,
  FLEE_DIE_SIDES,
  MAXIMUM_INEFFECTIVE_DAMAGE_MULTIPLIER,
  PLAYER_LUCK_BONUS_PER_LOW_ROLL,
  PLAYER_LUCK_BONUS_PER_MISS_STREAK,
  PLAYER_LUCK_CRITICAL_HP_EXTRA_BONUS,
  PLAYER_LUCK_CRITICAL_HP_RATIO,
  PLAYER_LUCK_HISTORY_SIZE,
  PLAYER_LUCK_LOW_HP_BONUS,
  PLAYER_LUCK_LOW_HP_RATIO,
  PLAYER_LUCK_LOW_ROLL_THRESHOLD,
  PLAYER_LUCK_LOW_ROLL_TRIGGER,
  PLAYER_LUCK_MAX_HISTORY_BONUS,
  PLAYER_LUCK_MAX_MISS_STREAK_BONUS,
  PLAYER_LUCK_MAX_TOTAL_BONUS,
} from "./constants";
import { Creature } from "./creature";
import { Dice } from "./dice";
import { InstantEffectItem } from "./items";
import { EN } from "./strings/en";

export type PlayerAction = "normal" | "offensive" | "defensive" | "heal" | "flee";

export type CombatLog = {
  text: string;
  level: "info" | "warn" | "success";
};

export type CombatResult = {
  over: boolean;
  fled: boolean;
  logs: CombatLog[];
  moments: CombatMoment[];
};

export type CombatLuckState = {
  playerD20History: number[];
  playerMissStreak: number;
};

export type CombatMoment =
  | {
    type: "text";
    text: string;
    level: "info" | "warn" | "success";
  }
  | {
    type: "roll";
    phase: "to-hit" | "crit-check" | "crit-confirm" | "flee";
    actor: string;
    defender: string;
    roll: number;
    bonus: number;
    total: number;
    target: number;
    success: boolean;
  }
  | {
    type: "damage";
    actor: string;
    defender: string;
    dice: string;
    roll: number;
    multiplier: number;
    final: number;
    remainingHp: number;
  }
  | {
    type: "heal";
    actor: string;
    item: string;
    amount: number;
  };

type CombatTurnOptions = {
  enemyAttackMultiplier?: number;
  fleeBonus?: number;
};

export function armorClassFor(defender: Creature, defenseMultiplier = 1): number {
  return Math.ceil(
    10 + (defender.defenseBonus * defenseMultiplier) + defender.attributes.modifier("dex"),
  );
}

export function playerLuckBonusFromState(
  state: CombatLuckState,
  hpRatio: number,
): number {
  const lowRolls = state.playerD20History
    .filter((roll) => roll <= PLAYER_LUCK_LOW_ROLL_THRESHOLD)
    .length;
  const triggerExcess = Math.max(0, lowRolls - PLAYER_LUCK_LOW_ROLL_TRIGGER + 1);
  const historyBonus = Math.min(
    PLAYER_LUCK_MAX_HISTORY_BONUS,
    triggerExcess * PLAYER_LUCK_BONUS_PER_LOW_ROLL,
  );
  const missStreakBonus = Math.min(
    PLAYER_LUCK_MAX_MISS_STREAK_BONUS,
    state.playerMissStreak * PLAYER_LUCK_BONUS_PER_MISS_STREAK,
  );

  let hpBonus = 0;
  if (hpRatio <= PLAYER_LUCK_LOW_HP_RATIO) {
    hpBonus += PLAYER_LUCK_LOW_HP_BONUS;
  }
  if (hpRatio <= PLAYER_LUCK_CRITICAL_HP_RATIO) {
    hpBonus += PLAYER_LUCK_CRITICAL_HP_EXTRA_BONUS;
  }

  return Math.max(0, Math.min(PLAYER_LUCK_MAX_TOTAL_BONUS, historyBonus + missStreakBonus + hpBonus));
}

export class Combat {
  private playerD20History: number[] = [];

  private playerMissStreak = 0;

  constructor(private readonly dice: Dice) {}

  snapshotLuckState(): CombatLuckState {
    return {
      playerD20History: [...this.playerD20History],
      playerMissStreak: this.playerMissStreak,
    };
  }

  restoreLuckState(state: CombatLuckState): void {
    this.playerD20History = state.playerD20History
      .map((roll) => Math.max(1, Math.floor(roll)))
      .slice(-PLAYER_LUCK_HISTORY_SIZE);
    this.playerMissStreak = Math.max(0, Math.floor(state.playerMissStreak));
  }

  private playerLuckBonus(player: Creature): number {
    const hpRatio = player.hitpoints / Math.max(1, player.currentMaxHitpoints());
    return playerLuckBonusFromState(this.snapshotLuckState(), hpRatio);
  }

  private recordPlayerD20Roll(roll: number, success: boolean): void {
    this.playerD20History.push(roll);
    if (this.playerD20History.length > PLAYER_LUCK_HISTORY_SIZE) {
      this.playerD20History.shift();
    }

    if (success) {
      this.playerMissStreak = 0;
    } else {
      this.playerMissStreak += 1;
    }
  }

  private attack(
    attacker: Creature,
    defender: Creature,
    attackMultiplier: number,
    defenseMultiplier: number,
    logs: CombatLog[],
    moments: CombatMoment[],
  ): void {
    if (!attacker.alive || !defender.alive) {
      return;
    }

    const armorClass = armorClassFor(defender, defenseMultiplier);

    const attackRoll = this.dice.roll();

    // Bug fix from original: use ATTACKER str modifier, not defender str modifier.
    const attackBonus = attacker.attackBonus + attacker.attributes.modifier("str");
    const luckBonus = !attacker.mob ? this.playerLuckBonus(attacker) : 0;
    const totalAttackBonus = attackBonus + luckBonus;

    let attackDamageMultiplier = 1;

    if (attackRoll >= attacker.getWeaponCriticalRange()) {
      moments.push({
        type: "roll",
        phase: "crit-check",
        actor: attacker.name,
        defender: defender.name,
        roll: attackRoll,
        bonus: 0,
        total: attackRoll,
        target: attacker.getWeaponCriticalRange(),
        success: true,
      });

      if (!attacker.mob) {
        const critMultiplier = attacker.getWeaponCriticalMultiplier();
        attackDamageMultiplier = critMultiplier;
        logs.push({ text: EN.combat.logs.playerCritical(attacker.name, critMultiplier), level: "success" });
        moments.push({
          type: "text",
          text: EN.combat.logs.playerCriticalMoment(attacker.name, critMultiplier),
          level: "success",
        });
        this.recordPlayerD20Roll(attackRoll, true);
      } else {
        const critConfirm = this.dice.roll() + attackBonus;
        moments.push({
          type: "roll",
          phase: "crit-confirm",
          actor: attacker.name,
          defender: defender.name,
          roll: critConfirm - attackBonus,
          bonus: attackBonus,
          total: critConfirm,
          target: armorClass,
          success: critConfirm > armorClass,
        });

        if (critConfirm > armorClass) {
          attackDamageMultiplier = attacker.getWeaponCriticalMultiplier();
          logs.push({ text: EN.combat.logs.enemyCritical(attacker.name), level: "success" });
        } else {
          logs.push({ text: EN.combat.logs.enemyCriticalDowngrade(attacker.name), level: "info" });
        }
      }
    } else {
      const totalAttack = attackRoll + totalAttackBonus;
      const hit = totalAttack > armorClass;
      moments.push({
        type: "roll",
        phase: "to-hit",
        actor: attacker.name,
        defender: defender.name,
        roll: attackRoll,
        bonus: totalAttackBonus,
        total: totalAttack,
        target: armorClass,
        success: hit,
      });
      if (!attacker.mob) {
        this.recordPlayerD20Roll(attackRoll, hit);
      }
      if (!hit) {
        attackDamageMultiplier *= (Math.max(1, totalAttack) / Math.max(1, armorClass)) * MAXIMUM_INEFFECTIVE_DAMAGE_MULTIPLIER;
        logs.push({
          text: EN.combat.logs.reducedDamageHit(attacker.name, armorClass, totalAttack),
          level: "warn",
        });
      } else {
        logs.push({ text: EN.combat.logs.hit(attacker.name, totalAttack, armorClass), level: "success" });
      }
    }

    const damageRoll = this.dice.rollNamed(attacker.getWeaponDamage());
    let damage = damageRoll;
    damage = Math.ceil(
      damage
      * attackDamageMultiplier
      * attackMultiplier
      * attacker.damageDealtMultiplier
      * defender.damageTakenMultiplier,
    );

    const finalDamage = Math.max(1, damage);
    defender.hitpoints -= finalDamage;
    const remainingHp = Math.max(0, defender.hitpoints);
    logs.push({
      text: EN.combat.logs.damage(attacker.name, finalDamage, defender.name, remainingHp),
      level: "info",
    });

    const defenderFalls = defender.hitpoints <= 0;
    if (defenderFalls) {
      defender.hitpoints = 0;
      defender.alive = false;
    }

    moments.push({
      type: "damage",
      actor: attacker.name,
      defender: defender.name,
      dice: attacker.getWeaponDamage(),
      roll: damageRoll,
      multiplier: attackDamageMultiplier * attackMultiplier * attacker.damageDealtMultiplier * defender.damageTakenMultiplier,
      final: finalDamage,
      remainingHp: remainingHp,
    });

    if (defenderFalls) {
      const fallLevel = defender.mob ? "success" : "warn";
      const fallsText = EN.combat.logs.falls(defender.name);
      logs.push({ text: fallsText, level: fallLevel });
      moments.push({ type: "text", text: fallsText, level: fallLevel });
    }
  }

  private enemyAction(enemy: Creature): { atk: number; def: number; name: string } {
    const hpRatio = enemy.hitpoints / Math.max(1, enemy.maxHitpoints);

    if (hpRatio < ENEMY_STYLE_LOW_HP_RATIO && this.dice.roll(1, 100) <= ENEMY_STYLE_GUARDED_CHANCE_PERCENT) {
      return {
        atk: ENEMY_STYLE_GUARDED_ATTACK_MULTIPLIER,
        def: ENEMY_STYLE_GUARDED_DEFENSE_MULTIPLIER,
        name: EN.combat.enemyStyles.guarded,
      };
    }

    if (this.dice.roll(1, 100) <= ENEMY_STYLE_RECKLESS_CHANCE_PERCENT) {
      return {
        atk: ENEMY_STYLE_RECKLESS_ATTACK_MULTIPLIER,
        def: ENEMY_STYLE_RECKLESS_DEFENSE_MULTIPLIER,
        name: EN.combat.enemyStyles.reckless,
      };
    }

    return {
      atk: ENEMY_STYLE_STEADY_ATTACK_MULTIPLIER,
      def: ENEMY_STYLE_STEADY_DEFENSE_MULTIPLIER,
      name: EN.combat.enemyStyles.steady,
    };
  }

  turn(player: Creature, enemy: Creature, action: PlayerAction, options: CombatTurnOptions = {}): CombatResult {
    const logs: CombatLog[] = [];
    const moments: CombatMoment[] = [];

    if (!player.alive || !enemy.alive) {
      return { over: true, fled: false, logs, moments };
    }

    let playerAtkMult = 1.0;
    let playerDefMult = 1.0;

    if (action === "offensive") {
      playerAtkMult = COMBAT_OFFENSIVE_ATTACK_MULTIPLIER;
      playerDefMult = COMBAT_OFFENSIVE_DEFENSE_MULTIPLIER;
      logs.push({ text: EN.combat.logs.offensiveStance, level: "warn" });
      moments.push({ type: "text", text: EN.combat.logs.offensiveStance, level: "warn" });
    } else if (action === "defensive") {
      playerAtkMult = COMBAT_DEFENSIVE_ATTACK_MULTIPLIER;
      playerDefMult = COMBAT_DEFENSIVE_DEFENSE_MULTIPLIER;
      logs.push({ text: EN.combat.logs.defensiveStance, level: "info" });
      moments.push({ type: "text", text: EN.combat.logs.defensiveStance, level: "info" });
    }

    if (action === "flee") {
      const fleeRoll = this.dice.roll(1, FLEE_DIE_SIDES);
      const fleeBonus = player.attributes.modifier("dex") + (options.fleeBonus ?? 0) + this.playerLuckBonus(player);
      const score = fleeRoll + fleeBonus;
      const dc = FLEE_BASE_DC + enemy.attributes.modifier("dex");
      const fleeSuccess = score >= dc;
      moments.push({
        type: "roll",
        phase: "flee",
        actor: player.name,
        defender: enemy.name,
        roll: fleeRoll,
        bonus: fleeBonus,
        total: score,
        target: dc,
        success: fleeSuccess,
      });
      this.recordPlayerD20Roll(fleeRoll, fleeSuccess);
      if (fleeSuccess) {
        logs.push({ text: EN.combat.logs.fleeSuccess(score, dc), level: "success" });
        moments.push({ type: "text", text: EN.combat.logs.fleeSuccessMoment(score, dc), level: "success" });
        return { over: true, fled: true, logs, moments };
      }
      logs.push({ text: EN.combat.logs.fleeFail(score, dc), level: "warn" });
      moments.push({ type: "text", text: EN.combat.logs.fleeFailMoment(score, dc), level: "warn" });
    } else if (action === "heal") {
      const heal = player.bestHealItem();
      if (heal) {
        player.inventory.remove(heal);
        const amount = player.applyInstantItem(heal);
        logs.push({ text: EN.combat.logs.heal(heal.name, amount), level: "success" });
        moments.push({
          type: "heal",
          actor: player.name,
          item: heal.name,
          amount,
        });
      } else {
        logs.push({ text: EN.combat.logs.noHealingItem, level: "warn" });
        moments.push({ type: "text", text: EN.combat.logs.noHealingMoment, level: "warn" });
      }
    } else {
      this.attack(player, enemy, playerAtkMult, 1.0, logs, moments);
    }

    if (enemy.alive) {
      const enemyStyle = this.enemyAction(enemy);
      const styleText = EN.combat.logs.enemyStyle(enemy.name, enemyStyle.name);
      logs.push({ text: styleText, level: "info" });
      moments.push({ type: "text", text: styleText, level: "info" });
      this.attack(
        enemy,
        player,
        enemyStyle.atk * Math.max(0, options.enemyAttackMultiplier ?? 1),
        playerDefMult * enemyStyle.def,
        logs,
        moments,
      );
    }

    player.think();
    enemy.think();

    const over = !player.alive || !enemy.alive;
    return { over, fled: false, logs, moments };
  }
}

export function canPlayerHeal(player: Creature): boolean {
  return player.healItems().length > 0;
}

export function describeHealChoice(player: Creature): string {
  const item: InstantEffectItem | null = player.bestHealItem();
  if (!item) {
    return EN.combat.healChoiceNone;
  }
  return EN.combat.healChoiceItem(item.name, item.hpBoost);
}
