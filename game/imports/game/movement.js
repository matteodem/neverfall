import {
  Vector3,
} from "@babylonjs/core";

import {
  PLAYER,
} from "./config";

import {
  getCameraForward,
  getCameraRight,
} from "./camera";

export const faceDirection = (
  player,
  direction
) => {
  if (
    direction.lengthSquared() === 0
  ) {
    return;
  }

  player.rotation.y =
    Math.atan2(
      direction.x,
      direction.z
    );
};

const getMovementDirection = ({
  keys,
  camera,
  player,
}) => {
  const movement =
    Vector3.Zero();

  const forward =
    getCameraForward(
      camera,
      player
    );

  const right =
    getCameraRight(
      camera,
      player
    );

  if (keys.w) {
    movement.addInPlace(
      forward
    );
  }

  if (keys.s) {
    movement.subtractInPlace(
      forward
    );
  }

  if (keys.d) {
    movement.addInPlace(
      right
    );
  }

  if (keys.a) {
    movement.subtractInPlace(
      right
    );
  }

  return movement;
};

export const updateMovement = ({
  deltaTime,
  input,
  camera,
  player,
}) => {
  const movement =
    getMovementDirection({
      keys: input.keys,
      camera,
      player,
    });

  if (
    movement.lengthSquared() === 0
  ) {
    return;
  }

  movement.normalize();

  const distance =
    PLAYER.speed *
    (deltaTime / 1000);

  player.position.addInPlace(
    movement.scale(distance)
  );

  if (input.rightMouseDown) {
    faceDirection(
      player,
      getCameraForward(
        camera,
        player
      )
    );

    return;
  }

  faceDirection(
    player,
    movement
  );
};

export const updateCameraFacing = ({
  input,
  camera,
  player,
}) => {
  if (!input.rightMouseDown) {
    return;
  }

  faceDirection(
    player,
    getCameraForward(
      camera,
      player
    )
  );
};