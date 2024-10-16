import { gemini15pro } from "./gemini-1.5-pro";
import { gpt4o } from "./gpt-4o";

export type ModelHandler = (
  prompt: string,
  map: string[][],
) => Promise<{
  boxCoordinates: number[][];
  playerCoordinates: number[];
  reasoning: string;
}>;

const prompt = `You're given a 2d grid of nums such that.
" " represents an empty space.
"Z" represents a zombie. Zombies move one Manhattan step every turn and aim to reach the player.
"R" represents rocks, which players can shoot over but zombies cannot pass through or break.
"P" represents the player, who cannot move. The player's goal is to shoot and kill zombies before they reach them.
"B" represents blocks that can be placed before the round begins to hinder the zombies.

Your goal is to place the player ("P") in a location which maximize the player's survival.
You must place two blocks ("B") in locations which maximize the player's survival.
You can shoot any zombie regardless of where it is on the grid.
Returning a 2d grid with the player and blocks placed in the optimal locations, with the coordinates player ("P") and the blocks ("B"), also provide reasoning for the choices.
Zombies can only move horizontally or vertically, not diagonally.
You can't replace rocks R or zombies Z with blocks.
Players will always shoot at the closest zombie each turn.
If there is no room to place a block, do not place any.`;

export async function runModel(
  modelId: string,
  map: string[][],
): Promise<{
  solution: string[][];
  reasoning: string;
}> {
  let result;

  switch (modelId) {
    case "gemini-1.5-pro": {
      result = await gemini15pro(prompt, map);
      break;
    }
    case "gpt-4o": {
      result = await gpt4o(prompt, map);
      break;
    }
    default: {
      throw new Error(`Tried running unknown model '${modelId}'`);
    }
  }

  const originalMap = JSON.parse(JSON.stringify(map));
  const [playerRow, playerCol] = result.playerCoordinates;

  if (originalMap[playerRow][playerCol] !== " ") {
    throw new Error("Tried to place player in a non-empty space");
  }

  originalMap[playerRow][playerCol] = "P";

  for (const block of result.boxCoordinates) {
    const [blockRow, blockCol] = block;

    if (originalMap[blockRow][blockCol] !== " ") {
      throw new Error("Tried to place a block in a non-empty space");
    }

    originalMap[blockRow][blockCol] = "B";
  }

  return {
    solution: originalMap,
    reasoning: result.reasoning,
  };
}
