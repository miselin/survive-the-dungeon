import type { DungeonRun } from "../../game";
import { EN } from "../../strings/en";
import { Window } from "../Window";

type ShopOverlayProps = {
  run: DungeonRun;
};

export function ShopOverlay(props: ShopOverlayProps) {
  const entries = props.run.shopEntries();

  return (
    <Window
      title={EN.ui.overlays.shop.title}
      actions={<button data-action="close" type="button">{EN.ui.buttons.close}</button>}
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
              <button data-action="shop-buy" data-id={entry.id} type="button" disabled={entry.sold}>
                {entry.sold ? EN.ui.buttons.sold : EN.ui.buttons.buy}
              </button>
            </li>
          );
        })}
      </ul>
    </Window>
  );
}
