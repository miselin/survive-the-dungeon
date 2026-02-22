import type { CombatFxState } from "../combatFx";
import type { DungeonRun } from "../game";
import { EN } from "../strings/en";
import { overlayRenderKey } from "./overlay/overlayKey";

export type OverlayChrome = {
  key: string;
  stateText: string;
  stateClass: string;
  modalHidden: boolean;
  modalClass?: string;
  windowKey?: string;
};

export function buildOverlayChrome(
  activeRun: DungeonRun,
  combatFx: CombatFxState | null,
  combatSkipAll: boolean,
): OverlayChrome {
  const key = overlayRenderKey(activeRun, combatFx, combatSkipAll);

  if (combatFx) {
    return {
      key,
      stateText: EN.ui.stateText.floor(activeRun.floor),
      stateClass: "state-text",
      modalHidden: false,
      modalClass: "modal-battle",
      windowKey: "battle",
    };
  }

  if (activeRun.state === "dead" || activeRun.state === "won") {
    const won = activeRun.state === "won";
    return {
      key,
      stateText: won ? EN.ui.stateText.cleared : EN.ui.stateText.defeated,
      stateClass: `state-text ${won ? "state-win" : "state-dead"}`,
      modalHidden: false,
      modalClass: "modal-run-end",
      windowKey: "run-end",
    };
  }

  if (activeRun.overlay.type === "none") {
    return {
      key,
      stateText: EN.ui.stateText.floor(activeRun.floor),
      stateClass: "state-text",
      modalHidden: true,
      modalClass: "modal-idle",
    };
  }

  if (activeRun.overlay.type === "battle") {
    return {
      key,
      stateText: EN.ui.stateText.floor(activeRun.floor),
      stateClass: "state-text",
      modalHidden: false,
      modalClass: "modal-battle",
      windowKey: "battle",
    };
  }

  if (activeRun.overlay.type === "level-up") {
    return {
      key,
      stateText: EN.ui.stateText.floor(activeRun.floor),
      stateClass: "state-text",
      modalHidden: false,
      modalClass: "modal-level-up",
      windowKey: "level-up",
    };
  }

  if (activeRun.overlay.type === "boss-reward") {
    return {
      key,
      stateText: EN.ui.stateText.floor(activeRun.floor),
      stateClass: "state-text",
      modalHidden: false,
      modalClass: "modal-boss-reward",
      windowKey: "boss-reward",
    };
  }

  if (activeRun.overlay.type === "shop-reward") {
    return {
      key,
      stateText: EN.ui.stateText.floor(activeRun.floor),
      stateClass: "state-text",
      modalHidden: false,
      modalClass: "modal-shop-reward",
      windowKey: "shop-reward",
    };
  }

  if (activeRun.overlay.type === "chest") {
    return {
      key,
      stateText: EN.ui.stateText.floor(activeRun.floor),
      stateClass: "state-text",
      modalHidden: false,
      modalClass: "modal-chest",
      windowKey: "chest",
    };
  }

  if (activeRun.overlay.type === "inventory") {
    return {
      key,
      stateText: EN.ui.stateText.floor(activeRun.floor),
      stateClass: "state-text",
      modalHidden: false,
      modalClass: "modal-inventory",
      windowKey: "inventory",
    };
  }

  return {
    key,
    stateText: EN.ui.stateText.floor(activeRun.floor),
    stateClass: "state-text",
    modalHidden: false,
    modalClass: "modal-shop",
    windowKey: "shop",
  };
}
