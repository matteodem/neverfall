import { getWorldHeight } from "./worldConfig";

export const BASIC_TOWER_POSITION = { x: 60, z: -230 };
export const BASIC_TOWER_SCALE = 18;
export const BASIC_TOWER_ROTATION_Y = 0;
export const BASIC_TOWER_CLEARING_RADIUS = 16;

// Local GLB coordinates at the center of the final walkable platform.
export const BASIC_TOWER_PLATFORM_POINT = { x: 0.18, y: 0.7107, z: -0.31 };
// Model bounds before Babylon's right-to-left-handed X-axis conversion.
const MODEL_BOUNDS = {
  min: { x: -0.59625, y: -0.951765, z: -0.61478 },
  max: { x: 0.598213, z: 0.611069 },
};
const centerX = (MODEL_BOUNDS.min.x + MODEL_BOUNDS.max.x) / 2;
const centerZ = (MODEL_BOUNDS.min.z + MODEL_BOUNDS.max.z) / 2;
const chestLocalX = (centerX - BASIC_TOWER_PLATFORM_POINT.x) * BASIC_TOWER_SCALE;
const chestLocalY = (BASIC_TOWER_PLATFORM_POINT.y - MODEL_BOUNDS.min.y) * BASIC_TOWER_SCALE;
const chestLocalZ = (BASIC_TOWER_PLATFORM_POINT.z - centerZ) * BASIC_TOWER_SCALE;
const cos = Math.cos(BASIC_TOWER_ROTATION_Y);
const sin = Math.sin(BASIC_TOWER_ROTATION_Y);

export const BASIC_TOWER_CHEST_POSITION = {
  x: BASIC_TOWER_POSITION.x + chestLocalX * cos + chestLocalZ * sin,
  y: getWorldHeight(BASIC_TOWER_POSITION.x, BASIC_TOWER_POSITION.z) + chestLocalY,
  z: BASIC_TOWER_POSITION.z - chestLocalX * sin + chestLocalZ * cos,
};
