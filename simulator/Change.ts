import { Position } from "./Position";

export enum ChangeType {
  Hit,
  Killed,
  Walking,
}

export type Change = HitChange | KilledChange | WalkingChange;

export interface HitChange {
  type: ChangeType.Hit;
}

export interface KilledChange {
  type: ChangeType.Killed;
}

export interface WalkingChange {
  type: ChangeType.Walking;
  from: Position;
  to: Position;
}
