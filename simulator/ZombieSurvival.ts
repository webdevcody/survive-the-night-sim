import { allDirections, move } from "./Direction";
import { type Entity } from "./Entity";
import { type Position } from "./Position";
import { Box } from "./entities/Box";
import { Landmine } from "./entities/Landmine";
import { Player } from "./entities/Player";
import { Rock } from "./entities/Rock";
import { Zombie } from "./entities/Zombie";
import { entityAt } from "@/lib/entityAt";

export interface ZombieSurvivalOptions {
  multiplayer?: boolean;
}

export class ZombieSurvival {
  public readonly boardHeight: number;
  public readonly boardWidth: number;
  private entities: Entity[] = [];
  private multiplayer;
  private players: Player[] = [];
  private zombies: Zombie[] = [];

  public constructor(map: string[][], options: ZombieSurvivalOptions = {}) {
    if (ZombieSurvival.mapIsEmpty(map)) {
      throw new Error("Map is empty");
    }

    this.boardWidth = map[0].length;
    this.boardHeight = map.length;
    this.multiplayer = options.multiplayer === true;
    let isSinglePlayer = false;

    for (let y = 0; y < this.boardHeight; y++) {
      for (let x = 0; x < this.boardWidth; x++) {
        const code = map[y][x].toLowerCase();

        switch (code) {
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
          case "p": {
            if (this.multiplayer) {
              throw new Error(
                "Mixing multiplayer and single player maps is not allowed",
              );
            }

            if (this.players.length !== 0) {
              throw new Error("Single player map contains multiple players");
            }

            if (!isSinglePlayer) {
              isSinglePlayer = true;
            }

            const player = new Player(this, { x, y }, code);
            this.players.push(player);

            break;
          }
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6": {
            if (isSinglePlayer) {
              throw new Error(
                "Mixing multiplayer and single player maps is not allowed",
              );
            }

            if (!this.multiplayer) {
              this.multiplayer = true;
            }

            const player = new Player(this, { x, y }, code);
            this.players.push(player);

            break;
          }
        }
      }
    }

    if (!this.multiplayer && this.players.length === 0) {
      throw new Error("Single player map has no player");
    }

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

  public static validLocations(map: string[][]): Array<[number, number]> {
    return map.flatMap((row, y) =>
      row.reduce(
        (acc, cell, x) => {
          if (cell === " ") {
            acc.push([y, x]);
          }
          return acc;
        },
        [] as Array<[number, number]>,
      ),
    );
  }

  public static validPlayerMoveLocations(
    map: string[][],
    playerToken: string,
  ): number[][] {
    const position = ZombieSurvival.entityPosition(map, playerToken);
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
    return [this.entities, this.zombies, this.players].flat();
  }

  public getEntities(): Entity[] {
    return this.entities;
  }

  public getPlayer(token: string | null = null): Player {
    if (!this.multiplayer) {
      return this.players[0];
    }

    if (token === null) {
      throw new Error("Tried getting a player for a multiplayer simulator");
    }

    for (const player of this.players) {
      if (player.getToken() === token) {
        return player;
      }
    }

    throw new Error(`Tried getting non-existing player '${token}'`);
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

  public resetVisualEvents() {
    const entities = this.getAllEntities();

    for (const entity of entities) {
      entity.clearVisualEvents();
    }
  }

  public step(): void {
    this.resetVisualEvents();
    this.stepPlayers();
    this.stepZombies();
  }

  public stepPlayer(token: string): void {
    this.getPlayer(token).shoot();
  }

  public stepPlayers(): void {
    for (const player of this.players) {
      player.shoot();
    }
  }

  public stepZombies(): void {
    for (let i = 0; i < this.zombies.length && !this.finished(); i++) {
      this.zombies[i].walk();
    }
  }
}
