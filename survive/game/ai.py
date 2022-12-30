"""AI for creatures in the dungeon"""

from typing import Callable, List, Optional, Tuple

from . import types
from .creature import Creature
from .game import game
from .worldmap import Room


class AI:
    """AI holds the main AI state and instances for each creature"""

    def __init__(
        self,
        dungeon: "Dungeon",
        pos_walkable_cb: Callable[[Tuple[int, int]], bool],
        attack_cb: Callable[[Creature], None],
    ):
        self.dungeon = dungeon
        self.player = dungeon.player
        self.worldmap = dungeon.worldmap
        self.instances: List["AIInstance"] = []
        self.pos_walkable_cb = pos_walkable_cb
        self.attack_cb = attack_cb

    def attach(self, creature: Creature):
        """Attach attaches an AIInstance to the given creature."""
        self.instances.append(AIInstance(self, creature))

    def detach(self, instance: "AIInstance"):
        """Detach removes an attached AIInstance."""
        self.instances.remove(instance)


class AIInstance:
    """AIInstance handles AI logic for a single creature"""

    def __init__(self, ai_state: AI, creature: Creature):
        self.ai_state = ai_state
        self.creature = creature

        self.creature.ai_control(self)

        self.moving_to: Optional[types.Position] = None
        self.path: List[types.Position] = []

        self.leisurely = True

    def detach(self):
        """Detach this AIInstance from the main AI."""
        self.ai_state.detach(self)

    def move_to(
        self, room: Optional[Room] = None, pos: Optional[types.Position] = None
    ):
        """Set the AI a new move-to goal."""
        if pos is None:
            if room is None:
                return

            self.moving_to = list(
                room.generate_random_positions(
                    game().random(), 1, [self.creature.position]
                )
            )[0]
            self.moving_to = room.room_to_world(self.moving_to)
        else:
            self.moving_to = pos

        self.path = list(
            self.ai_state.worldmap.path_to(
                self.creature.position,
                self.moving_to,
                self.ai_state.player,
                self.ai_state.dungeon.creatures,
                self.ai_state.dungeon.containers,
            )
        )

    def think(self):
        """Run the AI for an interation."""
        player_pos = self.ai_state.player.position
        player_room = self.ai_state.worldmap.room_at(*player_pos)
        my_room = self.ai_state.worldmap.room_at(*self.creature.position)

        if player_room == my_room:
            self.leisurely = False
            if self.moving_to != player_pos:
                self.move_to(pos=player_pos)

            # we're next to the player. attack!
            if len(self.path) == 1:
                self.ai_state.attack_cb(self.creature)
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
                if self.ai_state.pos_walkable_cb(next_pos):
                    self.creature.position = next_pos
                    self.path = self.path[1:]
