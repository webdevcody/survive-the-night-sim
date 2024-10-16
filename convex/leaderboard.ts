import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const getGlobalRankings = query({
  handler: async ({ db }) => {
    const res = await db.query("globalrankings").collect();
    // Sort the results by wins/losses ratio

    const sortedResults = res.sort((a, b) => {
      if (a.wins / (a.wins + a.losses) > b.wins / (b.wins + b.losses)) {
        return -1;
      }
      if (a.wins / (a.wins + a.losses) < b.wins / (b.wins + b.losses)) {
        return 1;
      }
      return 0;
    });

    return sortedResults;
  },
});

export const getLevelRankings = query({
  handler: async ({ db }) => {
    const res = await db.query("levelrankings").collect();

    const sortedResults = res.sort((a, b) => {
      if (a.level < b.level) {
        return -1;
      }
      if (a.level > b.level) {
        return 1;
      }
      return 0;
    });

    return sortedResults;
  },
});

export const updateRankings = internalMutation({
  args: {
    modelId: v.string(),
    level: v.number(),
    isWin: v.boolean(),
  },
  handler: async (ctx, args) => {
    const globalRanking = await ctx.db
      .query("globalrankings")
      .withIndex("by_modelId", (q) => q.eq("modelId", args.modelId))
      .collect();
    const levelRanking = await ctx.db
      .query("levelrankings")
      .withIndex("by_modelId_level", (q) =>
        q.eq("modelId", args.modelId).eq("level", args.level),
      )
      .collect();

    if (globalRanking.length === 0) {
      await ctx.db.insert("globalrankings", {
        modelId: args.modelId,
        wins: args.isWin ? 1 : 0,
        losses: args.isWin ? 0 : 1,
      });
    } else {
      await ctx.db.patch(globalRanking[0]._id, {
        wins: globalRanking[0].wins + (args.isWin ? 1 : 0),
        losses: globalRanking[0].losses + (args.isWin ? 0 : 1),
      });
    }

    if (levelRanking.length === 0) {
      await ctx.db.insert("levelrankings", {
        modelId: args.modelId,
        level: args.level,
        wins: args.isWin ? 1 : 0,
        losses: args.isWin ? 0 : 1,
      });
    } else {
      await ctx.db.patch(levelRanking[0]._id, {
        wins: levelRanking[0].wins + (args.isWin ? 1 : 0),
        losses: levelRanking[0].losses + (args.isWin ? 0 : 1),
      });
    }
  },
});
