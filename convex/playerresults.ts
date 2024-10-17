import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserMapStatus = query({
  args: {
    userId: v.id("users"),
    mapId: v.id("maps"),
  },
  handler: async ({ db }, { userId, mapId }) => {
    const res = await db
      .query("userResults")
      .withIndex("by_mapId_userId", (q) =>
        q.eq("mapId", mapId).eq("userId", userId),
      )
      .collect();
    return res[0].hasWon;
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

    return mapWinCounts;
  },
});

export const getPlayerRecordsForAMap = query({
  args: {
    userId: v.id("users"),
    mapId: v.id("maps"),
  },
  handler: async ({ db }, { userId, mapId }) => {
    const res = await db
      .query("userResults")
      .withIndex("by_mapId_userId", (q) =>
        q.eq("mapId", mapId).eq("userId", userId),
      )
      .collect();

    const resPopulated = Promise.all(
      (res[0].attempts ?? []).map((attemptId) => db.get(attemptId)),
    );

    return {
      ...res[0],
      attempts: resPopulated,
    };
  },
});

export const updateUserResult = mutation({
  args: {
    userId: v.id("users"),
    mapId: v.id("maps"),
    hasWon: v.boolean(),
    placedGrid: v.array(v.array(v.string())),
  },
  handler: async (ctx, { userId, mapId, hasWon, placedGrid }) => {
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
