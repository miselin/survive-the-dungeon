import type { BuildChoiceDefinition, BuildChoiceKind } from "./buildChoices";
import { SHOP_DISCOUNT_FOR_CHARISMA } from "./constants";
import { Creature } from "./creature";
import { Chest, Gold, InstantEffectItem, type Item, WieldableItem } from "./items";
import type { ShopServiceId as StockShopServiceId, ShopStockEntry } from "./lootAndShopStock";
import { EN } from "./strings/en";
import type { LogEntry } from "./types";

export type InventoryRenderable = {
  item: Item;
  action: "equip" | "use" | "none";
};

export type ShopServiceId = StockShopServiceId;
export type ShopEntry = ShopStockEntry;

type LogFn = (text: string, level?: LogEntry["level"]) => void;

type RemoveLatestChoiceFn = (kind: BuildChoiceKind) => BuildChoiceDefinition | null;

type LootStats = {
  goldEarned: number;
};

type ShopStats = {
  goldSpent: number;
};

export function inventoryItems(player: Creature): InventoryRenderable[] {
  return player.inventory.items().map((item) => {
    if (item instanceof WieldableItem) {
      return { item, action: "equip" };
    }
    if (item instanceof InstantEffectItem) {
      return { item, action: "use" };
    }
    return { item, action: "none" };
  });
}

export function equipInventoryItem(player: Creature, itemId: string, log: LogFn): void {
  const item = player.inventory.items().find((entry) => entry.id === itemId);
  if (!(item instanceof WieldableItem)) {
    return;
  }

  const slot = item.wieldsAt();
  const current = player.wieldpoints[slot];
  player.inventory.remove(item);
  player.wield(slot, item);

  if (current && current.name !== EN.game.startingGear.fists) {
    player.inventory.add(current);
  }

  log(EN.game.logs.equippedItem(item.name, slot), "success");
}

export function useInventoryItem(player: Creature, itemId: string, log: LogFn): void {
  const item = player.inventory.items().find((entry) => entry.id === itemId);
  if (!(item instanceof InstantEffectItem)) {
    return;
  }

  player.inventory.remove(item);
  const healed = player.applyInstantItem(item);
  log(EN.game.logs.inventoryItemRestored(item.name, healed), "success");
}

export function destroyInventoryItem(player: Creature, itemId: string, log: LogFn): void {
  const item = player.inventory.items().find((entry) => entry.id === itemId);
  if (!item) {
    return;
  }
  player.inventory.remove(item);
  log(EN.game.logs.destroyedItem(item.name), "warn");
}

type LootItemOptions = {
  chest: Chest;
  itemId: string;
  player: Creature;
  stats: LootStats;
  log: LogFn;
};

export function lootItemFromChest(options: LootItemOptions): void {
  const item = options.chest.items().find((entry) => entry.id === options.itemId);
  if (!item) {
    return;
  }

  if (item instanceof Gold) {
    options.player.give(item);
    options.stats.goldEarned += item.amount;
    options.chest.remove(item);
    options.log(EN.game.logs.lootedGold(item.amount), "success");
    return;
  }

  if (options.player.inventory.add(item)) {
    options.chest.remove(item);
    options.log(EN.game.logs.lootedItem(item.name), "success");
  } else {
    options.log(EN.game.logs.inventoryFull, "warn");
  }
}

type LootAllOptions = {
  chest: Chest;
  player: Creature;
  stats: LootStats;
  log: LogFn;
};

export function lootAllFromChest(options: LootAllOptions): void {
  const items = [...options.chest.items()];
  let filled = false;

  for (const item of items) {
    if (item instanceof Gold) {
      options.player.give(item);
      options.stats.goldEarned += item.amount;
      options.chest.remove(item);
      continue;
    }

    if (options.player.inventory.add(item)) {
      options.chest.remove(item);
    } else {
      filled = true;
    }
  }

  if (filled) {
    options.log(EN.game.logs.inventoryFullChestLeftovers, "warn");
  } else {
    options.log(EN.game.logs.lootedAllChest, "success");
  }
}

export function resolveShopEntries(
  shopStock: ShopEntry[],
  activePerks: BuildChoiceDefinition[],
  activeGambits: BuildChoiceDefinition[],
): ShopEntry[] {
  return shopStock.map((entry) => {
    if (entry.kind === "service" && entry.serviceId !== null) {
      if (entry.serviceId === "remove-perk") {
        const latest = activePerks[activePerks.length - 1];
        return {
          ...entry,
          description: latest
            ? EN.game.shop.descriptions.removePerk(latest.name)
            : EN.game.shop.descriptions.removePerkNone,
        };
      }

      if (entry.serviceId === "remove-gambit") {
        const latest = activeGambits[activeGambits.length - 1];
        return {
          ...entry,
          description: latest
            ? EN.game.shop.descriptions.removeGambit(latest.name)
            : EN.game.shop.descriptions.removeGambitNone,
        };
      }
    }

    return entry;
  });
}

export function computeShopEntryCost(entry: ShopEntry, player: Creature): number {
  const discount = SHOP_DISCOUNT_FOR_CHARISMA * player.attributes.modifier("chr");
  return Math.max(1, Math.floor(entry.value - (entry.value * discount)));
}

type BuyShopEntryOptions = {
  entryId: string;
  shopStock: ShopEntry[];
  player: Creature;
  stats: ShopStats;
  removeLatestChoice: RemoveLatestChoiceFn;
  log: LogFn;
};

export function buyShopEntry(options: BuyShopEntryOptions): void {
  const entry = options.shopStock.find((candidate) => candidate.id === options.entryId);
  if (!entry || entry.sold) {
    return;
  }

  const cost = computeShopEntryCost(entry, options.player);
  if (options.player.gold < cost) {
    options.log(EN.game.logs.notEnoughGold, "warn");
    return;
  }

  if (entry.kind === "service") {
    let applied = false;

    if (entry.serviceId === "bonus-point") {
      options.player.grantAttributePoint(1);
      options.log(EN.game.logs.boughtRespecToken, "success");
      applied = true;
    } else if (entry.serviceId === "remove-perk") {
      const removed = options.removeLatestChoice("perk");
      if (!removed) {
        options.log(EN.game.logs.noActivePerkToRemove, "warn");
        return;
      }
      options.log(EN.game.logs.removedPerk(removed.name), "success");
      applied = true;
    } else if (entry.serviceId === "remove-gambit") {
      const removed = options.removeLatestChoice("gambit");
      if (!removed) {
        options.log(EN.game.logs.noActiveGambitToRemove, "warn");
        return;
      }
      options.log(EN.game.logs.removedGambit(removed.name), "success");
      applied = true;
    }

    if (!applied) {
      return;
    }

    options.player.spendGold(cost);
    options.stats.goldSpent += cost;
    entry.sold = true;
    options.log(EN.game.logs.purchasedEntry(entry.name, cost), "success");
    return;
  }

  const item = entry.item;
  if (!item || item instanceof Gold) {
    options.log(EN.game.logs.goldCannotBePurchased, "warn");
    return;
  }

  if (!options.player.inventory.add(item)) {
    options.log(EN.game.logs.inventoryFull, "warn");
    return;
  }

  options.player.spendGold(cost);
  options.stats.goldSpent += cost;
  entry.sold = true;
  options.log(EN.game.logs.purchasedEntry(entry.name, cost), "success");
}
