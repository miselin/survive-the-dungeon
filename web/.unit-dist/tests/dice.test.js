import { Dice } from "../dice.js";
import { SeededRandom } from "../rng.js";
import { assertEqual } from "./assert.js";
export function runDiceTests() {
    const dice = new Dice(new SeededRandom("dice-flat-modifier"));
    assertEqual(dice.rollNamed("1d1 +5"), 6, "Dice roll should include +modifier");
    assertEqual(dice.rollNamed("2d1+3"), 5, "Dice roll should parse +modifier without spaces");
    const minMaxA = dice.minMax("2d4 +3");
    assertEqual(minMaxA[0], 5, "Dice min should include modifier");
    assertEqual(minMaxA[1], 11, "Dice max should include modifier");
    const minMaxB = dice.minMax("3d6-2");
    assertEqual(minMaxB[0], 1, "Dice min should support negative modifier");
    assertEqual(minMaxB[1], 16, "Dice max should support negative modifier");
}
