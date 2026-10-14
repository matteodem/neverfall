import { WORLD_ATMOSPHERE } from "./atmosphereConfig";

// Reference-inspired environmental colors; shared configs remain safe to import on the server.
export const WORLD_PALETTE = {
  // Compatibility aliases; sky/fog are configured centrally with the atmosphere.
  sky: WORLD_ATMOSPHERE.sky.horizon,
  fog: WORLD_ATMOSPHERE.fog,
  terrain: {
    forest: "#78A44D", highlands: "#8DA65C", olive: "#8C9D50",
    earth: "#A08B5C", snow: "#E5EDF2", forestFloor: "#668D45",
  },
  foliage: {
    leaves: "#7DA541", evergreen: "#356C4B", bush: "#699B49",
    autumnGold: "#CFB449", autumnOrange: "#D58A43",
  },
  rock: "#7F91A8",
  stone: "#B5A589",
  bark: "#715039",
  wood: "#84603F",
  canvas: "#D1B27D",
  path: "#CBA96C",
  water: "#32ADBB",
  waterHighlight: "#578C94",
  dungeonWater: "#327F8B",
  dungeonWaterGlow: "#102D35",
  material: { roughness: 0.85, colorBlend: 0.7, brightness: 1.1 },
  dungeons: {
    forest: { sky: "#1b202b", ground: "#414A55", stone: "#657080" },
    northern: { sky: "#17212b", ground: "#354953", stone: "#6D8391" },
    sunken: { sky: "#172b34", ground: "#3D5657", stone: "#718F8A" },
  },
};
