import {
  SceneLoader,
  TransformNode,
} from "@babylonjs/core";

import "@babylonjs/loaders/glTF";


const HORSE_ROTATION_OFFSET =
  Math.PI;


export const createHorseMount =
  async ({
    scene,
    parent,
    character,
  }) => {
    const result =
      await SceneLoader.ImportMeshAsync(
        "",
        "/models/mounts/",
        "horse-02.glb",
        scene
      );


    const root =
      result.meshes[0];

    root.name =
      "horse-mount";


    /*
     * Gameplay root.
     *
     * This handles the direction the mount should face.
     */
    const mountRoot =
      new TransformNode(
        "mountRoot",
        scene
      );

    mountRoot.parent =
      parent;


    /*
     * Visual-only root.
     *
     * The horse GLB faces backwards compared to Neverfall's
     * forward direction, so rotate only the horse model by 180°.
     *
     * Do not rotate mountRoot by 180°, because setFacing()
     * controls that node.
     */
    const horseVisualRoot =
      new TransformNode(
        "horseVisualRoot",
        scene
      );

    horseVisualRoot.parent =
      mountRoot;

    horseVisualRoot.rotation.y =
      HORSE_ROTATION_OFFSET;


    root.parent =
      horseVisualRoot;

    root.position.set(
      0,
      0,
      0
    );

    root.scaling.setAll(
      1.2
    );


    /*
     * Keep rider independent from the horse's visual
     * 180° correction.
     */
    const riderAnchor =
      new TransformNode(
        "riderAnchor",
        scene
      );

    riderAnchor.parent =
      parent;

    riderAnchor.position.set(
      0,
      1.9,
      -0.12
    );


    const idle =
      result.animationGroups.find(
        (group) =>
          group.name ===
          "Idle"
      );


    const run =
      result.animationGroups.find(
        (group) =>
          group.name ===
            "Run" ||
          group.name ===
            "Walk"
      );


    for (const group of result.animationGroups) group.stop();
    let visible = true;

    let mounted =
      false;

    let running =
      false;

    let currentAnimation =
      null;


    const play =
      (animation) => {
        if (
          !visible ||
          !animation ||
          animation ===
            currentAnimation
        ) {
          return;
        }


        currentAnimation
          ?.stop();


        currentAnimation =
          animation;

        animation.start(
          true
        );
      };


    const setMounted =
      (value) => {
        if (
          mounted ===
          value
        ) {
          return;
        }


        mounted =
          value;


        if (
          mounted
        ) {
          character.root.parent =
            riderAnchor;

          character.root.position.set(
            0,
            -0.7,
            0
          );


          mountRoot.setEnabled(
            true
          );

          play(
            idle
          );

          return;
        }


        mountRoot.setEnabled(
          false
        );


        currentAnimation
          ?.stop();

        currentAnimation =
          null;


        character.root.parent =
          parent;

        character.root.position.set(
          0,
          0,
          0
        );
      };


    mountRoot.setEnabled(
      false
    );


    return {
      setVisible(value) {
        visible = value;
        if (!value) currentAnimation?.pause();
        else if (mounted) {
          if (currentAnimation?.isStarted) currentAnimation.restart();
          else play(running ? run : idle);
        }
      },
      setMounted,

      isMounted:
        () =>
          mounted,


      setFacing(
        direction
      ) {
        if (
          direction?.lengthSquared()
        ) {
          mountRoot.rotation.y =
            Math.atan2(
              direction.x,
              direction.z
            ) -
            parent.rotation.y;

          return;
        }


        mountRoot.rotation.y =
          0;
      },


      setRunning(
        value
      ) {
        running =
          value;


        if (
          mounted
        ) {
          play(
            running
              ? run
              : idle
          );
        }
      },


      destroy() {
        currentAnimation
          ?.stop();


        result.animationGroups.forEach(
          (group) =>
            group.dispose()
        );


        riderAnchor.dispose();

        root.dispose();

        horseVisualRoot.dispose();

        mountRoot.dispose();
      },
    };
  };