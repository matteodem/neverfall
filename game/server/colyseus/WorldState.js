import {
  schema,
  t,
} from "@colyseus/schema";

export const PlayerState = schema(
  {
    userId:
      t.string().default(""),

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
  "PlayerState"
);

export const WorldState = schema(
  {
    players:
      t.map(
        PlayerState
      ),
  },
  "WorldState"
);