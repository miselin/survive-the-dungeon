import type { DungeonRun } from "../game";
import { EN } from "../strings/en";
import { ROOM_SHOP } from "../types";

export type StatsRenderMeta = {
  inShop: boolean;
  statsKey: string;
};

export function buildStatsRenderMeta(activeRun: DungeonRun): StatsRenderMeta {
  const room = activeRun.world.roomAt(activeRun.player.position);
  const inShop = room !== null && (room.attrs & ROOM_SHOP) === ROOM_SHOP;
  const roomThreat = activeRun.getCurrentRoomThreat();
  const build = activeRun.currentBuild();
  const buildSummary = [
    ...build.perks.map((choice) => `P:${choice.name}`),
    ...build.gambits.map((choice) => `G:${choice.name}`),
  ].join(" | ");

  const statsKey = [
    activeRun.state,
    activeRun.floor,
    activeRun.player.hitpoints,
    activeRun.player.currentMaxHitpoints(),
    activeRun.player.xp,
    activeRun.player.nextLevelXp,
    activeRun.player.gold,
    activeRun.player.level,
    activeRun.player.unspentStatPoints,
    activeRun.mobs.length,
    room ? room.attrs : EN.ui.room.hall.toLowerCase(),
    roomThreat,
    activeRun.player.describeWields(),
    buildSummary,
  ].join("|");

  return {
    inShop,
    statsKey,
  };
}
