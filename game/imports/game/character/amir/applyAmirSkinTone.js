import { Color3, RawTexture } from "@babylonjs/core";
import { SKIN_TONES } from "../../species";

// Authored Imphenzia palette cells used by exposed skin in the free body/head variants.
const SKIN_SWATCHES = [[35, 48], [36, 47], [37, 50], [40, 49]];

export const applyAmirSkinTone = async (container, skinTone, scene) => {
  const body = container.meshes.filter((mesh) => mesh.skeleton);
  const materials = [...new Set(body.map((mesh) => mesh.material))];
  const color = Color3.FromHexString(SKIN_TONES[skinTone]);
  for (const original of materials) {
    const source = original.albedoTexture;
    const { width, height } = source.getSize();
    if (width !== 128 || height !== 128) throw new Error("Amir skin palette dimensions changed");
    const data = await source.readPixels();
    if (!data) throw new Error("Could not read Amir skin palette");
    const pixels = new Uint8Array(data);
    for (const [x, y] of SKIN_SWATCHES) {
      const offset = (y * width + x) * 4;
      pixels[offset] = Math.round(color.r * 255);
      pixels[offset + 1] = Math.round(color.g * 255);
      pixels[offset + 2] = Math.round(color.b * 255);
    }
    const texture = RawTexture.CreateRGBATexture(pixels, width, height, scene, false, false, source.samplingMode);
    texture.gammaSpace = source.gammaSpace;
    texture.wrapU = source.wrapU;
    texture.wrapV = source.wrapV;
    const material = original.clone(`${original.name}-amir-skin`);
    material.albedoTexture = texture;
    for (const mesh of body) if (mesh.material === original) mesh.material = material;
    // Own per-character palette resources so another actor's appearance cannot be recolored.
    container.materials.push(material);
    container.textures.push(texture);
  }
};
