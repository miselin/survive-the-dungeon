import { AttributeSet } from "../attributes.js";
import { findBuildChoice } from "../buildChoices.js";
import { SHOP_REWARD_FALLBACK_GOLD } from "../constants.js";
import { Creature } from "../creature.js";
import { LEVEL_UP_ATTRIBUTES } from "../game.js";
import {
  allocateLevelUp,
  chooseBossReward,
  claimShopReward,
  createPendingShopRewards,
} from "../runProgression.js";
import { assert, assertEqual } from "./assert.js";

function makePlayer(): Creature {
  const player = new Creature(
    "Player",
    { x: 0, y: 0 },
    new AttributeSet({ str: 10, dex: 10, con: 10, int: 10, wis: 10, chr: 10 }),
  );
  player.maxHitpoints = 60;
  player.hitpoints = 60;
  return player;
}

export function runProgressionTests(): void {
  {
    const player = makePlayer();
    const activePerks = [] as ReturnType<typeof findBuildChoice>[];
    const activeGambits = [] as ReturnType<typeof findBuildChoice>[];
    const pendingBossRewards = {
      perks: [findBuildChoice("perk-duelist-instinct")],
      gambits: [findBuildChoice("gambit-berserker-stance")],
    };

    const result = chooseBossReward({
      overlayType: "boss-reward",
      pendingBossRewards,
      kind: "none",
      player,
      activePerks,
      activeGambits,
      log: () => {},
    });

    assertEqual(result.shouldAdvanceFloor, true, "Skipping boss rewards should advance to the next floor");
    assertEqual(result.pendingBossRewards, null, "Skipping boss rewards should clear pending boss rewards");
  }

  {
    const player = makePlayer();
    const baseAttack = player.attackBonus;
    const activePerks = [] as ReturnType<typeof findBuildChoice>[];
    const activeGambits = [] as ReturnType<typeof findBuildChoice>[];
    const perk = findBuildChoice("perk-duelist-instinct");

    const result = chooseBossReward({
      overlayType: "boss-reward",
      pendingBossRewards: {
        perks: [perk],
        gambits: [],
      },
      kind: "perk",
      choiceId: perk.id,
      player,
      activePerks,
      activeGambits,
      log: () => {},
    });

    assertEqual(result.shouldAdvanceFloor, true, "Picking a boss reward should advance to the next floor");
    assertEqual(activePerks.length, 1, "Picked perk should be added to active perks");
    assertEqual(activePerks[0].id, perk.id, "Picked perk should match selected id");
    assert(player.attackBonus > baseAttack, "Picked perk should apply its combat effect immediately");
  }

  {
    const player = makePlayer();
    const stats = { goldEarned: 0 };
    const result = claimShopReward({
      overlayType: "shop-reward",
      pendingShopRewards: createPendingShopRewards([], []),
      choiceId: "remove-perk",
      player,
      stats,
      removeLatestChoice: () => null,
      log: () => {},
    });

    assertEqual(result.claimed, true, "Claiming a shop reward should report success when overlay is active");
    assertEqual(result.pendingShopRewards, null, "Claiming a shop reward should clear pending rewards");
    assertEqual(player.gold, SHOP_REWARD_FALLBACK_GOLD, "Missing perk removal should grant fallback gold");
    assertEqual(stats.goldEarned, SHOP_REWARD_FALLBACK_GOLD, "Fallback gold should be tracked in run stats");
  }

  {
    const player = makePlayer();
    player.hitpoints = 5;

    const before = player.hitpoints;
    const result = claimShopReward({
      overlayType: "shop-reward",
      pendingShopRewards: createPendingShopRewards([], []),
      choiceId: "remove-gambit",
      player,
      stats: { goldEarned: 0 },
      removeLatestChoice: () => null,
      log: () => {},
    });

    assertEqual(result.claimed, true, "Missing gambit removal should still claim the reward");
    assert(player.hitpoints > before, "Missing gambit removal should trigger fallback healing");
  }

  {
    const player = makePlayer();
    player.grantAttributePoint(1);

    const validResult = allocateLevelUp({
      overlayType: "level-up",
      attr: "str",
      validAttributes: LEVEL_UP_ATTRIBUTES,
      player,
      log: () => {},
    });
    assertEqual(validResult.spent, true, "Valid level-up allocation should spend a point");
    assertEqual(validResult.nextOverlayType, "none", "Overlay should close when no level-up points remain");

    const invalidResult = allocateLevelUp({
      overlayType: "level-up",
      attr: "int",
      validAttributes: LEVEL_UP_ATTRIBUTES,
      player,
      log: () => {},
    });
    assertEqual(invalidResult.spent, false, "Inactive attributes must not be spendable");

    const wrongOverlayResult = allocateLevelUp({
      overlayType: "shop",
      attr: "str",
      validAttributes: LEVEL_UP_ATTRIBUTES,
      player,
      log: () => {},
    });
    assertEqual(wrongOverlayResult.spent, false, "Level-up allocation should no-op outside the level-up overlay");
  }
}
