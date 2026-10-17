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
  wornColor: "#B99E70",
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
    // Dry riverbank pockets and the outer forest floor, beyond the camp activity space.
    [-38, -16], [-29, -15], [-20, -16], [16, -25], [25, -35],
    [-46, 17], [-49, 34], [-31, 38], [29, 47], [47, 26],
    [-26, -47], [-13, -56], [17, -52], [38, -18],
  ],
};

export const getCentralCampMix = (x, z) => {
  const distance = Math.hypot(x - CENTRAL_CAMP_POLISH.center.x, z - CENTRAL_CAMP_POLISH.center.z);
  const t = Math.max(0, Math.min(1, (CENTRAL_CAMP_POLISH.radius - distance) /
    (CENTRAL_CAMP_POLISH.radius - CENTRAL_CAMP_POLISH.innerRadius)));
  return t * t * (3 - 2 * t);
};
