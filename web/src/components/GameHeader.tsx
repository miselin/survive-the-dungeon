import { EN } from "../strings/en";

type GameHeaderProps = {
  inventoryDisabled: boolean;
  shopDisabled: boolean;
  revealMapEnabled: boolean;
  debugToolsEnabled: boolean;
  onSave: () => void;
  onLoad: () => void;
  onToggleInventory: () => void;
  onToggleShop: () => void;
  onToggleRevealMap: () => void;
  onNewRun: () => void;
};

export function GameHeader(props: GameHeaderProps) {
  return (
    <header className="game-header">
      <div>
        <h1>{EN.ui.appTitle}</h1>
      </div>
      <div className="header-actions">
        <button id="save-btn" type="button" onClick={props.onSave}>
          {EN.ui.buttons.save}
        </button>
        <button id="load-btn" type="button" onClick={props.onLoad}>
          {EN.ui.buttons.load}
        </button>
        <button
          id="inventory-btn"
          type="button"
          disabled={props.inventoryDisabled}
          onClick={props.onToggleInventory}
        >
          {EN.ui.buttons.inventory}
        </button>
        <button
          id="shop-btn"
          type="button"
          disabled={props.shopDisabled}
          onClick={props.onToggleShop}
        >
          {EN.ui.buttons.shop}
        </button>
        {props.debugToolsEnabled ? (
          <button
            id="reveal-map-btn"
            type="button"
            data-active={props.revealMapEnabled ? "true" : "false"}
            onClick={props.onToggleRevealMap}
          >
            {props.revealMapEnabled
              ? EN.ui.buttons.hideMap
              : EN.ui.buttons.revealMap}
          </button>
        ) : null}
        <button id="new-run-btn" type="button" onClick={props.onNewRun}>
          {EN.ui.buttons.newRun}
        </button>
      </div>
    </header>
  );
}
