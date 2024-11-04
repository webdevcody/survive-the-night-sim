import { runMultiplayerModel } from "../models/multiplayer";
import { ZombieSurvival } from "../simulator";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { internalAction, internalMutation, query } from "./_generated/server";
import { AI_MODELS } from "./constants";

const HARD_CODED_PLAYER_TOKEN = "1";
const TURN_DELAY = 5000;

export const startMultiplayerGame = internalMutation({
  handler: async (ctx) => {
    const modelId = "ks7dm9g4t91bm8cy3z2544br0h72se9x" as Id<"models">;
    // const modelId = await ctx.runQuery(api.models.getActiveModelByName, {
    //   name: AI_MODELS[1].name,
    // });

    const gameId = await ctx.db.insert("multiplayerGames", {
      boardState: [
        ["Z", " ", " ", " ", " "],
        [" ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " "],
        [" ", " ", " ", " ", HARD_CODED_PLAYER_TOKEN],
      ],
      playerMap: [{ modelId: modelId, playerToken: HARD_CODED_PLAYER_TOKEN }],
    });

    await ctx.scheduler.runAfter(
      0,
      internal.multiplayerGames.runMultiplayerGameTurn,
      {
        multiplayerGameId: gameId,
        turn: HARD_CODED_PLAYER_TOKEN,
      },
    );

    return gameId;
  },
});

export const getMultiplayerGame = query({
  args: {
    multiplayerGameId: v.id("multiplayerGames"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.multiplayerGameId);
  },
});

export const updateMultiplayerGameBoardState = internalMutation({
  args: {
    multiplayerGameId: v.id("multiplayerGames"),
    boardState: v.array(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.multiplayerGameId, { boardState: args.boardState });
  },
});

export const runMultiplayerGameTurn = internalAction({
  args: {
    turn: v.string(),
    multiplayerGameId: v.id("multiplayerGames"),
  },
  handler: async (ctx, args) => {
    const { turn, multiplayerGameId } = args;

    const multiplayerGame = await ctx.runQuery(
      api.multiplayerGames.getMultiplayerGame,
      {
        multiplayerGameId,
      },
    );

    if (!multiplayerGame) {
      throw new Error("Multiplayer game not found");
    }

    const map = new ZombieSurvival(multiplayerGame.boardState);

    if (turn === "Z") {
      map.step({ skipPlayer: true });

      await ctx.runMutation(
        internal.multiplayerGames.updateMultiplayerGameBoardState,
        {
          multiplayerGameId,
          boardState: map.getState(),
        },
      );
    } else if (turn === HARD_CODED_PLAYER_TOKEN) {
      // TODO: based on who's turn it is, lookup the LLM model
      // run the LLM model over the player's location
      // const results = await runMultiplayerModel(
      //   HARD_CODED_MODEL_ID,
      //   map.getState(),
      //   HARD_CODED_PLAYER_TOKEN,
      // );
      // the LLM model should return the next move and which zombie it should shoot
      // update the board state with the new player location

      return;
    }

    if (!map.finished()) {
      await ctx.scheduler.runAfter(
        TURN_DELAY,
        internal.multiplayerGames.runMultiplayerGameTurn,
        {
          multiplayerGameId,
          turn: turn === "Z" ? HARD_CODED_PLAYER_TOKEN : "Z",
        },
      );
    }
  },
});
