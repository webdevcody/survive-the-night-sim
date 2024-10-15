import { Entity } from "../entities/Entity";
import { Position } from "../Position";

export function entityAt(
  entities: Entity[],
  position: Position,
): Entity | null {
  for (const entity of entities) {
    const entityPosition = entity.getPosition();

    if (entityPosition.x === position.x && entityPosition.y === position.y) {
      return entity;
    }
  }

  return null;
}
