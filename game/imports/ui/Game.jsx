import { useDungeonStore } from "./stores/useDungeonStore";
import { getClassConfig } from "../game/classConfig";
import { createPlayerSelection } from "../game/playerSelection";
import { PlayerDropdown } from "./components/PlayerDropdown";
import { Meteor } from "meteor/meteor";
import { ENTITY_VISIBILITY } from "../game/entityVisibility";
import { createPerformanceOverlay } from "../game/performanceOverlay";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import {
  Engine,
  Scene,
} from "@babylonjs/core";

import {
  useActionBarStore,
} from "./stores/useActionBarStore";

import { useEquipmentStore } from "./stores/useEquipmentStore";

import {
  createMultiplayer,
} from "../game/multiplayer";

import {
  createWorld,
} from "../game/createWorld";

import {
  createInput,
} from "../game/input";

import {
  rotateCamera,
  zoomCamera,
} from "../game/camera";

import {
  isMoving,
  updateMovement,
  updateCameraFacing,
  createJumpController,
} from "../game/movement";

import {
  createCombat,
} from "../game/combat";

import {
  createHorseMount,
} from "../game/mounts";

import {
  createLoadingScreen,
} from "../game/loadingScreen";

import {
  useLoadingStore,
} from "./stores/useLoadingStore";

import {
  useQuestStore,
} from "./stores/useQuestStore";

import {
  useMinimapStore,
} from "./stores/useMinimapStore";

import {
  useHudStore,
} from "./stores/useHudStore";

import {
  playGameSound,
  preloadSounds,
} from "../game/sound";


export const Game = ({
  character,

  setPlayerHealth,
  setHealCooldownUntil,
  setMountedState,
}) => {
  const location = useDungeonStore((state) => state.location);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const closePlayerDropdown = useCallback(() => setSelectedPlayer(null), []);

  const canvasRef =
    useRef(
      null
    );


  const setSkillHandler =
    useActionBarStore(
      (state) =>
        state.setSkillHandler
    );


  const setBoarKills =
    useQuestStore(
      (
        state
      ) =>
        state.setBoarKills
    );


  const setLocalPlayerOnMinimap =
    useMinimapStore(
      (state) =>
        state.setLocalPlayer
    );


  const resetMinimap =
    useMinimapStore(
      (state) =>
        state.reset
    );


  useEffect(
    () => {
      setSelectedPlayer(null);
      let engine =
        null;

      let scene =
        null;

      let input =
        null;

      let animations =
        null;

      let jump = null;

      let combat =
        null;

      let multiplayer =
        null;

      let mount =
        null;

      let mounted =
        false;

      let playerAlive =
        true;

      let disposed =
        false;


      const init =
        async () => {
          const canvas =
            canvasRef.current;


          if (
            !canvas
          ) {
            return;
          }


          /*
           * =====================================================
           * ENGINE
           * =====================================================
           */

          engine =
            new Engine(
              canvas,
              true
            );


          engine.loadingScreen =
            createLoadingScreen();


          engine.displayLoadingUI();


          requestAnimationFrame(
            () => {
              useLoadingStore
                .getState()
                .setProgress(
                  15
                );
            }
          );


          /*
           * =====================================================
           * SCENE
           * =====================================================
           */

          scene =
            new Scene(
              engine
            );


          preloadSounds();


          /*
           * =====================================================
           * WORLD
           * =====================================================
           */

          const world =
            await createWorld(
              scene,
              {
                appearance:
                  character.appearance,

                name:
                  character.name,
                gameClass: character.gameClass,
                dungeon: location === "dungeon",
              }
            );


          if (
            disposed
          ) {
            return;
          }

          const {
            player,

            character:
              playerCharacter,

            swordPivot,
            swordTip,

            camera,
          } =
            world;


          animations =
            world.animations;


          /*
           * =====================================================
           * MOUNT
           * =====================================================
           */

          mount =
            await createHorseMount({
              scene,

              parent:
                player,

              character:
                playerCharacter,
            });


          if (
            disposed
          ) {
            mount.destroy();

            return;
          }

          const setMounted =
            (
              value
            ) => {
              mounted =
                Boolean(
                  value &&
                  playerAlive && location !== "dungeon"
                );


              mount.setMounted(
                mounted
              );


              /*
               * Prevent the Knight from playing
               * run/jump animations while mounted.
               */
              animations.setMounted(
                mounted
              );


              setMountedState(
                mounted
              );
            };


          useLoadingStore
            .getState()
            .setProgress(
              55
            );


          /*
           * =====================================================
           * MULTIPLAYER
           * =====================================================
           */

          multiplayer =
            await createMultiplayer({
              scene,

              player,
              dungeonVisuals: world.dungeonVisuals,
              onLocalRespawn: () => jump?.reset(),

              onLocalHealthChange:
                (
                  health
                ) => {
                  setPlayerHealth(
                    health
                  );


                  playerAlive =
                    health.health >
                    0;


                  if (
                    !playerAlive &&
                    mounted
                  ) {
                    setMounted(
                      false
                    );
                  }
                },

              onBoarQuestChange:
                setBoarKills,

              onHealCooldown:
                (
                  duration
                ) => {
                  setHealCooldownUntil(
                    Date.now() +
                      duration
                  );
                },
            });


          if (
            disposed
          ) {
            multiplayer
              ?.destroy({ keepConnection: useDungeonStore.getState().location !== location });

            return;
          }

          useEquipmentStore.getState().setChangeHandler((action, payload) => {
            if (action === "equip") {
              multiplayer.equipItem(payload.itemId, payload.slot);
            } else if (action === "unequip") {
              multiplayer.unequipItem(payload);
            }
          });


          useLoadingStore
            .getState()
            .setProgress(
              85
            );


          /*
           * =====================================================
           * MOVEMENT / JUMP
           * =====================================================
           */

          jump =
            createJumpController(
              player
            );


          /*
           * =====================================================
           * INPUT
           * =====================================================
           */

          input =
            createInput(
              canvas
            );


          /*
           * =====================================================
           * COMBAT
           * =====================================================
           */

          combat =
            createCombat({
              scene,

              swordPivot,

              swordTip,
            });


          /*
           * =====================================================
           * SKILLS
           * =====================================================
           *
           * Keyboard and HUD buttons both
           * use this exact same dispatcher.
           */

          const performAttack = (code) => {
            const skill = getClassConfig(character.gameClass).skills[code];
            const actionBar = useActionBarStore.getState();
            if (!skill || !playerAlive || Date.now() < (actionBar.cooldownUntil[code] || 0)) return;
            if (skill.projectile || skill.effect) {
              actionBar.setCooldown(code, skill.cooldown);
              multiplayer?.sendMovement(player, 0, mounted, true);
              multiplayer?.sendAttack(code);
              return;
            }
            if (!combat?.startAttack()) return;
            if (code !== "Digit1") actionBar.setCooldown(code, skill.cooldown);
            playGameSound("attack");
            multiplayer?.sendAttack(code);
          };

          const SKILL_HANDLERS = {
            Space: () => { if (playerAlive) jump.jump(); },
            KeyF: () => { if (!multiplayer?.interactDungeon()) multiplayer?.collectLoot(); },
            KeyV() {
              if (
                playerAlive
              ) {
                setMounted(
                  !mounted
                );
              }
            },


            Digit1: () => performAttack("Digit1"),
            Digit2: () => performAttack("Digit2"),
            Digit3: () => performAttack("Digit3"),


            Digit4() {
              multiplayer
                ?.sendHeal();
            },
          };


          const executeSkill =
            (
              code
            ) => {
              if (
                mounted &&
                /^Digit[1-4]$/.test(code)
              ) {
                setMounted(false);
                multiplayer?.sendMovement(player, 0, false, true);
              }

              SKILL_HANDLERS[
                code
              ]?.();
            };


          /*
           * Make skills available to
           * the React HUD via Zustand.
           */

          setSkillHandler(
            executeSkill
          );


          /*
           * =====================================================
           * CAMERA ROTATION
           * =====================================================
           */

          createPlayerSelection({ canvas, scene, input, multiplayer, onSelect: setSelectedPlayer });

          let previousTouch = null;
          input.on(canvas, "pointerdown", (event) => {
            if (event.pointerType === "touch") previousTouch = { id: event.pointerId, x: event.clientX, y: event.clientY };
          });
          const clearTouch = () => { previousTouch = null; };
          input.on(canvas, "pointerup", clearTouch);
          input.on(canvas, "pointercancel", clearTouch);
          const handlePointerMove =
            (
              event
            ) => {
              if (
                !input.state
                  .leftMouseDown &&
                !input.state
                  .rightMouseDown
              ) {
                return;
              }


              let dx = event.movementX;
              let dy = event.movementY;
              if (event.pointerType === "touch") {
                if (!previousTouch || previousTouch.id !== event.pointerId) return;
                dx = event.clientX - previousTouch.x;
                dy = event.clientY - previousTouch.y;
                previousTouch = { id: event.pointerId, x: event.clientX, y: event.clientY };
                if (canvas.closest(".mobile-portrait")) [dx, dy] = [dy, -dx];
              }
              rotateCamera(camera, dx, dy);
            };


          input.on(
            canvas,

            "pointermove",

            handlePointerMove
          );


          /*
           * =====================================================
           * CAMERA ZOOM
           * =====================================================
           */

          const handleWheel =
            (
              event
            ) => {
              event.preventDefault();


              zoomCamera(
                camera,

                event.deltaY
              );
            };


          input.on(
            canvas,

            "wheel",

            handleWheel,

            {
              passive:
                false,
            }
          );


          /*
           * =====================================================
           * KEYBOARD
           * =====================================================
           */

          const handleKeyDown =
            (
              event
            ) => {
              if (
                event.repeat
              ) {
                return;
              }


              if (
                event.code ===
                "KeyF"
              ) {
                if (
                  event.target?.closest?.(
                    "input, textarea, select, [contenteditable='true']"
                  )
                ) {
                  return;
                }


                event.preventDefault();


                if (!multiplayer?.interactDungeon()) multiplayer?.collectLoot();


                return;
              }


              if (
                event.code ===
                "KeyV"
              ) {
                if (
                  event.target?.closest?.(
                    "input, textarea, select, [contenteditable='true']"
                  )
                ) {
                  return;
                }


                event.preventDefault();


                useActionBarStore
                  .getState()
                  .triggerSkill(
                    "KeyV"
                  );


                return;
              }


              if (
                event.code ===
                "KeyI" || event.code === "KeyG" || event.code === "KeyZ" || event.code === "KeyM"
              ) {
                if (
                  event.target?.closest?.(
                    "input, textarea, select, [contenteditable='true']"
                  )
                ) {
                  return;
                }


                event.preventDefault();


                const hudStore =
                  useHudStore
                    .getState();

                const modal = event.code === "KeyM" ? "map" : event.code === "KeyZ" ? "achievements" : event.code === "KeyG" ? "gear" : "inventory";


                if (hudStore.openModals.includes(modal)) {
                  hudStore
                    .closeModal(modal);

                  return;
                }


                hudStore
                  .openModal(
                    modal
                  );


                return;
              }


              /*
               * Jump remains a movement
               * action rather than an
               * Action Bar skill.
               */

              if (
                event.code ===
                "Space"
              ) {
                event.preventDefault();


                jump.jump();


                return;
              }


              /*
               * All Digit skills use
               * Zustand's dispatcher.
               *
               * This means keyboard and
               * HUD clicks behave exactly
               * the same.
               */

              if (
                event.code
                  .startsWith(
                    "Digit"
                  )
              ) {
                useActionBarStore
                  .getState()
                  .triggerSkill(
                    event.code
                  );
              }
            };


          input.on(
            window,

            "keydown",

            handleKeyDown
          );


          /*
           * =====================================================
           * RESIZE
           * =====================================================
           */

          const handleResize =
            () => {
              requestAnimationFrame(() => engine?.resize());
            };


          input.on(
            window,

            "resize",

            handleResize
          );


          /*
           * =====================================================
           * LOADING COMPLETE
           * =====================================================
           */

          useLoadingStore
            .getState()
            .setProgress(
              100
            );


          useLoadingStore
            .getState()
            .hide();


          engine.hideLoadingUI();


          /*
           * =====================================================
           * GAME LOOP
           * =====================================================
           */

          let minimapElapsed = 0;
          const performanceOverlay = Meteor.isDevelopment
            ? createPerformanceOverlay({ scene, engine, multiplayer }) : null;
          scene.onDisposeObservable.addOnce(() => performanceOverlay?.destroy());

          engine.runRenderLoop(
            () => {
              const deltaTime =
                engine
                  .getDeltaTime();


              /*
               * ---------------------
               * LOCAL MOVEMENT
               * ---------------------
               */

              const movement =
                updateMovement({
                  deltaTime,

                  input:
                    input.state,

                  camera,

                  player,

                  speedMultiplier:
                    (mounted ? 2 : 1) * (multiplayer?.getMovementSpeedMultiplier() ?? 1),
                });


              mount
                ?.setFacing(
                  movement
                );


              updateCameraFacing({
                input:
                  input.state,

                camera,

                player,
              });


              /*
               * ---------------------
               * JUMP
               * ---------------------
               */

              jump.update(
                deltaTime
              );


              /*
               * ---------------------
               * CHARACTER ANIMATIONS
               * ---------------------
               *
               * The animation controller itself
               * ignores run/jump while mounted.
               */

              if (
                jump.isJumping()
              ) {
                animations
                  .setJumping(
                    true
                  );
              } else {
                animations
                  .setJumping(
                    false
                  );


                animations
                  .setRunning(
                    isMoving(
                      input.state
                    )
                  );
              }


              animations.update(
                deltaTime
              );


              /*
               * ---------------------
               * MOUNT ANIMATIONS
               * ---------------------
               */

              mount
                ?.setRunning(
                  mounted &&
                  isMoving(
                    input.state
                  )
                );


              /*
               * ---------------------
               * COMBAT
               * ---------------------
               */

              combat.update(
                deltaTime
              );


              /*
               * ---------------------
               * MULTIPLAYER
               * ---------------------
               */

              multiplayer
                ?.sendMovement(
                  player,

                  deltaTime,

                  mounted
                );


              multiplayer
                ?.update(
                  deltaTime
                );


              /*
               * ---------------------
               * MINIMAP
               * ---------------------
               */

              minimapElapsed += deltaTime;
              if (minimapElapsed >= ENTITY_VISIBILITY.localMinimapInterval) {
                minimapElapsed %= ENTITY_VISIBILITY.localMinimapInterval;
                setLocalPlayerOnMinimap({
                  x: player.position.x,
                  z: player.position.z,
                  rotationY: player.rotation.y,
                });
              }

              /*
               * ---------------------
               * RENDER
               * ---------------------
               */

              performanceOverlay?.update(deltaTime);
              scene.render();
            }
          );
        };


      init().catch(
        (
          error
        ) => {
          console.error(
            "[Game] Failed to initialize:",
            error
          );


          const worldIsFull =
            error?.worldIsFull ||
            /full|max clients|maximum clients/i.test(
              error?.message ||
                ""
            );


          useLoadingStore
            .getState()
            .setError(
              worldIsFull
                ? "The world is full right now. Please try again soon."
                : "We couldn’t connect to the world. Check your connection and try again."
            );


          engine
            ?.hideLoadingUI();
        }
      );


      /*
       * =====================================================
       * CLEANUP
       * =====================================================
       */

      return () => {
        disposed =
          true;


        /*
         * Disable HUD skill buttons
         * before destroying the game.
         */

        setSkillHandler(
          null
        );

        useEquipmentStore.getState().setChangeHandler(null);


        setMountedState(
          false
        );


        mount
          ?.destroy();


        resetMinimap();


        multiplayer
          ?.destroy({ keepConnection: useDungeonStore.getState().location !== location });


        combat
          ?.destroy();


        animations
          ?.destroy();


        input
          ?.destroy();


        engine
          ?.stopRenderLoop();


        scene
          ?.dispose();


        engine
          ?.dispose();
      };
    },
    [location]
  );


  return (
    <>
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none"
      />
      {selectedPlayer && (
        <PlayerDropdown selection={selectedPlayer} onClose={closePlayerDropdown} />
      )}
    </>
  );
};
