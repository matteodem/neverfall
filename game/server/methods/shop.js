import { Meteor } from "meteor/meteor";
import { Characters } from "../../imports/api/characters/characters";
import { EQUIPMENT_ITEMS } from "../../imports/game/equipment";
import { CONSUMABLES } from "../../imports/game/consumables";
import { SHOP_STOCK } from "../../imports/game/shop";

Meteor.methods({
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
