import {
  schema,
  t,
} from "@colyseus/schema";

export const PlayerState =
  schema(
    {
      userId:
        t.string().default(""),

      characterId:
        t.string().default(""),

      name:
        t.string().default(""),

      gameClass: t.string().default("warrior"),

      x:
        t.number().default(0),

      y:
        t.number().default(0),

      z:
        t.number().default(0),

      rotationY:
        t.number().default(0),

      groupId: t.string().default(""),
      inDungeon: t.boolean().default(false),
      worldSessionId: t.string().default(""),
      dungeonRewardClaimed: t.boolean().default(false),

      mounted:
        t.boolean().default(false),

      ring:
        t.string().default(""),

      accessory:
        t.string().default(""),

      health:
        t.number().default(100),

      maxHealth:
        t.number().default(100),

      currentLevel:
        t.number().default(
          1
        ),

      currentXp:
        t.number().default(
          0
        ),
      
      gender:
        t.string().default(
          "female"
        ),

      skinTone:
        t.string().default(
          "medium"
        ),

      bodyType:
        t.string().default(
          "medium"
        ),

      head:
        t.string().default(
          "head1"
        ),

      giantQuestKills: t.number().default(0),
      wolfQuestKills: t.number().default(0),

      boarQuestKills:
        t.number().default(0),
    },
    "PlayerState"
  );

export const EnemyState = schema(
  {
    type: t.string().default("boar"),
    enraged: t.boolean().default(false),
    bossAction: t.string().default(""),
    bossTargetX: t.number().default(0),
    bossTargetZ: t.number().default(0),
    bossRadius: t.number().default(0),
    level: t.number().default(1),
    x:
      t.number().default(0),

    y:
      t.number().default(0),

    z:
      t.number().default(0),

    rotationY:
      t.number().default(0),

    health:
      t.number().default(100),

    maxHealth:
      t.number().default(100),
  },
  "EnemyState"
);

export const LootState = schema(
  {
    ownerId: t.string().default(""),
    ownerCharacterId: t.string().default(""),
    enemyType: t.string().default("boar"),
    xpReward: t.number().default(0),
    x: t.number().default(0),
    y: t.number().default(0),
    z: t.number().default(0),
  },
  "LootState"
);

export const WorldState = schema(
  {
    players:
      t.map(PlayerState),

    enemies:
      t.map(EnemyState),

    loot: t.map(LootState),
  },
  "WorldState"
);

export const DungeonState = schema({
  players: t.map(PlayerState),
  enemies: t.map(EnemyState),
  loot: t.map(LootState),
  stage: t.number().default(0),
  bossDefeated: t.boolean().default(false),
  completed: t.boolean().default(false),
}, "DungeonState");
