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
    direction.lengthSquared() ===
    0
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

  if (
    keys.w
  ) {
    movement.addInPlace(
      forward
    );
  }

  if (
    keys.s
  ) {
    movement.subtractInPlace(
      forward
    );
  }

  if (
    keys.d
  ) {
    movement.addInPlace(
      right
    );
  }

  if (
    keys.a
  ) {
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
      keys:
        input.keys,

      camera,

      player,
    });

  if (
    movement.lengthSquared() ===
    0
  ) {
    return;
  }

  movement.normalize();

  const distance =
    PLAYER.speed *
    (
      deltaTime /
      1000
    );

  const displacement =
    movement.scale(
      distance
    );

  /*
   * Use Babylon collisions instead
   * of directly changing position.
   */

  player.moveWithCollisions(
    displacement
  );

  if (
    input.rightMouseDown
  ) {
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
  if (
    !input.rightMouseDown
  ) {
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
  let velocityY =
    0;

  let jumping =
    false;


  const jump =
    () => {
      if (
        jumping
      ) {
        return;
      }

      jumping =
        true;

      velocityY =
        JUMP.velocity;
    };


  const update =
    (
      deltaTime
    ) => {
      if (
        !jumping
      ) {
        return;
      }

      const deltaSeconds =
        deltaTime /
        1000;


      /*
       * Gravity
       */

      velocityY -=
        JUMP.gravity *
        deltaSeconds;


      /*
       * Vertical movement.
       *
       * moveWithCollisions()
       * allows landing on puzzle
       * blocks instead of moving
       * straight through them.
       */

      const beforeY =
        player.position.y;


      player.moveWithCollisions(
        new Vector3(
          0,
          velocityY *
            deltaSeconds,
          0
        )
      );


      const movedY =
        player.position.y -
        beforeY;


      /*
       * Detect landing on an object.
       *
       * If we're falling but Babylon
       * prevented us from moving the
       * requested distance downward,
       * something solid is underneath.
       */

      if (
        velocityY <
          0 &&
        Math.abs(
          movedY
        ) <
          Math.abs(
            velocityY *
              deltaSeconds
          ) *
            0.5
      ) {
        velocityY =
          0;

        jumping =
          false;

        return;
      }


      /*
       * Ground fallback.
       */

      if (
        player.position.y <=
        JUMP.groundY
      ) {
        player.position.y =
          JUMP.groundY;

        velocityY =
          0;

        jumping =
          false;
      }
    };


  const reset =
    () => {
      velocityY =
        0;

      jumping =
        false;

      player.position.y =
        JUMP.groundY;
    };


  const isJumping =
    () => {
      return jumping;
    };


  return {
    jump,
    update,
    reset,
    isJumping,
  };
};