import { createAmirCharacter } from "../character/amir/createAmirCharacter";
import { createNameplate } from "../nameplate";
import { NPC_DEFINITIONS, NPC_INTERACTION_RANGE } from "./npcDefinitions";
import { useNpcStore } from "../../ui/stores/useNpcStore";
import { useHudStore } from "../../ui/stores/useHudStore";
import { getNpcQuestMarker } from "./questMarkers";

// Deterministic client-side entities; no player movement, combat or network state.
export const createNpcManager = ({ scene, player, canInteract = () => true, getCharacter = () => null, definitions = NPC_DEFINITIONS }) => {
  const npcs = [];
  let disposed = false;
  const store = () => useNpcStore.getState();
  const updateMarker = (npc) => {
    const marker = getNpcQuestMarker(npc.definition.id, getCharacter());
    if (marker === npc.marker) return;
    npc.marker = marker;
    npc.questMarker.setName(marker || "");
    npc.questMarker.setVisible(Boolean(marker));
  };
  const distanceTo = (npc) => Math.hypot(
    player.position.x - npc.position.x,
    player.position.y - npc.position.y,
    player.position.z - npc.position.z,
  );
  const inRange = (npc) => distanceTo(npc) <= (npc.interactionRange ?? NPC_INTERACTION_RANGE);
  const nearest = () => {
    if (disposed || !canInteract()) return null;
    let closest = null;
    let distance = Infinity;
    for (const { definition } of npcs) {
      const nextDistance = distanceTo(definition);
      if (inRange(definition) && nextDistance < distance) {
        closest = definition;
        distance = nextDistance;
      }
    }
    return closest;
  };
  const interact = () => {
    if (disposed) return false;
    if (store().dialogue) return true;
    const npc = nearest();
    if (!npc) return false;
    if (!useHudStore.getState().activeModal) store().openDialogue(npc);
    return true;
  };
  const destroy = () => {
    if (disposed) return;
    disposed = true;
    for (const { actor, animations, nameplate, questMarker } of npcs.splice(0)) {
      questMarker.destroy();
      nameplate.destroy();
      animations.destroy();
      actor.dispose();
    }
    store().reset();
  };
  store().setActionHandler(interact);
  const disposeObserver = scene.onDisposeObservable.addOnce(destroy);

  for (const definition of definitions) {
    // Failed or late loads never leave a partially initialized NPC in the world.
    const spawn = async () => {
      let actor;
      let animations;
      let nameplate;
      let questMarker;
      try {
        actor = await createAmirCharacter({ scene, appearance: definition.appearance, gameClass: definition.gameClass });
        if (disposed || scene.isDisposed) { actor.dispose(); return; }
        actor.root.name = `npc-${definition.id}`;
        actor.root.position.set(definition.position.x, definition.position.y, definition.position.z);
        actor.root.rotation.y = definition.rotationY ?? 0;
        animations = actor.createAnimationController();
        animations.update(0);
        nameplate = createNameplate({ scene, player: actor.root, name: definition.name, y: 2.3, color: "#facc15" });
        questMarker = createNameplate({ scene, player: actor.root, name: "", y: 2.55, scale: 1.8, color: "#facc15" });
        const npc = { definition, actor, animations, nameplate, questMarker };
        updateMarker(npc);
        npcs.push(npc);
      } catch (error) {
        questMarker?.destroy();
        nameplate?.destroy();
        animations?.destroy();
        actor?.dispose();
        if (!disposed) console.error(`[NPC] Could not load ${definition.id}`, error);
      }
    };
    void spawn();
  }

  return {
    interact,
    update(deltaTime) {
      if (disposed) return;
      for (const npc of npcs) {
        npc.animations.update(deltaTime);
        updateMarker(npc);
      }
      store().setNearby(nearest());
      const dialogue = store().dialogue;
      if (dialogue && (!canInteract() || !inRange(dialogue))) store().closeDialogue();
    },
    destroy() {
      scene.onDisposeObservable.remove(disposeObserver);
      destroy();
    },
  };
};
