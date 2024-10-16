import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
export default defineSchema({
  ...authTables,
  games: defineTable({
    modelId: v.string(),
    currentLevel: v.number(),
    status: v.union(v.literal("in_progress"), v.literal("completed")),
  }),
  maps: defineTable({
    level: v.number(),
    grid: v.array(v.array(v.string())),
  }).index("by_level", ["level"]),
  scores: defineTable({
    modelId: v.string(),
    score: v.number(),
  }).index("by_modelId", ["modelId"]),
  models: defineTable({
    slug: v.string(),
    active: v.boolean(),
    name: v.string(),
  }).index("by_active", ["active"]),
  results: defineTable({
    gameId: v.id("games"),
    level: v.number(),
    isWin: v.boolean(),
    reasoning: v.string(),
    error: v.optional(v.string()),
    map: v.array(v.array(v.string())),
    status: v.union(
      v.literal("inProgress"),
      v.literal("completed"),
      v.literal("failed"),
    ),
  }).index("by_gameId_level", ["gameId", "level"]),
  globalrankings: defineTable({
    modelId: v.string(),
    wins: v.number(),
    losses: v.number(),
  }).index("by_modelId", ["modelId"]),
  levelrankings: defineTable({
    modelId: v.string(),
    level: v.number(),
    wins: v.number(),
    losses: v.number(),
  }).index("by_modelId_level", ["modelId", "level"]),
});
