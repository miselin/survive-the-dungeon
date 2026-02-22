import "./style.css";
import type { CombatMoment } from "./combat";
import { installDebugBridge } from "./debugBridge";
import { DungeonRun, LEVEL_UP_ATTRIBUTES, type LevelUpAttribute } from "./game";
import { bindMountedRunInputHandlers, installGlobalInputHandlers } from "./inputHandlers";
import {
  type CombatFxState,
  updateInventoryCompare as updateOverlayInventoryCompare,
} from "./overlayRenderer";
import { renderRunUi, resizeRunCanvas } from "./runRenderer";
import {
  buildSaveUrl,
  canUseShareableUrl,
  encodeSaveToken,
  extractSaveToken,
  extractSaveTokenFromSearch,
  loadRunFromToken,
  readLatestSaveToken,
  storeLatestSaveToken,
} from "./save";
import { renderMenuScreen, renderMountedRunScreen, type MountedRunScreenRefs } from "./screenRenderer";
import { EN } from "./strings/en";

type UIRefs = Omit<MountedRunScreenRefs, "newRunButton">;

const appElement = document.querySelector<HTMLDivElement>("#app");
if (!appElement) {
  throw new Error("App root not found");
}
const app = appElement;

let run: DungeonRun | null = null;
let ui: UIRefs | null = null;
let prevTime = performance.now();
let overlayCache = "";
let statsCache = "";
let logsCache = "";
let wieldedGearOpen = false;
let debugRevealMap = false;
let combatSkipAll = false;
let autosaveAccumMs = 0;
const AUTOSAVE_INTERVAL_MS = 5000;

let combatFx: CombatFxState | null = null;

const COMBAT_FX_STEP_MS = 420;

function isLevelUpAttribute(value: string): value is LevelUpAttribute {
  return LEVEL_UP_ATTRIBUTES.includes(value as LevelUpAttribute);
}

function queueCombatFx(moments: CombatMoment[]): void {
  if (moments.length === 0) {
    return;
  }

  combatFx = {
    moments,
    revealed: combatSkipAll ? moments.length : 1,
    elapsedMs: 0,
  };
  overlayCache = "";
}

function advanceCombatFx(deltaMs: number): void {
  if (!combatFx || combatSkipAll) {
    if (combatFx && combatSkipAll) {
      combatFx.revealed = combatFx.moments.length;
    }
    return;
  }

  if (combatFx.revealed >= combatFx.moments.length) {
    return;
  }

  combatFx.elapsedMs += deltaMs;
  while (combatFx.elapsedMs >= COMBAT_FX_STEP_MS && combatFx.revealed < combatFx.moments.length) {
    combatFx.elapsedMs -= COMBAT_FX_STEP_MS;
    combatFx.revealed += 1;
    overlayCache = "";
  }
}

function setRevealButtonState(): void {
  if (!ui) {
    return;
  }
  ui.revealButton.setAttribute("data-active", debugRevealMap ? "true" : "false");
  ui.revealButton.textContent = debugRevealMap ? EN.ui.buttons.hideMap : EN.ui.buttons.revealMap;
}

function invalidateOverlayCache(): void {
  overlayCache = "";
}

function setRevealMapEnabled(enabled: boolean): void {
  debugRevealMap = enabled;
  setRevealButtonState();
  invalidateOverlayCache();
  statsCache = "";
  renderUI();
}

function updateInventoryCompare(itemId: string | null): void {
  updateOverlayInventoryCompare(run, ui?.modal ?? null, itemId);
}

async function copyToClipboard(value: string): Promise<boolean> {
  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
    return false;
  }
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function persistRunSave(activeRun: DungeonRun): string {
  const token = encodeSaveToken(activeRun);
  storeLatestSaveToken(token);
  return token;
}

async function saveRunTokenAndShare(): Promise<void> {
  if (!run) {
    return;
  }

  const token = persistRunSave(run);
  const shareUrl = buildSaveUrl(token, window.location);
  const useShareUrl = canUseShareableUrl(shareUrl);
  const primaryValue = useShareUrl ? shareUrl : token;
  const copied = await copyToClipboard(primaryValue);

  const url = new URL(window.location.href);
  if (useShareUrl) {
    url.searchParams.set("save", token);
  } else {
    url.searchParams.delete("save");
  }
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);

  if (copied) {
    window.alert(
      useShareUrl ? EN.ui.saves.shareUrlCopied : EN.ui.saves.tokenCopied,
    );
    return;
  }

  window.prompt(
    useShareUrl ? EN.ui.saves.copyShareUrlPrompt : EN.ui.saves.copyTokenPrompt,
    primaryValue,
  );
}

function tryLoadRunFromTokenInput(rawValue: string): boolean {
  const token = extractSaveToken(rawValue);
  if (!token) {
    return false;
  }

  try {
    const loaded = loadRunFromToken(token);
    mountRun(loaded);
    persistRunSave(loaded);
    return true;
  } catch {
    return false;
  }
}

function promptForSaveTokenAndLoad(): void {
  const input = window.prompt(EN.ui.saves.loadPrompt, "");
  if (!input) {
    return;
  }
  if (!tryLoadRunFromTokenInput(input)) {
    window.alert(EN.ui.saves.loadFailed);
  }
}

function showMenu(): void {
  run = null;
  ui = null;
  overlayCache = "";
  statsCache = "";
  logsCache = "";
  wieldedGearOpen = false;
  debugRevealMap = false;
  combatFx = null;
  combatSkipAll = false;
  autosaveAccumMs = 0;

  const menu = renderMenuScreen(app, readLatestSaveToken() !== null);
  if (!menu) {
    return;
  }

  menu.startButton.addEventListener("click", () => {
    startRun(menu.seedInput.value);
  });

  menu.seedInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      startRun(menu.seedInput.value);
    }
  });

  menu.loadButton.addEventListener("click", () => {
    promptForSaveTokenAndLoad();
  });

  menu.resumeLatestButton.addEventListener("click", () => {
    const latest = readLatestSaveToken();
    if (!latest || !tryLoadRunFromTokenInput(latest)) {
      window.alert(EN.ui.saves.noLatestSave);
    }
  });
}

function mountRun(activeRun: DungeonRun): void {
  run = activeRun;
  overlayCache = "";
  statsCache = "";
  logsCache = "";
  wieldedGearOpen = false;
  debugRevealMap = false;
  combatFx = null;
  autosaveAccumMs = 0;

  const mountedRefs = renderMountedRunScreen(app);
  const { newRunButton, ...uiRefs } = mountedRefs;
  ui = uiRefs;

  setRevealButtonState();

  mountedRefs.seedValue.textContent = `${run.seedPhrase} (${run.seedNumber})`;

  bindMountedRunInputHandlers({
    refs: {
      saveButton: mountedRefs.saveButton,
      loadButton: mountedRefs.loadButton,
      inventoryButton: mountedRefs.inventoryButton,
      shopButton: mountedRefs.shopButton,
      revealButton: mountedRefs.revealButton,
      newRunButton,
      dpad: mountedRefs.dpad,
      modalBackdrop: mountedRefs.modalBackdrop,
      modal: mountedRefs.modal,
    },
    getRun: () => run,
    getCombatFx: () => combatFx,
    setCombatFx: (value): void => {
      combatFx = value;
    },
    setCombatSkipAll: (value): void => {
      combatSkipAll = value;
    },
    queueCombatFx,
    saveRunTokenAndShare,
    promptForSaveTokenAndLoad,
    showMenu,
    isLevelUpAttribute,
    getRevealMapEnabled: () => debugRevealMap,
    setRevealMapEnabled,
    invalidateOverlayCache,
    updateInventoryCompare,
  });

  resizeCanvas();
  renderUI();
}

function startRun(seedInput: string): void {
  mountRun(new DungeonRun(seedInput));
  if (run) {
    persistRunSave(run);
  }
}

function resizeCanvas(): void {
  if (!ui) {
    return;
  }
  resizeRunCanvas(ui.canvas);
}

function renderUI(): void {
  if (!run || !ui) {
    return;
  }

  const rendered = renderRunUi({
    run,
    refs: ui,
    revealAll: debugRevealMap,
    combatFx,
    combatSkipAll,
    overlayCache,
    statsCache,
    logsCache,
    wieldedGearOpen,
    setWieldedGearOpen: (open): void => {
      wieldedGearOpen = open;
    },
    setRevealButtonState,
  });

  overlayCache = rendered.overlayCache;
  statsCache = rendered.statsCache;
  logsCache = rendered.logsCache;
}

installGlobalInputHandlers({
  getRun: () => run,
  getCombatFx: () => combatFx,
  setCombatFx: (value): void => {
    combatFx = value;
  },
  queueCombatFx,
  saveRunTokenAndShare,
  showMenu,
  getRevealMapEnabled: () => debugRevealMap,
  setRevealMapEnabled,
  invalidateOverlayCache,
  renderUI,
  resizeCanvas,
});

function frame(now: number): void {
  const delta = now - prevTime;
  prevTime = now;

  if (run) {
    advanceCombatFx(delta);
    if (!combatFx) {
      run.tick(delta);
    }
    if (run.state === "playing") {
      autosaveAccumMs += delta;
      if (autosaveAccumMs >= AUTOSAVE_INTERVAL_MS) {
        autosaveAccumMs = 0;
        persistRunSave(run);
      }
    }
    resizeCanvas();
    renderUI();
  }

  window.requestAnimationFrame(frame);
}

installDebugBridge({
  isDev: import.meta.env.DEV,
  getRun: () => run,
  setRevealMap: setRevealMapEnabled,
  forceRender: (): void => {
    overlayCache = "";
    statsCache = "";
    logsCache = "";
    renderUI();
  },
  exportSaveToken: persistRunSave,
  importSaveToken: tryLoadRunFromTokenInput,
});

const urlToken = extractSaveTokenFromSearch(window.location.search);
if (urlToken && tryLoadRunFromTokenInput(urlToken)) {
  const cleaned = new URL(window.location.href);
  cleaned.searchParams.delete("save");
  window.history.replaceState({}, "", `${cleaned.pathname}${cleaned.search}${cleaned.hash}`);
} else {
  showMenu();
}
window.requestAnimationFrame(frame);
