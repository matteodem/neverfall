import {
  Color3,
  MeshBuilder,
  StandardMaterial,
  TransformNode,
} from "@babylonjs/core";


const SKIN_TONES = {
  light:
    "#F1C7A5",

  fair:
    "#E5B08A",

  medium:
    "#C68662",

  tan:
    "#A96F4C",

  brown:
    "#7B4F35",

  dark:
    "#4A2D22",
};


const BODY_TYPES = {
  slim: {
    torsoWidth:
      0.65,

    torsoHeight:
      1.15,

    armWidth:
      0.16,

    legWidth:
      0.2,
  },

  medium: {
    torsoWidth:
      0.8,

    torsoHeight:
      1.2,

    armWidth:
      0.2,

    legWidth:
      0.24,
  },

  large: {
    torsoWidth:
      1,

    torsoHeight:
      1.3,

    armWidth:
      0.25,

    legWidth:
      0.3,
  },
};


const HEADS = {
  head1: {
    width: 0.52,
    height: 0.58,
    depth: 0.5,
  },

  head2: {
    width: 0.56,
    height: 0.55,
    depth: 0.52,
  },

  head3: {
    width: 0.48,
    height: 0.62,
    depth: 0.48,
  },

  head4: {
    width: 0.6,
    height: 0.56,
    depth: 0.55,
  },

  head5: {
    width: 0.5,
    height: 0.52,
    depth: 0.58,
  },
};


const createMaterial = (
  scene,
  name,
  color
) => {
  const material =
    new StandardMaterial(
      name,
      scene
    );

  material.diffuseColor =
    Color3.FromHexString(
      color
    );

  material.specularColor =
    Color3.Black();

  return material;
};


const createBox = ({
  scene,
  name,
  width,
  height,
  depth,
  material,
  parent,
}) => {
  const mesh =
    MeshBuilder.CreateBox(
      name,
      {
        width,
        height,
        depth,
      },
      scene
    );

  mesh.parent =
    parent;

  mesh.material =
    material;

  mesh.convertToFlatShadedMesh();

  return mesh;
};


export const createLowPolyCharacter =
  ({
    scene,

    appearance = {},
  }) => {
    const gender =
      appearance.gender ||
      "female";

    const skinTone =
      appearance.skinTone ||
      "medium";

    const bodyType =
      appearance.bodyType ||
      "medium";

    const headType =
      appearance.head ||
      "head1";


    const body =
      BODY_TYPES[
        bodyType
      ] ||
      BODY_TYPES.medium;

    const headConfig =
      HEADS[
        headType
      ] ||
      HEADS.head1;


    const root =
      new TransformNode(
        "characterRoot",
        scene
      );


    const skinMaterial =
      createMaterial(
        scene,
        "characterSkin",
        SKIN_TONES[
          skinTone
        ] ||
          SKIN_TONES.medium
      );


    const clothingMaterial =
      createMaterial(
        scene,
        "characterClothing",
        gender ===
          "female"
          ? "#7B6DB3"
          : "#506D91"
      );


    const pantsMaterial =
      createMaterial(
        scene,
        "characterPants",
        "#3F4654"
      );


    /*
     * BODY
     */

    const torso =
      createBox({
        scene,

        name:
          "characterTorso",

        width:
          body.torsoWidth,

        height:
          body.torsoHeight,

        depth:
          gender ===
          "female"
            ? 0.42
            : 0.48,

        material:
          clothingMaterial,

        parent:
          root,
      });

    torso.position.y =
      1.65;


    /*
     * HEAD
     */

    const head =
      createBox({
        scene,

        name:
          "characterHead",

        width:
          headConfig.width,

        height:
          headConfig.height,

        depth:
          headConfig.depth,

        material:
          skinMaterial,

        parent:
          root,
      });

    head.position.y =
      2.55;


    /*
     * ARMS
     *
     * Each limb gets its own
     * TransformNode so animations
     * can rotate it cheaply.
     */

    const leftArmPivot =
      new TransformNode(
        "leftArmPivot",
        scene
      );

    leftArmPivot.parent =
      root;

    leftArmPivot.position.set(
      -(
        body.torsoWidth /
          2 +
        body.armWidth /
          2
      ),
      2.05,
      0
    );


    const leftArm =
      createBox({
        scene,

        name:
          "leftArm",

        width:
          body.armWidth,

        height:
          1,

        depth:
          body.armWidth,

        material:
          skinMaterial,

        parent:
          leftArmPivot,
      });

    leftArm.position.y =
      -0.5;


    const rightArmPivot =
      new TransformNode(
        "rightArmPivot",
        scene
      );

    rightArmPivot.parent =
      root;

    rightArmPivot.position.set(
      body.torsoWidth /
        2 +
        body.armWidth /
          2,
      2.05,
      0
    );


    const rightArm =
      createBox({
        scene,

        name:
          "rightArm",

        width:
          body.armWidth,

        height:
          1,

        depth:
          body.armWidth,

        material:
          skinMaterial,

        parent:
          rightArmPivot,
      });

    rightArm.position.y =
      -0.5;


    /*
     * LEGS
     */

    const legOffset =
      body.torsoWidth *
      0.23;


    const leftLegPivot =
      new TransformNode(
        "leftLegPivot",
        scene
      );

    leftLegPivot.parent =
      root;

    leftLegPivot.position.set(
      -legOffset,
      1.05,
      0
    );


    const leftLeg =
      createBox({
        scene,

        name:
          "leftLeg",

        width:
          body.legWidth,

        height:
          1.1,

        depth:
          body.legWidth,

        material:
          pantsMaterial,

        parent:
          leftLegPivot,
      });

    leftLeg.position.y =
      -0.55;


    const rightLegPivot =
      new TransformNode(
        "rightLegPivot",
        scene
      );

    rightLegPivot.parent =
      root;

    rightLegPivot.position.set(
      legOffset,
      1.05,
      0
    );


    const rightLeg =
      createBox({
        scene,

        name:
          "rightLeg",

        width:
          body.legWidth,

        height:
          1.1,

        depth:
          body.legWidth,

        material:
          pantsMaterial,

        parent:
          rightLegPivot,
      });

    rightLeg.position.y =
      -0.55;


    return {
      root,

      parts: {
        torso,
        head,

        leftArmPivot,
        rightArmPivot,

        leftLegPivot,
        rightLegPivot,
      },

      appearance: {
        gender,
        skinTone,
        bodyType,
        head:
          headType,
      },
    };
  };