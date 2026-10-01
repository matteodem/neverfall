import { CAMP_PROTECTION, NORTHERN_CAMP } from "./campProtection";
import { SOUTHWEST_LAKE, getWorldHeight } from "./worldConfig";

const lakePosition = { x: SOUTHWEST_LAKE.center.x - 38, z: SOUTHWEST_LAKE.center.z };

export const WAYPOINTS = [
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
  {
    id: "lake-waypoint",
    name: "Lake Waypoint",
    region: "forest",
    position: { ...lakePosition, y: getWorldHeight(lakePosition.x, lakePosition.z) },
    discoveryRadius: 16,
  },
];

export const DEFAULT_WAYPOINT = WAYPOINTS.find((point) => point.isDefault);
export const getUnlockedWaypoints = (ids = []) =>
  WAYPOINTS.filter((point) => point.isDefault || ids?.includes(point.id));
