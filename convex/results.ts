import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { internalMutation, query } from "./_generated/server";
import { PLAY_DELAY } from "./constants";

export type ResultWithGame = Awaited<
  ReturnType<typeof getLastCompletedResults>
>[number];

export const getResults = query({
  args: {
    gameId: v.id("games"),
  },
  handler: async ({ db }, args) => {
    const results = await db
      .query("results")
      .withIndex("by_gameId_level", (q) => q.eq("gameId", args.gameId))
      .collect();
    results.sort((a, b) => b.level - a.level);
    return results;
  },
});

export const getLastCompletedResults = query({
  handler: async ({ db }) => {
    const results = await db.query("results").order("desc").take(20);

    return Promise.all(
      results.map(async (result) => ({
        ...result,
        game: await db.get(result.gameId),
      })),
    );
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
    map: v.optional(v.array(v.array(v.string()))),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.get(args.resultId);

    if (!result) {
      throw new Error("Result not found");
    }

    await ctx.db.patch(args.resultId, {
      isWin: args.isWin,
      reasoning: args.reasoning,
      status: args.error ? "failed" : "completed",
      map: args.map ?? [],
      error: args.error,
    });

    const game = await ctx.db.get(result.gameId);

    if (!game) {
      throw new Error("Game not found");
    }

    const maps = await ctx.db.query("maps").collect();

    const lastLevel = maps.reduce((acc, map) => {
      if (map.level) {
        return Math.max(acc, map.level);
      }
      return acc;
    }, 0);

    await ctx.runMutation(internal.leaderboard.updateRankings, {
      modelId: game.modelId,
      level: result.level,
      isWin: args.isWin,
    });

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

      await ctx.scheduler.runAfter(PLAY_DELAY, internal.maps.playMapAction, {
        gameId: result.gameId,
        modelId: game.modelId,
        level: result.level + 1,
      });
    }
  },
});
