import { type MultiplayerModelHandler } from ".";
import { isJSON } from "../../lib/utils";
import { calculateTotalCost } from "../pricing";
import { z } from "zod";

const completionSchema = z.object({
  id: z.string(),
  model: z.string(),
  object: z.string(),
  created: z.number(),
  choices: z.array(
    z.object({
      index: z.number(),
      finish_reason: z.string(),
      message: z.object({
        role: z.string(),
        content: z.string(),
      }),
    }),
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

const responseSchema = z.object({
  moveDirection: z.string(),
  zombieToShoot: z.array(z.number()),
});

export const perplexityLlama31: MultiplayerModelHandler = async (
  systemPrompt,
  userPrompt,
  config,
) => {
  const completion = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-large-128k-online",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      top_p: config.topP,
    }),
  });

  if (!completion.ok) {
    const errorData = await completion.json();
    throw new Error(
      `HTTP error! status: ${completion.status}, message: ${JSON.stringify(errorData)}`,
    );
  }

  const data = await completion.json();
  const validatedResponse = await completionSchema.safeParseAsync(data);

  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error.message);
  }

  const content = validatedResponse.data.choices[0].message.content;
  const promptTokens = validatedResponse.data.usage.prompt_tokens;
  const outputTokens = validatedResponse.data.usage.completion_tokens;

  // Extract JSON from markdown code block if present
  const jsonContent = content.match(/```json([^`]+)```/)?.[1] ?? "";

  if (!isJSON(jsonContent)) {
    throw new Error("JSON returned by perplexity is malformed");
  }

  const parsedContent = JSON.parse(jsonContent);
  const response = await responseSchema.safeParseAsync(parsedContent);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  const cost = calculateTotalCost(
    "perplexity-llama-3.1",
    promptTokens,
    outputTokens,
  );

  return {
    moveDirection: response.data.moveDirection,
    zombieToShoot: response.data.zombieToShoot,
    cost,
  };
};
