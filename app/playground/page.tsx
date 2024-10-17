"use client";

import React from "react";
import { useAction } from "convex/react";
import { Button } from "@/components/ui/button";
import { CopyMapButton } from "@/components/CopyMapButton";
import { MapBuilder } from "@/components/MapBuilder";
import { ModelSelector } from "@/components/ModelSelector";
import { Visualizer } from "@/components/Visualizer";
import { ZombieSurvival } from "@/simulators/zombie-survival";
import { api } from "@/convex/_generated/api";

export default function PlaygroundPage() {
  const testMap = useAction(api.maps.testMap);
  const [map, setMap] = React.useState<string[][]>([]);
  const [model, setModel] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [solution, setSolution] = React.useState<string[][] | null>(null);
  const [reasoning, setReasoning] = React.useState<string | null>(null);
  const [simulating, setSimulating] = React.useState(false);

  async function handleSimulate() {
    setError(null);
    setSolution(null);
    setReasoning(null);

    if (!ZombieSurvival.mapHasZombies(map)) {
      alert("Add some zombies to the map first");
      return;
    }

    setSimulating(true);

    const { error, solution, reasoning } = await testMap({
      modelId: model,
      map: map,
    });

    if (typeof error !== "undefined") {
      setError(error);
    } else {
      setSolution(solution!);
      setReasoning(reasoning!);
    }

    setSimulating(false);
  }

  function handleChangeMap(value: string[][]) {
    setMap(value);
    setError(null);
  }

  function handleChangeModel(value: string) {
    setModel(value);
    setError(null);
  }

  function handleEdit() {
    setSolution(null);
    setReasoning(null);
  }

  return (
    <div className="container mx-auto min-h-screen flex flex-col items-center py-12 gap-8">
      <h1 className="text-4xl font-bold mb-8">Playground</h1>

      <div>
        <div className="flex gap-8">
          {solution !== null && (
            <div className="flex flex-col">
              <Visualizer
                autoReplay
                autoStart
                controls={false}
                map={solution}
              />
            </div>
          )}
          {solution === null && (
            <div className="flex flex-col gap-2 min-w-[700px]">
              <div className="flex flex-col gap-0">
                <p>
                  Map ({map.length}x{map[0]?.length ?? 0})
                </p>
                <p className="text-xs">* Click on a cell to see magic</p>
              </div>
              <div className="flex justify-center">
                <MapBuilder
                  disabled={simulating}
                  onChange={handleChangeMap}
                  value={map}
                />
              </div>
            </div>
          )}
          <div className="flex flex-col gap-4 max-w-[400px]">
            <div className="flex flex-col gap-2 w-fit">
              <p>Model (~$0.002)</p>
              <ModelSelector onChange={handleChangeModel} value={model} />
              <Button
                disabled={model === "" || simulating}
                onClick={solution === null ? handleSimulate : handleEdit}
                type="button"
                className="w-full"
              >
                {simulating
                  ? "Simulating..."
                  : solution === null
                    ? "Play"
                    : "Edit"}
              </Button>
              <CopyMapButton map={map} />
            </div>
            {error !== null && <p className="text-sm text-red-500">{error}</p>}
            {reasoning !== null && <p className="text-sm">{reasoning}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
