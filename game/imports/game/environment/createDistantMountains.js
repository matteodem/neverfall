import { Color3, Mesh, MeshBuilder, StandardMaterial, VertexBuffer } from "@babylonjs/core";

// Fixed background geometry, outside the square playable world even at corners.
// Each low-poly ridge is one mesh: two background draw calls on desktop/mobile.
export const createDistantMountains = (scene, settings, fogColor) => {
  if (!settings.enabled) return;
  const horizon = Color3.FromHexString(fogColor);
  settings.layers.forEach((layer, layerIndex) => {
    const ridgeColor = Color3.FromHexString(layer.color);
    const material = new StandardMaterial(`distantMountainMaterial-${layerIndex}`, scene);
    material.disableLighting = true;
    material.diffuseColor = Color3.Black();
    material.specularColor = Color3.Black();
    material.emissiveColor = Color3.White();
    // Colors are already hazed; scene fog would completely erase these layers.
    material.fogEnabled = false;

    const mountains = MeshBuilder.CreateCylinder(`distantMountains-${layerIndex}`, {
      diameter: layer.radius * 2, height: layer.height, tessellation: layer.segments,
      subdivisions: 4,
      cap: Mesh.NO_CAP, sideOrientation: Mesh.BACKSIDE,
    }, scene);
    // Keep the band's rows ordered beneath its irregular skyline.
    const positions = mountains.getVerticesData(VertexBuffer.PositionKind);
    const colors = new Float32Array(positions.length / 3 * 4);
    for (let vertex = 0; vertex < positions.length; vertex += 3) {
      const angle = Math.atan2(positions[vertex + 2], positions[vertex]) + layer.offset;
      const variation = 0.5 + Math.sin(angle * 5) * 0.25 +
        Math.sin(angle * 11 + layerIndex) * 0.15 + Math.sin(angle * 17) * 0.1;
      const row = (positions[vertex + 1] + layer.height / 2) / layer.height;
      positions[vertex + 1] = -layer.height / 2 + row * layer.height * (0.55 + variation * 0.45);
      // Fade the physical lower edge into the sky/fog instead of exposing a cut line.
      const worldY = positions[vertex + 1] + settings.baseY + layer.height / 2;
      const blend = Math.min(1, Math.max(0, worldY / settings.baseFadeHeight));
      const color = Color3.Lerp(horizon, ridgeColor, blend * blend * (3 - 2 * blend));
      colors.set([color.r, color.g, color.b, 1], vertex / 3 * 4);
    }
    mountains.setVerticesData(VertexBuffer.PositionKind, positions);
    mountains.setVerticesData(VertexBuffer.ColorKind, colors);
    mountains.position.y = settings.baseY + layer.height / 2;
    mountains.material = material;
    mountains.isPickable = false;
    mountains.checkCollisions = false;
    mountains.receiveShadows = false;
    mountains.metadata = { worldShadows: { cast: false, receive: false } };
    mountains.freezeWorldMatrix();
  });
};
