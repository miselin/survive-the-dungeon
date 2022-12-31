"""This module handles procedural dungeon generation."""

import random
from typing import Iterable, List

from .types import Position
from .worldmap import Cell, Map, Room


def fill_points(
    world: List[Cell],
    max_x: int,
    xys: Iterable[Position],
    cell_type: int,
    passable_only=False,
    replace=True,
):
    """Set the given points to the given cell type."""
    for (x, y) in xys:
        offset = (y * max_x) + x
        if passable_only and not world[offset].is_passable():
            continue
        if (world[offset].cell_type != Cell.TYPE_EMPTY) and not replace:
            continue
        world[offset].cell_type = cell_type


def paint(
    world: List[Cell],
    max_x: int,
    x: int,
    y: int,
    width: int,
    height: int,
    brush: List[Cell],
):
    """Paint a rectangle of cells into the world."""
    for y_ in range(height):
        for x_ in range(width):
            dest_offset = ((y + y_) * max_x) + (x + x_)
            src_offset = (y_ * width) + x_
            world[dest_offset].cell_type = brush[src_offset].cell_type


def make_room(width: int, height: int) -> List[Cell]:
    """Create an area of cells with the room type."""
    total_cells = width * height
    result = []
    for _ in range(total_cells):
        c = Cell((0, 0))
        c.cell_type = Cell.TYPE_ROOM

        result.append(c)

    return result


def generate_map(rng: random.Random, print_map=False) -> Map:
    """Generate a new dungeon."""

    world_x = 64
    world_y = 64
    total_cells = world_x * world_y

    world = []
    for y in range(world_y):
        for x in range(world_x):
            world.append(Cell((x, y)))

    num_rects = max(1, int(0.005 * total_cells))

    rect_placement_attempts = 200

    rect_max_width = int(world_x // 8)
    rect_max_height = int(world_y // 8)
    rect_min_width = int(max(4, rect_max_width * 0.05))
    rect_min_height = int(max(4, rect_max_height * 0.25))

    rooms = []
    start_room = Room((1, 1), 8, 8)
    start_room.attrs |= Room.ATTR_STARTING_ROOM
    end_room = Room((world_x - 9, world_y - 9), 8, 8)
    end_room.attrs |= Room.ATTR_BOSS_ROOM

    rooms.append(start_room)
    rooms.append(end_room)

    for _ in range(num_rects):
        rect_x_dim = rng.randint(rect_min_width, rect_max_width)
        rect_y_dim = rng.randint(rect_min_height, rect_max_height)

        # Can we find a place to fit this room in?
        for _ in range(rect_placement_attempts):
            # one tile border around the entire map
            x = rng.randint(1, world_x - rect_x_dim - 1)
            y = rng.randint(1, world_y - rect_y_dim - 1)
            room = Room((x, y), rect_x_dim, rect_y_dim)
            # one tile padding on every room from each other
            check_room = Room((x - 1, y - 1), rect_x_dim + 2, rect_y_dim + 2)
            has_overlap = False
            for other in rooms:
                has_overlap = check_room.overlaps(other)
                if has_overlap:
                    break

            if not has_overlap:
                rooms.append(room)
                break

    rooms = rooms[0:1] + rooms[2:] + [rooms[1]]

    rooms = sorted(rooms, key=lambda k: k.distance_to(start_room))

    rooms[-4].attrs |= Room.ATTR_SHOP_ROOM

    for room in rooms:
        room_map = make_room(*room.dims)
        paint(
            world,
            world_x,
            room.pos[0],
            room.pos[1],
            room.dims[0],
            room.dims[1],
            room_map,
        )

    for prev, curr in zip(rooms, rooms[1:]):
        points = list(prev.tunnel_to(curr))
        fill_points(world, world_x, points, Cell.TYPE_HALL, replace=False)

    result = Map(rng, world_x, world_y, rooms, world)

    # Dump the map to screen.
    if print_map:
        for y in range(world_y):
            s = ""
            for x in range(world_x):
                map_cell = result.cell_at(x, y)
                map_room = result.room_at(x, y)

                c = ""
                if map_cell.cell_type == Cell.TYPE_EMPTY:
                    c = " "
                elif map_cell.cell_type == Cell.TYPE_ROOM:
                    c = "R"
                elif map_cell.cell_type == Cell.TYPE_HALL:
                    c = "H"

                if map_room is not None and map_room.attrs & Room.ATTR_SHOP_ROOM:
                    c = "S"
                if map_room is not None and map_room.attrs & Room.ATTR_BOSS_ROOM:
                    c = "B"

                s += c

            print(s)

    return result
