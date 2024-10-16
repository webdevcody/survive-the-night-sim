import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { AI_MODEL_IDS } from "./constants";

export const startNewGame = mutation({
  args: { modelId: v.string() },
  handler: async (ctx, args) => {
    if (!AI_MODEL_IDS.includes(args.modelId)) {
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

    await ctx.scheduler.runAfter(0, internal.openai.playMapAction, {
      gameId,
      modelId: args.modelId,
      level: 1,
    });

    return gameId;
  },
});

export const getGame = query({
  args: { gameId: v.id("games") },
  handler: async ({ db }, args) => {
    return db.get(args.gameId);
  },
});
