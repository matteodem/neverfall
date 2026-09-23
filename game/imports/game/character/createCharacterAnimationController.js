import {
  CHARACTER_SCALE,
} from "./createLowPolyCharacter";

export const createCharacterAnimationController =
  ({
    root,
    parts,
  }) => {
    let running =
      false;

    let jumping =
      false;

    let time =
      0;


    const resetLimbs =
      () => {
        parts.leftArmPivot.rotation.x =
          0;

        parts.rightArmPivot.rotation.x =
          0;

        parts.leftLegPivot.rotation.x =
          0;

        parts.rightLegPivot.rotation.x =
          0;
      };


    const setRunning =
      (
        value
      ) => {
        running =
          value;
      };


    const setJumping =
      (
        value
      ) => {
        jumping =
          value;
      };


    const update =
      (
        deltaTime
      ) => {
        time +=
          deltaTime /
          1000;


        /*
         * JUMP
         */

        if (
          jumping
        ) {
          parts.leftArmPivot.rotation.x =
            -0.55;

          parts.rightArmPivot.rotation.x =
            -0.55;

          parts.leftLegPivot.rotation.x =
            0.2;

          parts.rightLegPivot.rotation.x =
            0.2;

          return;
        }


        /*
         * RUN
         */

        if (
          running
        ) {
          const swing =
            Math.sin(
              time * 10
            ) *
            0.65;

          parts.leftArmPivot.rotation.x =
            swing;

          parts.rightArmPivot.rotation.x =
            -swing;

          parts.leftLegPivot.rotation.x =
            -swing;

          parts.rightLegPivot.rotation.x =
            swing;

          return;
        }


        /*
         * IDLE
         *
         * Small breathing motion.
         */

        resetLimbs();

        root.scaling.y =
          CHARACTER_SCALE *
          (
            1 +
            Math.sin(
              time * 2
            ) *
              0.008
          );
      };


    const destroy =
      () => {
        resetLimbs();

        root.scaling.y =
          CHARACTER_SCALE;
      };


    return {
      setRunning,
      setJumping,
      update,
      destroy,
    };
  };