import typing_extensions

from api.paths import PathValues
from api.apis.paths.daily_ import Daily
from api.apis.paths.leaderboard_seed import LeaderboardSeed
from api.apis.paths.tombstone_seed import TombstoneSeed

PathToApi = typing_extensions.TypedDict(
    'PathToApi',
    {
        PathValues.DAILY_: Daily,
        PathValues.LEADERBOARD_SEED: LeaderboardSeed,
        PathValues.TOMBSTONE_SEED: TombstoneSeed,
    }
)

path_to_api = PathToApi(
    {
        PathValues.DAILY_: Daily,
        PathValues.LEADERBOARD_SEED: LeaderboardSeed,
        PathValues.TOMBSTONE_SEED: TombstoneSeed,
    }
)
