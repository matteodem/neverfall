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
