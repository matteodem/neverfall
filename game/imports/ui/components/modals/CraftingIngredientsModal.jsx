import React, { useEffect } from "react";
import { CRAFTING_MATERIALS, CRAFTING_RECIPES } from "../../../game/crafting";
import { ENEMY_TYPES } from "../../../game/enemyConfig";
import { useHudStore } from "../../stores/useHudStore";
import { HudModal } from "../HudModal";

const ingredientIds = [...new Set(CRAFTING_RECIPES.flatMap(({ ingredients }) =>
  ingredients.map(({ itemId }) => itemId)))];

export const CraftingIngredientsModal = () => {
  // The help dialog belongs to the Crafting tab, including when Items is closed.
  useEffect(() => () => useHudStore.getState().closeModal("crafting-ingredients"), []);

  return (
    <HudModal id="crafting-ingredients" title="Crafting ingredients" backdrop width={420}>
      <p className="mb-3 text-sm opacity-70">Loot these materials from defeated enemies.</p>
      <div className="space-y-3">
        {ingredientIds.map((itemId) => {
          const material = CRAFTING_MATERIALS[itemId];
          // Read the exact source table used by rollLoot, rather than maintaining a UI list.
          const sources = Object.entries(material.drops).filter(([enemyType, chance]) =>
            chance > 0 && ENEMY_TYPES[enemyType]);
          return (
            <section key={itemId} className="rounded-lg border border-base-300 p-3">
              <h4 className="font-semibold">{material.name}</h4>
              <ul className="mt-2 space-y-1 text-sm">
                {sources.map(([enemyType, chance]) => (
                  <li key={enemyType} className="flex items-start justify-between gap-3">
                    <span>{ENEMY_TYPES[enemyType].name}</span>
                    <span className="shrink-0 opacity-70">{chance * 100}%</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </HudModal>
  );
};
