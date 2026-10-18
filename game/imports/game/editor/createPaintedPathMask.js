import { Vector3, VertexBuffer } from "@babylonjs/core";
import { PAINT_PRECISION, paintKey } from "../../api/terrainPaint/config";

// Paths are translucent meshes above the terrain. Reveal Beige-painted ground
// beneath them instead of compositing a second, independently shaded dirt color.
export const createPaintedPathMask = ({ terrain, getCoverage }) => {
  const entries = new Map(), influences = new Map(), dirty = new Set();
  const positions = terrain.getVerticesData(VertexBuffer.PositionKind);
  const columns = terrain.subdivisionsX, rows = terrain.subdivisionsY, stride = columns + 1;
  const minX = positions[0], maxZ = positions[2], step = positions[3] - minX;
  const keyAt = (index) => paintKey(Math.round(positions[index * 3] * PAINT_PRECISION),
    Math.round(positions[index * 3 + 2] * PAINT_PRECISION));
  const update = (vertex) => {
    const coverage = vertex.samples.reduce((sum, [key, weight]) => sum + getCoverage(key) * weight, 0);
    const alpha = coverage > 1 - 1e-6 ? 0 : vertex.alpha * (1 - coverage);
    if (vertex.entry.colors[vertex.offset] === Math.fround(alpha)) return;
    vertex.entry.colors[vertex.offset] = alpha;
    dirty.add(vertex.entry);
  };
  return {
    register(mesh) {
      if (!mesh.name.startsWith("environment-paths-") || mesh.isDisposed() || entries.has(mesh)) return;
      const points = mesh.getVerticesData(VertexBuffer.PositionKind);
      const colors = mesh.getVerticesData(VertexBuffer.ColorKind);
      if (!points || !colors) return;
      const entry = { mesh, colors: new Float32Array(colors), vertices: [] };
      entries.set(mesh, entry);
      mesh.setVerticesData(VertexBuffer.ColorKind, entry.colors, true);
      const matrix = mesh.computeWorldMatrix(true);
      for (let index = 0; index < points.length / 3; index++) {
        const point = Vector3.TransformCoordinates(Vector3.FromArray(points, index * 3), matrix);
        const gx = (point.x - minX) / step, gz = (maxZ - point.z) / step;
        if (gx < 0 || gx > columns || gz < 0 || gz > rows) continue;
        const col = Math.min(columns - 1, Math.floor(gx)), row = Math.min(rows - 1, Math.floor(gz));
        const u = gx - col, v = gz - row, a = row * stride + col, d = a + stride + 1;
        // Match Babylon's actual coarse-ground triangle and interpolation.
        const samples = (u >= v ? [[a, 1 - u], [a + 1, u - v], [d, v]]
          : [[a, 1 - v], [a + stride, v - u], [d, u]])
          .filter(([, weight]) => weight > 0).map(([source, weight]) => [keyAt(source), weight]);
        const offset = index * 4 + 3;
        const vertex = { entry, offset, alpha: colors[offset], samples };
        entry.vertices.push(vertex);
        for (const [key] of samples) {
          if (!influences.has(key)) influences.set(key, new Set());
          influences.get(key).add(vertex);
        }
        update(vertex);
      }
      mesh.onDisposeObservable.addOnce(() => {
        entries.delete(mesh); dirty.delete(entry);
        for (const vertex of entry.vertices) for (const [key] of vertex.samples) {
          const linked = influences.get(key);
          linked?.delete(vertex);
          if (!linked?.size) influences.delete(key);
        }
      });
    },
    update(key) {
      for (const vertex of influences.get(key) || []) update(vertex);
    },
    restore() {
      for (const entry of entries.values()) for (const vertex of entry.vertices) update(vertex);
    },
    flush() {
      for (const entry of dirty) if (!entry.mesh.isDisposed()) {
        entry.mesh.updateVerticesData(VertexBuffer.ColorKind, entry.colors);
      }
      dirty.clear();
    },
    dispose() { entries.clear(); influences.clear(); dirty.clear(); },
  };
};
