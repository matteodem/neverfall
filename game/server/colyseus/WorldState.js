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

      x:
        t.number().default(0),

      y:
        t.number().default(0),

      z:
        t.number().default(0),

      rotationY:
        t.number().default(0),

      mounted:
        t.boolean().default(false),

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

      wolfQuestKills: t.number().default(0),

      boarQuestKills:
        t.number().default(0),
    },
    "PlayerState"
  );

export const EnemyState = schema(
  {
    type: t.string().default("boar"),
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
    enemyType: t.string().default("boar"),
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
