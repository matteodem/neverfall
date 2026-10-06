// Run without Meteor: node --experimental-vm-modules game/tests/server/dungeonRewards.cjs
const assert = require("node:assert/strict");
const { readFile } = require("node:fs/promises");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

// Load the real room, loot collector, loot tables and dungeon configs; stub persistence.
async function loadRewards() {
  const root = path.resolve(__dirname, "../..");
  const saved = { items: [], xp: 0, money: 0, rolls: 0, failMoney: false };
  const random = Object.create(Math);
  random.random = () => { saved.rolls++; return 0; };
  const context = vm.createContext({ Math: random, console: { error() {} } });
  class LootState { constructor(values) { Object.assign(this, values); } }
  const stubs = {
    "meteor/meteor": { Meteor: { users: { async updateAsync(id, update) {
      if (saved.failMoney) { saved.failMoney = false; throw new Error("Temporary failure"); }
      saved.money += update.$inc["profile.inventory.money"];
      return 1;
    } } } },
    "node:crypto": { randomUUID: () => "drop" },
    "server/colyseus/WorldRoom.js": { WorldRoom: class {} },
    "server/colyseus/WorldState.js": { DungeonState: class {}, LootState },
    "imports/api/characters/characters.js": { Characters: { async updateAsync(id, update) {
      if (update.$push) saved.items.push(...update.$push["inventory.items"].$each);
      return 1;
    } } },
    "server/achievements.js": { trackAchievements: async () => {} },
    "server/quests.js": { recordQuestEvent: async () => {} },
    "imports/game/quests.js": { QUESTS: [] },
    "server/colyseus/dungeonInstances.js": { getDungeonAccess() {}, removeDungeonAccess() {} },
  };
  const modules = new Map();
  async function load(id) {
    if (modules.has(id)) return modules.get(id);
    const pending = (async () => {
      const exports = stubs[id];
      const module = exports
        ? new vm.SyntheticModule(Object.keys(exports), function () {
          for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
        }, { context, identifier: id })
        : new vm.SourceTextModule(await readFile(path.join(root, id), "utf8"), { context, identifier: id });
      await module.link((specifier, parent) => load(specifier.startsWith(".")
        ? path.posix.normalize(path.posix.join(path.posix.dirname(parent.identifier), `${specifier}.js`))
        : specifier));
      return module;
    })();
    modules.set(id, pending);
    return pending;
  }
  const dungeon = await load("server/colyseus/DungeonRoom.js");
  await dungeon.evaluate();
  const loot = await load("server/inventory/loot.js");
  await loot.evaluate();
  const config = (await load("imports/game/dungeonConfig.js")).namespace;
  const inventory = (await load("imports/game/inventory.js")).namespace;
  function createRoom(dungeonConfig, challengeModeEnabled) {
    const room = Object.create(dungeon.namespace.DungeonRoom.prototype);
    room.config = dungeonConfig;
    room.state = {
      stage: dungeonConfig.stages.length - 1, completed: false, challengeModeEnabled,
      players: new Map(), enemies: new Map(), loot: new Map(),
    };
    room.participants = new Map([["character", { userId: "user", claimed: false }]]);
    room.enemyRuntime = new Map();
    room.awardXp = async (id, xp) => { saved.xp += xp; };
    return room;
  }
  function complete(room) {
    const boss = room.config.finalBoss;
    room.state.enemies.set(boss.id, { type: boss.type });
    room.enemyRuntime.set(boss.id, { spawn: boss, contributors: new Set() });
    room.killEnemy(boss.id);
  }
  function joinAtChest(room) {
    room.state.players.set("session", {
      userId: "user", characterId: "character", health: 100,
      x: room.config.chest.x, y: 0, z: room.config.chest.z,
    });
  }
  return { saved, createRoom, complete, joinAtChest, ...loot.namespace, ...config, ...inventory };
}

test("Normal and Challenge completion rewards for every dungeon", async () => {
  const api = await loadRewards();
  for (const config of api.DUNGEONS) {
    for (const challenge of [false, true]) {
      const room = api.createRoom(config, challenge);
      assert.equal(room.state.loot.size, 0);
      api.complete(room);
      assert.equal(room.state.completed, true);
      const chest = room.state.loot.get("chest-character");
      assert.equal(chest.xpReward, config.rewards.xp * (challenge ? 1.5 : 1));
      const normal = api.rollLoot(() => 0, config.rewards.lootType);
      const boss = api.rollLoot(() => 0, config.finalBoss.type);
      const reward = room.getLootReward(chest);
      assert.equal(reward.money, config.rewards.money * (challenge ? 1.5 : 1));
      assert.deepEqual(Array.from(reward.items, item => item.id),
        Array.from([...normal.items, ...(challenge ? boss.items : [])], item => item.id));
      room.killEnemy(config.finalBoss.id);
      room.addChestLoot("character", room.participants.get("character"));
      assert.equal(room.state.loot.size, 1);
      assert.equal(room.state.loot.get("chest-character"), chest);
      api.joinAtChest(room);
      const before = { xp: api.saved.xp, money: api.saved.money, items: api.saved.items.length };
      await api.collectLoot(room, { sessionId: "session" }, "chest-character");
      assert.equal(api.saved.xp - before.xp, chest.xpReward);
      assert.equal(api.saved.money - before.money, reward.money);
      assert.equal(api.saved.items.length - before.items, reward.items.length);
    }
  }
});

test("Challenge Mode leaves regular mob loot unchanged and requires boolean true", async () => {
  const api = await loadRewards();
  const room = api.createRoom(api.DUNGEONS[0], true);
  for (const enemyType of ["boar", "wolf", "dungeonGuardian"]) {
    for (const rare of [false, true]) {
      const reward = room.getLootReward({ enemyType, rare });
      const expected = api.rollLoot(() => 0, enemyType, rare);
      assert.equal(reward.money, expected.money);
      assert.deepEqual(Array.from(reward.items, item => item.id), Array.from(expected.items, item => item.id));
    }
  }
  room.state.challengeModeEnabled = "true";
  api.complete(room);
  const chest = room.state.loot.get("chest-character");
  assert.equal(chest.xpReward, room.config.rewards.xp);
  assert.equal(room.getLootReward(chest).money, room.config.rewards.money);
});

test("Concurrent claims, replay and chest recreation pay completion rewards only once", async () => {
  const api = await loadRewards();
  const room = api.createRoom(api.DUNGEONS[0], true);
  api.complete(room);
  api.joinAtChest(room);
  const client = { sessionId: "session" };
  await Promise.all([
    api.collectLoot(room, client, "chest-character"),
    api.collectLoot(room, client, "chest-character"),
  ]);
  await api.collectLoot(room, client, "chest-character");
  room.addChestLoot("character", room.participants.get("character"));
  assert.equal(api.saved.xp, room.config.rewards.xp * 1.5);
  assert.equal(api.saved.money, room.config.rewards.money * 1.5);
  assert.equal(room.state.loot.size, 0);
  assert.equal(room.participants.get("character").claimed, true);
  assert.equal(room.state.players.get("session").dungeonRewardClaimed, true);
});

test("Each participant gets one chest and only its character can claim it", async () => {
  const api = await loadRewards();
  const room = api.createRoom(api.DUNGEONS[0], true);
  room.participants.set("second", { userId: "user", claimed: false });
  api.complete(room);
  api.joinAtChest(room);
  assert.equal(room.state.loot.size, 2);
  await api.collectLoot(room, { sessionId: "session" }, "chest-second");
  assert.equal(api.saved.money, 0);
  assert.equal(room.state.loot.size, 2);
  await api.collectLoot(room, { sessionId: "session" }, "chest-character");
  room.state.players.get("session").characterId = "second";
  await api.collectLoot(room, { sessionId: "session" }, "chest-second");
  assert.equal(api.saved.money, room.config.rewards.money * 1.5 * 2);
  assert.equal(api.saved.xp, room.config.rewards.xp * 1.5 * 2);
  assert.equal(room.state.loot.size, 0);
  assert.ok(Array.from(room.participants.values()).every(participant => participant.claimed));
});

test("Persistence retries reuse bonus rolls and do not duplicate items or XP", async () => {
  const api = await loadRewards();
  const room = api.createRoom(api.DUNGEONS[2], true);
  api.complete(room);
  api.joinAtChest(room);
  api.saved.failMoney = true;
  await api.collectLoot(room, { sessionId: "session" }, "chest-character");
  assert.equal(room.state.loot.size, 1);
  assert.equal(room.participants.get("character").claimed, false);
  const rolls = api.saved.rolls;
  const items = api.saved.items.length;
  await api.collectLoot(room, { sessionId: "session" }, "chest-character");
  assert.equal(api.saved.rolls, rolls);
  assert.equal(api.saved.items.length, items);
  assert.equal(api.saved.xp, room.config.rewards.xp * 1.5);
  assert.equal(api.saved.money, room.config.rewards.money * 1.5);
  assert.equal(room.state.loot.size, 0);
});
