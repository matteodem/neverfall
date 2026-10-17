// Relative to the central camp root (world x: 2, z: 3.5).
// Keep NPC interaction spaces and the bridge approach clear.
export const MAGE_AWNING = {
  asset: "fantasy-camp-awning",
  x: 4.4,
  z: -15.7,
  rotationY: -0.35,
  scale: 0.85, // Existing camp scale (1.8) makes the final uniform scale 1.53.
};

export const GUARD_POST = {
  asset: "guard-post",
  x: -6.6, // World x: -4.6, just beside the Guard's west shoulder.
  z: -15.3, // World z: -11.8, behind the Guard toward the bridge.
  rotationY: Math.PI + 0.35, // Face the lantern arm toward the road.
  scale: 1.6, // Existing camp scale (1.8) makes the final uniform scale 2.88.
};

// Short, open runs relative to Central Camp (world x: 2, z: 3.5).
// [x, z, rotationY, scale]; final panel height is about 1.1m at camp scale.
// Tent doors, NPC spaces and the road remain between/beyond these outer shoulders.
export const CENTRAL_CAMP_FENCES = [
  // West tent flank: three panels, with a slight turn at the end.
  [-16, -3.4, 1.57, 1.1],
  [-16, -1.55, 1.57, 1.1],
  [-15.9, 0.3, 1.47, 1.1],
  // East tent rear border leaves the nearby boar's area and the merchant open.
  [12.2, -9.5, 0.04, 1.1],
  [14.05, -9.6, 0.04, 1.1],
  // Staggered road shoulders north of camp, well before the trail junction.
  [-6.5, 18.5, 1.57, 1.1],
  [-6.5, 20.35, 1.57, 1.1],
  [-6.4, 22.2, 1.47, 1.1],
  [2.8, 9.5, 1.62, 1.1],
  [2.9, 11.35, 1.62, 1.1],
];
