import { Color3, MeshBuilder, StandardMaterial } from "@babylonjs/core";
import { getWorldHeight } from "./worldConfig";
import { WORLD_EVENTS } from "./worldEvents";

const denPoints = WORLD_EVENTS.find((event) => event.id === "wolf-invasion")
  .phases.find((phase) => phase.interaction === "den").points;

export const createWorldEventVisuals = (scene, forestProps) => {
  const marker = MeshBuilder.CreateCylinder("world-event-objective", {
    diameter: 2, height: 0.35, tessellation: 8,
  }, scene);
  const sealMaterial = new StandardMaterial("ancient-seal-objective", scene);
  sealMaterial.diffuseColor = new Color3(0.25, 0.7, 0.9);
  sealMaterial.emissiveColor = new Color3(0.08, 0.35, 0.55);
  marker.isPickable = false;
  marker.checkCollisions = false;
  marker.setEnabled(false);
  let dens = [];
  let denLoading = null;
  let disposed = false;

  const loadDens = () => {
    if (denLoading || !forestProps) return;
    denLoading = forestProps.preloadWolfsDen().then(() => {
      if (disposed) return;
      dens = denPoints.map((point) => ({ point, root: forestProps.createWolfsDen(point) }))
        .filter(({ root }) => root);
      for (const den of dens) den.root.setEnabled(false);
    }).catch((error) => console.warn("[World Event] Could not load Wolf Den", error));
  };

  return {
    update(state, playerPosition) {
      const event = state?.worldEvent;
      const visible = event?.status === "active" && Boolean(event.interaction) &&
        Math.hypot(playerPosition.x - event.objectiveX, playerPosition.z - event.objectiveZ) <= 120;
      const activeDen = visible && event.interaction === "den";
      if (activeDen) loadDens();
      for (const den of dens) den.root.setEnabled(Boolean(activeDen &&
        den.point.x === event.objectiveX && den.point.z === event.objectiveZ));
      marker.setEnabled(Boolean(visible && !activeDen));
      if (!visible || activeDen) return;
      marker.position.set(event.objectiveX,
        getWorldHeight(event.objectiveX, event.objectiveZ) + 0.175, event.objectiveZ);
      marker.material = sealMaterial;
    },
    destroy() {
      disposed = true;
      for (const den of dens) den.root.dispose();
      marker.dispose();
      sealMaterial.dispose();
    },
  };
};
