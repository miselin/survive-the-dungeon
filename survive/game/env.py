"""This module exports flags or variables from the local environment."""

import os

ON_REPLIT = os.environ.get("REPL_ID") is not None

IS_TESTING = os.environ.get("TESTING") == "testing"

ONLINE_PLAY = ON_REPLIT or True
