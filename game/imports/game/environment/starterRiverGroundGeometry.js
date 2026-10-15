import { MeshBuilder, Vector3, VertexBuffer } from "@babylonjs/core";
import { getWorldHeight } from "../worldConfig";
import { STARTER_RIVER as RIVER, riverToWorld } from "./starterRiverConfig";
import { getStarterRiverSection } from "./starterRiverHeight";

const bisect = (from, to, sample) => {
  const sign = Math.sign(sample(from));
  for (let step = 0; step < 28; step++) {
    const middle = (from + to) / 2;
    if (Math.sign(sample(middle)) === sign) from = middle;
    else to = middle;
  }
  return (from + to) / 2;
};

export const createRiverGroundGrid = (scene, bounds) => {
  const worldHeight = (x, z) => { const point = riverToWorld(x, z); return getWorldHeight(point.x, point.z); };
  const width = bounds.maxX - bounds.minX, height = bounds.maxZ - bounds.minZ;
  const outerColumns = 2, bankColumns = Math.ceil(RIVER.bankWidth / RIVER.groundSpacing);
  // Even counts retain a centerline vertex, including narrow sections.
  const bedColumns = 2 * Math.ceil((bounds.maxWidth || Math.max(...RIVER.path.map((point) => point.width))) / (2 * RIVER.groundSpacing));
  const counts = [outerColumns, bankColumns, bedColumns, bankColumns, outerColumns];
  const columns = counts.reduce((sum, count) => sum + count, 0);
  const start = RIVER.path[0].z, end = RIVER.path[RIVER.path.length - 1].z;
  const centerHeight = (z) => worldHeight(getStarterRiverSection(z).x, z) - RIVER.waterLevel;
  const tips = RIVER.endFade > 0 ? [bisect(start, start + RIVER.endFade, centerHeight),
    bisect(end - RIVER.endFade, end, centerHeight)] : [start, end];
  const regularRows = Math.ceil(height / RIVER.sampleSpacing);
  const samples = Array.from({ length: regularRows + 1 }, (_, row) => bounds.maxZ - row / regularRows * height);
  // The rounded tips need closer samples than the long banks.
  if (RIVER.endFade > 0) for (const offset of [0, 0.005, 0.02, 0.05, 0.1, 0.18]) {
    for (const z of [tips[0] + offset, tips[1] - offset]) if (z >= bounds.minZ && z <= bounds.maxZ) samples.push(z);
  }
  samples.sort((a, b) => b - a);
  const rowZs = samples.filter((z, index) => index === 0 || samples[index - 1] - z > 1e-6);
  const rows = rowZs.length - 1;
  const patch = MeshBuilder.CreateGround("starter-river-banks", { width, height,
    subdivisionsX: columns, subdivisionsY: rows, updatable: true }, scene);
  patch.position.set((bounds.minX + bounds.maxX) / 2, 0, (bounds.minZ + bounds.maxZ) / 2);
  const positions = patch.getVerticesData(VertexBuffer.PositionKind), shoreVertices = new Set();
  for (let row = 0; row <= rows; row++) {
    const z = rowZs[row];
    const section = getStarterRiverSection(Math.max(start, Math.min(end, z)));
    let left = section.x, right = section.x;
    const wet = z >= tips[0] && z <= tips[1];
    if (wet && section.fade === 1) {
      // Fully carved sections have exact analytic shores; avoid height searches
      // along the world-length channel during scene creation.
      left = section.x - section.halfWidth;
      right = section.x + section.halfWidth;
    } else if (wet && !tips.includes(z)) {
      const edgeHeight = (x) => worldHeight(x, z) - RIVER.waterLevel;
      left = bisect(section.x - section.halfWidth - RIVER.bankWidth, section.x, edgeHeight);
      right = bisect(section.x, section.x + section.halfWidth + RIVER.bankWidth, edgeHeight);
    }
    const anchors = [bounds.minX, left - RIVER.bankWidth, left, right, right + RIVER.bankWidth, bounds.maxX];
    let column = 0;
    for (let band = 0; band < counts.length; band++) {
      for (let step = 0; step < counts[band]; step++, column++) {
        const vertex = row * (columns + 1) + column;
        positions[vertex * 3] = anchors[band] + (anchors[band + 1] - anchors[band]) * step / counts[band] - patch.position.x;
        positions[vertex * 3 + 2] = z - patch.position.z;
        if (wet && step === 0 && (band === 2 || band === 3)) shoreVertices.add(vertex);
      }
    }
    const last = row * (columns + 1) + columns;
    positions[last * 3] = bounds.maxX - patch.position.x;
    positions[last * 3 + 2] = z - patch.position.z;
  }
  return { patch, positions, shoreVertices };
};

// GroundMesh's built-in height lookup assumes a rectangular grid. Search the
// curved rows instead, then sample the same triangle used for collisions.
export const attachRiverGroundSampling = (patch, positions) => {
  const columns = patch.subdivisionsX, rows = patch.subdivisionsY, stride = (columns + 1) * 3;
  const triangleAt = (x, z) => {
    x -= patch.position.x; z -= patch.position.z;
    let low = 0, high = rows - 1;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if (positions[middle * stride + 2] >= z) low = middle;
      else high = middle - 1;
    }
    const top = low * stride, bottom = top + stride;
    const t = (positions[top + 2] - z) / (positions[top + 2] - positions[bottom + 2]);
    low = 0; high = columns - 1;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2), offset = middle * 3;
      if (positions[top + offset] * (1 - t) + positions[bottom + offset] * t <= x) low = middle;
      else high = middle - 1;
    }
    const a = top + low * 3, d = bottom + (low + 1) * 3;
    return [a, x >= positions[a] * (1 - t) + positions[d] * t ? a + 3 : d - 3, d, x, z];
  };
  patch.getHeightAtCoordinates = (x, z) => {
    const [a, b, c, px, pz] = triangleAt(x, z);
    const denominator = (positions[b + 2] - positions[c + 2]) * (positions[a] - positions[c]) +
      (positions[c] - positions[b]) * (positions[a + 2] - positions[c + 2]);
    if (Math.abs(denominator) < 1e-12) return positions[a + 1] + patch.position.y;
    const u = ((positions[b + 2] - positions[c + 2]) * (px - positions[c]) +
      (positions[c] - positions[b]) * (pz - positions[c + 2])) / denominator;
    const v = ((positions[c + 2] - positions[a + 2]) * (px - positions[c]) +
      (positions[a] - positions[c]) * (pz - positions[c + 2])) / denominator;
    return positions[a + 1] * u + positions[b + 1] * v + positions[c + 1] * (1 - u - v) + patch.position.y;
  };
  patch.getNormalAtCoordinates = (x, z) => {
    const [a, b, c] = triangleAt(x, z);
    const normal = Vector3.Cross(new Vector3(positions[b] - positions[a], positions[b + 1] - positions[a + 1], positions[b + 2] - positions[a + 2]),
      new Vector3(positions[c] - positions[a], positions[c + 1] - positions[a + 1], positions[c + 2] - positions[a + 2])).normalize();
    return normal.y < 0 ? normal.negate() : normal;
  };
};
