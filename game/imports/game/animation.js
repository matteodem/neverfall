export const createPlayerAnimationController = (
  animationGroups = []
) => {
  const findAnimation = (
    ...names
  ) => {
    const normalizedNames =
      names.map(
        (name) =>
          name.toLowerCase()
      );

    return animationGroups.find(
      (animation) => {
        const animationName =
          animation.name.toLowerCase();

        return normalizedNames.some(
          (name) =>
            animationName.includes(
              name
            )
        );
      }
    );
  };

  const runAnimation =
    findAnimation(
      "Run",
      "Running",
      "run",
      "running"
    );

  const idleAnimation =
    findAnimation(
      "Idle",
      "idle"
    );

  const jumpAnimation =
     findAnimation(
      "jump",
      "jumping",
      "jump start",
      "jump_start",
      "jumpstart"
    );

  let running =
    false;

  let jumping =
    false;

  let currentAnimation =
    null;

  const playAnimation = (
    animation,
    loop = true
  ) => {
    if (
      !animation ||
      currentAnimation ===
        animation
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

  const playIdle = () => {
    playAnimation(
      idleAnimation,
      true
    );
  };

  const updateAnimation = () => {
    /*
     * Jump always has priority
     * over running and idle.
     */

    if (jumping) {
      playAnimation(
        jumpAnimation,
        false
      );

      return;
    }

    if (running) {
      playAnimation(
        runAnimation,
        true
      );

      return;
    }

    playIdle();
  };

  /*
   * Start idle.
   */

  playIdle();

  const setRunning = (
    shouldRun
  ) => {
    if (
      shouldRun === running
    ) {
      return;
    }

    running =
      shouldRun;

    updateAnimation();
  };

  const setJumping = (
    shouldJump
  ) => {
    if (
      shouldJump === jumping
    ) {
      return;
    }

    jumping =
      shouldJump;

    updateAnimation();
  };

  return {
    setRunning,
    setJumping,

    destroy() {
      for (
        const animation
        of animationGroups
      ) {
        animation.stop();
      }

      currentAnimation =
        null;
    },
  };
};