import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
export default defineSchema({
  ...authTables,
  messages: defineTable({
    userId: v.id("users"),
    body: v.string(),
  }),
  games: defineTable({
    modelId: v.string(),
    currentLevel: v.number(),
    status: v.union(v.literal("in_progress"), v.literal("completed")),
  }),
  maps: defineTable({
    level: v.number(),
    grid: v.array(v.array(v.string())),
    width: v.number(),
    height: v.number(),
  }).index("by_level", ["level"]),
  scores: defineTable({
    modelId: v.string(),
    gameId: v.id("games"),
    score: v.number(),
    level: v.number(),
  }).index("by_game_and_level", ["gameId", "level"]),
  results: defineTable({
    gameId: v.id("games"),
    roundId: v.string(),
    level: v.number(),
    isWin: v.boolean(),
    reasoning: v.string(),
  }),

});
