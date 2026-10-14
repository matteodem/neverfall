import { MaterialPluginBase } from "@babylonjs/core";

// The tall eastern terrain edge must fade into the sky at its viewing elevation,
// rather than into a solid horizon color that exposes its silhouette in the sky.
export class GroundSkyFog extends MaterialPluginBase {
  constructor(material, skyGradient) {
    super(material, "GroundSkyFog", 200, {}, true, true);
    this.skyGradient = skyGradient;
  }

  getSamplers(samplers) {
    samplers.push("worldSkyFogGradient");
  }

  getActiveTextures(textures) {
    textures.push(this.skyGradient);
  }

  bindForSubMesh(_uniformBuffer, _scene, _engine, subMesh) {
    subMesh.effect.setTexture("worldSkyFogGradient", this.skyGradient);
  }

  getCustomCode(shaderType) {
    if (shaderType !== "fragment") return null;
    return {
      CUSTOM_FRAGMENT_DEFINITIONS: "uniform sampler2D worldSkyFogGradient;",
      // A local fog color keeps Babylon's existing fog factor and lighting intact.
      CUSTOM_FRAGMENT_BEFORE_FOG: `
        #ifdef FOG
        float skyFogElevation = normalize(vPositionW - vEyePosition.xyz).y;
        vec3 vFogColor = texture2D(worldSkyFogGradient,
          vec2(0.5, (1.0 - skyFogElevation) * 0.5)).rgb;
        #endif`,
    };
  }
}
