import {
  Vector3,
} from "@babylonjs/core";

import {
  PLAYER,
  JUMP,
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

export const isMoving = (
  input
) => {
  return Boolean(
    input.keys.w ||
    input.keys.a ||
    input.keys.s ||
    input.keys.d
  );
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

export const createJumpController = (
  player
) => {
  let velocityY = 0;
  let jumping = false;

  const jump = () => {
    if (jumping) {
      return;
    }

    jumping = true;

    velocityY =
      JUMP.velocity;
  };

  const update = (
    deltaTime
  ) => {
    if (!jumping) {
      return;
    }

    const deltaSeconds =
      deltaTime / 1000;

    /*
     * Gravity.
     */
    velocityY -=
      JUMP.gravity *
      deltaSeconds;

    /*
     * Move vertically.
     */
    player.position.y +=
      velocityY *
      deltaSeconds;

    /*
     * Land.
     */
    if (
      player.position.y <=
      JUMP.groundY
    ) {
      player.position.y =
        JUMP.groundY;

      velocityY = 0;
      jumping = false;
    }
  };

  const reset = () => {
    velocityY = 0;
    jumping = false;

    player.position.y =
      JUMP.groundY;
  };

  const isJumping = () => {
    return jumping;
  };

  return {
    jump,
    update,
    reset,
    isJumping,
  };
};