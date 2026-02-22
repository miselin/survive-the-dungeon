import { SeededRandom } from "./rng";

const DICE_RE = /^([1-9][0-9]*)\s*d\s*([1-9][0-9]*)(?:\s*([+-])\s*([0-9]+))?$/i;

type ParsedDice = {
  count: number;
  faces: number;
  modifier: number;
};

function parseDice(name: string): ParsedDice {
  const match = name.trim().match(DICE_RE);
  if (!match) {
    throw new Error(`Invalid dice: ${name}`);
  }

  const count = Number.parseInt(match[1], 10);
  const faces = Number.parseInt(match[2], 10);
  const sign = match[3] ?? "+";
  const modifierAbs = match[4] ? Number.parseInt(match[4], 10) : 0;
  const modifier = sign === "-" ? -modifierAbs : modifierAbs;

  return { count, faces, modifier };
}

export class Dice {
  constructor(private readonly rng: SeededRandom) {}

  roll(low = 1, high = 20): number {
    const min = Math.max(1, low);
    return this.rng.int(min, high);
  }

  rollNamed(name: string): number {
    const { count, faces, modifier } = parseDice(name);
    let total = 0;
    for (let i = 0; i < count; i += 1) {
      total += this.roll(1, faces);
    }
    return total + modifier;
  }

  minMax(name: string): [number, number] {
    const { count, faces, modifier } = parseDice(name);
    return [count + modifier, count * faces + modifier];
  }
}
