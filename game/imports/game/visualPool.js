// Bound retained visuals while allowing active effects to grow as needed.
export const createVisualPool = ({ create, dispose, setEnabled, limit = 32 }) => {
  const idle = [];
  const all = new Set();
  let created = 0;
  return {
    acquire() {
      let visual = idle.pop();
      if (!visual) {
        visual = create();
        all.add(visual);
        created++;
      }
      setEnabled(visual, true);
      return visual;
    },
    release(visual) {
      setEnabled(visual, false);
      if (idle.length < limit) idle.push(visual);
      else { all.delete(visual); dispose(visual); }
    },
    getStats: () => ({ retained: all.size, idle: idle.length, created }),
    destroy() {
      for (const visual of all) dispose(visual);
      all.clear();
      idle.length = 0;
    },
  };
};
