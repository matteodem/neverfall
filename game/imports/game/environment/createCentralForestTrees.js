// Authored grove centers leave meadows between uneven, denser woodland pockets.
// This composition replaces the central chunk's grid trees, rather than adding to them.
const GROVES = [
  { x: -33, z: 27, radius: 13, count: 16, hero: true },
  { x: 39, z: 3, radius: 12, count: 14, hero: true },
  { x: -29, z: -52, radius: 14, count: 14, hero: true },
  { x: -67, z: 12, radius: 17, count: 17 },
  { x: -76, z: -58, radius: 14, count: 13 },
  { x: -46, z: -78, radius: 12, count: 9 },
  { x: 32, z: -76, radius: 16, count: 14 },
  { x: 74, z: -35, radius: 14, count: 13 },
  { x: 78, z: 12, radius: 17, count: 16 },
  { x: -24, z: 77, radius: 14, count: 13 },
  { x: 31, z: 83, radius: 12, count: 10 },
  { x: -85, z: 37, radius: 10, count: 8 },
  // Smaller groves join the camp-edge silhouettes to the deeper forest.
  { x: -16, z: 28, radius: 9, count: 12 },
  { x: 27, z: 59, radius: 11, count: 16 },
  { x: 17, z: 45, radius: 8, count: 16 },
  { x: -31, z: 1, radius: 10, count: 12 },
  { x: 33, z: -22, radius: 11, count: 12 },
  { x: -18, z: -42, radius: 9, count: 9 },
  { x: -12, z: 66, radius: 8, count: 12 },
  { x: 12, z: 68, radius: 8, count: 12 },
];

const CLEARINGS = [
  { x: 2, z: 3.5, width: 22, depth: 20 }, // Camp, tents and NPC sightlines.
  { x: -21, z: 49, width: 10, depth: 12 }, // Meadow beside the wolf approach.
  { x: 43, z: -49, width: 14, depth: 12 }, // Open southern forest pocket.
];

export const createCentralForestTrees = ({ density, random, canPlace, place }) => {
  const trees = [];
  let dressing = 0;
  const limit = Math.round(160 * density);
  const clear = (point, margin) => Math.abs(point.x) < 98 - margin && Math.abs(point.z) < 98 - margin &&
    CLEARINGS.every(({ x, z, width, depth }) =>
      ((point.x - x) / (width + margin)) ** 2 + ((point.z - z) / (depth + margin)) ** 2 > 1) &&
    canPlace(point, margin);
  const addTree = (point, scale, hero = false) => {
    const margin = 4.5 * scale;
    if (trees.length >= limit || !clear(point, margin) ||
      trees.some((tree) => Math.hypot(point.x - tree.x, point.z - tree.z) <
        2.25 * (scale + tree.scale))) return;
    if (!place("broadleaf", point, random, scale)) return;
    trees.push({ ...point, scale, hero });
  };
  // Place anchors first so low quality retains the same woodland identity.
  for (const grove of GROVES.filter(({ hero }) => hero))
    addTree({ x: grove.x, z: grove.z }, 1.45 + random() * 0.25, true);

  const groveBudget = Math.max(0, limit - trees.length);
  const totalWeight = GROVES.reduce((sum, grove) => sum + grove.count, 0);
  for (const grove of GROVES) {
    const before = trees.length;
    // Reserve a share for every grove, including the distant silhouettes on low quality.
    const target = Math.floor(grove.count / totalWeight * groveBudget);
    const rotation = random() * Math.PI * 2;
    const stretch = 0.65 + random() * 0.55;
    for (let attempt = 0; attempt < target * 18 && trees.length - before < target; attempt++) {
      const angle = random() * Math.PI * 2;
      const radius = Math.sqrt(random()) * grove.radius;
      const dx = Math.cos(angle) * radius, dz = Math.sin(angle) * radius * stretch;
      const point = { x: grove.x + dx * Math.cos(rotation) - dz * Math.sin(rotation),
        z: grove.z + dx * Math.sin(rotation) + dz * Math.cos(rotation) };
      // Smaller edge trees fit between mature crowns without making every grove taller.
      addTree(point, 0.65 + random() ** 1.4 * 0.55);
    }
    // A few reused props tie the trunks to the forest floor; never fill the meadows.
    if (trees.length === before) continue;
    for (let index = 0; index < Math.ceil(4 * density); index++) {
      const tree = trees[before + index % (trees.length - before)];
      const angle = random() * Math.PI * 2;
      const distance = 2.5 + random() * 2.5;
      const point = { x: tree.x + Math.cos(angle) * distance, z: tree.z + Math.sin(angle) * distance };
      const kind = index === 0 && !grove.hero ? "deadTrees" : index === 1 ? "rocks" : "undergrowth";
      const scale = kind === "deadTrees" ? 0.6 + random() * 0.25 : 0.45 + random() * 0.35;
      if (clear(point, kind === "deadTrees" ? 3 : 1.2) && place(kind, point, random, scale)) dressing++;
    }
  }
  return { trees, dressing };
};
