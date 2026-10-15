import { Color3, MeshBuilder, RawTexture, Texture, Vector2, Vector3, VertexBuffer } from "@babylonjs/core";
import { WaterMaterial } from "@babylonjs/materials/water/waterMaterial";
import { STARTER_RIVER as RIVER } from "./starterRiverConfig";
import { getStarterRiverSection } from "./starterRiverHeight";
import { createStarterRiverGround } from "./createStarterRiverGround";

export const createStarterRiver = (scene, ground, quality) => {
  const banks = createStarterRiverGround(scene, ground);
  const start = RIVER.path[0].z, end = RIVER.path[RIVER.path.length - 1].z;
  const segments = Math.ceil((end - start) / RIVER.sampleSpacing), edges = [[], []];
  for (let index = 0; index <= segments; index++) {
    const z = start + (end - start) * index / segments;
    const section = getStarterRiverSection(z);
    // Reuse the old ribbon approach: hidden edges extend beneath the carved banks.
    const extent = section.halfWidth + RIVER.bankWidth;
    edges[0].push(new Vector3(section.x - extent, 0, z));
    edges[1].push(new Vector3(section.x + extent, 0, z));
  }
  const water = MeshBuilder.CreateRibbon("starter-river", { pathArray: edges }, scene);
  // WaterMaterial's reflection clip plane follows mesh.position.y.
  water.position.y = RIVER.waterLevel;
  const positions = water.getVerticesData(VertexBuffer.PositionKind), uvs = water.getVerticesData(VertexBuffer.UVKind);
  for (let index = 0; index < positions.length / 3; index++) {
    uvs[index * 2] = positions[index * 3] / 3;
    uvs[index * 2 + 1] = positions[index * 3 + 2] / 3;
  }
  water.setVerticesData(VertexBuffer.UVKind, uvs);
  const low = quality.density < 1, size = low ? RIVER.lowReflectionSize : RIVER.reflectionSize;
  const material = new WaterMaterial("starter-river-water", scene, new Vector2(size, size));
  // A tiny seamless procedural bump map avoids another downloaded texture.
  const pixels = new Uint8Array(64 * 64 * 4);
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
    const a = x / 64 * Math.PI * 2, b = y / 64 * Math.PI * 2;
    pixels.set([128 + Math.round(35 * Math.cos(a * 2 + b)),
      128 + Math.round(35 * Math.sin(b * 3 - a)), 255, 255], (y * 64 + x) * 4);
  }
  material.bumpTexture = RawTexture.CreateRGBATexture(pixels, 64, 64, scene, true, false, Texture.TRILINEAR_SAMPLINGMODE);
  material.bumpTexture.wrapU = material.bumpTexture.wrapV = Texture.WRAP_ADDRESSMODE;
  material.waterColor = Color3.FromHexString("#32ADBB");
  material.colorBlendFactor = 0.35;
  material.windDirection = new Vector2(0.3, 1);
  material.windForce = 1.2;
  material.waveHeight = 0.004;
  material.waveLength = 0.6;
  material.waveSpeed = 0.25;
  material.waveCount = 0.2;
  material.bumpHeight = 0.08;
  material.bumpSuperimpose = true;
  material.specularColor = Color3.FromHexString("#578C94");
  material.specularPower = 64;
  material.backFaceCulling = false;
  const sky = scene.getMeshByName("worldSky");
  material.reflectionTexture.renderList = sky ? [sky, banks] : [banks];
  material.refractionTexture.renderList = [banks];
  for (const target of [material.reflectionTexture, material.refractionTexture]) {
    target.refreshRate = low ? 4 : 3;
    target.renderParticles = false;
  }
  water.material = material;
  water.isPickable = false;
  water.checkCollisions = false;
  water.receiveShadows = true;
  water.metadata = { worldShadows: { cast: false, receive: true } };
  water.freezeWorldMatrix();
  return water;
};
