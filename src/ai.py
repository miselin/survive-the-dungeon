from game import game


class AI:
    def __init__(self, dungeon, player, worldmap, pos_walkable_cb, attack_cb):
        self.dungeon = dungeon
        self.player = player
        self.worldmap = worldmap
        self.instances = []
        self.tasks = []
        self.pos_walkable_cb = pos_walkable_cb
        self.attack_cb = attack_cb

    def attach(self, creature):
        self.instances.append(AIInstance(self, creature))

    def detach(self, instance):
        self.instances.remove(instance)


class AIInstance:
    def __init__(self, ai, creature):
        self.ai = ai
        self.creature = creature

        self.creature.ai_control(self)

        self.moving_to = None
        self.path = None

        self.leisurely = True

    def detach(self):
        self.ai.detach(self)

    def move_to(self, room=None, pos=None):
        if room is None and pos is None:
            return

        if pos is None:
            self.moving_to = list(
                room.generate_random_positions(
                    game().random(), 1, [self.creature.position]
                )
            )[0]
            self.moving_to = room.room_to_world(self.moving_to)
        else:
            self.moving_to = pos
        self.path = list(
            self.ai.worldmap.path_to(
                self.creature.position,
                self.moving_to,
                self.ai.player,
                self.ai.dungeon.creatures,
                self.ai.dungeon.containers,
            )
        )

    def think(self):
        player_pos = self.ai.player.position
        player_room = self.ai.worldmap.room_at(*player_pos)
        my_room = self.ai.worldmap.room_at(*self.creature.position)

        if player_room == my_room:
            self.leisurely = False
            if self.moving_to != player_pos:
                self.move_to(pos=player_pos)

            # we're next to the player. attack!
            if len(self.path) == 1:
                self.ai.attack_cb(self.creature)
        else:
            self.leisurely = True

            # player not in our room, make sure we don't continue pathing to the player
            self.moving_to = None

        # move around the room
        if self.moving_to is None or self.moving_to == self.creature.position:
            self.move_to(room=my_room)

        if self.path:
            # if we're not leisurely moving, we move every think()
            # otherwise we flip a coin!
            if (not self.leisurely) or (game().random().randint(1, 12) > 8):
                next_pos = self.path[0]
                if self.ai.pos_walkable_cb(next_pos):
                    self.creature.position = next_pos
                    self.path = self.path[1:]
