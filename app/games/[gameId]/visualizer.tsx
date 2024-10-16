import { Button } from "@/components/ui/button";
import { ZombieSurvival } from "@/simulators/zombie-survival";
import { useRef, useState } from "react";

const REPLAY_SPEED = 600;

export function Visualizer({ map }: { map: string[][] }) {
  const simulator = useRef<ZombieSurvival | null>(null);
  const interval = useRef<NodeJS.Timeout | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [mapState, setMapState] = useState(map);

  return (
    <div>
      {mapState.map((row, y) => (
        <div key={y} className="flex">
          {row.map((cell, x) => (
            <div
              key={x}
              className={`size-8 border flex items-center justify-center text-2xl bg-slate-950`}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
      <Button
        onClick={() => {
          const clonedMap = JSON.parse(JSON.stringify(map));
          simulator.current = new ZombieSurvival(clonedMap);
          setMapState(simulator.current!.getState());
          setIsRunning(true);
          interval.current = setInterval(() => {
            if (simulator.current!.finished()) {
              clearInterval(interval.current!);
              interval.current = null;
              setIsRunning(false);
              return;
            }
            simulator.current!.step();
            setMapState(simulator.current!.getState());
          }, REPLAY_SPEED);
        }}
        disabled={isRunning}
      >
        Play
      </Button>
    </div>
  );
}
