// World-space route control points and cluster anchors. All decoration is visual only.
export const ENVIRONMENT_PATHS = {
  width: 3.2,
  edgeNoise: 0.42, // Maximum sideways edge variation in meters.
  edgeNoiseScale: 5.5, // Broad, smooth edge variation in meters.
  grassIntrusion: 0.28, // Small grass bites revealed by indenting the dirt outline.
  grassIntrusionSpacing: 2.8, // Noise scale; bites occur intermittently, not every sample.
  stoneSpacing: 28,
  stoneScaleMin: 0.55, // Readable shoulder rocks, retaining the existing low-poly assets.
  stoneScaleMax: 0.95,
  bridgeBlendLength: 5,
  edgeFade: 0.20, // Only the outer 20 cm blends into grass; the center stays opaque.
  edgeFalloff: 1.4, // Power applied to smoothstep alpha across the edge strip.
  capSegments: 10, // Small rounded caps at route endings and joins.
  junctionRoundness: 0.9, // Tangent length of the curved inside corners, in meters.
  colorVariation: 0.045,
  sampleSpacing: 1,
  groundOffset: 0.035,
  sceneryClearance: 2,
  // Shared cross-sections at continuous camp-road joins; no overlapping endpoint caps.
  connections: [
    { x: 0, z: -8, directionX: 0, directionZ: -1, blendLength: 2 },
    { x: 0, z: 10, directionX: 0, directionZ: 1, blendLength: 2 },
  ],
  routes: [
    { id: "guard-dungeon", capStyle: "worn", points: [[0, -8], [0, -38], [0, -90]] },
    { id: "central-camp", points: [[0, -8], [0, -2], [-0.3, 4], [0, 10]] },
    { id: "camp-highlands", points: [[0, 10], [0, 85], [0, 150], [0, 200]] },
    { id: "wolf-trail", width: 1.8,
      points: [[0, 35], [-12, 36], [-27, 49], [-43, 50]] },
    { id: "giant-hill", points: [[0, 35], [32, 48], [70, 72]] },
    { id: "northern-ruins", points: [[0, 200], [40, 196], [80, 180]] },
    { id: "highlands-lookout", points: [[0, 200], [22, 222], [40, 245]] },
    { id: "lake-approach", points: [[0, -90], [-60, -105], [-130, -125], [-198, -160]] },
    { id: "sunken-ruins", points: [[-198, -160], [-185, -190], [-160, -220]] },
    { id: "forest-shrine", points: [[-130, -125], [-178, -94], [-240, -65]] },
    { id: "snowy-waypoint", points: [[0, 35], [85, 25], [145, 8], [185, 0]] },
    { id: "frozen-arch", points: [[185, 0], [210, -30], [226, -62], [250, -82]] },
  ],
};

export const BRIDGE_BANK_POLISH = {
  soilReach: 3.2,
  soilLength: 14,
  shoulderHeight: 0.22,
  shoulderWidth: 3.2,
  shoulderDepth: 4.2,
  walkwayClearance: 0.45,
  thresholdDustLength: 0.85,
  thresholdDustOpacity: 0.4,
  rockScales: [0.7, 0.48, 0.36],
  shorelineOffsets: [-10.5, -7.2, -4.2, 4.2, 7.2, 10.5],
};

// Asymmetric, reusable compositions, rather than uniform random scatter.
export const PROP_CLUSTER_STYLES = {
  forest: [
    { kind: "accents", x: 0, z: 0, scale: 0.75 },
    { kind: "bushes", x: 2.4, z: 1.1, scale: 0.8 },
    { kind: "flowers", x: -1.6, z: 1.8, scale: 0.8 },
    { kind: "rocks", x: 1.2, z: -1.8, scale: 0.55 },
  ],
  highlands: [
    { kind: "boulders", x: 0, z: 0, scale: 0.9 },
    { kind: "rocks", x: 2.8, z: 1.2, scale: 0.65 },
    { kind: "rocks", x: -1.8, z: 2, scale: 0.5 },
    { kind: "scrub", x: 2, z: -2.4, scale: 0.55 },
  ],
  snow: [
    { kind: "snowyBoulders", x: 0, z: 0, scale: 1.1 },
    { kind: "snowyRocks", x: 3, z: 1.2, scale: 0.75 },
    { kind: "snowyRocks", x: -2, z: 2.2, scale: 0.55 },
  ],
  shore: [
    { kind: "rocks", x: 0, z: 0, scale: 0.7 },
    { kind: "rocks", x: 1.8, z: -1.2, scale: 0.45 },
    { kind: "grassTufts", x: -1.6, z: 1.2, scale: 0.85 },
    { kind: "bushes", x: 2, z: 2.4, scale: 0.65 },
    { kind: "grassTufts", x: -2.4, z: -0.8, scale: 0.7 },
  ],
};

export const PROP_CLUSTERS = [
  { id: "camp-west", x: -16, z: -3, style: "forest" },
  { id: "camp-east", x: 33, z: 0, style: "forest" },
  { id: "north-trail", x: -13, z: 66, style: "forest" },
  { id: "hill-approach", x: 37, z: 62, style: "forest" },
  { id: "bridge-west-bank", x: -34, z: -13, style: "shore" },
  { id: "bridge-east-bank", x: 18, z: -45, style: "shore" },
  { id: "forest-entrance", x: -23, z: -83, style: "forest" },
  { id: "lake-trail", x: -82, z: -115, style: "forest" },
  { id: "shrine-approach", x: -208, z: -86, style: "forest" },
  { id: "lake-north-shore", x: -162, z: -134, style: "shore" },
  { id: "lake-east-shore", x: -128, z: -145, style: "shore" },
  { id: "lake-south-shore", x: -144, z: -194, style: "shore" },
  { id: "sunken-entrance", x: -184, z: -222, style: "shore" },
  { id: "highlands-trail", x: -12, z: 128, style: "highlands" },
  { id: "northern-camp-edge", x: -30, z: 172, style: "highlands" },
  { id: "ruins-approach", x: 58, z: 207, style: "highlands" },
  { id: "lookout-approach", x: 18, z: 247, style: "highlands" },
  { id: "snow-trail", x: 153, z: 20, style: "snow" },
  { id: "researcher-outskirts", x: 201, z: 12, style: "snow" },
  { id: "arch-approach", x: 216, z: -71, style: "snow" },
  { id: "arch-silhouette", x: 267, z: -106, style: "snow" },
];
