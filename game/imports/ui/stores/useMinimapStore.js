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

      setLocalPlayer(
        payload
      ) {
        set({
          localPlayer: {
            ...DEFAULT_LOCAL_PLAYER,
            ...payload,
          },
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
        });
      },
    })
  );