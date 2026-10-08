import { SOUTHEAST_MOUNTAIN, getWorldHeight } from "./worldConfig";

const mountainSummit = SOUTHEAST_MOUNTAIN.summit;

// Fixed bottom-center anchors; original placements are in docs/treasure-cache-positions.md.
export const HIDDEN_CACHE_RANGE = 3;

export const HIDDEN_CACHE_REWARDS = {
  small: [{ id: "health_potion" }],
  stocked: [{ id: "health_potion" }, { id: "health_potion" }],
  secluded: [{ id: "health_potion" }, { id: "power_potion" }],
};

export const HIDDEN_CACHES = [
  { id: "cache-forest-01", region: "Forest", position: { x: -270, y: 0.051369, z: -35 }, rewardTier: "small" },
  { id: "cache-forest-02", region: "Forest", position: { x: 86, y: 0.946931, z: 28 }, rewardTier: "small" },
  { id: "cache-forest-03", region: "Forest", position: { x: 28, y: 1.986536, z: -250 }, rewardTier: "stocked" },
  { id: "cache-highlands-01", region: "Highlands", position: { x: -276, y: 0.926632, z: 274 }, rewardTier: "stocked" },
  { id: "cache-highlands-02", region: "Highlands", position: { x: 118, y: 4.089875, z: 293 }, rewardTier: "secluded" },
  { id: "cache-highlands-03", region: "Highlands", position: { x: 112, y: 0.351071, z: 125 }, rewardTier: "small" },
  { id: "cache-snow-01", region: "Snowy Mountains", position: { x: 172, y: 2.046940, z: 89 }, rewardTier: "small" },
  { id: "cache-snow-02", region: "Snowy Mountains", position: { x: 194, y: 5.027547, z: -95 }, rewardTier: "stocked" },
  { id: "cache-snow-03", region: "Snowy Mountains", position: { x: 282, y: 17.889676, z: 92 }, rewardTier: "secluded" },
  { id: "cache-lake-01", region: "Southwest Lake", position: { x: -180, y: 1.850000, z: -103 }, rewardTier: "small" },
  { id: "cache-lake-02", region: "Southwest Lake", position: { x: -106, y: 2.454412, z: -130 }, rewardTier: "stocked" },
  { id: "cache-lake-03", region: "Southwest Lake", position: { x: -120, y: 1.667569, z: -237 }, rewardTier: "stocked" },
  { id: "southeast-mountain-cache", region: "Forest", position: {
    ...mountainSummit, y: getWorldHeight(mountainSummit.x, mountainSummit.z),
  }, rewardTier: "secluded" },
];

export const isNearHiddenCache = (position, cache) => {
  const distance = Math.hypot(position.x - cache.position.x,
    position.y - cache.position.y, position.z - cache.position.z);
  return Number.isFinite(distance) && distance <= HIDDEN_CACHE_RANGE;
};

export const getNearbyHiddenCache = (position, lootedCacheIds = []) =>
  HIDDEN_CACHES.find((cache) => !lootedCacheIds.includes(cache.id) && isNearHiddenCache(position, cache));
