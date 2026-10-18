import { Meteor } from "meteor/meteor";
import { TerrainPaint } from "../imports/api/terrainPaint/terrainPaint";
import { PAINT_PRECISION, PAINT_TILE_SIZE, TERRAIN_PAINT_COLORS, paintKey, paintTile } from "../imports/api/terrainPaint/config";

// Select exactly one source. Never expose environment variables to clients.
export const TERRAIN_PAINT_SOURCE = process.env.TERRAIN_PAINT_SOURCE ??
  (Meteor.isDevelopment ? "mongodb" : "json");
if (!["mongodb", "json"].includes(TERRAIN_PAINT_SOURCE))
  throw new Error("TERRAIN_PAINT_SOURCE must be 'mongodb' or 'json'.");

const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const snapshot = (tiles) => ({ version: 1, precision: PAINT_PRECISION, tileSize: PAINT_TILE_SIZE, tiles });
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
        key !== paintKey(x, z) || tile._id !== paintTile(x, z) || !Number.isInteger(color) ||
        color < 0 || color >= TERRAIN_PAINT_COLORS.length) invalid();
      colors[key] = color;
    }
    return { _id: tile._id, colors };
  }).filter((tile) => Object.keys(tile.colors).length).sort((a, b) => compare(a._id, b._id));
};

let jsonTiles = null;
const readJsonTiles = () => {
  if (!jsonTiles) jsonTiles = (async () => {
    try {
      // Assets are copied into the server bundle, including Render deployments.
      const text = await Assets.getTextAsync("terrain-paint.json");
      if (!text.trim()) return [];
      const data = JSON.parse(text);
      if (data.version !== 1 || data.precision !== PAINT_PRECISION || data.tileSize !== PAINT_TILE_SIZE) invalid();
      return canonicalTiles(data.tiles);
    } catch (error) {
      console.warn("[TerrainPaint] Could not load game/private/terrain-paint.json; using unpainted terrain.", error.message);
      return [];
    }
  })();
  return jsonTiles;
};

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
