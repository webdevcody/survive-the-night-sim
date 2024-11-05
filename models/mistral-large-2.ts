import { type ModelHandler } from ".";
import { isJSON } from "../lib/utils";
import { Mistral } from "@mistralai/mistralai";
import { z } from "zod";
import { calculateTotalCost } from "./pricing";

const responseSchema = z.object({
  reasoning: z.string(),
  playerCoordinates: z.array(z.number()),
  boxCoordinates: z.array(z.array(z.number())),
  promptTokens: z.number().optional(),
  outputTokens: z.number().optional(),
  totalTokensUsed: z.number().optional(),
});

export const mistralLarge2: ModelHandler = async (
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

  if (!isJSON(content)) {
    throw new Error("Response received from Mistral is not JSON");
  }

  const promptTokens = completion.usage.promptTokens;
  const outputTokens = completion.usage.completionTokens;
  const totalTokensUsed = completion.usage.totalTokens;

  const response = await responseSchema.safeParseAsync({
    ...JSON.parse(content),
    promptTokens: completion.usage.promptTokens,
    outputTokens: completion.usage.completionTokens,
    totalTokensUsed: completion.usage.totalTokens,
    totalRunCost: calculateTotalCost(
      "mistral-large-2",
      promptTokens,
      outputTokens,
    ),
  });

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};
