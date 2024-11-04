import { v } from "convex/values";
import { api } from "./_generated/api";
import { internalMutation } from "./_generated/server";

export const incrementScore = internalMutation({
  args: {
    modelId: v.string(),
  },
  handler: async (ctx, args) => {
    const score = await ctx.db
      .query("scores")
      .withIndex("by_modelId", (q) => q.eq("modelId", args.modelId))
      .first();

    const activePrompt = await ctx.runQuery(api.prompts.getActivePrompt);

    if (!score) {
      await ctx.db.insert("scores", {
        modelId: args.modelId,
        promptId: activePrompt._id,
        score: 1,
      });
    } else if (score) {
      await ctx.db.patch(score._id, {
        score: 1,
      });
    }
  },
});
