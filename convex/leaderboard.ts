import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const getGlobalRankings = query({
  handler: async ({ db }) => {
    const res = await db.query("globalRankings").collect();
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
    const res = await db.query("levelRankings").collect();

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
    const activePrompt = await ctx.runQuery(api.prompts.getActivePrompt);

    if (!activePrompt) {
      throw new Error("Active prompt not found");
    }

    const globalRanking = await ctx.db
      .query("globalRankings")
      .withIndex("by_modelId_promptId", (q) =>
        q.eq("modelId", args.modelId).eq("promptId", activePrompt._id),
      )
      .first();

    const levelRanking = await ctx.db
      .query("levelRankings")
      .withIndex("by_modelId_level_promptId", (q) =>
        q
          .eq("modelId", args.modelId)
          .eq("level", args.level)
          .eq("promptId", activePrompt._id),
      )
      .first();

    if (!globalRanking) {
      await ctx.db.insert("globalRankings", {
        modelId: args.modelId,
        wins: args.isWin ? 1 : 0,
        losses: args.isWin ? 0 : 1,
        promptId: activePrompt._id,
      });
    } else {
      await ctx.db.patch(globalRanking._id, {
        wins: globalRanking.wins + (args.isWin ? 1 : 0),
        losses: globalRanking.losses + (args.isWin ? 0 : 1),
      });
    }

    if (!levelRanking) {
      await ctx.db.insert("levelRankings", {
        modelId: args.modelId,
        level: args.level,
        wins: args.isWin ? 1 : 0,
        losses: args.isWin ? 0 : 1,
        promptId: activePrompt._id,
      });
    } else {
      await ctx.db.patch(levelRanking._id, {
        wins: levelRanking.wins + (args.isWin ? 1 : 0),
        losses: levelRanking.losses + (args.isWin ? 0 : 1),
      });
    }
  },
});
