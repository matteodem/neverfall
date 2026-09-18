import {
  Color3,
  StandardMaterial,
  TrailMesh,
  Vector3,
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

  player,

  sword,
  swordPivot,
  swordTip,

  enemy,
  enemyMaterial,

  enemyHpRef,
  setEnemyHp,
}) => {
  let attacking = false;
  let attackProgress = 0;
  let damageApplied = false;

  /*
   * =====================================================
   * ORIGINAL SWORD/HAND ROTATION
   * =====================================================
   */

  const defaultRotation =
    swordPivot.rotation.clone();

  /*
   * =====================================================
   * SWOOSH
   * =====================================================
   *
   * IMPORTANT:
   * Trail follows sword TIP,
   * not sword origin.
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
   * HIT
   * =====================================================
   */

  const hitEnemy = () => {
    if (
      enemyHpRef.current <= 0
    ) {
      return;
    }

    const distance =
      Vector3.Distance(
        player.position,
        enemy.position
      );

    if (
      distance >
      ATTACK.range
    ) {
      return;
    }

    const nextHp =
      Math.max(
        0,
        enemyHpRef.current -
          ATTACK.damage
      );

    enemyHpRef.current =
      nextHp;

    setEnemyHp(
      nextHp
    );

    /*
     * FLASH
     */

    enemyMaterial.diffuseColor =
      new Color3(
        1,
        1,
        1
      );

    setTimeout(() => {
      if (
        !enemy.isDisposed()
      ) {
        enemyMaterial.diffuseColor =
          new Color3(
            0.8,
            0.1,
            0.1
          );
      }
    }, 100);

    /*
     * KNOCKBACK
     */

    const direction =
      enemy.position
        .subtract(
          player.position
        )
        .normalize();

    enemy.position.addInPlace(
      direction.scale(
        ATTACK.knockback
      )
    );

    /*
     * DEATH
     */

    if (nextHp <= 0) {
      setTimeout(() => {
        enemy.setEnabled(
          false
        );
      }, 200);
    }
  };

  /*
   * =====================================================
   * ATTACK START
   * =====================================================
   */

  const startAttack = () => {
    if (
      attacking ||
      enemyHpRef.current <= 0
    ) {
      return;
    }

    attacking = true;
    attackProgress = 0;
    damageApplied = false;

    /*
     * Start with no trail during
     * the wind-up.
     */

    trail.setEnabled(
      false
    );
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
   * ============================================
   * 1. WIND-UP
   *
   * Sword goes backwards and up.
   * ============================================
   */

  if (progress < 0.25) {
    const t =
      progress / 0.25;

    /*
     * Pull sword backwards.
     */

    swordPivot.rotation.x =
      lerp(
        defaultRotation.x,
        defaultRotation.x -
          0.9,
        t
      );

    /*
     * Move sword to player's right side.
     */

    swordPivot.rotation.y =
      lerp(
        defaultRotation.y,
        defaultRotation.y +
          0.65,
        t
      );

    /*
     * Lift weapon slightly.
     */

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
   * ============================================
   * 2. FORWARD SLASH
   *
   * This is the actual hit.
   * ============================================
   */

  if (progress < 0.65) {
    let t =
      (progress - 0.25) /
      0.4;

    t =
      easeOutCubic(
        t
      );

    trail.setEnabled(
      true
    );

    /*
     * Main movement:
     *
     * Sword swings from behind the player
     * strongly FORWARD.
     */

    swordPivot.rotation.x =
      lerp(
        defaultRotation.x -
          0.9,
        defaultRotation.x +
          1.15,
        t
      );

    /*
     * Sweep across body.
     */

    swordPivot.rotation.y =
      lerp(
        defaultRotation.y +
          0.65,
        defaultRotation.y -
          0.55,
        t
      );

    /*
     * Small diagonal component.
     */

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
   * ============================================
   * 3. RECOVERY
   * ============================================
   */

  trail.setEnabled(
    false
  );

  const t =
    (progress - 0.65) /
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

    updateAttackAnimation(
      attackProgress
    );

    /*
     * Damage happens during
     * fastest part of slash.
     */

    if (
      attackProgress >= 0.42 &&
      !damageApplied
    ) {
      damageApplied =
        true;

      hitEnemy();
    }

    /*
     * Finish.
     */

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