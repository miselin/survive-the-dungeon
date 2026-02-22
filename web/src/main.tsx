import "./style.css";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import type { CombatMoment } from "./combat";
import { MenuScreen } from "./components/MenuScreen";
import { LogsPanel, buildLogsRenderKey } from "./components/LogsPanel";
import {
  OverlayModal,
  buildOverlayChrome,
  type OverlayChrome,
} from "./components/OverlayModal";
import { StatsPanel, buildStatsRenderMeta } from "./components/StatsPanel";
import type { CombatFxState } from "./combatFx";
import { resizeRunCanvas } from "./canvas";
import { installDebugBridge } from "./debugBridge";
import { renderDungeonMap } from "./dungeonRenderer";
import { DungeonRun, LEVEL_UP_ATTRIBUTES, type LevelUpAttribute } from "./game";
import {
  bindMountedRunInputHandlers,
  installGlobalInputHandlers,
} from "./inputHandlers";
import { applySavedWindowPosition } from "./modalWindowPosition";
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
import { EN } from "./strings/en";

type ScreenMode = "menu" | "run";

type RunButtonRefs = {
  saveButton: HTMLButtonElement;
  loadButton: HTMLButtonElement;
  inventoryButton: HTMLButtonElement;
  shopButton: HTMLButtonElement;
  revealButton?: HTMLButtonElement | null;
  newRunButton: HTMLButtonElement;
  dpad: HTMLDivElement;
  modalBackdrop: HTMLDivElement;
  modal: HTMLDivElement;
};

const HIDDEN_OVERLAY_CHROME: OverlayChrome = {
  key: "hidden",
  stateText: "",
  stateClass: "state-text",
  modalHidden: true,
};

const COMBAT_FX_STEP_MS = 420;
const AUTOSAVE_INTERVAL_MS = 5000;
const DEBUG_TOOLS_ENABLED = import.meta.env.DEV;

function isLevelUpAttribute(value: string): value is LevelUpAttribute {
  return LEVEL_UP_ATTRIBUTES.includes(value as LevelUpAttribute);
}

function App() {
  const runRef = useRef<DungeonRun | null>(null);
  const combatFxRef = useRef<CombatFxState | null>(null);
  const combatSkipAllRef = useRef(false);
  const debugRevealMapRef = useRef(false);
  const autosaveAccumMsRef = useRef(0);
  const prevFrameTimeRef = useRef(performance.now());

  const overlayCacheRef = useRef("");
  const statsCacheRef = useRef("");
  const logsCacheRef = useRef("");

  const inventoryDisabledRef = useRef(true);
  const shopDisabledRef = useRef(true);
  const inventoryCompareItemIdRef = useRef<string | null>(null);

  const saveButtonRef = useRef<HTMLButtonElement | null>(null);
  const loadButtonRef = useRef<HTMLButtonElement | null>(null);
  const inventoryButtonRef = useRef<HTMLButtonElement | null>(null);
  const shopButtonRef = useRef<HTMLButtonElement | null>(null);
  const revealButtonRef = useRef<HTMLButtonElement | null>(null);
  const newRunButtonRef = useRef<HTMLButtonElement | null>(null);
  const dpadRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modalBackdropRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const frameRequestRef = useRef<number | null>(null);

  const [screenMode, setScreenMode] = useState<ScreenMode>("menu");
  const [menuSeedInput, setMenuSeedInput] = useState("");
  const [hasLatestSave, setHasLatestSave] = useState(
    () => readLatestSaveToken() !== null,
  );
  const [runSeedLabel, setRunSeedLabel] = useState("");
  const [revealMapEnabled, setRevealMapEnabled] = useState(false);
  const [inventoryDisabled, setInventoryDisabled] = useState(true);
  const [shopDisabled, setShopDisabled] = useState(true);
  const [overlayChrome, setOverlayChrome] = useState<OverlayChrome>(
    HIDDEN_OVERLAY_CHROME,
  );
  const [runMountVersion, setRunMountVersion] = useState(0);
  const [inventoryCompareItemId, setInventoryCompareItemId] = useState<
    string | null
  >(null);
  const [, setUiTick] = useState(0);

  const queueCombatFxRef = useRef<(moments: CombatMoment[]) => void>(() => {});
  const saveRunTokenAndShareRef = useRef<() => Promise<void>>(async () => {});
  const promptForSaveTokenAndLoadRef = useRef<() => void>(() => {});
  const showMenuRef = useRef<() => void>(() => {});
  const setRevealMapEnabledRef = useRef<(enabled: boolean) => void>(() => {});
  const invalidateOverlayCacheRef = useRef<() => void>(() => {});
  const renderUiRef = useRef<() => void>(() => {});
  const resizeCanvasRef = useRef<() => void>(() => {});
  const persistRunSaveRef = useRef<(activeRun: DungeonRun) => string>(() => "");
  const tryLoadRunFromTokenInputRef = useRef<(rawValue: string) => boolean>(
    () => false,
  );

  function resetRenderCaches(): void {
    overlayCacheRef.current = "";
    statsCacheRef.current = "";
    logsCacheRef.current = "";
  }

  function invalidateOverlayCache(): void {
    overlayCacheRef.current = "";
  }

  function setInventoryCompareSelection(itemId: string | null): void {
    if (inventoryCompareItemIdRef.current === itemId) {
      return;
    }
    inventoryCompareItemIdRef.current = itemId;
    setInventoryCompareItemId(itemId);
  }

  function resizeCanvas(): void {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    resizeRunCanvas(canvas);
  }

  function renderUi(): void {
    const activeRun = runRef.current;
    if (!activeRun) {
      return;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      resizeRunCanvas(canvas);
      renderDungeonMap({
        run: activeRun,
        canvas,
        revealAll: debugRevealMapRef.current,
      });
    }

    let shouldTickUi = false;

    const statsMeta = buildStatsRenderMeta(activeRun);
    const nextInventoryDisabled = activeRun.state !== "playing";
    const nextShopDisabled = !statsMeta.inShop || activeRun.state !== "playing";

    if (nextInventoryDisabled !== inventoryDisabledRef.current) {
      inventoryDisabledRef.current = nextInventoryDisabled;
      setInventoryDisabled(nextInventoryDisabled);
    }

    if (nextShopDisabled !== shopDisabledRef.current) {
      shopDisabledRef.current = nextShopDisabled;
      setShopDisabled(nextShopDisabled);
    }

    if (statsMeta.statsKey !== statsCacheRef.current) {
      statsCacheRef.current = statsMeta.statsKey;
      shouldTickUi = true;
    }

    const logsKey = buildLogsRenderKey(activeRun.logs);
    if (logsKey !== logsCacheRef.current) {
      logsCacheRef.current = logsKey;
      shouldTickUi = true;
    }

    const nextOverlayChrome = buildOverlayChrome(
      activeRun,
      combatFxRef.current,
      combatSkipAllRef.current,
    );
    if (nextOverlayChrome.key !== overlayCacheRef.current) {
      overlayCacheRef.current = nextOverlayChrome.key;
      setOverlayChrome(nextOverlayChrome);
    }

    if (activeRun.overlay.type !== "inventory") {
      setInventoryCompareSelection(null);
    }

    if (shouldTickUi) {
      setUiTick((value) => value + 1);
    }
  }

  function setRevealMap(enabled: boolean): void {
    debugRevealMapRef.current = enabled;
    setRevealMapEnabled(enabled);
    invalidateOverlayCache();
    statsCacheRef.current = "";
    renderUi();
  }

  function queueCombatFx(moments: CombatMoment[]): void {
    if (moments.length === 0) {
      return;
    }

    combatFxRef.current = {
      moments,
      revealed: combatSkipAllRef.current ? moments.length : 1,
      elapsedMs: 0,
    };
    overlayCacheRef.current = "";
  }

  function advanceCombatFx(deltaMs: number): void {
    const combatFx = combatFxRef.current;
    if (!combatFx || combatSkipAllRef.current) {
      if (combatFx && combatSkipAllRef.current) {
        combatFx.revealed = combatFx.moments.length;
      }
      return;
    }

    if (combatFx.revealed >= combatFx.moments.length) {
      return;
    }

    combatFx.elapsedMs += deltaMs;
    while (
      combatFx.elapsedMs >= COMBAT_FX_STEP_MS &&
      combatFx.revealed < combatFx.moments.length
    ) {
      combatFx.elapsedMs -= COMBAT_FX_STEP_MS;
      combatFx.revealed += 1;
      overlayCacheRef.current = "";
    }
  }

  function updateInventoryCompare(itemId: string | null): void {
    setInventoryCompareSelection(itemId);
  }

  async function copyToClipboard(value: string): Promise<boolean> {
    if (
      !navigator.clipboard ||
      typeof navigator.clipboard.writeText !== "function"
    ) {
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
    const activeRun = runRef.current;
    if (!activeRun) {
      return;
    }

    const token = persistRunSave(activeRun);
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
    window.history.replaceState(
      {},
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );

    if (copied) {
      window.alert(
        useShareUrl ? EN.ui.saves.shareUrlCopied : EN.ui.saves.tokenCopied,
      );
      return;
    }

    window.prompt(
      useShareUrl
        ? EN.ui.saves.copyShareUrlPrompt
        : EN.ui.saves.copyTokenPrompt,
      primaryValue,
    );
  }

  function mountRun(activeRun: DungeonRun): void {
    runRef.current = activeRun;
    resetRenderCaches();
    combatFxRef.current = null;
    combatSkipAllRef.current = false;
    autosaveAccumMsRef.current = 0;
    debugRevealMapRef.current = false;

    setRevealMapEnabled(false);
    setRunSeedLabel(`${activeRun.seedPhrase} (${activeRun.seedNumber})`);
    setOverlayChrome(HIDDEN_OVERLAY_CHROME);
    setInventoryCompareSelection(null);

    const nextInventoryDisabled = activeRun.state !== "playing";
    inventoryDisabledRef.current = nextInventoryDisabled;
    setInventoryDisabled(nextInventoryDisabled);

    shopDisabledRef.current = true;
    setShopDisabled(true);

    setScreenMode("run");
    setRunMountVersion((value) => value + 1);
  }

  function startRun(seedInput: string): void {
    mountRun(new DungeonRun(seedInput));
    const activeRun = runRef.current;
    if (activeRun) {
      persistRunSave(activeRun);
    }
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
    runRef.current = null;
    combatFxRef.current = null;
    combatSkipAllRef.current = false;
    debugRevealMapRef.current = false;
    autosaveAccumMsRef.current = 0;

    resetRenderCaches();

    inventoryDisabledRef.current = true;
    shopDisabledRef.current = true;

    setInventoryDisabled(true);
    setShopDisabled(true);
    setOverlayChrome(HIDDEN_OVERLAY_CHROME);
    setInventoryCompareSelection(null);
    setRevealMapEnabled(false);
    setHasLatestSave(readLatestSaveToken() !== null);
    setMenuSeedInput("");
    setScreenMode("menu");
  }

  queueCombatFxRef.current = queueCombatFx;
  saveRunTokenAndShareRef.current = saveRunTokenAndShare;
  promptForSaveTokenAndLoadRef.current = promptForSaveTokenAndLoad;
  showMenuRef.current = showMenu;
  setRevealMapEnabledRef.current = setRevealMap;
  invalidateOverlayCacheRef.current = invalidateOverlayCache;
  renderUiRef.current = renderUi;
  resizeCanvasRef.current = resizeCanvas;
  persistRunSaveRef.current = persistRunSave;
  tryLoadRunFromTokenInputRef.current = tryLoadRunFromTokenInput;

  useEffect(() => {
    installGlobalInputHandlers({
      getRun: () => runRef.current,
      getCombatFx: () => combatFxRef.current,
      setCombatFx: (value): void => {
        combatFxRef.current = value;
      },
      queueCombatFx: (moments): void => {
        queueCombatFxRef.current(moments);
      },
      saveRunTokenAndShare: () => saveRunTokenAndShareRef.current(),
      showMenu: () => showMenuRef.current(),
      getRevealMapEnabled: () => debugRevealMapRef.current,
      setRevealMapEnabled: (enabled): void => {
        setRevealMapEnabledRef.current(enabled);
      },
      invalidateOverlayCache: () => invalidateOverlayCacheRef.current(),
      renderUI: () => renderUiRef.current(),
      resizeCanvas: () => resizeCanvasRef.current(),
      getModal: () => modalRef.current,
      debugToolsEnabled: DEBUG_TOOLS_ENABLED,
    });
  }, []);

  useEffect(() => {
    installDebugBridge({
      isDev: DEBUG_TOOLS_ENABLED,
      getRun: () => runRef.current,
      setRevealMap: (enabled): void => {
        setRevealMapEnabledRef.current(enabled);
      },
      forceRender: (): void => {
        resetRenderCaches();
        renderUiRef.current();
      },
      exportSaveToken: (activeRun) => persistRunSaveRef.current(activeRun),
      importSaveToken: (rawValue) =>
        tryLoadRunFromTokenInputRef.current(rawValue),
    });
  }, []);

  useEffect(() => {
    const refs: RunButtonRefs | null =
      saveButtonRef.current &&
      loadButtonRef.current &&
      inventoryButtonRef.current &&
      shopButtonRef.current &&
      newRunButtonRef.current &&
      dpadRef.current &&
      modalBackdropRef.current &&
      modalRef.current
        ? {
            saveButton: saveButtonRef.current,
            loadButton: loadButtonRef.current,
            inventoryButton: inventoryButtonRef.current,
            shopButton: shopButtonRef.current,
            revealButton: revealButtonRef.current,
            newRunButton: newRunButtonRef.current,
            dpad: dpadRef.current,
            modalBackdrop: modalBackdropRef.current,
            modal: modalRef.current,
          }
        : null;

    if (screenMode !== "run" || !refs) {
      return;
    }

    bindMountedRunInputHandlers({
      refs,
      getRun: () => runRef.current,
      getCombatFx: () => combatFxRef.current,
      setCombatFx: (value): void => {
        combatFxRef.current = value;
      },
      setCombatSkipAll: (value): void => {
        combatSkipAllRef.current = value;
      },
      queueCombatFx: (moments): void => {
        queueCombatFxRef.current(moments);
      },
      saveRunTokenAndShare: () => saveRunTokenAndShareRef.current(),
      promptForSaveTokenAndLoad: () => promptForSaveTokenAndLoadRef.current(),
      showMenu: () => showMenuRef.current(),
      isLevelUpAttribute,
      getRevealMapEnabled: () => debugRevealMapRef.current,
      setRevealMapEnabled: (enabled): void => {
        setRevealMapEnabledRef.current(enabled);
      },
      invalidateOverlayCache: () => invalidateOverlayCacheRef.current(),
      updateInventoryCompare,
      debugToolsEnabled: DEBUG_TOOLS_ENABLED,
    });

    resizeCanvasRef.current();
    renderUiRef.current();
  }, [runMountVersion, screenMode]);

  useEffect(() => {
    if (screenMode !== "run") {
      return;
    }

    const modal = modalRef.current;
    if (!modal) {
      return;
    }

    if (overlayChrome.windowKey) {
      modal.dataset.windowKey = overlayChrome.windowKey;
    } else {
      delete modal.dataset.windowKey;
    }

    applySavedWindowPosition(
      modal,
      overlayChrome.modalHidden ? null : (overlayChrome.windowKey ?? null),
    );
  }, [
    screenMode,
    overlayChrome.modalHidden,
    overlayChrome.windowKey,
  ]);

  useEffect(() => {
    const frame = (now: number): void => {
      const delta = now - prevFrameTimeRef.current;
      prevFrameTimeRef.current = now;

      const activeRun = runRef.current;
      if (activeRun) {
        advanceCombatFx(delta);
        if (!combatFxRef.current) {
          activeRun.tick(delta);
        }

        if (activeRun.state === "playing") {
          autosaveAccumMsRef.current += delta;
          if (autosaveAccumMsRef.current >= AUTOSAVE_INTERVAL_MS) {
            autosaveAccumMsRef.current = 0;
            persistRunSaveRef.current(activeRun);
          }
        }

        renderUiRef.current();
      }

      frameRequestRef.current = window.requestAnimationFrame(frame);
    };

    prevFrameTimeRef.current = performance.now();
    frameRequestRef.current = window.requestAnimationFrame(frame);

    return () => {
      if (frameRequestRef.current !== null) {
        window.cancelAnimationFrame(frameRequestRef.current);
      }
      frameRequestRef.current = null;
    };
  }, []);

  useEffect(() => {
    const urlToken = extractSaveTokenFromSearch(window.location.search);
    if (urlToken && tryLoadRunFromTokenInputRef.current(urlToken)) {
      const cleaned = new URL(window.location.href);
      cleaned.searchParams.delete("save");
      window.history.replaceState(
        {},
        "",
        `${cleaned.pathname}${cleaned.search}${cleaned.hash}`,
      );
      return;
    }

    showMenuRef.current();
  }, []);

  if (screenMode === "menu") {
    return (
      <MenuScreen
        seedInput={menuSeedInput}
        hasLatestSave={hasLatestSave}
        onSeedInputChange={setMenuSeedInput}
        onStart={() => {
          startRun(menuSeedInput);
        }}
        onLoad={() => {
          promptForSaveTokenAndLoad();
        }}
        onResumeLatest={() => {
          const latest = readLatestSaveToken();
          if (!latest || !tryLoadRunFromTokenInput(latest)) {
            window.alert(EN.ui.saves.noLatestSave);
          }
        }}
      />
    );
  }

  const activeRun = runRef.current;
  if (!activeRun) {
    return null;
  }

  return (
    <div key={runMountVersion}>
      <div className="game-shell">
        <header className="game-header">
          <div>
            <h1>{EN.ui.appTitle}</h1>
          </div>
          <div className="header-actions">
            <button id="save-btn" ref={saveButtonRef} type="button">
              {EN.ui.buttons.save}
            </button>
            <button id="load-btn" ref={loadButtonRef} type="button">
              {EN.ui.buttons.load}
            </button>
            <button
              id="inventory-btn"
              ref={inventoryButtonRef}
              type="button"
              disabled={inventoryDisabled}
            >
              {EN.ui.buttons.inventory}
            </button>
            <button
              id="shop-btn"
              ref={shopButtonRef}
              type="button"
              disabled={shopDisabled}
            >
              {EN.ui.buttons.shop}
            </button>
            {DEBUG_TOOLS_ENABLED ? (
              <button
                id="reveal-map-btn"
                ref={revealButtonRef}
                type="button"
                data-active={revealMapEnabled ? "true" : "false"}
              >
                {revealMapEnabled
                  ? EN.ui.buttons.hideMap
                  : EN.ui.buttons.revealMap}
              </button>
            ) : null}
            <button id="new-run-btn" ref={newRunButtonRef} type="button">
              {EN.ui.buttons.newRun}
            </button>
          </div>
        </header>
        <main className="game-main">
          <section className="canvas-wrap">
            <canvas
              id="map-canvas"
              ref={canvasRef}
              aria-label={EN.ui.mapAriaLabel}
            />
            <div className="dpad" id="dpad" ref={dpadRef}>
              <button data-move="up" type="button">
                &#9650;
              </button>
              <div className="dpad-middle">
                <button data-move="left" type="button">
                  &#9664;
                </button>
                <button data-move="down" type="button">
                  &#9660;
                </button>
                <button data-move="right" type="button">
                  &#9654;
                </button>
              </div>
            </div>
          </section>
          <aside className="sidebar">
            <div id="state-text" className={overlayChrome.stateClass}>
              {overlayChrome.stateText}
            </div>
            <div id="stats" className="stats">
              <StatsPanel run={activeRun} seed={runSeedLabel} />
            </div>
          </aside>
        </main>
        <section className="log-dock">
          <h2>{EN.ui.sidebar.logTitle}</h2>
          <LogsPanel logs={activeRun.logs} />
        </section>
      </div>
      <div
        id="modal-backdrop"
        ref={modalBackdropRef}
        className={
          overlayChrome.modalHidden ? "modal-backdrop hidden" : "modal-backdrop"
        }
      >
        <div
          id="modal"
          ref={modalRef}
          className={
            overlayChrome.modalClass
              ? `modal ${overlayChrome.modalClass}`
              : "modal"
          }
          role="dialog"
          aria-modal="true"
        >
          <OverlayModal
            run={activeRun}
            combatFx={combatFxRef.current}
            combatSkipAll={combatSkipAllRef.current}
            inventoryCompareItemId={inventoryCompareItemId}
          />
        </div>
      </div>
    </div>
  );
}

const appElement = document.querySelector<HTMLDivElement>("#app");
if (!appElement) {
  throw new Error("App root not found");
}

createRoot(appElement).render(<App />);
