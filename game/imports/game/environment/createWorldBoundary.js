import { MeshBuilder } from "@babylonjs/core";
import { WORLD_BOUNDARY, WORLD_EAST_BOUNDARY } from "../worldConfig";

export const createWorldBoundary = (scene) => {
  const length = WORLD_BOUNDARY * 2 + 2;
  const walls = [
    { name: "north", width: length, depth: 2, x: 0, z: WORLD_BOUNDARY },
    { name: "south", width: length, depth: 2, x: 0, z: -WORLD_BOUNDARY },
    { name: "east", width: 2, depth: length, x: WORLD_EAST_BOUNDARY, z: 0 },
    { name: "west", width: 2, depth: length, x: -WORLD_BOUNDARY, z: 0 },
  ];

  for (const wall of walls) {
    const mesh = MeshBuilder.CreateBox(`worldBoundary-${wall.name}`, {
      width: wall.width,
      height: 500,
      depth: wall.depth,
    }, scene);
    mesh.position.set(wall.x, 100, wall.z);
    mesh.visibility = 0;
    mesh.isPickable = false;
    mesh.checkCollisions = true;
    mesh.freezeWorldMatrix();
  }
};
