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

const prompt = `

Your task is to play a game.  We will give you a 2d array of characters that represent the game board.  Before the game starts, you have these two tasks:

1. Place two blocks ("B") in locations which maximize the player's survival.
2. Place the player ("P") in a location which maximize the player's survival.

# Placing Rules
- You can not place blocks in locations already used by zombies or rocks.
- You can not place the player in a location already used by a zombie or rock.
- You can not place a block over the player or another block.
- You must place both blocks and the player before starting the game.

# Grid Descriptions
The 2d Grid is made up of characters, where each character has a meaning.
" " represents an empty space.
"Z" represents a zombie.
"R" represents rocks which zombies can not pass through and path finding will not allow them to go through.
"P" represents the player, who cannot move. The player's goal is to throw popsickles at zombies before they reach them.
"B" represents blocks that can be placed before the round begins to hinder the zombies.

# Game Rules
- The game is turn based.
- At the start of the turn, the player (P) throws a popsickle at the closest zombie (using euclidean distance).
- Popsickles deal 1 damage to zombies.
- A zombie is removed from the game when its health reaches 0.
- When all zombies are removed, the player wins.
- If a zombie reaches a player, the player loses.

# Zombie Rules
- Zombies have 2 health.
- Zombies can only move horizontally or vertically.
- Zombies pathfinding will always be in the order of DOWN, LEFT, RIGHT, UP
- Zombies can't move diagonally.
- Zombies can't move through rocks.
- Zombies can't move through each other.
- Zombies always try to move towards the playing using BFS algorithm.

# Player Rules
- Players can not move.
- Players throw one lollipops at the closest zombie at the start of each turn.

# Placement Strategies

- often it's good to wall off between the zombies and players if possible, this will slow the zombies down.
- You should never put a player directly next to a zombie.
- You should try to put blocks directly next to players
- If the player is behind a choke point, blocking the path to the player is the best option.

# Output Format

- Assume a position on the 2d grid is always represented as [ROW, COL].
- Your output should be a JSON object with the following format:

{
  "boxCoordinates": [[ROW, COL], [ROW, COL]],
  "playerCoordinates": [ROW, COL]
}

## MOST IMPORTANT RULE

- DO NOT TRY TO PUT A BLOCK OR PLAYER IN A LOCATION THAT IS ALREADY OCCUPIED

`;

export async function runModel(
  modelId: string,
  map: string[][],
): Promise<{
  solution?: string[][];
  reasoning: string;
  error?: string;
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
    return {
      reasoning: result.reasoning,
      error: "Tried to place player in a non-empty space",
    };
  }

  originalMap[playerRow][playerCol] = "P";

  for (const block of result.boxCoordinates) {
    const [blockRow, blockCol] = block;

    if (originalMap[blockRow][blockCol] !== " ") {
      return {
        reasoning: result.reasoning,
        error: "Tried to place block in a non-empty space",
      };
    }

    originalMap[blockRow][blockCol] = "B";
  }

  return {
    solution: originalMap,
    reasoning: result.reasoning,
  };
}
