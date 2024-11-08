import { v } from "convex/values";
import { ActionType } from "@/simulator/Action";

export const multiplayerGameActionValidator = v.object({
  type: v.union(...Object.values(ActionType).map((t) => v.literal(t))),
  token: v.string(),
  position: v.optional(
    v.object({
      x: v.number(),
      y: v.number(),
    }),
  ),
});
