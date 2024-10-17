import { Direction, allDirections, move } from "../Direction";
import { Entity, EntityType } from "./Entity";
import { Position } from "../Position";
import { ZombieSurvival } from "../ZombieSurvival";
import { entityAt } from "../lib/entityAt";
import { pathfinder } from "../lib/pathfinder";

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

  public walk(direction: Direction | null = null) {
    if (this.dead()) {
      return;
    }

    let nextDirection = direction ?? pathfinder(this.game, this)[0];

    const entities = this.game.getAllEntities();
    const newPosition = move(this.position, nextDirection);
    const entity = entityAt(entities, newPosition);

    if (entity !== null) {
      if (entity.getType() !== EntityType.Zombie) {
        entity.hit();
      } else if (entity.getType() === EntityType.Zombie) {
        // we can't move into another zombie
        return;
      }

      return;
    }

    this.walkTo(newPosition);
  }

  public walkTo(position: Position) {
    this.position = position;
  }
}
