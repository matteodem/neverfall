import React, {
  useEffect,
  useRef,
} from "react";

import {
  Engine,
  Scene,
} from "@babylonjs/core";

import {
  useActionBarStore,
} from "./stores/useActionBarStore";

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

export const Game = ({
  character,

  setPlayerHealth,
  setHealCooldownUntil,
}) => {
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
      let engine =
        null;

      let scene =
        null;

      let input =
        null;

      let animations =
        null;

      let combat =
        null;

      let multiplayer =
        null;

      let disposed =
        false;


      const init =
        async () => {
          const canvas =
            canvasRef.current;

          if (!canvas) {
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


          /*
           * =====================================================
           * WORLD
           * =====================================================
           */

          const {
            player,

            swordPivot,
            swordTip,

            camera,

            animations,
          } =
            await createWorld(
              scene,
              {
                appearance:
                  character.appearance,

                name:
                  character.name,
              }
            );

          if (disposed) {
            return;
          }

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

              onLocalHealthChange:
                setPlayerHealth,

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

          if (disposed) {
            multiplayer?.destroy();

            return;
          }

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

          const jump =
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

          const SKILL_HANDLERS = {
            Digit1() {
              const attacked =
                combat
                  ?.startAttack();

              if (!attacked) {
                return;
              }

              multiplayer
                ?.sendAttack();
            },

            Digit4() {
              multiplayer
                ?.sendHeal();
            },
          };


          const executeSkill =
            (
              code
            ) => {
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

              rotateCamera(
                camera,

                event.movementX,

                event.movementY
              );
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


              if (event.code === "KeyF") {
                if (event.target?.closest?.("input, textarea, select, [contenteditable='true']")) return;
                event.preventDefault();
                multiplayer?.collectLoot();
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
              engine.resize();
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

          engine.hideLoadingUI();


          /*
           * =====================================================
           * GAME LOOP
           * =====================================================
           */

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

              updateMovement({
                deltaTime,

                input:
                  input.state,

                camera,

                player,
              });


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
               * ANIMATIONS
               * ---------------------
               */

              if (
                jump.isJumping()
              ) {
                animations.setJumping(
                  true
                );
              } else {
                animations.setJumping(
                  false
                );

                animations.setRunning(
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
                ?.syncLocalPlayer(
                  player
                );

              multiplayer
                ?.sendMovement(
                  player,

                  deltaTime
                );

              multiplayer
                ?.update(
                  deltaTime
                );

              setLocalPlayerOnMinimap(
                {
                  x:
                    player.position
                      .x,

                  z:
                    player.position
                      .z,

                  rotationY:
                    player.rotation
                      .y,
                }
              );

              /*
               * ---------------------
               * RENDER
               * ---------------------
               */

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

        resetMinimap();

        multiplayer
          ?.destroy();

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
    []
  );


  return (
    <canvas
      ref={
        canvasRef
      }
      className="block h-full w-full touch-none"
    />
  );
};