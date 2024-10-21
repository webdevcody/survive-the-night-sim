import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";

export const getUserAttempt = query({
  args: {
    attempt: v.number(),
    level: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    }

    const map = await ctx.runQuery(api.maps.getMapByLevel, {
      level: args.level,
    });

    if (map === null) {
      return null;
    }

    const userResults = await ctx.db
      .query("userResults")
      .withIndex("by_mapId_userId", (q) =>
        q.eq("mapId", map._id).eq("userId", userId),
      )
      .collect();

    if (userResults.length !== 1) {
      return null;
    }

    const userResult = userResults[0];

    if (userResult.attempts.length < args.attempt) {
      return null;
    }

    const attemptId: Id<"attempts"> = userResult.attempts[args.attempt - 1];
    return await ctx.db.get(attemptId);
  },
});
