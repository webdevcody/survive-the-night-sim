import { gpt4o } from "./gpt-4o";
import { errorMessage } from "@/lib/utils";
import { ZombieSurvival } from "@/simulator";

// TODO: rewrite this prompt to work for multiplayer
const SYSTEM_PROMPT = `Your task is to play a game.  We will give you a 2d array of characters that represent the game board.  Before the game starts, you have these two tasks:

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
"P" represents the player, who cannot move. The player's goal is to throw popsicle at zombies before they reach them.
"B" represents blocks that can be placed before the round begins to hinder the zombies.

# Game Rules
- The game is turn based.
- At the start of the turn, the player (P) throws a popsicle at the closest zombie (using euclidean distance).
- Popsicle deal 1 damage to zombies.
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

- Respond only with valid JSON. Do not write an introduction or summary.
- Assume a single paragraph explaining your placement strategy is always represented as REASONING.
- Assume a position on the 2d grid is always represented as [ROW, COL].
- Your output should be a JSON object with the following format:

{
  "boxCoordinates": [[ROW, COL], [ROW, COL]],
  "playerCoordinates": [ROW, COL],
  "reasoning": "REASONING"
}
`;

export interface ModelHandlerConfig {
  maxTokens: number;
  temperature: number;
  topP: number;
}

export type MutiplayerModelHandler = (
  systemPrompt: string,
  userPrompt: string,
  config: ModelHandlerConfig,
) => Promise<{
  moveLocation: number[];
  reasoning: string;
}>;

const MAX_RETRIES = 1;

const CONFIG: ModelHandlerConfig = {
  maxTokens: 1024,
  temperature: 0.5,
  topP: 0.95,
};

export type RunModelResult = {
  solution?: string[][];
  reasoning: string;
  promptTokens?: number;
  outputTokens?: number;
  totalTokensUsed?: number;
  totalRunCost?: number;
  error?: string;
};

export async function runMutiplayerModel(
  modelId: string,
  map: string[][],
  playerToken: string,
  retry = 1,
): Promise<RunModelResult> {
  const playerToMove = ZombieSurvival.getPlayerByToken(map, playerToken);

  if (!playerToMove) {
    throw new Error(`Player token '${playerToken}' not found`);
  }

  const userPrompt =
    `Grid: ${JSON.stringify(map)}\n\n` +
    `Valid Move Locations: ${JSON.stringify(
      ZombieSurvival.validMoveLocations(map, playerToMove),
    )}`;

  let result;
  let reasoning: string | null = null;

  try {
    switch (modelId) {
      // TODO: do not hard code this
      case "m1757gn800qrc8s4jpdcshbgah72s9e7": {
        // gpt-4o
        result = await gpt4o(SYSTEM_PROMPT, userPrompt, CONFIG);
        break;
      }
      default: {
        throw new Error(`Tried running unknown model '${modelId}'`);
      }
    }

    reasoning = result.reasoning;

    const originalMap = ZombieSurvival.cloneMap(map);

    return {
      solution: originalMap,
      reasoning: result.reasoning,
    };
  } catch (error) {
    if (retry === MAX_RETRIES || reasoning === null) {
      return {
        reasoning: reasoning ?? "Internal error",
        error: errorMessage(error),
      };
    }

    return await runMutiplayerModel(modelId, map, playerToken, retry + 1);
  }
}
