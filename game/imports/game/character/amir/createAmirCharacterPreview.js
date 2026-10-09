import { ArcRotateCamera, DirectionalLight, Engine, HemisphericLight, Scene, Vector3 } from "@babylonjs/core";
import { createAmirCharacter } from "./createAmirCharacter";

// Rendering stays outside React and uses exactly the local player's production assembly.
export const createAmirCharacterPreview = (canvas, { onLoading, onError }) => {
  const engine = new Engine(canvas, true, { alpha: true });
  const scene = new Scene(engine);
  scene.clearColor.set(0, 0, 0, 0);
  new ArcRotateCamera("character-preview", Math.PI / 2, Math.PI / 2.3, 3.6, new Vector3(0, 1, 0), scene);
  new HemisphericLight("preview-ambient", new Vector3(0, 1, 0), scene).intensity = 1;
  new DirectionalLight("preview-front", new Vector3(0, -0.5, -1), scene).intensity = 0.8;
  let actor = null;
  let controller = null;
  let disposed = false;
  let request = 0;
  let rotation = 0;
  let previousX = null;
  const pointerDown = (event) => {
    if (event.button !== 0 && event.button !== 2) return;
    previousX = event.clientX;
    canvas.setPointerCapture(event.pointerId);
  };
  const pointerMove = (event) => {
    if (previousX === null) return;
    rotation += (event.clientX - previousX) * 0.01;
    previousX = event.clientX;
    if (actor) actor.root.rotation.y = rotation;
  };
  const pointerUp = (event) => {
    previousX = null;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  };
  const contextMenu = (event) => event.preventDefault();
  const events = { pointerdown: pointerDown, pointermove: pointerMove, pointerup: pointerUp,
    pointercancel: pointerUp, lostpointercapture: () => { previousX = null; }, contextmenu: contextMenu };
  for (const [type, handler] of Object.entries(events)) canvas.addEventListener(type, handler);
  const resize = () => engine.resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  window.addEventListener("resize", resize);
  engine.runRenderLoop(() => {
    controller?.update(engine.getDeltaTime());
    scene.render();
  });

  return {
    async setAppearance(appearance, gameClass) {
      const current = ++request;
      onLoading(true);
      onError(null);
      controller?.destroy();
      actor?.dispose();
      controller = null;
      actor = null;
      try {
        const next = await createAmirCharacter({ scene, appearance, gameClass });
        if (disposed || current !== request) { next.dispose(); return; }
        actor = next;
        actor.root.rotation.y = rotation;
        controller = actor.createAnimationController();
        controller.update(0);
        onLoading(false);
      } catch (error) {
        if (disposed || current !== request) return;
        console.error("[CharacterPreview] Failed to load Amir character", error);
        onError("Could not preview this appearance. Choose another combination or reopen this step.");
        onLoading(false);
      }
    },
    dispose() {
      disposed = true;
      request++;
      observer.disconnect();
      window.removeEventListener("resize", resize);
      for (const [type, handler] of Object.entries(events)) canvas.removeEventListener(type, handler);
      controller?.destroy();
      actor?.dispose();
      scene.dispose();
      engine.dispose();
    },
  };
};
