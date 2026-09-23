import {
  Mesh,
  MeshBuilder,
} from "@babylonjs/core";

import {
  AdvancedDynamicTexture,
  Control,
  Rectangle,
} from "@babylonjs/gui";

const WIDTH =
  1.5;

const HEIGHT =
  0.18;

export const createHealthBar = ({
  scene,
  player,
  color = "#22c55e",
  y = 3.2,
}) => {
  const plane =
    MeshBuilder.CreatePlane(
      "healthBar",
      {
        width: WIDTH,
        height: HEIGHT,
      },
      scene
    );

  plane.renderingGroupId =
    2;

  scene.setRenderingAutoClearDepthStencil(
    2,
    true,
    true,
    true
  );

  plane.parent =
    player;

  plane.position.y =
    y;

  plane.billboardMode =
    Mesh.BILLBOARDMODE_ALL;

  const texture =
    AdvancedDynamicTexture.CreateForMesh(
      plane,
      512,
      64,
      false
    );

  /*
   * BACKGROUND
   */

  const background =
    new Rectangle();

  background.width = 1;
  background.height = 1;

  background.background =
    "#111111";

  background.color =
    "#333333";

  background.thickness =
    2;

  background.cornerRadius =
    8;

  texture.addControl(
    background
  );

  /*
   * FILL
   */

  const fill =
    new Rectangle();

  fill.height =
    0.72;

  fill.width =
    "100%";

  fill.background =
    color;

  fill.thickness =
    0;

  fill.cornerRadius =
    5;

  fill.horizontalAlignment =
    Control.HORIZONTAL_ALIGNMENT_LEFT;

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

    fill.width =
      `${percentage * 100}%`;
  };

  const setVisible = (
    visible
  ) => {
    plane.setEnabled(
      visible
    );
  };

  const destroy = () => {
    texture.dispose();
    plane.dispose();
  };

  return {
    setHealth,
    setVisible,
    destroy,
  };
};