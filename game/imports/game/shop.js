export const SHOP_STOCK = [
  { id: "health_potion", priceGold: 2 },
  { id: "speed_potion", priceGold: 3 },
  { id: "power_potion", priceGold: 5 },
  { id: "ring_vitality", priceGold: 5 },
  { id: "ring_strength", priceGold: 8 },
  { id: "lucky_charm", priceGold: 10 },
  { id: "guardian_talisman", priceGold: 12 },
  { id: "swift_feather", priceGold: 15 },
];

export const SHOP_DEFINITIONS = {
  "forest-general-store": { id: "forest-general-store", items: SHOP_STOCK },
};

export const getShop = (shopId) => typeof shopId === "string" && Object.hasOwn(SHOP_DEFINITIONS, shopId)
  ? SHOP_DEFINITIONS[shopId] : null;

export const getMerchantShop = (npc, action) => {
  if (npc?.npcType !== "merchant" || !["buy", "sell"].includes(action) ||
    !npc.merchant?.[action === "buy" ? "canBuy" : "canSell"]) return null;
  return getShop(npc.merchant.shopId);
};
