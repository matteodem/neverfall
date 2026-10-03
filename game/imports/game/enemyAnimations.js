// Boars use ranges in one clip; wolves provide separate named clips.
export const createEnemyAnimations = (groups, clips) => {
  let visible = true;
  let current = null;
  let attacking = false;
  let dying = false;
  for (const group of groups) group.stop();

  const play = (name, loop = true) => {
    if (!visible) return;
    const clip = clips[name];
    const group = typeof clip === "string"
      ? groups.find((candidate) => candidate.name === clip || candidate.name === `Clone of ${clip}`)
      : groups[0];
    if (!group || (current === name && group.isPlaying)) return;
    for (const candidate of groups) candidate.stop();
    current = name;
    group.start(loop, 1, clip.from ?? group.from, clip.to ?? group.to);
    return group;
  };

  const idle = () => { if (!attacking && !dying) play("idle"); };
  const walk = () => { if (!attacking && !dying) play("walk"); };
  const run = () => { if (!attacking && !dying) play(clips.run ? "run" : "walk"); };
  const attack = (name = "attack") => {
    if (attacking || dying) return;
    const group = play(name, false);
    if (!group) return;
    attacking = true;
    group.onAnimationGroupEndObservable.addOnce(() => {
      attacking = false;
      idle();
    });
  };

  idle();
  return {
    setVisible(value) {
      visible = value;
      for (const group of groups) {
        if (!value && group.isPlaying) group.pause();
        else if (value && group.isStarted) group.restart();
      }
    },
    idle,
    walk,
    run,
    attack,
    heavyAttack() { if (clips.heavyAttack) attack("heavyAttack"); },
    death(onEnd) {
      if (!clips.death || !visible) return false;
      dying = true;
      const group = play("death", false);
      if (!group) return false;
      group.onAnimationGroupEndObservable.addOnce(onEnd);
      return true;
    },
    destroy() {
      for (const group of groups) group.dispose();
    },
  };
};
