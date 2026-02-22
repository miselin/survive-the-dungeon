import type { CombatMoment } from "./combat";
import type { DungeonRun, LevelUpAttribute } from "./game";
import {
  clampModalPosition,
  currentModalPosition,
  placeModalAt,
  writeWindowPosition,
} from "./modalWindowPosition";
import type { CombatFxState } from "./overlayRenderer";

type ShopRewardActionId = "bonus-point" | "remove-perk" | "remove-gambit";

type MountedInputRefs = {
  saveButton: HTMLButtonElement;
  loadButton: HTMLButtonElement;
  inventoryButton: HTMLButtonElement;
  shopButton: HTMLButtonElement;
  revealButton: HTMLButtonElement;
  newRunButton: HTMLButtonElement;
  dpad: HTMLDivElement;
  modalBackdrop: HTMLDivElement;
  modal: HTMLDivElement;
};

type MountedRunInputHandlersOptions = {
  refs: MountedInputRefs;
  getRun: () => DungeonRun | null;
  getCombatFx: () => CombatFxState | null;
  setCombatFx: (value: CombatFxState | null) => void;
  setCombatSkipAll: (value: boolean) => void;
  queueCombatFx: (moments: CombatMoment[]) => void;
  saveRunTokenAndShare: () => Promise<void>;
  promptForSaveTokenAndLoad: () => void;
  showMenu: () => void;
  isLevelUpAttribute: (value: string) => value is LevelUpAttribute;
  getRevealMapEnabled: () => boolean;
  setRevealMapEnabled: (enabled: boolean) => void;
  invalidateOverlayCache: () => void;
  updateInventoryCompare: (itemId: string | null) => void;
};

type GlobalInputHandlersOptions = {
  getRun: () => DungeonRun | null;
  getCombatFx: () => CombatFxState | null;
  setCombatFx: (value: CombatFxState | null) => void;
  queueCombatFx: (moments: CombatMoment[]) => void;
  saveRunTokenAndShare: () => Promise<void>;
  showMenu: () => void;
  getRevealMapEnabled: () => boolean;
  setRevealMapEnabled: (enabled: boolean) => void;
  invalidateOverlayCache: () => void;
  renderUI: () => void;
  resizeCanvas: () => void;
  getModal: () => HTMLDivElement | null;
};

function moveByKey(activeRun: DungeonRun, key: string): boolean {
  if (key === "w" || key === "ArrowUp") {
    activeRun.movePlayer(0, -1);
    return true;
  }
  if (key === "a" || key === "ArrowLeft") {
    activeRun.movePlayer(-1, 0);
    return true;
  }
  if (key === "s" || key === "ArrowDown") {
    activeRun.movePlayer(0, 1);
    return true;
  }
  if (key === "d" || key === "ArrowRight") {
    activeRun.movePlayer(1, 0);
    return true;
  }
  return false;
}

function isShopRewardActionId(value: string): value is ShopRewardActionId {
  return value === "bonus-point" || value === "remove-perk" || value === "remove-gambit";
}

export function bindMountedRunInputHandlers(options: MountedRunInputHandlersOptions): void {
  const {
    refs,
    getRun,
    getCombatFx,
    setCombatFx,
    setCombatSkipAll,
    queueCombatFx,
    saveRunTokenAndShare,
    promptForSaveTokenAndLoad,
    showMenu,
    isLevelUpAttribute,
    getRevealMapEnabled,
    setRevealMapEnabled,
    invalidateOverlayCache,
    updateInventoryCompare,
  } = options;

  refs.saveButton.addEventListener("click", () => {
    void saveRunTokenAndShare();
  });

  refs.loadButton.addEventListener("click", () => {
    promptForSaveTokenAndLoad();
  });

  refs.inventoryButton.addEventListener("click", () => {
    const activeRun = getRun();
    if (!activeRun) {
      return;
    }
    if (activeRun.overlay.type === "inventory") {
      activeRun.closeOverlay();
      return;
    }
    activeRun.openInventory();
  });

  refs.shopButton.addEventListener("click", () => {
    const activeRun = getRun();
    if (!activeRun) {
      return;
    }
    if (activeRun.overlay.type === "shop") {
      activeRun.closeOverlay();
      return;
    }
    activeRun.openShop();
  });

  refs.revealButton.addEventListener("click", () => {
    setRevealMapEnabled(!getRevealMapEnabled());
  });

  refs.newRunButton.addEventListener("click", () => {
    showMenu();
  });

  refs.dpad.addEventListener("click", (event) => {
    const activeRun = getRun();
    if (!activeRun) {
      return;
    }
    const target = event.target as HTMLElement;
    const move = target.getAttribute("data-move");
    if (!move) {
      return;
    }

    if (move === "up") {
      activeRun.movePlayer(0, -1);
    } else if (move === "down") {
      activeRun.movePlayer(0, 1);
    } else if (move === "left") {
      activeRun.movePlayer(-1, 0);
    } else if (move === "right") {
      activeRun.movePlayer(1, 0);
    }
  });

  refs.modalBackdrop.addEventListener("click", (event) => {
    const activeRun = getRun();
    if (!activeRun) {
      return;
    }
    if (getCombatFx()) {
      return;
    }
    if (event.target === refs.modalBackdrop) {
      if (activeRun.state === "dead" || activeRun.state === "won") {
        showMenu();
        return;
      }
      activeRun.closeOverlay();
    }
  });

  refs.modal.addEventListener("click", (event) => {
    const activeRun = getRun();
    if (!activeRun) {
      return;
    }

    const target = event.target as HTMLElement;
    const actionNode = target.closest<HTMLElement>("[data-action]");
    if (!actionNode || !refs.modal.contains(actionNode)) {
      return;
    }
    const action = actionNode.getAttribute("data-action");
    const id = actionNode.getAttribute("data-id");
    if (!action) {
      return;
    }

    if (action === "close") {
      if (activeRun.state === "dead" || activeRun.state === "won") {
        showMenu();
        return;
      }
      activeRun.closeOverlay();
      return;
    }

    const combatFx = getCombatFx();
    if (combatFx) {
      if (action === "combat-fx-skip") {
        combatFx.revealed = combatFx.moments.length;
        invalidateOverlayCache();
      } else if (action === "combat-fx-continue") {
        setCombatFx(null);
        invalidateOverlayCache();
      }
      return;
    }

    if (action === "combat-normal") {
      const result = activeRun.performCombat("normal");
      queueCombatFx(result?.moments ?? []);
    } else if (action === "combat-offensive") {
      const result = activeRun.performCombat("offensive");
      queueCombatFx(result?.moments ?? []);
    } else if (action === "combat-defensive") {
      const result = activeRun.performCombat("defensive");
      queueCombatFx(result?.moments ?? []);
    } else if (action === "combat-heal") {
      const result = activeRun.performCombat("heal");
      queueCombatFx(result?.moments ?? []);
    } else if (action === "combat-flee") {
      const result = activeRun.performCombat("flee");
      queueCombatFx(result?.moments ?? []);
    } else if (action === "loot" && id) {
      activeRun.lootItem(id);
    } else if (action === "loot-all") {
      activeRun.lootAll();
      activeRun.closeOverlay();
    } else if (action === "inv-equip" && id) {
      activeRun.equipItem(id);
    } else if (action === "inv-use" && id) {
      activeRun.useInventoryItem(id);
    } else if (action === "inv-drop" && id) {
      activeRun.destroyInventoryItem(id);
    } else if (action === "shop-buy" && id) {
      activeRun.buyShopEntry(id);
    } else if (action === "levelup-attr" && id && isLevelUpAttribute(id)) {
      activeRun.allocateLevelUp(id);
    } else if (action === "boss-perk" && id) {
      activeRun.chooseBossReward("perk", id);
    } else if (action === "boss-gambit" && id) {
      activeRun.chooseBossReward("gambit", id);
    } else if (action === "boss-none") {
      activeRun.chooseBossReward("none");
    } else if (action === "shop-reward" && id && isShopRewardActionId(id)) {
      activeRun.claimShopReward(id);
    }
  });

  refs.modal.addEventListener("change", (event) => {
    const target = event.target as HTMLElement | null;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    if (target.getAttribute("data-action") !== "combat-fx-skip-all") {
      return;
    }

    const nextSkipAll = target.checked;
    setCombatSkipAll(nextSkipAll);

    const combatFx = getCombatFx();
    if (nextSkipAll && combatFx) {
      combatFx.revealed = combatFx.moments.length;
      invalidateOverlayCache();
    }
  });

  refs.modal.addEventListener("mouseover", (event) => {
    const activeRun = getRun();
    if (!activeRun || activeRun.overlay.type !== "inventory") {
      return;
    }
    const target = event.target as HTMLElement;
    const equipButton = target.closest<HTMLButtonElement>("button[data-action='inv-equip']");
    if (!equipButton) {
      return;
    }
    updateInventoryCompare(equipButton.getAttribute("data-id"));
  });

  refs.modal.addEventListener("focusin", (event) => {
    const activeRun = getRun();
    if (!activeRun || activeRun.overlay.type !== "inventory") {
      return;
    }
    const target = event.target as HTMLElement;
    const equipButton = target.closest<HTMLButtonElement>("button[data-action='inv-equip']");
    updateInventoryCompare(equipButton ? equipButton.getAttribute("data-id") : null);
  });

  refs.modal.addEventListener("mouseleave", () => {
    updateInventoryCompare(null);
  });

  let dragPointerId: number | null = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let dragHandle: HTMLElement | null = null;

  const stopDrag = (): void => {
    if (dragPointerId === null) {
      return;
    }

    if (dragHandle?.hasPointerCapture(dragPointerId)) {
      dragHandle.releasePointerCapture(dragPointerId);
    }

    const windowKey = refs.modal.dataset.windowKey;
    if (windowKey) {
      const clamped = clampModalPosition(refs.modal, currentModalPosition(refs.modal));
      placeModalAt(refs.modal, clamped);
      writeWindowPosition(windowKey, clamped);
    }

    dragPointerId = null;
    dragHandle = null;
    refs.modal.classList.remove("is-dragging");
    document.body.classList.remove("modal-dragging");
  };

  refs.modal.addEventListener("pointerdown", (event) => {
    const target = event.target as HTMLElement;
    const titleBar = target.closest<HTMLElement>("[data-window-drag-handle='true']");
    const windowKey = refs.modal.dataset.windowKey;
    if (!windowKey || !titleBar || !refs.modal.contains(titleBar)) {
      return;
    }
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const rect = refs.modal.getBoundingClientRect();
    dragOffsetX = event.clientX - rect.left;
    dragOffsetY = event.clientY - rect.top;
    dragPointerId = event.pointerId;
    dragHandle = titleBar;

    placeModalAt(refs.modal, {
      left: rect.left,
      top: rect.top,
    });

    refs.modal.classList.add("is-dragging");
    document.body.classList.add("modal-dragging");
    titleBar.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  refs.modal.addEventListener("pointermove", (event) => {
    if (dragPointerId === null || event.pointerId !== dragPointerId) {
      return;
    }

    const clamped = clampModalPosition(refs.modal, {
      left: event.clientX - dragOffsetX,
      top: event.clientY - dragOffsetY,
    });
    placeModalAt(refs.modal, clamped);
  });

  refs.modal.addEventListener("pointerup", (event) => {
    if (dragPointerId !== null && event.pointerId === dragPointerId) {
      stopDrag();
    }
  });

  refs.modal.addEventListener("pointercancel", (event) => {
    if (dragPointerId !== null && event.pointerId === dragPointerId) {
      stopDrag();
    }
  });

  refs.modal.addEventListener("lostpointercapture", () => {
    stopDrag();
  });
}

export function installGlobalInputHandlers(options: GlobalInputHandlersOptions): void {
  window.addEventListener("keydown", (event) => {
    const activeRun = options.getRun();
    if (!activeRun) {
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      void options.saveRunTokenAndShare();
      return;
    }

    const combatFx = options.getCombatFx();
    if (combatFx) {
      if (event.key === "Escape") {
        if (combatFx.revealed < combatFx.moments.length) {
          combatFx.revealed = combatFx.moments.length;
        } else {
          options.setCombatFx(null);
        }
        options.invalidateOverlayCache();
        options.renderUI();
        event.preventDefault();
      }
      return;
    }

    if (event.key === "Escape") {
      if (activeRun.state === "dead" || activeRun.state === "won") {
        options.showMenu();
        event.preventDefault();
        return;
      }
      activeRun.closeOverlay();
      event.preventDefault();
      return;
    }

    if (event.key === "m" || event.key === "M") {
      options.setRevealMapEnabled(!options.getRevealMapEnabled());
      event.preventDefault();
      return;
    }

    if (activeRun.overlay.type === "battle") {
      let result: { moments: CombatMoment[] } | null = null;
      if (event.key === "1") {
        result = activeRun.performCombat("normal");
      } else if (event.key === "2") {
        result = activeRun.performCombat("offensive");
      } else if (event.key === "3") {
        result = activeRun.performCombat("defensive");
      } else if (event.key === "4") {
        result = activeRun.performCombat("heal");
      } else if (event.key === "5") {
        result = activeRun.performCombat("flee");
      } else {
        return;
      }
      options.queueCombatFx(result?.moments ?? []);
      event.preventDefault();
      return;
    }

    if (event.key === "i") {
      if (activeRun.overlay.type === "inventory") {
        activeRun.closeOverlay();
      } else {
        activeRun.openInventory();
      }
      event.preventDefault();
      return;
    }

    if (event.key === "o") {
      if (activeRun.overlay.type === "shop") {
        activeRun.closeOverlay();
      } else {
        activeRun.openShop();
      }
      event.preventDefault();
      return;
    }

    if (activeRun.overlay.type !== "none") {
      return;
    }

    if (moveByKey(activeRun, event.key)) {
      event.preventDefault();
    }
  });

  window.addEventListener("resize", () => {
    options.resizeCanvas();
    const modal = options.getModal();
    const windowKey = modal?.dataset.windowKey;
    if (modal && windowKey) {
      const clamped = clampModalPosition(modal, currentModalPosition(modal));
      placeModalAt(modal, clamped);
      writeWindowPosition(windowKey, clamped);
    }
    options.renderUI();
  });
}
