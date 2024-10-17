import {
  internalAction,
  internalMutation,
  query,
  action,
} from "./_generated/server";
import { v } from "convex/values";
import { ZombieSurvival } from "../simulators/zombie-survival";
import { api, internal } from "./_generated/api";
import { runModel } from "../models";

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
      [" ", " ", "R", " ", "Z"],
      [" ", " ", " ", " ", "B"],
      [" ", " ", " ", "R", " "],
      ["Z", " ", " ", " ", " "],
      [" ", " ", "B", " ", " "],
    ],
  },
];

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
          });
        }
      }),
    );
  },
});

export const getMaps = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("maps").withIndex("by_level").collect();
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
      const existingMap = [...map.grid.map((row: string[]) => [...row])];

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
