import { runMultiplayerModel } from "../models/multiplayer";
import {
  Position,
  ZombieSurvival,
  directionFromString,
  move,
} from "../simulator";
import { type Infer, v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { internalAction, internalMutation, query } from "./_generated/server";
import { ModelSlug } from "./constants";
import { multiplayerGameActionValidator } from "./helpers";
import { ActionType } from "@/simulator/Action";

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

function multiplayerGameTurn(multiplayerGame: Doc<"multiplayerGames">): string {
  const prevAction = multiplayerGame.actions.at(-1);

  if (prevAction === undefined) {
    return multiplayerGame.playerMap[0].playerToken;
  }

  const players = multiplayerGame.playerMap;
  const simulator = new ZombieSurvival(multiplayerGame.boardState);

  const playerIndex = players.findIndex(
    (player) => player.playerToken === prevAction.token,
  );

  for (let i = playerIndex + 1; i < players.length; i++) {
    const turn = players[i].playerToken;
    const player = simulator.getPlayer(turn);

    if (player !== undefined) {
      return turn;
    }
  }

  return "Z";
}

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
      map: initialBoard,
      boardState: initialBoard,
      playerMap: args.playerMap,
      actions: [],
    });

    await ctx.scheduler.runAfter(
      0,
      internal.multiplayerGames.runMultiplayerGameTurn,
      { multiplayerGameId: gameId },
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
    cost: v.optional(v.number()),
    actions: v.array(multiplayerGameActionValidator),
  },
  handler: async (ctx, args) => {
    const { actions, boardState, cost, multiplayerGameId } = args;

    const multiplayerGame = await ctx.runQuery(
      api.multiplayerGames.getMultiplayerGame,
      { multiplayerGameId },
    );

    if (!multiplayerGame) {
      throw new Error("Multiplayer game not found");
    }

    await ctx.db.patch(multiplayerGame._id, {
      boardState: boardState,
      cost: cost ?? multiplayerGame.cost,
      actions: [...multiplayerGame.actions, ...actions],
    });
  },
});

export const runMultiplayerGameTurn = internalAction({
  args: {
    multiplayerGameId: v.id("multiplayerGames"),
  },
  handler: async (ctx, args) => {
    const { multiplayerGameId } = args;

    const multiplayerGame = await ctx.runQuery(
      api.multiplayerGames.getMultiplayerGame,
      { multiplayerGameId },
    );

    if (!multiplayerGame) {
      throw new Error("Multiplayer game not found");
    }

    const simulator = new ZombieSurvival(multiplayerGame.boardState);
    const turn = multiplayerGameTurn(multiplayerGame);
    const actions: Array<Infer<typeof multiplayerGameActionValidator>> = [];
    let cost = multiplayerGame.cost ?? 0;

    if (turn === "Z") {
      simulator.stepZombies();

      actions.push({
        type: ActionType.ZombieStep,
        token: "Z",
      });

      const numPlayers = multiplayerGame.playerMap.length;

      const zombiesToSpawn = Math.min(
        Math.floor(Math.random() * numPlayers) + 1,
        numPlayers,
      );

      for (let i = 0; i < zombiesToSpawn && simulator.hasEmptyCells(); i++) {
        const position = simulator.spawnRandomZombie();

        actions.push({
          type: ActionType.ZombieSpawn,
          token: "Z",
          position,
        });
      }
    } else {
      const model = multiplayerGame.playerMap.find(
        (entry) => entry.playerToken === turn,
      );

      if (!model) {
        throw new Error("Model not found");
      }

      const results = await runMultiplayerModel(
        model.modelSlug as ModelSlug,
        simulator.getState(),
        turn,
      );

      console.log("cost", results.cost);

      if (results.moveDirection && results.moveDirection !== "STAY") {
        const moveDirection = directionFromString(results.moveDirection);
        const player = simulator.getPlayer(turn);

        if (player) {
          const movePosition = move(player.getPosition(), moveDirection);

          if (
            simulator.isValidPosition(movePosition) &&
            simulator.isPositionEmpty(movePosition)
          ) {
            player.moveTo(movePosition);

            actions.push({
              type: ActionType.PlayerWalk,
              token: turn,
              position: movePosition,
            });
          }
        }
      }

      if (results.zombieToShoot !== undefined) {
        const zombiePosition: Position = {
          x: results.zombieToShoot[1],
          y: results.zombieToShoot[0],
        };

        const zombie = simulator.getZombieAt(zombiePosition);

        if (zombie !== undefined) {
          zombie.hit();

          actions.push({
            type: ActionType.PlayerShoot,
            token: turn,
            position: zombiePosition,
          });
        }
      }

      cost += results.cost ?? 0;
    }

    await ctx.runMutation(
      internal.multiplayerGames.updateMultiplayerGameBoardState,
      {
        multiplayerGameId,
        boardState: simulator.getState(),
        actions,
        cost,
      },
    );

    if (!simulator.allPlayersDead()) {
      await ctx.scheduler.runAfter(
        TURN_DELAY,
        internal.multiplayerGames.runMultiplayerGameTurn,
        { multiplayerGameId },
      );
    }
  },
});
