import { CENTRAL_CAMP_POLISH as CONFIG } from "./centralCampPolishConfig";
import { ENVIRONMENT_ROUTES } from "./environmentPaths";
import { randomForChunk } from "./createForestProps";

// Add a bounded camp-only layer without changing the surrounding forest's placement.
// Keep candidates on dirt too: the existing batched vegetation rules hide them and
// restore the same transforms when terrain painting turns the ground green again.
export const createCentralCampGroundDetails = ({ scene, obstacles, density, clear, place }) => {
  const details = CONFIG.groundDetails;
  const random = randomForChunk({ x: 125, z: -125 });
  const distance = (point) => Math.hypot(point.x - CONFIG.center.x, point.z - CONFIG.center.z);
  const anchors = Array.from({ length: 24 }, () => {
    const angle = random() * Math.PI * 2;
    const radius = 19 + random() * 7;
    return { x: CONFIG.center.x + Math.cos(angle) * radius,
      z: CONFIG.center.z + Math.sin(angle) * radius };
  });
  for (const { minX, maxX, minZ, maxZ } of obstacles) {
    anchors.push(
      { x: minX - 1, z: (minZ + maxZ) / 2 }, { x: maxX + 1, z: (minZ + maxZ) / 2 },
      { x: (minX + maxX) / 2, z: minZ - 1 }, { x: (minX + maxX) / 2, z: maxZ + 1 },
    );
  }
  for (const { points, width = 3.2 } of ENVIRONMENT_ROUTES) {
    for (let index = 1; index < points.length; index += 12) {
      const point = points[index], previous = points[index - 1];
      if (distance(point) > 30) continue;
      const length = Math.hypot(point.x - previous.x, point.z - previous.z) || 1;
      for (const side of [-1, 1]) anchors.push({
        edge: true,
        x: point.x + (point.z - previous.z) / length * side * (width / 2 + details.pathOffset),
        z: point.z - (point.x - previous.x) / length * side * (width / 2 + details.pathOffset),
      });
    }
  }
  // Use only procedural rocks as anchors; authored World Objects are untouched.
  const rocks = [];
  for (const node of scene.transformNodes.filter((node) => /^forest-rock_[1-4]$/.test(node.name))) {
    node.computeWorldMatrix(true);
    const point = node.getAbsolutePosition();
    if (distance(point) > 30) continue;
    const bounds = node.getChildMeshes().filter((mesh) => mesh.getTotalVertices() || mesh.sourceMesh?.getTotalVertices())
      .map((mesh) => { mesh.computeWorldMatrix(true); return mesh.getBoundingInfo().boundingBox; });
    if (!bounds.length) continue;
    const minX = Math.min(...bounds.map((box) => box.minimumWorld.x)), maxX = Math.max(...bounds.map((box) => box.maximumWorld.x));
    const minZ = Math.min(...bounds.map((box) => box.minimumWorld.z)), maxZ = Math.max(...bounds.map((box) => box.maximumWorld.z));
    rocks.push({ minX, maxX, minZ, maxZ });
    anchors.push({ x: minX - 0.8, z: point.z }, { x: maxX + 0.8, z: point.z });
  }
  const outsideRocks = (point) => rocks.every(({ minX, maxX, minZ, maxZ }) =>
    point.x < minX - 0.3 || point.x > maxX + 0.3 || point.z < minZ - 0.3 || point.z > maxZ + 0.3);
  // Stable ordering avoids depending on asynchronous asset/chunk insertion order.
  anchors.sort((a, b) => a.x - b.x || a.z - b.z);
  for (let index = anchors.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [anchors[index], anchors[other]] = [anchors[other], anchors[index]];
  }
  // Spend the bounded budget on broken-up path shoulders before the perimeter.
  anchors.sort((a, b) => Number(!!b.edge) - Number(!!a.edge));
  const occupied = [], limit = Math.floor(details.plantLimit * density * CONFIG.groundDetailDensity);
  const clusters = [];
  for (const anchor of anchors) {
    if (distance(anchor) < details.clearRadius || distance(anchor) > CONFIG.innerRadius ||
      random() > (anchor.edge ? details.edgeClusterChance : details.clusterChance)) continue;
    const radius = details.clusterRadius[0] + random() * (details.clusterRadius[1] - details.clusterRadius[0]);
    if (clusters.some((other) => Math.hypot(other.x - anchor.x, other.z - anchor.z) <
      other.radius + radius + details.clusterGap)) continue;
    clusters.push({ ...anchor, radius });
    const rotation = random() * Math.PI * 2, squash = 0.45 + random() * 0.35;
    const count = Math.ceil((details.clusterPlants[0] + random() *
      (details.clusterPlants[1] - details.clusterPlants[0])) * radius / details.clusterRadius[1] *
      density * CONFIG.groundDetailDensity);
    for (let index = 0; index < count && occupied.length < limit; index++) {
      // Concentrate small plants toward an irregular oval's center instead of uniform disks.
      const angle = random() * Math.PI * 2, offset = random() * radius;
      const x = Math.cos(angle) * offset, z = Math.sin(angle) * offset * squash;
      const point = { x: anchor.x + x * Math.cos(rotation) - z * Math.sin(rotation),
        z: anchor.z + x * Math.sin(rotation) + z * Math.cos(rotation) };
      if (distance(point) < details.clearRadius || distance(point) > CONFIG.innerRadius || !clear(point, 0.5) || !outsideRocks(point) ||
        occupied.some((other) => Math.hypot(other.x - point.x, other.z - point.z) < details.minSpacing)) continue;
      const type = random() < details.flowerChance ? "flowers" : "grass";
      const kind = type === "grass" ? "grassTufts" : "campFlowers";
      const [min, max] = type === "grass" ? details.grassScale : CONFIG.flowerScale;
      const scale = min + random() * (max - min);
      if (place(kind, point, scale, type)) occupied.push(point);
    }
  }
  // Small, non-colliding stones can remain on dirt and green ground alike.
  const pebbleLimit = Math.floor(40 * density * CONFIG.pebbleDensity);
  let pebbles = 0;
  for (let attempt = 0; attempt < pebbleLimit * 5 && pebbles < pebbleLimit; attempt++) {
    const angle = random() * Math.PI * 2, radius = Math.sqrt(random()) * 29;
    const point = { x: CONFIG.center.x + Math.cos(angle) * radius,
      z: CONFIG.center.z + Math.sin(angle) * radius };
    if (clear(point, 0.4) && outsideRocks(point) && place("stones", point, 0.06 + random() * 0.1, "stones")) pebbles++;
  }
};
