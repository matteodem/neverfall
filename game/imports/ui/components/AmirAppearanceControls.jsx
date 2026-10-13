import React from "react";
import { Meteor } from "meteor/meteor";
import { AMIR_PART_OPTIONS, DEFAULT_AMIR_APPEARANCE } from "../../game/character/amir/appearance";
import { SPECIES, SKIN_TONES } from "../../game/species";
import { useCharacterStore } from "../stores/useCharacterStore";
import { FantasyBadge, FantasyDivider, FantasyPanel, FantasySectionHeader } from "./fantasy/FantasyUI";

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
      <span className="flex flex-wrap items-center gap-1">{LABELS[slot]} <FantasyBadge>{options.filter(Boolean).length}</FantasyBadge></span>
      <select className="select select-sm fantasy-input w-full min-w-0"
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
    <FantasyPanel className="character-creator-settings fantasy-section fantasy-stack">
      <FantasySectionHeader as="h3" className="mt-0">Face &amp; build</FantasySectionHeader>
      <div className="grid grid-cols-2 gap-3">{select("head")}{select("hair")}</div>
      <div>
        <FantasySectionHeader as="h4" className="mb-2">Skin Tone</FantasySectionHeader>
        <div className="character-creator-skin-tones flex flex-wrap gap-2">
          {SPECIES[creator.species].skinTones.map((tone) => <button key={tone} type="button" title={tone}
            aria-label={`Skin tone ${tone}`} aria-pressed={creator.skinTone === tone}
            onClick={() => setField("skinTone", tone)}
            className="character-creator-skin-tone fantasy-creator-skin-tone h-10 w-10 rounded-full border-4"
            style={{ backgroundColor: SKIN_TONES[tone] }} />)}
        </div>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span>Body Type</span>
        <select className="select select-sm fantasy-input w-full" aria-label="Body Type" value={creator.bodyType}
          onChange={(event) => setField("bodyType", event.target.value)}>
          {["slim", "medium", "large"].map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
      </label>
      <FantasyDivider />
      <FantasySectionHeader as="h3" className="mt-0">Accessories</FantasySectionHeader>
      <div className="grid grid-cols-2 gap-3">{select("hat", "equipment")}{select("glasses", "equipment")}</div>
      {Meteor.isDevelopment && <>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" className="toggle toggle-sm fantasy-creator-toggle shrink-0"
            checked={showAllCustomizations} onChange={(event) => onShowAllCustomizationsChange(event.target.checked)} />
          <span>Show all customizations (Development Environment)</span>
        </label>
        {showAllCustomizations && <div className="fantasy-stack">
          <p className="fantasy-muted text-xs">Development preview only. Creating a character still uses the configured class equipment preset.</p>
          <fieldset>
            <FantasySectionHeader as="legend" className="mb-2">Outfit parts</FantasySectionHeader>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(DEFAULT_AMIR_APPEARANCE.outfit).map((slot) => select(slot, "outfit"))}
            </div>
          </fieldset>
          <fieldset>
            <FantasySectionHeader as="legend" className="mb-2">Equipment</FantasySectionHeader>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(DEFAULT_AMIR_APPEARANCE.equipment).filter((slot) => !["hat", "glasses"].includes(slot))
                .map((slot) => select(slot, "equipment"))}
            </div>
          </fieldset>
        </div>}
      </>}
      <p className="fantasy-muted text-xs">Starting outfit and weapon follow your class. Drag the preview to rotate. Some hair and hats may overlap; choose None to remove an accessory.</p>
    </FantasyPanel>
  );
};
