import { isJSON } from "../lib/utils";
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
  playerCoordinates: z.array(z.number()),
  boxCoordinates: z.array(z.array(z.number())),
});

export const perplexityLlama: ModelHandler = async (
  prompt: string,
  map: string[][],
) => {
  const promptAnswerRequirement =
    "Answer only with JSON output and a single paragraph explaining your placement strategy.";

  const messages = [
    { role: "system", content: "Be precise and concise." },
    {
      role: "user",
      content: `${prompt}\n\nMap:\n${JSON.stringify(map)}\n\n${promptAnswerRequirement}`,
    },
  ];

  const data = {
    model: "llama-3.1-sonar-large-128k-online",
    messages,
    temperature: 0.2,
    top_p: 0.9,
    return_citations: false,
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

  const validatedResponse =
    await PerplexityResponseSchema.safeParseAsync(responseData);

  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error.message);
  }

  const content = validatedResponse.data.choices[0].message.content;
  const jsonContent = content.match(/```json([^`]+)```/)?.[1] ?? "";

  if (!isJSON(jsonContent)) {
    throw new Error("JSON returned by perplexity is malformed");
  }

  const parsedContent = JSON.parse(jsonContent);
  const gameResponse = await GameResponseSchema.safeParseAsync(parsedContent);

  if (!gameResponse.success) {
    throw new Error(gameResponse.error.message);
  }

  const reasoning = content
    .replace(/```json([^`]+)```/, "")
    .split("\n")
    .map((it) => it)
    .map((it) => it.replace(/(\*\*|```)/, "").trim())
    .filter((it) => it !== "")
    .join(" ");

  if (reasoning === "") {
    throw new Error("Answer returned by perplexity doesn't contain reasoning");
  }

  return {
    boxCoordinates: gameResponse.data.boxCoordinates,
    playerCoordinates: gameResponse.data.playerCoordinates,
    reasoning,
  };
};
