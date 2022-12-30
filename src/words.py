import json

from game import game

adverbs = None
adjectives = None
personal_nouns = None


def random_adverb():
    global adverbs

    r = game().random()

    if not adverbs:
        with open("words/adverbs.json", "r") as f:
            adverbs = json.load(f)

    return r.choice(adverbs["adverbs"])


def random_adjective():
    global adjectives

    r = game().random()

    if not adjectives:
        with open("words/adjs.json", "r") as f:
            adjectives = json.load(f)

    return r.choice(adjectives["adjs"])


def random_personal_noun():
    global personal_nouns

    r = game().random()

    if not personal_nouns:
        with open("words/personal_nouns.json", "r") as f:
            personal_nouns = json.load(f)

    return r.choice(personal_nouns["personalNouns"])
