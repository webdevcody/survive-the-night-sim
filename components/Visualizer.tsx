import React from "react";
import { Button } from "@/components/ui/button";
import { EntityType, ZombieSurvival } from "@/simulators/zombie-survival";
import { getCellImage } from "@/components/Map";

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
  onSimulationEnd?: (isWin: boolean) => unknown;
}) {
  const simulator = React.useRef<ZombieSurvival>(new ZombieSurvival(map));
  const interval = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [running, setRunning] = React.useState(false);
  const [startedAt, setStartedAt] = React.useState(Date.now());
  const [, setRenderedAt] = React.useState(Date.now());

  function stepSimulation() {
    if (simulator.current === null) {
      return;
    }

    if (!simulator.current.finished()) {
      simulator.current.step();
      setRenderedAt(Date.now());
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
  }

  function startSimulation() {
    simulator.current = new ZombieSurvival(map);
    setStartedAt(Date.now());
    setRunning(true);
    interval.current = setInterval(stepSimulation, REPLAY_SPEED);
  }

  React.useEffect(() => {
    if (autoStart) {
      startSimulation();
    }
  }, [autoStart]);

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

  const entities = simulator.current.getAllEntities() ?? [];
  const cellSizeNum = Number.parseInt(cellSize, 10);

  return (
    <>
      <div
        className="relative"
        ref={ref}
        style={{
          backgroundImage: "url(/map_tiles.svg)",
          backgroundSize: "128px",
          backgroundPosition: "bottom left",
        }}
      >
        <div
          className="relative z-10"
          style={{
            height: `${ZombieSurvival.boardHeight(map) * cellSizeNum}px`,
            width: `${ZombieSurvival.boardWidth(map) * cellSizeNum}px`,
          }}
        >
          {entities.map((entity, idx) => (
            <div
              className="flex items-center justify-center absolute transition-all"
              key={`${startedAt}.${entity.toConfig()}.${idx}`}
              style={{
                fontSize: `${parseInt(cellSize) / 2}px`,
                height: `${cellSize}px`,
                left: `${entity.getPosition().x * cellSizeNum}px`,
                opacity:
                  entity.getType() === EntityType.Zombie &&
                  entity.getHealth() === 1
                    ? 0.5
                    : entity.getHealth() === 0
                      ? 0
                      : 1,
                top: `${entity.getPosition().y * cellSizeNum}px`,
                width: `${cellSize}px`,
              }}
            >
              {getCellImage(entity.toConfig())}
            </div>
          ))}
        </div>
      </div>
      <div>
        {controls && (
          <div className="flex gap-2 justify-center py-2">
            <Button onClick={startSimulation} disabled={running}>
              Replay
            </Button>
            <Button
              disabled={running}
              onClick={() => {
                simulator.current = new ZombieSurvival(map);
                setRunning(false);
              }}
            >
              Reset
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
