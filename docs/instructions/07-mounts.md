# Mounts MVP

## Goal

Add a very simple mount system to Neverfall.

Keep the implementation:

- MVP-sized
- DRY
- simple
- JavaScript only
- compatible with the current Babylon.js + React + Zustand + Meteor + Colyseus architecture

Do not redesign the existing character system.

---

## Scope

Implement one basic mount first.

The mount should:

- be a separate `.glb` model
- spawn underneath the player
- move together with the player
- increase movement speed
- support mount / dismount
- work for the local player
- sync mounted state to remote players
- disable normal combat while mounted

Do not add a mount collection UI yet.

---

## Controls

Use:

```text
M = Mount / Dismount
```

Also add a button to the Bottom HUD which triggers mount / dismount. 
Place the button to the left of the health bar.

Only allow mounting while the player is alive.

---

## Player Structure

Use a simple structure similar to:

```text
PlayerRoot
├── MountModel
└── RiderAnchor
    └── CharacterModel
```

When mounted:

- attach the character to a `RiderAnchor` on the mount
- position the character above the mount
- hide or disable the normal on-foot visual setup where necessary
- movement should continue using the existing player movement / collider system if possible

Do not replace the whole movement architecture.

---

## Movement

When mounted:

- increase movement speed by approximately 50%
- keep existing WASD controls
- keep existing camera controls
- keep existing collision logic

Example:

```js
const MOUNT_SPEED_MULTIPLIER =
  1.5;
```

Do not add stamina.

---

## Combat

While mounted:

- disable normal attack
- disable heal if necessary for simplicity
- prevent mounted combat

Dismounting should restore the existing combat behavior.

---

## Animations

Mount:

- Idle animation
- Run / Walk animation

Character:

For the MVP, a perfect riding animation is not required.

If no riding animation exists:

- keep the character in a simple static pose
- position the character so it visually sits on the mount
- avoid complex animation retargeting

Do not create a new custom skeleton system.

---

## Multiplayer

Mounted state must be synchronized through Colyseus.

Each player should expose something similar to:

```js
mounted: false
```

Optionally:

```js
mountType: "horse"
```

Remote players should:

- show the mount when mounted
- hide the mount when dismounted
- move together with their mount

Reuse the existing remote-player sync architecture.

Do not create a separate networking system.

---

## Mount Asset

Use one mount for the MVP.

The path for the mount asset is found here:

```text
game/public/models/mounts/horse-01.glb
```

Expected animation support if available:

```text
Idle
Run
```

If animation names differ, inspect the GLB and map the available animations.

Do not hardcode assumptions without checking the actual model.

---

## Suggested Files

Follow the existing project structure.

Possible new file:

```text
imports/game/mounts.js
```

Possible responsibilities:

- load mount model
- mount player
- dismount player
- update mount animation
- expose mounted state

Reuse existing:

```text
imports/game/movement.js
imports/game/multiplayer.js
imports/game/input.js
imports/ui/Game.jsx
```

Only modify files that are actually necessary.

---

## State

Keep mount state minimal.

Example:

```js
{
  mounted: false,
  mountType: "horse"
}
```

Do not introduce a new Zustand store unless the existing architecture clearly benefits from it.

Prefer keeping mount state near the gameplay code.

---

## Dismount Behavior

When dismounting:

- remove / hide the mount
- restore the character to the normal player root
- restore normal movement speed
- restore combat
- preserve the player's world position

Do not teleport the player.

---

## Death

If the player dies while mounted:

- automatically dismount
- remove / hide the mount
- continue using the existing death / respawn flow

Do not change the existing death system.

---

## Out of Scope

Do not implement:

- mount collection
- mount inventory
- mount equipment
- mounted combat
- flying mounts
- swimming mounts
- mount stamina
- mount progression
- mount rarity
- multiple mount types
- custom riding animations
- mount vendors
- mount persistence

These can be added later.

---

## Codex Instructions

Before implementing:

1. Read `AGENTS.md`.
2. Inspect the existing player, movement, animation and multiplayer architecture.
3. Inspect the actual mount GLB before assuming animation names.
4. Follow existing project patterns.
5. Reuse the existing player collider and movement system where possible.
6. Keep the implementation minimal and DRY.
7. Do not introduce unnecessary dependencies.
8. Avoid large refactors.
9. Run relevant checks after implementation.
10. Ensure remote players still work correctly.
