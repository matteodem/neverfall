import { SceneLoader, TransformNode } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { createKayKitAnimationController } from "../createKayKitAnimationController";
import { normalizeAmirAppearance, isValidAmirAppearance } from "./appearance";
import { applyAmirSkinTone } from "./applyAmirSkinTone";

// Adapt the shared locomotion controller's clip contract without changing its timing/state logic.
const ANIMATION_MAP = {
  Idle_A: "Idle", Running_A: "Run", Walking_A: "Walk", Hit_A: "Hit", Death_A: "Dying",
  Jump_Full_Short: "Jumping", Jump_Start: "JumpUp", Jump_Idle: "Jumping", Jump_Land: "JumpLand",
  Interact: "Gathering Objects",
};
const ATTACHMENT_MAP = { Head: "head", LeftHand: "leftHand", RightHand: "rightHand", Spine2: "back" };
const BODY_SCALE = { slim: 0.9, medium: 1, large: 1.1 };
const MODEL_SCALE = 6;
// The source rig is in centimetres; normalize external attachments to gameplay metres.
const RIG_SCALE = 0.01;

export const createAmirCharacter = async ({ scene, appearance: input = {} }) => {
  const appearance = normalizeAmirAppearance(input);
  if (!isValidAmirAppearance(appearance)) throw new Error("Invalid Amir appearance");
  const container = await SceneLoader.LoadAssetContainerAsync(
    "/models/characters/amir/", "Modular Character Free.glb", scene
  );
  const root = new TransformNode("amir-character", scene);
  try {
    if (scene.isDisposed) throw new Error("Scene was disposed while loading Amir character");
    container.addAllToScene();
    container.animationGroups.forEach((animation) => animation.stop());
    for (const node of container.rootNodes) {
      node.parent = root;
      node.scaling.scaleInPlace(MODEL_SCALE);
    }
    root.scaling.set(BODY_SCALE[appearance.bodyType], 1, BODY_SCALE[appearance.bodyType]);
    const selected = { head: appearance.head, hair: appearance.hair, ...appearance.outfit, ...appearance.equipment };
    const parts = {};
    for (const mesh of container.meshes.filter((mesh) => mesh.getTotalVertices() > 0)) {
      mesh.isPickable = false;
      // Disable geometry, never joint nodes. Attachments keep their authored local transforms.
      const enabled = Object.values(selected).includes(mesh.name);
      mesh.setEnabled(enabled);
      if (enabled) parts[Object.keys(selected).find((slot) => selected[slot] === mesh.name)] = mesh;
    }
    for (const [slot, name] of Object.entries(selected)) {
      if (name && !parts[slot]) throw new Error(`Missing Amir part: ${name}`);
    }
    await applyAmirSkinTone(container, appearance.skinTone, scene);

    const sourceAnimations = [...container.animationGroups];
    // Source Rig rotates Z into world height. Keep horizontal hips motion in place;
    // the existing collider and jump controller remain the sole movement authority.
    for (const group of sourceAnimations) {
      for (const { target, animation } of group.targetedAnimations) {
        if (target.name !== "Hips" || animation.targetProperty !== "position") continue;
        animation.setKeys(animation.getKeys().map((key) => ({ ...key,
          value: key.value.clone().set(target.position.x, target.position.y, key.value.z),
        })));
      }
    }
    const animations = Object.entries(ANIMATION_MAP).map(([alias, source]) => {
      const group = sourceAnimations.find(({ name }) => name === source);
      if (!group) throw new Error(`Missing Amir animation: ${source}`);
      return group.clone(`Knight_${alias}`, (target) => target);
    });
    sourceAnimations.forEach((group) => group.dispose());
    container.animationGroups = animations;

    const attachments = {};
    for (const [boneName, slot] of Object.entries(ATTACHMENT_MAP)) {
      const boneNode = container.skeletons[0]?.bones.find(({ name }) => name === boneName)?.getTransformNode();
      if (!boneNode) throw new Error(`Missing Amir attachment: ${boneName}`);
      const anchor = new TransformNode(`amir-${slot}-attachment`, scene);
      anchor.parent = boneNode;
      anchor.scaling.setAll(1 / (MODEL_SCALE * RIG_SCALE));
      attachments[slot] = anchor;
    }
    // Preserve the authored weapon transform when moving it to the normalized combat anchor.
    parts.rightHand?.setParent(attachments.rightHand);

    return {
      root, meshes: container.meshes, skeleton: container.skeletons[0], animations, appearance, parts, attachments,
      weaponAnchor: attachments.rightHand, weaponMesh: parts.rightHand || null,
      createAnimationController: () => createKayKitAnimationController({ animations }),
      dispose() { container.dispose(); root.dispose(); },
    };
  } catch (error) {
    container.dispose();
    root.dispose();
    throw error;
  }
};
