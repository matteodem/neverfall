// Run without Meteor: node --experimental-vm-modules game/tests/server/hiddenCaches.cjs
const assert = require("node:assert/strict");
const { readFile } = require("node:fs/promises");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { test } = require("node:test");
const vm = require("node:vm");

// Exercise real cache modules with persistence and UI stores substituted at their boundaries.
async function loadCaches() {
  const root = path.resolve(__dirname, "../..");
  const characters = new Map();
  const writes = [];
  let failSave = false;
  const Characters = {
    findOne(id) { return structuredClone(characters.get(id)); },
    async updateAsync(selector, update) {
      if (failSave) { failSave = false; throw new Error("Temporary persistence failure"); }
      const character = characters.get(selector._id);
      if (!character || character.userId !== selector.userId ||
        character.lootedCacheIds?.includes(selector.lootedCacheIds.$ne)) return 0;
      character.lootedCacheIds ||= [];
      character.lootedCacheIds.push(update.$addToSet.lootedCacheIds);
      character.inventory.items.push(...structuredClone(update.$push["inventory.items"].$each));
      writes.push(structuredClone({ selector, update }));
      return 1;
    },
  };
  const ui = {
    location: "world", busy: false, prompt: null,
    update(values) { Object.assign(this, values); },
    setActionHandler(handler) { this.actionHandler = handler; },
  };
  const core = await import(pathToFileURL(path.join(root, "node_modules/@babylonjs/core/index.js")));
  const context = vm.createContext({ console: { error() {} }, Math, Number });
  const stubs = {
    "@babylonjs/core": core,
    "imports/api/characters/characters.js": { Characters },
    "imports/game/gameSession.js": { enterDungeon() {}, leaveDungeon() {} },
    "imports/ui/stores/useDungeonStore.js": { useDungeonStore: { getState: () => ui } },
    "imports/ui/stores/useHudStore.js": { useHudStore: { getState: () => ({ activeModal: null }) } },
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
  const api = {};
  for (const id of ["imports/game/hiddenCaches.js", "server/colyseus/hiddenCaches.js",
    "imports/game/dungeonInteractions.js", "imports/game/environment/createHiddenCaches.js",
    "imports/game/worldChunks.js", "imports/game/worldConfig.js", "imports/game/quests.js",
    "imports/game/dungeonConfig.js", "imports/game/basicTowerConfig.js", "imports/game/worldEvents.js",
    "imports/game/waypoints.js", "imports/game/enemyConfig.js", "imports/game/inventory.js"]) {
    const module = await load(id);
    await module.evaluate();
    Object.assign(api, module.namespace);
  }
  const room = { state: { players: new Map() }, recordActivity() {} };
  function join(characterId, userId = "user", cache = api.HIDDEN_CACHES[0]) {
    if (!characters.has(characterId)) characters.set(characterId, { _id: characterId, userId, inventory: { items: [] } });
    const client = { sessionId: `session-${characterId}`, messages: [], send(...message) { this.messages.push(message); } };
    room.state.players.set(client.sessionId, { characterId, userId, health: 100, inDungeon: false, ...cache.position });
    return client;
  }
  return { ...api, core, ui, characters, writes, room, join, root, failNextSave() { failSave = true; } };
}

test("Each cache opens once, survives reconnect, and rewards Characters independently", async () => {
  const api = await loadCaches();
  const { HIDDEN_CACHES, HIDDEN_CACHE_REWARDS, characters, room, join, claimHiddenCache } = api;
  const first = join("first");
  for (const cache of HIDDEN_CACHES) {
    Object.assign(room.state.players.get(first.sessionId), cache.position);
    const before = characters.get("first").inventory.items.length;
    await Promise.all(Array.from({ length: 8 }, () => claimHiddenCache(room, first, cache.id)));
    assert.equal(characters.get("first").inventory.items.length - before, HIDDEN_CACHE_REWARDS[cache.rewardTier].length);
    assert.equal(characters.get("first").lootedCacheIds.filter(id => id === cache.id).length, 1);
  }
  assert.equal(first.messages.length, 12);
  assert.match(first.messages[0][1], /Hidden Cache · 1 × Health Potion/);
  room.state.players.delete(first.sessionId);
  const reconnected = join("first");
  const before = characters.get("first").inventory.items.length;
  await claimHiddenCache(room, reconnected, HIDDEN_CACHES[0].id);
  assert.equal(characters.get("first").inventory.items.length, before);
  assert.equal(reconnected.messages.length, 0);
  for (const [id, user] of [["second", "user"], ["third", "other-user"]]) {
    const client = join(id, user);
    await claimHiddenCache(room, client, HIDDEN_CACHES[0].id);
    assert.equal(characters.get(id).inventory.items.length, 1);
    assert.equal(client.messages.length, 1);
  }
});

test("Claims reject spoofing, unknown IDs, distance, death, dungeons and ownership mismatches", async () => {
  const api = await loadCaches();
  const client = api.join("owner");
  api.join("victim", "other-user");
  const cache = api.HIDDEN_CACHES[0];
  const player = api.room.state.players.get(client.sessionId);
  for (const payload of [null, {}, { cacheId: cache.id, characterId: "victim" }, "unknown"]) {
    await api.claimHiddenCache(api.room, client, payload);
  }
  await api.claimHiddenCache(api.room, { sessionId: "missing" }, cache.id);
  for (const changes of [{ health: 0 }, { inDungeon: true }, { x: cache.position.x + 4 },
    { y: cache.position.y + 4 }, { x: NaN }, { characterId: "victim" }]) {
    const previous = { ...player };
    Object.assign(player, changes);
    await api.claimHiddenCache(api.room, client, cache.id);
    Object.assign(player, previous);
  }
  assert.equal(api.writes.length, 0);
  // Being near a remote player cannot open that remote player's distant cache.
  const distant = api.HIDDEN_CACHES[8];
  Object.assign(api.room.state.players.get("session-victim"), distant.position);
  await api.claimHiddenCache(api.room, client, distant.id);
  assert.equal(api.characters.get("victim").inventory.items.length, 0);
  await api.claimHiddenCache(api.room, client, cache.id);
  assert.equal(api.characters.get("owner").inventory.items.length, 1);
  assert.equal(api.characters.get("victim").inventory.items.length, 0);
});

test("Persistence failure leaves a cache claimable without partial rewards or other gameplay writes", async () => {
  const api = await loadCaches();
  const client = api.join("character");
  const character = api.characters.get("character");
  Object.assign(character, { questProgress: { boar: 2 }, achievements: {}, unlockedWaypoints: ["central-camp"] });
  const before = structuredClone(character);
  api.failNextSave();
  await api.claimHiddenCache(api.room, client, api.HIDDEN_CACHES[0].id);
  assert.deepEqual(character, before);
  assert.equal(client.messages[0][0], "hiddenCacheError");
  await api.claimHiddenCache(api.room, client, api.HIDDEN_CACHES[0].id);
  assert.equal(character.inventory.items.length, 1);
  assert.deepEqual(character.questProgress, before.questProgress);
  assert.deepEqual(character.achievements, before.achievements);
  assert.deepEqual(character.unlockedWaypoints, before.unlockedWaypoints);
  assert.deepEqual(Object.keys(api.writes[0].update).sort(), ["$addToSet", "$push"]);
});

test("Existing F interaction prompts work and looted caches stay non-interactable after reconnect", async () => {
  const api = await loadCaches();
  const client = api.join("character");
  const room = { ...api.room, sessionId: client.sessionId, sent: [], send(...message) { this.sent.push(message); } };
  const player = { position: { ...api.HIDDEN_CACHES[0].position } };
  let interactions = api.createDungeonInteractions({ room, player, dungeon: false });
  interactions.update(100);
  assert.equal(api.ui.prompt, "hiddenCache");
  assert.equal(interactions.interact(), true);
  assert.deepEqual(room.sent[0], ["claimHiddenCache", api.HIDDEN_CACHES[0].id]);
  await api.claimHiddenCache(api.room, client, api.HIDDEN_CACHES[0].id);
  interactions.destroy();
  interactions = api.createDungeonInteractions({ room, player, dungeon: false });
  interactions.update(100);
  assert.equal(api.ui.prompt, null);
  assert.equal(interactions.interact(), false);
  const second = api.join("second");
  room.sessionId = second.sessionId;
  interactions.update(100);
  assert.equal(api.ui.prompt, "hiddenCache");
  player.position = { ...api.DUNGEONS[0].entrance };
  interactions.update(100);
  assert.equal(api.ui.prompt, "enter");
  player.position = { ...api.BASIC_TOWER_CHEST_POSITION };
  interactions.update(100);
  assert.equal(api.ui.prompt, "towerChest");
  api.characters.get("second").questProgress = { "frozen-disturbance": 1 };
  player.position = { ...api.FROZEN_DISTURBANCE_POINTS[0] };
  interactions.update(100);
  assert.equal(api.ui.prompt, "riftSeal");
  interactions.destroy();
});

test("All approved coordinates and regions match docs, have safe gameplay separation, and remain stable in chunks", async () => {
  const api = await loadCaches();
  const doc = await readFile(path.join(api.root, "../docs/treasure-cache-positions.md"), "utf8");
  const approved = [...doc.matchAll(/\| `(cache-[^`]+)` \| ([^|]+) \| `([^`]+)`/g)];
  assert.equal(approved.length, 12);
  assert.equal(api.HIDDEN_CACHES.length, 12);
  const engine = new api.core.NullEngine();
  const scene = new api.core.Scene(engine);
  const player = { position: new api.core.Vector3(0, 0, 0) };
  const chunks = api.createWorldChunks(scene, player);
  const visuals = api.createHiddenCaches({ scene, chunks });
  const ground = api.core.MeshBuilder.CreateGround("ground", { width: 660, height: 660, subdivisions: 96, updatable: true }, scene);
  const vertices = ground.getVerticesData(api.core.VertexBuffer.PositionKind);
  for (let i = 0; i < vertices.length; i += 3) vertices[i + 1] = api.getWorldHeight(vertices[i], vertices[i + 2]);
  ground.updateVerticesData(api.core.VertexBuffer.PositionKind, vertices);
  ground.refreshBoundingInfo();
  ground.computeWorldMatrix(true);
  for (const [index, cache] of api.HIDDEN_CACHES.entries()) {
    assert.equal(cache.id, approved[index][1]);
    assert.equal(cache.region, approved[index][2].trim());
    const position = [cache.position.x, cache.position.y, cache.position.z];
    assert.deepEqual(position, approved[index][3].split(" / ").map(Number));
    assert.equal(api.getQuestArea(cache.position), null);
    for (const spawn of api.ENEMY_SPAWNS) assert.ok(Math.hypot(cache.position.x - spawn.x, cache.position.z - spawn.z) > 39);
    for (const event of api.WORLD_EVENTS) assert.ok(Math.hypot(cache.position.x - event.center.x, cache.position.z - event.center.z) > event.participationRadius);
    for (const waypoint of api.WAYPOINTS.filter(point => point.discoveryRadius)) assert.ok(Math.hypot(cache.position.x - waypoint.position.x, cache.position.z - waypoint.position.z) > waypoint.discoveryRadius);
    for (const objective of api.QUESTS.flatMap(quest => quest.objectives || [quest.objective]).filter(objective => objective.type === "ReachLocation")) {
      assert.ok(Math.hypot(cache.position.x - objective.x, cache.position.z - objective.z) > objective.radius);
    }
    assert.ok(Math.abs(cache.position.z) < api.WORLD_PLAYER_LIMIT);
    assert.ok(cache.position.x > -api.WORLD_PLAYER_LIMIT && cache.position.x < api.WORLD_EAST_PLAYER_LIMIT);
    const surface = ground.intersects(new api.core.Ray(new api.core.Vector3(cache.position.x, 500, cache.position.z), api.core.Vector3.Down()));
    assert.ok(surface.hit);
    assert.ok(Math.abs(cache.position.y - surface.pickedPoint.y - 0.05) < 0.000001);
    const chest = scene.getTransformNodeByName(cache.id);
    assert.deepEqual(chest.position.asArray(), position);
    for (const mesh of chest.getChildMeshes()) {
      mesh.computeWorldMatrix(true);
      const bounds = mesh.getBoundingInfo().boundingBox;
      assert.ok(bounds.maximumWorld.x - bounds.minimumWorld.x <= 1);
      assert.ok(bounds.maximumWorld.z - bounds.minimumWorld.z <= 1);
      assert.equal(mesh.checkCollisions, false);
    }
    player.position.copyFrom(chest.position);
    chunks.update();
    assert.equal(chest.isEnabled(), true);
    visuals.update([cache.id]);
    assert.equal(chest.getChildMeshes()[1].isEnabled(), false);
    player.position.set(0, 0, 0);
    chunks.update();
    assert.deepEqual(chest.position.asArray(), position);
  }
  visuals.destroy();
  assert.equal(scene.transformNodes.filter(node => node.name.startsWith("cache-")).length, 0);
  scene.dispose();
  engine.dispose();
});
