import { Entity } from "../entities/Entity";
import { positionAsNumber } from "../Position";

export interface ClosestEntityScore {
  score: number;
  target: Entity;
}

export function closestEntity(entity: Entity, targets: Entity[]): Entity {
  const entityPosition = positionAsNumber(entity.getPosition());
  const scores: ClosestEntityScore[] = [];

  for (const target of targets) {
    if (target.dead()) {
      continue;
    }

    const targetPosition = positionAsNumber(entity.getPosition());
    const score = Math.abs(entityPosition - targetPosition);

    scores.push({ target, score });
  }

  if (scores.length === 0) {
    throw new Error("No alive targets found");
  }

  scores.sort((a, b) => a.score - b.score);
  return scores[0].target;
}
