import { Direction } from "../Direction";
import { Entity } from "./Entity";
import { Position } from "../Position";
import { ZombieSurvival } from "../ZombieSurvival";
import { entityAt } from "../lib/entity-at";
import { pathFinder } from "../lib/path-finder";

export class Zombie extends Entity {
  public static Destructible = true;
  public static Health = 2;

  private game: ZombieSurvival;
  private path: Direction[];
  private pathIdx = 0;

  public constructor(game: ZombieSurvival, position: Position) {
    super(Zombie.Destructible, Zombie.Health, position);
    this.game = game;
    this.path = pathFinder(game, this);
  }

  public walk() {
    const nextDirection = this.path[this.pathIdx++];

    if (typeof nextDirection === "undefined") {
      throw new Error("Zombie out of moves");
    }

    const newPosition: Position = { ...this.position };

    switch (nextDirection) {
      case Direction.Down: {
        newPosition.y += 1;
        break;
      }
      case Direction.Left: {
        newPosition.x -= 1;
        break;
      }
      case Direction.Right: {
        newPosition.x += 1;
        break;
      }
      case Direction.Up: {
        newPosition.y -= 1;
        break;
      }
    }

    const entities = this.game.getAllEntities();
    const entity = entityAt(entities, newPosition);

    if (entity !== null) {
      entity.hit();
      return;
    }

    this.position = newPosition;
  }
}
