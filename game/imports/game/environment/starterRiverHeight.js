import { STARTER_RIVER as RIVER } from "./starterRiverConfig";

const smooth = (value) => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

// Plain shared math: terrain, server heights, scenery exclusions and water agree.
export const getStarterRiverSection = (z) => {
  const start = RIVER.path[0].z, end = RIVER.path[RIVER.path.length - 1].z;
  if (z < start || z > end) return null;
  for (let index = 1; index < RIVER.path.length; index++) {
    const from = RIVER.path[index - 1], to = RIVER.path[index];
    if (z > to.z) continue;
    const t = smooth((z - from.z) / (to.z - from.z));
    const fade = smooth((z - start) / RIVER.endFade) * smooth((end - z) / RIVER.endFade);
    return {
      x: lerp(from.x, to.x, t) + Math.sin(z * 0.9) * 0.12,
      halfWidth: lerp(from.width, to.width, t) / 2 + Math.sin(z * 1.3) * 0.1,
      fade,
    };
  }
  return null;
};

export const getStarterRiverBankMix = (x, z) => {
  const section = getStarterRiverSection(z);
  if (!section) return 0;
  const distance = Math.abs(x - section.x);
  return (1 - smooth((distance - section.halfWidth) / RIVER.bankWidth)) * section.fade;
};

export const isInStarterRiver = ({ x, z }, clearance = 0) => {
  const section = getStarterRiverSection(Math.max(RIVER.path[0].z,
    Math.min(RIVER.path[RIVER.path.length - 1].z, z)));
  return z >= RIVER.path[0].z - clearance && z <= RIVER.path[RIVER.path.length - 1].z + clearance &&
    Math.abs(x - section.x) <= section.halfWidth + RIVER.bankWidth + clearance;
};

export const applyStarterRiverBed = (x, z, height) => {
  const section = getStarterRiverSection(z);
  if (!section) return height;
  const distance = Math.abs(x - section.x);
  if (distance >= section.halfWidth + RIVER.bankWidth) return height;
  const channel = distance <= section.halfWidth
    ? RIVER.waterLevel - RIVER.bedDepth * (1 - smooth(distance / section.halfWidth))
    : lerp(RIVER.waterLevel, height, smooth((distance - section.halfWidth) / RIVER.bankWidth));
  return lerp(height, channel, section.fade);
};
