"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, Authenticated } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Visualizer } from "@/components/Visualizer";
import { Map } from "@/components/Map";
import Link from "next/link";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TestMode from "./test-mode";
import { handleCellClick, handlePlacementModeChange } from "@/utils/mapUtils";
import { useRouter } from "next/navigation";
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
  const [placementMode, setPlacementMode] = useState<"player" | "block">("player");
  const [blockCount, setBlockCount] = useState(0);
  const flags = useQuery(api.flags.getFlags);
  const [mode, setMode] = useState<"play" | "test">("play");

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
      <div className="container mx-auto min-h-screen flex flex-col items-center py-12 pb-24 gap-8">
        <Header flags={flags} mode={mode} setMode={setMode} />
        <h1 className="text-3xl font-bold text-center mb-6">Night #{level}</h1>
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

  const handleCellClickWrapper = (x: number, y: number) => {
    if (isSimulating) return;
    handleCellClick(x, y, playerMap, setPlayerMap, placementMode, blockCount, setBlockCount);
  };

  const handlePlacementModeChangeWrapper = (mode: "player" | "block") => {
    handlePlacementModeChange(mode, playerMap, setPlacementMode);
  };

  const runSimulation = () => {
    if (!ZombieSurvival.mapHasPlayer(playerMap)) {
      alert("Please place a player (P) on the map before running the simulation.");
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
    <div className="container mx-auto min-h-screen flex flex-col items-center py-12 pb-24 gap-8">
      <Header flags={flags} mode={mode} setMode={setMode} />
      <h1 className="text-3xl font-bold text-center">Night #{level}</h1>

      {mode === "play" ? (
        <>
          <PlacementControls
            placementMode={placementMode}
            blockCount={blockCount}
            onPlacementModeChange={handlePlacementModeChangeWrapper}
          />
          <GameBoard
            isSimulating={isSimulating}
            playerMap={playerMap}
            gameResult={gameResult}
            onCellClick={handleCellClickWrapper}
            onSimulationEnd={handleSimulationEnd}
            onReset={handleReset}
          />
          <SimulationControls
            isSimulating={isSimulating}
            onRunSimulation={runSimulation}
            onClearMap={handleClearMap}
            onRetry={handleRetryClicked}
            gameResult={gameResult}
            lastLevel={lastLevel}
            level={level}
            router={router}
          />
          <Authenticated>
            <PreviousAttempts tries={tries} />
          </Authenticated>
        </>
      ) : (
        <TestMode level={level} map={map.grid} />
      )}
    </div>
  );
}

const Header: React.FC<HeaderProps> = ({ flags, mode, setMode }) => (
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
);

const PlacementControls: React.FC<PlacementControlsProps> = ({ placementMode, blockCount, onPlacementModeChange }) => (
  <div className="mb-4 flex justify-center gap-4">
    <Button
      onClick={() => onPlacementModeChange("player")}
      variant={placementMode === "player" ? "default" : "outline"}
      className="h-10"
    >
      Place Player
    </Button>
    <Button
      onClick={() => onPlacementModeChange("block")}
      variant={placementMode === "block" ? "default" : "outline"}
      className="h-10"
    >
      Place Block ({2 - blockCount} left)
    </Button>
  </div>
);

const GameBoard: React.FC<GameBoardProps> = ({ isSimulating, playerMap, gameResult, onCellClick, onSimulationEnd, onReset }) => (
  <div className="mb-8 flex flex-col items-center">
    <h2 className="text-xl font-semibold mb-4">
      {isSimulating ? "Simulation Result" : "Place Your Player"}
    </h2>
    {isSimulating ? (
      <>
        <Visualizer
          map={playerMap}
          autoStart={true}
          onReset={onReset}
          onSimulationEnd={onSimulationEnd}
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
                  ${cell === " " || cell === "B" ? "cursor-pointer hover:border-2 z-10 hover:border-dashed hover:border-slate-300" : ""}
                  border border-transparent
                `}
                onClick={() => onCellClick(x, y)}
              />
            )),
          )}
        </div>
      </div>
    )}
  </div>
);

const SimulationControls: React.FC<SimulationControlsProps> = ({ isSimulating, onRunSimulation, onClearMap, onRetry, gameResult, lastLevel, level, router }) => (
  <div className="flex justify-center gap-4">
    {!isSimulating ? (
      <>
        <Button onClick={onRunSimulation} className="h-10">
          Run Simulation
        </Button>
        <Button
          onClick={onClearMap}
          variant="outline"
          className="h-10"
        >
          Clear Map
        </Button>
      </>
    ) : (
      <div className="flex items-center gap-x-3">
        <Button onClick={onRetry} className="h-10">
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
);

const PreviousAttempts: React.FC<PreviousAttemptsProps> = ({ tries }) => (
  <>
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
  </>
);