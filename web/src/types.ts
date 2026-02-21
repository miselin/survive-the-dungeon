export type Position = { x: number; y: number };

export type WieldSlot = "head" | "chest" | "arms" | "hands" | "legs" | "feet";

export const ROOM_START = 1;
export const ROOM_BOSS = 2;
export const ROOM_SHOP = 4;

export type Room = {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  attrs: number;
};

export enum TileType {
  Empty = 0,
  Room = 1,
  Hall = 2,
}

export type LogLevel = "info" | "warn" | "success";

export type LogEntry = {
  text: string;
  level: LogLevel;
};
