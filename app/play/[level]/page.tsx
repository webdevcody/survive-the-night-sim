"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Visualizer } from "../../visualizer";
import { Map } from "@/app/map";
import Link from "next/link";
import { ChevronLeftIcon } from "@radix-ui/react-icons";

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

  if (!map) {
    return <div>Loading...</div>;
  }

  function handleRetryClicked() {
    setIsSimulating(false);
    setGameResult(null);
    setBlockCount(0);
    if (map) {
      setPlayerMap(map.grid);
    }
  }

  const handleCellClick = (x: number, y: number) => {
    if (isSimulating) return;

    const newMap =
      playerMap.length > 0 ? [...playerMap] : map.grid.map((row) => [...row]);

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

  const handlePlacementModeChange = (mode: "player" | "block") => {
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

  const handleSimulationEnd = (isWin: boolean) => {
    setGameResult(isWin ? "WON" : "LOST");
  };

  const mapWidth =
    playerMap.length > 0 ? playerMap[0].length : map.grid[0].length;
  const mapHeight = playerMap.length > 0 ? playerMap.length : map.grid.length;

  return (
    <div className="container mx-auto min-h-screen flex flex-col items-center py-12 pb-24 gap-8">
      <Button variant="outline" asChild className="flex gap-2 items-center">
        <Link href="/play" passHref>
          <ChevronLeftIcon /> Play Different Night
        </Link>
      </Button>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center">Night #{level}</h1>
      </div>
      <div className="mb-4 flex justify-center gap-4">
        <Button
          onClick={() => handlePlacementModeChange("player")}
          disabled={playerMap.some((row) => row.includes("P"))}
          variant={placementMode === "player" ? "default" : "outline"}
        >
          Place Player
        </Button>
        <Button
          onClick={() => handlePlacementModeChange("block")}
          disabled={blockCount >= 2}
          variant={placementMode === "block" ? "default" : "outline"}
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
            <Map map={playerMap.length > 0 ? playerMap : map.grid} />
            <div
              className="absolute inset-0 grid"
              style={{
                gridTemplateColumns: `repeat(${mapWidth}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${mapHeight}, minmax(0, 1fr))`,
              }}
            >
              {(playerMap.length > 0 ? playerMap : map.grid).map((row, y) =>
                row.map((_, x) => (
                  <div
                    key={`${x}-${y}`}
                    className="cursor-pointer"
                    onClick={() => handleCellClick(x, y)}
                  />
                )),
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-center">
        {!isSimulating && (
          <Button onClick={runSimulation}>Run Simulation</Button>
        )}
        {isSimulating && <Button onClick={handleRetryClicked}>Retry</Button>}
      </div>
    </div>
  );
}
