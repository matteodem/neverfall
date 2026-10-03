# Integrate Optimized Quaternius Modular Character Assets

## Goal

Integrate the optimized Quaternius modular fantasy character `.glb` assets into Neverfall.

The optimized modular assets are located at:

```text
game/public/models/characters/quaternius-fantasy/optimized/modular-parts
```

The integration should support a modular player character system instead of one monolithic character model per class/species/gender combination.

Use JavaScript only.

Keep the implementation MVP-sized, DRY, and compatible with the existing Babylon.js character loading / animation architecture.

---

## 1. Inspect the Existing Character Loading Architecture

Before changing code, inspect the existing player character rendering and asset loading flow.

Identify:

- where the local player model is loaded
- where remote player models are loaded
- how character appearance data is read
- how `gameClass`, `species`, gender, skin tone, head, and body type are currently stored
- how skeletons and animation groups are handled
- how weapons are attached
- whether local and remote players share one loader
- whether GLB assets are already cached
- whether there is an existing character asset config / registry

Do not create duplicate loaders if an existing reusable system already exists.

---

## 2. Add a Central Character Asset Configuration

Create or extend one central config module for Quaternius modular character parts.

Suggested responsibility:

```text
character appearance
→ resolve required modular GLB files
```

Example structure:

```js
export const CHARACTER_ASSET_CONFIG = {
  gender: {
    male: {
      base: "...",
    },
    female: {
      base: "...",
    },
  },

  species: {
    human: {
      // head / material / optional species-specific parts
    },
    ashborn: {
      // species-specific parts
    },
    sylvan: {
      // species-specific parts
    },
  },

  classes: {
    Warrior: {
      outfit: [],
      weapon: null,
    },

    Ranger: {
      outfit: [],
      weapon: null,
    },

    Mage: {
      outfit: [],
      weapon: null,
    },
  },
};
```

Do not hard-code asset paths throughout gameplay code.

All Quaternius modular asset paths should resolve from:

```text
/models/characters/quaternius-fantasy/optimized/modular-parts/
```

Remember that files under Meteor `public/` are served without `/public` in the URL.

---

## 3. Create / Extend a Modular Character Asset Resolver

Create a small resolver function that receives the character data and returns the required modular parts.

Example input:

```js
{
  gender: "male",
  species: "human",
  gameClass: "Warrior",
  appearance: {
    skinTone: "...",
    bodyType: "...",
    head: "...",
    hair: "...",
  },
}
```

Example output:

```js
{
  base: "...glb",
  head: "...glb",
  hair: "...glb",
  outfit: [
    "...glb",
    "...glb",
  ],
  accessories: [],
  weapon: "...glb",
}
```

The exact mappings must be based on the real filenames found under:

```text
game/public/models/characters/quaternius-fantasy/optimized/modular-parts
```

Do not invent filenames.

Inspect the folder first and build the config from the actual optimized assets.

---

## 4. Create / Extend a Modular Character Loader

Create or extend a reusable Babylon.js loader responsible for assembling one character.

Suggested flow:

```text
resolve character config
→ create character root node
→ load base body
→ load head / hair
→ load class outfit parts
→ load optional accessories
→ attach all compatible skinned meshes
→ bind parts to the same skeleton where required
→ apply appearance/material changes
→ attach weapon
→ expose animations / root / meshes
```

The loader should return one consistent object that the existing player code can consume.

Example:

```js
{
  root,
  skeleton,
  meshes,
  animationGroups,
  weapon,
  dispose,
}
```

Adapt this to the existing architecture instead of forcing a new API if a similar structure already exists.

---

## 5. Preserve Shared Skeleton Compatibility

The modular system depends on compatible rigs.

Inspect the optimized files and determine whether:

```text
base body
head
outfit pieces
accessories
```

contain their own equivalent skeletons or are intended to share one skeleton.

Prefer a single active player skeleton where practical.

If modular parts import duplicate equivalent skeletons:

- identify the primary skeleton
- rebind compatible skinned meshes to the primary skeleton if safe
- dispose unused duplicate skeletons only after verifying they are not referenced

Do not alter bone names or bind poses.

If Quaternius assets require a different assembly method, follow their actual exported structure rather than forcing skeleton reassignment.

---

## 6. Asset Caching

Do not fetch the same GLB repeatedly for every player.

Add or reuse a shared cache for modular character assets.

Preferred pattern:

```text
first request for asset
→ load GLB
→ cache reusable source/container

later request
→ instantiate / clone from cached source
```

Use Babylon.js `AssetContainer` or the existing Neverfall caching pattern where suitable.

Important:

```text
network asset cache != shared live mesh
```

Each player must receive its own mesh / transform instances.

Do not reuse one mutable mesh object between players.

---

## 7. Load Only Required Character Parts

Do not load the complete Quaternius asset pack when a player joins.

For a given character, only load the required parts.

Example:

```text
Male Human Warrior
→ male base
→ selected Human head
→ selected hair
→ Warrior outfit
→ sword
```

Do not automatically load:

```text
Female assets
Mage outfit
Ranger outfit
all hairstyles
all heads
all accessories
```

unless actually required.

This is especially important for the initial browser load.

---

## 8. Local and Remote Players

Use the same modular character assembly logic for:

```text
local player
remote multiplayer players
```

Do not maintain separate hard-coded character asset mappings for local and remote players.

Remote players should receive enough appearance data through the existing multiplayer state to reconstruct the same modular appearance.

If required appearance fields are not currently synchronized, extend the existing player state minimally.

Only synchronize identifiers / configuration values.

Do not synchronize mesh data or asset files.

Example multiplayer appearance data:

```js
{
  gender: "male",
  species: "human",
  gameClass: "Warrior",
  head: "head-1",
  hair: "hair-2",
  skinTone: "..."
}
```

Use the real existing character schema.

---

## 9. Character Appearance Persistence

Reuse the existing character appearance data where possible.

Current Neverfall appearance already conceptually supports:

```text
skinTone
bodyType
head
```

Extend it only if required by the new modular assets.

Possible additions:

```text
gender
hair
hairColor
outfitVariant
```

Do not add fields that are not needed for the current MVP.

Any persistent appearance data should remain on the Character document, not only in client state.

---

## 10. Species Handling

Neverfall currently has:

```text
Human
Ashborn
Sylvan
```

Use modular Quaternius assets as a shared humanoid base.

For the first integration, species can differ through a limited set of modular changes such as:

```text
head
skin/material color
hair
ears / horns / species accessory
```

Do not create three completely separate animation systems.

Reuse the same humanoid rig whenever the assets permit it.

If the optimized pack does not yet contain suitable Ashborn or Sylvan parts, keep their mappings configurable and fall back to the nearest supported base rather than inventing missing assets.

Document any temporary fallback clearly.

---

## 11. Class Handling

Map the three Neverfall classes to suitable Quaternius fantasy outfit parts:

```text
Warrior
Ranger
Mage
```

Inspect the actual optimized filenames and choose the closest matching modular parts.

Keep this mapping config-driven.

Example concept:

```js
Warrior:
  heavy / plate / melee outfit

Ranger:
  leather / light / hunter outfit

Mage:
  robe / cloth / wizard outfit
```

Do not hard-code class-specific mesh loading inside player movement or combat code.

---

## 12. Weapons

Preserve the existing Neverfall weapon attachment system where possible.

If the current:

```text
Sword
Bow
Staff
```

assets already work and fit the new character rig, keep them.

Do not replace weapons purely because the Quaternius pack contains alternatives.

Verify that the existing hand bone attachment works with the Quaternius skeleton.

If the bone name differs, add a small bone-name mapping in the character asset config rather than spreading special cases throughout the code.

Example:

```js
handBones: {
  right: "...",
  left: "...",
}
```

---

## 13. Existing Animations

Do not replace the entire animation system unless necessary.

Prefer reusing the existing Neverfall animation states:

```text
Idle
Run
Jump
Attack
Death
etc.
```

Determine whether the Quaternius rig is compatible with the current animations.

If retargeting is already part of the project, integrate through that existing workflow.

If not, first test whether the optimized Quaternius files already include compatible animation clips.

Avoid implementing a large new animation-retargeting system as part of this task unless it is required to make the character functional.

---

## 14. Skin Tone / Material Variants

If skin tone is already stored in:

```js
appearance.skinTone
```

preserve it.

Prefer changing the relevant skin material color / texture variant instead of creating separate GLBs for every skin tone.

Avoid mutating cached source materials globally.

Each player must be able to have an independent skin tone.

Clone or instantiate materials as needed before applying player-specific appearance changes.

---

## 15. Character Lifecycle / Disposal

The new loader must integrate correctly with player cleanup.

When a remote player leaves, dies permanently from the scene, changes character, or the scene is disposed:

- dispose player-specific root nodes
- dispose player-specific meshes / material instances when owned by that character
- stop player-specific animation groups
- clean observers / subscriptions
- do not destroy shared cached source assets required by other players

Avoid memory leaks when players repeatedly join and leave.

---

## 16. Loading UX

Character asset loading may involve multiple modular GLBs.

Reuse the existing loading state where possible.

For the local player:

```text
do not finish player initialization until required character parts are ready
```

For remote players:

```text
do not block the whole world while their appearance loads
```

A remote player can appear once their required model parts are assembled.

Do not preload the entire Quaternius folder at startup.

---

## 17. Recommended Code Structure

Do not force these exact filenames if the project already has equivalent modules.

A clean structure could look like:

```text
game/imports/client/game/characters/
  characterAssetConfig.js
  characterAssetResolver.js
  modularCharacterLoader.js
```

or the nearest existing character / Babylon.js module structure.

Responsibilities:

### `characterAssetConfig.js`

```text
asset paths
class mappings
species mappings
gender mappings
bone mappings
```

### `characterAssetResolver.js`

```text
Character document
→ normalized modular asset definition
```

### `modularCharacterLoader.js`

```text
Babylon.js loading
caching
instantiation
skeleton binding
material setup
assembly
cleanup
```

Do not move unrelated systems simply to match this suggested structure.

---

## 18. Migration Strategy

Do not replace every existing player asset in one unsafe step.

Recommended implementation order:

### Step 1

Integrate one known-good combination:

```text
Human
Male
Warrior
```

Verify:

- model loads
- modular parts align
- animations work
- weapon attaches correctly
- movement works
- combat works
- death / respawn works

### Step 2

Add Female support.

### Step 3

Add Ranger and Mage outfits.

### Step 4

Add Human appearance options.

### Step 5

Add Ashborn and Sylvan mappings.

### Step 6

Use the same system for remote players.

If the existing architecture makes local and remote integration together simpler, that is acceptable, but keep the changes incremental and testable.

---

## 19. Fallback

Keep the existing player model path available temporarily during the migration.

If the modular character fails to load:

```text
log the error
→ fall back to the existing default character model
```

Do not leave the player invisible or prevent world joining because one optional modular asset failed.

Once the modular system is stable, the legacy fallback can be removed in a later cleanup task.

---

## 20. Acceptance Criteria

The task is complete when:

- assets are loaded from:

```text
/models/characters/quaternius-fantasy/optimized/modular-parts/
```

- one central config resolves modular asset paths
- no gameplay module contains scattered Quaternius path strings
- the local player can use an assembled modular character
- remote players can use the same assembly system
- required modular GLBs are cached
- unused class / gender / appearance assets are not loaded unnecessarily
- base body and outfit pieces align correctly
- skeleton / skinning works
- current movement animations still work
- attacks still work
- jump still works
- death / respawn still works
- weapons attach correctly
- skin tone remains player-specific
- player cleanup does not destroy shared cached assets
- existing gameplay logic remains unchanged unless necessary for character rendering
- legacy character model fallback remains available during migration

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current character rendering, animation, weapon attachment, multiplayer player-state, appearance, and asset-loading architecture before changing code.
3. Inspect the actual filenames under:

```text
game/public/models/characters/quaternius-fantasy/optimized/modular-parts
```

4. Do not invent Quaternius filenames.
5. Build the mappings from the real optimized files.
6. Reuse existing asset caching / loading utilities where possible.
7. Create one config-driven modular character assembly path.
8. Use the same assembly logic for local and remote players where practical.
9. Keep all Quaternius asset paths centralized.
10. Load only the parts required by the current character.
11. Preserve the existing animation state system where possible.
12. Preserve the existing weapon system where possible.
13. Preserve the existing Character document / appearance schema where possible.
14. Add only the minimum new appearance fields required by the assets.
15. Keep a temporary fallback to the existing player model.
16. Do not rewrite unrelated combat, movement, networking, quest, inventory, or world systems.
17. Use JavaScript only.
18. Keep the implementation DRY and MVP-sized.
19. Start by validating one `Human Male Warrior` combination before expanding the mappings.
20. Run relevant checks and test with at least two simultaneous players if practical.
21. Verify a remote player's appearance is reconstructed correctly.
22. Verify cleanup when a remote player disconnects.
23. Verify no duplicate network load occurs for an already cached GLB.
24. In the final response, list every changed file with its exact path.
25. Also report:
    - which optimized GLB files were integrated
    - which class mappings were added
    - which species / gender combinations are currently supported
    - any temporary fallbacks
    - any animation / bone-name compatibility issue discovered
    - whether additional Quaternius parts still need mapping
