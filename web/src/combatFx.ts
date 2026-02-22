import type { CombatMoment } from "./combat";

export type CombatFxState = {
  moments: CombatMoment[];
  revealed: number;
  elapsedMs: number;
};
