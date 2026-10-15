import { Color3, VertexBuffer, VertexData } from "@babylonjs/core";
import { getWorldHeight } from "../worldConfig";
import { STARTER_RIVER as RIVER } from "./starterRiverConfig";
import { getStarterRiverBankMix } from "./starterRiverHeight";
import { WORLD_PALETTE as PALETTE } from "./worldPalette";
import { attachRiverGroundSampling, createRiverGroundGrid } from "./starterRiverGroundGeometry";

// Replace a few coarse terrain cells with a fine, collidable patch, sharing
// the ground material. The rest of the world's resolution remains unchanged.
export const createStarterRiverGround = (scene, ground) => {
  const source = ground.getVerticesData(VertexBuffer.PositionKind);
  const sourceColors = ground.getVerticesData(VertexBuffer.ColorKind);
  const columns = ground.subdivisionsX, stride = columns + 1;
  const min = source[0], maxZ = source[2], step = source[3] - min;
  const margin = Math.max(...RIVER.path.map((point) => point.width / 2)) + RIVER.bankWidth + 1;
  const left = Math.floor((Math.min(...RIVER.path.map((point) => point.x)) - margin - min) / step);
  const right = Math.ceil((Math.max(...RIVER.path.map((point) => point.x)) + margin - min) / step);
  const top = Math.floor((maxZ - RIVER.path[RIVER.path.length - 1].z - 1) / step);
  const bottom = Math.ceil((maxZ - RIVER.path[0].z + 1) / step);
  const bounds = { minX: min + left * step, maxX: min + right * step,
    minZ: maxZ - bottom * step, maxZ: maxZ - top * step };
  const { patch, positions, shoreVertices } = createRiverGroundGrid(scene, bounds);
  const colors = new Float32Array(positions.length / 3 * 4);
  const normals = patch.getVerticesData(VertexBuffer.NormalKind);
  const earth = Color3.FromHexString(PALETTE.terrain.earth).asArray();
  const coarseHeight = ground.getHeightAtCoordinates.bind(ground);
  for (let index = 0; index < positions.length; index += 3) {
    const x = positions[index] + patch.position.x, z = positions[index + 2] + patch.position.z;
    const border = Math.min(x - bounds.minX, bounds.maxX - x, z - bounds.minZ, bounds.maxZ - z);
    // Meet the original triangles exactly at the boundary (no cracks or steps).
    const blend = Math.max(0, Math.min(1, border / 2));
    positions[index + 1] = coarseHeight(x, z) * (1 - blend) + getWorldHeight(x, z) * blend;
    if (shoreVertices.has(index / 3)) positions[index + 1] = RIVER.waterLevel;
    const col = Math.floor((x - min) / step), row = Math.floor((maxZ - z) / step);
    const u = (x - min) / step - col, v = (maxZ - z) / step - row;
    const a = row * stride + col, d = a + stride + 1;
    // Barycentric colors reproduce the existing coarse ground outside the banks.
    const samples = u >= v ? [[a, 1 - u], [a + 1, u - v], [d, v]]
      : [[a, 1 - v], [a + stride, v - u], [d, u]];
    const bank = getStarterRiverBankMix(x, z) * 0.55;
    for (let channel = 0; channel < 3; channel++) {
      const original = samples.reduce((sum, [vertex, weight]) => sum + sourceColors[vertex * 4 + channel] * weight, 0);
      colors[index / 3 * 4 + channel] = original * (1 - bank) + earth[channel] * bank;
    }
    colors[index / 3 * 4 + 3] = 1;
  }
  VertexData.ComputeNormals(positions, patch.getIndices(), normals);
  patch.updateVerticesData(VertexBuffer.PositionKind, positions);
  patch.updateVerticesData(VertexBuffer.NormalKind, normals);
  patch.setVerticesData(VertexBuffer.ColorKind, colors);
  patch.useVertexColors = true;
  patch.material = ground.material;
  patch.checkCollisions = true;
  patch.receiveShadows = true;
  patch.metadata = { worldShadows: { cast: false, receive: true } };
  patch.refreshBoundingInfo();
  patch.freezeWorldMatrix();
  attachRiverGroundSampling(patch, positions);
  const indices = ground.getIndices(), retained = [];
  for (let index = 0; index < indices.length; index += 6) {
    const cell = index / 6, row = Math.floor(cell / columns), col = cell % columns;
    if (col < left || col >= right || row < top || row >= bottom) retained.push(...indices.slice(index, index + 6));
  }
  ground.setIndices(retained);
  const inside = (x, z) => x > bounds.minX && x < bounds.maxX && z > bounds.minZ && z < bounds.maxZ;
  ground.getHeightAtCoordinates = (x, z) => inside(x, z) ? patch.getHeightAtCoordinates(x, z) : coarseHeight(x, z);
  const coarseNormal = ground.getNormalAtCoordinates.bind(ground);
  ground.getNormalAtCoordinates = (x, z) => inside(x, z) ? patch.getNormalAtCoordinates(x, z) : coarseNormal(x, z);
  return patch;
};
