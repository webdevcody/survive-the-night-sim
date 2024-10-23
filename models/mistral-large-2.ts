import { type ModelHandler } from ".";
import { isJSON } from "../lib/utils";
import { Mistral } from "@mistralai/mistralai";
import { z } from "zod";

const responseSchema = z.object({
  reasoning: z.string(),
  playerCoordinates: z.array(z.number()),
  boxCoordinates: z.array(z.array(z.number())),
});

export const mistralLarge2: ModelHandler = async (prompt, map, config) => {
  const client = new Mistral();

  const completion = await client.chat.complete({
    model: "mistral-large-2407",
    maxTokens: config.maxTokens,
    temperature: config.temperature,
    topP: config.topP,
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
    responseFormat: {
      type: "json_object",
    },
  });

  const content = completion.choices?.[0].message.content ?? "";

  if (!isJSON(content)) {
    throw new Error("Response received from Mistral is not JSON");
  }

  const response = await responseSchema.safeParseAsync(JSON.parse(content));

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};
