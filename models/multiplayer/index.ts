import { gpt4o } from "./gpt-4o";
import { ModelSlug } from "@/convex/constants";
import { errorMessage } from "@/lib/utils";
import { ZombieSurvival } from "@/simulator";

const SYSTEM_PROMPT = `Your task is to play a game.  We will give you a 2d array of characters that represent the game board.

# Grid Descriptions
The 2d Grid is made up of characters, where each character has a meaning.
" " represents an empty space.
"Z" represents a zombie.  "Z:2" represents a zombie with 2 health.
"R" represents rocks which zombies can not pass through and path finding will not allow them to go through.
"1", "2", "3", "4", "5", "6" represents the players who can move around and throw popsicles at zombies.
"B" represents blocks that can be placed before the round begins to hinder the zombies.

# Game Rules
- The game is turn based.
- At the start of your turn, you can throw a popsicle at any one zombie on the map
- You can also move DOWN, LEFT, RIGHT, UP, STAY only if the spot they are trying to move into is empty
- A zombie is removed from the game when its health reaches 0.
- When all players die, the game ends

# Zombie Rules
- Zombies have 2 health.
- Zombies can only move horizontally or vertically.
- Zombies pathfinding will always be in the order of DOWN, LEFT, RIGHT, UP
- Zombies can't move diagonally.
- Zombies can't move through rocks.
- Zombies can't move through each other.
- Zombies always try to move towards the playing using BFS algorithm.

# Player Rules
- Players can move horizontally or vertically.
- Players can't move into occupied spaces or outside the grid.
- Players can throw one popsickle at a zombie each turn.
- Players should move away from zombies.
- Players should probably shoot at the closest zombie

# Output Format

- Respond only with valid JSON. Do not write an introduction or summary.
- Assume a position on the 2d grid is always represented as [ROW, COL].
- Your output should be a JSON object with the following format:

{
  "moveDirection": "DOWN" | "LEFT" | "RIGHT" | "UP" | "STAY",
  "zombieToShoot": [ROW, COL]
}
`;

export interface ModelHandlerConfig {
  maxTokens: number;
  temperature: number;
  topP: number;
}

export type MultiplayerModelHandler = (
  systemPrompt: string,
  userPrompt: string,
  config: ModelHandlerConfig,
) => Promise<{
  moveDirection: string;
  zombieToShoot: number[];
}>;

const MAX_RETRIES = 1;

const CONFIG: ModelHandlerConfig = {
  maxTokens: 1024,
  temperature: 0.5,
  topP: 0.95,
};

export type RunModelResult = {
  error?: string;
  moveDirection?: string;
  zombieToShoot?: number[];
  reasoning?: string;
};

export async function runMultiplayerModel(
  modelSlug: ModelSlug,
  map: string[][],
  playerToken: string,
  retry = 1,
): Promise<RunModelResult> {
  const validDirections = [
    ...ZombieSurvival.validMoveDirections(map, playerToken),
    "STAY",
  ];

  const zombieLocations = ZombieSurvival.getZombieLocations(map);

  const userPrompt =
    `Grid: ${JSON.stringify(map)}\n\n` +
    `Your Player Token: ${playerToken}\n\n` +
    `Zombie Locations: ${JSON.stringify(zombieLocations)}\n\n` +
    `Valid Move Locations: ${JSON.stringify(validDirections)}`;

  let result;
  let reasoning: string | null = null;

  try {
    switch (modelSlug) {
      case "gpt-4o": {
        result = await gpt4o(SYSTEM_PROMPT, userPrompt, CONFIG);
        break;
      }
      default: {
        throw new Error(`Tried running unknown model '${modelSlug}'`);
      }
    }

    return {
      moveDirection: result.moveDirection,
      zombieToShoot: result.zombieToShoot,
    };
  } catch (error) {
    if (retry === MAX_RETRIES || reasoning === null) {
      return {
        error: errorMessage(error),
        reasoning: reasoning ?? "Internal error",
      };
    }

    return await runMultiplayerModel(modelSlug, map, playerToken, retry + 1);
  }
}
