export const CAMP_PROTECTION = {
  center: { x: 0, z: 0 },
  safeZoneRadius: 7,
  respawnProtectionMs: 5000,
};

export const isInsideCamp = ({ x, z }) =>
  Math.hypot(x - CAMP_PROTECTION.center.x, z - CAMP_PROTECTION.center.z) <= CAMP_PROTECTION.safeZoneRadius;
