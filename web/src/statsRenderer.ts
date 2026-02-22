import type { DungeonRun } from "./game";
import { EN } from "./strings/en";
import { ROOM_SHOP } from "./types";

export type StatsSidebarView = {
  inShop: boolean;
  statsKey: string;
  statsHtml: string;
  logsHtml: string;
};

function htmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildStatsSidebarView(activeRun: DungeonRun, wieldedGearOpen: boolean): StatsSidebarView {
  const room = activeRun.world.roomAt(activeRun.player.position);
  const inShop = room !== null && (room.attrs & ROOM_SHOP) === ROOM_SHOP;
  const roomThreat = activeRun.getCurrentRoomThreat();
  const threatDelta = roomThreat - activeRun.player.level;
  let threatLabel: string = EN.ui.threat.unknown;
  if (inShop) {
    threatLabel = EN.ui.threat.safe;
  } else if (room) {
    if (threatDelta >= 3) {
      threatLabel = EN.ui.threat.deadly(roomThreat);
    } else if (threatDelta >= 1) {
      threatLabel = EN.ui.threat.risky(roomThreat);
    } else {
      threatLabel = EN.ui.threat.manageable(roomThreat);
    }
  }

  const hpCap = activeRun.player.currentMaxHitpoints();
  const hpRatio = activeRun.player.hitpoints / Math.max(1, hpCap);
  const xpRatio = activeRun.player.xp / Math.max(1, activeRun.player.nextLevelXp);
  const build = activeRun.currentBuild();
  const buildSummary = [
    ...build.perks.map((choice) => `P:${choice.name}`),
    ...build.gambits.map((choice) => `G:${choice.name}`),
  ].join(" | ");

  const statsKey = [
    activeRun.state,
    activeRun.floor,
    activeRun.player.hitpoints,
    hpCap,
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

  const statsHtml = `
    <div class="meter-row">
      <span>${EN.ui.stats.hp(activeRun.player.hitpoints, hpCap)}</span>
      <div class="meter"><div class="meter-fill hp" style="width:${Math.max(0, Math.min(100, hpRatio * 100)).toFixed(1)}%"></div></div>
    </div>
    <div class="meter-row">
      <span>${EN.ui.stats.xp(activeRun.player.xp, activeRun.player.nextLevelXp)}</span>
      <div class="meter"><div class="meter-fill xp" style="width:${Math.max(0, Math.min(100, xpRatio * 100)).toFixed(1)}%"></div></div>
    </div>
    <div class="stat-grid">
      <div><strong>${EN.ui.stats.floor}</strong><span>${activeRun.floor}</span></div>
      <div><strong>${EN.ui.stats.gold}</strong><span>${activeRun.player.gold}</span></div>
      <div><strong>${EN.ui.stats.level}</strong><span>${activeRun.player.level}</span></div>
      <div><strong>${EN.ui.stats.unspentStats}</strong><span>${activeRun.player.unspentStatPoints}</span></div>
      <div><strong>${EN.ui.stats.enemiesLeft}</strong><span>${activeRun.mobs.length}</span></div>
      <div><strong>${EN.ui.stats.room}</strong><span>${inShop ? EN.ui.room.shop : room ? EN.ui.room.dungeon : EN.ui.room.hall}</span></div>
      <div><strong>${EN.ui.stats.threat}</strong><span>${threatLabel}</span></div>
      <div><strong>${EN.ui.sidebar.perks}</strong><span>${build.perks.length}</span></div>
      <div><strong>${EN.ui.sidebar.gambits}</strong><span>${build.gambits.length}</span></div>
    </div>
    <details>
      <summary>${EN.ui.sidebar.buildModifiers}</summary>
      <pre>${htmlEscape(buildSummary || EN.ui.buildSummaryNone)}</pre>
    </details>
    <details data-gear ${wieldedGearOpen ? "open" : ""}>
      <summary>${EN.ui.sidebar.wieldedGear}</summary>
      <pre>${htmlEscape(activeRun.player.describeWields())}</pre>
    </details>
  `;

  const logsHtml = activeRun.logs
    .map((entry) => `<li class="log-${entry.level}">${htmlEscape(entry.text)}</li>`)
    .join("");

  return {
    inShop,
    statsKey,
    statsHtml,
    logsHtml,
  };
}
