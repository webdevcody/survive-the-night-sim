import { ChangeType } from "./Change";
import { Entity } from "./Entity";
import { Position, samePosition } from "./Position";
import { Box } from "./entities/Box";
import { Player } from "./entities/Player";
import { Rock } from "./entities/Rock";
import { Zombie } from "./entities/Zombie";
import { entityAt } from "./lib/entityAt";

export class ZombieSurvival {
  public readonly boardHeight: number;
  public readonly boardWidth: number;
  private entities: Entity[];
  private player: Player;
  private zombies: Zombie[];

  public static boardHeight(map: string[][]): number {
    return map.length;
  }

  public static boardWidth(map: string[][]): number {
    return map[0]?.length ?? 0;
  }

  public static cloneMap(map: string[][]): string[][] {
    return [...map.map((row) => [...row])];
  }

  public static fromSnapshot(snapshot: string): ZombieSurvival {
    const config = snapshot.split(".").map((it) => it.split(""));
    return new ZombieSurvival(config);
  }

  public static isWin(config: string[][]): boolean {
    if (ZombieSurvival.mapIsEmpty(config)) {
      return false;
    }

    const game = new ZombieSurvival(config);

    while (!game.finished()) {
      game.step();
    }

    return !game.getPlayer().dead();
  }

  public static mapHasMultiplePlayers(map: string[][]): boolean {
    return (
      map.map((row) => row.filter((cell) => cell === "P")).flat().length > 1
    );
  }

  public static mapHasPlayer(map: string[][]): boolean {
    return map.some((row) => row.includes("P"));
  }

  public static mapHasZombies(map: string[][]): boolean {
    return map.some((row) => row.includes("Z"));
  }

  public static mapIsEmpty(map: string[][]): boolean {
    return map.length === 0 || map[0].length === 0;
  }

  public static validLocations(map: string[][]): number[][] {
    return map.flatMap((row, y) =>
      row.reduce((acc, cell, x) => {
        if (cell === " ") {
          acc.push([y, x]);
        }
        return acc;
      }, [] as number[][]),
    );
  }

  public constructor(config: string[][]) {
    if (ZombieSurvival.mapIsEmpty(config)) {
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

  public getAllAliveEntities(): Entity[] {
    return [this.entities, this.zombies, this.player]
      .flat()
      .filter((entity) => !entity.dead());
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

  public getEntityAt(position: Position): Entity | null {
    return entityAt(this.getAllEntities(), position);
  }

  public getZombie(): Zombie {
    return this.zombies[0];
  }

  public getZombies(): Zombie[] {
    return this.zombies;
  }

  public setZombies(zombies: Zombie[]): this {
    if (zombies.length === 0) {
      throw new Error("Tried setting zero zombies");
    }

    this.zombies = zombies;
    return this;
  }

  public step() {
    const initialHealth = this.zombies.map((zombie) => zombie.getHealth());

    this.player.clearChanges();
    this.player.shoot();

    for (let i = 0; i < this.zombies.length; i++) {
      const zombie = this.zombies[i];

      if (this.player.dead()) {
        break;
      }

      const initialPosition = zombie.getPosition();

      zombie.clearChanges();
      zombie.walk();

      if (initialHealth[i] !== zombie.getHealth()) {
        zombie.addChange({ type: ChangeType.Hit });
      }

      const currentPosition = zombie.getPosition();

      if (!samePosition(initialPosition, currentPosition)) {
        zombie.addChange({
          type: ChangeType.Walking,
          from: initialPosition,
          to: currentPosition,
        });
      }
    }
  }
}
