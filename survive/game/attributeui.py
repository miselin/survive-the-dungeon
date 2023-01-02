"""This module exports the UI for character customization."""
import random

import pygame
import pygame_gui

from .attributes import ATTRIBUTES, Attribute, AttributeSet
from .constants import POINT_BUY_POOL_COUNT


class CharacterCustomization(pygame_gui.elements.UIWindow):
    """CharacterCustomization handles setting player attributes before play."""

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)

        self._attributes = AttributeSet()

        self._up_buttons = {}
        self._down_buttons = {}
        self._attr_labels = {}

        self._pool = POINT_BUY_POOL_COUNT

        # use the system RNG - don't let players modify the game's RNG state
        self._rng = random.SystemRandom()

        container_rect = self.get_container().get_rect()

        info = pygame_gui.elements.UITextBox(
            html_text="Select your character attributes to prepare for the dungeon ahead.",
            relative_rect=pygame.Rect(0, 0, container_rect.width, -1),
            manager=self.ui_manager,
            container=self.get_container(),
            anchors={"left": "left", "top": "top"},
            object_id=pygame_gui.core.ObjectID(
                class_id="@dialog",
                object_id="#dialog_desc",
            ),
        )

        self.start_game = pygame_gui.elements.UIButton(
            pygame.Rect(0, 8, 192, 32),
            "Start Game",
            manager=self.ui_manager,
            container=self.get_container(),
            anchors={"top_target": info, "centerx": "centerx"},
        )

        self.start_game.disable()

        self.pool_text_box = pygame_gui.elements.UITextBox(
            html_text="X",
            relative_rect=pygame.Rect(0, 16, container_rect.width, -1),
            manager=self.ui_manager,
            container=self.get_container(),
            anchors={"left": "left", "top_target": self.start_game},
            object_id=pygame_gui.core.ObjectID(
                class_id="@dialog_centered",
            ),
        )

        attribute_panel_width = max(600, container_rect.width * 0.4)

        attribute_scrolling_container = pygame_gui.elements.UIScrollingContainer(
            pygame.Rect(0, 0, attribute_panel_width + 24, container_rect.height - 128),
            manager=self.ui_manager,
            container=self.get_container(),
            anchors={"top_target": self.pool_text_box, "centerx": "centerx"},
        )

        attribute_scrolling_container.set_scrollable_area_dimensions(
            (attribute_panel_width, 8 + (len(ATTRIBUTES) * 80))
        )

        top_anchor = None
        for attribute in ATTRIBUTES:
            if top_anchor is None:
                anchors = {"top": "top", "centerx": "centerx"}
            else:
                anchors = {"top_target": top_anchor, "centerx": "centerx"}

            attribute_panel = pygame_gui.core.UIContainer(
                relative_rect=pygame.Rect(0, 8, attribute_panel_width, 72),
                manager=self.ui_manager,
                container=attribute_scrolling_container,
                anchors=anchors,
            )

            top_anchor = attribute_panel

            description = self._attributes.describe(attribute)

            info_text = pygame_gui.elements.UITextBox(
                html_text=f"<b>{self._attributes.attr_label(attribute)}</b>: {description}",
                relative_rect=pygame.Rect(0, 0, attribute_panel.get_size()[0], -1),
                manager=self.ui_manager,
                container=attribute_panel,
                anchors={"left": "left", "top": "top"},
                object_id=pygame_gui.core.ObjectID(
                    class_id="@dialog_centered",
                ),
            )

            modify_panel = pygame_gui.elements.UIPanel(
                relative_rect=pygame.Rect(0, 0, container_rect.width * 0.5, 38),
                manager=self.ui_manager,
                container=attribute_panel,
                anchors={"top_target": info_text, "centerx": "centerx"},
            )

            modify_rt = modify_panel.get_container().get_rect()

            self._attr_labels[attribute] = pygame_gui.elements.UITextBox(
                html_text=f"{self._attributes.get(attribute)} = {self.modifier_str(attribute)}",
                relative_rect=pygame.Rect(0, 0, 64, modify_rt.height),
                manager=self.ui_manager,
                container=modify_panel,
                anchors={"centerx": "centerx", "top": "top"},
                object_id=pygame_gui.core.ObjectID(
                    class_id="@attribute_value",
                ),
            )

            down_button = pygame_gui.elements.UIButton(
                relative_rect=pygame.Rect(-56, 4, 48, 24),
                text="-",
                manager=self.ui_manager,
                container=modify_panel,
                anchors={"centerx": "centerx", "top": "top"},
                object_id=pygame_gui.core.ObjectID(
                    class_id="@attribute_updown",
                ),
            )

            self._down_buttons[down_button] = attribute

            up_button = pygame_gui.elements.UIButton(
                relative_rect=pygame.Rect(56, 4, 48, 24),
                text="+",
                manager=self.ui_manager,
                container=modify_panel,
                anchors={"centerx": "centerx", "top": "top"},
                object_id=pygame_gui.core.ObjectID(
                    class_id="@attribute_updown",
                ),
            )

            self._up_buttons[up_button] = attribute

        self.update_pool()

    def attributes(self) -> AttributeSet:
        """Get the cutomized attributes the player selected"""
        return self._attributes

    def process_event(self, event: pygame.event.Event) -> bool:
        consumed = super().process_event(event)

        if event.type == pygame_gui.UI_BUTTON_PRESSED:
            if event.ui_element == self.start_game:
                self.kill()

            up_attr = self._up_buttons.get(event.ui_element)
            if up_attr is not None:
                self._pool -= 1
                self._attributes.modify(up_attr, 1)

            down_attr = self._down_buttons.get(event.ui_element)
            if down_attr is not None:
                self._pool += 1
                self._attributes.modify(down_attr, -1)

            self.update_pool()

        return consumed

    def modifier_str(self, attr: Attribute) -> str:
        """Get a printable versin of the attribute."""
        modifier = self._attributes.get_modifier(attr)
        if modifier > 0:
            prefix = "<font color=#64FF64>+"
            suffix = "</font>"
        elif modifier < 0:
            prefix = "<font color=#FF6464>"
            suffix = "</font>"
        else:
            prefix = ""
            suffix = ""

        return f"{prefix}{modifier:d}{suffix}"

    def update_pool(self):
        """Update the pool text box"""
        self.pool_text_box.set_text(
            f"You have <b>{self._pool}</b> points remaining to distribute."
        )

        # fix up enable/disable states

        for btn, attr in self._up_buttons.items():
            value = self._attributes.get(attr)
            if self._pool > 0 and value < 20:
                btn.enable()
            else:
                btn.disable()

        for btn, attr in self._down_buttons.items():
            value = self._attributes.get(attr)
            if value <= 0:
                btn.disable()
            else:
                btn.enable()

        # update labels

        for attr in ATTRIBUTES:
            self._attr_labels[attr].set_text(
                f"{self._attributes.get(attr)} = {self.modifier_str(attr)}"
            )

        if self._pool == 0:
            self.start_game.enable()
        else:
            self.start_game.disable()
