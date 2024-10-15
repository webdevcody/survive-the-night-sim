import { Box } from "./entities/Box";
import { Entity } from "./entities/Entity";
import { Player } from "./entities/Player";
import { Rock } from "./entities/Rock";
import { Zombie } from "./entities/Zombie";

export class ZombieSurvival {
  private readonly boardHeight: number;
  private readonly boardWidth: number;
  private readonly entities: Entity[];
  private readonly player: Player;
  private readonly zombies: Zombie[];

  public constructor(config: string[][]) {
    if (config.length === 0 || config[0].length == 0) {
      throw new Error("Config is empty");
    }

    this.boardWidth = config[0].length;
    this.boardHeight = config.length;
    this.entities = [];
    this.zombies = [];

    let player: Player | null = null;

    for (let y = 0; y < this.boardHeight; y++) {
      for (let x = 0; x < this.boardWidth; x++) {
        const code = config[x][y];

        switch (code.toLowerCase()) {
          case "b": {
            this.entities.push(new Box({ x, y }));
            break;
          }
          case "p": {
            if (player !== null) {
              throw new Error("Config contains multiple players");
            }

            player = new Player(this, { x, y });
            break;
          }
          case "r": {
            this.entities.push(new Rock({ x, y }));
            break;
          }
          case "z": {
            this.zombies.push(new Zombie(this, { x, y }));
            break;
          }
        }
      }
    }

    if (player === null) {
      throw new Error("Config has no player");
    }

    this.player = player;

    if (this.zombies.length === 0) {
      throw new Error("Config has no zombies");
    }
  }

  public finished(): boolean {
    return this.player.dead() || this.zombies.every((zombie) => zombie.dead());
  }

  public getAllEntities(): Entity[] {
    return [this.zombies, this.player, this.entities].flat();
  }

  public getPlayer(): Player {
    return this.player;
  }

  public getZombies(): Zombie[] {
    return this.zombies;
  }

  public step() {
    this.player.shoot();

    for (const zombie of this.zombies) {
      zombie.walk();
    }
  }
}
