import { Meteor } from "meteor/meteor";
import { Characters } from "../../imports/api/characters/characters";
import { moveInventoryItem } from "../../imports/game/inventoryLayout";

Meteor.methods({
  async "inventory.moveItem"(characterId, itemId, targetIndex) {
    if (!this.userId) throw new Meteor.Error("not-authorized", "Sign in to move items.");
    if (typeof characterId !== "string" || typeof itemId !== "string" || !Number.isInteger(targetIndex)) {
      throw new Meteor.Error("invalid-move", "Choose a valid backpack slot.");
    }
    const character = await Characters.findOneAsync({ _id: characterId, userId: this.userId });
    if (!character) throw new Meteor.Error("character-not-found", "Character not found.");
    const items = character.inventory?.items || [];
    const order = moveInventoryItem(items, character.inventory?.slotOrder, itemId, targetIndex);
    if (!order) throw new Meteor.Error("invalid-move", "This item or backpack slot is no longer available.");
    const updated = await Characters.updateAsync({
      _id: characterId,
      userId: this.userId,
      "inventory.items": items,
      "inventory.slotOrder": character.inventory?.slotOrder ?? { $exists: false },
    }, { $set: { "inventory.slotOrder": order } });
    if (!updated) throw new Meteor.Error("inventory-changed", "Inventory changed. Please try again.");
  },
});
