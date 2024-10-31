import { type ModelHandler } from ".";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

interface GeminiResponse {
  boxCoordinates: number[][];
  map: string[][];
  playerCoordinates: number[];
  reasoning: string;
}

const responseSchema = {
  description: "Game Round Results",
  type: SchemaType.OBJECT,
  properties: {
    map: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.STRING,
        },
      },
      description: "The resulting map after the placements",
    },
    reasoning: {
      type: SchemaType.STRING,
      description: "The reasoning behind the move",
    },
    playerCoordinates: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.NUMBER,
      },
      description: "The player's coordinates",
    },
    boxCoordinates: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.NUMBER,
        },
      },
      description: "The box coordinates",
    },
  },
  required: ["map", "reasoning", "playerCoordinates", "boxCoordinates"],
};

export const gemini15pro: ModelHandler = async (
  systemPrompt,
  userPrompt,
  config,
) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    systemInstruction: systemPrompt,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
      maxOutputTokens: config.maxTokens,
      temperature: config.temperature,
      topP: config.topP,
    },
  });

  const result = await model.generateContent(userPrompt);
  const parsedResponse = JSON.parse(result.response.text()) as GeminiResponse;

  const promptTokens = result.response.usageMetadata?.promptTokenCount;
  const outputTokens = result.response.usageMetadata?.candidatesTokenCount;
  const totalTokensUsed = result.response.usageMetadata?.totalTokenCount;

  // https://ai.google.dev/pricing#1_5pro
  const getPriceForInputToken = (tokenCount?: number) => {
    if (!tokenCount) {
      return 0;
    }
    if (tokenCount > 128_000) {
      return (2.5 / 1_000_000) * tokenCount;
    }
    return (1.25 / 1_000_000) * tokenCount;
  };

  const getPriceForOutputToken = (tokenCount?: number) => {
    if (!tokenCount) {
      return 0;
    }
    if (tokenCount > 128_000) {
      return (10.0 / 1_000_000) * tokenCount;
    }
    return (5.0 / 1_000_000) * tokenCount;
  };

  return {
    boxCoordinates: parsedResponse.boxCoordinates,
    playerCoordinates: parsedResponse.playerCoordinates,
    reasoning: parsedResponse.reasoning,
    promptTokens: promptTokens,
    outputTokens: outputTokens,
    totalTokensUsed: totalTokensUsed,
    totalRunCost:
      getPriceForInputToken(promptTokens) +
      getPriceForOutputToken(outputTokens),
  };
};
