"""This module handles the game-end screen."""

import pygame
import pygame_gui

from .game import GameState, game

YOU_WON = "Dungeon cleared!"
YOU_LOST = "The dungeon consumed you."


class GameEndedScreen:
    """Handles all the logic for the end-of-game popup."""

    def __init__(self, ui: pygame_gui.UIManager, surface: pygame.Surface):
        self.won = False
        self.ui = ui
        self.seed = 0
        self.surface = surface
        self.dirty = True
        self._done = False

        self.popup = None

        self.dialog_rt = pygame.Rect(0, 0, 0, 0)

    def set_won(self, won: bool):
        """Sets the won state."""
        self.won = won

    def tick(self, _):
        """Does nothing, present for compatibility."""

    def rebuild(self):
        """Rebuilds the UI to show the popup again."""

        if self.popup is not None:
            self.popup.kill()
            self.popup = None

        surface_rect = self.surface.get_rect()

        parent_size = surface_rect.size
        dialog_size = (parent_size[0] * 0.90, parent_size[1] * 0.8)

        self.dialog_rt = pygame.Rect(0, 0, *dialog_size)
        self.dialog_rt.center = surface_rect.center

        if self.won:
            subtitle = self._won_text()
        else:
            subtitle = self._lost_text()

        if not self.won:
            subtitle = (
                subtitle
                + "\n\n<b>Last log messages before your demise:</b>\n"
                + "\n".join(game().get_log())
            )

        self.popup = pygame_gui.windows.UIMessageWindow(
            self.dialog_rt,
            subtitle,
            manager=self.ui,
            window_title=YOU_WON if self.won else YOU_LOST,
        )

    def render(self):
        """Does nothing, present for compatibility."""

    def menu(self):
        """Puts the game into the main menu."""

        game().set_state(GameState.STATE_MAIN_MENU)
        self.popup.kill()
        self.popup = None

    def handle_event(self, event):
        """Handles pygame events."""

        if event.type == pygame.QUIT:
            raise SystemExit()

        if event.type == pygame_gui.UI_WINDOW_CLOSE:
            if event.ui_element == self.popup:
                self.menu()

    def _won_text(self) -> str:
        """Generate the text body for a win."""
        return f"You successfully cleared the dungeon!{self._stats_text()}"

    def _lost_text(self) -> str:
        """Generate the text body for a loss."""
        return f"Better luck next time!{self._stats_text()}"

    def _stats_text(self) -> str:
        """Generate the text body for the player's statistics in the run."""
        stats = game().stats()

        return f"""<br><br><b>Your Stats:</b>
You vanquished <b>{stats.vanquished}</b> enemies.
You earned <b><font color=#FFFF64>{stats.gold_earned}</font> gold</b>.
You spent <b><font color=#FFFF64>{stats.gold_spent}</font></b> of your earned gold at the shop.
You left <b><font color=#FFFF64>{stats.gold_left_behind}</font> gold</b> in chests in the dungeon.
You held <font color=#FFFF64>{stats.inventory_value}</font> gold</b> worth of items.
You received <b>{stats.xp_gained}</b> total XP.
You reached <b>level {stats.level}</b>."""
