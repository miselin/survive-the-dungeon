import {
  findBuildChoice,
  type BuildChoice,
  type BuildChoiceDefinition,
  type BuildChoiceKind,
} from "./buildChoices";
import {
  AI_MOVE_MS,
  DANGER_WARNING_LEVEL_GAP,
  FLOOR_TRANSITION_HEAL_MINIMUM,
  FLOOR_TRANSITION_HEAL_RATIO,
  LOG_LIMIT,
  PLAYER_CONSTITUTION_BONUS,
  PLAYER_START_X,
  PLAYER_START_Y,
  STARTING_ATTRS,
  STARTING_BANDAGE_COUNT,
  STARTING_WEAPON_ATTACK_BONUS,
  STARTING_WEAPON_CRITICAL_MULTIPLIER,
  STARTING_WEAPON_CRITICAL_RANGE,
  STARTING_WEAPON_DAMAGE_DICE,
  STARTING_WEAPON_DEFENSE_BONUS,
} from "./constants";
import { AttributeSet, type AttributeName } from "./attributes";
import { Combat, type PlayerAction } from "./combat";
import { Creature } from "./creature";
import { Dice } from "./dice";
import {
  Armor,
  Chest,
  Gold,
  getNextItemId,
  setNextItemId,
  Weapon,
  WieldableItem,
} from "./items";
import { makeBandages, makeHealthPotion } from "./lootAndShopStock";
import { generateMap, roomCenter, WorldMap } from "./mapgen";
import { NameGenerator } from "./procgen";
import { makeSeedPhrase, SeededRandom } from "./rng";
import { runAiStep } from "./runAi";
import { resolveCombatTurn } from "./runCombatFlow";
import {
  buyShopEntry as buyShopEntryFromStock,
  computeShopEntryCost,
  destroyInventoryItem as destroyInventoryItemFromPlayer,
  equipInventoryItem as equipInventoryItemFromPlayer,
  inventoryItems as buildInventoryItems,
  lootAllFromChest,
  lootItemFromChest,
  resolveShopEntries,
  useInventoryItem as useInventoryItemFromPlayer,
  type InventoryRenderable,
  type ShopEntry,
} from "./runEconomy";
import {
  populateDungeon as buildFloorPopulation,
  type ChestEntity,
  type MobEntity,
  type ShopClutter,
} from "./runFloorPopulation";
import {
  allocateLevelUp as allocateLevelUpFromProgression,
  chooseBossReward as chooseBossRewardFromProgression,
  claimShopReward as claimShopRewardFromProgression,
  createPendingBossRewards,
  createPendingShopRewards,
  removeBuildChoiceEffect,
  toPublicBuildChoice,
  type PendingBossRewards,
  type PendingShopRewardChoice,
} from "./runProgression";
import {
  decodeRunSaveData,
  encodeRunSaveData,
  hydrateCreatureFromSave,
  type DungeonRunSaveData,
} from "./runSaveCodec";
import { EN } from "./strings/en";
import { ROOM_BOSS, ROOM_SHOP, ROOM_START } from "./types";
import type { LogEntry, Position, Room } from "./types";
import type { CombatResult } from "./combat";

export type { BuildChoice, BuildChoiceKind } from "./buildChoices";
export type { DungeonRunSaveData } from "./runSaveCodec";

export type LevelUpChoice = {
  attr: AttributeName;
  label: string;
  description: string;
  value: number;
  modifier: number;
};

export type ShopRewardChoice = PendingShopRewardChoice;

export type OverlayState =
  | { type: "none" }
  | {
      type: "battle";
      mobId: string;
      fallback: Position;
      roomId: number | null;
      surpriseProtection: boolean;
    }
  | { type: "chest"; chestId: string }
  | { type: "inventory" }
  | { type: "shop" }
  | { type: "level-up" }
  | { type: "boss-reward" }
  | { type: "shop-reward" };

export type RunState = "playing" | "dead" | "won";

export type RunStats = {
  vanquished: number;
  goldEarned: number;
  goldSpent: number;
  goldLeftBehind: number;
  inventoryValue: number;
  xpGained: number;
  level: number;
  floorReached: number;
};

export const LEVEL_UP_ATTRIBUTES = ["str", "dex", "con", "chr"] as const;
export type LevelUpAttribute = (typeof LEVEL_UP_ATTRIBUTES)[number];

const ATTRIBUTE_LABELS = EN.game.attributeLabels;
const ATTRIBUTE_DESCRIPTIONS = EN.game.attributeDescriptions;

function posEq(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

function clonePos(pos: Position): Position {
  return { x: pos.x, y: pos.y };
}

function chestPos(chest: Chest): Position {
  return { x: chest.x, y: chest.y };
}

let entityId = 1;
function nextId(prefix: string): string {
  const id = entityId;
  entityId += 1;
  return `${prefix}-${id}`;
}

export class DungeonRun {
  readonly rng: SeededRandom;

  readonly dice: Dice;

  readonly combat: Combat;

  world: WorldMap;

  readonly player: Creature;

  readonly seedPhrase: string;

  readonly seedNumber: number;

  readonly stats: RunStats;

  readonly logs: LogEntry[] = [];

  overlay: OverlayState = { type: "none" };

  state: RunState = "playing";

  floor = 1;

  mobs: MobEntity[] = [];

  chests: ChestEntity[] = [];

  currentRoom: Room | null = null;

  private aiAccumMs = 0;

  private readonly nameGenerator: NameGenerator;

  private shopStock: ShopEntry[] = [];

  shopClutter: ShopClutter[] = [];

  private readonly roomThreatById = new Map<number, number>();

  private readonly warnedDangerRooms = new Set<number>();

  private readonly dangerProtectionArmedRooms = new Set<number>();

  private readonly activePerks: BuildChoiceDefinition[] = [];

  private readonly activeGambits: BuildChoiceDefinition[] = [];

  private pendingBossRewards: PendingBossRewards | null = null;

  private pendingShopRewards: PendingShopRewardChoice[] | null = null;

  private readonly shopRewardClaimedFloors = new Set<number>();

  constructor(seedInput: string) {
    this.seedPhrase = makeSeedPhrase(seedInput);
    this.rng = new SeededRandom(this.seedPhrase);
    this.seedNumber = this.rng.seed;
    this.dice = new Dice(this.rng);
    this.combat = new Combat(this.dice);
    this.world = generateMap(this.rng);
    this.nameGenerator = new NameGenerator(this.rng);

    this.player = new Creature(
      EN.game.names.player,
      { x: PLAYER_START_X, y: PLAYER_START_Y },
      new AttributeSet(STARTING_ATTRS),
    );
    this.player.maxHitpoints +=
      this.player.attributes.modifier("con") * PLAYER_CONSTITUTION_BONUS;
    this.player.hitpoints = this.player.maxHitpoints;

    this.stats = {
      vanquished: 0,
      goldEarned: 0,
      goldSpent: 0,
      goldLeftBehind: 0,
      inventoryValue: 0,
      xpGained: 0,
      level: 1,
      floorReached: 1,
    };

    this.preparePlayerGear();
    this.buildFloor(true);

    for (const intro of EN.game.introLogs) {
      this.log(intro);
    }
  }

  private preparePlayerGear(): void {
    const fists = new Weapon(
      EN.game.startingGear.fists,
      STARTING_WEAPON_CRITICAL_RANGE,
      STARTING_WEAPON_CRITICAL_MULTIPLIER,
      STARTING_WEAPON_ATTACK_BONUS,
      STARTING_WEAPON_DEFENSE_BONUS,
      STARTING_WEAPON_DAMAGE_DICE,
    );
    const cloth = new Armor("chest", EN.game.startingGear.clothArmor, 0, 1);
    const boots = new Armor("feet", EN.game.startingGear.leatherBoots, 0, 1);

    this.player.wield("hands", fists);
    this.player.wield("chest", cloth);
    this.player.wield("feet", boots);

    for (let i = 0; i < STARTING_BANDAGE_COUNT; i += 1) {
      this.player.give(makeBandages());
    }
    this.player.give(makeHealthPotion());
  }

  private buildFloor(initial = false): void {
    this.world = generateMap(this.rng);

    this.mobs = [];
    this.chests = [];
    this.shopStock = [];
    this.shopClutter = [];

    this.roomThreatById.clear();
    this.warnedDangerRooms.clear();
    this.dangerProtectionArmedRooms.clear();

    this.pendingBossRewards = null;
    this.pendingShopRewards = null;

    this.populateDungeon();

    const startingRoom =
      this.world.rooms.find(
        (room) => (room.attrs & ROOM_START) === ROOM_START,
      ) ?? this.world.rooms[0];
    this.player.position = roomCenter(startingRoom);
    this.currentRoom = this.world.roomAt(this.player.position);

    this.world.updateFov(this.player.position);
    this.aiAccumMs = 0;

    if (!initial) {
      this.log(EN.game.logs.descendFloor(this.floor), "success");
    }
  }

  private populateDungeon(): void {
    const populated = buildFloorPopulation({
      world: this.world,
      floor: this.floor,
      dice: this.dice,
      rng: this.rng,
      nameGenerator: this.nameGenerator,
      nextId,
    });

    this.mobs = populated.mobs;
    this.chests = populated.chests;
    this.shopStock = populated.shopStock;
    this.shopClutter = populated.shopClutter;

    this.roomThreatById.clear();
    for (const [roomId, threat] of populated.roomThreatById) {
      this.roomThreatById.set(roomId, threat);
    }
  }

  private removeLatestChoice(
    kind: BuildChoiceKind,
  ): BuildChoiceDefinition | null {
    const list = kind === "perk" ? this.activePerks : this.activeGambits;
    const removed = list.pop() ?? null;
    if (!removed) {
      return null;
    }
    removeBuildChoiceEffect(this.player, removed);
    return removed;
  }

  private openBossReward(): void {
    this.pendingBossRewards = createPendingBossRewards(
      this.rng,
      this.activePerks,
      this.activeGambits,
    );
    this.overlay = { type: "boss-reward" };
  }

  private prepareShopReward(): void {
    this.pendingShopRewards = createPendingShopRewards(
      this.activePerks,
      this.activeGambits,
    );
    this.overlay = { type: "shop-reward" };
  }

  private maybeOpenAutoOverlay(): void {
    if (this.state !== "playing") {
      return;
    }
    if (this.overlay.type !== "none") {
      return;
    }
    if (this.player.unspentStatPoints > 0) {
      this.overlay = { type: "level-up" };
    }
  }

  private advanceToNextFloor(): void {
    this.floor += 1;
    this.stats.floorReached = this.floor;

    const before = this.player.hitpoints;
    const heal = Math.max(
      FLOOR_TRANSITION_HEAL_MINIMUM,
      Math.floor(
        this.player.currentMaxHitpoints() * FLOOR_TRANSITION_HEAL_RATIO,
      ),
    );
    this.player.hitpoints = Math.min(
      this.player.currentMaxHitpoints(),
      this.player.hitpoints + heal,
    );

    this.player.inBattle = false;
    this.overlay = { type: "none" };

    this.buildFloor(false);

    const healed = this.player.hitpoints - before;
    if (healed > 0) {
      this.log(EN.game.logs.breathRecover(healed), "success");
    }

    this.maybeOpenAutoOverlay();
  }

  private log(text: string, level: LogEntry["level"] = "info"): void {
    this.logs.push({ text, level });
    while (this.logs.length > LOG_LIMIT) {
      this.logs.shift();
    }
  }

  private roomThreat(room: Room | null): number {
    if (!room) {
      return 0;
    }
    return this.roomThreatById.get(room.id) ?? 0;
  }

  private warnIfDangerousRoom(room: Room): void {
    if ((room.attrs & (ROOM_START | ROOM_SHOP | ROOM_BOSS)) !== 0) {
      return;
    }

    const threat = this.roomThreat(room);
    if (threat < this.player.level + DANGER_WARNING_LEVEL_GAP) {
      return;
    }
    if (this.warnedDangerRooms.has(room.id)) {
      return;
    }

    this.warnedDangerRooms.add(room.id);
    this.dangerProtectionArmedRooms.add(room.id);
    this.log(EN.game.logs.dangerWarning(threat), "warn");
  }

  private startBattle(
    mobId: string,
    fallback: Position,
    roomId: number | null,
  ): void {
    const surpriseProtection =
      roomId !== null && this.dangerProtectionArmedRooms.has(roomId);
    if (surpriseProtection) {
      this.dangerProtectionArmedRooms.delete(roomId);
    }

    this.overlay = {
      type: "battle",
      mobId,
      fallback: clonePos(fallback),
      roomId,
      surpriseProtection,
    };
  }

  canOpenShop(): boolean {
    const room = this.world.roomAt(this.player.position);
    return room !== null && (room.attrs & ROOM_SHOP) === ROOM_SHOP;
  }

  openInventory(): void {
    if (this.state !== "playing" || this.overlay.type !== "none") {
      return;
    }
    this.overlay = { type: "inventory" };
  }

  openShop(): void {
    if (
      this.state !== "playing" ||
      !this.canOpenShop() ||
      this.overlay.type !== "none"
    ) {
      return;
    }
    this.overlay = { type: "shop" };
  }

  closeOverlay(): void {
    if (
      this.overlay.type === "level-up" ||
      this.overlay.type === "boss-reward" ||
      this.overlay.type === "shop-reward"
    ) {
      return;
    }
    this.overlay = { type: "none" };
    this.maybeOpenAutoOverlay();
  }

  movePlayer(dx: number, dy: number): void {
    if (this.state !== "playing") {
      return;
    }
    if (this.overlay.type !== "none") {
      return;
    }

    const next = {
      x: this.player.position.x + dx,
      y: this.player.position.y + dy,
    };
    if (
      !this.world.inBounds(next.x, next.y) ||
      !this.world.isPassable(next.x, next.y)
    ) {
      return;
    }

    const targetMob = this.mobs.find(
      (mob) => mob.creature.alive && posEq(mob.creature.position, next),
    );
    if (targetMob) {
      const roomId = this.world.roomAt(targetMob.creature.position)?.id ?? null;
      this.startBattle(targetMob.id, this.player.position, roomId);
      this.player.inBattle = true;
      targetMob.creature.inBattle = true;
      this.log(EN.game.logs.engageEnemy(targetMob.creature.name), "warn");
      return;
    }

    const targetChest = this.chests.find(
      (entry) => posEq(chestPos(entry.chest), next) && !entry.chest.empty(),
    );
    if (targetChest) {
      this.overlay = { type: "chest", chestId: targetChest.id };
      this.log(EN.game.logs.openChest, "info");
      return;
    }

    this.player.position = next;

    const prevRoom = this.currentRoom;
    this.currentRoom = this.world.roomAt(this.player.position);
    if (this.currentRoom !== prevRoom && this.currentRoom !== null) {
      if ((this.currentRoom.attrs & ROOM_BOSS) === ROOM_BOSS) {
        this.log(EN.game.logs.enterBossLair, "warn");
      } else if ((this.currentRoom.attrs & ROOM_SHOP) === ROOM_SHOP) {
        this.log(EN.game.logs.enterShopRoom, "success");

        if (!this.shopRewardClaimedFloors.has(this.floor)) {
          this.shopRewardClaimedFloors.add(this.floor);
          this.log(EN.game.logs.shopkeeperTuneup, "success");
          this.prepareShopReward();
        }
      }
      this.warnIfDangerousRoom(this.currentRoom);
    }

    this.world.updateFov(this.player.position);
  }

  tick(dtMs: number): void {
    if (this.state !== "playing") {
      return;
    }

    if (this.overlay.type === "battle") {
      return;
    }

    this.aiAccumMs += dtMs;
    if (this.aiAccumMs < AI_MOVE_MS) {
      return;
    }

    this.aiAccumMs -= AI_MOVE_MS;
    const aiStep = runAiStep({
      overlayType: this.overlay.type,
      world: this.world,
      rng: this.rng,
      player: this.player,
      mobs: this.mobs,
      chests: this.chests,
    });
    const battleTrigger = aiStep.battleTrigger;
    if (battleTrigger) {
      this.startBattle(
        battleTrigger.mobId,
        this.player.position,
        battleTrigger.roomId,
      );
      this.player.inBattle = true;
      const attacker = this.mobs.find(
        (entry) => entry.id === battleTrigger.mobId,
      );
      if (attacker) {
        attacker.creature.inBattle = true;
      }
      this.log(EN.game.logs.enemyAttacks(battleTrigger.attackerName), "warn");
    }
    this.world.updateFov(this.player.position);
  }

  performCombat(action: PlayerAction): CombatResult | null {
    const resolved = resolveCombatTurn({
      action,
      state: this.state,
      overlay: this.overlay,
      mobs: this.mobs,
      combat: this.combat,
      player: this.player,
      world: this.world,
      chests: this.chests,
      currentRoom: this.currentRoom,
      stats: this.stats,
      floor: this.floor,
      log: (text, level) => this.log(text, level),
    });

    this.state = resolved.state;
    this.overlay = resolved.overlay;
    this.mobs = resolved.mobs;
    this.currentRoom = resolved.currentRoom;

    if (resolved.openBossReward) {
      this.openBossReward();
    }
    if (resolved.finalizeStats) {
      this.finalizeStats();
    }
    if (resolved.maybeOpenAutoOverlay) {
      this.maybeOpenAutoOverlay();
    }

    return resolved.result;
  }

  private finalizeStats(): void {
    this.stats.inventoryValue =
      this.player.inventory.items().reduce((acc, item) => acc + item.value, 0) +
      Object.values(this.player.wieldpoints)
        .filter((item): item is WieldableItem => item instanceof WieldableItem)
        .reduce((acc, item) => acc + item.value, 0);

    this.stats.goldLeftBehind = this.chests.reduce((acc, entry) => {
      let total = acc;
      for (const item of entry.chest.items()) {
        if (item instanceof Gold) {
          total += item.amount;
        }
      }
      return total;
    }, 0);

    this.stats.level = this.player.level;
    this.stats.floorReached = this.floor;
  }

  getBattleEnemy(): MobEntity | null {
    if (this.overlay.type !== "battle") {
      return null;
    }
    const overlay = this.overlay;
    return this.mobs.find((entry) => entry.id === overlay.mobId) ?? null;
  }

  getChest(): ChestEntity | null {
    if (this.overlay.type !== "chest") {
      return null;
    }
    const overlay = this.overlay;
    return this.chests.find((entry) => entry.id === overlay.chestId) ?? null;
  }

  getRoomThreat(room: Room | null): number {
    return this.roomThreat(room);
  }

  getCurrentRoomThreat(): number {
    return this.roomThreat(this.currentRoom);
  }

  currentBuild(): { perks: BuildChoice[]; gambits: BuildChoice[] } {
    return {
      perks: this.activePerks.map((choice) => toPublicBuildChoice(choice)),
      gambits: this.activeGambits.map((choice) => toPublicBuildChoice(choice)),
    };
  }

  getBossRewards(): { perks: BuildChoice[]; gambits: BuildChoice[] } | null {
    if (!this.pendingBossRewards) {
      return null;
    }

    return {
      perks: this.pendingBossRewards.perks.map((choice) =>
        toPublicBuildChoice(choice),
      ),
      gambits: this.pendingBossRewards.gambits.map((choice) =>
        toPublicBuildChoice(choice),
      ),
    };
  }

  chooseBossReward(kind: BuildChoiceKind | "none", choiceId?: string): void {
    const resolved = chooseBossRewardFromProgression({
      overlayType: this.overlay.type,
      pendingBossRewards: this.pendingBossRewards,
      kind,
      choiceId,
      player: this.player,
      activePerks: this.activePerks,
      activeGambits: this.activeGambits,
      log: (text, level) => this.log(text, level),
    });
    this.pendingBossRewards = resolved.pendingBossRewards;
    if (resolved.shouldAdvanceFloor) {
      this.advanceToNextFloor();
    }
  }

  getShopRewardChoices(): ShopRewardChoice[] | null {
    if (!this.pendingShopRewards) {
      return null;
    }
    return [...this.pendingShopRewards];
  }

  claimShopReward(choiceId: ShopRewardChoice["id"]): void {
    const resolved = claimShopRewardFromProgression({
      overlayType: this.overlay.type,
      pendingShopRewards: this.pendingShopRewards,
      choiceId,
      player: this.player,
      stats: this.stats,
      removeLatestChoice: (kind) => this.removeLatestChoice(kind),
      log: (text, level) => this.log(text, level),
    });
    this.pendingShopRewards = resolved.pendingShopRewards;
    if (!resolved.claimed) {
      return;
    }
    this.overlay = { type: "none" };
    this.maybeOpenAutoOverlay();
  }

  levelUpChoices(): LevelUpChoice[] {
    return LEVEL_UP_ATTRIBUTES.map((attr) => ({
      attr,
      label: ATTRIBUTE_LABELS[attr],
      description: ATTRIBUTE_DESCRIPTIONS[attr],
      value: this.player.attributes.get(attr),
      modifier: this.player.attributes.modifier(attr),
    }));
  }

  allocateLevelUp(attr: LevelUpAttribute): void {
    const resolved = allocateLevelUpFromProgression({
      overlayType: this.overlay.type,
      attr,
      validAttributes: LEVEL_UP_ATTRIBUTES,
      player: this.player,
      log: (text, level) => this.log(text, level),
    });
    if (!resolved.spent || resolved.nextOverlayType === null) {
      return;
    }
    this.overlay = { type: resolved.nextOverlayType };
    this.maybeOpenAutoOverlay();
  }

  inventoryItems(): InventoryRenderable[] {
    return buildInventoryItems(this.player);
  }

  equipItem(itemId: string): void {
    equipInventoryItemFromPlayer(this.player, itemId, (text, level) =>
      this.log(text, level),
    );
  }

  useInventoryItem(itemId: string): void {
    useInventoryItemFromPlayer(this.player, itemId, (text, level) =>
      this.log(text, level),
    );
  }

  destroyInventoryItem(itemId: string): void {
    destroyInventoryItemFromPlayer(this.player, itemId, (text, level) =>
      this.log(text, level),
    );
  }

  lootItem(itemId: string): void {
    const chestEntity = this.getChest();
    if (!chestEntity) {
      return;
    }

    lootItemFromChest({
      chest: chestEntity.chest,
      itemId,
      player: this.player,
      stats: this.stats,
      log: (text, level) => this.log(text, level),
    });
  }

  lootAll(): void {
    const chestEntity = this.getChest();
    if (!chestEntity) {
      return;
    }

    lootAllFromChest({
      chest: chestEntity.chest,
      player: this.player,
      stats: this.stats,
      log: (text, level) => this.log(text, level),
    });
  }

  shopEntries(): ShopEntry[] {
    return resolveShopEntries(
      this.shopStock,
      this.activePerks,
      this.activeGambits,
    );
  }

  shopEntryCost(entry: ShopEntry): number {
    return computeShopEntryCost(entry, this.player);
  }

  buyShopEntry(entryId: string): void {
    buyShopEntryFromStock({
      entryId,
      shopStock: this.shopStock,
      player: this.player,
      stats: this.stats,
      removeLatestChoice: (kind) => this.removeLatestChoice(kind),
      log: (text, level) => this.log(text, level),
    });
  }

  toSaveData(): DungeonRunSaveData {
    return encodeRunSaveData({
      seedPhrase: this.seedPhrase,
      seedNumber: this.seedNumber,
      rngState: this.rng.getState(),
      nextEntityId: entityId,
      nextItemId: getNextItemId(),
      floor: this.floor,
      state: this.state,
      stats: { ...this.stats },
      logs: this.logs,
      overlay: this.overlay,
      world: this.world,
      player: this.player,
      mobs: this.mobs,
      chests: this.chests,
      currentRoomId: this.currentRoom?.id ?? null,
      aiAccumMs: this.aiAccumMs,
      shopStock: this.shopStock,
      shopClutter: this.shopClutter,
      roomThreatById: this.roomThreatById,
      warnedDangerRooms: this.warnedDangerRooms,
      dangerProtectionArmedRooms: this.dangerProtectionArmedRooms,
      activePerkIds: this.activePerks.map((choice) => choice.id),
      activeGambitIds: this.activeGambits.map((choice) => choice.id),
      pendingBossRewards: this.pendingBossRewards,
      pendingShopRewards: this.pendingShopRewards,
      shopRewardClaimedFloors: this.shopRewardClaimedFloors,
      combatLuck: this.combat.snapshotLuckState(),
    });
  }

  static fromSaveData(saved: DungeonRunSaveData): DungeonRun {
    const run = new DungeonRun(saved.seedPhrase);
    const decoded = decodeRunSaveData(saved, { findBuildChoice });

    run.world = decoded.world;
    hydrateCreatureFromSave(run.player, decoded.player);
    run.world.updateFov(run.player.position);

    run.floor = decoded.floor;
    run.state = decoded.state;
    run.overlay = decoded.overlay;
    run.aiAccumMs = decoded.aiAccumMs;

    Object.assign(run.stats, decoded.stats);
    run.logs.splice(0, run.logs.length, ...decoded.logs);

    run.mobs = decoded.mobs;
    run.chests = decoded.chests;
    run.shopStock = decoded.shopStock;
    run.shopClutter = decoded.shopClutter;

    run.roomThreatById.clear();
    for (const [roomId, threat] of decoded.roomThreatById) {
      run.roomThreatById.set(roomId, threat);
    }

    run.warnedDangerRooms.clear();
    for (const roomId of decoded.warnedDangerRooms) {
      run.warnedDangerRooms.add(roomId);
    }

    run.dangerProtectionArmedRooms.clear();
    for (const roomId of decoded.dangerProtectionArmedRooms) {
      run.dangerProtectionArmedRooms.add(roomId);
    }

    run.activePerks.splice(0, run.activePerks.length, ...decoded.activePerks);
    run.activeGambits.splice(
      0,
      run.activeGambits.length,
      ...decoded.activeGambits,
    );

    run.pendingBossRewards = decoded.pendingBossRewards;
    run.pendingShopRewards = decoded.pendingShopRewards;

    run.shopRewardClaimedFloors.clear();
    for (const floor of decoded.shopRewardClaimedFloors) {
      run.shopRewardClaimedFloors.add(floor);
    }

    run.combat.restoreLuckState(decoded.combatLuck);

    run.currentRoom =
      decoded.currentRoomId === null
        ? null
        : (run.world.rooms.find((room) => room.id === decoded.currentRoomId) ??
          run.world.roomAt(run.player.position));

    run.rng.setState(decoded.rngState);
    entityId = Math.max(1, Math.floor(decoded.nextEntityId));
    setNextItemId(decoded.nextItemId);

    return run;
  }
}
