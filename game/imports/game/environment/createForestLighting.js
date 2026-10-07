import { Color3, ShadowGenerator, Vector3 } from "@babylonjs/core";
import { getHighlandMix, getSnowMix } from "../worldConfig";

// One local sun map follows the player; grass and other small decorations do
// not enter the caster list. Instances keep their shared source materials.
export const createForestLighting = (scene, ambient, sun, player, quality) => {
  const palette = [
    [scene.fogColor.clone(), Color3.FromHexString("#DDE7D6"), (color) => {
      scene.fogColor = color;
      scene.clearColor.set(color.r, color.g, color.b, 1);
    }],
    [ambient.diffuse.clone(), Color3.FromHexString("#E7EDDA"), (color) => { ambient.diffuse = color; }],
    [ambient.groundColor.clone(), Color3.FromHexString("#899474"), (color) => { ambient.groundColor = color; }],
    [sun.diffuse.clone(), Color3.FromHexString("#FFF0CD"), (color) => { sun.diffuse = color; }],
  ];
  const low = quality.density < 1;
  const radius = low ? 34 : 48;
  const mapSize = low ? 1024 : 2048;
  const frustumSize = low ? 88 : 112;
  const texelSize = frustumSize / mapSize;
  const shadows = new ShadowGenerator(mapSize, sun);
  shadows.usePercentageCloserFiltering = true;
  shadows.filteringQuality = low ? ShadowGenerator.QUALITY_LOW : ShadowGenerator.QUALITY_MEDIUM;
  shadows.bias = 0.0003;
  shadows.normalBias = 0.03;
  shadows.setDarkness(0.22);
  shadows.frustumEdgeFalloff = 0.04;
  sun.shadowFrustumSize = frustumSize;
  sun.shadowMinZ = 1;
  sun.shadowMaxZ = 240;
  let elapsed = 250;
  let previousWeight = -1;

  const observer = scene.onBeforeRenderObservable.add(() => {
    const position = player.position;
    const weight = (1 - getHighlandMix(position.z)) * (1 - getSnowMix(position.x, position.z));
    // Blend back to the established world palette outside the Forest.
    if (Math.abs(weight - previousWeight) > 0.001) {
      previousWeight = weight;
      for (const [original, forest, apply] of palette) apply(Color3.Lerp(original, forest, weight));
      ambient.intensity = 0.9 - 0.25 * weight;
      sun.intensity = 0.85 + 0.1 * weight;
      sun.direction.set(-1 + 0.2 * weight, -2 + 0.4 * weight, 1);
      scene.fogStart = 80 + 20 * weight;
      scene.fogEnd = 220 + 25 * weight;
    }
    sun.shadowEnabled = weight > 0.5;
    if (!sun.shadowEnabled) return;
    const direction = sun.direction.normalizeToNew();
    const right = Vector3.Cross(Vector3.Up(), direction).normalize();
    const up = Vector3.Cross(direction, right).normalize();
    sun.position.copyFrom(position).subtractInPlace(direction.scale(100));
    // Keep the projection on a world-space texel grid instead of allowing
    // sub-texel movement to make stationary silhouettes shimmer.
    for (const axis of [right, up]) {
      const projected = Vector3.Dot(position, axis);
      const offset = Math.round(projected / texelSize) * texelSize - projected;
      sun.position.addInPlace(axis.scale(offset));
    }
    elapsed += scene.getEngine().getDeltaTime();
    if (elapsed < 250) return;
    elapsed = 0;

    const casters = [];
    for (const mesh of scene.meshes) {
      if (!mesh.isEnabled() || !mesh.isVisible || mesh.visibility <= 0 ||
        !(mesh.getTotalVertices() || mesh.sourceMesh?.getTotalVertices())) continue;
      let caster = false;
      for (let node = mesh; node; node = node.parent) {
        if (node.metadata?.forestShadowCaster || node.name.startsWith("enemy-model-") || node.name === "characterRoot") {
          caster = true;
          break;
        }
      }
      if (!caster) continue;
      const location = mesh.getAbsolutePosition();
      if (Math.hypot(location.x - position.x, location.z - position.z) > radius) continue;
      (mesh.sourceMesh || mesh).receiveShadows = true;
      // Babylon accepts instances in the render list; receiver flags belong
      // on the source mesh, never on the instance.
      casters.push(mesh);
    }
    shadows.getShadowMap().renderList = casters;
  });
  scene.onDisposeObservable.addOnce(() => {
    scene.onBeforeRenderObservable.remove(observer);
    shadows.dispose();
  });
};
