// Plain shared data: used by both Babylon terrain and the realtime server.
export const TERRAIN_VARIATION = {
  amplitude: 1.4,
  noiseScale: 58,
  seed: 104,
  protectionBlend: 14,
  // Preserve authored heights at fixed actors, camps, landmarks and treasure anchors.
  protectedAreas: [
    { x: 0, z: 0, radius: 35 }, { x: 0, z: 200, radius: 44 },
    { x: 0, z: -90, radius: 22 }, { x: 80, z: 180, radius: 24 },
    { x: -160, z: -220, radius: 24 }, { x: -160, z: -160, radius: 80 },
    { x: 60, z: -230, radius: 26 }, { x: 70, z: 72, radius: 26 },
    { x: -240, z: -65, radius: 26 }, { x: 250, z: -82, radius: 26 },
    { x: 185, z: 0, radius: 22 }, { x: 262, z: 0, radius: 30 },
    { x: -68, z: 70, radius: 30 }, { x: -160, z: 198, radius: 36 },
    { x: 160, z: 238, radius: 36 }, { x: 105, z: 180, radius: 26 },
    { x: 235, z: -110, radius: 12 }, { x: 275, z: -70, radius: 32 },
    { x: -225, z: -210, radius: 26 },
    { x: 200, z: -200, radius: 12 },
    { x: -232, z: 222, radius: 16 }, { x: 40, z: 245, radius: 20 },
    { x: 228, z: 170, radius: 16 },
    ...[
      [-112, 68], [-270, -35], [86, 28], [28, -250], [-276, 274],
      [118, 293], [112, 125], [172, 89], [194, -95], [282, 92],
      [-180, -103], [-106, -130], [-120, -237],
    ].map(([x, z]) => ({ x, z, radius: 10 })),
  ],
  protectedRoutes: [
    { from: [0, 0], to: [0, -90], width: 8 },
    { from: [0, 0], to: [70, 72], width: 8 },
    { from: [0, 0], to: [0, 200], width: 8 },
    { from: [0, 200], to: [80, 180], width: 8 },
    { from: [-160, -160], to: [-160, -220], width: 8 },
    { from: [140, 0], to: [262, 0], width: 8 },
  ],
  // Preserve the authored climbing puzzle, including its approach and summit.
  protectedMountain: { minX: 152, maxX: 268, minZ: -320, maxZ: -264 },
};

export const SOUTHERN_RIVER = {
  width: 30,
  waterLevel: -0.12,
  bedDepth: 0.75,
  bankWidth: 24,
  eastBankWidth: 56,
  eastBankBlend: { start: 190, end: 255 },
  sampleSpacing: 4,
  eastFade: { start: 290, end: 300 },
  // West to east, avoiding the lake, tower, dungeon entrances and mountain summit.
  path: [
    { x: -330, z: -265 }, { x: -240, z: -275 }, { x: -140, z: -285 },
    { x: -40, z: -290 }, { x: 40, z: -290 }, { x: 100, z: -285 },
    { x: 180, z: -155 }, { x: 200, z: -145 }, { x: 230, z: -176 },
    { x: 260, z: -200 }, { x: 330, z: -220 },
  ],
};
