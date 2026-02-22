import { EN } from "./strings/en";

export type MenuScreenRefs = {
  startButton: HTMLButtonElement;
  loadButton: HTMLButtonElement;
  resumeLatestButton: HTMLButtonElement;
  seedInput: HTMLInputElement;
};

export type MountedRunScreenRefs = {
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
  newRunButton: HTMLButtonElement;
};

export function renderMenuScreen(app: HTMLDivElement, hasLatestSave: boolean): MenuScreenRefs | null {
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
        <p class="menu-help">${EN.ui.menuHelp}</p>
      </div>
    </section>
  `;

  const startButton = app.querySelector<HTMLButtonElement>("#start-run");
  const loadButton = app.querySelector<HTMLButtonElement>("#load-run");
  const resumeLatestButton = app.querySelector<HTMLButtonElement>("#resume-latest");
  const seedInput = app.querySelector<HTMLInputElement>("#seed-input");
  if (!startButton || !loadButton || !resumeLatestButton || !seedInput) {
    return null;
  }

  return {
    startButton,
    loadButton,
    resumeLatestButton,
    seedInput,
  };
}

export function renderMountedRunScreen(app: HTMLDivElement): MountedRunScreenRefs {
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
            <button data-move="up" type="button">&#9650;</button>
            <div class="dpad-middle">
              <button data-move="left" type="button">&#9664;</button>
              <button data-move="down" type="button">&#9660;</button>
              <button data-move="right" type="button">&#9654;</button>
            </div>
          </div>
        </section>
        <aside class="sidebar">
          <div id="state-text" class="state-text"></div>
          <div id="stats" class="stats"></div>
        </aside>
      </main>
      <section class="log-dock">
        <h2>${EN.ui.sidebar.logTitle}</h2>
        <ul id="logs" class="logs"></ul>
      </section>
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
  const newRunButton = app.querySelector<HTMLButtonElement>("#new-run-btn");

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
    || !newRunButton
  ) {
    throw new Error("Failed to mount run UI");
  }

  return {
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
    newRunButton,
  };
}
