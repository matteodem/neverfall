// Run without Meteor: node --experimental-vm-modules game/tests/server/firstKillLoot.cjs
const assert = require("node:assert/strict");
const { readFile } = require("node:fs/promises");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

async function loadLoot() {
  const root = path.resolve(__dirname, "../..");
  const characters = new Map();
  const saved = { random: 0.999, rolls: 0, failMoney: false };
  const random = Object.create(Math);
  random.random = () => { saved.rolls++; return saved.random; };
  const context = vm.createContext({ Math: random, console: { error() {} } });
  const get = (object, key) => key.split(".").reduce((value, part) => value?.[part], object);
  const set = (object, key, value) => {
    const parts = key.split(".");
    for (const part of parts.slice(0, -1)) object = object[part] ||= {};
    object[parts.at(-1)] = value;
  };
  let nextId = 0;
  const stubs = {
    "meteor/meteor": { Meteor: { users: { async updateAsync() {
      if (saved.failMoney) { saved.failMoney = false; throw new Error("Temporary save failure"); }
      return 1;
    } } } },
    "node:crypto": { randomUUID: () => `drop-${++nextId}` },
    "server/colyseus/WorldState.js": { LootState: class { constructor(values) { Object.assign(this, values); } } },
    "imports/api/characters/characters.js": { Characters: {
      async findOneAsync(id) { return structuredClone(characters.get(id)); },
      async updateAsync(query, update) {
        const character = characters.get(typeof query === "string" ? query : query._id);
        if (!character) return 0;
        if (typeof query === "object") {
          for (const [key, expected] of Object.entries(query)) {
            const actual = get(character, key);
            if (expected?.$exists === false ? actual !== undefined : JSON.stringify(actual) !== JSON.stringify(expected)) return 0;
          }
        }
        for (const [key, value] of Object.entries(update.$set || {})) set(character, key, value);
        if (update.$push) character.inventory.items.push(...update.$push["inventory.items"].$each);
        return 1;
      },
    } },
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
  const loot = await load("server/inventory/loot.js");
  await loot.evaluate();
  const achievements = await load("server/achievements.js");
  const guide = await load("imports/game/adventureGuide.js");
  await guide.evaluate();
  const quests = await load("server/quests.js");
  await quests.evaluate();
  const inventory = await load("imports/game/inventory.js");
  const enemy = await load("imports/game/enemyConfig.js");
  // Execute the production kill handler without booting Meteor or a realtime server.
  const source = await readFile(path.join(root, "server/colyseus/WorldRoom.js"), "utf8");
  const start = source.indexOf("  async killEnemy(");
  const end = source.indexOf("\n  }", start) + "\n  }".length;
  assert.ok(start >= 0 && end > start);
  const killEnemy = vm.runInContext(`(trackAchievements, recordQuestEvent, spawnLoot, Meteor, getQuestArea) => ({${source.slice(start, end)}}).killEnemy`, context)(
    achievements.namespace.trackAchievements, quests.namespace.recordQuestEvent, loot.namespace.spawnLoot,
    stubs["meteor/meteor"].Meteor, (await load("imports/game/quests.js")).namespace.getQuestArea,
  );
  const room = {
    state: { players: new Map(), enemies: new Map(), loot: new Map() }, enemyRuntime: new Map(),
    clients: [], clock: { setTimeout() {} }, getEnemyStats: enemy.namespace.getEnemyStats,
    async awardXp() {},
  };
  function addCharacter(id, userId = id) {
    characters.set(id, { _id: id, userId, inventory: { items: [] } });
    room.state.players.set(id, { characterId: id, userId, health: 100, x: 0, y: 0, z: 0 });
    return characters.get(id);
  }
  let enemyId = 0;
  async function kill(contributors = ["hero"], type = "boar") {
    const spawn = { id: `enemy-${++enemyId}`, type, level: 1, x: 0, y: 0, z: 0 };
    room.state.enemies.set(spawn.id, spawn);
    room.enemyRuntime.set(spawn.id, { spawn, contributors: new Set(contributors), contributorUserIds: new Set(contributors) });
    await killEnemy.call(room, spawn.id);
  }
  return { saved, characters, room, addCharacter, kill, ...loot.namespace, ...guide.namespace, ...inventory.namespace };
}

test("first kill guarantees an item on its pickup; later kills immediately return to normal RNG", async () => {
  const api = await loadLoot();
  const hero = api.addCharacter("hero");
  await api.kill();
  assert.equal(api.room.state.loot.size, 1);
  assert.equal(hero.achievements.firstBlood.unlocked, true);
  assert.equal(api.getAdventureGuideObjective(hero).id, "loot");
  const firstId = api.room.state.loot.keys().next().value;
  await api.kill();
  const secondId = [...api.room.state.loot.keys()].at(-1);
  await api.collectLoot(api.room, { sessionId: "hero" }, secondId);
  assert.equal(hero.inventory.items.length, 0);
  assert.equal(api.getAdventureGuideObjective(hero).id, "loot");
  await api.collectLoot(api.room, { sessionId: "hero" }, firstId);
  assert.deepEqual(Array.from(hero.inventory.items, item => item.id), ["boar_skin"]);
  assert.equal(hero.achievements.treasureHunter.unlocked, true);
  assert.equal(api.getAdventureGuideObjective(hero).id, "hunt");
  await api.kill();
  await api.collectLoot(api.room, { sessionId: "hero" }, api.room.state.loot.keys().next().value);
  assert.equal(hero.inventory.items.length, 1);
  assert.equal(api.rollLoot(() => 0.7).items.length, 0);
  assert.equal(api.rollLoot(() => 0.6999).items[0].id, "boar_skin");
  assert.deepEqual(Array.from(api.rollLoot(() => 0, "boar", false, true).items, item => item.id),
    Array.from(api.rollLoot(() => 0).items, item => item.id));
});

test("simultaneous kills guarantee exactly one pickup per Character", async () => {
  const api = await loadLoot();
  const hero = api.addCharacter("hero");
  await Promise.all([api.kill(), api.kill()]);
  assert.equal(api.room.state.loot.size, 2);
  assert.equal([...api.room.state.loot.values()].filter(drop => drop.ownerCharacterId === "hero").length, 1);
  for (const id of api.room.state.loot.keys()) await api.collectLoot(api.room, { sessionId: "hero" }, id);
  assert.equal(hero.inventory.items.length, 1);
  assert.equal(hero.achievements.boarSlayer.progress, 2);
});

test("each new Character gets a guarantee; existing Characters and bystanders do not", async () => {
  const api = await loadLoot();
  api.addCharacter("hero");
  const existing = api.addCharacter("existing");
  existing.achievements = { firstBlood: { progress: 1, unlocked: true } };
  api.addCharacter("bystander");
  await api.kill(["hero", "existing"], "wolf");
  for (const [id, drop] of api.room.state.loot) await api.collectLoot(api.room, { sessionId: drop.ownerId }, id);
  assert.equal(api.characters.get("hero").inventory.items[0].id, "wolf_skin");
  assert.equal(existing.inventory.items.length, 0);
  assert.equal(api.characters.get("bystander").achievements, undefined);
  // Switching Characters on the same account gets a separate first kill.
  api.room.state.players.delete("hero");
  const next = api.addCharacter("next", "hero");
  await api.kill(["next"]);
  await api.collectLoot(api.room, { sessionId: "next" }, api.room.state.loot.keys().next().value);
  assert.equal(next.inventory.items.length, 1);
});

test("first pickup belongs to its Character and save retries do not reroll or duplicate it", async () => {
  const api = await loadLoot();
  const hero = api.addCharacter("hero");
  await api.kill();
  const id = api.room.state.loot.keys().next().value;
  api.room.state.players.get("hero").characterId = "other";
  await api.collectLoot(api.room, { sessionId: "hero" }, id);
  assert.equal(api.room.state.loot.size, 1);
  api.room.state.players.get("hero").characterId = "hero";
  const rolls = api.saved.rolls;
  api.saved.failMoney = true;
  await api.collectLoot(api.room, { sessionId: "hero" }, id);
  assert.equal(api.room.state.loot.size, 1);
  await api.collectLoot(api.room, { sessionId: "hero" }, id);
  await api.collectLoot(api.room, { sessionId: "hero" }, id);
  assert.equal(api.saved.rolls, rolls);
  assert.equal(hero.inventory.items.length, 1);
  assert.equal(api.room.state.loot.size, 0);
});
