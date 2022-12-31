"""This module exports flags or variables from the local environment."""

import os

ON_REPLIT = os.environ.get("REPL_ID") is not None
