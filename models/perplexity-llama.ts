import { z } from "zod";
import { ModelHandler } from "./index";

const PerplexityResponseSchema = z.object({
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

const GameResponseSchema = z.object({
  reasoning: z.string(),
  playerCoordinates: z.array(z.number()),
  boxCoordinates: z.array(z.array(z.number())),
});

export const perplexityModel: ModelHandler = async (
  prompt: string,
  map: string[][],
) => {
  const messages = [
    { role: "system", content: "Be precise and concise." },
    { role: "user", content: `${prompt}\n\nMap:\n${JSON.stringify(map)}` },
  ];

  const data = {
    model: "llama-3.1-sonar-large-128k-online",
    messages,
    temperature: 0.2,
    top_p: 0.9,
    return_citations: true,
    search_domain_filter: ["perplexity.ai"],
    return_images: false,
    return_related_questions: false,
    search_recency_filter: "month",
    top_k: 0,
    stream: false,
    presence_penalty: 0,
    frequency_penalty: 1,
  };

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(
      `HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`,
    );
  }

  const responseData = await response.json();
  const validatedResponse = PerplexityResponseSchema.parse(responseData);
  const content = validatedResponse.choices[0].message.content;
  const parsedContent = JSON.parse(content);
  const gameResponse = GameResponseSchema.parse(parsedContent);

  return {
    boxCoordinates: gameResponse.boxCoordinates,
    playerCoordinates: gameResponse.playerCoordinates,
    reasoning: gameResponse.reasoning,
  };
};
