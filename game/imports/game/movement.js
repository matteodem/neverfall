import {
  Ray,
  Vector3,
} from "@babylonjs/core";
import { SOUTHEAST_MOUNTAIN, isInSoutheastMountain } from "./worldConfig";

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
  joystick,
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

  if (joystick) {
    movement.addInPlace(forward.scale(joystick.y));
    movement.addInPlace(right.scale(joystick.x));
  }
  return movement;
};


export const isMoving = (
  input
) => {
  return Boolean(
    Math.hypot(input.joystick?.x || 0, input.joystick?.y || 0) > 0.1 ||
    input.keys.w ||
    input.keys.a ||
    input.keys.s ||
    input.keys.d
  );
};

const limitMountainClimb = (player, terrain, displacement) => {
  // Include the ground mesh's outer triangles around the authored footprint.
  if (!terrain || !isInSoutheastMountain(player.position, 8)) return;
  const ahead = player.position.add(displacement.normalizeToNew().scale(
    player.ellipsoid.x + displacement.length()));
  // Probe the leading edge of the collision body, including normal jump height.
  const hit = terrain.intersects(new Ray(
    new Vector3(ahead.x, player.position.y + 3, ahead.z),
    new Vector3(0, -1, 0), 6,
  ), true);
  const normal = hit.hit && hit.getNormal(true, false);
  if (!normal || normal.y >= Math.cos(SOUTHEAST_MOUNTAIN.maxWalkSlopeDegrees * Math.PI / 180)) return;
  const intoSlope = displacement.x * normal.x + displacement.z * normal.z;
  if (intoSlope >= 0) return; // Descending and jumping away remain available.
  const horizontalNormalLength = normal.x * normal.x + normal.z * normal.z;
  // Remove only the uphill component, allowing movement along the contour.
  displacement.x -= normal.x * intoSlope / horizontalNormalLength;
  displacement.z -= normal.z * intoSlope / horizontalNormalLength;
};


export const updateMovement = ({
  deltaTime,
  input,
  camera,
  player,
  terrain = null,
  speedMultiplier = 1,
}) => {
  const movement =
    getMovementDirection({
      keys:
        input.keys,
      joystick: Math.hypot(input.joystick?.x || 0, input.joystick?.y || 0) > 0.1 ? input.joystick : null,

      camera,

      player,
    });

  if (
    movement.lengthSquared() ===
    0
  ) {
    return movement;
  }

  movement.normalize();

  const distance =
    PLAYER.speed * speedMultiplier *
    (
      deltaTime /
      1000
    );

  const displacement =
    movement.scale(
      distance
    );

  limitMountainClimb(player, terrain, displacement);
  movement.copyFrom(displacement).normalize();

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

    return movement;
  }

  faceDirection(
    player,
    movement
  );

  return movement;
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


  const moveVertical =
    (
      distance
    ) => {
      const beforeY =
        player.position.y;


      player.moveWithCollisions(
        new Vector3(
          0,
          distance,
          0
        )
      );


      return (
        player.position.y -
        beforeY
      );
    };


  const isStandingOnSurface =
    () => {
      const probeDistance =
        -0.08;


      const movedY =
        moveVertical(
          probeDistance
        );


      /*
       * If Babylon prevented most
       * of the downward probe,
       * there is a solid surface
       * directly below the player.
       */

      const standing =
        Math.abs(
          movedY
        ) <
        Math.abs(
          probeDistance
        ) *
          0.5;


      /*
       * If the probe actually moved
       * the player slightly down,
       * restore the original position.
       */

      if (
        !standing
      ) {
        player.position.y -=
          movedY;
      }


      return standing;
    };


  const jump =
    () => {
      if (
        jumping ||
        !isStandingOnSurface()
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
      const deltaSeconds =
        deltaTime /
        1000;


      /*
       * =====================================================
       * START FALLING
       * =====================================================
       *
       * If the player walks off a
       * block/platform, gravity starts
       * automatically.
       */

      if (
        !jumping &&
        !isStandingOnSurface()
      ) {
        jumping =
          true;

        velocityY =
          0;
      }


      if (
        !jumping
      ) {
        return;
      }


      /*
       * =====================================================
       * GRAVITY
       * =====================================================
       */

      velocityY -=
        JUMP.gravity *
        deltaSeconds;


      const requestedMovement =
        velocityY *
        deltaSeconds;


      const movedY =
        moveVertical(
          requestedMovement
        );


      /*
       * =====================================================
       * LANDING
       * =====================================================
       */

      if (
        velocityY <
          0 &&
        Math.abs(
          movedY
        ) <
          Math.abs(
            requestedMovement
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
       * =====================================================
       * WORLD GROUND FALLBACK
       * =====================================================
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
