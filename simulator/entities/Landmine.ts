import { Entity, EntityType } from "../Entity";
import { type Position } from "../Position";

export class Landmine extends Entity {
  public static Destructible = true;
  public static Health = 1;

  public constructor(position: Position) {
    super(
      EntityType.Landmine,
      Landmine.Destructible,
      Landmine.Health,
      position,
    );
  }

  public getToken(): string {
    return "L";
  }
}
