import { Color3, Material, Mesh, StandardMaterial, VertexData } from "@babylonjs/core";
import { getSnowMix } from "../worldConfig";
import { ENVIRONMENT_PATHS as CONFIG } from "./environmentPolishConfig";
import { ENVIRONMENT_ROUTES } from "./environmentPaths";
import { GroundSkyFog } from "./groundSkyFog";
import { isInStarterRiver } from "./starterRiverHeight";
import { PATH_BASE_COLOR, WORLD_PALETTE as PALETTE } from "./worldPalette";
import { appendPathJunction, getPathJunctions, preparePathJunction } from "./pathJunctionFillets";
import { getPathBridgeApproach, getPathSection, isPathConnection, pathEdgeRadius, pathNoise as noise } from "./pathSurfaceShape";

const smooth = (value) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

const edgeAlpha = (inward) => smooth(inward) ** Math.max(0.1, CONFIG.edgeFalloff);

const pathMaterial = (scene, ground) => {
  const existing = scene.getMaterialByName("environment-dirt-path");
  if (existing) return existing;
  const material = new StandardMaterial("environment-dirt-path", scene);
  material.diffuseColor = Color3.White();
  material.specularColor = Color3.Black();
  material.transparencyMode = Material.MATERIAL_ALPHABLEND;
  // Edge feathers blend into the ground without rectangular depth masks.
  material.disableDepthWrite = true;
  const sky = ground.material.pluginManager?.getPlugin("GroundSkyFog")?.skyGradient;
  if (sky) new GroundSkyFog(material, sky);
  return material;
};

// Seven cross-path bands keep the sand opaque, blending only the narrow outer strips.
// Keep one mesh per chunk and one shared material, with no per-frame updates.
export const createEnvironmentPaths = ({ scene, chunk, ground, belongs }) => {
  const bridgeApproach = getPathBridgeApproach(scene);
  const edgeRadius = (point, side, width, radius = pathEdgeRadius(point, side, width)) => {
    const approach = bridgeApproach(point);
    if (!approach) return radius;
    // Settle into the deck width gradually, leaving a little irregularity at the abutments.
    return radius * (1 - approach.weight * 0.85) +
      (approach.halfWidth + CONFIG.edgeFade / 2) * approach.weight * 0.85;
  };
  const positions = [], indices = [], colors = [];
  const earth = Color3.FromArray(PATH_BASE_COLOR);
  const snow = Color3.FromHexString(PALETTE.rock);
  const vertex = (x, z, alpha) => {
    const index = positions.length / 3;
    positions.push(x, ground.getHeightAtCoordinates(x, z) + CONFIG.groundOffset, z);
    const color = Color3.Lerp(earth, snow, getSnowMix(x, z) * 0.7);
    const shade = 1 + noise(x * 2.1, z * 2.1) * CONFIG.colorVariation;
    colors.push(color.r * shade, color.g * shade, color.b * shade, alpha);
    return index;
  };
  const capTriangle = (a, b, c) => {
    const winding = (positions[b * 3] - positions[a * 3]) * (positions[c * 3 + 2] - positions[a * 3 + 2]) -
      (positions[b * 3 + 2] - positions[a * 3 + 2]) * (positions[c * 3] - positions[a * 3]);
    indices.push(a, winding >= 0 ? b : c, winding >= 0 ? c : b);
  };
  const cap = (point, direction, outward, worn = false, width) => {
    if (!belongs(point) || isInStarterRiver(point, 1.5) || isPathConnection(point)) return;
    const length = Math.hypot(direction.x, direction.z) || 1;
    const dx = direction.x / length, dz = direction.z / length;
    const center = vertex(point.x, point.z, 1);
    const segments = Math.max(4, Math.round(CONFIG.capSegments));
    const rings = [[], [], []];
    for (let step = 0; step <= segments; step++) {
      const angle = -Math.PI / 2 + Math.PI * step / segments;
      const side = Math.sin(angle), along = Math.cos(angle) * outward;
      // Match both strip edges exactly, with a gently uneven rounded outer contour.
      const radius = edgeRadius(point, -1, width) * (1 - side) / 2 + edgeRadius(point, 1, width) * (1 + side) / 2 +
        Math.sin((angle + Math.PI / 2) * 2) * CONFIG.edgeNoise * 0.25;
      const feather = Math.min(Math.max(0.01, CONFIG.edgeFade), radius * 0.9);
      for (let ring = 0; ring < 3; ring++) {
        const distance = radius - feather * (1 - ring / 2);
        // Bridge-route ends use a shallow, uneven worn lip rather than a perfect half circle.
        const endLength = worn ? 0.3 + 0.14 * noise(point.x + side * 5, point.z, side) : 1;
        rings[ring].push(vertex(point.x + (dz * side + dx * along * endLength) * distance,
          point.z + (-dx * side + dz * along * endLength) * distance, edgeAlpha(1 - ring / 2)));
      }
    }
    for (let step = 0; step < segments; step++) {
      capTriangle(center, rings[0][step], rings[0][step + 1]);
      for (let ring = 0; ring < 2; ring++) {
        capTriangle(rings[ring][step], rings[ring + 1][step], rings[ring][step + 1]);
        capTriangle(rings[ring][step + 1], rings[ring + 1][step], rings[ring + 1][step + 1]);
      }
    }
  };
  const section = (route, index) => {
    const { width } = route;
    const crossSection = getPathSection(route, index);
    return Array.from({ length: 7 }, (_, band) => {
      const side = band < 3 ? -1 : band > 3 ? 1 : 0;
      const radius = edgeRadius(crossSection, side, width, crossSection.radius(side));
      const feather = Math.min(Math.max(0.01, CONFIG.edgeFade), radius * 0.9);
      const edgeStep = Math.min(band, 6 - band);
      const offset = side * (radius - feather * edgeStep / 2);
      const x = crossSection.x + crossSection.dz * offset;
      const z = crossSection.z - crossSection.dx * offset;
      return { x, z, alpha: edgeAlpha(edgeStep / 2) };
    });
  };
  const candidates = getPathJunctions();
  const junctions = candidates.filter((junction) => !isInStarterRiver(junction.center, 1.5) &&
    !candidates.some((other) => other !== junction && junction.cuts.some((a) =>
      other.cuts.some((b) => a.route === b.route && Math.max(a.from, b.from) < Math.min(a.to, b.to)))))
    .map((junction) => ({ ...junction, geometry: preparePathJunction({ junction, section, edgeAlpha }) }))
    .filter(({ geometry }) => geometry);
  // Invalid/overlapping junctions keep their complete ribbons and rounded caps.
  // Only successfully planned surfaces may remove route segments.
  const rows = new Map();
  const row = (route, index) => {
    if (!rows.has(route)) rows.set(route, new Map());
    const routeRows = rows.get(route);
    if (routeRows.has(index)) return routeRows.get(index);
    const start = positions.length / 3;
    for (const point of section(route, index)) vertex(point.x, point.z, point.alpha);
    routeRows.set(index, start);
    return start;
  };
  for (const route of ENVIRONMENT_ROUTES) {
    const { points, width } = route;
    const cuts = junctions.flatMap((junction) => junction.cuts.filter((cut) => cut.route === route));
    for (let index = 1; index < points.length; index++) {
      const from = points[index - 1], to = points[index];
      if (!belongs({ x: (from.x + to.x) / 2, z: (from.z + to.z) / 2 })) continue;
      // Preserve the existing bridge connection and leave its deck/channel uncovered.
      if (isInStarterRiver(from, 1.5) || isInStarterRiver(to, 1.5)) continue;
      if (cuts.some(({ from, to }) => index > from && index <= to)) continue;
      const a = row(route, index - 1), b = row(route, index);
      for (let band = 0; band < 6; band++) {
        indices.push(a + band, a + band + 1, b + band,
          a + band + 1, b + band + 1, b + band);
      }
    }
    // Half-round caps remove the flat cuts at exposed ends and soften route joins.
    if (!cuts.some(({ from }) => from === 0))
      cap(points[0], { x: points[1].x - points[0].x, z: points[1].z - points[0].z },
        -1, route.capStyle === "worn", width);
    const last = points.length - 1;
    if (!cuts.some(({ to }) => to === last)) cap(points[last], { x: points[last].x - points[last - 1].x,
      z: points[last].z - points[last - 1].z }, 1, route.capStyle === "worn", width);
  }
  for (const junction of junctions) {
    if (!belongs(junction.center) || isInStarterRiver(junction.center, 1.5)) continue;
    appendPathJunction({ geometry: junction.geometry, row, vertex, triangle: capTriangle });
  }
  if (!positions.length) return null;
  const mesh = new Mesh(`environment-paths-${chunk.x}-${chunk.z}`, scene);
  const data = new VertexData();
  Object.assign(data, { positions, indices, colors, normals: [] });
  VertexData.ComputeNormals(positions, indices, data.normals);
  data.applyToMesh(mesh);
  mesh.material = pathMaterial(scene, ground);
  mesh.useVertexColors = true;
  mesh.hasVertexAlpha = true;
  mesh.receiveShadows = true;
  mesh.isPickable = false;
  mesh.checkCollisions = false;
  mesh.metadata = { worldShadows: { cast: false, receive: true } };
  return mesh;
};
