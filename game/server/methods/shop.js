import { Meteor } from "meteor/meteor";
import { Characters } from "../../imports/api/characters/characters";
import { EQUIPMENT_ITEMS } from "../../imports/game/equipment";
import { CONSUMABLES } from "../../imports/game/consumables";
import { SHOP_STOCK } from "../../imports/game/shop";
import { ITEM_SELL_PRICES } from "../../imports/game/inventory";

Meteor.methods({
  async "shop.sell"(itemId, quantity) {
    if (!this.userId) throw new Meteor.Error("not-authorized", "Sign in to sell items.");
    const price = typeof itemId === "string" && Object.prototype.hasOwnProperty.call(ITEM_SELL_PRICES, itemId)
      ? ITEM_SELL_PRICES[itemId] : null;
    if (!Number.isFinite(price) || price <= 0 || !Number.isSafeInteger(price * 10000)) {
      throw new Meteor.Error("item-not-sellable", "This item cannot be sold.");
    }
    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      throw new Meteor.Error("invalid-quantity", "Choose a valid quantity.");
    }
    const payout = (price * 10000) * quantity;
    if (!Number.isSafeInteger(payout)) {
      throw new Meteor.Error("invalid-quantity", "Choose a valid quantity.");
    }

    const user = await Meteor.users.findOneAsync(this.userId);
    const characterId = user?.profile?.currentCharacterId;
    if (!characterId) throw new Meteor.Error("character-not-selected", "Select a character first.");
    const character = await Characters.findOneAsync({ _id: characterId, userId: this.userId });
    if (!character) throw new Meteor.Error("character-not-found", "Character not found.");

    const items = character.inventory?.items || [];
    if (items.filter((item) => item.id === itemId).length < quantity) {
      throw new Meteor.Error("insufficient-items", "You do not have that many items.");
    }
    let remaining = quantity;
    const soldItems = [];
    const keptItems = items.filter((item) => {
      if (item.id !== itemId || remaining === 0) return true;
      soldItems.push(item);
      remaining--;
      return false;
    });

    // Match the original array so concurrent inventory changes cannot lose items.
    const removed = await Characters.updateAsync(
      { _id: characterId, userId: this.userId, "inventory.items": items },
      { $set: { "inventory.items": keptItems } }
    );
    if (!removed) throw new Meteor.Error("inventory-changed", "Inventory changed. Try again.");

    try {
      const credited = await Meteor.users.updateAsync(
        { _id: this.userId, "profile.currentCharacterId": characterId },
        { $inc: { "profile.inventory.money": payout } }
      );
      if (!credited) throw new Meteor.Error("character-not-selected", "Select a character first.");
    } catch (error) {
      await Characters.updateAsync(
        { _id: characterId, userId: this.userId },
        { $push: { "inventory.items": { $each: soldItems } } }
      );
      throw error;
    }

    const [updatedCharacter, updatedUser] = await Promise.all([
      Characters.findOneAsync({ _id: characterId, userId: this.userId }),
      Meteor.users.findOneAsync(this.userId),
    ]);
    return { items: updatedCharacter.inventory.items, money: updatedUser.profile.inventory.money };
  },
  async "shop.buy"(itemId) {
    if (!this.userId) throw new Meteor.Error("not-authorized", "Sign in to buy items.");

    const stock = SHOP_STOCK.find((entry) => entry.id === itemId);
    if (!stock || (!EQUIPMENT_ITEMS[itemId] && !CONSUMABLES[itemId])) {
      throw new Meteor.Error("item-not-for-sale", "This item is not for sale.");
    }

    const user = await Meteor.users.findOneAsync(this.userId);
    const characterId = user?.profile?.currentCharacterId;
    if (!characterId) throw new Meteor.Error("character-not-selected", "Select a character first.");

    const character = await Characters.findOneAsync({ _id: characterId, userId: this.userId });
    if (!character) throw new Meteor.Error("character-not-found", "Character not found.");

    const cost = stock.priceGold * 10000;
    const paid = await Meteor.users.updateAsync(
      { _id: this.userId, "profile.currentCharacterId": characterId, "profile.inventory.money": { $gte: cost } },
      { $inc: { "profile.inventory.money": -cost } }
    );
    if (!paid) throw new Meteor.Error("insufficient-gold", "Not enough Gold.");

    try {
      const added = await Characters.updateAsync(
        { _id: characterId, userId: this.userId },
        { $push: { "inventory.items": { id: itemId } } }
      );
      if (!added) throw new Meteor.Error("character-not-found", "Character not found.");
    } catch (error) {
      await Meteor.users.updateAsync(this.userId, { $inc: { "profile.inventory.money": cost } });
      throw error;
    }

    return true;
  },
});
