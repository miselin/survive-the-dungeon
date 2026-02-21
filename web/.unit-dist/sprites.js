const SPRITE_SIZE = 32;
function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}
const SHEETS = {
    dungeon: loadImage("/tiles/Tiles-SandstoneDungeons.png"),
    chars: loadImage("/tiles/Characters-part-1.png"),
    items: loadImage("/tiles/Tiles-Items-pack.png"),
    props: loadImage("/tiles/Tiles-Props-pack.png"),
};
export const SPRITE_IDS = {
    dungeon: {
        floor: 11,
        hallFloor: 2,
        wallN: 19,
        wallW: 18,
        wallE: 20,
        wallS: 55,
    },
    chars: {
        player: 0,
        mob: 12,
    },
    items: {
        chestClosed: 22,
        chestOpen: 23,
    },
    props: {
        shopClutter: [88, 89, 90, 91, 92, 93, 94, 95],
    },
};
function ready(img) {
    return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
}
export function allSpritesReady() {
    return Object.values(SHEETS).every((img) => ready(img));
}
export function drawSheetSprite(ctx, sheet, index, x, y, size) {
    const img = SHEETS[sheet];
    if (!ready(img)) {
        return false;
    }
    const cols = Math.max(1, Math.floor(img.naturalWidth / SPRITE_SIZE));
    const sx = (index % cols) * SPRITE_SIZE;
    const sy = Math.floor(index / cols) * SPRITE_SIZE;
    ctx.drawImage(img, sx, sy, SPRITE_SIZE, SPRITE_SIZE, x, y, size, size);
    return true;
}
