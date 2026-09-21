import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  Scene,
  SceneLoader,
  TransformNode,
  Vector3,
} from "@babylonjs/core";

import "@babylonjs/loaders/glTF";

export const CharacterPreview = ({
  assetFile,
}) => {
  const canvasRef =
    useRef(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(
    true
  );

  useEffect(
    () => {
      const canvas =
        canvasRef.current;

      if (
        !canvas ||
        !assetFile
      ) {
        return;
      }

      setLoading(
        true
      );

      const engine =
        new Engine(
          canvas,
          true,
          {
            alpha: true,
          }
        );

      const scene =
        new Scene(
          engine
        );

      scene.clearColor.set(
        0,
        0,
        0,
        0
      );

      /*
       * CAMERA
       */

      const camera =
        new ArcRotateCamera(
          "characterPreviewCamera",

          Math.PI / 2,

          Math.PI / 2.3,

          4,

          new Vector3(
            0,
            1,
            0
          ),

          scene
        );

      /*
       * LIGHT
       */

      const light =
        new HemisphericLight(
          "characterPreviewLight",

          new Vector3(
            0,
            1,
            0
          ),

          scene
        );

      light.intensity =
        1.3;

      /*
       * CHARACTER ROOT
       */

      const characterRoot =
        new TransformNode(
          "characterPreviewRoot",
          scene
        );

      /*
       * LOAD CHARACTER
       */

      const load =
        async () => {
          try {
            const slash =
              assetFile.lastIndexOf(
                "/"
              );

            const rootUrl =
              assetFile.slice(
                0,
                slash + 1
              );

            const filename =
              assetFile.slice(
                slash + 1
              );

            const result =
              await SceneLoader.ImportMeshAsync(
                "",
                rootUrl,
                filename,
                scene
              );

            for (
              const mesh
              of result.meshes
            ) {
              if (!mesh.parent) {
                mesh.parent =
                  characterRoot;
              }
            }

            const idle =
              result.animationGroups.find(
                (
                  animation
                ) =>
                  animation.name
                    .toLowerCase()
                    .includes(
                      "idle"
                    )
              );

            idle?.start(
              true
            );

            setLoading(
              false
            );
          } catch (
            error
          ) {
            console.error(
              "[CharacterPreview]",
              error
            );

            setLoading(
              false
            );
          }
        };

      load();

      /*
       * CHARACTER ROTATION
       */

      let dragging =
        false;

      let previousX =
        0;

      const ROTATION_SPEED =
        0.01;

      const pointerDown = (
        event
      ) => {
        if (
          event.button !== 0 &&
          event.button !== 2
        ) {
          return;
        }

        dragging =
          true;

        previousX =
          event.clientX;

        canvas.setPointerCapture?.(
          event.pointerId
        );
      };

      const pointerMove = (
        event
      ) => {
        if (!dragging) {
          return;
        }

        const deltaX =
          event.clientX -
          previousX;

        previousX =
          event.clientX;

        characterRoot.rotation.y +=
          deltaX *
          ROTATION_SPEED;
      };

      const pointerUp = (
        event
      ) => {
        dragging =
          false;

        canvas.releasePointerCapture?.(
          event.pointerId
        );
      };

      const contextMenu = (
        event
      ) => {
        event.preventDefault();
      };

      canvas.addEventListener(
        "pointerdown",
        pointerDown
      );

      canvas.addEventListener(
        "pointermove",
        pointerMove
      );

      canvas.addEventListener(
        "pointerup",
        pointerUp
      );

      canvas.addEventListener(
        "pointercancel",
        pointerUp
      );

      canvas.addEventListener(
        "contextmenu",
        contextMenu
      );

      /*
       * RENDER
       */

      engine.runRenderLoop(
        () => {
          scene.render();
        }
      );

      const resize =
        () => {
          engine.resize();
        };

      window.addEventListener(
        "resize",
        resize
      );

      return () => {
        canvas.removeEventListener(
          "pointerdown",
          pointerDown
        );

        canvas.removeEventListener(
          "pointermove",
          pointerMove
        );

        canvas.removeEventListener(
          "pointerup",
          pointerUp
        );

        canvas.removeEventListener(
          "pointercancel",
          pointerUp
        );

        canvas.removeEventListener(
          "contextmenu",
          contextMenu
        );

        window.removeEventListener(
          "resize",
          resize
        );

        scene.dispose();
        engine.dispose();
      };
    },
    [
      assetFile,
    ]
  );

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={
          canvasRef
        }
        className="h-full w-full cursor-grab outline-none active:cursor-grabbing"
      />

      {loading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium text-white/70">
            Loading character...
          </span>
        </div>
      )}
    </div>
  );
};