import { ChangeType } from "./Change";
import { allDirections, move } from "./Direction";
import { Entity } from "./Entity";
import { Position, samePosition } from "./Position";
import { Box } from "./entities/Box";
import { Landmine } from "./entities/Landmine";
import { Player } from "./entities/Player";
import { Rock } from "./entities/Rock";
import { Zombie } from "./entities/Zombie";
import { entityAt } from "./lib/entityAt";

export class ZombieSurvival {
  public readonly boardHeight: number;
  public readonly boardWidth: number;
  private entities: Entity[] = [];
  private multiplayer = false;
  private players: Player[] = [];
  private zombies: Zombie[] = [];

  public constructor(map: string[][]) {
    if (ZombieSurvival.mapIsEmpty(map)) {
      throw new Error("Map is empty");
    }

    this.boardWidth = map[0].length;
    this.boardHeight = map.length;

    for (let y = 0; y < this.boardHeight; y++) {
      for (let x = 0; x < this.boardWidth; x++) {
        const code = map[y][x];

        switch (code.toLowerCase()) {
          case "b": {
            this.entities.push(new Box({ x, y }));
            break;
          }
          case "l": {
            this.entities.push(new Landmine({ x, y }));
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
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "p": {
            if (this.players.length !== 0) {
              throw new Error("Map contains multiple players");
            }

            const player = new Player(this, { x, y }, code.toLocaleLowerCase());
            this.players.push(player);

            break;
          }
        }
      }
    }

    if (!ZombieSurvival.mapIsMultiplayer(map) && this.players.length === 0) {
      throw new Error("Map has no player");
    }

    this.multiplayer = this.players.length > 1;

    if (this.zombies.length === 0) {
      throw new Error("Map has no zombies");
    }
  }

  public static boardHeight(map: string[][]): number {
    return map.length;
  }

  public static boardWidth(map: string[][]): number {
    return map[0]?.length ?? 0;
  }

  public static cloneMap(map: string[][]): string[][] {
    return [...map.map((row) => [...row])];
  }

  public static entityPosition(map: string[][], token: string): Position {
    for (let y = 0; y < map.length - 1; y++) {
      for (let x = 0; x < map[y].length - 1; x++) {
        if (map[y][x] === token) {
          return { x, y };
        }
      }
    }

    throw new Error(`Entity position for token '${token}' not found`);
  }

  public static isWin(map: string[][]): boolean {
    if (ZombieSurvival.mapIsEmpty(map)) {
      return false;
    }

    const game = new ZombieSurvival(map);

    while (!game.finished()) {
      game.step();
    }

    return game.getPlayer() === null || !game.getPlayer()?.dead();
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

  public static mapIsMultiplayer(map: string[][]): boolean {
    return map.flat().some((it) => ["1", "2", "3", "4", "5", "6"].includes(it));
  }

  public static nextValidPosition(map: string[][]): Position | null {
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] === " ") {
          return { x, y };
        }
      }
    }

    return null;
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

  public static validMoveLocations(map: string[][], token: string): number[][] {
    const position = ZombieSurvival.entityPosition(map, token);
    const validMoves: number[][] = [];

    for (const direction of allDirections) {
      const newPosition = move(position, direction);

      if (
        newPosition.x >= 0 &&
        newPosition.x < map[0].length &&
        newPosition.y >= 0 &&
        newPosition.y < map.length
      ) {
        if (map[newPosition.y][newPosition.x] === " ") {
          validMoves.push([newPosition.y, newPosition.x]);
        }
      }
    }

    return validMoves;
  }

  public finished(): boolean {
    return (
      this.players.every((player) => player.dead()) ||
      this.zombies.every((zombie) => zombie.dead())
    );
  }

  public getAllEntities(): Entity[] {
    return [this.entities, this.zombies, this.players]
      .flat()
      .filter(Boolean) as Entity[];
  }

  public getEntities(): Entity[] {
    return this.entities;
  }

  public getPlayer(): Player {
    if (this.multiplayer) {
      throw new Error("Tried getting a player for a multiplayer simulator");
    }

    return this.players[0];
  }

  public getState(): string[][] {
    const entities = this.getAllEntities();
    let result: string[][] = [];

    for (let y = 0; y < this.boardHeight; y++) {
      const item: string[] = [];

      for (let x = 0; x < this.boardWidth; x++) {
        const entity = entityAt(entities, { x, y });
        item.push(entity === null ? " " : entity.getToken());
      }

      result.push(item);
    }

    return result;
  }

  public getZombies(): Zombie[] {
    return this.zombies;
  }

  public step({ skipPlayer = false }: { skipPlayer?: boolean } = {}): void {
    const initialHealth = this.zombies.map((zombie) => zombie.getHealth());

    if (!skipPlayer) {
      this.getPlayer().clearChanges();
      this.getPlayer().shoot();
    }

    for (let i = 0; i < this.zombies.length && !this.finished(); i++) {
      const zombie = this.zombies[i];
      const initialPosition = zombie.getPosition();
      const initialZombieHealth = initialHealth[i];

      zombie.clearChanges();
      zombie.walk();

      if (initialZombieHealth !== 0 && zombie.getHealth() === 0) {
        zombie.addChange({ type: ChangeType.Killed });
      }

      if (initialZombieHealth !== zombie.getHealth()) {
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
