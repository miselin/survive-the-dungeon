import pygame
import pygame_gui

from .game import Game, game

SUBTITLE = "Choose what to loot!"


class InventoryTransferModal(object):
    def __init__(self, ui, container, player, surface, title="Chest Opened"):
        self.ui = ui

        self.surface = surface
        parent_size = self.surface.get_rect().size
        modal_size = (parent_size[0] * 0.75, parent_size[1] * 0.75)

        rt = pygame.Rect(0, 0, *modal_size)
        rt.center = self.surface.get_rect().center

        self.window = pygame_gui.elements.UIWindow(
            rect=rt, manager=ui, resizable=False, window_display_title="Chest Opened"
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
            pygame.Rect(0, -48, 192, 32),
            "Loot",
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

    def kill(self):
        if self.bag is not None:
            self.bag.kill()

    def render(self):
        pass

    def tick(self, dt):
        pass

    def menu(self):
        game().set_state(Game.STATE_MAIN_MENU)

    def close(self):
        self._done = True

    def done(self):
        return not self.window.alive()

    def transfer_to_player(self):
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

    def handle_event(self, event):
        if event.type == pygame.QUIT:
            raise SystemExit()
        elif event.type == pygame_gui.UI_BUTTON_PRESSED:
            if event.ui_element == self.done_button:
                self.transfer_to_player()
                self.window.kill()
