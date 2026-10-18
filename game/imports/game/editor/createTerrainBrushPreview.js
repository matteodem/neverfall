import { Color3, DynamicTexture, MeshBuilder, StandardMaterial, VertexBuffer } from "@babylonjs/core";
import { TERRAIN_PAINT_COLORS } from "../../api/terrainPaint/config";
import { terrainBrushIntensity } from "./terrainBrushFalloff";

export const createTerrainBrushPreview = ({ scene, terrain, getBrush, canPaint }) => {
  let mesh = null, material = null, texture = null, template = null, point = null, settings = "";
  const show = (nextPoint) => {
    point = nextPoint;
    if (!point || !canPaint()) { mesh?.setEnabled(false); return; }
    const { color, radius, gradient } = getBrush();
    const key = `${color}:${radius}:${gradient}`;
    if (!mesh) {
      mesh = MeshBuilder.CreateGround("terrain-brush-preview", { width: 2, height: 2, subdivisions: 8, updatable: true }, scene);
      mesh.isPickable = false;
      mesh.checkCollisions = false;
      mesh.metadata = { worldShadows: { cast: false, receive: false } };
      template = new Float32Array(mesh.getVerticesData(VertexBuffer.PositionKind));
      material = new StandardMaterial("terrain-brush-preview", scene);
      material.disableLighting = true;
      material.specularColor = Color3.Black();
      material.useAlphaFromDiffuseTexture = true;
      material.disableDepthWrite = true;
      material.backFaceCulling = false;
      material.alpha = 0.35;
      texture = new DynamicTexture("terrain-brush-preview", 128, scene, false);
      texture.hasAlpha = true;
      material.diffuseTexture = texture;
      mesh.material = material;
    }
    if (key !== settings) {
      const preset = TERRAIN_PAINT_COLORS[color];
      material.diffuseColor = preset.rgb ? Color3.FromArray(preset.rgb) : Color3.FromHexString(preset.hex);
      const context = texture.getContext();
      context.clearRect(0, 0, 128, 128);
      const fade = context.createRadialGradient(64, 64, 0, 64, 64, 64);
      for (let step = 0; step <= 32; step++) {
        const t = step / 32;
        fade.addColorStop(t, `rgba(255,255,255,${terrainBrushIntensity(t, gradient)})`);
      }
      context.fillStyle = fade;
      context.beginPath();
      context.arc(64, 64, 64, 0, Math.PI * 2);
      context.fill();
      texture.update();
      settings = key;
    }
    const positions = mesh.getVerticesData(VertexBuffer.PositionKind);
    for (let index = 0; index < positions.length; index += 3) {
      positions[index] = template[index] * radius;
      positions[index + 2] = template[index + 2] * radius;
      positions[index + 1] = terrain.getHeightAtCoordinates(point.x + positions[index], point.z + positions[index + 2]) + 0.06;
    }
    mesh.position.set(point.x, 0, point.z);
    mesh.updateVerticesData(VertexBuffer.PositionKind, positions, true);
    mesh.setEnabled(true);
  };
  const observer = scene.onBeforeRenderObservable.add(() => {
    if (!canPaint()) { mesh?.setEnabled(false); return; }
    const { color, radius, gradient } = getBrush();
    if (point && `${color}:${radius}:${gradient}` !== settings) show(point);
  });
  return {
    show,
    hide: () => { point = null; mesh?.setEnabled(false); },
    dispose() {
      scene.onBeforeRenderObservable.remove(observer);
      mesh?.dispose(); material?.dispose(); texture?.dispose();
    },
  };
};
