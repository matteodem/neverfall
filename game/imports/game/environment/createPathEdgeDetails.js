import { getSnowMix, getWorldHeight } from "../worldConfig";
import { randomForChunk } from "./createForestProps";
import { ENVIRONMENT_PATHS as CONFIG } from "./environmentPolishConfig";
import { ENVIRONMENT_ROUTES } from "./environmentPaths";
import { getPathBridgeApproach, pathEdgeRadius } from "./pathSurfaceShape";

// Sparse reused instances at the road shoulder; never introduce collision or shadow casters.
export const createPathEdgeDetails = ({ scene, root, ground, props, belongs, density }) => {
  if (!props.available || density <= 0) return;
  const bridgeApproach = getPathBridgeApproach(scene);
  for (const { points, width } of ENVIRONMENT_ROUTES) {
    const random = randomForChunk({ x: points[0].x + 17, z: points[0].z - 31 });
    const spacing = CONFIG.stoneSpacing / density;
    let distance = 0, next = spacing * (0.5 + random() * 0.5), placed = 0;
    for (let index = 1; index < points.length; index++) {
      const from = points[index - 1], point = points[index];
      const length = Math.hypot(point.x - from.x, point.z - from.z);
      distance += length;
      if (distance < next) continue;
      next += spacing * (0.8 + random() * 0.4);
      const side = random() < 0.5 ? -1 : 1;
      const offset = side * (pathEdgeRadius(point, side, width) + 0.08);
      const position = { x: point.x + (point.z - from.z) / length * offset,
        z: point.z - (point.x - from.x) / length * offset };
      if (!belongs(position) || bridgeApproach(position)?.weight > 0 ||
        !props.canPlacePathDetail(position, 0.4)) continue;
      const snowy = getSnowMix(position.x, position.z) > 0.5;
      const place = (kind, spot, scale) => {
        if (!props.canPlacePathDetail(spot, 0.4)) return;
        const prop = props.placeAsset(root, kind, spot, random, scale);
        if (!prop) return;
        prop.position.y += ground.getHeightAtCoordinates(spot.x, spot.z) - getWorldHeight(spot.x, spot.z);
        prop.metadata = { pathEdgeDetail: true };
        for (const mesh of prop.getChildMeshes()) {
          mesh.metadata = { ...mesh.metadata, worldShadows: { cast: false, receive: true } };
        }
      };
      place(snowy ? "snowyRocks" : "rocks", position,
        CONFIG.stoneScaleMin + random() * (CONFIG.stoneScaleMax - CONFIG.stoneScaleMin));
      if (!snowy && placed++ % 2 === 0) {
        place("grassTufts", { x: position.x - (point.x - from.x) / length * 0.65,
          z: position.z - (point.z - from.z) / length * 0.65 }, 0.35);
      }
    }
  }
};
