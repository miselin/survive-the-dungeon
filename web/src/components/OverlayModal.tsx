import { describeHealChoice, type CombatMoment } from "../combat";
import type { DungeonRun } from "../game";
import type { CombatFxState } from "../combatFx";
import { overlayRenderKey } from "./overlay/overlayKey";
import { EN } from "../strings/en";
import { InventoryOverlay } from "./overlay/InventoryOverlay";
import { ShopOverlay } from "./overlay/ShopOverlay";
import { Window } from "./Window";

export type OverlayChrome = {
  key: string;
  stateText: string;
  stateClass: string;
  modalHidden: boolean;
  modalClass?: string;
  windowKey?: string;
};

export function buildOverlayChrome(activeRun: DungeonRun, combatFx: CombatFxState | null, combatSkipAll: boolean): OverlayChrome {
  const key = overlayRenderKey(activeRun, combatFx, combatSkipAll);

  if (combatFx) {
    return {
      key,
      stateText: EN.ui.stateText.floor(activeRun.floor),
      stateClass: "state-text",
      modalHidden: false,
      modalClass: "modal-combat-fx",
      windowKey: "combat-fx",
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

type OverlayModalProps = {
  run: DungeonRun;
  combatFx: CombatFxState | null;
  combatSkipAll: boolean;
  inventoryCompareItemId: string | null;
};

function combatMomentClass(level: "info" | "warn" | "success"): string {
  if (level === "warn") {
    return "fx-bad";
  }
  if (level === "success") {
    return "fx-good";
  }
  return "";
}

function renderCombatMoment(moment: CombatMoment) {
  if (moment.type === "roll") {
    const phaseLabel = moment.phase === "flee"
      ? EN.ui.combatFxMoments.phaseLabel.flee
      : moment.phase === "crit-check"
        ? EN.ui.combatFxMoments.phaseLabel.critCheck
        : moment.phase === "crit-confirm"
          ? EN.ui.combatFxMoments.phaseLabel.critConfirm
          : EN.ui.combatFxMoments.phaseLabel.toHit;

    return (
      <li className="fx-row" key={`${moment.type}-${moment.actor}-${moment.roll}-${moment.total}-${moment.target}`}>
        <div className="fx-die">
          d20
          {" "}
          {moment.roll}
        </div>
        <div className="fx-details">
          <strong>
            {moment.actor}
            {" "}
            {phaseLabel}
          </strong>
          <span>
            {moment.roll}
            {" + "}
            {moment.bonus}
            {" = "}
            {moment.total}
            {" vs "}
            {moment.target}
            {" ("}
            {moment.defender}
            {")"}
          </span>
          <span className={moment.success ? "fx-good" : "fx-bad"}>
            {moment.success ? EN.ui.combatFxMoments.verdictSuccess : EN.ui.combatFxMoments.verdictFail}
          </span>
        </div>
      </li>
    );
  }

  if (moment.type === "damage") {
    return (
      <li className="fx-row" key={`${moment.type}-${moment.actor}-${moment.roll}-${moment.final}-${moment.remainingHp}`}>
        <div className="fx-die">
          {moment.dice}
          {" "}
          {moment.roll}
        </div>
        <div className="fx-details">
          <strong>{EN.ui.combatFxMoments.damageRollTitle(moment.actor)}</strong>
          <span>{EN.ui.combatFxMoments.damageRollDetail(moment.roll, moment.multiplier, moment.final, moment.defender, moment.remainingHp)}</span>
        </div>
      </li>
    );
  }

  if (moment.type === "heal") {
    return (
      <li className="fx-row" key={`${moment.type}-${moment.actor}-${moment.item}-${moment.amount}`}>
        <div className="fx-die">
          +
          {moment.amount}
        </div>
        <div className="fx-details">
          <strong>{EN.ui.combatFxMoments.healTitle(moment.actor)}</strong>
          <span>{EN.ui.combatFxMoments.healDetail(moment.item, moment.amount)}</span>
        </div>
      </li>
    );
  }

  return (
    <li className="fx-row" key={`${moment.type}-${moment.text}`}>
      <div className="fx-details">
        <strong className={combatMomentClass(moment.level)}>{moment.text}</strong>
      </div>
    </li>
  );
}

function signed(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

export function OverlayModal(props: OverlayModalProps) {
  const activeRun = props.run;

  if (props.combatFx) {
    const shown = props.combatFx.moments.slice(0, Math.max(1, props.combatFx.revealed));
    const done = props.combatFx.revealed >= props.combatFx.moments.length;
    const knockoutMoment = shown
      .filter((moment): moment is Extract<CombatMoment, { type: "text" }> => moment.type === "text")
      .find((moment) => moment.text.endsWith("falls."));

    return (
      <Window
        title={EN.ui.overlays.combatFx.title}
        actions={
          done
            ? <button data-action="combat-fx-continue" type="button">{EN.ui.buttons.continue}</button>
            : <button data-action="combat-fx-skip" type="button">{EN.ui.buttons.skip}</button>
        }
      >
        <p className="hint">{EN.ui.overlays.combatFx.hint}</p>
        <label className="skip-all-toggle">
          <input
            type="checkbox"
            data-action="combat-fx-skip-all"
            checked={props.combatSkipAll}
            onChange={() => {}}
          />
          {EN.ui.overlays.combatFx.skipAll}
        </label>
        {
          knockoutMoment
            ? <p className={combatMomentClass(knockoutMoment.level)}><b>{knockoutMoment.text}</b></p>
            : null
        }
        <ul className="combat-fx-list">
          {shown.map((moment) => renderCombatMoment(moment))}
        </ul>
      </Window>
    );
  }

  if (activeRun.state === "dead" || activeRun.state === "won") {
    const won = activeRun.state === "won";

    return (
      <Window
        title={won ? EN.ui.overlays.runEnd.victoryTitle : EN.ui.overlays.runEnd.defeatTitle}
        actions={<button data-action="close" type="button">{EN.ui.buttons.close}</button>}
      >
        <p>{won ? EN.ui.overlays.runEnd.victoryBody : EN.ui.overlays.runEnd.defeatBody}</p>
        <ul className="summary-list">
          <li>
            {EN.ui.runSummary.vanquished}
            :
            {" "}
            <b>{activeRun.stats.vanquished}</b>
          </li>
          <li>
            {EN.ui.runSummary.goldEarned}
            :
            {" "}
            <b>{activeRun.stats.goldEarned}</b>
          </li>
          <li>
            {EN.ui.runSummary.goldSpent}
            :
            {" "}
            <b>{activeRun.stats.goldSpent}</b>
          </li>
          <li>
            {EN.ui.runSummary.goldLeftInChests}
            :
            {" "}
            <b>{activeRun.stats.goldLeftBehind}</b>
          </li>
          <li>
            {EN.ui.runSummary.inventoryValue}
            :
            {" "}
            <b>{activeRun.stats.inventoryValue}</b>
          </li>
          <li>
            {EN.ui.runSummary.xpGained}
            :
            {" "}
            <b>{activeRun.stats.xpGained}</b>
          </li>
          <li>
            {EN.ui.runSummary.finalLevel}
            :
            {" "}
            <b>{activeRun.stats.level}</b>
          </li>
          <li>
            {EN.ui.runSummary.floorReached}
            :
            {" "}
            <b>{activeRun.stats.floorReached}</b>
          </li>
        </ul>
      </Window>
    );
  }

  if (activeRun.overlay.type === "none") {
    return null;
  }

  if (activeRun.overlay.type === "battle") {
    const enemy = activeRun.getBattleEnemy();
    if (!enemy) {
      return (
        <Window
          title={EN.ui.overlays.battle.noTargetTitle}
          actions={<button data-action="close" type="button">{EN.ui.buttons.close}</button>}
        >
          <p>{EN.ui.overlays.battle.noTargetBody}</p>
        </Window>
      );
    }

    return (
      <Window
        title={EN.ui.overlays.battle.title(enemy.creature.name)}
        actions={<button data-action="close" type="button">{EN.ui.buttons.close}</button>}
      >
        <p>{EN.ui.overlays.battle.yourHp(activeRun.player.hitpoints, activeRun.player.currentMaxHitpoints())}</p>
        <p>{EN.ui.overlays.battle.enemyHp(enemy.creature.hitpoints, enemy.creature.maxHitpoints)}</p>
        {activeRun.overlay.surpriseProtection ? <p className="hint">{EN.ui.overlays.battle.ambushProtectionHint}</p> : null}
        <p className="hint">{EN.ui.overlays.battle.healChoice(describeHealChoice(activeRun.player))}</p>
        <div className="action-grid">
          <button data-action="combat-normal" type="button"><span>{EN.ui.overlays.battle.actions.normal.label}</span><small>{EN.ui.overlays.battle.actions.normal.subtitle}</small></button>
          <button data-action="combat-offensive" type="button"><span>{EN.ui.overlays.battle.actions.offensive.label}</span><small>{EN.ui.overlays.battle.actions.offensive.subtitle}</small></button>
          <button data-action="combat-defensive" type="button"><span>{EN.ui.overlays.battle.actions.defensive.label}</span><small>{EN.ui.overlays.battle.actions.defensive.subtitle}</small></button>
          <button data-action="combat-heal" type="button"><span>{EN.ui.overlays.battle.actions.heal.label}</span><small>{EN.ui.overlays.battle.actions.heal.subtitle}</small></button>
          <button data-action="combat-flee" type="button"><span>{EN.ui.overlays.battle.actions.flee.label}</span><small>{EN.ui.overlays.battle.actions.flee.subtitle}</small></button>
        </div>
        <h3>{EN.ui.sidebar.combatLog}</h3>
        <ul className="combat-log">
          {activeRun.logs.slice(-8).map((entry, index) => (
            <li key={`${index}-${entry.level}-${entry.text}`} className={`log-${entry.level}`}>{entry.text}</li>
          ))}
        </ul>
      </Window>
    );
  }

  if (activeRun.overlay.type === "level-up") {
    return (
      <Window title={EN.ui.overlays.levelUp.title}>
        <p>{EN.ui.overlays.levelUp.body(activeRun.player.unspentStatPoints)}</p>
        <ul className="item-list">
          {activeRun.levelUpChoices().map((choice) => (
            <li key={choice.attr}>
              <div>
                <strong>
                  {choice.label}
                  {" ("}
                  {choice.value}
                  {", "}
                  {signed(choice.modifier)}
                  {")"}
                </strong>
                <span>{choice.description}</span>
              </div>
              <button data-action="levelup-attr" data-id={choice.attr} type="button">{EN.ui.overlays.levelUp.spend(choice.label)}</button>
            </li>
          ))}
        </ul>
      </Window>
    );
  }

  if (activeRun.overlay.type === "boss-reward") {
    const rewards = activeRun.getBossRewards();

    if (!rewards) {
      return (
        <Window
          title={EN.ui.overlays.bossReward.emptyTitle}
          actions={<button data-action="boss-none" type="button">{EN.ui.buttons.descend}</button>}
        >
          <p>{EN.ui.overlays.bossReward.emptyBody}</p>
        </Window>
      );
    }

    const build = activeRun.currentBuild();

    return (
      <Window
        title={EN.ui.overlays.bossReward.title}
        actions={<button data-action="boss-none" type="button">{EN.ui.buttons.descendWithoutPicking}</button>}
      >
        <p>{EN.ui.overlays.bossReward.body(activeRun.floor)}</p>
        <p className="hint">{EN.ui.overlays.bossReward.currentBuild(build.perks.length, build.gambits.length)}</p>
        <h3>{EN.ui.sidebar.perks}</h3>
        <ul className="item-list">
          {rewards.perks.map((choice) => (
            <li key={choice.id}>
              <div>
                <strong>{choice.name}</strong>
                <span>{choice.description}</span>
              </div>
              <button data-action="boss-perk" data-id={choice.id} type="button">{EN.ui.buttons.pick}</button>
            </li>
          ))}
        </ul>
        <h3>{EN.ui.sidebar.gambits}</h3>
        <ul className="item-list">
          {rewards.gambits.map((choice) => (
            <li key={choice.id}>
              <div>
                <strong>{choice.name}</strong>
                <span>{choice.description}</span>
              </div>
              <button data-action="boss-gambit" data-id={choice.id} type="button">{EN.ui.buttons.pick}</button>
            </li>
          ))}
        </ul>
      </Window>
    );
  }

  if (activeRun.overlay.type === "shop-reward") {
    const rewards = activeRun.getShopRewardChoices() ?? [];

    return (
      <Window title={EN.ui.overlays.shopReward.title}>
        <p>{EN.ui.overlays.shopReward.body}</p>
        <ul className="item-list">
          {rewards.map((choice) => (
            <li key={choice.id}>
              <div>
                <strong>{choice.title}</strong>
                <span>{choice.description}</span>
              </div>
              <button data-action="shop-reward" data-id={choice.id} type="button">{EN.ui.buttons.claim}</button>
            </li>
          ))}
        </ul>
      </Window>
    );
  }

  if (activeRun.overlay.type === "chest") {
    const chest = activeRun.getChest();

    if (!chest) {
      return (
        <Window
          title={EN.ui.overlays.chest.title}
          actions={<button data-action="close" type="button">{EN.ui.buttons.close}</button>}
        >
          <p>{EN.ui.overlays.chest.emptyBody}</p>
        </Window>
      );
    }

    const chestItems = chest.chest.items();

    return (
      <Window
        title={EN.ui.overlays.chest.title}
        actions={
          <>
            <button data-action="loot-all" type="button">{EN.ui.buttons.lootAll}</button>
            <button data-action="close" type="button">{EN.ui.buttons.close}</button>
          </>
        }
      >
        <ul className="item-list">
          {chestItems.length === 0
            ? <li>{EN.ui.overlays.chest.nothingLeft}</li>
            : chestItems.map((item) => (
              <li key={item.id}>
                <span>
                  {item.name}
                  {" ("}
                  {EN.ui.overlays.shop.price(item.value)}
                  {")"}
                </span>
                <button data-action="loot" data-id={item.id} type="button">{EN.ui.buttons.loot}</button>
              </li>
            ))}
        </ul>
      </Window>
    );
  }

  if (activeRun.overlay.type === "inventory") {
    return <InventoryOverlay run={activeRun} compareItemId={props.inventoryCompareItemId} />;
  }

  return <ShopOverlay run={activeRun} />;
}
