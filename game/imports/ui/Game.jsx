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
    const canvas =
      canvasRef.current;

    /*
     * ENGINE
     */

    const engine =
      new Engine(
        canvas,
        true
      );

    const scene =
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
    } = createWorld(
      scene
    );

    /*
     * INPUT
     */

    const input =
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
     * CAMERA ROTATION
     *
     * LMB:
     * free camera
     *
     * RMB:
     * camera + player facing
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
      "pointermove",
      handlePointerMove
    );

    input.on(
      canvas,
      "wheel",
      handleWheel,
      {
        passive: false,
      }
    );

    /*
     * BASIC ATTACK
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

    const handleResize = () => {
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

        updateMovement({
          deltaTime,
          input: input.state,
          camera,
          player,
        });

        /*
         * While RMB is held,
         * always align player with camera.
         */

        updateCameraFacing({
          input: input.state,
          camera,
          player,
        });

        combat.update(
          deltaTime
        );

        scene.render();
      }
    );

    /*
     * CLEANUP
     */

    return () => {
      input.destroy();

      scene.dispose();
      engine.dispose();
    };
  }, [setEnemyHp]);

  return (
    <canvas
      ref={canvasRef}
      className="block h-full w-full touch-none"
    />
  );
};