import React, { useEffect } from "react";
import { CRAFTING_MATERIALS, CRAFTING_RECIPES } from "../../../game/crafting";
import { ENEMY_TYPES } from "../../../game/enemyConfig";
import { useHudStore } from "../../stores/useHudStore";
import { HudModal } from "../HudModal";
import { FantasyPanel, FantasySectionHeader } from "../fantasy/FantasyUI";

const ingredientIds = [...new Set(CRAFTING_RECIPES.flatMap(({ ingredients }) =>
  ingredients.map(({ itemId }) => itemId)))];

export const CraftingIngredientsModal = () => {
  // The help dialog belongs to the Crafting tab, including when Items is closed.
  useEffect(() => () => useHudStore.getState().closeModal("crafting-ingredients"), []);

  return (
    <HudModal id="crafting-ingredients" title="Crafting ingredients" backdrop width={420}>
      <p className="mb-3 text-sm fantasy-muted">Loot these materials from defeated enemies.</p>
      <div className="fantasy-stack">
        {ingredientIds.map((itemId) => {
          const material = CRAFTING_MATERIALS[itemId];
          // Read the exact source table used by rollLoot, rather than maintaining a UI list.
          const sources = Object.entries(material.drops).filter(([enemyType, chance]) =>
            chance > 0 && ENEMY_TYPES[enemyType]);
          return (
            <FantasyPanel as="section" key={itemId} className="fantasy-section">
              <FantasySectionHeader>{material.name}</FantasySectionHeader>
              <ul className="mt-2 space-y-1 text-sm">
                {sources.map(([enemyType, chance]) => (
                  <li key={enemyType} className="flex items-start justify-between gap-3">
                    <span>{ENEMY_TYPES[enemyType].name}</span>
                    <span className="shrink-0 fantasy-muted">{chance * 100}%</span>
                  </li>
                ))}
              </ul>
            </FantasyPanel>
          );
        })}
      </div>
    </HudModal>
  );
};
