import { isJSON } from "../lib/utils";
import { z } from "zod";
import { ModelHandler, getValidLocations } from "./index";

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
      delta: z
        .object({
          role: z.string(),
          content: z.string(),
        })
        .optional(),
    }),
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

const responseSchema = z.object({
  playerCoordinates: z.array(z.number()),
  boxCoordinates: z.array(z.array(z.number())),
  reasoning: z.string(),
});

export const perplexityLlama31: ModelHandler = async (prompt, map, config) => {
  const completion = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-large-128k-online",
      messages: [
        { role: "system", content: prompt },
        {
          role: "user",
          content: `
Grid: ${JSON.stringify(map)}

Valid Locations: ${JSON.stringify(getValidLocations(map))}
`,
        },
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      top_p: config.topP,
      search_domain_filter: ["perplexity.ai"],
      search_recency_filter: "month",
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
  const jsonContent = content.match(/```json([^`]+)```/)?.[1] ?? "";

  if (!isJSON(jsonContent)) {
    throw new Error("JSON returned by perplexity is malformed");
  }

  const parsedContent = JSON.parse(jsonContent);
  const response = await responseSchema.safeParseAsync(parsedContent);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};
