"use client";

import React from "react";
import { CircleAlertIcon, EraserIcon } from "lucide-react";
import { useAction, useMutation, useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { CopyMapButton } from "@/components/CopyMapButton";
import { MapBuilder } from "@/components/MapBuilder";
import { MapStatus } from "@/components/MapStatus";
import { ModelSelector } from "@/components/ModelSelector";
import { Visualizer } from "@/components/Visualizer";
import { ZombieSurvival } from "@/simulators/zombie-survival";
import { api } from "@/convex/_generated/api";
import { errorMessage } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const STORAGE_MAP_KEY = "playground-map";

export default function PlaygroundPage() {
  const isAdmin = useQuery(api.users.isAdmin);
  const publishMap = useMutation(api.maps.publishMap);
  const testMap = useAction(api.maps.testMap);
  const { toast } = useToast();
  const [map, setMap] = React.useState<string[][]>([[" "]]);
  const [model, setModel] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [solution, setSolution] = React.useState<string[][] | null>(null);
  const [reasoning, setReasoning] = React.useState<string | null>(null);
  const [publishing, setPublishing] = React.useState(false);
  const [simulating, setSimulating] = React.useState(false);
  const [userPlaying, setUserPlaying] = React.useState(false);
  const [userSolution, setUserSolution] = React.useState<string[][]>([]);
  const [visualizingUserSolution, setVisualizingUserSolution] =
    React.useState(false);

  async function handlePublish() {
    if (!ZombieSurvival.mapHasZombies(map)) {
      alert("Add some zombies to the map first");
      return;
    }

    if (!confirm("Are you sure?")) {
      return;
    }

    setPublishing(true);

    try {
      await publishMap({ map });

      toast({
        description: "Map published successfully!",
      });
    } catch (error) {
      toast({
        description: errorMessage(error),
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  }

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
    window.localStorage.setItem(STORAGE_MAP_KEY, JSON.stringify(value));
  }

  function handleChangeModel(value: string) {
    setModel(value);
    setError(null);
  }

  function handleEdit() {
    setSolution(null);
    setReasoning(null);
    setUserPlaying(false);
    setVisualizingUserSolution(false);
  }

  function handleReset() {
    handleChangeMap([]);

    setSolution(null);
    setReasoning(null);
    setPublishing(false);
    setSimulating(false);
    setUserPlaying(false);
    setUserSolution([]);
    setVisualizingUserSolution(false);
  }

  function handleUserPlay() {
    if (!ZombieSurvival.mapHasZombies(map)) {
      alert("Add player to the map first");
      return;
    }

    setUserPlaying(true);
    setUserSolution(map);
  }

  function handleVisualize() {
    if (!ZombieSurvival.mapHasPlayer(userSolution)) {
      alert("Add player to the map first");
      return;
    }

    if (ZombieSurvival.mapHasMultiplePlayers(userSolution)) {
      alert("Map has multiple players");
      return;
    }

    setVisualizingUserSolution(true);
  }

  function handleStopVisualization() {
    setVisualizingUserSolution(false);
  }

  React.useEffect(() => {
    const maybeMap = window.localStorage.getItem(STORAGE_MAP_KEY);

    if (maybeMap !== null) {
      setMap(JSON.parse(maybeMap));
    }
  }, []);

  const visualizing = solution !== null || visualizingUserSolution;

  return (
    <div className="container mx-auto min-h-screen flex flex-col items-center py-12 gap-8">
      <h1 className="text-4xl font-bold">Playground</h1>

      <div className="flex w-full gap-8">
        <div className="flex flex-col gap-2 grow w-full">
          <div className="flex justify-between">
            <div className="flex flex-col gap-0">
              <div className="flex gap-2">
                <p>
                  Map ({ZombieSurvival.boardWidth(map)}x
                  {ZombieSurvival.boardHeight(map)})
                </p>
                <CopyMapButton map={map} />
                <button
                  className="hover:scale-125 transition"
                  onClick={handleReset}
                >
                  <EraserIcon size={16} />
                </button>
              </div>
              <p className="text-xs">* Click on a cell to place entity</p>
            </div>
            {isAdmin && (
              <Button
                className="gap-1"
                disabled={publishing}
                onClick={handlePublish}
                type="button"
                variant="destructive"
              >
                <CircleAlertIcon size={16} />
                <span>{publishing ? "Publishing..." : "Publish Map"}</span>
              </Button>
            )}
          </div>
          <div
            className={`flex justify-center ${visualizing ? "pt-[28px]" : ""}`}
          >
            {visualizing && (
              <Visualizer
                autoReplay
                autoStart
                controls={false}
                map={visualizingUserSolution ? userSolution : solution!}
              />
            )}
            {!visualizing && (
              <MapBuilder
                disabled={simulating}
                onChange={userPlaying ? setUserSolution : handleChangeMap}
                play={userPlaying}
                value={userPlaying ? userSolution : map}
              />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4 shrink-0 w-[400px]">
          <div className="flex flex-col gap-2 w-fit">
            {isAdmin && (
              <>
                <p>Model (~$0.002)</p>
                <ModelSelector onChange={handleChangeModel} value={model} />
                {!userPlaying && solution === null && (
                  <Button
                    className="w-full"
                    disabled={model === "" || simulating}
                    onClick={handleSimulate}
                    type="button"
                  >
                    {simulating ? "Simulating..." : "Play With AI"}
                  </Button>
                )}
              </>
            )}
            {(solution !== null || userPlaying) && (
              <Button
                className="w-full"
                disabled={model === "" || simulating}
                onClick={handleEdit}
                type="button"
              >
                {simulating ? "Simulating..." : "Edit"}
              </Button>
            )}
            {solution === null && !simulating && !userPlaying && (
              <Button className="w-full" onClick={handleUserPlay} type="button">
                Play Yourself
              </Button>
            )}
            {userPlaying && (
              <Button
                className="w-full"
                onClick={
                  visualizingUserSolution
                    ? handleStopVisualization
                    : handleVisualize
                }
                type="button"
              >
                {visualizingUserSolution ? "Stop" : "Visualize"}
              </Button>
            )}
          </div>
          {error !== null && <p className="text-sm text-red-500">{error}</p>}
          {visualizingUserSolution && <MapStatus map={userSolution} />}
          {reasoning !== null && (
            <div className="flex flex-col gap-0">
              <MapStatus map={solution!} />
              <p className="text-sm">{reasoning}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
