"""This module handles transferring items from chests to the player."""

import pygame
import pygame_gui

from .creature import Creature
from .game import game
from .item import Chest

SUBTITLE = "Choose what to loot!"


class InventoryTransferModal:
    """A modal to let the player choose what to transfer to their inventory."""

    def __init__(
        self,
        ui: pygame_gui.UIManager,
        container: Chest,
        player: Creature,
        surface: pygame.Surface,
        title="Chest Opened",
    ):
        self.ui = ui

        self.surface = surface
        parent_size = self.surface.get_rect().size
        modal_size = (parent_size[0] * 0.75, parent_size[1] * 0.75)

        rt = pygame.Rect(0, 0, *modal_size)
        rt.center = self.surface.get_rect().center

        self.window = pygame_gui.elements.UIWindow(
            rect=rt,
            manager=ui,
            resizable=False,
            window_display_title=title,
        )

        self._container = container
        self._player = player
        self._done = False
        self.dirty = True

        label = pygame_gui.elements.UILabel(
            pygame.Rect(8, 8, -1, -1),
            "Here's what you can loot:",
            self.ui,
            container=self.window,
            anchors={"top": "top", "left": "left", "right": "right"},
        )

        self.done_button = pygame_gui.elements.UIButton(
            pygame.Rect(-104, -48, 192, 32),
            "Loot Selected",
            manager=self.ui,
            container=self.window,
            anchors={
                "centerx": "centerx",
                "bottom": "bottom",
            },
        )

        self.loot_all_button = pygame_gui.elements.UIButton(
            pygame.Rect(104, -48, 192, 32),
            "Loot All",
            manager=self.ui,
            container=self.window,
            anchors={
                "centerx": "centerx",
                "bottom": "bottom",
            },
        )

        window_rect = self.window.get_container().get_rect()

        done_button_rect = self.done_button.get_relative_rect()
        label_rect = label.get_relative_rect()

        self.lookup = dict((str(item), item) for item in container.items())

        self.inventory = pygame_gui.elements.UISelectionList(
            pygame.Rect(
                8,
                8,
                window_rect.width - 16,
                window_rect.height
                - 32
                - done_button_rect.height
                - label_rect.height
                - label_rect.top,
            ),
            item_list=self.lookup.keys(),
            manager=self.ui,
            container=self.window,
            allow_multi_select=True,
            anchors={
                "top_target": label,
                "left": "left",
            },
        )

    def render(self):
        """Unused. Here for compatibility."""

    def tick(self, _):
        """Unused. Here for compatibility."""

    def close(self):
        """Closes the modal."""
        self._done = True

    def done(self) -> bool:
        """Check whether the modal has been closed."""
        return not self.window.alive()

    def transfer_to_player(self):
        """Transfer selected items to the player."""

        inventory_filled = False
        for entry in self.inventory.get_multi_selection():
            item = self.lookup[entry]
            if self._player.give(item):
                self._container.take_item(item)
            else:
                inventory_filled = True

        if inventory_filled:
            game().log("Your inventory is full!")
            game().log("Some items were not transferred.")

    def transfer_all_to_player(self):
        """Transfer all items to the player."""

        inventory_filled = False
        for item in self._container.items():
            if self._player.give(item):
                self._container.take_item(item)
            else:
                inventory_filled = True

        if inventory_filled:
            game().log("Your inventory is full!")
            game().log("Some items were not transferred.")

    def handle_event(self, event):
        """Handle pygame events."""

        if event.type == pygame.QUIT:
            raise SystemExit()
        elif event.type == pygame_gui.UI_BUTTON_PRESSED:
            if event.ui_element == self.done_button:
                self.transfer_to_player()
                self.window.kill()
            elif event.ui_element == self.loot_all_button:
                self.transfer_all_to_player()
                self.window.kill()
