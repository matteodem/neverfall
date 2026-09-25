import assert from "assert";
import { Meteor } from "meteor/meteor";
import { canCollectLoot, rollLoot, splitMoney, stackItems } from "../imports/game/inventory";

describe("inventory", function () {
  it("splits bronze into currency denominations", function () {
    assert.deepStrictEqual(splitMoney(10425), { gold: 1, silver: 4, bronze: 25 });
    assert.deepStrictEqual(splitMoney(100), { gold: 0, silver: 1, bronze: 0 });
    assert.deepStrictEqual(splitMoney(), { gold: 0, silver: 0, bronze: 0 });
  });

  it("stacks matching IDs without changing stored items", function () {
    const items = [{ id: "boar_skin" }, { id: "other" }, { id: "boar_skin" }];
    assert.deepStrictEqual(stackItems(items), [
      { id: "boar_skin", count: 2 }, { id: "other", count: 1 },
    ]);
    assert.strictEqual(items.length, 3);
    assert.deepStrictEqual(items[0], { id: "boar_skin" });
    assert.deepStrictEqual(stackItems(), []);
  });

  it("always gives 50 bronze and uses a 70 percent skin threshold", function () {
    assert.deepStrictEqual(rollLoot(() => 0.6999), { money: 50, items: [{ id: "boar_skin" }] });
    assert.deepStrictEqual(rollLoot(() => 0.7), { money: 50, items: [] });
  });

  it("requires a living owner within reach", function () {
    const loot = { ownerId: "owner", x: 0, y: 0, z: 0 };
    const player = { userId: "owner", health: 100, x: 2.5, y: 0, z: 0 };
    assert.ok(canCollectLoot(player, loot));
    assert.ok(!canCollectLoot({ ...player, x: 2.51 }, loot));
    assert.ok(!canCollectLoot({ ...player, y: 10 }, loot));
    assert.ok(!canCollectLoot({ ...player, health: 0 }, loot));
    assert.ok(!canCollectLoot({ ...player, userId: "other" }, loot));
    assert.ok(!canCollectLoot(player, undefined));
  });
});

if (Meteor.isServer) {
  describe("loot collection", function () {
    it("gives each participating user a separate drop at the boar's death position", async function () {
      const { WorldRoom } = await import("../server/colyseus/WorldRoom");
      const enemy = { x: 4, y: 0, z: 8 };
      const room = {
        state: {
          players: new Map([
            ["first", { userId: "one", characterId: "character-one" }],
            ["second", { userId: "two", characterId: "character-two" }],
            ["duplicate", { userId: "one", characterId: "character-one" }],
            ["bystander", { userId: "three", characterId: "character-three" }],
          ]),
          enemies: new Map([["boar", enemy]]),
          loot: new Map(),
        },
        enemyRuntime: new Map([["boar", {
          spawn: enemy,
          contributors: new Set(["character-one", "character-two"]),
        }]]),
        awardXp: async () => {},
        advanceBoarQuest: () => false,
        clock: { setTimeout() {} },
      };
      await WorldRoom.prototype.killEnemy.call(room, "boar");
      const drops = Array.from(room.state.loot.values());
      assert.deepStrictEqual(drops.map((drop) => drop.ownerId).sort(), ["one", "two"]);
      for (const drop of drops) {
        assert.deepStrictEqual({ x: drop.x, y: drop.y, z: drop.z }, enemy);
      }
      await WorldRoom.prototype.killEnemy.call(room, "boar");
      assert.strictEqual(room.state.loot.size, 2);
    });

    it("saves a drop once despite concurrent requests and rejects replay", async function () {
      const { collectLoot, spawnLoot } = await import("../server/inventory/loot");
      const userId = await Meteor.users.insertAsync({ profile: { inventory: { money: 0, items: [] } } });
      try {
        const room = { state: {
          players: new Map([["session", { userId, health: 100, x: 0, y: 0, z: 0 }]]),
          loot: new Map(),
        } };
        spawnLoot(room, { x: 0, y: 0, z: 0 }, "session");
        const id = room.state.loot.keys().next().value;
        await Promise.all([
          collectLoot(room, { sessionId: "session" }, id),
          collectLoot(room, { sessionId: "session" }, id),
        ]);
        await collectLoot(room, { sessionId: "session" }, id);
        assert.strictEqual(room.state.loot.size, 0);
        const user = await Meteor.users.findOneAsync(userId);
        assert.strictEqual(user.profile.inventory.money, 50);
        assert.ok(user.profile.inventory.items.length <= 1);
      } finally {
        await Meteor.users.removeAsync(userId);
      }
    });
  });
}
