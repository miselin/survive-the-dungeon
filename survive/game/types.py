"""This module exports common types for mypy"""

from typing import Literal, Tuple

Position = Tuple[int, int]
Wieldpoint = Literal["head", "chest", "arms", "hands", "legs", "feet"]
