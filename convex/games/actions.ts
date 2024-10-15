import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";

export const playMapAction = internalAction({
  args: {
    mapId: v.id("maps"),
    gameId: v.id("games"),
    modelId: v.string(),
    level: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.games.mutations.insertScore, {
      modelId: args.modelId,
      gameId: args.gameId,
      level: args.level,
    });

    console.log(
      `Playing map ${args.mapId} for game ${args.gameId} at level ${args.level}`,
    );
  },
});
