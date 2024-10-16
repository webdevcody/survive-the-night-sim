import { Entity } from "../entities/Entity";

export interface ClosestEntityScore {
  distance: number;
  target: Entity;
}

export function closestEntity(entity: Entity, targets: Entity[]): Entity {
  const entityPosition = entity.getPosition();
  const x1 = entityPosition.x;
  const y1 = entityPosition.y;
  const scores: ClosestEntityScore[] = [];

  for (const target of targets) {
    if (target.dead()) {
      continue;
    }

    const targetPosition = target.getPosition();
    const x2 = targetPosition.x;
    const y2 = targetPosition.y;
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    scores.push({ distance, target });
  }

  if (scores.length === 0) {
    throw new Error("No alive targets found");
  }

  scores.sort((a, b) => a.distance - b.distance);
  return scores[0].target;
}
