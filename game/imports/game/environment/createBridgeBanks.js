import { Color3, Mesh, Ray, Vector3, VertexData } from "@babylonjs/core";
import { getWorldHeight } from "../worldConfig";
import { BRIDGE_BANK_POLISH as CONFIG } from "./environmentPolishConfig";
import { getStarterRiverSection } from "./starterRiverHeight";
import { STARTER_RIVER } from "./starterRiverConfig";
import { randomForChunk } from "./createForestProps";
import { WORLD_PALETTE as PALETTE } from "./worldPalette";

// Local visual dressing only. The original terrain/bridge remain the collision surfaces.
export const createBridgeBanks = ({ scene, root, ground, props, density }) => {
  const deck = scene.getMeshByName("central-camp-bridge-collider");
  if (!deck) return;
  deck.computeWorldMatrix(true);
  const { minimumWorld: min, maximumWorld: max } = deck.getBoundingInfo().boundingBox;
  const centerX = (min.x + max.x) / 2, halfDeck = (max.x - min.x) / 2;
  const positions = [], indices = [], colors = [];
  const grass = Color3.FromHexString(PALETTE.terrain.forest);
  const earth = Color3.FromHexString(PALETTE.terrain.earth);
  const sand = Color3.Lerp(Color3.FromHexString(PALETTE.path), earth, 0.35);
  const random = randomForChunk({ x: centerX + 108, z: min.z });
  const place = (kind, x, z, scale) => {
    if (!props.available || !props.canPlaceBankDetail({ x, z }, 0.6) ||
      ground.getHeightAtCoordinates(x, z) < STARTER_RIVER.waterLevel + 0.025 ||
      (Math.abs(x - centerX) < halfDeck + CONFIG.walkwayClearance && z >= min.z - 4 && z <= max.z + 4)) return;
    const prop = props.placeAsset(root, kind, { x, z }, random, scale);
    if (!prop) return;
    prop.position.y += ground.getHeightAtCoordinates(x, z) - getWorldHeight(x, z);
    prop.metadata = { bridgeBankDetail: true };
    for (const mesh of prop.getChildMeshes()) {
      mesh.metadata = { ...mesh.metadata, worldShadows: { cast: false, receive: true } };
    }
  };
  for (const shore of [-1, 1]) {
    const endZ = shore < 0 ? min.z : max.z;
    // A little sand settles onto the first slabs, fading inward without hiding the stone.
    // Sample the existing deck; its arched floor and collision data stay untouched.
    const dustStart = positions.length / 3;
    for (const [row, along] of [-0.5, 0.02, CONFIG.thresholdDustLength / 2, CONFIG.thresholdDustLength].entries()) {
      for (let band = 0; band < 7; band++) {
        const side = (band - 3) / 3;
        const x = centerX + side * (halfDeck - 0.15);
        const z = endZ - shore * along;
        const hit = along > 0 ? scene.pickWithRay(new Ray(new Vector3(x, max.y + 2, z), Vector3.Down(), 6),
          (mesh) => mesh === deck) : null;
        const height = hit?.hit ? hit.pickedPoint.y : ground.getHeightAtCoordinates(x, z);
        positions.push(x, height + 0.045, z);
        const fade = row === 0 || row === 3 ? 0 : row === 1 ? 1 : 0.45;
        const uneven = 0.85 + Math.sin(band * 1.7 + shore) * 0.15;
        colors.push(sand.r, sand.g, sand.b,
          (1 - Math.abs(side) ** 4) * fade * CONFIG.thresholdDustOpacity * uneven);
      }
    }
    for (let row = 0; row < 3; row++) {
      for (let band = 0; band < 6; band++) {
        const a = dustStart + row * 7 + band, b = a + 1, c = a + 7, d = c + 1;
        if (shore < 0) indices.push(a, b, c, b, d, c);
        else indices.push(a, c, b, b, c, d);
      }
    }
    for (const side of [-1, 1]) {
      const x = centerX + side * (halfDeck + CONFIG.walkwayClearance + CONFIG.shoulderWidth / 2);
      const z = endZ + shore * 0.35;
      // Three low radial rings form shallow, irregular grassy slopes beside the abutment.
      const start = positions.length / 3, spokes = 12;
      positions.push(x, ground.getHeightAtCoordinates(x, z) + CONFIG.shoulderHeight, z);
      const centerColor = Color3.Lerp(grass, earth, 0.3);
      colors.push(centerColor.r, centerColor.g, centerColor.b, 1);
      for (let ring = 1; ring <= 3; ring++) {
        const radius = ring / 3;
        for (let step = 0; step < spokes; step++) {
          const angle = step * Math.PI * 2 / spokes;
          const irregular = 1 + Math.sin(angle * 3 + shore + side) * 0.07;
          // X never extends into the reserved walking lane, even with edge variation.
          const px = x + Math.cos(angle) * CONFIG.shoulderWidth / 2 * radius;
          const pz = z + Math.sin(angle) * CONFIG.shoulderDepth / 2 * radius * irregular;
          positions.push(px, ground.getHeightAtCoordinates(px, pz) + 0.025 +
            CONFIG.shoulderHeight * (1 - radius * radius) ** 2, pz);
          const color = Color3.Lerp(grass, earth, 0.3 * (1 - radius));
          colors.push(color.r, color.g, color.b, ring === 3 ? 0 : 1);
        }
      }
      for (let step = 0; step < spokes; step++) {
        const next = (step + 1) % spokes;
        indices.push(start, start + 1 + step, start + 1 + next);
        for (let ring = 0; ring < 2; ring++) {
          const a = start + 1 + ring * spokes + step, b = start + 1 + ring * spokes + next;
          indices.push(a, a + spokes, b, b, a + spokes, b + spokes);
        }
      }
      const count = density < 1 ? 2 : 3;
      for (let index = 0; index < count; index++) {
        place("rocks", x + side * (index * 0.8 - 0.6), z + shore * (index % 2 ? 1 : -0.4),
          CONFIG.rockScales[index]);
        place("grassTufts", x + side * (index * 0.7 + 0.3), z + shore * (index * 0.65 - 0.8),
          0.6 + index * 0.08);
      }
    }
    // Follow the actual waterline on both banks, using existing low-poly grass as reeds.
    for (const [index, offset] of CONFIG.shorelineOffsets.entries()) {
      if (density < 1 && index % 2) continue;
      const x = centerX + offset, section = getStarterRiverSection(x);
      if (!section) continue;
      const z = -section.x + shore * (section.halfWidth + 0.65 + index % 2 * 0.2);
      place("grassTufts", x, z, 0.65 + index % 3 * 0.1);
      if (index === 1 || index === 4) place("rocks", x + 0.65, z + shore * 0.35, 0.48);
    }
  }
  const shoulders = new Mesh("bridge-bank-shoulders", scene);
  const data = new VertexData();
  Object.assign(data, { positions, indices, colors, normals: [] });
  VertexData.ComputeNormals(positions, indices, data.normals);
  data.applyToMesh(shoulders);
  shoulders.material = scene.getMaterialByName("environment-dirt-path");
  shoulders.parent = root;
  shoulders.useVertexColors = true;
  shoulders.hasVertexAlpha = true;
  shoulders.isPickable = false;
  shoulders.checkCollisions = false;
  shoulders.receiveShadows = true;
  shoulders.metadata = { worldShadows: { cast: false, receive: true } };
};
