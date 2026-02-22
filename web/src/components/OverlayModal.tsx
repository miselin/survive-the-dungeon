import { useEffect, useRef } from "react";
import {
  describeHealChoice,
  type CombatMoment,
  type PlayerAction,
} from "../combat";
import type { DungeonRun, LevelUpAttribute, ShopRewardChoice } from "../game";
import type { CombatFxState } from "../combatFx";
import { EN } from "../strings/en";
import { InventoryOverlay } from "./overlay/InventoryOverlay";
import { ShopOverlay } from "./overlay/ShopOverlay";
import { Window } from "./Window";

type OverlayModalProps = {
  run: DungeonRun;
  combatFx: CombatFxState | null;
  combatSkipAll: boolean;
  inventoryCompareItemId: string | null;
  onInventoryCompareItemChange: (itemId: string | null) => void;
  onClose: () => void;
  onCombatAction: (action: PlayerAction) => void;
  onCombatFxSkip: () => void;
  onCombatFxContinue: () => void;
  onCombatFxSkipAllChange: (enabled: boolean) => void;
  onLoot: (itemId: string) => void;
  onLootAll: () => void;
  onInventoryEquip: (itemId: string) => void;
  onInventoryUse: (itemId: string) => void;
  onInventoryDrop: (itemId: string) => void;
  onShopBuy: (entryId: string) => void;
  onLevelUpAttribute: (attr: LevelUpAttribute) => void;
  onBossPerk: (choiceId: string) => void;
  onBossGambit: (choiceId: string) => void;
  onBossNone: () => void;
  onShopReward: (choiceId: ShopRewardChoice["id"]) => void;
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
    const phaseLabel =
      moment.phase === "flee"
        ? EN.ui.combatFxMoments.phaseLabel.flee
        : moment.phase === "crit-check"
          ? EN.ui.combatFxMoments.phaseLabel.critCheck
          : moment.phase === "crit-confirm"
            ? EN.ui.combatFxMoments.phaseLabel.critConfirm
            : EN.ui.combatFxMoments.phaseLabel.toHit;

    return (
      <li
        className="fx-row"
        key={`${moment.type}-${moment.actor}-${moment.roll}-${moment.total}-${moment.target}`}
      >
        <div className="fx-die">d20 {moment.roll}</div>
        <div className="fx-details">
          <strong>
            {moment.actor} {phaseLabel}
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
            {moment.success
              ? EN.ui.combatFxMoments.verdictSuccess
              : EN.ui.combatFxMoments.verdictFail}
          </span>
        </div>
      </li>
    );
  }

  if (moment.type === "damage") {
    return (
      <li
        className="fx-row"
        key={`${moment.type}-${moment.actor}-${moment.roll}-${moment.final}-${moment.remainingHp}`}
      >
        <div className="fx-die">
          {moment.dice} {moment.roll}
        </div>
        <div className="fx-details">
          <strong>{EN.ui.combatFxMoments.damageRollTitle(moment.actor)}</strong>
          <span>
            {EN.ui.combatFxMoments.damageRollDetail(
              moment.roll,
              moment.multiplier,
              moment.final,
              moment.defender,
              moment.remainingHp,
            )}
          </span>
        </div>
      </li>
    );
  }

  if (moment.type === "heal") {
    return (
      <li
        className="fx-row"
        key={`${moment.type}-${moment.actor}-${moment.item}-${moment.amount}`}
      >
        <div className="fx-die">+{moment.amount}</div>
        <div className="fx-details">
          <strong>{EN.ui.combatFxMoments.healTitle(moment.actor)}</strong>
          <span>
            {EN.ui.combatFxMoments.healDetail(moment.item, moment.amount)}
          </span>
        </div>
      </li>
    );
  }

  return (
    <li className="fx-row" key={`${moment.type}-${moment.text}`}>
      <div className="fx-details">
        <strong className={combatMomentClass(moment.level)}>
          {moment.text}
        </strong>
      </div>
    </li>
  );
}

function signed(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

export function OverlayModal(props: OverlayModalProps) {
  const activeRun = props.run;
  const combatFxListRef = useRef<HTMLUListElement | null>(null);
  const battleLogRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const list = combatFxListRef.current;
    if (!list || !props.combatFx) {
      return;
    }
    list.scrollTop = list.scrollHeight;
  }, [props.combatFx?.revealed, props.combatFx?.moments.length]);

  useEffect(() => {
    const list = battleLogRef.current;
    if (!list || props.combatFx || activeRun.overlay.type !== "battle") {
      return;
    }
    list.scrollTop = list.scrollHeight;
  }, [props.combatFx, activeRun.overlay.type, activeRun.logs.length]);

  if (props.combatFx) {
    const shown = props.combatFx.moments.slice(
      0,
      Math.max(1, props.combatFx.revealed),
    );
    const done = props.combatFx.revealed >= props.combatFx.moments.length;
    const knockoutMoment = shown
      .filter(
        (moment): moment is Extract<CombatMoment, { type: "text" }> =>
          moment.type === "text",
      )
      .find((moment) => moment.text.endsWith("falls."));

    return (
      <Window
        title={EN.ui.overlays.combatFx.title}
        actions={
          done ? (
            <button type="button" onClick={props.onCombatFxContinue}>
              {EN.ui.buttons.continue}
            </button>
          ) : (
            <button type="button" onClick={props.onCombatFxSkip}>
              {EN.ui.buttons.skip}
            </button>
          )
        }
      >
        <p className="hint">{EN.ui.overlays.combatFx.hint}</p>
        <label className="skip-all-toggle">
          <input
            type="checkbox"
            checked={props.combatSkipAll}
            onChange={(event) => {
              props.onCombatFxSkipAllChange(event.target.checked);
            }}
          />
          {EN.ui.overlays.combatFx.skipAll}
        </label>
        {knockoutMoment ? (
          <p className={combatMomentClass(knockoutMoment.level)}>
            <b>{knockoutMoment.text}</b>
          </p>
        ) : null}
        <ul ref={combatFxListRef} className="combat-fx-list">
          {shown.map((moment) => renderCombatMoment(moment))}
        </ul>
      </Window>
    );
  }

  if (activeRun.state === "dead" || activeRun.state === "won") {
    const won = activeRun.state === "won";

    return (
      <Window
        title={
          won
            ? EN.ui.overlays.runEnd.victoryTitle
            : EN.ui.overlays.runEnd.defeatTitle
        }
        actions={
          <button type="button" onClick={props.onClose}>
            {EN.ui.buttons.close}
          </button>
        }
      >
        <p>
          {won
            ? EN.ui.overlays.runEnd.victoryBody
            : EN.ui.overlays.runEnd.defeatBody}
        </p>
        <ul className="summary-list">
          <li>
            {EN.ui.runSummary.vanquished}: <b>{activeRun.stats.vanquished}</b>
          </li>
          <li>
            {EN.ui.runSummary.goldEarned}: <b>{activeRun.stats.goldEarned}</b>
          </li>
          <li>
            {EN.ui.runSummary.goldSpent}: <b>{activeRun.stats.goldSpent}</b>
          </li>
          <li>
            {EN.ui.runSummary.goldLeftInChests}:{" "}
            <b>{activeRun.stats.goldLeftBehind}</b>
          </li>
          <li>
            {EN.ui.runSummary.inventoryValue}:{" "}
            <b>{activeRun.stats.inventoryValue}</b>
          </li>
          <li>
            {EN.ui.runSummary.xpGained}: <b>{activeRun.stats.xpGained}</b>
          </li>
          <li>
            {EN.ui.runSummary.finalLevel}: <b>{activeRun.stats.level}</b>
          </li>
          <li>
            {EN.ui.runSummary.floorReached}:{" "}
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
          actions={
            <button type="button" onClick={props.onClose}>
              {EN.ui.buttons.close}
            </button>
          }
        >
          <p>{EN.ui.overlays.battle.noTargetBody}</p>
        </Window>
      );
    }

    return (
      <Window
        title={EN.ui.overlays.battle.title(enemy.creature.name)}
        actions={
          <button type="button" onClick={props.onClose}>
            {EN.ui.buttons.close}
          </button>
        }
      >
        <p>
          {EN.ui.overlays.battle.yourHp(
            activeRun.player.hitpoints,
            activeRun.player.currentMaxHitpoints(),
          )}
        </p>
        <p>
          {EN.ui.overlays.battle.enemyHp(
            enemy.creature.hitpoints,
            enemy.creature.maxHitpoints,
          )}
        </p>
        {activeRun.overlay.surpriseProtection ? (
          <p className="hint">{EN.ui.overlays.battle.ambushProtectionHint}</p>
        ) : null}
        <p className="hint">
          {EN.ui.overlays.battle.healChoice(
            describeHealChoice(activeRun.player),
          )}
        </p>
        <div className="action-grid">
          <button
            type="button"
            onClick={() => {
              props.onCombatAction("normal");
            }}
          >
            <span>{EN.ui.overlays.battle.actions.normal.label}</span>
            <small>{EN.ui.overlays.battle.actions.normal.subtitle}</small>
          </button>
          <button
            type="button"
            onClick={() => {
              props.onCombatAction("offensive");
            }}
          >
            <span>{EN.ui.overlays.battle.actions.offensive.label}</span>
            <small>{EN.ui.overlays.battle.actions.offensive.subtitle}</small>
          </button>
          <button
            type="button"
            onClick={() => {
              props.onCombatAction("defensive");
            }}
          >
            <span>{EN.ui.overlays.battle.actions.defensive.label}</span>
            <small>{EN.ui.overlays.battle.actions.defensive.subtitle}</small>
          </button>
          <button
            type="button"
            onClick={() => {
              props.onCombatAction("heal");
            }}
          >
            <span>{EN.ui.overlays.battle.actions.heal.label}</span>
            <small>{EN.ui.overlays.battle.actions.heal.subtitle}</small>
          </button>
          <button
            type="button"
            onClick={() => {
              props.onCombatAction("flee");
            }}
          >
            <span>{EN.ui.overlays.battle.actions.flee.label}</span>
            <small>{EN.ui.overlays.battle.actions.flee.subtitle}</small>
          </button>
        </div>
        <h3>{EN.ui.sidebar.combatLog}</h3>
        <ul ref={battleLogRef} className="combat-log">
          {activeRun.logs.slice(-8).map((entry, index) => (
            <li
              key={`${index}-${entry.level}-${entry.text}`}
              className={`log-${entry.level}`}
            >
              {entry.text}
            </li>
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
              <button
                type="button"
                onClick={() => {
                  props.onLevelUpAttribute(choice.attr as LevelUpAttribute);
                }}
              >
                {EN.ui.overlays.levelUp.spend(choice.label)}
              </button>
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
          actions={
            <button type="button" onClick={props.onBossNone}>
              {EN.ui.buttons.descend}
            </button>
          }
        >
          <p>{EN.ui.overlays.bossReward.emptyBody}</p>
        </Window>
      );
    }

    const build = activeRun.currentBuild();

    return (
      <Window
        title={EN.ui.overlays.bossReward.title}
        actions={
          <button type="button" onClick={props.onBossNone}>
            {EN.ui.buttons.descendWithoutPicking}
          </button>
        }
      >
        <p>{EN.ui.overlays.bossReward.body(activeRun.floor)}</p>
        <p className="hint">
          {EN.ui.overlays.bossReward.currentBuild(
            build.perks.length,
            build.gambits.length,
          )}
        </p>
        <h3>{EN.ui.sidebar.perks}</h3>
        <ul className="item-list">
          {rewards.perks.map((choice) => (
            <li key={choice.id}>
              <div>
                <strong>{choice.name}</strong>
                <span>{choice.description}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  props.onBossPerk(choice.id);
                }}
              >
                {EN.ui.buttons.pick}
              </button>
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
              <button
                type="button"
                onClick={() => {
                  props.onBossGambit(choice.id);
                }}
              >
                {EN.ui.buttons.pick}
              </button>
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
              <button
                type="button"
                onClick={() => {
                  props.onShopReward(choice.id);
                }}
              >
                {EN.ui.buttons.claim}
              </button>
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
          actions={
            <button type="button" onClick={props.onClose}>
              {EN.ui.buttons.close}
            </button>
          }
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
            <button type="button" onClick={props.onLootAll}>
              {EN.ui.buttons.lootAll}
            </button>
            <button type="button" onClick={props.onClose}>
              {EN.ui.buttons.close}
            </button>
          </>
        }
      >
        <ul className="item-list">
          {chestItems.length === 0 ? (
            <li>{EN.ui.overlays.chest.nothingLeft}</li>
          ) : (
            chestItems.map((item) => (
              <li key={item.id}>
                <span>
                  {item.name}
                  {" ("}
                  {EN.ui.overlays.shop.price(item.value)}
                  {")"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    props.onLoot(item.id);
                  }}
                >
                  {EN.ui.buttons.loot}
                </button>
              </li>
            ))
          )}
        </ul>
      </Window>
    );
  }

  if (activeRun.overlay.type === "inventory") {
    return (
      <InventoryOverlay
        run={activeRun}
        compareItemId={props.inventoryCompareItemId}
        onCompareItemChange={props.onInventoryCompareItemChange}
        onClose={props.onClose}
        onEquipItem={props.onInventoryEquip}
        onUseItem={props.onInventoryUse}
        onDropItem={props.onInventoryDrop}
      />
    );
  }

  return (
    <ShopOverlay
      run={activeRun}
      onClose={props.onClose}
      onBuy={props.onShopBuy}
    />
  );
}
