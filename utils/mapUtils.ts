export const handleCellClick = (
  x: number,
  y: number,
  playerMap: string[][],
  setPlayerMap: React.Dispatch<React.SetStateAction<string[][]>>,
  placementMode: "player" | "block",
  blockCount: number,
  setBlockCount: React.Dispatch<React.SetStateAction<number>>
) => {
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

export const handlePlacementModeChange = (
  mode: "player" | "block",
  playerMap: string[][],
  setPlacementMode: React.Dispatch<React.SetStateAction<"player" | "block">>
) => {
  if (mode === "player" && !playerMap.some((row) => row.includes("P"))) {
    setPlacementMode(mode);
  } else if (mode === "block") {
    setPlacementMode(mode);
  }
};
