import { type MultiplayerModelHandler } from ".";
import { calculateTotalCost } from "../pricing";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    moveDirection: {
      type: SchemaType.STRING,
      description: "The direction to move: UP, DOWN, LEFT, RIGHT, or STAY",
    },
    zombieToShoot: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.NUMBER,
      },
      description: "The coordinates of the zombie to shoot [row, col]",
    },
  },
  required: ["moveDirection", "zombieToShoot"],
};

export const gemini15pro: MultiplayerModelHandler = async (
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
  const parsedResponse = JSON.parse(result.response.text());

  const promptTokens = result.response.usageMetadata?.promptTokenCount;
  const outputTokens = result.response.usageMetadata?.candidatesTokenCount;

  return {
    moveDirection: parsedResponse.moveDirection,
    zombieToShoot: parsedResponse.zombieToShoot,
    cost: calculateTotalCost("gemini-1.5-pro", promptTokens, outputTokens),
  };
};
