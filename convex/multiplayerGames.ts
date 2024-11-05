import { runMultiplayerModel } from "../models/multiplayer";
import { ZombieSurvival, fromDirectionString, move } from "../simulator";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { internalAction, internalMutation, query } from "./_generated/server";
import { ModelSlug } from "./constants";

const TURN_DELAY = 500;

const boardState = `
 . . . . . .B. . . . . . . . ,
 . . . . . .B. . . . . . . . ,
 . . . . .B. . . . . . . . . ,
 . . . .R. . . . .R. . . . . ,
 . . . .R. . . . .R. . . . . ,
 . . . .R. . . . .R. . . . . ,
 . . . . . . . .B. . . . . . ,
 . . . . . . .B. . . . . . . ,
 . . . . . . .B. . . . . . . ,
`;

export const startMultiplayerGame = internalMutation({
  args: {
    playerMap: v.array(
      v.object({
        modelSlug: v.string(),
        playerToken: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const initialBoard = boardState
      .trim()
      .split(",\n")
      .map((it) => it.split("."));

    console.log({ initialBoard });

    // spawn random players on the board
    for (const player of args.playerMap) {
      while (true) {
        const x = Math.floor(Math.random() * initialBoard[0].length);
        const y = Math.floor(Math.random() * initialBoard.length);

        if (initialBoard[y][x] === " ") {
          initialBoard[y][x] = player.playerToken;
          break;
        }
      }
    }

    const gameId = await ctx.db.insert("multiplayerGames", {
      boardState: initialBoard,
      playerMap: args.playerMap,
      completedTurns: 0,
    });

    await ctx.scheduler.runAfter(
      0,
      internal.multiplayerGames.runMultiplayerGameTurn,
      {
        multiplayerGameId: gameId,
        turn: args.playerMap[0].playerToken,
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
    completedTurns: v.number(),
    cost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const patch: {
      boardState: string[][];
      completedTurns: number;
      cost?: number;
    } = {
      boardState: args.boardState,
      completedTurns: args.completedTurns,
    };

    if (args.cost !== undefined) {
      patch.cost = args.cost;
    }

    await ctx.db.patch(args.multiplayerGameId, patch);
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

      const numPlayers = multiplayerGame.playerMap.length;
      const zombiesToSpawn = Math.min(
        Math.floor(Math.random() * numPlayers) + 1,
        numPlayers,
      );
      for (let i = 0; i < zombiesToSpawn; i++) {
        map.spawnRandomZombie();
      }

      await ctx.runMutation(
        internal.multiplayerGames.updateMultiplayerGameBoardState,
        {
          multiplayerGameId,
          boardState: map.getState(),
          completedTurns: multiplayerGame.completedTurns + 1,
        },
      );
    } else {
      const model = multiplayerGame.playerMap.find(
        (entry) => entry.playerToken === turn,
      );

      if (!model) {
        throw new Error("Model not found");
      }

      const player = map.getPlayer(turn);
      if (!player) {
        const currentPlayerIndex = multiplayerGame.playerMap.findIndex(
          (entry) => entry.playerToken === turn,
        );
        const nextPlayerIndex = currentPlayerIndex + 1;
        let nextPlayer: string;
        if (nextPlayerIndex >= multiplayerGame.playerMap.length) {
          nextPlayer = "Z";
        } else {
          nextPlayer = multiplayerGame.playerMap[nextPlayerIndex].playerToken;
        }

        await ctx.scheduler.runAfter(
          0,
          internal.multiplayerGames.runMultiplayerGameTurn,
          {
            multiplayerGameId,
            turn: nextPlayer,
          },
        );

        return;
      }

      const results = await runMultiplayerModel(
        model.modelSlug as ModelSlug,
        map.getState(),
        turn,
      );

      console.log("cost", results.cost);

      if (results.moveDirection && results.moveDirection !== "STAY") {
        const moveDirection = fromDirectionString(results.moveDirection);
        const p = map.getPlayer(turn);

        if (p) {
          const movePosition = move(p.getPosition(), moveDirection);

          if (
            map.isValidPosition(movePosition) &&
            map.isPositionEmpty(movePosition)
          ) {
            // only move if the position was valid, otherwise we don't move
            p.moveTo(movePosition);
          }
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
          completedTurns: multiplayerGame.completedTurns,
          cost: (multiplayerGame.cost ?? 0) + (results.cost ?? 0),
        },
      );
    }

    if (!map.allPlayersDead()) {
      let nextPlayer: string;

      const currentPlayerIndex = multiplayerGame.playerMap.findIndex(
        (entry) => entry.playerToken === turn,
      );
      const nextPlayerIndex = currentPlayerIndex + 1;
      if (nextPlayerIndex >= multiplayerGame.playerMap.length) {
        nextPlayer = "Z";
      } else {
        nextPlayer = multiplayerGame.playerMap[nextPlayerIndex].playerToken;
      }

      await ctx.scheduler.runAfter(
        TURN_DELAY,
        internal.multiplayerGames.runMultiplayerGameTurn,
        {
          multiplayerGameId,
          turn: nextPlayer,
        },
      );
    }
  },
});
