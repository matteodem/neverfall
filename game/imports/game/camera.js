import {
  ArcRotateCamera,
  Vector3,
} from "@babylonjs/core";

import {
  CAMERA,
} from "./config";
import { keepCameraAboveTerrain } from "./cameraTerrainClearance";

const clamp = (
  value,
  min,
  max
) => {
  return Math.min(
    Math.max(value, min),
    max
  );
};

export const createGameCamera = (
  scene,
  player,
  ground
) => {
  const camera =
    new ArcRotateCamera(
      "camera",
      Math.PI * 1.5,
      Math.PI / 3,
      CAMERA.radius,
      player.position,
      scene
    );

  camera.lockedTarget =
    player;

  camera.minZ = CAMERA.nearPlane;
  camera.lowerRadiusLimit = CAMERA.minRadius;
  camera.upperRadiusLimit = CAMERA.maxRadius;
  if (ground) keepCameraAboveTerrain(camera, ground);

  return camera;
};

export const getCameraForward = (
  camera,
  player
) => {
  const forward =
    player.position.subtract(
      camera.position
    );

  forward.y = 0;

  if (
    forward.lengthSquared() > 0
  ) {
    forward.normalize();
  }

  return forward;
};

export const getCameraRight = (
  camera,
  player
) => {
  const forward =
    getCameraForward(
      camera,
      player
    );

  return new Vector3(
    forward.z,
    0,
    -forward.x
  ).normalize();
};

export const rotateCamera = (
  camera,
  movementX,
  movementY
) => {
  camera.alpha -=
    movementX *
    CAMERA.mouseSensitivity;

  camera.beta -=
    movementY *
    CAMERA.mouseSensitivity;

  camera.beta = clamp(
    camera.beta,
    CAMERA.minBeta,
    CAMERA.maxBeta
  );
};

export const zoomCamera = (
  camera,
  delta
) => {
  camera.radius +=
    delta *
    CAMERA.zoomSensitivity;

  camera.radius = clamp(
    camera.radius,
    CAMERA.minRadius,
    CAMERA.maxRadius
  );
};
