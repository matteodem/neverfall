import { useQualityStore } from "./stores/useQualityStore";
import { QUALITY_PRESETS } from "../game/performanceConfig";
import { useDungeonStore } from "./stores/useDungeonStore";
import { getDungeonExitTrace, clearDungeonExitTrace } from "../game/gameSession";
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
  Vector3,
} from "@babylonjs/core";

import {
  useActionBarStore,
} from "./stores/useActionBarStore";

import { useEquipmentStore } from "./stores/useEquipmentStore";
import { useSkillsStore } from "./stores/useSkillsStore";
import { useTalentStore } from "./stores/useTalentStore";
import { getTalentSkill } from "../game/talents";
import { useConsumableStore } from "./stores/useConsumableStore";

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
import { useWaypointStore } from "./stores/useWaypointStore";

import {
  playGameSound,
  preloadSounds,
} from "../game/sound";


export const Game = ({
  character,

  setPlayerHealth,
  setHealCooldownUntil,
  setMountedState,
  setInCombatState,
  setPotionBuffs,
}) => {
  const location = useDungeonStore((state) => state.location);
  const quality = useQualityStore((state) => state.quality);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const closePlayerDropdown = useCallback(() => setSelectedPlayer(null), []);

  const canvasRef =
    useRef(
      null
    );
  const characterRef = useRef(character);
  characterRef.current = character;


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
      const exitTrace = location === "world" ? getDungeonExitTrace() : null;
      exitTrace?.("World scene loading started");
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

      let inCombat = false;

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

          const loadingStartedAt = performance.now();


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


          engine.setHardwareScalingLevel(QUALITY_PRESETS[quality].resolutionScale);
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

          exitTrace?.("world assets and starting chunk loading started");
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
                dungeonId: useDungeonStore.getState().dungeonId,
                quality: QUALITY_PRESETS[quality],
              }
            );
          exitTrace?.("world assets and starting chunk loading completed");
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
                  playerAlive && !inCombat && location !== "dungeon"
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

          exitTrace?.("WorldRoom scene binding started");
          multiplayer =
            await createMultiplayer({
              scene,

              player,
              nameplate: world.nameplate,
              forestProps: world.forestProps,
              dungeonVisuals: world.dungeonVisuals,
              worldChunks: world.worldChunks,
              onLocalRespawn: () => {
                jump?.reset();
                animations.resetAirborneState?.();
              },
              isGrounded: () => !jump?.isJumping(),
              onLocalBuffChange: setPotionBuffs,
              onLocalCombatChange: (active) => {
                inCombat = active;
                setInCombatState(active);
              },

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


                  if (!playerAlive) {
                    input?.clear();
                    setSelectedPlayer(null);
                  }
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
          exitTrace?.("WorldRoom scene binding completed");
          if (
            disposed
          ) {
            multiplayer
              ?.destroy({ keepConnection: useDungeonStore.getState().location !== location || useQualityStore.getState().quality !== quality });

            return;
          }

          exitTrace?.("return chunk loading started", { x: player.position.x, y: player.position.y, z: player.position.z });
          await world.worldChunks?.loadAt(player.position);
          exitTrace?.("return chunk loading completed");
          exitTrace?.("nearby enemy loading started");
          await multiplayer.preloadEnemiesAt(player.position);
          exitTrace?.("nearby enemy loading completed");
          if (disposed) return;

          useEquipmentStore.getState().setChangeHandler((action, payload) => {
            if (action === "equip") {
              multiplayer.equipItem(payload.itemId, payload.slot);
            } else if (action === "unequip") {
              multiplayer.unequipItem(payload);
            }
          });
          useTalentStore.getState().setChangeHandler(multiplayer.changeTalents);
          useSkillsStore.getState().setChangeHandler(multiplayer.changeSkills);
          useConsumableStore.getState().setUseHandler(multiplayer.useConsumable);
          useWaypointStore.getState().setTravelHandler(multiplayer.travelWaypoint);


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
              canvas,
              () => playerAlive
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
            const activeCharacter = characterRef.current;
            const skill = getTalentSkill(activeCharacter.gameClass, code, activeCharacter.currentLevel, activeCharacter.talents, useSkillsStore.getState().equippedSkills);
            const actionBar = useActionBarStore.getState();
            if (!skill || !playerAlive || Date.now() < (actionBar.cooldownUntil[code] || 0)) return;
            if (skill.heal) {
              multiplayer?.sendHeal();
              return;
            }
            if (skill.buff) {
              actionBar.setCooldown(code, skill.cooldown);
              multiplayer?.sendAttack(code);
              return;
            }
            if (skill.projectile || skill.effect) {
              actionBar.setCooldown(code, skill.cooldown);
              multiplayer?.sendMovement(player, 0, mounted, true);
              multiplayer?.sendAttack(code);
              return;
            }
            if (!combat?.startAttack()) return;
            actionBar.setCooldown(code, skill.cooldown);
            playGameSound("attack");
            multiplayer?.sendAttack(code);
          };

          const SKILL_HANDLERS = {
            Space: () => { if (playerAlive && !useWaypointStore.getState().traveling) jump.jump(); },
            KeyF: () => {
              if (!multiplayer?.interactDungeon() && !multiplayer?.interactWorldEvent()) multiplayer?.collectLoot();
            },
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


            Digit4: () => performAttack("Digit4"),
          };


          const executeSkill =
            (
              code
            ) => {
              if (!playerAlive) return;
              if (
                mounted &&
                /^Digit[1-4]$/.test(code) &&
                !getTalentSkill(characterRef.current.gameClass, code, characterRef.current.currentLevel, characterRef.current.talents, useSkillsStore.getState().equippedSkills)?.heal
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

          createPlayerSelection({ canvas, scene, input, multiplayer, onSelect: setSelectedPlayer, canInteract: () => playerAlive });

          let previousTouch = null;
          input.on(window, "pointerdown", (event) => {
            if (event.pointerType !== "touch" || previousTouch ||
              (event.target !== canvas && !event.target?.closest?.(".mobile-joystick-area"))) return;
            previousTouch = { id: event.pointerId, x: event.clientX, y: event.clientY };
          });
          const clearTouch = (event) => {
            if (event.pointerId === previousTouch?.id) previousTouch = null;
          };
          input.on(window, "pointerup", clearTouch);
          input.on(window, "pointercancel", clearTouch);
          const handlePointerMove =
            (
              event
            ) => {
              let dx = event.movementX;
              let dy = event.movementY;
              if (event.pointerType === "touch") {
                if (!previousTouch || previousTouch.id !== event.pointerId) return;
                dx = event.clientX - previousTouch.x;
                dy = event.clientY - previousTouch.y;
                previousTouch = { id: event.pointerId, x: event.clientX, y: event.clientY };
                if (canvas.closest(".mobile-portrait")) [dx, dy] = [dy, -dx];
              } else if (!input.state.leftMouseDown && !input.state.rightMouseDown) {
                return;
              }
              rotateCamera(camera, dx, dy);
            };


          input.on(
            window,

            "pointermove",

            (event) => { if (event.pointerType === "touch") handlePointerMove(event); }
          );
          input.on(
            canvas,

            "pointermove",

            (event) => { if (event.pointerType !== "touch") handlePointerMove(event); }
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
              if (event.target?.closest?.("input, textarea, select, [contenteditable='true']")) return;
              if (
                event.repeat
              ) {
                return;
              }

              if (event.code === "KeyP" && !event.ctrlKey && !event.metaKey && !event.altKey) {
                event.preventDefault();
                useHudStore.getState().toggleUi();
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


                executeSkill("KeyF");


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
                "KeyI" || event.code === "KeyG" || event.code === "KeyZ" || event.code === "KeyM" || event.code === "KeyB" || event.code === "KeyC" || event.code === "KeyQ" || event.code === "KeyH" || event.code === "KeyT" || event.code === "KeyO" || event.code === "KeyE" || event.code === "KeyU"
              ) {
                if ((event.code === "KeyC" || event.code === "KeyQ" || event.code === "KeyH" || event.code === "KeyT" || event.code === "KeyO" || event.code === "KeyE") && (event.ctrlKey || event.metaKey || event.altKey)) return;
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

                const destination = {
                  KeyI: ["items", "inventory"],
                  KeyB: ["items", "shop"],
                  KeyC: ["items", "crafting"],
                  KeyG: ["hero", "gear"],
                  KeyQ: ["hero", "quests"],
                  KeyH: ["hero", "hunts"],
                  KeyZ: ["hero", "achievements"],
                  KeyT: ["hero", "talents"],
                  KeyO: ["hero", "skills"],
                  KeyE: ["social"],
                  KeyM: ["map"],
                  KeyU: ["help"],
                }[event.code];
                const [modal, tab] = destination;


                if (hudStore.openModals.includes(modal) && (!tab || hudStore.tabs[modal] === tab)) {
                  hudStore
                    .closeModal(modal);

                  return;
                }


                if (tab) hudStore.openSection(modal, tab);
                else hudStore.openModal(modal);


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


                executeSkill("Space");


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
          exitTrace?.("loading cleared");
          if (exitTrace) scene.onAfterRenderObservable.addOnce(() => {
            exitTrace("first world frame rendered; controls active");
            clearDungeonExitTrace(exitTrace);
          });
          if (Meteor.isDevelopment)
            console.info(`[Loading] Initial ${location} ready in ${Math.round(performance.now() - loadingStartedAt)}ms`);
          if (world.worldChunks) scene.onAfterRenderObservable.addOnce(() => {
            if (!disposed) world.worldChunks.start();
          });


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
              // Avoid a large local physics step after a stall; network timers use real elapsed time.
              const movementDeltaTime = Math.min(deltaTime, 50);


              /*
               * ---------------------
               * LOCAL MOVEMENT
               * ---------------------
               */

              const movement = playerAlive && !useWaypointStore.getState().traveling ?
                updateMovement({
                  deltaTime: movementDeltaTime,
                  terrain: world.terrain,
                  grounded: !jump.isJumping(),

                  input:
                    input.state,

                  camera,

                  player,

                  speedMultiplier:
                    (mounted ? 2 : 1) * (multiplayer?.getMovementSpeedMultiplier() ?? 1),
                }) : Vector3.Zero();


              mount
                ?.setFacing(
                  movement
                );


              if (playerAlive && !useWaypointStore.getState().traveling) updateCameraFacing({
                input:
                  input.state,

                camera,

                player,
              });

              if (playerAlive) multiplayer?.faceAttackTarget();


              /*
               * ---------------------
               * JUMP
               * ---------------------
               */

              if (playerAlive) jump.update(movementDeltaTime);


              /*
               * ---------------------
               * CHARACTER ANIMATIONS
               * ---------------------
               *
               * The animation controller itself
               * ignores run/jump while mounted.
               */

              if (
                playerAlive && jump.isJumping()
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
                    playerAlive && !useWaypointStore.getState().traveling && isMoving(
                      input.state
                    )
                  );
              }


              animations.setAirborneState?.(playerAlive ? jump.getPhase() : null);
              animations.setChatAnimation?.(multiplayer?.getChatAnimation() || "");
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
                  mounted && !useWaypointStore.getState().traveling &&
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
          exitTrace?.("world scene loading failed", { message: error?.message });
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
        if (getDungeonExitTrace() === exitTrace)
          exitTrace?.("world scene cleanup started", { location: useDungeonStore.getState().location });


        /*
         * Disable HUD skill buttons
         * before destroying the game.
         */

        setSkillHandler(
          null
        );

        useEquipmentStore.getState().setChangeHandler(null);
        useTalentStore.getState().setChangeHandler(null);
        useSkillsStore.getState().setChangeHandler(null);
        useConsumableStore.getState().setUseHandler(null);
        useWaypointStore.getState().setTravelHandler(null);


        setMountedState(
          false
        );


        mount
          ?.destroy();


        resetMinimap();


        multiplayer
          ?.destroy({ keepConnection: useDungeonStore.getState().location !== location || useQualityStore.getState().quality !== quality });


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
    [location, quality]
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
