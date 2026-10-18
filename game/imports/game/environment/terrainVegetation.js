import { Color3, Vector3, VertexBuffer } from "@babylonjs/core";
import { PAINT_PRECISION, TERRAIN_PAINT_COLORS, paintKey } from "../../api/terrainPaint/config";
import { PATH_BASE_COLOR, WORLD_PALETTE } from "./worldPalette";

const systems = new WeakMap();
const CELL_SIZE = 16;
const chroma = (rgb) => {
  const sum = rgb[0] + rgb[1] + rgb[2] || 1;
  return rgb.map((value) => value / sum);
};
const references = [
  ...["forest", "highlands", "olive", "forestFloor"].map((key) => ({ hex: WORLD_PALETTE.terrain[key], green: true })),
  ...[WORLD_PALETTE.terrain.earth, WORLD_PALETTE.terrain.snow, WORLD_PALETTE.rock, WORLD_PALETTE.path]
    .map((hex) => ({ hex, green: false })),
  { rgb: PATH_BASE_COLOR, green: false },
  ...TERRAIN_PAINT_COLORS.map((color) => ({ ...color, green: !!color.supportsVegetation })),
].map(({ hex, rgb, green }) => ({ rgb: chroma(rgb || Color3.FromHexString(hex).asArray()), green }));
export const isGreenTerrainColor = (rgb) => {
  const color = chroma(rgb);
  let closest = Infinity, green = false;
  for (const reference of references) {
    const distance = reference.rgb.reduce((sum, value, index) => sum + (value - color[index]) ** 2, 0);
    if (distance < closest) { closest = distance; green = reference.green; }
  }
  return green;
};

export const getTerrainVegetation = (scene) => systems.get(scene);

// Retain seeded candidates, including hidden ones. Painting never rerolls placement.
export const createTerrainVegetation = (scene, terrain) => {
  const cells = new Map(), surfaces = [], candidates = new Set(), influences = new Map();
  const pending = new Set(), flushers = new Set();
  let colorsDirty = false;
  for (const mesh of [terrain, scene.getMeshByName("starter-river-banks")].filter(Boolean)) {
    const positions = mesh.getVerticesData(VertexBuffer.PositionKind);
    const surface = { mesh, colors: mesh.getVerticesData(VertexBuffer.ColorKind), points: [], keys: [] };
    const matrix = mesh.computeWorldMatrix(true);
    for (let index = 0; index < positions.length; index += 3) {
      const point = Vector3.TransformCoordinates(Vector3.FromArray(positions, index), matrix);
      surface.points.push(point);
      surface.keys.push(paintKey(Math.round(point.x * PAINT_PRECISION), Math.round(point.z * PAINT_PRECISION)));
    }
    surfaces.push(surface);
    const indices = mesh.getIndices();
    for (let index = 0; index < indices.length; index += 3) {
      const vertices = [indices[index], indices[index + 1], indices[index + 2]];
      const [a, b, c] = vertices.map((vertex) => surface.points[vertex]);
      const denominator = (b.z - c.z) * (a.x - c.x) + (c.x - b.x) * (a.z - c.z);
      if (Math.abs(denominator) < 1e-12) continue;
      const face = { surface, vertices, a, b, c, denominator };
      for (let x = Math.floor(Math.min(a.x, b.x, c.x) / CELL_SIZE); x <= Math.floor(Math.max(a.x, b.x, c.x) / CELL_SIZE); x++) {
        for (let z = Math.floor(Math.min(a.z, b.z, c.z) / CELL_SIZE); z <= Math.floor(Math.max(a.z, b.z, c.z) / CELL_SIZE); z++) {
          const key = paintKey(x, z);
          if (!cells.has(key)) cells.set(key, []);
          cells.get(key).push(face);
        }
      }
    }
  }
  const sample = ({ x, z }) => {
    for (const face of cells.get(paintKey(Math.floor(x / CELL_SIZE), Math.floor(z / CELL_SIZE))) || []) {
      const { a, b, c, denominator } = face;
      const u = ((b.z - c.z) * (x - c.x) + (c.x - b.x) * (z - c.z)) / denominator;
      const v = ((c.z - a.z) * (x - c.x) + (a.x - c.x) * (z - c.z)) / denominator;
      const w = 1 - u - v;
      if (Math.min(u, v, w) >= -1e-6) return { surface: face.surface,
        samples: face.vertices.map((index, offset) => ({ index, weight: [u, v, w][offset], key: face.surface.keys[index] })) };
    }
    return null;
  };
  const update = (candidate) => {
    const { location } = candidate;
    const rgb = [0, 0, 0];
    if (location) for (const { index, weight } of location.samples) {
      for (let channel = 0; channel < 3; channel++) {
        rgb[channel] += location.surface.colors[index * 4 + channel] * weight;
      }
    }
    const visible = !!location && isGreenTerrainColor(rgb);
    if (visible === candidate.visible) return;
    candidate.visible = visible;
    candidate.setVisible(visible);
    if (candidate.flush) flushers.add(candidate.flush);
  };
  const refreshColors = () => {
    for (const surface of surfaces) {
      surface.colors = surface.mesh.getVerticesData(VertexBuffer.ColorKind);
    }
  };
  const system = {
    register(owner, position, setVisible, flush) {
      const candidate = { location: sample(position), setVisible, flush, visible: null };
      candidates.add(candidate);
      for (const { key } of candidate.location?.samples || []) {
        if (!influences.has(key)) influences.set(key, new Set());
        influences.get(key).add(candidate);
      }
      update(candidate);
      owner.onDisposeObservable.addOnce(() => {
        candidates.delete(candidate); pending.delete(candidate);
        for (const { key } of candidate.location?.samples || []) {
          const linked = influences.get(key);
          linked?.delete(candidate);
          if (!linked?.size) influences.delete(key);
        }
      });
    },
    changed(key) {
      colorsDirty = true;
      for (const candidate of influences.get(key) || []) pending.add(candidate);
    },
    restore() {
      colorsDirty = true;
      for (const candidate of candidates) pending.add(candidate);
      system.flush();
    },
    flush() {
      if (colorsDirty || pending.size) refreshColors();
      colorsDirty = false;
      for (const candidate of pending) update(candidate);
      pending.clear();
      for (const flush of flushers) flush();
      flushers.clear();
    },
  };
  systems.set(scene, system);
  const observer = scene.onBeforeRenderObservable.add(() => system.flush());
  scene.onDisposeObservable.addOnce(() => {
    systems.delete(scene);
    scene.onBeforeRenderObservable.remove(observer);
    cells.clear(); candidates.clear(); influences.clear(); pending.clear(); flushers.clear();
  });
  return system;
};
