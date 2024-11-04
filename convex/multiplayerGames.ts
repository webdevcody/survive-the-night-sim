import { runMultiplayerModel } from "../models/multiplayer";
import {
  Direction,
  ZombieSurvival,
  fromDirectionString,
  move,
} from "../simulator";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { internalAction, internalMutation, query } from "./_generated/server";
import { AI_MODELS, ModelSlug } from "./constants";

const HARD_CODED_PLAYER_TOKEN = "1";
const TURN_DELAY = 0;

export const startMultiplayerGame = internalMutation({
  handler: async (ctx) => {
    const gameId = await ctx.db.insert("multiplayerGames", {
      boardState: [
        [
          "Z",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          "Z",
        ],
        [
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
        ],
        [
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
        ],
        [
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          "Z",
          "Z",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
        ],
        [
          " ",
          "R",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
        ],
        [
          " ",
          "R",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
        ],
        [
          " ",
          "R",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
        ],
        [
          " ",
          "R",
          " ",
          " ",
          " ",
          "R",
          "R",
          "B",
          "B",
          "R",
          "R",
          " ",
          " ",
          " ",
          " ",
        ],
        [
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
        ],
        [
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
        ],
        [
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          HARD_CODED_PLAYER_TOKEN,
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
        ],
        [
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
        ],
        [
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
        ],
        [
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
        ],
        [
          "Z",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
        ],
      ],
      playerMap: [
        {
          modelSlug: AI_MODELS["gpt-4o"].slug,
          playerToken: HARD_CODED_PLAYER_TOKEN,
        },
      ],
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
      map.stepZombies();

      await ctx.runMutation(
        internal.multiplayerGames.updateMultiplayerGameBoardState,
        {
          multiplayerGameId,
          boardState: map.getState(),
        },
      );
    } else if (turn === HARD_CODED_PLAYER_TOKEN) {
      const model = multiplayerGame.playerMap.find(
        (entry) => entry.playerToken === turn,
      );

      if (!model) {
        throw new Error("Model not found");
      }

      const results = await runMultiplayerModel(
        model.modelSlug as ModelSlug,
        map.getState(),
        HARD_CODED_PLAYER_TOKEN,
      );

      if (results.moveDirection && results.moveDirection !== "STAY") {
        const moveDirection = fromDirectionString(results.moveDirection);
        const movePosition = move(
          map.getPlayer(turn).getPosition(),
          moveDirection,
        );

        if (
          map.isValidPosition(movePosition) &&
          map.isPositionEmpty(movePosition)
        ) {
          // only move if the position was valid, otherwise we don't move
          map.getPlayer(turn).moveTo(movePosition);
        }
      }

      if (results.zombieToShoot) {
        const zombieToShoot = results.zombieToShoot;
        map.getZombieAt({ x: zombieToShoot[1], y: zombieToShoot[0] })?.hit();
      }

      await ctx.runMutation(
        internal.multiplayerGames.updateMultiplayerGameBoardState,
        {
          multiplayerGameId,
          boardState: map.getState(),
        },
      );
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
