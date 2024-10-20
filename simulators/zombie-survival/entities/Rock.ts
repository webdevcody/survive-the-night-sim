import { Position } from "../Position";
import { Entity, EntityType } from "./Entity";

export class Rock extends Entity {
  public static Destructible = false;
  public static Health = -1;

  public constructor(position: Position) {
    super(EntityType.Rock, Rock.Destructible, Rock.Health, position);
  }
}
