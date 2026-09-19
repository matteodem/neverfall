import {
  Color3,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  TransformNode,
} from "@babylonjs/core";

const WIDTH =
  1.4;

const HEIGHT =
  0.12;

export const createHealthBar = ({
  scene,
  player,
}) => {
  /*
   * Root follows player.
   */
  const root =
    new TransformNode(
      "healthBar",
      scene
    );

  root.parent =
    player;

  root.position.y =
    2.4;

  /*
   * Background
   */

  const background =
    MeshBuilder.CreatePlane(
      "healthBarBackground",
      {
        width: WIDTH,
        height: HEIGHT,
      },
      scene
    );

  background.parent =
    root;

  background.billboardMode =
    Mesh.BILLBOARDMODE_ALL;

  const backgroundMaterial =
    new StandardMaterial(
      "healthBarBackgroundMaterial",
      scene
    );

  backgroundMaterial.diffuseColor =
    new Color3(
      0.05,
      0.05,
      0.05
    );

  backgroundMaterial.emissiveColor =
    new Color3(
      0.05,
      0.05,
      0.05
    );

  backgroundMaterial.backFaceCulling =
    false;

  background.material =
    backgroundMaterial;

  /*
   * Health fill
   */

  const fill =
    MeshBuilder.CreatePlane(
      "healthBarFill",
      {
        width: WIDTH,
        height:
          HEIGHT * 0.7,
      },
      scene
    );

  fill.parent =
    root;

  fill.position.z =
    -0.01;

  fill.billboardMode =
    Mesh.BILLBOARDMODE_ALL;

  const fillMaterial =
    new StandardMaterial(
      "healthBarFillMaterial",
      scene
    );

  fillMaterial.diffuseColor =
    new Color3(
      0.1,
      0.9,
      0.2
    );

  fillMaterial.emissiveColor =
    new Color3(
      0.1,
      0.9,
      0.2
    );

  fillMaterial.backFaceCulling =
    false;

  fill.material =
    fillMaterial;

  /*
   * Update health visually.
   */

  const setHealth = (
    health,
    maxHealth
  ) => {
    const percentage =
      Math.max(
        0,
        Math.min(
          1,
          health /
            maxHealth
        )
      );

    fill.scaling.x =
      percentage;

    /*
     * Keep left side anchored
     * instead of shrinking toward
     * the centre.
     */
    fill.position.x =
      -(WIDTH / 2) *
      (1 - percentage);

    /*
     * Hide when dead if desired.
     */
    root.setEnabled(
      health > 0
    );
  };

  const destroy = () => {
    background.dispose();
    fill.dispose();

    backgroundMaterial.dispose();
    fillMaterial.dispose();

    root.dispose();
  };

  return {
    setHealth,
    destroy,
  };
};