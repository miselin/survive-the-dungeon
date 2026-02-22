import type { AttributeName } from "./attributes";
import {
  GAMBIT_POOL,
  PERK_POOL,
  type BuildChoice,
  type BuildChoiceDefinition,
  type BuildChoiceKind,
} from "./buildChoices";
import {
  PLAYER_CONSTITUTION_BONUS,
  SHOP_REWARD_FALLBACK_GOLD,
  SHOP_REWARD_HEAL_FALLBACK_RATIO,
} from "./constants";
import { Creature } from "./creature";
import type { OverlayState } from "./game";
import { Gold } from "./items";
import type { SeededRandom } from "./rng";
import { EN } from "./strings/en";
import type { LogEntry } from "./types";

const ATTRIBUTE_ORDER: AttributeName[] = [
  "str",
  "dex",
  "con",
  "int",
  "wis",
  "chr",
];

export type PendingShopRewardChoice = {
  id: "bonus-point" | "remove-perk" | "remove-gambit";
  title: string;
  description: string;
};

export type PendingBossRewards = {
  perks: BuildChoiceDefinition[];
  gambits: BuildChoiceDefinition[];
};

type LogFn = (text: string, level?: LogEntry["level"]) => void;

export function toPublicBuildChoice(
  choice: BuildChoiceDefinition,
): BuildChoice {
  return {
    id: choice.id,
    name: choice.name,
    description: choice.description,
    kind: choice.kind,
  };
}

function pickRandomBuildChoices(
  kind: BuildChoiceKind,
  count: number,
  rng: SeededRandom,
  activePerks: BuildChoiceDefinition[],
  activeGambits: BuildChoiceDefinition[],
): BuildChoiceDefinition[] {
  const pool = kind === "perk" ? PERK_POOL : GAMBIT_POOL;
  const active = new Set(
    (kind === "perk" ? activePerks : activeGambits).map((choice) => choice.id),
  );

  let available = pool.filter((choice) => !active.has(choice.id));
  if (available.length < count) {
    available = [...pool];
  }

  return rng
    .shuffle([...available])
    .slice(0, Math.min(count, available.length));
}

export function createPendingBossRewards(
  rng: SeededRandom,
  activePerks: BuildChoiceDefinition[],
  activeGambits: BuildChoiceDefinition[],
): PendingBossRewards {
  return {
    perks: pickRandomBuildChoices("perk", 3, rng, activePerks, activeGambits),
    gambits: pickRandomBuildChoices(
      "gambit",
      3,
      rng,
      activePerks,
      activeGambits,
    ),
  };
}

export function applyBuildChoiceEffect(
  player: Creature,
  choice: BuildChoiceDefinition,
): void {
  const previousCap = player.currentMaxHitpoints();

  player.attackBonus += choice.attackBonus ?? 0;
  player.defenseBonus += choice.defenseBonus ?? 0;

  if (choice.attributes) {
    for (const attr of ATTRIBUTE_ORDER) {
      const delta = choice.attributes[attr] ?? 0;
      if (delta === 0) {
        continue;
      }
      player.attributes.modify(attr, delta);
      if (attr === "con") {
        player.maxHitpoints = Math.max(
          1,
          player.maxHitpoints + delta * PLAYER_CONSTITUTION_BONUS,
        );
      }
    }
  }

  if (choice.maxHitpoints) {
    player.maxHitpoints = Math.max(
      1,
      player.maxHitpoints + choice.maxHitpoints,
    );
  }

  player.damageDealtMultiplier *= choice.damageDealtMultiplier ?? 1;
  player.damageTakenMultiplier *= choice.damageTakenMultiplier ?? 1;
  player.hitpointCapMultiplier *= choice.hitpointCapMultiplier ?? 1;

  const newCap = player.currentMaxHitpoints();
  if (newCap > previousCap) {
    player.hitpoints += newCap - previousCap;
  }
  player.enforceHitpointCap();
}

export function removeBuildChoiceEffect(
  player: Creature,
  choice: BuildChoiceDefinition,
): void {
  player.attackBonus -= choice.attackBonus ?? 0;
  player.defenseBonus -= choice.defenseBonus ?? 0;

  if (choice.attributes) {
    for (const attr of ATTRIBUTE_ORDER) {
      const delta = choice.attributes[attr] ?? 0;
      if (delta === 0) {
        continue;
      }
      player.attributes.modify(attr, -delta);
      if (attr === "con") {
        player.maxHitpoints = Math.max(
          1,
          player.maxHitpoints - delta * PLAYER_CONSTITUTION_BONUS,
        );
      }
    }
  }

  if (choice.maxHitpoints) {
    player.maxHitpoints = Math.max(
      1,
      player.maxHitpoints - choice.maxHitpoints,
    );
  }

  player.damageDealtMultiplier /= choice.damageDealtMultiplier ?? 1;
  player.damageTakenMultiplier /= choice.damageTakenMultiplier ?? 1;
  player.hitpointCapMultiplier /= choice.hitpointCapMultiplier ?? 1;

  player.enforceHitpointCap();
}

export function createPendingShopRewards(
  activePerks: BuildChoiceDefinition[],
  activeGambits: BuildChoiceDefinition[],
): PendingShopRewardChoice[] {
  const latestPerk = activePerks[activePerks.length - 1] ?? null;
  const latestGambit = activeGambits[activeGambits.length - 1] ?? null;

  return [
    {
      id: "bonus-point",
      title: EN.game.shop.rewards.bonusPoint.title,
      description: EN.game.shop.rewards.bonusPoint.description,
    },
    {
      id: "remove-perk",
      title: EN.game.shop.rewards.removePerk.title,
      description: latestPerk
        ? EN.game.shop.rewards.removePerk.description(latestPerk.name)
        : EN.game.shop.rewards.removePerk.fallback(),
    },
    {
      id: "remove-gambit",
      title: EN.game.shop.rewards.removeGambit.title,
      description: latestGambit
        ? EN.game.shop.rewards.removeGambit.description(latestGambit.name)
        : EN.game.shop.rewards.removeGambit.fallback(),
    },
  ];
}

type ChooseBossRewardOptions = {
  overlayType: OverlayState["type"];
  pendingBossRewards: PendingBossRewards | null;
  kind: BuildChoiceKind | "none";
  choiceId?: string;
  player: Creature;
  activePerks: BuildChoiceDefinition[];
  activeGambits: BuildChoiceDefinition[];
  log: LogFn;
};

type ChooseBossRewardResult = {
  pendingBossRewards: PendingBossRewards | null;
  shouldAdvanceFloor: boolean;
};

export function chooseBossReward(
  options: ChooseBossRewardOptions,
): ChooseBossRewardResult {
  if (options.overlayType !== "boss-reward" || !options.pendingBossRewards) {
    return {
      pendingBossRewards: options.pendingBossRewards,
      shouldAdvanceFloor: false,
    };
  }

  if (options.kind === "none") {
    options.log(EN.game.logs.descendWithoutModifier, "info");
    return {
      pendingBossRewards: null,
      shouldAdvanceFloor: true,
    };
  }

  const source =
    options.kind === "perk"
      ? options.pendingBossRewards.perks
      : options.pendingBossRewards.gambits;
  const picked = source.find((choice) => choice.id === options.choiceId);
  if (!picked) {
    return {
      pendingBossRewards: options.pendingBossRewards,
      shouldAdvanceFloor: false,
    };
  }

  applyBuildChoiceEffect(options.player, picked);
  if (options.kind === "perk") {
    options.activePerks.push(picked);
  } else {
    options.activeGambits.push(picked);
  }

  options.log(
    EN.game.logs.selectedBuildChoice(
      picked.kind === "perk" ? EN.game.labels.perk : EN.game.labels.gambit,
      picked.name,
    ),
    "success",
  );

  return {
    pendingBossRewards: null,
    shouldAdvanceFloor: true,
  };
}

type RemoveLatestChoiceFn = (
  kind: BuildChoiceKind,
) => BuildChoiceDefinition | null;

type ShopRewardStats = {
  goldEarned: number;
};

type ClaimShopRewardOptions = {
  overlayType: OverlayState["type"];
  pendingShopRewards: PendingShopRewardChoice[] | null;
  choiceId: PendingShopRewardChoice["id"];
  player: Creature;
  stats: ShopRewardStats;
  removeLatestChoice: RemoveLatestChoiceFn;
  log: LogFn;
};

type ClaimShopRewardResult = {
  pendingShopRewards: PendingShopRewardChoice[] | null;
  claimed: boolean;
};

export function claimShopReward(
  options: ClaimShopRewardOptions,
): ClaimShopRewardResult {
  if (options.overlayType !== "shop-reward" || !options.pendingShopRewards) {
    return {
      pendingShopRewards: options.pendingShopRewards,
      claimed: false,
    };
  }

  if (options.choiceId === "bonus-point") {
    options.player.grantAttributePoint(1);
    options.log(EN.game.logs.shopRewardBonusPoint, "success");
  } else if (options.choiceId === "remove-perk") {
    const removed = options.removeLatestChoice("perk");
    if (removed) {
      options.log(EN.game.logs.shopRewardRemovedPerk(removed.name), "success");
    } else {
      options.player.give(new Gold(SHOP_REWARD_FALLBACK_GOLD));
      options.stats.goldEarned += SHOP_REWARD_FALLBACK_GOLD;
      options.log(EN.game.logs.shopRewardPerkFallbackGold(), "success");
    }
  } else if (options.choiceId === "remove-gambit") {
    const removed = options.removeLatestChoice("gambit");
    if (removed) {
      options.log(
        EN.game.logs.shopRewardRemovedGambit(removed.name),
        "success",
      );
    } else {
      const heal = Math.max(
        1,
        Math.floor(
          options.player.currentMaxHitpoints() *
            SHOP_REWARD_HEAL_FALLBACK_RATIO,
        ),
      );
      const before = options.player.hitpoints;
      options.player.hitpoints = Math.min(
        options.player.currentMaxHitpoints(),
        options.player.hitpoints + heal,
      );
      options.log(
        EN.game.logs.shopRewardGambitFallbackHeal(
          options.player.hitpoints - before,
        ),
        "success",
      );
    }
  }

  return {
    pendingShopRewards: null,
    claimed: true,
  };
}

type AllocateLevelUpOptions = {
  overlayType: OverlayState["type"];
  attr: string;
  validAttributes: readonly AttributeName[];
  player: Creature;
  log: LogFn;
};

type AllocateLevelUpResult = {
  spent: boolean;
  nextOverlayType: "level-up" | "none" | null;
};

function isValidLevelUpAttribute(
  attr: string,
  validAttributes: readonly AttributeName[],
): attr is AttributeName {
  return validAttributes.includes(attr as AttributeName);
}

export function allocateLevelUp(
  options: AllocateLevelUpOptions,
): AllocateLevelUpResult {
  if (options.overlayType !== "level-up") {
    return {
      spent: false,
      nextOverlayType: null,
    };
  }
  if (!isValidLevelUpAttribute(options.attr, options.validAttributes)) {
    return {
      spent: false,
      nextOverlayType: null,
    };
  }
  if (!options.player.spendAttributePoint(options.attr)) {
    return {
      spent: false,
      nextOverlayType: null,
    };
  }

  options.log(
    EN.game.logs.levelUpSpent(EN.game.attributeLabels[options.attr]),
    "success",
  );

  return {
    spent: true,
    nextOverlayType: options.player.unspentStatPoints > 0 ? "level-up" : "none",
  };
}
