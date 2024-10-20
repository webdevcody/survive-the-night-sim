interface Maps {
  _id: Id<"maps">;
  _creationTime: number;
  level: number;
  grid: string[][];
}

interface HeaderProps {
  flags: { showTestPage: boolean; enableCronJobs: boolean } | undefined;
  mode: "play" | "test";
  setMode: (mode: "play" | "test") => void;
}

interface PlacementControlsProps {
  placementMode: "player" | "block";
  blockCount: number;
  onPlacementModeChange: (mode: "player" | "block") => void;
}

interface GameBoardProps { 
  isSimulating: boolean;
  playerMap: string[][];
  gameResult: "WON" | "LOST" | null;
  onCellClick: (x: number, y: number) => void;
  onSimulationEnd: (isWin: boolean) => Promise<void>;
  onReset: () => void;
}

interface SimulationControlsProps {
  isSimulating: boolean;
  onRunSimulation: () => void;
  onClearMap: () => void;
  onRetry: () => void;
  gameResult: "WON" | "LOST" | null;
  lastLevel: number | undefined;
  level: number;
  router: NextRouter;
}

interface PreviousAttemptsProps {
  tries:
    | {
        hasWon?: undefined;
        attempts?: undefined;
      }
    | {
        hasWon: boolean;
        attempts: ({
          _id: Id<"attempts">;
          _creationTime: number;
          grid: string[][];
          didWin: boolean;
        } | null)[];
      }
    | null
    | undefined;
}
