import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../../api/characters/characters";
import { TALENT_LEVELS, TALENTS } from "../../../game/talents";
import { useTalentStore } from "../../stores/useTalentStore";
import { HudModal } from "../HudModal";
import { FantasyBadge, FantasyButton, FantasyPanel, FantasySectionHeader } from "../fantasy/FantasyUI";

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
      <div className="fantasy-stack">
        {TALENT_LEVELS.map((milestone) => {
          const locked = level < milestone;
          const selected = talents[milestone];
          return (
            <FantasyPanel as="section" key={milestone} className="fantasy-section">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <FantasySectionHeader className="fantasy-heading-inline">Level {milestone}</FantasySectionHeader>
                <FantasyBadge tone={locked ? "neutral" : selected ? "success" : "warning"}>{locked ? "Locked" : selected ? "Selected" : "Choose one"}</FantasyBadge>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {(choices[milestone] || []).map((talent) => (
                  <FantasyButton
                    key={talent.id}
                    type="button"
                    variant="secondary"
                    disabled={locked || Boolean(selected)}
                    onClick={() => useTalentStore.getState().select(milestone, talent.id)}
                    className="fantasy-choice flex-col items-start disabled:cursor-default"
                    aria-pressed={selected === talent.id}
                  >
                    <strong className="block text-sm">{talent.label}</strong>
                    <span className="text-xs fantasy-muted">{talent.description}</span>
                  </FantasyButton>
                ))}
              </div>
            </FantasyPanel>
          );
        })}
        {confirmReset ? (
          <FantasyPanel className="fantasy-section fantasy-confirm-danger">
            <p className="mb-3 text-sm">Reset all talents?</p>
            <div className="flex justify-end gap-2">
              <FantasyButton variant="secondary" className="btn-sm" onClick={() => setConfirmReset(false)}>Cancel</FantasyButton>
              <FantasyButton variant="danger" className="btn-sm" onClick={() => {
                useTalentStore.getState().reset();
                setConfirmReset(false);
              }}>Reset</FantasyButton>
            </div>
          </FantasyPanel>
        ) : (
          <FantasyButton variant="danger" className="btn-sm self-start" disabled={!Object.keys(talents).length} onClick={() => setConfirmReset(true)}>
            Reset Talents
          </FantasyButton>
        )}
      </div>
    </HudModal>
  );
};
