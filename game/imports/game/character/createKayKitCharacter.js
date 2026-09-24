import {
  SceneLoader,
  TransformNode,
} from "@babylonjs/core";

import "@babylonjs/loaders/glTF";


const KAYKIT_ROOT =
  "/models/characters/kaykit/";


const findTargetByName =
  (
    result,
    name
  ) => {
    const transformNode =
      result.transformNodes?.find(
        (node) =>
          node.name ===
          name
      );

    if (
      transformNode
    ) {
      return transformNode;
    }


    const mesh =
      result.meshes?.find(
        (item) =>
          item.name ===
          name
      );

    if (
      mesh
    ) {
      return mesh;
    }


    for (
      const skeleton
      of result.skeletons || []
    ) {
      const bone =
        skeleton.bones.find(
          (item) =>
            item.name ===
            name
        );

      if (
        bone
      ) {
        return (
          bone.getTransformNode?.() ||
          bone
        );
      }
    }


    return null;
  };


const disposeMannequinMeshes =
  (
    result
  ) => {
    result.meshes.forEach(
      (mesh) => {
        if (
          mesh.name ===
          "__root__"
        ) {
          return;
        }

        mesh.isVisible =
          false;

        mesh.isPickable =
          false;
      }
    );
  };


const cloneAnimations =
  ({
    source,
    target,
    prefix,
  }) => {
    return source.animationGroups.map(
      (
        animationGroup
      ) => {
        return animationGroup.clone(
          `${prefix}_${animationGroup.name}`,

          (
            oldTarget
          ) => {
            if (
              !oldTarget?.name
            ) {
              return null;
            }

            return findTargetByName(
              target,
              oldTarget.name
            );
          }
        );
      }
    );
  };


const createWeaponAnchor =
  ({
    scene,
    knight,
  }) => {
    const skeleton =
      knight.skeletons[0];

    const handSlotBone =
      skeleton?.bones.find(
        (bone) =>
          bone.name ===
          "handslot.r"
      );

    if (
      !handSlotBone
    ) {
      throw new Error(
        "[KayKit] handslot.r bone not found."
      );
    }


    const handSlotNode =
      handSlotBone
        .getTransformNode?.();


    if (
      !handSlotNode
    ) {
      throw new Error(
        "[KayKit] handslot.r has no linked TransformNode."
      );
    }


    const weaponAnchor =
      new TransformNode(
        "weaponAnchor",
        scene
      );

    weaponAnchor.parent =
      handSlotNode;


    return weaponAnchor;
  };


export const createKayKitCharacter =
  async ({
    scene,
    appearance = {},
  }) => {
    /*
     * =====================================================
     * KNIGHT
     * =====================================================
     */

    const knight =
      await SceneLoader.ImportMeshAsync(
        "",
        KAYKIT_ROOT,
        "knight/Knight.glb",
        scene
      );


    const root =
      new TransformNode(
        "characterRoot",
        scene
      );


    const knightRoot =
      knight.meshes.find(
        (mesh) =>
          mesh.name ===
          "__root__"
      );


    if (
      knightRoot
    ) {
      knightRoot.parent =
        root;
    }


    /*
     * =====================================================
     * ANIMATION SOURCES
     * =====================================================
     */

    const movement =
      await SceneLoader.ImportMeshAsync(
        "",
        KAYKIT_ROOT,
        "animations/Rig_Medium_MovementBasic.glb",
        scene
      );


    const general =
      await SceneLoader.ImportMeshAsync(
        "",
        KAYKIT_ROOT,
        "animations/Rig_Medium_General.glb",
        scene
      );


    disposeMannequinMeshes(
      movement
    );

    disposeMannequinMeshes(
      general
    );


    /*
     * =====================================================
     * RETARGET ANIMATIONS
     * =====================================================
     */

    const movementAnimations =
      cloneAnimations({
        source:
          movement,

        target:
          knight,

        prefix:
          "Knight",
      });


    const generalAnimations =
      cloneAnimations({
        source:
          general,

        target:
          knight,

        prefix:
          "Knight",
      });


    movement.animationGroups.forEach(
      (animation) =>
        animation.stop()
    );


    general.animationGroups.forEach(
      (animation) =>
        animation.stop()
    );


    const animations =
      [
        ...movementAnimations,
        ...generalAnimations,
      ];


    /*
     * =====================================================
     * WEAPON SLOT
     * =====================================================
     */

    const weaponAnchor =
      createWeaponAnchor({
        scene,
        knight,
      });


    return {
      root,

      meshes:
        knight.meshes,

      skeleton:
        knight.skeletons[0],

      animations,

      weaponAnchor,

      appearance: {
        gender:
          appearance.gender ||
          "female",

        skinTone:
          appearance.skinTone ||
          "medium",

        bodyType:
          appearance.bodyType ||
          "medium",

        head:
          appearance.head ||
          "head1",
      },
    };
  };