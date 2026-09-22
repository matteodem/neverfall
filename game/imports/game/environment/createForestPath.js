import {
  Color3,
  MeshBuilder,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";

const createPathMaterial = (
  scene
) => {
  const material =
    new StandardMaterial(
      "forestPathMaterial",
      scene
    );

  material.diffuseColor =
    Color3.FromHexString(
      "#8A744F"
    );

  material.specularColor =
    Color3.Black();

  return material;
};

export const createForestPath =
  ({
    scene,

    start = new Vector3(
      4,
      0,
      3
    ),

    end = new Vector3(
      0,
      0,
      25
    ),

    width = 3,
  } = {}) => {
    const root =
      new TransformNode(
        "forestPath",
        scene
      );

    const direction =
      end.subtract(
        start
      );

    const length =
      direction.length();

    const midpoint =
      start.add(
        end
      ).scale(
        0.5
      );

    const path =
      MeshBuilder.CreateGround(
        "forestPathGround",
        {
          width,
          height:
            length,
        },
        scene
      );

    path.parent =
      root;

    path.position.set(
      midpoint.x,
      0.04,
      midpoint.z
    );

    path.rotation.y =
      Math.atan2(
        direction.x,
        direction.z
      );

    path.material =
      createPathMaterial(
        scene
      );

    path.receiveShadows =
      true;

    return root;
  };