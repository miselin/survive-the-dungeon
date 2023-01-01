"""Battle handles the battle UI logic"""

from typing import List, Optional

import pygame
import pygame_gui

from .combat import Combat, CombatState
from .creature import Creature
from .dice import Dice
from .item import InstantEffectItem
from .game import game


class Battle(pygame_gui.elements.UIWindow):
    """Battle handles a single battle between the player and a creature"""

    def __init__(self, player: Creature, defender: Creature, *args, **kwargs):
        super().__init__(
            object_id=pygame_gui.core.ObjectID(
                class_id="@battle_ui",
                object_id="#root",
            ),
            resizable=False,
            *args,
            **kwargs,
        )

        self._player = player
        self._defender = defender

        self._dice = Dice()
        self._combat = Combat(self._dice)
        self._combat_state = CombatState(
            player=self._player,
            defender=self._defender,
            atkmult=1.0,
            defmult=1.0,
            needs_turn=False,
            player_heal=None,
        )

        self._build_ui()

    def tick(self, _: float):
        """tick runs an iteration of the battle, if needed"""

        if not self.alive:
            return

        if self._combat_state.needs_turn:
            self._player.in_battle = True
            self._defender.in_battle = True

            self._combat.turn(self._combat_state)

            if self.player_can_heal():
                self._player_heal_button.enable()
            else:
                self._player_heal_button.disable()

            self._defender_hp_label.set_text(f"{self._defender.hitpoints} HP remains")

            if not (self._player.alive and self._defender.alive):
                self.end_battle()

    def end_battle(self):
        """end_battle ends the battle between the two combatants"""
        if self._player.alive and not self._defender.alive:
            game().stats().vanquished += 1

        self._player.in_battle = False
        self._defender.in_battle = False
        self.kill()

    def process_event(self, event: pygame.event.Event) -> bool:
        consumed = super().process_event(event)

        if event.type == pygame_gui.UI_BUTTON_PRESSED:
            components = event.ui_object_id.split(".")
            if components:
                which = components[-1]
                if which == "#player_normal_attack":
                    self._combat_state.atkmult = 1.0
                    self._combat_state.defmult = 1.0
                    self._combat_state.needs_turn = True
                elif which == "#player_heavy_attack":
                    self._combat_state.atkmult = 2.0
                    self._combat_state.defmult = 0.3
                    self._combat_state.needs_turn = True
                elif which == "#player_defensive_attack":
                    self._combat_state.atkmult = 0.5
                    self._combat_state.defmult = 1.5
                    self._combat_state.needs_turn = True
                elif which == "#player_heal":
                    self._combat_state.needs_turn = True
                    self._combat_state.player_heal = self.get_heal_item()

        return consumed

    def player_can_heal(self):
        """player_can_heal returns whether the player has a healing item"""
        for item in self._player.inventory.items():
            if isinstance(item, InstantEffectItem):
                return item.hpboost > 0

        return False

    def get_heal_item(self) -> Optional[InstantEffectItem]:
        """get_heal_item gets the most effective healing item the player carries"""
        hp_needed = self._player.maxhitpoints - self._player.hitpoints

        heals: List[InstantEffectItem] = list(
            filter(
                lambda x: isinstance(x, InstantEffectItem) and x.hpboost > 0,
                self._player.inventory.items(),
            )
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

    def _build_ui(self):
        panel_rect = self.get_container().get_rect()

        title = pygame_gui.elements.UILabel(
            pygame.Rect(0, 4, panel_rect.width, 32),
            "Battle",
            manager=self.ui_manager,
            container=self.get_container(),
            object_id=pygame_gui.core.ObjectID(
                class_id="@battle_ui",
                object_id="#battle_subtitle",
            ),
            anchors={"centerx": "centerx"},
        )

        pygame_gui.elements.UILabel(
            pygame.Rect(0, 0, 32, 32),
            "vs",
            manager=self.ui_manager,
            container=self.get_container(),
            object_id=pygame_gui.core.ObjectID(
                class_id="@battle_ui",
                object_id="#battle_subtitle",
            ),
            anchors={"centerx": "centerx", "centery": "centery"},
        )

        combatant_panel_width = panel_rect.width * 0.45

        player_panel = pygame_gui.elements.UIPanel(
            pygame.Rect(8, 4, combatant_panel_width, panel_rect.height - 44),
            manager=self.ui_manager,
            container=self.get_container(),
            object_id=pygame_gui.core.ObjectID(
                class_id="@battle_ui",
                object_id="#player",
            ),
            anchors={
                "left": "left",
                "top_target": title,
            },
        )

        player_panel_rect = player_panel.get_container().get_rect()

        player_title = pygame_gui.elements.UILabel(
            pygame.Rect(0, 4, combatant_panel_width, 16),
            "You",
            manager=self.ui_manager,
            container=player_panel,
            object_id=pygame_gui.core.ObjectID(
                class_id="@mainmenu_subtitle",
                object_id="#battle_player_subtitle",
            ),
            anchors={"centerx": "centerx", "top": "top"},
        )

        # 8 pixel padding, 32 pixel high
        action_buttons_height = 80  # 4 * 32

        player_description = pygame_gui.elements.UITextBox(
            self._player.describe_wields(),
            pygame.Rect(
                8,
                4,
                combatant_panel_width - 16,
                player_panel_rect.height - 32 - action_buttons_height,
            ),
            manager=self.ui_manager,
            container=player_panel,
            anchors={"top_target": player_title, "left": "left"},
            object_id=pygame_gui.core.ObjectID(
                class_id="@battle_textbox",
                object_id="#battle_player_data",
            ),
        )

        prev_button = pygame_gui.elements.UIButton(
            pygame.Rect(4, 8, (player_panel_rect.width // 2) - 8, 32),
            "Normal Attack",
            manager=self.ui_manager,
            container=player_panel,
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
            manager=self.ui_manager,
            container=player_panel,
            anchors={"left_target": prev_button, "top_target": player_description},
            object_id=pygame_gui.core.ObjectID(
                class_id="@battle_buttons",
                object_id="#player_heavy_attack",
            ),
            tool_tip_text=(
                "A heavy attack that does <font color=#64FF64>2x</font> damage "
                "but applies a <font color=#FF6464>0.3x</font> modifier to your defense."
            ),
        )

        prev_row = prev_button

        prev_button = pygame_gui.elements.UIButton(
            pygame.Rect(4, 8, (player_panel_rect.width // 2) - 8, 32),
            "Def. Attack",
            manager=self.ui_manager,
            container=player_panel,
            anchors={"left": "left", "top_target": prev_row},
            object_id=pygame_gui.core.ObjectID(
                class_id="@battle_buttons",
                object_id="#player_defensive_attack",
            ),
            tool_tip_text=(
                "A defensive attack that does <font color=#FF6464>0.5x</font> damage"
                ", but applies a <font color=#64FF64>1.5x</font> modifier to your defense."
            ),
        )

        self._player_heal_button = pygame_gui.elements.UIButton(
            pygame.Rect(8, 8, (player_panel_rect.width // 2) - 8, 32),
            "Heal",
            manager=self.ui_manager,
            container=player_panel,
            anchors={"left_target": prev_button, "top_target": prev_row},
            object_id=pygame_gui.core.ObjectID(
                class_id="@battle_buttons",
                object_id="#player_heal",
            ),
            tool_tip_text="Use the next available healing item in your inventory.",
        )

        if not self.player_can_heal():
            self._player_heal_button.disable()

        defender_panel = pygame_gui.elements.UIPanel(
            pygame.Rect(
                -(8 + combatant_panel_width),
                4,
                combatant_panel_width,
                panel_rect.height - 44,
            ),
            manager=self.ui_manager,
            container=self.get_container(),
            object_id=pygame_gui.core.ObjectID(
                class_id="@battle_ui",
                object_id="#defender",
            ),
            anchors={
                "right": "right",
                "top_target": title,
            },
        )

        defender_panel_rect = defender_panel.get_container().get_rect()

        defender_title = pygame_gui.elements.UILabel(
            pygame.Rect(0, 0, combatant_panel_width, 24),
            self._defender.name,
            manager=self.ui_manager,
            container=defender_panel,
            object_id=pygame_gui.core.ObjectID(
                class_id="@mainmenu_subtitle",
                object_id="#battle_defender_subtitle",
            ),
            anchors={"centerx": "centerx", "top": "top"},
        )

        self._defender_hp_label = pygame_gui.elements.UILabel(
            pygame.Rect(0, 4, combatant_panel_width, 24),
            f"{self._defender.hitpoints} HP remains",
            manager=self.ui_manager,
            container=defender_panel,
            object_id=pygame_gui.core.ObjectID(
                class_id="@mainmenu_subtitle",
                object_id="#battle_defender_subtitle",
            ),
            anchors={"centerx": "centerx", "top_target": defender_title},
        )

        pygame_gui.elements.UITextBox(
            self._defender.describe_wields(),
            pygame.Rect(
                8, 8, combatant_panel_width - 16, defender_panel_rect.height - 68  # 40
            ),
            manager=self.ui_manager,
            container=defender_panel,
            anchors={"top_target": self._defender_hp_label, "left": "left"},
            object_id=pygame_gui.core.ObjectID(
                class_id="@battle_textbox",
                object_id="#battle_defender_data",
            ),
        )
