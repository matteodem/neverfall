import { Curve3, Vector3 } from "@babylonjs/core";
import { ENVIRONMENT_PATHS as CONFIG } from "./environmentPolishConfig";

// Sample once; rendering and scenery exclusions use the same smooth curves.
export const ENVIRONMENT_ROUTES = CONFIG.routes.map((route) => {
  const points = route.points.map(([x, z]) => new Vector3(x, 0, z));
  const longest = Math.max(...points.slice(1).map((point, index) =>
    Vector3.Distance(point, points[index])));
  const curve = Curve3.CreateCatmullRomSpline(points,
    Math.ceil(longest / CONFIG.sampleSpacing)).getPoints();
  return { ...route, points: curve, segments: curve.slice(1).map((to, index) => {
    const from = curve[index], dx = to.x - from.x, dz = to.z - from.z;
    return { from, dx, dz, lengthSquared: dx * dx + dz * dz,
      minX: Math.min(from.x, to.x), maxX: Math.max(from.x, to.x),
      minZ: Math.min(from.z, to.z), maxZ: Math.max(from.z, to.z) };
  }) };
});

export const isOnEnvironmentPath = ({ x, z }, clearance = 0) => {
  const radius = CONFIG.width / 2 + clearance;
  return ENVIRONMENT_ROUTES.some(({ segments }) => segments.some((segment) => {
    const { from, dx, dz, lengthSquared, minX, maxX, minZ, maxZ } = segment;
    if (x < minX - radius || x > maxX + radius || z < minZ - radius || z > maxZ + radius) return false;
    const t = lengthSquared ? Math.max(0, Math.min(1,
      ((x - from.x) * dx + (z - from.z) * dz) / lengthSquared)) : 0;
    return (x - from.x - dx * t) ** 2 + (z - from.z - dz * t) ** 2 < radius * radius;
  }));
};
