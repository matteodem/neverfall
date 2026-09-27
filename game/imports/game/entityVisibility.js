import { areNearbyChunks } from "./worldConfig";

export const ENTITY_VISIBILITY = {
  enemy: { enableDistance: 190, disableDistance: 210 },
  remotePlayer: { enableDistance: 220, disableDistance: 250 },
  nameplateDistance: 70,
  updateInterval: 300,
  nearEnemyInterval: 50,
  farEnemyInterval: 250,
  localMinimapInterval: 100,
  minimapInterval: 250,
};

// Visibility affects visuals only; synchronized targets and minimap remain intact.
export const createEntityVisibility = ({ root, targetPosition, nameplate, healthBar, controllers, alive = () => true }) => {
  let inRange = true;
  let labelsInRange = true;
  let rendered = true;
  let distanceSquared = 0;

  const apply = () => {
    const enabled = inRange && alive();
    if (enabled !== rendered) {
      rendered = enabled;
      root.setEnabled(enabled);
      for (const controller of controllers) controller.setVisible(enabled);
      if (enabled) root.position.copyFrom(targetPosition);
    }
    nameplate.setVisible(enabled && labelsInRange);
    healthBar.setVisible(enabled && labelsInRange);
  };

  return {
    apply,
    isVisible: () => rendered,
    hasLabels: () => rendered && labelsInRange,
    getDistanceSquared: () => distanceSquared,
    update(playerPosition, config) {
      const dx = targetPosition.x - playerPosition.x;
      const dz = targetPosition.z - playerPosition.z;
      distanceSquared = dx * dx + dz * dz;
      const limit = inRange ? config.disableDistance : config.enableDistance;
      inRange = distanceSquared <= limit * limit && (!config.chunks || areNearbyChunks(targetPosition, playerPosition));
      labelsInRange = distanceSquared <= ENTITY_VISIBILITY.nameplateDistance ** 2;
      apply();
    },
  };
};
