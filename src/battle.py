import pygame
import pygame_gui

from combat import Combat
from dice import Dice
from game import Game, game
from item import InstantEffectItem


class Battle(object):
    def __init__(self, container, ui, surface, player, defender, height):
        self.dungeon_container = container
        self.ui = ui
        self.surface = surface
        self.dirty = True
        self._done = False
        self.needs_turn = False
        self.player_heal = False

        self.player = player
        self.defender = defender

        self.dice = Dice()
        self.combat = Combat(self.dice)

        self.atkmult = 1.0
        self.defmult = 1.0

        surface_rect = self.surface.get_rect()
        self.container = pygame_gui.elements.UIPanel(
            pygame.Rect(0, 0, surface_rect.width, height),
            manager=self.ui,
            container=self.dungeon_container,
            object_id=pygame_gui.core.ObjectID(
                class_id="@battle_ui",
                object_id="#root",
            ),
        )

        panel_rect = self.container.get_container().get_rect()

        title = pygame_gui.elements.UILabel(
            pygame.Rect(0, 4, surface_rect.width, 32),
            "Battle",
            manager=self.ui,
            container=self.container,
            object_id=pygame_gui.core.ObjectID(
                class_id="@battle_ui",
                object_id="#battle_subtitle",
            ),
            anchors={"centerx": "centerx"},
        )

        pygame_gui.elements.UILabel(
            pygame.Rect(0, 0, 32, 32),
            "vs",
            manager=self.ui,
            container=self.container,
            object_id=pygame_gui.core.ObjectID(
                class_id="@battle_ui",
                object_id="#battle_subtitle",
            ),
            anchors={"centerx": "centerx", "centery": "centery"},
        )

        combatant_panel_width = panel_rect.width * 0.45

        self.player_panel = pygame_gui.elements.UIPanel(
            pygame.Rect(8, 4, combatant_panel_width, panel_rect.height - 44),
            manager=self.ui,
            container=self.container,
            object_id=pygame_gui.core.ObjectID(
                class_id="@battle_ui",
                object_id="#player",
            ),
            anchors={
                "left": "left",
                "top_target": title,
            },
        )

        player_panel_rect = self.player_panel.get_container().get_rect()

        player_title = pygame_gui.elements.UILabel(
            pygame.Rect(0, 4, combatant_panel_width, 16),
            "You",
            manager=self.ui,
            container=self.player_panel,
            object_id=pygame_gui.core.ObjectID(
                class_id="@mainmenu_subtitle",
                object_id="#battle_player_subtitle",
            ),
            anchors={"centerx": "centerx", "top": "top"},
        )

        # 8 pixel padding, 32 pixel high
        action_buttons_height = 80  # 4 * 32

        player_description = pygame_gui.elements.UITextBox(
            self.player.describe_wields(),
            pygame.Rect(
                8,
                4,
                combatant_panel_width - 16,
                player_panel_rect.height - 32 - action_buttons_height,
            ),
            manager=self.ui,
            container=self.player_panel,
            anchors={"top_target": player_title, "left": "left"},
            object_id=pygame_gui.core.ObjectID(
                class_id="@battle_textbox",
                object_id="#battle_player_data",
            ),
        )

        prev_button = pygame_gui.elements.UIButton(
            pygame.Rect(4, 8, (player_panel_rect.width // 2) - 8, 32),
            "Normal Attack",
            manager=self.ui,
            container=self.player_panel,
            anchors={"left": "left", "top_target": player_description},
            object_id=pygame_gui.core.ObjectID(
                class_id="@battle_buttons",
                object_id="#player_normal_attack",
            ),
            tool_tip_text="A normal attack with your weapon.",
        )

        prev_button = pygame_gui.elements.UIButton(
            pygame.Rect(8, 8, (player_panel_rect.width // 2) - 8, 32),
            "Off. Attack",
            manager=self.ui,
            container=self.player_panel,
            anchors={"left_target": prev_button, "top_target": player_description},
            object_id=pygame_gui.core.ObjectID(
                class_id="@battle_buttons",
                object_id="#player_heavy_attack",
            ),
            tool_tip_text="A heavy attack that does <font color=#64FF64>2x</font> damage but applies a <font color=#FF6464>0.3x</font> modifier to your defense.",
        )

        prev_row = prev_button

        prev_button = pygame_gui.elements.UIButton(
            pygame.Rect(4, 8, (player_panel_rect.width // 2) - 8, 32),
            "Def. Attack",
            manager=self.ui,
            container=self.player_panel,
            anchors={"left": "left", "top_target": prev_row},
            object_id=pygame_gui.core.ObjectID(
                class_id="@battle_buttons",
                object_id="#player_defensive_attack",
            ),
            tool_tip_text="A defensive attack that does <font color=#FF6464>0.5x</font> damage, but applies a <font color=#64FF64>1.5x</font> modifier to your defense.",
        )

        self.player_heal_button = pygame_gui.elements.UIButton(
            pygame.Rect(8, 8, (player_panel_rect.width // 2) - 8, 32),
            "Heal",
            manager=self.ui,
            container=self.player_panel,
            anchors={"left_target": prev_button, "top_target": prev_row},
            object_id=pygame_gui.core.ObjectID(
                class_id="@battle_buttons",
                object_id="#player_heal",
            ),
            tool_tip_text="Use the next available healing item in your inventory.",
        )

        if not self.player_can_heal():
            self.player_heal_button.disable()

        self.defender_panel = pygame_gui.elements.UIPanel(
            pygame.Rect(
                -(8 + combatant_panel_width),
                4,
                combatant_panel_width,
                panel_rect.height - 44,
            ),
            manager=self.ui,
            container=self.container,
            object_id=pygame_gui.core.ObjectID(
                class_id="@battle_ui",
                object_id="#defender",
            ),
            anchors={
                "right": "right",
                "top_target": title,
            },
        )

        defender_panel_rect = self.defender_panel.get_container().get_rect()

        defender_title = pygame_gui.elements.UILabel(
            pygame.Rect(0, 0, combatant_panel_width, 24),
            defender.name,
            manager=self.ui,
            container=self.defender_panel,
            object_id=pygame_gui.core.ObjectID(
                class_id="@mainmenu_subtitle",
                object_id="#battle_defender_subtitle",
            ),
            anchors={"centerx": "centerx", "top": "top"},
        )

        self.defender_hp_label = pygame_gui.elements.UILabel(
            pygame.Rect(0, 4, combatant_panel_width, 24),
            f"{self.defender.hitpoints} HP remains",
            manager=self.ui,
            container=self.defender_panel,
            object_id=pygame_gui.core.ObjectID(
                class_id="@mainmenu_subtitle",
                object_id="#battle_defender_subtitle",
            ),
            anchors={"centerx": "centerx", "top_target": defender_title},
        )

        pygame_gui.elements.UITextBox(
            self.defender.describe_wields(),
            pygame.Rect(
                8, 8, combatant_panel_width - 16, defender_panel_rect.height - 68  # 40
            ),
            manager=self.ui,
            container=self.defender_panel,
            anchors={"top_target": self.defender_hp_label, "left": "left"},
            object_id=pygame_gui.core.ObjectID(
                class_id="@battle_textbox",
                object_id="#battle_defender_data",
            ),
        )

    def tick(self, dt):
        if self.needs_turn:
            self.player.in_battle = True
            self.defender.in_battle = True

            self.combat_turn()
            self.needs_turn = False
            self.player_heal = False

            if self.player_can_heal():
                self.player_heal_button.enable()
            else:
                self.player_heal_button.disable()

            self.player.think()
            self.defender.think()

            self.defender_hp_label.set_text(f"{self.defender.hitpoints} HP Remains")

            if not (self.player.alive and self.defender.alive):
                self.end_battle()

    def end_battle(self):
        self.container.kill()
        self.container = None
        self._done = True
        self.player.in_battle = False
        self.defender.in_battle = False

    def kill(self):
        self.end_battle()

    def done(self):
        return self._done

    def handle_event(self, event):
        if event.type == pygame.QUIT:
            raise SystemExit()

        elif event.type == pygame_gui.UI_BUTTON_PRESSED:
            components = event.ui_object_id.split(".")
            if components:
                which = components[-1]
                if which == "#player_normal_attack":
                    self.atkmult = 1.0
                    self.defmult = 1.0
                    self.needs_turn = True
                elif which == "#player_heavy_attack":
                    self.atkmult = 2.0
                    self.defmult = 0.3
                    self.needs_turn = True
                elif which == "#player_defensive_attack":
                    self.atkmult = 0.5
                    self.defmult = 1.5
                    self.needs_turn = True
                elif which == "#player_heal":
                    self.needs_turn = True
                    self.player_heal = True

    def combat_turn(self):
        if self.player_heal:
            heal_item = self.get_heal_item()
            if heal_item is not None:
                self.player.inventory.take_item(heal_item)
                applied = heal_item.apply(self.player)
                game().log(f"{self.player.name} healed {applied} with {heal_item.name}")
        else:
            self.combat.attack(self.player, self.defender, atkmult=self.atkmult)

        # don't let the defender retaliate if the player dealt a fatal blow
        if self.defender.hitpoints >= 1:
            self.combat.attack(self.defender, self.player, defmult=self.defmult)

        self.atkmult = 1.0
        self.defmult = 1.0

    def player_can_heal(self):
        for item in self.player.inventory.items():
            if isinstance(item, InstantEffectItem):
                return item.hpboost > 0

        return False

    def get_heal_item(self):
        hp_needed = self.player.maxhitpoints - self.player.hitpoints

        heals = filter(
            lambda x: isinstance(x, InstantEffectItem) and x.hpboost > 0,
            self.player.inventory.items(),
        )
        if not heals:
            return None

        heals = sorted(heals, key=lambda x: x.hpboost)

        last_heal = None
        for heal in heals:
            if heal.hpboost >= hp_needed:
                return heal

            last_heal = heal

        # none that heals all our lost HP, return the highest one we found
        return last_heal
