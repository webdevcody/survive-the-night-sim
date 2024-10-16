import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

const MAPS = [
  {
    level: 1,
    grid: [
      ["Z", " ", " ", "R", " "],
      [" ", "R", " ", " ", " "],
      [" ", " ", " ", " ", " "],
      [" ", " ", " ", " ", "Z"],
      [" ", " ", " ", " ", " "],
    ],
    width: 5,
    height: 5,
  },
  {
    level: 2,
    grid: [
      [" ", " ", "R", " ", "Z"],
      [" ", " ", " ", " ", " "],
      [" ", " ", " ", "R", " "],
      ["Z", " ", " ", " ", " "],
      [" ", " ", " ", " ", " "],
    ],
    width: 5,
    height: 5,
  },
  {
    level: 3,
    grid: [
      ["Z", " ", " ", "R", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", "Z", " "],
      [" ", " ", " ", " ", " ", " ", " "],
      [" ", "R", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", "R", " ", " "],
    ],
    width: 7,
    height: 7,
  },
  {
    level: 4,
    grid: [
      [" ", "Z", " ", " ", "R", " ", " "],
      [" ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", "Z"],
      [" ", " ", "R", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " "],
    ],
    width: 7,
    height: 7,
  },
  {
    level: 5,
    grid: [
      [" ", " ", " ", " ", "R", "Z", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      ["Z", " ", " ", " ", " ", "R", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", "R", " ", " ", " ", " ", "Z", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", "R", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", "Z", " ", " ", " ", " "],
      ["B", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      ["Z", " ", " ", " ", "Z", " ", " ", " ", " ", " ", "Z"],
    ],
    width: 11,
    height: 11,
  },
];

export const seedMaps = internalMutation({
  handler: async (ctx) => {
    for (const map of MAPS) {
      ctx.db.insert("maps", map);
    }
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
