import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { internalMutation, query } from "./_generated/server";
import { AI_MODELS } from "./constants";

export const runActiveModelsGames = internalMutation({
  handler: async (ctx) => {
    const flags = await ctx.runQuery(api.flags.getFlags);
    if (!flags.enableCronJobs) {
      return;
    }

    const models = await ctx.runQuery(api.models.getActiveModels);

    await Promise.all(
      models.map((model) =>
        ctx.runMutation(internal.games.startNewGame, {
          modelId: model.slug,
        }),
      ),
    );
  },
});

export const seedModels = internalMutation({
  handler: async (ctx) => {
    const models = await ctx.db.query("models").collect();
    const promises = [];

    for (const model of Object.values(AI_MODELS)) {
      const existingModel = models.find((it) => it.slug === model.slug);

      if (existingModel !== undefined) {
        continue;
      }

      promises.push(
        ctx.db.insert("models", {
          slug: model.slug,
          name: model.name,
          active: false,
        }),
      );
    }

    await Promise.all(promises);
  },
});

export const getActiveModelBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("models")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (record === null) {
      throw new Error(`Model with name '${args.slug}' was not found`);
    }

    return record;
  },
});

export const getActiveModels = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("models")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
  },
});
