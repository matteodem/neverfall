import { Color3, DirectionalLight, MeshBuilder, RawTexture, Texture, Vector2, Vector3, VertexBuffer } from "@babylonjs/core";
import { WaterMaterial } from "@babylonjs/materials/water/waterMaterial";
import { STARTER_RIVER as RIVER, riverToWorld } from "./starterRiverConfig";
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
    for (const [side, sign] of [[0, -1], [1, 1]]) {
      const point = riverToWorld(section.x + sign * extent, z);
      edges[side].push(new Vector3(point.x, 0, point.z));
    }
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
    // Periodic warping breaks up straight bands while retaining seamless tiling.
    pixels.set([128 + Math.round(28 * Math.cos(a * 2 + b + 0.8 * Math.sin(b * 2 - a)) + 8 * Math.sin(a * 5 + b * 3)),
      128 + Math.round(25 * Math.sin(b * 3 - a + 1.1 * Math.sin(a * 2 + b)) + 8 * Math.cos(a * 3 - b * 4)),
      255, 255], (y * 64 + x) * 4);
  }
  material.bumpTexture = RawTexture.CreateRGBATexture(pixels, 64, 64, scene, true, false, Texture.TRILINEAR_SAMPLINGMODE);
  material.bumpTexture.wrapU = material.bumpTexture.wrapV = Texture.WRAP_ADDRESSMODE;
  material.waterColor = Color3.FromHexString("#32ADBB");
  material.fresnelSeparate = true;
  material.colorBlendFactor = 0.25;
  material.colorBlendFactor2 = 0.55;
  material.windDirection = new Vector2(0.15, 1);
  material.windForce = 0.012;
  material.waveHeight = 0.0006;
  material.waveLength = 1.2;
  material.waveSpeed = 0.18;
  material.waveCount = 0.25;
  material.bumpHeight = 0.012;
  material.bumpSuperimpose = false;
  material.bumpAffectsReflection = false;
  material.specularColor = Color3.FromHexString("#9EDDDC");
  material.specularPower = 48;
  // Keep the riverbed visible through refraction, without alpha sorting artifacts.
  material.alpha = 1;
  material.backFaceCulling = false;
  // A subtle, water-only specular fill makes moving normals readable against
  // the smooth sky gradient. No extra geometry, render pass or shadow map.
  const glints = new DirectionalLight("starter-river-glints", new Vector3(-0.2, -0.25, -1), scene);
  glints.diffuse = Color3.Black();
  glints.specular = Color3.FromHexString("#A6E5E5");
  glints.intensity = 0.16;
  glints.includedOnlyMeshes = [water];
  glints.shadowEnabled = false;
  water.onDisposeObservable.addOnce(() => glints.dispose());
  // WaterMaterial 9.27 gates its internal clock on changes in frame duration.
  // Bind seconds directly so a stable frame rate still animates at river speed.
  const startedAt = performance.now();
  material.onBindObservable.add(() => {
    material.getEffect().setFloat("time", (performance.now() - startedAt) / 1000);
    // Keep the soft glint fill readable as the player orbits the camera.
    const camera = scene.activeCamera.globalPosition;
    const center = water.getBoundingInfo().boundingSphere.centerWorld;
    glints.direction.set(camera.x - center.x, -Math.max(camera.y - water.position.y, 1),
      camera.z - center.z).normalize();
  });
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
