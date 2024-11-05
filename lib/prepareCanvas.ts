export function prepareCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d");

  if (ctx === null) {
    throw new Error("Unable to get 2d context");
  }

  canvas.height = height;
  canvas.width = width;
  canvas.style.height = `${height}px`;
  canvas.style.width = `${width}px`;

  // ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  return ctx;
}
