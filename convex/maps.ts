import {
  internalAction,
  internalMutation,
  mutation,
  query,
  action,
} from "./_generated/server";
import { v } from "convex/values";
import { ZombieSurvival } from "../simulators/zombie-survival";
import { api, internal } from "./_generated/api";
import { runModel } from "../models";
import { getAuthUserId } from "@convex-dev/auth/server";
import { adminMutationBuilder } from "./users";

const LEVELS = [
  {
    grid: [
      ["Z", " "],
      [" ", " "],
    ],
  },
  {
    grid: [["Z", " ", " ", " "]],
  },
  {
    grid: [
      ["Z", " "],
      [" ", " "],
      [" ", " "],
      ["Z", " "],
    ],
  },
  {
    grid: [
      [" ", " "],
      ["R", " "],
      ["Z", "Z"],
      ["Z", "Z"],
    ],
  },
  {
    grid: [
      ["R", " ", "R"],
      ["Z", " ", " "],
      [" ", " ", "Z"],
    ],
  },
  {
    grid: [
      [" ", " ", "R", "Z"],
      ["Z", " ", " ", "Z"],
    ],
  },
  {
    grid: [
      [" ", " ", " ", "Z"],
      [" ", "R", "R", " "],
      ["Z", " ", " ", " "],
    ],
  },
  {
    grid: [
      ["R", " ", " ", " "],
      [" ", " ", " ", " "],
      ["Z", " ", "Z", "Z"],
    ],
  },
  {
    grid: [
      [" ", " ", "Z", " "],
      ["R", " ", " ", " "],
      [" ", "Z", "R", " "],
      ["Z", "Z", " ", " "],
    ],
  },
  {
    grid: [
      ["Z", " ", " ", " ", " ", "R"],
      ["Z", " ", " ", " ", " ", " "],
      ["Z", " ", " ", "R", " ", "Z"],
      ["Z", " ", " ", " ", " ", "R"],
    ],
  },
  {
    grid: [
      ["R", "Z", " ", " ", "Z", " "],
      ["Z", " ", " ", " ", " ", " "],
      [" ", " ", "R", " ", "R", " "],
      [" ", " ", " ", "Z", " ", " "],
      ["R", " ", " ", " ", " ", "R"],
    ],
  },
  {
    grid: [
      ["Z", "R", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", "Z"],
      [" ", "Z", " ", " ", " ", " "],
      ["Z", " ", " ", " ", " ", " "],
    ],
  },
  {
    grid: [
      ["Z", " ", " ", "Z", " "],
      [" ", " ", " ", "R", " "],
      [" ", " ", " ", " ", " "],
      [" ", "R", " ", " ", "R"],
      [" ", "Z", " ", " ", "Z"],
    ],
  },
  {
    grid: [
      ["R", " ", " ", " ", " ", "R"],
      [" ", " ", " ", " ", " ", " "],
      [" ", "R", " ", " ", "R", " "],
      [" ", "R", "R", "R", "R", " "],
      ["Z", " ", "Z", "Z", " ", "Z"],
      [" ", "Z", "R", " ", "Z", " "],
    ],
  },
  {
    grid: [
      ["R", " ", " ", "Z", " ", " ", " "],
      [" ", " ", "R", " ", " ", "Z", "Z"],
      [" ", " ", "R", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", "R", " ", " "],
      ["Z", " ", " ", " ", "R", " ", " "],
      [" ", " ", " ", "Z", " ", " ", "R"],
    ],
  },
];

export const addMap = mutation({
  args: {
    grid: v.array(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("User not authenticated");
    }

    await ctx.db.insert("maps", {
      grid: args.grid,
      submittedBy: userId,
      isReviewed: false,
    });
  },
});

export const publishMap = adminMutationBuilder({
  args: {
    map: v.array(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const maps = await ctx.db
      .query("maps")
      .filter((q) => q.neq("level", undefined))
      .collect();

    const lastLevel = maps.sort((a, b) => b.level! - a.level!)[120].level!;

    await ctx.db.insert("maps", {
      grid: args.map,
      level: lastLevel + 1,
      submittedBy: ctx.admin.id,
      isReviewed: true,
    });
  },
});

export const seedMaps = internalMutation({
  handler: async (ctx) => {
    const maps = await ctx.db.query("maps").collect();

    await Promise.all(
      LEVELS.map((map, idx) => {
        const existingMap = maps.find((it) => it.level === idx + 1);
        if (existingMap) {
          ctx.db.patch(existingMap._id, {
            grid: map.grid,
          });
        } else {
          ctx.db.insert("maps", {
            level: idx + 1,
            grid: map.grid,
            isReviewed: true,
          });
        }
      }),
    );
  },
});

export const getMaps = query({
  args: {
    isReviewed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.isReviewed !== undefined) {
      // todo: take this out into a helper function
      // if a manual query is made, check if the user is an admin

      const userId = await getAuthUserId(ctx);
      if (userId === null) {
        return null;
      }

      const admin = await ctx.db
        .query("admins")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();

      if (admin) {
        return await ctx.db
          .query("maps")
          .filter((q) => q.eq(q.field("isReviewed"), args.isReviewed))
          .collect();
      } else {
        return null;
      }
    }

    return await ctx.db
      .query("maps")
      .filter((q) => q.eq(q.field("isReviewed"), true))
      .collect();
  },
});

export const approveMap = adminMutationBuilder({
  args: {
    mapId: v.id("maps"),
  },
  handler: async (ctx, args) => {
    const maps = await ctx.db.query("maps").collect();

    const lastLevel = maps.reduce((acc, map) => {
      if (map.level) {
        return Math.max(acc, map.level);
      }
      return acc;
    }, 0);

    await ctx.db.patch(args.mapId, {
      isReviewed: true,
      level: lastLevel + 1,
    });
  },
});

export const getMapByLevel = query({
  args: { level: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("maps")
      .withIndex("by_level", (q) => q.eq("level", args.level))
      .first();
  },
});

export const playMapAction = internalAction({
  args: {
    gameId: v.id("games"),
    modelId: v.string(),
    level: v.number(),
  },
  handler: async (ctx, args) => {
    const resultId = await ctx.runMutation(
      internal.results.createInitialResult,
      {
        gameId: args.gameId,
        level: args.level,
      },
    );

    const map = await ctx.runQuery(api.maps.getMapByLevel, {
      level: args.level,
    });

    if (!map) {
      throw new Error("Map not found");
    }

    if (process.env.MOCK_MODELS === "true") {
      const existingMap = ZombieSurvival.cloneMap(map.grid);

      existingMap[0][0] = "P";
      existingMap[0][1] = "B";
      existingMap[0][2] = "B";

      await ctx.runMutation(internal.results.updateResult, {
        resultId,
        isWin: ZombieSurvival.isWin(existingMap),
        reasoning: "This is a mock response",
        map: existingMap,
      });

      return;
    }

    const { solution, reasoning, error } = await runModel(
      args.modelId,
      map.grid,
    );

    await ctx.runMutation(internal.results.updateResult, {
      resultId,
      isWin: error ? false : ZombieSurvival.isWin(solution!),
      reasoning,
      error,
      map: solution,
    });
  },
});

export const testMap = action({
  args: {
    modelId: v.string(),
    map: v.array(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const isAdmin = await ctx.runQuery(api.users.isAdmin);

    if (!isAdmin) {
      throw new Error("Test map is available only for admin");
    }

    return await runModel(args.modelId, args.map);
  },
});

export const testAIModel = action({
  args: {
    level: v.number(),
    modelId: v.string(),
  },
  handler: async (ctx, args) => {
    const flags = await ctx.runQuery(api.flags.getFlags);
    if (!flags.showTestPage) {
      throw new Error("Test page is not enabled");
    }

    const map = await ctx.runQuery(api.maps.getMapByLevel, {
      level: args.level,
    });

    if (!map) {
      throw new Error("Map not found");
    }

    const { solution, reasoning, error } = await runModel(
      args.modelId,
      map.grid,
    );

    return {
      map: solution,
      isWin: error ? false : ZombieSurvival.isWin(solution!),
      reasoning,
      error,
    };
  },
});
