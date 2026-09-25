// Boars use ranges in one clip; wolves provide separate named clips.
export const createEnemyAnimations = (groups, clips) => {
  let current = null;
  let attacking = false;
  for (const group of groups) group.stop();

  const play = (name, loop = true) => {
    const clip = clips[name];
    const group = typeof clip === "string"
      ? groups.find((candidate) => candidate.name === clip)
      : groups[0];
    if (!group || (current === name && group.isPlaying)) return;
    for (const candidate of groups) candidate.stop();
    current = name;
    group.start(loop, 1, clip.from ?? group.from, clip.to ?? group.to);
    return group;
  };

  const idle = () => { if (!attacking) play("idle"); };
  const walk = () => { if (!attacking) play("walk"); };
  const attack = () => {
    if (attacking) return;
    const group = play("attack", false);
    if (!group) return;
    attacking = true;
    group.onAnimationGroupEndObservable.addOnce(() => {
      attacking = false;
      idle();
    });
  };

  idle();
  return {
    idle,
    walk,
    attack,
    destroy() {
      for (const group of groups) group.dispose();
    },
  };
};
