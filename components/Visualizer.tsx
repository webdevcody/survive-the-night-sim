import * as React from "react";
import { Button } from "@/components/ui/button";
import { Renderer } from "@/renderer";
import { ZombieSurvival } from "@/simulators/zombie-survival";

const AUTO_REPLAY_SPEED = 1_500;
const REPLAY_SPEED = 600;

export function Visualizer({
  autoReplay = false,
  autoStart = false,
  controls = true,
  cellSize = "64",
  map,
  onReset,
  onSimulationEnd,
}: {
  autoReplay?: boolean;
  autoStart?: boolean;
  controls?: boolean;
  cellSize?: string;
  map: string[][];
  onReset?: () => unknown;
  onSimulationEnd?: (isWin: boolean) => unknown;
}) {
  const simulator = React.useRef<ZombieSurvival>(new ZombieSurvival(map));
  const renderer = React.useRef<Renderer | null>(null);
  const interval = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvas = React.useRef<HTMLCanvasElement | null>(null);
  const visible = React.useRef(false);
  const [running, setRunning] = React.useState(false);

  React.useEffect(() => {
    if (canvas.current !== null) {
      renderer.current = new Renderer(
        ZombieSurvival.boardHeight(map),
        ZombieSurvival.boardWidth(map),
        canvas.current,
        Number.parseInt(cellSize, 10),
      );
    }
  }, [canvas]);

  React.useEffect(() => {
    if (autoStart) {
      startSimulation();
    }
  }, [autoStart]);

  function startSimulation() {
    simulator.current = new ZombieSurvival(map);
    renderer.current?.render(simulator.current);
    setRunning(true);

    interval.current = setInterval(() => {
      if (!visible.current) {
        return;
      }

      if (!simulator.current.finished()) {
        simulator.current.step();
        renderer.current?.render(simulator.current);
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
    }, REPLAY_SPEED);
  }

  React.useEffect(() => {
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

  React.useEffect(() => {
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
