"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useAction, Authenticated } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Visualizer } from "../../visualizer";
import { Map } from "@/app/map";
import Link from "next/link";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TestMode from "./test-mode";

export default function PlayLevelPage({
  params,
}: {
  params: { level: string };
}) {
  const level = parseInt(params.level, 10);
  const map = useQuery(api.maps.getMapByLevel, { level });
  const [playerMap, setPlayerMap] = useState<string[][]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [gameResult, setGameResult] = useState<"WON" | "LOST" | null>(null);
  const [placementMode, setPlacementMode] = useState<"player" | "block">(
    "player",
  );
  const [blockCount, setBlockCount] = useState(0);
  const flags = useQuery(api.flags.getFlags);
  const [mode, setMode] = useState<"play" | "test">("play");

  // Initialize playerMap when map data is available
  useEffect(() => {
    if (map) {
      setPlayerMap(map.grid.map((row) => [...row]));
    }
  }, [map]);

  const userResultMutation = useMutation(api.playerresults.updateUserResult);
  const user = useQuery(api.users.getUserOrNull);

  const tries = useQuery(api.playerresults.getPlayerRecordsForAMap, {
    mapId: map?._id,
  });

  if (!map) {
    return (
      <div className="container mx-auto min-h-screen flex flex-col items-center py-12 pb-24 gap-8">
        <div className="w-full flex justify-between items-center">
          <Button variant="outline" asChild className="flex gap-2 items-center">
            <Link href="/play" passHref>
              <ChevronLeftIcon /> Play Different Night
            </Link>
          </Button>
          {flags?.showTestPage && (
            <Tabs
              value={mode}
              onValueChange={(value) => setMode(value as "play" | "test")}
            >
              <TabsList>
                <TabsTrigger value="play">Play</TabsTrigger>
                <TabsTrigger value="test">Test AI</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
        <h1 className="text-3xl font-bold text-center">Night #{level}</h1>

        <p>Loading...</p>
      </div>
    );
  }

  const handleRetryClicked = () => {
    setIsSimulating(false);
    setGameResult(null);
    setBlockCount(0);
    setPlayerMap(map.grid.map((row) => [...row]));
  };

  const handleCellClick = (x: number, y: number) => {
    if (isSimulating) return;

    const newMap = [...playerMap];
    if (placementMode === "player") {
      // Remove existing player if any
      for (let i = 0; i < newMap.length; i++) {
        for (let j = 0; j < newMap[i].length; j++) {
          if (newMap[i][j] === "P") {
            newMap[i][j] = " ";
          }
        }
      }
      // Place new player
      if (newMap[y][x] === " ") {
        newMap[y][x] = "P";
      }
    } else if (placementMode === "block" && blockCount < 2) {
      // Place new block
      if (newMap[y][x] === " ") {
        newMap[y][x] = "B";
        setBlockCount(blockCount + 1);
      }
    }
    setPlayerMap(newMap);
  };

  const handlePlacementModeChange = async (mode: "player" | "block") => {
    setPlacementMode(mode);
  };

  const runSimulation = () => {
    if (!playerMap.some((row) => row.includes("P"))) {
      alert(
        "Please place a player (P) on the map before running the simulation.",
      );
      return;
    }
    setIsSimulating(true);
    setGameResult(null);
  };

  const handleSimulationEnd = async (isWin: boolean) => {
    setGameResult(isWin ? "WON" : "LOST");
    if (user && user._id) {
      await userResultMutation({
        mapId: map._id,
        hasWon: isWin,
        placedGrid: playerMap,
      });
    }
  };

  const handleClearMap = () => {
    setPlayerMap(map.grid.map((row) => [...row]));
    setBlockCount(0);
    setPlacementMode("player");
  };

  return (
    <div className="container mx-auto min-h-screen flex flex-col items-center py-12 pb-24 gap-8">
      <div className="w-full flex justify-between items-center">
        <Button variant="outline" asChild className="flex gap-2 items-center">
          <Link href="/play" passHref>
            <ChevronLeftIcon /> Play Different Night
          </Link>
        </Button>
        {flags?.showTestPage && (
          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as "play" | "test")}
          >
            <TabsList>
              <TabsTrigger value="play">Play</TabsTrigger>
              <TabsTrigger value="test">Test AI</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>
      <h1 className="text-3xl font-bold text-center">Night #{level}</h1>

      {mode === "play" ? (
        <>
          <div className="mb-4 flex justify-center gap-4">
            <Button
              onClick={() => handlePlacementModeChange("player")}
              disabled={playerMap.some((row) => row.includes("P"))}
              variant={placementMode === "player" ? "default" : "outline"}
              className="h-10"
            >
              Place Player
            </Button>
            <Button
              onClick={() => handlePlacementModeChange("block")}
              disabled={blockCount >= 2}
              variant={placementMode === "block" ? "default" : "outline"}
              className="h-10"
            >
              Place Block ({2 - blockCount} left)
            </Button>
          </div>
          <div className="mb-8 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">
              {isSimulating ? "Simulation Result" : "Place Your Player"}
            </h2>
            {isSimulating ? (
              <>
                <Visualizer
                  map={playerMap}
                  autoStart={true}
                  onSimulationEnd={handleSimulationEnd}
                />
                {gameResult && (
                  <div
                    className={`mt-4 text-2xl font-bold ${gameResult === "WON" ? "text-green-500" : "text-red-500"}`}
                  >
                    {gameResult === "WON" ? "You Survived!" : "You Died!"}
                  </div>
                )}
              </>
            ) : (
              <div className="relative">
                <Map map={playerMap} />
                <div
                  className="absolute inset-0 grid"
                  style={{
                    gridTemplateColumns: `repeat(${playerMap[0]?.length || 0}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${playerMap.length || 0}, minmax(0, 1fr))`,
                  }}
                >
                  {playerMap.map((row, y) =>
                    row.map((cell, x) => (
                      <div
                        key={`${x}-${y}`}
                        className={`
                          ${cell === " " ? "cursor-pointer hover:border-2 hover:border-dashed hover:border-slate-500" : ""}
                          border border-transparent
                        `}
                        onClick={() => cell === " " && handleCellClick(x, y)}
                      />
                    )),
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-center gap-4">
            {!isSimulating ? (
              <>
                <Button onClick={runSimulation} className="h-10">
                  Run Simulation
                </Button>
                <Button
                  onClick={handleClearMap}
                  variant="outline"
                  className="h-10"
                >
                  Clear Map
                </Button>
              </>
            ) : (
              <Button onClick={handleRetryClicked} className="h-10">
                Retry
              </Button>
            )}
          </div>

          <Authenticated>
            {tries && tries.attempts && tries.attempts.length > 0 && (
              <>
                <div className="font-semibold text-2xl mt-4">Tries</div>
                <div className="flex flex-wrap items-center justify-around w-full">
                  {tries.attempts.map((attempt) => (
                    <div
                      key={attempt?._id}
                      className="flex flex-col gap-y-2 items-center"
                    >
                      {attempt?.grid && <Map map={attempt.grid} />}
                      <div
                        className={`mt-4 text-xl font-semibold ${
                          attempt?.didWin ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {attempt?.didWin ? "You Survived!" : "You Died!"}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Authenticated>
        </>
      ) : (
        <TestMode level={level} map={map.grid} />
      )}
    </div>
  );
}
