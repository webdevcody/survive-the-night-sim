"use client";

import { useEffect, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  UploadIcon,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAITesting } from "@/components/AITesting";
import { Map } from "@/components/Map";
import { MapStatus } from "@/components/MapStatus";
import { ModelSelector } from "@/components/ModelSelector";
import { Page, PageTitle } from "@/components/Page";
import { Visualizer } from "@/components/Visualizer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { SIGN_IN_ERROR_MESSAGE } from "@/convex/users";
import { errorMessage } from "@/lib/utils";
import { ZombieSurvival } from "@/simulator";

const STORAGE_MAP_KEY = "playground-map";
const STORAGE_MODEL_KEY = "playground-model";

export default function PlaygroundPage() {
  const isAdmin = useQuery(api.users.isAdmin);
  const submitMap = useMutation(api.maps.submitMap);
  const searchParams = useSearchParams();
  const mapId = searchParams.get("map") as Id<"maps"> | null;
  const adminMapMaybe = useQuery(
    api.maps.adminGetMapById,
    !isAdmin || mapId === null ? "skip" : { mapId },
  );
  const adminMap = adminMapMaybe ?? null;
  const { toast } = useToast();
  const [map, setMap] = useState<string[][]>([
    [" ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " "],
  ]);
  const [model, setModel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [userPlaying, setUserPlaying] = useState(false);
  const [userSolution, setUserSolution] = useState<string[][]>([]);
  const [visualizingUserSolution, setVisualizingUserSolution] = useState(false);
  const [openSignInModal, setOpenSignInModal] = useState(false);
  const [blocks, setBlocks] = useState(2);
  const [landmines, setLandmines] = useState(2);

  const {
    isSimulating,
    gameResult: solution,
    aiError,
    aiReasoning,
    aiPromptTokensUsed,
    aiOutputTokensUsed,
    aiTotalTokensUsed,
    aiTotalRunCost,
    resultMap,
    runTest,
    resetAITest,
  } = useAITesting({ testingType: "MAP" });

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
      const submitted = await submitMap({ map, blocks, landmines });

      if (submitted == 200) {
        toast({
          description: "Map submitted successfully!",
        });
      } else if (submitted == 429) {
        toast({
          description:
            "You have exceeded the rate limit for submitting maps. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      if (errorMessage(error).includes(SIGN_IN_ERROR_MESSAGE)) {
        setOpenSignInModal(true);
      } else {
        toast({
          description: errorMessage(error),
          variant: "destructive",
        });
      }
    } finally {
      setPublishing(false);
    }
  }

  async function handleSimulate() {
    if (!ZombieSurvival.mapHasZombies(map)) {
      alert("Add some zombies to the map first");
      return;
    }

    await runTest(model, map);
  }

  function handleChangeMap(value: string[][]) {
    setMap(value);
    setError(null);
    if (adminMap === null) {
      window.localStorage.setItem(STORAGE_MAP_KEY, JSON.stringify(value));
    }
  }

  function handleChangeModel(value: string) {
    setModel(value);
    setError(null);
    window.localStorage.setItem(STORAGE_MODEL_KEY, value);
  }

  function handleEdit() {
    resetAITest();
    setUserPlaying(false);
    setVisualizingUserSolution(false);

    // Remove players and blocks from the map
    const cleanedMap = map.map((row) =>
      row.map((cell) =>
        cell === "P" || cell === "B" || cell === "L" ? " " : cell,
      ),
    );

    setMap(cleanedMap);
    window.localStorage.setItem(STORAGE_MAP_KEY, JSON.stringify(cleanedMap));
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

  function handleIncreaseUp() {
    setMap([[...map[0].map(() => " ")], ...map.map((row) => [...row])]);
  }

  function handleDecreaseUp() {
    if (map.length > 1) {
      setMap([...map.slice(1).map((row) => [...row])]);
    }
  }

  function handleIncreaseLeft() {
    setMap(map.map((row) => [" ", ...row]));
  }

  function handleDecreaseLeft() {
    if (map[0].length > 1) {
      setMap(map.map((row) => [...row.slice(1)]));
    }
  }

  function handleIncreaseDown() {
    setMap([...map.map((row) => [...row]), [...map[0].map(() => " ")]]);
  }

  function handleDecreaseDown() {
    if (map.length > 1) {
      setMap([...map.slice(0, -1).map((row) => [...row])]);
    }
  }

  function handleIncreaseRight() {
    setMap(map.map((row) => [...row, " "]));
  }

  function handleDecreaseRight() {
    if (map[0].length > 1) {
      setMap(map.map((row) => [...row.slice(0, -1)]));
    }
  }

  // function handleresetAITest() {
  //   handleChangeMap([]);
  //   setSolution(null);
  //   setReasoning(null);
  //   setPublishing(false);
  //   setSimulating(false);
  //   setUserPlaying(false);
  //   setUserSolution([]);
  //   setVisualizingUserSolution(false);
  // }

  useEffect(() => {
    const maybeMap = window.localStorage.getItem(STORAGE_MAP_KEY);
    const maybeModel = window.localStorage.getItem(STORAGE_MODEL_KEY);

    if (maybeMap !== null) {
      setMap(JSON.parse(maybeMap));
    }
    if (maybeModel !== null) {
      setModel(maybeModel);
    }
  }, []);

  useEffect(() => {
    if (adminMap !== null) {
      setMap(adminMap.grid);
    }
  }, [adminMap]);

  const visualizing = solution !== null || visualizingUserSolution;

  return (
    <>
      <Dialog
        open={openSignInModal}
        onOpenChange={(open) => setOpenSignInModal(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>For this action you need to be signed in!</DialogTitle>
            <DialogDescription>
              In order to submit a map you need to be signed in.
            </DialogDescription>
            <div className="flex w-full justify-center">
              <Link href="/auth">
                <Button variant="outline" type="button">
                  Sign In
                </Button>
              </Link>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Page>
        <PageTitle>Playground</PageTitle>

        <div className="flex gap-8">
          {/* Left side: Grid */}
          <div className="flex-1">
            <Card className="p-8">
              {!visualizing && !userPlaying && (
                <p className="mb-12 text-sm">
                  Click on the board to place or remove units. Use the buttons
                  below to switch between unit types.
                </p>
              )}
              {!visualizing && userPlaying && (
                <p className="mb-6 text-sm text-gray-600">
                  Place a player (P) and blocks (B) on the board to create your
                  escape route. Click to toggle between empty, player, and
                  block.
                </p>
              )}
              <div
                className={`flex justify-center ${visualizing ? "pt-[28px]" : ""} relative`}
              >
                {visualizing && (
                  <Visualizer
                    autoReplay
                    autoStart
                    controls={false}
                    map={visualizingUserSolution ? userSolution : resultMap}
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
                            className="z-10 cursor-pointer border border-transparent hover:border-2 hover:border-dashed hover:border-slate-300"
                            onClick={() => {
                              const newMap = userPlaying
                                ? [...userSolution]
                                : [...map];

                              if (userPlaying) {
                                const playerCount = newMap
                                  .flat()
                                  .filter((c) => c === "P").length;
                                const blockCount = newMap
                                  .flat()
                                  .filter((c) => c === "B").length;
                                const landmineCount = newMap
                                  .flat()
                                  .filter((c) => c === "L").length;

                                if (cell === " ") {
                                  if (playerCount === 0) {
                                    newMap[y][x] = "P";
                                  } else if (blockCount < 2) {
                                    newMap[y][x] = "B";
                                  } else if (landmineCount === 0) {
                                    newMap[y][x] = "L";
                                  }
                                } else if (cell === "P") {
                                  newMap[y][x] = " ";
                                } else if (cell === "B") {
                                  newMap[y][x] = " ";
                                } else if (cell === "L") {
                                  newMap[y][x] = " ";
                                }

                                userPlaying
                                  ? setUserSolution(newMap)
                                  : handleChangeMap(newMap);
                              } else {
                                if (cell === " ") {
                                  newMap[y][x] = "Z";
                                } else if (cell === "Z") {
                                  newMap[y][x] = "R";
                                } else {
                                  newMap[y][x] = " ";
                                }
                              }

                              userPlaying
                                ? setUserSolution(newMap)
                                : handleChangeMap(newMap);
                            }}
                          />
                        )),
                      )}
                    </div>

                    {/* Grid expansion controls */}
                    {!userPlaying && !visualizing && (
                      <>
                        <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-full gap-4">
                          <button
                            onClick={handleIncreaseUp}
                            aria-label="One more row on top"
                          >
                            <ChevronUp />
                          </button>
                          <button
                            onClick={handleDecreaseUp}
                            aria-label="One less row on top"
                          >
                            <ChevronDown />
                          </button>
                        </div>
                        <div className="absolute left-0 top-1/2 flex -translate-x-full -translate-y-1/2 flex-col gap-4">
                          <button
                            onClick={handleIncreaseLeft}
                            aria-label="One more column on left side"
                          >
                            <ChevronLeft />
                          </button>
                          <button
                            onClick={handleDecreaseLeft}
                            aria-label="One less column on left side"
                          >
                            <ChevronRight />
                          </button>
                        </div>
                        <div className="absolute right-0 top-1/2 flex -translate-y-1/2 translate-x-full flex-col gap-4">
                          <button
                            onClick={handleIncreaseRight}
                            aria-label="One more column on right side"
                          >
                            <ChevronRight />
                          </button>
                          <button
                            onClick={handleDecreaseRight}
                            aria-label="One less column on right side"
                          >
                            <ChevronLeft />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 translate-y-full gap-4">
                          <button
                            onClick={handleIncreaseDown}
                            aria-label="One more row on bottom"
                          >
                            <ChevronDown />
                          </button>
                          <button
                            onClick={handleDecreaseDown}
                            aria-label="One less row on bottom"
                          >
                            <ChevronUp />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right side: Action Panel */}
          <Card className="w-[400px] p-8">
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
                  <div className="flex gap-2">
                    <div>
                      <Label htmlFor="block">Max Block</Label>
                      <Input
                        placeholder="Max Blocks"
                        type="number"
                        id="block"
                        onChange={(e) => setBlocks(Number(e.target.value))}
                        value={blocks}
                      />
                    </div>
                    <div>
                      <Label htmlFor="landmine">Max Landmine</Label>
                      <Input
                        placeholder="Max Landmines"
                        type="number"
                        id="landmine"
                        onChange={(e) => setLandmines(Number(e.target.value))}
                        value={landmines}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <Button
                      disabled={publishing}
                      onClick={handlePublish}
                      type="button"
                      variant="secondary"
                    >
                      <UploadIcon size={16} />
                      <span>{publishing ? "Submitting..." : "Submit Map"}</span>
                    </Button>
                    <p className="flex justify-end pt-2 text-xs text-gray-600">
                      *You can only submit 3 maps per minute
                    </p>
                  </div>
                  <Button
                    disabled={
                      !(solution === null && !isSimulating && !userPlaying)
                    }
                    onClick={handleUserPlay}
                    type="button"
                  >
                    Play Map
                  </Button>
                </>
              )}

              {error !== null && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              {visualizingUserSolution && <MapStatus map={userSolution} />}
              {aiReasoning !== null && (
                <div className="flex flex-col gap-2">
                  <MapStatus map={resultMap} />
                  <p className="text-sm">{aiReasoning}</p>

                  <div className="mt-2 space-y-1 text-xs text-gray-500">
                    <p>
                      Prompt Tokens:{" "}
                      {aiPromptTokensUsed?.toLocaleString() ?? "N/A"}
                    </p>

                    <p>
                      Output Tokens:{" "}
                      {aiOutputTokensUsed?.toLocaleString() ?? "N/A"}
                    </p>
                    <p>
                      Total Tokens:{" "}
                      {aiTotalTokensUsed?.toLocaleString() ?? "N/A"}
                    </p>
                    <p>
                      Total Cost:{" "}
                      {aiTotalRunCost ? `$${aiTotalRunCost.toFixed(6)}` : "N/A"}
                    </p>
                  </div>
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
                      disabled={model === "" || isSimulating}
                      onClick={handleSimulate}
                      type="button"
                    >
                      {isSimulating ? "Simulating..." : "Play With AI"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </Page>
    </>
  );
}
