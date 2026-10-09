import { createEntityVisibility } from "./entityVisibility";
import { getEnemyStats } from "./enemyConfig";
import { createEnemyAnimations } from "./enemyAnimations";
import {
  Color3,
  MeshBuilder,
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

const modelCache = new WeakMap();
const instanceQueues = new WeakMap();

const loadEnemyModel = (scene, name) => {
  let models = modelCache.get(scene);
  if (!models) {
    models = new Map();
    modelCache.set(scene, models);
    scene.onDisposeObservable.addOnce(() => {
      for (const promise of models.values()) void promise.then((container) => container.dispose()).catch(() => {});
      modelCache.delete(scene);
    });
  }
  if (!models.has(name)) {
    const promise = SceneLoader.LoadAssetContainerAsync("/models/", name, scene)
      .catch((error) => { models.delete(name); throw error; });
    models.set(name, promise);
  }
  return models.get(name);
};

const instantiateEnemyModel = (scene, source, clone) => {
  const previous = instanceQueues.get(scene) || Promise.resolve();
  const next = previous.then(() => new Promise((resolve) => requestAnimationFrame(resolve)))
    .then(() => source.instantiateModelsToScene(undefined, false, { doNotInstantiate: clone }));
  instanceQueues.set(scene, next.catch(() => {}));
  return next;
};

export const createEnemy = async ({
  scene,
  state,
  id,
  mobile = false,
}) => {
  const config = getEnemyStats(state.type, state.level, state.rare);
  const source = await loadEnemyModel(scene, config.model);
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

  root.metadata = { enemyId: id };

  const selectionWidth = mobile ? 3 : 2.25;
  const selectionHeight = mobile ? 3.3 : 2.7;
  const selectionArea = MeshBuilder.CreateBox(`enemy-selection-${id}`, {
    width: selectionWidth,
    height: selectionHeight,
    depth: selectionWidth,
  }, scene);
  selectionArea.parent = root;
  selectionArea.position.y = selectionHeight / 2;
  selectionArea.visibility = 0;
  selectionArea.isPickable = true;

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

  const entries = await instantiateEnemyModel(scene, source, Boolean(state.rare || config.emissiveColor));

  /*
   * Parent only top-level cloned
   * nodes to modelRoot.
   *
   * Child meshes keep their original
   * GLB hierarchy.
   */

  for (const node of entries.rootNodes) node.parent = modelRoot;
  const result = { meshes: modelRoot.getChildMeshes(), animationGroups: entries.animationGroups };

  /*
   * =====================================================
   * ANIMATION
   * =====================================================
   */

  const rareMaterials = new Map();
  if (state.rare || config.emissiveColor) {
    for (const mesh of result.meshes) {
      const material = mesh.material;
      if (!material || !material.emissiveColor) continue;
      if (!rareMaterials.has(material)) {
        const tinted = material.clone(`${material.name}-rare-${id}`);
        tinted.emissiveColor = config.emissiveColor
          ? new Color3(...config.emissiveColor) : new Color3(0.08, 0.065, 0.006);
        rareMaterials.set(material, tinted);
      }
      mesh.material = rareMaterials.get(material);
    }
  }

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
        state.rare ? "#fde047" : "#fca5a5",

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

  let previousHealth = state.health;
  let hitStartedAt = 0;
  let hitObserver = null;
  const stopHitReaction = () => {
    if (hitObserver) scene.onBeforeRenderObservable.remove(hitObserver);
    hitObserver = null;
    modelRoot.scaling.setAll(config.scale);
    modelRoot.rotation.z = 0;
  };
  const playHitReaction = () => {
    // A visual recoil for the nearby starter boar; authoritative movement stays unchanged.
    if (id !== "boar-1" || state.type !== "boar") return;
    hitStartedAt = performance.now();
    if (hitObserver) return;
    hitObserver = scene.onBeforeRenderObservable.add(() => {
      const progress = (performance.now() - hitStartedAt) / 180;
      if (progress >= 1) return stopHitReaction();
      const impact = Math.sin(progress * Math.PI);
      modelRoot.scaling.set(config.scale * (1 + impact * 0.14),
        config.scale * (1 - impact * 0.14), config.scale);
      modelRoot.rotation.z = impact * 0.12;
    });
  };

  /*
   * =====================================================
   * PUBLIC API
   * =====================================================
   */

  return {
    root,

    targetPosition,
    visualElapsed: 0,
    visibility: createEntityVisibility({ root, targetPosition, nameplate, healthBar, controllers: [animations] }),

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
      if (health < previousHealth) playHitReaction();
      previousHealth = health;
      healthBar.setHealth(
        health,
        maxHealth
      );
    },

    destroy() {
      stopHitReaction();
      healthBar.destroy();

      animations.destroy();

      nameplate.destroy();

      /*
       * Dispose this enemy's cloned GLB nodes.
       */

      for (const node of entries.rootNodes) node.dispose(false, false);
      for (const skeleton of entries.skeletons) skeleton.dispose();

      for (const material of rareMaterials.values()) material.dispose();
      modelRoot.dispose();
      root.dispose();
    },
  };
};
