import { Box } from "./entities/Box";
import { Entity } from "./entities/Entity";
import { Player } from "./entities/Player";
import { Rock } from "./entities/Rock";
import { Zombie } from "./entities/Zombie";
import { entityAt } from "./lib/entity-at";

export class ZombieSurvival {
  public readonly boardHeight: number;
  public readonly boardWidth: number;
  private entities: Entity[];
  private player: Player;
  private zombies: Zombie[];

  public static fromSnapshot(snapshot: string): ZombieSurvival {
    const config = snapshot.split(".").map((it) => it.split(""));
    return new ZombieSurvival(config);
  }

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
        const code = config[y][x];

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
    return [this.entities, this.zombies, this.player].flat();
  }

  public getEntities(): Entity[] {
    return this.entities;
  }

  public getPlayer(): Player {
    return this.player;
  }

  public getSnapshot(): string {
    return this.getState()
      .map((it) => it.join(""))
      .join(".");
  }

  public getState(): string[][] {
    const entities = this.getAllEntities();
    let config: string[][] = [];

    for (let y = 0; y < this.boardHeight; y++) {
      const item: string[] = [];

      for (let x = 0; x < this.boardWidth; x++) {
        const entity = entityAt(entities, { x, y });
        item.push(entity === null ? " " : entity.toConfig());
      }

      config.push(item);
    }

    return config;
  }

  public getZombie(): Zombie {
    const zombie = this.zombies[0];

    if (typeof zombie === "undefined") {
      throw new Error("Tried getting non-existing first zombie");
    }

    return zombie;
  }

  public getZombies(): Zombie[] {
    return this.zombies;
  }

  public setZombies(zombies: Zombie[]): this {
    this.zombies = zombies;
    return this;
  }

  public step() {
    this.player.shoot();

    for (const zombie of this.zombies) {
      zombie.walk();
    }
  }
}
