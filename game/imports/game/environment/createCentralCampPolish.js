import { TransformNode } from "@babylonjs/core";
import { getWorldHeight } from "../worldConfig";
import { CENTRAL_CAMP_POLISH as CONFIG, getCentralCampMix } from "./centralCampPolishConfig";
import { randomForChunk } from "./createForestProps";
import { isOnEnvironmentPath } from "./environmentPaths";
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
  const counts = { grass: 0, flowers: 0, bushes: 0, trees: 0 };
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
    const existingTrees = scene.transformNodes.filter((node) => /^forest-(birch_|oak_)/.test(node.name) &&
      getCentralCampMix(node.position.x, node.position.z) > 0);
    for (const [x, z] of CONFIG.treeGroves) {
      if (!props.canPlace({ x, z }, 4) || !clear({ x, z }, 4) ||
        existingTrees.some((tree) => Math.hypot(tree.position.x - x, tree.position.z - z) < 7)) continue;
      place("broadleaf", { x, z }, 0.85 + random() * 0.15, "trees");
      if (counts.trees >= Math.ceil(6 * density)) break;
    }
    const anchors = [...CONFIG.beds.map(([x, z]) => ({ x, z })),
      ...existingTrees.sort((a, b) => Math.hypot(a.position.x, a.position.z) - Math.hypot(b.position.x, b.position.z))
        .slice(0, 16).map((tree) => ({ x: tree.position.x + 1.8, z: tree.position.z + 1.1 }))];
    const occupied = [];
    for (const anchor of anchors) {
      const grassCount = Math.ceil(CONFIG.clusterGrass * density);
      const flowerCount = Math.ceil(CONFIG.clusterFlowers * density);
      for (let index = 0; index < grassCount + flowerCount; index++) {
        const flowering = index >= grassCount;
        const type = flowering ? "flowers" : "grass";
        if (counts[type] >= Math.floor((flowering ? CONFIG.flowerLimit : CONFIG.grassLimit) * density)) continue;
        const angle = random() * Math.PI * 2, radius = Math.sqrt(random()) * CONFIG.clusterRadius;
        const point = { x: anchor.x + Math.cos(angle) * radius, z: anchor.z + Math.sin(angle) * radius };
        if (!clear(point) || occupied.some((other) => Math.hypot(other.x - point.x, other.z - point.z) < 0.45)) continue;
        const [min, max] = flowering ? CONFIG.flowerScale : CONFIG.grassScale;
        place(flowering ? "flowers" : "grassTufts", point, min + random() * (max - min), type);
        occupied.push(point);
      }
      const point = { x: anchor.x + 0.8, z: anchor.z - 1.2 };
      if (counts.bushes < Math.floor(CONFIG.bushLimit * density) && clear(point, 0.8))
        place("bushes", point, 0.5 + random() * 0.2, "bushes");
    }
  }

  batchCampVegetation(root);

  root.metadata = { vegetationCounts: counts };
  for (const mesh of root.getChildMeshes()) mesh.freezeWorldMatrix();
  return root;
};
