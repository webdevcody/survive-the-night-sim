import {
  Direction,
  directionFromString,
  directionToString,
} from "../Direction";
import { Zombie } from "../entities/Zombie";
import { ZombieSurvival } from "../ZombieSurvival";

export function pathFinder(
  initialGame: ZombieSurvival,
  initialZombie: Zombie,
): Direction[] {
  const initialSnapshot = ZombieSurvival.fromSnapshot(initialGame.getSnapshot())
    .setZombies([initialZombie])
    .getSnapshot();

  const graph = new Map<string, Record<string, string>>();
  const queue = [initialSnapshot];
  const wins = new Set<string>();

  while (queue.length > 0) {
    const snapshot = queue.shift();

    if (snapshot === undefined) {
      continue;
    }

    const game = ZombieSurvival.fromSnapshot(snapshot);
    const moves = game.getZombie().listMoves();

    graph.set(snapshot, {});

    moves.forEach((move) => {
      const game = ZombieSurvival.fromSnapshot(snapshot);
      game.getZombie().walk(move);
      const newSnapshot = game.getSnapshot();

      if (game.finished()) {
        wins.add(newSnapshot);
        return;
      }

      if (graph.has(newSnapshot) || queue.includes(newSnapshot)) {
        return;
      }

      const graphItem = graph.get(snapshot);

      if (graphItem !== undefined) {
        graphItem[directionToString(move)] = newSnapshot;
      }

      queue.push(newSnapshot);
    });
  }

  const bfsQueue: Array<{
    snapshot: string;
    moves: Direction[];
  }> = [{ snapshot: initialSnapshot, moves: [] }];

  while (bfsQueue.length > 0) {
    const vertex = bfsQueue.shift();

    if (vertex === undefined) {
      continue;
    }

    if (wins.has(vertex.snapshot)) {
      return vertex.moves;
    }

    const newVertex = graph.get(vertex.snapshot);

    if (newVertex === undefined) {
      throw new Error("Tried getting undefined graph item");
    }

    Object.entries(newVertex).forEach(([move, snapshot]) => {
      bfsQueue.push({
        snapshot,
        moves: [...vertex.moves, directionFromString(move)],
      });
    });
  }

  throw new Error("Unable to solve game");
}
