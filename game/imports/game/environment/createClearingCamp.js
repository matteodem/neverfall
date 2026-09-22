import {
  Color3,
  MeshBuilder,
  PointLight,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";

const createMaterial = (
  scene,
  name,
  {
    diffuse,
    emissive,
  }
) => {
  const material =
    new StandardMaterial(
      name,
      scene
    );

  material.diffuseColor =
    Color3.FromHexString(
      diffuse
    );

  material.specularColor =
    Color3.Black();

  if (emissive) {
    material.emissiveColor =
      Color3.FromHexString(
        emissive
      );
  }

  return material;
};

const applyLowPolyLook = (
  mesh
) => {
  mesh.convertToFlatShadedMesh();
  mesh.receiveShadows =
    true;
};

const createLogSeat = ({
  scene,
  parent,
  position,
  rotationY = 0,
  material,
}) => {
  const log =
    MeshBuilder.CreateCylinder(
      "campLogSeat",
      {
        height: 1.8,
        diameter: 0.32,
        tessellation: 6,
      },
      scene
    );

  log.parent =
    parent;

  log.position.copyFrom(
    position
  );

  log.position.y =
    0.2;

  log.rotation.z =
    Math.PI / 2;

  log.rotation.y =
    rotationY;

  log.material =
    material;

  applyLowPolyLook(
    log
  );

  return log;
};

const createCrate = ({
  scene,
  parent,
  position,
  size = 0.7,
  material,
}) => {
  const crate =
    MeshBuilder.CreateBox(
      "campCrate",
      {
        size,
      },
      scene
    );

  crate.parent =
    parent;

  crate.position.copyFrom(
    position
  );

  crate.position.y =
    size / 2;

  crate.rotation.y =
    Math.PI / 6;

  crate.material =
    material;

  applyLowPolyLook(
    crate
  );

  return crate;
};

const createTent = ({
  scene,
  parent,
  position,
  rotationY = 0,
  materials,
}) => {
  const tentRoot =
    new TransformNode(
      "campTent",
      scene
    );

  tentRoot.parent =
    parent;

  tentRoot.position.copyFrom(
    position
  );

  tentRoot.rotation.y =
    rotationY;

  const tentBody =
    MeshBuilder.CreateCylinder(
      "campTentBody",
      {
        height: 2.6,
        diameterTop: 0,
        diameterBottom: 2.6,
        tessellation: 3,
      },
      scene
    );

  tentBody.parent =
    tentRoot;

  tentBody.position.y =
    1.05;

  tentBody.rotation.z =
    Math.PI / 2;

  tentBody.rotation.y =
    Math.PI / 2;

  tentBody.scaling.y =
    0.9;

  tentBody.material =
    materials.tent;

  applyLowPolyLook(
    tentBody
  );

  const pole =
    MeshBuilder.CreateCylinder(
      "campTentPole",
      {
        height: 1.9,
        diameter: 0.08,
        tessellation: 5,
      },
      scene
    );

  pole.parent =
    tentRoot;

  pole.position.y =
    0.95;

  pole.material =
    materials.wood;

  applyLowPolyLook(
    pole
  );

  return tentRoot;
};

const createCampfire = ({
  scene,
  parent,
  position,
  materials,
}) => {
  const fireRoot =
    new TransformNode(
      "campfireRoot",
      scene
    );

  fireRoot.parent =
    parent;

  fireRoot.position.copyFrom(
    position
  );

  const stoneOffsets = [
    [0.55, 0],
    [0.35, 0.35],
    [0, 0.55],
    [-0.35, 0.35],
    [-0.55, 0],
    [-0.35, -0.35],
    [0, -0.55],
    [0.35, -0.35],
  ];

  stoneOffsets.forEach(
    ([
      x,
      z,
    ]) => {
      const stone =
        MeshBuilder.CreatePolyhedron(
          "campfireStone",
          {
            type: 1,
            size: 0.22,
          },
          scene
        );

      stone.parent =
        fireRoot;

      stone.position.set(
        x,
        0.12,
        z
      );

      stone.scaling.set(
        1,
        0.7,
        1
      );

      stone.material =
        materials.stone;

      applyLowPolyLook(
        stone
      );
    }
  );

  const wood1 =
    MeshBuilder.CreateCylinder(
      "campfireWood1",
      {
        height: 1.1,
        diameter: 0.14,
        tessellation: 6,
      },
      scene
    );

  wood1.parent =
    fireRoot;

  wood1.position.set(
    0,
    0.12,
    0
  );

  wood1.rotation.z =
    Math.PI / 2;

  wood1.rotation.y =
    Math.PI / 4;

  wood1.material =
    materials.wood;

  applyLowPolyLook(
    wood1
  );

  const wood2 =
    MeshBuilder.CreateCylinder(
      "campfireWood2",
      {
        height: 1.1,
        diameter: 0.14,
        tessellation: 6,
      },
      scene
    );

  wood2.parent =
    fireRoot;

  wood2.position.set(
    0,
    0.12,
    0
  );

  wood2.rotation.z =
    Math.PI / 2;

  wood2.rotation.y =
    -Math.PI / 4;

  wood2.material =
    materials.wood;

  applyLowPolyLook(
    wood2
  );

  const flame =
    MeshBuilder.CreatePolyhedron(
      "campfireFlame",
      {
        type: 1,
        size: 0.55,
      },
      scene
    );

  flame.parent =
    fireRoot;

  flame.position.y =
    0.55;

  flame.scaling.set(
    0.7,
    1.25,
    0.7
  );

  flame.material =
    materials.fire;

  applyLowPolyLook(
    flame
  );

  const fireLight =
    new PointLight(
      "campfireLight",
      new Vector3(
        position.x,
        position.y + 1.2,
        position.z
      ),
      scene
    );

  fireLight.diffuse =
    Color3.FromHexString(
      "#FFB347"
    );

  fireLight.intensity =
    0.8;

  fireLight.range =
    14;

  return {
    root: fireRoot,
    light: fireLight,
  };
};

export const createClearingCamp =
  ({
    scene,
    center = new Vector3(
      0,
      0,
      0
    ),
  } = {}) => {
    const root =
      new TransformNode(
        "clearingCamp",
        scene
      );

    const materials = {
      wood:
        createMaterial(
          scene,
          "campWoodMaterial",
          {
            diffuse:
              "#7A5230",
          }
        ),

      tent:
        createMaterial(
          scene,
          "campTentMaterial",
          {
            diffuse:
              "#C9A46A",
          }
        ),

      stone:
        createMaterial(
          scene,
          "campStoneMaterial",
          {
            diffuse:
              "#8B919A",
          }
        ),

      crate:
        createMaterial(
          scene,
          "campCrateMaterial",
          {
            diffuse:
              "#8A633E",
          }
        ),

      fire:
        createMaterial(
          scene,
          "campFireMaterial",
          {
            diffuse:
              "#FF8C42",

            emissive:
              "#FFB347",
          }
        ),
    };

    root.position.copyFrom(
      center
    );

    createCampfire({
      scene,
      parent: root,
      position:
        new Vector3(
          0,
          0,
          0
        ),
      materials,
    });

    createLogSeat({
      scene,
      parent: root,
      position:
        new Vector3(
          1.9,
          0,
          0
        ),
      rotationY: 0,
      material:
        materials.wood,
    });

    createLogSeat({
      scene,
      parent: root,
      position:
        new Vector3(
          -1.9,
          0,
          0.2
        ),
      rotationY:
        Math.PI / 8,
      material:
        materials.wood,
    });

    createLogSeat({
      scene,
      parent: root,
      position:
        new Vector3(
          0.2,
          0,
          1.9
        ),
      rotationY:
        Math.PI / 2,
      material:
        materials.wood,
    });

    createTent({
      scene,
      parent: root,
      position:
        new Vector3(
          -4,
          0,
          -2.5
        ),
      rotationY:
        Math.PI / 5,
      materials,
    });

    createTent({
      scene,
      parent: root,
      position:
        new Vector3(
          3.8,
          0,
          -3
        ),
      rotationY:
        -Math.PI / 6,
      materials,
    });

    createCrate({
      scene,
      parent: root,
      position:
        new Vector3(
          2.8,
          0,
          2.7
        ),
      material:
        materials.crate,
    });

    createCrate({
      scene,
      parent: root,
      position:
        new Vector3(
          -2.6,
          0,
          2.3
        ),
      size: 0.55,
      material:
        materials.crate,
    });

    return root;
  };