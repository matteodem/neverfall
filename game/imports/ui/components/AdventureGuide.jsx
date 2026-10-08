import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../api/characters/characters";
import { getAdventureGuideObjective } from "../../game/adventureGuide";
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
  const objective = getAdventureGuideObjective(character);

  return (
    <div id="onboarding-adventure-guide" className="w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-white/10 bg-black/60 p-4 text-white shadow-lg" role="status">
      <div className="text-xs font-semibold uppercase text-yellow-300">Adventure Guide</div>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 font-bold">{objective.title}</div>
        {objective.progress && <div key={`${objective.id}-${objective.stepProgress}-${objective.progress}`}
          className="motion-safe:animate-pulse rounded bg-yellow-300/15 px-2 py-1 text-sm font-semibold text-yellow-200"
          style={{ animationDuration: "700ms", animationIterationCount: 1 }}>
          {objective.progress}
        </div>}
      </div>
      {objective.stepProgress && <div className="mt-1 text-xs text-white/60">{objective.stepProgress}</div>}
      {objective?.hint && <div className="mt-1 text-xs text-white/80">{mobile && objective.mobileHint ? objective.mobileHint : objective.hint}</div>}
      {objective.action && <button type="button" className={`btn btn-primary mt-2 w-full ${mobile ? "min-h-11" : "btn-sm"}`}
        {...actionButtonHandlers(() => {
          const { modal, tab } = objective.action;
          if (tab) openSection(modal, tab);
          else openModal(modal);
        }, mobile)}>
        {objective.action.label}
      </button>}
    </div>
  );
};
