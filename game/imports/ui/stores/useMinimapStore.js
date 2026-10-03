import {
  create,
} from "zustand";

const DEFAULT_LOCAL_PLAYER = {
  x: 0,
  z: 0,
  rotationY: 0,
};

export const useMinimapStore =
  create(
    (set) => ({
      localPlayer:
        DEFAULT_LOCAL_PLAYER,

      remotePlayers:
        {},

      enemies:
        {},

      customMarker: null,

      setCustomMarker: (position) => set({ customMarker: position }),
      clearCustomMarker: () => set({ customMarker: null }),

      syncEntities(world, localId) {
        set((state) => {
          const remotePlayers = {};
          const enemies = {};
          let changed = false;
          const copy = (previous, next, id, marker) => {
            const old = previous[id];
            if (old && Object.keys(marker).every((key) => old[key] === marker[key])) next[id] = old;
            else { next[id] = marker; changed = true; }
          };
          world.players.forEach((player, id) => {
            if (id === localId || player.inDungeon) return;
            copy(state.remotePlayers, remotePlayers, id, {
              id, x: player.x, z: player.z, rotationY: player.rotationY,
              name: player.name, currentLevel: player.currentLevel,
            });
          });
          world.enemies.forEach((enemy, id) => {
            copy(state.enemies, enemies, id, { id, x: enemy.x, z: enemy.z, type: enemy.type, level: enemy.level ?? 1 });
          });
          changed ||= Object.keys(remotePlayers).length !== Object.keys(state.remotePlayers).length
            || Object.keys(enemies).length !== Object.keys(state.enemies).length;
          return changed ? { remotePlayers, enemies } : state;
        });
      },

      setLocalPlayer(
        payload
      ) {
        set((state) => {
          const previous = state.localPlayer;
          if (previous.x === payload.x && previous.z === payload.z && previous.rotationY === payload.rotationY) return state;
          return { localPlayer: { ...DEFAULT_LOCAL_PLAYER, ...payload } };
        });
      },

      upsertRemotePlayer(
        id,
        payload
      ) {
        set(
          (state) => ({
            remotePlayers: {
              ...state.remotePlayers,

              [id]: {
                id,
                ...state.remotePlayers[
                  id
                ],
                ...payload,
              },
            },
          })
        );
      },

      removeRemotePlayer(
        id
      ) {
        set(
          (state) => {
            const next =
              {
                ...state.remotePlayers,
              };

            delete next[id];

            return {
              remotePlayers:
                next,
            };
          }
        );
      },

      upsertEnemy(
        id,
        payload
      ) {
        set(
          (state) => ({
            enemies: {
              ...state.enemies,

              [id]: {
                id,
                ...state.enemies[
                  id
                ],
                ...payload,
              },
            },
          })
        );
      },

      removeEnemy(
        id
      ) {
        set(
          (state) => {
            const next =
              {
                ...state.enemies,
              };

            delete next[id];

            return {
              enemies:
                next,
            };
          }
        );
      },

      reset() {
        set({
          localPlayer:
            DEFAULT_LOCAL_PLAYER,

          remotePlayers:
            {},

          enemies:
            {},

          customMarker: null,
        });
      },
    })
  );
