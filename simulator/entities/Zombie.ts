import { entityAt } from "../../lib/entityAt";
import { type Direction, allDirections, move } from "../Direction";
import { Entity, EntityType } from "../Entity";
import { type Position } from "../Position";
import { type ZombieSurvival } from "../ZombieSurvival";

export class Zombie extends Entity {
  public static Destructible = true;
  public static Health = 2;

  private game: ZombieSurvival;

  public constructor(
    game: ZombieSurvival,
    position: Position,
    health?: number,
  ) {
    super(EntityType.Zombie, Zombie.Destructible, Zombie.Health, position);
    this.game = game;
    this.health = health ?? Zombie.Health;
  }

  public getToken(): string {
    return "Z" + ":" + this.health;
  }

  public walk(direction: Direction | null = null) {
    if (this.dead()) {
      return;
    }

    const nextDirection = direction ?? this.findPath()[0];
    const entities = this.game.getAllEntities();
    const newPosition = move(this.position, nextDirection);
    const entity = entityAt(entities, newPosition);

    if (entity?.getType() === EntityType.Landmine) {
      this.die();
    }

    if (entity !== null && entity.getType() !== EntityType.Zombie) {
      entity.hit();
    }

    this.moveTo(newPosition);
  }

  private findPath(): Direction[] {
    const player = this.game.getClosestPlayer(this.position);

    if (player === undefined) {
      throw new Error("No player found");
    }

    const initialPosition = this.getPosition();

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

      if (player.getPosition().x === x && player.getPosition().y === y) {
        return path;
      }

      for (const direction of allDirections) {
        const position = move({ x, y }, direction);

        if (
          position.x < 0 ||
          position.y < 0 ||
          position.x >= this.game.boardWidth ||
          position.y >= this.game.boardHeight
        ) {
          continue;
        }

        const entity = entityAt(this.game.getEntities(), position);

        if (entity !== null && !entity.isDestructible()) {
          continue;
        }

        queue.push({
          x: position.x,
          y: position.y,
          path: [...path, direction],
        });
      }
    }

    throw new Error("Unable to find path for the next move");
  }

  private listMoves(): Direction[] {
    const entities = this.game.getAllEntities();
    const result: Direction[] = [];

    for (const direction of allDirections) {
      const position = move(this.position, direction);

      if (
        position.x < 0 ||
        position.y < 0 ||
        position.x >= this.game.boardWidth ||
        position.y >= this.game.boardHeight
      ) {
        continue;
      }

      const entity = entityAt(entities, position);

      if (entity !== null && !entity.isDestructible()) {
        continue;
      }

      result.push(direction);
    }

    return result;
  }
}
