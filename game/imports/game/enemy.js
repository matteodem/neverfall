import {
  SceneLoader,
  TransformNode,
  Vector3,
} from "@babylonjs/core";

import {
  createHealthBar,
} from "./healthBar";

import {
  createNameplate,
} from "./nameplate";

const IDLE = {
  from: 0,
  to: 29,
};

const ATTACK = {
  from: 30,
  to: 59,
};

const WALK = {
  from: 90,
  to: 119,
};

const createAnimationController = (
  animationGroup
) => {
  let currentAnimation =
    null;

  let attacking =
    false;

  const play = (
    name,
    range,
    loop = true
  ) => {
    if (
      currentAnimation === name &&
      animationGroup.isPlaying
    ) {
      return;
    }

    currentAnimation =
      name;

    animationGroup.stop();

    animationGroup.start(
      loop,
      1,
      range.from,
      range.to
    );
  };

  const idle = () => {
    if (attacking) {
      return;
    }

    play(
      "idle",
      IDLE
    );
  };

  const walk = () => {
    if (attacking) {
      return;
    }

    play(
      "walk",
      WALK
    );
  };

  const attack = () => {
    if (attacking) {
      return;
    }

    attacking =
      true;

    currentAnimation =
      "attack";

    animationGroup.stop();

    animationGroup.start(
      false,
      1,
      ATTACK.from,
      ATTACK.to
    );

    animationGroup
      .onAnimationGroupEndObservable
      .addOnce(
        () => {
          attacking =
            false;

          idle();
        }
      );
  };

  idle();

  return {
    idle,
    walk,
    attack,
  };
};

export const createEnemy = async ({
  scene,
  state,
  id,
}) => {
  /*
   * =====================================================
   * NETWORK ROOT
   * =====================================================
   *
   * Colyseus position / rotation
   * lives on this node.
   */

  const root =
    new TransformNode(
      `enemy-${id}`,
      scene
    );

  /*
   * =====================================================
   * MODEL ROOT
   * =====================================================
   *
   * Used only for GLB orientation
   * and visual scale.
   */

  const modelRoot =
    new TransformNode(
      `enemy-model-${id}`,
      scene
    );

  modelRoot.parent =
    root;

  /*
   * Flip Boar 180°.
   *
   * This fixes the model facing
   * backwards while attacking.
   */

  modelRoot.rotation.y = 0;

  /*
   * 2x smaller than the previous
   * 1.2 scale.
   */

  modelRoot.scaling.setAll(
    0.3
  );

  /*
   * =====================================================
   * LOAD BOAR
   * =====================================================
   */

  const result =
    await SceneLoader.ImportMeshAsync(
      "",
      "/models/",
      "boar.glb",
      scene
    );

  /*
   * Parent only top-level imported
   * meshes to modelRoot.
   *
   * Child meshes keep their original
   * GLB hierarchy.
   */

  for (
    const mesh
    of result.meshes
  ) {
    if (!mesh.parent) {
      mesh.parent =
        modelRoot;
    }
  }

  /*
   * =====================================================
   * ANIMATION
   * =====================================================
   */

  const animationGroup =
    result.animationGroups[0];

  if (!animationGroup) {
    throw new Error(
      "Boar has no animation group."
    );
  }

  const animations =
    createAnimationController(
      animationGroup
    );

  /*
   * =====================================================
   * HEALTH BAR
   * =====================================================
   */

  const healthBar =
    createHealthBar({
      scene,

      player:
        root,

      color:
        "#ef4444",

      y:
        1.35,
    });

  healthBar.setHealth(
    state.health,
    state.maxHealth
  );

  const nameplate =
    createNameplate({
      scene,

      player:
        root,

      name:
        "Boar (Level 1)",

      color:
        "#fca5a5",

      y:
        -0.45,
    });

  /*
   * =====================================================
   * INITIAL NETWORK STATE
   * =====================================================
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

  /*
   * =====================================================
   * PUBLIC API
   * =====================================================
   */

  return {
    root,

    targetPosition,

    animations,

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

      animationGroup.stop();

      nameplate.destroy();

      /*
       * Dispose imported GLB meshes.
       */

      for (
        const mesh
        of result.meshes
      ) {
        mesh.dispose();
      }

      modelRoot.dispose();
      root.dispose();
    },
  };
};