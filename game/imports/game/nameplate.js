import {
  Mesh,
  MeshBuilder,
} from "@babylonjs/core";

import {
  AdvancedDynamicTexture,
  Control,
  TextBlock,
} from "@babylonjs/gui";

import { getDevice } from "../ui/hooks/useMobileDevice";
import { useHudStore } from "../ui/stores/useHudStore";

const MAX_TEXTURE_WIDTH = 2048;

export const createNameplate = ({
  scene,
  player,
  name,
  title = "",
  scale = 1,
  color = "white",
  y = 0.25,
}) => {
  const mobile = getDevice().mobile;
  const textureWidth = mobile ? 640 : 512;
  const textureHeight = mobile ? 128 : 96;
  const fontSize = mobile ? 64 : 44;
  const textPadding = mobile ? 80 : 64;
  const planeHeight = (mobile ? 0.7371 : 0.3) * scale;
  const plane =
    MeshBuilder.CreatePlane(
      "nameplate",
      {
        width: (mobile ? 3.6855 : 1.8) * scale,
        height: planeHeight,
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

  text.height = `${textureHeight}px`;
  text.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

  const titleText = new TextBlock("nameplateTitle");
  titleText.color = color;
  titleText.fontFamily = "Arial";
  titleText.fontWeight = "bold";
  titleText.outlineWidth = 2;
  titleText.outlineColor = "black";
  titleText.height = `${textureHeight / 2}px`;
  titleText.top = textureHeight;
  titleText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  texture.addControl(titleText);

  let currentName = String(name ?? "");
  let currentTitle = String(title ?? "");

  const updateText = () => {
    const hasTitle = Boolean(currentTitle);
    const height = hasTitle ? textureHeight * 1.5 : textureHeight;
    const titleFontSize = fontSize * 0.65;
    const context = texture.getContext();
    context.font = `bold ${fontSize}px Arial`;
    const textWidth = context.measureText(currentName).width;
    context.font = `bold ${titleFontSize}px Arial`;
    const titleWidth = context.measureText(currentTitle).width;
    const width = Math.min(
      MAX_TEXTURE_WIDTH,
      Math.max(
        textureWidth,
        Math.ceil((Math.max(textWidth, titleWidth) + textPadding) / 64) * 64
      )
    );

    if (texture.getSize().width !== width || texture.getSize().height !== height) {
      texture.scaleTo(width, height);
      plane.scaling.x = width / textureWidth;
    }

    // Grow downward so the existing name keeps its original world position.
    plane.scaling.y = height / textureHeight;
    plane.position.y = y - planeHeight * (plane.scaling.y - 1) / 2;

    text.fontSize = Math.min(
      fontSize,
      (fontSize * (width - textPadding)) / Math.max(textWidth, 1)
    );
    text.text = currentName;
    titleText.fontSize = Math.min(
      titleFontSize,
      (titleFontSize * (width - textPadding)) / Math.max(titleWidth, 1)
    );
    titleText.text = currentTitle;
    titleText.isVisible = hasTitle;
  };

  const setName = (value) => {
    currentName = String(value ?? "");
    updateText();
  };
  const setTitle = (value) => {
    currentTitle = String(value ?? "");
    updateText();
  };

  updateText();

  let visible = true;
  const setVisible = (value) => {
    visible = value;
    plane.setEnabled(visible && useHudStore.getState().uiVisible);
  };
  const unsubscribe = useHudStore.subscribe((state) => {
    plane.setEnabled(visible && state.uiVisible);
  });
  setVisible(true);

  const destroy = () => {
    unsubscribe();
    texture.dispose();
    plane.dispose(false, true);
  };

  return {
    setName,
    setTitle,
    setVisible,
    destroy,
  };
};
