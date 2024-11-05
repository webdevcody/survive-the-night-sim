import { ModelSlug } from "@/convex/constants";

export interface ModelPricing {
  inputTokenPrice: number; // Price per 1M tokens
  outputTokenPrice: number; // Price per 1M tokens
  requestPrice?: number; // Fixed price per request if applicable
}

export const MODEL_PRICING: Record<ModelSlug, ModelPricing> = {
  "gpt-4o": {
    inputTokenPrice: 2.5,
    outputTokenPrice: 10.0,
  },
  "claude-3.5-sonnet": {
    inputTokenPrice: 3.0,
    outputTokenPrice: 15.0,
  },
  "perplexity-llama-3.1": {
    inputTokenPrice: 1.0,
    outputTokenPrice: 1.0,
    requestPrice: 0.005,
  },
  "mistral-large-2": {
    inputTokenPrice: 2.0,
    outputTokenPrice: 6.0,
  },
  "gemini-1.5-pro": {
    inputTokenPrice: 1.25,
    outputTokenPrice: 5.0,
  },
};

export const getPriceForInputToken = (
  modelId: ModelSlug,
  tokenCount?: number,
) => {
  if (!tokenCount) {
    return 0;
  }

  const pricing = MODEL_PRICING[modelId];
  if (!pricing) {
    throw new Error(`No pricing found for model: ${modelId}`);
  }

  // Special case for Gemini 1.5 Pro
  if (modelId === "gemini-1.5-pro" && tokenCount > 128_000) {
    return (2.5 / 1_000_000) * tokenCount;
  }

  return (pricing.inputTokenPrice / 1_000_000) * tokenCount;
};

export const getPriceForOutputToken = (
  modelId: ModelSlug,
  tokenCount?: number,
) => {
  if (!tokenCount) {
    return 0;
  }

  const pricing = MODEL_PRICING[modelId];
  if (!pricing) {
    throw new Error(`No pricing found for model: ${modelId}`);
  }

  // Special case for Gemini 1.5 Pro
  if (modelId === "gemini-1.5-pro" && tokenCount > 128_000) {
    return (10.0 / 1_000_000) * tokenCount;
  }

  return (pricing.outputTokenPrice / 1_000_000) * tokenCount;
};

export const getRequestPrice = (modelId: ModelSlug) => {
  const pricing = MODEL_PRICING[modelId];
  return pricing?.requestPrice ?? 0;
};

export const calculateTotalCost = (
  modelId: ModelSlug,
  promptTokens?: number,
  outputTokens?: number,
) => {
  return (
    getPriceForInputToken(modelId, promptTokens) +
    getPriceForOutputToken(modelId, outputTokens) +
    getRequestPrice(modelId)
  );
};
