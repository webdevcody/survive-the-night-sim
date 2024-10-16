import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";

export const getResults = query({
  args: { gameId: v.id("games") },
  handler: async ({ db }, args) => {
    const results = await db
      .query("results")
      .withIndex("by_gameId_level", (q) => q.eq("gameId", args.gameId))
      .collect();
    results.sort((a, b) => b.level - a.level);
    return results;
  },
});

export const createInitialResult = internalMutation({
  args: {
    gameId: v.id("games"),
    level: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("results", {
      gameId: args.gameId,
      level: args.level,
      reasoning: "",
      status: "inProgress",
      isWin: false,
      map: [],
    });
  },
});

export const updateResult = internalMutation({
  args: {
    resultId: v.id("results"),
    isWin: v.boolean(),
    reasoning: v.string(),
    map: v.array(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.get(args.resultId);

    if (!result) {
      throw new Error("Result not found");
    }

    await ctx.db.patch(args.resultId, {
      isWin: args.isWin,
      reasoning: args.reasoning,
      status: "completed",
      map: args.map,
    });

    const game = await ctx.db.get(result.gameId);

    const maps = await ctx.db.query("maps").collect();

    const lastLevel = maps.reduce((max, map) => Math.max(max, map.level), 0);

    if (!game) {
      throw new Error("Game not found");
    }

    if (args.isWin) {
      await ctx.runMutation(internal.scores.incrementScore, {
        modelId: game.modelId,
      });
    }

    if (result.level < lastLevel) {
      const map = await ctx.runQuery(api.maps.getMapByLevel, {
        level: result.level + 1,
      });

      if (!map) {
        throw new Error("Next map not found");
      }

      await ctx.scheduler.runAfter(0, internal.openai.playMapAction, {
        modelId: game.modelId,
        level: result.level + 1,
        gameId: result.gameId,
      });
    }
  },
});
