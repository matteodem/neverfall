import {
  Mesh,
  MeshBuilder,
} from "@babylonjs/core";

import {
  AdvancedDynamicTexture,
  TextBlock,
} from "@babylonjs/gui";

export const createNameplate = ({
  scene,
  player,
  name,
  color = "white",
  y = 0.25,
}) => {
  const plane =
    MeshBuilder.CreatePlane(
      "nameplate",
      {
        width: 1.8,
        height: 0.3,
      },
      scene
    );

  plane.parent =
    player;

  plane.position.y =
    y;

  plane.billboardMode =
    Mesh.BILLBOARDMODE_ALL;

  /*
   * Nameplate should not interfere
   * with picking / gameplay.
   */
  plane.isPickable =
    false;

  const texture =
    AdvancedDynamicTexture.CreateForMesh(
      plane,
      512,
      96,
      false
    );

  plane.renderingGroupId =
    1;

  plane.material.disableDepthWrite =
    true;

  plane.material.needDepthPrePass =
    false;

  const text =
    new TextBlock(
      "nameplateText"
    );

  text.text =
    name;

  text.color =
    color;

  text.fontSize =
    44;

  text.fontWeight =
    "bold";

  text.outlineWidth =
    4;

  text.outlineColor =
    "black";

  texture.addControl(
    text
  );

  const setName = (
    newName
  ) => {
    text.text =
      newName;
  };

  const destroy = () => {
    texture.dispose();
    plane.dispose();
  };

  return {
    setName,
    setVisible: (visible) => plane.setEnabled(visible),
    destroy,
  };
};