import {
  Color3,
  MeshBuilder,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { getSnowMix, getWorldHeight } from "../worldConfig";


const randomBetween = (
  min,
  max
) => {
  return (
    min +
    Math.random() *
      (
        max -
        min
      )
  );
};


const createMaterial = (
  scene,
  name,
  hex,
  emissive = 0
) => {
  const existing = scene.getMaterialByName(name);
  if (existing) return existing;
  const material =
    new StandardMaterial(
      name,
      scene
    );


  const color =
    Color3.FromHexString(
      hex
    );


  material.diffuseColor =
    color;


  material.specularColor =
    Color3.Black();


  if (
    emissive >
    0
  ) {
    material.emissiveColor =
      color.scale(
        emissive
      );
  }


  return material;
};


const distanceToSegment = (
  point,
  start,
  end
) => {
  const vx =
    end.x -
    start.x;


  const vz =
    end.z -
    start.z;


  const wx =
    point.x -
    start.x;


  const wz =
    point.z -
    start.z;


  const lengthSquared =
    vx *
      vx +
    vz *
      vz;


  if (
    lengthSquared ===
    0
  ) {
    return Math.sqrt(
      wx *
        wx +
      wz *
        wz
    );
  }


  const t =
    Math.max(
      0,
      Math.min(
        1,
        (
          wx *
            vx +
          wz *
            vz
        ) /
          lengthSquared
      )
    );


  const closestX =
    start.x +
    vx *
      t;


  const closestZ =
    start.z +
    vz *
      t;


  const dx =
    point.x -
    closestX;


  const dz =
    point.z -
    closestZ;


  return Math.sqrt(
    dx *
      dx +
    dz *
      dz
  );
};


const applyLowPolyLook = (
  mesh
) => {
  if (!mesh.sourceMesh) mesh.convertToFlatShadedMesh();


  mesh.receiveShadows =
    true;
};


const createScatterPosition =
  (
    center,
    halfSize
  ) => {
    const x = center.x + randomBetween(-halfSize, halfSize);
    const z = center.z + randomBetween(-halfSize, halfSize);
    return new Vector3(x, getWorldHeight(x, z), z);
  };


const isInsideArea = (
  position,
  center,
  radius
) => {
  const dx =
    position.x -
    center.x;


  const dz =
    position.z -
    center.z;


  return (
    Math.sqrt(
      dx *
        dx +
      dz *
        dz
    ) <
    radius
  );
};


const createForestPosition = ({
  center,
  halfSize,
  clearing,
  extraClearings,
  path,
  exclude,
}) => {
  for (
    let attempt = 0;
    attempt <
    30;
    attempt +=
      1
  ) {
    const position =
      createScatterPosition(
        center,
        halfSize
      );


    const insideClearing =
      isInsideArea(
        position,
        clearing.center,
        clearing.radius
      ) || extraClearings.some((area) => isInsideArea(position, area.center, area.radius));


    const insidePath =
      path &&
      distanceToSegment(
        position,
        path.start,
        path.end
      ) <
        path.width;


    if (
      !insideClearing &&
      !insidePath &&
      !exclude?.(position)
    ) {
      return position;
    }
  }


  return exclude ? null : createScatterPosition(
    center,
    halfSize
  );
};


const createPineTree = ({
  scene,
  parent,
  position,
  materials,
  leafSources,
}) => {
  const root =
    new TransformNode(
      "pineTree",
      scene
    );


  root.parent =
    parent;


  root.position.copyFrom(
    position
  );


  root.rotation.y =
    randomBetween(
      0,
      Math.PI *
        2
    );


  const treeScale =
    randomBetween(
      0.85,
      1.25
    );


  root.scaling.setAll(
    treeScale
  );


  const trunk =
    leafSources.trunk?.createInstance("treeTrunk") || MeshBuilder.CreateCylinder(
      "treeTrunk",
      {
        height:
          randomBetween(
            2.6,
            3.6
          ),

        diameterTop:
          0.18,

        diameterBottom:
          0.32,

        tessellation:
          6,
      },
      scene
    );


  trunk.parent =
    root;


  trunk.position.y =
    1.3;


  trunk.material =
    materials.trunk;


  applyLowPolyLook(
    trunk
  );


  leafSources.trunk ||= trunk;

  const leaf1 =
    leafSources[1]?.createInstance("treeLeaf1") || MeshBuilder.CreateCylinder(
      "treeLeaf1",
      {
        height:
          2.2,

        diameterTop:
          0,

        diameterBottom:
          2.1,

        tessellation:
          6,
      },
      scene
    );


  leaf1.parent =
    root;


  leaf1.position.y =
    2.8;


  leaf1.material =
    materials.leaves;


  applyLowPolyLook(
    leaf1
  );
  leafSources[1] ||= leaf1;


  const leaf2 =
    leafSources[2]?.createInstance("treeLeaf2") || MeshBuilder.CreateCylinder(
      "treeLeaf2",
      {
        height:
          1.8,

        diameterTop:
          0,

        diameterBottom:
          1.7,

        tessellation:
          6,
      },
      scene
    );


  leaf2.parent =
    root;


  leaf2.position.y =
    3.55;


  leaf2.material =
    materials.leaves;


  applyLowPolyLook(
    leaf2
  );
  leafSources[2] ||= leaf2;


  const leaf3 =
    leafSources[3]?.createInstance("treeLeaf3") || MeshBuilder.CreateCylinder(
      "treeLeaf3",
      {
        height:
          1.4,

        diameterTop:
          0,

        diameterBottom:
          1.2,

        tessellation:
          6,
      },
      scene
    );


  leaf3.parent =
    root;


  leaf3.position.y =
    4.15;


  leaf3.material =
    materials.leaves;


  applyLowPolyLook(
    leaf3
  );
  leafSources[3] ||= leaf3;


  return root;
};


const createRock = ({
  scene,
  parent,
  position,
  materials,
  sources,
}) => {
  const rock =
    sources.rock?.createInstance("rock") || MeshBuilder.CreatePolyhedron(
      "rock",
      {
        type:
          1,

        size:
          randomBetween(
            0.5,
            1.1
          ),
      },
      scene
    );


  rock.parent =
    parent;


  rock.position.copyFrom(
    position
  );


  rock.position.y =
    0.25;


  rock.rotation.set(
    randomBetween(
      0,
      Math.PI
    ),

    randomBetween(
      0,
      Math.PI
    ),

    randomBetween(
      0,
      Math.PI
    )
  );


  rock.scaling.set(
    randomBetween(
      0.7,
      1.4
    ),

    randomBetween(
      0.5,
      1
    ),

    randomBetween(
      0.7,
      1.3
    )
  );


  rock.material =
    materials.rock;


  applyLowPolyLook(
    rock
  );


  sources.rock ||= rock;
  return rock;
};


const createBush = ({
  scene,
  parent,
  position,
  materials,
  sources,
}) => {
  const bush =
    sources.bush?.createInstance("bush") || MeshBuilder.CreateSphere(
      "bush",
      {
        diameter:
          randomBetween(
            0.7,
            1.2
          ),

        segments:
          5,
      },
      scene
    );


  bush.parent =
    parent;


  bush.position.copyFrom(
    position
  );


  bush.position.y =
    0.35;


  bush.scaling.set(
    randomBetween(
      1,
      1.4
    ),

    randomBetween(
      0.6,
      1
    ),

    randomBetween(
      1,
      1.4
    )
  );


  bush.material =
    materials.bush;


  applyLowPolyLook(
    bush
  );


  sources.bush ||= bush;
  return bush;
};


const createLog = ({
  scene,
  parent,
  position,
  materials,
  sources,
}) => {
  const log =
    sources.log?.createInstance("log") || MeshBuilder.CreateCylinder(
      "log",
      {
        height:
          randomBetween(
            1.4,
            2.4
          ),

        diameter:
          randomBetween(
            0.22,
            0.34
          ),

        tessellation:
          6,
      },
      scene
    );


  log.parent =
    parent;


  log.position.copyFrom(
    position
  );


  log.position.y =
    0.18;


  log.rotation.z =
    Math.PI /
    2;


  log.rotation.y =
    randomBetween(
      0,
      Math.PI *
        2
    );


  log.material =
    materials.trunk;


  applyLowPolyLook(
    log
  );


  sources.log ||= log;
  return log;
};


const createForestFloor = ({
  scene,
  parent,
  center,
  size,
  materials,
}) => {
  const floor =
    MeshBuilder.CreateGround(
      "forestFloor",
      {
        width:
          size,

        height:
          size,
      },
      scene
    );


  floor.parent =
    parent;


  floor.position.copyFrom(
    center
  );


  floor.position.y =
    0.02;


  floor.material =
    materials.forestFloor;


  floor.receiveShadows =
    true;


  return floor;
};


export const createForestArea =
  ({
    scene,

    center =
      new Vector3(
        0,
        0,
        0
      ),

    /*
     * Bigger starter forest.
     *
     * Old:
     * 50 x 50
     *
     * New:
     * 120 x 120
     */
    size =
      120,

    /*
     * Increase decoration,
     * but not proportional to
     * the complete area increase
     * to keep browser performance
     * reasonable.
     */
    treeCount =
      180,

    rockCount =
      45,

    bushCount =
      90,

    logCount =
      24,

    clearing = {
      center:
        new Vector3(
          0,
          0,
          0
        ),

      radius:
        8,
    },

    extraClearings = [],

    floorColor = "#4B6B3C",
    includeFloor = true,
    path =
      null,
  } = {}) => {
    const root =
      new TransformNode(
        "eastNorthForest",
        scene
      );


    const materials = {
      trunk:
        createMaterial(
          scene,
          "forestTrunkMaterial",
          "#7A5230"
        ),

      leaves:
        createMaterial(
          scene,
          "forestLeavesMaterial",
          "#4E8B4A"
        ),

      rock:
        createMaterial(
          scene,
          "forestRockMaterial",
          "#8B919A"
        ),

      bush:
        createMaterial(
          scene,
          "forestBushMaterial",
          "#5E9E53"
        ),

      forestFloor:
        createMaterial(
          scene,
          "forestFloorMaterial",
          floorColor
        ),
    };


    if (includeFloor) createForestFloor({
      scene,

      parent:
        root,

      center,

      size,

      materials,
    });


    const halfSize =
      size /
      2;


    const leafSources = {};
    const sources = {};

    /*
     * TREES
     */

    for (
      let i = 0;
      i <
      treeCount;
      i +=
        1
    ) {
      const position = createForestPosition({
        center,
        halfSize,
        clearing,
        extraClearings,
        path,
        exclude: (point) => getSnowMix(point.x, point.z) > 0,
      });
      if (!position) continue;
      createPineTree({
        scene,
        leafSources,

        parent:
          root,

        position,

        materials,
      });
    }


    /*
     * ROCKS
     */

    for (
      let i = 0;
      i <
      rockCount;
      i +=
        1
    ) {
      createRock({
        scene,
        sources,

        parent:
          root,

        position:
          createForestPosition({
            center,
            halfSize,
            clearing,
            extraClearings,
            path,
          }),

        materials,
      });
    }


    /*
     * BUSHES
     */

    for (
      let i = 0;
      i <
      bushCount;
      i +=
        1
    ) {
      createBush({
        scene,
        sources,

        parent:
          root,

        position:
          createForestPosition({
            center,
            halfSize,
            clearing,
            extraClearings,
            path,
          }),

        materials,
      });
    }


    /*
     * FALLEN LOGS
     */

    for (
      let i = 0;
      i <
      logCount;
      i +=
        1
    ) {
      createLog({
        scene,
        sources,

        parent:
          root,

        position:
          createForestPosition({
            center,
            halfSize,
            clearing,
            extraClearings,
            path,
          }),

        materials,
      });
    }


    for (const mesh of root.getChildMeshes()) mesh.freezeWorldMatrix();
    return root;
  };
