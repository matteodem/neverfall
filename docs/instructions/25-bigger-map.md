# Larger World / Chunk Activation MVP

## Goal

Support a larger world without keeping the entire map fully active at once.

Keep it simple, DRY, and compatible with the existing Babylon.js / Colyseus architecture.

---

## World Size

Increase the world from roughly:

```text
200 x 200
```

to something like:

```text
600 x 600
```

Split it into chunks, for example:

```text
9 chunks
each ~200 x 200
```

---

## Chunk Activation

Keep only nearby chunks active.

Suggested behavior:

```text
current chunk
+
8 neighboring chunks
```

For distant chunks:

- disable environment meshes
- stop unnecessary animations
- avoid rendering local enemy visuals
- keep server/game state intact where needed

---

## Regions

Allow chunks to represent different areas, for example:

```text
forest
mountains
ruins
dungeon area
```

Keep region config centralized.

---

## Minimap / World Map

The full world should still be visible on the minimap/world map.

Do not tie map visibility to chunk rendering.

---

## Performance

Reuse existing:

- entity culling
- distance checks
- animation throttling
- static mesh optimizations

Do not add full asset streaming yet.

---

## Out of Scope

Do not add:

- procedural world generation
- seamless GLB asset streaming
- server sharding
- world servers
- complex terrain LOD
- major networking refactor

---

## Acceptance Criteria

- World can be significantly larger.
- Nearby chunks are active.
- Distant chunks are visually disabled.
- Minimap/world map still represents the full world.
- Existing multiplayer and enemy systems keep working.
- No major performance regression.

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing environment/world creation code.
3. Reuse current culling/performance helpers.
4. Keep chunk configuration centralized.
5. Keep changes minimal and DRY.
6. Avoid unrelated refactors.
7. Run relevant checks after implementation.
