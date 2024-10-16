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
    case "gpt-4o": {
      return gpt4o(map);
    }
    default: {
      throw new Error(`Tried running unknown model '${modelId}'`);
    }
  }
}
