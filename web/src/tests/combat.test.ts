import { AttributeSet } from "../attributes.js";
import { armorClassFor, Combat, playerLuckBonusFromState } from "../combat.js";
import { Creature } from "../creature.js";
import { Dice } from "../dice.js";
import { NameGenerator, creatureAtLevel } from "../procgen.js";
import { SeededRandom } from "../rng.js";
import { assert, assertEqual } from "./assert.js";

class FixedDice {
  private readonly queue: number[];

  constructor(rolls: number[]) {
    this.queue = [...rolls];
  }

  roll(low = 1, high = 20): number {
    const next = this.queue.shift() ?? low;
    return Math.max(low, Math.min(high, next));
  }

  rollNamed(_name: string): number {
    return 1;
  }

  minMax(_name: string): [number, number] {
    return [1, 1];
  }
}

function makeCreature(name: string, hp = 100): Creature {
  const creature = new Creature(
    name,
    { x: 0, y: 0 },
    new AttributeSet({ str: 10, dex: 10, con: 10, int: 10, wis: 10, chr: 10 }),
  );
  creature.hitpoints = hp;
  creature.maxHitpoints = hp;
  creature.attackBonus = 0;
  creature.defenseBonus = 0;
  return creature;
}

export function runCombatTests(): void {
  const rng = new SeededRandom("mob-ac-range");
  const names = new NameGenerator(rng);
  let maxAc = 0;
  for (let i = 0; i < 80; i += 1) {
    const mob = creatureAtLevel(0, names, rng);
    maxAc = Math.max(maxAc, armorClassFor(mob));
  }
  assert(
    maxAc <= 14,
    `Level-0 mob AC should stay manageable (<=14), got ${maxAc}`,
  );

  const neutralLuck = playerLuckBonusFromState(
    { playerD20History: [12, 14, 16, 18], playerMissStreak: 0 },
    0.9,
  );
  assertEqual(
    neutralLuck,
    0,
    "Luck bonus should be 0 with healthy HP and normal rolls",
  );

  const pressuredLuck = playerLuckBonusFromState(
    { playerD20History: [1, 2, 3, 4, 5, 6, 7, 8], playerMissStreak: 3 },
    0.1,
  );
  assert(
    pressuredLuck >= 4,
    `Luck bonus should increase under pressure, got ${pressuredLuck}`,
  );

  const player = makeCreature("Player", 100);
  player.maxHitpoints = 100;
  player.hitpoints = 10;

  const enemy = makeCreature("Goblin", 100);
  enemy.defenseBonus = 1;
  enemy.mob = true;

  const combat = new Combat(new FixedDice([9, 80, 9]) as unknown as Dice);
  combat.restoreLuckState({
    playerD20History: [1, 2, 3, 4, 5, 6, 7, 8],
    playerMissStreak: 2,
  });

  const result = combat.turn(player, enemy, "normal");
  const playerRoll = result.moments.find(
    (moment) =>
      moment.type === "roll" &&
      moment.actor === "Player" &&
      moment.phase === "to-hit",
  );

  assert(
    !!playerRoll && playerRoll.type === "roll",
    "Expected player to-hit roll moment",
  );
  if (!playerRoll || playerRoll.type !== "roll") {
    return;
  }

  assert(
    playerRoll.bonus > 0,
    `Expected positive luck-adjusted to-hit bonus, got ${playerRoll.bonus}`,
  );
  assert(
    playerRoll.success,
    "Expected luck-adjusted roll to convert the hit check to success",
  );

  const finisherPlayer = makeCreature("Player", 10);
  const finisherEnemy = makeCreature("Goblin", 1);
  finisherEnemy.mob = true;
  const finisherCombat = new Combat(new FixedDice([11]) as unknown as Dice);
  const finisherResult = finisherCombat.turn(
    finisherPlayer,
    finisherEnemy,
    "normal",
  );
  const damageMomentIndex = finisherResult.moments.findIndex(
    (moment) =>
      moment.type === "damage" &&
      moment.actor === "Player" &&
      moment.defender === "Goblin",
  );
  const fallsMomentIndex = finisherResult.moments.findIndex(
    (moment) => moment.type === "text" && moment.text === "Goblin falls.",
  );

  assert(
    damageMomentIndex >= 0,
    "Expected a player damage moment when delivering a finishing blow",
  );
  assert(
    fallsMomentIndex > damageMomentIndex,
    "Defeat moment should appear after the damage moment in combat roll playback",
  );
}
