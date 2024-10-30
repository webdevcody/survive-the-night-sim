import { errorMessage } from "../lib/utils";
import { ZombieSurvival } from "../simulators/zombie-survival";
import { claude35sonnet } from "./claude-3-5-sonnet";
import { gemini15pro } from "./gemini-1.5-pro";
import { gpt4o } from "./gpt-4o";
import { mistralLarge2 } from "./mistral-large-2";
import { perplexityLlama31 } from "./perplexity-llama-3.1";

export interface ModelHandlerConfig {
  maxTokens: number;
  temperature: number;
  topP: number;
}

export type ModelHandler = (
  systemPrompt: string,
  userPrompt: string,
  config: ModelHandlerConfig,
) => Promise<{
  boxCoordinates: number[][];
  playerCoordinates: number[];
  reasoning: string;
  promptTokens?: number;
  outputTokens?: number;
  totalTokensUsed?: number;
  totalRunCost?: number;
}>;

const MAX_RETRIES = 1;

// Decision was made based on this research:
// https://discord.com/channels/663478877355507769/1295376750154350654/1298659719636058144

const CONFIG: ModelHandlerConfig = {
  maxTokens: 1024,
  temperature: 0.5,
  topP: 0.95,
};

export async function runModel(
  modelId: string,
  map: string[][],
  prompt: string,
  retry = 1,
): Promise<{
  solution?: string[][];
  reasoning: string;
  promptTokens?: number;
  outputTokens?: number;
  totalTokensUsed?: number;
  totalRunCost?: number;
  error?: string;
}> {
  const userPrompt =
    `Grid: ${JSON.stringify(map)}\n\n` +
    `Valid Locations: ${JSON.stringify(ZombieSurvival.validLocations(map))}`;

  let result;
  let reasoning: string | null = null;

  try {
    switch (modelId) {
      case "gemini-1.5-pro": {
        result = await gemini15pro(prompt, userPrompt, CONFIG);
        break;
      }
      case "gpt-4o": {
        result = await gpt4o(prompt, userPrompt, CONFIG);
        break;
      }
      case "claude-3.5-sonnet": {
        result = await claude35sonnet(prompt, userPrompt, CONFIG);
        break;
      }
      case "perplexity-llama-3.1": {
        result = await perplexityLlama31(prompt, userPrompt, CONFIG);
        break;
      }
      case "mistral-large-2": {
        result = await mistralLarge2(prompt, userPrompt, CONFIG);
        break;
      }
      default: {
        throw new Error(`Tried running unknown model '${modelId}'`);
      }
    }

    reasoning = result.reasoning;

    const originalMap = ZombieSurvival.cloneMap(map);
    const [playerRow, playerCol] = result.playerCoordinates;

    if (originalMap[playerRow]?.[playerCol] !== " ") {
      throw new Error("Tried to place player in a non-empty space");
    }

    originalMap[playerRow][playerCol] = "P";

    for (const block of result.boxCoordinates) {
      const [blockRow, blockCol] = block;

      if (originalMap[blockRow]?.[blockCol] !== " ") {
        throw new Error("Tried to place block in a non-empty space");
      }

      originalMap[blockRow][blockCol] = "B";
    }

    return {
      solution: originalMap,
      reasoning: result.reasoning,
      promptTokens: result.promptTokens,
      outputTokens: result.outputTokens,
      totalTokensUsed: result.totalTokensUsed,
      totalRunCost: result.totalRunCost,
    };
  } catch (error) {
    if (retry === MAX_RETRIES || reasoning === null) {
      return {
        reasoning: reasoning ?? "Internal error",
        error: errorMessage(error),
      };
    }

    return await runModel(modelId, map, prompt, retry + 1);
  }
}
