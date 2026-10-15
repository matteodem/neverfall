import { STARTER_RIVER as RIVER, worldToRiver } from "./starterRiverConfig";

const smooth = (value) => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

// Monotone cubic tangents round the bends without overshooting authored widths
// or positions. Share each tangent between neighboring segments.
const tangents = RIVER.path.map((point, index) => Object.fromEntries(["x", "width"].map((key) => {
  if (index === 0 || index === RIVER.path.length - 1) return [key, 0];
  const previous = RIVER.path[index - 1], next = RIVER.path[index + 1];
  const before = (point[key] - previous[key]) / (point.z - previous.z);
  const after = (next[key] - point[key]) / (next.z - point.z);
  return [key, before * after > 0 ? 2 * before * after / (before + after) : 0];
})));

const interpolate = (index, key, t) => {
  const from = RIVER.path[index - 1], to = RIVER.path[index];
  const span = to.z - from.z, t2 = t * t, t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * from[key] + (t3 - 2 * t2 + t) * span * tangents[index - 1][key] +
    (-2 * t3 + 3 * t2) * to[key] + (t3 - t2) * span * tangents[index][key];
};

// Plain shared math: terrain, server heights, scenery exclusions and water agree.
export const getStarterRiverSection = (z) => {
  const start = RIVER.path[0].z, end = RIVER.path[RIVER.path.length - 1].z;
  if (z < start || z > end) return null;
  for (let index = 1; index < RIVER.path.length; index++) {
    const from = RIVER.path[index - 1], to = RIVER.path[index];
    if (z > to.z) continue;
    const t = (z - from.z) / (to.z - from.z);
    const fade = RIVER.endFade > 0
      ? smooth((z - start) / RIVER.endFade) * smooth((end - z) / RIVER.endFade) : 1;
    // Correct cross-sections for the bend angle so authored widths remain
    // 3–5 m perpendicular to the flow, including the steeper eastern turn.
    const span = to.z - from.z, t2 = t * t;
    const slope = (6 * t2 - 6 * t) * from.x / span + (3 * t2 - 4 * t + 1) * tangents[index - 1].x +
      (-6 * t2 + 6 * t) * to.x / span + (3 * t2 - 2 * t) * tangents[index].x;
    return {
      x: interpolate(index, "x", t),
      halfWidth: interpolate(index, "width", t) / 2 * Math.hypot(1, slope),
      fade,
    };
  }
  return null;
};

export const getStarterRiverBankMix = (x, z) => {
  ({ x, z } = worldToRiver(x, z));
  const section = getStarterRiverSection(z);
  if (!section) return 0;
  const distance = Math.abs(x - section.x);
  return (1 - smooth((distance - section.halfWidth) / RIVER.bankWidth)) * section.fade;
};

export const isInStarterRiver = ({ x, z }, clearance = 0) => {
  ({ x, z } = worldToRiver(x, z));
  const section = getStarterRiverSection(Math.max(RIVER.path[0].z,
    Math.min(RIVER.path[RIVER.path.length - 1].z, z)));
  return z >= RIVER.path[0].z - clearance && z <= RIVER.path[RIVER.path.length - 1].z + clearance &&
    Math.abs(x - section.x) <= section.halfWidth + RIVER.bankWidth + clearance;
};

export const applyStarterRiverBed = (x, z, height) => {
  ({ x, z } = worldToRiver(x, z));
  const section = getStarterRiverSection(z);
  if (!section) return height;
  const distance = Math.abs(x - section.x);
  if (distance >= section.halfWidth + RIVER.bankWidth) return height;
  const channel = distance <= section.halfWidth
    ? RIVER.waterLevel - RIVER.bedDepth * (1 - smooth(distance / section.halfWidth))
    : lerp(RIVER.waterLevel, height, smooth((distance - section.halfWidth) / RIVER.bankWidth));
  return lerp(height, channel, section.fade);
};
