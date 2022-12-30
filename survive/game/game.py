import random


class Game:
    STATE_MAIN_MENU = 0
    STATE_PLAYING = 1
    STATE_WIN = 2
    STATE_DEAD = 3

    def __init__(self, seed=0):
        self._log = []
        self._random = random.Random()
        self._random.seed(seed)
        self.seed = seed
        self._state = Game.STATE_MAIN_MENU

    def get_log(self, max=4):
        return self._log[-max:]

    def log(self, s):
        self._log.append(s)

    def random(self):
        return self._random

    def state(self):
        return self._state

    def set_state(self, new_state):
        self._state = new_state


_game = None


def game():
    # singleton game object
    return _game


def set_game(new_game):
    global _game
    _game = new_game
