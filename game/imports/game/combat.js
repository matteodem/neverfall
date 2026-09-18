import {
  Color3,
  Vector3,
} from "@babylonjs/core";

import {
  ATTACK,
} from "./config";

export const createCombat = ({
  player,
  sword,
  enemy,
  enemyMaterial,
  enemyHpRef,
  setEnemyHp,
}) => {
  let attacking = false;
  let attackProgress = 0;
  let damageApplied = false;

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
      distance > ATTACK.range
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

    if (nextHp <= 0) {
      setTimeout(() => {
        enemy.setEnabled(
          false
        );
      }, 200);
    }
  };

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
  };

  const update = (
    deltaTime
  ) => {
    if (!attacking) {
      return;
    }

    attackProgress +=
      deltaTime /
      ATTACK.duration;

    sword.rotation.z =
      Math.PI / 4 -
      Math.sin(
        attackProgress *
          Math.PI
      ) *
        2;

    if (
      attackProgress > 0.35 &&
      !damageApplied
    ) {
      damageApplied = true;

      hitEnemy();
    }

    if (
      attackProgress >= 1
    ) {
      attacking = false;
      attackProgress = 0;

      sword.rotation.z =
        Math.PI / 4;
    }
  };

  return {
    startAttack,
    update,
  };
};