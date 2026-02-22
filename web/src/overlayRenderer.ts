import { describeHealChoice, type CombatMoment } from "./combat";
import { type BuildChoice, type DungeonRun } from "./game";
import { Weapon, WieldableItem } from "./items";
import { EN } from "./strings/en";

export type CombatFxState = {
  moments: CombatMoment[];
  revealed: number;
  elapsedMs: number;
};

export type OverlayRenderView = {
  key: string;
  stateText: string;
  stateClass: string;
  modalHidden: boolean;
  modalHtml: string;
};

export type OverlayRenderRefs = {
  stateText: HTMLDivElement;
  modalBackdrop: HTMLDivElement;
  modal: HTMLDivElement;
};

function htmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

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

function comparisonRow(
  label: string,
  currentValue: string,
  newValue: string,
  deltaValue: number,
  preferLower = false,
  deltaPrecision = 0,
): string {
  return `
    <tr>
      <td>${htmlEscape(label)}</td>
      <td>${htmlEscape(currentValue)}</td>
      <td>${htmlEscape(newValue)}</td>
      <td><span class="${deltaClass(deltaValue, preferLower)}">${signedFixed(deltaValue, deltaPrecision)}</span></td>
    </tr>
  `;
}

function emptyComparisonPanel(): string {
  return `<p class="hint">${htmlEscape(EN.ui.compare.hoverHint)}</p>`;
}

function renderBuildChoices(choices: BuildChoice[], action: "boss-perk" | "boss-gambit"): string {
  return choices
    .map((choice) => `
      <li>
        <div>
          <strong>${htmlEscape(choice.name)}</strong>
          <span>${htmlEscape(choice.description)}</span>
        </div>
        <button data-action="${action}" data-id="${choice.id}" type="button">${EN.ui.buttons.pick}</button>
      </li>
    `)
    .join("");
}

function renderCombatMoment(moment: CombatMoment): string {
  if (moment.type === "roll") {
    const phaseLabel = moment.phase === "flee"
      ? EN.ui.combatFxMoments.phaseLabel.flee
      : moment.phase === "crit-check"
        ? EN.ui.combatFxMoments.phaseLabel.critCheck
        : moment.phase === "crit-confirm"
          ? EN.ui.combatFxMoments.phaseLabel.critConfirm
          : EN.ui.combatFxMoments.phaseLabel.toHit;
    const verdict = moment.success ? EN.ui.combatFxMoments.verdictSuccess : EN.ui.combatFxMoments.verdictFail;
    const verdictClass = moment.success ? "fx-good" : "fx-bad";

    return `
      <li class="fx-row">
        <div class="fx-die">d20 ${moment.roll}</div>
        <div class="fx-details">
          <strong>${htmlEscape(moment.actor)} ${phaseLabel}</strong>
          <span>${moment.roll} + ${moment.bonus} = ${moment.total} vs ${moment.target} (${htmlEscape(moment.defender)})</span>
          <span class="${verdictClass}">${verdict}</span>
        </div>
      </li>
    `;
  }

  if (moment.type === "damage") {
    return `
      <li class="fx-row">
        <div class="fx-die">${htmlEscape(moment.dice)} ${moment.roll}</div>
        <div class="fx-details">
          <strong>${htmlEscape(EN.ui.combatFxMoments.damageRollTitle(moment.actor))}</strong>
          <span>${htmlEscape(EN.ui.combatFxMoments.damageRollDetail(moment.roll, moment.multiplier, moment.final, moment.defender, moment.remainingHp))}</span>
        </div>
      </li>
    `;
  }

  if (moment.type === "heal") {
    return `
      <li class="fx-row">
        <div class="fx-die">+${moment.amount}</div>
        <div class="fx-details">
          <strong>${htmlEscape(EN.ui.combatFxMoments.healTitle(moment.actor))}</strong>
          <span>${htmlEscape(EN.ui.combatFxMoments.healDetail(moment.item, moment.amount))}</span>
        </div>
      </li>
    `;
  }

  const textClass = moment.level === "warn" ? "fx-bad" : moment.level === "success" ? "fx-good" : "";
  return `
    <li class="fx-row">
      <div class="fx-details">
        <strong class="${textClass}">${htmlEscape(moment.text)}</strong>
      </div>
    </li>
  `;
}

function buildEquipComparison(activeRun: DungeonRun, itemId: string): string {
  const picked = activeRun.inventoryItems().find((entry) => entry.item.id === itemId);
  if (!picked || !(picked.item instanceof WieldableItem)) {
    return emptyComparisonPanel();
  }

  const item = picked.item;
  const slot = item.wieldsAt();
  const current = activeRun.player.wieldpoints[slot];

  const currentAtk = current?.getAttackBonus() ?? 0;
  const currentDef = current?.getDefenseBonus() ?? 0;
  const newAtk = item.getAttackBonus();
  const newDef = item.getDefenseBonus();

  const rows = [
    comparisonRow(EN.ui.compare.atkBonus, signed(currentAtk), signed(newAtk), newAtk - currentAtk),
    comparisonRow(EN.ui.compare.defBonus, signed(currentDef), signed(newDef), newDef - currentDef),
  ];

  const currentWeapon = current instanceof Weapon ? current : null;
  const nextWeapon = item instanceof Weapon ? item : null;

  if (nextWeapon || currentWeapon) {
    const currentDice = currentWeapon?.damage() ?? EN.ui.compare.empty.toLowerCase();
    const nextDice = nextWeapon?.damage() ?? EN.ui.compare.empty.toLowerCase();
    const currentAvg = currentWeapon ? parseDiceAverage(currentDice) ?? 0 : 0;
    const nextAvg = nextWeapon ? parseDiceAverage(nextDice) ?? 0 : 0;

    rows.push(comparisonRow(EN.ui.compare.damageAvg, currentAvg.toFixed(1), nextAvg.toFixed(1), nextAvg - currentAvg, false, 1));
    rows.push(comparisonRow(
      EN.ui.compare.critRangeStart,
      currentWeapon ? `${currentWeapon.criticalRange()}` : EN.ui.compare.empty.toLowerCase(),
      nextWeapon ? `${nextWeapon.criticalRange()}` : EN.ui.compare.empty.toLowerCase(),
      (nextWeapon?.criticalRange() ?? 20) - (currentWeapon?.criticalRange() ?? 20),
      true,
    ));
    rows.push(comparisonRow(
      EN.ui.compare.critMult,
      currentWeapon ? `${currentWeapon.criticalMultiplier()}` : EN.ui.compare.empty.toLowerCase(),
      nextWeapon ? `${nextWeapon.criticalMultiplier()}` : EN.ui.compare.empty.toLowerCase(),
      (nextWeapon?.criticalMultiplier() ?? 1) - (currentWeapon?.criticalMultiplier() ?? 1),
    ));
  }

  return `
    <div class="compare-title">
      <strong>${htmlEscape(item.name)}</strong>
      <span>${htmlEscape(EN.ui.compare.slot)}: ${htmlEscape(slot)}</span>
      <span>${htmlEscape(EN.ui.compare.current)}: ${htmlEscape(current ? current.name : EN.ui.compare.empty)}</span>
    </div>
    <table class="compare-table">
      <thead>
        <tr>
          <th>${EN.ui.compare.stat}</th>
          <th>${EN.ui.compare.current}</th>
          <th>${EN.ui.compare.candidate}</th>
          <th>${EN.ui.compare.delta}</th>
        </tr>
      </thead>
      <tbody>${rows.join("")}</tbody>
    </table>
  `;
}

export function updateInventoryCompare(activeRun: DungeonRun | null, modal: HTMLDivElement | null, itemId: string | null): void {
  if (!activeRun || !modal || activeRun.overlay.type !== "inventory") {
    return;
  }
  const target = modal.querySelector<HTMLDivElement>("[data-equip-compare]");
  if (!target) {
    return;
  }
  target.innerHTML = itemId ? buildEquipComparison(activeRun, itemId) : emptyComparisonPanel();
}

function runSummary(activeRun: DungeonRun): string {
  return `
    <ul class="summary-list">
      <li>${EN.ui.runSummary.vanquished}: <b>${activeRun.stats.vanquished}</b></li>
      <li>${EN.ui.runSummary.goldEarned}: <b>${activeRun.stats.goldEarned}</b></li>
      <li>${EN.ui.runSummary.goldSpent}: <b>${activeRun.stats.goldSpent}</b></li>
      <li>${EN.ui.runSummary.goldLeftInChests}: <b>${activeRun.stats.goldLeftBehind}</b></li>
      <li>${EN.ui.runSummary.inventoryValue}: <b>${activeRun.stats.inventoryValue}</b></li>
      <li>${EN.ui.runSummary.xpGained}: <b>${activeRun.stats.xpGained}</b></li>
      <li>${EN.ui.runSummary.finalLevel}: <b>${activeRun.stats.level}</b></li>
      <li>${EN.ui.runSummary.floorReached}: <b>${activeRun.stats.floorReached}</b></li>
    </ul>
  `;
}

export function overlayRenderKey(activeRun: DungeonRun, combatFx: CombatFxState | null, combatSkipAll: boolean): string {
  if (combatFx) {
    return `combat-fx|${combatFx.revealed}|${combatFx.moments.length}|${combatSkipAll ? "1" : "0"}`;
  }

  if (activeRun.state === "dead" || activeRun.state === "won") {
    return [
      activeRun.state,
      activeRun.stats.vanquished,
      activeRun.stats.goldEarned,
      activeRun.stats.goldSpent,
      activeRun.stats.goldLeftBehind,
      activeRun.stats.inventoryValue,
      activeRun.stats.xpGained,
      activeRun.stats.level,
      activeRun.stats.floorReached,
    ].join("|");
  }

  if (activeRun.overlay.type === "none") {
    return "playing|none";
  }

  if (activeRun.overlay.type === "battle") {
    const enemy = activeRun.getBattleEnemy();
    return [
      "playing|battle",
      activeRun.overlay.mobId,
      activeRun.overlay.surpriseProtection ? "protected" : "normal",
      activeRun.player.hitpoints,
      enemy ? enemy.creature.hitpoints : "na",
      activeRun.logs.length,
      describeHealChoice(activeRun.player),
    ].join("|");
  }

  if (activeRun.overlay.type === "chest") {
    const chest = activeRun.getChest();
    return `playing|chest|${activeRun.overlay.chestId}|${chest ? chest.chest.count() : 0}|${activeRun.player.inventory.count()}|${activeRun.player.gold}`;
  }

  if (activeRun.overlay.type === "inventory") {
    return `playing|inventory|${activeRun.player.inventory.items().map((item) => item.id).join(",")}|${activeRun.player.hitpoints}|${activeRun.player.gold}`;
  }

  if (activeRun.overlay.type === "level-up") {
    return [
      "playing|level-up",
      activeRun.player.unspentStatPoints,
      activeRun.levelUpChoices().map((choice) => `${choice.attr}:${choice.value}`).join(","),
    ].join("|");
  }

  if (activeRun.overlay.type === "boss-reward") {
    const rewards = activeRun.getBossRewards();
    return [
      "playing|boss-reward",
      activeRun.floor,
      rewards ? rewards.perks.map((choice) => choice.id).join(",") : "none",
      rewards ? rewards.gambits.map((choice) => choice.id).join(",") : "none",
      activeRun.currentBuild().perks.length,
      activeRun.currentBuild().gambits.length,
    ].join("|");
  }

  if (activeRun.overlay.type === "shop-reward") {
    const rewards = activeRun.getShopRewardChoices();
    return [
      "playing|shop-reward",
      activeRun.floor,
      rewards ? rewards.map((choice) => `${choice.id}:${choice.description}`).join("|") : "none",
    ].join("|");
  }

  const sold = activeRun
    .shopEntries()
    .map((entry) => (entry.sold ? "1" : "0"))
    .join("");
  return `playing|shop|${sold}|${activeRun.player.gold}|${activeRun.player.inventory.count()}`;
}

export function renderOverlayView(activeRun: DungeonRun, combatFx: CombatFxState | null, combatSkipAll: boolean): OverlayRenderView {
  const key = overlayRenderKey(activeRun, combatFx, combatSkipAll);

  if (combatFx) {
    const shown = combatFx.moments.slice(0, Math.max(1, combatFx.revealed));
    const done = combatFx.revealed >= combatFx.moments.length;
    const knockoutMoment = shown
      .filter((moment): moment is Extract<CombatMoment, { type: "text" }> => moment.type === "text")
      .find((moment) => moment.text.endsWith("falls."));
    const knockoutClass = knockoutMoment
      ? (knockoutMoment.level === "warn" ? "fx-bad" : knockoutMoment.level === "success" ? "fx-good" : "")
      : "";

    return {
      key,
      stateText: EN.ui.stateText.floor(activeRun.floor),
      stateClass: "state-text",
      modalHidden: false,
      modalHtml: `
        <h2>${EN.ui.overlays.combatFx.title}</h2>
        <p class="hint">${EN.ui.overlays.combatFx.hint}</p>
        <label class="skip-all-toggle">
          <input type="checkbox" data-action="combat-fx-skip-all" ${combatSkipAll ? "checked" : ""} />
          ${EN.ui.overlays.combatFx.skipAll}
        </label>
        ${knockoutMoment ? `<p class="${knockoutClass}"><b>${htmlEscape(knockoutMoment.text)}</b></p>` : ""}
        <ul class="combat-fx-list">${shown.map((moment) => renderCombatMoment(moment)).join("")}</ul>
        <div class="row-actions">
          ${
            done
              ? `<button data-action="combat-fx-continue" type="button">${EN.ui.buttons.continue}</button>`
              : `<button data-action="combat-fx-skip" type="button">${EN.ui.buttons.skip}</button>`
          }
        </div>
      `,
    };
  }

  if (activeRun.state === "dead" || activeRun.state === "won") {
    const won = activeRun.state === "won";
    return {
      key,
      stateText: won ? EN.ui.stateText.cleared : EN.ui.stateText.defeated,
      stateClass: `state-text ${won ? "state-win" : "state-dead"}`,
      modalHidden: false,
      modalHtml: `
        <h2>${won ? EN.ui.overlays.runEnd.victoryTitle : EN.ui.overlays.runEnd.defeatTitle}</h2>
        <p>${won ? EN.ui.overlays.runEnd.victoryBody : EN.ui.overlays.runEnd.defeatBody}</p>
        ${runSummary(activeRun)}
        <button data-action="close" type="button">${EN.ui.buttons.close}</button>
      `,
    };
  }

  if (activeRun.overlay.type === "none") {
    return {
      key,
      stateText: EN.ui.stateText.floor(activeRun.floor),
      stateClass: "state-text",
      modalHidden: true,
      modalHtml: "",
    };
  }

  if (activeRun.overlay.type === "battle") {
    const enemy = activeRun.getBattleEnemy();
    if (!enemy) {
      return {
        key,
        stateText: EN.ui.stateText.floor(activeRun.floor),
        stateClass: "state-text",
        modalHidden: false,
        modalHtml: `
          <h2>${EN.ui.overlays.battle.noTargetTitle}</h2>
          <p>${EN.ui.overlays.battle.noTargetBody}</p>
          <button data-action="close" type="button">${EN.ui.buttons.close}</button>
        `,
      };
    }

    const battleLog = activeRun.logs
      .slice(-8)
      .map((entry) => `<li class="log-${entry.level}">${htmlEscape(entry.text)}</li>`)
      .join("");

    return {
      key,
      stateText: EN.ui.stateText.floor(activeRun.floor),
      stateClass: "state-text",
      modalHidden: false,
      modalHtml: `
        <h2>${htmlEscape(EN.ui.overlays.battle.title(enemy.creature.name))}</h2>
        <p>${EN.ui.overlays.battle.yourHp(activeRun.player.hitpoints, activeRun.player.currentMaxHitpoints())}</p>
        <p>${EN.ui.overlays.battle.enemyHp(enemy.creature.hitpoints, enemy.creature.maxHitpoints)}</p>
        ${activeRun.overlay.surpriseProtection ? `<p class="hint">${EN.ui.overlays.battle.ambushProtectionHint}</p>` : ""}
        <p class="hint">${htmlEscape(EN.ui.overlays.battle.healChoice(describeHealChoice(activeRun.player)))}</p>
        <div class="action-grid">
          <button data-action="combat-normal" type="button"><span>${EN.ui.overlays.battle.actions.normal.label}</span><small>${EN.ui.overlays.battle.actions.normal.subtitle}</small></button>
          <button data-action="combat-offensive" type="button"><span>${EN.ui.overlays.battle.actions.offensive.label}</span><small>${EN.ui.overlays.battle.actions.offensive.subtitle}</small></button>
          <button data-action="combat-defensive" type="button"><span>${EN.ui.overlays.battle.actions.defensive.label}</span><small>${EN.ui.overlays.battle.actions.defensive.subtitle}</small></button>
          <button data-action="combat-heal" type="button"><span>${EN.ui.overlays.battle.actions.heal.label}</span><small>${EN.ui.overlays.battle.actions.heal.subtitle}</small></button>
          <button data-action="combat-flee" type="button"><span>${EN.ui.overlays.battle.actions.flee.label}</span><small>${EN.ui.overlays.battle.actions.flee.subtitle}</small></button>
        </div>
        <h3>${EN.ui.sidebar.combatLog}</h3>
        <ul class="combat-log">${battleLog}</ul>
        <button data-action="close" type="button">${EN.ui.buttons.close}</button>
      `,
    };
  }

  if (activeRun.overlay.type === "level-up") {
    const rows = activeRun.levelUpChoices().map((choice) => `
      <li>
        <div>
          <strong>${htmlEscape(choice.label)} (${choice.value}, ${signed(choice.modifier)})</strong>
          <span>${htmlEscape(choice.description)}</span>
        </div>
        <button data-action="levelup-attr" data-id="${choice.attr}" type="button">${htmlEscape(EN.ui.overlays.levelUp.spend(choice.label))}</button>
      </li>
    `);

    return {
      key,
      stateText: EN.ui.stateText.floor(activeRun.floor),
      stateClass: "state-text",
      modalHidden: false,
      modalHtml: `
        <h2>${EN.ui.overlays.levelUp.title}</h2>
        <p>${EN.ui.overlays.levelUp.body(activeRun.player.unspentStatPoints)}</p>
        <ul class="item-list">${rows.join("")}</ul>
      `,
    };
  }

  if (activeRun.overlay.type === "boss-reward") {
    const rewards = activeRun.getBossRewards();
    const build = activeRun.currentBuild();
    if (!rewards) {
      return {
        key,
        stateText: EN.ui.stateText.floor(activeRun.floor),
        stateClass: "state-text",
        modalHidden: false,
        modalHtml: `
          <h2>${EN.ui.overlays.bossReward.emptyTitle}</h2>
          <p>${EN.ui.overlays.bossReward.emptyBody}</p>
          <button data-action="boss-none" type="button">${EN.ui.buttons.descend}</button>
        `,
      };
    }

    return {
      key,
      stateText: EN.ui.stateText.floor(activeRun.floor),
      stateClass: "state-text",
      modalHidden: false,
      modalHtml: `
        <h2>${EN.ui.overlays.bossReward.title}</h2>
        <p>${EN.ui.overlays.bossReward.body(activeRun.floor)}</p>
        <p class="hint">${EN.ui.overlays.bossReward.currentBuild(build.perks.length, build.gambits.length)}</p>
        <h3>${EN.ui.sidebar.perks}</h3>
        <ul class="item-list">${renderBuildChoices(rewards.perks, "boss-perk")}</ul>
        <h3>${EN.ui.sidebar.gambits}</h3>
        <ul class="item-list">${renderBuildChoices(rewards.gambits, "boss-gambit")}</ul>
        <button data-action="boss-none" type="button">${EN.ui.buttons.descendWithoutPicking}</button>
      `,
    };
  }

  if (activeRun.overlay.type === "shop-reward") {
    const rewards = activeRun.getShopRewardChoices();
    const rows = (rewards ?? []).map((choice) => `
      <li>
        <div>
          <strong>${htmlEscape(choice.title)}</strong>
          <span>${htmlEscape(choice.description)}</span>
        </div>
        <button data-action="shop-reward" data-id="${choice.id}" type="button">${EN.ui.buttons.claim}</button>
      </li>
    `);

    return {
      key,
      stateText: EN.ui.stateText.floor(activeRun.floor),
      stateClass: "state-text",
      modalHidden: false,
      modalHtml: `
        <h2>${EN.ui.overlays.shopReward.title}</h2>
        <p>${EN.ui.overlays.shopReward.body}</p>
        <ul class="item-list">${rows.join("")}</ul>
      `,
    };
  }

  if (activeRun.overlay.type === "chest") {
    const chest = activeRun.getChest();
    if (!chest) {
      return {
        key,
        stateText: EN.ui.stateText.floor(activeRun.floor),
        stateClass: "state-text",
        modalHidden: false,
        modalHtml: `
          <h2>${EN.ui.overlays.chest.title}</h2>
          <p>${EN.ui.overlays.chest.emptyBody}</p>
          <button data-action="close" type="button">${EN.ui.buttons.close}</button>
        `,
      };
    }

    const rows = chest.chest.items().map((item) => `
      <li>
        <span>${htmlEscape(item.name)} (${EN.ui.overlays.shop.price(item.value)})</span>
        <button data-action="loot" data-id="${item.id}" type="button">${EN.ui.buttons.loot}</button>
      </li>
    `);

    return {
      key,
      stateText: EN.ui.stateText.floor(activeRun.floor),
      stateClass: "state-text",
      modalHidden: false,
      modalHtml: `
        <h2>${EN.ui.overlays.chest.title}</h2>
        <ul class="item-list">${rows.join("") || `<li>${EN.ui.overlays.chest.nothingLeft}</li>`}</ul>
        <div class="row-actions">
          <button data-action="loot-all" type="button">${EN.ui.buttons.lootAll}</button>
          <button data-action="close" type="button">${EN.ui.buttons.close}</button>
        </div>
      `,
    };
  }

  if (activeRun.overlay.type === "inventory") {
    const rows = activeRun.inventoryItems().map(({ item, action }) => {
      const actionButton =
        action === "equip"
          ? `<button data-action="inv-equip" data-id="${item.id}" type="button">${EN.ui.buttons.equip}</button>`
          : action === "use"
            ? `<button data-action="inv-use" data-id="${item.id}" type="button">${EN.ui.buttons.use}</button>`
            : "";

      return `
        <li>
          <div>
            <strong>${htmlEscape(item.name)}</strong>
            <span>${htmlEscape(item.describe())}</span>
          </div>
          <div class="item-actions">
            ${actionButton}
            <button data-action="inv-drop" data-id="${item.id}" type="button">${EN.ui.buttons.drop}</button>
          </div>
        </li>
      `;
    });

    return {
      key,
      stateText: EN.ui.stateText.floor(activeRun.floor),
      stateClass: "state-text",
      modalHidden: false,
      modalHtml: `
        <h2>${EN.ui.overlays.inventory.title}</h2>
        <div class="inventory-layout">
          <ul class="item-list inventory">${rows.join("") || `<li>${EN.ui.overlays.inventory.emptyBody}</li>`}</ul>
          <aside class="equip-compare-panel">
            <h3>${EN.ui.overlays.inventory.equipComparisonTitle}</h3>
            <div data-equip-compare>${emptyComparisonPanel()}</div>
          </aside>
        </div>
        <button data-action="close" type="button">${EN.ui.buttons.close}</button>
      `,
    };
  }

  const rows = activeRun.shopEntries().map((entry) => {
    const sold = entry.sold;
    const cost = activeRun.shopEntryCost(entry);

    return `
      <li>
        <div>
          <strong>${htmlEscape(entry.name)}</strong>
          <span>${htmlEscape(entry.description)}</span>
          <span class="price">${EN.ui.overlays.shop.price(cost)}</span>
        </div>
        <button data-action="shop-buy" data-id="${entry.id}" type="button" ${sold ? "disabled" : ""}>${sold ? EN.ui.buttons.sold : EN.ui.buttons.buy}</button>
      </li>
    `;
  });

  return {
    key,
    stateText: EN.ui.stateText.floor(activeRun.floor),
    stateClass: "state-text",
    modalHidden: false,
    modalHtml: `
      <h2>${EN.ui.overlays.shop.title}</h2>
      <ul class="item-list shop">${rows.join("")}</ul>
      <button data-action="close" type="button">${EN.ui.buttons.close}</button>
    `,
  };
}

export function applyOverlayRenderView(refs: OverlayRenderRefs, view: OverlayRenderView): void {
  refs.stateText.textContent = view.stateText;
  refs.stateText.className = view.stateClass;
  refs.modalBackdrop.classList.toggle("hidden", view.modalHidden);
  refs.modal.innerHTML = view.modalHtml;
}

type RenderOverlayIntoDomOptions = {
  run: DungeonRun;
  combatFx: CombatFxState | null;
  combatSkipAll: boolean;
  previousKey: string;
  refs: OverlayRenderRefs;
};

export function renderOverlayIntoDom(options: RenderOverlayIntoDomOptions): string {
  const view = renderOverlayView(options.run, options.combatFx, options.combatSkipAll);
  if (view.key === options.previousKey) {
    return options.previousKey;
  }

  applyOverlayRenderView(options.refs, view);
  return view.key;
}
