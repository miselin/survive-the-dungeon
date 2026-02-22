import type { DungeonRun } from "../../game";
import { Weapon, WieldableItem } from "../../items";
import { EN } from "../../strings/en";
import { Window } from "../Window";

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

type ComparisonRow = {
  label: string;
  currentValue: string;
  newValue: string;
  deltaValue: number;
  preferLower?: boolean;
  deltaPrecision?: number;
};

type InventoryComparison = {
  itemName: string;
  slotName: string;
  currentName: string;
  rows: ComparisonRow[];
};

function buildInventoryComparison(run: DungeonRun, itemId: string): InventoryComparison | null {
  const picked = run.inventoryItems().find((entry) => entry.item.id === itemId);
  if (!picked || !(picked.item instanceof WieldableItem)) {
    return null;
  }

  const item = picked.item;
  const slot = item.wieldsAt();
  const current = run.player.wieldpoints[slot];

  const currentAtk = current?.getAttackBonus() ?? 0;
  const currentDef = current?.getDefenseBonus() ?? 0;
  const newAtk = item.getAttackBonus();
  const newDef = item.getDefenseBonus();

  const rows: ComparisonRow[] = [
    { label: EN.ui.compare.atkBonus, currentValue: signed(currentAtk), newValue: signed(newAtk), deltaValue: newAtk - currentAtk },
    { label: EN.ui.compare.defBonus, currentValue: signed(currentDef), newValue: signed(newDef), deltaValue: newDef - currentDef },
  ];

  const currentWeapon = current instanceof Weapon ? current : null;
  const nextWeapon = item instanceof Weapon ? item : null;

  if (nextWeapon || currentWeapon) {
    const currentDice = currentWeapon?.damage() ?? EN.ui.compare.empty.toLowerCase();
    const nextDice = nextWeapon?.damage() ?? EN.ui.compare.empty.toLowerCase();
    const currentAvg = currentWeapon ? parseDiceAverage(currentDice) ?? 0 : 0;
    const nextAvg = nextWeapon ? parseDiceAverage(nextDice) ?? 0 : 0;

    rows.push({
      label: EN.ui.compare.damageAvg,
      currentValue: currentAvg.toFixed(1),
      newValue: nextAvg.toFixed(1),
      deltaValue: nextAvg - currentAvg,
      deltaPrecision: 1,
    });
    rows.push({
      label: EN.ui.compare.critRangeStart,
      currentValue: currentWeapon ? `${currentWeapon.criticalRange()}` : EN.ui.compare.empty.toLowerCase(),
      newValue: nextWeapon ? `${nextWeapon.criticalRange()}` : EN.ui.compare.empty.toLowerCase(),
      deltaValue: (nextWeapon?.criticalRange() ?? 20) - (currentWeapon?.criticalRange() ?? 20),
      preferLower: true,
    });
    rows.push({
      label: EN.ui.compare.critMult,
      currentValue: currentWeapon ? `${currentWeapon.criticalMultiplier()}` : EN.ui.compare.empty.toLowerCase(),
      newValue: nextWeapon ? `${nextWeapon.criticalMultiplier()}` : EN.ui.compare.empty.toLowerCase(),
      deltaValue: (nextWeapon?.criticalMultiplier() ?? 1) - (currentWeapon?.criticalMultiplier() ?? 1),
    });
  }

  return {
    itemName: item.name,
    slotName: slot,
    currentName: current ? current.name : EN.ui.compare.empty,
    rows,
  };
}

function InventoryComparePanel(props: { run: DungeonRun; itemId: string | null }) {
  if (!props.itemId) {
    return <p className="hint">{EN.ui.compare.hoverHint}</p>;
  }

  const comparison = buildInventoryComparison(props.run, props.itemId);
  if (!comparison) {
    return <p className="hint">{EN.ui.compare.hoverHint}</p>;
  }

  return (
    <>
      <div className="compare-title">
        <strong>{comparison.itemName}</strong>
        <span>
          {EN.ui.compare.slot}
          :
          {" "}
          {comparison.slotName}
        </span>
        <span>
          {EN.ui.compare.current}
          :
          {" "}
          {comparison.currentName}
        </span>
      </div>
      <table className="compare-table">
        <thead>
          <tr>
            <th>{EN.ui.compare.stat}</th>
            <th>{EN.ui.compare.current}</th>
            <th>{EN.ui.compare.candidate}</th>
            <th>{EN.ui.compare.delta}</th>
          </tr>
        </thead>
        <tbody>
          {comparison.rows.map((row) => (
            <tr key={`${row.label}-${row.currentValue}-${row.newValue}-${row.deltaValue}`}>
              <td>{row.label}</td>
              <td>{row.currentValue}</td>
              <td>{row.newValue}</td>
              <td>
                <span className={deltaClass(row.deltaValue, row.preferLower ?? false)}>
                  {signedFixed(row.deltaValue, row.deltaPrecision ?? 0)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

type InventoryOverlayProps = {
  run: DungeonRun;
  compareItemId: string | null;
};

export function InventoryOverlay(props: InventoryOverlayProps) {
  const rows = props.run.inventoryItems();

  return (
    <Window
      title={EN.ui.overlays.inventory.title}
      actions={<button data-action="close" type="button">{EN.ui.buttons.close}</button>}
    >
      <div className="inventory-layout">
        <ul className="item-list inventory">
          {rows.length === 0
            ? <li>{EN.ui.overlays.inventory.emptyBody}</li>
            : rows.map(({ item, action }) => (
              <li key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.describe()}</span>
                </div>
                <div className="item-actions">
                  {
                    action === "equip"
                      ? <button data-action="inv-equip" data-id={item.id} type="button">{EN.ui.buttons.equip}</button>
                      : action === "use"
                        ? <button data-action="inv-use" data-id={item.id} type="button">{EN.ui.buttons.use}</button>
                        : null
                  }
                  <button data-action="inv-drop" data-id={item.id} type="button">{EN.ui.buttons.drop}</button>
                </div>
              </li>
            ))}
        </ul>
        <aside className="equip-compare-panel">
          <h3>{EN.ui.overlays.inventory.equipComparisonTitle}</h3>
          <div data-equip-compare>
            <InventoryComparePanel run={props.run} itemId={props.compareItemId} />
          </div>
        </aside>
      </div>
    </Window>
  );
}
