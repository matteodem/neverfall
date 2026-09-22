import {
  Color3,
  StandardMaterial,
  TrailMesh,
} from "@babylonjs/core";

import {
  ATTACK,
} from "./config";

const lerp = (
  from,
  to,
  progress
) => {
  return (
    from +
    (to - from) *
      progress
  );
};

const easeOutCubic = (
  progress
) => {
  return (
    1 -
    Math.pow(
      1 - progress,
      3
    )
  );
};

export const createCombat = ({
  scene,
  swordPivot,
  swordTip,
}) => {
  let attacking =
    false;

  let attackProgress =
    0;

  let attackAvailableAt =
    0;

  /*
   * =====================================================
   * ORIGINAL SWORD ROTATION
   * =====================================================
   */

  const defaultRotation =
    swordPivot.rotation.clone();

  /*
   * =====================================================
   * SWOOSH
   * =====================================================
   */

  const trail =
    new TrailMesh(
      "swordTrail",
      swordTip,
      scene,
      0.12,
      25,
      true
    );

  const trailMaterial =
    new StandardMaterial(
      "swordTrailMaterial",
      scene
    );

  trailMaterial.emissiveColor =
    new Color3(
      0.75,
      0.9,
      1
    );

  trailMaterial.diffuseColor =
    new Color3(
      0.4,
      0.7,
      1
    );

  trailMaterial.alpha =
    0.65;

  trail.material =
    trailMaterial;

  trail.setEnabled(
    false
  );

  /*
   * =====================================================
   * ATTACK START
   * =====================================================
   */

  const startAttack =
    () => {
      const now =
        Date.now();

      if (
        now <
        attackAvailableAt
      ) {
        return false;
      }

      attackAvailableAt =
        now +
        ATTACK.cooldown;

      attacking =
        true;

      attackProgress =
        0;

      return true;
    };

  /*
   * =====================================================
   * ATTACK ANIMATION
   * =====================================================
   */

  const updateAttackAnimation = (
    progress
  ) => {
    /*
     * WIND-UP
     */

    if (
      progress < 0.25
    ) {
      const t =
        progress / 0.25;

      swordPivot.rotation.x =
        lerp(
          defaultRotation.x,
          defaultRotation.x -
            0.9,
          t
        );

      swordPivot.rotation.y =
        lerp(
          defaultRotation.y,
          defaultRotation.y +
            0.65,
          t
        );

      swordPivot.rotation.z =
        lerp(
          defaultRotation.z,
          defaultRotation.z -
            0.35,
          t
        );

      trail.setEnabled(
        false
      );

      return;
    }

    /*
     * FORWARD SLASH
     */

    if (
      progress < 0.65
    ) {
      let t =
        (
          progress -
          0.25
        ) /
        0.4;

      t =
        easeOutCubic(
          t
        );

      trail.setEnabled(
        true
      );

      swordPivot.rotation.x =
        lerp(
          defaultRotation.x -
            0.9,
          defaultRotation.x +
            1.15,
          t
        );

      swordPivot.rotation.y =
        lerp(
          defaultRotation.y +
            0.65,
          defaultRotation.y -
            0.55,
          t
        );

      swordPivot.rotation.z =
        lerp(
          defaultRotation.z -
            0.35,
          defaultRotation.z +
            0.25,
          t
        );

      return;
    }

    /*
     * RECOVERY
     */

    trail.setEnabled(
      false
    );

    const t =
      (
        progress -
        0.65
      ) /
      0.35;

    swordPivot.rotation.x =
      lerp(
        defaultRotation.x +
          1.15,
        defaultRotation.x,
        t
      );

    swordPivot.rotation.y =
      lerp(
        defaultRotation.y -
          0.55,
        defaultRotation.y,
        t
      );

    swordPivot.rotation.z =
      lerp(
        defaultRotation.z +
          0.25,
        defaultRotation.z,
        t
      );
  };

  /*
   * =====================================================
   * UPDATE
   * =====================================================
   */

  const update = (
    deltaTime
  ) => {
    if (!attacking) {
      return;
    }

    attackProgress +=
      deltaTime /
      ATTACK.duration;

    /*
     * Prevent progress from
     * going above 1.
     */
    const progress =
      Math.min(
        attackProgress,
        1
      );

    updateAttackAnimation(
      progress
    );

    if (
      attackProgress >= 1
    ) {
      attacking =
        false;

      attackProgress =
        0;

      trail.setEnabled(
        false
      );

      swordPivot.rotation.copyFrom(
        defaultRotation
      );
    }
  };

  /*
   * =====================================================
   * CLEANUP
   * =====================================================
   */

  const destroy = () => {
    trail.dispose();

    trailMaterial.dispose();
  };

  return {
    startAttack,
    update,
    destroy,
  };
};