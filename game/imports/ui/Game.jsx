import React, { useEffect, useRef } from "react";

import {
  ArcRotateCamera,
  Color3,
  DirectionalLight,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";

/*
 * =========================================================
 * CONFIG
 * =========================================================
 */

const PLAYER_SPEED = 4;

const CAMERA = {
  radius: 9,
  minRadius: 4,
  maxRadius: 14,

  minBeta: 0.25,
  maxBeta: Math.PI / 2 - 0.05,

  mouseSensitivity: 0.005,
  zoomSensitivity: 0.01,
};

const ATTACK = {
  damage: 25,
  duration: 350,
  range: 2.5,
  knockback: 0.5,
};

/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

const createMaterial = (
  name,
  color,
  scene
) => {
  const material = new StandardMaterial(
    name,
    scene
  );

  material.diffuseColor = color;

  return material;
};

const clamp = (
  value,
  min,
  max
) => {
  return Math.min(
    Math.max(value, min),
    max
  );
};

/*
 * =========================================================
 * GAME
 * =========================================================
 */

export const Game = ({
  enemyHp,
  setEnemyHp,
}) => {
  const canvasRef = useRef(null);
  const enemyHpRef = useRef(enemyHp);

  useEffect(() => {
    enemyHpRef.current = enemyHp;
  }, [enemyHp]);

  useEffect(() => {
    const canvas =
      canvasRef.current;

    /*
     * =====================================================
     * ENGINE + SCENE
     * =====================================================
     */

    const engine = new Engine(
      canvas,
      true
    );

    const scene = new Scene(
      engine
    );

    scene.clearColor.set(
      0.05,
      0.08,
      0.12,
      1
    );

    /*
     * =====================================================
     * LIGHTING
     * =====================================================
     */

    const ambient =
      new HemisphericLight(
        "ambient",
        new Vector3(
          0,
          1,
          0
        ),
        scene
      );

    ambient.intensity = 0.8;

    const sun =
      new DirectionalLight(
        "sun",
        new Vector3(
          -1,
          -2,
          1
        ),
        scene
      );

    sun.intensity = 0.6;

    /*
     * =====================================================
     * GROUND
     * =====================================================
     */

    const ground =
      MeshBuilder.CreateGround(
        "ground",
        {
          width: 40,
          height: 40,
        },
        scene
      );

    ground.material =
      createMaterial(
        "groundMaterial",
        new Color3(
          0.12,
          0.25,
          0.15
        ),
        scene
      );

    /*
     * =====================================================
     * PLAYER
     * =====================================================
     */

    const player =
      MeshBuilder.CreateCapsule(
        "player",
        {
          height: 2,
          radius: 0.5,
        },
        scene
      );

    player.position.set(
      0,
      1,
      0
    );

    player.material =
      createMaterial(
        "playerMaterial",
        new Color3(
          0.15,
          0.45,
          1
        ),
        scene
      );

    /*
     * =====================================================
     * SWORD
     * =====================================================
     */

    const sword =
      MeshBuilder.CreateBox(
        "sword",
        {
          width: 0.15,
          height: 1.4,
          depth: 0.15,
        },
        scene
      );

    sword.parent = player;

    sword.position.set(
      0.7,
      0.2,
      0.2
    );

    sword.rotation.z =
      Math.PI / 4;

    sword.material =
      createMaterial(
        "swordMaterial",
        new Color3(
          0.8,
          0.8,
          0.9
        ),
        scene
      );

    /*
     * =====================================================
     * ENEMY
     * =====================================================
     */

    const enemy =
      MeshBuilder.CreateCapsule(
        "enemy",
        {
          height: 2,
          radius: 0.55,
        },
        scene
      );

    enemy.position.set(
      0,
      1,
      5
    );

    const enemyMaterial =
      createMaterial(
        "enemyMaterial",
        new Color3(
          0.8,
          0.1,
          0.1
        ),
        scene
      );

    enemy.material =
      enemyMaterial;

    /*
     * =====================================================
     * CAMERA
     * =====================================================
     *
     * Important:
     *
     * We use ArcRotateCamera ONLY for camera maths.
     *
     * We DO NOT call:
     *
     * camera.attachControl(...)
     *
     * That means Babylon does not handle mouse input.
     * We handle everything ourselves.
     */

    const camera =
      new ArcRotateCamera(
        "camera",

        /*
         * alpha = horizontal rotation
         */
        Math.PI / 2,

        /*
         * beta = vertical rotation
         */
        Math.PI / 3,

        CAMERA.radius,

        player.position,

        scene
      );

    camera.lockedTarget =
      player;

    camera.radius =
      CAMERA.radius;

    /*
     * =====================================================
     * INPUT STATE
     * =====================================================
     */

    const keys = {};

    let leftMouseDown = false;
    let rightMouseDown = false;

    let attacking = false;
    let attackProgress = 0;
    let damageApplied = false;

    /*
     * =====================================================
     * CAMERA HELPERS
     * =====================================================
     */

    const getCameraForward =
      () => {
        /*
         * ArcRotateCamera looks toward
         * its target.
         *
         * Therefore player - camera gives
         * us camera-forward.
         */

        const forward =
          player.position
            .subtract(
              camera.position
            );

        /*
         * Remove vertical component.
         */

        forward.y = 0;

        if (
          forward.lengthSquared() >
          0
        ) {
          forward.normalize();
        }

        return forward;
      };

    const getCameraRight =
      () => {
        const forward =
          getCameraForward();

        return new Vector3(
          forward.z,
          0,
          -forward.x
        ).normalize();
      };

    /*
     * =====================================================
     * PLAYER ROTATION
     * =====================================================
     */

    const faceDirection = (
      direction
    ) => {
      if (
        direction.lengthSquared() ===
        0
      ) {
        return;
      }

      player.rotation.y =
        Math.atan2(
          direction.x,
          direction.z
        );
    };

    /*
     * While RMB is held:
     *
     * player always faces where
     * camera looks.
     */

    const updateRmbFacing =
      () => {
        if (!rightMouseDown) {
          return;
        }

        faceDirection(
          getCameraForward()
        );
      };

    /*
     * =====================================================
     * CAMERA MOUSE INPUT
     * =====================================================
     */

    const handlePointerDown = (
      event
    ) => {
      /*
       * LMB
       */
      if (event.button === 0) {
        leftMouseDown = true;
      }

      /*
       * RMB
       */
      if (event.button === 2) {
        rightMouseDown = true;
      }

      /*
       * Capture mouse so dragging
       * continues even when pointer
       * leaves the canvas.
       */

      try {
        canvas.setPointerCapture(
          event.pointerId
        );
      } catch {
        // Ignore unsupported capture.
      }
    };

    const handlePointerUp = (
      event
    ) => {
      if (event.button === 0) {
        leftMouseDown = false;
      }

      if (event.button === 2) {
        rightMouseDown = false;
      }

      try {
        canvas.releasePointerCapture(
          event.pointerId
        );
      } catch {
        // Ignore.
      }
    };

    /*
     * Actual GW2-style camera rotation.
     *
     * BOTH LMB and RMB rotate camera.
     *
     * Difference:
     *
     * LMB:
     * camera rotates independently.
     *
     * RMB:
     * camera rotates AND character
     * rotates with camera.
     */

    const handlePointerMove = (
      event
    ) => {
      if (
        !leftMouseDown &&
        !rightMouseDown
      ) {
        return;
      }

      /*
       * Horizontal camera rotation
       */

      camera.alpha -=
        event.movementX *
        CAMERA.mouseSensitivity;

      /*
       * Vertical camera rotation
       */

      camera.beta -=
        event.movementY *
        CAMERA.mouseSensitivity;

      /*
       * Prevent camera from going
       * upside-down.
       */

      camera.beta = clamp(
        camera.beta,
        CAMERA.minBeta,
        CAMERA.maxBeta
      );

      /*
       * RMB behaves like GW2:
       *
       * camera yaw controls
       * player facing.
       */

      if (rightMouseDown) {
        faceDirection(
          getCameraForward()
        );
      }
    };

    /*
     * =====================================================
     * CAMERA ZOOM
     * =====================================================
     */

    const handleWheel = (
      event
    ) => {
      event.preventDefault();

      camera.radius +=
        event.deltaY *
        CAMERA.zoomSensitivity;

      camera.radius = clamp(
        camera.radius,
        CAMERA.minRadius,
        CAMERA.maxRadius
      );
    };

    /*
     * =====================================================
     * DISABLE CONTEXT MENU
     * =====================================================
     */

    const handleContextMenu = (
      event
    ) => {
      event.preventDefault();
    };

    /*
     * =====================================================
     * KEYBOARD INPUT
     * =====================================================
     */

    const handleKeyDown = (
      event
    ) => {
      keys[
        event.key.toLowerCase()
      ] = true;

      /*
       * Skill 1
       */

      if (
        event.code === "Digit1"
      ) {
        event.preventDefault();

        startAttack();
      }
    };

    const handleKeyUp = (
      event
    ) => {
      keys[
        event.key.toLowerCase()
      ] = false;
    };

    /*
     * =====================================================
     * MOVEMENT
     * =====================================================
     */

    const getMovementDirection =
      () => {
        const movement =
          Vector3.Zero();

        const forward =
          getCameraForward();

        const right =
          getCameraRight();

        /*
         * Movement is ALWAYS
         * camera-relative.
         */

        if (keys.w) {
          movement.addInPlace(
            forward
          );
        }

        if (keys.s) {
          movement.subtractInPlace(
            forward
          );
        }

        if (keys.d) {
          movement.addInPlace(
            right
          );
        }

        if (keys.a) {
          movement.subtractInPlace(
            right
          );
        }

        return movement;
      };

    const updatePlayer = (
      deltaTime
    ) => {
      const movement =
        getMovementDirection();

      if (
        movement.lengthSquared() ===
        0
      ) {
        return;
      }

      movement.normalize();

      const distance =
        PLAYER_SPEED *
        (deltaTime / 1000);

      player.position.addInPlace(
        movement.scale(
          distance
        )
      );

      /*
       * RMB:
       *
       * character always remains
       * camera-forward.
       *
       * No RMB:
       *
       * character faces movement
       * direction.
       */

      if (rightMouseDown) {
        faceDirection(
          getCameraForward()
        );
      } else {
        faceDirection(
          movement
        );
      }
    };

    /*
     * =====================================================
     * COMBAT
     * =====================================================
     */

    const startAttack = () => {
      if (
        attacking ||
        enemyHpRef.current <= 0
      ) {
        return;
      }

      attacking = true;
      attackProgress = 0;
      damageApplied = false;
    };

    const hitEnemy = () => {
      if (
        enemyHpRef.current <= 0
      ) {
        return;
      }

      const distance =
        Vector3.Distance(
          player.position,
          enemy.position
        );

      if (
        distance >
        ATTACK.range
      ) {
        return;
      }

      const nextHp =
        Math.max(
          0,
          enemyHpRef.current -
            ATTACK.damage
        );

      enemyHpRef.current =
        nextHp;

      setEnemyHp(
        nextHp
      );

      /*
       * HIT FLASH
       */

      enemyMaterial.diffuseColor =
        new Color3(
          1,
          1,
          1
        );

      setTimeout(() => {
        if (
          !enemy.isDisposed()
        ) {
          enemyMaterial.diffuseColor =
            new Color3(
              0.8,
              0.1,
              0.1
            );
        }
      }, 100);

      /*
       * KNOCKBACK
       */

      const direction =
        enemy.position
          .subtract(
            player.position
          )
          .normalize();

      enemy.position.addInPlace(
        direction.scale(
          ATTACK.knockback
        )
      );

      /*
       * DEATH
       */

      if (nextHp <= 0) {
        setTimeout(() => {
          enemy.setEnabled(
            false
          );
        }, 200);
      }
    };

    const updateAttack = (
      deltaTime
    ) => {
      if (!attacking) {
        return;
      }

      attackProgress +=
        deltaTime /
        ATTACK.duration;

      /*
       * Very simple placeholder
       * sword animation.
       */

      sword.rotation.z =
        Math.PI / 4 -
        Math.sin(
          attackProgress *
            Math.PI
        ) *
          2;

      /*
       * Apply damage roughly in
       * middle of animation.
       */

      if (
        attackProgress >
          0.35 &&
        !damageApplied
      ) {
        damageApplied = true;

        hitEnemy();
      }

      if (
        attackProgress >= 1
      ) {
        attacking = false;
        attackProgress = 0;

        sword.rotation.z =
          Math.PI / 4;
      }
    };

    /*
     * =====================================================
     * EVENTS
     * =====================================================
     */

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    window.addEventListener(
      "keyup",
      handleKeyUp
    );

    canvas.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    canvas.addEventListener(
      "pointermove",
      handlePointerMove
    );

    canvas.addEventListener(
      "pointerup",
      handlePointerUp
    );

    canvas.addEventListener(
      "pointercancel",
      handlePointerUp
    );

    canvas.addEventListener(
      "wheel",
      handleWheel,
      {
        passive: false,
      }
    );

    canvas.addEventListener(
      "contextmenu",
      handleContextMenu
    );

    /*
     * =====================================================
     * RESIZE
     * =====================================================
     */

    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    /*
     * =====================================================
     * GAME LOOP
     * =====================================================
     */

    engine.runRenderLoop(
      () => {
        const deltaTime =
          engine.getDeltaTime();

        /*
         * Movement first.
         */

        updatePlayer(
          deltaTime
        );

        /*
         * RMB should always win
         * over movement rotation.
         */

        updateRmbFacing();

        updateAttack(
          deltaTime
        );

        scene.render();
      }
    );

    /*
     * =====================================================
     * CLEANUP
     * =====================================================
     */

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      window.removeEventListener(
        "keyup",
        handleKeyUp
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      canvas.removeEventListener(
        "pointerdown",
        handlePointerDown
      );

      canvas.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      canvas.removeEventListener(
        "pointerup",
        handlePointerUp
      );

      canvas.removeEventListener(
        "pointercancel",
        handlePointerUp
      );

      canvas.removeEventListener(
        "wheel",
        handleWheel
      );

      canvas.removeEventListener(
        "contextmenu",
        handleContextMenu
      );

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
