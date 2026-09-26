import { Color3, MeshBuilder, StandardMaterial, TransformNode } from "@babylonjs/core";

export const createProjectileVisuals = (scene) => {
  const active = new Map();
  const remove = (id) => {
    const projectile = active.get(id);
    if (!projectile) return;
    projectile.root.dispose();
    projectile.material.dispose();
    active.delete(id);
  };

  const builders = {
    arrow(root, material) {
      const shaft = MeshBuilder.CreateCylinder("arrowShaft", { height: 0.7, diameter: 0.045 }, scene);
      const tip = MeshBuilder.CreateCylinder("arrowTip", { height: 0.22, diameterTop: 0, diameterBottom: 0.18 }, scene);
      shaft.rotation.x = tip.rotation.x = Math.PI / 2;
      tip.position.z = 0.45;
      for (const mesh of [shaft, tip]) {
        mesh.parent = root;
        mesh.material = material;
        mesh.isPickable = false;
      }
      material.diffuseColor = Color3.FromHexString("#d4b483");
    },
    fireball(root, material) {
      const mesh = MeshBuilder.CreateSphere("fireball", { diameter: 0.45, segments: 8 }, scene);
      mesh.parent = root;
      mesh.material = material;
      mesh.isPickable = false;
      material.diffuseColor = Color3.FromHexString("#ef4415");
      material.emissiveColor = Color3.FromHexString("#ff6600");
    },
  };

  return {
    spawn(data) {
      const build = builders[data.type];
      if (!build) return;
      remove(data.id);
      const root = new TransformNode(`projectile-${data.id}`, scene);
      const material = new StandardMaterial(`projectile-material-${data.id}`, scene);
      root.position.set(data.x, data.y, data.z);
      root.rotation.y = Math.atan2(data.dx, data.dz);
      build(root, material);
      active.set(data.id, { ...data, root, material, remaining: data.lifetime });
    },
    remove,
    update(deltaTime) {
      for (const projectile of active.values()) {
        const elapsed = Math.min(deltaTime, projectile.remaining);
        const distance = projectile.speed * elapsed / 1000;
        projectile.root.position.x += projectile.dx * distance;
        projectile.root.position.z += projectile.dz * distance;
        projectile.remaining -= elapsed;
        if (projectile.remaining <= 0) remove(projectile.id);
      }
    },
    destroy() {
      for (const id of active.keys()) remove(id);
    },
  };
};
