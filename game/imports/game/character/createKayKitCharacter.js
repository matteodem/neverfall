import {
  Color3,
  SceneLoader,
  TransformNode,
} from "@babylonjs/core";

import "@babylonjs/loaders/glTF";
import { getClassConfig } from "../classConfig";
import { SKIN_TONES } from "../species";


const KAYKIT_ROOT =
  "/models/characters/kaykit/";

// The head texture's skin area is peach, so a direct tint washes out green.
const BASE_SKIN_COLOR = Color3.FromHexString("#F8CAA9");


const BODY_TYPES = {
  slim: {
    x: 0.9,
    z: 0.9,
  },

  medium: {
    x: 1,
    z: 1,
  },

  large: {
    x: 1.1,
    z: 1.1,
  },
};


/*
 * Only the visible head mesh
 * should receive the selected
 * skin tone.
 *
 * Helmet and visor stay untouched.
 */

const applySkinTone =
  (
    knight,
    skinTone,
    skinMeshes
  ) => {
    const color =
      Color3.FromHexString(
        SKIN_TONES[
          skinTone
        ] ||
          SKIN_TONES.medium
      );

    const tint = new Color3(
      Math.min(color.r / BASE_SKIN_COLOR.r, 1),
      Math.min(color.g / BASE_SKIN_COLOR.g, 1),
      Math.min(color.b / BASE_SKIN_COLOR.b, 1)
    );


    knight.meshes.forEach(
      (
        mesh
      ) => {
        if (
          !skinMeshes.includes(
            mesh.name
          ) ||
          !mesh.material
        ) {
          return;
        }


        /*
         * All character meshes share
         * the same base material.
         *
         * Clone it first so changing
         * the head doesn't recolor
         * the armor or other meshes.
         */

        const material =
          mesh.material.clone(
            `${mesh.name}-skinMaterial`
          );


        /*
         * KayKit GLBs use a glTF
         * material, usually PBR.
         */

        if (
          "albedoColor"
          in material
        ) {
          material.albedoColor =
            tint;
        } else if (
          "diffuseColor"
          in material
        ) {
          material.diffuseColor =
            tint;
        }


        mesh.material =
          material;
      }
    );
  };


const findTargetByName =
  (
    result,
    name
  ) => {
    const transformNode =
      result.transformNodes?.find(
        (
          node
        ) =>
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
        (
          item
        ) =>
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
      of result.skeletons ||
      []
    ) {
      const bone =
        skeleton.bones.find(
          (
            item
          ) =>
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
      (
        mesh
      ) => {
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
        (
          bone
        ) =>
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
    gameClass = "warrior",
  }) => {
    const classConfig = getClassConfig(gameClass);

    /*
     * =====================================================
     * CHARACTER MODEL
     * =====================================================
     */

    const knight =
      await SceneLoader.ImportMeshAsync(
        "",
        KAYKIT_ROOT,
        classConfig.model,
        scene
      );


    const skinTone =
      appearance.skinTone ||
      "medium";


    const bodyType =
      appearance.bodyType ||
      "medium";


    /*
     * Only recolor the head.
     */

    applySkinTone(
      knight,
      skinTone,
      classConfig.skinMeshes
    );


    /*
     * =====================================================
     * ROOT
     * =====================================================
     */

    const root =
      new TransformNode(
        "characterRoot",
        scene
      );


    const knightRoot =
      knight.meshes.find(
        (
          mesh
        ) =>
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
     * BODY TYPE
     * =====================================================
     *
     * Keep Y unchanged so all
     * characters remain the same
     * height.
     */

    const bodyScale =
      BODY_TYPES[
        bodyType
      ] ||
      BODY_TYPES.medium;


    root.scaling.set(
      bodyScale.x,
      1,
      bodyScale.z
    );


    /*
     * =====================================================
     * ANIMATION SOURCES
     * =====================================================
     */

    const [movement, general] = await Promise.all([
      SceneLoader.ImportMeshAsync("", KAYKIT_ROOT, "animations/Rig_Medium_MovementBasic.glb", scene),
      SceneLoader.ImportMeshAsync("", KAYKIT_ROOT, "animations/Rig_Medium_General.glb", scene),
    ]);


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
      (
        animation
      ) =>
        animation.stop()
    );


    general.animationGroups.forEach(
      (
        animation
      ) =>
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


    /*
     * =====================================================
     * RESULT
     * =====================================================
     */

    return {
      root,

      meshes:
        knight.meshes,

      skeleton:
        knight.skeletons[0],

      animations,

      weaponAnchor,

      appearance: {
        /*
         * Gender and head stay in
         * the data model for now,
         * but aren't customizable
         * in the current creator.
         */

        gender:
          appearance.gender ||
          "male",

        skinTone,

        bodyType,

        head:
          appearance.head ||
          "head1",
      },
    };
  };
