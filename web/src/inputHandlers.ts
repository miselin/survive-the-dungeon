import type { PlayerAction } from "./combat";
import type { DungeonRun } from "./game";
import {
  clampModalPosition,
  currentModalPosition,
  placeModalAt,
  writeWindowPosition,
} from "./modalWindowPosition";
import type { CombatFxState } from "./combatFx";

type GlobalInputHandlersOptions = {
  getRun: () => DungeonRun | null;
  getCombatFx: () => CombatFxState | null;
  setCombatFx: (value: CombatFxState | null) => void;
  onCombatAction: (action: PlayerAction) => void;
  saveRunTokenAndShare: () => Promise<void>;
  showMenu: () => void;
  getRevealMapEnabled: () => boolean;
  setRevealMapEnabled: (enabled: boolean) => void;
  invalidateOverlayCache: () => void;
  renderUI: () => void;
  resizeCanvas: () => void;
  getModal: () => HTMLDivElement | null;
  debugToolsEnabled: boolean;
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

export function installGlobalInputHandlers(
  options: GlobalInputHandlersOptions,
): void {
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

    if (options.debugToolsEnabled && (event.key === "m" || event.key === "M")) {
      options.setRevealMapEnabled(!options.getRevealMapEnabled());
      event.preventDefault();
      return;
    }

    if (activeRun.overlay.type === "battle") {
      let action: PlayerAction | null = null;
      if (event.key === "1") {
        action = "normal";
      } else if (event.key === "2") {
        action = "offensive";
      } else if (event.key === "3") {
        action = "defensive";
      } else if (event.key === "4") {
        action = "heal";
      } else if (event.key === "5") {
        action = "flee";
      } else {
        return;
      }
      options.onCombatAction(action);
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
