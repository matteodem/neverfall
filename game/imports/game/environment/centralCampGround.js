// Central Camp dirt clearing disabled; implementation retained below.
// import { Color3, MaterialPluginBase, RawTexture, Texture } from "@babylonjs/core";
// import { CENTRAL_CAMP_POLISH as CONFIG, getCentralCampClearing } from "./centralCampPolishConfig";
//
// const glsl = (value) => Number(value).toFixed(4);
//
// // Color per fragment: the coarse terrain grid must not widen the camp's narrow edge.
// // The same material also covers the river banks; geometry and collisions stay intact.
// export class CentralCampGround extends MaterialPluginBase {
//   constructor(material) {
//     super(material, "CentralCampGround", 190, {}, true, true);
//     const size = 256, pixels = new Uint8Array(size * size * 4);
//     const { minX, maxX, minZ, maxZ } = CONFIG.clearingBounds;
//     // About 20cm per texel retains the narrow strip; no outline math runs per pixel.
//     for (let row = 0; row < size; row++) for (let col = 0; col < size; col++) {
//       const x = minX + (col + 0.5) / size * (maxX - minX);
//       const z = minZ + (row + 0.5) / size * (maxZ - minZ);
//       const { dirt, worn } = getCentralCampClearing(x, z);
//       pixels.set([Math.round(dirt * 255), Math.round(worn * 255), 0, 255], (row * size + col) * 4);
//     }
//     this.mask = RawTexture.CreateRGBATexture(pixels, size, size, material.getScene(),
//       false, false, Texture.BILINEAR_SAMPLINGMODE);
//     this.mask.name = "central-camp-ground-mask";
//     this.mask.wrapU = this.mask.wrapV = Texture.CLAMP_ADDRESSMODE;
//   }
//
//   getSamplers(samplers) {
//     samplers.push("centralCampGroundMask");
//   }
//
//   getActiveTextures(textures) {
//     textures.push(this.mask);
//   }
//
//   bindForSubMesh(_uniformBuffer, _scene, _engine, subMesh) {
//     subMesh.effect.setTexture("centralCampGroundMask", this.mask);
//   }
//
//   getCustomCode(shaderType) {
//     if (shaderType !== "fragment") return null;
//     const color = Color3.FromHexString(CONFIG.wornColor).asArray().map(glsl).join(", ");
//     const { minX, maxX, minZ, maxZ } = CONFIG.clearingBounds;
//     return {
//       CUSTOM_FRAGMENT_DEFINITIONS: "uniform sampler2D centralCampGroundMask;",
//       CUSTOM_FRAGMENT_UPDATE_DIFFUSE: `
//         vec2 campPoint = vPositionW.xz;
//         if (campPoint.x > ${glsl(minX)} && campPoint.x < ${glsl(maxX)} &&
//             campPoint.y > ${glsl(minZ)} && campPoint.y < ${glsl(maxZ)}) {
//           vec2 campMask = texture2D(centralCampGroundMask,
//             (campPoint - vec2(${glsl(minX)}, ${glsl(minZ)})) / vec2(${glsl(maxX - minX)}, ${glsl(maxZ - minZ)})).rg;
//           vec3 campSoil = vec3(${color});
//           baseColor.rgb = mix(baseColor.rgb, campSoil, campMask.g * 0.25);
//           baseColor.rgb = mix(baseColor.rgb, campSoil, campMask.r);
//         }`,
//     };
//   }
// }
