import {
  Mesh,
  MeshBuilder,
} from "@babylonjs/core";

import {
  AdvancedDynamicTexture,
  TextBlock,
} from "@babylonjs/gui";

import { getDevice } from "../ui/hooks/useMobileDevice";

const MAX_TEXTURE_WIDTH = 2048;

export const createNameplate = ({
  scene,
  player,
  name,
  color = "white",
  y = 0.25,
}) => {
  const mobile = getDevice().mobile;
  const textureWidth = mobile ? 640 : 512;
  const textureHeight = mobile ? 128 : 96;
  const fontSize = mobile ? 64 : 44;
  const textPadding = mobile ? 80 : 64;
  const plane =
    MeshBuilder.CreatePlane(
      "nameplate",
      {
        width: mobile ? 3.15 : 1.8,
        height: mobile ? 0.63 : 0.3,
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
      textureWidth,
      textureHeight,
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

  text.color =
    color;

  text.fontSize =
    fontSize;

  text.fontFamily =
    "Arial";

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
    const value = String(newName ?? "");
    const context = texture.getContext();
    context.font = `bold ${fontSize}px Arial`;
    const textWidth = context.measureText(value).width;
    const width = Math.min(
      MAX_TEXTURE_WIDTH,
      Math.max(
        textureWidth,
        Math.ceil((textWidth + textPadding) / 64) * 64
      )
    );

    if (texture.getSize().width !== width) {
      texture.scaleTo(width, textureHeight);
      plane.scaling.x = width / textureWidth;
    }

    text.fontSize = Math.min(
      fontSize,
      (fontSize * (width - textPadding)) / Math.max(textWidth, 1)
    );
    text.text =
      value;
  };

  setName(name);

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
