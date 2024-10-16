import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

export default internalMutation({
  handler: async (ctx) => {
    await ctx.runMutation(internal.maps.seedMaps);
    await ctx.runMutation(internal.models.seedModels);
  },
});
