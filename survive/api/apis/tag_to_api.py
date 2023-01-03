import typing_extensions

from api.apis.tags import TagValues
from api.apis.tags.leaderboard_api import LeaderboardApi
from api.apis.tags.daily_api import DailyApi
from api.apis.tags.tombstone_api import TombstoneApi

TagToApi = typing_extensions.TypedDict(
    'TagToApi',
    {
        TagValues.LEADERBOARD: LeaderboardApi,
        TagValues.DAILY: DailyApi,
        TagValues.TOMBSTONE: TombstoneApi,
    }
)

tag_to_api = TagToApi(
    {
        TagValues.LEADERBOARD: LeaderboardApi,
        TagValues.DAILY: DailyApi,
        TagValues.TOMBSTONE: TombstoneApi,
    }
)
