# Basic NPC System

## Goal

Implement a minimal reusable NPC system for Neverfall using the existing Amir character pipeline.

The purpose of this feature is to support static NPCs in the world that can be rendered, named, interacted with, and used later for quests and merchants.

## Scope

### Required

- Add a reusable NPC data structure.
- Spawn NPCs at predefined world positions.
- Render NPCs using the existing Amir character adapter.
- Support configurable NPC appearance.
- Support configurable `gameClass` where useful for default equipment.
- Show a nameplate above each NPC.
- Allow the local player to interact with a nearby NPC.
- Open a simple dialogue modal when interacting.
- Support at least these NPC types:
  - `generic`
  - `quest`
  - `merchant`
- Keep NPC definitions easy to configure in code.

### Not Required Yet

Do not implement:

- Quest logic
- Merchant/shop logic
- NPC schedules
- NPC pathfinding
- NPC combat
- Complex AI
- Voice acting
- Dialogue trees
- Procedural NPC generation
- Database-backed NPC editing

## Suggested NPC Shape

Use a simple structure similar to:

```js
{
  id: "forest-guard-01",
  name: "Forest Guard",
  npcType: "generic",
  gameClass: "Warrior",
  position: {
    x: 10,
    y: 0,
    z: -15,
  },
  rotationY: 0,
  appearance: {
    head: "head-00",
    hair: "hair-00",
    skinTone: "light",
    bodyType: "default",
    hat: null,
    glasses: null,
  },
  dialogue: {
    text: "Stay alert. Creatures have been moving closer to the road.",
  },
}
```

Adapt field names to the existing project conventions instead of creating duplicate concepts.

## Architecture Requirements

- Reuse the existing Amir character assembly code.
- Do not create a second character rendering pipeline specifically for NPCs.
- Reuse existing nameplate logic where practical.
- Keep NPC-specific logic isolated from player-specific movement/combat code.
- Keep the system easy to extend later for quests and merchants.
- Avoid unnecessary refactors outside the NPC feature.

Suggested separation:

```text
NPC definition/config
        ↓
NPC manager / spawning
        ↓
shared Amir character renderer
        ↓
nameplate + interaction
        ↓
dialogue UI
```

## Interaction

For the MVP:

1. Player approaches an NPC.
2. NPC becomes interactable within a small configurable range.
3. Show a simple interaction hint such as:

```text
Press F to talk
```

4. Pressing the interaction key opens the NPC dialogue.
5. Dialogue can be closed and normal movement continues.

Only the nearest valid NPC should be interactable.

## Dialogue UI

Use the existing React/DaisyUI patterns.

The dialogue UI only needs:

- NPC name
- NPC dialogue text
- Close button

Example:

```text
Forest Guard

Stay alert. Creatures have been moving closer to the road.

[Close]
```

Do not build branching dialogue yet.

## Initial Test NPCs

Add 2–3 temporary NPCs to the existing world, for example:

### Forest Guard

- Type: `generic`
- Class/equipment: Warrior-style
- Location: near an existing path or spawn area

### Wandering Mage

- Type: `quest`
- Class/equipment: Mage-style
- Static for now

### Merchant

- Type: `merchant`
- Appearance distinct from the other NPCs
- Dialogue only for now; no shop UI yet

Exact locations can be chosen based on the current world layout.

## Multiplayer

For this first version, NPCs may be deterministic client-side world entities if that matches the current architecture.

However:

- All clients should see the same NPC definitions and positions.
- Do not implement server-authoritative NPC AI yet.
- Structure the system so NPC state can move to Colyseus later if required.

## Acceptance Criteria

The feature is complete when:

- NPCs appear correctly in the world.
- NPCs use the existing Amir modular character system.
- Different NPCs can have different appearance/equipment.
- NPC nameplates are visible.
- Player can approach an NPC and see an interaction hint.
- Pressing the interaction key opens the correct dialogue.
- Dialogue can be closed safely.
- Existing player movement, combat, enemies, multiplayer, and character rendering still work.
- NPC definitions can be added or changed without modifying core rendering logic.

## Implementation Notes

Before implementation:

- Read `AGENTS.md`.
- Read `game/imports/game/character/amir/README.md`.
- Inspect existing player character, remote player, nameplate, world, and React modal patterns.
- Follow current project conventions.
- Mention the exact file path for every created or modified file.

After implementation:

- Run relevant syntax/import checks.
- Run focused Babylon/browser checks where appropriate.
- Verify NPC cleanup when leaving/disposal occurs.
- Report any architectural blockers or duplication that should be addressed before quests are added.
