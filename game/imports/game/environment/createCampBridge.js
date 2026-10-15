import { Color3, Mesh, MeshBuilder, Quaternion, Ray, SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";
import { getStarterRiverSection } from "./starterRiverHeight";
import { harmonizeEnvironmentMaterials } from "./harmonizeEnvironmentMaterials";

// Local +X spans the imported arch; local +Z is its width. Keep the crossing
// on the existing camp-to-dungeon route, with both abutments on dry ground.
const CROSSING_X = 0;
const SCALE = new Vector3(7, 4.5, 9);
const SEGMENTS = 32;
const RAIL_HEIGHT = 0.25; // 1.125 m: above the collision ellipsoid center.
const HALF_DECK_WIDTH = 0.17; // 3.06 m clear width, sufficient for a horse.

export const createCampBridge = async (scene, ground) => {
  const result = await SceneLoader.ImportMeshAsync("", "/models/environment/", "stone-bridge.glb", scene);
  const meshes = result.meshes.filter((mesh) => mesh.getTotalVertices());
  const owned = new Set(meshes);
  const root = new TransformNode("central-camp-bridge", scene);
  const bounds = meshes.map((mesh) => {
    mesh.computeWorldMatrix(true);
    return mesh.getBoundingInfo().boundingBox;
  });
  const start = Math.min(...bounds.map((box) => box.minimumWorld.x)) + 0.02;
  const end = Math.max(...bounds.map((box) => box.maximumWorld.x)) - 0.02;
  // Sample the actual deck once at load time; never collide against the detailed
  // stones/arch underside, which would snag feet or mounts.
  const profile = Array.from({ length: SEGMENTS + 1 }, (_, index) => {
    const x = start + (end - start) * index / SEGMENTS;
    const hit = scene.pickWithRay(new Ray(new Vector3(x, 2, 0), Vector3.Down(), 4), (mesh) => owned.has(mesh));
    if (!hit?.hit) throw new Error(`Missing stone bridge deck at ${x}`);
    return new Vector3(x, hit.pickedPoint.y, 0);
  });
  const centerZ = -getStarterRiverSection(CROSSING_X).x;
  const first = profile[0], last = profile[SEGMENTS];
  const northY = ground.getHeightAtCoordinates(CROSSING_X, centerZ - start * SCALE.x);
  const southY = ground.getHeightAtCoordinates(CROSSING_X, centerZ - end * SCALE.x);
  const tilt = Math.atan2(southY - northY - (last.y - first.y) * SCALE.y, (end - start) * SCALE.x);
  root.position.set(CROSSING_X, northY - Math.sin(tilt) * start * SCALE.x - Math.cos(tilt) * first.y * SCALE.y, centerZ);
  root.scaling.copyFrom(SCALE);
  root.rotationQuaternion = Quaternion.RotationYawPitchRoll(Math.PI / 2, 0, tilt);
  for (const mesh of result.meshes) {
    if (!mesh.parent) mesh.parent = root;
  }
  for (const mesh of meshes) {
    // The GLB includes baked emission. Use its authored albedo under world
    // lighting so foliage/player shadows can fall onto the stone normally.
    if (mesh.material?.emissiveColor) {
      mesh.material.emissiveColor = Color3.Black();
      const bakedEmission = mesh.material.emissiveTexture;
      mesh.material.emissiveTexture = null;
      bakedEmission?.dispose();
    }
    mesh.isPickable = false;
    mesh.checkCollisions = false;
    mesh.receiveShadows = true;
    mesh.metadata = { ...mesh.metadata, worldShadows: { cast: true, receive: true } };
  }
  harmonizeEnvironmentMaterials(meshes.map((mesh) => mesh.material), "stone-bridge");

  // One invisible ribbon supplies a continuous arched floor and two side walls.
  // Keep it pickable=false but visible to Babylon's collision coordinator.
  const paths = [-1, -1, 1, 1].map((side, band) => profile.map((point) =>
    new Vector3(point.x, point.y + (band === 0 || band === 3 ? RAIL_HEIGHT : 0), side * HALF_DECK_WIDTH)));
  const collider = MeshBuilder.CreateRibbon("central-camp-bridge-collider", {
    // Face the floor upward and the rails inward for ellipsoid collisions.
    pathArray: paths, sideOrientation: Mesh.BACKSIDE,
  }, scene);
  collider.parent = root;
  collider.visibility = 0;
  collider.isPickable = false;
  collider.checkCollisions = true;
  collider.metadata = { worldShadows: { cast: false, receive: false } };
  root.computeWorldMatrix(true);
  for (const mesh of root.getChildMeshes()) mesh.freezeWorldMatrix();
  return root;
};
