"""This module exports the UI for showing high scores."""
import random

import pygame
import pygame_gui

from .attributes import ATTRIBUTES, Attribute, AttributeSet
from .constants import POINT_BUY_POOL_COUNT
from .online import OnlinePlay


class Leaderboard(pygame_gui.elements.UIWindow):
    """Leaderboard handles showing leaderboards."""

    def __init__(self, online: OnlinePlay, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)

        self._online = online
        if not self._online:
            return

        container_rect = self.get_container().get_rect()

        self.close_button = pygame_gui.elements.UIButton(
            pygame.Rect(0, 8, 192, 32),
            "Close",
            manager=self.ui_manager,
            container=self.get_container(),
            anchors={"bottom": "bottom", "centerx": "centerx"},
        )

        self.leaderboard = pygame_gui.elements.UITextBox(
            html_text=self.leaderboard_text(),
            relative_rect=(8, 8, container_rect.width - 16, container_rect.height - 56),
            manager=self.ui_manager,
            container=self.get_container(),
            anchors={"left": "left", "top": "top"},
            object_id=pygame_gui.core.ObjectID(
                class_id="@dialog_centered",
            ),
        )

    def process_event(self, event: pygame.event.Event) -> bool:
        consumed = super().process_event(event)

        if event.type == pygame_gui.UI_BUTTON_PRESSED:
            if event.ui_element == self.close_button:
                self.kill()

        return consumed

    def leaderboard_text(self) -> str:
        """Get the text for the leaderboard."""
        board = self._online.leaderboard()

        if board.entries:
            board_str = ''
            for nth, entry in enumerate(board.entries):
                board_str += f'{nth + 1}: <b>{entry.player}</b> with a score of {entry.score}.'
        else:
            board_str = 'Nobody has completed this seed yet!'

        return f'''<b>Leaderboard</b>

Today's seed is <b>{board.seed}</b>. Here's the top 10 for this seed.

{board_str}'''
