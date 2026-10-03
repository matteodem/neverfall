import { create } from "zustand";
import { getEnemyStats } from "../../game/enemyConfig";
import { MOBILE_TARGETING } from "../../game/config";

export const useTargetStore = create((set, get) => ({
  selectedId: null,
  target: null,
  attackedEnemy: null,
  autoLocked: false,
  lockedAt: 0,
  lockRange: MOBILE_TARGETING.retainRange,
  select(id, world) {
    set({ selectedId: id, target: null, autoLocked: false, lockedAt: 0, lockRange: MOBILE_TARGETING.retainRange });
    get().sync(world);
  },
  lock(id, world, range = MOBILE_TARGETING.retainRange) {
    set({ selectedId: id, target: null, autoLocked: true, lockedAt: Date.now(), lockRange: range });
    get().sync(world);
  },
  recordAttack(id, level) {
    set({ attackedEnemy: { id, level } });
  },
  sync(world, player) {
    const { selectedId, target, autoLocked, lockedAt, lockRange } = get();
    if (!selectedId) return;
    const enemy = world?.enemies?.get(selectedId);
    if (!enemy || enemy.health <= 0) {
      get().clear();
      return;
    }
    if (autoLocked && player && (player.health <= 0 ||
      Math.hypot(enemy.x - player.x, enemy.z - player.z) > lockRange ||
      (!player.inCombat && Date.now() - lockedAt > 1000))) {
      get().clear();
      return;
    }
    const stats = getEnemyStats(enemy.type, enemy.level, enemy.rare);
    const level = enemy.level || 1;
    const isBoss = Boolean(stats.bossMechanics);
    if (target?.id === selectedId && target.health === enemy.health && target.maxHealth === enemy.maxHealth &&
      target.name === stats.name && target.level === level && target.isBoss === isBoss) return;
    set({ target: { id: selectedId, name: stats.name, level, health: enemy.health, maxHealth: enemy.maxHealth, isBoss } });
  },
  clear: () => set({ selectedId: null, target: null, autoLocked: false, lockedAt: 0, lockRange: MOBILE_TARGETING.retainRange }),
}));
