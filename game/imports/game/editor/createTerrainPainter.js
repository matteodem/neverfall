import { Meteor } from "meteor/meteor";
import { Color3, Vector3, VertexBuffer } from "@babylonjs/core";
import { MAX_STROKE_VERTICES, PAINT_PRECISION, TERRAIN_PAINT_COLORS, paintKey } from "../../api/terrainPaint/config";

const BUCKET_SIZE = 16;
const palette = TERRAIN_PAINT_COLORS.map(({ hex }) => Color3.FromHexString(hex).asArray());

export const createTerrainPainter = ({ scene, terrain }) => {
  const meshes = new Map(), buckets = new Map(), queued = new Set();
  let saved = new Map(), loading = null, disposed = false;
  const isTerrain = (mesh) => mesh === terrain || mesh.name === terrain.name || mesh.name === "starter-river-banks";
  const setColor = (vertex, color) => {
    const { entry, index } = vertex;
    const rgb = color === undefined ? entry.original.subarray(index * 4, index * 4 + 3) : palette[color];
    entry.colors.set(rgb, index * 4);
  };
  const upload = (entry) => {
    if (!entry.mesh.isDisposed()) entry.mesh.updateVerticesData(VertexBuffer.ColorKind, entry.colors);
  };
  const register = (mesh) => {
    if (mesh.isDisposed() || meshes.has(mesh) || !isTerrain(mesh)) return;
    const positions = mesh.getVerticesData(VertexBuffer.PositionKind);
    const colors = mesh.getVerticesData(VertexBuffer.ColorKind);
    if (!positions || !colors) return;
    const entry = { mesh, original: new Float32Array(colors), colors: new Float32Array(colors), vertices: [] };
    meshes.set(mesh, entry);
    // Make only the color buffer dynamic; leave positions, normals and indices alone.
    mesh.setVerticesData(VertexBuffer.ColorKind, entry.colors, true);
    const matrix = mesh.computeWorldMatrix(true);
    const used = new Set(mesh.getIndices());
    for (const index of used) {
      const point = Vector3.TransformCoordinates(Vector3.FromArray(positions, index * 3), matrix);
      const x = Math.round(point.x * PAINT_PRECISION), z = Math.round(point.z * PAINT_PRECISION);
      const vertex = { entry, index, x, z, key: paintKey(x, z) };
      const bucket = paintKey(Math.floor(point.x / BUCKET_SIZE), Math.floor(point.z / BUCKET_SIZE));
      if (!buckets.has(bucket)) buckets.set(bucket, new Set());
      buckets.get(bucket).add(vertex);
      vertex.bucket = bucket;
      entry.vertices.push(vertex);
      if (saved.has(vertex.key)) setColor(vertex, saved.get(vertex.key));
    }
    upload(entry);
    mesh.onDisposeObservable.addOnce(() => {
      meshes.delete(mesh);
      for (const vertex of entry.vertices) {
        const bucket = buckets.get(vertex.bucket);
        bucket?.delete(vertex);
        if (!bucket?.size) buckets.delete(vertex.bucket);
      }
    });
  };
  for (const mesh of scene.meshes) register(mesh);
  // New meshes are announced before procedural geometry is populated.
  const added = scene.onNewMeshAddedObservable.add((mesh) => queued.add(mesh));
  const frame = scene.onBeforeRenderObservable.add(() => {
    for (const mesh of queued) register(mesh);
    queued.clear();
  });
  const restore = () => {
    for (const entry of meshes.values()) {
      entry.colors.set(entry.original);
      for (const vertex of entry.vertices) if (saved.has(vertex.key)) setColor(vertex, saved.get(vertex.key));
      upload(entry);
    }
  };
  const load = () => {
    if (!loading) loading = Meteor.callAsync("terrainPaint.list").then((tiles) => {
      if (disposed) return;
      saved = new Map(tiles.flatMap(({ colors }) => Object.entries(colors || {})));
      restore();
    }).finally(() => { loading = null; });
    return loading;
  };
  return {
    load,
    isTerrain: (mesh) => meshes.has(mesh) && mesh.isEnabled() && mesh.isVisible,
    paint(point, radius, color, stroke, dirty) {
      for (let bx = Math.floor((point.x - radius) / BUCKET_SIZE); bx <= Math.floor((point.x + radius) / BUCKET_SIZE); bx++) {
        for (let bz = Math.floor((point.z - radius) / BUCKET_SIZE); bz <= Math.floor((point.z + radius) / BUCKET_SIZE); bz++) {
          for (const vertex of buckets.get(paintKey(bx, bz)) || []) {
            if (!vertex.entry.mesh.isEnabled() || Math.hypot(vertex.x / PAINT_PRECISION - point.x,
              vertex.z / PAINT_PRECISION - point.z) > radius) continue;
            if (!stroke.has(vertex.key) && stroke.size >= MAX_STROKE_VERTICES) continue;
            stroke.set(vertex.key, [vertex.x, vertex.z, color]);
            setColor(vertex, color);
            dirty.add(vertex.entry);
          }
        }
      }
    },
    upload: (dirty) => { for (const entry of dirty) upload(entry); },
    async save(stroke) {
      if (!stroke.size) return;
      try {
        await Meteor.callAsync("terrainPaint.save", [...stroke.values()]);
        for (const [key, vertex] of stroke) saved.set(key, vertex[2]);
      } catch (error) {
        // A multi-tile save can partially succeed; reload its authoritative state.
        if (!disposed) {
          restore();
          try { await load(); } catch { /* Keep the previous confirmed snapshot. */ }
        }
        throw error;
      }
    },
    dispose() {
      disposed = true;
      scene.onNewMeshAddedObservable.remove(added);
      scene.onBeforeRenderObservable.remove(frame);
      meshes.clear(); buckets.clear(); queued.clear();
    },
  };
};
