import { type ModelHandler, getValidLocations } from ".";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const responseSchema = z.object({
  reasoning: z.string(),
  playerCoordinates: z.array(z.number()),
  boxCoordinates: z.array(z.array(z.number())),
});

export const gpt4o: ModelHandler = async (prompt, map, config) => {
  const openai = new OpenAI();

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    top_p: config.topP,
    messages: [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: `
Grid: ${JSON.stringify(map)}

Valid Locations: ${JSON.stringify(getValidLocations(map))}
`,
      },
    ],
    response_format: zodResponseFormat(responseSchema, "game_map"),
  });

  const response = completion.choices[0].message;

  if (response.refusal) {
    throw new Error(`Refusal: ${response.refusal}`);
  } else if (!response.parsed) {
    throw new Error("Failed to run model GPT-4o");
  }

  return {
    boxCoordinates: response.parsed.boxCoordinates,
    playerCoordinates: response.parsed.playerCoordinates,
    reasoning: response.parsed.reasoning,
  };
};
