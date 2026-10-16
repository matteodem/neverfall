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
  x: -8.2,
  z: -13.9,
  rotationY: Math.PI + 0.35, // Face the lantern arm toward the road.
  scale: 1.6, // Existing camp scale (1.8) makes the final uniform scale 2.88.
};
