import { Entity } from "./Entity";
import { Position } from "../Position";

export class Rock extends Entity {
  public static Destructible = false;
  public static Health = -1;

  public constructor(position: Position) {
    super(Rock.Destructible, Rock.Health, position);
  }
}
