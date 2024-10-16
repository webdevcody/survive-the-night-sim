import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { ZombieSurvival } from "../simulators/zombie-survival";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const schema = {
  description: "Game Round Results",
  type: SchemaType.OBJECT,
  properties: {
    map: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.STRING,
        },
      },
      description: "The resulting map after the placements",
    },
    reasoning: {
      type: SchemaType.STRING,
      description: "The reasoning behind the move",
    },
    playerCoordinates: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.NUMBER,
      },
      description: "The player's coordinates",
    },
    boxCoordinates: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.NUMBER,
        },
      },
      description: "The box coordinates",
    },
  },
  required: ["map", "reasoning", "playerCoordinates", "boxCoordinates"],
};

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema,
  },
});

type playMapActionResponse = {
  map: string[][];
  reasoning: string;
  playerCoordinates: number[];
  boxCoordinates: number[][];
};

export const playMapAction = internalAction({
  args: {
    level: v.number(),
    gameId: v.id("games"),
    modelId: v.string(),
  },
  handler: async (ctx, args) => {
    const resultId = await ctx.runMutation(
      internal.results.createInitialResult,
      {
        gameId: args.gameId,
        level: args.level,
      },
    );

    const map: Doc<"maps"> | null = (await ctx.runQuery(
      api.maps.getMapByLevel,
      {
        level: args.level,
      },
    )) as any;

    if (!map) {
      throw new Error("Map not found");
    }

    if (process.env.MOCK_GEMINI === "true") {
      const existingMap = [...map.grid.map((row) => [...row])];
      existingMap[0][0] = "P";
      existingMap[0][1] = "B";
      existingMap[0][2] = "B";
      return {
        map: existingMap,
        reasoning: "This is a mock response",
        playerCoordinates: [0, 0],
        boxCoordinates: [],
      };
    }

    const result = await model.generateContent(
      `You're given a 2d grid of nums such that.
              " " represents an empty space.
              "Z" represents a zombie. Zombies move one Manhattan step every turn and aim to reach the player.
              "R" represents rocks, which players can shoot over but zombies cannot pass through or break.
              "P" represents the player, who cannot move. The player's goal is to shoot and kill zombies before they reach them.
              "B" represents blocks that can be placed before the round begins to hinder the zombies. You can place up to two blocks on the map.
                                
              Your goal is to place the player ("P") and two blocks ("B") in locations that maximize the player's survival by delaying the zombies' approach.
              You can shoot any zombie regardless of where it is on the grid.
              Returning a 2d grid with the player and blocks placed in the optimal locations, with the coordinates player ("P") and the blocks ("B"), also provide reasoning for the choices.
                                
              You can't replace rocks R or zombies Z with blocks.  If there is no room to place a block, do not place any.
              
              Grid: ${JSON.stringify(map)}`,
    );

    // todo: check if the response is valid acc to types and the player and box coordinates are valid,
    // as sometimes the model returns a state that's erroring out in the simulator

    const parsedResponse = JSON.parse(
      result.response.text(),
    ) as playMapActionResponse;

    const game = new ZombieSurvival(parsedResponse.map);
    while (!game.finished()) {
      game.step();
    }
    const isWin = !game.getPlayer().dead();

    await ctx.runMutation(internal.results.updateResult, {
      resultId,
      isWin,
      reasoning: parsedResponse.reasoning,
      map: parsedResponse.map,
    });
  },
});
