"""This module handles the game's main menu."""

import math
import time

import pygame
import pygame_gui

from .customseed import CustomSeed
from .game import Game, game

GAME_TITLE = "Survive the Dungeon"
GAME_SUBTITLE = "Infinite procedural dungeons. Survival is not guaranteed."


def todays_seed() -> int:
    """Get a random seed for today."""
    t = int(math.ceil(time.time()))
    t = t - (t % 86400000)  # truncate to 24h
    return t


class MainMenu(object):
    """Handles all of the main menu of the game."""

    STATE_MAIN = 0
    STATE_CHOOSE_SEED = 1  # todo
    STATE_HIGH_SCORES = 2  # todo

    def __init__(self, ui, surface):
        self.seed = 0
        self.ui = ui
        self.surface = surface
        self.dirty = True
        self._done = False
        self.container = None
        self.custom_seed_window = None

        self.rebuild()

    def rebuild(self):
        """Recreate and show the main menu."""

        if self.container is not None:
            self.container.kill()

        surface_rect = self.surface.get_rect()
        parent_size = surface_rect.size

        dialog_size = (parent_size[0] * 0.90, parent_size[1] * 0.4)
        self.dialog_rt = pygame.Rect(0, 0, *dialog_size)
        self.dialog_rt.center = surface_rect.center

        self.container = pygame_gui.core.UIContainer(
            pygame.Rect(0, 0, surface_rect.width, surface_rect.height),
            manager=self.ui,
        )

        title = pygame_gui.elements.UILabel(
            pygame.Rect(0, 64, surface_rect.width, 64),
            GAME_TITLE,
            manager=self.ui,
            container=self.container,
            object_id=pygame_gui.core.ObjectID(
                class_id="@mainmenu_title",
                object_id="#title",
            ),
            anchors={"centerx": "centerx"},
        )

        subtitle = pygame_gui.elements.UILabel(
            pygame.Rect(0, 8, surface_rect.width, 32),
            GAME_SUBTITLE,
            manager=self.ui,
            container=self.container,
            object_id=pygame_gui.core.ObjectID(
                class_id="@mainmenu_subtitle",
                object_id="#subtitle",
            ),
            anchors={"top_target": title, "centerx": "centerx"},
        )

        self.random_dungeon = pygame_gui.elements.UIButton(
            pygame.Rect(0, 16, 192, 32),
            "Random Dungeon",
            manager=self.ui,
            container=self.container,
            anchors={"top_target": subtitle, "centerx": "centerx"},
            object_id=pygame_gui.core.ObjectID(
                class_id="@mainmenu_buttons",
                object_id="#mainmenu0",
            ),
            tool_tip_text="Play a randomly generated dungeon.",
        )

        self.daily_dungeon = pygame_gui.elements.UIButton(
            pygame.Rect(0, 16, 192, 32),
            "Daily Dungeon",
            manager=self.ui,
            container=self.container,
            anchors={"top_target": self.random_dungeon, "centerx": "centerx"},
            object_id=pygame_gui.core.ObjectID(
                class_id="@mainmenu_buttons",
                object_id="#mainmenu1",
            ),
            tool_tip_text="Play today's dungeon. New seed generated every 24 hours.",
        )

        self.custom_seed = pygame_gui.elements.UIButton(
            pygame.Rect(0, 16, 192, 32),
            "Custom Seed",
            manager=self.ui,
            container=self.container,
            anchors={"top_target": self.daily_dungeon, "centerx": "centerx"},
            object_id=pygame_gui.core.ObjectID(
                class_id="@mainmenu_buttons",
                object_id="#mainmenu2",
            ),
            tool_tip_text="Play a randomly generated dungeon using a specific seed.",
        )

        """
        self.high_scores = pygame_gui.elements.UIButton(
            pygame.Rect(0, 16, 192, 32),
            "High Scores",
            manager=self.ui,
            container=self.container,
            anchors={"top_target": self.custom_seed, "centerx": "centerx"},
            object_id=pygame_gui.core.ObjectID(
                class_id="@mainmenu_buttons",
                object_id="#mainmenu3",
            ),
            tool_tip_text="View high scores.",
        )
        """

        self.quit_button = pygame_gui.elements.UIButton(
            pygame.Rect(0, 16, 192, 32),
            "Quit",
            manager=self.ui,
            container=self.container,
            anchors={"top_target": self.custom_seed, "centerx": "centerx"},
            object_id=pygame_gui.core.ObjectID(
                class_id="@mainmenu_buttons",
                object_id="#mainmenu4",
            ),
            tool_tip_text="Quit the game.",
        )

    def render(self):
        """Render the background of the menu."""
        self.surface.fill(0)

    def handle_event(self, event):
        """Handle pygame events."""
        if event.type == pygame.QUIT:
            raise SystemExit()

        elif event.type == pygame_gui.UI_BUTTON_PRESSED:
            if event.ui_element == self.quit_button:
                self.quit()
            elif event.ui_element == self.random_dungeon:
                self.start_random_dungeon()
            elif event.ui_element == self.daily_dungeon:
                self.start_daily_dungeon()
            elif event.ui_element == self.custom_seed:
                self.start_custom_seed()

        elif event.type == pygame_gui.UI_WINDOW_CLOSE:
            if event.ui_element == self.custom_seed_window:
                if self.custom_seed_window.seed() is not None:
                    self.start_with_seed(self.custom_seed_window.seed())

    def tick(self, dt):
        """Unused. Here for compatibility."""

    def start_random_dungeon(self):
        """Starts a random dungeon game."""
        self.start_with_seed(int(time.time()))

    def start_daily_dungeon(self):
        """Starts a daily dungeon game."""
        self.start_with_seed(todays_seed())  # TODO: bring this in from a remote source

    def start_with_seed(self, seed: int):
        """Starts a dungeon game with a user-selected seed."""
        self.seed = seed
        self._done = True

        self.container.kill()
        self.container = None

    def start_custom_seed(self):
        """Shows a dialog for the user to chooe a seed."""
        self.custom_seed_window = CustomSeed(
            rect=self.dialog_rt,
            window_display_title="Custom Seed",
            manager=self.ui,
            resizable=False,
        )

    def start_high_scores(self):
        """Currentl unused. Will show high score table."""
        pass

    def quit(self):
        """Quits the game."""
        raise SystemExit()

    def done(self):
        """Returns True when the menu is no longer needed."""
        return self._done

    def ack_done(self):
        """Acknowledges a done state to allow the menu to show again in future."""
        self._done = False
