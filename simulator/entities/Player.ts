import { closestEntity } from "../../lib/closestEntity";
import { Entity, EntityType } from "../Entity";
import { type Position } from "../Position";
import { type ZombieSurvival } from "../ZombieSurvival";

export class Player extends Entity {
  public static Destructible = true;
  public static Health = 1;
  public static ShootDistance = Infinity;

  public token = "P";
  public displayName = "";
  private game: ZombieSurvival;

  public constructor(
    game: ZombieSurvival,
    position: Position,
    token?: string,
    displayName?: string,
  ) {
    super(EntityType.Player, Player.Destructible, Player.Health, position);
    this.game = game;

    if (token !== undefined) {
      this.token = token;
    }

    if (displayName !== undefined) {
      this.displayName = displayName;
    }
  }

  public getToken(): string {
    return this.token;
  }

  public getDisplayName(): string {
    return "4o-mini";
  }

  public shoot() {
    if (this.dead()) {
      return;
    }

    const zombie = closestEntity(this, this.game.getZombies());
    zombie.hit();
  }
}
