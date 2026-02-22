import { useEffect, useRef, useState } from "react";
import type { CombatMoment, PlayerAction } from "./combat";
import { resizeRunCanvas } from "./canvas";
import { installDebugBridge } from "./debugBridge";
import { renderDungeonMap } from "./dungeonRenderer";
import { DungeonRun, type LevelUpAttribute, type ShopRewardChoice } from "./game";
import { installGlobalInputHandlers } from "./inputHandlers";
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
import { Dpad } from "./components/Dpad";
import { GameHeader } from "./components/GameHeader";
import { LogsPanel } from "./components/LogsPanel";
import { MenuScreen } from "./components/MenuScreen";
import { ModalLayer } from "./components/ModalLayer";
import { OverlayModal } from "./components/OverlayModal";
import type { OverlayChrome } from "./components/overlayChrome";
import { buildOverlayChrome } from "./components/overlayChrome";
import { StatsPanel } from "./components/StatsPanel";
import { buildStatsRenderMeta } from "./components/statsRenderMeta";
import { buildLogsRenderKey } from "./components/logsRenderKey";
import type { CombatFxState } from "./combatFx";

type ScreenMode = "menu" | "run";

const HIDDEN_OVERLAY_CHROME: OverlayChrome = {
  key: "hidden",
  stateText: "",
  stateClass: "state-text",
  modalHidden: true,
};

const COMBAT_FX_STEP_MS = 420;
const AUTOSAVE_INTERVAL_MS = 5000;
const DEBUG_TOOLS_ENABLED = import.meta.env.DEV;

export function App() {
  const runRef = useRef<DungeonRun | null>(null);
  const combatFxRef = useRef<CombatFxState | null>(null);
  const combatFxSnapshotRunRef = useRef<DungeonRun | null>(null);
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

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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

  const saveRunTokenAndShareRef = useRef<() => Promise<void>>(async () => {});
  const promptForSaveTokenAndLoadRef = useRef<() => void>(() => {});
  const handleCombatActionRef = useRef<(action: PlayerAction) => void>(
    () => {},
  );
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

  function queueCombatFx(
    moments: CombatMoment[],
    snapshotRun: DungeonRun | null = null,
  ): void {
    if (moments.length === 0) {
      combatFxSnapshotRunRef.current = null;
      return;
    }

    combatFxSnapshotRunRef.current = snapshotRun;
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
    combatFxSnapshotRunRef.current = null;
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
    combatFxSnapshotRunRef.current = null;
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

  function handleSaveButtonClick(): void {
    void saveRunTokenAndShare();
  }

  function handleLoadButtonClick(): void {
    promptForSaveTokenAndLoad();
  }

  function handleInventoryButtonClick(): void {
    const activeRun = runRef.current;
    if (!activeRun) {
      return;
    }
    if (activeRun.overlay.type === "inventory") {
      activeRun.closeOverlay();
      return;
    }
    activeRun.openInventory();
  }

  function handleShopButtonClick(): void {
    const activeRun = runRef.current;
    if (!activeRun) {
      return;
    }
    if (activeRun.overlay.type === "shop") {
      activeRun.closeOverlay();
      return;
    }
    activeRun.openShop();
  }

  function handleRevealButtonClick(): void {
    setRevealMap(!debugRevealMapRef.current);
  }

  function handleNewRunButtonClick(): void {
    showMenu();
  }

  function handleMovePlayer(dx: number, dy: number): void {
    const activeRun = runRef.current;
    if (!activeRun) {
      return;
    }
    activeRun.movePlayer(dx, dy);
  }

  function handleOverlayClose(): void {
    const activeRun = runRef.current;
    if (!activeRun || combatFxRef.current) {
      return;
    }
    if (activeRun.state === "dead" || activeRun.state === "won") {
      showMenu();
      return;
    }
    activeRun.closeOverlay();
  }

  function handleCombatAction(action: PlayerAction): void {
    const activeRun = runRef.current;
    if (!activeRun || combatFxRef.current) {
      return;
    }
    let snapshotRun: DungeonRun | null = null;
    if (!combatSkipAllRef.current) {
      try {
        snapshotRun = loadRunFromToken(encodeSaveToken(activeRun));
      } catch {
        snapshotRun = null;
      }
    }
    const result = activeRun.performCombat(action);
    queueCombatFx(result?.moments ?? [], snapshotRun);
  }

  function handleCombatFxSkip(): void {
    const combatFx = combatFxRef.current;
    if (!combatFx) {
      return;
    }
    combatFx.revealed = combatFx.moments.length;
    invalidateOverlayCache();
  }

  function handleCombatFxContinue(): void {
    if (!combatFxRef.current) {
      return;
    }
    combatFxRef.current = null;
    combatFxSnapshotRunRef.current = null;
    invalidateOverlayCache();
  }

  function handleCombatFxSkipAllChange(enabled: boolean): void {
    combatSkipAllRef.current = enabled;
    const combatFx = combatFxRef.current;
    if (enabled && combatFx) {
      combatFx.revealed = combatFx.moments.length;
    }
    invalidateOverlayCache();
  }

  function handleLoot(itemId: string): void {
    const activeRun = runRef.current;
    if (!activeRun || combatFxRef.current) {
      return;
    }
    activeRun.lootItem(itemId);
  }

  function handleLootAll(): void {
    const activeRun = runRef.current;
    if (!activeRun || combatFxRef.current) {
      return;
    }
    activeRun.lootAll();
    activeRun.closeOverlay();
  }

  function handleInventoryEquip(itemId: string): void {
    const activeRun = runRef.current;
    if (!activeRun || combatFxRef.current) {
      return;
    }
    activeRun.equipItem(itemId);
  }

  function handleInventoryUse(itemId: string): void {
    const activeRun = runRef.current;
    if (!activeRun || combatFxRef.current) {
      return;
    }
    activeRun.useInventoryItem(itemId);
  }

  function handleInventoryDrop(itemId: string): void {
    const activeRun = runRef.current;
    if (!activeRun || combatFxRef.current) {
      return;
    }
    activeRun.destroyInventoryItem(itemId);
  }

  function handleShopBuy(entryId: string): void {
    const activeRun = runRef.current;
    if (!activeRun || combatFxRef.current) {
      return;
    }
    activeRun.buyShopEntry(entryId);
  }

  function handleLevelUpAttribute(attr: LevelUpAttribute): void {
    const activeRun = runRef.current;
    if (!activeRun || combatFxRef.current) {
      return;
    }
    activeRun.allocateLevelUp(attr);
  }

  function handleBossPerk(choiceId: string): void {
    const activeRun = runRef.current;
    if (!activeRun || combatFxRef.current) {
      return;
    }
    activeRun.chooseBossReward("perk", choiceId);
  }

  function handleBossGambit(choiceId: string): void {
    const activeRun = runRef.current;
    if (!activeRun || combatFxRef.current) {
      return;
    }
    activeRun.chooseBossReward("gambit", choiceId);
  }

  function handleBossNone(): void {
    const activeRun = runRef.current;
    if (!activeRun || combatFxRef.current) {
      return;
    }
    activeRun.chooseBossReward("none");
  }

  function handleShopReward(choiceId: ShopRewardChoice["id"]): void {
    const activeRun = runRef.current;
    if (!activeRun || combatFxRef.current) {
      return;
    }
    activeRun.claimShopReward(choiceId);
  }

  saveRunTokenAndShareRef.current = saveRunTokenAndShare;
  promptForSaveTokenAndLoadRef.current = promptForSaveTokenAndLoad;
  handleCombatActionRef.current = handleCombatAction;
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
      onCombatAction: (action): void => {
        handleCombatActionRef.current(action);
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
    if (screenMode !== "run") {
      return;
    }
    resizeCanvasRef.current();
    renderUiRef.current();
  }, [runMountVersion, screenMode]);

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
  const panelRun = combatFxRef.current && combatFxSnapshotRunRef.current
    ? combatFxSnapshotRunRef.current
    : activeRun;

  return (
    <div key={runMountVersion}>
      <div className="game-shell">
        <GameHeader
          inventoryDisabled={inventoryDisabled}
          shopDisabled={shopDisabled}
          revealMapEnabled={revealMapEnabled}
          debugToolsEnabled={DEBUG_TOOLS_ENABLED}
          onSave={handleSaveButtonClick}
          onLoad={handleLoadButtonClick}
          onToggleInventory={handleInventoryButtonClick}
          onToggleShop={handleShopButtonClick}
          onToggleRevealMap={handleRevealButtonClick}
          onNewRun={handleNewRunButtonClick}
        />
        <main className="game-main">
          <section className="canvas-wrap">
            <canvas
              id="map-canvas"
              ref={canvasRef}
              aria-label={EN.ui.mapAriaLabel}
            />
            <Dpad onMove={handleMovePlayer} />
          </section>
          <aside className="sidebar">
            <div id="state-text" className={overlayChrome.stateClass}>
              {overlayChrome.stateText}
            </div>
            <div id="stats" className="stats">
              <StatsPanel run={panelRun} seed={runSeedLabel} />
            </div>
          </aside>
        </main>
        <section className="log-dock">
          <h2>{EN.ui.sidebar.logTitle}</h2>
          <LogsPanel logs={panelRun.logs} />
        </section>
      </div>
      <ModalLayer
        chrome={overlayChrome}
        modalRef={modalRef}
        onDismiss={handleOverlayClose}
      >
        <OverlayModal
          run={activeRun}
          combatFx={combatFxRef.current}
          combatSkipAll={combatSkipAllRef.current}
          inventoryCompareItemId={inventoryCompareItemId}
          onInventoryCompareItemChange={setInventoryCompareSelection}
          onClose={handleOverlayClose}
          onCombatAction={handleCombatAction}
          onCombatFxSkip={handleCombatFxSkip}
          onCombatFxContinue={handleCombatFxContinue}
          onCombatFxSkipAllChange={handleCombatFxSkipAllChange}
          onLoot={handleLoot}
          onLootAll={handleLootAll}
          onInventoryEquip={handleInventoryEquip}
          onInventoryUse={handleInventoryUse}
          onInventoryDrop={handleInventoryDrop}
          onShopBuy={handleShopBuy}
          onLevelUpAttribute={handleLevelUpAttribute}
          onBossPerk={handleBossPerk}
          onBossGambit={handleBossGambit}
          onBossNone={handleBossNone}
          onShopReward={handleShopReward}
        />
      </ModalLayer>
    </div>
  );
}
