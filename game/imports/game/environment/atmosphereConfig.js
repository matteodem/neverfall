export const WORLD_ATMOSPHERE = {
  sky: {
    zenith: "#69A9EA", horizon: "#C6DEF0",
    horizonBand: 0.1,
    diameter: 2400, textureHeight: 64,
  },
  fog: { color: "#C6DEF0", start: 120, end: 280 },
  dungeonFog: { start: 80, end: 220 },
  mountains: {
    // These optional cylinder bands create diagonal overlays across the sky.
    enabled: false,
    baseY: -100,
    baseFadeHeight: 60,
    layers: [
      { radius: 980, segments: 96, height: 220, color: "#BDD5E8", offset: 0.13 },
      { radius: 780, segments: 80, height: 175, color: "#A9C6DF", offset: 0 },
    ],
  },
};
