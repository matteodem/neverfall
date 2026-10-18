// Interpolate full intensity and smooth radial falloff without changing radius.
export const terrainBrushIntensity = (distanceRatio, gradient) => {
  if (distanceRatio > 1) return 0;
  const t = Math.max(0, distanceRatio);
  return 1 - gradient / 100 * t * t * (3 - 2 * t);
};
