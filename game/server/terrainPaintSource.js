import { Meteor } from "meteor/meteor";
import { TerrainPaint } from "../imports/api/terrainPaint/terrainPaint";
import { PAINT_PRECISION, PAINT_TILE_SIZE, paintKey, paintTile } from "../imports/api/terrainPaint/config";
import { isTerrainPaintValue } from "../imports/api/terrainPaint/paintValue";

// Select exactly one source. Never expose environment variables to clients.
export const TERRAIN_PAINT_SOURCE = process.env.TERRAIN_PAINT_SOURCE ??
  (Meteor.isDevelopment ? "mongodb" : "json");
if (!["mongodb", "json"].includes(TERRAIN_PAINT_SOURCE))
  throw new Error("TERRAIN_PAINT_SOURCE must be 'mongodb' or 'json'.");

const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const snapshot = (tiles) => ({
  version: tiles.some((tile) => Object.values(tile.colors).some(Array.isArray)) ? 2 : 1,
  precision: PAINT_PRECISION, tileSize: PAINT_TILE_SIZE, tiles,
});
const invalid = () => { throw new Error("Invalid terrain-paint snapshot."); };
const canonicalTiles = (tiles) => {
  if (!Array.isArray(tiles)) invalid();
  const ids = new Set();
  return tiles.map((tile) => {
    if (!tile || typeof tile._id !== "string" || ids.has(tile._id) ||
      !tile.colors || typeof tile.colors !== "object" || Array.isArray(tile.colors)) invalid();
    ids.add(tile._id);
    const colors = {};
    for (const key of Object.keys(tile.colors).sort(compare)) {
      const [x, z] = key.split(":").map(Number);
      const color = tile.colors[key];
      if (![x, z].every(Number.isInteger) || Math.abs(x) > 400000 || Math.abs(z) > 400000 ||
        key !== paintKey(x, z) || tile._id !== paintTile(x, z) || !isTerrainPaintValue(color)) invalid();
      colors[key] = Array.isArray(color) ? color.slice(0, 4) : color;
    }
    return { _id: tile._id, colors };
  }).filter((tile) => Object.keys(tile.colors).length).sort((a, b) => compare(a._id, b._id));
};

// Imports must fail closed: a missing/malformed asset must never clear MongoDB.
export const readJsonTerrainPaint = async () => {
  try {
    const text = await Assets.getTextAsync("world/terrain-paint.json");
    const data = JSON.parse(text);
    if (!data || ![1, 2, 3].includes(data.version) || data.precision !== PAINT_PRECISION || data.tileSize !== PAINT_TILE_SIZE) invalid();
    return canonicalTiles(data.tiles);
  } catch {
    throw new Meteor.Error("invalid-terrain-paint-json", "Could not load or validate game/private/world/terrain-paint.json. Expected a valid terrain-paint snapshot.");
  }
};

let jsonTiles = null;
export const invalidateTerrainPaintJsonCache = () => { jsonTiles = null; };
const readJsonTiles = () => jsonTiles ||= readJsonTerrainPaint().catch((error) => {
  jsonTiles = null;
  throw error;
});

export const readMongoTerrainPaint = async () => canonicalTiles(await TerrainPaint.find({}, {
  fields: { colors: 1 },
}).fetchAsync());

export const readTerrainPaint = async () => ({
  source: TERRAIN_PAINT_SOURCE,
  readOnly: TERRAIN_PAINT_SOURCE === "json",
  tiles: await (TERRAIN_PAINT_SOURCE === "json" ? readJsonTiles() : readMongoTerrainPaint()),
});

// Like World Objects, export the MongoDB authoring draft, even in JSON mode.
export const exportTerrainPaint = async () => `${JSON.stringify(snapshot(await readMongoTerrainPaint()), null, 2)}\n`;
