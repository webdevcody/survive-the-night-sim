import { useEffect, useRef } from "react";
import { useRenderer } from "./Renderer";
import { ZombieSurvival, type ZombieSurvivalOptions } from "@/simulator";
import { Action } from "@/simulator/Action";
import { replay } from "@/simulator/Replay";

export function ReplayVisualizer({
  actions,
  cellSize = 64,
  map,
  playerLabels,
  simulatorOptions,
}: {
  actions: Action[];
  cellSize?: number;
  map: string[][];
  playerLabels: Record<string, string>;
  simulatorOptions?: ZombieSurvivalOptions;
}) {
  const simulator = useRef(
    new ZombieSurvival(
      replay(new ZombieSurvival(map, simulatorOptions), actions).getState(),
      simulatorOptions,
    ),
  );

  const cachedActions = useRef(actions);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const renderer = useRenderer(map, canvas, playerLabels, cellSize);

  useEffect(() => {
    if (renderer !== null) {
      renderer.render(simulator.current.getAllEntities());
    }
  }, [renderer]);

  useEffect(() => {
    const newActions = actions.slice(cachedActions.current.length);
    simulator.current.resetVisualEvents();
    replay(simulator.current, newActions);
    cachedActions.current.push(...newActions);
    renderer?.render(simulator.current.getAllEntities());
  }, [actions]);

  return <canvas ref={canvas} />;
}
