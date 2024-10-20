import { type ModelHandler } from ".";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const schema = {
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

interface GeminiResponse {
  boxCoordinates: number[][];
  map: string[][];
  playerCoordinates: number[];
  reasoning: string;
}

export const gemini15pro: ModelHandler = async (prompt, map) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const result = await model.generateContent(
    `${prompt}\n\nGrid: ${JSON.stringify(map)}`,
  );

  // todo: check if the response is valid acc to types and the player and box coordinates are valid,
  // as sometimes the model returns a state that's erroring out in the simulator

  const parsedResponse = JSON.parse(result.response.text()) as GeminiResponse;

  return {
    boxCoordinates: parsedResponse.boxCoordinates,
    playerCoordinates: parsedResponse.playerCoordinates,
    reasoning: parsedResponse.reasoning,
  };
};
