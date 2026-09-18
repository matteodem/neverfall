import {
  schema,
  t,
} from "@colyseus/schema";

/*
 * One synchronized player.
 */
export const PlayerState = schema(
  {
    x: t.number().default(0),
    y: t.number().default(0),
    z: t.number().default(0),

    rotationY:
      t.number().default(0),
  },
  "PlayerState"
);

/*
 * Entire world state.
 */
export const WorldState = schema(
  {
    players: t.map(
      PlayerState
    ),
  },
  "WorldState"
);