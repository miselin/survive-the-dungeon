"""This module handles everything for the inventory management UI."""

import pygame
import pygame_gui

from .creature import Creature
from .game import game
from .item import InstantEffectItem, Item, WieldableItem


class InventoryModal:
    """Runs the modal for inventory management."""

    def __init__(
        self, ui: pygame_gui.UIManager, player: Creature, surface: pygame.Surface
    ):
        self.ui = ui
        self.player = player

        self.surface = surface
        parent_size = self.surface.get_rect().size
        modal_size = (parent_size[0] * 0.85, parent_size[1] * 0.85)
        dialog_size = (parent_size[0] * 0.90, parent_size[1] * 0.3)
        big_dialog_size = (parent_size[0] * 0.90, parent_size[1] * 0.7)

        rt = pygame.Rect(0, 0, *modal_size)
        rt.center = self.surface.get_rect().center

        self.dialog_rt = pygame.Rect(0, 0, *dialog_size)
        self.dialog_rt.center = self.surface.get_rect().center

        self.big_dialog_rt = pygame.Rect(0, 0, *big_dialog_size)
        self.big_dialog_rt.center = self.surface.get_rect().center

        self.window = pygame_gui.elements.UIWindow(
            rect=rt, manager=ui, resizable=False, window_display_title="Inventory"
        )

        self._player = player
        self._done = False
        self.dirty = True
        self.bag = None

        self.popup = None
        self.confirming_wield = None

        self.rebuild()

    def kill(self):
        """Closes the modal."""

        if self.bag is not None:
            self.bag.kill()

    def rebuild(self):
        """Rebuilds and displays the modal."""

        if self.bag is not None:
            self.bag.kill()

        window_rect = self.window.get_container().get_rect()

        self.inspect = {}
        self.destroy = {}
        self.wield = {}
        self.heal = {}

        self.bag = pygame_gui.elements.UIScrollingContainer(
            pygame.Rect(0, 0, window_rect.width, window_rect.height),
            manager=self.ui,
            container=self.window,
            anchors={"top": "top", "left": "left", "right": "right"},
        )

        prev_row = None

        scrollable_rect = self.bag.get_container().get_rect()

        bag_width = scrollable_rect.width - 24
        self.bag.set_scrollable_area_dimensions(
            (bag_width, 16 + (self.player.inventory.count() + 1) * 48)
        )

        for nth, item in enumerate(self.player.inventory.items()):
            anchors = {"left": "left", "right": "right"}
            if prev_row is None:
                anchors["top"] = "top"
            else:
                anchors["top_target"] = prev_row

            container = pygame_gui.elements.UIPanel(
                pygame.Rect(8, 8, bag_width - 16, 48),
                manager=self.ui,
                container=self.bag.get_container(),
                anchors=anchors,
            )

            prev_row = container

            pygame_gui.elements.UITextBox(
                relative_rect=pygame.Rect(8, 0, bag_width - 152, 48),
                html_text=item.name,
                manager=self.ui,
                container=container,
                anchors={"left": "left", "centery": "centery"},
                object_id=pygame_gui.core.ObjectID(
                    class_id="@inventory_ui_item", object_id="#bag_item_%d" % (nth,)
                ),
            )

            anchors = {"right": "right", "centery": "centery"}

            destroy_button = pygame_gui.elements.UIButton(
                pygame.Rect(-40, 0, 32, 32),
                "",
                manager=self.ui,
                container=container,
                anchors=anchors,
                tool_tip_text="Destroy this item",
                object_id=pygame_gui.core.ObjectID(
                    class_id="@inventory_ui_destroy",
                    object_id="#inventory_destroy_%d" % (nth,),
                ),
            )

            self.destroy[destroy_button] = item

            inspect_button = pygame_gui.elements.UIButton(
                pygame.Rect(-80, 0, 32, 32),
                "",
                manager=self.ui,
                container=container,
                anchors=anchors,
                tool_tip_text="Learn more about this item",
                object_id=pygame_gui.core.ObjectID(
                    class_id="@inventory_ui_inspect",
                    object_id="#inventory_inspect_%d" % (nth,),
                ),
            )

            self.inspect[inspect_button] = item

            if isinstance(item, WieldableItem):
                classname = "@inventory_ui_wield"
                verb = "Wield"

                wield_button = pygame_gui.elements.UIButton(
                    pygame.Rect(-120, 0, 32, 32),
                    "",
                    manager=self.ui,
                    container=container,
                    anchors=anchors,
                    tool_tip_text="%s this item" % (verb,),
                    object_id=pygame_gui.core.ObjectID(
                        class_id=classname,
                        object_id="#inventory_%s_%d" % (verb.lower(), nth),
                    ),
                )

                self.wield[wield_button] = item

            elif isinstance(item, InstantEffectItem):
                classname = "@inventory_ui_potion"
                verb = "Apply"

                heal_button = pygame_gui.elements.UIButton(
                    pygame.Rect(-120, 0, 32, 32),
                    "",
                    manager=self.ui,
                    container=container,
                    anchors=anchors,
                    tool_tip_text="%s this item" % (verb,),
                    object_id=pygame_gui.core.ObjectID(
                        class_id=classname,
                        object_id="#inventory_%s_%d" % (verb.lower(), nth),
                    ),
                )

                self.heal[heal_button] = item

    def render(self):
        """Unused. Here for compatibility."""

    def tick(self, _):
        """Unused. Here for compatibility."""

    def close(self):
        """Closes the modal."""

        self._done = True

    def done(self):
        """Checks whether the modal is done or not."""

        return not self.window.alive()

    def wield_item(self, item: WieldableItem):
        """Wields the given item on the player."""

        wields_at = item.wields_at()

        self.player.inventory.take_item(item)
        current = self.player.wieldpoints[wields_at]
        self.player.wield(wields_at, item)

        if current is not None:
            # hack.
            if current.name != "Fists":
                self.player.inventory.add_item(current)

        game().log("You wielded %s at %s" % (item.name, item.wields_at()))

        self.rebuild()

    def handle_event(self, event):
        """Handles pygame events."""

        if event.type == pygame.QUIT:
            raise SystemExit()

        if event.type == pygame_gui.UI_BUTTON_PRESSED:
            item = self.inspect.get(event.ui_element)
            if item is not None:
                self.popup = pygame_gui.windows.ui_message_window.UIMessageWindow(
                    self.dialog_rt,
                    "Inspecting %s: %s" % (item.name, item.describe()),
                    manager=self.ui,
                    window_title="Inspecting %s" % (item.name,),
                )

            item = self.destroy.get(event.ui_element)
            if item is not None:
                self.player.inventory.take_item(item)
                self.rebuild()

            item = self.wield.get(event.ui_element)
            if item is not None:
                wields_at = item.wields_at()
                current = self.player.wieldpoints[wields_at]
                if current is None:
                    self.wield_item(item)
                else:
                    self.confirming_wield = item

                    pygame_gui.windows.ui_confirmation_dialog.UIConfirmationDialog(
                        self.big_dialog_rt,
                        ("Confirm that you want to wield %s?\n\n" % (item.name,))
                        + item.compare_to(current),
                        manager=self.ui,
                        window_title="Wielding %s" % (item.name,),
                    )

            item = self.heal.get(event.ui_element)
            if item is not None:
                self.player.inventory.take_item(item)
                hp = item.apply(self.player)
                self.rebuild()

                game().log("%s healed %d HP" % (item.name, hp))

        elif event.type == pygame_gui.UI_CONFIRMATION_DIALOG_CONFIRMED:
            self.wield_item(self.confirming_wield)
