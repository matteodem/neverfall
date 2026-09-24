import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArcRotateCamera,
  DirectionalLight,
  Engine,
  HemisphericLight,
  Scene,
  Vector3,
} from "@babylonjs/core";

import {
  createKayKitCharacter,
} from "../game/character/createKayKitCharacter";

import {
  createKayKitAnimationController,
} from "../game/character/createKayKitAnimationController";


export const CharacterPreview = ({
  appearance,
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

      if (!canvas) {
        return;
      }


      let disposed =
        false;

      let characterRoot =
        null;

      let animations =
        null;


      setLoading(
        true
      );


      /*
       * =====================================================
       * ENGINE
       * =====================================================
       */

      const engine =
        new Engine(
          canvas,
          true,
          {
            alpha:
              true,
          }
        );


      /*
       * =====================================================
       * SCENE
       * =====================================================
       */

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
       * =====================================================
       * CAMERA
       * =====================================================
       */

      const camera =
        new ArcRotateCamera(
          "characterPreviewCamera",

          Math.PI / 2,

          Math.PI / 2.3,

          5.5,

          new Vector3(
            0,
            1.3,
            0
          ),

          scene
        );

      /*
       * We intentionally don't call
       * camera.attachControl().
       *
       * Dragging rotates the character,
       * not the camera.
       */

      camera.lowerRadiusLimit =
        5.5;

      camera.upperRadiusLimit =
        5.5;


      /*
       * =====================================================
       * LIGHT
       * =====================================================
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

      const frontLight =
        new DirectionalLight(
          "previewFrontLight",

          new Vector3(
            0,
            -0.5,
            1
          ),

          scene
        );

      light.intensity =
        2.0;

      frontLight.intensity =
        1.6;


      /*
       * =====================================================
       * CHARACTER
       * =====================================================
       */

      const loadCharacter =
        async () => {
          try {
            const character =
              await createKayKitCharacter({
                scene,
                appearance,
              });


            /*
             * The effect may have been
             * cleaned up while the GLB
             * files were loading.
             */

            if (
              disposed
            ) {
              character.root.dispose();

              return;
            }


            characterRoot =
              character.root;


            /*
             * =====================================================
             * IDLE ANIMATION
             * =====================================================
             */

            animations =
              createKayKitAnimationController(
                character
              );


            animations.setRunning(
              false
            );

            animations.setJumping(
              false
            );


            setLoading(
              false
            );
          } catch (
            error
          ) {
            console.error(
              "[CharacterPreview] Failed to load KayKit character:",
              error
            );

            if (
              !disposed
            ) {
              setLoading(
                false
              );
            }
          }
        };


      loadCharacter();


      /*
       * =====================================================
       * CHARACTER ROTATION
       * =====================================================
       */

      let dragging =
        false;

      let previousX =
        0;

      const ROTATION_SPEED =
        0.01;


      const pointerDown =
        (
          event
        ) => {
          if (
            event.button !==
              0 &&
            event.button !==
              2
          ) {
            return;
          }


          dragging =
            true;


          previousX =
            event.clientX;


          canvas
            .setPointerCapture
            ?.(
              event.pointerId
            );
        };


      const pointerMove =
        (
          event
        ) => {
          if (
            !dragging ||
            !characterRoot
          ) {
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


      const pointerUp =
        (
          event
        ) => {
          dragging =
            false;


          canvas
            .releasePointerCapture
            ?.(
              event.pointerId
            );
        };


      const contextMenu =
        (
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
       * =====================================================
       * RENDER
       * =====================================================
       */

      engine.runRenderLoop(
        () => {
          const deltaTime =
            engine.getDeltaTime();


          animations?.update(
            deltaTime
          );


          scene.render();
        }
      );


      /*
       * =====================================================
       * RESIZE
       * =====================================================
       */

      const resize =
        () => {
          engine.resize();
        };


      window.addEventListener(
        "resize",
        resize
      );


      /*
       * =====================================================
       * CLEANUP
       * =====================================================
       */

      return () => {
        disposed =
          true;


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


        animations?.destroy();


        scene.dispose();


        engine.dispose();
      };
    },

    /*
     * Rebuild preview whenever
     * appearance changes.
     */
    [
      appearance?.gender,
      appearance?.skinTone,
      appearance?.bodyType,
      appearance?.head,
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