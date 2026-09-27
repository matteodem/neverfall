# Performance Optimizations

## Goal

Improve runtime performance without large refactors.

Keep changes measurable, DRY, and compatible with the existing Babylon.js / Colyseus architecture.

---

## 1. Object Pooling

Reuse temporary gameplay objects instead of constantly creating/disposing them.

Good candidates:

- Ranger arrows
- Mage fireballs
- AoE visuals
- hit effects
- loot/VFX meshes

Prefer:

```text
create once
→ disable/reuse
→ return to pool
```

---

## 2. Network Update Rate

Review multiplayer movement/state update frequency.

Suggested targets:

```text
Player movement: 10–20 Hz
Enemy state: 5–10 Hz
```

Use client-side interpolation for smooth movement.

Do not send updates every render frame unless necessary.

---

## 3. Reduce Draw Calls / Materials

Review environment and repeated props.

Where practical:

- reuse materials
- instance repeated meshes
- merge static meshes that belong together
- avoid unique materials per prop

Prioritize trees, rocks, bushes, and repeated world decorations.

---

## 4. Texture Optimization

Keep browser/mobile texture usage reasonable.

Prefer:

```text
512px / 1024px textures
```

instead of unnecessary 2K/4K textures.

Where practical, investigate compressed textures such as KTX2/Basis later.

---

## 5. Mobile Quality Preset

Add a lightweight mobile/low-quality mode.

Possible reductions:

- shorter render distance
- fewer shadows
- fewer particles
- reduced environment density
- slightly lower render resolution

Keep gameplay unchanged.

---

## 6. Shadow Optimization

Limit expensive shadow casting.

Prioritize:

- local player
- nearby enemies
- bosses

Avoid shadows for distant enemies and small decorative props.

---

## 7. LOD / Distance Simplification

For larger areas, consider simple LOD behavior:

```text
near = full model
medium = lower detail if available
far = disabled
```

Reuse existing distance-culling logic.

Do not build a complex LOD pipeline yet.

---

## 8. Server AI Throttling

Reduce AI update frequency when no players are nearby.

Far/inactive enemies should require less:

- targeting
- patrol logic
- movement updates

Keep gameplay authoritative on the server.

---

## 9. Measure Performance

Use the existing/debug performance overlay where possible.

Track:

- FPS
- frame time
- active meshes
- draw calls
- active projectiles/VFX
- network update frequency

Measure before and after changes.

---

## Priority

Implement roughly in this order:

1. Object pooling
2. Network tick rate + interpolation
3. Draw-call/material reduction
4. Texture optimization
5. Mobile quality preset
6. Shadow optimization
7. AI throttling
8. LOD improvements

---

## Out of Scope

Do not add:

- engine replacement
- Web Worker rewrite
- server sharding
- advanced streaming architecture
- major networking rewrite

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect current projectile/VFX creation.
3. Inspect multiplayer update frequency.
4. Inspect repeated environment meshes/materials.
5. Keep changes incremental and measurable.
6. Avoid unrelated refactors.
7. Run relevant checks after implementation.
