import { DungeonRun } from "../game.js";
import { assertEqual } from "./assert.js";

export function runGameTests(): void {
  const run = new DungeonRun("level-up-attributes");

  run.player.grantAttributePoint(2);
  run.overlay = { type: "level-up" };

  const choices = run.levelUpChoices().map((choice) => choice.attr).join(",");
  assertEqual(choices, "str,dex,con,chr", "Level-up choices should only include active gameplay stats");

  const pointsBefore = run.player.unspentStatPoints;
  run.allocateLevelUp("str");
  assertEqual(run.player.unspentStatPoints, pointsBefore - 1, "Spending a level-up point should reduce available points");

  run.overlay = { type: "level-up" };
  const intBefore = run.player.attributes.get("int");
  const pointsBeforeInvalid = run.player.unspentStatPoints;

  const allocate = run.allocateLevelUp as unknown as (this: DungeonRun, attr: string) => void;
  allocate.call(run, "int");

  assertEqual(run.player.attributes.get("int"), intBefore, "Inactive attributes should not be spendable via level-up");
  assertEqual(run.player.unspentStatPoints, pointsBeforeInvalid, "Invalid level-up attributes should not consume points");
}
