import { Position } from "./Position";

export enum Direction {
  Down,
  Left,
  Right,
  Up,
}

export const allDirections = [
  Direction.Down,
  Direction.Left,
  Direction.Right,
  Direction.Up,
];

export function directionToString(direction: Direction): string {
  switch (direction) {
    case Direction.Down: {
      return "0";
    }
    case Direction.Left: {
      return "1";
    }
    case Direction.Right: {
      return "2";
    }
    case Direction.Up: {
      return "3";
    }
  }
}

export function directionFromString(val: string): Direction {
  switch (val) {
    case "0": {
      return Direction.Down;
    }
    case "1": {
      return Direction.Left;
    }
    case "2": {
      return Direction.Right;
    }
    case "3": {
      return Direction.Up;
    }
    default: {
      throw new Error("Can't parse direction");
    }
  }
}

export function move(position: Position, direction: Direction): Position {
  switch (direction) {
    case Direction.Down: {
      return { ...position, y: position.y + 1 };
    }
    case Direction.Left: {
      return { ...position, x: position.x - 1 };
    }
    case Direction.Right: {
      return { ...position, x: position.x + 1 };
    }
    case Direction.Up: {
      return { ...position, y: position.y - 1 };
    }
  }
}
