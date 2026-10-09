import {
  ArcRotateCamera,
  Vector3,
} from "@babylonjs/core";

import {
  CAMERA,
} from "./config";
import { keepCameraAboveTerrain } from "./cameraTerrainClearance";
import { createCameraImpulse } from "./cameraImpulse";

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

  const target = player.position.clone();
  const cameraTarget = target.clone();
  const impulse = createCameraImpulse(camera);
  camera.lockedTarget = cameraTarget;
  scene.onBeforeRenderObservable.add(() => {
    const snap = Vector3.DistanceSquared(target, player.position) > 64;
    const smoothing = 1 - Math.exp(-18 * Math.min(scene.getEngine().getDeltaTime(), 50) / 1000);
    target.y = snap ? player.position.y : target.y + (player.position.y - target.y) * smoothing;
    target.x = player.position.x;
    target.z = player.position.z;
    if (snap) impulse.reset();
    const offset = impulse.sample();
    cameraTarget.set(target.x + offset.x, target.y + offset.y, target.z + offset.z);
  });

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
  // Use the current orbit, not the previous frame's camera position.
  return new Vector3(-Math.cos(camera.alpha), 0, -Math.sin(camera.alpha));
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
