export interface Position {
  x: number;
  y: number;
}

export function positionAsNumber(position: Position): number {
  return position.x + position.y;
}
