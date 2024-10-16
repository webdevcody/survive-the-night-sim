import { internalMutation } from "./_generated/server";
import { seedMaps } from "./maps";

export default internalMutation({
  handler: async (ctx) => {
    const maps = await ctx.db.query("maps").first();
    if (maps) return;
    await seedMaps(ctx, {});
  },
});
