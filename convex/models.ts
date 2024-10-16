import { AI_MODELS } from "./constants";
import { api } from "./_generated/api";
import { internalMutation, query } from "./_generated/server";

export const runActiveModelsGames = internalMutation({
  handler: async (ctx) => {
    const models = await ctx.runQuery(api.models.getActiveModels);

    await Promise.all(
      models.map((model) =>
        ctx.runMutation(api.games.startNewGame, { modelId: model.slug }),
      ),
    );
  },
});

export const seedModels = internalMutation({
  handler: async (ctx) => {
    const models = await ctx.db.query("models").collect();
    const promises = [];

    for (const model of AI_MODELS) {
      const existingModel = models.find((it) => it.slug === model.model);

      if (existingModel !== undefined) {
        continue;
      }

      promises.push(
        ctx.db.insert("models", {
          slug: model.model,
          name: model.name,
          active: true,
        }),
      );
    }

    await Promise.all(promises);
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
