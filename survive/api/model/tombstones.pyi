# coding: utf-8

"""
    Survive the Dungeon API

    API for the online features of Survive the Dungeon game.  Play the game here: https://replit.com/@mattiselin/Survive-the-Dungeon?v=1  The game does not depend on online play at all, but this API offers some socialfeatures that would otherwise not be present.  # noqa: E501

    The version of the OpenAPI document: 1.0
    Generated by: https://openapi-generator.tech
"""

from datetime import date, datetime  # noqa: F401
import decimal  # noqa: F401
import functools  # noqa: F401
import io  # noqa: F401
import re  # noqa: F401
import typing  # noqa: F401
import typing_extensions  # noqa: F401
import uuid  # noqa: F401

import frozendict  # noqa: F401

from api import schemas  # noqa: F401


class Tombstones(
    schemas.DictSchema
):
    """NOTE: This class is auto generated by OpenAPI Generator.
    Ref: https://openapi-generator.tech

    Do not edit the class manually.
    """


    class MetaOapg:
        
        class properties:
            
            
            class entries(
                schemas.ListSchema
            ):
            
            
                class MetaOapg:
                    
                    @staticmethod
                    def items() -> typing.Type['Tombstone']:
                        return Tombstone
            
                def __new__(
                    cls,
                    arg: typing.Union[typing.Tuple['Tombstone'], typing.List['Tombstone']],
                    _configuration: typing.Optional[schemas.Configuration] = None,
                ) -> 'entries':
                    return super().__new__(
                        cls,
                        arg,
                        _configuration=_configuration,
                    )
            
                def __getitem__(self, i: int) -> 'Tombstone':
                    return super().__getitem__(i)
            seed = schemas.IntSchema
            __annotations__ = {
                "entries": entries,
                "seed": seed,
            }
    
    @typing.overload
    def __getitem__(self, name: typing_extensions.Literal["entries"]) -> MetaOapg.properties.entries: ...
    
    @typing.overload
    def __getitem__(self, name: typing_extensions.Literal["seed"]) -> MetaOapg.properties.seed: ...
    
    @typing.overload
    def __getitem__(self, name: str) -> schemas.UnsetAnyTypeSchema: ...
    
    def __getitem__(self, name: typing.Union[typing_extensions.Literal["entries", "seed", ], str]):
        # dict_instance[name] accessor
        return super().__getitem__(name)
    
    
    @typing.overload
    def get_item_oapg(self, name: typing_extensions.Literal["entries"]) -> typing.Union[MetaOapg.properties.entries, schemas.Unset]: ...
    
    @typing.overload
    def get_item_oapg(self, name: typing_extensions.Literal["seed"]) -> typing.Union[MetaOapg.properties.seed, schemas.Unset]: ...
    
    @typing.overload
    def get_item_oapg(self, name: str) -> typing.Union[schemas.UnsetAnyTypeSchema, schemas.Unset]: ...
    
    def get_item_oapg(self, name: typing.Union[typing_extensions.Literal["entries", "seed", ], str]):
        return super().get_item_oapg(name)
    

    def __new__(
        cls,
        *args: typing.Union[dict, frozendict.frozendict, ],
        entries: typing.Union[MetaOapg.properties.entries, list, tuple, schemas.Unset] = schemas.unset,
        seed: typing.Union[MetaOapg.properties.seed, decimal.Decimal, int, schemas.Unset] = schemas.unset,
        _configuration: typing.Optional[schemas.Configuration] = None,
        **kwargs: typing.Union[schemas.AnyTypeSchema, dict, frozendict.frozendict, str, date, datetime, uuid.UUID, int, float, decimal.Decimal, None, list, tuple, bytes],
    ) -> 'Tombstones':
        return super().__new__(
            cls,
            *args,
            entries=entries,
            seed=seed,
            _configuration=_configuration,
            **kwargs,
        )

from api.model.tombstone import Tombstone
