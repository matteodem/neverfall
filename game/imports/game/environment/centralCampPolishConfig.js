// World-space placements; this pass stops before the surrounding regions.
export const CENTRAL_CAMP_POLISH = {
  center: { x: 2, z: 3.5 },
  innerRadius: 32,
  radius: 50,
  grassLimit: 560,
  flowerLimit: 110,
  bushLimit: 14,
  grassScale: [0.85, 1.25],
  flowerScale: [0.9, 1.3],
  clusterRadius: 2,
  clusterGrass: 20,
  clusterFlowers: 4,
  npcClearance: 3.4,
  enemyClearance: 4.5,
  wornColor: "#B99E70",
  shoulderWidth: 0.8,
  // Keep camp activity warm and worn, with darker greens around planted beds.
  activityAreas: [
    { x: 0, z: 0, radius: 7 }, { x: 3.5, z: 4, radius: 7 },
    { x: -3, z: -10, radius: 6 }, { x: 3, z: -10, radius: 6 },
    { x: 9, z: -8, radius: 5 },
  ],
  beds: [
    [-11, -5], [-8, -8], [-5.5, -14], [6, -15], [12, -6], [16, -1],
    [-15, -4], [-14, 6], [-10, 11], [-4, 11],
    [9, 11], [16, 9], [20, 3], [18, -5],
    [-8, -14], [-9, -19], [10, -15], [13, -12],
    [-4, -37], [5, -35], [-8, -28], [9, -30],
    [-18, 19], [-19, -10], [23, -12], [22, 13],
    [-13, 25], [9, 26], [-5, 18], [5, 19],
  ],
  treeGroves: [[-27, 25], [-34, 8], [-32, -14], [-20, -35], [23, 34], [35, 12], [32, -23], [-16, 38]],
};

export const getCentralCampMix = (x, z) => {
  const distance = Math.hypot(x - CENTRAL_CAMP_POLISH.center.x, z - CENTRAL_CAMP_POLISH.center.z);
  const t = Math.max(0, Math.min(1, (CENTRAL_CAMP_POLISH.radius - distance) /
    (CENTRAL_CAMP_POLISH.radius - CENTRAL_CAMP_POLISH.innerRadius)));
  return t * t * (3 - 2 * t);
};
