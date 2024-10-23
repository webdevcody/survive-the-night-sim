import { type ModelHandler } from ".";
import { Anthropic } from "@anthropic-ai/sdk";
import { z } from "zod";

const responseSchema = z.object({
  playerCoordinates: z.array(z.number()),
  boxCoordinates: z.array(z.array(z.number())),
  reasoning: z.string(),
});

export const claude35sonnet: ModelHandler = async (prompt, map, config) => {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const completion = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    top_p: config.topP,
    system: prompt,
    messages: [
      {
        role: "user",
        content: JSON.stringify(map),
      },
    ],
  });

  const content = completion.content[0];

  if (content.type !== "text") {
    throw new Error("Unexpected completion type from Claude");
  }

  const parsedContent = JSON.parse(content.text);
  const response = await responseSchema.safeParseAsync(parsedContent);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return {
    boxCoordinates: response.data.boxCoordinates,
    playerCoordinates: response.data.playerCoordinates,
    reasoning: response.data.reasoning,
  };
};
