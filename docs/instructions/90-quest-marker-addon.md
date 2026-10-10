# Quest Marker Add-on

## Goal

Add visual quest markers to NPCs, the minimap, and the world map after the Basic Quest System is implemented.

This should build on the existing quest state and NPC/map systems without changing the core quest architecture.

## NPC Quest Markers

Display a quest marker above relevant NPCs:

- `!` when the NPC has an available quest for the local player.
- `?` when the player has accepted a quest associated with that NPC and should return to / continue with that NPC.
- Hide the marker when the NPC has no relevant quest state.

The marker should appear above the NPC nameplate and update immediately when quest state changes.

Do not hardcode specific quest IDs into NPC rendering.

## Minimap and World Map

Show the same quest markers on the existing minimap and world map:

- `!` for available quest givers.
- `?` for active / return-to / turn-in quest NPCs.
- Use the NPC's existing world position.
- Reuse the current minimap/world-map marker infrastructure where possible.
- Markers should update automatically when quests are accepted, completed, or rewarded.

## Quest State Mapping

Use the existing quest system as the source of truth.

Suggested behavior:

```text
Quest available:
NPC + map marker = !

Quest accepted / active and NPC is relevant:
NPC + map marker = ?

Quest ready to turn in:
NPC + map marker = ?

Quest rewarded / no relevant quest:
No marker
```

If the Basic Quest System already distinguishes additional states, adapt this mapping to the existing implementation instead of introducing duplicate quest state.

## Architecture Requirements

- Keep quest marker state derived from existing quest data.
- Avoid duplicating quest progress logic inside the NPC or map UI.
- Prefer a small reusable helper/selectors such as:

```js
getNpcQuestMarker(npcId, questState)
```

or the equivalent pattern already used in the project.

- Reuse existing React/Zustand state patterns where appropriate.
- Reuse existing Babylon nameplate/overlay logic.
- Reuse existing minimap and world-map marker systems.
- Keep this feature MVP-sized.

## Not Required

Do not implement:

- Navigation arrows
- GPS-style route paths
- Distance labels
- Quest search areas
- Animated marker effects
- Different icons per quest type
- Quest objective markers for enemies or locations
- Automatic quest tracking

## Acceptance Criteria

The feature is complete when:

- An NPC with an available quest shows `!` above its head.
- The same NPC shows `!` on the minimap and world map.
- After accepting the quest, the marker changes to `?` where appropriate.
- A ready-to-turn-in quest also shows `?`.
- After the quest is rewarded, the marker disappears unless another relevant quest exists.
- Marker state changes without requiring a page reload.
- Multiple quest NPCs can independently show the correct marker.
- Existing NPC nameplates, minimap markers, world-map markers, and quest UI continue to work.

## Implementation Process

Before implementation:

- Read `AGENTS.md`.
- Read the completed Basic Quest System implementation.
- Inspect existing NPC nameplate logic.
- Inspect the minimap and world-map marker implementations.
- Reuse current project conventions and state management.
- Mention the exact file path for every created or modified file.

After implementation:

- Verify `!` for available quests.
- Verify `?` after quest acceptance.
- Verify `?` for ready-to-turn-in quests.
- Verify marker removal after reward.
- Verify both minimap and world map.
- Verify marker updates when switching characters.
- Run relevant syntax, import, and focused UI/browser checks.
