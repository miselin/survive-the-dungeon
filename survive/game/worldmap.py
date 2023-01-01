"""This module exports world map classes"""

import random
from typing import Iterable, List, Optional

import numpy as np
import tcod

from .creature import Creature
from .item import Chest
from .types import Position


class Cell:
    """Cell defines a single world tile"""

    TYPE_EMPTY = 0
    TYPE_ROOM = 1
    TYPE_WATER = 2
    TYPE_CHASM = 3
    TYPE_HALL = 4

    def __init__(self, pos: Position):
        self.cell_type = Cell.TYPE_EMPTY
        self.pos = pos
        self.visible = False
        self.explored = False
        self.clutter = None
        self.wall_clutter = None

    def is_passable(self) -> bool:
        """Returns True if a creature can pass through this tile"""
        return self.cell_type in (Cell.TYPE_ROOM, Cell.TYPE_HALL)

    def is_hallway(self) -> bool:
        """Returns True if this cell is a hallway"""
        return self.cell_type == Cell.TYPE_HALL


class Room:
    """Room defines a room in the world"""

    ATTR_STARTING_ROOM = 1
    ATTR_BOSS_ROOM = 2
    ATTR_SHOP_ROOM = 4

    def __init__(self, pos: Position, width: int, height: int, attrs: int = 0):
        self.pos = pos
        self.dims = (width, height)
        self.attrs = attrs

    def overlaps(self, room: "Room", padding: int = 1):
        """Returns true if this room overlaps with the given room"""

        # create padding to avoid rooms too close to each other
        pos = (self.pos[0] - padding, self.pos[1] - padding)
        dims = (self.dims[0] + (padding * 2), self.dims[1] + (padding * 2))

        room_pos = (room.pos[0] - padding, room.pos[1] - padding)
        room_dims = (room.dims[0] + (padding * 2), room.dims[1] + (padding * 2))

        return (
            (pos[0] < (room_pos[0] + room_dims[0]))
            and ((pos[0] + dims[0]) > room_pos[0])
            and (pos[1] < (room_pos[1] + room_dims[1]))
            and ((pos[1] + dims[1]) > room_pos[1])
        )

    def contains(self, pos: Position) -> bool:
        """Returns True if this room contains the given world coordinate"""
        x_left = self.pos[0]
        x_right = self.pos[0] + self.dims[0]
        y_top = self.pos[1]
        y_bottom = self.pos[1] + self.dims[1]

        return (x_left <= pos[0] < x_right) and (y_top <= pos[1] < y_bottom)

    def tunnel_to(self, room: "Room") -> Iterable[Position]:
        """Generates coordinates for a path from this room to the given room"""
        x_step = 1
        if room.pos[0] < self.pos[0]:
            x_step = -1

        y_step = 1
        if room.pos[1] < self.pos[1]:
            y_step = -1

        x, y = self.pos

        # move from the edge of the room
        if x_step > 0:
            x += self.dims[0]
        if y_step > 0:
            y += self.dims[1]

        for x_ in range(self.pos[0], room.pos[0] + x_step, x_step):
            x = x_
            yield x, self.pos[1]

        for y_ in range(self.pos[1], room.pos[1] + y_step, y_step):
            y = y_
            yield x, y

    def distance_to(self, room: "Room") -> int:
        """Gets the distance from this room to the given room"""
        return len(list(self.tunnel_to(room)))

    def generate_random_positions(
        self,
        rng: random.Random,
        count: int,
        keepouts: Iterable[Position] = (),
        padding: int = 0,
    ) -> Iterable[Position]:
        """Generates random locations in the room"""

        seen = set()
        for _ in range(count):
            for _ in range(10000):  # 10k tries to get a coord that hasn't been used yet
                point = rng.randint(
                    padding, self.dims[0] - 1 - (padding * 2)
                ), rng.randint(padding, self.dims[1] - 1 - (padding * 2))
                if point in seen or point in keepouts:
                    continue

                seen.add(point)
                yield point
                break

    def room_to_world(self, pos: Position) -> Position:
        """Converts a room location to world coordinates"""
        return (pos[0] + self.pos[0], pos[1] + self.pos[1])


class Map:
    """Map stores all the data for a single dungeon map"""

    def __init__(
        self,
        rng: random.Random,
        width: int,
        height: int,
        rooms: List[Room],
        cells: List[Cell],
    ):
        self.width = width
        self.height = height
        self.rooms = rooms
        self.cells = cells
        self.rng = rng

        # cell visibility options
        self.explored = np.zeros((self.width, self.height), dtype=bool, order="F")
        self.transparency = np.zeros((self.width, self.height), dtype=bool, order="F")
        self.visible = np.zeros((self.width, self.height), dtype=bool, order="F")

        for y in range(self.height):
            for x in range(self.width):
                if self.cells[(y * self.width) + x].cell_type != Cell.TYPE_EMPTY:
                    self.transparency[x, y] = True

    def cell_at(self, x: int, y: int):
        """Get the cell at the given coordinate"""
        return self.cells[(y * self.width) + x]

    def room_at(self, x: int, y: int) -> Optional[Room]:
        """Get a room, if any, at the given coordinate"""
        for room in self.rooms:
            if room.contains((x, y)):
                return room

        return None

    def update_fov(self, x: int, y: int):
        """Update FOV data from the given position"""
        self.visible = tcod.map.compute_fov(self.transparency, (x, y))
        self.explored |= self.visible

        for y_ in range(self.height):
            for x_ in range(self.width):
                cell = self.cells[(y_ * self.width) + x_]
                cell.visible = self.visible[x_, y_]
                cell.explored = self.explored[x_, y_]

    def path_to(
        self,
        start: Position,
        end: Position,
        player: Creature,
        creatures: List[Creature],
        containers: List[Chest],
    ) -> Iterable[Position]:
        """Return a path from the given start point to the end point.

        Tries to avoid player/creatures/containers."""
        cost = np.array(self.transparency, dtype=np.int8)

        # add cost for all the things that are in the way
        if player is not None:
            x, y = player.position
            cost[x, y] += 10

        for creature in creatures:
            x, y = creature.position
            cost[x, y] += 10

        for container in containers:
            x, y = container.position
            cost[x, y] += 10

        graph = tcod.path.SimpleGraph(cost=cost, cardinal=2, diagonal=3)
        pathfinder = tcod.path.Pathfinder(graph)

        pathfinder.add_root(start)
        return [(i[0], i[1]) for i in pathfinder.path_to(end)[1:].tolist()]
