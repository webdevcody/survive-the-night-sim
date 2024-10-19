import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { adminMutationBuilder } from "./users";

const defaultPrompt = `
Your task is to play a game.  We will give you a 2d array of characters that represent the game board.  Before the game starts, you have these two tasks:

1. Place two blocks ("B") in locations which maximize the player's survival.
2. Place the player ("P") in a location which maximize the player's survival.

# Placing Rules
- You can not place blocks in locations already used by zombies or rocks.
- You can not place the player in a location already used by a zombie or rock.
- You can not place a block over the player or another block.
- You must place both blocks and the player before starting the game.

# Grid Descriptions
The 2d Grid is made up of characters, where each character has a meaning.
" " represents an empty space.
"Z" represents a zombie.
"R" represents rocks which zombies can not pass through and path finding will not allow them to go through.
"P" represents the player, who cannot move. The player's goal is to throw popsickles at zombies before they reach them.
"B" represents blocks that can be placed before the round begins to hinder the zombies.

# Game Rules
- The game is turn based.
- At the start of the turn, the player (P) throws a popsickle at the closest zombie (using euclidean distance).
- Popsickles deal 1 damage to zombies.
- A zombie is removed from the game when its health reaches 0.
- When all zombies are removed, the player wins.
- If a zombie reaches a player, the player loses.

# Zombie Rules
- Zombies have 2 health.
- Zombies can only move horizontally or vertically.
- Zombies pathfinding will always be in the order of DOWN, LEFT, RIGHT, UP
- Zombies can't move diagonally.
- Zombies can't move through rocks.
- Zombies can't move through each other.
- Zombies always try to move towards the playing using BFS algorithm.

# Player Rules
- Players can not move.
- Players throw one lollipops at the closest zombie at the start of each turn.

# Placement Strategies

- often it's good to wall off between the zombies and players if possible, this will slow the zombies down.
- You should never put a player directly next to a zombie.
- You should try to put blocks directly next to players
- If the player is behind a choke point, blocking the path to the player is the best option.

# Output Format

- Assume a position on the 2d grid is always represented as [ROW, COL].
- Your output should be a JSON object with the following format:

{
  "boxCoordinates": [[ROW, COL], [ROW, COL]],
  "playerCoordinates": [ROW, COL]
}

## MOST IMPORTANT RULE

- DO NOT TRY TO PUT A BLOCK OR PLAYER IN A LOCATION THAT IS ALREADY OCCUPIED

`;

export type Prompt = {
  _id: Id<"prompts">;
  _creationTime: number;
  promptName: string;
  prompt: string;
  isActive: boolean;
};

export const getActivePrompt = query({
  args: {},
  handler: async (ctx): Promise<Prompt> => {
    const prompt = await ctx.db.query("prompts").withIndex("by_active").first();
    if (!prompt) {
      throw new Error("No active prompt found");
    }
    return prompt;
  },
});

export const getPromptById = query({
  args: {
    promptId: v.string(),
  },
  handler: async (ctx, args): Promise<Prompt | null> => {
    const prompt = await ctx.db.query("prompts").filter(q => q.eq(q.field("_id"), args.promptId)).first();
    return prompt;
  },
});

export const getAllPrompts = query({
  args: {},
  handler: async (ctx): Promise<Prompt[]> => {
    const prompts = await ctx.db
      .query("prompts")
      .withIndex("by_active")
      .collect();
    return prompts;
  },
});

export const createPrompt = adminMutationBuilder({
  args: {
    promptName: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const newPrompt = await ctx.db.insert("prompts", {
      promptName: args.promptName,
      prompt: args.prompt,
      isActive: false,
    });
    return newPrompt;
  },
});

export const updatePrompt = adminMutationBuilder({
  args: {
    promptId: v.id("prompts"),
    promptName: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.promptId, {
      prompt: args.prompt,
      promptName: args.promptName,
    });
  },
});

export const deletePrompt = adminMutationBuilder({
  args: {
    promptId: v.id("prompts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.promptId);
  },
});

export const enablePrompt = adminMutationBuilder({
  args: {
    promptId: v.id("prompts"),
  },
  handler: async (ctx, args) => {
    // If there is a currently active prompt, set its isActive field to false
    const currentActivePrompt = await ctx.db
      .query("prompts")
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (currentActivePrompt) {
      await ctx.db.patch(currentActivePrompt._id, { isActive: false });
    }

    // Then set the new prompt as active
    const prompt = await ctx.db
      .query("prompts")
      .filter((q) => q.eq(q.field("_id"), args.promptId))
      .first();

    if (!prompt) {
      throw new Error(`Prompt with ID ${args.promptId} not found`);
    }

    await ctx.db.patch(prompt._id, { isActive: true });
  },
});

export const seedPrompts = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Insert the default prompt into the "prompts" collection and set it as active
    await ctx.db.insert("prompts", {
      promptName: "Default Prompt",
      prompt: defaultPrompt,
      isActive: true,
    });
  },
});
