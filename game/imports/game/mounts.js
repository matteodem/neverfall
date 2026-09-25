import {
  SceneLoader,
  TransformNode,
} from "@babylonjs/core";

import "@babylonjs/loaders/glTF";

export const createHorseMount = async ({ scene, parent, character }) => {
  const result = await SceneLoader.ImportMeshAsync(
    "",
    "/models/mounts/",
    "horse-01.glb",
    scene
  );

  const root = result.meshes[0];
  root.name = "horse-mount";
  root.parent = parent;
  root.position.set(0, 0, 0);
  root.scaling.setAll(0.8);

  const riderAnchor = new TransformNode("riderAnchor", scene);
  riderAnchor.parent = root;
  riderAnchor.position.set(0, 1.9, -0.12);

  const idle = result.animationGroups.find((group) => group.name === "Idle");
  const run = result.animationGroups.find((group) => group.name === "Run" || group.name === "Walk");
  let mounted = false;
  let running = false;
  let currentAnimation = null;

  const play = (animation) => {
    if (!animation || animation === currentAnimation) return;
    currentAnimation?.stop();
    currentAnimation = animation;
    animation.start(true);
  };

  const setMounted = (value) => {
    if (mounted === value) return;
    mounted = value;

    if (mounted) {
      character.root.parent = riderAnchor;
      character.root.position.set(0, -0.7, 0);
      root.setEnabled(true);
      play(idle);
      return;
    }

    root.setEnabled(false);
    currentAnimation?.stop();
    currentAnimation = null;
    character.root.parent = parent;
    character.root.position.set(0, 0, 0);
  };

  root.setEnabled(false);

  return {
    setMounted,
    isMounted: () => mounted,
    setRunning(value) {
      running = value;
      if (mounted) play(running ? run : idle);
    },
    destroy() {
      currentAnimation?.stop();
      riderAnchor.dispose();
      root.dispose();
      result.animationGroups.forEach((group) => group.dispose());
    },
  };
};
