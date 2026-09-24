const getAnimation = (
  animations,
  name
) => {
  return animations.find(
    (animation) =>
      animation.name ===
      `Knight_${name}`
  );
};


export const createKayKitAnimationController =
  ({
    animations,
  }) => {
    const idle =
      getAnimation(
        animations,
        "Idle_A"
      );

    const run =
      getAnimation(
        animations,
        "Running_A"
      );

    const jump =
      getAnimation(
        animations,
        "Jump_Full_Short"
      );

    const hit =
      getAnimation(
        animations,
        "Hit_A"
      );

    const death =
      getAnimation(
        animations,
        "Death_A"
      );


    let running =
      false;

    let jumping =
      false;

    let currentAnimation =
      null;


    const play =
      (
        animation,
        loop = true
      ) => {
        if (
          !animation
        ) {
          return;
        }


        if (
          animation ===
          currentAnimation
        ) {
          return;
        }


        currentAnimation?.stop();


        currentAnimation =
          animation;


        animation.start(
          loop
        );
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
      () => {
        if (
          jumping
        ) {
          play(
            jump,
            false
          );

          return;
        }


        if (
          running
        ) {
          play(
            run
          );

          return;
        }


        play(
          idle
        );
      };


    const playHit =
      () => {
        currentAnimation =
          null;

        play(
          hit,
          false
        );
      };


    const playDeath =
      () => {
        currentAnimation =
          null;

        play(
          death,
          false
        );
      };


    const destroy =
      () => {
        animations.forEach(
          (animation) =>
            animation.stop()
        );

        currentAnimation =
          null;
      };


    return {
      setRunning,
      setJumping,

      update,

      playHit,
      playDeath,

      destroy,
    };
  };