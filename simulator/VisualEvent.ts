import { Position } from "./Position";

export enum VisualEventType {
  Destructured,
  Hit,
  Moving,
}

export type VisualEvent =
  | DestructuredVisualEvent
  | HitVisualEvent
  | MovingVisualEvent;

export interface DestructuredVisualEvent {
  type: VisualEventType.Destructured;
}

export interface HitVisualEvent {
  type: VisualEventType.Hit;
}

export interface MovingVisualEvent {
  type: VisualEventType.Moving;
  from: Position;
  to: Position;
}
