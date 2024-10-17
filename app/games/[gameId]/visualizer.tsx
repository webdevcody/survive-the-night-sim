import { Button } from "@/components/ui/button";
import { ZombieSurvival } from "@/simulators/zombie-survival";
import { useEffect, useRef, useState } from "react";

const REPLAY_SPEED = 600;

export function Visualizer({
  map,
  autoStart = false,
  onSimulationEnd,
}: {
  map: string[][];
  autoStart?: boolean;
  onSimulationEnd?: (isWin: boolean) => void;
}) {
  const simulator = useRef<ZombieSurvival | null>(null);
  const interval = useRef<NodeJS.Timeout | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [mapState, setMapState] = useState(map);
  const [needsReset, setNeedsReset] = useState(false);

  const startSimulation = () => {
    setNeedsReset(true);
    const clonedMap = JSON.parse(JSON.stringify(map));
    simulator.current = new ZombieSurvival(clonedMap);
    setMapState(simulator.current!.getState());
    setIsRunning(true);
    interval.current = setInterval(() => {
      if (simulator.current!.finished()) {
        clearInterval(interval.current!);
        interval.current = null;
        setIsRunning(false);
        if (onSimulationEnd) {
          console.log("here");
          onSimulationEnd(!simulator.current!.getPlayer().dead());
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
    };
  }, []);

  return (
    <div>
      {mapState.map((row, y) => (
        <div key={y} className="flex ">
          {row.map((cell, x) => (
            <div
              key={x}
              className={`size-8 border flex items-center justify-center text-2xl`}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
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
    </div>
  );
}
