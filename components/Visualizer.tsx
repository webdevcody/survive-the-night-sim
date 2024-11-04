import { useEffect, useRef, useState } from "react";
import { useRenderer } from "./Renderer";
import { Button } from "@/components/ui/button";
import {
  AUTO_REPLAY_SPEED,
  DEFAULT_REPLAY_SPEED,
} from "@/constants/visualizer";
import { ZombieSurvival } from "@/simulator";

export function Visualizer({
  autoReplay = false,
  autoStart = false,
  controls = true,
  cellSize = 64,
  map,
  onReset,
  onSimulationEnd,
  replaySpeed = DEFAULT_REPLAY_SPEED,
}: {
  autoReplay?: boolean;
  autoStart?: boolean;
  controls?: boolean;
  cellSize?: number;
  map: string[][];
  onReset?: () => unknown;
  onSimulationEnd?: (isWin: boolean) => unknown;
  replaySpeed?: number;
}) {
  const simulator = useRef<ZombieSurvival>(new ZombieSurvival(map));
  const interval = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const renderer = useRenderer(map, canvas, cellSize, replaySpeed);
  const visible = useRef(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (autoStart && renderer !== null) {
      startSimulation();
    }
  }, [autoStart, renderer]);

  useEffect(() => {
    if (renderer !== null) {
      simulator.current = new ZombieSurvival(map);
      renderer?.render(simulator.current.getAllEntities());
    }
  }, [renderer]);

  function startSimulation() {
    setRunning(true);

    interval.current = setInterval(() => {
      if (!visible.current) {
        return;
      }

      if (!simulator.current.finished()) {
        simulator.current.step();
        renderer?.render(simulator.current.getAllEntities());
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
        onSimulationEnd(!simulator.current.getPlayer().dead());
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
