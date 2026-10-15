// Authored world coordinates in meters, west to east. Ends reach the terrain
// boundary, beyond the playable walls (-320 west / 295 east).
const path = [
  { x: -330, z: -12, width: 4.2 },
  { x: -275, z: -8, width: 4.6 },
  { x: -220, z: -24, width: 4.1 },
  { x: -155, z: -20, width: 4.8 },
  { x: -90, z: -34, width: 4.3 },
  { x: -35, z: -24, width: 4.2 },
  { x: 0, z: -23, width: 4.4 },
  { x: 45, z: -60, width: 4.1 },
  { x: 85, z: -150, width: 4.7 },
  { x: 115, z: -240, width: 3.8 },
  // Low, narrow corridor between the giant event (south edge -265) and
  // mountain puzzle (north edge -272). Banks stay outside both footprints.
  { x: 145, z: -268.5, width: 3.4 },
  { x: 180, z: -268.5, width: 3.4 },
  { x: 230, z: -268.5, width: 3.4 },
  { x: 270, z: -268.5, width: 3.4 },
  { x: 305, z: -245, width: 4.2 },
  { x: 330, z: -240, width: 4.3 },
];

// Keep the existing curve/grid math in river coordinates: +Z runs downstream,
// +X points across the channel. This is a rotation, so triangle winding stays intact.
export const riverToWorld = (x, z) => ({ x: z, z: -x });
export const worldToRiver = (x, z) => ({ x: -z, z: x });

export const STARTER_RIVER = {
  path: path.map((point) => ({ ...worldToRiver(point.x, point.z), width: point.width })),
  waterLevel: -0.08,
  bedDepth: 0.28,
  bankWidth: 1.4,
  endFade: 0, // Continuous through the playable boundary; no inland caps.
  sampleSpacing: 0.5,
  groundSpacing: 0.5,
  reflectionSize: 256,
  lowReflectionSize: 128,
};
