// World-space placements; this pass stops before the surrounding regions.
export const CENTRAL_CAMP_POLISH = {
  center: { x: 2, z: 3.5 },
  innerRadius: 32,
  radius: 50,
  vegetationRadius: 85,
  grassLimit: 1400,
  flowerLimit: 320,
  bushLimit: 60,
  stoneLimit: 20,
  grassScale: [0.85, 1.25],
  flowerScale: [0.9, 1.3],
  clusterRadius: 2.8,
  clusterGrass: 30,
  clusterFlowers: 7,
  npcClearance: 3.4,
  enemyClearance: 4.5,
  // Central Camp dirt clearing configuration disabled.
//   wornColor: "#B99A68",
//   dirtTransition: 0.7,
//   wornTransition: 0.35,
//   clearingBounds: { minX: -25, maxX: 29, minZ: -22, maxZ: 23 },
//   // Overlapping lobes cover the tents, fire/benches and southern NPC apron.
//   clearingLobes: [
//     { x: 2, z: 2, width: 17, depth: 12 },
//     { x: -8, z: 3, width: 11, depth: 10 },
//     { x: 13, z: 3, width: 10, depth: 9 },
//     { x: 4, z: 8, width: 11, depth: 9 },
//     { x: 2, z: -9, width: 14, depth: 7 },
//   ],
  beds: [
    [-11, -5], [-8, -8], [-5.5, -14], [6, -15], [12, -6], [16, -1],
    [-15, -4], [-14, 6], [-10, 11], [-4, 11],
    [9, 11], [16, 9], [20, 3], [18, -5],
    [-8, -14], [-9, -19], [10, -15], [13, -12],
    [-4, -37], [5, -35], [-8, -28], [9, -30],
    [-18, 19], [-19, -10], [23, -12], [22, 13],
    [-13, 25], [9, 26], [-5, 18], [5, 19],
    // Dry riverbank pockets and the outer forest floor, beyond the camp activity space.
    [-38, -16], [-29, -15], [-20, -16], [16, -25], [25, -35],
    [-46, 17], [-49, 34], [-31, 38], [29, 47], [47, 26],
    [-26, -47], [-13, -56], [17, -52], [38, -18],
  ],
};

// const smooth = (value) => {
//   const t = Math.max(0, Math.min(1, value));
//   return t * t * (3 - 2 * t);
// };
//
// // Shared by terrain color and vegetation; evaluated only during world creation.
// export const getCentralCampClearing = (x, z) => {
//   const bounds = CENTRAL_CAMP_POLISH.clearingBounds;
//   if (x < bounds.minX || x > bounds.maxX || z < bounds.minZ || z > bounds.maxZ)
//     return { dirt: 0, worn: 0, inset: -Infinity };
//   let inset = -Infinity;
//   for (const lobe of CENTRAL_CAMP_POLISH.clearingLobes) {
//     const radius = Math.hypot((x - lobe.x) / lobe.width, (z - lobe.z) / lobe.depth);
//     inset = Math.max(inset, (1 - radius) * Math.min(lobe.width, lobe.depth));
//   }
//   // Low-frequency ripples break up the perimeter without noisy islands of dirt.
//   inset += Math.sin(x * 0.43 + z * 0.19) * 0.55 + Math.sin(z * 0.57 - x * 0.14) * 0.35;
//   return {
//     dirt: smooth(inset / CENTRAL_CAMP_POLISH.dirtTransition + 0.5),
//     worn: smooth((inset + CENTRAL_CAMP_POLISH.wornTransition) / CENTRAL_CAMP_POLISH.wornTransition),
//     inset,
//   };
// };

export const getCentralCampMix = (x, z) => {
  const distance = Math.hypot(x - CENTRAL_CAMP_POLISH.center.x, z - CENTRAL_CAMP_POLISH.center.z);
  const t = Math.max(0, Math.min(1, (CENTRAL_CAMP_POLISH.radius - distance) /
    (CENTRAL_CAMP_POLISH.radius - CENTRAL_CAMP_POLISH.innerRadius)));
  return t * t * (3 - 2 * t);
};
