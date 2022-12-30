import random
import struct

import numpy as np

from worldmap import Cell, Map, Room


def buckshot_positions(r, max_x, max_y, count=16):
    result = []
    center_x = max_x / 2
    center_y = max_y / 2

    height = 128

    # Ensure deflection can only ever push a piece to the edge of the map.
    max_x_deflect = center_x / float(height)
    max_y_deflect = center_y / float(height)

    # Create a bunch of buckshot pieces at the right height, and then randomly
    # apply a directional vector to them. We then have them travel down that
    # directional vector until they intersect; if that passes filtering, we
    # drop in the new cell type.
    buckshot_pieces = []
    for i in range(count):
        buckshot_piece = np.array([float(center_x), float(height), float(center_y)])
        buckshot_directional = np.array(
            [
                r.uniform(-max_x_deflect, max_x_deflect),
                -1.0,
                r.uniform(-max_y_deflect, max_y_deflect),
            ]
        )

        buckshot_pieces.append([buckshot_piece, buckshot_directional])

    # Do the dirty.
    for i in range(height):
        for piece in buckshot_pieces:
            piece[0] += piece[1]

    # Calculate changes.
    result = []
    for i in buckshot_pieces:
        piece_x, _, piece_y = i[0]
        if piece_x > max_y or piece_y > max_y:
            continue

        result.append((int(piece_x), int(piece_y)))

    return result


def river_path(r, max_length, max_x, max_y):
    # We traverse a path from the starting point, with a small chance to
    # deviate on each tick.

    start_x = r.randint(0, max_x)
    start_y = r.randint(0, max_y)

    position = np.array([start_x, start_y])

    result = []
    for i in range(max_length):
        direction = np.array([r.randint(-1, 1), r.randint(-1, 1)])

        # Ensure we don't go diagonal.
        if direction.all():
            direction[r.randint(0, 1)] = 0

        position += direction
        if position[0] >= max_x or position[0] < 0:
            break
        if position[1] >= max_y or position[1] < 0:
            break

        pos_tuple = (position[0], position[1])
        if pos_tuple in result:
            continue
        result.append(pos_tuple)

    return result


def offset(max_x, x, y):
    return (y * max_x) + x


def fill_points(world, max_x, xys, cell_type, passable_only=False, replace=True):
    for (x, y) in xys:
        offset = (y * max_x) + x
        if passable_only and not world[offset].is_passable():
            continue
        if (world[offset].cell_type != Cell.TYPE_EMPTY) and not replace:
            continue
        world[offset].cell_type = cell_type


def fill_region(world, max_x, x, y, width, height, cell_type, passable_only=False):
    for y_ in range(height):
        for x_ in range(width):
            offset = ((y + y_) * max_x) + (x + x_)
            if passable_only and not world[offset].is_passable():
                continue
            world[offset].cell_type = cell_type


def paint(world, max_x, x, y, width, height, brush):
    for y_ in range(height):
        for x_ in range(width):
            dest_offset = ((y + y_) * max_x) + (x + x_)
            src_offset = (y_ * width) + x_
            world[dest_offset].cell_type = brush[src_offset].cell_type


def match_all(world, world_width, world_height, x, y, width, height, cell_type):
    x = max(0, x)
    y = max(0, y)
    if (x + width) >= world_width:
        width = world_width - x
    if (y + height) >= world_height:
        height = world_height - y

    for y_ in range(height):
        for x_ in range(width):
            offset = ((y + y_) * world_width) + (x + x_)
            if world[offset].cell_type != cell_type:
                return False

    return True


def make_room(width, height):
    total_cells = width * height
    result = []
    for _ in range(total_cells):
        c = Cell((0, 0))
        c.cell_type = Cell.TYPE_ROOM

        result.append(c)

    return result


def generate_map(r, print_map=False):
    WORLD_X = 64
    WORLD_Y = 64
    TOTAL_CELLS = WORLD_X * WORLD_Y

    world = []
    for y in range(WORLD_Y):
        for x in range(WORLD_X):
            world.append(Cell((x, y)))

    NUM_RECTS = max(1, int(0.005 * TOTAL_CELLS))
    NUM_RIVERS = max(2, int(0.005 * TOTAL_CELLS))
    NUM_CHASMS = max(1, int(0.0015 * TOTAL_CELLS))
    NUM_CLUTTER_ITEMS = max(8, int(0.05 * TOTAL_CELLS))

    RECT_PLACEMENT_ATTEMPTS = 200

    MAX_RIVER_LENGTH = int(float(WORLD_X) * 1.3)

    rect_max_width = WORLD_X / 8
    rect_max_height = WORLD_Y / 8
    rect_min_width = int(max(4, rect_max_width * 0.05))
    rect_min_height = int(max(4, rect_max_height * 0.25))

    rooms = []
    start_room = Room((1, 1), 8, 8)
    start_room.attrs |= Room.ATTR_STARTING_ROOM
    end_room = Room((WORLD_X - 9, WORLD_Y - 9), 8, 8)
    end_room.attrs |= Room.ATTR_BOSS_ROOM

    rooms.append(start_room)
    rooms.append(end_room)

    for i in range(NUM_RECTS):
        rect_x_dim = r.randint(rect_min_width, rect_max_width)
        rect_y_dim = r.randint(rect_min_height, rect_max_height)

        # Can we find a place to fit this room in?
        for _ in range(RECT_PLACEMENT_ATTEMPTS):
            # one tile border around the entire map
            x = r.randint(1, WORLD_X - rect_x_dim - 1)
            y = r.randint(1, WORLD_Y - rect_y_dim - 1)
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
            WORLD_X,
            room.pos[0],
            room.pos[1],
            room.dims[0],
            room.dims[1],
            room_map,
        )

    for prev, curr in zip(rooms, rooms[1:]):
        points = list(prev.tunnel_to(curr))
        fill_points(world, WORLD_X, points, Cell.TYPE_HALL, replace=False)

    clutter = []

    # Find locations for clutter in the world in each room
    for room in rooms:
        # no clutter in boss room or shop room
        if not (
            room.attrs == 0
            or (room.attrs & Room.ATTR_STARTING_ROOM) == Room.ATTR_STARTING_ROOM
        ):
            continue

        count = r.randint(1, 3)

        # we never place clutter next to a wall to ensure we don't block a hallway
        room_clutter = buckshot_positions(
            r, room.dims[0] - 2, room.dims[1] - 2, count=count
        )

        clutter.extend(
            (room.pos[0] + x + 1, room.pos[1] + y + 1) for (x, y) in room_clutter
        )

    print("world has %d cells" % (len(world),))
    result = Map(r, WORLD_X, WORLD_Y, rooms, world, clutter)

    # Dump the map to screen.
    if print_map:
        for y in range(WORLD_Y):
            s = ""
            for x in range(WORLD_X):
                cell = result.cell_at(x, y)
                room = result.room_at(x, y)

                c = ""
                if cell.cell_type == Cell.TYPE_EMPTY:
                    c = " "
                elif cell.cell_type == Cell.TYPE_ROOM:
                    c = "R"
                elif cell.cell_type == Cell.TYPE_HALL:
                    c = "H"

                if room is not None and room.attrs & Room.ATTR_SHOP_ROOM:
                    c = "S"
                if room is not None and room.attrs & Room.ATTR_BOSS_ROOM:
                    c = "B"

                s += c

            print(s)

    return result
