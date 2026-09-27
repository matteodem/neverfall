import { CAMP_PROTECTION, isInsideCamp } from "../../imports/game/campProtection";
export { isInsideCamp };

export const outsideCampPosition = ({ x, z }) => {
  const dx = x - CAMP_PROTECTION.center.x;
  const dz = z - CAMP_PROTECTION.center.z;
  const distance = Math.hypot(dx, dz);
  if (distance > CAMP_PROTECTION.safeZoneRadius) return { x, z };
  const radius = CAMP_PROTECTION.safeZoneRadius + 0.1;
  return {
    x: CAMP_PROTECTION.center.x + (distance ? dx / distance : 1) * radius,
    z: CAMP_PROTECTION.center.z + (distance ? dz / distance : 0) * radius,
  };
};

// Check the whole movement segment, including charges that could cross the camp.
export const crossesCamp = (start, end) => {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const lengthSquared = dx * dx + dz * dz;
  const t = lengthSquared ? Math.max(0, Math.min(1,
    ((CAMP_PROTECTION.center.x - start.x) * dx + (CAMP_PROTECTION.center.z - start.z) * dz) / lengthSquared)) : 0;
  return isInsideCamp({ x: start.x + dx * t, z: start.z + dz * t });
};
