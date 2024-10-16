import { Entity, EntityType } from "./Entity";
import { Position } from "../Position";

export class Box extends Entity {
  public static Destructible = true;
  public static Health = 1;

  public constructor(position: Position) {
    super(EntityType.Box, Box.Destructible, Box.Health, position);
  }
}
