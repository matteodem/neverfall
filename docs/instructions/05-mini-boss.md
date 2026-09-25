# Mini Boss

## Goal

Add a mini boss encounter in the north-east area of the forest.

The mini boss should be significantly stronger than normal enemies and designed to require multiple players to defeat.

## 3D Asset

The 3d asset for the boss can be found in `game/public/models/mini-boss-ogre.glb`. 

## Location

Spawn the mini boss in the north-east part of the forest.

Use the existing world/enemy spawning architecture and existing positioning conventions.

## Combat

The mini boss should:

- Have significantly more HP than normal enemies.
- Deal significantly more damage than normal enemies.
- Be difficult or impractical for a single player to kill.
- Be balanced around multiple players attacking it together.
- Use the existing enemy combat system where possible.
- Use the existing aggro, movement, attack and death behaviour where possible.

Do not introduce a separate combat system specifically for the boss.

## Reward

When the mini boss dies:

- Award `1 gold` to each eligible player who participated in the kill.
- Use the existing player/currency persistence system if one already exists.
- Do not add additional loot for this version.

## Respawn

The mini boss should respawn after a reasonable cooldown.

Reuse the existing enemy respawn system if available.

## Multiplayer

The boss HP and state must be shared between players through the existing realtime game-state architecture.

Multiple players must be able to damage the same boss.

The boss should only die once and rewards should only be granted once per kill.

## UI

Use the existing enemy HP bar/nameplate system.

The boss should be clearly identifiable as a mini boss, for example by displaying:

`Forest Giant`

or another simple boss name.

No additional boss UI is required for v0.2.

## Scope

Keep this implementation MVP-sized.

Do not add:

- Boss phases
- Complex mechanics
- Special loot tables
- Instancing
- Raid systems
- Boss-specific UI
- Multiple abilities unless already trivial to support

The goal for v0.2 is a simple open-world multiplayer boss encounter.