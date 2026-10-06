// Serialize ownership and selection changes while a guest transfer is in progress.
const pending = new Map();

export const withCharacterSlots = async (userIds, action) => {
  const releases = [];
  try {
    for (const userId of [...new Set(userIds)].sort()) {
      const previous = pending.get(userId) || Promise.resolve();
      let release;
      const current = new Promise((resolve) => { release = resolve; });
      pending.set(userId, current);
      await previous;
      releases.push(() => {
        release();
        if (pending.get(userId) === current) pending.delete(userId);
      });
    }
    return await action();
  } finally {
    for (const release of releases.reverse()) release();
  }
};

export const lockCharacterChanges = (method) => async function (...args) {
  return withCharacterSlots([this.userId], () => method.apply(this, args));
};
