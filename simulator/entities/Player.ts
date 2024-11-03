import { Entity, EntityType } from "../Entity";
import { Position } from "../Position";
import { ZombieSurvival } from "../ZombieSurvival";
import { closestEntity } from "../lib/closestEntity";

export class Player extends Entity {
  public static Destructible = true;
  public static Health = 1;
  public static ShootDistance = Infinity;
  public playerToken: string = "P";

  private game: ZombieSurvival;

  public constructor(
    game: ZombieSurvival,
    position: Position,
    playerToken?: string,
  ) {
    super(EntityType.Player, Player.Destructible, Player.Health, position);
    this.game = game;
    if (playerToken) {
      this.playerToken = playerToken;
    }
  }

  public shoot() {
    const zombie = closestEntity(this, this.game.getZombies());
    zombie.hit();
  }
}
