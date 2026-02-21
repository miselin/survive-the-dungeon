import { Dice } from "../dice.js";
import { createWeapon } from "../procgen.js";
import { SeededRandom } from "../rng.js";
import { assert } from "./assert.js";
export function runProcgenTests() {
    const rng = new SeededRandom("procgen-dice-format");
    const firstWeapon = createWeapon("Test Blade", 10, 1, rng);
    assert(/^\d+\s*d\s*\d+\s*\+\s*\d+$/i.test(firstWeapon.damage()), `Procgen weapon damage should include flat bonus, got: ${firstWeapon.damage()}`);
    const procgenRng = new SeededRandom("procgen-min-damage");
    const dice = new Dice(new SeededRandom("procgen-min-damage-dice"));
    for (let i = 0; i < 80; i += 1) {
        const weapon = createWeapon(`Blade-${i}`, 6, 0, procgenRng);
        const [minDamage] = dice.minMax(weapon.damage());
        assert(minDamage > 1, `Procgen min damage should be >1, got ${minDamage} from ${weapon.damage()}`);
    }
}
