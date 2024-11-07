import { v } from "convex/values";
import { ActionType } from "./constants";

export const multiplayerGameActionValidator = v.object({
  // type: v.union(...Object.values(ActionType).map((t) => v.literal(t))),
  type: v.union(
    v.literal("player-shoot"),
    v.literal("player-walk"),
    v.literal("zombie-spawn"),
    v.literal("zombie-step"),
  ),
  token: v.string(),
  position: v.optional(
    v.object({
      x: v.number(),
      y: v.number(),
    }),
  ),
});
