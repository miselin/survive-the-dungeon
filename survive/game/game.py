"""This module holds a singletone to manage common game state."""

import random
from dataclasses import dataclass
from enum import Enum
from typing import List, Optional


class GameState(Enum):
    """GameState holds all possible states for the game to be in"""

    STATE_MAIN_MENU = 0
    STATE_PLAYING = 1
    STATE_WIN = 2
    STATE_DEAD = 3


class Game:
    """Game is intended to be a singleton of game data"""

    def __init__(self, seed: int = 0):
        self._log: List[str] = []
        self._random = random.Random()
        self._random.seed(seed)
        self.seed = seed
        self._state: GameState = GameState.STATE_MAIN_MENU

    def get_log(self, entries: int = 4) -> List[str]:
        """Get the most recent log entries"""
        return self._log[-entries:]

    def log(self, entry: str):
        """Add the given string to the game log"""
        self._log.append(entry)

    def random(self):
        """Get the game's random number generator"""
        return self._random

    def state(self) -> GameState:
        """Get the game's current state"""
        return self._state

    def set_state(self, new_state: GameState):
        """Set the game's state"""
        self._state = new_state


@dataclass
class GameSingleton:
    """GameSingleton stores the singleton Game object"""

    game: Optional[Game]


_GAME = GameSingleton(game=None)


def game():
    """Return the current singleton Game object"""
    return _GAME.game


def set_game(new_game):
    """Set the singleton Game object"""
    _GAME.game = new_game
