import {
  Color3,
  MeshBuilder,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";

import {
  createHealthBar,
} from "./healthBar";

const createMaterial = (
  scene
) => {
  const material =
    new StandardMaterial(
      "enemyMaterial",
      scene
    );

  material.diffuseColor =
    new Color3(
      0.35,
      0.08,
      0.08
    );

  return material;
};

export const createEnemy = ({
  scene,
  state,
  id,
}) => {
  const root =
    new TransformNode(
      `enemy-${id}`,
      scene
    );

  /*
   * BODY
   */

  const body =
    MeshBuilder.CreateCapsule(
      `enemy-body-${id}`,
      {
        height: 1.7,
        radius: 0.45,
      },
      scene
    );

  body.parent =
    root;

  body.position.y =
    0.85;

  /*
   * HEAD
   */

  const head =
    MeshBuilder.CreateSphere(
      `enemy-head-${id}`,
      {
        diameter: 0.65,
      },
      scene
    );

  head.parent =
    root;

  head.position.y =
    1.9;

  const material =
    createMaterial(
      scene
    );

  body.material =
    material;

  head.material =
    material;

  /*
   * RED HEALTHBAR
   */

  const healthBar =
    createHealthBar({
      scene,
      player: root,

      color:
        "#ef4444",

      y: 2.55,
    });

  healthBar.setHealth(
    state.health,
    state.maxHealth
  );

  /*
   * NETWORK TARGETS
   */

  root.position.set(
    state.x,
    state.y,
    state.z
  );

  root.rotation.y =
    state.rotationY;

  const targetPosition =
    new Vector3(
      state.x,
      state.y,
      state.z
    );

  let targetRotationY =
    state.rotationY;

  return {
    root,

    targetPosition,

    setTargetRotation(
      rotation
    ) {
      targetRotationY =
        rotation;
    },

    getTargetRotation() {
      return targetRotationY;
    },

    setHealth(
      health,
      maxHealth
    ) {
      healthBar.setHealth(
        health,
        maxHealth
      );
    },

    destroy() {
      healthBar.destroy();

      body.dispose();
      head.dispose();
      material.dispose();

      root.dispose();
    },
  };
};