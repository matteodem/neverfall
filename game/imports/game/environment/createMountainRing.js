import {
  Color3,
  MeshBuilder,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";

const randomBetween = (
  min,
  max
) => {
  return (
    min +
    Math.random() *
      (max - min)
  );
};

const createMaterial = (
  scene,
  name,
  hex
) => {
  const material =
    new StandardMaterial(
      name,
      scene
    );

  material.diffuseColor =
    Color3.FromHexString(
      hex
    );

  material.specularColor =
    Color3.Black();

  return material;
};

const applyLowPolyLook = (
  mesh
) => {
  mesh.convertToFlatShadedMesh();
  mesh.receiveShadows =
    true;
};

const createMountain = ({
  scene,
  parent,
  position,
  material,
}) => {
  const mountain =
    MeshBuilder.CreateCylinder(
      "mountain",
      {
        height:
          randomBetween(
            12,
            24
          ),
        diameterTop: 0,
        diameterBottom:
          randomBetween(
            10,
            18
          ),
        tessellation: 5,
      },
      scene
    );

  mountain.parent =
    parent;

  mountain.position.copyFrom(
    position
  );

  mountain.position.y =
    mountain.getBoundingInfo()
      .boundingBox.extendSize.y;

  mountain.rotation.y =
    randomBetween(
      0,
      Math.PI * 2
    );

  mountain.scaling.set(
    randomBetween(
      0.9,
      1.4
    ),
    randomBetween(
      0.9,
      1.3
    ),
    randomBetween(
      0.9,
      1.4
    )
  );

  mountain.material =
    material;

  applyLowPolyLook(
    mountain
  );

  return mountain;
};

const createRingPositions = ({
  center,
  halfSize,
  spacing,
}) => {
  const positions = [];

  for (
    let x = -halfSize;
    x <= halfSize;
    x += spacing
  ) {
    positions.push(
      new Vector3(
        center.x + x,
        center.y,
        center.z - halfSize
      )
    );

    positions.push(
      new Vector3(
        center.x + x,
        center.y,
        center.z + halfSize
      )
    );
  }

  for (
    let z = -halfSize + spacing;
    z <= halfSize - spacing;
    z += spacing
  ) {
    positions.push(
      new Vector3(
        center.x - halfSize,
        center.y,
        center.z + z
      )
    );

    positions.push(
      new Vector3(
        center.x + halfSize,
        center.y,
        center.z + z
      )
    );
  }

  return positions;
};

export const createMountainRing =
  ({
    scene,
    center = new Vector3(
      0,
      0,
      0
    ),
    size = 280,
    spacing = 22,
    jitter = 6,
  } = {}) => {
    const root =
      new TransformNode(
        "mountainRing",
        scene
      );

    const material =
      createMaterial(
        scene,
        "mountainMaterial",
        "#8B8F96"
      );

    const halfSize =
      size / 2;

    const positions =
      createRingPositions({
        center,
        halfSize,
        spacing,
      });

    for (
      const basePosition
      of positions
    ) {
      const position =
        basePosition.clone();

      position.x +=
        randomBetween(
          -jitter,
          jitter
        );

      position.z +=
        randomBetween(
          -jitter,
          jitter
        );

      createMountain({
        scene,
        parent: root,
        position,
        material,
      });
    }

    return root;
  };