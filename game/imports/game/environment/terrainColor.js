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

export const getTerrainColorVariation = (x, z) => ({
  shade: (noise(x, z, 32) - 0.5) * 0.12 + (noise(x + 87, z - 53, 74) - 0.5) * 0.04,
  olive: Math.max(0, noise(x + 131, z - 79, 45) - 0.54) * 0.3,
  brown: Math.max(0, noise(x - 193, z + 117, 38) - 0.6) * 0.2,
});
