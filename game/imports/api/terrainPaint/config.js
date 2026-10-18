// Millimetre world-space keys survive vertex reordering and chunk reloads.
export const PAINT_PRECISION = 1000;
export const PAINT_TILE_SIZE = 32;
export const MAX_STROKE_VERTICES = 20000;
export const TERRAIN_PAINT_COLORS = [
  { name: "Light green", hex: "#91AD62" },
  { name: "Dark green", hex: "#48643D" },
  { name: "Brown", hex: "#876247" },
  { name: "Beige", hex: "#C5B58B" },
  { name: "Gray", hex: "#858987" },
];
export const paintKey = (x, z) => `${x}:${z}`;
export const paintTile = (x, z) => `${Math.floor(x / PAINT_PRECISION / PAINT_TILE_SIZE)}:${Math.floor(z / PAINT_PRECISION / PAINT_TILE_SIZE)}`;
