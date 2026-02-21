import "./style.css";
import { describeHealChoice, type CombatMoment } from "./combat";
import { installDebugBridge } from "./debugBridge";
import { DungeonRun, LEVEL_UP_ATTRIBUTES, type BuildChoice, type LevelUpAttribute } from "./game";
import { Weapon, WieldableItem } from "./items";
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
import { allSpritesReady, drawSheetSprite, SPRITE_IDS } from "./sprites";
import { EN } from "./strings/en";
import { ROOM_BOSS, ROOM_SHOP, ROOM_START, TileType } from "./types";
import type { Position } from "./types";

type UIRefs = {
  root: HTMLDivElement;
  canvas: HTMLCanvasElement;
  stats: HTMLDivElement;
  logs: HTMLUListElement;
  seedValue: HTMLSpanElement;
  stateText: HTMLDivElement;
  saveButton: HTMLButtonElement;
  loadButton: HTMLButtonElement;
  shopButton: HTMLButtonElement;
  inventoryButton: HTMLButtonElement;
  revealButton: HTMLButtonElement;
  dpad: HTMLDivElement;
  modalBackdrop: HTMLDivElement;
  modal: HTMLDivElement;
};

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

type CombatFxState = {
  moments: CombatMoment[];
  revealed: number;
  elapsedMs: number;
};

let combatFx: CombatFxState | null = null;

const COMBAT_FX_STEP_MS = 420;

function isLevelUpAttribute(value: string): value is LevelUpAttribute {
  return LEVEL_UP_ATTRIBUTES.includes(value as LevelUpAttribute);
}

function htmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function signed(num: number): string {
  return num > 0 ? `+${num}` : `${num}`;
}

function signedFixed(num: number, precision: number): string {
  const abs = Math.abs(num).toFixed(precision);
  if (num > 0) {
    return `+${abs}`;
  }
  if (num < 0) {
    return `-${abs}`;
  }
  return abs;
}

function parseDiceAverage(dice: string): number | null {
  const match = /^(\d+)\s*d\s*(\d+)(?:\s*([+-])\s*(\d+))?$/.exec(dice.trim());
  if (!match) {
    return null;
  }
  const count = Number(match[1]);
  const sides = Number(match[2]);
  const sign = match[3] ?? "+";
  const modifierAbs = match[4] ? Number(match[4]) : 0;
  const modifier = sign === "-" ? -modifierAbs : modifierAbs;
  if (!Number.isFinite(count) || !Number.isFinite(sides) || count <= 0 || sides <= 0) {
    return null;
  }
  return (count * ((sides + 1) / 2)) + modifier;
}

function deltaClass(delta: number, preferLower = false): string {
  const scored = preferLower ? -delta : delta;
  if (scored > 0) {
    return "delta-pos";
  }
  if (scored < 0) {
    return "delta-neg";
  }
  return "delta-neutral";
}

function comparisonRow(
  label: string,
  currentValue: string,
  newValue: string,
  deltaValue: number,
  preferLower = false,
  deltaPrecision = 0,
): string {
  return `
    <tr>
      <td>${htmlEscape(label)}</td>
      <td>${htmlEscape(currentValue)}</td>
      <td>${htmlEscape(newValue)}</td>
      <td><span class="${deltaClass(deltaValue, preferLower)}">${signedFixed(deltaValue, deltaPrecision)}</span></td>
    </tr>
  `;
}

function emptyComparisonPanel(): string {
  return `<p class="hint">${htmlEscape(EN.ui.compare.hoverHint)}</p>`;
}

function renderBuildChoices(choices: BuildChoice[], action: "boss-perk" | "boss-gambit"): string {
  return choices
    .map((choice) => `
      <li>
        <div>
          <strong>${htmlEscape(choice.name)}</strong>
          <span>${htmlEscape(choice.description)}</span>
        </div>
        <button data-action="${action}" data-id="${choice.id}" type="button">${EN.ui.buttons.pick}</button>
      </li>
    `)
    .join("");
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

function renderCombatMoment(moment: CombatMoment): string {
  if (moment.type === "roll") {
    const phaseLabel = moment.phase === "flee"
      ? EN.ui.combatFxMoments.phaseLabel.flee
      : moment.phase === "crit-check"
        ? EN.ui.combatFxMoments.phaseLabel.critCheck
        : moment.phase === "crit-confirm"
          ? EN.ui.combatFxMoments.phaseLabel.critConfirm
          : EN.ui.combatFxMoments.phaseLabel.toHit;
    const verdict = moment.success ? EN.ui.combatFxMoments.verdictSuccess : EN.ui.combatFxMoments.verdictFail;
    const verdictClass = moment.success ? "fx-good" : "fx-bad";

    return `
      <li class="fx-row">
        <div class="fx-die">d20 ${moment.roll}</div>
        <div class="fx-details">
          <strong>${htmlEscape(moment.actor)} ${phaseLabel}</strong>
          <span>${moment.roll} + ${moment.bonus} = ${moment.total} vs ${moment.target} (${htmlEscape(moment.defender)})</span>
          <span class="${verdictClass}">${verdict}</span>
        </div>
      </li>
    `;
  }

  if (moment.type === "damage") {
    return `
      <li class="fx-row">
        <div class="fx-die">${htmlEscape(moment.dice)} ${moment.roll}</div>
        <div class="fx-details">
          <strong>${htmlEscape(EN.ui.combatFxMoments.damageRollTitle(moment.actor))}</strong>
          <span>${htmlEscape(EN.ui.combatFxMoments.damageRollDetail(moment.roll, moment.multiplier, moment.final, moment.defender, moment.remainingHp))}</span>
        </div>
      </li>
    `;
  }

  if (moment.type === "heal") {
    return `
      <li class="fx-row">
        <div class="fx-die">+${moment.amount}</div>
        <div class="fx-details">
          <strong>${htmlEscape(EN.ui.combatFxMoments.healTitle(moment.actor))}</strong>
          <span>${htmlEscape(EN.ui.combatFxMoments.healDetail(moment.item, moment.amount))}</span>
        </div>
      </li>
    `;
  }

  const textClass = moment.level === "warn" ? "fx-bad" : moment.level === "success" ? "fx-good" : "";
  return `
    <li class="fx-row">
      <div class="fx-details">
        <strong class="${textClass}">${htmlEscape(moment.text)}</strong>
      </div>
    </li>
  `;
}

function buildEquipComparison(activeRun: DungeonRun, itemId: string): string {
  const picked = activeRun.inventoryItems().find((entry) => entry.item.id === itemId);
  if (!picked || !(picked.item instanceof WieldableItem)) {
    return emptyComparisonPanel();
  }

  const item = picked.item;
  const slot = item.wieldsAt();
  const current = activeRun.player.wieldpoints[slot];

  const currentAtk = current?.getAttackBonus() ?? 0;
  const currentDef = current?.getDefenseBonus() ?? 0;
  const newAtk = item.getAttackBonus();
  const newDef = item.getDefenseBonus();

  const rows = [
    comparisonRow(EN.ui.compare.atkBonus, signed(currentAtk), signed(newAtk), newAtk - currentAtk),
    comparisonRow(EN.ui.compare.defBonus, signed(currentDef), signed(newDef), newDef - currentDef),
  ];

  const currentWeapon = current instanceof Weapon ? current : null;
  const nextWeapon = item instanceof Weapon ? item : null;

  if (nextWeapon || currentWeapon) {
    const currentDice = currentWeapon?.damage() ?? EN.ui.compare.empty.toLowerCase();
    const nextDice = nextWeapon?.damage() ?? EN.ui.compare.empty.toLowerCase();
    const currentAvg = currentWeapon ? parseDiceAverage(currentDice) ?? 0 : 0;
    const nextAvg = nextWeapon ? parseDiceAverage(nextDice) ?? 0 : 0;

    rows.push(comparisonRow(EN.ui.compare.damageAvg, currentAvg.toFixed(1), nextAvg.toFixed(1), nextAvg - currentAvg, false, 1));
    rows.push(comparisonRow(
      EN.ui.compare.critRangeStart,
      currentWeapon ? `${currentWeapon.criticalRange()}` : EN.ui.compare.empty.toLowerCase(),
      nextWeapon ? `${nextWeapon.criticalRange()}` : EN.ui.compare.empty.toLowerCase(),
      (nextWeapon?.criticalRange() ?? 20) - (currentWeapon?.criticalRange() ?? 20),
      true,
    ));
    rows.push(comparisonRow(
      EN.ui.compare.critMult,
      currentWeapon ? `${currentWeapon.criticalMultiplier()}` : EN.ui.compare.empty.toLowerCase(),
      nextWeapon ? `${nextWeapon.criticalMultiplier()}` : EN.ui.compare.empty.toLowerCase(),
      (nextWeapon?.criticalMultiplier() ?? 1) - (currentWeapon?.criticalMultiplier() ?? 1),
    ));
  }

  return `
    <div class="compare-title">
      <strong>${htmlEscape(item.name)}</strong>
      <span>${htmlEscape(EN.ui.compare.slot)}: ${htmlEscape(slot)}</span>
      <span>${htmlEscape(EN.ui.compare.current)}: ${htmlEscape(current ? current.name : EN.ui.compare.empty)}</span>
    </div>
    <table class="compare-table">
      <thead>
        <tr>
          <th>${EN.ui.compare.stat}</th>
          <th>${EN.ui.compare.current}</th>
          <th>${EN.ui.compare.candidate}</th>
          <th>${EN.ui.compare.delta}</th>
        </tr>
      </thead>
      <tbody>${rows.join("")}</tbody>
    </table>
  `;
}

function setRevealButtonState(): void {
  if (!ui) {
    return;
  }
  ui.revealButton.setAttribute("data-active", debugRevealMap ? "true" : "false");
  ui.revealButton.textContent = debugRevealMap ? EN.ui.buttons.hideMap : EN.ui.buttons.revealMap;
}

function updateInventoryCompare(itemId: string | null): void {
  if (!run || !ui || run.overlay.type !== "inventory") {
    return;
  }
  const target = ui.modal.querySelector<HTMLDivElement>("[data-equip-compare]");
  if (!target) {
    return;
  }
  target.innerHTML = itemId ? buildEquipComparison(run, itemId) : emptyComparisonPanel();
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

  const hasLatestSave = readLatestSaveToken() !== null;

  app.innerHTML = `
    <section class="menu-shell">
      <div class="menu-card">
        <h1>${EN.ui.appTitle}</h1>
        <p class="menu-subtitle">${EN.ui.menuSubtitle}</p>
        <label for="seed-input">${EN.ui.seedInputLabel}</label>
        <input id="seed-input" type="text" placeholder="${EN.ui.seedInputPlaceholder}" />
        <div class="menu-actions">
          <button id="start-run" type="button">${EN.ui.startRunButton}</button>
          <button id="load-run" type="button">${EN.ui.buttons.load}</button>
          <button id="resume-latest" type="button" ${hasLatestSave ? "" : "disabled"}>${EN.ui.buttons.resumeLast}</button>
        </div>
        <p class="menu-help">
          ${EN.ui.menuHelp}
        </p>
      </div>
    </section>
  `;

  const start = app.querySelector<HTMLButtonElement>("#start-run");
  const load = app.querySelector<HTMLButtonElement>("#load-run");
  const resumeLatest = app.querySelector<HTMLButtonElement>("#resume-latest");
  const input = app.querySelector<HTMLInputElement>("#seed-input");
  if (!start || !load || !resumeLatest || !input) {
    return;
  }

  start.addEventListener("click", () => {
    startRun(input.value);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      startRun(input.value);
    }
  });

  load.addEventListener("click", () => {
    promptForSaveTokenAndLoad();
  });

  resumeLatest.addEventListener("click", () => {
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

  app.innerHTML = `
    <div class="game-shell">
      <header class="game-header">
        <div>
          <h1>${EN.ui.appTitle}</h1>
          <p>${EN.ui.seedPrefix}: <span id="seed-value"></span></p>
        </div>
        <div class="header-actions">
          <button id="save-btn" type="button">${EN.ui.buttons.save}</button>
          <button id="load-btn" type="button">${EN.ui.buttons.load}</button>
          <button id="inventory-btn" type="button">${EN.ui.buttons.inventory}</button>
          <button id="shop-btn" type="button">${EN.ui.buttons.shop}</button>
          <button id="reveal-map-btn" type="button">${EN.ui.buttons.revealMap}</button>
          <button id="new-run-btn" type="button">${EN.ui.buttons.newRun}</button>
        </div>
      </header>
      <main class="game-main">
        <section class="canvas-wrap">
          <canvas id="map-canvas" aria-label="${EN.ui.mapAriaLabel}"></canvas>
          <div class="dpad" id="dpad">
            <button data-move="up" type="button">▲</button>
            <div class="dpad-middle">
              <button data-move="left" type="button">◀</button>
              <button data-move="down" type="button">▼</button>
              <button data-move="right" type="button">▶</button>
            </div>
          </div>
        </section>
        <aside class="sidebar">
          <div id="state-text" class="state-text"></div>
          <div id="stats" class="stats"></div>
          <h2>${EN.ui.sidebar.logTitle}</h2>
          <ul id="logs" class="logs"></ul>
        </aside>
      </main>
    </div>
    <div id="modal-backdrop" class="modal-backdrop hidden">
      <div id="modal" class="modal" role="dialog" aria-modal="true"></div>
    </div>
  `;

  const root = app.querySelector<HTMLDivElement>(".game-shell");
  const canvas = app.querySelector<HTMLCanvasElement>("#map-canvas");
  const stats = app.querySelector<HTMLDivElement>("#stats");
  const logs = app.querySelector<HTMLUListElement>("#logs");
  const seedValue = app.querySelector<HTMLSpanElement>("#seed-value");
  const stateText = app.querySelector<HTMLDivElement>("#state-text");
  const saveButton = app.querySelector<HTMLButtonElement>("#save-btn");
  const loadButton = app.querySelector<HTMLButtonElement>("#load-btn");
  const shopButton = app.querySelector<HTMLButtonElement>("#shop-btn");
  const inventoryButton = app.querySelector<HTMLButtonElement>("#inventory-btn");
  const revealButton = app.querySelector<HTMLButtonElement>("#reveal-map-btn");
  const dpad = app.querySelector<HTMLDivElement>("#dpad");
  const modalBackdrop = app.querySelector<HTMLDivElement>("#modal-backdrop");
  const modal = app.querySelector<HTMLDivElement>("#modal");
  const newRun = app.querySelector<HTMLButtonElement>("#new-run-btn");

  if (
    !root
    || !canvas
    || !stats
    || !logs
    || !seedValue
    || !stateText
    || !saveButton
    || !loadButton
    || !shopButton
    || !inventoryButton
    || !revealButton
    || !dpad
    || !modalBackdrop
    || !modal
    || !newRun
  ) {
    throw new Error("Failed to mount run UI");
  }

  ui = {
    root,
    canvas,
    stats,
    logs,
    seedValue,
    stateText,
    saveButton,
    loadButton,
    shopButton,
    inventoryButton,
    revealButton,
    dpad,
    modalBackdrop,
    modal,
  };

  setRevealButtonState();

  seedValue.textContent = `${run.seedPhrase} (${run.seedNumber})`;

  saveButton.addEventListener("click", () => {
    void saveRunTokenAndShare();
  });

  loadButton.addEventListener("click", () => {
    promptForSaveTokenAndLoad();
  });

  inventoryButton.addEventListener("click", () => {
    if (!run) {
      return;
    }
    if (run.overlay.type === "inventory") {
      run.closeOverlay();
      return;
    }
    run.openInventory();
  });

  shopButton.addEventListener("click", () => {
    if (!run) {
      return;
    }
    if (run.overlay.type === "shop") {
      run.closeOverlay();
      return;
    }
    run.openShop();
  });

  revealButton.addEventListener("click", () => {
    debugRevealMap = !debugRevealMap;
    setRevealButtonState();
    overlayCache = "";
    statsCache = "";
    renderUI();
  });

  newRun.addEventListener("click", () => {
    showMenu();
  });

  dpad.addEventListener("click", (event) => {
    if (!run) {
      return;
    }
    const target = event.target as HTMLElement;
    const move = target.getAttribute("data-move");
    if (!move) {
      return;
    }

    if (move === "up") {
      run.movePlayer(0, -1);
    } else if (move === "down") {
      run.movePlayer(0, 1);
    } else if (move === "left") {
      run.movePlayer(-1, 0);
    } else if (move === "right") {
      run.movePlayer(1, 0);
    }
  });

  modalBackdrop.addEventListener("click", (event) => {
    if (!run) {
      return;
    }
    if (combatFx) {
      return;
    }
    if (event.target === modalBackdrop) {
      if (run.state === "dead" || run.state === "won") {
        showMenu();
        return;
      }
      run.closeOverlay();
    }
  });

  modal.addEventListener("click", (event) => {
    if (!run) {
      return;
    }

    const target = event.target as HTMLElement;
    const actionNode = target.closest<HTMLElement>("[data-action]");
    if (!actionNode || !modal.contains(actionNode)) {
      return;
    }
    const action = actionNode.getAttribute("data-action");
    const id = actionNode.getAttribute("data-id");

    if (!action) {
      return;
    }

    if (action === "close") {
      if (run.state === "dead" || run.state === "won") {
        showMenu();
        return;
      }
      run.closeOverlay();
      return;
    }

    if (combatFx) {
      if (action === "combat-fx-skip") {
        combatFx.revealed = combatFx.moments.length;
        overlayCache = "";
      } else if (action === "combat-fx-continue") {
        combatFx = null;
        overlayCache = "";
      }
      return;
    }

    if (action === "combat-normal") {
      const result = run.performCombat("normal");
      queueCombatFx(result?.moments ?? []);
    } else if (action === "combat-offensive") {
      const result = run.performCombat("offensive");
      queueCombatFx(result?.moments ?? []);
    } else if (action === "combat-defensive") {
      const result = run.performCombat("defensive");
      queueCombatFx(result?.moments ?? []);
    } else if (action === "combat-heal") {
      const result = run.performCombat("heal");
      queueCombatFx(result?.moments ?? []);
    } else if (action === "combat-flee") {
      const result = run.performCombat("flee");
      queueCombatFx(result?.moments ?? []);
    } else if (action === "loot" && id) {
      run.lootItem(id);
    } else if (action === "loot-all") {
      run.lootAll();
      run.closeOverlay();
    } else if (action === "inv-equip" && id) {
      run.equipItem(id);
    } else if (action === "inv-use" && id) {
      run.useInventoryItem(id);
    } else if (action === "inv-drop" && id) {
      run.destroyInventoryItem(id);
    } else if (action === "shop-buy" && id) {
      run.buyShopEntry(id);
    } else if (action === "levelup-attr" && id && isLevelUpAttribute(id)) {
      run.allocateLevelUp(id);
    } else if (action === "boss-perk" && id) {
      run.chooseBossReward("perk", id);
    } else if (action === "boss-gambit" && id) {
      run.chooseBossReward("gambit", id);
    } else if (action === "boss-none") {
      run.chooseBossReward("none");
    } else if (action === "shop-reward" && id) {
      run.claimShopReward(id as "bonus-point" | "remove-perk" | "remove-gambit");
    }
  });

  modal.addEventListener("change", (event) => {
    const target = event.target as HTMLElement | null;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    if (target.getAttribute("data-action") !== "combat-fx-skip-all") {
      return;
    }

    combatSkipAll = target.checked;
    if (combatSkipAll && combatFx) {
      combatFx.revealed = combatFx.moments.length;
      overlayCache = "";
    }
  });

  modal.addEventListener("mouseover", (event) => {
    if (!run || run.overlay.type !== "inventory") {
      return;
    }
    const target = event.target as HTMLElement;
    const equipButton = target.closest<HTMLButtonElement>("button[data-action='inv-equip']");
    if (!equipButton) {
      return;
    }
    updateInventoryCompare(equipButton.getAttribute("data-id"));
  });

  modal.addEventListener("focusin", (event) => {
    if (!run || run.overlay.type !== "inventory") {
      return;
    }
    const target = event.target as HTMLElement;
    const equipButton = target.closest<HTMLButtonElement>("button[data-action='inv-equip']");
    updateInventoryCompare(equipButton ? equipButton.getAttribute("data-id") : null);
  });

  modal.addEventListener("mouseleave", () => {
    updateInventoryCompare(null);
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

  const { canvas } = ui;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  const targetWidth = Math.max(640, Math.floor(rect.width * dpr));
  const targetHeight = Math.max(420, Math.floor(rect.height * dpr));

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }
}

function getViewport(playerPos: Position, mapWidth: number, mapHeight: number, tileSize: number, canvas: HTMLCanvasElement): {
  left: number;
  top: number;
  cols: number;
  rows: number;
} {
  const cols = Math.max(10, Math.floor(canvas.width / tileSize));
  const rows = Math.max(10, Math.floor(canvas.height / tileSize));

  let left = playerPos.x - Math.floor(cols / 2);
  let top = playerPos.y - Math.floor(rows / 2);

  left = Math.max(0, Math.min(left, mapWidth - cols));
  top = Math.max(0, Math.min(top, mapHeight - rows));

  return { left, top, cols, rows };
}

function drawDungeon(): void {
  if (!run || !ui) {
    return;
  }
  const activeRun = run;

  const context = ui.canvas.getContext("2d");
  if (!context) {
    return;
  }

  context.imageSmoothingEnabled = false;
  context.fillStyle = "#091016";
  context.fillRect(0, 0, ui.canvas.width, ui.canvas.height);

  const spritesReady = allSpritesReady();
  const revealAll = debugRevealMap;
  const tile = Math.max(16, Math.floor(Math.min(ui.canvas.width / 28, ui.canvas.height / 18)));
  const view = getViewport(
    activeRun.player.position,
    activeRun.world.width,
    activeRun.world.height,
    tile,
    ui.canvas,
  );

  const screenPos = (worldX: number, worldY: number): Position => ({
    x: (worldX - view.left) * tile,
    y: (worldY - view.top) * tile,
  });

  const inViewport = (worldX: number, worldY: number): boolean => {
    const col = worldX - view.left;
    const row = worldY - view.top;
    return col >= 0 && col < view.cols && row >= 0 && row < view.rows;
  };

  const drawFog = (worldX: number, worldY: number): void => {
    if (revealAll) {
      return;
    }
    if (!activeRun.world.inBounds(worldX, worldY)) {
      return;
    }
    const idx = activeRun.world.idx(worldX, worldY);
    const explored = revealAll || activeRun.world.explored[idx] === 1;
    const visible = revealAll || activeRun.world.visible[idx] === 1;
    if (!explored || visible || !inViewport(worldX, worldY)) {
      return;
    }
    const pos = screenPos(worldX, worldY);
    context.fillStyle = "rgba(6, 11, 14, 0.56)";
    context.fillRect(pos.x, pos.y, tile, tile);
  };

  const drawWorldSprite = (
    sheet: "dungeon" | "chars" | "items",
    spriteId: number,
    worldX: number,
    worldY: number,
  ): void => {
    if (!activeRun.world.inBounds(worldX, worldY) || !inViewport(worldX, worldY)) {
      return;
    }

    const idx = activeRun.world.idx(worldX, worldY);
    const explored = revealAll || activeRun.world.explored[idx] === 1;
    const visible = revealAll || activeRun.world.visible[idx] === 1;
    if (!explored && !visible) {
      return;
    }

    const pos = screenPos(worldX, worldY);
    const drawn = drawSheetSprite(context, sheet, spriteId, pos.x, pos.y, tile);
    if (!drawn) {
      return;
    }

    if (explored && !visible) {
      drawFog(worldX, worldY);
    }
  };

  const drawTileAccent = (x: number, y: number, roomAttrs: number, visible: boolean): void => {
    const pos = screenPos(x, y);

    if ((roomAttrs & ROOM_SHOP) === ROOM_SHOP) {
      context.fillStyle = visible ? "rgba(230, 178, 86, 0.18)" : "rgba(156, 115, 54, 0.11)";
      context.fillRect(pos.x, pos.y, tile, tile);
      return;
    }

    if ((roomAttrs & ROOM_BOSS) === ROOM_BOSS) {
      context.fillStyle = visible ? "rgba(183, 80, 88, 0.16)" : "rgba(122, 53, 60, 0.11)";
      context.fillRect(pos.x, pos.y, tile, tile);
      return;
    }

    if ((roomAttrs & ROOM_START) === ROOM_START) {
      context.fillStyle = visible ? "rgba(104, 178, 205, 0.14)" : "rgba(72, 124, 146, 0.1)";
      context.fillRect(pos.x, pos.y, tile, tile);
      return;
    }

    const room = activeRun.world.roomAt({ x, y });
    if (!room) {
      return;
    }
    const threat = activeRun.getRoomThreat(room);
    const threatDelta = threat - activeRun.player.level;
    if (threatDelta >= 3) {
      context.fillStyle = visible ? "rgba(181, 99, 56, 0.12)" : "rgba(117, 66, 38, 0.08)";
      context.fillRect(pos.x, pos.y, tile, tile);
    }
  };

  const drawRoomLandmark = (room: { x: number; y: number; w: number; h: number; attrs: number }): void => {
    const cx = room.x + Math.floor(room.w / 2);
    const cy = room.y + Math.floor(room.h / 2);
    if (!activeRun.world.inBounds(cx, cy) || !inViewport(cx, cy)) {
      return;
    }

    const idx = activeRun.world.idx(cx, cy);
    const explored = revealAll || activeRun.world.explored[idx] === 1;
    const visible = revealAll || activeRun.world.visible[idx] === 1;
    if (!explored) {
      return;
    }

    const px = (cx - view.left) * tile;
    const py = (cy - view.top) * tile;

    if ((room.attrs & ROOM_SHOP) === ROOM_SHOP) {
      context.fillStyle = visible ? "rgba(241, 203, 119, 0.22)" : "rgba(160, 129, 77, 0.13)";
      context.beginPath();
      context.arc(px + (tile / 2), py + (tile / 2), tile * 0.48, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = visible ? "rgba(246, 225, 166, 0.7)" : "rgba(188, 160, 108, 0.35)";
      context.lineWidth = Math.max(1, Math.floor(tile / 10));
      context.beginPath();
      context.arc(px + (tile / 2), py + (tile / 2), tile * 0.28, 0, Math.PI * 2);
      context.stroke();

      if (spritesReady) {
        drawSheetSprite(context, "props", SPRITE_IDS.props.shopClutter[7], px, py, tile);
        const props = [
          { dx: -1, dy: 0, sprite: SPRITE_IDS.props.shopClutter[0] },
          { dx: 1, dy: 0, sprite: SPRITE_IDS.props.shopClutter[1] },
          { dx: 0, dy: -1, sprite: SPRITE_IDS.props.shopClutter[2] },
          { dx: 0, dy: 1, sprite: SPRITE_IDS.props.shopClutter[3] },
        ];
        for (const prop of props) {
          const tx = cx + prop.dx;
          const ty = cy + prop.dy;
          if (!activeRun.world.inBounds(tx, ty) || !inViewport(tx, ty)) {
            continue;
          }
          const tIdx = activeRun.world.idx(tx, ty);
          if (!revealAll && activeRun.world.visible[tIdx] !== 1) {
            continue;
          }
          drawSheetSprite(
            context,
            "props",
            prop.sprite,
            (tx - view.left) * tile,
            (ty - view.top) * tile,
            tile,
          );
        }
      } else {
        context.fillStyle = visible ? "#d0a65a" : "#8f7342";
        context.fillRect(px + (tile * 0.27), py + (tile * 0.27), tile * 0.46, tile * 0.46);
      }
      return;
    }

    if ((room.attrs & ROOM_BOSS) === ROOM_BOSS) {
      context.strokeStyle = visible ? "rgba(201, 112, 122, 0.65)" : "rgba(130, 78, 84, 0.34)";
      context.lineWidth = Math.max(1, Math.floor(tile / 12));
      context.beginPath();
      context.moveTo(px + (tile * 0.2), py + (tile * 0.2));
      context.lineTo(px + (tile * 0.8), py + (tile * 0.8));
      context.moveTo(px + (tile * 0.8), py + (tile * 0.2));
      context.lineTo(px + (tile * 0.2), py + (tile * 0.8));
      context.stroke();
      return;
    }

    if ((room.attrs & ROOM_START) === ROOM_START) {
      context.strokeStyle = visible ? "rgba(136, 204, 229, 0.62)" : "rgba(91, 138, 156, 0.35)";
      context.lineWidth = Math.max(1, Math.floor(tile / 12));
      context.beginPath();
      context.arc(px + (tile / 2), py + (tile / 2), tile * 0.22, 0, Math.PI * 2);
      context.stroke();
    }
  };

  for (let row = 0; row < view.rows; row += 1) {
    for (let col = 0; col < view.cols; col += 1) {
      const x = view.left + col;
      const y = view.top + row;

      if (!activeRun.world.inBounds(x, y)) {
        continue;
      }

      const idx = activeRun.world.idx(x, y);
      const explored = revealAll || activeRun.world.explored[idx] === 1;
      const visible = revealAll || activeRun.world.visible[idx] === 1;
      const tileType = activeRun.world.tileAt(x, y);

      if (!explored) {
        continue;
      }

      const px = col * tile;
      const py = row * tile;

      if (spritesReady) {
        if (tileType === TileType.Room) {
          drawWorldSprite("dungeon", SPRITE_IDS.dungeon.floor, x, y);
        } else if (tileType === TileType.Hall) {
          drawWorldSprite("dungeon", SPRITE_IDS.dungeon.hallFloor, x, y);
        }
      } else {
        if (tileType === TileType.Room) {
          context.fillStyle = visible ? "#2f5d4f" : "#1d3a32";
          context.fillRect(px, py, tile, tile);
        } else if (tileType === TileType.Hall) {
          context.fillStyle = visible ? "#2d4e63" : "#1a2f3d";
          context.fillRect(px, py, tile, tile);
        }
      }

      if (!activeRun.world.isPassable(x, y)) {
        continue;
      }

      const room = tileType === TileType.Room ? activeRun.world.roomAt({ x, y }) : null;
      if (room) {
        drawTileAccent(x, y, room.attrs, visible);
      }

      if (spritesReady) {
        if (!activeRun.world.isPassable(x, y - 1)) {
          drawWorldSprite("dungeon", SPRITE_IDS.dungeon.wallN, x, y - 1);
        }
        if (!activeRun.world.isPassable(x, y + 1)) {
          drawWorldSprite("dungeon", SPRITE_IDS.dungeon.wallS, x, y + 1);
        }
        if (!activeRun.world.isPassable(x - 1, y)) {
          drawWorldSprite("dungeon", SPRITE_IDS.dungeon.wallW, x - 1, y);
        }
        if (!activeRun.world.isPassable(x + 1, y)) {
          drawWorldSprite("dungeon", SPRITE_IDS.dungeon.wallE, x + 1, y);
        }
      }

      context.strokeStyle = spritesReady
        ? (visible ? "rgba(171, 212, 220, 0.28)" : "rgba(106, 136, 143, 0.22)")
        : (visible ? "#87b2a3" : "#385449");
      context.lineWidth = Math.max(1, Math.floor(tile / 12));

      if (!activeRun.world.isPassable(x, y - 1)) {
        context.beginPath();
        context.moveTo(px, py);
        context.lineTo(px + tile, py);
        context.stroke();
      }
      if (!activeRun.world.isPassable(x, y + 1)) {
        context.beginPath();
        context.moveTo(px, py + tile);
        context.lineTo(px + tile, py + tile);
        context.stroke();
      }
      if (!activeRun.world.isPassable(x - 1, y)) {
        context.beginPath();
        context.moveTo(px, py);
        context.lineTo(px, py + tile);
        context.stroke();
      }
      if (!activeRun.world.isPassable(x + 1, y)) {
        context.beginPath();
        context.moveTo(px + tile, py);
        context.lineTo(px + tile, py + tile);
        context.stroke();
      }
    }
  }

  for (const room of activeRun.world.rooms) {
    drawRoomLandmark(room);
  }

  for (const clutter of activeRun.shopClutter) {
    const idx = activeRun.world.idx(clutter.x, clutter.y);
    if (!revealAll && activeRun.world.visible[idx] !== 1) {
      continue;
    }

    const col = clutter.x - view.left;
    const row = clutter.y - view.top;
    if (col < 0 || col >= view.cols || row < 0 || row >= view.rows) {
      continue;
    }

    const px = col * tile;
    const py = row * tile;
    if (spritesReady) {
      drawSheetSprite(context, "props", clutter.sprite, px, py, tile);
    } else {
      context.fillStyle = "#7f6950";
      context.fillRect(px + (tile * 0.2), py + (tile * 0.2), tile * 0.6, tile * 0.6);
    }
  }

  for (const chest of activeRun.chests) {
    const chestPos = { x: chest.chest.x, y: chest.chest.y };
    const idx = activeRun.world.idx(chestPos.x, chestPos.y);
    if (!revealAll && activeRun.world.visible[idx] !== 1) {
      continue;
    }

    const col = chestPos.x - view.left;
    const row = chestPos.y - view.top;
    if (col < 0 || col >= view.cols || row < 0 || row >= view.rows) {
      continue;
    }

    const px = col * tile;
    const py = row * tile;
    if (spritesReady) {
      drawSheetSprite(
        context,
        "items",
        chest.chest.empty() ? SPRITE_IDS.items.chestOpen : SPRITE_IDS.items.chestClosed,
        px,
        py,
        tile,
      );
    } else {
      context.fillStyle = chest.chest.empty() ? "#6f7f8d" : "#d2a444";
      context.fillRect(px + (tile * 0.2), py + (tile * 0.2), tile * 0.6, tile * 0.6);
    }
  }

  for (const mob of activeRun.mobs) {
    if (!mob.creature.alive) {
      continue;
    }

    const idx = activeRun.world.idx(mob.creature.position.x, mob.creature.position.y);
    if (!revealAll && activeRun.world.visible[idx] !== 1) {
      continue;
    }

    const col = mob.creature.position.x - view.left;
    const row = mob.creature.position.y - view.top;
    if (col < 0 || col >= view.cols || row < 0 || row >= view.rows) {
      continue;
    }

    const px = col * tile;
    const py = row * tile;
    if (spritesReady) {
      drawSheetSprite(context, "chars", SPRITE_IDS.chars.mob, px, py, tile);
    } else {
      context.fillStyle = mob.creature.name === EN.game.names.dungeonBoss ? "#d16a32" : "#c74646";
      context.beginPath();
      context.arc(px + (tile / 2), py + (tile / 2), tile * 0.3, 0, Math.PI * 2);
      context.fill();
    }
  }

  const playerCol = activeRun.player.position.x - view.left;
  const playerRow = activeRun.player.position.y - view.top;
  const playerX = playerCol * tile;
  const playerY = playerRow * tile;

  if (spritesReady) {
    drawSheetSprite(context, "chars", SPRITE_IDS.chars.player, playerX, playerY, tile);
  } else {
    context.fillStyle = "#f0f4f8";
    context.fillRect(playerX + (tile * 0.2), playerY + (tile * 0.2), tile * 0.6, tile * 0.6);
  }
}

function renderStats(): void {
  if (!run || !ui) {
    return;
  }
  const activeRun = run;

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

  ui.shopButton.disabled = !inShop || activeRun.state !== "playing";
  ui.inventoryButton.disabled = activeRun.state !== "playing";
  setRevealButtonState();

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

  if (statsKey !== statsCache) {
    statsCache = statsKey;
    ui.stats.innerHTML = `
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

    const gearDetails = ui.stats.querySelector<HTMLDetailsElement>("details[data-gear]");
    if (gearDetails) {
      gearDetails.addEventListener("toggle", () => {
        wieldedGearOpen = gearDetails.open;
      });
    }
  }

  const nextLogs = activeRun.logs
    .map((entry) => `<li class="log-${entry.level}">${htmlEscape(entry.text)}</li>`)
    .join("");

  if (nextLogs !== logsCache) {
    logsCache = nextLogs;
    ui.logs.innerHTML = nextLogs;
  }
}

function runSummary(): string {
  if (!run) {
    return "";
  }

  return `
    <ul class="summary-list">
      <li>${EN.ui.runSummary.vanquished}: <b>${run.stats.vanquished}</b></li>
      <li>${EN.ui.runSummary.goldEarned}: <b>${run.stats.goldEarned}</b></li>
      <li>${EN.ui.runSummary.goldSpent}: <b>${run.stats.goldSpent}</b></li>
      <li>${EN.ui.runSummary.goldLeftInChests}: <b>${run.stats.goldLeftBehind}</b></li>
      <li>${EN.ui.runSummary.inventoryValue}: <b>${run.stats.inventoryValue}</b></li>
      <li>${EN.ui.runSummary.xpGained}: <b>${run.stats.xpGained}</b></li>
      <li>${EN.ui.runSummary.finalLevel}: <b>${run.stats.level}</b></li>
      <li>${EN.ui.runSummary.floorReached}: <b>${run.stats.floorReached}</b></li>
    </ul>
  `;
}

function overlayRenderKey(activeRun: DungeonRun): string {
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

function renderOverlay(): void {
  if (!run || !ui) {
    return;
  }

  const key = overlayRenderKey(run);
  if (key === overlayCache) {
    return;
  }
  overlayCache = key;

  if (combatFx) {
    const shown = combatFx.moments.slice(0, Math.max(1, combatFx.revealed));
    const done = combatFx.revealed >= combatFx.moments.length;
    const knockoutMoment = shown
      .filter((moment): moment is Extract<CombatMoment, { type: "text" }> => moment.type === "text")
      .find((moment) => moment.text.endsWith("falls."));
    const knockoutClass = knockoutMoment
      ? (knockoutMoment.level === "warn" ? "fx-bad" : knockoutMoment.level === "success" ? "fx-good" : "")
      : "";

    ui.stateText.textContent = EN.ui.stateText.floor(run.floor);
    ui.stateText.className = "state-text";
    ui.modalBackdrop.classList.remove("hidden");
    ui.modal.innerHTML = `
      <h2>${EN.ui.overlays.combatFx.title}</h2>
      <p class="hint">${EN.ui.overlays.combatFx.hint}</p>
      <label class="skip-all-toggle">
        <input type="checkbox" data-action="combat-fx-skip-all" ${combatSkipAll ? "checked" : ""} />
        ${EN.ui.overlays.combatFx.skipAll}
      </label>
      ${knockoutMoment ? `<p class="${knockoutClass}"><b>${htmlEscape(knockoutMoment.text)}</b></p>` : ""}
      <ul class="combat-fx-list">${shown.map((moment) => renderCombatMoment(moment)).join("")}</ul>
      <div class="row-actions">
        ${
          done
            ? `<button data-action="combat-fx-continue" type="button">${EN.ui.buttons.continue}</button>`
            : `<button data-action="combat-fx-skip" type="button">${EN.ui.buttons.skip}</button>`
        }
      </div>
    `;
    return;
  }

  if (run.state === "dead" || run.state === "won") {
    const won = run.state === "won";
    ui.stateText.textContent = won ? EN.ui.stateText.cleared : EN.ui.stateText.defeated;
    ui.stateText.className = `state-text ${won ? "state-win" : "state-dead"}`;

    ui.modalBackdrop.classList.remove("hidden");
    ui.modal.innerHTML = `
      <h2>${won ? EN.ui.overlays.runEnd.victoryTitle : EN.ui.overlays.runEnd.defeatTitle}</h2>
      <p>${won ? EN.ui.overlays.runEnd.victoryBody : EN.ui.overlays.runEnd.defeatBody}</p>
      ${runSummary()}
      <button data-action="close" type="button">${EN.ui.buttons.close}</button>
    `;
    return;
  }

  ui.stateText.textContent = EN.ui.stateText.floor(run.floor);
  ui.stateText.className = "state-text";

  if (run.overlay.type === "none") {
    ui.modalBackdrop.classList.add("hidden");
    ui.modal.innerHTML = "";
    return;
  }

  ui.modalBackdrop.classList.remove("hidden");

  if (run.overlay.type === "battle") {
    const enemy = run.getBattleEnemy();
    if (!enemy) {
      ui.modal.innerHTML = `
        <h2>${EN.ui.overlays.battle.noTargetTitle}</h2>
        <p>${EN.ui.overlays.battle.noTargetBody}</p>
        <button data-action="close" type="button">${EN.ui.buttons.close}</button>
      `;
      return;
    }

    const battleLog = run.logs
      .slice(-8)
      .map((entry) => `<li class="log-${entry.level}">${htmlEscape(entry.text)}</li>`)
      .join("");

    ui.modal.innerHTML = `
      <h2>${htmlEscape(EN.ui.overlays.battle.title(enemy.creature.name))}</h2>
      <p>${EN.ui.overlays.battle.yourHp(run.player.hitpoints, run.player.currentMaxHitpoints())}</p>
      <p>${EN.ui.overlays.battle.enemyHp(enemy.creature.hitpoints, enemy.creature.maxHitpoints)}</p>
      ${run.overlay.surpriseProtection ? `<p class="hint">${EN.ui.overlays.battle.ambushProtectionHint}</p>` : ""}
      <p class="hint">${htmlEscape(EN.ui.overlays.battle.healChoice(describeHealChoice(run.player)))}</p>
      <div class="action-grid">
        <button data-action="combat-normal" type="button"><span>${EN.ui.overlays.battle.actions.normal.label}</span><small>${EN.ui.overlays.battle.actions.normal.subtitle}</small></button>
        <button data-action="combat-offensive" type="button"><span>${EN.ui.overlays.battle.actions.offensive.label}</span><small>${EN.ui.overlays.battle.actions.offensive.subtitle}</small></button>
        <button data-action="combat-defensive" type="button"><span>${EN.ui.overlays.battle.actions.defensive.label}</span><small>${EN.ui.overlays.battle.actions.defensive.subtitle}</small></button>
        <button data-action="combat-heal" type="button"><span>${EN.ui.overlays.battle.actions.heal.label}</span><small>${EN.ui.overlays.battle.actions.heal.subtitle}</small></button>
        <button data-action="combat-flee" type="button"><span>${EN.ui.overlays.battle.actions.flee.label}</span><small>${EN.ui.overlays.battle.actions.flee.subtitle}</small></button>
      </div>
      <h3>${EN.ui.sidebar.combatLog}</h3>
      <ul class="combat-log">${battleLog}</ul>
      <button data-action="close" type="button">${EN.ui.buttons.close}</button>
    `;
    return;
  }

  if (run.overlay.type === "level-up") {
    const rows = run.levelUpChoices().map((choice) => `
      <li>
        <div>
          <strong>${htmlEscape(choice.label)} (${choice.value}, ${signed(choice.modifier)})</strong>
          <span>${htmlEscape(choice.description)}</span>
        </div>
        <button data-action="levelup-attr" data-id="${choice.attr}" type="button">${htmlEscape(EN.ui.overlays.levelUp.spend(choice.label))}</button>
      </li>
    `);

    ui.modal.innerHTML = `
      <h2>${EN.ui.overlays.levelUp.title}</h2>
      <p>${EN.ui.overlays.levelUp.body(run.player.unspentStatPoints)}</p>
      <ul class="item-list">${rows.join("")}</ul>
    `;
    return;
  }

  if (run.overlay.type === "boss-reward") {
    const rewards = run.getBossRewards();
    const build = run.currentBuild();
    if (!rewards) {
      ui.modal.innerHTML = `
        <h2>${EN.ui.overlays.bossReward.emptyTitle}</h2>
        <p>${EN.ui.overlays.bossReward.emptyBody}</p>
        <button data-action="boss-none" type="button">${EN.ui.buttons.descend}</button>
      `;
      return;
    }

    ui.modal.innerHTML = `
      <h2>${EN.ui.overlays.bossReward.title}</h2>
      <p>${EN.ui.overlays.bossReward.body(run.floor)}</p>
      <p class="hint">${EN.ui.overlays.bossReward.currentBuild(build.perks.length, build.gambits.length)}</p>
      <h3>${EN.ui.sidebar.perks}</h3>
      <ul class="item-list">${renderBuildChoices(rewards.perks, "boss-perk")}</ul>
      <h3>${EN.ui.sidebar.gambits}</h3>
      <ul class="item-list">${renderBuildChoices(rewards.gambits, "boss-gambit")}</ul>
      <button data-action="boss-none" type="button">${EN.ui.buttons.descendWithoutPicking}</button>
    `;
    return;
  }

  if (run.overlay.type === "shop-reward") {
    const rewards = run.getShopRewardChoices();
    const rows = (rewards ?? []).map((choice) => `
      <li>
        <div>
          <strong>${htmlEscape(choice.title)}</strong>
          <span>${htmlEscape(choice.description)}</span>
        </div>
        <button data-action="shop-reward" data-id="${choice.id}" type="button">${EN.ui.buttons.claim}</button>
      </li>
    `);

    ui.modal.innerHTML = `
      <h2>${EN.ui.overlays.shopReward.title}</h2>
      <p>${EN.ui.overlays.shopReward.body}</p>
      <ul class="item-list">${rows.join("")}</ul>
    `;
    return;
  }

  if (run.overlay.type === "chest") {
    const chest = run.getChest();
    if (!chest) {
      ui.modal.innerHTML = `
        <h2>${EN.ui.overlays.chest.title}</h2>
        <p>${EN.ui.overlays.chest.emptyBody}</p>
        <button data-action="close" type="button">${EN.ui.buttons.close}</button>
      `;
      return;
    }

    const rows = chest.chest.items().map((item) => {
      return `
        <li>
          <span>${htmlEscape(item.name)} (${EN.ui.overlays.shop.price(item.value)})</span>
          <button data-action="loot" data-id="${item.id}" type="button">${EN.ui.buttons.loot}</button>
        </li>
      `;
    });

    ui.modal.innerHTML = `
      <h2>${EN.ui.overlays.chest.title}</h2>
      <ul class="item-list">${rows.join("") || `<li>${EN.ui.overlays.chest.nothingLeft}</li>`}</ul>
      <div class="row-actions">
        <button data-action="loot-all" type="button">${EN.ui.buttons.lootAll}</button>
        <button data-action="close" type="button">${EN.ui.buttons.close}</button>
      </div>
    `;
    return;
  }

  if (run.overlay.type === "inventory") {
    const activeRun = run;
    const rows = activeRun.inventoryItems().map(({ item, action }) => {
      const actionButton =
        action === "equip"
          ? `<button data-action="inv-equip" data-id="${item.id}" type="button">${EN.ui.buttons.equip}</button>`
          : action === "use"
            ? `<button data-action="inv-use" data-id="${item.id}" type="button">${EN.ui.buttons.use}</button>`
            : "";

      return `
        <li>
          <div>
            <strong>${htmlEscape(item.name)}</strong>
            <span>${htmlEscape(item.describe())}</span>
          </div>
          <div class="item-actions">
            ${actionButton}
            <button data-action="inv-drop" data-id="${item.id}" type="button">${EN.ui.buttons.drop}</button>
          </div>
        </li>
      `;
    });

    ui.modal.innerHTML = `
      <h2>${EN.ui.overlays.inventory.title}</h2>
      <div class="inventory-layout">
        <ul class="item-list inventory">${rows.join("") || `<li>${EN.ui.overlays.inventory.emptyBody}</li>`}</ul>
        <aside class="equip-compare-panel">
          <h3>${EN.ui.overlays.inventory.equipComparisonTitle}</h3>
          <div data-equip-compare>${emptyComparisonPanel()}</div>
        </aside>
      </div>
      <button data-action="close" type="button">${EN.ui.buttons.close}</button>
    `;
    return;
  }

  if (run.overlay.type === "shop") {
    const activeRun = run;
    const rows = activeRun.shopEntries().map((entry) => {
      const sold = entry.sold;
      const cost = activeRun.shopEntryCost(entry);

      return `
        <li>
          <div>
            <strong>${htmlEscape(entry.name)}</strong>
            <span>${htmlEscape(entry.description)}</span>
            <span class="price">${EN.ui.overlays.shop.price(cost)}</span>
          </div>
          <button data-action="shop-buy" data-id="${entry.id}" type="button" ${sold ? "disabled" : ""}>${sold ? EN.ui.buttons.sold : EN.ui.buttons.buy}</button>
        </li>
      `;
    });

    ui.modal.innerHTML = `
      <h2>${EN.ui.overlays.shop.title}</h2>
      <ul class="item-list shop">${rows.join("")}</ul>
      <button data-action="close" type="button">${EN.ui.buttons.close}</button>
    `;
  }
}

function renderUI(): void {
  drawDungeon();
  renderStats();
  renderOverlay();
}

function handleMovement(key: string): boolean {
  if (!run) {
    return false;
  }

  if (key === "w" || key === "ArrowUp") {
    run.movePlayer(0, -1);
    return true;
  }
  if (key === "a" || key === "ArrowLeft") {
    run.movePlayer(-1, 0);
    return true;
  }
  if (key === "s" || key === "ArrowDown") {
    run.movePlayer(0, 1);
    return true;
  }
  if (key === "d" || key === "ArrowRight") {
    run.movePlayer(1, 0);
    return true;
  }
  return false;
}

window.addEventListener("keydown", (event) => {
  if (!run) {
    return;
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    void saveRunTokenAndShare();
    return;
  }

  if (combatFx) {
    if (event.key === "Escape") {
      if (combatFx.revealed < combatFx.moments.length) {
        combatFx.revealed = combatFx.moments.length;
      } else {
        combatFx = null;
      }
      overlayCache = "";
      renderUI();
      event.preventDefault();
    }
    return;
  }

  if (event.key === "Escape") {
    if (run.state === "dead" || run.state === "won") {
      showMenu();
      event.preventDefault();
      return;
    }
    run.closeOverlay();
    event.preventDefault();
    return;
  }

  if (event.key === "m" || event.key === "M") {
    debugRevealMap = !debugRevealMap;
    setRevealButtonState();
    overlayCache = "";
    statsCache = "";
    renderUI();
    event.preventDefault();
    return;
  }

  if (run.overlay.type === "battle") {
    let result = null;
    if (event.key === "1") {
      result = run.performCombat("normal");
    } else if (event.key === "2") {
      result = run.performCombat("offensive");
    } else if (event.key === "3") {
      result = run.performCombat("defensive");
    } else if (event.key === "4") {
      result = run.performCombat("heal");
    } else if (event.key === "5") {
      result = run.performCombat("flee");
    } else {
      return;
    }
    queueCombatFx(result?.moments ?? []);
    event.preventDefault();
    return;
  }

  if (event.key === "i") {
    if (run.overlay.type === "inventory") {
      run.closeOverlay();
    } else {
      run.openInventory();
    }
    event.preventDefault();
    return;
  }

  if (event.key === "o") {
    if (run.overlay.type === "shop") {
      run.closeOverlay();
    } else {
      run.openShop();
    }
    event.preventDefault();
    return;
  }

  if (run.overlay.type !== "none") {
    return;
  }

  if (handleMovement(event.key)) {
    event.preventDefault();
  }
});

window.addEventListener("resize", () => {
  resizeCanvas();
  renderUI();
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
  setRevealMap: (enabled: boolean): void => {
    debugRevealMap = enabled;
    setRevealButtonState();
    overlayCache = "";
    statsCache = "";
    renderUI();
  },
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
