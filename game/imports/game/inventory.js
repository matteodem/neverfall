import { ENEMY_TYPES, RARE_ENEMY } from "./enemyConfig";
import { DUNGEONS } from "./dungeonConfig";
import {
  EQUIPMENT_DROP_CHANCE,
  ACCESSORY_DROP_CHANCE,
  EQUIPMENT_ITEMS,
} from "./equipment";
import { CONSUMABLES } from "./consumables";

export const LOOT_RANGE = 2.5;

export const ITEM_NAMES = {
  boar_skin: "Boar Skin",
  wolf_skin: "Wolf Skin",
  ...Object.fromEntries(
    Object.values(EQUIPMENT_ITEMS).map(({ id, name }) => [id, name])
  ),
  ...Object.fromEntries(
    Object.entries(CONSUMABLES).map(([id, item]) => [id, item.name])
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

export const rollLoot = (random = Math.random, enemyType = "boar", rare = false) => {
  const bossDrop = Boolean(ENEMY_TYPES[enemyType]?.bossMechanics);
  const chestDungeon = DUNGEONS.find((dungeon) => dungeon.rewards.lootType === enemyType);
  const accessoryDropChance = chestDungeon
    ? ENEMY_TYPES[chestDungeon.finalBoss?.type]?.accessoryDropChance ?? ACCESSORY_DROP_CHANCE
    : ENEMY_TYPES[enemyType]?.accessoryDropChance ?? ACCESSORY_DROP_CHANCE;
  const lootMultiplier = rare && !bossDrop && !chestDungeon ? RARE_ENEMY.lootChanceMultiplier : 1;
  const equipmentItemIds = Object.values(EQUIPMENT_ITEMS).filter(({ slot }) => slot === "ring").map(({ id }) => id);
  const equipmentDropChance = ENEMY_TYPES[enemyType]?.equipmentDropChance ?? (bossDrop ? 0 : EQUIPMENT_DROP_CHANCE);
  const dropsEquipment = equipmentDropChance > 0 && random() < Math.min(1, equipmentDropChance * lootMultiplier);
  const items = dropsEquipment
    ? [{ id: equipmentItemIds[Math.floor(random() * equipmentItemIds.length)] }]
    : !bossDrop && !chestDungeon && random() < 0.7
      ? [{ id: enemyType === "wolf" ? "wolf_skin" : "boar_skin" }]
      : [];

  if (random() < Math.min(1, accessoryDropChance * lootMultiplier)) {
    const accessoryIds = Object.values(EQUIPMENT_ITEMS).filter(({ slot }) => slot === "accessory").map(({ id }) => id);
    items.push({ id: accessoryIds[Math.floor(random() * accessoryIds.length)] });
  }

  return {
    money: bossDrop ? 0 : chestDungeon ? chestDungeon.rewards.money : enemyType === "wolf" ? 200 : 50,
    items,
  };
};
