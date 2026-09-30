import { CAMP_PROTECTION, NORTHERN_CAMP } from "./campProtection";

export const SPAWN_POINTS = [
  {
    id: "central-camp",
    name: "Central Camp",
    region: "starterForest",
    position: { ...CAMP_PROTECTION.center, y: 0 },
    isDefault: true,
  },
  {
    id: "northern-camp",
    name: "Northern Camp",
    region: "highlands",
    position: { ...NORTHERN_CAMP.center, y: 0 },
    discoveryRadius: NORTHERN_CAMP.clearingRadius,
  },
];

export const DEFAULT_SPAWN_POINT = SPAWN_POINTS.find((point) => point.isDefault);
export const NORTHERN_SPAWN_POINT = SPAWN_POINTS.find((point) => point.id === "northern-camp");

export const getUnlockedSpawnPoints = (ids = []) =>
  SPAWN_POINTS.filter((point) => point.isDefault || ids?.includes(point.id));

export const getNearestUnlockedSpawnPoint = (position, ids) =>
  getUnlockedSpawnPoints(ids).reduce((nearest, point) => {
    const distance = Math.hypot(position.x - point.position.x, position.z - point.position.z);
    const nearestDistance = Math.hypot(position.x - nearest.position.x, position.z - nearest.position.z);
    return distance < nearestDistance ? point : nearest;
  }, DEFAULT_SPAWN_POINT);
