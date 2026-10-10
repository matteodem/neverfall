// Static world NPCs. Appearance uses the shared Amir catalog/slot structure.
export const NPC_INTERACTION_RANGE = 3;

export const NPC_DEFINITIONS = [
  {
    id: "forest-guard-01",
    name: "Forest Guard",
    npcType: "generic",
    offeredQuestIds: [
      "forest-boars", "forest-mini-boss", "speak-with-mage",
      "boar-hunt", "wolf-hunt", "giant-hunt", "wolf-problem", "giant-threat",
      "goat-hunt", "rat-hunt", "bee-hunt", "snow-wolf-hunt", "mountain-goat-hunt", "frost-ogre-hunt",
      "defend-northern-camp", "awakened-threat",
    ],
    gameClass: "warrior",
    position: { x: -2, y: 0, z: -7 },
    rotationY: 0,
    appearance: {
      head: "head-00", hair: null, skinTone: "tan", bodyType: "large",
      equipment: { hat: "hat-01", leftHand: "shield-01.col" },
    },
    dialogue: { text: "Stay alert. Creatures have been moving closer to the road." },
  },
  {
    id: "wandering-mage-01",
    name: "Wandering Mage",
    npcType: "quest",
    offeredQuestIds: [
      "explore-highlands", "find-the-depths", "into-the-depths", "northern-ruins-quest",
      "explore-snowy-mountains", "highlands-relics", "frozen-disturbance",
    ],
    gameClass: "mage",
    position: { x: 3, y: 0, z: -10 },
    rotationY: 0,
    appearance: {
      head: "head-51", hair: "hair-51", skinTone: "light", bodyType: "slim",
      outfit: { torso: "torso-51", arms: "arms-51", hands: "hands-51", legs: "legs-51", feet: "feet-51" },
    },
    dialogue: { text: "The forest holds many mysteries. Perhaps we will explore them together someday." },
  },
  {
    id: "camp-merchant-01",
    name: "Merchant",
    npcType: "merchant",
    merchant: { shopId: "forest-general-store", canBuy: true, canSell: true },
    offeredQuestIds: ["seal-hunt", "hammer-guardian-hunt", "trouble-at-southwest-lake"],
    position: { x: 9, y: 0, z: -8 },
    rotationY: 0,
    appearance: {
      head: "head-02", hair: "hair-04", skinTone: "brown", bodyType: "medium",
      outfit: { torso: "torso-03", arms: "arms-03", hands: "hands-03", legs: "legs-03", feet: "feet-03" },
      equipment: { glasses: "glasses-52", back: "backpack-01.col" },
    },
    dialogue: { text: "Welcome, traveler! Looking for supplies, or have something to sell?" },
  },
];
