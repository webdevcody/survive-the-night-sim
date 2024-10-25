export interface Position {
  x: number;
  y: number;
}

export function samePosition(p1: Position, p2: Position): boolean {
  return p1.x === p2.x && p1.y === p2.y;
}
