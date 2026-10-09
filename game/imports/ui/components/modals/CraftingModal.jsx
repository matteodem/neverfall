import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../../api/characters/characters";
import { CRAFTING_MATERIALS, CRAFTING_RECIPES } from "../../../game/crafting";
import { CONSUMABLES } from "../../../game/consumables";
import { stackItems } from "../../../game/inventory";
import { HudModal } from "../HudModal";
import { Icon } from "../Icon";
import { useHudStore } from "../../stores/useHudStore";

export const CraftingModal = ({ embedded = false }) => {
  const [craftingId, setCraftingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const { characterId, counts } = useTracker(() => {
    const characterId = Meteor.user()?.profile?.currentCharacterId;
    const character = characterId ? Characters.findOne(characterId) : null;
    return {
      characterId,
      counts: new Map(stackItems(character?.inventory?.items).map(({ id, count }) => [id, count])),
    };
  });

  const craft = async (recipe) => {
    if (craftingId) return;
    setCraftingId(recipe.id);
    setFeedback(null);
    try {
      await Meteor.callAsync("crafting.craft", characterId, recipe.id);
      setFeedback({ text: `${CONSUMABLES[recipe.resultItemId].name} added to your inventory.`, error: false });
    } catch (error) {
      setFeedback({ text: error.reason || "Could not craft this item.", error: true });
    } finally {
      setCraftingId(null);
    }
  };

  return (
    <HudModal id="crafting" title="Crafting" embedded={embedded}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm opacity-70">Brew potions with materials looted from enemies.</p>
        <button type="button" className="btn btn-sm btn-circle btn-ghost shrink-0"
          aria-label="Where to find crafting ingredients" title="Where to find crafting ingredients"
          onClick={() => useHudStore.getState().openModal("crafting-ingredients")}>
          <Icon icon="question" className="h-4 w-4" />
        </button>
      </div>
      {feedback && <p className={`mb-3 text-sm ${feedback.error ? "text-error" : "text-success"}`}
        role={feedback.error ? "alert" : "status"}>{feedback.text}</p>}
      <div className="space-y-2">
        {CRAFTING_RECIPES.map((recipe) => {
          const item = CONSUMABLES[recipe.resultItemId];
          const missing = recipe.ingredients.some(({ itemId, amount }) => (counts.get(itemId) || 0) < amount);
          return (
            <div key={recipe.id} className="rounded-lg border border-base-300 p-3">
              <div className="font-semibold">{item.name} ×{recipe.resultAmount}</div>
              <div className="text-xs opacity-70">{item.description}</div>
              <ul className="my-3 space-y-1 text-sm">
                {recipe.ingredients.map(({ itemId, amount }) => (
                  <li key={itemId} className={(counts.get(itemId) || 0) < amount ? "text-error" : ""}>
                    {CRAFTING_MATERIALS[itemId].name}: {counts.get(itemId) || 0} / {amount}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center justify-between gap-2">
                {missing && <span className="text-xs text-error">Not enough materials.</span>}
                <button type="button" className="btn btn-primary btn-sm ml-auto" disabled={!characterId || Boolean(craftingId) || missing}
                  onClick={() => craft(recipe)}>{craftingId === recipe.id ? "Crafting..." : "Craft"}</button>
              </div>
            </div>
          );
        })}
      </div>
    </HudModal>
  );
};
