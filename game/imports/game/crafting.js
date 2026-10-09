export const CRAFTING_MATERIALS = {
  healing_herb: {
    name: "Healing Herb",
    description: "A medicinal herb carried by foraging beasts. Used to brew potions.",
    drops: { boar: 0.2, goat: 0.2 },
  },
  beast_fang: {
    name: "Beast Fang",
    description: "A sharp fang used to brew speed and power potions.",
    drops: { wolf: 0.25, rat: 0.25, snowWolf: 0.25 },
  },
  wild_honey: {
    name: "Wild Honey",
    description: "Potent honey gathered from bees. Used to brew power potions.",
    drops: { bee: 0.3 },
  },
};

export const CRAFTING_RECIPES = [
  {
    id: "health_potion",
    resultItemId: "health_potion",
    resultAmount: 1,
    ingredients: [{ itemId: "healing_herb", amount: 3 }],
  },
  {
    id: "speed_potion",
    resultItemId: "speed_potion",
    resultAmount: 1,
    ingredients: [
      { itemId: "healing_herb", amount: 2 },
      { itemId: "beast_fang", amount: 2 },
    ],
  },
  {
    id: "power_potion",
    resultItemId: "power_potion",
    resultAmount: 1,
    ingredients: [
      { itemId: "beast_fang", amount: 3 },
      { itemId: "wild_honey", amount: 2 },
    ],
  },
];
