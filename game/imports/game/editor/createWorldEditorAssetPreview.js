import { ArcRotateCamera, DirectionalLight, Engine, HemisphericLight, Scene, Vector3 } from "@babylonjs/core";
import { createEditorAssetCache } from "./loadEditorAsset";

// A small independent engine, with no attached camera/gameplay controls.
export const createWorldEditorAssetPreview = (canvas, { onLoading, onError }) => {
  const engine = new Engine(canvas, true, { alpha: true });
  const scene = new Scene(engine);
  scene.clearColor.set(0, 0, 0, 0);
  const camera = new ArcRotateCamera("asset-preview", -Math.PI / 2 + 0.45, Math.PI / 2.8, 4, Vector3.Zero(), scene);
  new HemisphericLight("asset-preview-ambient", Vector3.Up(), scene).intensity = 0.9;
  new DirectionalLight("asset-preview-front", new Vector3(-0.5, -1, 1), scene).intensity = 0.8;
  const assets = createEditorAssetCache(scene);
  let root = null, disposed = false, request = 0;
  const fit = () => {
    if (!root) return;
    const { min, max } = root.getHierarchyBoundingVectors(true, (mesh) => mesh.getTotalVertices() > 0);
    const radius = Math.max(0.01, Vector3.Distance(min, max) / 2);
    const aspect = engine.getRenderWidth() / Math.max(1, engine.getRenderHeight());
    const halfFov = Math.min(camera.fov / 2, Math.atan(Math.tan(camera.fov / 2) * aspect));
    camera.setTarget(min.add(max).scale(0.5));
    camera.radius = radius / Math.sin(halfFov) * 1.15;
    camera.minZ = Math.max(0.001, radius / 100);
  };
  const resize = () => { if (!disposed) { engine.resize(); fit(); } };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  engine.runRenderLoop(() => scene.render());

  return {
    async setAsset(assetId) {
      const current = ++request;
      onLoading(true);
      onError(null);
      root?.dispose();
      root = null;
      try {
        const asset = await assets.get(assetId);
        if (disposed || current !== request || !asset) return;
        root = asset.place(Vector3.Zero());
        for (const mesh of root.getChildMeshes()) mesh.isPickable = false;
        fit();
        await scene.whenReadyAsync();
        if (!disposed && current === request) onLoading(false);
      } catch {
        if (disposed || current !== request) return;
        root?.dispose();
        root = null;
        onError("Could not preview this asset. Choose another asset or reopen Build Mode.");
        onLoading(false);
      }
    },
    dispose() {
      disposed = true;
      request++;
      observer.disconnect();
      engine.stopRenderLoop();
      root?.dispose();
      assets.dispose();
      scene.dispose();
      engine.dispose();
    },
  };
};
