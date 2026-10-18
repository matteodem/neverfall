// import { getCentralCampClearing, getCentralCampMix } from "./centralCampPolishConfig";
import { getCentralCampMix } from "./centralCampPolishConfig";
import { Color3 } from "@babylonjs/core";
import { getHighlandMix } from "../worldConfig";
import { WORLD_PALETTE } from "./worldPalette";

const [forest, highlands, olive, earth] = ["forest", "highlands", "olive", "earth"]
  .map((key) => Color3.FromHexString(WORLD_PALETTE.terrain[key]).asArray());

const smooth = (value) => value * value * (3 - 2 * value);

const hash = (x, z) => {
  let value = Math.imul(x, 374761393) + Math.imul(z, 668265263);
  value = Math.imul(value ^ value >>> 13, 1274126177);
  return ((value ^ value >>> 16) >>> 0) / 4294967295;
};

const noise = (x, z, size) => {
  const gridX = x / size;
  const gridZ = z / size;
  const cellX = Math.floor(gridX);
  const cellZ = Math.floor(gridZ);
  const blendX = smooth(gridX - cellX);
  const blendZ = smooth(gridZ - cellZ);
  const near = hash(cellX, cellZ) * (1 - blendX) + hash(cellX + 1, cellZ) * blendX;
  const far = hash(cellX, cellZ + 1) * (1 - blendX) + hash(cellX + 1, cellZ + 1) * blendX;
  return near * (1 - blendZ) + far * blendZ;
};

export const getTerrainColorVariation = (x, z) => {
  const camp = getCentralCampMix(x, z);
  // const clearing = getCentralCampClearing(x, z);
  return {
    shade: (noise(x, z, 32) - 0.5) * 0.12 + (noise(x + 87, z - 53, 74) - 0.5) * 0.04 -
      // camp * (0.045 + noise(x + 17, z - 9, 12) * 0.06) * (1 - clearing.dirt),
      camp * (0.045 + noise(x + 17, z - 9, 12) * 0.06),
    olive: Math.max(0, noise(x + 131, z - 79, 45) - 0.54) * 0.3,
    brown: Math.max(0, noise(x - 193, z + 117, 38) - 0.6) * 0.2,
  };
};

// The exact grass RGB written by world generation, before snow/stone overrides.
// Keep paint in the same vertex-color space; no additional gamma conversion.
export const getTerrainGrassColor = (x, z, variation = getTerrainColorVariation(x, z)) => {
  const mix = getHighlandMix(z);
  const baseWeight = 1 - variation.olive - variation.brown;
  const shade = 1 + variation.shade;
  return forest.map((value, channel) => (value + (highlands[channel] - value) * mix) *
    shade * baseWeight + olive[channel] * variation.olive + earth[channel] * variation.brown);
};
