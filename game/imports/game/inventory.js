import { DUNGEON } from "./dungeonConfig";
import {
  EQUIPMENT_DROP_CHANCE,
  EQUIPMENT_ITEMS,
} from "./equipment";

export const LOOT_RANGE = 2.5;

export const ITEM_NAMES = {
  boar_skin: "Boar Skin",
  wolf_skin: "Wolf Skin",
  ...Object.fromEntries(
    Object.values(EQUIPMENT_ITEMS).map(({ id, name }) => [id, name])
  ),
};

export const splitMoney = (money = 0) => ({
  gold: Math.floor(money / 10000),
  silver: Math.floor(money / 100) % 100,
  bronze: money % 100,
});

export const stackItems = (items = []) => {
  const stacks = new Map();
  for (const { id } of items) {
    stacks.set(id, (stacks.get(id) || 0) + 1);
  }
  return Array.from(stacks, ([id, count]) => ({ id, count }));
};

export const canCollectLoot = (player, loot) => Boolean(
  player && loot && player.health > 0 && !player.inDungeon &&
  player.userId === loot.ownerId &&
  (!loot.ownerCharacterId || player.characterId === loot.ownerCharacterId) &&
  Math.hypot(player.x - loot.x, player.y - loot.y, player.z - loot.z) <= LOOT_RANGE
);

export const rollLoot = (random = Math.random, enemyType = "boar") => {
  const equipmentItemIds = Object.keys(EQUIPMENT_ITEMS);
  const dropsEquipment = random() < EQUIPMENT_DROP_CHANCE;
  const items = dropsEquipment
    ? [{ id: equipmentItemIds[Math.floor(random() * equipmentItemIds.length)] }]
    : enemyType !== "dungeonChest" && random() < 0.7
      ? [{ id: enemyType === "wolf" ? "wolf_skin" : "boar_skin" }]
      : [];

  return {
    money: enemyType === "dungeonChest" ? DUNGEON.rewardMoney : enemyType === "wolf" ? 200 : 50,
    items,
  };
};
