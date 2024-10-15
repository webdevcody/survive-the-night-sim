import { Direction, allDirections, move } from "../Direction";
import { Entity, EntityType } from "./Entity";
import { Position } from "../Position";
import { ZombieSurvival } from "../ZombieSurvival";
import { entityAt } from "../lib/entity-at";
import { pathFinder } from "../lib/path-finder";

export class Zombie extends Entity {
  public static Destructible = true;
  public static Health = 2;

  private game: ZombieSurvival;

  public constructor(game: ZombieSurvival, position: Position) {
    super(EntityType.Zombie, Zombie.Destructible, Zombie.Health, position);
    this.game = game;
  }

  public listMoves(): Direction[] {
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

  public predictLastMove(): Direction | null {
    const entities = this.game.getAllEntities();
    const position = this.position;

    const downEntity = entityAt(entities, move(position, Direction.Down));
    const leftEntity = entityAt(entities, move(position, Direction.Left));
    const rightEntity = entityAt(entities, move(position, Direction.Right));
    const upEntity = entityAt(entities, move(position, Direction.Up));

    if (downEntity?.getType() === EntityType.Player) {
      return Direction.Down;
    }

    if (leftEntity?.getType() === EntityType.Player) {
      return Direction.Left;
    }

    if (rightEntity?.getType() === EntityType.Player) {
      return Direction.Right;
    }

    if (upEntity?.getType() === EntityType.Player) {
      return Direction.Up;
    }

    return null;
  }

  public walk(direction: Direction | null = null) {
    let nextDirection = direction ?? pathFinder(this.game, this)[0];

    if (typeof nextDirection === "undefined") {
      const lastMove = this.predictLastMove();

      if (lastMove === null) {
        throw new Error("Zombie out of moves");
      }

      nextDirection = lastMove;
    }

    const entities = this.game.getAllEntities();
    const newPosition = move(this.position, nextDirection);
    const entity = entityAt(entities, newPosition);

    if (entity !== null) {
      if (entity.getType() !== EntityType.Zombie) {
        entity.hit();
      }

      return;
    }

    this.walkTo(newPosition);
  }

  public walkTo(position: Position) {
    this.position = position;
  }
}
