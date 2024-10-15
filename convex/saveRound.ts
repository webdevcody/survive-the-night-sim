// File: convex/saveRoundMutation.ts

import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const saveRoundMutation = mutation({
  args: {
    gameId: v.id("games"),
    roundId: v.string(),
    level: v.number(),
    isWin: v.boolean(),
    reasoning: v.string(),
  },
  handler: async (ctx, args) => {
    const { gameId, roundId, level, isWin, reasoning } = args;

    // 1. Save the round result
    const resultId = await ctx.db.insert("results", {
      gameId,
      roundId,
      level,
      isWin,
      reasoning,
    });

    // 2. If the game was won, update the score
    let updatedScore = null;
    if (isWin) {
      // Find the game to get the modelId
      const game = await ctx.db.get(gameId);

      if (game) {
        // Get the current score or initialize it
        const currentScore = await ctx.db
          .query("scores")
          .filter((q) => q.eq(q.field("modelId"), game.modelId))
          .first();

        if (currentScore) {
          // Update existing score
          updatedScore = await ctx.db.patch(currentScore._id, {
            score: currentScore.score + 1,
          });
        } else {
          // Create new score entry
          updatedScore = await ctx.db.insert("scores", {
            modelId: game.modelId,
            score: 0,
          });
        }
      }
    }

    return {
      success: true,
      message: "Round result saved successfully",
      resultId,
      updatedScore,
    };
  },
});
