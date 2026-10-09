import React from "react";
import { AMIR_PART_OPTIONS, DEFAULT_AMIR_APPEARANCE } from "../../game/character/amir/appearance";
import { SPECIES, SKIN_TONES } from "../../game/species";
import { useCharacterStore } from "../stores/useCharacterStore";

const LABELS = { head: "Head", hair: "Hair", torso: "Torso", arms: "Arms", hands: "Hands", legs: "Legs", feet: "Feet",
  hat: "Hat", glasses: "Glasses", mask: "Mask", leftHand: "Left-hand equipment", rightHand: "Right-hand equipment", back: "Back equipment" };

export const AmirAppearanceControls = () => {
  const creator = useCharacterStore((state) => state.creator);
  const setField = useCharacterStore((state) => state.setCreatorField);
  const select = (slot, group) => (
    <label key={slot} className="flex min-w-0 flex-col gap-1 text-sm">
      <span>{LABELS[slot]} <span className="text-xs opacity-60">({AMIR_PART_OPTIONS[slot].filter(Boolean).length})</span></span>
      <select className="select select-bordered select-sm w-full min-w-0 text-base-content"
        aria-label={LABELS[slot]} value={(group ? creator[group][slot] : creator[slot]) ?? ""}
        onChange={(event) => {
          const value = event.target.value || null;
          setField(group || slot, group ? { ...creator[group], [slot]: value } : value);
        }}>
        {AMIR_PART_OPTIONS[slot].map((id) => <option key={id || "none"} value={id || ""}>{id ? id.replace(/\.col$/, "") : "None"}</option>)}
      </select>
    </label>
  );

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
        <select className="select select-bordered select-sm w-full text-base-content" value={creator.bodyType}
          onChange={(event) => setField("bodyType", event.target.value)}>
          {["slim", "medium", "large"].map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
      </label>
      <fieldset>
        <legend className="mb-2 font-bold">Outfit parts</legend>
        <div className="grid grid-cols-2 gap-3">
          {Object.keys(DEFAULT_AMIR_APPEARANCE.outfit).map((slot) => select(slot, "outfit"))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 font-bold">Equipment</legend>
        <div className="grid grid-cols-2 gap-3">
          {Object.keys(DEFAULT_AMIR_APPEARANCE.equipment).map((slot) => select(slot, "equipment"))}
        </div>
      </fieldset>
      <p className="text-xs text-white/60">Drag the preview to rotate. Back equipment includes wings. Some hair, hats and mixed outfits may overlap; choose None to remove an accessory.</p>
    </div>
  );
};
