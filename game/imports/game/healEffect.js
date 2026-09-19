import {
  Color3,
  MeshBuilder,
  StandardMaterial,
} from "@babylonjs/core";

const EFFECT_DURATION =
  600;

export const playHealEffect = ({
  scene,
  player,
}) => {
  const ring =
    MeshBuilder.CreateTorus(
      "healEffect",
      {
        diameter: 1.3,
        thickness: 0.08,
        tessellation: 32,
      },
      scene
    );

  ring.parent =
    player;

  ring.position.y =
    0.15;

  const material =
    new StandardMaterial(
      "healEffectMaterial",
      scene
    );

  material.emissiveColor =
    new Color3(
      0.2,
      1,
      0.35
    );

  material.diffuseColor =
    new Color3(
      0.1,
      0.8,
      0.2
    );

  material.alpha =
    0.9;

  ring.material =
    material;

  const startedAt =
    performance.now();

  const observer =
    scene.onBeforeRenderObservable.add(
      () => {
        const progress =
          Math.min(
            (
              performance.now() -
              startedAt
            ) /
              EFFECT_DURATION,
            1
          );

        /*
         * Expand.
         */
        const scale =
          1 +
          progress *
            1.5;

        ring.scaling.setAll(
          scale
        );

        /*
         * Move upwards slightly.
         */
        ring.position.y =
          0.15 +
          progress *
            0.8;

        /*
         * Fade out.
         */
        material.alpha =
          0.9 *
          (
            1 -
            progress
          );

        if (
          progress < 1
        ) {
          return;
        }

        scene
          .onBeforeRenderObservable
          .remove(
            observer
          );

        ring.dispose();
        material.dispose();
      }
    );
};