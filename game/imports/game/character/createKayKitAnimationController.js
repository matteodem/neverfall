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
    attackDuration = 500,
  }) => {
    const attack = getAnimation(animations, "Attack_A");
    let attackRemaining = 0;
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

    const jumpStart = getAnimation(animations, "Jump_Start") || jump;
    const jumpIdle = getAnimation(animations, "Jump_Idle") || jump;
    const jumpLand = getAnimation(animations, "Jump_Land");
    // Only the local controller supplies physical phases; remote playback stays unchanged.
    let airbornePhase = null;
    let airborneElapsed = 0;
    let landingRemaining = 0;

    const death =
      getAnimation(
        animations,
        "Death_A"
      );


    const chatAnimations = {
      walk: getAnimation(animations, "Walking_A"),
      idle: idle,
      interact: getAnimation(animations, "Interact"),
    };
    let chatAnimation = "";
    let visible = true;

    let running =
      false;

    let jumping =
      false;

    let mounted =
      false;

    let currentAnimation =
      null;


    const play =
      (
        animation,
        loop = true,
        speedRatio = 1
      ) => {
        if (
          !visible ||
          !animation ||
          animation ===
            currentAnimation
        ) {
          return;
        }


        currentAnimation?.stop();

        currentAnimation =
          animation;

        if (airbornePhase !== null) {
          animation.enableBlending = true;
          animation.blendingSpeed = 0.15;
        }

        animation.start(
          loop,
          speedRatio
        );
      };

    const stopAttack = () => {
      attackRemaining = 0;
      if (currentAnimation === attack) {
        attack.stop();
        currentAnimation = null;
      }
    };

    const playAttack = () => {
      if (!attack || !visible || mounted || jumping || (airbornePhase && airbornePhase !== "grounded")) return false;
      stopAttack();
      attackRemaining = attackDuration;
      // Fit the authored one-shot to the existing visual swing window, not combat cooldowns.
      const fps = attack.targetedAnimations[0].animation.framePerSecond;
      const speed = (attack.to - attack.from) / fps / (attackDuration / 1000);
      attack.enableBlending = true;
      attack.blendingSpeed = 0.15;
      play(attack, false, speed);
      return true;
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


    const setMounted =
      (
        value
      ) => {
        mounted =
          value;

        if (
          mounted
        ) {
          stopAttack();
          running =
            false;

          jumping =
            false;

          play(
            idle
          );
        }
      };


    const update =
      (deltaTime = 0) => {
        if (
          mounted
        ) {
          play(
            idle
          );

          return;
        }

        if (airbornePhase && airbornePhase !== "grounded") {
          stopAttack();
          airborneElapsed += deltaTime;
          if (airbornePhase === "rising" && currentAnimation !== jumpStart && currentAnimation !== jumpIdle) {
            play(jumpStart, false);
          } else if (airbornePhase === "falling" || !currentAnimation?.isPlaying) {
            play(jumpIdle, true);
          }
          return;
        }
        if (landingRemaining > 0 && jumpLand) {
          stopAttack();
          landingRemaining = Math.max(0, landingRemaining - deltaTime);
          play(jumpLand, false);
          return;
        }


        if (
          jumping
        ) {
          stopAttack();
          play(
            jump,
            false
          );

          return;
        }


        if (attackRemaining > 0) {
          attackRemaining = Math.max(0, attackRemaining - deltaTime);
          if (attackRemaining > 0) return;
          stopAttack();
        }

        if (chatAnimation && !running) {
          play(chatAnimations[chatAnimation], chatAnimation !== "interact");
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
        stopAttack();
        currentAnimation =
          null;

        play(
          hit,
          false
        );
      };


    const playDeath =
      () => {
        stopAttack();
        currentAnimation =
          null;

        play(
          death,
          false
        );
      };


    const destroy =
      () => {
        stopAttack();
        animations.forEach(
          (animation) =>
            animation.stop()
        );

        currentAnimation =
          null;
      };


    return {
      setAirborneState(phase) {
        if (phase === airbornePhase) return;
        // Ignore tiny terrain-edge drops and mounted transitions.
        landingRemaining = phase === "grounded" && airborneElapsed >= 100 && !mounted ? 150 : 0;
        if (!phase || phase === "grounded") airborneElapsed = 0;
        airbornePhase = phase;
      },
      resetAirborneState() {
        stopAttack();
        airbornePhase = "grounded";
        airborneElapsed = 0;
        landingRemaining = 0;
        jumping = false;
      },
      setChatAnimation(value) { chatAnimation = value; },
      setVisible(value) {
        visible = value;
        if (!value) stopAttack();
        if (!value) currentAnimation?.pause();
        else if (currentAnimation?.isStarted) currentAnimation.restart();
      },
      setRunning,
      setJumping,
      setMounted,

      update,

      playHit,
      playDeath,
      playAttack,
      stopAttack,

      destroy,
    };
  };
