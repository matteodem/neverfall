import { Color3, Mesh, VertexBuffer, VertexData } from "@babylonjs/core";
import { getWorldHeight } from "../worldConfig";
import { STARTER_RIVER as RIVER, riverToWorld, worldToRiver } from "./starterRiverConfig";
import { getStarterRiverBankMix, getStarterRiverSection } from "./starterRiverHeight";
import { WORLD_PALETTE as PALETTE } from "./worldPalette";
import { attachRiverGroundSampling, createRiverGroundGrid } from "./starterRiverGroundGeometry";
import { BRIDGE_BANK_POLISH } from "./environmentPolishConfig";

// Replace only coarse cells along the channel. Short strips follow the bends,
// then merge into one bank mesh: distant terrain and draw calls stay unchanged.
export const createStarterRiverGround = (scene, ground) => {
  const source = ground.getVerticesData(VertexBuffer.PositionKind);
  const sourceColors = ground.getVerticesData(VertexBuffer.ColorKind);
  const columns = ground.subdivisionsX, stride = columns + 1;
  const min = source[0], maxZ = source[2], step = source[3] - min;
  const coarseHeight = ground.getHeightAtCoordinates.bind(ground);
  const coarseNormal = ground.getNormalAtCoordinates.bind(ground);
  const earth = Color3.FromHexString(PALETTE.terrain.earth).asArray();
  const strips = [], meshes = [];
  for (let col = 0; col < columns; col++) {
    const minZ = min + col * step, maxLong = minZ + step;
    // Conservative bounds include the full curve, width and a terrain transition.
    let lower = Infinity, upper = -Infinity, maxWidth = 0;
    for (let sample = 0; sample <= 32; sample++) {
      const section = getStarterRiverSection(minZ + step * sample / 32);
      if (!section) continue;
      const margin = section.halfWidth + RIVER.bankWidth + 2.5;
      lower = Math.min(lower, section.x - margin);
      upper = Math.max(upper, section.x + margin);
      maxWidth = Math.max(maxWidth, section.halfWidth * 2);
    }
    if (!Number.isFinite(lower)) continue;
    const top = Math.max(0, Math.floor((lower + maxZ) / step));
    const bottom = Math.min(ground.subdivisionsY, Math.ceil((upper + maxZ) / step));
    const bounds = { minX: -maxZ + top * step, maxX: -maxZ + bottom * step,
      minZ, maxZ: maxLong, maxWidth };
    const { patch, positions, shoreVertices } = createRiverGroundGrid(scene, bounds);
    const colors = new Float32Array(positions.length / 3 * 4);
    const normals = patch.getVerticesData(VertexBuffer.NormalKind);
    for (let index = 0; index < positions.length; index += 3) {
      const cross = positions[index] + patch.position.x, along = positions[index + 2] + patch.position.z;
      const { x, z } = riverToWorld(cross, along);
      const section = getStarterRiverSection(along);
      const blend = section ? Math.max(0, Math.min(1,
        (section.halfWidth + RIVER.bankWidth + 2 - Math.abs(cross - section.x)) / 2)) : 0;
      positions[index + 1] = coarseHeight(x, z) * (1 - blend) + getWorldHeight(x, z) * blend;
      if (shoreVertices.has(index / 3)) positions[index + 1] = RIVER.waterLevel;
      const sourceCol = Math.max(0, Math.min(columns - 1, Math.floor((x - min) / step)));
      const row = Math.max(0, Math.min(ground.subdivisionsY - 1, Math.floor((maxZ - z) / step)));
      const u = (x - min) / step - sourceCol, v = (maxZ - z) / step - row;
      const a = row * stride + sourceCol, d = a + stride + 1;
      const samples = u >= v ? [[a, 1 - u], [a + 1, u - v], [d, v]]
        : [[a, 1 - v], [a + stride, v - u], [d, u]];
      const bank = getStarterRiverBankMix(x, z) * 0.55;
      // Color only: softly widen the dry soil shoulder near the existing camp crossing.
      // Keep every height, shoreline vertex and collision triangle unchanged.
      const shoreDistance = section ? Math.abs(cross - section.x) - section.halfWidth : Infinity;
      const local = Math.max(0, 1 - Math.abs(x) / BRIDGE_BANK_POLISH.soilLength);
      const shore = Math.max(0, Math.min(1, 1 - shoreDistance / BRIDGE_BANK_POLISH.soilReach));
      const soil = Math.max(bank, local * local * shore * shore * (3 - 2 * shore) * 0.65);
      for (let channel = 0; channel < 3; channel++) {
        const original = samples.reduce((sum, [vertex, weight]) => sum + sourceColors[vertex * 4 + channel] * weight, 0);
        colors[index / 3 * 4 + channel] = original * (1 - soil) + earth[channel] * soil;
      }
      colors[index / 3 * 4 + 3] = 1;
    }
    VertexData.ComputeNormals(positions, patch.getIndices(), normals);
    patch.updateVerticesData(VertexBuffer.PositionKind, positions);
    patch.updateVerticesData(VertexBuffer.NormalKind, normals);
    patch.setVerticesData(VertexBuffer.ColorKind, colors);
    // Retain only the sampling data when the temporary meshes are merged/disposed.
    const sampler = { subdivisionsX: patch.subdivisionsX, subdivisionsY: patch.subdivisionsY,
      position: patch.position.clone() };
    attachRiverGroundSampling(sampler, positions);
    strips[col] = { top, bottom, sampler };
    const center = riverToWorld(patch.position.x, patch.position.z);
    patch.position.set(center.x, 0, center.z);
    patch.rotation.y = Math.PI / 2;
    meshes.push(patch);
  }
  const banks = Mesh.MergeMeshes(meshes, true, true);
  banks.name = "starter-river-banks";
  banks.useVertexColors = true;
  banks.material = ground.material;
  banks.checkCollisions = true;
  banks.receiveShadows = true;
  banks.metadata = { worldShadows: { cast: false, receive: true } };
  banks.freezeWorldMatrix();
  const indices = ground.getIndices(), retained = [];
  for (let index = 0; index < indices.length; index += 6) {
    const cell = index / 6, row = Math.floor(cell / columns), strip = strips[cell % columns];
    if (!strip || row < strip.top || row >= strip.bottom) retained.push(...indices.slice(index, index + 6));
  }
  ground.setIndices(retained);
  const samplerAt = (x, z) => {
    const strip = strips[Math.max(0, Math.min(columns - 1, Math.floor((x - min) / step)))];
    const row = (maxZ - z) / step;
    return x >= min && x <= min + columns * step && strip && row >= strip.top && row <= strip.bottom ? strip.sampler : null;
  };
  ground.getHeightAtCoordinates = (x, z) => {
    const sampler = samplerAt(x, z), point = worldToRiver(x, z);
    return sampler ? sampler.getHeightAtCoordinates(point.x, point.z) : coarseHeight(x, z);
  };
  ground.getNormalAtCoordinates = (x, z) => {
    const sampler = samplerAt(x, z), point = worldToRiver(x, z);
    if (!sampler) return coarseNormal(x, z);
    const normal = sampler.getNormalAtCoordinates(point.x, point.z);
    return normal.set(normal.z, normal.y, -normal.x);
  };
  banks.getHeightAtCoordinates = ground.getHeightAtCoordinates;
  banks.getNormalAtCoordinates = ground.getNormalAtCoordinates;
  return banks;
};
