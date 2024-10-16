import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { type ModelResult } from ".";

const ResponseSchema = z.object({
  map: z.array(z.array(z.string())),
  reasoning: z.string(),
  playerCoordinates: z.array(z.number()),
  boxCoordinates: z.array(z.array(z.number())),
});

export async function gpt4o(map: string[][]): Promise<ModelResult> {
  const openai = new OpenAI();

  const prompt = `You're given a 2d grid of nums such that.
    " " represents an empty space.
    "Z" represents a zombie. Zombies move one Manhattan step every turn and aim to reach the player.
    "R" represents rocks, which players can shoot over but zombies cannot pass through or break.
    "P" represents the player, who cannot move. The player's goal is to shoot and kill zombies before they reach them.
    "B" represents blocks that can be placed before the round begins to hinder the zombies. You can place up to two blocks on the map.

    Your goal is to place the player ("P") and two blocks ("B") in locations that maximize the player's survival by delaying the zombies' approach.
    You can shoot any zombie regardless of where it is on the grid.
    Returning a 2d grid with the player and blocks placed in the optimal locations, with the coordinates player ("P") and the blocks ("B"), also provide reasoning for the choices.

    You can't replace rocks R or zombies Z with blocks.  If there is no room to place a block, do not place any.`;

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
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
    response_format: zodResponseFormat(ResponseSchema, "game_map"),
  });

  const response = completion.choices[0].message;

  if (response.refusal) {
    throw new Error(`Refusal: ${response.refusal}`);
  } else if (!response.parsed) {
    throw new Error("Failed to run model GPT-4o");
  }

  return {
    solution: response.parsed.map,
    reasoning: response.parsed.reasoning,
  };
}
