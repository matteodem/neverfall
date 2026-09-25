import { getEnemyStats } from "./enemyConfig";
import { createEnemyAnimations } from "./enemyAnimations";
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

export const createEnemy = async ({
  scene,
  state,
  id,
}) => {
  const config = getEnemyStats(state.type, state.level);
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

  modelRoot.rotation.y = config.rotationY;
  modelRoot.scaling.setAll(config.scale);

  const result =
    await SceneLoader.ImportMeshAsync(
      "",
      "/models/",
      config.model,
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

  const animations = createEnemyAnimations(result.animationGroups, config.animations);

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
        config.healthBarY ?? 1.35,
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
        `${config.name} (Level ${state.level || 1})`,

      color:
        "#fca5a5",

      y:
        config.nameplateY ?? -0.45,
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

      animations.destroy();

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
