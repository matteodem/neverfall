# Species MVP

## Goal

Add 3 playable species without requiring new character 3D assets.

All species reuse the existing humanoid models, rigs, and animations.

## Species

### Human

Default balanced species.

- Normal skin tones
- Standard body proportions
- No special passive bonus

### Ashborn

A darker, fire-touched species.

- Darker / red-tinted skin tones
- Optional warm eye tint
- Passive: **+3% Damage**

### Sylvan

A nature-aligned species.

- Pale / green-tinted skin tones
- Slightly slimmer appearance
- Passive: **+3% Movement Speed**

## Implementation

Store species on the character, for example:

```js
species: "human"
```

Reuse the existing appearance system for visual differences.

No separate 3D models are required.

## Future

Later, species-specific models or heads can replace the shared visuals without changing the core species data model.
