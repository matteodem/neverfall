# New Level 15 Dungeon: Sunken Ruins

## Goal

Add a new instanced dungeon south of **Southwest Lake**.

Dungeon name:

```text
Sunken Ruins
```

Recommended level:

```text
Level 15
```

The dungeon should fit the existing Neverfall dungeon architecture, but its **map layout, enemy roster, enemy placements, boss, recommended level, and rewards must be configurable** so future dungeons can be added without duplicating large amounts of code.

Do not build a one-off hardcoded dungeon implementation.

Use JavaScript only.

## 1. Location

Add the dungeon entrance in the open world:

```text
South of Southwest Lake
```

The entrance should be clearly reachable from the lake area.

Requirements:

- place the dungeon entrance south of Southwest Lake
- keep it far enough from existing content that it does not overlap nearby landmarks or enemy spawns
- add a World Map marker if the current dungeon system uses map markers
- use the existing dungeon entrance / interaction pattern
- do not create a new dungeon-entry system
- preserve existing dungeon matchmaking / room behavior

If an existing reusable dungeon entrance asset exists, reuse it.

Do not add a new Meshy asset unless one is already present in the repository for this purpose.

## 2. Dungeon Identity

### Name

```text
Sunken Ruins
```

### Recommended Level

```text
15
```

### Theme

The dungeon should feel like old ruins near the lake that have partially collapsed / flooded over time.

Keep the theme simple and low-poly.

Possible visual direction:

- ancient stone ruins
- damp / mossy environment
- shallow water or flooded sections if the existing dungeon system supports it cheaply
- broken stone platforms
- ruined pillars
- old underground structure
- muted blue / gray / moss-green palette

Do not create expensive water simulation.

If water is used, keep it simple and static.

## 3. Dungeon Structure

Keep the dungeon MVP-sized.

Suggested structure:

```text
Entrance
→ Combat Area 1
→ Short Corridor / Transition
→ Combat Area 2
→ Elite / Mini Encounter
→ Boss Arena
→ Reward / Exit
```

Target total runtime:

```text
~10–15 minutes for an appropriately leveled group
```

Do not make the dungeon excessively large.

Avoid:

- procedural generation
- random layouts
- branching paths
- puzzle-heavy mechanics
- complex scripted sequences
- cutscenes

## 4. Make Dungeon Maps Configurable

This is important.

Do not hardcode this dungeon map directly into `DungeonRoom` or a single dungeon-specific scene file if the current architecture can support configuration.

Create or extend a dungeon configuration structure so each dungeon can define its own map / scene setup.

The exact implementation should follow the current repository patterns.

A configuration could conceptually contain:

```js
{
  id: "sunken-ruins",
  name: "Sunken Ruins",
  recommendedLevel: 15,

  entrance: {
    worldPosition: { x: 0, y: 0, z: 0 },
  },

  map: {
    layoutId: "sunken-ruins",
    spawnPosition: { x: 0, y: 0, z: 0 },
    bossArenaPosition: { x: 0, y: 0, z: 0 },
  },
}
```

This is only an example.

Do not force this exact schema if a dungeon config system already exists.

### Requirements

The dungeon map configuration should be able to control at minimum:

- dungeon ID
- display name
- recommended level
- player spawn position
- map / layout definition
- exit position / exit handling
- boss arena location
- enemy spawn groups
- boss configuration
- reward configuration

If dungeon layout geometry is defined through reusable objects / placements, keep those placements config-driven where practical.

If the current architecture loads a GLB scene for a dungeon, make the GLB / scene path configurable per dungeon.

Example:

```js
map: {
  assetFile: "/models/dungeons/sunken-ruins.glb",
}
```

Do not duplicate the whole dungeon-loading pipeline for this dungeon.

## 5. Make Enemy Rosters Configurable

Enemy types and placements must be configurable per dungeon.

Do not hardcode:

```text
if dungeon === Sunken Ruins:
  spawn X enemies
```

inside generic room logic.

Instead, extend / reuse dungeon configuration.

Conceptual example:

```js
enemyGroups: [
  {
    id: "entrance-pack",
    enemyType: "lake-raider",
    count: 4,
    level: 15,
    spawnArea: "entrance",
  },
  {
    id: "ruins-pack",
    enemyType: "sunken-guardian",
    count: 3,
    level: 16,
    spawnArea: "ruins-room",
  },
]
```

Again, follow the current architecture instead of copying this schema blindly.

### Enemy Configuration Should Support

At minimum:

- enemy type / config ID
- level
- count
- spawn position or spawn area
- optional respawn behavior
- elite flag / elite config if supported

The generic dungeon room should read from the dungeon config.

This should make it easy to later create:

```text
Dungeon A
→ wolves + giant

Dungeon B
→ undead + boss

Sunken Ruins
→ lake / ruin enemies + boss
```

without rewriting room logic.

## 6. Enemy Roster

Use existing enemy systems and reuse existing models where possible.

Do not require an entirely new combat framework.

Suggested roster for Sunken Ruins:

### Enemy 1 — Ruin Raider

```text
Level: 15
Role: basic melee enemy
```

Behavior:

- simple melee attacks
- moderate HP
- common enemy

If a suitable existing melee enemy already exists, reuse its AI and only configure stats / visuals.

### Enemy 2 — Sunken Guardian

```text
Level: 16
Role: tankier melee enemy
```

Behavior:

- higher HP
- slower movement
- heavier attack
- used in smaller groups

Reuse existing tanky enemy logic if available.

### Enemy 3 — Ruin Caster

```text
Level: 15–16
Role: ranged enemy
```

Behavior:

- ranged projectile or existing ranged attack pattern
- lower HP than Guardian
- creates target-priority variety

Only add this if the current enemy architecture already supports ranged enemies cleanly.

If not, reuse another existing enemy type rather than building a large new AI system.

## 7. Mini Encounter

Before the boss, add one stronger encounter.

Example:

```text
2 Sunken Guardians
+ 1 Ruin Caster
```

or:

```text
1 Elite Sunken Guardian
+ 2 normal enemies
```

Use whichever fits the existing elite / enemy architecture best.

Do not create a new mini-boss system if one does not exist.

## 8. Boss

Add a Level 17 boss.

Suggested name:

```text
The Drowned Warden
```

Recommended level of dungeon remains:

```text
15
```

Boss level:

```text
17
```

The boss should reuse existing boss systems.

Suggested mechanics:

- normal melee attack
- telegraphed AoE
- one stronger heavy attack
- optional charge or short-range burst if already supported
- enrage at low HP only if the current boss framework already supports it

Do not create a completely new boss-mechanic framework.

The main goal is a different encounter configuration using reusable boss mechanics.

## 9. Dungeon Rewards

Use the current dungeon reward system.

Suggested reward direction:

- XP appropriate for Level 15 players
- Gold
- normal loot chance
- slightly better chance for accessory / useful equipment than normal enemies
- boss reward should be clearly better than trash mobs

Do not introduce unique legendary gear yet.

Do not inflate the economy.

If dungeon completion rewards already exist, configure Sunken Ruins through the same system.

## 10. Dungeon Entrance Requirements

The entrance interaction should:

- show dungeon name
- show recommended level
- use existing enter / confirmation UI
- enter the correct dungeon instance
- prevent incorrect dungeon config from being loaded

Example visible text:

```text
Sunken Ruins
Recommended Level: 15
```

If party requirements / warnings already exist, preserve them.

Do not add mandatory party restrictions unless existing dungeon logic already has them.

## 11. World Map

If current dungeon entrances appear on the World Map:

Add:

```text
Sunken Ruins
```

south of Southwest Lake.

Use the current dungeon map-marker style.

If the map supports recommended-level text, show:

```text
Level 15
```

Do not add a new map-marker system.

## 12. Dungeon Config Architecture

This task should improve reusability.

The final dungeon system should allow another dungeon to be added mainly by defining configuration rather than copying room code.

Aim for a structure conceptually similar to:

```text
dungeons/
├── dungeonConfigs.js
├── sunkenRuins.js
├── northernRuins.js
└── ...
```

or the closest equivalent that matches the current repository.

Each dungeon config should be capable of defining:

```text
identity
recommended level
map / scene
player spawn
enemy groups
enemy levels
boss
boss arena
rewards
exit
```

Do not perform a huge architecture rewrite if the current system already has most of this.

Extend what is there.

## 13. DungeonRoom Requirements

`DungeonRoom` should remain generic.

It should not accumulate logic like:

```js
if (dungeonId === "sunken-ruins") {
  ...
}

if (dungeonId === "northern-ruins") {
  ...
}
```

for ordinary configuration differences.

Instead:

```text
DungeonRoom
→ receives dungeonId
→ loads dungeon config
→ initializes configured map
→ spawns configured enemies
→ initializes configured boss
→ applies configured rewards
```

Dungeon-specific custom code should only be used when a dungeon genuinely needs unique mechanics.

Sunken Ruins should not need unique room architecture.

## 14. Enemy Spawn Positions

Enemy placement must also be config-driven.

Support either:

```text
explicit positions
```

or:

```text
spawn areas
```

depending on what the current project already uses.

Example:

```js
spawns: [
  { x: 4, y: 0, z: 12 },
  { x: 7, y: 0, z: 10 },
  { x: 2, y: 0, z: 15 },
]
```

Avoid random enemy placement if it can spawn enemies:

- inside walls
- outside the dungeon
- on inaccessible geometry
- directly on player spawn

## 15. Performance

Do not load the Sunken Ruins environment during normal open-world startup.

The dungeon assets should be loaded when entering / preparing to enter the dungeon.

This is especially important because Neverfall now uses deferred / lazy asset loading.

Requirements:

- do not add the dungeon GLB to initial world-load blocking assets
- cache reusable dungeon GLBs / models where practical
- reuse enemy model caches
- unload / clean up dungeon-only scene resources when appropriate

Do not break the existing loading optimization / waypoint system.

Waypoints should not preload dungeon interiors.

## 16. Preserve Existing Dungeons

Existing dungeons must continue working.

Do not convert the whole system in a way that breaks existing dungeon configs.

If existing dungeon definitions are partially hardcoded, migrate only what is needed to create a reusable configuration layer safely.

Existing dungeon behavior should remain functionally unchanged unless a bug is discovered.

## 17. Acceptance Criteria

The task is complete when:

- `Sunken Ruins` exists south of Southwest Lake
- the dungeon entrance is interactable
- the UI shows `Recommended Level: 15`
- players can enter the correct dungeon instance
- the dungeon has a working map / layout
- the map / scene is selected through dungeon configuration
- player spawn position is configurable
- enemy types are configurable
- enemy levels are configurable
- enemy counts are configurable
- enemy spawn positions / groups are configurable
- boss configuration is configurable
- rewards are configurable
- The Drowned Warden exists as the final boss
- the boss uses the existing boss framework
- dungeon completion works
- dungeon exit works
- multiplayer dungeon behavior still works
- existing dungeons still work
- Sunken Ruins assets do not block initial open-world loading
- generic `DungeonRoom` code does not contain unnecessary Sunken-Ruins-specific branches

## 18. Testing

Test at minimum:

### Open World

- entrance appears south of Southwest Lake
- entrance interaction works
- map marker is correct if supported
- recommended level is displayed correctly

### Instance Creation

- solo player enters
- party enters if supported
- correct dungeon config is selected
- player spawns at configured position

### Enemy Configuration

- correct enemy types spawn
- correct counts spawn
- enemy levels are correct
- enemy positions are correct
- enemies do not spawn in invalid geometry

### Boss

- Drowned Warden spawns
- boss HP / combat works
- existing telegraphs work
- boss death is detected
- dungeon completion triggers correctly

### Rewards

- XP reward
- Gold reward
- loot reward
- no duplicate completion rewards

### Regression

Test at least one existing dungeon after the config changes.

Make sure it still:

- loads
- spawns enemies
- spawns its boss
- completes
- exits correctly

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing dungeon architecture before editing.
3. Find the exact files responsible for:
   - dungeon definitions
   - `DungeonRoom`
   - dungeon map / scene loading
   - enemy spawning
   - boss spawning
   - dungeon entrances
   - World Map dungeon markers
   - dungeon rewards
   - dungeon completion / exit
4. Reuse the current architecture wherever possible.
5. Extend the dungeon config layer so map and enemy definitions are configurable.
6. Do not create a separate hardcoded implementation only for Sunken Ruins.
7. Keep `DungeonRoom` generic.
8. Avoid dungeon-specific `if` branches for normal configuration differences.
9. Reuse existing enemy AI and boss mechanics.
10. Reuse existing assets where reasonable.
11. Keep the implementation MVP-sized.
12. Use JavaScript only.
13. Do not add unnecessary dependencies.
14. Do not load Sunken Ruins during initial open-world startup.
15. Preserve existing dungeon functionality.
16. Run relevant checks after implementation.
17. Test at least one existing dungeon as a regression check.
18. In the final response, list every changed file with its exact path.
19. Also provide:
    - final Sunken Ruins dungeon config
    - enemy roster
    - enemy levels
    - boss config
    - reward config
    - any existing dungeon code migrated into shared configuration
20. If the current dungeon architecture makes any requested configuration unsafe or unnecessarily large to implement, explain the limitation and choose the smallest clean solution instead of overengineering.
