import { PLAYER_CRIT_MINIMUM_MULTIPLIER } from "../constants.js";
import { Dice } from "../dice.js";
import { Weapon } from "../items.js";
import { createWeapon } from "../procgen.js";
import { SeededRandom } from "../rng.js";
import { assert } from "./assert.js";

export function runProcgenTests(): void {
  const rng = new SeededRandom("procgen-dice-format");
  const firstWeapon = createWeapon("Test Blade", 10, 1, rng);
  assert(
    /^\d+\s*d\s*\d+\s*\+\s*\d+$/i.test(firstWeapon.damage()),
    `Procgen weapon damage should include flat bonus, got: ${firstWeapon.damage()}`,
  );

  const procgenRng = new SeededRandom("procgen-min-damage");
  const dice = new Dice(new SeededRandom("procgen-min-damage-dice"));
  for (let i = 0; i < 80; i += 1) {
    const weapon = createWeapon(`Blade-${i}`, 6, 0, procgenRng);
    const [minDamage] = dice.minMax(weapon.damage());
    assert(minDamage > 1, `Procgen min damage should be >1, got ${minDamage} from ${weapon.damage()}`);
    assert(
      weapon.criticalMultiplier() >= PLAYER_CRIT_MINIMUM_MULTIPLIER,
      `Procgen crit multiplier should be >=${PLAYER_CRIT_MINIMUM_MULTIPLIER}, got ${weapon.criticalMultiplier()}`,
    );
  }

  const legacyWeapon = new Weapon("Legacy Blade", 20, 1, 0, 0, "1d6");
  assert(
    legacyWeapon.criticalMultiplier() >= PLAYER_CRIT_MINIMUM_MULTIPLIER,
    `Weapon constructor should clamp crit multiplier to >=${PLAYER_CRIT_MINIMUM_MULTIPLIER}, got ${legacyWeapon.criticalMultiplier()}`,
  );
}
