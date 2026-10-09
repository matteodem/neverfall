# Add Early Exploration Reward

## Goal

Add one memorable **early exploration reward** within the first few minutes of the game.

Keep it simple, visible, and slightly off the main path.

Use JavaScript only.

## Requirements

- place one discovery point or existing Hidden Cache near the early Forest / Central Camp area
- keep it slightly off the obvious route so exploration feels rewarded
- do not require difficult jumping or obscure navigation
- use existing Hidden Cache / discovery systems where possible
- show a small existing-style notification for discovery / loot / XP
- keep the reward modest and appropriate for early progression
- do not create a new exploration system

## Placement

Inspect the actual early-game path around Central Camp first.

Choose a spot that is:

- reachable within the first few minutes
- close enough that a curious player can find it naturally
- not directly on the main path
- safe from blocking quests, spawns, events, or NPC-free gameplay areas
- based on real existing world coordinates / landmarks

## Acceptance Criteria

- early exploration has one clear optional reward
- location is easy enough to discover but not completely obvious
- reward uses existing loot / XP / discovery logic
- player receives concise feedback when found
- no difficult platforming is required
- no new progression system is added

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the early Forest / Central Camp path, current Hidden Cache config, discovery rewards, and Adventure Guide flow.
3. Pick one safe early-game location based on real repository coordinates.
4. Reuse the existing Hidden Cache or discovery system instead of creating a duplicate.
5. Keep the reward modest and suitable for the first few minutes.
6. Add a small existing-style discovery / loot / XP notification.
7. Do not change unrelated quests, enemies, or world layout.
8. Run relevant checks.
9. In the final response, list every changed file with its exact path and report the chosen location and reward.
