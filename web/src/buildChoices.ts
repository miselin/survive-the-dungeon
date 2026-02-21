import type { AttributeName } from "./attributes";
import { EN } from "./strings/en";

export type BuildChoiceKind = "perk" | "gambit";

export type BuildChoice = {
  id: string;
  name: string;
  description: string;
  kind: BuildChoiceKind;
};

export type BuildChoiceDefinition = BuildChoice & {
  attackBonus?: number;
  defenseBonus?: number;
  maxHitpoints?: number;
  damageDealtMultiplier?: number;
  damageTakenMultiplier?: number;
  hitpointCapMultiplier?: number;
  attributes?: Partial<Record<AttributeName, number>>;
};

export const PERK_POOL: BuildChoiceDefinition[] = [
  {
    id: "perk-iron-frame",
    name: EN.game.buildChoices.perks.ironFrame.name,
    description: EN.game.buildChoices.perks.ironFrame.description,
    kind: "perk",
    maxHitpoints: 28,
    defenseBonus: 2,
  },
  {
    id: "perk-duelist-instinct",
    name: EN.game.buildChoices.perks.duelistInstinct.name,
    description: EN.game.buildChoices.perks.duelistInstinct.description,
    kind: "perk",
    attackBonus: 3,
    attributes: { dex: 1 },
  },
  {
    id: "perk-scavenger-wits",
    name: EN.game.buildChoices.perks.scavengerWits.name,
    description: EN.game.buildChoices.perks.scavengerWits.description,
    kind: "perk",
    attributes: { str: 2, chr: 2 },
  },
  {
    id: "perk-relentless-edge",
    name: EN.game.buildChoices.perks.relentlessEdge.name,
    description: EN.game.buildChoices.perks.relentlessEdge.description,
    kind: "perk",
    damageDealtMultiplier: 1.2,
  },
  {
    id: "perk-warding-shell",
    name: EN.game.buildChoices.perks.wardingShell.name,
    description: EN.game.buildChoices.perks.wardingShell.description,
    kind: "perk",
    damageTakenMultiplier: 0.85,
  },
];

export const GAMBIT_POOL: BuildChoiceDefinition[] = [
  {
    id: "gambit-blood-oath",
    name: EN.game.buildChoices.gambits.bloodOath.name,
    description: EN.game.buildChoices.gambits.bloodOath.description,
    kind: "gambit",
    damageDealtMultiplier: 2,
    hitpointCapMultiplier: 0.5,
  },
  {
    id: "gambit-berserker-stance",
    name: EN.game.buildChoices.gambits.berserkerStance.name,
    description: EN.game.buildChoices.gambits.berserkerStance.description,
    kind: "gambit",
    attackBonus: 6,
    defenseBonus: -4,
  },
  {
    id: "gambit-hollow-core",
    name: EN.game.buildChoices.gambits.hollowCore.name,
    description: EN.game.buildChoices.gambits.hollowCore.description,
    kind: "gambit",
    damageDealtMultiplier: 1.6,
    maxHitpoints: -25,
  },
  {
    id: "gambit-mirrored-pain",
    name: EN.game.buildChoices.gambits.mirroredPain.name,
    description: EN.game.buildChoices.gambits.mirroredPain.description,
    kind: "gambit",
    damageDealtMultiplier: 1.35,
    damageTakenMultiplier: 1.7,
  },
  {
    id: "gambit-brittle-focus",
    name: EN.game.buildChoices.gambits.brittleFocus.name,
    description: EN.game.buildChoices.gambits.brittleFocus.description,
    kind: "gambit",
    attributes: { str: 4, dex: 4, con: -3 },
  },
];

const BUILD_CHOICE_BY_ID = new Map<string, BuildChoiceDefinition>(
  [...PERK_POOL, ...GAMBIT_POOL].map((choice) => [choice.id, choice]),
);

export function findBuildChoice(id: string): BuildChoiceDefinition {
  const choice = BUILD_CHOICE_BY_ID.get(id);
  if (!choice) {
    throw new Error(`Unknown build choice id: ${id}`);
  }
  return choice;
}
