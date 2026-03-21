import type { SeededRandom } from "./rng";

export type EncounterRole =
  | "swarmer"
  | "skirmisher"
  | "striker"
  | "bulwark"
  | "brute";

export type EnemyIntentHint = "chip" | "pressure" | "burst" | "guard";

export type EncounterRoomKind = "normal" | "boss";

type EncounterPackEntry = {
  role: EncounterRole;
  count: number;
};

type EncounterRule = {
  id: string;
  weight: number;
  minFloor: number;
  maxFloor: number;
  minThreat: number;
  maxThreat: number;
  roomKind: EncounterRoomKind;
  pack: EncounterPackEntry[];
};

export type EncounterPlanEntry = {
  encounterId: string;
  role: EncounterRole;
  intentHint: EnemyIntentHint;
  challengeOffset: number;
};

export type EncounterRoleTuning = {
  challengeOffset: number;
  hitpointMultiplier: number;
  attackBonusDelta: number;
  defenseBonusDelta: number;
  damageDealtMultiplier: number;
  damageTakenMultiplier: number;
  intentHint: EnemyIntentHint;
};

export const ENCOUNTER_ROLE_TUNING: Record<EncounterRole, EncounterRoleTuning> =
  {
    swarmer: {
      challengeOffset: -1,
      hitpointMultiplier: 0.72,
      attackBonusDelta: 1,
      defenseBonusDelta: -1,
      damageDealtMultiplier: 0.92,
      damageTakenMultiplier: 1.24,
      intentHint: "chip",
    },
    skirmisher: {
      challengeOffset: 0,
      hitpointMultiplier: 0.9,
      attackBonusDelta: 1,
      defenseBonusDelta: 0,
      damageDealtMultiplier: 1.0,
      damageTakenMultiplier: 1.08,
      intentHint: "pressure",
    },
    striker: {
      challengeOffset: 1,
      hitpointMultiplier: 0.86,
      attackBonusDelta: 2,
      defenseBonusDelta: -1,
      damageDealtMultiplier: 1.2,
      damageTakenMultiplier: 1.12,
      intentHint: "burst",
    },
    bulwark: {
      challengeOffset: 1,
      hitpointMultiplier: 1.35,
      attackBonusDelta: -1,
      defenseBonusDelta: 3,
      damageDealtMultiplier: 0.95,
      damageTakenMultiplier: 0.8,
      intentHint: "guard",
    },
    brute: {
      challengeOffset: 2,
      hitpointMultiplier: 1.55,
      attackBonusDelta: 3,
      defenseBonusDelta: -2,
      damageDealtMultiplier: 1.26,
      damageTakenMultiplier: 0.92,
      intentHint: "burst",
    },
  };

type EncounterForm = readonly [
  "encounter",
  string,
  readonly [
    "when",
    readonly ["floor", number, number],
    readonly ["threat", number, number],
    readonly ["room", EncounterRoomKind],
  ],
  readonly ["weight", number],
  readonly ["pack", ...(readonly [EncounterRole, number])[]],
];

// Lisp-y grammar definitions expressed as S-expression-like tuples.
const ENCOUNTER_FORMS: readonly EncounterForm[] = [
  [
    "encounter",
    "scout-pair",
    ["when", ["floor", 1, 3], ["threat", 0, 6], ["room", "normal"]],
    ["weight", 10],
    ["pack", ["skirmisher", 2]],
  ],
  [
    "encounter",
    "swarmer-screen",
    ["when", ["floor", 1, 6], ["threat", 0, 9], ["room", "normal"]],
    ["weight", 7],
    ["pack", ["swarmer", 2], ["skirmisher", 1]],
  ],
  [
    "encounter",
    "anvil-and-knife",
    ["when", ["floor", 3, 12], ["threat", 4, 14], ["room", "normal"]],
    ["weight", 8],
    ["pack", ["bulwark", 1], ["striker", 1]],
  ],
  [
    "encounter",
    "hunter-cell",
    ["when", ["floor", 4, 99], ["threat", 5, 99], ["room", "normal"]],
    ["weight", 7],
    ["pack", ["skirmisher", 1], ["striker", 2]],
  ],
  [
    "encounter",
    "brute-with-escort",
    ["when", ["floor", 6, 99], ["threat", 7, 99], ["room", "normal"]],
    ["weight", 5],
    ["pack", ["brute", 1], ["swarmer", 2]],
  ],
  [
    "encounter",
    "bulwark-line",
    ["when", ["floor", 8, 99], ["threat", 8, 99], ["room", "normal"]],
    ["weight", 4],
    ["pack", ["bulwark", 1], ["skirmisher", 2]],
  ],
] as const;

const FALLBACK_RULE: EncounterRule = {
  id: "fallback-skirmisher",
  weight: 1,
  minFloor: 1,
  maxFloor: Number.MAX_SAFE_INTEGER,
  minThreat: 0,
  maxThreat: Number.MAX_SAFE_INTEGER,
  roomKind: "normal",
  pack: [{ role: "skirmisher", count: 1 }],
};

function isEncounterRoleValue(value: unknown): value is EncounterRole {
  return (
    typeof value === "string" && Object.hasOwn(ENCOUNTER_ROLE_TUNING, value)
  );
}

function parseEncounterForm(form: EncounterForm): EncounterRule {
  const [, id, when, weightSpec, packSpec] = form;
  const [, floorSpec, threatSpec, roomSpec] = when;
  const [, minFloorRaw, maxFloorRaw] = floorSpec;
  const [, minThreatRaw, maxThreatRaw] = threatSpec;
  const [, roomKind] = roomSpec;
  const [, weightRaw] = weightSpec;
  const minFloor = Math.floor(minFloorRaw);
  const maxFloor = Math.floor(maxFloorRaw);
  const minThreat = Math.floor(minThreatRaw);
  const maxThreat = Math.floor(maxThreatRaw);
  const weight = Math.floor(weightRaw);

  const entries: EncounterPackEntry[] = [];
  for (const rawEntry of packSpec.slice(1)) {
    const roleRaw = rawEntry[0];
    const countRaw = rawEntry[1];
    if (!isEncounterRoleValue(roleRaw)) {
      continue;
    }
    if (typeof countRaw !== "number" || !Number.isFinite(countRaw)) {
      continue;
    }
    entries.push({
      role: roleRaw,
      count: Math.max(1, Math.floor(countRaw)),
    });
  }

  return {
    id,
    weight: Math.max(1, weight),
    minFloor: Math.max(1, minFloor),
    maxFloor: Math.max(minFloor, maxFloor),
    minThreat: Math.max(0, minThreat),
    maxThreat: Math.max(minThreat, maxThreat),
    roomKind,
    pack: entries.length > 0 ? entries : FALLBACK_RULE.pack,
  };
}

const ENCOUNTER_RULES: EncounterRule[] = ENCOUNTER_FORMS.map((form) =>
  parseEncounterForm(form),
);

function matchesEncounterRule(
  rule: EncounterRule,
  floor: number,
  threat: number,
  roomKind: EncounterRoomKind,
): boolean {
  return (
    floor >= rule.minFloor &&
    floor <= rule.maxFloor &&
    threat >= rule.minThreat &&
    threat <= rule.maxThreat &&
    roomKind === rule.roomKind
  );
}

function pickWeighted<T extends { weight: number }>(
  list: readonly T[],
  rng: SeededRandom,
): T {
  let total = 0;
  for (const entry of list) {
    total += Math.max(1, entry.weight | 0);
  }
  if (total <= 0) {
    return list[0];
  }

  let roll = rng.int(1, total);
  for (const entry of list) {
    roll -= Math.max(1, entry.weight | 0);
    if (roll <= 0) {
      return entry;
    }
  }

  return list[list.length - 1];
}

function expandEncounterPack(rule: EncounterRule): EncounterRole[] {
  const roles: EncounterRole[] = [];
  for (const item of rule.pack) {
    for (let i = 0; i < item.count; i += 1) {
      roles.push(item.role);
    }
  }
  return roles.length > 0 ? roles : ["skirmisher"];
}

export type BuildEncounterPlanOptions = {
  floor: number;
  threat: number;
  roomKind: EncounterRoomKind;
  targetCount: number;
  rng: SeededRandom;
};

export function buildEncounterPlan(
  options: BuildEncounterPlanOptions,
): EncounterPlanEntry[] {
  const wanted = Math.max(0, options.targetCount | 0);
  if (wanted <= 0) {
    return [];
  }

  const candidates = ENCOUNTER_RULES.filter((rule) =>
    matchesEncounterRule(rule, options.floor, options.threat, options.roomKind),
  );
  const pool = candidates.length > 0 ? candidates : [FALLBACK_RULE];
  const plan: EncounterPlanEntry[] = [];
  let steps = 0;
  const maxSteps = Math.max(8, wanted * 6);

  while (plan.length < wanted && steps < maxSteps) {
    steps += 1;
    const encounter = pickWeighted(pool, options.rng);
    const pack = expandEncounterPack(encounter);
    for (const role of pack) {
      if (plan.length >= wanted) {
        break;
      }
      const tuning = ENCOUNTER_ROLE_TUNING[role];
      plan.push({
        encounterId: encounter.id,
        role,
        intentHint: tuning.intentHint,
        challengeOffset: tuning.challengeOffset,
      });
    }
  }

  while (plan.length < wanted) {
    const tuning = ENCOUNTER_ROLE_TUNING.skirmisher;
    plan.push({
      encounterId: FALLBACK_RULE.id,
      role: "skirmisher",
      intentHint: tuning.intentHint,
      challengeOffset: tuning.challengeOffset,
    });
  }

  return plan;
}

export function isEncounterRole(value: string): value is EncounterRole {
  return isEncounterRoleValue(value);
}

export function isEnemyIntentHint(value: string): value is EnemyIntentHint {
  return value === "chip" || value === "pressure" || value === "burst" || value === "guard";
}
