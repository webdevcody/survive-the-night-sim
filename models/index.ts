import { gemini15pro } from "./gemini-1.5-pro";
import { gpt4o } from "./gpt-4o";

export interface ModelResult {
  solution: string[][];
  reasoning: string;
}

export async function runModel(
  modelId: string,
  map: string[][],
): Promise<ModelResult> {
  switch (modelId) {
    case "gemini-1.5-pro": {
      return gemini15pro(map);
    }
    case "gpt-4o": {
      return gpt4o(map);
    }
    default: {
      throw new Error(`Tried running unknown model '${modelId}'`);
    }
  }
}
