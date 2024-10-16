import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { type ModelHandler } from ".";

const ResponseSchema = z.object({
  reasoning: z.string(),
  playerCoordinates: z.array(z.number()),
  boxCoordinates: z.array(z.array(z.number())),
});

export const gpt4o: ModelHandler = async (prompt, map) => {
  const openai = new OpenAI();

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: JSON.stringify(map),
      },
    ],
    response_format: zodResponseFormat(ResponseSchema, "game_map"),
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
