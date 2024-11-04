import { type MultiplayerModelHandler } from ".";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const responseSchema = z.object({
  moveLocation: z.array(z.number()),
});

export const gpt4o: MultiplayerModelHandler = async (
  systemPrompt,
  userPrompt,
  config,
) => {
  const openai = new OpenAI();

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    top_p: config.topP,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
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
    moveLocation: response.parsed.moveLocation,
    reasoning: "because",
  };
};
