import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../../api/characters/characters";
import { STATUS_EFFECTS } from "../../../game/statusEffects";
import { getClassSkills, getEquippedSkills } from "../../../game/skills";
import { useSkillsStore } from "../../stores/useSkillsStore";
import { Icon } from "../Icon";
import { HudModal } from "../HudModal";

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
      <div className="space-y-4">
        <h4 className="font-semibold">Equipped Skills</h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {equipped.map((id, index) => {
            const skill = skills.find((entry) => entry.id === id);
            return (
              <button key={index} type="button" disabled={disabled || !selected}
                onClick={() => assign(index)} className="btn h-auto min-h-20 flex-col gap-1 p-2 text-xs"
                aria-label={`Slot ${index + 1}: ${skill.name}. Assign selected skill`}>
                <span>[{index + 1}]</span><Icon icon={skill.icon} className="h-6 w-6" />{skill.name}
              </button>
            );
          })}
        </div>
        <p className="text-sm opacity-70" role="status">
          {inCombat ? "Skills cannot be changed in combat." : pending ? "Saving skills…" :
            selected ? "Choose a slot above to replace it. Equipped skills swap slots." : "Select an available skill, then choose one of the four slots."}
        </p>
        {error && <p role="alert" className="text-sm text-error">{error}</p>}
        <h4 className="font-semibold">Available Skills</h4>
        <div className="grid gap-2 sm:grid-cols-2">
          {skills.map((skill) => (
            <button key={skill.id} type="button" disabled={disabled} aria-pressed={selected === skill.id}
              onClick={() => setSelected(skill.id)}
              className={`flex min-h-16 items-center gap-3 rounded-lg border p-3 text-left ${selected === skill.id ? "border-primary bg-primary/10" : "border-base-300"} disabled:opacity-50`}>
              <Icon icon={skill.icon} className="h-6 w-6 shrink-0" />
              <span><strong className="block text-sm">{skill.name}</strong>
                <span className="block text-xs opacity-70">{skill.cooldown / 1000}s cooldown{equipped.includes(skill.id) ? " · Equipped" : ""}</span>
                {[skill.selfStatus, skill.hitStatus].filter(Boolean).map((id) => (
                  <span key={id} className="block text-xs opacity-70">{STATUS_EFFECTS[id].name}: {STATUS_EFFECTS[id].description}</span>
                ))}
              </span>
            </button>
          ))}
        </div>
      </div>
    </HudModal>
  );
};
