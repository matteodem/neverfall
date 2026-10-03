import { Color3, MeshBuilder, StandardMaterial } from "@babylonjs/core";
import { getWorldHeight } from "./worldConfig";

export const createWorldEventVisuals = (scene) => {
  const marker = MeshBuilder.CreateCylinder("world-event-objective", {
    diameter: 2, height: 0.35, tessellation: 8,
  }, scene);
  const denMaterial = new StandardMaterial("wolf-den-objective", scene);
  denMaterial.diffuseColor = new Color3(0.65, 0.25, 0.08);
  denMaterial.emissiveColor = new Color3(0.35, 0.1, 0.02);
  const sealMaterial = new StandardMaterial("ancient-seal-objective", scene);
  sealMaterial.diffuseColor = new Color3(0.25, 0.7, 0.9);
  sealMaterial.emissiveColor = new Color3(0.08, 0.35, 0.55);
  marker.isPickable = false;
  marker.checkCollisions = false;
  marker.setEnabled(false);

  return {
    update(state, playerPosition) {
      const event = state?.worldEvent;
      const visible = event?.status === "active" && Boolean(event.interaction) &&
        Math.hypot(playerPosition.x - event.objectiveX, playerPosition.z - event.objectiveZ) <= 120;
      marker.setEnabled(visible);
      if (!visible) return;
      marker.position.set(event.objectiveX,
        getWorldHeight(event.objectiveX, event.objectiveZ) + 0.175, event.objectiveZ);
      marker.material = event.interaction === "seal" ? sealMaterial : denMaterial;
    },
    destroy() {
      marker.dispose();
      denMaterial.dispose();
      sealMaterial.dispose();
    },
  };
};
