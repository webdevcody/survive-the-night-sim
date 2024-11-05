const imagesMap = new Map<string, HTMLImageElement>();

export function canvasToImage(canvas: HTMLCanvasElement): HTMLImageElement {
  const url = canvas.toDataURL();

  if (!imagesMap.has(url)) {
    const image = document.createElement("img");
    image.src = url;
    imagesMap.set(url, image);
  }

  return imagesMap.get(url)!;
}
