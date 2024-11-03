import { type Change, ChangeType } from "./Change";
import { Position } from "./Position";
import { Player } from "./entities/Player";

export enum EntityType {
  Box,
  Landmine,
  Player,
  Rock,
  Zombie,
}

export class Entity {
  protected destructible: boolean;
  protected changes: Change[] = [];
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

  public addChange(change: Change): void {
    this.changes.push(change);
  }

  public clearChanges(): void {
    this.changes = [];
  }

  public dead(): boolean {
    return this.health === 0;
  }

  public die(): void {
    this.health = 0;
  }

  public getChange<T extends ChangeType>(type: T) {
    const change = this.changes.find((change) => change.type === type);

    if (change === undefined) {
      throw new Error("Unable to find change of this type");
    }

    return change as Extract<Change, { type: T }>;
  }

  public getChanges(): Change[] {
    return this.changes;
  }

  public getPosition(): Position {
    return this.position;
  }

  public getPositionId(): string {
    return `${this.position.x}.${this.position.y}`;
  }

  public getPositionAsNumber(): number {
    return this.position.x + this.position.y;
  }

  public getType(): EntityType {
    return this.type;
  }

  public hasChange(type: ChangeType): boolean {
    return this.changes.some((change) => change.type === type);
  }

  public hasChanges(): boolean {
    return this.changes.length !== 0;
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

  // TODO: maybe the entity itself should be refactor to implement the abstract method,
  // and return the correct LETTER
  public toConfig(): string {
    let letter = " ";

    if (this.type === EntityType.Box) {
      letter = "B";
    } else if (this.type === EntityType.Landmine) {
      letter = "L";
    } else if (this.type === EntityType.Player) {
      letter = (this as unknown as Player).playerToken; // TODO: this feels hacky
    } else if (this.type === EntityType.Rock) {
      letter = "R";
    } else if (this.type === EntityType.Zombie) {
      letter = "Z";
    }

    return letter;
  }
}
