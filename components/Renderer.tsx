import { useEffect, useState } from "react";
import { DEFAULT_REPLAY_SPEED } from "@/constants/visualizer";
import { Renderer } from "@/renderer";

export function useRenderer(
  map: string[][] | null | undefined,
  canvas: React.MutableRefObject<HTMLCanvasElement | null>,
  cellSize: number = 64,
  replaySpeed: number = DEFAULT_REPLAY_SPEED,
) {
  const [renderer, setRenderer] = useState<Renderer | null>(null);

  useEffect(() => {
    if (map === null || map === undefined || canvas.current === null) {
      return;
    }

    const renderer = new Renderer(map, canvas.current, cellSize, replaySpeed);

    void renderer.initialize().then(() => {
      setRenderer(renderer);
    });
  }, [map, cellSize, replaySpeed]);

  return renderer;
}
