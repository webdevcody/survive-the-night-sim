import { useEffect, useState } from "react";
import { DEFAULT_REPLAY_SPEED } from "@/constants/visualizer";
import { Renderer } from "@/renderer";
import { ZombieSurvival } from "@/simulator";

export function useRenderer(
  map: string[][] | null | undefined,
  canvas: React.MutableRefObject<HTMLCanvasElement | null>,
  cellSize: number = 64,
  replaySpeed: number = DEFAULT_REPLAY_SPEED,
) {
  const [renderer, setRenderer] = useState<Renderer | null>(null);

  useEffect(() => {
    if (map === null || map === undefined) {
      return;
    }

    const boardWidth = ZombieSurvival.boardWidth(map);
    const boardHeight = ZombieSurvival.boardHeight(map);

    async function handleInitializeRenderer() {
      if (canvas.current === null) {
        return;
      }

      const renderer = new Renderer(
        boardWidth,
        boardHeight,
        canvas.current,
        cellSize,
        replaySpeed,
      );

      await renderer.initialize();
      setRenderer(renderer);
    }

    void handleInitializeRenderer();
  }, [map, cellSize, replaySpeed]);

  return renderer;
}
