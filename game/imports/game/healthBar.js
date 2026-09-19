import {
  Mesh,
  MeshBuilder,
} from "@babylonjs/core";

import {
  AdvancedDynamicTexture,
  Rectangle,
} from "@babylonjs/gui";

const WIDTH = 1.5;
const HEIGHT = 0.18;

export const createHealthBar = ({
  scene,
  player,
}) => {
  /*
   * Single 3D plane.
   *
   * This avoids having separate
   * background/fill planes fighting
   * for depth.
   */
  const plane =
    MeshBuilder.CreatePlane(
      "healthBar",
      {
        width: WIDTH,
        height: HEIGHT,
      },
      scene
    );

  plane.parent = player;

  plane.position.y = 2.4;

  /*
   * Always face camera.
   */
  plane.billboardMode =
    Mesh.BILLBOARDMODE_ALL;

  /*
   * GUI texture rendered onto
   * this one plane.
   */
  const texture =
    AdvancedDynamicTexture.CreateForMesh(
      plane,
      512,
      64,
      false
    );

  /*
   * Background.
   */
  const background =
    new Rectangle(
      "healthBackground"
    );

  background.width = 1;
  background.height = 1;

  background.background =
    "#111111";

  background.color =
    "#333333";

  background.thickness = 2;

  background.cornerRadius = 8;

  texture.addControl(
    background
  );

  /*
   * Green health fill.
   */
  const fill =
    new Rectangle(
      "healthFill"
    );

  fill.height = 0.72;

  fill.width = 1;

  fill.background =
    "#22c55e";

  fill.color =
    "transparent";

  fill.thickness = 0;

  fill.cornerRadius = 5;

  /*
   * Anchor fill to the left.
   */
  fill.horizontalAlignment =
    Rectangle.HORIZONTAL_ALIGNMENT_LEFT;

  background.addControl(
    fill
  );

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

    /*
     * GUI width accepts percentages.
     */
    fill.width =
      `${percentage * 100}%`;

    /*
     * Don't disable the whole bar.
     * At 0 HP simply show empty.
     */
    plane.setEnabled(
      true
    );
  };

  const destroy = () => {
    texture.dispose();
    plane.dispose();
  };

  return {
    setHealth,
    destroy,
  };
};