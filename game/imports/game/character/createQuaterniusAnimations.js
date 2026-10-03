import { Animation, AnimationGroup, Quaternion } from "@babylonjs/core";

const POSE_BONES = ["pelvis", "spine_02", "thigh_l", "thigh_r", "upperarm_l", "upperarm_r"];

// The modular exports contain only one jog clip. These small rig poses provide
// the states expected by the existing player animation controller for both genders.
export const createQuaterniusAnimations = (scene, skeleton) => {
  const bones = new Map(skeleton.bones.map((bone) => [bone.name, bone.getTransformNode?.()]));
  if (POSE_BONES.some((name) => !bones.get(name)))
    throw new Error("Missing Quaternius animation bone transform");
  const groups = [];

  const create = (name, poses) => {
    const group = new AnimationGroup(`Knight_${name}`, scene);
    const duration = Math.max(...Object.values(poses).map((frames) => frames.at(-1)[0]));
    for (const boneName of POSE_BONES) {
      const node = bones.get(boneName);
      if (!node) continue;
      const frames = poses[boneName] || [[0, 0], [duration, 0]];
      const rest = node.rotationQuaternion?.clone() || Quaternion.FromEulerVector(node.rotation);
      node.rotationQuaternion = rest.clone();
      const animation = new Animation(`${name}-${boneName}`, "rotationQuaternion", 30,
        Animation.ANIMATIONTYPE_QUATERNION, Animation.ANIMATIONLOOPMODE_CYCLE);
      animation.setKeys(frames.map(([frame, x, y = 0, z = 0]) => ({
        frame, value: rest.multiply(Quaternion.FromEulerAngles(x, y, z)),
      })));
      group.addTargetedAnimation(animation, node);
    }
    groups.push(group);
  };

  create("Idle_A", {
    spine_02: [[0, -0.015], [30, 0.015], [60, -0.015]],
  });
  create("Running_A", {
    thigh_l: [[0, 0.55], [8, 0], [16, -0.55], [24, 0], [32, 0.55]],
    thigh_r: [[0, -0.55], [8, 0], [16, 0.55], [24, 0], [32, -0.55]],
    upperarm_l: [[0, -0.45], [8, 0], [16, 0.45], [24, 0], [32, -0.45]],
    upperarm_r: [[0, 0.45], [8, 0], [16, -0.45], [24, 0], [32, 0.45]],
  });
  create("Walking_A", {
    thigh_l: [[0, 0.28], [15, -0.28], [30, 0.28]],
    thigh_r: [[0, -0.28], [15, 0.28], [30, -0.28]],
    upperarm_l: [[0, -0.2], [15, 0.2], [30, -0.2]],
    upperarm_r: [[0, 0.2], [15, -0.2], [30, 0.2]],
  });
  create("Jump_Full_Short", {
    thigh_l: [[0, 0], [10, 0.45], [30, 0]],
    thigh_r: [[0, 0], [10, 0.45], [30, 0]],
    upperarm_l: [[0, 0], [10, -0.4], [30, 0]],
    upperarm_r: [[0, 0], [10, -0.4], [30, 0]],
  });
  create("Hit_A", { spine_02: [[0, 0], [8, -0.3], [20, 0]] });
  create("Death_A", { pelvis: [[0, 0], [30, 1.35]] });
  create("Interact", { upperarm_r: [[0, 0], [10, -0.6], [25, 0]] });
  return groups;
};
