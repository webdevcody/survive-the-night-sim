import { prepareCanvas } from "./prepareCanvas";

export function createCanvas(
  width: number,
  height: number,
): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  const ctx = prepareCanvas(canvas, width, height);
  return [canvas, ctx];
}
