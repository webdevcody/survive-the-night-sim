"use client";

import * as React from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { CircleAlertIcon, EraserIcon, SendIcon, UploadIcon, ChevronLeft } from "lucide-react";
import { CopyMapButton } from "@/components/CopyMapButton";
import { MapBuilder } from "@/components/MapBuilder";
import { MapStatus } from "@/components/MapStatus";
import { ModelSelector } from "@/components/ModelSelector";
import { Visualizer } from "@/components/Visualizer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/convex/_generated/api";
import { errorMessage } from "@/lib/utils";
import { ZombieSurvival } from "@/simulators/zombie-survival";
import { Card } from "@/components/ui/card";
import { Map } from "@/components/Map";

const STORAGE_MAP_KEY = "playground-map";

export default function PlaygroundPage() {
  const isAdmin = useQuery(api.users.isAdmin);
  const submitMap = useMutation(api.maps.submitMap);
  const testMap = useAction(api.maps.testMap);
  const { toast } = useToast();
  const [map, setMap] = React.useState<string[][]>([
    [" ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " "],
  ]);
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
      await submitMap({ map });

      toast({
        description: "Map submitted successfully!",
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
    
    // Remove players and blocks from the map
    const cleanedMap = map.map(row => 
      row.map(cell => (cell === "P" || cell === "B") ? " " : cell)
    );
    setMap(cleanedMap);
    window.localStorage.setItem(STORAGE_MAP_KEY, JSON.stringify(cleanedMap));
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
    <div className="container mx-auto min-h-screen py-12 pb-24">
      <h1 className="mb-6 text-center text-3xl font-bold">Playground</h1>

      <div className="flex gap-8">
        {/* Left side: Grid */}
        <div className="flex-1">
          <Card className="p-4">
            {!visualizing && !userPlaying && (
              <p className="mb-2 text-sm text-gray-600">
                Click on the board to place or remove units. Use the buttons below to switch between unit types.
              </p>
            )}
            {!visualizing && userPlaying && (
              <p className="mb-2 text-sm text-gray-600">
                Place a player (P) and blocks (B) on the board to create your escape route. Click to toggle between empty, player, and block.
              </p>
            )}
            <div className={`flex justify-center ${visualizing ? "pt-[28px]" : ""}`}>
              {visualizing && (
                <Visualizer
                  autoReplay
                  autoStart
                  controls={false}
                  map={visualizingUserSolution ? userSolution : solution!}
                />
              )}
              {!visualizing && (
                <div className="relative">
                  <Map map={userPlaying ? userSolution : map} />
                  <div
                    className="absolute inset-0 grid"
                    style={{
                      gridTemplateColumns: `repeat(${map[0]?.length || 0}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${map.length || 0}, minmax(0, 1fr))`,
                    }}
                  >
                    {(userPlaying ? userSolution : map).map((row, y) =>
                      row.map((cell, x) => (
                        <div
                          key={`${x}-${y}`}
                          className={`${
                            cell === " " || cell === "Z" || cell === "R" || cell === "P" || cell === "B"
                              ? "z-10 cursor-pointer hover:border-2 hover:border-dashed hover:border-slate-300 "
                              : ""
                          } border border-transparent`}
                          onClick={() => {
                            const newMap = userPlaying
                              ? [...userSolution]
                              : [...map];
                            if (userPlaying) {
                              // Count existing players and blocks
                              const playerCount = newMap.flat().filter(c => c === "P").length;
                              const blockCount = newMap.flat().filter(c => c === "B").length;

                              // Toggle logic for play mode
                              if (cell === " ") {
                                if (playerCount === 0) {
                                  newMap[y][x] = "P";
                                } else if (blockCount < 2) {
                                  newMap[y][x] = "B";
                                }
                              } else if (cell === "P") {
                                newMap[y][x] = " ";
                              } else if (cell === "B") {
                                newMap[y][x] = " ";
                              }
                              userPlaying
                                ? setUserSolution(newMap)
                                : handleChangeMap(newMap);
                            } else {
                              // Toggle between empty, zombie, and rock for edit mode
                              if (cell === " ") newMap[y][x] = "Z";
                              else if (cell === "Z") newMap[y][x] = "R";
                              else newMap[y][x] = " ";
                            }
                            userPlaying
                              ? setUserSolution(newMap)
                              : handleChangeMap(newMap);
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right side: Action Panel */}
        <Card className="w-[400px] p-4">
          <div className="flex flex-col gap-4">
            {userPlaying || solution !== null ? (
              <>
                <Button
                  variant="link"
                  className="self-start p-0 text-sm"
                  onClick={handleEdit}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back to Edit
                </Button>
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
                    {visualizingUserSolution ? "Stop" : "Run Simulation"}
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  className="gap-1"
                  disabled={publishing}
                  onClick={handlePublish}
                  type="button"
                  variant="secondary"
                >
                  <UploadIcon size={16} />
                  <span>{publishing ? "Submitting..." : "Submit Map"}</span>
                </Button>

                <Button
                  disabled={!(solution === null && !simulating && !userPlaying)}
                  onClick={handleUserPlay}
                  type="button"
                >
                  Play Map
                </Button>
              </>
            )}

            {error !== null && <p className="text-sm text-red-500">{error}</p>}
            {visualizingUserSolution && <MapStatus map={userSolution} />}
            {reasoning !== null && (
              <div className="flex flex-col gap-0">
                <MapStatus map={solution!} />
                <p className="text-sm">{reasoning}</p>
              </div>
            )}

            {isAdmin && !userPlaying && solution === null && (
              <>
                <hr className="my-4 border-gray-200" />
                <div className="flex flex-col gap-4">
                  <p>Model (~$0.002)</p>
                  <ModelSelector onChange={handleChangeModel} value={model} />
                  <Button
                    className="w-full"
                    disabled={model === "" || simulating}
                    onClick={handleSimulate}
                    type="button"
                  >
                    {simulating ? "Simulating..." : "Play With AI"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
