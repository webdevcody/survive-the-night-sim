import { allDirections, Direction, move } from "../Direction";
import { Zombie } from "../entities/Zombie";
import { ZombieSurvival } from "../ZombieSurvival";
import { entityAt } from "./entityAt";

export function pathfinder(
  initialGame: ZombieSurvival,
  initialZombie: Zombie,
): Direction[] {
  const player = initialGame.getPlayer();

  const initialPosition = initialZombie.getPosition();
  const queue: Array<{ x: number; y: number; path: Direction[] }> = [
    { x: initialPosition.x, y: initialPosition.y, path: [] },
  ];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { x, y, path } = queue.shift()!;
    const positionKey = `${x},${y}`;

    if (visited.has(positionKey)) {
      continue;
    }
    visited.add(positionKey);

    if (player?.getPosition().x === x && player?.getPosition().y === y) {
      return path;
    }

    for (const direction of allDirections) {
      const position = move({ x, y }, direction);

      if (
        position.x < 0 ||
        position.y < 0 ||
        position.x >= initialGame.boardWidth ||
        position.y >= initialGame.boardHeight
      ) {
        continue;
      }

      const entity = entityAt(initialGame.getEntities(), position);

      if (entity !== null && !entity.isDestructible()) {
        continue;
      }

      queue.push({ x: position.x, y: position.y, path: [...path, direction] });
    }
  }

  throw new Error("Unable to solve game");
}
