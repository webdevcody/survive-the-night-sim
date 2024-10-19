import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { mutation, query } from "./_generated/server";

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

export const getUserMapStatus = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return [];
    }
    const res = await ctx.db
      .query("userResults")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    return res.map((r) => {
      return {
        mapId: r.mapId,
        hasWon: r.hasWon,
      };
    });
  },
});

export const getMapsWins = query({
  handler: async ({ db }) => {
    const wonCounts = await db
      .query("userResults")
      .filter((q) => q.eq(q.field("hasWon"), true)) // Only users who have won
      .collect();

    // Format the results as a count per map
    const mapWinCounts = wonCounts.reduce(
      (counts, result) => {
        const mapId = result.mapId;
        if (mapId) {
          counts[mapId] = (counts[mapId] || 0) + 1;
        }
        return counts;
      },
      {} as Record<string, number>,
    );

    const res = [];

    for (const [mapId, count] of Object.entries(mapWinCounts)) {
      res.push({ mapId, count });
    }

    return res;
  },
});

export const getPlayerRecordsForAMap = query({
  args: {
    mapId: v.optional(v.id("maps")),
  },
  handler: async (ctx, { mapId }) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    }

    if (!mapId) {
      return {};
    }

    const res = await ctx.db
      .query("userResults")
      .withIndex("by_mapId_userId", (q) =>
        q.eq("mapId", mapId).eq("userId", userId),
      )
      .collect();

    if (res.length === 0) {
      return null;
    }

    const resPopulated = Promise.all(
      (res[0].attempts ?? []).map((attemptId) => ctx.db.get(attemptId)),
    );

    const resolvedAttempts = await resPopulated;

    return {
      hasWon: res[0].hasWon,
      attempts: resolvedAttempts,
    };
  },
});

export const updateUserResult = mutation({
  args: {
    mapId: v.id("maps"),
    hasWon: v.boolean(),
    placedGrid: v.array(v.array(v.string())),
  },
  handler: async (ctx, { mapId, hasWon, placedGrid }) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Not signed in");
    }

    const res = await ctx.db
      .query("userResults")
      .withIndex("by_mapId_userId", (q) =>
        q.eq("mapId", mapId).eq("userId", userId),
      )
      .collect();

    const attemptId = await ctx.db.insert("attempts", {
      grid: placedGrid,
      didWin: hasWon,
    });

    if (res.length === 0) {
      await ctx.db.insert("userResults", {
        userId,
        mapId,
        attempts: [attemptId],
        hasWon,
      });
    } else {
      await ctx.db.patch(res[0]._id, {
        attempts: [...res[0].attempts, attemptId],
        hasWon: res[0].hasWon || hasWon,
      });
    }
  },
});
