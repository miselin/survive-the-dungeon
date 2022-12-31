"""This module exports utilities for getting random words."""

import json
from dataclasses import dataclass
from typing import Any

from .game import game


@dataclass
class WordsCache:
    """WordsCache caches words read from files once read once"""

    adverbs: Any
    adjectives: Any
    personal_nouns: Any


cache = WordsCache(adverbs=None, adjectives=None, personal_nouns=None)


def random_adverb():
    """random_adverb gets a single random adverb"""

    random = game().random()

    if not cache.adverbs:
        with open("words/adverbs.json", "r", encoding="ascii") as data_file:
            cache.adverbs = json.load(data_file)

    return random.choice(cache.adverbs["adverbs"])


def random_adjective():
    """random_adjective gets a single random adjective"""

    random = game().random()

    if not cache.adjectives:
        with open("words/adjs.json", "r", encoding="ascii") as data_file:
            cache.adjectives = json.load(data_file)

    return random.choice(cache.adjectives["adjs"])


def random_personal_noun():
    """random_personal_noun gets a single random personal noun"""

    random = game().random()

    if not cache.personal_nouns:
        with open("words/personal_nouns.json", "r", encoding="ascii") as data_file:
            cache.personal_nouns = json.load(data_file)

    return random.choice(cache.personal_nouns["personalNouns"])
