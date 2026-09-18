export const createPlayerAnimationController = (
  animationGroups = []
) => {
  const findAnimation = (...names) => {
    const normalizedNames =
      names.map((name) =>
        name.toLowerCase()
      );

    return animationGroups.find(
      (animation) =>
        normalizedNames.includes(
          animation.name.toLowerCase()
        )
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

  let running = false;

  idleAnimation?.start(
    true
  );

  const setRunning = (
    shouldRun
  ) => {
    if (
      shouldRun === running
    ) {
      return;
    }

    running = shouldRun;

    if (running) {
      idleAnimation?.stop();

      runAnimation?.start(
        true
      );

      return;
    }

    runAnimation?.stop();

    idleAnimation?.start(
      true
    );
  };

  return {
    setRunning,

    destroy() {
      runAnimation?.stop();
      idleAnimation?.stop();
    },
  };
};