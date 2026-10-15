import { SOUTHERN_RIVER as RIVER, TERRAIN_VARIATION as TERRAIN } from "./terrainConfig";

const clamp = (value) => Math.max(0, Math.min(1, value));
const smooth = (value) => { const t = clamp(value); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

const hash = (x, z) => {
  let value = Math.imul(x, 374761393) ^ Math.imul(z, 668265263) ^ TERRAIN.seed;
  value = Math.imul(value ^ value >>> 13, 1274126177);
  return ((value ^ value >>> 16) >>> 0) / 4294967295;
};

const noise = (x, z) => {
  const ix = Math.floor(x), iz = Math.floor(z);
  return lerp(lerp(hash(ix, iz), hash(ix + 1, iz), smooth(x - ix)),
    lerp(hash(ix, iz + 1), hash(ix + 1, iz + 1), smooth(x - ix)), smooth(z - iz));
};

const terrainWeight = (x, z) => {
  const mountain = TERRAIN.protectedMountain;
  const mountainDistance = Math.hypot(Math.max(mountain.minX - x, 0, x - mountain.maxX),
    Math.max(mountain.minZ - z, 0, z - mountain.maxZ));
  let weight = smooth(mountainDistance / TERRAIN.protectionBlend);
  for (const area of TERRAIN.protectedAreas) {
    weight = Math.min(weight, smooth((Math.hypot(x - area.x, z - area.z) - area.radius) /
      TERRAIN.protectionBlend));
    if (!weight) return 0;
  }
  for (const route of TERRAIN.protectedRoutes) {
    const dx = route.to[0] - route.from[0], dz = route.to[1] - route.from[1];
    const t = clamp(((x - route.from[0]) * dx + (z - route.from[1]) * dz) / (dx * dx + dz * dz));
    const distance = Math.hypot(x - route.from[0] - dx * t, z - route.from[1] - dz * t);
    weight = Math.min(weight, smooth((distance - route.width) / TERRAIN.protectionBlend));
  }
  return weight;
};

export const getRiverCenterZ = (x) => {
  if (x < RIVER.path[0].x || x > RIVER.path[RIVER.path.length - 1].x) return null;
  for (let index = 1; index < RIVER.path.length; index++) {
    const from = RIVER.path[index - 1], to = RIVER.path[index];
    if (x <= to.x) return lerp(from.z, to.z, smooth((x - from.x) / (to.x - from.x)));
  }
  return null;
};

export const getRiverDistance = (x, z) => {
  const centerZ = getRiverCenterZ(x);
  return centerZ === null ? Infinity : Math.abs(z - centerZ);
};

export const isInRiver = ({ x, z }, clearance = 0) =>
  getRiverDistance(x, z) < RIVER.width / 2 + clearance;

export const getRiverBankMix = (x, z) => {
  const distance = getRiverDistance(x, z);
  if (distance >= RIVER.width / 2 + RIVER.bankWidth) return 0;
  return (1 - smooth((distance - RIVER.width / 2) / RIVER.bankWidth)) * terrainWeight(x, z);
};

export const applyTerrainDetail = (x, z, authoredHeight) => {
  const weight = terrainWeight(x, z);
  if (!weight) return authoredHeight;
  const nx = x / TERRAIN.noiseScale, nz = z / TERRAIN.noiseScale;
  // Positive, broad hills keep existing zero-height paths and lake shores dry.
  const variation = TERRAIN.amplitude * (noise(nx, nz) * 0.75 + noise(nx * 2, nz * 2) * 0.25);
  const height = authoredHeight + variation * weight;
  // River channel and banks temporarily disabled.
  /*
  const distance = getRiverDistance(x, z), halfWidth = RIVER.width / 2;
  const bankWidth = lerp(RIVER.bankWidth, RIVER.eastBankWidth,
    smooth((x - RIVER.eastBankBlend.start) /
      (RIVER.eastBankBlend.end - RIVER.eastBankBlend.start)));
  if (distance >= halfWidth + bankWidth) return height;
  const channel = distance <= halfWidth
    ? RIVER.waterLevel - RIVER.bedDepth * (1 - smooth(distance / halfWidth))
    : lerp(RIVER.waterLevel, height, smooth((distance - halfWidth) / bankWidth));
  // The existing high outer eastern cliff remains the world boundary.
  const riverWeight = weight * (1 - smooth((x - RIVER.eastFade.start) /
    (RIVER.eastFade.end - RIVER.eastFade.start)));
  return lerp(height, channel, riverWeight);
  */
  return height;
};
