import { Meteor } from "meteor/meteor";
import { Color3, Vector3, VertexBuffer } from "@babylonjs/core";
import { MAX_STROKE_VERTICES, PAINT_PRECISION, TERRAIN_PAINT_COLORS, paintKey } from "../../api/terrainPaint/config";
import { createPaintedPathMask } from "./createPaintedPathMask";
import { getTerrainVegetation, isGreenTerrainColor } from "../environment/terrainVegetation";
import { getTerrainGrassColor } from "../environment/terrainColor";
import { getPaintPathCoverage } from "../../api/terrainPaint/paintValue";
import { terrainBrushIntensity } from "./terrainBrushFalloff";

const BUCKET_SIZE = 16;
const palette = TERRAIN_PAINT_COLORS.map(({ hex, rgb }) => rgb || Color3.FromHexString(hex).asArray());

export const createTerrainPainter = ({ scene, terrain }) => {
  const meshes = new Map(), buckets = new Map(), queued = new Set();
  const vegetation = getTerrainVegetation(scene);
  let saved = new Map(), loading = null, disposed = false, lastStroke = null, redoStroke = null;
  let source = null, readOnly = true;
  let visible = new Map();
  const paths = createPaintedPathMask({ terrain,
    getCoverage: (key) => getPaintPathCoverage(visible.get(key)) });
  const isTerrain = (mesh) => mesh === terrain || mesh.name === terrain.name || mesh.name === "starter-river-banks";
  const grassColor = (vertex) => {
    if (!vertex.grassColor) {
      const original = vertex.entry.original.subarray(vertex.index * 4, vertex.index * 4 + 3);
      vertex.grassColor = isGreenTerrainColor(original) ? original : getTerrainGrassColor(vertex.worldX, vertex.worldZ);
    }
    return vertex.grassColor;
  };
  const setColor = (vertex, color) => {
    const { entry, index } = vertex;
    let rgb = color === undefined ? entry.original.subarray(index * 4, index * 4 + 3)
      : Array.isArray(color) ? color.slice(0, 3) : palette[color];
    if (TERRAIN_PAINT_COLORS[color]?.proceduralGrass) rgb = grassColor(vertex);
    entry.colors.set(rgb, index * 4);
    if (color === undefined) visible.delete(vertex.key);
    else visible.set(vertex.key, color);
    paths.update(vertex.key);
    vegetation?.changed(vertex.key);
  };
  const upload = (entry) => {
    if (entry.mesh.isDisposed()) return;
    entry.mesh.updateVerticesData(VertexBuffer.ColorKind, entry.colors);
  };
  const register = (mesh) => {
    paths.register(mesh);
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
      const vertex = { entry, index, x, z, worldX: point.x, worldZ: point.z, key: paintKey(x, z) };
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
  const flush = () => {
    for (const mesh of queued) register(mesh);
    queued.clear();
    paths.flush();
  };
  const frame = scene.onBeforeRenderObservable.add(flush);
  const restore = () => {
    visible = new Map(saved);
    for (const entry of meshes.values()) {
      entry.colors.set(entry.original);
      for (const vertex of entry.vertices) if (saved.has(vertex.key)) setColor(vertex, saved.get(vertex.key));
      upload(entry);
    }
    paths.restore();
    paths.flush();
    vegetation?.restore();
  };
  const applySnapshot = (snapshot, { preserveHistory = false } = {}) => {
    if (disposed) return;
    source = snapshot.source;
    readOnly = snapshot.readOnly;
    saved = new Map(snapshot.tiles.flatMap(({ colors }) => Object.entries(colors || {})));
    if (!preserveHistory) {
      lastStroke = null;
      redoStroke = null;
    }
    // Include geometry created while the snapshot was loading, even before
    // the first render pass. Loading resolves after its buffers are updated.
    flush();
    restore();
  };
  const load = () => {
    if (!loading) loading = Meteor.callAsync("terrainPaint.list").then((snapshot) => applySnapshot(snapshot))
      .finally(() => { loading = null; });
    return loading;
  };
  const persist = async (vertices) => {
    if (readOnly) throw new Meteor.Error("terrain-paint-read-only");
    try {
      const previous = await Meteor.callAsync("terrainPaint.save", vertices);
      for (const [x, z, color] of vertices) {
        const key = paintKey(x, z);
        if (color === null) saved.delete(key);
        else saved.set(key, color);
      }
      return previous;
    } catch (error) {
      // A multi-tile save can partially succeed; reload its authoritative state.
      lastStroke = null;
      redoStroke = null;
      if (!disposed) {
        restore();
        try { await load(); } catch { /* Keep the previous confirmed snapshot. */ }
      }
      throw error;
    }
  };
  return {
    load,
    applySnapshot,
    isReadOnly: () => readOnly,
    getState: () => ({ paintSource: source, paintReadOnly: readOnly,
      canUndoPaint: !readOnly && !!lastStroke, canRedoPaint: !readOnly && !!redoStroke }),
    isTerrain: (mesh) => meshes.has(mesh) && mesh.isEnabled() && mesh.isVisible,
    paint(point, radius, color, stroke, dirty, gradient = 100) {
      stroke.before ||= new Map();
      stroke.strengths ||= new Map();
      for (let bx = Math.floor((point.x - radius) / BUCKET_SIZE); bx <= Math.floor((point.x + radius) / BUCKET_SIZE); bx++) {
        for (let bz = Math.floor((point.z - radius) / BUCKET_SIZE); bz <= Math.floor((point.z + radius) / BUCKET_SIZE); bz++) {
          for (const vertex of buckets.get(paintKey(bx, bz)) || []) {
            if (!vertex.entry.mesh.isEnabled()) continue;
            const strength = terrainBrushIntensity(Math.hypot(vertex.worldX - point.x, vertex.worldZ - point.z) / radius, gradient);
            if (strength <= 0) continue;
            if (!stroke.has(vertex.key) && stroke.size >= MAX_STROKE_VERTICES) continue;
            if (!stroke.before.has(vertex.key)) stroke.before.set(vertex.key, {
              rgb: Array.from(vertex.entry.colors.subarray(vertex.index * 4, vertex.index * 4 + 3)),
              coverage: getPaintPathCoverage(visible.get(vertex.key)),
            });
            // Use the strongest stamp per stroke, so event frequency and overlapping
            // drag samples cannot repeatedly darken the soft edge.
            if (strength > (stroke.strengths.get(vertex.key) || 0)) {
              let value = color;
              if (strength < 1) {
                const before = stroke.before.get(vertex.key);
                setColor(vertex, color);
                const target = vertex.entry.colors.subarray(vertex.index * 4, vertex.index * 4 + 3);
                value = before.rgb.map((channel, index) => Math.fround(channel + (target[index] - channel) * strength));
                value.push(before.coverage + (getPaintPathCoverage(color) - before.coverage) * strength);
              }
              stroke.set(vertex.key, [vertex.x, vertex.z, value]);
              stroke.strengths.set(vertex.key, strength);
            }
            setColor(vertex, stroke.get(vertex.key)[2]);
            dirty.add(vertex.entry);
          }
        }
      }
    },
    upload: (dirty) => {
      for (const entry of dirty) upload(entry);
      paths.flush();
      vegetation?.flush();
    },
    async save(stroke) {
      if (!stroke.size) return;
      lastStroke = await persist([...stroke.values()]);
      redoStroke = null;
    },
    canUndo: () => !!lastStroke,
    async undo() {
      if (!lastStroke) return;
      redoStroke = await persist(lastStroke);
      lastStroke = null;
      if (!disposed) restore();
    },
    canRedo: () => !!redoStroke,
    async redo() {
      if (!redoStroke) return;
      lastStroke = await persist(redoStroke);
      redoStroke = null;
      if (!disposed) restore();
    },
    dispose() {
      disposed = true;
      lastStroke = null;
      redoStroke = null;
      scene.onNewMeshAddedObservable.remove(added);
      scene.onBeforeRenderObservable.remove(frame);
      meshes.clear(); buckets.clear(); queued.clear();
      paths.dispose();
    },
  };
};
