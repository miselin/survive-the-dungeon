import { buildEncounterPlan } from "../encounterGrammar.js";
import { SeededRandom } from "../rng.js";
import { assert, assertEqual } from "./assert.js";

export function runEncounterGrammarTests(): void {
  {
    const plan = buildEncounterPlan({
      floor: 4,
      threat: 7,
      roomKind: "normal",
      targetCount: 5,
      rng: new SeededRandom("encounter-count"),
    });

    assertEqual(
      plan.length,
      5,
      "Encounter planner should emit exactly the requested mob count",
    );
    assert(
      plan.every((entry) => entry.encounterId.length > 0),
      "Encounter planner should always annotate source encounter ids",
    );
  }

  {
    const options = {
      floor: 8,
      threat: 11,
      roomKind: "normal" as const,
      targetCount: 7,
    };
    const first = buildEncounterPlan({
      ...options,
      rng: new SeededRandom("encounter-deterministic"),
    });
    const second = buildEncounterPlan({
      ...options,
      rng: new SeededRandom("encounter-deterministic"),
    });

    assertEqual(
      JSON.stringify(first),
      JSON.stringify(second),
      "Encounter planner should be deterministic for identical seeds",
    );
  }

  {
    const plan = buildEncounterPlan({
      floor: 12,
      threat: 12,
      roomKind: "normal",
      targetCount: 9,
      rng: new SeededRandom("encounter-role-mix"),
    });

    assert(
      plan.some((entry) => entry.role !== "skirmisher"),
      "Higher-threat plans should include specialist roles",
    );
  }

  {
    const plan = buildEncounterPlan({
      floor: 12,
      threat: 12,
      roomKind: "boss",
      targetCount: 3,
      rng: new SeededRandom("encounter-boss-fallback"),
    });

    assert(
      plan.every((entry) => entry.encounterId === "fallback-skirmisher"),
      "Unknown room kinds should fall back to a safe default encounter",
    );
  }
}

