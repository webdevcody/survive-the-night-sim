import { Button } from "@/components/ui/button";
import { ZombieSurvival } from "@/simulators/zombie-survival";
import { useEffect, useRef, useState } from "react";

const AUTO_REPLAY_SPEED = 1_500;
const REPLAY_SPEED = 600;

export function Visualizer({
  autoReplay = false,
  autoStart = false,
  controls = true,
  cellSize = "64",
  map,
  onSimulationEnd,
}: {
  autoReplay?: boolean;
  autoStart?: boolean;
  controls?: boolean;
  cellSize?: string;
  map: string[][];
  onSimulationEnd?: (isWin: boolean) => Promise<void>;
}) {
  const simulator = useRef<ZombieSurvival | null>(null);
  const interval = useRef<NodeJS.Timeout | null>(null);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [mapState, setMapState] = useState(map);
  const [needsReset, setNeedsReset] = useState(false);

  const startSimulation = () => {
    setNeedsReset(true);
    const clonedMap = JSON.parse(JSON.stringify(map));
    simulator.current = new ZombieSurvival(clonedMap);
    setMapState(simulator.current!.getState());
    setIsRunning(true);

    interval.current = setInterval(async () => {
      if (simulator.current!.finished()) {
        clearInterval(interval.current!);
        interval.current = null;

        if (autoReplay) {
          timeout.current = setTimeout(() => {
            timeout.current = null;
            startSimulation();
          }, AUTO_REPLAY_SPEED);

          return;
        }

        setIsRunning(false);

        if (onSimulationEnd) {
          await onSimulationEnd(!simulator.current!.getPlayer().dead());
        }

        return;
      }

      simulator.current!.step();
      setMapState(simulator.current!.getState());
    }, REPLAY_SPEED);
  };

  useEffect(() => {
    if (autoStart) {
      startSimulation();
    }
  }, [autoStart]);

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
    <div>
      {mapState.map((row, y) => (
        <div key={y} className="flex">
          {row.map((cell, x) => (
            <div
              key={x}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                fontSize: `${parseInt(cellSize) / 2}px`,
              }}
              className={`border flex items-center justify-center dark:bg-black bg-slate-50`}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
      {controls && (
        <div className="flex gap-2 justify-center py-2">
          <Button onClick={startSimulation} disabled={isRunning}>
            Replay
          </Button>
          <Button
            disabled={isRunning}
            onClick={() => {
              simulator.current = new ZombieSurvival(map);
              setMapState(simulator.current!.getState());
              setIsRunning(false);
              setNeedsReset(false);
            }}
          >
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}
