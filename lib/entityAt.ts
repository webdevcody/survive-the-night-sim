import { Entity, Position } from "@/simulator";

export function entityAt(
  entities: Entity[],
  position: Position,
): Entity | null {
  for (const entity of entities) {
    if (entity.dead()) {
      continue;
    }

    const entityPosition = entity.getPosition();

    if (entityPosition.x === position.x && entityPosition.y === position.y) {
      return entity;
    }
  }

  return null;
}
