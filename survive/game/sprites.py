"""This module exports classes for working with sprites."""

from typing import List

import pygame


class SpriteSheet:
    """Handles using a single image as a source for many sprites."""

    def __init__(self, filename, w=32, h=32):
        self.sheet = pygame.image.load(filename).convert_alpha()
        self.w = w
        self.h = h

        self.sprites = []

        self._sheet_size = self.sheet.get_size()
        self._sprites_horiz = int(self._sheet_size[0] // self.w)
        self._sprites_vert = int(self._sheet_size[1] // self.h)

        # generate the sheet
        for y in range(self._sprites_vert):
            y_ = y * self.h
            for x in range(self._sprites_horiz):
                x_ = x * self.w

                self._load_at(x_, y_)

    def _load_at(self, x, y):
        """Loads the sprite at the given coordinate."""

        img = pygame.Surface((self.w, self.h), pygame.SRCALPHA, 32).convert_alpha()
        img.blit(self.sheet, (0, 0), (x, y, self.w, self.h))
        self.sprites.append(img)

    def sprite(self, n):
        """Gets the nth sprite in the sheet."""

        return self.sprites[n]


class SpriteSet:
    """Stores a full set of sprites needed for a dungeon to render."""

    WALL_N = 0
    WALL_S = 1
    WALL_E = 2
    WALL_W = 3

    def __init__(
        self,
        player: pygame.Surface,
        mobs: List[pygame.Surface],
        walls: List[pygame.Surface],
        floor: pygame.Surface,
        hall_floor: pygame.Surface,
        chest: List[pygame.Surface],
        clutter: List[pygame.Surface],
        hall_clutter: List[pygame.Surface],
        corpse: pygame.Surface,
    ):
        self.player = player
        self.mobs = mobs
        self.walls = walls
        self.floor = floor
        self.hall_floor = hall_floor
        self.chest = chest
        self.clutter = clutter
        self.hall_clutter = hall_clutter
        self.corpse = corpse

    def get_player(self) -> pygame.Surface:
        """Get the sprite for the player"""
        return self.player

    def get_mob(self, n) -> pygame.Surface:
        """Get the sprite for nth mob in the set"""
        return self.mobs[n]

    def get_wall(self, n) -> pygame.Surface:
        """Get the sprite for a wall"""
        return self.walls[n]

    def get_floor(self) -> pygame.Surface:
        """Get the sprite for the floor"""
        return self.floor

    def get_hall_floor(self) -> pygame.Surface:
        """Get the sprite for the hallway floor"""
        return self.hall_floor

    def get_chest(self, empty=False) -> pygame.Surface:
        """Get the sprite for a chest based on its emptiness"""
        if empty:
            return self.chest[1]

        return self.chest[0]

    def get_clutter(self) -> List[pygame.Surface]:
        """Get the sprites for clutter"""
        return self.clutter

    def get_hall_clutter(self) -> List[pygame.Surface]:
        """Get the sprites for hallway clutter"""
        return self.hall_clutter

    def get_corpse(self) -> pygame.Surface:
        """Get the sprite for a corpse"""
        return self.corpse
