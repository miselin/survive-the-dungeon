import { DungeonRun } from "../game.js";
import {
  buildSaveUrl,
  encodeSaveToken,
  extractSaveToken,
  extractSaveTokenFromSearch,
  loadRunFromToken,
} from "../save.js";
import { assert, assertEqual } from "./assert.js";

export function runSaveTests(): void {
  const run = new DungeonRun("save-roundtrip");
  run.player.gold = 321;
  run.player.hitpoints = Math.max(1, run.player.hitpoints - 7);

  const token = encodeSaveToken(run);
  assert(
    token.startsWith("std1."),
    "Save token should include the std1 prefix",
  );

  const loaded = loadRunFromToken(token);
  assertEqual(
    loaded.seedPhrase,
    run.seedPhrase,
    "Loaded run should preserve the original seed phrase",
  );
  assertEqual(
    loaded.player.gold,
    run.player.gold,
    "Loaded run should preserve gold",
  );
  assertEqual(
    loaded.player.hitpoints,
    run.player.hitpoints,
    "Loaded run should preserve hitpoints",
  );
  assertEqual(loaded.floor, run.floor, "Loaded run should preserve floor");

  const url = buildSaveUrl(token, {
    origin: "https://example.com",
    pathname: "/play",
  });
  assertEqual(
    extractSaveToken(url),
    token,
    "Token extraction should work from a save URL",
  );
  assertEqual(
    extractSaveToken(` ${token} `),
    token,
    "Token extraction should trim surrounding whitespace",
  );
  assertEqual(
    extractSaveTokenFromSearch(`?save=${encodeURIComponent(token)}`),
    token,
    "Search extraction should decode save tokens",
  );
}
