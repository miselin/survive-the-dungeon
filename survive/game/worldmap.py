import numpy as np
import tcod


class Map:
    def __init__(self, r, width, height, rooms, cells, clutter):
        self.width = width
        self.height = height
        self.rooms = rooms
        self.cells = cells
        self.clutter = clutter
        self.r = r

        # cell visibility options
        self.explored = np.zeros((self.width, self.height), dtype=bool, order="F")
        self.transparency = np.zeros((self.width, self.height), dtype=bool, order="F")
        self.visible = np.zeros((self.width, self.height), dtype=bool, order="F")

        for y in range(self.height):
            for x in range(self.width):
                if self.cells[(y * self.width) + x].cell_type != Cell.TYPE_EMPTY:
                    self.transparency[x, y] = True

        # fix clutter to only be in visible areas
        self.clutter = list(
            filter(lambda c: self.cell_at(*c).is_passable(), self.clutter)
        )

    def cell_at(self, x, y, debug=False):
        if debug:
            print("cell_at", (x, y), (self.width, self.height))
            print(" =", ((y * self.width) + x))
            print(" len", len(self.cells))
        return self.cells[(y * self.width) + x]

    def room_at(self, x, y):
        for room in self.rooms:
            if room.contains((x, y)):
                return room

        return None

    def update_fov(self, x, y):
        self.visible = tcod.map.compute_fov(self.transparency, (x, y))
        self.explored |= self.visible

        for y in range(self.height):
            for x in range(self.width):
                cell = self.cells[(y * self.width) + x]
                cell.visible = self.visible[x, y]
                cell.explored = self.explored[x, y]

    def path_to(self, start, end, player, creatures, containers):
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


class Cell:
    TYPE_EMPTY = 0
    TYPE_ROOM = 1
    TYPE_WATER = 2
    TYPE_CHASM = 3
    TYPE_HALL = 4

    def __init__(self, pos):
        self.cell_type = Cell.TYPE_EMPTY
        self.pos = pos
        self.visible = False
        self.explored = False
        self.clutter = None
        self.wall_clutter = None

    def is_passable(self):
        return self.cell_type in (Cell.TYPE_ROOM, Cell.TYPE_HALL)


class Room:
    ATTR_STARTING_ROOM = 1
    ATTR_BOSS_ROOM = 2
    ATTR_SHOP_ROOM = 4

    def __init__(self, pos, width, height, attrs=0):
        self.pos = pos
        self.dims = (width, height)
        self.attrs = 0
        self.doorways = []

    def overlaps(self, room, padding=1):
        # create a 1-tile padding to avoid rooms too close to each other
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

    def contains(self, pos):
        x_left = self.pos[0]
        x_right = self.pos[0] + self.dims[0]
        y_top = self.pos[1]
        y_bottom = self.pos[1] + self.dims[1]

        return (x_left <= pos[0] < x_right) and (y_top <= pos[1] < y_bottom)

    def is_doorway(self, pos):
        for doorway in self.doorways:
            if doorway == pos:
                return True

        return False

    def tunnel_to(self, room):
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

    def mark_doorway(self, pos):
        self.doorways.append(pos)

    def distance_to(self, room):
        return len(list(self.tunnel_to(room)))

    def generate_random_positions(self, r, count, keepouts=()):
        seen = set()
        for _ in range(count):
            for _ in range(10000):  # 10k tries to get a coord that hasn't been used yet
                p = r.randint(0, self.dims[0] - 1), r.randint(1, self.dims[1] - 1)
                if p in seen or p in keepouts:
                    continue

                seen.add(p)
                yield p
                break

    def room_to_world(self, pos):
        return (pos[0] + self.pos[0], pos[1] + self.pos[1])
