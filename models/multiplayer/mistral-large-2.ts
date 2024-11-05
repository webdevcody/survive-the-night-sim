import { type MultiplayerModelHandler } from ".";
import { calculateTotalCost } from "../pricing";
import { Mistral } from "@mistralai/mistralai";
import { z } from "zod";

const responseSchema = z.object({
  moveDirection: z.string(),
  zombieToShoot: z.array(z.number()),
});

export const mistralLarge2: MultiplayerModelHandler = async (
  systemPrompt,
  userPrompt,
  config,
) => {
  const client = new Mistral();

  const completion = await client.chat.complete({
    model: "mistral-large-2407",
    maxTokens: config.maxTokens,
    temperature: config.temperature,
    topP: config.topP,
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
    responseFormat: {
      type: "json_object",
    },
  });

  const content = completion.choices?.[0].message.content ?? "";
  const parsedContent = JSON.parse(content);
  const response = await responseSchema.safeParseAsync(parsedContent);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  const promptTokens = completion.usage.promptTokens;
  const outputTokens = completion.usage.completionTokens;

  return {
    moveDirection: response.data.moveDirection,
    zombieToShoot: response.data.zombieToShoot,
    cost: calculateTotalCost("mistral-large-2", promptTokens, outputTokens),
  };
};
