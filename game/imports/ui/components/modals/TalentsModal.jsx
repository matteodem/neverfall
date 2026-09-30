import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../../api/characters/characters";
import { TALENT_LEVELS, TALENTS } from "../../../game/talents";
import { useTalentStore } from "../../stores/useTalentStore";
import { HudModal } from "../HudModal";

export const TalentsModal = ({ embedded = false }) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const character = useTracker(() => {
    const id = Meteor.user()?.profile?.currentCharacterId;
    return id ? Characters.findOne(id) : null;
  });
  const choices = TALENTS[character?.gameClass] || {};
  const talents = character?.talents || {};
  const level = character?.currentLevel || 1;

  return (
    <HudModal id="talents" title="Talents" embedded={embedded} onClose={() => setConfirmReset(false)} maxHeight={680}>
      <div className="space-y-3">
        {TALENT_LEVELS.map((milestone) => {
          const locked = level < milestone;
          const selected = talents[milestone];
          return (
            <section key={milestone} className="rounded-lg border border-base-300 p-3">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-semibold">Level {milestone}</h4>
                <span className="text-xs opacity-70">{locked ? "Locked" : selected ? "Selected" : "Choose one"}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {(choices[milestone] || []).map((talent) => (
                  <button
                    key={talent.id}
                    type="button"
                    disabled={locked || Boolean(selected)}
                    onClick={() => useTalentStore.getState().select(milestone, talent.id)}
                    className={`rounded-lg border p-3 text-left ${selected === talent.id ? "border-primary bg-primary/10" : "border-base-300"} disabled:cursor-default`}
                    aria-pressed={selected === talent.id}
                  >
                    <strong className="block text-sm">{talent.label}</strong>
                    <span className="text-xs opacity-70">{talent.description}</span>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
        {confirmReset ? (
          <div className="rounded-lg border border-error p-3">
            <p className="mb-3 text-sm">Reset all talents?</p>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn btn-sm" onClick={() => setConfirmReset(false)}>Cancel</button>
              <button type="button" className="btn btn-sm btn-error" onClick={() => {
                useTalentStore.getState().reset();
                setConfirmReset(false);
              }}>Reset</button>
            </div>
          </div>
        ) : (
          <button type="button" className="btn btn-outline btn-error btn-sm" disabled={!Object.keys(talents).length} onClick={() => setConfirmReset(true)}>
            Reset Talents
          </button>
        )}
      </div>
    </HudModal>
  );
};
