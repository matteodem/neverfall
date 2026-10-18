import { Meteor } from "meteor/meteor";
import { isAnalyticsAdmin } from "../config/adminAnalytics";
import { TerrainPaint } from "../../imports/api/terrainPaint/terrainPaint";
import { MAX_STROKE_VERTICES, TERRAIN_PAINT_COLORS, paintKey, paintTile } from "../../imports/api/terrainPaint/config";
import { TERRAIN_PAINT_SOURCE, exportTerrainPaint, readTerrainPaint } from "../terrainPaintSource";

TerrainPaint.deny({ insert: () => true, update: () => true, remove: () => true });

Meteor.methods({
  "terrainPaint.list"() {
    // Public world appearance, loaded as a snapshot like world objects.
    return readTerrainPaint();
  },
  "terrainPaint.export"() {
    if (!isAnalyticsAdmin(this.userId)) throw new Meteor.Error("not-authorized");
    return exportTerrainPaint();
  },
  async "terrainPaint.save"(vertices) {
    if (!isAnalyticsAdmin(this.userId)) throw new Meteor.Error("not-authorized");
    if (TERRAIN_PAINT_SOURCE === "json")
      throw new Meteor.Error("terrain-paint-read-only", "Terrain Paint is read-only in JSON mode.");
    if (!Array.isArray(vertices) || !vertices.length || vertices.length > MAX_STROKE_VERTICES)
      throw new Meteor.Error("invalid-terrain-paint");
    const tiles = new Map();
    for (const vertex of vertices) {
      if (!Array.isArray(vertex) || vertex.length !== 3) throw new Meteor.Error("invalid-terrain-paint");
      const [x, z, color] = vertex;
      if (![x, z].every(Number.isInteger) || Math.abs(x) > 400000 || Math.abs(z) > 400000 ||
        (color !== null && (!Number.isInteger(color) || color < 0 || color >= TERRAIN_PAINT_COLORS.length)))
        throw new Meteor.Error("invalid-terrain-paint");
      const tile = paintTile(x, z);
      if (!tiles.has(tile)) tiles.set(tile, new Map());
      tiles.get(tile).set(paintKey(x, z), vertex);
    }
    const previous = [];
    // Patch touched keys only; other strokes/vertices in a tile are preserved.
    for (const [_id, entries] of tiles) {
      const document = await TerrainPaint.findOneAsync(_id);
      const set = {}, unset = {};
      for (const [key, [x, z, color]] of entries) {
        previous.push([x, z, document?.colors?.[key] ?? null]);
        // Null removes an override so the original procedural color returns.
        if (color === null) unset[`colors.${key}`] = "";
        else set[`colors.${key}`] = color;
      }
      const modifier = {};
      if (Object.keys(set).length) modifier.$set = set;
      if (Object.keys(unset).length) modifier.$unset = unset;
      await TerrainPaint.upsertAsync({ _id }, modifier);
    }
    return previous;
  },
});
