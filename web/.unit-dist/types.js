export const ROOM_START = 1;
export const ROOM_BOSS = 2;
export const ROOM_SHOP = 4;
export var TileType;
(function (TileType) {
    TileType[TileType["Empty"] = 0] = "Empty";
    TileType[TileType["Room"] = 1] = "Room";
    TileType[TileType["Hall"] = 2] = "Hall";
})(TileType || (TileType = {}));
