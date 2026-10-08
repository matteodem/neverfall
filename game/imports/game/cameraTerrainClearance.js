import { CAMERA } from "./config";

// Run after ArcRotateCamera computes its orbit, including target movement and zoom.
// Sample the rendered GroundMesh, not the untriangulated terrain height function.
export const keepCameraAboveTerrain = (camera, ground) => {
  const { minimumWorld: min, maximumWorld: max } = ground.getBoundingInfo().boundingBox;
  const heightAt = (x, z) => ground.getHeightAtCoordinates(
    Math.max(min.x + 0.001, Math.min(max.x - 0.001, x)),
    Math.max(min.z + 0.001, Math.min(max.z - 0.001, z)),
  );
  let correcting = false;
  camera.onViewMatrixChangedObservable.add(() => {
    if (correcting) return;
    const aspect = camera.getEngine().getAspectRatio(camera);
    const halfFov = Math.tan(camera.fov / 2);
    const nearRadius = camera.minZ * Math.hypot(1,
      halfFov * Math.max(1, aspect), halfFov * Math.max(1, 1 / aspect));
    const clearance = Math.max(CAMERA.groundClearance, nearRadius + 0.05);
    const clearsTerrain = (position) => {
      // Protect the near plane and use the rim height outside the ground bounds.
      for (const dx of [-clearance, 0, clearance]) {
        for (const dz of [-clearance, 0, clearance]) {
          if (position.y < heightAt(position.x + dx, position.z + dz) + clearance + 0.0001)
            return false;
        }
      }
      return true;
    };
    if (clearsTerrain(camera.position)) return;

    // Recover the resolved target from the current Y-up orbit (including locked
    // target movement). Raising pitch along this sphere preserves selected zoom.
    const radius = camera.radius;
    const cosAlpha = Math.cos(camera.alpha);
    const sinAlpha = Math.sin(camera.alpha);
    const target = {
      x: camera.position.x - radius * cosAlpha * Math.sin(camera.beta),
      y: camera.position.y - radius * Math.cos(camera.beta),
      z: camera.position.z - radius * sinAlpha * Math.sin(camera.beta),
    };
    const positionAt = (beta) => ({
      x: target.x + radius * cosAlpha * Math.sin(beta),
      y: target.y + radius * Math.cos(beta),
      z: target.z + radius * sinAlpha * Math.sin(beta),
    });
    let safeBeta = camera.lowerBetaLimit ?? 0.001;
    let blockedBeta = camera.beta;
    for (let step = 0; step < 16; step++) {
      const beta = (safeBeta + blockedBeta) / 2;
      if (clearsTerrain(positionAt(beta))) safeBeta = beta;
      else blockedBeta = beta;
    }
    correcting = true;
    try {
      // Update the view before rendering without setPosition(), which rebuilds
      // radius and would silently zoom out. The nested notification is guarded.
      camera.beta = safeBeta;
      camera.getViewMatrix(true);
    } finally {
      correcting = false;
    }
  });
};
