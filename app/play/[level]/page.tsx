"use client";

import { useEffect, useState } from "react";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { Authenticated, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TestMode from "./test-mode";
import { Map } from "@/components/Map";
import { Visualizer } from "@/components/Visualizer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { ZombieSurvival } from "@/simulators/zombie-survival";

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

  const lastLevel = useQuery(api.maps.lastLevel);
  const router = useRouter();

  if (!map) {
    return (
      <div className="container mx-auto flex min-h-screen flex-col items-center gap-8 py-12 pb-24">
        <div className="flex w-full items-center justify-between">
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link href="/play" passHref>
              <ChevronLeftIcon /> Play Different Night
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link href="/rules" passHref>
              Rules
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
        <h1 className="mb-6 text-center text-3xl font-bold">Night #{level}</h1>

        <p>Loading...</p>
      </div>
    );
  }

  const handleRetryClicked = () => {
    setIsSimulating(false);
    setGameResult(null);
    setBlockCount(0);
    setPlayerMap(map.grid.map((row) => [...row]));
    setPlacementMode("player");
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
    } else if (placementMode === "block") {
      // Place new block
      if (newMap[y][x] === "B") {
        newMap[y][x] = " ";
        setBlockCount(blockCount - 1);
      } else if (blockCount < 2) {
        if (newMap[y][x] === " ") {
          newMap[y][x] = "B";
          setBlockCount(blockCount + 1);
        }
      }
    }
    setPlayerMap(newMap);
  };

  const handlePlacementModeChange = async (mode: "player" | "block") => {
    setPlacementMode(mode);
  };

  const runSimulation = () => {
    if (!ZombieSurvival.mapHasPlayer(playerMap)) {
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

  const handleReset = () => {
    setIsSimulating(false);
    setGameResult(null);
  };

  const handleClearMap = () => {
    setPlayerMap(map.grid.map((row) => [...row]));
    setBlockCount(0);
    setPlacementMode("player");
  };

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center gap-8 py-12 pb-24">
      <div className="flex w-full items-center justify-between">
        <Button variant="outline" asChild className="flex items-center gap-2">
          <Link href="/play" passHref>
            <ChevronLeftIcon /> Play Different Night
          </Link>
        </Button>
        <Button variant="outline" asChild className="flex items-center gap-2">
          <Link href="/rules" passHref>
            Rules
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
      <h1 className="text-center text-3xl font-bold">Night #{level}</h1>

      {mode === "play" ? (
        <>
          <div className="mb-4 flex justify-center gap-4">
            <Button
              onClick={() => handlePlacementModeChange("player")}
              variant={placementMode === "player" ? "default" : "outline"}
              className="h-10"
            >
              Place Player
            </Button>
            <Button
              onClick={() => handlePlacementModeChange("block")}
              variant={placementMode === "block" ? "default" : "outline"}
              className="h-10"
            >
              Place Block ({2 - blockCount} left)
            </Button>
          </div>
          <div className="mb-8 flex flex-col items-center">
            <h2 className="mb-4 text-xl font-semibold">
              {isSimulating ? "Simulation Result" : "Place Your Player"}
            </h2>
            {isSimulating ? (
              <>
                <Visualizer
                  map={playerMap}
                  autoStart={true}
                  onReset={handleReset}
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
                        className={` ${cell === " " || cell === "B" ? "z-10 cursor-pointer hover:border-2 hover:border-dashed hover:border-slate-300" : ""} border border-transparent`}
                        onClick={() => handleCellClick(x, y)}
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
              <div className="flex items-center gap-x-3">
                <Button onClick={handleRetryClicked} className="h-10">
                  Retry
                </Button>
                {gameResult && gameResult === "WON" ? (
                  <Button
                    onClick={() => {
                      if (lastLevel && level + 1 <= lastLevel) {
                        router.push(`/play/${level + 1}`);
                      } else {
                        router.push("/play");
                      }
                    }}
                    className="h-10"
                  >
                    {lastLevel && level + 1 <= lastLevel
                      ? "Next Night"
                      : "Back to Night Selection"}
                  </Button>
                ) : null}
              </div>
            )}
          </div>

          <Authenticated>
            {tries && tries.attempts && tries.attempts.length > 0 && (
              <>
                <div className="mt-4 text-2xl font-semibold">Tries</div>
                <div className="flex w-full flex-wrap items-center justify-around gap-2">
                  {tries.attempts.map((attempt, idx) => (
                    <Button
                      asChild
                      className={
                        attempt?.didWin ? "border-green-500" : "border-red-500"
                      }
                      key={attempt?._id}
                      variant="outline"
                    >
                      <Link
                        key={attempt?._id}
                        className="flex flex-col items-center gap-y-2"
                        href={`/play/${level}/${idx + 1}`}
                      >
                        Attempt #{idx + 1}
                      </Link>
                    </Button>
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
