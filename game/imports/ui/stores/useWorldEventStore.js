import { create } from "zustand";
import { isInsideCamp } from "../../game/campProtection";

export const useWorldEventStore = create((set, get) => ({
  event: null,
  sync(world, sessionId) {
    const player = world?.players?.get(sessionId);
    const shared = world?.worldEvent;
    const event = shared?.status === "active" && player && !player.inDungeon
      ? { id: shared.id, name: shared.name, wave: shared.wave,
        inSafeZone: isInsideCamp(player),
        totalWaves: shared.totalWaves, enemiesRemaining: shared.enemiesRemaining, nextWaveIn: shared.nextWaveIn }
      : null;
    const previous = get().event;
    if (previous?.id === event?.id && previous?.name === event?.name && previous?.wave === event?.wave &&
        previous?.totalWaves === event?.totalWaves && previous?.enemiesRemaining === event?.enemiesRemaining &&
        previous?.nextWaveIn === event?.nextWaveIn && previous?.inSafeZone === event?.inSafeZone) return;
    set({ event });
  },
  reset: () => set({ event: null }),
}));
