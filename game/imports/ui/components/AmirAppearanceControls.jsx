import React from "react";
import { Meteor } from "meteor/meteor";
import { AMIR_PART_OPTIONS, DEFAULT_AMIR_APPEARANCE } from "../../game/character/amir/appearance";
import { SPECIES, SKIN_TONES } from "../../game/species";
import { useCharacterStore } from "../stores/useCharacterStore";

const LABELS = {
  head: "Head", hair: "Hair", hat: "Hat", glasses: "Glasses",
  torso: "Torso", arms: "Arms", hands: "Hands", legs: "Legs", feet: "Feet",
  mask: "Mask", leftHand: "Left-hand equipment", rightHand: "Right-hand equipment", back: "Back equipment",
};

const formatOptionLabel = (id) => id
  ? id.replace(/\.col$/, "").replace(/-/g, " ").replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
  : "None";

export const AmirAppearanceControls = ({ showAllCustomizations, onShowAllCustomizationsChange }) => {
  const creator = useCharacterStore((state) => state.creator);
  const setField = useCharacterStore((state) => state.setCreatorField);
  const select = (slot, group) => {
    const options = AMIR_PART_OPTIONS[slot];
    const selected = group ? creator[group][slot] : creator[slot];
    return (
    <label key={slot} className="flex min-w-0 flex-col gap-1 text-sm">
      <span>{LABELS[slot]} <span className="text-xs opacity-60">({options.filter(Boolean).length})</span></span>
      <select className="select select-bordered select-sm w-full min-w-0 text-base-content"
        aria-label={LABELS[slot]} value={options.includes(selected) ? selected ?? "" : ""}
        onChange={(event) => {
          const value = event.target.value || null;
          setField(group || slot, group ? { ...creator[group], [slot]: value } : value);
        }}>
        {options.map((id) => <option key={id || "none"} value={id || ""}>{formatOptionLabel(id)}</option>)}
      </select>
    </label>
    );
  };

  return (
    <div className="character-creator-settings flex min-w-0 flex-col gap-5">
      <div className="grid grid-cols-2 gap-3">{select("head")}{select("hair")}</div>
      <div>
        <h3 className="mb-2 font-bold">Skin Tone</h3>
        <div className="character-creator-skin-tones flex flex-wrap gap-2">
          {SPECIES[creator.species].skinTones.map((tone) => <button key={tone} type="button" title={tone}
            aria-label={`Skin tone ${tone}`} aria-pressed={creator.skinTone === tone}
            onClick={() => setField("skinTone", tone)}
            className={`character-creator-skin-tone h-10 w-10 rounded-full border-4 ${creator.skinTone === tone ? "border-primary" : "border-white/20"}`}
            style={{ backgroundColor: SKIN_TONES[tone] }} />)}
        </div>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span>Body Type</span>
        <select className="select select-bordered select-sm w-full text-base-content" aria-label="Body Type" value={creator.bodyType}
          onChange={(event) => setField("bodyType", event.target.value)}>
          {["slim", "medium", "large"].map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">{select("hat", "equipment")}{select("glasses", "equipment")}</div>
      {Meteor.isDevelopment && <>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" className="toggle toggle-sm shrink-0"
            checked={showAllCustomizations} onChange={(event) => onShowAllCustomizationsChange(event.target.checked)} />
          <span>Show all customizations (Development Environment)</span>
        </label>
        {showAllCustomizations && <div className="flex flex-col gap-4">
          <p className="text-xs text-white/60">Development preview only. Creating a character still uses the configured class equipment preset.</p>
          <fieldset>
            <legend className="mb-2 font-bold">Outfit parts</legend>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(DEFAULT_AMIR_APPEARANCE.outfit).map((slot) => select(slot, "outfit"))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 font-bold">Equipment</legend>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(DEFAULT_AMIR_APPEARANCE.equipment).filter((slot) => !["hat", "glasses"].includes(slot))
                .map((slot) => select(slot, "equipment"))}
            </div>
          </fieldset>
        </div>}
      </>}
      <p className="text-xs text-white/60">Starting outfit and weapon follow your class. Drag the preview to rotate. Some hair and hats may overlap; choose None to remove an accessory.</p>
    </div>
  );
};
