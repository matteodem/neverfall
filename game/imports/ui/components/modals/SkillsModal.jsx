import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../../api/characters/characters";
import { STATUS_EFFECTS } from "../../../game/statusEffects";
import { getClassSkills, getEquippedSkills } from "../../../game/skills";
import { useSkillsStore } from "../../stores/useSkillsStore";
import { Icon } from "../Icon";
import { HudModal } from "../HudModal";
import { FantasyButton, FantasyKey, FantasyPanel, FantasySectionHeader } from "../fantasy/FantasyUI";

export const SkillsModal = ({ embedded = false }) => {
  const [selected, setSelected] = useState(null);
  const character = useTracker(() => {
    const id = Meteor.user()?.profile?.currentCharacterId;
    return id ? Characters.findOne(id) : null;
  });
  const { equippedSkills, inCombat, pending, error, change, changeHandler } = useSkillsStore();
  const skills = getClassSkills(character?.gameClass);
  const equipped = getEquippedSkills(character?.gameClass, equippedSkills || character?.equippedSkills);
  const disabled = inCombat || pending || !changeHandler;

  const assign = (index) => {
    if (!selected || disabled) return;
    const next = [...equipped];
    const previousIndex = next.indexOf(selected);
    if (previousIndex === index) return;
    if (previousIndex >= 0) next[previousIndex] = next[index];
    next[index] = selected;
    change(next);
    setSelected(null);
  };

  return (
    <HudModal id="skills" title="Skills" embedded={embedded}>
      <div className="fantasy-stack">
        <FantasyPanel as="section" className="fantasy-section">
          <FantasySectionHeader>Equipped Skills</FantasySectionHeader>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {equipped.map((id, index) => {
              const skill = skills.find((entry) => entry.id === id);
              return (
                <FantasyButton key={index} variant="secondary" disabled={disabled || !selected}
                  onClick={() => assign(index)} className="h-auto min-h-20 flex-col gap-1 p-2 text-xs"
                  aria-label={`Slot ${index + 1}: ${skill.name}. Assign selected skill`}>
                  <FantasyKey>{index + 1}</FantasyKey><Icon icon={skill.icon} className="h-6 w-6" />{skill.name}
                </FantasyButton>
              );
            })}
          </div>
          <p className="mt-2 text-sm fantasy-muted" role="status">
            {inCombat ? "Skills cannot be changed in combat." : pending ? "Saving skills…" :
              selected ? "Choose a slot above to replace it. Equipped skills swap slots." : "Select an available skill, then choose one of the four slots."}
          </p>
          {error && <p role="alert" className="text-sm text-error">{error}</p>}
        </FantasyPanel>
        <section>
          <FantasySectionHeader className="fantasy-heading-inline">Available Skills</FantasySectionHeader>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {skills.map((skill) => (
              <FantasyButton key={skill.id} variant="secondary" disabled={disabled} aria-pressed={selected === skill.id}
                onClick={() => setSelected(skill.id)}
                className="fantasy-choice min-h-16">
                <Icon icon={skill.icon} className="h-6 w-6 shrink-0" />
                <span><strong className="block text-sm">{skill.name}</strong>
                  <span className="block text-xs fantasy-muted">{skill.cooldown / 1000}s cooldown{equipped.includes(skill.id) ? " · Equipped" : ""}</span>
                  {[skill.selfStatus, skill.hitStatus].filter(Boolean).map((id) => (
                    <span key={id} className="block text-xs fantasy-muted">{STATUS_EFFECTS[id].name}: {STATUS_EFFECTS[id].description}</span>
                  ))}
                </span>
              </FantasyButton>
            ))}
          </div>
        </section>
      </div>
    </HudModal>
  );
};
