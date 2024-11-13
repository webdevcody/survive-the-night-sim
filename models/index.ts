import { errorMessage } from "../lib/utils";
import { ZombieSurvival } from "../simulator";
import { claude35sonnet } from "./claude-3-5-sonnet";
import { gemini15pro } from "./gemini-1.5-pro";
import { gpt4o } from "./gpt-4o";
import { mistralLarge2 } from "./mistral-large-2";
import { perplexityLlama31 } from "./perplexity-llama-3.1";
import { AI_MODELS } from "@/convex/constants";

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

export type RunModelResult = {
  solution?: string[][];
  reasoning: string;
  promptTokens?: number;
  outputTokens?: number;
  totalTokensUsed?: number;
  totalRunCost?: number;
  error?: string;
};

export async function runModel(
  modelId: string,
  map: string[][],
  prompt: string,
  maxBlocks: number,
  retry = 1,
): Promise<RunModelResult> {
  const userPrompt =
    `Grid: ${JSON.stringify(map)}\n\n` +
    `Valid Locations: ${JSON.stringify(ZombieSurvival.validLocations(map))}`;

  let result;
  let reasoning: string | null = null;
  const modifiedPrompt = prompt.replace(
    "{MAX_BLOCKS}",
    maxBlocks?.toString() ?? "",
  );

  try {
    switch (modelId) {
      case AI_MODELS["gemini-1.5-pro"].slug: {
        result = await gemini15pro(modifiedPrompt, userPrompt, CONFIG);
        break;
      }
      case AI_MODELS["gpt-4o"].slug: {
        result = await gpt4o(modifiedPrompt, userPrompt, CONFIG);
        break;
      }
      case AI_MODELS["claude-3.5-sonnet"].slug: {
        result = await claude35sonnet(modifiedPrompt, userPrompt, CONFIG);
        break;
      }
      case AI_MODELS["perplexity-llama-3.1"].slug: {
        result = await perplexityLlama31(modifiedPrompt, userPrompt, CONFIG);
        break;
      }
      case AI_MODELS["mistral-large-2"].slug: {
        result = await mistralLarge2(modifiedPrompt, userPrompt, CONFIG);
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

    return await runModel(modelId, map, modifiedPrompt, maxBlocks, retry + 1);
  }
}
