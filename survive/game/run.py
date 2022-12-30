import math

import pygame
import pygame_gui
import tcod

from dungeon import WINDOW_H, WINDOW_W, Dungeon, SpriteSet
from game import Game, set_game
from gameend import GameEndedScreen
from mainmenu import GAME_TITLE, MainMenu
from sprites import SpriteSheet


def run():
    pygame.init()

    DISPLAYSURF = pygame.display.set_mode((WINDOW_W, WINDOW_H))
    pygame.display.set_caption(GAME_TITLE)

    font = pygame.freetype.Font("fonts/CourierPrime-Regular.ttf", 14)

    ui = pygame_gui.UIManager((WINDOW_W, WINDOW_H), "themes/theme.json")

    spritesheet = SpriteSheet("tiles/Tiles-SandstoneDungeons.png")
    spritesheet_chars = SpriteSheet("tiles/Characters-part-1.png")
    spritesheet_items = SpriteSheet("tiles/Tiles-Items-pack.png")
    spritesheet_props = SpriteSheet("tiles/Tiles-Props-pack.png")
    spritesheet_ui = SpriteSheet("ui/icons.png")

    # top_wall = spritesheet.sprite(19)
    floor = spritesheet.sprite(11)
    hall_floor = spritesheet.sprite(2)
    n_wall = spritesheet.sprite(19)
    w_wall = spritesheet.sprite(18)
    e_wall = spritesheet.sprite(20)
    s_wall = spritesheet.sprite(55)

    player_sprite = spritesheet_chars.sprite(0)

    clutter_sprites = [spritesheet_props.sprite(88 + i) for i in range(8)]
    hall_clutter_sprites = [spritesheet_props.sprite(67 + i) for i in range(7)]

    spriteset = SpriteSet(
        player_sprite,
        [spritesheet_chars.sprite(12)],
        [n_wall, s_wall, e_wall, w_wall],
        floor,
        hall_floor,
        [spritesheet_items.sprite(22), spritesheet_items.sprite(23)],
        clutter_sprites,
        hall_clutter_sprites,
    )

    game = Game(seed=0)
    set_game(game)

    main_menu = MainMenu(ui, DISPLAYSURF)
    game_ended = GameEndedScreen(ui, DISPLAYSURF)

    receiver = main_menu

    clock = pygame.time.Clock()

    prev_state = game.state()

    pygame.key.set_repeat(5, 250)

    active_game = None
    dt = 0.0
    while True:
        curr_state = game.state()

        # kill an ongoing game if needed
        if curr_state != Game.STATE_PLAYING:
            if active_game is not None:
                active_game.kill()
                active_game = None

        if curr_state == Game.STATE_MAIN_MENU:
            if prev_state != curr_state:
                main_menu.rebuild()

            receiver = main_menu

            if main_menu.done():
                # reload game
                game = Game(seed=main_menu.seed)
                set_game(game)
                game.set_state(Game.STATE_PLAYING)

                active_game = Dungeon(
                    game, ui, font, DISPLAYSURF, spriteset, spritesheet_ui
                )
                main_menu.ack_done()

                receiver = active_game
        elif curr_state in (Game.STATE_WIN, Game.STATE_DEAD):
            receiver = game_ended

            if curr_state != prev_state:
                game_ended.set_won(curr_state == Game.STATE_WIN)
                game_ended.rebuild()

        for event in pygame.event.get():
            ui.process_events(event)
            receiver.handle_event(event)

        receiver.render()
        ui.draw_ui(DISPLAYSURF)

        pygame.display.update()
        dt = clock.tick(60)  # can return time in ticks for arithmetic

        receiver.tick(dt)
        ui.update(dt)

        prev_state = curr_state

    pygame.quit()
