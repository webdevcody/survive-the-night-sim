import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const playMapAction = internalAction({
  args: {
    mapId: v.id("maps"),
    gameId: v.id("games"),
    modelId: v.string(),
    level: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.games.insertScore, {
      modelId: args.modelId,
      gameId: args.gameId,
      level: args.level,
    });

    console.log(
      `Playing map ${args.mapId} for game ${args.gameId} at level ${args.level}`,
    );
  },
});

export const createNewGame = internalMutation({
  args: { modelId: v.string() },
  handler: async (ctx, args) => {
    const gameId = await ctx.db.insert("games", {
      modelId: args.modelId,
      currentLevel: 1,
      status: "in_progress",
    });

    const firstMap = await ctx.db
      .query("maps")
      .withIndex("by_level", (q) => q.eq("level", 1))
      .first();

    if (!firstMap) {
      throw new Error("No map found for level 1");
    }

    // not sure if this is the way to do this
    await ctx.scheduler.runAfter(0, internal.games.playMapAction, {
      mapId: firstMap._id,
      gameId,
      modelId: args.modelId,
      level: 1,
    });

    return gameId;
  },
});

export const insertScore = internalMutation({
  args: {
    modelId: v.string(),
    gameId: v.id("games"),
    level: v.number(),
  },
  handler: async ({ db }, args) => {
    await db.insert("scores", {
      modelId: args.modelId,
      gameId: args.gameId,
      score: 0,
      level: args.level,
    });
  },
});
