import { Meteor } from "meteor/meteor";
import { isAnalyticsAdmin } from "../config/adminAnalytics";
import { TerrainPaint } from "../../imports/api/terrainPaint/terrainPaint";
import { MAX_STROKE_VERTICES, TERRAIN_PAINT_COLORS, paintKey, paintTile } from "../../imports/api/terrainPaint/config";

TerrainPaint.deny({ insert: () => true, update: () => true, remove: () => true });

Meteor.methods({
  "terrainPaint.list"() {
    // Public world appearance, loaded as a snapshot like world objects.
    return TerrainPaint.find({}, { fields: { colors: 1 } }).fetchAsync();
  },
  async "terrainPaint.save"(vertices) {
    if (!isAnalyticsAdmin(this.userId)) throw new Meteor.Error("not-authorized");
    if (!Array.isArray(vertices) || !vertices.length || vertices.length > MAX_STROKE_VERTICES)
      throw new Meteor.Error("invalid-terrain-paint");
    const tiles = new Map();
    for (const vertex of vertices) {
      if (!Array.isArray(vertex) || vertex.length !== 3) throw new Meteor.Error("invalid-terrain-paint");
      const [x, z, color] = vertex;
      if (![x, z, color].every(Number.isInteger) || Math.abs(x) > 400000 || Math.abs(z) > 400000 ||
        color < 0 || color >= TERRAIN_PAINT_COLORS.length) throw new Meteor.Error("invalid-terrain-paint");
      const tile = paintTile(x, z);
      if (!tiles.has(tile)) tiles.set(tile, {});
      tiles.get(tile)[`colors.${paintKey(x, z)}`] = color;
    }
    // Patch touched keys only; other strokes/vertices in a tile are preserved.
    for (const [_id, colors] of tiles) await TerrainPaint.upsertAsync({ _id }, { $set: colors });
    return true;
  },
});
