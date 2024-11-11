import { type Position } from "./Position";

export interface Action {
  type: ActionType;
  token: string;
  position?: Position;
}

export enum ActionType {
  PlayerShoot = "player-shoot",
  PlayerWalk = "player-walk",
  ZombieSpawn = "zombie-spawn",
  ZombieStep = "zombie-step",
}
