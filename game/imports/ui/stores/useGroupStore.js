import { create } from "zustand";

export const useGroupStore = create((set, get) => ({
  groupId: "",
  members: [],
  error: null,
  actionHandler: null,

  setActionHandler: (actionHandler) => set({ actionHandler }),
  requestAction(action, sessionId) {
    set({ error: null });
    get().actionHandler?.(action, sessionId);
  },
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  sync(world, localId) {
    if (!world?.players) return;
    const groupId = world.players.get(localId)?.groupId || "";
    const previous = get();
    const members = [];
    let changed = groupId !== previous.groupId;
    if (groupId) {
      for (const [sessionId, player] of world.players) {
        if (sessionId === localId || player.groupId !== groupId) continue;
        const old = previous.members[members.length];
        if (old?.sessionId === sessionId && old.name === player.name
          && old.health === player.health && old.maxHealth === player.maxHealth
          && old.level === player.currentLevel) {
          members.push(old);
        } else {
          changed = true;
          members.push({ sessionId, name: player.name, health: player.health, maxHealth: player.maxHealth, level: player.currentLevel });
        }
      }
    }
    if (changed || members.length !== previous.members.length) set({
      groupId, members,
      error: groupId !== previous.groupId ? null : previous.error,
    });
  },

  reset: () => set({ groupId: "", members: [], error: null, actionHandler: null }),
}));
