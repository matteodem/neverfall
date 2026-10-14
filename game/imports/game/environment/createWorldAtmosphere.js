import { Color3, Mesh, MeshBuilder, RawTexture, Scene, ShaderMaterial, Texture } from "@babylonjs/core";
import { WORLD_ATMOSPHERE } from "./atmosphereConfig";
import { createDistantMountains } from "./createDistantMountains";

const createGradientSky = (scene, settings) => {
  const zenith = Color3.FromHexString(settings.zenith);
  const horizon = Color3.FromHexString(settings.horizon);
  const pixels = new Uint8Array(settings.textureHeight * 4);
  for (let row = 0; row < settings.textureHeight; row++) {
    const height = 1 - row / (settings.textureHeight - 1) * 2;
    // Fully fogged terrain and the lower sky must meet at the same color.
    const blend = Math.max(0, (height - settings.horizonBand) / (1 - settings.horizonBand));
    const color = Color3.Lerp(horizon, zenith, Math.pow(blend, 0.65));
    pixels.set([Math.round(color.r * 255), Math.round(color.g * 255), Math.round(color.b * 255), 255], row * 4);
  }
  const texture = RawTexture.CreateRGBATexture(pixels, 1, settings.textureHeight, scene,
    false, false, Texture.BILINEAR_SAMPLINGMODE);
  texture.name = "worldSkyGradient";
  texture.wrapU = texture.wrapV = Texture.CLAMP_ADDRESSMODE;

  const sky = MeshBuilder.CreateBox("worldSky", {
    size: settings.diameter, sideOrientation: Mesh.BACKSIDE,
  }, scene);
  // Sample by viewing direction so the gradient is continuous across box faces.
  const material = new ShaderMaterial("worldSkyMaterial", scene, {
    vertexSource: `
      precision highp float;
      attribute vec3 position;
      uniform mat4 worldViewProjection;
      varying vec3 skyDirection;
      void main(void) {
        skyDirection = position;
        gl_Position = worldViewProjection * vec4(position, 1.0);
      }`,
    fragmentSource: `
      precision highp float;
      varying vec3 skyDirection;
      uniform sampler2D skyGradient;
      void main(void) {
        float elevation = normalize(skyDirection).y;
        gl_FragColor = texture2D(skyGradient, vec2(0.5, (1.0 - elevation) * 0.5));
      }`,
  }, {
    attributes: ["position"],
    uniforms: ["worldViewProjection"],
    samplers: ["skyGradient"],
  });
  material.setTexture("skyGradient", texture);
  material.fogEnabled = false;
  material.disableDepthWrite = true;
  sky.material = material;
  sky.infiniteDistance = true;
  sky.isPickable = false;
  sky.checkCollisions = false;
  sky.receiveShadows = false;
  sky.metadata = { worldShadows: { cast: false, receive: false } };
  return texture;
};

export const createWorldAtmosphere = (scene, { dungeonEnvironment = null } = {}) => {
  const settings = WORLD_ATMOSPHERE;
  scene.fogMode = Scene.FOGMODE_LINEAR;
  scene.fogColor = Color3.FromHexString(dungeonEnvironment?.sky || settings.fog.color);
  scene.clearColor = Color3.FromHexString(dungeonEnvironment?.sky || settings.sky.horizon).toColor4();
  scene.fogStart = dungeonEnvironment ? settings.dungeonFog.start : settings.fog.start;
  scene.fogEnd = dungeonEnvironment ? settings.dungeonFog.end : settings.fog.end;
  if (dungeonEnvironment) return;
  const skyGradient = createGradientSky(scene, settings.sky);
  createDistantMountains(scene, settings.mountains, settings.fog.color);
  return skyGradient;
};
