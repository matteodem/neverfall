# Heroes of Neverfall — River Test Near Starter Camp

## Goal
Create a **natural-looking low-poly fantasy river test section** near the starter camp, clearly **visible from the new-player spawn**. Avoid the previous straight, uniformly blue “road” appearance.

## Requirements
- First inspect `AGENTS.md`, existing terrain/spawn/camp placement, and the currently commented-out river implementation; reuse suitable code where possible.
- Place **only a short test section** near the camp, visible from spawn, without moving or obstructing spawn points, camp props, landmarks, or existing gameplay.
- River width: approximately **3–5 world meters** (check the project's actual world scale). Use a gently winding path, irregular banks and subtle width variation, not a straight rectangular strip.
- Integrate a shallow riverbed and banks naturally with the existing terrain **without breaking terrain generation, collisions or navigation**.
- Use Babylon.js **WaterMaterial** if compatible with the project; aim for **clear turquoise fantasy water** with subtle animated ripples/reflections, not ocean-scale waves. Keep it lightweight.
- **No bridge for now.** Do not expand the river across the entire world yet.

## Acceptance criteria
- River is noticeable from the starter spawn and looks organic, not like a blue road.
- Existing terrain, camp, spawn behavior, gameplay and shadows still work.
- Code is small, configurable, and performant; run relevant checks and list changed files.

If placement or terrain integration cannot be determined from the existing code, **ask before making assumptions**.
