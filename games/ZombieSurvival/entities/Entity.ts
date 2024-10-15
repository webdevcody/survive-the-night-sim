import { Position } from "../Position";

export class Entity {
  protected destructible: boolean;
  protected health: number;
  protected position: Position;

  public constructor(
    destructible: boolean,
    health: number,
    position: Position,
  ) {
    this.destructible = destructible;
    this.health = health;
    this.position = position;
  }

  public dead(): boolean {
    return this.health === 0;
  }

  public getPosition(): Position {
    return this.position;
  }

  public getPositionAsNumber(): number {
    return this.position.x + this.position.y;
  }

  public hit() {
    this.health--;
  }
}
