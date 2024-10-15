import { Entity } from "./Entity";
import { Position } from "../Position";

export class Box extends Entity {
  public static Destructible = true;
  public static Health = 2;

  public constructor(position: Position) {
    super(Box.Destructible, Box.Health, position);
  }
}
