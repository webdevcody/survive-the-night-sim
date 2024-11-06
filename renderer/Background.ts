import { canvasToImage } from "../lib/canvasToImage";
import { createCanvas } from "../lib/createCanvas";
import { ZombieSurvival } from "../simulator";
import { assets } from "./Assets";

export const BITMASK_TO_TILE_INDEX: Record<number, number> = {
  0: 0,
  16: 1,
  88: 2,
  216: 3,
  248: 4,
  120: 5,
  72: 6,
  64: 7,
  208: 8,
  122: 9,
  222: 10,
  255: 11,
  251: 12,
  106: 13,
  82: 14,
  94: 15,
  219: 16,
  254: 17,
  // 18 not used
  127: 19,
  75: 20,
  210: 21,
  250: 22,
  126: 23,
  31: 24,
  95: 25,
  91: 26,
  74: 27,
  214: 28,
  // 29 not used
  107: 30,
  80: 31,
  10: 32,
  66: 33,
  2: 34,
  86: 35,
  223: 36,
  123: 37,
  90: 38,
  24: 39,
  218: 40,
  104: 41,
  18: 42,
  30: 43,
  27: 44,
  26: 45,
  8: 46,
  22: 47,
  11: 48,
} as const;

const neighborOffsets = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
] as const;

export function getBitMask(
  map: string[][],
  x: number,
  y: number,
  outOfBoundToken = " ",
) {
  let bitmask = 0;

  for (let i = 0; i < neighborOffsets.length; i++) {
    const [dx, dy] = neighborOffsets[i];
    const token = map[y + dy]?.[x + dx] ?? outOfBoundToken;

    if (token === "R") {
      bitmask |= 1 << i;
    }
  }

  return bitmask;
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
