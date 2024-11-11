import { type Action, ActionType } from "./Action";
import { type ZombieSurvival } from "./ZombieSurvival";

export function replay(
  simulator: ZombieSurvival,
  actions: Action | Action[],
): ZombieSurvival {
  const actualActions = Array.isArray(actions) ? actions : [actions];

  for (const action of actualActions) {
    switch (action.type) {
      case ActionType.PlayerShoot: {
        if (action.position === undefined) {
          throw new Error(
            "Action position is required when player is shooting",
          );
        }

        const zombie = simulator.getZombieAt(action.position);

        if (zombie === undefined) {
          throw new Error("Unable to get action's zombie at a given position");
        }

        zombie.hit();
        break;
      }
      case ActionType.PlayerWalk: {
        if (action.position === undefined) {
          throw new Error("Action position is required when moving a player");
        }

        const player = simulator.getPlayer(action.token);

        if (player === undefined) {
          throw new Error("Unable to get action's token player");
        }

        player.moveTo(action.position);
        break;
      }
      case ActionType.ZombieSpawn: {
        if (action.position === undefined) {
          throw new Error("Action position is required when spawning a zombie");
        }

        simulator.spawnZombieAt(action.position);
        break;
      }
      case ActionType.ZombieStep: {
        simulator.stepZombies();
        break;
      }
    }
  }

  return simulator;
}
