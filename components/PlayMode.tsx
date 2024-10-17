import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Visualizer } from "@/app/visualizer";
import { Map } from "@/app/map";
import { handleCellClick, handlePlacementModeChange } from "@/utils/mapUtils";

const PlayMode = ({ map }: { map: Maps | null | undefined }) => {
  const [playerMap, setPlayerMap] = useState<string[][]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [gameResult, setGameResult] = useState<"WON" | "LOST" | null>(null);
  const [placementMode, setPlacementMode] = useState<"player" | "block">("player");
  const [blockCount, setBlockCount] = useState(0);

  function handleRetryClicked() {
    setIsSimulating(false);
    setGameResult(null);
    setBlockCount(0);
    setPlayerMap(map?.grid || []);
  }

  const runSimulation = () => {
    if (!playerMap.some((row) => row.includes("P"))) {
        
      alert("Please place a player (P) on the map before running the simulation.");
      return;
    }
    setIsSimulating(true);
    setGameResult(null);
  };

  const handleSimulationEnd = (isWin: boolean) => {
    setGameResult(isWin ? "WON" : "LOST");
  };

  const handleClearMap = () => {
    setPlayerMap(map?.grid?.map((row) => [...row]) || []);
    setBlockCount(0);
    setPlacementMode("player");
  };

  return (
    <>
      <div className="mb-4 flex justify-center gap-4">
        <Button
          onClick={() => handlePlacementModeChange("player", playerMap, setPlacementMode)}
          disabled={playerMap.some((row) => row.includes("P"))}
          variant={placementMode === "player" ? "default" : "outline"}
        >
          Place Player
        </Button>
        <Button
          onClick={() => handlePlacementModeChange("block", playerMap, setPlacementMode)}
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
            <Map map={playerMap.length > 0 ? playerMap : map?.grid} />
            <div
              className="absolute inset-0 grid"
              style={{
                gridTemplateColumns: `repeat(${playerMap[0]?.length || map?.grid[0].length}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${playerMap.length || map?.grid.length}, minmax(0, 1fr))`,
              }}
            >
              {(playerMap.length > 0 ? playerMap : map?.grid)?.map((row, y) =>
                row?.map((cell, x) => (
                  <div
                    key={`${x}-${y}`}
                    className={`
                      ${cell === " " ? "cursor-pointer hover:border-2 hover:border-dashed hover:border-slate-500" : ""}
                      border border-transparent
                    `}
                    onClick={() => cell === " " && handleCellClick(x, y, playerMap, setPlayerMap, placementMode, blockCount, setBlockCount)}
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
  );
}

export default PlayMode;