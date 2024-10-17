"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Visualizer } from "../../visualizer";
import { Map } from "@/app/map";
import Link from "next/link";
import { ChevronLeftIcon, ReloadIcon } from "@radix-ui/react-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AI_MODELS } from "@/convex/constants";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].model);
  const testAIModel = useAction(api.maps.testAIModel);
  const flags = useQuery(api.flags.getFlags);
  const [mode, setMode] = useState<"play" | "test">("play");
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);
  const [showOriginalMap, setShowOriginalMap] = useState(true);

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

  const handleAITest = async () => {
    if (!map) return;

    setIsSimulating(true);
    setGameResult(null);
    setAiError(null);
    setAiReasoning(null);
    setShowOriginalMap(false);

    try {
      const result = await testAIModel({
        level,
        modelId: selectedModel,
      });

      setPlayerMap(result.map);
      setGameResult(result.isWin ? "WON" : "LOST");
      setAiReasoning(result.reasoning);
    } catch (error) {
      console.error("Error testing AI model:", error);
      setAiError(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = () => {
    setShowOriginalMap(true);
    setPlayerMap([]);
    setGameResult(null);
    setAiError(null);
    setAiReasoning(null);
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
            {isSimulating ? (
              <>
                <Visualizer
                  map={playerMap}
                  autoStart={true}
                  onSimulationEnd={handleSimulationEnd}
                />
                {gameResult && (
                  <div
                    className={`mt-4 text-2xl font-bold ${
                      gameResult === "WON" ? "text-green-500" : "text-red-500"
                    }`}
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
                    gridTemplateColumns: `repeat(${playerMap[0]?.length || map.grid[0].length}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${playerMap.length || map.grid.length}, minmax(0, 1fr))`,
                  }}
                >
                  {(playerMap.length > 0 ? playerMap : map.grid).map((row, y) =>
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
                <Button onClick={runSimulation}>Run Simulation</Button>
                <Button onClick={handleClearMap} variant="outline">
                  Clear Map
                </Button>
              </>
            ) : (
              <Button onClick={handleRetryClicked}>Retry</Button>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full">
          {showOriginalMap && (
            <div className="mb-8">
              <Map map={map.grid} />
            </div>
          )}
          <div className="flex gap-4 mb-4">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((model) => (
                  <SelectItem key={model.model} value={model.model}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAITest} disabled={isSimulating}>
              {isSimulating ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test AI Model"
              )}
            </Button>
            {!showOriginalMap && (
              <Button onClick={handleReset} variant="outline">
                Reset
              </Button>
            )}
          </div>
          {aiError && <div className="text-red-500 mt-4">{aiError}</div>}
          {gameResult && (
            <div className="mt-4 flex flex-col items-center gap-8 max-w-4xl mx-auto">
              <Visualizer map={playerMap} autoStart={true} />
              <div className="flex flex-col gap-4 flex-1">
                <div
                  className={`text-2xl font-bold ${
                    gameResult === "WON" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  AI {gameResult}
                </div>
                {aiReasoning && (
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">AI Reasoning:</h3>
                    <p>{aiReasoning}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
