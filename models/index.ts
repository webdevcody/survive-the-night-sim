import { errorMessage } from "../lib/utils";
import { ZombieSurvival } from "../simulators/zombie-survival";
import { claude35sonnet } from "./claude-3-5-sonnet";
import { gemini15pro } from "./gemini-1.5-pro";
import { gpt4o } from "./gpt-4o";
import { mistralLarge2 } from "./mistral-large-2";
import { perplexityLlama31 } from "./perplexity-llama-3.1";

const MAX_RETRIES = 3;

export type ModelHandler = (
  prompt: string,
  map: string[][],
) => Promise<{
  boxCoordinates: number[][];
  playerCoordinates: number[];
  reasoning: string;
}>;

export async function runModel(
  modelId: string,
  map: string[][],
  prompt: string,
  retry = 1,
): Promise<{
  solution?: string[][];
  reasoning: string;
  error?: string;
}> {
  let result;
  let reasoning: string | null = null;

  try {
    switch (modelId) {
      case "gemini-1.5-pro": {
        result = await gemini15pro(prompt, map);
        break;
      }
      case "gpt-4o": {
        result = await gpt4o(prompt, map);
        break;
      }
      case "claude-3.5-sonnet": {
        result = await claude35sonnet(prompt, map);
        break;
      }
      case "perplexity-llama-3.1": {
        result = await perplexityLlama31(prompt, map);
        break;
      }
      case "mistral-large-2": {
        result = await mistralLarge2(prompt, map);
        break;
      }
      default: {
        throw new Error(`Tried running unknown model '${modelId}'`);
      }
    }

    reasoning = result.reasoning;

    const originalMap = ZombieSurvival.cloneMap(map);
    const [playerRow, playerCol] = result.playerCoordinates;

    if (originalMap[playerRow][playerCol] !== " ") {
      throw new Error("Tried to place player in a non-empty space");
    }

    originalMap[playerRow][playerCol] = "P";

    for (const block of result.boxCoordinates) {
      const [blockRow, blockCol] = block;

      if (originalMap[blockRow][blockCol] !== " ") {
        throw new Error("Tried to place block in a non-empty space");
      }

      originalMap[blockRow][blockCol] = "B";
    }

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

    return await runModel(modelId, map, prompt, retry + 1);
  }
}
