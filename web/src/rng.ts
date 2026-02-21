const UINT32_MAX = 0xffffffff;

function xmur3(input: string): () => number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i += 1) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }

  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

export class SeededRandom {
  private state: number;

  readonly seed: number;

  readonly phrase: string;

  constructor(seedPhrase: string) {
    this.phrase = seedPhrase;
    const seedSource = xmur3(seedPhrase);
    this.seed = seedSource();
    this.state = this.seed >>> 0;
  }

  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let r = Math.imul(this.state ^ (this.state >>> 15), this.state | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / (UINT32_MAX + 1);
  }

  getState(): number {
    return this.state >>> 0;
  }

  setState(state: number): void {
    this.state = state >>> 0;
  }

  int(min: number, max: number): number {
    if (max < min) {
      return min;
    }
    const span = max - min + 1;
    return Math.floor(this.next() * span) + min;
  }

  choice<T>(items: readonly T[]): T {
    return items[this.int(0, items.length - 1)];
  }

  chance(probability: number): boolean {
    return this.next() < probability;
  }

  shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = this.int(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

export function makeSeedPhrase(userValue: string): string {
  const trimmed = userValue.trim();
  if (trimmed.length > 0) {
    return trimmed;
  }
  return `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
