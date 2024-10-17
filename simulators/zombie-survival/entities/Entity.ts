import { Position } from "../Position";

export enum EntityType {
  Box,
  Player,
  Rock,
  Zombie,
}

export class Entity {
  protected destructible: boolean;
  protected health: number;
  protected position: Position;
  protected type: EntityType;

  public constructor(
    type: EntityType,
    destructible: boolean,
    health: number,
    position: Position,
  ) {
    this.destructible = destructible;
    this.health = health;
    this.position = position;
    this.type = type;
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

  public getType(): EntityType {
    return this.type;
  }

  public hit() {
    if (!this.destructible) {
      return;
    }

    this.health--;
  }

  public getHealth(): number {
    return this.health;
  }

  public isDestructible(): boolean {
    return this.destructible;
  }

  public toConfig(): string {
    let letter = " ";

    if (this.type === EntityType.Box) {
      letter = "B";
    } else if (this.type === EntityType.Player) {
      letter = "P";
    } else if (this.type === EntityType.Rock) {
      letter = "R";
    } else if (this.type === EntityType.Zombie) {
      letter = "Z";
    }

    return letter;
  }
}
