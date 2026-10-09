import assert from "assert";
import { Meteor } from "meteor/meteor";
import { ENEMY_SPAWNS, FOREST_SIZE, getEnemyStats } from "../imports/game/enemyConfig";
import { getQuestArea } from "../imports/game/quests";
import { createEnemyAnimations } from "../imports/game/enemyAnimations";

describe("wolves", function () {
  it("keeps boar stats and scales enemy health and damage with level", function () {
    const boar = getEnemyStats("boar", 1);
    const wolf = getEnemyStats("wolf", 3);
    assert.strictEqual(boar.health, 100);
    assert.strictEqual(boar.attackDamage, 10);
    assert.strictEqual(wolf.health, 200);
    assert.strictEqual(wolf.attackDamage, 20);
    assert.ok(getEnemyStats("wolf", 4).health > wolf.health);
    assert.ok(getEnemyStats("wolf", 4).attackDamage > wolf.attackDamage);
  });

  it("places five level-2 wolves and their wander areas inside the northwest forest", function () {
    const wolves = ENEMY_SPAWNS.filter((spawn) => spawn.type === "wolf");
    assert.strictEqual(wolves.length, 5);
    for (const spawn of wolves) {
      assert.strictEqual(spawn.level, 2);
      assert.strictEqual(getQuestArea(spawn), "wolf");
      const radius = getEnemyStats(spawn.type, spawn.level).wanderRadius;
      assert.ok(Math.abs(spawn.x) + radius < FOREST_SIZE / 2);
      assert.ok(Math.abs(spawn.z) + radius < FOREST_SIZE / 2);
    }
    for (const spawn of ENEMY_SPAWNS.filter((entry) => entry.type === "boar")) {
      assert.strictEqual(getQuestArea(spawn), "boar");
    }
    assert.strictEqual(getQuestArea({ x: 0, z: 0 }), "boar");
    assert.strictEqual(getQuestArea({ x: -60, z: 70 }), "wolf");
    assert.strictEqual(getQuestArea({ x: -39, z: 70 }), "boar");
  });

  it("uses wolf named clips and returns to idle after attacking", function () {
    const calls = [];
    let endAttack;
    const groups = ["Idle", "Walk", "Attack"].map((name) => ({
      name, from: 0, to: 80, isPlaying: false,
      stop() { this.isPlaying = false; },
      start(loop) { this.isPlaying = true; calls.push([name, loop]); },
      dispose() {},
      onAnimationGroupEndObservable: { addOnce(callback) { endAttack = callback; } },
    }));
    const animations = createEnemyAnimations(groups, getEnemyStats("wolf", 3).animations);
    animations.walk();
    animations.attack();
    animations.walk();
    endAttack();
    assert.deepStrictEqual(calls, [["Idle", true], ["Walk", true], ["Attack", false], ["Idle", true]]);
    animations.destroy();
  });

  if (Meteor.isServer) {
    it("awards repeatable wolf quests to contributors without advancing Boar Hunt", async function () {
      const { WorldRoom } = await import("../server/colyseus/WorldRoom");
      const { WorldState, PlayerState } = await import("../server/colyseus/WorldState");
      const room = {
        state: new WorldState(), enemyRuntime: new Map(),
        advanceHuntQuest: WorldRoom.prototype.advanceHuntQuest,
        spawnEnemy: WorldRoom.prototype.spawnEnemy,
        clock: { setTimeout(callback) { callback(); } },
        rewards: [],
        async awardXp(characterId, amount) { this.rewards.push([characterId, amount]); },
      };
      const player = new PlayerState({ userId: "one", characterId: "one", boarQuestKills: 2 });
      const other = new PlayerState({ userId: "two", characterId: "two" });
      room.state.players.set("one", player);
      room.state.players.set("two", other);
      const spawn = ENEMY_SPAWNS.find((entry) => entry.type === "wolf");
      room.spawnEnemy(spawn);
      for (let kill = 0; kill < 10; kill++) {
        room.enemyRuntime.get(spawn.id).contributors.add("one");
        await WorldRoom.prototype.killEnemy.call(room, spawn.id);
      }
      assert.strictEqual(player.wolfQuestKills, 0);
      assert.strictEqual(player.boarQuestKills, 2);
      assert.strictEqual(other.wolfQuestKills, 0);
      assert.deepStrictEqual(room.rewards.filter(([, xp]) => xp === 250), [["one", 250], ["one", 250]]);
      assert.strictEqual(room.state.loot.size, 10);
      const respawned = room.state.enemies.get(spawn.id);
      assert.strictEqual(respawned.type, "wolf");
      assert.strictEqual(respawned.level, 2);
      assert.strictEqual(respawned.health, 150);
      assert.strictEqual(respawned.x, spawn.x);
      let damage;
      room.broadcast = () => {};
      room.damagePlayer = (_session, amount) => { damage = amount; };
      player.x = spawn.x;
      player.z = spawn.z;
      const runtime = room.enemyRuntime.get(spawn.id);
      runtime.targetSessionId = "one";
      WorldRoom.prototype.updateEnemy.call(room, spawn.id, respawned, runtime, 50);
      assert.strictEqual(damage, 20);
    });
  }
});
