"""This module exports the 'Custom Seed' UI"""
from typing import Optional

import pygame
import pygame_gui


class CustomSeed(pygame_gui.elements.UIWindow):
    """CustomSeed handles getting a custom seed from the player for dungeon generation."""

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)

        self._seed: Optional[int] = None

        container_rect = self.get_container().get_rect()

        info = pygame_gui.elements.UITextBox(
            html_text="Select a custom seed from which to generate the dungeon for your run.",
            relative_rect=pygame.Rect(0, 0, container_rect.width, -1),
            manager=self.ui_manager,
            container=self.get_container(),
            anchors={"left": "left", "top": "top"},
            object_id=pygame_gui.core.ObjectID(
                class_id="@dialog",
                object_id="#dialog_desc",
            ),
        )

        self.text_line = pygame_gui.elements.UITextEntryLine(
            pygame.Rect(8, 8, container_rect.width - 16, 32),
            manager=self.ui_manager,
            container=self.get_container(),
            anchors={"left": "left", "top_target": info},
            initial_text="0",
        )

        self.start_game = pygame_gui.elements.UIButton(
            pygame.Rect(0, 8, 192, 32),
            "Start Game",
            manager=self.ui_manager,
            container=self.get_container(),
            anchors={"top_target": self.text_line, "centerx": "centerx"},
        )

    def seed(self) -> Optional[int]:
        """seed returns the seed the player chose, if any"""
        return self._seed

    def process_event(self, event: pygame.event.Event) -> bool:
        if not super().process_event(event):
            if event.type == pygame_gui.UI_BUTTON_PRESSED:
                if event.ui_element == self.start_game:
                    seed = None
                    try:
                        seed = int(self.text_line.get_text())
                    except ValueError:
                        pygame_gui.windows.UIMessageWindow(
                            self.rect,
                            "Seeds are required to be numeric.",
                            manager=self.ui_manager,
                            window_title="Invalid Seed",
                        )

                    if seed is not None:
                        self._seed = seed
                        self.kill()

                    return True

        return False
