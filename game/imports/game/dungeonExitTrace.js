// Temporary production diagnostics. Correlate client/server logs by room/session IDs;
// never include auth or reconnection tokens. Durations use each process's own clock.
export const createDungeonExitTrace = (context) => {
  const startedAt = Date.now();
  return (stage, details = {}) => console.info(`[dungeon-exit] ${stage}`, {
    at: new Date().toISOString(),
    elapsedMs: Date.now() - startedAt,
    ...context,
    ...details,
  });
};
