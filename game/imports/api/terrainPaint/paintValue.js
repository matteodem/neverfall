import { TERRAIN_PAINT_COLORS } from "./config";

// Existing palette IDs remain valid. Soft strokes store resolved vertex-space
// [red, green, blue, pathCoverage], retaining blends across reloads and history.
// Accept legacy sharpened strokes; rendering uses only their first four values.
const isHardTerrainPaintValue = (value) => Array.isArray(value) && value.length === 10;
const rgb = (channels) => channels.every((channel) => channel >= 0 && channel <= 4);
const unit = (value) => value >= 0 && value <= 1;
export const isTerrainPaintValue = (value) => Number.isInteger(value)
  ? value >= 0 && value < TERRAIN_PAINT_COLORS.length
  : Array.isArray(value) && [4, 10].includes(value.length) && value.every(Number.isFinite) &&
    rgb(value.slice(0, 3)) && unit(value[3]) && (!isHardTerrainPaintValue(value) ||
      (rgb(value.slice(4, 7)) && unit(value[7]) && value[8] >= 0 && value[8] <= 100 &&
        Number.isInteger(value[9]) && value[9] >= 0 && value[9] < TERRAIN_PAINT_COLORS.length));

export const getPaintPathCoverage = (value) => Array.isArray(value) ? value[3]
  : TERRAIN_PAINT_COLORS[value]?.coversPaths ? 1 : 0;
