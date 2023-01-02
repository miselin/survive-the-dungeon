"""Entrypoint for Survive the Dungeon"""

import os
import sys

from game import run

if __name__ == "__main__":
    if getattr(sys, "frozen", False):
        # In PyInstaller bundled binaries, we need to be in the temp dir
        # to find all our resources.
        appdir = os.path.dirname(sys.executable)
        os.chdir(appdir)

    run()
