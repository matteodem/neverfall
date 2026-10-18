import { randomUUID } from "node:crypto";
import { Meteor } from "meteor/meteor";
import { isAnalyticsAdmin } from "../config/adminAnalytics";
import { WorldObjects } from "../../imports/api/worldObjects/worldObjects";
import { TerrainPaint } from "../../imports/api/terrainPaint/terrainPaint";
import { WORLD_OBJECTS_SOURCE, readJsonWorldObjects } from "../worldObjectsSource";
import { TERRAIN_PAINT_SOURCE, invalidateTerrainPaintJsonCache, readJsonTerrainPaint } from "../terrainPaintSource";

const requireDevelopmentAdmin = (userId) => {
  if (!isAnalyticsAdmin(userId)) throw new Meteor.Error("not-authorized");
  if (!Meteor.isDevelopment) throw new Meteor.Error("development-only", "JSON sync is only available in development.");
};

const replaceCollection = async (collection, documents) => {
  const database = collection.rawDatabase();
  const target = collection.rawCollection().collectionName;
  const temporary = `${target}_json_sync_${randomUUID().replaceAll("-", "")}`;
  try {
    const staging = await database.createCollection(temporary);
    if (documents.length) await staging.insertMany(documents);
    // Same-database rename with dropTarget replaces the dataset atomically,
    // including an empty import. Never delete the live data before inserting.
    await staging.rename(target, { dropTarget: true });
  } catch (error) {
    console.error(`[WorldEditor] Could not sync ${target} from JSON`, error);
    throw new Meteor.Error("json-sync-failed", "Could not replace the MongoDB collection from JSON.");
  } finally {
    try { await database.collection(temporary).drop(); }
    catch (error) {
      if (error.code !== 26) console.warn("[WorldEditor] Could not remove JSON sync staging collection", error);
    }
  }
};

Meteor.methods({
  async "worldObjects.syncFromJson"() {
    requireDevelopmentAdmin(this.userId);
    const objects = readJsonWorldObjects();
    await replaceCollection(WorldObjects, objects);
    return { source: WORLD_OBJECTS_SOURCE, readOnly: WORLD_OBJECTS_SOURCE === "json", objects };
  },
  async "terrainPaint.syncFromJson"() {
    requireDevelopmentAdmin(this.userId);
    let tiles;
    try { tiles = await readJsonTerrainPaint(); }
    catch {
      throw new Meteor.Error("invalid-terrain-paint-json", "Could not validate game/private/terrain-paint.json. MongoDB was not changed.");
    }
    await replaceCollection(TerrainPaint, tiles);
    invalidateTerrainPaintJsonCache();
    return { source: TERRAIN_PAINT_SOURCE, readOnly: TERRAIN_PAINT_SOURCE === "json", tiles };
  },
});
