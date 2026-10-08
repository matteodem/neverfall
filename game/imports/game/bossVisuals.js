import { Color3, MeshBuilder, StandardMaterial } from "@babylonjs/core";

import { createVisualPool } from "./visualPool";
import { ENEMY_TYPES } from "./enemyConfig";
import { getWorldHeight } from "./worldConfig";

export const createBossVisuals = (scene, { dungeon = false } = {}) => {
  const active = new Map();
  const impacts = new Map();
  const groundHeight = dungeon ? () => 0 : getWorldHeight;
  const placeOnGround = (mesh, x, z, radius) => {
    mesh.position.set(x, groundHeight(x, z) + 0.12, z);
    mesh.rotation.x = -Math.atan((groundHeight(x, z + radius) - groundHeight(x, z - radius)) / (2 * radius));
    mesh.rotation.z = Math.atan((groundHeight(x + radius, z) - groundHeight(x - radius, z)) / (2 * radius));
  };
  const remove = (id) => {
    const visual = active.get(id);
    if (!visual) return;
    pool.release(visual);
    active.delete(id);
  };

  const pool = createVisualPool({
    limit: 8,
    create() {
      const material = new StandardMaterial("boss-warning", scene);
      material.alpha = 0.4;
      const rimMaterial = new StandardMaterial("boss-warning-rim", scene);
      rimMaterial.alpha = 0.9;
      const circle = MeshBuilder.CreateCylinder("boss-circle", {
        diameter: 2, height: 0.04, tessellation: 32,
      }, scene);
      const path = MeshBuilder.CreateBox("boss-charge", { width: 1, height: 0.04, depth: 1 }, scene);
      const ring = MeshBuilder.CreateTorus("boss-warning-edge", {
        diameter: 2, thickness: 0.06, tessellation: 32,
      }, scene);
      ring.material = rimMaterial;
      ring.isPickable = false;
      for (const mesh of [circle, path]) {
        mesh.material = material;
        mesh.isPickable = false;
      }
      return { circle, path, ring, material, rimMaterial };
    },
    dispose(visual) {
      visual.circle.dispose(); visual.path.dispose(); visual.ring.dispose();
      visual.material.dispose(); visual.rimMaterial.dispose();
    },
    setEnabled(visual, enabled) {
      visual.circle.setEnabled(enabled); visual.path.setEnabled(enabled); visual.ring.setEnabled(enabled);
    },
  });

  return {
    getStats: () => ({ active: active.size + impacts.size, ...pool.getStats() }),
    impact({ enemyId, type, x, z, radius }) {
      const ability = ENEMY_TYPES[type]?.bossMechanics?.aoe;
      if (!ability?.name) return;
      if (impacts.has(enemyId)) pool.release(impacts.get(enemyId).visual);
      const visual = pool.acquire();
      const color = Color3.FromHexString(ability.color);
      visual.material.emissiveColor = visual.material.diffuseColor = color;
      visual.rimMaterial.emissiveColor = visual.rimMaterial.diffuseColor = color;
      visual.path.setEnabled(false);
      placeOnGround(visual.circle, x, z, radius);
      placeOnGround(visual.ring, x, z, radius);
      impacts.set(enemyId, { visual, radius, startedAt: performance.now() });
    },
    update(enemies, isVisible = () => true) {
      const now = performance.now();
      for (const [id, impact] of impacts) {
        const progress = Math.min(1, (now - impact.startedAt) / 450);
        if (progress >= 1 || !isVisible(id)) {
          pool.release(impact.visual);
          impacts.delete(id);
          continue;
        }
        const { visual, radius } = impact;
        visual.circle.scaling.set(radius, 1, radius);
        visual.ring.scaling.set(radius * (0.85 + progress * 0.3), 1, radius * (0.85 + progress * 0.3));
        visual.material.alpha = 0.7 * (1 - progress);
        visual.rimMaterial.alpha = 1 - progress;
      }
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
          visual = pool.acquire();
          active.set(id, visual);
        }
        const aoe = enemy.bossAction === "aoe";
        const ability = ENEMY_TYPES[enemy.type]?.bossMechanics?.aoe;
        const polished = aoe && Boolean(ability?.name);
        const charge = enemy.bossAction === "chargeWindup" || enemy.bossAction === "charge";
        visual.material.alpha = polished ? 0.38 + Math.sin(now / 110) * 0.1 : 0.4;
        visual.material.emissiveColor = Color3.FromHexString(polished ? ability.color : charge ? "#ff9900" : "#ff3333");
        visual.material.diffuseColor = visual.material.emissiveColor;
        visual.ring.setEnabled(polished);
        visual.rimMaterial.alpha = 0.9;
        visual.rimMaterial.emissiveColor = visual.rimMaterial.diffuseColor = visual.material.emissiveColor;
        visual.circle.setEnabled(!charge);
        const radius = aoe ? enemy.bossRadius : 1.5;
        visual.circle.scaling.set(radius, 1, radius);
        visual.circle.position.set(aoe ? enemy.bossTargetX : enemy.x, enemy.y + 0.04, aoe ? enemy.bossTargetZ : enemy.z);
        visual.circle.rotation.set(0, 0, 0);
        if (polished) {
          placeOnGround(visual.circle, enemy.bossTargetX, enemy.bossTargetZ, radius);
          placeOnGround(visual.ring, enemy.bossTargetX, enemy.bossTargetZ, radius);
          visual.ring.scaling.set(radius, 1, radius);
        }
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
      active.clear();
      impacts.clear();
      pool.destroy();
    },
  };
};
