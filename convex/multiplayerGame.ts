import { ZombieSurvival } from "../simulators/zombie-survival";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { internalAction, internalMutation, query } from "./_generated/server";

const HARD_CODED_MODEL_ID = "m1757gn800qrc8s4jpdcshbgah72s9e7" as Id<"models">;
const HARD_CODED_PLAYER_TOKEN = "1";
const TURN_DELAY = 5000;

export const startMultiplayerGame = internalMutation({
  args: {},
  handler: async (ctx) => {
    const gameId = await ctx.db.insert("multiplayerGame", {
      boardState: [
        ["Z", " ", " ", " ", " "],
        [" ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " "],
        [" ", " ", " ", " ", HARD_CODED_PLAYER_TOKEN],
      ],
      playerMap: [
        { modelId: HARD_CODED_MODEL_ID, playerToken: HARD_CODED_PLAYER_TOKEN },
      ],
    });

    await ctx.scheduler.runAfter(
      0,
      internal.multiplayerGame.runMultiplayerGameTurn,
      {
        multiplayerGameId: gameId,
        turn: HARD_CODED_PLAYER_TOKEN,
      },
    );

    return gameId;
  },
});

export const getMultiplayerGame = query({
  args: { multiplayerGameId: v.id("multiplayerGame") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.multiplayerGameId);
  },
});

export const updateMultiplayerGameBoardState = internalMutation({
  args: {
    multiplayerGameId: v.id("multiplayerGame"),
    boardState: v.array(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.multiplayerGameId, { boardState: args.boardState });
  },
});

export const runMultiplayerGameTurn = internalAction({
  args: {
    turn: v.string(),
    multiplayerGameId: v.id("multiplayerGame"),
  },
  handler: async (ctx, args) => {
    const { turn, multiplayerGameId } = args;

    const multiplayerGame = await ctx.runQuery(
      api.multiplayerGame.getMultiplayerGame,
      {
        multiplayerGameId,
      },
    );

    if (!multiplayerGame) {
      throw new Error("Multiplayer game not found");
    }

    console.log(multiplayerGame.boardState);

    const map = new ZombieSurvival(multiplayerGame.boardState);

    if (turn === "Z") {
      map.moveAllZombies();
      console.log("ZOMBIES MOVED");
      console.log(map.getState());
      await ctx.runMutation(
        internal.multiplayerGame.updateMultiplayerGameBoardState,
        {
          multiplayerGameId,
          boardState: map.getState(),
        },
      );
    } else if (turn === HARD_CODED_PLAYER_TOKEN) {
      // TODO: based on who's turn it is, lookup the LLM model
      // run the LLM model over the player's location
      // the LLM model should return the next move and which zombie it should shoot
      // update the board state with the new player location
    }

    // if any players are alive, schedule the next turn
    if (!map.finished()) {
      await ctx.scheduler.runAfter(
        TURN_DELAY,
        internal.multiplayerGame.runMultiplayerGameTurn,
        {
          multiplayerGameId,
          turn: turn === "Z" ? HARD_CODED_PLAYER_TOKEN : "Z",
        },
      );
    }
  },
});
