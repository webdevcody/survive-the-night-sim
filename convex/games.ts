import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import { AI_MODEL_SLUGS, ModelSlug } from "./constants";

export const testModel = mutation({
  args: {
    modelId: v.string(),
  },
  handler: async (ctx, args) => {
    const flags = await ctx.runQuery(api.flags.getFlags);

    if (!flags.showTestPage) {
      throw new Error("Test page is not enabled");
    }

    const gameId: Id<"games"> = await ctx.runMutation(
      internal.games.startNewGame,
      {
        modelId: args.modelId,
      },
    );

    return gameId;
  },
});

export const startNewGame = internalMutation({
  args: {
    modelId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!AI_MODEL_SLUGS.includes(args.modelId as ModelSlug)) {
      throw new Error("Invalid model ID");
    }

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

    await ctx.scheduler.runAfter(0, internal.maps.playMapAction, {
      gameId,
      modelId: args.modelId,
      level: 1,
    });

    return gameId;
  },
});

export const getGame = query({
  args: {
    gameId: v.id("games"),
  },
  handler: async ({ db }, args) => {
    return db.get(args.gameId);
  },
});
