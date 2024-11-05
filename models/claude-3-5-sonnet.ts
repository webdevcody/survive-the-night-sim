import { type ModelHandler } from ".";
import { Anthropic } from "@anthropic-ai/sdk";
import { z } from "zod";
import { calculateTotalCost } from "./pricing";

const responseSchema = z.object({
  playerCoordinates: z.array(z.number()),
  boxCoordinates: z.array(z.array(z.number())),
  reasoning: z.string(),
});

export const claude35sonnet: ModelHandler = async (
  systemPrompt,
  userPrompt,
  config,
) => {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const completion = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    top_p: config.topP,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  const content = completion.content[0];

  if (content.type !== "text") {
    throw new Error("Unexpected completion type from Claude");
  }

  const jsonStartIndex = content.text.indexOf("{");
  const jsonEndIndex = content.text.lastIndexOf("}") + 1;
  const jsonString = content.text.substring(jsonStartIndex, jsonEndIndex);

  const parsedContent = JSON.parse(jsonString);
  const response = await responseSchema.safeParseAsync(parsedContent);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  const promptTokens = completion.usage.input_tokens;
  const outputTokens = completion.usage.output_tokens;
  const totalTokensUsed =
    completion.usage.input_tokens + completion.usage.output_tokens;

  return {
    boxCoordinates: response.data.boxCoordinates,
    playerCoordinates: response.data.playerCoordinates,
    reasoning: response.data.reasoning,
    promptTokens: promptTokens,
    outputTokens: outputTokens,
    totalTokensUsed: totalTokensUsed,
    totalRunCost: calculateTotalCost(
      "claude-3.5-sonnet",
      promptTokens,
      outputTokens,
    ),
  };
};
