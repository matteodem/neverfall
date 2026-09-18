import {
  StandardMaterial,
} from "@babylonjs/core";

export const createMaterial = (
  name,
  color,
  scene
) => {
  const material =
    new StandardMaterial(
      name,
      scene
    );

  material.diffuseColor = color;

  return material;
};