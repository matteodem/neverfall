import { Color3, GlowLayer, MeshBuilder, StandardMaterial } from "@babylonjs/core";
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
  const glow = new GlowLayer("lootGlow", scene);
  glow.intensity = 0.8;

  const stopAdd = callbacks.onAdd("loot", (loot, id) => {
    const local = room.state?.players?.get(room.sessionId);
    if (loot.ownerId !== local?.userId || (loot.ownerCharacterId && loot.ownerCharacterId !== local?.characterId)) return;
    const orb = MeshBuilder.CreateSphere(`loot-${id}`, { diameter: 0.3, segments: 12 }, scene);
    orb.position.set(loot.x, loot.y + 0.5, loot.z);
    orb.material = material;
    orb.isPickable = false;
    glow.addIncludedOnlyMesh(orb);
    orbs.set(id, orb);
  });
  const stopRemove = callbacks.onRemove("loot", (_loot, id) => {
    const orb = orbs.get(id);
    if (orb) {
      glow.removeIncludedOnlyMesh(orb);
      orb.dispose();
      orbs.delete(id);
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
    destroy() {
      stopAdd();
      stopRemove();
      for (const orb of orbs.values()) orb.dispose();
      orbs.clear();
      glow.dispose();
      material.dispose();
      useLootStore.getState().setNearbyId(null);
    },
  };
};
