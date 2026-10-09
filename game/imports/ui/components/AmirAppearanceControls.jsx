import React from "react";
import { AMIR_PART_OPTIONS } from "../../game/character/amir/appearance";
import { SPECIES, SKIN_TONES } from "../../game/species";
import { useCharacterStore } from "../stores/useCharacterStore";

const LABELS = { head: "Head", hair: "Hair", hat: "Hat", glasses: "Glasses" };

export const AmirAppearanceControls = () => {
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
        {options.map((id) => <option key={id || "none"} value={id || ""}>{id ? id.replace(/\.col$/, "") : "None"}</option>)}
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
      <p className="text-xs text-white/60">Starting outfit and weapon follow your class. Drag the preview to rotate. Some hair and hats may overlap; choose None to remove an accessory.</p>
    </div>
  );
};
