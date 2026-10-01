// Let rendering run between batches of deferred environment work.
export const createFrameBudget = (scene, milliseconds = 5) => {
  let deadline = performance.now() + milliseconds;
  let disposed = false;
  scene.onDisposeObservable.addOnce(() => { disposed = true; });

  return async () => {
    if (disposed) throw new Error("Scene disposed while loading environment");
    if (performance.now() < deadline) return;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    if (disposed) throw new Error("Scene disposed while loading environment");
    deadline = performance.now() + milliseconds;
  };
};
