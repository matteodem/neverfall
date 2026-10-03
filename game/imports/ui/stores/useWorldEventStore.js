import { create } from "zustand";
import { isInsideCamp } from "../../game/campProtection";
import { WORLD_EVENT_INTERACTION_RADIUS } from "../../game/worldEvents";

export const useWorldEventStore = create((set, get) => ({
  event: null,
  sync(world, sessionId) {
    const player = world?.players?.get(sessionId);
    const shared = world?.worldEvent;
    const event = shared?.status === "active" && player && !player.inDungeon
      ? { id: shared.id, name: shared.name, wave: shared.wave,
        inSafeZone: isInsideCamp(player),
        totalWaves: shared.totalWaves, enemiesRemaining: shared.enemiesRemaining, nextWaveIn: shared.nextWaveIn,
        phase: shared.phase, totalPhases: shared.totalPhases, phaseName: shared.phaseName,
        objective: shared.objective, objectiveProgress: shared.objectiveProgress,
        objectiveTarget: shared.objectiveTarget, objectiveX: shared.objectiveX, objectiveZ: shared.objectiveZ,
        interaction: shared.interaction,
        nearObjective: Boolean(shared.interaction) &&
          Math.hypot(player.x - shared.objectiveX, player.z - shared.objectiveZ) <= WORLD_EVENT_INTERACTION_RADIUS }
      : null;
    const previous = get().event;
    if (event ? previous && Object.keys(event).every((key) => previous[key] === event[key]) : !previous) return;
    set({ event });
  },
  reset: () => set({ event: null }),
}));
