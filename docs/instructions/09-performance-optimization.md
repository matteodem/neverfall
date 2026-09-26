# Performance Pass / Optimization

## Goal

Improve Neverfall's runtime performance before adding significantly more content.

The main focus is reducing unnecessary rendering, animation updates, UI updates, and per-frame work while keeping gameplay state and minimap information intact.

Keep the implementation:

- simple
- DRY
- incremental
- compatible with the current Babylon.js + React + Zustand + Meteor + Colyseus architecture
- focused on measurable performance gains
- free of large unrelated refactors

---

## 1. Enemy Rendering Radius

Only render enemy 3D visuals when they are near the local player.

### Suggested distance

```js
const ENEMY_RENDER_DISTANCE =
  200;
```

### Requirements

If an enemy is outside the render radius:

- disable its 3D mesh
- stop or pause its animations
- hide its health bar
- hide its nameplate
- stop unnecessary local visual updates

Keep:

- enemy server state
- enemy position/state synchronization
- enemy minimap marker

The minimap must continue showing all enemies even when their 3D model is not rendered.

### Important

Do **not** remove enemies from the minimap based on render distance.

The minimap and 3D visibility should be independent systems.

---

## 2. Add Hysteresis to Entity Visibility

Avoid entities repeatedly appearing/disappearing when the player is near the exact render boundary.

Example:

```text
Enable entity below: 190m
Disable entity above: 210m
```

This prevents constant toggling around 200m.

---

## 3. Remote Player Rendering Radius

Apply a similar visibility system to remote players.

### Suggested distance

```text
200–250m
```

When a remote player is outside the render radius:

- disable character mesh
- disable mount mesh
- pause character animations
- pause mount animations
- hide nameplate
- hide health bar if applicable

Continue receiving and storing multiplayer state.

Do not disconnect or remove the remote player just because they are outside visual range.

---

## 4. Do Not Run Distance Checks Every Frame

Entity visibility does not need to be recalculated at 60 FPS.

Throttle visibility checks.

Suggested interval:

```text
250–500ms
```

Prefer squared-distance checks instead of `Vector3.Distance()` where practical.

Example:

```js
const dx =
  entityX -
  playerX;

const dz =
  entityZ -
  playerZ;

const distanceSquared =
  dx * dx +
  dz * dz;
```

Then compare against:

```js
const renderDistanceSquared =
  renderDistance *
  renderDistance;
```

Avoid unnecessary `Math.sqrt()` calls.

---

## 5. Update Animations Only for Visible Entities

Do not update animations for entities whose meshes are disabled.

Apply this to:

- enemies
- remote players
- remote mounts

Examples:

```text
Visible enemy:
update animations

Hidden enemy:
skip animation update
```

This should reduce CPU work as entity counts increase.

---

## 6. Cull Health Bars and Nameplates More Aggressively

Health bars and nameplates do not need to be visible as far away as the 3D model.

Suggested UI distance:

```text
50–80m
```

For entities beyond that distance:

- hide nameplate
- hide health bar
- stop updating screen-space positioning

Keep the actual entity rendered if it is still inside the main render radius.

---

## 7. Reduce Enemy Update Frequency

Enemy visual/local update logic does not need to run equally often at every distance.

Suggested behavior:

### Near enemies

```text
10–20 updates per second
```

### Medium/far enemies

```text
1–5 updates per second
```

### Very far enemies

```text
No local visual update
```

Keep server-side gameplay authoritative.

Do not move important game logic entirely to the client.

---

## 8. Keep Minimap Independent

The minimap should continue displaying entities even when their 3D representation is disabled.

### Requirements

The minimap should still show:

- local player
- remote players
- boars
- wolves
- mini-bosses
- other configured markers

Enemy render distance must not affect minimap visibility.

Prefer reading minimap markers from synchronized entity state instead of mesh visibility.

---

## 9. Throttle Minimap Updates

The minimap does not need to update at render-loop speed.

Suggested rates:

### Local player marker

```text
~10 updates / second
```

### Enemy / remote-player markers

```text
2–5 updates / second
```

Avoid calling Zustand setters every frame when there is no visible benefit.

---

## 10. Reduce Zustand Updates Inside the Render Loop

Review the game loop for state updates that happen every frame.

Look for:

- `setState`
- Zustand setters
- newly allocated objects
- array `map`
- array `filter`
- array `find`
- repeated derived calculations

Move work out of the render loop where practical.

Only update UI state when values meaningfully change.

---

## 11. Freeze Static World Meshes

Review static environment objects such as:

- rocks
- trees
- ruins
- jumping puzzle blocks
- camp props
- path props
- decorative environment meshes

Where safe, use Babylon.js optimizations such as:

```js
mesh.freezeWorldMatrix();
```

Only do this for objects that never move, rotate, or scale during gameplay.

---

## 12. Freeze Static Materials Where Safe

For materials that do not change at runtime, investigate whether they can be frozen.

Do not freeze materials that need runtime updates.

Apply only where safe and measurable.

---

## 13. Use Instances for Repeated World Props

Repeated objects should avoid creating completely separate heavy meshes where possible.

Good candidates:

- trees
- rocks
- bushes
- repeated ruins
- repeated environmental decorations

Prefer:

```text
instances
```

or where appropriate:

```text
thin instances
```

Do not rewrite the entire environment system at once.

Start with the most frequently repeated assets.

---

## 14. Review Shadow Performance

If shadows are currently enabled, reduce their cost.

Possible improvements:

- only nearby entities cast shadows
- small decorative props do not cast shadows
- reduce unnecessary shadow casters
- avoid distant enemies casting shadows
- limit shadow-map resolution if currently excessive

Prioritize shadows for:

- local player
- nearby enemies
- mini-boss
- important nearby world objects

---

## 15. Disable Invisible Entity Animations

When an entity is disabled:

```js
mesh.setEnabled(false);
```

also ensure its animation groups are not still running unnecessarily.

Visibility optimization should include both:

```text
Rendering
+
Animation processing
```

---

## 16. Avoid Repeated Object Allocation in the Game Loop

Review hot paths for patterns like:

```js
{
  x: player.position.x,
  z: player.position.z,
}
```

being created every frame unnecessarily.

Also review repeated:

```js
Array.from(...)
map(...)
filter(...)
find(...)
```

inside frequently executed update functions.

Cache or reuse data where practical.

Do not over-optimize insignificant code.

Focus on high-frequency paths.

---

## 17. Keep Audio Event-Driven

Audio should not require polling every frame.

Sounds should play from events such as:

- attack
- successful hit
- loot collection
- heal
- level up
- boss events

Avoid frame-loop audio checks.

---

## 18. Keep UI Event-Driven

UI updates should only happen when needed.

Examples:

- health changes
- XP changes
- quest progress changes
- cooldown changes
- equipment changes
- inventory changes

Avoid continuously recalculating UI state if the underlying value did not change.

---

## 19. Add a Development Performance Overlay

Add a simple development-only performance display.

Example:

```text
FPS: 58
Meshes: 340
Active enemies: 12 / 50
Active players: 6 / 20
Visible nameplates: 8
```

Useful values:

- FPS
- total enemy count
- currently rendered enemy count
- total remote player count
- currently rendered remote player count
- active mesh count if easily available

Keep this debug-only.

Do not include it in the normal production HUD unless explicitly enabled.

---

## 20. Measure Before and After

For each performance optimization:

1. Measure current FPS/performance.
2. Implement one optimization.
3. Measure again.
4. Keep the change only if it is useful and safe.

Avoid speculative large refactors.

---

# Priority Order

Implement in this order:

## High Priority

1. Enemy rendering radius
2. Remote player rendering radius
3. Stop animations for hidden entities
4. Throttle visibility checks
5. Cull nameplates / health bars

## Medium Priority

6. Throttle minimap updates
7. Reduce Zustand updates in the render loop
8. Reduce distant enemy update frequency
9. Freeze static world meshes
10. Instance repeated environment props

## Lower Priority / Later

11. Shadow optimization
12. Material freezing
13. More advanced LOD
14. Thin instances where useful
15. Further render-loop micro-optimizations

---

# Suggested First Implementation

Start with an entity visibility system.

Example configuration:

```js
export const ENTITY_VISIBILITY = {
  enemy: {
    enableDistance: 190,
    disableDistance: 210,
  },

  remotePlayer: {
    enableDistance: 220,
    disableDistance: 250,
  },

  nameplate: {
    distance: 70,
  },

  updateInterval: 300,
};
```

Keep these values centralized and easy to tune.

---

# Important Minimap Requirement

Even if an enemy is outside the 3D render radius:

```text
Enemy 3D mesh:
OFF

Enemy animation:
OFF

Enemy nameplate:
OFF

Enemy health bar:
OFF

Enemy minimap marker:
ON
```

The minimap must remain independent from scene rendering distance.

---

# Out of Scope

Do not implement yet:

- complex spatial partitioning
- quadtree
- octree-based gameplay logic
- server sharding
- world streaming system rewrite
- full LOD asset pipeline
- procedural chunk streaming
- major networking rewrite
- Web Workers rewrite
- engine replacement

These can be considered later if the game grows significantly larger.

---

# Acceptance Criteria

The performance pass is successful when:

- distant enemies no longer render
- distant enemy animations do not run
- distant remote players no longer render
- minimap still shows all synchronized enemies
- visibility checks are throttled
- nameplates are culled at shorter distances
- minimap updates are throttled
- static world objects use safe Babylon optimizations where useful
- repeated props use instancing where practical
- no gameplay state is lost because an entity is visually culled
- multiplayer behavior remains correct
- measurable FPS/frame-time improvement is observed

---

# Codex Instructions

Before implementing:

1. Read `AGENTS.md`.
2. Inspect the current game loop.
3. Inspect enemy creation/update logic.
4. Inspect remote-player creation/update logic.
5. Inspect minimap state synchronization.
6. Inspect animation controllers.
7. Inspect nameplate/health-bar implementation.
8. Inspect environment prop creation.
9. Follow the existing architecture.
10. Keep changes incremental and DRY.
11. Do not tie minimap visibility to 3D mesh visibility.
12. Avoid large unrelated refactors.
13. Run relevant checks after implementation.
14. Prefer measurable performance improvements over speculative complexity.
