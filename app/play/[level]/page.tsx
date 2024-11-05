"use client";

import { useEffect, useState } from "react";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { Authenticated, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TestMode from "./test-mode";
import { Map } from "@/components/Map";
import { Page, PageTitle } from "@/components/Page";
import { Visualizer } from "@/components/Visualizer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_REPLAY_SPEED } from "@/constants/visualizer";
import { api } from "@/convex/_generated/api";
import { ZombieSurvival } from "@/simulator";

type PlacementMode = "player" | "block" | "landmine";

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
  const [placementMode, setPlacementMode] = useState<PlacementMode>("player");
  const [blockCount, setBlockCount] = useState(0);
  const [landmineCount, setLandmineCount] = useState(0);
  const [maxBlocks, setMaxBlocks] = useState(0);
  const [maxLandmines, setMaxLandmines] = useState(0);
  const flags = useQuery(api.flags.getFlags);
  const [mode, setMode] = useState<"play" | "test">("play");
  const [replaySpeed, setReplaySpeed] = useState(DEFAULT_REPLAY_SPEED);

  // Initialize playerMap when map data is available
  useEffect(() => {
    if (map) {
      setPlayerMap(map.grid.map((row) => [...row]));
      setMaxBlocks(Number(map.maxBlocks) ?? 0);
      setMaxLandmines(Number(map.maxLandmines) ?? 0);
    }
  }, [map]);

  const userResultMutation = useMutation(api.playerresults.updateUserResult);
  const user = useQuery(api.users.getUserOrNull);

  const levelRankings = useQuery(api.leaderboard.getLevelRankings, { level });

  const tries = useQuery(api.playerresults.getPlayerRecordsForAMap, {
    mapId: map?._id,
  });

  const lastLevel = useQuery(api.maps.lastLevel);
  const router = useRouter();

  if (!map) {
    return (
      <Page className="flex flex-col items-center gap-8">
        <div className="flex w-full items-center justify-between">
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link href="/play" passHref>
              <ChevronLeftIcon /> Play Different Night
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link href="/rules">Rules</Link>
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
        <PageTitle>Night #{level}</PageTitle>

        <p>Loading...</p>
      </Page>
    );
  }

  const handleRetryClicked = () => {
    setIsSimulating(false);
    setGameResult(null);
    setBlockCount(0);
    setLandmineCount(0);
    setPlayerMap(map.grid.map((row) => [...row]));
    setPlacementMode("player");
  };

  const handleCellClick = (x: number, y: number) => {
    if (isSimulating) return;

    const newMap = [...playerMap];
    if (placementMode === "player") {
      if (newMap[y][x] === " ") {
        // Remove existing player if any
        for (let i = 0; i < newMap.length; i++) {
          for (let j = 0; j < newMap[i].length; j++) {
            if (newMap[i][j] === "P") {
              newMap[i][j] = " ";
            }
          }
        }

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
    } else if (placementMode === "landmine") {
      // Place new landmine
      if (newMap[y][x] === "L") {
        newMap[y][x] = " ";
        setLandmineCount(landmineCount - 1);
      } else if (landmineCount < 2) {
        if (newMap[y][x] === " ") {
          newMap[y][x] = "L";
          setLandmineCount(landmineCount + 1);
        }
      }
    }
    setPlayerMap(newMap);
  };

  function handlePlacementModeChange(mode: PlacementMode) {
    setPlacementMode(mode);
  }

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
    setLandmineCount(0);
    setPlacementMode("player");
  };

  return (
    <Page className="flex flex-col items-center gap-8">
      <div className="flex w-full items-center justify-between">
        <Button variant="outline" asChild className="flex items-center gap-2">
          <Link href="/play" passHref>
            <ChevronLeftIcon /> Play Different Night
          </Link>
        </Button>
        <Button variant="outline" asChild className="flex items-center gap-2">
          <Link href="/rules">Rules</Link>
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
      <PageTitle>Night #{level}</PageTitle>
      <div className="flex flex-col gap-12 lg:flex-row">
        <div>
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
                  Place Block ({maxBlocks - blockCount} left)
                </Button>
                <Button
                  onClick={() => handlePlacementModeChange("landmine")}
                  variant={placementMode === "landmine" ? "default" : "outline"}
                  className="h-10"
                >
                  Place Landmine ({maxLandmines - landmineCount} left)
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
                      autoStart
                      onReset={handleReset}
                      onSimulationEnd={handleSimulationEnd}
                      replaySpeed={replaySpeed}
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
              <div className="flex flex-col items-center justify-center gap-4">
                {!isSimulating ? (
                  <>
                    <div className="flex flex-col items-center gap-2">
                      <h3>Choose the speed (200ms to 2s)</h3>
                      <Slider
                        className="w-2/3"
                        defaultValue={[DEFAULT_REPLAY_SPEED]}
                        min={200}
                        max={2000}
                        step={100}
                        onValueChange={(value) => {
                          setReplaySpeed(value[0]);
                        }}
                      />
                    </div>
                    <div className="flex justify-center gap-4">
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
                    </div>
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
                            attempt?.didWin
                              ? "border-green-500"
                              : "border-red-500"
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
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">AI Leaderboard</h2>
            <Link href="/leaderboard" passHref>
              <Button variant="link">Leaderboard Page</Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model ID</TableHead>
                  <TableHead className="text-right">Wins</TableHead>
                  <TableHead className="text-right">Losses</TableHead>
                  <TableHead className="text-right">Total Games</TableHead>
                  <TableHead className="text-right">Win Ratio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {levelRankings?.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.modelId}</TableCell>
                    <TableCell className="text-right">{item.wins}</TableCell>
                    <TableCell className="text-right">{item.losses}</TableCell>
                    <TableCell className="text-right">
                      {item.wins + item.losses}
                    </TableCell>
                    <TableCell className="text-right">
                      {((item.wins / (item.wins + item.losses)) * 100).toFixed(
                        2,
                      )}
                      %
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Page>
  );
}
