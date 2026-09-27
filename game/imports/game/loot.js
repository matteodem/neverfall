import { QUALITY_PRESETS } from "./performanceConfig";
import { Color3, GlowLayer, MeshBuilder, StandardMaterial } from "@babylonjs/core";
import { createVisualPool } from "./visualPool";
import { JUMP } from "./config";
import { canCollectLoot } from "./inventory";
import { useLootStore } from "../ui/stores/useLootStore";
import { useHudStore } from "../ui/stores/useHudStore";
import {
  playGameSound,
} from "./sound";

export const createLoot = ({ scene, room, callbacks, player }) => {
  const orbs = new Map();
  const material = new StandardMaterial("lootMaterial", scene);
  material.emissiveColor = Color3.White();
  material.disableLighting = true;
  const quality = scene.metadata?.quality || QUALITY_PRESETS.standard;
  const glow = new GlowLayer("lootGlow", scene, { mainTextureFixedSize: quality.glowTextureSize });
  glow.isEnabled = false;
  glow.intensity = 0.8;

  const pool = createVisualPool({
    create() {
      const orb = MeshBuilder.CreateSphere("loot-orb", { diameter: 0.3, segments: 8 }, scene);
      orb.material = material;
      orb.isPickable = false;
      return orb;
    },
    dispose: (orb) => orb.dispose(),
    setEnabled: (orb, enabled) => orb.setEnabled(enabled),
  });

  const stopAdd = callbacks.onAdd("loot", (loot, id) => {
    const local = room.state?.players?.get(room.sessionId);
    if (loot.ownerId !== local?.userId || (loot.ownerCharacterId && loot.ownerCharacterId !== local?.characterId)) return;
    const orb = pool.acquire();
    orb.position.set(loot.x, loot.y + 0.5, loot.z);
    orb.material = material;
    orb.isPickable = false;
    glow.addIncludedOnlyMesh(orb);
    orbs.set(id, orb);
    glow.isEnabled = true;
  });
  const stopRemove = callbacks.onRemove("loot", (_loot, id) => {
    const orb = orbs.get(id);
    if (orb) {
      glow.removeIncludedOnlyMesh(orb);
      pool.release(orb);
      orbs.delete(id);
      glow.isEnabled = orbs.size > 0;
    }
    if (useLootStore.getState().nearbyId === id) {
      useLootStore.getState().setNearbyId(null);
    }
  });

  const update = () => {
    // The render loop can start before Colyseus delivers the initial state.
    const state = room.state?.players?.get(room.sessionId);
    let nearbyId = null;
    let nearest = Infinity;
    if (state) {
      const position = {
        userId: state.userId,
        characterId: state.characterId,
        inDungeon: state.inDungeon,
        health: state.health,
        x: player.position.x,
        y: player.position.y - JUMP.groundY,
        z: player.position.z,
      };
      for (const id of orbs.keys()) {
        const loot = room.state?.loot?.get(id);
        if (!canCollectLoot(position, loot)) continue;
        const distance = Math.hypot(position.x - loot.x, position.z - loot.z);
        if (distance < nearest) {
          nearest = distance;
          nearbyId = id;
        }
      }
    }
    if (useLootStore.getState().nearbyId !== nearbyId) {
      useLootStore.getState().setNearbyId(nearbyId);
    }
  };

  const collect =
    () => {
      update();


      const {
        nearbyId,
      } =
        useLootStore
          .getState();


      if (
        !nearbyId ||
        useHudStore
          .getState()
          .activeModal
      ) {
        return;
      }


      room.send(
        "loot",
        nearbyId
      );


      playGameSound(
        "loot"
      );
    };

  return {
    update,
    collect,
    getStats: () => ({ active: orbs.size, ...pool.getStats() }),
    destroy() {
      stopAdd();
      stopRemove();
      pool.destroy();
      orbs.clear();
      glow.dispose();
      material.dispose();
      useLootStore.getState().setNearbyId(null);
    },
  };
};
