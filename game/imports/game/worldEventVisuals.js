import { WORLD_EVENTS } from "./worldEvents";

const denPoints = WORLD_EVENTS.find((event) => event.id === "wolf-invasion")
  .phases.find((phase) => phase.interaction === "den").points;
const frozenSealPoints = WORLD_EVENTS.find((event) => event.id === "frozen-rift")
  .phases.find((phase) => phase.interaction === "seal").points;

export const createWorldEventVisuals = (scene, forestProps) => {
  let frozenSeals = [];
  let sealLoading = null;
  let dens = [];
  let denLoading = null;
  let disposed = false;

  const loadSeals = () => {
    if (sealLoading || !forestProps) return;
    sealLoading = forestProps.preloadFrozenSeal().then(() => {
      if (disposed) return;
      frozenSeals = frozenSealPoints.map((point, index) => ({ point, index, visual: forestProps.createFrozenSeal(point) }))
        .filter(({ visual }) => visual);
      for (const { visual } of frozenSeals) visual.root.setEnabled(false);
    }).catch((error) => console.warn("[World Event] Could not load Frozen Rift Seal", error));
  };

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
      if (frozenSealPoints.some((point) =>
        Math.hypot(playerPosition.x - point.x, playerPosition.z - point.z) <= 120)) loadSeals();
      const event = state?.worldEvent;
      const visible = event?.status === "active" && Boolean(event.interaction) &&
        Math.hypot(playerPosition.x - event.objectiveX, playerPosition.z - event.objectiveZ) <= 120;
      const activeDen = visible && event.interaction === "den";
      if (activeDen) loadDens();
      for (const den of dens) den.root.setEnabled(Boolean(activeDen &&
        den.point.x === event.objectiveX && den.point.z === event.objectiveZ));
      for (const { point, index, visual } of frozenSeals) {
        visual.root.setEnabled(Math.hypot(playerPosition.x - point.x, playerPosition.z - point.z) <= 120);
        visual.setHighlighted(Boolean(visible && event.id === "frozen-rift" && event.interaction === "seal" &&
          point.x === event.objectiveX && point.z === event.objectiveZ),
        Boolean(event?.status === "active" && event.id === "frozen-rift" && index < event.activatedSeals));
      }
    },
    destroy() {
      disposed = true;
      for (const den of dens) den.root.dispose();
      for (const { visual } of frozenSeals) visual.dispose();
    },
  };
};
