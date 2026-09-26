import { create } from "zustand";
import { getEnemyStats } from "../../game/enemyConfig";

export const useTargetStore = create((set, get) => ({
  selectedId: null,
  target: null,
  select(id, world) {
    set({ selectedId: id, target: null });
    get().sync(world);
  },
  sync(world) {
    const { selectedId, target } = get();
    if (!selectedId) return;
    const enemy = world?.enemies?.get(selectedId);
    if (!enemy || enemy.health <= 0) {
      get().clear();
      return;
    }
    const stats = getEnemyStats(enemy.type, enemy.level, enemy.rare);
    if (stats.bossMechanics) {
      if (target) set({ target: null });
      return;
    }
    if (target?.id === selectedId && target.health === enemy.health && target.maxHealth === enemy.maxHealth && target.name === stats.name) return;
    set({ target: { id: selectedId, name: stats.name, health: enemy.health, maxHealth: enemy.maxHealth } });
  },
  clear: () => set({ selectedId: null, target: null }),
}));
