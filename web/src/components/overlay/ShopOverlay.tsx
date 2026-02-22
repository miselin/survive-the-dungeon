import type { DungeonRun } from "../../game";
import { EN } from "../../strings/en";
import { Window } from "../Window";

type ShopOverlayProps = {
  run: DungeonRun;
  onClose: () => void;
  onBuy: (entryId: string) => void;
};

export function ShopOverlay(props: ShopOverlayProps) {
  const entries = props.run.shopEntries();

  return (
    <Window
      title={EN.ui.overlays.shop.title}
      actions={<button type="button" onClick={props.onClose}>{EN.ui.buttons.close}</button>}
    >
      <ul className="item-list shop">
        {entries.map((entry) => {
          const cost = props.run.shopEntryCost(entry);
          return (
            <li key={entry.id}>
              <div>
                <strong>{entry.name}</strong>
                <span>{entry.description}</span>
                <span className="price">{EN.ui.overlays.shop.price(cost)}</span>
              </div>
              <button
                type="button"
                disabled={entry.sold}
                onClick={() => {
                  props.onBuy(entry.id);
                }}
              >
                {entry.sold ? EN.ui.buttons.sold : EN.ui.buttons.buy}
              </button>
            </li>
          );
        })}
      </ul>
    </Window>
  );
}
