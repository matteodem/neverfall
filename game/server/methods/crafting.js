import { Meteor } from "meteor/meteor";
import { Characters } from "../../imports/api/characters/characters";
import { CRAFTING_MATERIALS, CRAFTING_RECIPES } from "../../imports/game/crafting";

Meteor.methods({
  async "crafting.craft"(characterId, recipeId) {
    if (!this.userId) throw new Meteor.Error("not-authorized", "Sign in to craft items.");
    if (typeof characterId !== "string" || typeof recipeId !== "string") {
      throw new Meteor.Error("invalid-recipe", "Choose a valid crafting recipe.");
    }
    const recipe = CRAFTING_RECIPES.find(({ id }) => id === recipeId);
    if (!recipe) throw new Meteor.Error("invalid-recipe", "This recipe does not exist.");
    const character = await Characters.findOneAsync({ _id: characterId, userId: this.userId });
    if (!character) throw new Meteor.Error("character-not-found", "Character not found.");

    const items = character.inventory?.items || [];
    for (const { itemId, amount } of recipe.ingredients) {
      if (items.filter(({ id }) => id === itemId).length < amount) {
        throw new Meteor.Error("insufficient-materials", `Not enough ${CRAFTING_MATERIALS[itemId].name}. You need ${amount}.`);
      }
    }
    const remaining = new Map(recipe.ingredients.map(({ itemId, amount }) => [itemId, amount]));
    const craftedItems = items.filter(({ id }) => {
      const needed = remaining.get(id) || 0;
      if (!needed) return true;
      remaining.set(id, needed - 1);
      return false;
    });
    for (let i = 0; i < recipe.resultAmount; i++) craftedItems.push({ id: recipe.resultItemId });

    // Consume and grant together; a concurrent loot, sale, use, or craft invalidates this snapshot.
    const updated = await Characters.updateAsync(
      { _id: characterId, userId: this.userId, "inventory.items": items },
      { $set: { "inventory.items": craftedItems } }
    );
    if (!updated) throw new Meteor.Error("inventory-changed", "Inventory changed. Please try crafting again.");
    return true;
  },
});
