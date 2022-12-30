import pygame


class SpriteSheet:
    def __init__(self, filename, w=32, h=32):
        self.sheet = pygame.image.load(filename).convert_alpha()
        self.w = w
        self.h = h

        self.sprites = []

        self._sheet_size = self.sheet.get_size()
        self._sprites_horiz = int(self._sheet_size[0] // self.w)
        self._sprites_vert = int(self._sheet_size[1] // self.h)

        # generate the sheet
        for y in range(self._sprites_vert):
            y_ = y * self.h
            for x in range(self._sprites_horiz):
                x_ = x * self.w

                self._load_at(x_, y_)

    def _load_at(self, x, y):
        img = pygame.Surface((self.w, self.h), pygame.SRCALPHA, 32).convert_alpha()
        img.blit(self.sheet, (0, 0), (x, y, self.w, self.h))
        self.sprites.append(img)

    def sprite(self, n):
        return self.sprites[n]
