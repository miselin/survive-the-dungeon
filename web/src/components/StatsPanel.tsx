import type { DungeonRun } from "../game";
import { EN } from "../strings/en";
import { ROOM_SHOP } from "../types";

type StatsPanelProps = {
  run: DungeonRun;
  seed: string;
};

export function StatsPanel(props: StatsPanelProps) {
  const activeRun = props.run;
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
  const xpRatio =
    activeRun.player.xp / Math.max(1, activeRun.player.nextLevelXp);
  const build = activeRun.currentBuild();
  const buildSummary = [
    ...build.perks.map((choice) => `P:${choice.name}`),
    ...build.gambits.map((choice) => `G:${choice.name}`),
  ].join(" | ");

  return (
    <>
      <div className="meter-row">
        <span>{EN.ui.stats.hp(activeRun.player.hitpoints, hpCap)}</span>
        <div className="meter">
          <div
            className="meter-fill hp"
            style={{
              width: `${Math.max(0, Math.min(100, hpRatio * 100)).toFixed(1)}%`,
            }}
          />
        </div>
      </div>
      <div className="meter-row">
        <span>
          {EN.ui.stats.xp(activeRun.player.xp, activeRun.player.nextLevelXp)}
        </span>
        <div className="meter">
          <div
            className="meter-fill xp"
            style={{
              width: `${Math.max(0, Math.min(100, xpRatio * 100)).toFixed(1)}%`,
            }}
          />
        </div>
      </div>
      <div className="stat-grid">
        <div>
          <strong>{EN.ui.stats.floor}</strong>
          <span>{activeRun.floor}</span>
        </div>
        <div>
          <strong>{EN.ui.stats.gold}</strong>
          <span>{activeRun.player.gold}</span>
        </div>
        <div>
          <strong>{EN.ui.stats.level}</strong>
          <span>{activeRun.player.level}</span>
        </div>
        <div>
          <strong>{EN.ui.stats.unspentStats}</strong>
          <span>{activeRun.player.unspentStatPoints}</span>
        </div>
        <div>
          <strong>{EN.ui.stats.enemiesLeft}</strong>
          <span>{activeRun.mobs.length}</span>
        </div>
        <div>
          <strong>{EN.ui.stats.room}</strong>
          <span>
            {inShop
              ? EN.ui.room.shop
              : room
                ? EN.ui.room.dungeon
                : EN.ui.room.hall}
          </span>
        </div>
        <div>
          <strong>{EN.ui.stats.threat}</strong>
          <span>{threatLabel}</span>
        </div>
        <div>
          <strong>{EN.ui.sidebar.perks}</strong>
          <span>{build.perks.length}</span>
        </div>
        <div>
          <strong>{EN.ui.sidebar.gambits}</strong>
          <span>{build.gambits.length}</span>
        </div>
      </div>
      <details>
        <summary>{EN.ui.sidebar.buildModifiers}</summary>
        <pre>{buildSummary || EN.ui.buildSummaryNone}</pre>
      </details>
      <details data-gear>
        <summary>{EN.ui.sidebar.wieldedGear}</summary>
        <ul className="item-list inventory">
          {activeRun.player.getWields().map(({ slot, item }) => (
            <li key={slot}>
              <div>
                <strong>
                  {item.name} at {slot}
                </strong>
                <span>{item.describe()}</span>
              </div>
            </li>
          ))}
        </ul>
      </details>

      <p className="seed-label">
        {EN.ui.seedPrefix}: <span id="seed-value">{props.seed}</span>
      </p>
    </>
  );
}
