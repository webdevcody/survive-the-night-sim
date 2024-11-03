import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AUTO_REPLAY_SPEED,
  DEFAULT_REPLAY_SPEED,
} from "@/constants/visualizer";
import { Renderer } from "@/renderer";
import { ZombieSurvival } from "@/simulator";

export function Visualizer({
  autoReplay = false,
  autoStart = false,
  controls = true,
  cellSize = "64",
  map,
  onReset,
  onSimulationEnd,
  replaySpeed = DEFAULT_REPLAY_SPEED,
}: {
  autoReplay?: boolean;
  autoStart?: boolean;
  controls?: boolean;
  cellSize?: string;
  map: string[][];
  onReset?: () => unknown;
  onSimulationEnd?: (isWin: boolean) => unknown;
  replaySpeed?: number;
}) {
  const simulator = useRef<ZombieSurvival>(new ZombieSurvival(map));
  const renderer = useRef<Renderer | null>(null);
  const interval = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const visible = useRef(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (canvas.current !== null) {
      renderer.current = new Renderer(
        ZombieSurvival.boardHeight(map),
        ZombieSurvival.boardWidth(map),
        canvas.current,
        Number.parseInt(cellSize, 10),
        replaySpeed,
      );
    }
  }, [canvas, cellSize, map, replaySpeed]);

  useEffect(() => {
    if (autoStart) {
      startSimulation();
    }
  }, [autoStart]);

  function startSimulation() {
    simulator.current = new ZombieSurvival(map);
    renderer.current?.render(simulator.current.getAllEntities());
    setRunning(true);

    interval.current = setInterval(() => {
      if (!visible.current) {
        return;
      }

      if (!simulator.current.finished()) {
        simulator.current.step();
        renderer.current?.render(simulator.current.getAllEntities());
        return;
      }

      clearInterval(interval.current!);
      interval.current = null;

      if (autoReplay) {
        timeout.current = setTimeout(() => {
          timeout.current = null;
          startSimulation();
        }, AUTO_REPLAY_SPEED);

        return;
      }

      setRunning(false);

      if (onSimulationEnd) {
        onSimulationEnd(!simulator.current.getPlayer()?.dead());
      }
    }, replaySpeed);
  }

  useEffect(() => {
    if (canvas.current === null) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
    });

    observer.observe(canvas.current);

    return () => {
      observer.disconnect();
    };
  }, [canvas]);

  useEffect(() => {
    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <canvas ref={canvas} />
      {controls && (
        <div className="flex justify-center gap-2 py-2">
          <Button disabled={running} onClick={startSimulation}>
            Replay
          </Button>
          <Button disabled={running} onClick={onReset}>
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}
