import { type ModelHandler } from ".";
import { isJSON } from "../lib/utils";
import { Mistral } from "@mistralai/mistralai";
import { z } from "zod";

const responseSchema = z.object({
  reasoning: z.string(),
  playerCoordinates: z.array(z.number()),
  boxCoordinates: z.array(z.array(z.number())),
});

export const mistralLarge2: ModelHandler = async (prompt, map) => {
  const promptAnswerRequirement =
    'Answer only with JSON containing "playerCoordinates" key, "boxCoordinates" key,' +
    'and a single paragraph explaining your placement strategy as "reasoning" key.';

  const client = new Mistral();

  const completion = await client.chat.complete({
    model: "mistral-large-2407",
    messages: [
      {
        role: "user",
        content: `${prompt}\n\nMap: ${JSON.stringify(map)}\n\n${promptAnswerRequirement}`,
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
