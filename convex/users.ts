import { getAuthUserId } from "@convex-dev/auth/server";
import {
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }
    const user = await ctx.db.get(userId);
    if (user === null) {
      throw new Error("User was deleted");
    }
    return user;
  },
});

export const getUserOrNull = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

export const isAdmin = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return false;
    }

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return !!admin;
  },
});

export const adminQueryBuilder = customQuery(
  query,
  customCtx(async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!admin) {
      throw new Error("Admin only invocation called from non-admin user");
    }

    return {
      admin: {
        id: admin.userId,
      },
    };
  }),
);

export const adminMutationBuilder = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!admin) {
      throw new Error("Admin only invocation called from non-admin user");
    }

    return {
      admin: {
        id: admin.userId,
      },
    };
  }),
);

export const SIGN_IN_ERROR_MESSAGE =
  "You must be signed in to perform this action";

export const authenticatedMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new ConvexError(SIGN_IN_ERROR_MESSAGE);
    }

    return {
      userId,
    };
  }),
);
