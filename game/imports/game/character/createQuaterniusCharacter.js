import { Color3, SceneLoader, TransformNode } from "@babylonjs/core";
import "@babylonjs/loaders/glTF/index.js";
import { SKIN_TONES } from "../species.js";
import { QUATERNIUS_HAND_BONE, resolveCharacterParts } from "./characterAssetConfig.js";
import { createQuaterniusAnimations } from "./createQuaterniusAnimations.js";

const caches = new WeakMap();
const BODY_SCALE = { slim: 0.9, medium: 1, large: 1.1 };

const loadPart = (scene, url) => {
  let cache = caches.get(scene);
  if (!cache) {
    cache = new Map();
    caches.set(scene, cache);
    scene.onDisposeObservable.addOnce(() => {
      for (const promise of cache.values()) void promise.then((container) => container.dispose()).catch(() => {});
      caches.delete(scene);
    });
  }
  if (!cache.has(url)) {
    const filename = url.slice(url.lastIndexOf("/") + 1);
    const promise = SceneLoader.LoadAssetContainerAsync(url.slice(0, -filename.length), filename, scene)
      .catch((error) => { cache.delete(url); throw error; });
    cache.set(url, promise);
  }
  return cache.get(url);
};

export const createQuaterniusCharacter = async ({ scene, appearance = {}, gameClass, species }) => {
  const urls = resolveCharacterParts({ appearance, gameClass, species });
  const containers = await Promise.all(urls.map((url) => loadPart(scene, url)));
  const root = new TransformNode("characterRoot", scene);
  const instances = [];
  const materials = [];
  const duplicates = [];
  let animations = [];
  let weaponAnchor;
  try {
    for (const container of containers) {
      const entry = container.instantiateModelsToScene(undefined, false, { doNotInstantiate: false });
      instances.push(entry);
      entry.animationGroups.forEach((group) => group.stop());
      for (const node of entry.rootNodes) node.parent = root;
    }

    const skeleton = instances[0].skeletons[0];
    if (!skeleton) throw new Error("Missing Quaternius skeleton");
    for (const entry of instances.slice(1)) {
      const duplicate = entry.skeletons[0];
      if (!duplicate || duplicate.bones.length !== skeleton.bones.length ||
          duplicate.bones.some((bone, index) => bone.name !== skeleton.bones[index].name))
        throw new Error("Incompatible Quaternius part skeleton");
      for (const node of entry.rootNodes)
        for (const mesh of [node, ...node.getChildMeshes()])
          if (mesh.skeleton === duplicate) mesh.skeleton = skeleton;
      duplicates.push(duplicate);
    }

    const meshes = root.getChildMeshes();
    if (meshes.some((mesh) => mesh.skeleton && mesh.skeleton !== skeleton))
      throw new Error("Quaternius mesh could not share the primary skeleton");
    const skinColor = Color3.FromHexString(SKIN_TONES[appearance.skinTone] || SKIN_TONES.medium);
    const tintSkin = (source) => {
      if (!source || source.subMaterials || !source.name?.includes("Regular")) return source;
      const material = source.clone(`${source.name}-skin-${root.uniqueId}`);
      if ("albedoColor" in material) material.albedoColor = skinColor;
      else if ("diffuseColor" in material) material.diffuseColor = skinColor;
      materials.push(material);
      return material;
    };
    for (const mesh of meshes) {
      if (mesh.material?.subMaterials?.some((material) => material?.name?.includes("Regular"))) {
        const material = mesh.material.clone(`${mesh.material.name}-skin-${root.uniqueId}`, false);
        material.subMaterials = material.subMaterials.map(tintSkin);
        mesh.material = material;
        materials.push(material);
      } else {
        mesh.material = tintSkin(mesh.material);
      }
    }

    const hand = skeleton.bones.find((bone) => bone.name === QUATERNIUS_HAND_BONE)?.getTransformNode?.();
    if (!hand) throw new Error("Missing Quaternius right hand bone");
    weaponAnchor = new TransformNode("weaponAnchor", scene);
    weaponAnchor.parent = hand;
    animations = createQuaterniusAnimations(scene, skeleton);
    if (animations.some((group) => !group.targetedAnimations.length))
      throw new Error("Missing Quaternius animation bones");
    const bodyScale = BODY_SCALE[appearance.bodyType] || 1;
    root.scaling.set(bodyScale, 1, bodyScale);
    duplicates.forEach((duplicate) => duplicate.dispose());

    return {
      root, meshes, skeleton, animations, weaponAnchor, appearance,
      dispose() {
        animations.forEach((group) => { group.stop(); group.dispose(); });
        instances.forEach((entry) => entry.animationGroups.forEach((group) => { group.stop(); group.dispose(); }));
        root.dispose();
        skeleton.dispose();
        materials.forEach((material) => material.dispose());
      },
    };
  } catch (error) {
    animations.forEach((group) => group.dispose());
    instances.forEach((entry) => {
      entry.animationGroups.forEach((group) => group.dispose());
      entry.skeletons.forEach((skeleton) => skeleton.dispose());
    });
    root.dispose();
    materials.forEach((material) => material.dispose());
    throw error;
  }
};
