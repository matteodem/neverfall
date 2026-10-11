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
  const characters = new Map();
  const users = new Map();
  const get = (object, key) => key.split(".").reduce((value, part) => value?.[part], object);
  const set = (object, key, value) => {
    const parts = key.split(".");
    for (const part of parts.slice(0, -1)) object = object[part] ||= {};
    object[parts.at(-1)] = value;
  };
  const matches = (document, query) => document && Object.entries(typeof query === "string" ? { _id: query } : query)
    .every(([key, expected]) => {
      const actual = get(document, key);
      if (expected && typeof expected === "object" && "$ne" in expected) return !actual?.includes(expected.$ne);
      return Array.isArray(actual) ? actual.includes(expected) : actual === expected;
    });
  const collection = (documents, isUser = false) => ({
    async findOneAsync(query) {
      const document = documents.get(typeof query === "string" ? query : query._id);
      return matches(document, query) ? structuredClone(document) : undefined;
    },
    async updateAsync(query, update) {
      const document = documents.get(typeof query === "string" ? query : query._id);
      if (!matches(document, query)) return 0;
      if (isUser && saved.failMoney) { saved.failMoney = false; throw new Error("Temporary failure"); }
      if (update.$set?.currentXp !== undefined) saved.xp += update.$set.currentXp - document.currentXp;
      for (const [key, value] of Object.entries(update.$set || {})) set(document, key, value);
      for (const [key, value] of Object.entries(update.$inc || {})) {
        set(document, key, (get(document, key) || 0) + value);
        if (isUser) saved.money += value;
      }
      for (const [key, value] of Object.entries(update.$push || {})) {
        get(document, key).push(...value.$each);
        saved.items.push(...value.$each);
      }
      for (const [key, value] of Object.entries(update.$addToSet || {})) {
        const values = get(document, key) || [];
        if (!values.includes(value)) values.push(value);
        set(document, key, values);
      }
      if (isUser && saved.failAfterMoney) { saved.failAfterMoney = false; throw new Error("Lost acknowledgement"); }
      if (!isUser && update.$set && saved.failAfterItems) { saved.failAfterItems = false; throw new Error("Lost acknowledgement"); }
      return 1;
    },
  });
  let nextId = 0;
  const stubs = {
    "meteor/meteor": { Meteor: { users: collection(users, true) } },
    "node:crypto": { randomUUID: () => `drop-${++nextId}` },
    "server/colyseus/WorldRoom.js": { WorldRoom: class {
      async onJoin(client, options, auth) {
        this.state.players.set(client.sessionId, { userId: auth.userId, characterId: auth.characterId,
          health: 100, maxHealth: 100, statusEffects: new Map() });
        this.playerRuntime.set(client.sessionId, {});
      }
    } },
    "server/colyseus/WorldState.js": { DungeonState: class {}, LootState, StatusEffectState: LootState },
    "imports/api/characters/characters.js": { Characters: collection(characters) },
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
  // Execute the production atomic XP/item commit without starting Meteor.
  const source = await readFile(path.join(root, "server/colyseus/WorldRoom.js"), "utf8");
  const start = source.indexOf("  async awardXp(");
  const end = source.indexOf("\n  }", start) + "\n  }".length;
  assert.ok(start >= 0 && end > start);
  const awardXp = vm.runInContext(`(Characters, addXpToProgress, getPlayerStats, trackAchievements) => ({${source.slice(start, end)}}).awardXp`, context)(
    stubs["imports/api/characters/characters.js"].Characters,
    ({ currentLevel, currentXp, gainedXp }) => ({ currentLevel, currentXp: currentXp + gainedXp }),
    () => ({ xpGainMultiplier: 1 }), async () => {},
  );
  function createRoom(dungeonConfig, challengeModeEnabled) {
    const room = Object.create(dungeon.namespace.DungeonRoom.prototype);
    room.config = dungeonConfig;
    room.roomId = `run-${++nextId}`;
    for (const id of ["character", "second"]) {
      if (!characters.has(id)) characters.set(id, { _id: id, userId: "user", currentLevel: 1, currentXp: 0, inventory: { items: [] } });
    }
    if (!users.has("user")) users.set("user", { _id: "user", profile: { inventory: { money: 0 } } });
    room.state = {
      stage: dungeonConfig.stages.length - 1, completed: false, challengeModeEnabled,
      players: new Map(), enemies: new Map(), loot: new Map(),
    };
    room.participants = new Map([["character", { userId: "user", claimed: false }]]);
    room.enemyRuntime = new Map();
    room.awardXp = awardXp;
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
  return { saved, characters, users, createRoom, complete, joinAtChest, ...loot.namespace, ...config, ...inventory };
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
        Array.from([...normal.items, ...(config.rewards.items || []).flatMap(({ itemId, quantity }) => Array(quantity || 1).fill({ id: itemId })), ...(challenge ? boss.items : [])], item => item.id));
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

test("Normal dungeon kills and bosses persist standard and custom drops through shared loot", async () => {
  const api = await loadRewards();
  for (const config of api.DUNGEONS) {
    const room = api.createRoom(config, false);
    api.joinAtChest(room);
    const player = room.state.players.get("session");
    for (const spawn of [{ id: "normal", type: "boar" }, config.finalBoss]) {
      const enemy = { ...spawn, x: player.x, y: player.y, z: player.z };
      // Keep another enemy alive so this check isolates drops from completion.
      room.state.enemies.set("remaining", { type: "wolf" });
      room.state.enemies.set(spawn.id, enemy);
      room.enemyRuntime.set(spawn.id, { spawn, contributors: new Set(["character"]) });
      room.killEnemy(spawn.id);
      room.killEnemy(spawn.id);
      assert.equal(room.state.loot.size, 1, "replayed deaths must not duplicate drops");
      const [id, drop] = room.state.loot.entries().next().value;
      assert.equal(drop.ownerCharacterId, "character");
      const expected = api.rollLoot(() => 0, spawn.type, false, false, spawn.lootTable);
      const before = api.characters.get("character").inventory.items.length;
      await api.collectLoot(room, { sessionId: "session" }, id);
      assert.deepEqual(Array.from(api.characters.get("character").inventory.items.slice(before), item => item.id),
        Array.from(expected.items, item => item.id));
      for (const entry of spawn.lootTable || []) {
        assert.ok(expected.items.some(item => item.id === entry.itemId));
      }
      assert.equal(room.state.loot.size, 0);
      assert.equal(api.saved.xp, 0, "enemy drops preserve completion-only XP");
    }
  }
});

test("Persisted receipts prevent restored/re-entered completion claims; a new run can reward again", async () => {
  const api = await loadRewards();
  const room = api.createRoom(api.DUNGEONS[2], false);
  api.complete(room);
  api.joinAtChest(room);
  await api.collectLoot(room, { sessionId: "session" }, "chest-character");
  const receipt = room.getLootReceipt({ enemyType: room.config.rewards.lootType, ownerCharacterId: "character" });
  assert.equal(await api.hasClaimedLootReward("character", "user", receipt), true);
  assert.ok(api.characters.get("character").inventory.items.some(item => item.id === "purple-armor"));
  const before = { xp: api.saved.xp, money: api.saved.money, items: api.saved.items.length };
  // Discard volatile participant state, as a reconnect/re-entry would restore it.
  room.participants.set("character", { userId: "user", claimed: false });
  room.addChestLoot("character", room.participants.get("character"));
  await api.collectLoot(room, { sessionId: "session" }, "chest-character");
  assert.deepEqual({ xp: api.saved.xp, money: api.saved.money, items: api.saved.items.length }, before);
  assert.equal(room.participants.get("character").claimed, true);
  const nextRun = api.createRoom(room.config, false);
  api.complete(nextRun);
  api.joinAtChest(nextRun);
  await api.collectLoot(nextRun, { sessionId: "session" }, "chest-character");
  assert.equal(api.saved.xp, before.xp * 2);
  assert.equal(api.saved.money, before.money * 2);
  assert.equal(api.saved.items.length, before.items * 2);
});

for (const failure of ["failAfterItems", "failAfterMoney"]) {
  test(`Lost database acknowledgement (${failure}) does not duplicate completion rewards`, async () => {
    const api = await loadRewards();
    const room = api.createRoom(api.DUNGEONS[2], false);
    api.complete(room);
    api.joinAtChest(room);
    api.saved[failure] = true;
    await api.collectLoot(room, { sessionId: "session" }, "chest-character");
    assert.equal(room.state.loot.size, 1);
    const items = api.saved.items.length;
    await api.collectLoot(room, { sessionId: "session" }, "chest-character");
    assert.equal(api.saved.items.length, items);
    assert.equal(api.saved.xp, room.config.rewards.xp);
    assert.equal(api.saved.money, room.config.rewards.money);
    assert.equal(room.state.loot.size, 0);
  });
}


test("Actual dungeon re-entry restores the persisted claim flag without recreating a chest", async () => {
  const api = await loadRewards();
  const room = api.createRoom(api.DUNGEONS[0], false);
  api.complete(room);
  api.joinAtChest(room);
  await api.collectLoot(room, { sessionId: "session" }, "chest-character");
  room.state.players.clear();
  room.participants.get("character").claimed = false;
  room.playerRuntime = new Map();
  room.recordActivity = () => {};
  const source = { userId: "user", characterId: "character", health: 100,
    ...room.config.entrance, statusEffects: new Map() };
  room.access = { soloCharacterId: "character", world: {
    state: { players: new Map([["world", source]]) }, playerRuntime: new Map([["world", {}]]),
  } };
  const before = { ...api.saved };
  await room.onJoin({ sessionId: "rejoined" }, { worldSessionId: "world" }, { userId: "user", characterId: "character" });
  assert.equal(room.state.players.get("rejoined").dungeonRewardClaimed, true);
  assert.equal(room.state.loot.size, 0);
  assert.equal(room.participants.get("character").claimed, true);
  assert.equal(api.saved.xp, before.xp);
  assert.equal(api.saved.money, before.money);
  assert.equal(api.saved.items.length, before.items.length);
});
