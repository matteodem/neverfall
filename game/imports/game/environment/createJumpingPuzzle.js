import {
  Color3,
  MeshBuilder,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";


const BLOCK_SIZE = {
  width: 2.2,
  height: 0.8,
  depth: 2.2,
};


const createPuzzleBlock =
  ({
    scene,
    material,
    position,
    width =
      BLOCK_SIZE.width,
    height =
      BLOCK_SIZE.height,
    depth =
      BLOCK_SIZE.depth,
    name,
  }) => {
    const block =
      MeshBuilder.CreateBox(
        name,
        {
          width,
          height,
          depth,
        },
        scene
      );


    block.position.copyFrom(
      position
    );


    block.material =
      material;


    /*
     * Babylon collision flag.
     *
     * The movement system must use
     * Babylon collisions for this
     * to physically block the player.
     */

    block.checkCollisions =
      true;


    return block;
  };


export const createJumpingPuzzle =
  ({
    scene,

    center =
      new Vector3(
        -22,
        0,
        22
      ),
  }) => {
    /*
     * =====================================================
     * MATERIAL
     * =====================================================
     */

    const material =
      new StandardMaterial(
        "jumpingPuzzleMaterial",
        scene
      );


    material.diffuseColor =
      Color3.FromHexString(
        "#70757D"
      );


    material.specularColor =
      Color3.Black();


    /*
     * =====================================================
     * STEPS
     * =====================================================
     *
     * Keep this data-driven so changing
     * or adding blocks stays simple.
     */

    const positions = [
      [
        0,
        0.4,
        0,
      ],

      [
        -2.4,
        1.3,
        1.8,
      ],

      [
        -4.6,
        2.2,
        3.8,
      ],

      [
        -6.2,
        3.1,
        6.2,
      ],

      [
        -8.4,
        4,
        8,
      ],

      [
        -10,
        4.9,
        10.5,
      ],

      [
        -12.3,
        5.8,
        12,
      ],

      [
        -14,
        6.7,
        14.5,
      ],
    ];


    const blocks =
      positions.map(
        (
          [
            x,
            y,
            z,
          ],
          index
        ) =>
          createPuzzleBlock({
            scene,

            material,

            name:
              `jumpingPuzzleBlock-${index}`,

            position:
              new Vector3(
                center.x + x,
                center.y + y,
                center.z + z
              ),
          })
      );


    /*
     * =====================================================
     * FINAL PLATFORM
     * =====================================================
     */

    const platform =
      createPuzzleBlock({
        scene,

        material,

        name:
          "jumpingPuzzlePlatform",

        position:
          new Vector3(
            center.x -
              16.5,

            center.y +
              6.8,

            center.z +
              16.5
          ),

        width:
          8,

        height:
          1,

        depth:
          8,
      });


    /*
     * =====================================================
     * RESULT
     * =====================================================
     */

    return {
      blocks,
      platform,
      material,
    };
  };