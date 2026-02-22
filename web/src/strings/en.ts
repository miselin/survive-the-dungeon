import type { AttributeName } from "../attributes";
import {
  SHOP_REWARD_FALLBACK_GOLD,
  SHOP_REWARD_HEAL_FALLBACK_RATIO,
} from "../constants";

const attributeLabels: Record<AttributeName, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  chr: "Charisma",
};

const attributeDescriptions: Record<AttributeName, string> = {
  str: "Increases hit chance and boosts aggressive builds.",
  dex: "Improves defense and flee reliability.",
  con: "Raises max HP and durability.",
  int: "Aptitude for lore and study.",
  wis: "Aptitude for instincts and awareness.",
  chr: "Improves shop discounts.",
};

export const EN = {
  ui: {
    appTitle: "Survive the Dungeon",
    menuSubtitle:
      "Descend floor by floor, gather gear, and survive the boss gauntlet.",
    seedInputLabel: "Seed phrase (optional)",
    seedInputPlaceholder: "e.g. goblin-market-17",
    startRunButton: "Start Run",
    menuHelp:
      "Leave blank for a unique seed each run. Keyboard: WASD / arrows, M toggles reveal-map debug. Mobile: on-screen d-pad.",
    seedPrefix: "Seed",
    mapAriaLabel: "Dungeon map",
    room: {
      shop: "Shop",
      dungeon: "Dungeon",
      hall: "Hall",
    },
    buttons: {
      save: "Save",
      load: "Load",
      resumeLast: "Resume Last",
      inventory: "Inventory",
      shop: "Shop",
      revealMap: "Reveal Map",
      hideMap: "Hide Map",
      newRun: "New Run",
      close: "Close",
      pick: "Pick",
      claim: "Claim",
      loot: "Loot",
      lootAll: "Loot All",
      equip: "Equip",
      use: "Use",
      drop: "Drop",
      buy: "Buy",
      sold: "Sold",
      continue: "Continue",
      skip: "Skip",
      descend: "Descend",
      descendWithoutPicking: "Descend Without Picking",
    },
    saves: {
      loadPrompt: "Paste a save token or a full resume URL.",
      loadFailed: "That save token could not be loaded.",
      noLatestSave: "No recent local save is available.",
      tokenCopied: "Save token copied to clipboard.",
      shareUrlCopied: "Resume URL copied to clipboard.",
      copyTokenPrompt: "Copy this save token:",
      copyShareUrlPrompt: "Copy this resume URL:",
    },
    sidebar: {
      logTitle: "Log",
      buildModifiers: "Build Modifiers",
      wieldedGear: "Wielded Gear",
      combatLog: "Combat Log",
      perks: "Perks",
      gambits: "Gambits",
    },
    stateText: {
      floor: (floor: number): string => `Floor ${floor}`,
      cleared: "Dungeon cleared",
      defeated: "You were defeated",
    },
    stats: {
      hp: (hp: number, cap: number): string => `HP ${hp} / ${cap}`,
      xp: (xp: number, next: number): string => `XP ${xp} / ${next}`,
      floor: "Floor",
      gold: "Gold",
      level: "Level",
      unspentStats: "Unspent Stats",
      enemiesLeft: "Enemies Left",
      room: "Room",
      threat: "Threat",
    },
    threat: {
      unknown: "Unknown",
      safe: "Safe",
      deadly: (level: number): string => `L${level} Deadly`,
      risky: (level: number): string => `L${level} Risky`,
      manageable: (level: number): string => `L${level} Manageable`,
    },
    buildSummaryNone: "No active perks or gambits yet.",
    runSummary: {
      vanquished: "Vanquished",
      goldEarned: "Gold earned",
      goldSpent: "Gold spent",
      goldLeftInChests: "Gold left in chests",
      inventoryValue: "Inventory value",
      xpGained: "XP gained",
      finalLevel: "Final level",
      floorReached: "Floor reached",
    },
    compare: {
      hoverHint:
        "Hover or focus an Equip button to compare with your currently wielded gear.",
      atkBonus: "ATK Bonus",
      defBonus: "DEF Bonus",
      damageAvg: "Damage Avg",
      critRangeStart: "Crit Range Start",
      critMult: "Crit Mult",
      slot: "Slot",
      current: "Current",
      empty: "Empty",
      stat: "Stat",
      candidate: "Candidate",
      delta: "Delta",
    },
    overlays: {
      runEnd: {
        victoryTitle: "Victory",
        defeatTitle: "Defeat",
        victoryBody: "You cleared every enemy in the dungeon.",
        defeatBody: "The dungeon consumed you.",
      },
      combatFx: {
        title: "Combat Roll",
        hint: "Watch the checks resolve moment by moment.",
        skipAll: "Skip all combat roll animations",
      },
      battle: {
        title: (enemyName: string): string => `Battle: ${enemyName}`,
        noTargetTitle: "Battle",
        noTargetBody: "No target.",
        yourHp: (current: number, max: number): string =>
          `Your HP: ${current}/${max}`,
        enemyHp: (current: number, max: number): string =>
          `Enemy HP: ${current}/${max}`,
        ambushProtectionHint:
          "Ambush protection active: enemy opening strike weakened and flee is easier.",
        healChoice: (choice: string): string => `Heal choice: ${choice}`,
        actions: {
          normal: { label: "Normal", subtitle: "1.0x damage, 1.0x defense" },
          offensive: {
            label: "Offensive",
            subtitle: "2.0x damage, 0.3x defense",
          },
          defensive: {
            label: "Defensive",
            subtitle: "0.5x damage, 1.5x defense",
          },
          heal: { label: "Heal", subtitle: "Use best healing item" },
          flee: { label: "Flee", subtitle: "Dexterity check to escape" },
        },
      },
      levelUp: {
        title: "Level Up",
        body: (unspent: number): string =>
          `Spend your stat point to shape your build. Unspent: ${unspent}`,
        spend: (label: string): string => `+1 ${label}`,
      },
      bossReward: {
        title: "Boss Defeated",
        emptyTitle: "Boss Reward",
        emptyBody: "No rewards available.",
        body: (floor: number): string =>
          `Floor ${floor} boss is down. Take a Perk, embrace a Gambit, or descend unchanged.`,
        currentBuild: (perks: number, gambits: number): string =>
          `Current build: ${perks} Perk(s), ${gambits} Gambit(s)`,
      },
      shopReward: {
        title: "Shop Discovery Reward",
        body: "Finding the shop grants a free build-control reward. Pick one:",
      },
      chest: {
        title: "Chest",
        emptyBody: "Empty chest.",
        nothingLeft: "Nothing left.",
      },
      inventory: {
        title: "Inventory",
        emptyBody: "Inventory is empty.",
        equipComparisonTitle: "Equip Comparison",
      },
      shop: {
        title: "Shop",
        price: (cost: number): string => `${cost}g`,
        itemValue: (value: number): string => `${value}g`,
      },
    },
    combatFxMoments: {
      phaseLabel: {
        toHit: "To Hit",
        critCheck: "Critical Threat",
        critConfirm: "Critical Confirm",
        flee: "Flee Check",
      },
      verdictSuccess: "Success",
      verdictFail: "Fail",
      damageRollTitle: (actor: string): string => `${actor} damage roll`,
      damageRollDetail: (
        roll: number,
        multiplier: number,
        final: number,
        defender: string,
        remainingHp: number,
      ): string =>
        `${roll} x ${multiplier.toFixed(2)} = ${final} damage to ${defender} (now ${remainingHp} HP)`,
      healTitle: (actor: string): string => `${actor} heals`,
      healDetail: (item: string, amount: number): string =>
        `${item} restores ${amount} HP`,
    },
  },
  combat: {
    logs: {
      playerCritical: (attacker: string, multiplier: number): string =>
        `${attacker} rolls a CRITICAL hit! Damage x${multiplier}.`,
      playerCriticalMoment: (attacker: string, multiplier: number): string =>
        `${attacker} rolls a critical hit! Damage multiplied by ${multiplier}x.`,
      enemyCritical: (attacker: string): string =>
        `${attacker} lands a CRITICAL hit!`,
      enemyCriticalDowngrade: (attacker: string): string =>
        `${attacker} almost crit, but only lands a normal hit.`,
      reducedDamageHit: (
        attacker: string,
        armorClass: number,
        totalAttack: number,
      ): string =>
        `${attacker} fails to beat AC ${armorClass} (${totalAttack}) and deals reduced damage.`,
      hit: (
        attacker: string,
        totalAttack: number,
        armorClass: number,
      ): string => `${attacker} hits (${totalAttack} vs AC ${armorClass}).`,
      damage: (
        attacker: string,
        damage: number,
        defender: string,
        remainingHp: number,
      ): string =>
        `${attacker} deals ${damage} damage to ${defender} (now ${remainingHp} HP).`,
      falls: (defender: string): string => `${defender} falls.`,
      offensiveStance: "You commit to an offensive strike.",
      defensiveStance: "You take a defensive stance.",
      fleeSuccess: (score: number, dc: number): string =>
        `You escape (roll ${score} vs ${dc}).`,
      fleeSuccessMoment: (score: number, dc: number): string =>
        `Escape succeeded (${score} vs ${dc}).`,
      fleeFail: (score: number, dc: number): string =>
        `Retreat failed (roll ${score} vs ${dc}).`,
      fleeFailMoment: (score: number, dc: number): string =>
        `Escape failed (${score} vs ${dc}).`,
      heal: (itemName: string, amount: number): string =>
        `You use ${itemName} and restore ${amount} HP.`,
      noHealingItem: "You have no healing item.",
      noHealingMoment: "No healing item available.",
      enemyStyle: (enemyName: string, styleName: string): string =>
        `${enemyName} uses ${styleName}.`,
    },
    enemyStyles: {
      guarded: "guarded strike",
      reckless: "reckless swing",
      steady: "steady attack",
    },
    healChoiceNone: "No healing item",
    healChoiceItem: (itemName: string, hpBoost: number): string =>
      `${itemName} (+${hpBoost} HP)`,
  },
  game: {
    names: {
      player: "Player",
      dungeonBoss: "Dungeon Boss",
    },
    labels: {
      perk: "Perk",
      gambit: "Gambit",
      wieldingNothing: "Wielding nothing.",
    },
    startingGear: {
      fists: "Fists",
      clothArmor: "Cloth Armor",
      leatherBoots: "Leather Boots",
    },
    itemNames: {
      bandages: "Bandages",
      healthPotion: "Health Potion",
      largeHealthPotion: "Large Health Potion",
      hugeHealthPotion: "Huge Health Potion",
      colossalHealthPotion: "Colossal Health Potion",
      instaheal: "Instaheal",
    },
    attributeLabels,
    attributeDescriptions,
    buildChoices: {
      perks: {
        ironFrame: {
          name: "Iron Frame",
          description: "+28 max HP and +2 DEF.",
        },
        duelistInstinct: {
          name: "Duelist Instinct",
          description: "+3 ATK and +1 DEX.",
        },
        scavengerWits: {
          name: "Scavenger Wits",
          description: "+2 STR and +2 CHR.",
        },
        relentlessEdge: {
          name: "Relentless Edge",
          description: "Deal 20% more damage.",
        },
        wardingShell: {
          name: "Warding Shell",
          description: "Take 15% less damage.",
        },
      },
      gambits: {
        bloodOath: {
          name: "Blood Oath",
          description: "Deal 2x damage, but HP is capped at 50%.",
        },
        berserkerStance: {
          name: "Berserker Stance",
          description: "+6 ATK, but -4 DEF.",
        },
        hollowCore: {
          name: "Hollow Core",
          description: "Deal 60% more damage, but lose 25 max HP.",
        },
        mirroredPain: {
          name: "Mirrored Pain",
          description: "Deal 35% more damage, but take 70% more damage.",
        },
        brittleFocus: {
          name: "Brittle Focus",
          description: "+4 STR and +4 DEX, but -3 CON.",
        },
      },
    },
    shop: {
      services: {
        bonusPoint: {
          name: "Stat Respec Token",
          description: "Gain 1 stat point immediately.",
        },
        removePerk: {
          name: "Perk Reforge",
          description: "Remove your latest Perk.",
        },
        removeGambit: {
          name: "Gambit Cleanse",
          description: "Remove your latest Gambit.",
        },
      },
      rewards: {
        bonusPoint: {
          title: "Training Insight",
          description: "Gain 1 bonus stat point.",
        },
        removePerk: {
          title: "Reforge Perk",
          description: (perkName: string): string =>
            `Remove your latest Perk: ${perkName}.`,
          fallback: (): string =>
            `No Perk active. Gain ${SHOP_REWARD_FALLBACK_GOLD} gold instead.`,
        },
        removeGambit: {
          title: "Cleanse Gambit",
          description: (gambitName: string): string =>
            `Remove your latest Gambit: ${gambitName}.`,
          fallback: (): string =>
            `No Gambit active. Restore ${Math.round(SHOP_REWARD_HEAL_FALLBACK_RATIO * 100)}% HP instead.`,
        },
      },
      descriptions: {
        removePerk: (perkName: string): string =>
          `Remove your latest Perk: ${perkName}.`,
        removePerkNone: "No active Perk to remove right now.",
        removeGambit: (gambitName: string): string =>
          `Remove your latest Gambit: ${gambitName}.`,
        removeGambitNone: "No active Gambit to remove right now.",
      },
    },
    introLogs: [
      "Welcome to the dungeon. Good luck.",
      "Defeat each floor boss to descend and shape your build.",
      "WASD/Arrows move. Step into enemies to battle.",
      "Use Inventory and Shop controls in the side panel.",
    ],
    logs: {
      descendFloor: (floor: number): string => `You descend to floor ${floor}.`,
      breathRecover: (healed: number): string =>
        `You catch your breath and recover ${healed} HP.`,
      dangerWarning: (threat: number): string =>
        `You sense overwhelming danger here. Recommended level ${threat}. First contact grants ambush protection.`,
      engageEnemy: (enemyName: string): string => `You engage ${enemyName}.`,
      openChest: "You open a chest.",
      enterBossLair: "You enter the dungeon boss lair.",
      enterShopRoom: "You find the shop room.",
      shopkeeperTuneup: "The shopkeeper offers a free build tune-up.",
      enemyAttacks: (enemyName: string): string => `${enemyName} attacks you!`,
      dangerSenseProtected:
        "Your danger sense blunts the ambush. Enemy opening strike is weakened.",
      retreat: "You break line of engagement and retreat.",
      welcomeLevel: (level: number, points: number): string =>
        `Welcome to level ${level}. (${points} point${points === 1 ? "" : "s"} to spend)`,
      lootKillRewards: (gold: number, xp: number): string =>
        `Looted ${gold} gold and gained ${xp} XP.`,
      bossDownChooseReward:
        "The floor boss is down. Choose a Perk, a Gambit, or descend unchanged.",
      enemiesRemain: (count: number, floor: number): string =>
        `${count} enemies remain on floor ${floor}.`,
      descendWithoutModifier:
        "You descend without taking a new build modifier.",
      selectedBuildChoice: (kindLabel: string, name: string): string =>
        `Selected ${kindLabel}: ${name}.`,
      shopRewardBonusPoint: "Shop reward: +1 stat point.",
      shopRewardRemovedPerk: (name: string): string =>
        `Shop reward: removed Perk ${name}.`,
      shopRewardPerkFallbackGold: (): string =>
        `No Perk to remove. You receive ${SHOP_REWARD_FALLBACK_GOLD} gold instead.`,
      shopRewardRemovedGambit: (name: string): string =>
        `Shop reward: removed Gambit ${name}.`,
      shopRewardGambitFallbackHeal: (amount: number): string =>
        `No Gambit to remove. Restored ${amount} HP instead.`,
      levelUpSpent: (label: string): string =>
        `Level-up point spent on ${label}.`,
      equippedItem: (itemName: string, slot: string): string =>
        `Equipped ${itemName} at ${slot}.`,
      inventoryItemRestored: (itemName: string, healed: number): string =>
        `${itemName} restored ${healed} HP.`,
      destroyedItem: (itemName: string): string => `Destroyed ${itemName}.`,
      lootedGold: (amount: number): string => `Looted ${amount} gold.`,
      lootedItem: (itemName: string): string => `Looted ${itemName}.`,
      inventoryFull: "Inventory is full.",
      inventoryFullChestLeftovers:
        "Inventory is full. Some items were left in the chest.",
      lootedAllChest: "Looted all chest contents.",
      notEnoughGold: "Not enough gold for that purchase.",
      boughtRespecToken: "Purchased a +1 stat point respec token.",
      noActivePerkToRemove: "No active Perk to remove.",
      removedPerk: (name: string): string => `Removed Perk ${name}.`,
      noActiveGambitToRemove: "No active Gambit to remove.",
      removedGambit: (name: string): string => `Removed Gambit ${name}.`,
      purchasedEntry: (name: string, cost: number): string =>
        `Purchased ${name} for ${cost} gold.`,
      goldCannotBePurchased: "Gold cannot be purchased.",
    },
  },
} as const;
