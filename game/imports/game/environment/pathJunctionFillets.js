import { ENVIRONMENT_PATHS as CONFIG } from "./environmentPolishConfig";
import { ENVIRONMENT_ROUTES } from "./environmentPaths";

const cross = (a, b) => a.x * b.z - a.z * b.x;

// Fill only the small concave corners where authored route endpoints meet other routes.
// Quadratic curves meet both road edges tangentially, avoiding circular junction stamps.
export const getPathJunctionFillets = (edgeRadius) => {
  const endpoints = new Map();
  for (const { points } of ENVIRONMENT_ROUTES) {
    for (const point of [points[0], points[points.length - 1]]) {
      endpoints.set(`${point.x},${point.z}`, point);
    }
  }
  const fillets = [];
  for (const center of endpoints.values()) {
    const arms = [];
    for (const { segments } of ENVIRONMENT_ROUTES) {
      for (const { from, dx, dz, lengthSquared } of segments) {
        if (!lengthSquared) continue;
        const t = Math.max(0, Math.min(1,
          ((center.x - from.x) * dx + (center.z - from.z) * dz) / lengthSquared));
        if (Math.hypot(center.x - from.x - dx * t, center.z - from.z - dz * t) > 0.05) continue;
        for (const [point, along] of [[from, -1], [{ x: from.x + dx, z: from.z + dz }, 1]]) {
          const length = Math.hypot(point.x - center.x, point.z - center.z);
          if (length < 0.05) continue;
          const arm = { x: (point.x - center.x) / length, z: (point.z - center.z) / length, along };
          if (!arms.some((other) => arm.x * other.x + arm.z * other.z > 0.999)) arms.push(arm);
        }
      }
    }
    if (arms.length < 2) continue;
    arms.sort((a, b) => Math.atan2(a.z, a.x) - Math.atan2(b.z, b.x));
    for (let index = 0; index < arms.length; index++) {
      const a = arms[index], b = arms[(index + 1) % arms.length];
      const determinant = cross(a, b);
      // Only gaps under 180 degrees have an inside corner to round.
      if (determinant < 0.01) continue;
      const ra = edgeRadius(center, -a.along), rb = edgeRadius(center, b.along);
      const pa = { x: -a.z * ra, z: a.x * ra }, pb = { x: b.z * rb, z: -b.x * rb };
      const distance = cross({ x: pb.x - pa.x, z: pb.z - pa.z }, b) / determinant;
      const corner = { x: center.x + pa.x + a.x * distance, z: center.z + pa.z + a.z * distance };
      const curve = [];
      for (let step = 0; step <= 6; step++) {
        const t = step / 6, size = Math.max(0, CONFIG.junctionRoundness);
        curve.push({ x: corner.x + size * (a.x * (1 - t) ** 2 + b.x * t * t),
          z: corner.z + size * (a.z * (1 - t) ** 2 + b.z * t * t) });
      }
      fillets.push({ center, curve });
    }
  }
  return fillets;
};
