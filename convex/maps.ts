import { runModel } from "../models";
import { ZombieSurvival } from "../simulators/zombie-survival";
import { Landmine } from "../simulators/zombie-survival/entities/Landmine";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import {
  action,
  internalAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { Prompt } from "./prompts";
import {
  adminMutationBuilder,
  adminQueryBuilder,
  authenticatedMutation,
} from "./users";

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

export const submitMap = authenticatedMutation({
  args: {
    map: v.array(v.array(v.string())),
    blocks: v.number(),
    landmines: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("maps", {
      grid: args.map,
      level: undefined,
      maxBlocks: args.blocks,
      maxLandmines: args.landmines,
      submittedBy: ctx.userId,
      isReviewed: false,
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
            maxBlocks: 2,
            maxLandmines: 2,
          });
        } else {
          ctx.db.insert("maps", {
            level: idx + 1,
            grid: map.grid,
            maxBlocks: 2,
            maxLandmines: 2,
            isReviewed: true,
          });
        }
      }),
    );
  },
});

export const getUnreviewedMaps = adminQueryBuilder({
  handler: async (ctx) => {
    return await ctx.db
      .query("maps")
      .withIndex("by_isReviewed_level", (q) => q.eq("isReviewed", false))
      .collect();
  },
});

export const getMaps = query({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.db
      .query("maps")
      .withIndex("by_isReviewed_level", (q) => q.eq("isReviewed", true))
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

export const rejectMap = adminMutationBuilder({
  args: {
    mapId: v.id("maps"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.mapId);
  },
});

export const deleteMap = adminMutationBuilder({
  args: {
    mapId: v.id("maps"),
  },
  handler: async (ctx, args) => {
    const map = await ctx.db.get(args.mapId);

    if (map === null) {
      return;
    }

    await ctx.db.delete(args.mapId);

    if (map.level === undefined) {
      return;
    }

    const higherLevelMaps = await ctx.db
      .query("maps")
      .withIndex("by_level", (q) => q.gt("level", map.level))
      .collect();

    await Promise.all(
      higherLevelMaps.map(async (higherLevelMap) => {
        return await ctx.db.patch(higherLevelMap._id, {
          level: higherLevelMap.level! - 1,
        });
      }),
    );
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

export const adminGetMapById = adminQueryBuilder({
  args: {
    mapId: v.id("maps"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.mapId);
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

    if (process.env.FLAG_MOCK_MODELS === "true") {
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

    const activePromptQuery = await ctx.runQuery(api.prompts.getActivePrompt);
    const activePrompt = activePromptQuery && activePromptQuery.prompt;

    if (!activePrompt) {
      throw new Error("Active prompt not found");
    }

    const { solution, reasoning, error } = await runModel(
      args.modelId,
      map.grid,
      activePrompt,
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
    const activePrompt: Prompt = await ctx.runQuery(
      api.prompts.getActivePrompt,
    );

    if (!isAdmin) {
      throw new Error("Test map is available only for admin");
    }

    if (!activePrompt) {
      throw new Error("Active prompt not found");
    }

    return await runModel(args.modelId, args.map, activePrompt.prompt);
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

    const activePrompt: Prompt = await ctx.runQuery(
      api.prompts.getActivePrompt,
    );

    if (!activePrompt) {
      throw new Error("Active prompt not found");
    }

    const {
      solution,
      reasoning,
      error,
      promptTokens,
      outputTokens,
      totalTokensUsed,
      totalRunCost,
    } = await runModel(args.modelId, map.grid, activePrompt.prompt);

    return {
      map: solution,
      isWin: error ? false : ZombieSurvival.isWin(solution!),
      reasoning,
      promptTokens,
      outputTokens,
      totalTokensUsed,
      totalRunCost,
      error,
    };
  },
});

export const lastLevel = query({
  handler: async (ctx) => {
    const lastMap = await ctx.db
      .query("maps")
      .withIndex("by_level")
      .order("desc")
      .first();
    return lastMap?.level ?? 0;
  },
});
