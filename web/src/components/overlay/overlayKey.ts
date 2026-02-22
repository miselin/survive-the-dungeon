import { describeHealChoice } from "../../combat";
import type { DungeonRun } from "../../game";
import type { CombatFxState } from "../../combatFx";

export function overlayRenderKey(activeRun: DungeonRun, combatFx: CombatFxState | null, combatSkipAll: boolean): string {
  if (combatFx) {
    return `combat-fx|${combatFx.revealed}|${combatFx.moments.length}|${combatSkipAll ? "1" : "0"}`;
  }

  if (activeRun.state === "dead" || activeRun.state === "won") {
    return [
      activeRun.state,
      activeRun.stats.vanquished,
      activeRun.stats.goldEarned,
      activeRun.stats.goldSpent,
      activeRun.stats.goldLeftBehind,
      activeRun.stats.inventoryValue,
      activeRun.stats.xpGained,
      activeRun.stats.level,
      activeRun.stats.floorReached,
    ].join("|");
  }

  if (activeRun.overlay.type === "none") {
    return "playing|none";
  }

  if (activeRun.overlay.type === "battle") {
    const enemy = activeRun.getBattleEnemy();
    return [
      "playing|battle",
      activeRun.overlay.mobId,
      activeRun.overlay.surpriseProtection ? "protected" : "normal",
      activeRun.player.hitpoints,
      enemy ? enemy.creature.hitpoints : "na",
      activeRun.logs.length,
      describeHealChoice(activeRun.player),
    ].join("|");
  }

  if (activeRun.overlay.type === "chest") {
    const chest = activeRun.getChest();
    return `playing|chest|${activeRun.overlay.chestId}|${chest ? chest.chest.count() : 0}|${activeRun.player.inventory.count()}|${activeRun.player.gold}`;
  }

  if (activeRun.overlay.type === "inventory") {
    return `playing|inventory|${activeRun.player.inventory.items().map((item) => item.id).join(",")}|${activeRun.player.hitpoints}|${activeRun.player.gold}`;
  }

  if (activeRun.overlay.type === "level-up") {
    return [
      "playing|level-up",
      activeRun.player.unspentStatPoints,
      activeRun.levelUpChoices().map((choice) => `${choice.attr}:${choice.value}`).join(","),
    ].join("|");
  }

  if (activeRun.overlay.type === "boss-reward") {
    const rewards = activeRun.getBossRewards();
    return [
      "playing|boss-reward",
      activeRun.floor,
      rewards ? rewards.perks.map((choice) => choice.id).join(",") : "none",
      rewards ? rewards.gambits.map((choice) => choice.id).join(",") : "none",
      activeRun.currentBuild().perks.length,
      activeRun.currentBuild().gambits.length,
    ].join("|");
  }

  if (activeRun.overlay.type === "shop-reward") {
    const rewards = activeRun.getShopRewardChoices();
    return [
      "playing|shop-reward",
      activeRun.floor,
      rewards ? rewards.map((choice) => `${choice.id}:${choice.description}`).join("|") : "none",
    ].join("|");
  }

  const sold = activeRun
    .shopEntries()
    .map((entry) => (entry.sold ? "1" : "0"))
    .join("");
  return `playing|shop|${sold}|${activeRun.player.gold}|${activeRun.player.inventory.count()}`;
}
