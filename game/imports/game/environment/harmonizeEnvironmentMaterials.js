import { Color3 } from "@babylonjs/core";
import { WORLD_PALETTE as PALETTE } from "./worldPalette";

// Apply once to environment-owned materials at load time, before instancing.
// Never touch actor materials, baked albedo textures, vertex colors or glow effects.
export const harmonizeEnvironmentMaterials = (materials, assetName) => {
  const flowers = /^flowers_/.test(assetName);
  const vegetation = flowers || /^(birch_|oak_|pine_|fir_|bush_|grass_|fern$)/.test(assetName);
  const wood = /^(dry_tree_|log_|stump_)/.test(assetName);
  const rock = /^rock_/.test(assetName);
  const leafColor = /^(pine_|fir_)/.test(assetName) ? PALETTE.foliage.evergreen
    : assetName === "birch_2" ? PALETTE.foliage.autumnGold
      : assetName === "birch_3" ? PALETTE.foliage.autumnOrange
        : flowers || /^(bush_|grass_|fern$)/.test(assetName) ? PALETTE.foliage.bush : PALETTE.foliage.leaves;

  for (const material of new Set(materials)) {
    if (!material?.albedoColor || material.disableLighting || material.alpha < 1 ||
      material.emissiveTexture || material.emissiveColor?.r > 0 ||
      material.emissiveColor?.g > 0 || material.emissiveColor?.b > 0) continue;

    // Keep authored roughness/metallic maps (e.g. stone walls with metal trims).
    material.roughness = Math.max(material.roughness ?? 1, PALETTE.material.roughness);
    if (!material.metallicTexture && assetName !== "camping-pot") material.metallic = 0;
    if (material.albedoTexture) continue;

    const color = material.albedoColor;
    const green = color.g > color.r * 1.1 && color.g > color.b * 1.25;
    const brown = color.r > color.g * 1.1 && color.g > color.b * 1.2;
    const neutral = Math.max(color.r, color.g, color.b) - Math.min(color.r, color.g, color.b) <
      Math.max(color.r, color.g, color.b) * 0.2;
    const hex = rock ? PALETTE.rock
      : vegetation && green ? leafColor
        : wood || (vegetation && brown && !flowers) ? PALETTE.bark
          : !vegetation && neutral ? PALETTE.stone : null;
    if (!hex) continue;
    // GLTF/PBR base colors are linear; retain some authored shade variation.
    material.albedoColor = Color3.Lerp(color, Color3.FromHexString(hex).toLinearSpace(), PALETTE.material.colorBlend)
      .scale(PALETTE.material.brightness);
  }
};
