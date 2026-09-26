# World Map Modal MVP

## Goal

Add a lightweight full-map modal with a bird's-eye/top-down view of the current world.

Keep it simple, DRY, and cheap to render.

---

## Map Approach

Do **not** render a second live 3D scene.

Use:

```text
static top-down world image
+
live React markers
```

Only update live marker positions while the map modal is open.

---

## Map Modal

Add a new HUD/menu button:

```text
Map
```

Open the map using the existing DaisyUI / `HudModal` pattern.

Place the map button at the end of the list.

---

## Markers

Show only:

- local player
- party members (optional if easy to reuse)
- dungeon entrance

Do **not** show normal enemies or regular boss markers.

---

## Dungeon Entrance

Show a clear POI marker for the dungeon entrance.

Example:

```text
Dungeon
```

or a simple dungeon/portal icon.

Position it using world coordinates.

---

## Coordinate Mapping

Reuse the existing minimap/world-coordinate logic where possible.

Convert world `x/z` coordinates into percentage positions inside the map.

Avoid duplicating coordinate math.

---

## Performance

- no second continuously rendered Babylon camera
- no enemy marker updates
- no map updates while the modal is closed
- keep marker updates lightweight
- reuse existing state where possible

---

## Out of Scope

Do not add:

- enemy markers
- fog of war
- map zoom
- map dragging
- quest markers
- boss markers
- waypoint system
- live 3D map rendering

---

## Acceptance Criteria

- A `Map` menu button exists.
- The modal opens/closes correctly (also is drag and droppable).
- The map uses a static top-down world background.
- The local player marker is visible.
- The dungeon entrance marker is visible.
- Party markers may be shown if easy to reuse.
- No normal enemy markers are shown.
- Marker positions match world coordinates.
- Runtime overhead stays minimal.
- Pressing "M" toggles the map modal

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing minimap implementation.
3. Reuse existing coordinate mapping/state where possible.
4. Reuse existing HUD modal/menu patterns.
5. Keep the implementation small and DRY.
6. Do not add a second live 3D render loop.
7. Avoid unrelated refactors.
8. Run relevant checks after implementation.
