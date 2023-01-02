"""Entrypoint for Survive the Dungeon"""

import os
import sys

from game import run

if __name__ == "__main__":
    if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
        # In PyInstaller bundled binaries, we need to be in the temp dir
        # to find all our resources.
        os.chdir(sys._MEIPASS)

    run()
