"""This module provides handling for online play."""

import os
import subprocess
import functools
from typing import Optional, List

from tomlkit import datetime
from .env import ON_REPLIT

import api
from api.apis.tags import daily_api, leaderboard_api

from dataclasses import dataclass


DEFAULT_HOST = 'https://Survive-the-Dungeon-Server.mattiselin.repl.co'
DEFAULT_AUDIENCE = '970a2027-ee56-4336-8751-57a070f055ee'

@dataclass
class LeaderboardEntry:
    """An entry in a leaderboard"""
    player: str
    score: int


@dataclass
class Leaderboard:
    """A leaderboard"""
    seed: int
    entries: List[LeaderboardEntry]


class OnlinePlay:
    """OnlinePlay handles all of the requests to the API server."""

    def __init__(self, host=DEFAULT_HOST):
        api_keys = {}
        if ON_REPLIT:
            self._identity_token = subprocess.check_output(['./replit', 'repl-identity', 'create', f'-audience={DEFAULT_AUDIENCE}'])
            self._player_name = os.environ.get('REPL_OWNER', 'Player')
            api_keys['repl-identity'] = self._identity_token

        self._api_client = api.ApiClient(api.Configuration(host=host, api_key=api_keys))

    @functools.cached_property
    def daily_seed(self) -> int:
        """Get today's seed."""

        api_instance = daily_api.DailyApi(self._api_client)

        try:
            # Get today's seed
            api_response = api_instance.get_daily_route()
            return api_response.body.get('seed')
        except api.ApiException as e:
            print("Exception when calling DailyApi->get_daily_route: %s\n" % e)

        return None

    def leaderboard(self, seed: Optional[int]=None) -> Optional[Leaderboard]:
        """Get the leaderboard for the given seed. If no seed is given, today's seed will be used."""
        api_instance = leaderboard_api.LeaderboardApi(self._api_client)

        if seed is None:
            seed = self.daily_seed

        try:
            # Get today's seed
            api_response = api_instance.get_leaderboard({'seed': seed})
            seed = api_response.body['seed']
            entries = api_response.body['entries']

            result = Leaderboard(seed=seed, entries=[])
            for entry in entries:
                result.entries.append(LeaderboardEntry(player=entry['player'], score=entry['score']))

            print(result)
            return result
        except api.ApiException as e:
            print("Exception when calling LeaderboardApi->get_leaderboard: %s\n" % e)

    def submit_score(self, seed: int, score: int):
        """Submit the player's score for the given seed."""
        if not ON_REPLIT:
            # no-op, can't submit scores without the Replit Identity token
            return

        api_instance = leaderboard_api.LeaderboardApi(self._api_client)

        self._player_name
        try:
            api_instance.create_todo({
                "player": self._player_name,
                "seed": seed,
                "score": score,
                "at": datetime.datetime.now(),
            })
        except api.ApiException as e:
            print("Exception when calling LeaderboardApi->create_todo: %s\n" % e)
