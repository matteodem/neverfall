# Loading Optimization Pass with Waypoint Support

## Goal

Reduce the initial world loading time after adding larger Meshy `.glb` assets, while keeping waypoint fast travel safe and visually clean.

Target:

```text
Initial world join: ideally <= 5 seconds
```

The player should be able to enter the world as soon as the essential nearby assets are ready.

Do **not** block initial loading on distant regions, dungeon assets, or decorative landmarks that are not needed immediately.

Waypoint fast travel must explicitly preload the destination region before teleporting the player.

## Current Problem

Initial loading increased from roughly:

```text
1–2 seconds
```

to approximately:

```text
5–10 seconds
```

after adding larger Meshy-generated `.glb` assets.

The goal is to identify which assets / loading steps are responsible and reduce the critical startup path without introducing broken waypoint teleports, missing visuals, or large pop-in.

## 1. Measure the Current Loading Pipeline

Before changing behavior, inspect the current world-loading code and identify:

- which `.glb` files are loaded before entering the world
- which assets are loaded sequentially vs in parallel
- which regions are loaded during startup
- which environment assets are required immediately
- which assets are large / slow to parse
- which textures are large
- whether duplicate models are loaded more than once
- whether waypoint destination regions are already preloaded or assumed to be loaded

Add temporary development timing logs if useful.

Example:

```text
Player model: 420ms
Central Camp: 310ms
Forest environment: 1100ms
Highlands assets: 900ms
Snowy Mountains: 1800ms
Dungeon assets: 1500ms
```

Do not keep noisy production logs if they are only needed for profiling.

## 2. Split Critical vs Deferred Assets

Create a clear distinction between:

```text
Critical assets
```

and:

```text
Deferred assets
```

### Critical Initial Load

Only block world entry on assets required near the player's initial spawn.

This should generally include:

- local player character model
- player animations
- Central Camp assets
- nearby Forest environment
- nearby enemies
- essential HUD / gameplay state
- any assets required to prevent visibly broken gameplay immediately after joining

### Deferred Loading

Do **not** block the initial loading screen on:

- Highlands-only environment assets
- Snowy Mountains assets
- distant landmarks
- Northern Camp assets if far from spawn
- dungeon environment assets
- dungeon bosses
- distant enemy models
- decorative props outside the initial area

Load these after the player has already entered the world or when needed by travel / proximity.

## 3. Background / Lazy Region Loading

Reuse the existing distance / region systems where possible.

Suggested behavior:

```text
Join World
→ load Central Camp + nearby Forest
→ player enters world
→ background-load nearby regions
→ preload Highlands before the player reaches it
→ preload Snowy Mountains before the player reaches it
```

Do not wait until the player is standing directly on top of an unloaded region.

Use a preloading distance / region threshold so assets are ready before they become visible.

Example concept:

```js
if (distanceToRegion < PRELOAD_DISTANCE) {
  preloadRegionAssets(regionId);
}
```

Avoid introducing a completely separate world-streaming architecture if the current region / culling system can support this.

## 4. Waypoint Fast Travel Must Preload Destination Assets

Waypoint travel must work correctly even when distant regions are no longer loaded during initial startup.

Current waypoint destinations may include:

- Central Camp
- Northern Camp
- Lake / Western Waypoint
- future waypoints in Highlands or Snowy Mountains

The travel flow should be:

```text
Player selects waypoint
→ validate waypoint travel server-side
→ determine destination region
→ start destination loading state
→ preload destination region critical assets
→ wait until destination region is ready
→ teleport player
→ restore normal controls / loading state
→ continue non-critical background loading
```

### Important

Do **not** use this flow:

```text
teleport player
→ load destination assets afterward
```

That would create:

- missing terrain / props
- enemy pop-in
- blank regions
- large visual jumps
- possible interaction or collision issues

### Destination Preload Requirements

Before teleporting, make sure the destination has the minimum assets required for safe arrival.

Depending on the region, this may include:

- destination terrain / local environment
- waypoint landmark
- nearby camp assets
- nearby collision-relevant props
- nearby enemy model types
- local region-specific landmarks that are immediately visible
- any required navigation / spawn state

Do not wait for every decorative prop in the entire region if it is not necessary.

### Waypoint Loading UI

If destination assets are not already loaded:

- show a short loading state / overlay
- temporarily prevent movement / duplicate waypoint clicks
- keep the existing waypoint confirmation flow if one exists
- do not fake delays
- hide the loading state immediately once required destination assets are ready and teleport finishes

Reuse the existing loading store / loading UI where practical.

Do not create a completely separate unrelated loading-screen system if the project already has one.

### Already Loaded Destinations

If the destination region is already loaded and ready:

```text
validate
→ teleport immediately
```

Do not show an unnecessary loading screen.

### Failed Destination Load

If destination loading fails:

- do not teleport the player
- restore controls
- close / reset the temporary travel loading state
- show a small error message
- keep the player at their current location
- log enough information to debug the failed region / asset

Never leave the player in a half-teleported state.

## 5. Region Readiness State

Introduce or reuse a lightweight region readiness state.

Example concept:

```js
isRegionLoaded(regionId)
preloadRegionAssets(regionId)
```

or equivalent existing architecture.

The exact implementation should follow the project's current patterns.

Avoid duplicating asset-load state across multiple systems.

Waypoint travel and proximity-based loading should ideally use the same region asset-loading function.

Example:

```text
Walking toward Highlands
        ↓
preloadRegionAssets("highlands")

Waypoint to Northern Camp
        ↓
preloadRegionAssets("highlands")
```

The underlying preload operation should be shared.

## 6. Prevent Duplicate Loads During Waypoint Travel

If a region is already:

- loaded
- currently loading
- being preloaded due to player proximity

then waypoint travel should reuse that same loading promise / state.

Do not start duplicate requests for the same GLBs.

Conceptually:

```js
if (regionLoadPromises.has(regionId)) {
  return regionLoadPromises.get(regionId);
}
```

Follow the current architecture rather than copying this exact implementation if a cache already exists.

## 7. Cache Loaded GLB Assets

Inspect whether the same `.glb` file is imported repeatedly.

Ensure that:

- each source `.glb` is loaded once where practical
- repeated props use cloned meshes / instances from a cached source
- repeated trees / rocks / camp props do not trigger repeated network requests
- repeated enemy types reuse loaded source assets
- waypoint destination loading reuses existing cached assets

Use the existing Babylon.js asset / container caching patterns if already present.

Prefer:

```text
load source once
→ cache
→ clone / instantiate
```

instead of:

```text
load same GLB again for every placement
```

## 8. Load Independent Assets in Parallel

Inspect startup code for unnecessary sequential `await` chains.

Bad example:

```js
await loadTrees();
await loadRocks();
await loadCamp();
await loadEnemies();
```

Where the loads are independent, use parallel loading:

```js
await Promise.all([
  loadTrees(),
  loadRocks(),
  loadCamp(),
  loadEnemies(),
]);
```

Apply the same principle to waypoint destination preloading.

Only do this for assets that are actually independent and safe to load concurrently.

Do not create excessive uncontrolled parallel requests.

## 9. Audit Meshy Assets

Inspect the recently added Meshy `.glb` assets.

For each important Meshy asset, report:

- file size
- number of meshes
- number of materials
- texture count
- texture dimensions if available
- whether embedded textures are unusually large
- whether the mesh appears unnecessarily dense for Neverfall's ultra-low-poly style

Identify the worst offenders.

Pay particular attention to Meshy landmark assets such as:

- dungeon entrance
- jumping puzzle tower
- Highlands landmark assets
- any large Snowy Mountains landmark

Do not automatically destroy or replace the original asset files.

If optimization is needed, clearly report which files should be externally optimized / decimated.

## 10. Texture Optimization

Avoid loading very large textures for low-poly environment assets.

Target where visually acceptable:

```text
512x512
or
1024x1024 max
```

for most environment props.

Do not resize textures automatically if the current pipeline does not safely support it.

Instead, identify oversized textures and list them in the final report if manual asset optimization is required.

Also avoid loading textures for distant regions during initial startup.

## 11. Avoid Loading Dungeons at World Startup

Dungeon-only assets should not be required for joining the open world.

Ensure dungeon assets are loaded when:

- the player enters / prepares to enter that dungeon
- or shortly before the dungeon room becomes visible

Do not preload every dungeon environment, enemy, and boss during the main open-world startup unless the architecture truly requires it.

Dungeon loading should remain separate from normal waypoint travel.

Do not accidentally treat a dungeon as a normal open-world waypoint destination.

## 12. Snowy Mountains

Snowy Mountains should be fully deferred when the player initially spawns near Central Camp.

Do not block initial loading on:

- Snowy Mountains environment models
- Snowy Mountains boss model
- Snowy Mountains enemy assets
- mountain landmark assets

Preload them later when:

- the player approaches the eastern region
- or a future waypoint sends the player into Snowy Mountains

If a waypoint to Snowy Mountains is added later, the same destination preload system should work without special-case architecture.

## 13. Loading Screen Behavior

Keep the existing loading UI, but make it represent only the **critical initial load** during normal world join.

The initial loading screen should disappear once:

- player model is ready
- Central Camp / nearby terrain is ready
- nearby gameplay-critical assets are ready
- multiplayer world state is ready

Deferred background loading must not keep the initial loading screen open.

Waypoint travel may reuse the same loading store / overlay, but it should represent:

```text
Loading destination...
```

not restart the full initial game-loading sequence.

Do not add fake delays.

## 14. Prevent Visible Pop-In

Optimization should not cause obvious broken visual states.

When deferred assets are still loading:

- do not render placeholder broken meshes
- do not spawn gameplay entities without required visuals if that causes errors
- preload regions before the player enters visible range
- keep region activation tied to asset readiness where necessary
- make waypoint travel wait for destination-critical assets

A small amount of distant decorative prop pop-in is acceptable for the MVP, but major landmarks / enemies should be ready before the player reaches them.

## 15. Preserve Existing Systems

Do not break:

- multiplayer sync
- enemy spawning
- world events
- spawn points
- waypoint unlocking
- waypoint server validation
- waypoint travel restrictions
- dungeons
- minimap
- world map
- entity culling
- environment generation
- mobile support

This task is primarily about changing **when assets load**, not redesigning gameplay.

## Acceptance Criteria

- Initial world loading no longer waits for distant-region assets.
- Snowy Mountains assets are deferred from the initial startup path.
- Dungeon assets are not unnecessarily loaded during open-world startup.
- Repeated GLB models reuse cached source assets where practical.
- Independent startup loads run in parallel where safe.
- Player can enter the initial world once critical nearby content is ready.
- Deferred assets load in the background / before entering their region.
- Waypoint travel works even when the destination region was not loaded at startup.
- Waypoint travel preloads destination-critical assets before teleporting.
- Already loaded waypoint destinations teleport without unnecessary loading delays.
- Failed destination loads do not move the player.
- Waypoint travel does not trigger duplicate GLB / region loads.
- Proximity loading and waypoint loading share the same region preload logic where practical.
- Existing waypoint unlocking and server-side validation remain intact.
- Existing gameplay systems continue to work.
- Codex reports the biggest asset-loading bottlenecks it found.
- Codex reports any Meshy assets that need external decimation / texture optimization.

## Performance Targets

Aim for:

```text
Central Camp initial world join:
<= 5 seconds on the current development machine
```

For waypoint travel:

```text
Already-loaded destination:
near-immediate teleport after validation

Unloaded destination:
only wait for destination-critical assets,
not the entire world
```

Do not hardcode artificial timeouts to meet these targets.

Measure actual loading improvements.

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current loading screen, world initialization, environment loading, region loading, waypoint system, dungeon loading, and Babylon.js asset helper code before changing anything.
3. Identify the exact files currently responsible for:
   - initial world loading
   - environment / region loading
   - GLB caching
   - waypoint selection
   - waypoint server-side validation
   - waypoint teleport execution
4. Measure / identify the current critical loading path.
5. Separate critical initial assets from deferred assets.
6. Reuse existing region, culling, and asset-loading architecture where possible.
7. Add or improve caching for repeatedly loaded GLB sources where needed.
8. Parallelize independent loading tasks where safe.
9. Defer Highlands, Snowy Mountains, distant landmarks, and dungeon-only assets from initial startup where possible.
10. Make waypoint travel explicitly preload the destination region before teleporting if the destination is not already ready.
11. Reuse the same region preload logic for both proximity loading and waypoint loading.
12. Keep waypoint unlocking, validation, combat/death/dungeon restrictions, and server authority intact.
13. Never teleport the player into an unloaded destination.
14. On load failure, keep the player at the original location and restore the UI / controls cleanly.
15. Do not perform unrelated refactors.
16. Use JavaScript only.
17. Run relevant checks after implementation.
18. Compare loading behavior before and after the change.
19. Test at minimum:
    - fresh join at Central Camp
    - waypoint to Central Camp
    - waypoint to Northern Camp
    - waypoint to Lake / Western Waypoint
    - waypoint to a destination whose region is already loaded
    - waypoint to a destination whose region is not loaded
    - failed destination asset load
20. In the final response, list every changed file with its exact path.
21. Also list any oversized / overly complex Meshy assets that still require external optimization.
