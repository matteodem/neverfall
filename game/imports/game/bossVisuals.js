import { Color3, MeshBuilder, StandardMaterial } from "@babylonjs/core";

export const createBossVisuals = (scene) => {
  const active = new Map();
  const remove = (id) => {
    const visual = active.get(id);
    if (!visual) return;
    visual.circle.dispose();
    visual.path.dispose();
    visual.material.dispose();
    active.delete(id);
  };

  return {
    update(enemies, isVisible = () => true) {
      for (const id of active.keys()) {
        if (!enemies.has(id)) remove(id);
      }
      for (const [id, enemy] of enemies) {
        if (!isVisible(id) || (!enemy.bossAction && !enemy.enraged)) {
          remove(id);
          continue;
        }
        let visual = active.get(id);
        if (!visual) {
          const material = new StandardMaterial(`boss-warning-${id}`, scene);
          material.alpha = 0.4;
          const circle = MeshBuilder.CreateCylinder(`boss-circle-${id}`, {
            diameter: 2, height: 0.04, tessellation: 32,
          }, scene);
          const path = MeshBuilder.CreateBox(`boss-charge-${id}`, { width: 1, height: 0.04, depth: 1 }, scene);
          for (const mesh of [circle, path]) {
            mesh.material = material;
            mesh.isPickable = false;
          }
          visual = { circle, path, material };
          active.set(id, visual);
        }
        const aoe = enemy.bossAction === "aoe";
        const charge = enemy.bossAction === "chargeWindup" || enemy.bossAction === "charge";
        visual.material.emissiveColor = Color3.FromHexString(charge ? "#ff9900" : "#ff3333");
        visual.material.diffuseColor = visual.material.emissiveColor;
        visual.circle.setEnabled(!charge);
        const radius = aoe ? enemy.bossRadius : 1.5;
        visual.circle.scaling.set(radius, 1, radius);
        visual.circle.position.set(aoe ? enemy.bossTargetX : enemy.x, enemy.y + 0.04, aoe ? enemy.bossTargetZ : enemy.z);
        visual.path.setEnabled(charge);
        if (charge) {
          const dx = enemy.bossTargetX - enemy.x;
          const dz = enemy.bossTargetZ - enemy.z;
          visual.path.scaling.set(enemy.bossRadius * 2, 1, Math.max(0.01, Math.hypot(dx, dz)));
          visual.path.rotation.y = Math.atan2(dx, dz);
          visual.path.position.set((enemy.x + enemy.bossTargetX) / 2, enemy.y + 0.04, (enemy.z + enemy.bossTargetZ) / 2);
        }
      }
    },
    destroy() {
      for (const id of active.keys()) remove(id);
    },
  };
};
