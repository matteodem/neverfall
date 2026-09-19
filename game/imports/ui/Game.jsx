import React, {
  useEffect,
  useRef,
} from "react";

import {
  createMultiplayer,
} from "../game/multiplayer";

import {
  Engine,
  Scene,
} from "@babylonjs/core";

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
} from "../game/movement";

import {
  createCombat,
} from "../game/combat";

import {
  createPlayerAnimationController,
} from "../game/animation";

export const Game = ({
  character,

  setPlayerHealth,

  setHealCooldownUntil,
}) => {
  const canvasRef =
    useRef(null);

  useEffect(() => {
    let engine = null;
    let scene = null;
    let input = null;
    let animations = null;
    let combat = null;
    let multiplayer = null;

    let disposed = false;

    const init = async () => {
      const canvas =
        canvasRef.current;

      /*
       * ENGINE
       */

      engine =
        new Engine(
          canvas,
          true
        );

      /*
       * SCENE
       */

      scene =
        new Scene(
          engine
        );

      scene.clearColor.set(
        0.05,
        0.08,
        0.12,
        1
      );

      /*
       * WORLD
       */

      const {
        player,
        sword,
        swordPivot,
        swordTip,
        camera,
        animationGroups,
      } =
        await createWorld(
          scene,
          {
            assetFile:
              character.assetFile,

            name:
              character.name,
          }
        );

      multiplayer =
        await createMultiplayer({
          scene,
          player,

          onLocalHealthChange:
            setPlayerHealth,

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
        return;
      }

      /*
       * PLAYER ANIMATIONS
       */

      animations =
        createPlayerAnimationController(
          animationGroups
        );

      /*
       * INPUT
       */

      input =
        createInput(
          canvas
        );

      /*
       * COMBAT
       */

      combat =
        createCombat({
          scene,
          swordPivot,
          swordTip,
        });

      /*
       * CAMERA
       */

      const handlePointerMove = (
        event
      ) => {
        if (
          !input.state.leftMouseDown &&
          !input.state.rightMouseDown
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
       * CAMERA ZOOM
       */

      const handleWheel = (
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
          passive: false,
        }
      );

      const handleSkill = (
        event
      ) => {
        if (
          event.repeat
        ) {
          return;
        }

        if (
          event.code ===
          "Digit1"
        ) {
          combat?.startAttack();

          multiplayer?.sendAttack();

          return;
        }

        if (
          event.code ===
          "Digit4"
        ) {
          multiplayer?.sendHeal();
        }
      };

      input.on(
        window,
        "keydown",
        handleSkill
      );

      /*
       * RESIZE
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
       * GAME LOOP
       */

      engine.runRenderLoop(
        () => {
          const deltaTime =
            engine.getDeltaTime();

          /*
          * Local player.
          */

          updateMovement({
            deltaTime,
            input: input.state,
            camera,
            player,
          });

          updateCameraFacing({
            input: input.state,
            camera,
            player,
          });

          animations.setRunning(
            isMoving(
              input.state
            )
          );

          combat.update(
            deltaTime
          );

          /*
          * Multiplayer.
          */

          multiplayer?.syncLocalPlayer(
            player
          );

          multiplayer?.sendMovement(
            player,
            deltaTime
          );

          multiplayer?.update(
            deltaTime
          );

          scene.render();
        }
      );
    };

    init();

    return () => {
      disposed = true;

      multiplayer?.destroy();

      combat?.destroy();
      animations?.destroy();
      input?.destroy();

      engine?.stopRenderLoop();

      scene?.dispose();
      engine?.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block h-full w-full touch-none"
    />
  );
};