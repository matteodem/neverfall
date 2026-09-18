import React, {
  useEffect,
  useRef,
} from "react";

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
  enemyHp,
  setEnemyHp,
}) => {
  const canvasRef =
    useRef(null);

  const enemyHpRef =
    useRef(enemyHp);

  useEffect(() => {
    enemyHpRef.current =
      enemyHp;
  }, [enemyHp]);

  useEffect(() => {
    let engine = null;
    let scene = null;
    let input = null;
    let animations = null;

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
        enemy,
        enemyMaterial,
        camera,
        animationGroups,
      } = await createWorld(scene);

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

      const combat =
        createCombat({
          player,
          sword,
          enemy,
          enemyMaterial,
          enemyHpRef,
          setEnemyHp,
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

      /*
       * ATTACK
       */

      const handleAttack = (
        event
      ) => {
        if (
          event.code !==
          "Digit1"
        ) {
          return;
        }

        event.preventDefault();

        combat.startAttack();
      };

      input.on(
        window,
        "keydown",
        handleAttack
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
          if (
            disposed ||
            !scene
          ) {
            return;
          }

          const deltaTime =
            engine.getDeltaTime();

          /*
           * MOVEMENT
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

          /*
           * RUN / IDLE ANIMATION
           */

          const isMoving =
            input.state.keys.w ||
            input.state.keys.a ||
            input.state.keys.s ||
            input.state.keys.d;

          animations.setRunning(
            isMoving
          );

          /*
           * COMBAT
           */

          combat.update(
            deltaTime
          );

          /*
           * RENDER
           */

          scene.render();
        }
      );
    };

    init();

    return () => {
      disposed = true;

      animations?.destroy();
      input?.destroy();

      engine?.stopRenderLoop();

      scene?.dispose();
      engine?.dispose();
    };
  }, [setEnemyHp]);

  return (
    <canvas
      ref={canvasRef}
      className="block h-full w-full touch-none"
    />
  );
};