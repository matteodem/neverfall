import { Color3, MeshBuilder, StandardMaterial, TransformNode } from "@babylonjs/core";

import { createVisualPool } from "./visualPool";

export const createProjectileVisuals = (scene) => {
  const active = new Map();
  const remove = (id) => {
    const projectile = active.get(id);
    if (!projectile) return;
    pools.get(projectile.type).release(projectile.visual);
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
    fireNova(root, material, data) {
      const mesh = MeshBuilder.CreateCylinder("fireNova", { diameter: 2, height: 0.05, tessellation: 32 }, scene);
      mesh.parent = root;
      mesh.material = material;
      mesh.isPickable = false;
      material.emissiveColor = Color3.FromHexString("#ff6600");
      material.alpha = 0.5;
    },
  };

  const pools = new Map();
  const materials = new Map();
  const getPool = (type) => {
    if (!pools.has(type)) {
      const material = new StandardMaterial(`projectile-material-${type}`, scene);
      materials.set(type, material);
      pools.set(type, createVisualPool({
        create() {
          const root = new TransformNode(`projectile-${type}`, scene);
          builders[type](root, material);
          return { root };
        },
        dispose: ({ root }) => root.dispose(),
        setEnabled: ({ root }, enabled) => root.setEnabled(enabled),
      }));
    }
    return pools.get(type);
  };

  return {
    spawn(data) {
      if (!builders[data.type]) return;
      remove(data.id);
      const visual = getPool(data.type).acquire();
      const { root } = visual;
      root.position.set(data.x, data.y, data.z);
      root.rotation.set(0, Math.atan2(data.dx, data.dz), 0);
      if (data.type === "fireNova") root.scaling.set(data.radius, 1, data.radius);
      else root.scaling.setAll((data.scale || 1) * (data.type === "arrow" ? 1.5 : 1));
      active.set(data.id, { ...data, root, visual, remaining: data.lifetime });
    },
    getStats() {
      const stats = Array.from(pools.values(), (pool) => pool.getStats());
      return { active: active.size, retained: stats.reduce((sum, stat) => sum + stat.retained, 0),
        created: stats.reduce((sum, stat) => sum + stat.created, 0) };
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
      active.clear();
      for (const pool of pools.values()) pool.destroy();
      for (const material of materials.values()) material.dispose();
      pools.clear();
      materials.clear();
    },
  };
};
