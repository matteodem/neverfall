import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../api/characters/characters";
import { getAdventureGuideRegions } from "../../game/adventureGuide";
import { useHudStore } from "../stores/useHudStore";
import { useMobileDevice } from "../hooks/useMobileDevice";
import { actionButtonHandlers } from "./actionButtonHandlers";

export const AdventureGuide = () => {
  const { mobile } = useMobileDevice();
  const openModal = useHudStore((state) => state.openModal);
  const openSection = useHudStore((state) => state.openSection);
  const character = useTracker(() => {
    const id = Meteor.user()?.profile?.currentCharacterId;
    return id ? Characters.findOne(id) : null;
  });
  if (!character) return null;
  const recommended = getAdventureGuideRegions(character).find((region) => region.recommended);
  if (!recommended) return null;

  return (
    <div id="onboarding-adventure-guide" className="w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-white/10 bg-black/60 p-4 text-white shadow-lg">
      <div className="text-xs font-semibold uppercase text-yellow-300">Adventure Guide</div>
      <div className="mt-2">
        <div className="font-bold">{recommended.name}</div>
        <p className="mt-1 text-xs text-white/80">{recommended.hint}</p>
        <p className="mt-1 text-sm">Speak with {recommended.npcName} and complete quests to continue.</p>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" className={`btn btn-primary flex-1 ${mobile ? "min-h-11" : "btn-sm"}`}
          {...actionButtonHandlers(() => openModal("map"), mobile)}>Map</button>
        <button type="button" className={`btn flex-1 ${mobile ? "min-h-11" : "btn-sm"}`}
          {...actionButtonHandlers(() => openSection("hero", "quests"), mobile)}>Quests</button>
      </div>
    </div>
  );
};
