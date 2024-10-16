import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const incrementScore = internalMutation({
  args: {
    modelId: v.string(),
  },
  handler: async (ctx, args) => {
    const score = await ctx.db
      .query("scores")
      .filter((q) => q.eq(q.field("modelId"), args.modelId))
      .first();

    if (!score) {
      await ctx.db.insert("scores", {
        modelId: args.modelId,
        score: 1,
      });
    } else {
      await ctx.db.patch(score._id, {
        score: 1,
      });
    }
  },
});
