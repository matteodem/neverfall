import { TransformNode } from "@babylonjs/core";
import { getWorldHeight } from "../worldConfig";
import { CENTRAL_CAMP_POLISH as CONFIG } from "./centralCampPolishConfig";
import { randomForChunk } from "./createForestProps";
import { ENVIRONMENT_ROUTES, isOnEnvironmentPath } from "./environmentPaths";
import { getPathBridgeApproach } from "./pathSurfaceShape";
import { STARTER_RIVER } from "./starterRiverConfig";
import { batchCampVegetation } from "./batchCampVegetation";

// Add fine detail after the camp exists, so authored props and tent doors can be protected.
export const createCentralCampPolish = ({ scene, camp, ground, props, density }) => {
  const root = new TransformNode("central-camp-polish", scene);
  const random = randomForChunk({ x: 110, z: 110 });
  const bridgeApproach = getPathBridgeApproach(scene);
  const obstacles = camp.getChildren().filter((node) => node.name.startsWith("camp-") && node.getChildMeshes)
    .map((node) => {
      const meshes = node.getChildMeshes().filter((mesh) => mesh.getTotalVertices() || mesh.sourceMesh?.getTotalVertices());
      const bounds = meshes.map((mesh) => { mesh.computeWorldMatrix(true); return mesh.getBoundingInfo().boundingBox; });
      return { node, minX: Math.min(...bounds.map((box) => box.minimumWorld.x)),
        maxX: Math.max(...bounds.map((box) => box.maximumWorld.x)),
        minZ: Math.min(...bounds.map((box) => box.minimumWorld.z)),
        maxZ: Math.max(...bounds.map((box) => box.maximumWorld.z)) };
    });
  const clear = (point, margin = 0.35) => props.canPlaceCampDetail(point, margin) &&
    !isOnEnvironmentPath(point, 0.6) && !(bridgeApproach(point)?.weight > 0) &&
    ground.getHeightAtCoordinates(point.x, point.z) > STARTER_RIVER.waterLevel + 0.04 &&
    Math.hypot(point.x - 3.5, point.z - 4) > 3.7 &&
    obstacles.every(({ node, minX, maxX, minZ, maxZ }) => {
      if (point.x > minX - margin && point.x < maxX + margin &&
        point.z > minZ - margin && point.z < maxZ + margin) return false;
      if (node.name !== "camp-tent") return true;
      const dx = point.x - node.position.x - camp.position.x;
      const dz = point.z - node.position.z - camp.position.z;
      const forward = dx * Math.sin(node.rotation.y) + dz * Math.cos(node.rotation.y);
      const across = dx * Math.cos(node.rotation.y) - dz * Math.sin(node.rotation.y);
      return !(Math.abs(across) < 1.8 && forward > 0 && forward < (maxZ - minZ) / 2 + 4);
    });
  const counts = { grass: 0, flowers: 0, bushes: 0, trees: 0, stones: 0 };
  const place = (kind, point, scale, type) => {
    const prop = props.placeAsset(root, kind, point, random, scale);
    if (!prop) return;
    prop.position.y += ground.getHeightAtCoordinates(point.x, point.z) - getWorldHeight(point.x, point.z);
    prop.metadata = { centralCampVegetation: type };
    for (const mesh of prop.getChildMeshes()) {
      mesh.metadata = { ...mesh.metadata, worldShadows: { cast: false, receive: true } };
    }
    counts[type]++;
  };
  if (props.available) {
    const existingTrees = scene.transformNodes.filter((node) => /^forest-(birch_|oak_)/.test(node.name))
      .map((node) => { node.computeWorldMatrix(true); return node.getAbsolutePosition().clone(); })
      .filter((point) => Math.hypot(point.x - CONFIG.center.x, point.z - CONFIG.center.z) < CONFIG.vegetationRadius);
    const treeBases = [...existingTrees];
    const pathEdges = ENVIRONMENT_ROUTES.flatMap(({ points, width = 3.2 }) =>
      points.filter((point, index) => index % 8 === 0).flatMap((point, index, samples) => {
        const next = samples[index + 1] || samples[index - 1];
        if (!next) return [];
        const length = Math.hypot(next.x - point.x, next.z - point.z) || 1;
        return [-1, 1].map((side) => ({
          x: point.x + (next.z - point.z) / length * side * (width / 2 + 2.4),
          z: point.z - (next.x - point.x) / length * side * (width / 2 + 2.4),
        }));
      })).filter((point) => Math.hypot(point.x - CONFIG.center.x, point.z - CONFIG.center.z) < CONFIG.vegetationRadius);
    const anchors = [...CONFIG.beds.map(([x, z]) => ({ x, z })),
      ...pathEdges, ...treeBases.map((tree) => ({ x: tree.x + 1.8, z: tree.z + 1.1 }))];
    // Spread the bounded budget across camp beds, forest pockets and road shoulders.
    for (let index = anchors.length - 1; index > 0; index--) {
      const other = Math.floor(random() * (index + 1));
      [anchors[index], anchors[other]] = [anchors[other], anchors[index]];
    }
    const occupied = [];
    for (const anchor of anchors) {
      const richness = 0.65 + random() * 0.7;
      const radius = CONFIG.clusterRadius * (0.7 + random() * 0.6);
      const grassCount = Math.ceil(CONFIG.clusterGrass * density * richness);
      const flowerCount = Math.ceil(CONFIG.clusterFlowers * density * richness);
      for (let index = 0; index < grassCount + flowerCount; index++) {
        const flowering = index >= grassCount;
        const type = flowering ? "flowers" : "grass";
        if (counts[type] >= Math.floor((flowering ? CONFIG.flowerLimit : CONFIG.grassLimit) * density)) continue;
        const angle = random() * Math.PI * 2, distance = Math.sqrt(random()) * radius;
        const point = { x: anchor.x + Math.cos(angle) * distance, z: anchor.z + Math.sin(angle) * distance };
        if (!clear(point) || occupied.some((other) => Math.hypot(other.x - point.x, other.z - point.z) < 0.45)) continue;
        const [min, max] = flowering ? CONFIG.flowerScale : CONFIG.grassScale;
        place(flowering ? "campFlowers" : "grassTufts", point, min + random() * (max - min), type);
        occupied.push(point);
      }
      const point = { x: anchor.x + 0.8, z: anchor.z - 1.2 };
      if (counts.bushes < Math.floor(CONFIG.bushLimit * density) && clear(point, 0.8))
        place(random() < 0.5 ? "undergrowth" : "bushes", point, 0.5 + random() * 0.3, "bushes");
      const stone = { x: anchor.x - 1.2, z: anchor.z + 0.7 };
      if (random() < 0.25 && counts.stones < Math.floor(CONFIG.stoneLimit * density) && clear(stone, 0.8))
        place("stones", stone, 0.3 + random() * 0.2, "stones");
    }
  }

  batchCampVegetation(root);

  root.metadata = { vegetationCounts: counts };
  for (const mesh of root.getChildMeshes()) mesh.freezeWorldMatrix();
  return root;
};
