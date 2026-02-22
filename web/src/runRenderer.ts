import { renderDungeonMap } from "./dungeonRenderer";
import type { DungeonRun } from "./game";
import { renderOverlayIntoDom, type CombatFxState } from "./overlayRenderer";
import type { MountedRunScreenRefs } from "./screenRenderer";
import { buildStatsSidebarView } from "./statsRenderer";

type UIRefs = Omit<MountedRunScreenRefs, "newRunButton">;

type RenderRunUiOptions = {
  run: DungeonRun;
  refs: UIRefs;
  revealAll: boolean;
  combatFx: CombatFxState | null;
  combatSkipAll: boolean;
  overlayCache: string;
  statsCache: string;
  logsCache: string;
  wieldedGearOpen: boolean;
  setWieldedGearOpen: (open: boolean) => void;
  setRevealButtonState: () => void;
};

export type RenderRunUiResult = {
  overlayCache: string;
  statsCache: string;
  logsCache: string;
};

export function resizeRunCanvas(canvas: HTMLCanvasElement): void {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  const targetWidth = Math.max(640, Math.floor(rect.width * dpr));
  const targetHeight = Math.max(420, Math.floor(rect.height * dpr));

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }
}

export function renderRunUi(options: RenderRunUiOptions): RenderRunUiResult {
  renderDungeonMap({
    run: options.run,
    canvas: options.refs.canvas,
    revealAll: options.revealAll,
  });

  const statsView = buildStatsSidebarView(options.run, options.wieldedGearOpen);
  options.refs.shopButton.disabled = !statsView.inShop || options.run.state !== "playing";
  options.refs.inventoryButton.disabled = options.run.state !== "playing";
  options.setRevealButtonState();

  let nextStatsCache = options.statsCache;
  let nextLogsCache = options.logsCache;

  if (statsView.statsKey !== options.statsCache) {
    nextStatsCache = statsView.statsKey;
    options.refs.stats.innerHTML = statsView.statsHtml;

    const gearDetails = options.refs.stats.querySelector<HTMLDetailsElement>("details[data-gear]");
    if (gearDetails) {
      gearDetails.addEventListener("toggle", () => {
        options.setWieldedGearOpen(gearDetails.open);
      });
    }
  }

  if (statsView.logsHtml !== options.logsCache) {
    nextLogsCache = statsView.logsHtml;
    options.refs.logs.innerHTML = statsView.logsHtml;
  }

  const nextOverlayCache = renderOverlayIntoDom({
    run: options.run,
    combatFx: options.combatFx,
    combatSkipAll: options.combatSkipAll,
    previousKey: options.overlayCache,
    refs: {
      stateText: options.refs.stateText,
      modalBackdrop: options.refs.modalBackdrop,
      modal: options.refs.modal,
    },
  });

  return {
    overlayCache: nextOverlayCache,
    statsCache: nextStatsCache,
    logsCache: nextLogsCache,
  };
}
