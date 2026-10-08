import { Ray, SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";
import { createTreasureChest } from "./createTreasureChest";
import { createNameplate } from "../nameplate";
import { BASIC_TOWER_PLATFORM_POINT, BASIC_TOWER_POSITION, BASIC_TOWER_ROTATION_Y, BASIC_TOWER_SCALE } from "../basicTowerConfig";
import { getWorldHeight } from "../worldConfig";

export const createBasicTower = async (scene) => {
  const { meshes } = await SceneLoader.ImportMeshAsync("", "/models/jumping-puzzle/", "basic-tower.glb", scene);
  const root = new TransformNode("basicJumpingTower", scene);
  const model = new TransformNode("basicJumpingTowerModel", scene);
  model.parent = root;
  for (const mesh of meshes) if (!mesh.parent) mesh.parent = model;

  let minX = Infinity; let maxX = -Infinity;
  let minY = Infinity;
  let minZ = Infinity; let maxZ = -Infinity;
  const towerMeshes = model.getChildMeshes().filter((mesh) => mesh.getTotalVertices());
  for (const mesh of towerMeshes) {
    mesh.computeWorldMatrix(true);
    const bounds = mesh.getBoundingInfo().boundingBox;
    minX = Math.min(minX, bounds.minimumWorld.x);
    maxX = Math.max(maxX, bounds.maximumWorld.x);
    minY = Math.min(minY, bounds.minimumWorld.y);
    minZ = Math.min(minZ, bounds.minimumWorld.z);
    maxZ = Math.max(maxZ, bounds.maximumWorld.z);
    mesh.checkCollisions = true;
    mesh.isPickable = false;
    mesh.receiveShadows = true;
  }

  model.scaling.setAll(BASIC_TOWER_SCALE);
  model.position.set(-(minX + maxX) / 2 * BASIC_TOWER_SCALE,
    -minY * BASIC_TOWER_SCALE, -(minZ + maxZ) / 2 * BASIC_TOWER_SCALE);
  root.position.set(BASIC_TOWER_POSITION.x,
    getWorldHeight(BASIC_TOWER_POSITION.x, BASIC_TOWER_POSITION.z), BASIC_TOWER_POSITION.z);
  root.rotation.y = BASIC_TOWER_ROTATION_Y;
  for (const mesh of towerMeshes) {
    mesh.computeWorldMatrix(true);
  }

  // The GLB has no separate platform mesh, so use its final platform's local
  // X/Z and pick the actual top-facing surface rather than the tallest vertex.
  const platformMesh = towerMeshes.find((mesh) => mesh.name === "output_unwrapped") || towerMeshes[0];
  const platformWorld = Vector3.TransformCoordinates(
    new Vector3(BASIC_TOWER_PLATFORM_POINT.x, BASIC_TOWER_PLATFORM_POINT.y, BASIC_TOWER_PLATFORM_POINT.z),
    platformMesh.getWorldMatrix());
  const highestY = Math.max(...towerMeshes.map((mesh) => mesh.getBoundingInfo().boundingBox.maximumWorld.y));
  const surface = scene.pickWithRay(
    new Ray(new Vector3(platformWorld.x, highestY + 1, platformWorld.z), Vector3.Down()),
    (mesh) => towerMeshes.includes(mesh));
  if (!surface?.hit || !surface.pickedPoint) throw new Error("Tower top platform surface not found");

  for (const mesh of towerMeshes) mesh.freezeWorldMatrix();

  const { root: chestRoot } = createTreasureChest(scene, "basicTowerRewardChest", { collisions: true });
  chestRoot.parent = root;
  chestRoot.position.copyFrom(Vector3.TransformCoordinates(
    surface.pickedPoint, root.getWorldMatrix().clone().invert()));
  chestRoot.position.y += 0.02;
  createNameplate({ scene, player: chestRoot, name: "Tower Chest", color: "#facc15", y: 1.7 });
  return root;
};
