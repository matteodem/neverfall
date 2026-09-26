import { create } from "zustand";
import { ENEMY_TYPES } from "../../game/enemyConfig";

const ENCOUNTER_DISTANCE = 40;

export const useBossHealthStore = create((set, get) => ({
  boss: null,
  sync(world, sessionId, position) {
    const local = world?.players?.get(sessionId);
    let boss = null;
    let closest = ENCOUNTER_DISTANCE;
    if (local && local.health > 0 && !local.inDungeon) {
      for (const [id, enemy] of world.enemies) {
        const definition = ENEMY_TYPES[enemy.type];
        if (!definition?.bossMechanics || !enemy.bossActive || enemy.health <= 0) continue;
        const distance = Math.hypot(position.x - enemy.x, position.z - enemy.z);
        if (distance > closest) continue;
        closest = distance;
        boss = { id, name: definition.name, health: enemy.health, maxHealth: enemy.maxHealth };
      }
    }
    const previous = get().boss;
    if (previous?.id === boss?.id && previous?.health === boss?.health && previous?.maxHealth === boss?.maxHealth) return;
    set({ boss });
  },
  reset: () => set({ boss: null }),
}));
