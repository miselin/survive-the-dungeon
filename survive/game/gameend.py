import pygame
import pygame_gui

from .game import Game, game

YOU_WON = "Dungeon cleared!"
YOU_WON_SUBTITLE = "todo: submit your score here!"
YOU_LOST = "The dungeon consumed you."
YOU_LOST_SUBTITLE = "Better luck next time!"


class GameEndedScreen(object):
    def __init__(self, ui, surface):
        self.won = False
        self.ui = ui
        self.seed = 0
        self.surface = surface
        self.dirty = True
        self._done = False

        self.popup = None

    def set_won(self, won):
        self.won = won

    def tick(self, dt):
        pass

    def rebuild(self):
        if self.popup is not None:
            self.popup.kill()
            self.popup = None

        surface_rect = self.surface.get_rect()

        parent_size = surface_rect.size
        dialog_size = (parent_size[0] * 0.90, parent_size[1] * 0.8)

        self.dialog_rt = pygame.Rect(0, 0, *dialog_size)
        self.dialog_rt.center = surface_rect.center

        subtitle = YOU_WON_SUBTITLE if self.won else YOU_LOST_SUBTITLE

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
        pass

    def menu(self):
        game().set_state(Game.STATE_MAIN_MENU)
        self.popup.kill()
        self.popup = None

    def handle_event(self, event):
        if event.type == pygame.QUIT:
            raise SystemExit()

        elif event.type == pygame_gui.UI_WINDOW_CLOSE:
            if event.ui_element == self.popup:
                self.menu()
