"""This module holds the main game logic for a dungeon"""

import math
from typing import List, Optional, Union

import pygame
import pygame_gui

from .ai import AI
from .attributes import AttributeSet
from .battle import Battle
from .combat import Combat
from .constants import (BANDAGES_HEAL_HP, BOSS_CHALLENGE_LEVEL, COLOSSAL_HEALTH_POTION_HEAL_HP, CREATURE_XP_MULTIPLIER, GOLD_IN_CHEST_DICE, HEALTH_POTION_HEAL_HP, HUGE_HEALTH_POTION_HEAL_HP, LARGE_HEALTH_POTION_HEAL_HP,
                        MAXIMUM_CHALLENGE_LEVEL, MS_PER_AI_MOVE,
                        MS_PER_TILE_MOVE, PLAYER_CRIT_MAXIMUM_MULTIPLIER,
                        PLAYER_CRIT_MINIMUM_ROLL)
from .creature import Creature
from .dice import Dice
from .env import ON_REPLIT
from .game import Game, GameState
from .inventoryui import InventoryModal
from .item import Armor, Chest, Gold, InstantEffectItem, Weapon
from .mapgen import Cell, generate_map
from .procgen import NAMES, NameGenerator, creature_at_level
from .shopui import Shop
from .sprites import SpriteSet
from .transferui import InventoryTransferModal
from .types import Position
from .worldmap import Map, Room

if ON_REPLIT:
    # 800x400 is about right for the Replit cover page
    WINDOW_W = 800
    WINDOW_H = 400
else:
    WINDOW_W = 1440
    WINDOW_H = 900

LOG_ENTRIES = 6
LOG_PIXELS = 14
LOG_H = LOG_ENTRIES * LOG_PIXELS
LOG_Y = WINDOW_H - LOG_H

LOG_X = 192

TILES_W = int(math.floor(WINDOW_W / 32))
TILES_H = int(math.ceil((WINDOW_H - LOG_H) / 32))

HALF_TILES_W = int(math.floor(TILES_W / 2))
HALF_TILES_H = int(math.floor(TILES_H / 2))

explored_overlay = pygame.Surface((32, 32), 32)
explored_overlay.set_alpha(128, pygame.RLEACCEL)

hp_green = pygame.Surface((LOG_X, LOG_PIXELS), 24)
hp_green.fill((64, 255, 64))

hp_red = pygame.Surface((LOG_X, LOG_PIXELS), 24)
hp_red.fill((255, 64, 64))

xp_bar = pygame.Surface((LOG_X, LOG_PIXELS), 24)
xp_bar.fill((255, 255, 64))

# todo: player should be able to choose these?
player_attribs = AttributeSet()
player_attribs.modify("str", 16)
player_attribs.modify("dex", 14)
player_attribs.modify("con", 12)
player_attribs.modify("int", 12)
player_attribs.modify("wis", 13)
player_attribs.modify("chr", 10)

boss_attribs = AttributeSet()
boss_attribs.modify("str", 18)
boss_attribs.modify("dex", 14)
boss_attribs.modify("con", 15)
boss_attribs.modify("int", 17)
boss_attribs.modify("wis", 17)
boss_attribs.modify("chr", 15)


class Dungeon:
    """Dungeon handles all of the logic for a single dungeon run."""

    def __init__(
        self,
        game: Game,
        ui: pygame_gui.UIManager,
        font: pygame.font.Font,
        surface: pygame.Surface,
        spriteset: SpriteSet,
    ):
        self.font = font

        self.game = game
        self.ui = ui
        self.surface = surface
        self.spriteset = spriteset
        self._pause_window = None

        self.left_x = 0
        self.right_x = 0
        self.top_y = 0
        self.bottom_y = 0

        self.worldmap = generate_map(game.random())

        self._name_generator = NameGenerator(game.random())

        self.current_room: Optional[Room] = self.worldmap.rooms[0]

        surface_rect = self.surface.get_rect()
        parent_size = surface_rect.size

        modal_size = (parent_size[0] * 0.85, parent_size[1] * 0.85)
        self.modal_rt = pygame.Rect(0, 0, *modal_size)
        self.modal_rt.center = surface_rect.center

        dialog_size = (parent_size[0] * 0.4, parent_size[1] * 0.2)
        self.dialog_rt = pygame.Rect(0, 0, *dialog_size)
        self.dialog_rt.center = surface_rect.center

        self.container = pygame_gui.core.UIContainer(
            pygame.Rect(0, 0, surface_rect.width, surface_rect.height),
            manager=self.ui,
        )

        self.first_loop = True
        self.should_think = True

        self.player = Creature(
            self.spriteset.get_player(),
            (4, 4),
            "Player",
            attribute_override=player_attribs,
        )

        fists = Weapon("Fists", 19, 3, dam="1d10")
        cloth = Armor("chest", name="Cloth Armor", defensebonus=1)
        leather_boots = Armor("feet", name="Leather Boots", defensebonus=1)

        bandages = InstantEffectItem("Bandages", BANDAGES_HEAL_HP)
        bandages.value = 10
        health_potion = InstantEffectItem("Health Potion", HEALTH_POTION_HEAL_HP)
        health_potion.value = 50

        bigger_health_potion = InstantEffectItem("Large Health Potion", LARGE_HEALTH_POTION_HEAL_HP)
        bigger_health_potion.value = 250
        huge_health_potion = InstantEffectItem("Huge Health Potion", HUGE_HEALTH_POTION_HEAL_HP)
        huge_health_potion.value = 750
        biggest_health_potion = InstantEffectItem("Colossal Health Potion", COLOSSAL_HEALTH_POTION_HEAL_HP)
        biggest_health_potion.value = 1250
        instaheal = InstantEffectItem("Instaheal", 1000000000)
        instaheal.value = 15000

        self.shop_consumables = [
            bandages,
            health_potion,
            bigger_health_potion,
            huge_health_potion,
            biggest_health_potion,
            instaheal,
        ]

        self.player.wield("hands", fists)
        self.player.wield("chest", cloth)
        self.player.wield("feet", leather_boots)

        for _ in range(5):
            self.player.give(bandages)
        self.player.give(health_potion)

        self.creatures = []
        self.containers = []

        self.ai = AI(
            self,
            self.walkable,
            self.handle_attack,
        )

        mob_sprite = spriteset.get_mob(0)

        self.dice = Dice()
        self.combat = Combat(self.dice)

        self.generated_weapons: List[Weapon] = []
        self.generated_armors: List[Armor] = []

        self.generate_items()

        starting_room = self.worldmap.rooms[0]

        self.chest_sprite = spriteset.get_chest(False)
        self.chest_open_sprite = spriteset.get_chest(True)

        # diagonal length of the map to scale up mobs/rewards in each room
        diag = math.sqrt(
            (self.worldmap.width * self.worldmap.width)
            + (self.worldmap.height * self.worldmap.height)
        )

        # generate some mobs and stuff
        for room_nth, room in enumerate(self.worldmap.rooms):
            dist = room.distance_to(starting_room)
            scaled = dist / diag

            boss: bool = (room.attrs & Room.ATTR_BOSS_ROOM) == Room.ATTR_BOSS_ROOM
            if boss:
                challenge_level = BOSS_CHALLENGE_LEVEL

            # print(f'processing room at {room.pos}, distance to start is {dist} ({scaled})')
            if room.attrs & Room.ATTR_SHOP_ROOM:
                # splat some props into the room, make it look different
                room_squares = room.dims[0] * room.dims[1]
                clutter_positions = list(
                    room.generate_random_positions(
                        self.game.random(), int(math.ceil(room_squares / 3)),
                    )
                )
                for pos in clutter_positions:
                    clutter = self.game.random().choice(self.spriteset.get_clutter())
                    real_pos = room.room_to_world(pos)
                    cell = self.worldmap.cell_at(*real_pos)
                    cell.clutter = clutter

                continue

            if room.attrs & Room.ATTR_STARTING_ROOM:
                mob_positions = []
            else:
                if boss:
                    count = 1
                else:
                    count = self.dice.roll(1, int(math.ceil(6 * scaled)))

                mob_positions = list(
                    room.generate_random_positions(
                        self.game.random(),
                        count,
                    )
                )

            # add one tile of padding to chests so they can never block doorways
            chest_positions = list(
                room.generate_random_positions(
                    self.game.random(),
                    self.dice.roll(1, int(math.ceil(8 * scaled))),
                    keepouts=mob_positions,
                    padding=1,
                )
            )

            # increase challenge level as we get further from the start room
            # ignore the boss room though
            room_scale_factor = room_nth / (len(self.worldmap.rooms) - 1)

            challenge_level = int(
                math.floor(room_scale_factor * MAXIMUM_CHALLENGE_LEVEL)
            )

            for pos in mob_positions:
                mob = creature_at_level(
                    challenge_level, self._name_generator, self.game.random()
                )

                if boss:
                    mob.attributes = boss_attribs
                    mob.name = "Dungeon Boss"

                mob.roll_mob_attrs()
                mob.position = room.room_to_world(pos)
                mob.sprite = mob_sprite
                mob.mob = True

                self.creatures.append(mob)
                self.ai.attach(mob)

            for pos in chest_positions:
                chest = Chest(room.room_to_world(pos))
                if self.dice.roll(1, 20) > 12:
                    weapon = self.game.random().choice(self.generated_weapons)
                    self.generated_weapons.remove(weapon)
                    chest.add_item(weapon)
                if self.dice.roll(1, 20) > 15:
                    armor = self.game.random().choice(self.generated_armors)
                    self.generated_armors.remove(armor)
                    chest.add_item(armor)
                if self.dice.roll(1, 20) > 7:
                    gold = self.dice.rollnamed(GOLD_IN_CHEST_DICE)
                    chest.add_item(Gold(value=gold))
                if self.dice.roll(1, 20) >= 20:
                    chest.add_item(bigger_health_potion)
                elif self.dice.roll(1, 20) >= 19:
                    # make sure the high level rooms have hefty heals
                    if challenge_level >= 8:
                        chest.add_item(bigger_health_potion)
                    else:
                        chest.add_item(health_potion)
                elif self.dice.roll(1, 20) >= 18:
                    # don't put bandages in high-level rooms
                    if challenge_level >= 8:
                        chest.add_item(bigger_health_potion)
                    elif challenge_level >= 5:
                        chest.add_item(health_potion)
                    else:
                        chest.add_item(bandages)

                # don't add empty chests to the world
                if chest.empty():
                    continue

                self.containers.append(chest)

        # clutter up the hallways
        for cell in self.worldmap.cells:
            if cell.cell_type != Cell.TYPE_HALL:
                continue

            if self.dice.roll(1, 20) >= 15:
                cell.wall_clutter = self.game.random().choice(
                    self.spriteset.get_hall_clutter()
                )

        game.log("Welcome to the dungeon. Good luck!")
        game.log("Clear out every foe in the dungeon to win.")
        game.log("WASD to move. Move into enemies to attack.")
        game.log("Move into chests to open them.")

        self._inventory_button = pygame_gui.elements.UIButton(
            pygame.Rect(-52, 8, 48, 48),
            "",
            manager=self.ui,
            container=self.container,
            anchors={"right": "right"},
            object_id=pygame_gui.core.ObjectID(
                class_id="@dungeon_ui", object_id="#inventory"
            ),
            tool_tip_text="Inventory",
        )

        self._pause_button = pygame_gui.elements.UIButton(
            pygame.Rect(-52, 64, 48, 48),
            "",
            manager=self.ui,
            container=self.container,
            anchors={"right": "right"},
            object_id=pygame_gui.core.ObjectID(
                class_id="@dungeon_ui", object_id="#pause"
            ),
            tool_tip_text="Pause",
        )

        self._shop_button = pygame_gui.elements.UIButton(
            pygame.Rect(0, 8, 192, 32),
            "Visit the Shop",
            manager=self.ui,
            container=self.container,
            anchors={"top": "top", "centerx": "centerx"},
            tool_tip_text="Open the shop to explore its goods.",
        )

        self._shop_button.visible = False

        self._modal: Optional[
            Union[InventoryModal, InventoryTransferModal, Shop]
        ] = None
        self._battle: Optional[Battle] = None
        self._shop: Optional[Shop] = None

        self._time_accum = 0.0
        self._ai_time_accum = 0.0
        self._x_delta = 0
        self._y_delta = 0

    def generate_items(self) -> None:
        """Generate items to use throughout the dungeon."""

        for _ in range(1250):
            value_mult = 1

            special = self.dice.roll() >= 19
            if special:
                value_mult += 2

            mountpoint = self.game.random().choice(list(NAMES.values()))

            name = self._name_generator.generate_name(mountpoint, special)

            if mountpoint != "hands":
                ab = self.dice.roll()
                db = self.dice.roll()
                armor = Armor(
                    mountpoint, name=name.title(), attackbonus=ab, defensebonus=db
                )

                value = (ab * 3) + (db * 2)
                value *= value_mult
                armor.value = int(value)

                self.generated_armors.append(armor)
            else:
                cr = self.dice.roll(PLAYER_CRIT_MINIMUM_ROLL, 20)
                cm = self.dice.roll(1, PLAYER_CRIT_MAXIMUM_MULTIPLIER)
                ab = self.dice.roll()
                db = self.dice.roll()
                dn = self.dice.roll()
                ds = self.dice.roll()
                weapon = Weapon(name.title(), cr, cm, ab, db, f"{dn}d{ds}")

                value = (((dn * ds) + cr) * cm) + (ab * 3) + (db * 2)
                value *= value_mult
                weapon.value = int(value)

                self.generated_weapons.append(weapon)

        self.generated_armors = list(
            sorted(self.generated_armors, key=lambda k: k.value, reverse=True)
        )
        self.generated_weapons = list(
            sorted(self.generated_weapons, key=lambda k: k.value, reverse=True)
        )

        self.shop_armors = self.generated_armors[:5]
        self.shop_weapons = self.generated_weapons[:5]

    def kill(self):
        """Ends the game."""

        if self._modal is not None:
            self._modal.kill()

        if self._battle is not None:
            self._battle.kill()

        self.container.kill()

    def handle_attack(self, mob: Creature):
        """Handles an attack on the player from the given mob."""

        # drop the attack if we're already busy
        if self._modal is not None:
            return

        if self._battle is not None:
            return

        rect = self.container.get_rect()
        self._battle = Battle(
            self.player,
            mob,
            rect=pygame.Rect(0, 0, rect.width, LOG_Y),
            manager=self.ui,
        )
        self._inventory_button.visible = False

    def walkable(self, pos: Position) -> bool:
        """Returns True if the given position can be walked on."""

        cell = self.worldmap.cell_at(*pos)
        if not cell.is_passable():
            return False

        if self.player.position == pos:
            return False

        for creature in self.creatures:
            if creature.position == pos:
                return False

        for chest in self.containers:
            if chest.position == pos:
                return False

        return True

    def move_player(self, new_player_pos: Position):
        """Attempts to move the player to the given position."""

        attacked_creature = None
        opened_chest = None

        # did we move into a creature?
        for creature in self.creatures:
            if not creature.alive:
                continue

            if creature.position == new_player_pos:
                # yes, it's an attack
                attacked_creature = creature
                break

        for chest in self.containers:
            if chest.position == new_player_pos:
                opened_chest = chest
                break

        if attacked_creature is None and opened_chest is None:
            cell = self.worldmap.cell_at(*new_player_pos)
            if cell.is_passable():
                self.player.position = new_player_pos

                prev_room = self.current_room
                self.current_room = self.worldmap.room_at(*new_player_pos)
                if self.current_room is not None and prev_room != self.current_room:
                    if self.current_room.attrs & Room.ATTR_BOSS_ROOM:
                        self.game.log("You entered the dungeon boss lair.")
                    elif self.current_room.attrs & Room.ATTR_SHOP_ROOM:
                        self.game.log("This room looks like it has a shop in it.")

                    self._shop_button.visible = (
                        self.current_room.attrs & Room.ATTR_SHOP_ROOM
                    )

        if attacked_creature is not None:
            self.handle_attack(attacked_creature)

        if opened_chest is not None:
            if not opened_chest.empty():
                self._modal = InventoryTransferModal(
                    self.ui, opened_chest, self.player, self.surface
                )

        self.should_think = True

    def handle_event(self, event: pygame.event.Event):
        """Handles pygame events."""

        # forward events while we have a modal open
        if self._modal is not None:
            self._modal.handle_event(event)
            return

        if event.type == pygame.QUIT:
            raise SystemExit()

        if event.type == pygame_gui.UI_BUTTON_PRESSED:
            if event.ui_element == self._inventory_button:
                self._modal = InventoryModal(self.ui, self.player, self.surface)
            elif event.ui_element == self._shop_button:
                self._shop = Shop(
                    self.player,
                    self.shop_consumables,
                    self.shop_weapons,
                    self.shop_armors,
                    rect=self.modal_rt,
                    manager=self.ui,
                    resizable=False,
                    window_display_title="Shop",
                )

                self._shop_button.disable()
            elif event.ui_element == self._pause_button:
                self._pause_window = pygame_gui.windows.UIMessageWindow(
                    self.dialog_rt,
                    "Paused!",
                    manager=self.ui,
                    window_title="Paused",
                )

        elif event.type == pygame_gui.UI_WINDOW_CLOSE:
            if event.ui_element == self._shop:
                self._shop_button.enable()
            elif event.ui_element == self._pause_window:
                self._pause_window = None
            elif event.ui_element == self._battle:
                self._inventory_button.visible = True
                self._battle = None
                self.should_think = True

    def draw_map(self):
        """Draws the map to the screen."""

        for cell in self.worldmap.cells:
            if cell.pos[1] >= self.bottom_y:
                # no more cells will be rendered, we're at the bottom of the screen
                break

            draw_cell(
                self.surface,
                self.spriteset,
                self.worldmap,
                cell,
                self.left_x,
                self.right_x,
                self.top_y,
                self.bottom_y,
            )

    def draw_player(self):
        """Draws the player to the screen."""

        self.surface.blit(
            self.spriteset.get_player(),
            (HALF_TILES_W * 32, HALF_TILES_H * 32),
            (0, 0, *self.spriteset.get_player().get_size()),
        )

    def draw_creatures(self):
        """Draws creatures to the screen."""

        for creature in self.creatures:
            if not is_visible(
                *creature.position, self.left_x, self.right_x, self.top_y, self.bottom_y
            ):
                continue

            if not creature.alive:
                continue

            cell = self.worldmap.cell_at(*creature.position)

            # hide creatures in fog of war
            if not cell.visible:
                continue

            self.surface.blit(
                creature.sprite,
                (
                    (creature.position[0] - self.left_x) * 32,
                    (creature.position[1] - self.top_y) * 32,
                ),
                (0, 0, *creature.sprite.get_size()),
            )

    def draw_containers(self):
        """Draws chests to the screen."""

        for chest in self.containers:
            if not is_visible(
                *chest.position, self.left_x, self.right_x, self.top_y, self.bottom_y
            ):
                continue

            cell = self.worldmap.cell_at(*chest.position)

            # hide chests in fog of war
            if not cell.visible:
                continue

            if chest.empty():
                sprite = self.chest_open_sprite
            else:
                sprite = self.chest_sprite

            self.surface.blit(
                sprite,
                (
                    (chest.position[0] - self.left_x) * 32,
                    (chest.position[1] - self.top_y) * 32,
                ),
                (0, 0, *sprite.get_size()),
            )

    def draw_info_section(self):
        """Draws the info panel and log to the screen."""

        pygame.draw.rect(
            self.surface,
            (0, 0, 0),
            pygame.Rect(0, LOG_Y, WINDOW_W, LOG_H),
        )

        for y, entry in enumerate(self.game.get_log(entries=LOG_ENTRIES)):
            self.font.render_to(
                self.surface,
                (LOG_X, LOG_Y + (y * LOG_PIXELS)),
                f"> {entry}",
                (255, 255, 255),
                (0, 0, 0),
            )

        # print info pane
        hp_text, hp_text_rect = self.font.render(
            f"HP {self.player.hitpoints} / {self.player.maxhitpoints}",
            (0, 0, 0),
            (0, 0, 0, 0),
        )

        xp_text, xp_text_rect = self.font.render(
            f"XP {self.player.xp} / {self.player.next_level_xp}",
            (255, 255, 255),
            (0, 0, 0, 0),
        )

        self.surface.blit(hp_red, (0, LOG_Y), (0, 0, LOG_X - 16, LOG_PIXELS))
        self.surface.blit(
            hp_green,
            (0, LOG_Y),
            (
                0,
                0,
                (LOG_X * (self.player.hitpoints / self.player.maxhitpoints)) - 16,
                LOG_PIXELS,
            ),
        )
        self.surface.blit(hp_text, (hp_text_rect.width // 2, LOG_Y))

        self.surface.blit(
            xp_bar,
            (0, LOG_Y + LOG_PIXELS),
            (
                0,
                0,
                (LOG_X * (self.player.xp / self.player.next_level_xp)) - 16,
                LOG_PIXELS,
            ),
        )
        self.surface.blit(xp_text, (xp_text_rect.width // 2, LOG_Y + LOG_PIXELS))

        self.font.render_to(
            self.surface,
            (0, WINDOW_H - LOG_PIXELS * 3),
            f"Gold {self.player.gold}",
            (255, 255, 255),
            (0, 0, 0),
        )

        self.font.render_to(
            self.surface,
            (0, WINDOW_H - LOG_PIXELS * 2),
            f"Level {self.player.level}",
            (255, 255, 255),
            (0, 0, 0),
        )

        self.font.render_to(
            self.surface,
            (0, WINDOW_H - LOG_PIXELS),
            f"Seed {self.game.seed}",
            (255, 255, 255),
            (0, 0, 0),
        )

    def tick(self, dt: float) -> bool:
        """Processes an iteration of game logic."""

        if self._pause_window is not None:
            return True

        # pause the world if we have a modal open
        if self._modal is not None:
            self._modal.tick(dt)
            if self._modal.done():
                self._modal = None
                self._inventory_button.visible = True
                self.should_think = True
            else:
                return True

        if self._battle is not None:
            self._battle.tick(dt)
            return True

        if self.first_loop:
            self.should_think = self.first_loop
            self.first_loop = False

        self._time_accum += dt
        self._ai_time_accum += dt

        keys = pygame.key.get_pressed()
        if keys[pygame.K_w]:
            self._y_delta = -1
        if keys[pygame.K_a]:
            self._x_delta = -1
        if keys[pygame.K_s]:
            self._y_delta = 1
        if keys[pygame.K_d]:
            self._x_delta = 1

        # use accumulator to increase time it takes to move one tile
        if self._time_accum >= MS_PER_TILE_MOVE:
            if self._x_delta != 0 or self._y_delta != 0:
                new_player_pos = (
                    self.player.position[0] + self._x_delta,
                    self.player.position[1] + self._y_delta,
                )

                self.move_player(new_player_pos)

                self._x_delta = 0
                self._y_delta = 0

            self._time_accum -= MS_PER_TILE_MOVE

        if self._ai_time_accum >= MS_PER_AI_MOVE:
            # even if the player doesn't move, let the world simulate
            # this makes AIs move even when the player doesn't
            self.should_think = True

            self._ai_time_accum -= MS_PER_AI_MOVE

        # update game logic
        if self.should_think:
            self.worldmap.update_fov(*self.player.position)

            self.player.think()

            if not self.player.alive:
                self.end_game(GameState.STATE_DEAD)

            creature_died = False

            for creature in self.creatures:
                creature.think()

                if not creature.alive:
                    creature.ai_release()
                    self.player.give_xp(int(math.floor(creature.maxhitpoints * CREATURE_XP_MULTIPLIER)))
                    self.player.give(Gold(value=creature.gold))
                    self.game.log(f"{creature.name} is dead. RIP.")
                    self.game.log(
                        f"Looted {creature.gold} gold and gained {creature.maxhitpoints} XP"
                    )

                    creature_died = True

            # clear out dead creatures
            self.creatures = list(filter(lambda c: c.alive, self.creatures))
            if self.creatures and creature_died:
                self.game.log(f'{len(self.creatures)} enemies still remain in the dungeon.')

            # dungeon cleared?
            if self.player.alive and not self.creatures:
                self.end_game(GameState.STATE_WIN)

            self.should_think = False

        return True

    def end_game(self, new_state: GameState):
        """End the game, moving into the given state."""
        self.game.stats().inventory_value = sum(item.value for item in self.player.inventory.items()) + sum(item.value for item in self.player.wieldpoints.values() if item is not None)
        self.game.stats().gold_left_behind = self.sum_gold_in_chests()
        self.game.stats().level = self.player.level
        self.game.set_state(new_state)
        self.container.kill()

    def sum_gold_in_chests(self) -> int:
        """Get the total amount of gold in chests in the dungeon."""
        total = 0
        for chest in self.containers:
            for item in chest.items():
                if isinstance(item, Gold):
                    total += item.value

        return total

    def render(self):
        """Renders the game to the screen."""

        self.surface.fill(0)

        self.left_x = self.player.position[0] - HALF_TILES_W
        self.right_x = self.player.position[0] + HALF_TILES_W

        self.top_y = self.player.position[1] - HALF_TILES_H
        self.bottom_y = self.player.position[1] + HALF_TILES_H + 1

        self.draw_map()
        self.draw_player()
        self.draw_creatures()
        self.draw_containers()

        self.draw_info_section()


def sprite_at(
    surface: pygame.Surface,
    sprite: pygame.Surface,
    cell: Cell,
    x: int,
    y: int,
    left_x: int,
    right_x: int,
    top_y: int,
    bottom_y: int,
):
    """Renders a sprite onto the given surface at the given location."""

    # don't overdraw
    if x < left_x or x > right_x:
        return
    if y < top_y or y > bottom_y:
        return

    dest_x = x - left_x
    dest_y = y - top_y

    sprite_size = sprite.get_size()
    dest = (dest_x * sprite_size[0], dest_y * sprite_size[1])

    if cell.visible or cell.explored:
        surface.blit(sprite, dest, (0, 0, *sprite_size))

        if cell.explored and not cell.visible:
            # darken explored but not visible tile
            surface.blit(explored_overlay, dest, (0, 0, *sprite_size))


def draw_cell(
    surface: pygame.Surface,
    spriteset: SpriteSet,
    worldmap: Map,
    cell: Cell,
    left_x: int,
    right_x: int,
    top_y: int,
    bottom_y: int,
):
    """Renders a map cell onto the given surface at the given location."""

    if cell.cell_type == Cell.TYPE_ROOM:
        sprite = spriteset.get_floor()
    elif cell.cell_type == Cell.TYPE_HALL:
        sprite = spriteset.get_hall_floor()
    else:
        return

    sprite_at(
        surface,
        sprite,
        cell,
        cell.pos[0],
        cell.pos[1],
        left_x,
        right_x,
        top_y,
        bottom_y,
    )

    if cell.clutter is not None:
        sprite_at(
            surface,
            cell.clutter,
            cell,
            cell.pos[0],
            cell.pos[1],
            left_x,
            right_x,
            top_y,
            bottom_y,
        )

    n_cell = worldmap.cell_at(cell.pos[0], cell.pos[1] - 1)
    if not n_cell.is_passable():
        sprite_at(
            surface,
            spriteset.get_wall(SpriteSet.WALL_N),
            n_cell,
            cell.pos[0],
            cell.pos[1] - 1,
            left_x,
            right_x,
            top_y,
            bottom_y,
        )

        if cell.wall_clutter is not None:
            sprite_at(
                surface,
                cell.wall_clutter,
                n_cell,
                cell.pos[0],
                cell.pos[1] - 1,
                left_x,
                right_x,
                top_y,
                bottom_y,
            )

    if (cell.pos[1] + 1) < worldmap.height:
        s_cell = worldmap.cell_at(cell.pos[0], cell.pos[1] + 1)
        if not s_cell.is_passable():
            sprite_at(
                surface,
                spriteset.get_wall(SpriteSet.WALL_S),
                s_cell,
                cell.pos[0],
                cell.pos[1] + 1,
                left_x,
                right_x,
                top_y,
                bottom_y,
            )

    w_cell = worldmap.cell_at(cell.pos[0] - 1, cell.pos[1])
    if not w_cell.is_passable():
        sprite_at(
            surface,
            spriteset.get_wall(SpriteSet.WALL_W),
            w_cell,
            cell.pos[0] - 1,
            cell.pos[1],
            left_x,
            right_x,
            top_y,
            bottom_y,
        )

    if (cell.pos[0] + 1) < worldmap.width:
        e_cell = worldmap.cell_at(cell.pos[0] + 1, cell.pos[1])
        if not e_cell.is_passable():
            sprite_at(
                surface,
                spriteset.get_wall(SpriteSet.WALL_E),
                e_cell,
                cell.pos[0] + 1,
                cell.pos[1],
                left_x,
                right_x,
                top_y,
                bottom_y,
            )


def is_visible(x: int, y: int, left_x: int, right_x: int, top_y: int, bottom_y: int):
    """Returns True if the given coordinate is inside the visible area."""

    return left_x <= x < right_x and top_y <= y < bottom_y
