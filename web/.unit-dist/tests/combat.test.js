import { AttributeSet } from "../attributes.js";
import { armorClassFor, Combat, playerLuckBonusFromState } from "../combat.js";
import { Creature } from "../creature.js";
import { Dice } from "../dice.js";
import { NameGenerator, creatureAtLevel } from "../procgen.js";
import { SeededRandom } from "../rng.js";
import { assert, assertEqual } from "./assert.js";
class FixedDice {
    queue;
    constructor(rolls) {
        this.queue = [...rolls];
    }
    roll(low = 1, high = 20) {
        const next = this.queue.shift() ?? low;
        return Math.max(low, Math.min(high, next));
    }
    rollNamed(_name) {
        return 1;
    }
    minMax(_name) {
        return [1, 1];
    }
}
function makeCreature(name, hp = 100) {
    const creature = new Creature(name, { x: 0, y: 0 }, new AttributeSet({ str: 10, dex: 10, con: 10, int: 10, wis: 10, chr: 10 }));
    creature.hitpoints = hp;
    creature.maxHitpoints = hp;
    creature.attackBonus = 0;
    creature.defenseBonus = 0;
    return creature;
}
export function runCombatTests() {
    const rng = new SeededRandom("mob-ac-range");
    const names = new NameGenerator(rng);
    let maxAc = 0;
    for (let i = 0; i < 80; i += 1) {
        const mob = creatureAtLevel(0, names, rng);
        maxAc = Math.max(maxAc, armorClassFor(mob));
    }
    assert(maxAc <= 14, `Level-0 mob AC should stay manageable (<=14), got ${maxAc}`);
    const neutralLuck = playerLuckBonusFromState({ playerD20History: [12, 14, 16, 18], playerMissStreak: 0 }, 0.9);
    assertEqual(neutralLuck, 0, "Luck bonus should be 0 with healthy HP and normal rolls");
    const pressuredLuck = playerLuckBonusFromState({ playerD20History: [1, 2, 3, 4, 5, 6, 7, 8], playerMissStreak: 3 }, 0.1);
    assert(pressuredLuck >= 4, `Luck bonus should increase under pressure, got ${pressuredLuck}`);
    const player = makeCreature("Player", 100);
    player.maxHitpoints = 100;
    player.hitpoints = 10;
    const enemy = makeCreature("Goblin", 100);
    enemy.defenseBonus = 1;
    enemy.mob = true;
    const combat = new Combat(new FixedDice([9, 80, 9]));
    combat.restoreLuckState({
        playerD20History: [1, 2, 3, 4, 5, 6, 7, 8],
        playerMissStreak: 2,
    });
    const result = combat.turn(player, enemy, "normal");
    const playerRoll = result.moments.find((moment) => moment.type === "roll" && moment.actor === "Player" && moment.phase === "to-hit");
    assert(!!playerRoll && playerRoll.type === "roll", "Expected player to-hit roll moment");
    if (!playerRoll || playerRoll.type !== "roll") {
        return;
    }
    assert(playerRoll.bonus > 0, `Expected positive luck-adjusted to-hit bonus, got ${playerRoll.bonus}`);
    assert(playerRoll.success, "Expected luck-adjusted roll to convert the hit check to success");
}
