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
    // Other fields can be added as needed
  }),

  results: defineTable({
    gameId: v.id("games"),
    roundId: v.string(),
    level: v.number(),
    isWin: v.boolean(),
    reasoning: v.string(),
  }),

  scores: defineTable({
    modelId: v.string(),
    score: v.number(),
  }),
});
