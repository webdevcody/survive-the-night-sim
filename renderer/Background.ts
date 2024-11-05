import { assets } from "./Assets";
import { canvasToImage } from "@/lib/canvasToImage";
import { createCanvas } from "@/lib/createCanvas";
import { ZombieSurvival } from "@/simulator";

export const BITMASK_TO_TILE_INDEX = {
  0: 0,
  4: 1,
  92: 2,
  124: 3,
  116: 4,
  80: 5,
  // no index 6: tile not used
  16: 7,
  20: 8,
  87: 9,
  223: 10,
  241: 11,
  21: 12,
  64: 13,
  29: 14,
  117: 15,
  85: 16,
  71: 17,
  221: 18,
  125: 19,
  112: 20,
  31: 21,
  253: 22,
  113: 23,
  28: 24,
  127: 25,
  247: 26,
  209: 27,
  23: 28,
  199: 29,
  213: 30,
  95: 31,
  255: 32,
  245: 33,
  81: 34,
  5: 35,
  84: 36,
  93: 37,
  119: 38,
  215: 39,
  193: 40,
  17: 41,
  // no index 42: tile not used
  1: 43,
  7: 44,
  197: 45,
  69: 46,
  68: 47,
  65: 48,
} as const;

const neighborOffsets = [
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
] as const;

export function getBitMask(
  map: string[][],
  x: number,
  y: number,
  outOfBound = 1,
) {
  const width = ZombieSurvival.boardWidth(map);
  const height = ZombieSurvival.boardHeight(map);

  let bitmask = 0;

  for (let i = 0; i < neighborOffsets.length; i++) {
    const [dx, dy] = neighborOffsets[i];
    const nx = x + dx;
    const ny = y + dy;

    if (ny < 0 || ny >= height || nx < 0 || nx >= width) {
      bitmask |= outOfBound << i;
    } else if (map[ny][nx] === "R") {
      bitmask |= 1 << i;
    }
  }

  return bitmask as keyof typeof BITMASK_TO_TILE_INDEX;
}

export async function generateBg(
  map: string[][],
  cellSize = 64,
): Promise<HTMLImageElement> {
  const tileSize = 64;
  const floor = assets.floor;
  const tileMap = assets.tileMap;

  if (floor === null || tileMap === null) {
    throw new Error("Tried generating background on uninitialized assets");
  }

  const width = ZombieSurvival.boardWidth(map) * cellSize;
  const height = ZombieSurvival.boardHeight(map) * cellSize;
  const [canvas, ctx] = createCanvas(width, height);
  const floorPattern = ctx.createPattern(floor, "repeat");

  if (floorPattern === null) {
    throw new Error("Unable to create floor pattern");
  }

  ctx.fillStyle = floorPattern;
  ctx.fillRect(0, 0, width, height);

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] !== "R") {
        continue;
      }

      const bitMask = getBitMask(map, x, y);
      const tileIdx = BITMASK_TO_TILE_INDEX[bitMask];

      if (tileIdx === undefined) {
        continue;
      }

      const sy = Math.floor(tileIdx / 7);
      const sx = tileIdx % 7;

      ctx.drawImage(
        tileMap,
        sx * tileSize,
        sy * tileSize,
        tileSize,
        tileSize,
        x * cellSize,
        y * cellSize,
        cellSize,
        cellSize,
      );
    }
  }

  return canvasToImage(canvas);
}
