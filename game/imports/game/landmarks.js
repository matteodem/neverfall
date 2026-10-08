import { ANCIENT_FOREST_SHRINE, FROZEN_STONE_ARCH, SOUTHEAST_MOUNTAIN } from "./worldConfig";

export const LANDMARKS = [
  { id: "highlands-lookout", name: "Highlands Lookout", position: { x: 40, z: 245 }, discoveryRadius: 12 },
  { id: "ancient-forest-shrine", name: "Ancient Forest Shrine", position: ANCIENT_FOREST_SHRINE, discoveryRadius: 18 },
  { id: "frozen-stone-arch", name: "Frozen Stone Arch", position: FROZEN_STONE_ARCH, discoveryRadius: 18 },
  { id: "southeast-rocky-hill", name: "Southeast Rocky Hill", position: SOUTHEAST_MOUNTAIN.summit, discoveryRadius: 18 },
];
