// Keep only Babylon's center handle and preserve the drag-start proportions.
export const configureUniformScaleGizmo = (gizmo) => {
  for (const axis of [gizmo.xGizmo, gizmo.yGizmo, gizmo.zGizmo]) axis.isEnabled = false;
  gizmo.uniformScaleGizmo.uniformScaling = true;
  let start = null;
  gizmo.onDragStartObservable.add(() => {
    const root = gizmo.attachedNode;
    start = root ? { root, scaling: root.scaling.clone(), rotation: root.rotation.clone(),
      quaternion: root.rotationQuaternion?.clone() } : null;
  });
  gizmo.onDragObservable.add(() => {
    if (!start || gizmo.attachedNode !== start.root) return;
    const { root, scaling, rotation, quaternion } = start;
    const initial = [scaling.x, scaling.y, scaling.z];
    const proposed = Math.min(root.scaling.x / scaling.x, root.scaling.y / scaling.y, root.scaling.z / scaling.z);
    // Match worldObjectValidation's limits using one factor for all axes.
    const minimum = 0.05 / Math.min(...initial), maximum = 20 / Math.max(...initial);
    const factor = Math.max(minimum, Math.min(maximum, Number.isFinite(proposed) ? proposed : 1));
    // Clamp floating-point roundoff at the limits, too.
    root.scaling.copyFromFloats(...initial.map((value) => Math.max(0.05, Math.min(20, value * factor))));
    // A large negative drag can make Babylon decompose a reflected matrix.
    // Restore orientation so clamping never flips or rotates the asset.
    root.rotation.copyFrom(rotation);
    root.rotationQuaternion = quaternion?.clone() || null;
    root.computeWorldMatrix(true);
  });
  gizmo.onDragEndObservable.add(() => { start = null; });
};
