import itertools

import pygame
import pygame_gui

from game import game


class Shop(pygame_gui.elements.UIWindow):
    def __init__(self, player, consumables, weapons, armors, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.player = player

        root_rt = self.ui_manager.get_root_container().get_rect()
        root_size = root_rt.size
        dialog_size = (root_size[0] * 0.90, root_size[1] * 0.3)
        self.dialog_rt = pygame.Rect(0, 0, *dialog_size)
        self.dialog_rt.center = root_rt.center

        rt = self.get_container().get_rect()

        info = pygame_gui.elements.UITextBox(
            html_text="The shop has a few items for sale.",
            relative_rect=pygame.Rect(0, 0, rt.width, -1),
            manager=self.ui_manager,
            container=self.get_container(),
            anchors={"left": "left", "top": "top"},
            object_id=pygame_gui.core.ObjectID(
                class_id="@dialog",
                object_id="#dialog_desc",
            ),
        )

        info_rt = info.get_relative_rect()

        self.shop_container = pygame_gui.elements.UIScrollingContainer(
            pygame.Rect(8, 0, rt.width - 16, rt.height - info_rt.height),
            manager=self.ui_manager,
            container=self.get_container(),
            anchors={"top_target": info, "left": "left"},
        )

        all_inventory = list(itertools.chain(consumables, weapons, armors))

        self.shop_container.set_scrollable_area_dimensions(
            (rt.width - 36, 8 + (len(all_inventory) * 48))
        )

        inventory_rt = self.shop_container.get_container().get_rect()

        self.lookup = {}
        self.inspect = {}
        self.confirms = {}

        prev_row = None
        for nth, item in enumerate(all_inventory):
            anchors = {"left": "left", "right": "right"}
            if prev_row is None:
                anchors["top"] = "top"
            else:
                anchors["top_target"] = prev_row

            container = pygame_gui.elements.UIPanel(
                pygame.Rect(0, 0, inventory_rt.width - 16, 48),
                manager=self.ui_manager,
                container=self.shop_container.get_container(),
                anchors=anchors,
            )

            prev_row = container

            pygame_gui.elements.UITextBox(
                relative_rect=pygame.Rect(8, 0, inventory_rt.width - 112, 48),
                html_text=f"{item.name} for <font color=#FFFF64>{item.value} gold</font>",
                manager=self.ui_manager,
                container=container,
                anchors={"left": "left", "centery": "centery"},
                object_id=pygame_gui.core.ObjectID(
                    class_id="@inventory_ui_item", object_id="#bag_item_%d" % (nth,)
                ),
            )

            anchors = {"right": "right", "centery": "centery"}

            purchase_button = pygame_gui.elements.UIButton(
                pygame.Rect(-40, 0, 32, 32),
                "",
                manager=self.ui_manager,
                container=container,
                anchors=anchors,
                tool_tip_text="Purchase this item",
                object_id=pygame_gui.core.ObjectID(
                    class_id="@shop_ui_purchase",
                    object_id="#shop_purchase_%d" % (nth,),
                ),
            )

            self.lookup[purchase_button] = item

            inspect_button = pygame_gui.elements.UIButton(
                pygame.Rect(-80, 0, 32, 32),
                "",
                manager=self.ui_manager,
                container=container,
                anchors=anchors,
                tool_tip_text="Learn more about this item",
                object_id=pygame_gui.core.ObjectID(
                    class_id="@inventory_ui_inspect",
                    object_id="#shop_inspect_%d" % (nth,),
                ),
            )

            self.inspect[inspect_button] = item

        self.shop_container.update(0.0)

    def item_row(self):
        pass

    def process_event(self, event: pygame.event.Event) -> bool:
        consumed = super().process_event(event)

        if event.type == pygame_gui.UI_BUTTON_PRESSED:
            inspect = self.inspect.get(event.ui_element)
            if inspect is not None:
                self.popup = pygame_gui.windows.UIMessageWindow(
                    self.dialog_rt,
                    "%s (%d gold): %s"
                    % (inspect.name, inspect.value, inspect.describe()),
                    manager=self.ui_manager,
                    window_title="Inspecting %s" % (inspect.name,),
                )

            lookup = self.lookup.get(event.ui_element)
            if lookup is not None:
                popup = pygame_gui.windows.UIConfirmationDialog(
                    self.dialog_rt,
                    "Are you sure you want to purchase %s for %d gold?"
                    % (lookup.name, lookup.value),
                    manager=self.ui_manager,
                    window_title="Purchasing %s" % (lookup.name,),
                )

                self.confirms[popup] = lookup

        if event.type == pygame_gui.UI_CONFIRMATION_DIALOG_CONFIRMED:
            item = self.confirms.get(event.ui_element)
            if item is not None:
                if self.player.gold < item.value:
                    pygame_gui.windows.UIMessageWindow(
                        self.dialog_rt,
                        "You don't have enough gold.",
                        manager=self.ui_manager,
                        window_title="Not Enough Gold for %s" % (item.name,),
                    )
                else:
                    # purchase it!
                    self.player.gold -= item.value
                    self.player.give(item)
                    game().log("You purchased %s." % (item.name,))

        return consumed
